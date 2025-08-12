<?php

if ( !defined( 'ABSPATH' ) ) {
    exit;
}
class WBK_Booking_Factory {
    public function build_from_array( $data ) {
        global $wpdb;
        if ( !WBK_Validator::check_string_size( $data['name'], 1, 128 ) ) {
            return [false, 'Incorrect name'];
        }
        if ( !WBK_Validator::check_email( $data['email'] ) ) {
            return [false, 'Incorrect email'];
        }
        if ( !WBK_Validator::check_integer( $data['time'], 1438426800, 4901674778 ) ) {
            return [false, 'Incorrect time'];
        }
        if ( !WBK_Validator::check_integer( $data['quantity'], 1, 1754046000 ) ) {
            return [false, 'Incorrect quantity'];
        }
        if ( !WBK_Validator::check_integer( $data['service_id'], 1, 9999999999 ) ) {
            return [false, 'Incorrect service id'];
        }
        $service = new WBK_Service($data['service_id']);
        if ( !$service->is_loaded() ) {
            return [false, 'Service not loaded'];
        }
        if ( !WBK_Validator::check_integer( $data['service_category'], 0, 9999999999 ) ) {
            return [false, 'Incorrect service category'];
        }
        if ( !WBK_Validator::check_integer( $data['duration'], 1, 1440 ) ) {
            return [false, 'Incorrect duration'];
        }
        if ( !WBK_Validator::check_string_size( $data['description'], 0, 1024 ) ) {
            return [false, 'Incorrect description'];
        }
        $data['extra'] = apply_filters( 'wbk_external_custom_field', $data['extra'], '' );
        if ( !WBK_Validator::check_integer( $data['time_offset'], -10000, 10000 ) ) {
            return [false, 'Incorrect time offset'];
        }
        if ( !WBK_Validator::check_string_size( $data['attachment'], 0, 1024 ) ) {
            return [false, 'Incorrect attachment'];
        }
        if ( $data['extra'] != '' ) {
            $extra = json_decode( $data['extra'] );
            if ( $extra === null ) {
                return [false, 'Incorrect custom fields 1'];
            }
            if ( !is_array( $extra ) ) {
                return [false, 'Incorrect custom fields 2'];
            }
            $result_array = [];
            foreach ( $extra as $item ) {
                if ( !is_array( $item ) ) {
                    return [false, 'Incorrect custom fields 3'];
                }
                if ( count( $item ) != 3 ) {
                    return [false, 'Incorrect custom fields 4'];
                }
                $result_item = [];
                foreach ( $item as $subitem ) {
                    if ( !is_array( $subitem ) ) {
                        $result_item[] = esc_html( sanitize_text_field( $subitem ) );
                    } else {
                        $temp_array = [];
                        foreach ( $subitem as $temp_item ) {
                            $temp_array[] = esc_html( sanitize_text_field( $temp_item ) );
                        }
                        $result_item[] = implode( ', ', $temp_array );
                    }
                }
                $result_array[] = $result_item;
            }
            $data['extra'] = json_encode( $result_array );
        }
        $data['day'] = strtotime( date( 'Y-m-d', $data['time'] ) . ' 00:00:00' );
        $data['token'] = uniqid();
        $data['admin_token'] = uniqid();
        $data['created_on'] = time();
        $ip = '';
        if ( get_option( 'wbk_gdrp', 'disabled' ) == 'enabled' ) {
            if ( !isset( $_SERVER['REMOTE_ADDR'] ) ) {
                $ip = $_SERVER['REMOTE_ADDR'];
            }
        }
        $data['user_ip'] = $ip;
        $data['end'] = $data['time'] + $data['duration'] * 60;
        if ( get_option( 'wbk_appointments_default_status', 'approved' ) == 'approved' ) {
            $data['status'] = 'approved';
        } else {
            $data['status'] = 'pending';
        }
        if ( get_option( 'wbk_appointments_delete_not_paid_mode', 'disabled' ) == 'on_booking' ) {
            $expiration_time = get_option( 'wbk_appointments_expiration_time', '60' );
            if ( is_numeric( $expiration_time ) && intval( $expiration_time ) >= 1 ) {
                if ( $service->get_price() == 0 ) {
                    $expiration_value = 0;
                } else {
                    $expiration_value = time() + $expiration_time * 60;
                }
            }
            $data['expiration_time'] = $expiration_value;
        }
        if ( !isset( $data['locale'] ) ) {
            $data['locale'] = '';
        }
        $data['lang'] = $data['locale'];
        $booking = new WBK_Booking($data);
        if ( $booking->save() == false ) {
            return [false, 'Unknown error'];
        } else {
            return [true, $wpdb->insert_id];
        }
    }

    public function post_production( $booking_ids, $event = 'on_booking' ) {
        $prev_time_zone = date_default_timezone_get();
        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        $result = [];
        foreach ( $booking_ids as $booking_id ) {
            $booking = new WBK_Booking($booking_id);
            $service_id = $booking->get_service();
            $service = new WBK_Service($service_id);
            if ( $service->has_only_arrival_payment_method() ) {
                $booking->set( 'payment_method', 'Pay on arrival' );
                $booking->save();
            }
            WbkData()->set_value(
                get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments',
                'appointment_created_on',
                $booking->get_id(),
                time()
            );
            WbkData()->set_value(
                get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments',
                'appointment_duration',
                $booking->get_id(),
                $service->get_duration()
            );
            WbkData()->set_value(
                get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments',
                'appointment_prev_status',
                $booking->get_id(),
                $booking->get( 'status' )
            );
            WBK_Model_Utils::set_booking_end( $booking->get_id() );
            if ( get_option( 'wbk_gdrp', 'disabled' ) == 'disabled' ) {
                if ( isset( $_SERVER['REMOTE_ADDR'] ) ) {
                    WbkData()->set_value(
                        get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments',
                        'appointment_user_ip',
                        $booking->get_id(),
                        $_SERVER['REMOTE_ADDR']
                    );
                }
            }
            if ( $event != 'on_manual_booking' ) {
                $amount = WBK_Price_Processor::calculate_single_booking_price( $booking_id, $booking_ids );
                WBK_Model_Utils::set_amount_for_booking( $booking_id, $amount['price'], json_encode( $amount['price_details'] ) );
                WbkData()->set_value(
                    get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments',
                    'appointment_creted_by',
                    $booking->get_id(),
                    'customer'
                );
            } else {
                WbkData()->set_value(
                    get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments',
                    'appointment_prev_status',
                    $booking->get_id(),
                    $booking->get( 'status' )
                );
                WbkData()->set_value(
                    get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments',
                    'appointment_creted_by',
                    $booking->get_id(),
                    'admin'
                );
                WbkData()->set_value(
                    get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments',
                    'appointment_token',
                    $booking->get_id(),
                    uniqid()
                );
                WbkData()->set_value(
                    get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments',
                    'appointment_admin_token',
                    $booking->get_id(),
                    uniqid()
                );
            }
            if ( get_option( 'wbk_appointments_delete_not_paid_mode', 'disabled' ) == 'on_booking' ) {
                $expiration_time = get_option( 'wbk_appointments_expiration_time', '60' );
                if ( is_numeric( $expiration_time ) && intval( $expiration_time ) >= 1 ) {
                    if ( $service->get_price() == 0 || $amount['price'] == 0 ) {
                        $expiration_value = 0;
                    } else {
                        $expiration_value = time() + $expiration_time * 60;
                    }
                }
                WbkData()->set_value(
                    get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments',
                    'appointment_expiration_time',
                    $booking->get_id(),
                    $expiration_value
                );
                $data['expiration_time'] = $expiration_value;
            }
            // *** GG ADD
            if ( get_option( 'wbk_gg_when_add', 'onbooking' ) == 'onbooking' ) {
            }
            // add to Zoom
            if ( get_option( 'wbk_zoom_when_add', 'onbooking' ) == 'onbooking' ) {
            }
        }
        $sort_array = [];
        $notification_booking_ids = $booking_ids;
        foreach ( $notification_booking_ids as $temp_id ) {
            $booking = new WBK_Booking($temp_id);
            $sort_array[] = $booking->get_start();
        }
        array_multisort(
            $sort_array,
            SORT_ASC,
            SORT_NUMERIC,
            $notification_booking_ids
        );
        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        if ( $event == 'on_booking' ) {
            WBK_Email_Processor::send( $notification_booking_ids, 'booking_created_by_customer' );
        } else {
            WBK_Email_Processor::send( $notification_booking_ids, 'booking_created_by_admin' );
        }
        do_action( 'wbebba_after_bookings_added', $booking_ids );
        date_default_timezone_set( $prev_time_zone );
    }

    public function destroy( $booking_id, $by = '', $force_deletion = false ) {
        $booking = new WBK_Booking($booking_id);
        if ( !$booking->is_loaded() ) {
            return false;
        }
        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        do_action( 'webba_before_cancel_booking', $booking_id );
        if ( $force_deletion ) {
            WBK_Model_Utils::delete_booking( $booking_id );
        } else {
            if ( $by == 'customer' ) {
                WBK_Model_Utils::set_booking_status( $booking_id, 'cancelled' );
                WBK_Email_Processor::send( [$booking_id], 'booking_cancelled_by_customer' );
            } elseif ( $by == 'administrator' ) {
                WBK_Model_Utils::set_booking_status( $booking_id, 'rejected' );
                WBK_Email_Processor::send( [$booking_id], 'booking_cancelled_by_admin' );
            } elseif ( $by == 'auto' ) {
                WBK_Model_Utils::set_booking_status( $booking_id, 'cancelled' );
                WBK_Email_Processor::send( [$booking_id], 'booking_cancelled_auto' );
            }
        }
        date_default_timezone_set( 'UTC' );
        return true;
    }

    public function set_as_approved( $booking_ids ) {
        $valid = false;
        $i = 0;
        foreach ( $booking_ids as $booking_id ) {
            $booking = new WBK_Booking($booking_id);
            if ( !$booking->is_loaded() ) {
                continue;
            }
            $status = $booking->get( 'status' );
            if ( $status == 'pending' ) {
                $i++;
                if ( $status == 'pending' ) {
                    $booking->set( 'status', 'approved' );
                }
                $booking->save();
                $valid = true;
                $service_id = $booking->get( 'service_id' );
                $expiration_mode = get_option( 'wbk_appointments_delete_not_paid_mode', 'disabled' );
                if ( $expiration_mode == 'on_approve' ) {
                    WBK_Model_Utils::set_booking_expiration( $booking_id );
                }
                if ( get_option( 'wbk_gg_when_add', 'onbooking' ) == 'onpaymentorapproval' ) {
                    if ( !WBK_Model_Utils::is_event_added_to_google( $booking_id ) ) {
                    }
                } else {
                }
            }
        }
        if ( $valid ) {
            WBK_Email_Processor::send( $booking_ids, 'booking_approved' );
        }
        date_default_timezone_set( 'UTC' );
        return $i;
    }

    public function set_as_paid( $booking_ids, $method ) {
        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        $coupon_id = null;
        $booking_ids_t = $booking_ids;
        $booking_ids = [];
        foreach ( $booking_ids_t as $booking_id ) {
            $booking = new WBK_Booking($booking_id);
            if ( !$booking->is_loaded() ) {
                continue;
            }
            $service = new WBK_Service($booking->get_service());
            if ( !$service->is_loaded() ) {
                continue;
            }
            if ( $service->get_payment_methods() != '' ) {
                $booking_ids[] = $booking_id;
            }
        }
        if ( count( $booking_ids ) > 0 ) {
        }
        if ( count( $booking_ids ) > 0 ) {
            foreach ( $booking_ids as $booking_id ) {
                $booking = new WBK_Booking($booking_id);
                if ( !$booking->is_loaded() ) {
                    continue;
                }
                $booking->set( 'payment_method', $method );
                $booking->set( 'amount_paid', $booking->get( 'moment_price' ) );
                $booking->save();
                $coupon_id = $booking->get( 'coupon' );
                if ( get_option( 'wbk_gg_when_add', 'onbooking' ) == 'onpaymentorapproval' ) {
                }
            }
        }
        if ( $coupon_id !== false ) {
            $coupon = new WBK_Coupon($coupon_id);
            if ( !$coupon->get( 'used' ) ) {
                $used = 0;
            } else {
                $used = $coupon->get( 'used' );
            }
            $used++;
            $coupon->set( 'used', $used );
            $coupon->save();
        }
        // send invoice (email notification)
        $curent_invoice = get_option( 'wbk_email_current_invoice_number', '1' );
        $curent_invoice++;
        update_option( 'wbk_email_current_invoice_number', $curent_invoice );
        if ( count( $booking_ids ) > 0 ) {
            WBK_Email_Processor::send( $booking_ids, 'booking_paid' );
        }
        do_action( 'wbk_after_set_as_paid', $booking_ids );
        date_default_timezone_set( 'UTC' );
    }

    public function update( $booking_ids ) {
        if ( is_numeric( $booking_ids ) ) {
            global $wpdb;
            $booking_id = $booking_ids;
            $booking = new WBK_Booking($booking_id);
            if ( !$booking->is_loaded() ) {
                return;
            }
            $start_time = $booking->get_start();
            $prev_time_zone = date_default_timezone_get();
            date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
            $booking->set( 'day', strtotime( 'midnight', $start_time ) );
            date_default_timezone_set( $prev_time_zone );
            $booking->save();
            $current_status = $booking->get( 'status' );
            $prev_status = $booking->get( 'prev_status' );
            $service_id = $booking->get( 'service_id' );
            if ( $prev_status == 'pending' ) {
                if ( $current_status == 'approved' ) {
                    WBK_Email_Processor::send( [$booking_id], 'booking_approved' );
                    $noifications = new WBK_Email_Notifications($service_id, $booking_id);
                    if ( get_option( 'wbk_email_customer_send_invoice', 'disabled' ) == 'onapproval' ) {
                        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
                        $noifications->sendSingleInvoice();
                        date_default_timezone_set( 'UTC' );
                    }
                    $expiration_mode = get_option( 'wbk_appointments_delete_not_paid_mode', 'disabled' );
                    if ( $expiration_mode == 'on_approve' ) {
                        WBK_Model_Utils::set_booking_expiration( $booking_id );
                    }
                    if ( get_option( 'wbk_gg_when_add', 'onbooking' ) == 'onpaymentorapproval' ) {
                        if ( !WBK_Model_Utils::is_event_added_to_google( $booking_id ) ) {
                        }
                    }
                }
            }
            $service_id = WBK_Model_Utils::get_service_id_by_booking_id( $booking_id );
            $noifications = new WBK_Email_Notifications($service_id, $booking_id);
            if ( $prev_status != 'arrived' && $current_status == 'arrived' ) {
                if ( get_option( 'wbk_email_customer_arrived_status', '' ) != '' ) {
                    WBK_Email_Processor::arrival_email_send_or_schedule( $booking_id );
                }
            }
            if ( $current_status == 'cancelled' && $prev_status != 'cancelled' || $current_status == 'rejected' && $prev_status != 'rejected' ) {
                WBK_Email_Processor::send( [$booking_id], 'booking_cancelled_by_admin' );
            }
            $service = new WBK_Service($service_id);
            date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
            WBK_Model_Utils::update_booking_data_at_gg_calendar( $booking_id );
            date_default_timezone_set( 'UTC' );
            WBK_Model_Utils::set_booking_end( $booking_id );
            WbkData()->set_value(
                get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments',
                'appointment_prev_status',
                $booking_id,
                $booking->get( 'status' )
            );
            WBK_Email_Processor::send( [$booking_id], 'booking_updated_by_admin' );
        }
    }

}
