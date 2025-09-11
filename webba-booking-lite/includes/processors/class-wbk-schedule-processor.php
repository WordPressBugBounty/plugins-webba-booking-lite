<?php

if ( !defined( 'ABSPATH' ) ) {
    exit;
}
class WBK_Schedule_Processor {
    protected $locked_days;

    protected $unlocked_days;

    protected $locked_time_slots;

    protected $gg_breakers;

    protected $ext_breakers;

    protected $breakers;

    protected $appointments;

    protected $timeslots;

    protected $data_loaded;

    public $day;

    public function __construct() {
        $data_loaded = false;
    }

    public function load_data() {
        $this->load_locked_days();
        $this->load_unlocked_days();
        $this->load_locked_timeslots();
        $data_loaded = true;
    }

    public function load_locked_days() {
        global $wpdb;
        if ( !is_null( $this->locked_days ) ) {
            return;
        }
        $date = new DateTime();
        $date->setTimestamp( strtotime( 'yesterday midnight' ) );
        $result = $wpdb->get_results( "\n\t\t\t\t\t\tSELECT day, service_id\n\t\t\t\t\t\tFROM " . get_option( 'wbk_db_prefix', '' ) . "wbk_days_on_off\n\t\t\t\t\t\twhere status = 0 and day >= " . $date->getTimestamp() );
        foreach ( $result as $item ) {
            $this->locked_days[$item->service_id][] = $item->day;
        }
    }

    public function load_unlocked_days() {
        global $wpdb;
        $date = new DateTime();
        $date->setTimestamp( strtotime( 'yesterday midnight' ) );
        $result = $wpdb->get_results( "\n                        SELECT day, service_id\n                        FROM " . get_option( 'wbk_db_prefix', '' ) . "wbk_days_on_off\n                        where status = 1 and day >= " . $date->getTimestamp() );
        foreach ( $result as $item ) {
            $this->unlocked_days[$item->service_id][] = $item->day;
        }
    }

    public function load_locked_timeslots() {
        global $wpdb;
        $result = $wpdb->get_results( "\n\t\t\t\t\t\tSELECT time, service_id\n\t\t\t\t\t\tFROM " . get_option( 'wbk_db_prefix', '' ) . 'wbk_locked_time_slots' );
        foreach ( $result as $item ) {
            $this->locked_time_slots[$item->service_id][] = $item->time;
        }
    }

    public function get_time_slots_by_day(
        $day,
        $service_id,
        $options,
        $current_booking = null,
        $preload_data = true
    ) {
        if ( isset( $options['skip_gg_calendar'] ) ) {
            $skip_gg_calendar = $options['skip_gg_calendar'];
        } else {
            $skip_gg_calendar = false;
        }
        if ( isset( $options['ignore_preparation'] ) ) {
            $ignore_preparation = $options['ignore_preparation'];
        } else {
            $ignore_preparation = false;
        }
        if ( isset( $options['calculate_availability'] ) ) {
            $calculate_availability = $options['calculate_availability'];
        } else {
            $calculate_availability = false;
        }
        if ( isset( $options['calculate_night_hours'] ) ) {
            $calculate_night_hours = $options['calculate_night_hours'];
        } else {
            $calculate_night_hours = true;
        }
        if ( isset( $options['filter_availability'] ) ) {
            $filter_availability = $options['filter_availability'];
        } else {
            $filter_availability = true;
        }
        if ( isset( $options['offset'] ) ) {
            $offset = $options['offset'];
        } else {
            if ( isset( $_POST['offset'] ) ) {
                $offset = $_POST['offset'];
                if ( !is_numeric( $offset ) ) {
                    $offset = 0;
                }
            } else {
                $offset = 0;
            }
        }
        $night_houts_addon = get_option( 'wbk_night_hours', '0' );
        if ( trim( $night_houts_addon ) == '' ) {
            $night_houts_addon = 0;
        }
        $night_houts_addon = $night_houts_addon * 60 * 60;
        if ( !WBK_Validator::check_integer( $night_houts_addon, 1, 64800 ) ) {
            $night_houts_addon = 0;
        }
        $timeslots = [];
        if ( $preload_data ) {
            $this->load_locked_days();
            $this->load_unlocked_days();
            $this->load_locked_timeslots();
        }
        $working = $this->is_working_day( $day, $service_id );
        $service = new WBK_Service($service_id);
        $time_format = WBK_Date_Time_Utils::get_time_format();
        $date_format = WBK_Format_Utils::get_date_format();
        $date = new DateTime();
        $this->day = $day;
        $this->breakers = [];
        if ( !isset( $this->gg_breakers ) ) {
            $this->gg_breakers = [];
        }
        if ( !isset( $this->ext_breakers ) ) {
            $this->ext_breakers = [];
        }
        // load appointments
        if ( get_option( 'wbk_allow_cross_midnight', '' ) == 'true' ) {
            $start_all = WBK_Time_Math_Utils::adjust_times( $day, $service->get_duration() * -60, get_option( 'wbk_timezone', 'UTC' ) );
            $end_all = WBK_Time_Math_Utils::adjust_times( $day, 86400 + $service->get_duration() * 60, get_option( 'wbk_timezone', 'UTC' ) );
        } else {
            $start_all = $day;
            $end_all = WBK_Time_Math_Utils::adjust_times( $day, 86400, get_option( 'wbk_timezone', 'UTC' ) );
        }
        $day_end = WBK_Time_Math_Utils::adjust_times( $day, 86400, get_option( 'wbk_timezone', 'UTC' ) );
        $this->load_appointments_by_day( $day, $service_id );
        // load data from google caelndar
        if ( !$skip_gg_calendar ) {
        }
        $betw_interval = $service->get_interval_between() * 60;
        $duration = $service->get_duration() * 60;
        $step = $service->get_step() * 60;
        $total_duration_optim = $betw_interval + $duration;
        if ( $ignore_preparation ) {
            $preparation_time = 0;
        } else {
            $preparation_time = $service->get_prepare_time();
        }
        $intervals = $this->get_business_hours_intervals_by_dow( date( 'N', $day ), $service_id );
        $min_quantity = $service->get_min_quantity();
        // special business hours
        $data = trim( get_option( 'wbk_appointments_special_hours', '' ) );
        $intervals_overriden = [];
        if ( $data != '' ) {
            $data = explode( PHP_EOL, $data );
            foreach ( $data as $line ) {
                $parts = explode( ' ', $line );
                if ( count( $parts ) != 2 && count( $parts ) != 3 ) {
                    continue;
                }
                if ( count( $parts ) == 3 ) {
                    if ( $service_id != $parts[0] ) {
                        continue;
                    }
                } else {
                    array_unshift( $parts, 'x' );
                }
                $date_this = strtotime( $parts[1] );
                if ( $date_this == $day ) {
                    $intervals_this = explode( ',', $parts[2] );
                    foreach ( $intervals_this as $interval ) {
                        $times = explode( '-', $interval );
                        $time = $times[0];
                        $splitted_time = explode( ':', $time );
                        $seconds = $splitted_time[0] * 60 * 60 + $splitted_time[1] * 60;
                        $start = $seconds;
                        $time = $times[1];
                        $splitted_time = explode( ':', $time );
                        $seconds = $splitted_time[0] * 60 * 60 + $splitted_time[1] * 60;
                        $end = $seconds;
                        $interval_data = new stdClass();
                        $interval_data->start = $start;
                        $interval_data->end = $end;
                        $interval_data->day_of_week = date( 'N', $day );
                        $interval_data->status = 'active';
                        $intervals_overriden[] = $interval_data;
                    }
                }
            }
        }
        if ( count( $intervals_overriden ) > 0 ) {
            $intervals = $intervals_overriden;
        }
        $wbk_disallow_after = get_option( 'wbk_disallow_after', '0' );
        if ( trim( $wbk_disallow_after ) == '' ) {
            $wbk_disallow_after = '0';
        }
        $wbk_allow_ongoing_time_slot = get_option( 'wbk_allow_ongoing_time_slot', 'disallow' );
        $wbk_allow_cross_midnight = get_option( 'wbk_allow_cross_midnight', '' );
        // special business hours end
        foreach ( $intervals as $interval ) {
            if ( $working && $interval->status != 'active' ) {
                continue;
            }
            $start = WBK_Time_Math_Utils::adjust_times( $day, $interval->start, get_option( 'wbk_timezone', 'UTC' ) );
            $end = WBK_Time_Math_Utils::adjust_times( $day, $interval->end, get_option( 'wbk_timezone', 'UTC' ) );
            for ($time = $start; $time < $end; $time = WBK_Time_Math_Utils::adjust_times(
                $time,
                $step,
                get_option( 'wbk_timezone', 'UTC' ),
                true
            )) {
                if ( trim( $wbk_disallow_after ) == '' ) {
                    $wbk_disallow_after = '0';
                }
                if ( $wbk_disallow_after != '0' ) {
                    if ( $time > time() + $wbk_disallow_after * 60 * 60 ) {
                        continue;
                    }
                }
                if ( is_null( $current_booking ) ) {
                    if ( $wbk_allow_ongoing_time_slot == 'disallow' ) {
                        if ( $time < time() + $preparation_time * 60 ) {
                            continue;
                        }
                    } else {
                        if ( $time + $duration < time() ) {
                            continue;
                        }
                    }
                }
                $total_duration = $duration + $betw_interval;
                $temp = WBK_Time_Math_Utils::adjust_times( $time, $total_duration, get_option( 'wbk_timezone', 'UTC' ) );
                $allow_cross = false;
                if ( $wbk_allow_cross_midnight == 'true' ) {
                    if ( date( 'N', $time ) != date( 'N', $temp ) ) {
                        $allow_cross = true;
                    }
                }
                if ( $temp > $end && !$allow_cross ) {
                    continue;
                }
                if ( $night_houts_addon != 0 && $calculate_night_hours ) {
                    $comparation_value = WBK_Time_Math_Utils::adjust_times( $day, $night_houts_addon, get_option( 'wbk_timezone', 'UTC' ) );
                    if ( $time < $comparation_value && $temp <= $comparation_value ) {
                        if ( strtotime( 'today midnight' ) != $day ) {
                            continue;
                        }
                    }
                }
                $status = $this->get_time_slot_status( $time, $total_duration, $service );
                $booked = 0;
                if ( is_array( $status ) ) {
                    $booked = $status[1];
                    $status = $status[0];
                } else {
                    if ( $status > 0 ) {
                        $booked = 1;
                    }
                    if ( $status == -1 ) {
                        continue;
                    }
                }
                if ( $status == -2 ) {
                    $free_places = 0;
                } else {
                    $free_places = $service->get_quantity() - $booked;
                }
                $slot = new WBK_Time_Slot($time, $temp);
                $slot->set_min_quantity( $service->get_min_quantity() );
                $slot->set_free_places( $free_places );
                $slot->set_status( $status );
                $timeslots[] = $slot;
            }
        }
        // check for not attached appointments
        $need_sort = false;
        foreach ( $this->appointments as $appointment ) {
            $appointment_found = false;
            foreach ( $timeslots as $timeslot ) {
                if ( $appointment->getTime() == $timeslot->getStart() ) {
                    $appointment_found = true;
                }
            }
            if ( !$appointment_found ) {
                if ( $appointment->getTime() < $day || $appointment->getTime() >= $day_end ) {
                    continue;
                }
                if ( $appointment->getTime() + $duration < time() ) {
                    continue;
                }
                $temp = $appointment->getTime() + $duration + $betw_interval;
                $slot = new WBK_Time_Slot($appointment->getTime(), $temp);
                $slot->set_status( $appointment->getId() );
                $slot->set_min_quantity( $min_quantity );
                array_push( $timeslots, $slot );
                $need_sort = true;
            }
        }
        if ( $need_sort ) {
            $arr_temp = [];
            foreach ( $timeslots as $timeslot ) {
                array_push( $arr_temp, $timeslot->get_start() );
            }
            array_multisort( $timeslots, $arr_temp );
        }
        $connected_service_ids = [];
        if ( get_option( 'wbk_appointments_auto_lock', 'disabled' ) == 'enabled' ) {
            if ( get_option( 'wbk_appointments_auto_lock_mode', 'all' ) == 'all' ) {
                foreach ( WBK_Model_Utils::get_service_ids() as $id ) {
                    if ( $id != $service_id ) {
                        $connected_service_ids[] = $id;
                    }
                }
            } else {
                $connected_service_ids = WBK_Model_Utils::get_services_with_same_category( $service_id );
            }
        }
        $connected_service_ids = apply_filters( 'webba_connected_services', $connected_service_ids, $service_id );
        // clarifying count of available places
        // and updating status if needed
        $connected_services_booking_ids = [];
        foreach ( $connected_service_ids as $connected_service_id ) {
            $bookings_connected = [];
            $prev_day = strtotime( '-1 day', $day );
            $next_day = strtotime( '+1 day', $day );
            $bookings_this = WBK_Model_Utils::get_booking_ids_by_day_service( $day, $connected_service_id );
            $connected_services_booking_ids = array_merge( $connected_services_booking_ids, $bookings_this );
            $bookings_this = WBK_Model_Utils::get_booking_ids_by_day_service( $prev_day, $connected_service_id );
            $connected_services_booking_ids = array_merge( $connected_services_booking_ids, $bookings_this );
            $bookings_this = WBK_Model_Utils::get_booking_ids_by_day_service( $next_day, $connected_service_id );
            $connected_services_booking_ids = array_merge( $connected_services_booking_ids, $bookings_this );
        }
        $connected_services_bookings = [];
        foreach ( $connected_services_booking_ids as $temp_id ) {
            $temp_booking = new WBK_Booking($temp_id);
            $connected_services_bookings[] = $temp_booking;
        }
        for ($i = 0; $i < count( $timeslots ); $i++) {
            if ( $calculate_availability ) {
                $max_per_time = trim( get_option( 'wbk_appointments_autolock_avail_limit', '' ) );
                $total_quantity = -1;
                if ( $max_per_time != '' && is_numeric( $max_per_time ) ) {
                    $total_quantity = WBK_Model_Utils::get_all_quantity_intersecting_range( $timeslots[$i]->getStart(), $timeslots[$i]->getEnd() );
                }
                $lock_before_after = get_option( 'wbk_appointments_lock_one_before_and_one_after', 'x' );
                if ( is_array( $lock_before_after ) && in_array( $service->get_id(), $lock_before_after ) ) {
                    if ( $timeslots[$i]->get_status() == 0 || is_array( $timeslots[$i]->get_status() ) ) {
                        if ( $i > 0 ) {
                            $prev_slot = $timeslots[$i - 1];
                            if ( $prev_slot->get_status() > 0 || is_array( $prev_slot->get_status() ) ) {
                                $timeslots[$i]->set_status( -2 );
                            }
                        }
                        if ( $i < count( $timeslots ) - 1 ) {
                            $next_slot = $timeslots[$i + 1];
                            if ( $next_slot->get_status() > 0 || is_array( $next_slot->get_status() ) ) {
                                $timeslots[$i]->set_status( -2 );
                            }
                        }
                    }
                }
                if ( $timeslots[$i]->get_status() == 0 || is_array( $timeslots[$i]->get_status() ) ) {
                    $booked_count = 0;
                    $timeslots[$i]->set_min_quantity( $min_quantity );
                    // places in current booking
                    if ( is_array( $timeslots[$i]->get_status() ) ) {
                        foreach ( $timeslots[$i]->get_status() as $booking_id ) {
                            $booking = new WBK_Booking($booking_id);
                            $booked_count += $booking->get_quantity();
                        }
                    }
                    $partial_check = false;
                    if ( is_array( $timeslots[$i]->get_status() ) ) {
                        $parital_mode = get_option( 'wbk_appointments_lock_timeslot_if_parital_booked', '' );
                        if ( $parital_mode == '' ) {
                            $parital_mode = [];
                        }
                        if ( in_array( $service_id, $parital_mode ) ) {
                            $partial_check = true;
                        }
                    }
                    // places in connected services
                    $connected_quantity = 0;
                    if ( count( $connected_services_bookings ) > 0 ) {
                        foreach ( $connected_services_bookings as $booking ) {
                            if ( WBK_Time_Math_Utils::check_range_intersect(
                                $timeslots[$i]->getStart(),
                                $timeslots[$i]->getEnd(),
                                $booking->get_start(),
                                $booking->get_full_end()
                            ) ) {
                                $connected_quantity += $booking->get_quantity();
                            }
                        }
                    }
                    $connected_quantity = apply_filters( 'wbk_connected_quantity', $connected_quantity, $service_id );
                    // check intersection with time slots of the same service
                    $same_service_quantity = 0;
                    if ( get_option( 'wbk_mode_overlapping_availabiliy', 'true' ) == 'true' ) {
                        $booking_ids = WBK_Model_Utils::get_booking_ids_by_day_service( $day, $service_id );
                        foreach ( $booking_ids as $booking_id ) {
                            $booking = new WBK_Booking($booking_id);
                            if ( $timeslots[$i]->getStart() != $booking->get_start() ) {
                                if ( WBK_Time_Math_Utils::check_range_intersect(
                                    $timeslots[$i]->getStart(),
                                    $timeslots[$i]->getEnd(),
                                    $booking->get_start(),
                                    $booking->get_end()
                                ) ) {
                                    $same_service_quantity += $booking->get_quantity();
                                }
                            }
                        }
                    }
                    $gg_count = 0;
                    $ext_count = 0;
                    $current_quantity = 0;
                    if ( !is_null( $current_booking ) ) {
                        $booking = new WBK_Booking($current_booking);
                        if ( $booking->get_name() != '' ) {
                            if ( $booking->get_start() == $timeslots[$i]->getStart() ) {
                                $current_quantity = $booking->get_quantity();
                            }
                        }
                    }
                    $available = $service->get_quantity( $timeslots[$i]->getStart() ) - $booked_count - $connected_quantity - $same_service_quantity - $gg_count - $ext_count + $current_quantity;
                    if ( $service->get_quantity() > 0 ) {
                        if ( get_option( 'wbk_appointments_auto_lock_group', 'lock' ) == 'lock' ) {
                            if ( $connected_quantity > 0 ) {
                                $available = 0;
                            }
                        }
                    }
                    if ( $max_per_time != '' && is_numeric( $max_per_time ) ) {
                        $remain = $max_per_time - $total_quantity;
                        if ( $available > $remain ) {
                            if ( $current_quantity > 0 ) {
                                $available = $current_quantity;
                            } else {
                                $available = $remain;
                            }
                        }
                    }
                    if ( $filter_availability ) {
                        $available = apply_filters(
                            'wbk_available_at_time',
                            $available,
                            $timeslots[$i]->getStart(),
                            $day,
                            $service_id
                        );
                    }
                    if ( $available < $service->get_min_quantity() ) {
                        $timeslots[$i]->set_free_places( 0 );
                        if ( $current_quantity > 0 ) {
                            $timeslots[$i]->set_free_places( $current_quantity );
                        }
                    } else {
                        if ( $partial_check && $current_quantity == 0 ) {
                            $timeslots[$i]->set_free_places( 0 );
                        } else {
                            $timeslots[$i]->set_free_places( $available );
                        }
                    }
                    if ( $current_quantity > 0 ) {
                        if ( $timeslots[$i]->get_free_places() < $current_quantity ) {
                            $timeslots[$i]->set_free_places( $current_quantity );
                        }
                    }
                } elseif ( is_numeric( $timeslots[$i]->get_status() ) && $current_booking == $timeslots[$i]->get_status() ) {
                    $timeslots[$i]->set_free_places( 1 );
                    $timeslots[$i]->set_min_quantity( 1 );
                }
                if ( $timeslots[$i]->get_status() == -2 ) {
                    $timeslots[$i]->set_free_places( 0 );
                    $timeslots[$i]->set_min_quantity( $min_quantity );
                }
            }
            // set formated time strings
            if ( $i == 0 ) {
                $timezone_to_use = new DateTimeZone(date_default_timezone_get());
                $timezone_to_use_end = $timezone_to_use;
            }
            $timezone = $timezone_to_use;
            $timeslot_time_string = 'start';
            $current_offset = $offset * -60 - $timezone->getOffset( $date );
            if ( $timeslot_time_string == 'start' ) {
                $time = wp_date( $time_format, $timeslots[$i]->getStart(), $timezone_to_use );
                $local_start = $timeslots[$i]->getStart() + $current_offset;
                $local_time = wp_date( $time_format, $local_start, $timezone_to_use );
            }
            $end_minus_gap = $timeslots[$i]->getEnd() - $service->get_interval_between() * 60;
            if ( $timeslot_time_string == 'start_end' ) {
                $time = wp_date( $time_format, $timeslots[$i]->getStart(), $timezone_to_use ) . '-' . wp_date( $time_format, $end_minus_gap, $timezone_to_use_end );
                $local_start = $timeslots[$i]->getStart() + $current_offset;
                $local_start = wp_date( $time_format, $local_start, $timezone_to_use );
                $local_end = $timeslots[$i]->getStart() + $service->get_duration() * 60 + $current_offset;
                $local_end = wp_date( $time_format, $local_end, $timezone_to_use_end );
                $local_time = $local_start . '-' . $local_end;
            }
            $formated_date = wp_date( $date_format, $timeslots[$i]->getStart(), $timezone_to_use );
            $formated_date_local = wp_date( $date_format, $timeslots[$i]->getStart(), $timezone_to_use );
            $timeslots[$i]->set_offset( $current_offset );
            $timeslots[$i]->set_formated_time( $time );
            $timeslots[$i]->set_formated_time_local( $local_time );
            $timeslots[$i]->set_formated_date( $formated_date );
            $timeslots[$i]->set_formated_date_local( $formated_date_local );
            $timeslot_time_string_backend = get_option( 'wbk_date_format_time_slot_schedule', 'start' );
            if ( $timeslot_time_string_backend == 'start' ) {
                $time = wp_date( $time_format, $timeslots[$i]->getStart(), $timezone_to_use );
            } else {
                $time = "<span class='start-time'>" . wp_date( $time_format, $timeslots[$i]->getStart(), $timezone_to_use ) . '</span>' . '-' . "<span class='end-time'>" . wp_date( $time_format, $end_minus_gap, $timezone_to_use ) . '</span>';
            }
            $timeslots[$i]->set_formated_time_backend( $time );
        }
        $sp_tomorrow = new WBK_Schedule_Processor();
        $tomorrow = strtotime( '+1 day', $day );
        if ( $night_houts_addon != 0 && $calculate_night_hours ) {
            $tomorrow_timeslots = $sp_tomorrow->get_time_slots_by_day( $tomorrow, $service->get_id(), [
                'skip_gg_calendar'       => false,
                'ignore_preparation'     => false,
                'calculate_availability' => true,
                'calculate_night_hours'  => false,
            ] );
            for ($i = 0; $i < count( $tomorrow_timeslots ); $i++) {
                $timeslot = $tomorrow_timeslots[$i];
                if ( $timeslot->get_start() < $tomorrow + $night_houts_addon && $timeslot->get_end() <= $tomorrow + $night_houts_addon ) {
                    $timeslots[] = $timeslot;
                }
            }
        }
        $timeslots = apply_filters(
            'get_time_slots_by_day',
            $timeslots,
            $day,
            $service_id
        );
        $this->timeslots = $timeslots;
        return $timeslots;
    }

    // get day status working / not working
    // 1 - working, 0 - weekend or out of availability date range, 2 - limit reached
    public function get_day_status( $day, $service_id ) {
        $service = new WBK_Service($service_id);
        if ( !is_null( $service->get_availability_range() ) && is_array( $service->get_availability_range() ) && count( $service->get_availability_range() ) == 2 ) {
            $availability_range = $service->get_availability_range();
            $range_start = strtotime( trim( $availability_range[0] ) );
            $range_end = strtotime( trim( $availability_range[1] ) );
            if ( $day < $range_start || $day > $range_end ) {
                return 0;
            }
        }
        // check Lock day if at least one time slot is booked
        $whole_day_checkin = get_option( 'wbk_appointments_lock_day_if_timeslot_booked', '' );
        if ( is_array( $whole_day_checkin ) ) {
            if ( in_array( $service_id, $whole_day_checkin, true ) ) {
                $this_day_bookings = WBK_Model_Utils::get_booking_ids_by_day_service( $day, $service_id );
                if ( count( $this_day_bookings ) > 0 ) {
                    return 0;
                }
            }
        }
        // check overal daily limit
        $day_limit = trim( get_option( 'wbk_appointments_limit_by_day', '' ) );
        if ( $day_limit != '' ) {
            if ( WBK_Model_Utils::get_total_count_of_bookings_by_day( $day ) >= $day_limit ) {
                return 2;
            }
        }
        if ( $this->is_holyday( $day ) === true ) {
            return 0;
        }
        // check locked / unlocked arrays
        if ( isset( $this->locked_days[$service_id] ) && is_array( $this->locked_days[$service_id] ) ) {
            $locked_days = $this->locked_days[$service_id];
        } else {
            $locked_days = [];
        }
        if ( in_array( $day, $locked_days ) ) {
            return 0;
        }
        if ( isset( $this->unlocked_days[$service_id] ) && is_array( $this->unlocked_days[$service_id] ) ) {
            $unlocked_days = $this->unlocked_days[$service_id];
        } else {
            $unlocked_days = [];
        }
        if ( in_array( $day, $unlocked_days ) == true ) {
            return 1;
        }
        // check service business hours
        //
        if ( $this->is_working_day( $day, $service_id ) === true ) {
            return 1;
        } else {
            return 0;
        }
    }

    public function is_holyday( $day ) {
        $holydays = get_option( 'wbk_holydays' );
        $arr = explode( ',', $holydays );
        foreach ( $arr as $item ) {
            $holyday = strtotime( $item );
            if ( $holyday == $day ) {
                return apply_filters( 'wbk_check_holiday', true );
            }
            if ( get_option( 'wbk_recurring_holidays', '' ) == 'true' ) {
                $holyday_m = date( 'm', $holyday );
                $holyday_d = date( 'd', $holyday );
                $holyday_y = date( 'y', $holyday );
                $current_y = date( 'y', $day );
                $holyday = strtotime( $holyday_m . '/' . $holyday_d . '/' . $current_y );
                if ( $holyday == $day ) {
                    return apply_filters( 'wbk_check_holiday', true );
                }
            }
        }
        return apply_filters( 'wbk_check_holiday', false );
    }

    public function load_gg_events_in_range( $start, $end, $service ) {
        $event_data_arr = [];
        return $event_data_arr;
    }

    public function load_appointments_by_day( $day, $service_id ) {
        global $wpdb;
        $db_arr = $wpdb->get_results( $wpdb->prepare( "                                       SELECT *\n\t\t\t\t\t\t\t\t\t\t\t\t\tFROM " . get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments where service_id = %d AND day = %d AND ' . WBK_Model_Utils::get_not_canclled_sql(), $service_id, $day ) );
        $this->appointments = [];
        if ( count( $db_arr ) == 0 ) {
            return 0;
        }
        foreach ( $db_arr as $item ) {
            $appointment = new WBK_Appointment_deprecated();
            if ( $appointment->set(
                $item->id,
                $item->name,
                $item->description,
                $item->email,
                $item->duration,
                $item->time,
                $item->day,
                $item->phone,
                $item->extra,
                $item->attachment,
                $item->quantity
            ) ) {
                array_push( $this->appointments, $appointment );
                // create breaker
                $service = new WBK_Service_deprecated();
                if ( !$service->setId( $service_id ) ) {
                    continue;
                }
                if ( !$service->load() ) {
                    continue;
                }
                if ( $service->getQuantity() == 1 ) {
                    $betw_interval = $service->getInterval();
                    $app_end = $item->time + $item->duration * 60 + $betw_interval * 60;
                    $breaker = new WBK_Time_Slot($item->time, $app_end);
                    array_push( $this->breakers, $breaker );
                }
            }
        }
        return;
    }

    public function is_working_day( $day, $service_id ) {
        $service = new WBK_Service($service_id);
        $busines_hours = json_decode( $service->get_business_hours() );
        if ( !is_array( $busines_hours ) ) {
            return false;
        }
        foreach ( $busines_hours as $item ) {
            if ( $day >= 1 && $day <= 7 ) {
                if ( $day == $item->day_of_week && $item->status == 'active' ) {
                    return true;
                }
            } else {
                if ( date( 'N', $day ) == $item->day_of_week && $item->status == 'active' ) {
                    return true;
                }
                $data = trim( get_option( 'wbk_appointments_special_hours', '' ) );
                if ( $data != '' ) {
                    $data = explode( PHP_EOL, $data );
                    foreach ( $data as $line ) {
                        $parts = explode( ' ', $line );
                        if ( count( $parts ) != 2 && count( $parts ) != 3 ) {
                            continue;
                        }
                        if ( count( $parts ) == 3 ) {
                            if ( $service_id != $parts[0] ) {
                                continue;
                            }
                        } else {
                            array_unshift( $parts, 'x' );
                        }
                        $date_this = strtotime( $parts[1] );
                        if ( $date_this == $day ) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    public function is_unlockced_has_dow( $day, $service_id ) {
        if ( isset( $this->unlocked_days[$service_id] ) ) {
            foreach ( $this->unlocked_days[$service_id] as $day_current ) {
                if ( date( 'N', $day_current ) == $day ) {
                    return true;
                }
            }
        }
        return false;
    }

    public function get_business_hours_intervals_by_dow( $dow, $service_id ) {
        $service = new WBK_Service($service_id);
        $busines_hours = json_decode( $service->get_business_hours() );
        if ( !is_array( $busines_hours ) ) {
            return [];
        }
        $slots = [];
        $sort_array = [];
        foreach ( $busines_hours as $item ) {
            if ( $dow == $item->day_of_week ) {
                $slots[] = $item;
            }
        }
        usort( $slots, function ( $a, $b ) {
            return (int) ($a->start > $b->start);
        } );
        return $slots;
    }

    //  get timeslot status.
    //  0 - free timeslot
    // -2 locked in the Schedule or by google calendar / ext breaker
    // >0 - ID of a single booking
    // array - array of the booking IDs
    // -1 - instruction to skip
    public function get_time_slot_status( $time, $duration, $service ) {
        $start = $time;
        $end = $time + $duration;
        // check breakers
        foreach ( $this->breakers as $breaker ) {
            if ( $start > $breaker->getStart() && $start < $breaker->getEnd() ) {
                return -1;
            }
            if ( $end > $breaker->getStart() && $end < $breaker->getEnd() ) {
                return -1;
            }
        }
        // check locked timeslots
        if ( isset( $this->locked_time_slots[$service->get_id()] ) && is_array( $this->locked_time_slots[$service->get_id()] ) ) {
            $locked_timeslots = $this->locked_time_slots[$service->get_id()];
        } else {
            $locked_timeslots = [];
        }
        if ( in_array( $start, $locked_timeslots ) ) {
            return -2;
        }
        // check appointments
        if ( $service->get_quantity() == 1 ) {
            foreach ( $this->appointments as $appointment ) {
                if ( $time == $appointment->getTime() ) {
                    return $appointment->getId();
                }
            }
        } else {
            $booking_ids = [];
            $compound_quantity = 0;
            foreach ( $this->appointments as $appointment ) {
                if ( $time == $appointment->getTime() ) {
                    array_push( $booking_ids, $appointment->getId() );
                    $compound_quantity += $appointment->getQuantity();
                }
            }
            if ( count( $booking_ids ) > 0 ) {
                return [$booking_ids, $compound_quantity];
            }
        }
        return 0;
    }

    public function get_unlocked_days() {
        return $this->unlocked_days;
    }

    public function set_gg_breakers( $input ) {
        $this->gg_breakers = $input;
    }

    public function get_available_count( $time ) {
        foreach ( $this->timeslots as $timeslot ) {
            if ( $timeslot->getStart() == $time ) {
                return $timeslot->get_free_places();
            }
        }
        return 0;
    }

    public function has_free_time_slots() {
        $has_free = false;
        foreach ( $this->timeslots as $time_slot ) {
            if ( $time_slot->get_free_places() >= $time_slot->get_min_quantity() ) {
                $has_free = true;
            }
        }
        return $has_free;
    }

    public function get_locked_time_slots( $service_id ) {
        if ( isset( $this->locked_time_slots[$service_id] ) ) {
            return $this->locked_time_slots[$service_id];
        }
        return [];
    }

}
