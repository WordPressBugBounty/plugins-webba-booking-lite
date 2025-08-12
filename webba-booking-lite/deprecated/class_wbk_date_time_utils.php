<?php

// check if accessed directly
if ( !defined( 'ABSPATH' ) ) {
    exit;
}
class WBK_Date_Time_Utils {
    // get date format option
    public static function get_date_format() {
        $date_format = trim( get_option( 'wbk_date_format' ) );
        if ( empty( $date_format ) ) {
            $date_format = trim( get_option( 'date_format' ) );
            if ( empty( $date_format ) ) {
                $date_format = 'l, F j';
            }
        }
        return $date_format;
    }

    // get start of week option
    public static function getStartOfWeek() {
        $start_of_week = get_option( 'wbk_start_of_week' );
        if ( $start_of_week == 'wordpress' ) {
            $start_of_week = get_option( 'start_of_week', 0 );
            if ( $start_of_week == 0 ) {
                $start_of_week = 'sunday';
            } else {
                $start_of_week = 'monday';
            }
        }
        if ( $start_of_week !== 'sunday' && $start_of_week !== 'monday' ) {
            $start_of_week = 'sunday';
        }
        return $start_of_week;
    }

    // get time format option
    public static function get_time_format() {
        $time_format = trim( get_option( 'wbk_time_format' ) );
        if ( empty( $time_format ) ) {
            $time_format = trim( get_option( 'time_format' ) );
            if ( empty( $time_format ) ) {
                $time_format = 'H:i';
            }
        }
        return $time_format;
    }

    // get start of current week
    public static function getStartOfCurrentWeek() {
        $start_of_week = WBK_Date_Time_Utils::getStartOfWeek();
        if ( $start_of_week == 'sunday' ) {
            return strtotime( 'last sunday', strtotime( 'tomorrow' ) );
        } else {
            return strtotime( 'last monday', strtotime( 'tomorrow' ) );
        }
    }

    // get start of current week
    public static function getStartOfWeekDay( $day ) {
        $start_of_week = WBK_Date_Time_Utils::getStartOfWeek();
        if ( $start_of_week == 'sunday' ) {
            if ( date( 'N', $day ) == '7' ) {
                return $day;
            } else {
                return strtotime( 'last sunday', $day );
            }
        } else {
            if ( date( 'N', $day ) == '1' ) {
                return $day;
            } else {
                return strtotime( 'last monday', $day );
            }
        }
    }

    // render hours for day (cell)
    public static function render_business_hours_cell_at_day( $business_hours, $day ) {
        date_default_timezone_set( 'UTC' );
        // prepare title
        if ( $day == 'monday' ) {
            $day_name = __( 'Monday', 'webba-booking-lite' );
        }
        if ( $day == 'tuesday' ) {
            $day_name = __( 'Tuesday', 'webba-booking-lite' );
        }
        if ( $day == 'wednesday' ) {
            $day_name = __( 'Wednesday', 'webba-booking-lite' );
        }
        if ( $day == 'thursday' ) {
            $day_name = __( 'Thursday', 'webba-booking-lite' );
        }
        if ( $day == 'friday' ) {
            $day_name = __( 'Friday', 'webba-booking-lite' );
        }
        if ( $day == 'saturday' ) {
            $day_name = __( 'Saturday', 'webba-booking-lite' );
        }
        if ( $day == 'sunday' ) {
            $day_name = __( 'Sunday', 'webba-booking-lite' );
        }
        $html = '<b>' . $day_name . '</b>';
        $interval_count = $business_hours->getIntervalCount( $day );
        $time_format = WBK_Date_Time_Utils::get_time_format();
        if ( !$business_hours->isWorkday( $day ) == true ) {
            return;
        }
        $interval = $business_hours->getInterval( $day, 1 );
        if ( isset( $interval ) && count( $interval ) == 2 ) {
            $start_time = $interval[0];
            $end_time = $interval[1];
        } else {
            return;
        }
        $html .= ' (' . wp_date( $time_format, $start_time, new DateTimeZone(date_default_timezone_get()) ) . ' - ' . wp_date( $time_format, $end_time, new DateTimeZone(date_default_timezone_get()) );
        if ( $interval_count == 2 ) {
            $interval = $business_hours->getInterval( $day, 2 );
            if ( isset( $interval ) && count( $interval ) == 2 ) {
                $start_time = $interval[0];
                $end_time = $interval[1];
            } else {
                return;
            }
            $html .= ', ' . wp_date( $time_format, $start_time, new DateTimeZone(date_default_timezone_get()) ) . ' - ' . wp_date( $time_format, $end_time, new DateTimeZone(date_default_timezone_get()) );
        }
        $html .= ') ';
        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        return $html;
    }

    // render service disabilities
    public static function renderBHDisabilities() {
        $arrIds = WBK_Model_Utils::get_service_ids();
        $html = '<script type=\'text/javascript\'>';
        $html .= 'var wbk_disabled_days = {';
        foreach ( $arrIds as $id ) {
            $service = new WBK_Service_deprecated();
            if ( !$service->setId( $id ) ) {
                continue;
            }
            if ( !$service->load() ) {
                continue;
            }
            $arr_bh = explode( ';', $service->getBusinessHours() );
            $business_hours = new WBK_Business_Hours();
            if ( !$business_hours->setFromArray( $arr_bh ) ) {
                continue;
            }
            $arr_disabled = [];
            if ( !$business_hours->isWorkday( 'monday' ) ) {
                if ( WBK_Date_Time_Utils::getStartOfWeek() == 'monday' ) {
                    array_push( $arr_disabled, 1 );
                } else {
                    array_push( $arr_disabled, 2 );
                }
            }
            if ( !$business_hours->isWorkday( 'tuesday' ) ) {
                if ( WBK_Date_Time_Utils::getStartOfWeek() == 'monday' ) {
                    array_push( $arr_disabled, 2 );
                } else {
                    array_push( $arr_disabled, 3 );
                }
            }
            if ( !$business_hours->isWorkday( 'wednesday' ) ) {
                if ( WBK_Date_Time_Utils::getStartOfWeek() == 'monday' ) {
                    array_push( $arr_disabled, 3 );
                } else {
                    array_push( $arr_disabled, 4 );
                }
            }
            if ( !$business_hours->isWorkday( 'thursday' ) ) {
                if ( WBK_Date_Time_Utils::getStartOfWeek() == 'monday' ) {
                    array_push( $arr_disabled, 4 );
                } else {
                    array_push( $arr_disabled, 5 );
                }
            }
            if ( !$business_hours->isWorkday( 'friday' ) ) {
                if ( WBK_Date_Time_Utils::getStartOfWeek() == 'monday' ) {
                    array_push( $arr_disabled, 5 );
                } else {
                    array_push( $arr_disabled, 6 );
                }
            }
            if ( !$business_hours->isWorkday( 'saturday' ) ) {
                if ( WBK_Date_Time_Utils::getStartOfWeek() == 'monday' ) {
                    array_push( $arr_disabled, 6 );
                } else {
                    array_push( $arr_disabled, 7 );
                }
            }
            if ( !$business_hours->isWorkday( 'sunday' ) ) {
                if ( WBK_Date_Time_Utils::getStartOfWeek() == 'monday' ) {
                    array_push( $arr_disabled, 7 );
                } else {
                    array_push( $arr_disabled, 1 );
                }
            }
            $html .= '"' . $id . '":"' . implode( ',', $arr_disabled ) . '",';
        }
        $html .= '"blank":"blank"';
        $html .= '};</script>';
        return $html;
    }

    public static function getServicWeekDisabiliy( $service_id ) {
        $service_schedule = new WBK_Service_Schedule();
        $service_schedule->setServiceId( $service_id );
        $service_schedule->load();
        $disabilities = $service_schedule->getWeekDisabilities();
        return $disabilities;
    }

    // render service limits
    public static function getServiceLimits( $service_id ) {
        $id = $service_id;
        $service = new WBK_Service_deprecated();
        if ( !$service->setId( $id ) ) {
            return '';
        }
        if ( !$service->load() ) {
            return '';
        }
        $result = '';
        // init service schedulle
        if ( $service->getDateRange() == '' ) {
            $limit_value = '';
        } else {
            if ( $service->getDateRangeStart() == $service->getDateRangeEnd() ) {
                $limit_value = $service->getDateRangeStart();
            } else {
                $limit_value = date( 'Y,n,j', $service->getDateRangeStart() ) . '-' . date( 'Y,n,j', $service->getDateRangeEnd() );
            }
        }
        $result .= $limit_value;
        return $result;
    }

    // render service limits
    public static function renderServiceLimits() {
        $arrIds = WBK_Model_Utils::get_service_ids();
        $html = '<script type=\'text/javascript\'>';
        $html .= 'var wbk_service_limits = {';
        foreach ( $arrIds as $id ) {
            $service = new WBK_Service_deprecated();
            if ( !$service->setId( $id ) ) {
                continue;
            }
            if ( !$service->load() ) {
                continue;
            }
            // init service schedulle
            if ( $service->getDateRange() == '' ) {
                $limit_value = '';
            } else {
                if ( $service->getDateRangeStart() == $service->getDateRangeEnd() ) {
                    $limit_value = $service->getDateRangeStart();
                } else {
                    $limit_value = date( 'Y,n,j', $service->getDateRangeStart() ) . '-' . date( 'Y,n,j', $service->getDateRangeEnd() );
                }
            }
            $html .= '"' . $id . '":"' . $limit_value . '",';
        }
        $html .= '"blank":"blank"';
        $html .= '};</script>';
        return $html;
    }

    public static function chekRangeIntersect(
        $start,
        $end,
        $start_compare,
        $end_compare
    ) {
        $intersect = false;
        if ( $start_compare == $start ) {
            $intersect = true;
        }
        if ( $start_compare > $start && $start_compare < $end ) {
            $intersect = true;
        }
        if ( $end_compare > $start && $end_compare <= $end ) {
            $intersect = true;
        }
        if ( $start >= $start_compare && $end <= $end_compare ) {
            $intersect = true;
        }
        if ( $start <= $start_compare && $end >= $end_compare ) {
            $intersect = true;
        }
        return $intersect;
    }

    public static function loadEventsInRange( $day, $number_of_days, $service ) {
        $event_data_arr = [];
        return $event_data_arr;
    }

    public static function is_correction_needed( $time ) {
        return false;
        $offset_1 = date( 'Z', $time );
        $offset_2 = date( 'Z', strtotime( 'today midnight', $time ) );
        if ( $offset_1 != $offset_2 ) {
            return true;
        } else {
            return false;
        }
    }

    public static function convert_default_time_zone_to_utc( $time ) {
        $timezone_to_use = new DateTimeZone(date_default_timezone_get());
        $this_tz = new DateTimeZone(date_default_timezone_get());
        $date = ( new DateTime('@' . $time) )->setTimezone( new DateTimeZone(date_default_timezone_get()) );
        $now = new DateTime('now', $this_tz);
        $offset_sign = $this_tz->getOffset( $date );
        if ( $offset_sign > 0 ) {
            $sign = '+';
        } else {
            $sign = '-';
        }
        $offset_rounded = abs( $offset_sign / 3600 );
        $offset_int = floor( $offset_rounded );
        if ( $offset_rounded - $offset_int == 0.5 ) {
            $offset_fractional = ':30';
        } else {
            $offset_fractional = '';
        }
        $timezone_utc_string = $sign . $offset_int . $offset_fractional;
        return $timezone_to_use;
    }

}
