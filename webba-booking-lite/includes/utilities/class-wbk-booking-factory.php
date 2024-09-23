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
        if ( get_option( 'wbk_phone_required', '3' ) != '' ) {
            if ( !WBK_Validator::check_string_size( $data['phone'], 3, 128 ) ) {
                return [false, 'Incorrect phone'];
            }
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
            if ( is_numeric( $expiration_time ) && intval( $expiration_time ) >= 5 ) {
                if ( $service->get_price() == 0 ) {
                    $expiration_value = 0;
                } else {
                    $expiration_value = time() + $expiration_time * 60;
                }
            }
            $data['expiration_time'] = $expiration_value;
        }
        if ( defined( 'ICL_LANGUAGE_CODE' ) ) {
            $data['lang'] = ICL_LANGUAGE_CODE;
        } else {
            $data['lang'] = '';
        }
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
        foreach ( $booking_ids as $booking_id ) {
            $booking = new WBK_Booking($booking_id);
            $service_id = $booking->get_service();
            $service = new WBK_Service($service_id);
            if ( $service->has_only_arrival_payment_method() ) {
                $booking->set( 'payment_method', 'Pay on arrival' );
                $booking->save();
            }
            Plugion()->set_value(
                get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments',
                'appointment_created_on',
                $booking->get_id(),
                time()
            );
            Plugion()->set_value(
                get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments',
                'appointment_duration',
                $booking->get_id(),
                $service->get_duration()
            );
            Plugion()->set_value(
                get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments',
                'appointment_prev_status',
                $booking->get_id(),
                $booking->get( 'status' )
            );
            WBK_Model_Utils::set_booking_end( $booking->get_id() );
            if ( get_option( 'wbk_gdrp', 'disabled' ) == 'disabled' ) {
                if ( isset( $_SERVER['REMOTE_ADDR'] ) ) {
                    Plugion()->set_value(
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
                Plugion()->set_value(
                    get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments',
                    'appointment_creted_by',
                    $booking->get_id(),
                    'customer'
                );
            } else {
                Plugion()->set_value(
                    get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments',
                    'appointment_prev_status',
                    $booking->get_id(),
                    $booking->get( 'status' )
                );
                Plugion()->set_value(
                    get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments',
                    'appointment_creted_by',
                    $booking->get_id(),
                    'admin'
                );
            }
            if ( get_option( 'wbk_appointments_delete_not_paid_mode', 'disabled' ) == 'on_booking' ) {
                $expiration_time = get_option( 'wbk_appointments_expiration_time', '60' );
                if ( is_numeric( $expiration_time ) && intval( $expiration_time ) >= 5 ) {
                    if ( $service->get_price() == 0 || $amount['price'] == 0 ) {
                        $expiration_value = 0;
                    } else {
                        $expiration_value = time() + $expiration_time * 60;
                    }
                }
                Plugion()->set_value(
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
            foreach ( $notification_booking_ids as $notification_booking_id ) {
                $booking = new WBK_Booking($notification_booking_id);
                if ( !$booking->is_loaded() ) {
                    continue;
                }
                // single send
                $noifications = new WBK_Email_Notifications($booking->get_service(), $notification_booking_id, $booking->get( 'service_category' ));
                $noifications->send( 'book' );
                // sending invoice
                if ( get_option( 'wbk_email_customer_send_invoice', 'disabled' ) == 'onbooking' ) {
                    if ( get_option( 'wbk_multi_booking', 'disabled' ) != 'enabled' ) {
                        $noifications->sendSingleInvoice();
                    }
                }
            }
            // member's notifications
            WBK_Email_Processor::send( $notification_booking_ids, 'confirmation_members' );
            $sort_array = [];
            foreach ( $booking_ids as $temp_id ) {
                $booking = new WBK_Booking($temp_id);
                $sort_array[] = $booking->get_start();
            }
            array_multisort(
                $sort_array,
                SORT_ASC,
                SORT_NUMERIC,
                $booking_ids
            );
            if ( count( $booking_ids ) > 0 ) {
                $booking = new WBK_Booking($booking_ids[0]);
                if ( $booking->is_loaded() ) {
                    if ( get_option( 'wbk_multi_booking', 'disabled' ) == 'enabled' ) {
                        $noifications = new WBK_Email_Notifications($booking->get_service(), $booking_ids[0]);
                        $noifications->sendMultipleCustomerNotification( $booking_ids );
                        if ( get_option( 'wbk_email_customer_send_invoice', 'disabled' ) == 'onbooking' ) {
                            $noifications->sendMultipleCustomerInvoice( $booking_ids );
                        }
                    }
                    if ( get_option( 'wbk_multi_booking', 'disabled' ) == 'enabled' ) {
                        $noifications = new WBK_Email_Notifications($booking->get_service(), $booking_ids[0]);
                        $noifications->sendMultipleAdminNotification( $booking_ids );
                    }
                }
            }
        }
        if ( $event == 'on_manual_booking' ) {
            $noifications = new WBK_Email_Notifications($service_id, $booking_ids[0]);
            $noifications->sendSingleBookedManually();
        }
        do_action( 'wbebba_after_bookings_added', $booking_ids );
        date_default_timezone_set( $prev_time_zone );
    }

    public function destroy( $booking_id, $by = '', $force_deletion = false ) {
        $booking = new WBK_Booking($booking_id);
        if ( !$booking->is_loaded() ) {
            return;
        }
        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        // sending emails
        $noifications = new WBK_Email_Notifications($booking->get_service(), $booking_id);
        $send_single_bookigng_email = true;
        if ( $by == 'Service administrator (dashboard)' || get_option( 'wbk_multi_booking' ) != 'enabled' ) {
            $by_customer = false;
            if ( $by == 'customer' ) {
                $by_customer = true;
            }
            $noifications->prepareOnCancelCustomer( $by_customer );
            $noifications->sendOnCancelCustomer();
        }
        if ( $by == 'Service administrator (dashboard)' || get_option( 'wbk_multi_booking' ) != 'enabled' ) {
            $noifications->prepareOnCancel();
            $noifications->sendOnCancel();
        }
        do_action( 'webba_before_cancel_booking', $booking_id );
        WBK_Model_Utils::copy_booking_to_cancelled( $booking_id, $by );
        if ( $force_deletion ) {
            WBK_Model_Utils::delete_booking( $booking_id );
        }
        date_default_timezone_set( 'UTC' );
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
            if ( $status == 'pending' || $status == 'paid' ) {
                $i++;
                if ( $status == 'pending' ) {
                    $booking->set( 'status', 'approved' );
                }
                if ( $status == 'paid' ) {
                    $booking->set( 'status', 'paid_approved' );
                }
                $booking->save();
                $valid = true;
                $service_id = $booking->get( 'service_id' );
                $expiration_mode = get_option( 'wbk_appointments_delete_not_paid_mode', 'disabled' );
                if ( $expiration_mode == 'on_approve' ) {
                    WBK_Db_Utils::setAppointmentsExpiration( $booking_id );
                }
                if ( get_option( 'wbk_gg_when_add', 'onbooking' ) == 'onpaymentorapproval' ) {
                    if ( !WBK_Db_Utils::idEventAddedToGoogle( $booking_id ) ) {
                    }
                } else {
                }
            }
        }
        if ( $valid ) {
            WBK_Email_Processor::send( $booking_ids, 'approval' );
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
                if ( $method == 'woocommerce' ) {
                    $update_status = get_option( 'wbk_woo_update_status', 'paid' );
                    if ( $update_status == 'disabled' ) {
                        $update_status = 'woocommerce';
                    }
                    // send approval sms here
                    $booking->set( 'prev_status', $booking->get( 'status' ) );
                    $booking->set( 'status', $update_status );
                } else {
                    $status_assigned = false;
                    if ( $method == 'Stripe' && get_option( 'wbk_stripe_status_after_payment', 'based' ) != 'based' ) {
                        if ( $booking->get( 'status' ) == 'pending' ) {
                            $booking->set( 'status', 'paid' );
                        } elseif ( $booking->get( 'status' ) == 'approved' ) {
                            $booking->set( 'status', 'paid_approved' );
                        }
                        $booking->set( 'status', get_option( 'wbk_stripe_status_after_payment' ) );
                        $status_assigned = true;
                    }
                    if ( !$status_assigned ) {
                        if ( $booking->get( 'status' ) == 'pending' ) {
                            $booking->set( 'status', 'paid' );
                            $booking->set( 'prev_status', 'pending' );
                        } elseif ( $booking->get( 'status' ) == 'approved' ) {
                            $booking->set( 'status', 'paid_approved' );
                            $booking->set( 'prev_status', 'approved' );
                        }
                    }
                    if ( !$status_assigned ) {
                        if ( $booking->get( 'status' ) == 'pending' ) {
                            $booking->set( 'status', 'paid' );
                            $booking->set( 'prev_status', 'pending' );
                        } elseif ( $booking->get( 'status' ) == 'approved' ) {
                            $booking->set( 'status', 'paid_approved' );
                            $booking->set( 'prev_status', 'approved' );
                        }
                    }
                }
                $booking->set( 'payment_method', $method );
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
            foreach ( $booking_ids as $booking_id ) {
                wbk_email_processing_send_on_payment( [$booking_id] );
            }
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
            $current_status = $booking->get( 'status' );
            $prev_status = $booking->get( 'prev_status' );
            $service_id = $booking->get( 'service_id' );
            if ( $prev_status == 'pending' || $prev_status == 'paid' ) {
                if ( $current_status == 'approved' || $current_status == 'paid_approved' ) {
                    WBK_Email_Processor::send( [$booking_id], 'approval' );
                    $noifications = new WBK_Email_Notifications($service_id, $booking_id);
                    if ( get_option( 'wbk_email_customer_send_invoice', 'disabled' ) == 'onapproval' ) {
                        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
                        $noifications->sendSingleInvoice();
                        date_default_timezone_set( 'UTC' );
                    }
                    $expiration_mode = get_option( 'wbk_appointments_delete_not_paid_mode', 'disabled' );
                    if ( $expiration_mode == 'on_approve' ) {
                        WBK_Db_Utils::setAppointmentsExpiration( $booking_id );
                    }
                    if ( get_option( 'wbk_gg_when_add', 'onbooking' ) == 'onpaymentorapproval' ) {
                        if ( !WBK_Db_Utils::idEventAddedToGoogle( $booking_id ) ) {
                        }
                    }
                }
            }
            $service_id = WBK_Db_Utils::getServiceIdByAppointmentId( $booking_id );
            $noifications = new WBK_Email_Notifications($service_id, $booking_id);
            if ( $prev_status != 'arrived' && $current_status == 'arrived' ) {
                if ( get_option( 'wbk_email_customer_arrived_status', '' ) != '' ) {
                    WBK_Email_Processor::arrival_email_send_or_schedule( $booking_id );
                }
            }
            $service = new WBK_Service($service_id);
            $template = $service->get_on_changes_template();
            if ( $template != false ) {
                $template = WBK_Db_Utils::getEmailTemplate( $template );
                date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
                $noifications->send_single_notification( $booking_id, $template, get_option( 'wbk_email_on_update_booking_subject', '' ) );
                date_default_timezone_set( 'UTC' );
            }
            date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
            WBK_Db_Utils::updateAppointmentDataAtGGCelendar( $booking_id );
            date_default_timezone_set( 'UTC' );
            WBK_Model_Utils::set_booking_end( $booking_id );
            Plugion()->set_value(
                get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments',
                'appointment_prev_status',
                $booking_id,
                $booking->get( 'status' )
            );
        }
    }

}
