<?php

if ( !defined( "ABSPATH" ) ) {
    exit;
}
class WBK_Booking_Factory {
    public function build_from_array( $data ) {
        global $wpdb;
        if ( !WBK_Validator::check_string_size( $data["name"], 1, 128 ) ) {
            return [false, "Incorrect name"];
        }
        if ( !WBK_Validator::check_email( $data["email"] ) ) {
            return [false, "Incorrect email"];
        }
        $is_unit_only_booking = !empty( $data["wbk_unit_range_booking"] ) && (int) ($data["service_id"] ?? 0) === 0;
        if ( $is_unit_only_booking ) {
            $range = $data["range"] ?? $data["unit_range"] ?? null;
            if ( is_array( $range ) && isset( $range["start"], $range["end"] ) && $range["start"] !== "" && $range["end"] !== "" ) {
                $start_ts = strtotime( (string) $range["start"] );
                $end_ts = strtotime( (string) $range["end"] );
                if ( $start_ts === false || $end_ts === false || $end_ts < $start_ts ) {
                    return [false, "Invalid range"];
                }
                $start_day = strtotime( date( "Y-m-d", $start_ts ) );
                $end_day = strtotime( date( "Y-m-d", $end_ts ) );
                $inclusive_days = (int) (($end_day - $start_day) / DAY_IN_SECONDS) + 1;
                if ( $inclusive_days < 1 ) {
                    $inclusive_days = 1;
                }
                $data["time"] = $start_day;
                $data["duration"] = $inclusive_days * 1440;
            }
        }
        if ( !WBK_Validator::check_integer( $data["time"], 1438426800, 4901674778 ) ) {
            return [false, "Incorrect time"];
        }
        if ( !WBK_Validator::check_integer( $data["quantity"], 1, 1754046000 ) ) {
            return [false, "Incorrect quantity"];
        }
        if ( $is_unit_only_booking ) {
            if ( !WBK_Validator::check_integer( $data["unit_id"] ?? 0, 1, 9999999999 ) ) {
                return [false, "Incorrect unit id"];
            }
            $data["service_id"] = 0;
            $service = null;
        } else {
            if ( !WBK_Validator::check_integer( $data["service_id"], 1, 9999999999 ) ) {
                return [false, "Incorrect service id"];
            }
            $service = new WBK_Service($data["service_id"]);
            if ( !$service->is_loaded() ) {
                return [false, "Service not loaded"];
            }
        }
        if ( !WBK_Validator::check_integer( $data["service_category"], 0, 9999999999 ) ) {
            return [false, "Incorrect service category"];
        }
        $max_duration_minutes = 1440;
        if ( !empty( $data["wbk_unit_range_booking"] ) ) {
            $max_duration_minutes = 535680;
        }
        if ( !WBK_Validator::check_integer( $data["duration"], 1, $max_duration_minutes ) ) {
            return [false, "Incorrect duration"];
        }
        if ( !WBK_Validator::check_string_size( $data["description"], 0, 1024 ) ) {
            return [false, "Incorrect description"];
        }
        $data["extra"] = apply_filters( "wbk_external_custom_field", $data["extra"], "" );
        if ( !WBK_Validator::check_integer( $data["time_offset"], -10000, 10000 ) ) {
            return [false, "Incorrect time offset"];
        }
        if ( !WBK_Validator::check_string_size( $data["attachment"], 0, 1024 ) ) {
            return [false, "Incorrect attachment"];
        }
        if ( $data["extra"] != "" ) {
            $extra = json_decode( $data["extra"] );
            if ( $extra === null ) {
                return [false, "Incorrect custom fields 1"];
            }
            if ( !is_array( $extra ) ) {
                return [false, "Incorrect custom fields 2"];
            }
            $result_array = [];
            foreach ( $extra as $item ) {
                if ( !is_array( $item ) ) {
                    return [false, "Incorrect custom fields 3"];
                }
                if ( count( $item ) != 3 ) {
                    return [false, "Incorrect custom fields 4"];
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
                        $result_item[] = implode( ", ", $temp_array );
                    }
                }
                $result_array[] = $result_item;
            }
            $data["extra"] = json_encode( $result_array );
        }
        $data["day"] = strtotime( date( "Y-m-d", $data["time"] ) . " 00:00:00" );
        $data["token"] = uniqid();
        $data["admin_token"] = uniqid();
        $data["created_on"] = time();
        $ip = "";
        if ( get_option( "wbk_gdrp", "disabled" ) == "enabled" && WBK_Feature_Gate::have_required_plan( "standard", "only_old_users" ) ) {
            if ( !isset( $_SERVER["REMOTE_ADDR"] ) ) {
                $ip = $_SERVER["REMOTE_ADDR"];
            }
        }
        $data["user_ip"] = $ip;
        $data["end"] = $data["time"] + $data["duration"] * 60;
        if ( get_option( "wbk_appointments_default_status", "approved" ) == "approved" ) {
            $data["status"] = "approved";
        } else {
            $data["status"] = "pending";
        }
        if ( get_option( "wbk_appointments_delete_not_paid_mode", "disabled" ) == "on_booking" ) {
            $expiration_time = get_option( "wbk_appointments_expiration_time", "60" );
            $expiration_value = 0;
            if ( is_numeric( $expiration_time ) && intval( $expiration_time ) >= 1 ) {
                if ( $service !== null && $service->is_loaded() && $service->get_price() != 0 ) {
                    $expiration_value = time() + $expiration_time * 60;
                }
            }
            $data["expiration_time"] = $expiration_value;
        }
        if ( !isset( $data["locale"] ) ) {
            $data["locale"] = "";
        }
        $data["lang"] = $data["locale"];
        if ( isset( $data["staff_member_id"] ) && $data["staff_member_id"] !== "" && $data["staff_member_id"] !== 0 ) {
            if ( !WBK_Validator::check_integer( $data["staff_member_id"], 1, 9999999999 ) ) {
                return [false, "Incorrect staff member id"];
            }
            $data["staff_member_id"] = (int) $data["staff_member_id"];
        } else {
            $data["staff_member_id"] = 0;
        }
        if ( isset( $data["location_id"] ) && $data["location_id"] !== "" && $data["location_id"] !== 0 ) {
            if ( !WBK_Validator::check_integer( $data["location_id"], 1, 9999999999 ) ) {
                return [false, "Incorrect location id"];
            }
            $data["location_id"] = (int) $data["location_id"];
        } else {
            $data["location_id"] = 0;
        }
        $booking = new WBK_Booking($data);
        if ( $booking->save() == false ) {
            return [false, "Unknown error"];
        } else {
            return [true, $wpdb->insert_id];
        }
    }

    public function post_production( $booking_ids, $event = "on_booking" ) {
        $prev_time_zone = date_default_timezone_get();
        date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
        $result = [];
        foreach ( $booking_ids as $booking_id ) {
            $booking = new WBK_Booking($booking_id);
            $service_id = (int) $booking->get_service();
            $service = new WBK_Service($service_id);
            $service_loaded = $service->is_loaded();
            if ( $service_loaded && $service->has_only_arrival_payment_method() ) {
                $booking->set( "payment_method", "Pay on arrival" );
                $booking->save();
            }
            WbkData()->set_value(
                get_option( "wbk_db_prefix", "" ) . "wbk_appointments",
                "appointment_created_on",
                $booking->get_id(),
                time()
            );
            if ( (int) $booking->get( "unit_id" ) > 0 ) {
                $duration_for_meta = (int) $booking->get( "duration" );
            } else {
                $duration_for_meta = ( $service_loaded ? $service->get_duration() : (int) $booking->get( "duration" ) );
            }
            WbkData()->set_value(
                get_option( "wbk_db_prefix", "" ) . "wbk_appointments",
                "appointment_duration",
                $booking->get_id(),
                $duration_for_meta
            );
            WbkData()->set_value(
                get_option( "wbk_db_prefix", "" ) . "wbk_appointments",
                "appointment_prev_status",
                $booking->get_id(),
                $booking->get( "status" )
            );
            WBK_Model_Utils::set_booking_end( $booking->get_id() );
            if ( get_option( "wbk_gdrp", "disabled" ) == "disabled" && WBK_Feature_Gate::have_required_plan( "standard", "only_old_users" ) ) {
                if ( isset( $_SERVER["REMOTE_ADDR"] ) ) {
                    WbkData()->set_value(
                        get_option( "wbk_db_prefix", "" ) . "wbk_appointments",
                        "appointment_user_ip",
                        $booking->get_id(),
                        $_SERVER["REMOTE_ADDR"]
                    );
                }
            }
            $is_unit_booking = (int) $booking->get( "unit_id" ) > 0;
            $amount = [
                "price"         => 0,
                "price_details" => [],
            ];
            if ( $event != "on_manual_booking" ) {
                if ( $is_unit_booking ) {
                    $unit_payment_items = WBK_Price_Processor::get_unit_payment_items_post_booked( [$booking_id] );
                    if ( is_array( $unit_payment_items ) ) {
                        $amount = [
                            "price"         => (float) ($unit_payment_items["subtotal"] ?? 0),
                            "price_details" => [[
                                "type"      => "unit_price",
                                "subtotal"  => (float) ($unit_payment_items["subtotal"] ?? 0),
                                "tax"       => (float) ($unit_payment_items["tax_to_pay"] ?? 0),
                                "total"     => (float) ($unit_payment_items["to_pay_total"] ?? 0),
                                "breakdown" => ( isset( $unit_payment_items["unit_breakdowns"][0] ) && is_array( $unit_payment_items["unit_breakdowns"][0] ) ? $unit_payment_items["unit_breakdowns"][0] : [] ),
                            ]],
                        ];
                    }
                } else {
                    $amount = WBK_Price_Processor::calculate_single_booking_price( $booking_id, $booking_ids );
                }
                WBK_Model_Utils::set_amount_for_booking( $booking_id, $amount["price"], json_encode( $amount["price_details"] ) );
                WbkData()->set_value(
                    get_option( "wbk_db_prefix", "" ) . "wbk_appointments",
                    "appointment_creted_by",
                    $booking->get_id(),
                    "customer"
                );
            } else {
                WbkData()->set_value(
                    get_option( "wbk_db_prefix", "" ) . "wbk_appointments",
                    "appointment_prev_status",
                    $booking->get_id(),
                    $booking->get( "status" )
                );
                WbkData()->set_value(
                    get_option( "wbk_db_prefix", "" ) . "wbk_appointments",
                    "appointment_creted_by",
                    $booking->get_id(),
                    "admin"
                );
                WbkData()->set_value(
                    get_option( "wbk_db_prefix", "" ) . "wbk_appointments",
                    "appointment_token",
                    $booking->get_id(),
                    uniqid()
                );
                WbkData()->set_value(
                    get_option( "wbk_db_prefix", "" ) . "wbk_appointments",
                    "appointment_admin_token",
                    $booking->get_id(),
                    uniqid()
                );
            }
            if ( get_option( "wbk_appointments_delete_not_paid_mode", "disabled" ) == "on_booking" ) {
                $expiration_time = get_option( "wbk_appointments_expiration_time", "60" );
                $expiration_value = 0;
                if ( is_numeric( $expiration_time ) && intval( $expiration_time ) >= 1 ) {
                    if ( $is_unit_booking ) {
                        $service_price_zero = (float) $amount["price"] == 0;
                    } else {
                        $service_price_zero = !$service_loaded || $service->get_price() == 0;
                    }
                    if ( $service_price_zero || $amount["price"] == 0 ) {
                        $expiration_value = 0;
                    } else {
                        $expiration_value = time() + $expiration_time * 60;
                    }
                }
                WbkData()->set_value(
                    get_option( "wbk_db_prefix", "" ) . "wbk_appointments",
                    "appointment_expiration_time",
                    $booking->get_id(),
                    $expiration_value
                );
                $data["expiration_time"] = $expiration_value;
            }
            // *** Add event to the connected calendars (all types: Google, Outlook, etc.)
            if ( WBK_Connected_Calendar_Processor::booking_has_connected_calendars_for_export( $booking ) && get_option( "wbk_connected_calendars_when_add", "onbooking" ) == "onbooking" ) {
            }
            // add to Zoom
            if ( $service_loaded && get_option( "wbk_zoom_when_add", "onbooking" ) == "onbooking" ) {
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
        date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
        if ( $event == "on_booking" ) {
            WBK_Email_Processor::send( $notification_booking_ids, "booking_created_by_customer" );
        } else {
            WBK_Email_Processor::send( $notification_booking_ids, "booking_created_by_admin" );
        }
        // preset woocommerce order form
        if ( get_option( "wbk_woo_prefil_fields", "" ) == "true" ) {
            if ( !session_id() ) {
                session_start();
            }
            $full_name = explode( " ", $booking->get_name() );
            $_SESSION["wbk_name"] = $full_name[0];
            $_SESSION["wbk_last_name"] = $full_name[1];
            $_SESSION["wbk_email"] = $booking->get( "email" );
            $_SESSION["wbk_phone"] = $booking->get( "phone" );
        }
        do_action( "wbebba_after_bookings_added", $booking_ids );
        date_default_timezone_set( $prev_time_zone );
    }

    public function destroy( $booking_id, $by = "", $force_deletion = false ) {
        $booking = new WBK_Booking($booking_id);
        if ( !$booking->is_loaded() ) {
            return false;
        }
        date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
        do_action( "webba_before_cancel_booking", $booking_id );
        if ( $force_deletion ) {
            WBK_Model_Utils::delete_booking( $booking_id );
        } else {
            if ( $by == "customer" ) {
                WBK_Model_Utils::set_booking_status( $booking_id, "cancelled" );
                WBK_Email_Processor::send( [$booking_id], "booking_cancelled_by_customer" );
            } elseif ( $by == "administrator" ) {
                WBK_Model_Utils::set_booking_status( $booking_id, "rejected" );
                WBK_Email_Processor::send( [$booking_id], "booking_cancelled_by_admin" );
            } elseif ( $by == "auto" ) {
                WBK_Model_Utils::set_booking_status( $booking_id, "cancelled" );
                WBK_Email_Processor::send( [$booking_id], "booking_cancelled_auto" );
            }
        }
        date_default_timezone_set( "UTC" );
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
            $status = $booking->get( "status" );
            if ( $status == "pending" ) {
                $i++;
                if ( $status == "pending" ) {
                    $booking->set( "status", "approved" );
                }
                $booking->save();
                $valid = true;
                $service_id = $booking->get( "service_id" );
                $expiration_mode = get_option( "wbk_appointments_delete_not_paid_mode", "disabled" );
                if ( $expiration_mode == "on_approve" ) {
                    WBK_Model_Utils::set_booking_expiration( $booking_id );
                }
                if ( get_option( "wbk_connected_calendars_when_add", "onbooking" ) == "onpaymentorapproval" ) {
                    if ( !WBK_Connected_Calendar_Processor::is_event_added_to_connected_calendars( $booking_id ) ) {
                    }
                } else {
                }
            }
        }
        if ( $valid ) {
            WBK_Email_Processor::send( $booking_ids, "booking_approved" );
        }
        date_default_timezone_set( "UTC" );
        return $i;
    }

    public function set_as_paid( $booking_ids, $method, $total_amount ) {
        date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
        $coupon_id = null;
        $booking_ids_t = $booking_ids;
        $booking_ids = [];
        foreach ( $booking_ids_t as $booking_id ) {
            $booking = new WBK_Booking($booking_id);
            if ( !$booking->is_loaded() ) {
                continue;
            }
            $service = new WBK_Service($booking->get_service());
            $unit = new WBK_Unit($booking->get( "unit_id" ));
            $is_service_payable = $service->is_loaded() && $service->get_payment_methods() != "";
            $is_unit_payable = $unit->is_loaded() && $unit->get( "payment_methods" ) != "";
            if ( $is_service_payable || $is_unit_payable ) {
                $booking_ids[] = $booking_id;
            }
            if ( $method == "coupon" ) {
                $booking->set( "paid_with_coupon", "yes" );
                $booking->save();
            }
        }
        if ( count( $booking_ids ) > 0 ) {
        }
        $price_per_booking = number_format(
            $total_amount / count( $booking_ids ),
            get_option( "wbk_price_fractional", "2" ),
            get_option( "wbk_price_separator", "." ),
            ""
        );
        if ( count( $booking_ids ) > 0 ) {
            foreach ( $booking_ids as $booking_id ) {
                $booking = new WBK_Booking($booking_id);
                if ( !$booking->is_loaded() ) {
                    continue;
                }
                $booking->set( "payment_method", $method );
                $booking->set( "amount_paid", $price_per_booking );
                $booking->save();
                $coupon_id = $booking->get( "coupon" );
                if ( get_option( "wbk_connected_calendars_when_add", "onbooking" ) == "onpaymentorapproval" ) {
                }
            }
        }
        if ( $coupon_id !== false ) {
            $coupon = new WBK_Coupon($coupon_id);
            if ( $coupon->is_loaded() ) {
                if ( !$coupon->get( "used" ) ) {
                    $used = 0;
                } else {
                    $used = $coupon->get( "used" );
                }
                $used++;
                $coupon->set( "used", $used );
                $coupon->save();
            }
        }
        // send invoice (email notification)
        $curent_invoice = get_option( "wbk_email_current_invoice_number", "1" );
        $curent_invoice++;
        update_option( "wbk_email_current_invoice_number", $curent_invoice );
        if ( count( $booking_ids ) > 0 ) {
            WBK_Email_Processor::send( $booking_ids, "booking_paid" );
        }
        do_action( "wbk_after_set_as_paid", $booking_ids );
        date_default_timezone_set( "UTC" );
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
            date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
            $booking->set( "day", strtotime( "midnight", $start_time ) );
            date_default_timezone_set( $prev_time_zone );
            $booking->save();
            $current_status = $booking->get( "status" );
            $prev_status = $booking->get( "prev_status" );
            $service_id = $booking->get( "service_id" );
            if ( $prev_status == "pending" ) {
                if ( $current_status == "approved" ) {
                    WBK_Email_Processor::send( [$booking_id], "booking_approved" );
                    $noifications = new WBK_Email_Notifications($service_id, $booking_id);
                    if ( get_option( "wbk_email_customer_send_invoice", "disabled" ) == "onapproval" ) {
                        date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
                        $noifications->sendSingleInvoice();
                        date_default_timezone_set( "UTC" );
                    }
                    $expiration_mode = get_option( "wbk_appointments_delete_not_paid_mode", "disabled" );
                    if ( $expiration_mode == "on_approve" ) {
                        WBK_Model_Utils::set_booking_expiration( $booking_id );
                    }
                    if ( get_option( "wbk_connected_calendars_when_add", "onbooking" ) == "onpaymentorapproval" ) {
                        if ( !WBK_Connected_Calendar_Processor::is_event_added_to_connected_calendars( $booking_id ) ) {
                        }
                    }
                }
            }
            $service_id = WBK_Model_Utils::get_service_id_by_booking_id( $booking_id );
            $noifications = new WBK_Email_Notifications($service_id, $booking_id);
            if ( $prev_status != "arrived" && $current_status == "arrived" ) {
                if ( get_option( "wbk_email_customer_arrived_status", "" ) != "" ) {
                    WBK_Email_Processor::arrival_email_send_or_schedule( $booking_id );
                }
            }
            if ( $current_status == "cancelled" && $prev_status != "cancelled" || $current_status == "rejected" && $prev_status != "rejected" ) {
                WBK_Email_Processor::send( [$booking_id], "booking_cancelled_by_admin" );
            }
            $service = new WBK_Service($service_id);
            date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
            WBK_Model_Utils::update_booking_data_at_gg_calendar( $booking_id );
            date_default_timezone_set( "UTC" );
            WBK_Model_Utils::set_booking_end( $booking_id );
            WbkData()->set_value(
                get_option( "wbk_db_prefix", "" ) . "wbk_appointments",
                "appointment_prev_status",
                $booking_id,
                $booking->get( "status" )
            );
            WBK_Email_Processor::send( [$booking_id], "booking_updated_by_admin" );
        }
    }

}
