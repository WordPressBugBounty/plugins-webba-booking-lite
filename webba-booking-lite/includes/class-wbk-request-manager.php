<?php

use WebbaBooking\Utilities\WBK_Options_Utils;
if ( !defined( "ABSPATH" ) ) {
    exit;
}
/**
 * Class WBK_Request_Manager is used to perform requests to the REST API
 */
class WBK_Request_Manager {
    /**
     * constructor
     */
    public function __construct() {
        add_action( "rest_api_init", function () {
            register_rest_route( "webba-booking/v1", "/get-booking-ids-by-token", [
                "methods"             => "GET",
                "callback"            => [$this, "get_booking_ids_by_token"],
                "permission_callback" => [$this, "get_booking_ids_by_token_permission"],
            ] );
            register_rest_route( "wbk/v1", "/get-service-list/", [
                "methods"             => "GET",
                "callback"            => [$this, "get_service_list"],
                "permission_callback" => [$this, "get_service_list_permission"],
            ] );
            register_rest_route( "wbk/v1", "/appointments-status-change/", [
                "methods"             => "POST",
                "callback"            => [$this, "appointments_status_change"],
                "permission_callback" => [$this, "appointments_status_change_permission"],
            ] );
            register_rest_route( "wbk/v1", "/resend-email/", [
                "methods"             => "POST",
                "callback"            => [$this, "resend_email"],
                "permission_callback" => [$this, "resend_email_permission"],
            ] );
            register_rest_route( "wbk/v1", "/get-wp-users/", [
                "methods"             => "POST",
                "callback"            => [$this, "get_wp_users"],
                "permission_callback" => [$this, "get_wp_users_permission"],
            ] );
            register_rest_route( "wbk/v1", "/csv-export/", [
                "methods"             => "POST",
                "callback"            => [$this, "wbk_csv_export"],
                "permission_callback" => [$this, "wbk_csv_export_permission"],
            ] );
            register_rest_route( "wbk/v2", "/get-preset/", [
                "methods"             => "GET",
                "callback"            => [$this, "get_preset"],
                "permission_callback" => [$this, "get_preset_permission"],
            ] );
            if ( wbk_is_assistance_available() ) {
                register_rest_route( "wbk/v2", "/assistance/", [
                    "methods"             => "POST",
                    "callback"            => [$this, "assistance"],
                    "permission_callback" => [$this, "assistance_permission"],
                ] );
                register_rest_route( "wbk/v2", "/assistance/task/(?P<task_id>\\d+)", [
                    "methods"             => "GET",
                    "callback"            => [$this, "assistance_task_status"],
                    "permission_callback" => [$this, "assistance_permission"],
                ] );
                register_rest_route( "wbk/v2", "/assistance/apply/", [
                    "methods"             => "POST",
                    "callback"            => [$this, "assistance_apply"],
                    "permission_callback" => [$this, "assistance_apply_permission"],
                ] );
            }
            register_rest_route( "wbk/v2", "/login", [
                "methods"             => "POST",
                "callback"            => [$this, "login"],
                "permission_callback" => [$this, "login_permission"],
            ] );
            register_rest_route( "wbk/v2", "/get-user-bookings", [
                "methods"             => "GET",
                "callback"            => [$this, "get_user_bookings"],
                "permission_callback" => [$this, "get_user_bookings_permission"],
            ] );
            register_rest_route( "wbk/v2", "/update-booking", [
                "methods"             => "POST",
                "callback"            => [$this, "update_booking"],
                "permission_callback" => [$this, "update_booking_permission"],
            ] );
            register_rest_route( "wbk/v2", "/delete-booking", [
                "methods"             => "POST",
                "callback"            => [$this, "delete_booking"],
                "permission_callback" => [$this, "delete_booking_permission"],
            ] );
            register_rest_route( "wbk/v2", "/get-field-options/", [
                "methods"             => "POST",
                "callback"            => [$this, "get_field_options"],
                "permission_callback" => [$this, "get_field_options_permission"],
            ] );
            register_rest_route( "wbk/v2", "/get-calendar-auth-data/", [
                "methods"             => "GET",
                "callback"            => [$this, "get_gg_auth_data"],
                "permission_callback" => [$this, "get_gg_auth_data_permission"],
            ] );
            register_rest_route( "wbk/v2", "/icloud-calendar/connect/", [
                "methods"             => "POST",
                "callback"            => [$this, "icloud_calendar_connect"],
                "permission_callback" => [$this, "icloud_calendar_manage_permission"],
            ] );
            register_rest_route( "wbk/v2", "/icloud-calendar/test/", [
                "methods"             => "POST",
                "callback"            => [$this, "icloud_calendar_test"],
                "permission_callback" => [$this, "icloud_calendar_manage_permission"],
            ] );
            register_rest_route( "wbk/v2", "/icloud-calendar/disconnect/", [
                "methods"             => "POST",
                "callback"            => [$this, "icloud_calendar_disconnect"],
                "permission_callback" => [$this, "icloud_calendar_manage_permission"],
            ] );
            register_rest_route( "wbk/v2", "/icloud-calendar/calendars/", [
                "methods"             => "POST",
                "callback"            => [$this, "icloud_calendar_save_mapping"],
                "permission_callback" => [$this, "icloud_calendar_manage_permission"],
            ] );
            register_rest_route( "wbk/v2", "/get-gmail-auth-data/", [
                "methods"             => "GET",
                "callback"            => [$this, "get_gmail_auth_data"],
                "permission_callback" => [$this, "get_gmail_auth_data_permission"],
            ] );
            register_rest_route( "wbk/v2", "/get-dashboard-stats/", [
                "methods"             => "GET",
                "callback"            => [$this, "get_dashboard_stats"],
                "permission_callback" => [$this, "get_dashboard_stats_permission"],
            ] );
            register_rest_route( "wbk/v2", "/get-cell-detail/", [
                "methods"             => "GET",
                "callback"            => [$this, "get_cell_detail"],
                "permission_callback" => [$this, "get_cell_detail_permission"],
            ] );
            register_rest_route( "wbk/v2", "/get-schedule/", [
                "methods"             => "GET",
                "callback"            => [$this, "get_schedule"],
                "permission_callback" => [$this, "get_schedule_permission"],
            ] );
            register_rest_route( "wbk/v2", "/get-connected-calendar-events/", [
                "methods"             => "GET",
                "callback"            => [$this, "get_connected_calendar_events"],
                "permission_callback" => [$this, "get_connected_calendar_events_permission"],
            ] );
            register_rest_route( "wbk/v2", "/lock-day/", [
                "methods"             => "POST",
                "callback"            => [$this, "lock_day"],
                "permission_callback" => [$this, "schedule_lock_permission"],
            ] );
            register_rest_route( "wbk/v2", "/unlock-day/", [
                "methods"             => "POST",
                "callback"            => [$this, "unlock_day"],
                "permission_callback" => [$this, "schedule_lock_permission"],
            ] );
            register_rest_route( "wbk/v2", "/lock-time/", [
                "methods"             => "POST",
                "callback"            => [$this, "lock_time"],
                "permission_callback" => [$this, "schedule_lock_permission"],
            ] );
            register_rest_route( "wbk/v2", "/unlock-time/", [
                "methods"             => "POST",
                "callback"            => [$this, "unlock_time"],
                "permission_callback" => [$this, "schedule_lock_permission"],
            ] );
            register_rest_route( "wbk/v2", "/schedule-tools-action/", [
                "methods"             => "POST",
                "callback"            => [$this, "schedule_tools_action_rest"],
                "permission_callback" => [$this, "schedule_tools_action_permission"],
            ] );
            register_rest_route( "wbk/v2", "/create-multiple-bookings/", [
                "methods"             => "POST",
                "callback"            => [$this, "create_multiple_bookings_rest"],
                "permission_callback" => [$this, "create_multiple_bookings_permission"],
            ] );
            register_rest_route( "wbk/v2", "/save-appearance/", [
                "methods"             => "POST",
                "callback"            => [$this, "save_appearance"],
                "permission_callback" => [$this, "save_appearance_permission"],
            ] );
            register_rest_route( "wbk/v2", "/save-admin-theme/", [
                "methods"             => "POST",
                "callback"            => [$this, "save_admin_theme"],
                "permission_callback" => [$this, "save_admin_theme_permission"],
            ] );
            register_rest_route( "wbk/v2", "/check-gift-card-code/", [
                "methods"             => "POST",
                "callback"            => [$this, "check_gift_card_code"],
                "permission_callback" => [$this, "check_gift_card_code_permission"],
            ] );
            register_rest_route( "wbk/v2", "/generate-gift-card-code/", [
                "methods"             => "GET",
                "callback"            => [$this, "generate_gift_card_code"],
                "permission_callback" => [$this, "check_gift_card_code_permission"],
            ] );
            register_rest_route( "wbk/v2", "/gift-card-stripe-intent/", [
                "methods"             => "POST",
                "callback"            => [$this, "create_gift_card_stripe_intent"],
                "permission_callback" => [$this, "create_gift_card_stripe_intent_permission"],
            ] );
            register_rest_route( "wbk/v2", "/purchase-gift-card/", [
                "methods"             => "POST",
                "callback"            => [$this, "purchase_gift_card"],
                "permission_callback" => [$this, "purchase_gift_card_permission"],
            ] );
            register_rest_route( "wbk/v2", "/gift-card-payment-details/", [
                "methods"             => "GET",
                "callback"            => [$this, "get_gift_card_payment_details"],
                "permission_callback" => "__return_true",
            ] );
            register_rest_route( "wbk/v2", "/gift-card-status/", [
                "methods"             => "GET",
                "callback"            => [$this, "get_gift_card_status"],
                "permission_callback" => "__return_true",
                "args"                => [
                    "token" => [
                        "required"          => true,
                        "type"              => "string",
                        "sanitize_callback" => "sanitize_text_field",
                    ],
                ],
            ] );
            register_rest_route( "webba-booking/v1", "/get-service-availability/", [
                "methods"             => "GET",
                "callback"            => [$this, "get_service_availability"],
                "permission_callback" => [$this, "get_service_availability_permission"],
            ] );
            register_rest_route( "webba-booking/v1", "/get-staff-members/", [
                "methods"             => "GET",
                "callback"            => [$this, "get_staff_members"],
                "permission_callback" => [$this, "get_staff_members_permission"],
            ] );
            register_rest_route( "wbk/v1", "/get-available-time-slots-day/", [
                "methods"             => "POST",
                "callback"            => [$this, "get_available_time_slots_day"],
                "permission_callback" => [$this, "get_available_time_slots_day_permission"],
            ] );
            register_rest_route( "webba-booking/v1", "/get-service-time-slots/", [
                "methods"             => "GET",
                "callback"            => [$this, "get_service_time_slots"],
                "permission_callback" => [$this, "get_service_time_slots_permission"],
            ] );
            register_rest_route( "webba-booking/v1", "/get-recurring-booking-time-slots/", [
                "methods"             => "GET",
                "callback"            => [$this, "get_recurring_booking_time_slots"],
                "permission_callback" => [$this, "get_recurring_booking_time_slots_permission"],
            ] );
            register_rest_route( "webba-booking/v1", "/get-unit-availability-for-range/", [
                "methods"             => "POST",
                "callback"            => [$this, "get_unit_availability_for_range"],
                "permission_callback" => [$this, "get_unit_availability_for_range_permission"],
            ] );
            register_rest_route( "webba-booking/v1", "/get-closest-intervals-for-range/", [
                "methods"             => "POST",
                "callback"            => [$this, "get_closest_intervals_for_range"],
                "permission_callback" => [$this, "get_closest_intervals_for_range_permission"],
            ] );
            register_rest_route( "webba-booking/v1", "/get-form-fields", [
                "methods"             => "GET",
                "callback"            => [$this, "get_form_fields"],
                "permission_callback" => [$this, "get_form_fields_permission"],
            ] );
            register_rest_route( "webba-booking/v1", "/get-payment-methods", [
                "methods"             => "GET",
                "callback"            => [$this, "get_payment_methods"],
                "permission_callback" => [$this, "get_payment_methods_permission"],
            ] );
            register_rest_route( "webba-booking/v1", "/create-booking", [
                "methods"             => "POST",
                "callback"            => [$this, "create_booking"],
                "permission_callback" => [$this, "create_booking_permission"],
            ] );
            register_rest_route( "webba-booking/v1", "/calculate-amounts/", [
                "methods"             => "POST",
                "callback"            => [$this, "calculate_amounts_rest"],
                "permission_callback" => "__return_true",
            ] );
            register_rest_route( "webba-booking/v1", "/execute-paypal-payment", [
                "methods"             => "POST",
                "callback"            => [$this, "execute_paypal_payment"],
                "permission_callback" => [$this, "execute_paypal_payment_permission"],
            ] );
            register_rest_route( "webba-booking/v1", "/mollie-webhook", [
                "methods"             => "POST",
                "callback"            => [$this, "mollie_webhook"],
                "permission_callback" => "__return_true",
            ] );
            register_rest_route( "webba-booking/v1", "/execute-mollie-payment", [
                "methods"             => "POST",
                "callback"            => [$this, "execute_mollie_payment"],
                "permission_callback" => [$this, "execute_mollie_payment_permission"],
            ] );
            register_rest_route( "webba-booking/v1", "/execute-stripe-payment", [
                "methods"             => "POST",
                "callback"            => [$this, "execute_stripe_payment"],
                "permission_callback" => [$this, "execute_stripe_payment_permission"],
            ] );
            register_rest_route( "webba-booking/v1", "/execute-square-payment", [
                "methods"             => "POST",
                "callback"            => [$this, "execute_square_payment"],
                "permission_callback" => [$this, "execute_square_payment_permission"],
            ] );
            register_rest_route( "webba-booking/v1", "/booking-action", [
                "methods"             => "POST",
                "callback"            => [$this, "booking_action"],
                "permission_callback" => [$this, "booking_action_permission"],
            ] );
            register_rest_route( "webba-booking/v1", "/initialize-payment-method", [
                "methods"             => "POST",
                "callback"            => [$this, "initialize_payment_method"],
                "permission_callback" => [$this, "initialize_payment_method_permission"],
            ] );
            register_rest_route( "wbk/v2", "/send-test-email/", [
                "methods"             => "POST",
                "callback"            => [$this, "send_test_email"],
                "permission_callback" => [$this, "send_test_email_permission"],
            ] );
            register_rest_route( "wbk/v2", "/send-test-smtp/", [
                "methods"             => "POST",
                "callback"            => [$this, "send_test_smtp"],
                "permission_callback" => [$this, "send_test_smtp_permission"],
            ] );
            register_rest_route( "wbk/v2", "/send-test-zapier/", [
                "methods"             => "POST",
                "callback"            => [$this, "send_test_zapier"],
                "permission_callback" => [$this, "send_test_zapier_permission"],
            ] );
            register_rest_route( "wbk/v2", "/whatsapp-templates/", [
                "methods"             => "GET",
                "callback"            => [$this, "get_whatsapp_templates"],
                "permission_callback" => [$this, "whatsapp_templates_permission"],
            ] );
            register_rest_route( "wbk/v2", "/whatsapp-templates/create/", [
                "methods"             => "POST",
                "callback"            => [$this, "create_whatsapp_template"],
                "permission_callback" => [$this, "whatsapp_templates_permission"],
            ] );
            register_rest_route( "wbk/v2", "/whatsapp-templates/update/", [
                "methods"             => "POST",
                "callback"            => [$this, "update_whatsapp_template"],
                "permission_callback" => [$this, "whatsapp_templates_permission"],
            ] );
            register_rest_route( "wbk/v2", "/whatsapp-validate-token/", [
                "methods"             => "POST",
                "callback"            => [$this, "validate_whatsapp_token"],
                "permission_callback" => [$this, "whatsapp_templates_permission"],
            ] );
            register_rest_route( "wbk/v2", "/whatsapp-auth-data/", [
                "methods"             => "GET",
                "callback"            => [$this, "get_whatsapp_auth_data"],
                "permission_callback" => [$this, "whatsapp_templates_permission"],
            ] );
            register_rest_route( "wbk/v2", "/remove-whatsapp-auth/", [
                "methods"             => "POST",
                "callback"            => [$this, "remove_whatsapp_auth"],
                "permission_callback" => [$this, "whatsapp_templates_permission"],
            ] );
            register_rest_route( "wbk/v2", "/push/config", [
                "methods"             => "GET",
                "callback"            => [$this, "get_push_config"],
                "permission_callback" => [$this, "push_subscribe_permission"],
            ] );
            register_rest_route( "wbk/v2", "/push/subscribe", [
                "methods"             => "POST",
                "callback"            => [$this, "save_push_subscription"],
                "permission_callback" => [$this, "push_subscribe_permission"],
            ] );
            register_rest_route( "wbk/v2", "/push/unsubscribe", [
                "methods"             => "POST",
                "callback"            => [$this, "delete_push_subscription"],
                "permission_callback" => [$this, "push_subscribe_permission"],
            ] );
            register_rest_route( "wbk/v2", "/push/test", [
                "methods"             => "POST",
                "callback"            => [$this, "send_test_push"],
                "permission_callback" => [$this, "send_test_push_permission"],
            ] );
            register_rest_route( "webba-booking/v1", "/get-timezones/", [
                "methods"             => "GET",
                "callback"            => [$this, "get_timezones"],
                "permission_callback" => "__return_true",
            ] );
            register_rest_route( "wbk/v2", "/save-options/", [
                "methods"             => "POST",
                "callback"            => [$this, "save_options"],
                "permission_callback" => [$this, "save_options_permission"],
            ] );
            register_rest_route( "wbk/v2", "/get-options/", [
                "methods"             => "GET",
                "callback"            => [$this, "get_options"],
                "permission_callback" => [$this, "get_options_permission"],
            ] );
            register_rest_route( "wbk/v2", "/remove-zoom-auth/", [
                "methods"             => "POST",
                "callback"            => [$this, "remove_zoom_auth"],
                "permission_callback" => [$this, "remove_zoom_auth_permission"],
            ] );
            register_rest_route( "wbk/v2", "update-user-calendar/", [
                "methods"             => "POST",
                "callback"            => [$this, "update_user_calendar"],
                "permission_callback" => [$this, "update_user_calendar_permission"],
            ] );
            register_rest_route( "webba-booking/v1", "/get-unit-availability-date-ranges/", [
                "methods"             => "GET",
                "callback"            => [$this, "get_unit_availability_date_ranges"],
                "permission_callback" => [$this, "get_unit_availability_date_ranges_permission"],
            ] );
            register_rest_route( "wbk/v2", "/get-time-slots", [
                "methods"             => "GET",
                "callback"            => [$this, "get_time_slots"],
                "permission_callback" => [$this, "get_time_slots_permission"],
            ] );
            register_rest_route( "wbk/v2", "/reset-all-data/", [
                "methods"             => "POST",
                "callback"            => ["WBK_Reset_All_Data", "handle_rest_reset"],
                "permission_callback" => ["WBK_Reset_All_Data", "rest_permission"],
            ] );
            register_rest_route( "wbk/v2", "/assistance/reset/", [
                "methods"             => "POST",
                "callback"            => ["WBK_Reset_All_Data", "handle_rest_reset"],
                "permission_callback" => ["WBK_Reset_All_Data", "rest_permission"],
            ] );
        } );
        add_action( "wp_ajax_wbk_report_error", [$this, "wbk_report_error"] );
        add_action( "wp_ajax_nopriv_wbk_report_error", [$this, "wbk_report_error"] );
        add_action( "wp_ajax_wbk_backend_hide_notice", [$this, "wbk_backend_hide_notice"] );
    }

    /**
     * Process payment method for booking IDs and return response data
     *
     * @param array $booking_ids Array of booking IDs
     * @param string $payment_method Payment method (paypal, stripe, woocommerce, arrival, bank)
     * @param array $params Additional parameters (like services for stripe)
     * @param array $payment_details Payment details from WBK_Price_Processor
     * @return array Response data for the payment method
     */
    private function process_payment_method(
        $booking_ids,
        $payment_method,
        $params = [],
        $payment_details = []
    ) {
        $response_data = [];
        switch ( $payment_method ) {
            case "paypal":
                break;
            case "mollie":
                break;
            case "stripe":
            case "google_pay":
            case "apple_pay":
            case "stripe_others":
                break;
            case "woocommerce":
                break;
            case "arrival":
                foreach ( $booking_ids as $booking_id ) {
                    $booking = new WBK_Booking($booking_id);
                    if ( !$booking->is_loaded() ) {
                        continue;
                    }
                    $booking->set( "payment_method", "Pay on arrival" );
                    $booking->save();
                }
                if ( get_option( "wbk_email_customer_paymentrcvd_payonarrival_status", "" ) == "true" ) {
                    WBK_Email_Processor::send( $booking_ids, "payment" );
                }
                $response_data["payment_required"] = false;
                $response_data["message"] = get_option( "wbk_pay_on_arrival_message", "" );
                $response_data["payment_details"] = $payment_details;
                break;
            case "bank":
                foreach ( $booking_ids as $booking_id ) {
                    $booking = new WBK_Booking($booking_id);
                    if ( !$booking->is_loaded() ) {
                        continue;
                    }
                    $booking->set( "payment_method", "Bank transfer" );
                    $booking->save();
                }
                $response_data["payment_required"] = false;
                $response_data["message"] = get_option( "wbk_bank_transfer_message", "" );
                $response_data["payment_details"] = $payment_details;
                break;
            case "square":
                break;
            default:
                $response_data["payment_required"] = false;
                break;
        }
        return $response_data;
    }

    function login( $request ) {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        $params = $request->get_json_params();
        $credentials = [
            "user_login"    => $params["username"],
            "user_password" => $params["password"],
            "remember"      => true,
        ];
        $user = wp_signon( $credentials );
        if ( is_wp_error( $user ) ) {
            return new WP_Error("invalid_login", "Invalid username or password.", [
                "status" => 403,
            ]);
        }
        wp_set_current_user( $user->ID );
        return new \WP_REST_Response([
            "token" => wp_create_nonce( "wp_rest" ),
            "user"  => $user->data,
        ], 200);
    }

    public function wbk_csv_export_permission() {
        return true;
    }

    public function get_wp_users_permission( $request ) {
        return true;
    }

    public function appointments_status_change_permission( $request ) {
        $table = sanitize_text_field( $request["table"] );
        if ( false === WbkData()->tables->get_element_at( $table ) ) {
            return false;
        }
        if ( is_numeric( $request["row_id"] ) ) {
            return WbkData()->tables->get_element_at( $table )->current_user_can_update();
        }
        return WbkData()->tables->get_element_at( $table )->current_user_can_add();
    }

    public function resend_email( $request ) {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        $booking_id = sanitize_text_field( $request["id"] );
        $error_status = false;
        $error_messages = [];
        if ( !WBK_Validator::check_integer( $booking_id, 1, 2758537351 ) ) {
            $error_status = true;
            $error_messages[] = "Wrong booking id.";
        }
        $booking = new WBK_Booking($booking_id);
        if ( !$booking->is_loaded() ) {
            $error_status = true;
            $error_messages[] = "Unable to open booking.";
        }
        $action = sanitize_text_field( $request["notification_type"] );
        $actions = [
            "booking_created_by_customer",
            "booking_paid",
            "booking_approved",
            "booking_finished"
        ];
        if ( !in_array( $action, $actions ) ) {
            $error_status = true;
            $error_messages[] = "Wrong notification type.";
        }
        if ( $error_status ) {
            $response = new \WP_REST_Response([
                "message" => implode( ",", $error_messages ) . ".",
            ]);
            $response->set_status( 400 );
            return $response;
        }
        WBK_Email_Processor::send( [$booking_id], $action, true );
        $response = new \WP_REST_Response([
            "message" => __( "Email sent", "webba-booking-lite" ),
        ]);
        $response->set_status( 200 );
        return $response;
    }

    public function get_wp_users( $request ) {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        $data = [
            "none_admin_users" => WBK_User_Utils::get_none_admin_wp_users(),
        ];
        $response = new \WP_REST_Response($data);
        $response->set_status( 200 );
        return $response;
    }

    public function appointments_status_change( $request ) {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        $table = trim( sanitize_text_field( $request["table"] ) );
        $row_id = trim( sanitize_text_field( $request["row_id"] ) );
        $status = trim( sanitize_text_field( $request["status"] ) );
        if ( false === WbkData()->tables->get_element_at( $table ) ) {
            $response = new \WP_REST_Response();
            $response->set_status( 400 );
            return $response;
        }
        global $wpdb;
        $table = WbkData()->tables->get_element_at( $table );
        $table_name = $table->get_table_name();
        $wpdb->update( $table_name, [
            "status" => $status,
        ], [
            "id" => $row_id,
        ] );
        $bf = new WBK_Booking_Factory();
        $bf->update( $row_id );
        $response = new \WP_REST_Response();
        $response->set_status( 200 );
        return $response;
    }

    public function get_service_list() {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        $services = WBK_Model_Utils::get_services();
        $html = "";
        foreach ( $services as $id => $service ) {
            $html .= '<option value="' . $id . '">' . $service . "</option>";
        }
        $data = [
            "html" => $html,
        ];
        $response = new \WP_REST_Response($data);
        $response->set_status( 200 );
        return $response;
    }

    public function get_service_list_permission( $request ) {
        $table = sanitize_text_field( $request["table"] );
        return WbkData()->tables->get_element_at( $table )->current_user_can_add();
    }

    /**
     * function CSV export
     * @return null
     */
    public function wbk_csv_export( $request ) {
        if ( !WBK_Feature_Gate::have_required_plan( "standard" ) ) {
            return new \WP_REST_Response([
                "error" => "You need to upgrade to a premium plan to export CSV.",
            ], 403);
        }
        WBK_Translation_Processor::switch_to_locale_from_get_param();
    }

    /**
     * Calculate discount amount from coupon or gift card code
     *
     * @param string $coupon Coupon or gift card code
     * @param float $amount Amount to apply discount to
     * @param array $service_ids Array of service IDs for validation
     * @return float Discount amount
     */
    private function calculate_coupon_discount( $coupon, $amount, $service_ids ) {
        if ( empty( $coupon ) || empty( $service_ids ) || $amount <= 0 ) {
            return 0;
        }
        $coupon = esc_html( sanitize_text_field( trim( $coupon ) ) );
        $service_ids = array_unique( $service_ids );
        $coupon_result = WBK_Validator::check_coupon_or_gift_card( $coupon, $service_ids );
        if ( !is_array( $coupon_result ) ) {
            return 0;
        }
        // Apply coupon discount
        if ( $coupon_result[2] == 100 ) {
            // 100% discount
            return $amount;
        } else {
            // Partial discount
            if ( $coupon_result[2] > 0 ) {
                // Percentage discount
                return $amount * $coupon_result[2] / 100;
            } elseif ( $coupon_result[1] > 0 ) {
                $fixed = (float) $coupon_result[1];
                if ( isset( $coupon_result[3] ) && $coupon_result[3] === "gift_card" ) {
                    return min( $fixed, $amount );
                }
                return $fixed;
            }
        }
        return 0;
    }

    /**
     * REST API endpoint for calculating amounts.
     *
     * Exactly one mode per request: services (`places` non-empty, no `unit_bookings`)
     * or units (`unit_bookings` non-empty, `places` empty). Response matches get_payment_items().
     *
     * For each unit row, `number_of_people` is optional; when sent it must be an attendee object
     * (e.g. `adult` / `child` / `infant` counts), never a scalar number.
     *
     * Unit responses also include `unit_breakdowns`: an array of `breakdown` objects from
     * get_availability_for_range, in the same order as `unit_bookings`.
     *
     * Optional `ordered_extras`: map of extra ID => quantity (order-level, not per timeslot).
     * Do not send a separate `extras` array; it is ignored. Use `ordered_extras` only.
     * Each extra must be allowed on every service or unit in the quote (intersection of configured extras).
     * Extra line amounts increase `subtotal` and are taxed like other items. Response may include
     * `ordered_extras` and `ordered_extras_subtotal` when any extras apply.
     *
     * @param WP_REST_Request $request Request object
     * @return WP_REST_Response Response object
     */
    public function calculate_amounts_rest( $request ) {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
        $params = $request->get_params();
        $places = ( isset( $params["places"] ) && is_array( $params["places"] ) ? $params["places"] : [] );
        $unit_bookings_raw = ( isset( $params["unit_bookings"] ) ? $params["unit_bookings"] : [] );
        $extra_data = ( isset( $params["extra"] ) ? stripslashes( $params["extra"] ) : "" );
        if ( !is_array( $unit_bookings_raw ) ) {
            return new WP_REST_Response([
                "error" => "Invalid unit_bookings",
            ], 400);
        }
        $unit_bookings = [];
        foreach ( $unit_bookings_raw as $row ) {
            if ( !is_array( $row ) ) {
                return new WP_REST_Response([
                    "error" => "Invalid unit_bookings entry",
                ], 400);
            }
            $unit_bookings[] = $row;
        }
        $has_units = !empty( $unit_bookings );
        $has_places = !empty( $places );
        if ( !$has_units && !$has_places ) {
            return new WP_REST_Response([
                "error" => "Provide places (services) or unit_bookings (units)",
            ], 400);
        }
        if ( $has_units && $has_places ) {
            return new WP_REST_Response([
                "error" => "Service and unit quotes cannot be combined",
            ], 400);
        }
        $pay_full_amount = isset( $params["pay_full_amount"] ) && ($params["pay_full_amount"] === true || $params["pay_full_amount"] === "true" || $params["pay_full_amount"] === 1);
        $service_ids = [];
        if ( $has_units ) {
            if ( count( $unit_bookings ) > 60 ) {
                return new WP_REST_Response([
                    "error" => "Too many bookings",
                ], 400);
            }
            $coupon_result = null;
            if ( isset( $params["coupon"] ) && !empty( trim( $params["coupon"] ) ) ) {
                $coupon_result = WBK_Validator::check_coupon_or_gift_card( $params["coupon"], [] );
                if ( $coupon_result === false ) {
                    $coupon_result = null;
                }
            }
            $payment_data = WBK_Price_Processor::get_unit_payment_items( $unit_bookings, $coupon_result, $pay_full_amount );
            if ( $payment_data === -4 ) {
                return new WP_REST_Response([
                    "error" => "Invalid booking data",
                ], 400);
            }
            $stripe_scope_ids = ( isset( $payment_data["unit_ids"] ) && is_array( $payment_data["unit_ids"] ) ? $payment_data["unit_ids"] : [] );
            $stripe_init_service_id = ( isset( $params["service_id"] ) ? $params["service_id"] : 0 );
        } else {
            $services = ( isset( $params["services"] ) ? $params["services"] : [] );
            foreach ( $services as $service_this ) {
                if ( !WBK_Validator::check_integer( $service_this, 1, 2758537351 ) ) {
                    return new WP_REST_Response([
                        "error" => "Invalid service ID",
                    ], 400);
                }
            }
            $times = [];
            $booking_services = [];
            $quantities = [];
            $staff_members = [];
            foreach ( $places as $service_id => $slots ) {
                if ( !WBK_Validator::check_integer( $service_id, 1, 2758537351 ) ) {
                    return new WP_REST_Response([
                        "error" => "Invalid service ID: " . $service_id,
                    ], 400);
                }
                if ( !is_array( $slots ) ) {
                    return new WP_REST_Response([
                        "error" => "Invalid slots data for service: " . $service_id,
                    ], 400);
                }
                foreach ( $slots as $slot ) {
                    if ( !isset( $slot["time"] ) || !isset( $slot["quantity"] ) ) {
                        return new WP_REST_Response([
                            "error" => "Missing time or quantity in slot",
                        ], 400);
                    }
                    $time = $slot["time"];
                    $quantity = $slot["quantity"];
                    if ( !is_numeric( $time ) || !WBK_Validator::check_integer( $quantity, 1, 2758537351 ) ) {
                        return new WP_REST_Response([
                            "error" => "Invalid time or quantity",
                        ], 400);
                    }
                    $times[] = intval( $time );
                    $booking_services[] = intval( $service_id );
                    $quantities[] = intval( $quantity );
                    $staff_members[] = ( isset( $slot["staff_member_id"] ) ? intval( $slot["staff_member_id"] ) : null );
                }
            }
            $name = ( isset( $params["first_name"] ) && isset( $params["last_name"] ) ? sanitize_text_field( $params["first_name"] . " " . $params["last_name"] ) : "blank" );
            $desc = "";
            $phone = ( isset( $params["phone"] ) ? sanitize_text_field( $params["phone"] ) : "" );
            $bookings = [];
            for ($i = 0; $i < count( $times ); $i++) {
                $time = $times[$i];
                $service = $booking_services[$i];
                $quantity = $quantities[$i];
                if ( !is_numeric( $time ) || !is_numeric( $service ) || !is_numeric( $quantity ) ) {
                    return new WP_REST_Response([
                        "error" => "Invalid parameters",
                    ], 400);
                }
                $day = strtotime( date( "Y-m-d", $time ) . " 00:00:00" );
                $booking = new WBK_Booking(null);
                $booking->set_parameters(
                    $day,
                    $time,
                    $service,
                    $quantity,
                    $name,
                    $phone,
                    $desc,
                    $extra_data
                );
                if ( isset( $staff_members[$i] ) && $staff_members[$i] !== null ) {
                    $booking->set_staff_member( $staff_members[$i] );
                }
                $bookings[] = $booking;
            }
            if ( count( $bookings ) > 60 ) {
                return new WP_REST_Response([
                    "error" => "Too many bookings",
                ], 400);
            }
            $service_ids = [];
            foreach ( $bookings as $booking ) {
                $service_ids[] = $booking->get_service();
            }
            $service_ids = array_unique( $service_ids );
            $coupon_result = null;
            if ( isset( $params["coupon"] ) && !empty( trim( $params["coupon"] ) ) ) {
                $coupon_result = WBK_Validator::check_coupon_or_gift_card( $params["coupon"], $service_ids );
                if ( $coupon_result === false ) {
                    $coupon_result = null;
                }
            }
            $payment_data = WBK_Price_Processor::get_payment_items(
                $bookings,
                0,
                $coupon_result,
                false,
                $pay_full_amount
            );
            if ( $payment_data === -4 ) {
                return new WP_REST_Response([
                    "error" => "Invalid booking data",
                ], 400);
            }
            $stripe_scope_ids = $service_ids;
            $stripe_init_service_id = $params["service_id"];
        }
        $ordered_extras_param = ( isset( $params["ordered_extras"] ) ? $params["ordered_extras"] : null );
        if ( $ordered_extras_param !== null && $ordered_extras_param !== "" && $ordered_extras_param !== [] ) {
            if ( $has_units ) {
                $allowed_extra_ids = WBK_Price_Processor::collect_allowed_extra_ids_for_units( $unit_bookings );
                $extras_tax_mode = "units";
            } else {
                $allowed_extra_ids = WBK_Price_Processor::collect_allowed_extra_ids_for_services( $service_ids );
                $extras_tax_mode = "services";
            }
            $extras_parse = WBK_Price_Processor::parse_ordered_extras_for_quote( $ordered_extras_param, $allowed_extra_ids );
            if ( !empty( $extras_parse["error"] ) ) {
                return new WP_REST_Response([
                    "error" => $extras_parse["error"],
                ], 400);
            }
            if ( !empty( $extras_parse["lines"] ) ) {
                WBK_Price_Processor::apply_ordered_extras_to_payment_data( $payment_data, $extras_parse["lines"], $extras_tax_mode );
            }
        }
        $stripe_payment_methods = [
            "stripe",
            "stripe_others",
            "google_pay",
            "apple_pay"
        ];
        if ( isset( $params["payment_method"] ) && in_array( $params["payment_method"], $stripe_payment_methods ) ) {
            $payment_data["email"] = $params["email"] ?? "";
            $should_generate_stripe_intent = !isset( $params["generate_stripe_intent"] ) || $params["generate_stripe_intent"] === true || $params["generate_stripe_intent"] === "true" || $params["generate_stripe_intent"] === 1;
            $existing_stripe_amount = ( isset( $params["stripe_details"]["amount"] ) ? floatval( $params["stripe_details"]["amount"] ) : null );
            $stripe_amount_changed = $existing_stripe_amount === null || abs( $existing_stripe_amount - floatval( $payment_data["to_pay_total"] ) ) > 0.008999999999999999;
            if ( $should_generate_stripe_intent && $payment_data["to_pay_total"] > 0 && (!isset( $params["stripe_details"] ) || $params["stripe_details"]["service_ids"] !== $stripe_scope_ids || ($params["stripe_details"]["coupon_id"] ?? null) !== ($params["coupon"] ?? null) || $params["stripe_details"]["payment_method"] !== $params["payment_method"] || $stripe_amount_changed) && !empty( $params["email"] ) && filter_var( $params["email"], FILTER_VALIDATE_EMAIL ) ) {
                $stripe = new WBK_Stripe();
                $stripe->init( $stripe_init_service_id );
                $intent_data = $stripe->create_payment_intent( $params["payment_method"], $params["email"], $payment_data );
                if ( $intent_data["success"] ) {
                    $payment_data["stripe_details"]["client_secret"] = $intent_data["client_secret"];
                    $payment_data["stripe_details"]["intent_id"] = $intent_data["intent_id"];
                    $payment_data["stripe_details"]["amount"] = $payment_data["to_pay_total"];
                    $payment_data["stripe_details"]["service_ids"] = $stripe_scope_ids;
                    $payment_data["stripe_details"]["coupon_id"] = $params["coupon"];
                    $payment_data["stripe_details"]["payment_method"] = $params["payment_method"];
                } else {
                    $payment_data["stripe_details"]["error"] = $intent_data["error"];
                }
            } elseif ( isset( $params["stripe_details"] ) && !isset( $params["stripe_details"]["error"] ) ) {
                $payment_data["stripe_details"] = $params["stripe_details"];
            } elseif ( !$should_generate_stripe_intent ) {
                unset($payment_data["stripe_details"]);
            } else {
                unset($payment_data["stripe_details"]);
            }
        }
        if ( isset( $params["payment_method"] ) && $params["payment_method"] === "square" ) {
            $square = new WBK_Square();
            if ( $square->init( $stripe_init_service_id ) ) {
                $square_frontend = $square->get_frontend_details();
                $payment_data["square_details"] = array_merge( $square_frontend, [
                    "amount"      => $payment_data["to_pay_total"],
                    "service_ids" => $stripe_scope_ids,
                    "coupon_id"   => $params["coupon"] ?? "",
                ] );
            } else {
                $payment_data["square_details"] = [
                    "error" => __( "Square is not configured", "webba-booking-lite" ),
                ];
            }
        }
        if ( isset( $payment_data["item_names"] ) ) {
            unset($payment_data["item_names"]);
        }
        return new WP_REST_Response($payment_data, 200);
    }

    public function wbk_backend_hide_notice() {
        $notice = sanitize_text_field( $_POST["notice"] );
        if ( $notice == "wbk_show_go_preimum_1" ) {
            update_option( "wbk_show_go_preimum_1", "false" );
        }
        if ( !wp_verify_nonce( $_POST["nonce"], "wbkf_nonce" ) ) {
            wp_die();
            return;
        }
        if ( $notice == "wbk_after_setup_notice" ) {
            update_option( "wbk_sms_setup_required", "" );
            update_option( "wbk_payments_setup_required", "" );
            update_option( "wbk_google_setup_required", "" );
        }
        wp_die();
        return;
    }

    /**
     * REST endpoint for schedule tools lock/unlock.
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function schedule_tools_action_rest( WP_REST_Request $request ) : WP_REST_Response {
        $result = $this->process_schedule_tools_action( [
            "lock_action"   => $request->get_param( "lock_action" ),
            "lock_target"   => ( $request->get_param( "lock_target" ) ?: "dates" ),
            "date_range"    => $request->get_param( "date_range" ),
            "service"       => $request->get_param( "service" ),
            "category"      => $request->get_param( "category" ),
            "exclude_dates" => ( $request->get_param( "exclude_dates" ) ?: "" ),
            "days_of_week"  => $request->get_param( "days_of_week" ),
            "from"          => $request->get_param( "from" ),
            "to"            => $request->get_param( "to" ),
        ] );
        return new WP_REST_Response($result, 200);
    }

    /**
     * Permission for schedule tools bulk lock/unlock.
     *
     * @param WP_REST_Request $request
     * @return bool
     */
    public function schedule_tools_action_permission( $request ) : bool {
        if ( !is_user_logged_in() ) {
            return false;
        }
        if ( current_user_can( "manage_options" ) ) {
            return true;
        }
        $service_id = $request->get_param( "service" );
        if ( WBK_Validator::check_integer( $service_id, 1, 9999999 ) ) {
            return WBK_Validator::check_access_to_service( $service_id );
        }
        $category_id = $request->get_param( "category" );
        return WBK_Validator::check_integer( $category_id, 1, 9999999 );
    }

    /**
     * Permission for creating multiple bookings from the calendar.
     *
     * @param WP_REST_Request $request
     * @return bool
     */
    public function create_multiple_bookings_permission( $request ) : bool {
        if ( !is_user_logged_in() ) {
            return false;
        }
        if ( current_user_can( "manage_options" ) ) {
            return true;
        }
        $service_id = $request->get_param( "service_id" );
        if ( !WBK_Validator::check_integer( $service_id, 1, 9999999 ) ) {
            return false;
        }
        return WBK_Validator::check_access_to_service( $service_id );
    }

    /**
     * REST endpoint based on legacy wbk_create_multiple_bookings AJAX action.
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function create_multiple_bookings_rest( WP_REST_Request $request ) : WP_REST_Response {
        $result = $this->process_create_multiple_bookings( [
            "service_id" => $request->get_param( "service_id" ),
            "date"       => $request->get_param( "date" ),
            "name"       => $request->get_param( "name" ),
            "email"      => $request->get_param( "email" ),
            "phone"      => $request->get_param( "phone" ),
            "desc"       => $request->get_param( "desc" ),
            "quantity"   => $request->get_param( "quantity" ),
            "times"      => $request->get_param( "times" ),
            "status"     => $request->get_param( "status" ),
        ] );
        return new WP_REST_Response($result, 200);
    }

    /**
     * Shared processor for creating multiple bookings for selected time slots.
     *
     * @param array $data
     * @return array{status:int,message:string,booking_ids?:int[]}
     */
    private function process_create_multiple_bookings( array $data ) : array {
        global $wpdb;
        date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
        $service_id = ( isset( $data["service_id"] ) ? $data["service_id"] : null );
        $name = ( isset( $data["name"] ) ? sanitize_text_field( $data["name"] ) : "" );
        $email = ( isset( $data["email"] ) ? sanitize_email( $data["email"] ) : "" );
        $phone = ( isset( $data["phone"] ) ? sanitize_text_field( $data["phone"] ) : "" );
        $desc = ( isset( $data["desc"] ) ? sanitize_textarea_field( $data["desc"] ) : "" );
        $quantity = ( isset( $data["quantity"] ) ? absint( $data["quantity"] ) : 0 );
        $booking_status = ( isset( $data["status"] ) ? sanitize_text_field( $data["status"] ) : "pending" );
        $times = ( isset( $data["times"] ) ? $data["times"] : [] );
        if ( is_string( $times ) ) {
            $times = array_filter( array_map( "trim", explode( ",", $times ) ) );
        }
        if ( !is_array( $times ) ) {
            $times = [];
        }
        $times = array_values( array_filter( array_map( "intval", $times ), function ( $time ) {
            return $time > 0;
        } ) );
        if ( !WBK_Validator::validateId( $service_id, "wbk_services" ) || $name === "" || !is_email( $email ) || $quantity < 1 || empty( $times ) ) {
            date_default_timezone_set( "UTC" );
            return [
                "status"  => 0,
                "message" => __( "Please fill in all required fields.", "webba-booking-lite" ),
            ];
        }
        if ( !array_key_exists( $booking_status, WBK_Model_Utils::get_booking_status_list() ) ) {
            date_default_timezone_set( "UTC" );
            return [
                "status"  => 0,
                "message" => __( "Status error", "webba-booking-lite" ),
            ];
        }
        $service = new WBK_Service_deprecated();
        if ( !$service->setId( $service_id ) || !$service->load() ) {
            date_default_timezone_set( "UTC" );
            return [
                "status"  => 0,
                "message" => __( "Service not found.", "webba-booking-lite" ),
            ];
        }
        $appointment_ids = [];
        $duration = $service->getDuration();
        foreach ( $times as $time ) {
            $count = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM " . get_option( "wbk_db_prefix", "" ) . "wbk_appointments where service_id = %d and time = %d and " . WBK_Model_Utils::get_not_canclled_sql(), $service_id, $time ) );
            if ( $count > 0 && $service->getQuantity() == 1 ) {
                date_default_timezone_set( "UTC" );
                return [
                    "status"  => 0,
                    "message" => __( "Overbooking error", "webba-booking-lite" ),
                ];
            }
            $booking_data = [
                "name"             => $name,
                "email"            => $email,
                "phone"            => $phone,
                "time"             => $time,
                "service_id"       => $service_id,
                "duration"         => $duration,
                "description"      => $desc,
                "quantity"         => $quantity,
                "service_category" => 0,
                "time_offset"      => 0,
            ];
            $booking_factory = new WBK_Booking_Factory();
            $status = $booking_factory->build_from_array( $booking_data );
            if ( $status[0] == true ) {
                $appointment_ids[] = $status[1];
                $booking = new WBK_Booking($status[1]);
                $booking->set( "status", $booking_status );
                $booking->save();
            }
        }
        $booking_factory = new WBK_Booking_Factory();
        $booking_factory->post_production( $appointment_ids );
        date_default_timezone_set( "UTC" );
        return [
            "status"      => 1,
            "message"     => __( "Appointments added:", "webba-booking-lite" ) . " " . count( $appointment_ids ),
            "booking_ids" => $appointment_ids,
        ];
    }

    /**
     * Shared processor for schedule tools lock/unlock (dates and timeslots).
     *
     * @param array $data
     * @return array{status:int,message:string}
     */
    /**
     * Parse a schedule-tools date string as midnight in the business timezone.
     *
     * @param string       $date_str
     * @param DateTimeZone $timezone
     * @return int|false Unix timestamp or false on failure
     */
    private function parse_schedule_tools_date( string $date_str, DateTimeZone $timezone ) {
        $date_str = trim( $date_str );
        if ( $date_str === "" ) {
            return false;
        }
        $formats = [
            "n/j/Y",
            "n/j/y",
            "m/d/Y",
            "m/d/y",
            "Y-m-d"
        ];
        foreach ( $formats as $format ) {
            $dt = DateTime::createFromFormat( "!" . $format, $date_str, $timezone );
            if ( $dt instanceof DateTime ) {
                $errors = DateTime::getLastErrors();
                $warning_count = ( is_array( $errors ) ? (int) ($errors["warning_count"] ?? 0) : 0 );
                $error_count = ( is_array( $errors ) ? (int) ($errors["error_count"] ?? 0) : 0 );
                if ( $warning_count === 0 && $error_count === 0 ) {
                    return $dt->getTimestamp();
                }
            }
        }
        try {
            $dt = new DateTime($date_str, $timezone);
            $dt->setTime( 0, 0, 0 );
            return $dt->getTimestamp();
        } catch ( Exception $e ) {
            return false;
        }
    }

    private function process_schedule_tools_action( array $data ) : array {
        global $wpdb;
        $timezone_string = get_option( "wbk_timezone", "UTC" );
        try {
            $wbk_timezone = new DateTimeZone($timezone_string);
        } catch ( Exception $e ) {
            $wbk_timezone = new DateTimeZone("UTC");
            $timezone_string = "UTC";
        }
        date_default_timezone_set( $timezone_string );
        if ( !isset( $data["lock_action"] ) ) {
            return [
                "status"  => 0,
                "message" => "Wrong action.",
            ];
        }
        if ( $data["lock_action"] != "lock" && $data["lock_action"] != "unlock" ) {
            return [
                "status"  => 0,
                "message" => "Wrong action target.",
            ];
        }
        $lock_action = sanitize_text_field( $data["lock_action"] );
        if ( !isset( $data["lock_target"] ) ) {
            return [
                "status"  => 0,
                "message" => "Wrong action target.",
            ];
        }
        if ( $data["lock_target"] != "dates" && $data["lock_target"] != "timeslots" ) {
            return [
                "status"  => 0,
                "message" => "Wrong action target.",
            ];
        }
        $lock_target = sanitize_text_field( $data["lock_target"] );
        $date_range = sanitize_text_field( $data["date_range"] ?? "" );
        $date_range = explode( " - ", $date_range );
        if ( !is_array( $date_range ) || count( $date_range ) != 2 ) {
            return [
                "status"  => 0,
                "message" => "Wrong date range.",
            ];
        }
        $start = $this->parse_schedule_tools_date( $date_range[0], $wbk_timezone );
        $end = $this->parse_schedule_tools_date( $date_range[1], $wbk_timezone );
        if ( $start === false || $end === false || $end < $start ) {
            return [
                "status"  => 0,
                "message" => "Wrong date range.",
            ];
        }
        $service_id = sanitize_text_field( $data["service"] ?? "" );
        $category_id = sanitize_text_field( $data["category"] ?? "" );
        if ( !is_numeric( $service_id ) && !is_numeric( $category_id ) ) {
            return [
                "status"  => 0,
                "message" => "Wrong service or category.",
            ];
        }
        $excluded_dates = [];
        $from = null;
        $to = null;
        if ( $lock_target == "timeslots" ) {
            $from = sanitize_text_field( $data["from"] ?? "" );
            $to = sanitize_text_field( $data["to"] ?? "" );
            if ( !WBK_Validator::check_integer( $from, 900, 85500 ) || !WBK_Validator::check_integer( $to, 0, 86400 ) ) {
                return [
                    "status"  => 0,
                    "message" => "Wrong time interval.",
                ];
            }
            if ( $from >= $to ) {
                return [
                    "status"  => 0,
                    "message" => "Wrong time interval.",
                ];
            }
        } else {
            $exclude_dates_raw = sanitize_text_field( $data["exclude_dates"] ?? "" );
            $excluded_dates_temp = [];
            if ( $exclude_dates_raw !== "" ) {
                foreach ( explode( ",", $exclude_dates_raw ) as $date ) {
                    $parsed_exclude = $this->parse_schedule_tools_date( trim( $date ), $wbk_timezone );
                    if ( $parsed_exclude !== false ) {
                        $excluded_dates_temp[] = $parsed_exclude;
                    }
                }
            }
            $excluded_dates = $excluded_dates_temp;
        }
        $days_of_week_raw = $data["days_of_week"] ?? "";
        if ( is_array( $days_of_week_raw ) ) {
            $days_of_week = array_map( "strval", $days_of_week_raw );
        } else {
            $days_of_week = explode( ",", (string) $days_of_week_raw );
        }
        $days_of_week = array_values( array_filter( array_map( "trim", $days_of_week ), "strlen" ) );
        if ( !is_array( $days_of_week ) ) {
            return [
                "status"  => 0,
                "message" => "Wrong days of the week.",
            ];
        }
        if ( count( $days_of_week ) == 0 || count( $days_of_week ) > 7 ) {
            return [
                "status"  => 0,
                "message" => "Wrong days of the week.",
            ];
        }
        foreach ( $days_of_week as $day_of_week ) {
            if ( !WBK_Validator::check_integer( $day_of_week, 1, 7 ) ) {
                return [
                    "status"  => 0,
                    "message" => "Wrong days of the week.",
                ];
            }
        }
        $total_locked = 0;
        $arr_service_ids = [$service_id];
        if ( $category_id != -1 ) {
            if ( WBK_Validator::check_integer( $category_id, 1, 999999 ) ) {
                $arr_service_ids = WBK_Model_Utils::get_services_in_category( $category_id );
            }
        }
        if ( !is_array( $arr_service_ids ) || count( $arr_service_ids ) === 0 ) {
            date_default_timezone_set( "UTC" );
            return [
                "status"  => 0,
                "message" => "Wrong service or category.",
            ];
        }
        $sp = new WBK_Schedule_Processor();
        $sp->load_data();
        foreach ( $arr_service_ids as $service_id ) {
            if ( !current_user_can( "manage_options" ) ) {
                if ( !WBK_Validator::check_access_to_service( $service_id ) ) {
                    date_default_timezone_set( "UTC" );
                    return [
                        "status"  => 0,
                        "message" => "Unauthorised access.",
                    ];
                }
            }
            $service = new WBK_Service($service_id);
            if ( !$service->is_loaded() ) {
                continue;
            }
            $curent_day = $start;
            while ( $curent_day <= $end ) {
                if ( !in_array( date( "N", $curent_day ), $days_of_week ) ) {
                    $curent_day = strtotime( "tomorrow", $curent_day );
                    continue;
                }
                if ( is_array( $excluded_dates ) && in_array( $curent_day, $excluded_dates ) ) {
                    $curent_day = strtotime( "tomorrow", $curent_day );
                    continue;
                }
                if ( $lock_target == "dates" ) {
                    if ( $wpdb->query( $wpdb->prepare( "DELETE FROM " . get_option( "wbk_db_prefix", "" ) . "wbk_days_on_off WHERE day = %d and service_id = %d", $curent_day, $service_id ) ) === false ) {
                        date_default_timezone_set( "UTC" );
                        return [
                            "status"  => 0,
                            "message" => "Internal database error.",
                        ];
                    } else {
                        $total_locked++;
                    }
                    if ( $lock_action == "lock" ) {
                        $status = 0;
                    } else {
                        $status = 1;
                    }
                    if ( $wpdb->insert( get_option( "wbk_db_prefix", "" ) . "wbk_days_on_off", [
                        "service_id" => $service_id,
                        "day"        => $curent_day,
                        "status"     => $status,
                    ], ["%d", "%d", "%d"] ) === false ) {
                        date_default_timezone_set( "UTC" );
                        return [
                            "status"  => 0,
                            "message" => "Internal database error.",
                        ];
                    }
                    $curent_day = strtotime( "tomorrow", $curent_day );
                    continue;
                }
                // Resolve from/to against midnight in the business timezone explicitly.
                // Avoid relying solely on date_default_timezone_set(), which can stay on UTC
                // in some REST/runtime environments and shift locks by the TZ offset.
                $day_ymd = ( new DateTime("@" . $curent_day) )->setTimezone( $wbk_timezone )->format( "Y-m-d" );
                $day_midnight = new DateTime($day_ymd . " 00:00:00", $wbk_timezone);
                $day_time_start = WBK_Time_Math_Utils::adjust_times( $day_midnight->getTimestamp(), (int) $from, $timezone_string );
                $day_time_end = WBK_Time_Math_Utils::adjust_times( $day_midnight->getTimestamp(), (int) $to, $timezone_string );
                $i = 1;
                $timeslots = $sp->get_time_slots_by_day( $curent_day, $service_id, [
                    "skip_gg_calendar"       => true,
                    "ignore_preparation"     => true,
                    "calculate_availability" => false,
                ] );
                foreach ( $timeslots as $timeslot ) {
                    if ( $timeslot->get_start() < $day_time_start || $timeslot->get_start() > $day_time_end ) {
                        continue;
                    }
                    if ( $wpdb->query( $wpdb->prepare( "DELETE FROM " . get_option( "wbk_db_prefix", "" ) . "wbk_locked_time_slots WHERE time = %d and service_id = %d", $timeslot->get_start(), $service_id ) ) === false ) {
                        date_default_timezone_set( "UTC" );
                        return [
                            "status"  => 0,
                            "message" => "Internal database error.",
                        ];
                    } else {
                        $total_locked++;
                    }
                    if ( $lock_action == "lock" ) {
                        if ( $wpdb->insert( get_option( "wbk_db_prefix", "" ) . "wbk_locked_time_slots", [
                            "service_id" => $service_id,
                            "time"       => $timeslot->get_start(),
                        ], ["%d", "%d"] ) === false ) {
                            date_default_timezone_set( "UTC" );
                            return [
                                "status"  => 0,
                                "message" => "Internal database error.",
                            ];
                        }
                    }
                    $i++;
                }
                $curent_day = strtotime( "tomorrow", $curent_day );
            }
        }
        date_default_timezone_set( "UTC" );
        if ( $lock_action == "lock" ) {
            return [
                "status"  => 1,
                "message" => __( "Total locked: ", "webba-booking-lite" ) . $total_locked,
            ];
        }
        return [
            "status"  => 1,
            "message" => __( "Total unlocked: ", "webba-booking-lite" ) . $total_locked,
        ];
    }

    public function wbk_report_error() {
        wp_die();
        return;
        $headers = "From: " . stripslashes( get_option( "wbk_from_name" ) ) . " <" . get_option( "wbk_from_email" ) . ">" . "\r\n";
        $when_allowed = ["prepare_service_data"];
        $when = $_POST["when"];
        if ( !in_array( $when, $when_allowed ) ) {
            wp_die();
            return;
        }
        $post_details = $_POST["details"];
        if ( !is_array( $post_details ) || count( $post_details ) == 0 ) {
            wp_die();
            return;
        }
        $details = "Request: " . $when . "<br>Service: " . $post_details[0];
        $solution = '<br>For more information on troubleshooting please read the following article: <a href="https://webba-booking.com/documentaion/troubleshooting/hanging-after-service-selected/">Hanging when service selected</a>.';
        add_filter( "wp_mail_content_type", [$this, "set_email_content_type"] );
        wp_mail(
            get_bloginfo( "admin_email" ),
            "Problem with the Webba Booking plugin",
            "The Webba Booking plugin could not complete the request. <br><br>Details:<br> " . $details . "<br>" . $solution,
            $headers
        );
        remove_filter( "wp_mail_content_type", [$this, "set_email_content_type"] );
    }

    public function set_email_content_type() {
        return "text/html";
    }

    public function get_preset_permission( $request ) {
        return true;
    }

    public function login_permission( $request ) {
        return true;
    }

    public function get_user_bookings( $request ) {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        $current_user = wp_get_current_user();
        $bookings_ids = WBK_Model_Utils::get_bookings_by_customer_email( $current_user->user_email, !isset( $request["pastBookings"] ) && $request["pastBookings"] !== true );
        $bookings = [];
        foreach ( $bookings_ids as $booking_id ) {
            $booking_data = WBK_Model_Utils::get_booking_data( $booking_id );
            if ( $booking_data !== false ) {
                $bookings[] = $booking_data;
            }
        }
        $data = [
            "bookings" => $bookings,
        ];
        $response = new \WP_REST_Response($data, 200);
        $response->set_status( 200 );
        return $response;
    }

    public function get_user_bookings_permission( $request ) {
        return is_user_logged_in();
    }

    public function response_error( $error_message ) {
        $data = [
            "description" => $error_message,
        ];
        $response = new \WP_REST_Response($data);
        $response->set_status( 400 );
        return $response;
    }

    public function update_booking_permission( $request ) {
        if ( !isset( $request["booking"] ) || !ctype_digit( $request["booking"] ) ) {
            return false;
        }
        if ( current_user_can( "manage_options" ) ) {
            return true;
        }
        return WBK_Validator::is_booking_made_by_current_user( $request["booking"] );
    }

    public function update_booking( $request ) {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        if ( !isset( $request["booking"] ) || !ctype_digit( $request["booking"] ) ) {
            return $this->response_error( "Wrong booking passed." );
        }
        if ( !ctype_digit( $request["time"] ) ) {
            return $this->response_error( "Wrong time." );
        }
        $time = intval( $request["time"] );
        if ( $time < time() ) {
            return $this->response_error( "Wrong time." );
        }
        $booking = new WBK_Booking($request["booking"]);
        if ( $booking->is_loaded() ) {
            if ( class_exists( "WBK_Zapier" ) ) {
                WBK_Zapier::remember_booking_state( $booking->get_id() );
            }
            date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
            $booking->set( "time", $time );
            $booking->set( "day", strtotime( "midnight", $time ) );
            date_default_timezone_set( "UTC" );
            $booking->save();
            $bf = new WBK_Booking_Factory();
            $bf->update( $booking->get_id() );
            $data = [
                "booking" => WBK_Model_Utils::get_booking_data( $request["booking"] ),
            ];
            $response = new \WP_REST_Response($data, 200);
            $response->set_status( 200 );
            return $response;
        }
        return $this->response_error( "Something went wrong." );
    }

    public function delete_booking_permission( $request ) {
        if ( !isset( $request["booking"] ) || !ctype_digit( $request["booking"] ) ) {
            return false;
        }
        if ( current_user_can( "manage_options" ) ) {
            return true;
        }
        return WBK_Validator::is_booking_made_by_current_user( $request["booking"] );
    }

    public function delete_booking( $request ) {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        if ( !isset( $request["booking"] ) || !ctype_digit( $request["booking"] ) ) {
            return $this->response_error( "Wrong booking passed." );
        }
        $booking = new WBK_Booking($request["booking"]);
        if ( !$booking->is_loaded() ) {
            return $this->response_error( "Wrong booking passed." );
        }
        $buffer = get_option( "wbk_cancellation_buffer", "" );
        if ( $buffer != "" ) {
            if ( intval( $buffer ) > 0 ) {
                $buffer_point = intval( $booking->get_start() - intval( $buffer ) * 60 );
                if ( time() > $buffer_point ) {
                    return $this->response_error( __( 'This booking isn\'t eligible for cancellation.', "webba-booking-lite" ) );
                }
            }
        }
        $bf = new WBK_Booking_Factory();
        if ( $bf->destroy( $request["booking"], "customer" ) == false ) {
            return $this->response_error( "Something went wrong." );
        }
        return new \WP_REST_Response([
            "status" => "success",
        ], 200);
    }

    public function get_preset( $request ) {
        WBK_Mixpanel::track_event( "v51 react app: get preset", [] );
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        $services = WBK_Model_Utils::get_services();
        $services_arr = [];
        foreach ( $services as $id => $name ) {
            $service = new WBK_Service($id);
            if ( !$service->is_loaded() ) {
                continue;
            }
            $has_description = true;
            if ( strip_tags( $service->get_description() ) == "" ) {
                $has_description = false;
            }
            $business_hours = json_decode(
                $service->get_business_hours(),
                false,
                512,
                JSON_THROW_ON_ERROR
            );
            $business_days = [];
            try {
                if ( isset( $business_hours ) && is_array( $business_hours ) ) {
                    foreach ( $business_hours as $item ) {
                        if ( isset( $item->day_of_week ) ) {
                            $business_days[] = $item->day_of_week;
                        }
                    }
                    $business_days = array_unique( $business_days );
                }
            } catch ( Exception $e ) {
                $business_days = [];
            }
            $name = WBK_Translation_Processor::translate_string( "webba_service_" . $id, $name );
            $description = WBK_Translation_Processor::translate_string( "webba_service_description_" . $id, $service->get_description() );
            // Get locations for the service
            $locations = $service->get( "locations" );
            $locations_array = [];
            if ( !empty( $locations ) ) {
                $locations_decoded = json_decode( $locations );
                if ( is_array( $locations_decoded ) ) {
                    $locations_array = $locations_decoded;
                }
            }
            $service_extras_raw = $service->get( "extras" );
            $service_extra_ids = [];
            if ( !empty( $service_extras_raw ) ) {
                $service_extras_decoded = json_decode( $service_extras_raw );
                if ( !is_array( $service_extras_decoded ) ) {
                    $service_extras_decoded = json_decode( stripslashes( $service_extras_raw ) );
                }
                if ( is_array( $service_extras_decoded ) ) {
                    foreach ( $service_extras_decoded as $extra_id_item ) {
                        if ( $extra_id_item === null || $extra_id_item === "" ) {
                            continue;
                        }
                        $extra_id_int = (int) $extra_id_item;
                        if ( $extra_id_int > 0 ) {
                            $service_extra_ids[] = $extra_id_int;
                        }
                    }
                    $service_extra_ids = array_values( array_unique( $service_extra_ids ) );
                }
            }
            $recurring_intervals_raw = $service->get( "recurring_intervals" );
            $recurring_intervals = ["day", "week", "month"];
            if ( !empty( $recurring_intervals_raw ) ) {
                $recurring_intervals_decoded = json_decode( $recurring_intervals_raw );
                if ( !is_array( $recurring_intervals_decoded ) ) {
                    $recurring_intervals_decoded = json_decode( stripslashes( $recurring_intervals_raw ) );
                }
                if ( is_array( $recurring_intervals_decoded ) ) {
                    $recurring_intervals = array_values( array_filter( $recurring_intervals_decoded ) );
                }
            }
            $recurring_min_count = (int) $service->get( "recurring_min_appointments" );
            if ( $recurring_min_count < 1 ) {
                $recurring_min_count = 2;
            }
            $recurring_max_count = (int) $service->get( "recurring_max_appointments" );
            if ( $recurring_max_count < 1 ) {
                $recurring_max_count = 12;
            }
            $service_data = [
                "id"                        => $id,
                "value"                     => $id,
                "label"                     => $name,
                "payable"                   => $service->is_payable(),
                "description"               => $description,
                "has_description"           => $has_description,
                "business_days"             => $business_days,
                "duration"                  => $service->get_duration(),
                "image"                     => ( !empty( $service->get( "image" ) ) && $service->get( "image" ) ? wp_get_attachment_url( $service->get( "image" ) ) : false ),
                "price"                     => $service->get( "price" ),
                "min_quantity"              => $service->get_min_quantity(),
                "max_quantity"              => $service->get_max_quantity(),
                "min_slots"                 => $service->get( "multi_mode_low_limit" ),
                "max_slots"                 => $service->get( "multi_mode_limit" ),
                "consecutive_timeslots"     => $service->get( "consecutive_timeslots" ) === "yes",
                "group_booking"             => $service->get( "group_booking" ) === "yes",
                "limited_timeslot"          => $service->get( "limited_timeslot" ) === "yes",
                "locations"                 => $locations_array,
                "extra_ids"                 => $service_extra_ids,
                "staff_members"             => WBK_Model_Utils::get_staff_member_ids_by_service( $id ),
                "hide_price"                => $service->get_hide_price(),
                "recurring_booking_enabled" => $service->get( "recurring_booking_enabled" ) === "yes",
                "recurring_intervals"       => $recurring_intervals,
                "recurring_min_count"       => $recurring_min_count,
                "recurring_max_count"       => $recurring_max_count,
                "recurring_payment_mode"    => ( $service->get( "recurring_payment_mode" ) ?: "all" ),
            ];
            $services_arr[] = $service_data;
        }
        $service_categories = WBK_Model_Utils::get_service_categories();
        if ( $service_categories === null ) {
            $service_categories = [];
        }
        $categories_arr = [];
        foreach ( $service_categories as $id => $name ) {
            $name = WBK_Translation_Processor::translate_string( "webba_service_category_" . $id, $name );
            $category_services = WBK_Model_Utils::get_services_in_category( $id );
            $category_units = WBK_Model_Utils::get_units_in_category( $id );
            $category_data = [
                "id"       => $id,
                "name"     => $name,
                "services" => ( $category_services == false ? [] : array_map( "strval", $category_services ) ),
                "units"    => ( $category_units == false ? [] : array_map( "strval", $category_units ) ),
            ];
            $categories_arr[] = $category_data;
        }
        $user = false;
        if ( is_user_logged_in() ) {
            $current_user = wp_get_current_user();
            $user = $current_user->user_login;
            $current_user_email = $current_user->user_email;
        } else {
            $user = false;
            $current_user_email = "";
        }
        $coupons_enabled = get_option( "wbk_allow_coupons", "yes" ) === "yes";
        if ( !WBK_Feature_Gate::have_required_plan( "premium" ) ) {
            $coupons_enabled = false;
        }
        // Get locations data
        $location_ids = WBK_Model_Utils::get_location_ids();
        $locations_arr = [];
        foreach ( $location_ids as $location_id ) {
            $location = new WBK_Location($location_id);
            if ( !$location->is_loaded() ) {
                continue;
            }
            $name = WBK_Translation_Processor::translate_string( "webba_location_" . $location_id, $location->get_name() );
            $description = WBK_Translation_Processor::translate_string( "webba_location_description_" . $location_id, $location->get_description() );
            $location_data = [
                "id"          => $location_id,
                "value"       => $location_id,
                "label"       => $name,
                "description" => $description,
            ];
            $locations_arr[] = $location_data;
        }
        // Get staff members data
        $staff_member_ids = WBK_Model_Utils::get_staff_member_ids();
        $staff_members_arr = [];
        foreach ( $staff_member_ids as $staff_member_id ) {
            $staff_member = new WBK_Staff_Member($staff_member_id);
            if ( !$staff_member->is_loaded() ) {
                continue;
            }
            $name = $staff_member->get_name();
            $photo = $staff_member->get_photo();
            $services = $staff_member->get_services();
            $locations = $staff_member->get_locations();
            $staff_member_data = [
                "id"                  => $staff_member_id,
                "value"               => $staff_member_id,
                "label"               => $name,
                "photo"               => ( !empty( $photo ) && $photo ? wp_get_attachment_url( $photo ) : false ),
                "services"            => $services,
                "locations"           => $locations,
                "wordpress_user"      => $staff_member->get( "wordpress_user" ),
                "connected_calendars" => $staff_member->get_connected_calendars_for_import(),
            ];
            $staff_members_arr[] = $staff_member_data;
        }
        $unit_ids = WBK_Model_Utils::get_unit_ids();
        $units_arr = [];
        foreach ( $unit_ids as $unit_id ) {
            $unit = new WBK_Unit($unit_id);
            if ( !$unit->is_loaded() ) {
                continue;
            }
            $name_raw = $unit->get( "name" );
            $name = WBK_Translation_Processor::translate_string( "webba_unit_" . $unit_id, ( $name_raw !== null && $name_raw !== "" ? $name_raw : "" ) );
            $description = WBK_Translation_Processor::translate_string( "webba_unit_description_" . $unit_id, $unit->get_description() );
            $has_description = strip_tags( $unit->get_description() ) !== "";
            $image = $unit->get_image();
            $unit_extras_raw = $unit->get( "extras" );
            $unit_extra_ids = [];
            if ( !empty( $unit_extras_raw ) ) {
                $unit_extras_decoded = json_decode( $unit_extras_raw );
                if ( !is_array( $unit_extras_decoded ) ) {
                    $unit_extras_decoded = json_decode( stripslashes( $unit_extras_raw ) );
                }
                if ( is_array( $unit_extras_decoded ) ) {
                    foreach ( $unit_extras_decoded as $extra_id_item ) {
                        if ( $extra_id_item === null || $extra_id_item === "" ) {
                            continue;
                        }
                        $extra_id_int = (int) $extra_id_item;
                        if ( $extra_id_int > 0 ) {
                            $unit_extra_ids[] = $extra_id_int;
                        }
                    }
                    $unit_extra_ids = array_values( array_unique( $unit_extra_ids ) );
                }
            }
            $units_arr[] = [
                "id"                              => (int) $unit_id,
                "value"                           => (int) $unit_id,
                "label"                           => $name,
                "description"                     => $description,
                "has_description"                 => $has_description,
                "image"                           => ( !empty( $image ) && $image ? wp_get_attachment_url( $image ) : false ),
                "locations"                       => $unit->get_locations(),
                "quantity"                        => $unit->get_quantity(),
                "capacity"                        => $unit->get_capacity(),
                "form_id"                         => $unit->get_form_id(),
                "similar_units"                   => $unit->get_similar_units(),
                "price"                           => $unit->get_price(),
                "availability_date_ranges"        => $unit->get_availability_date_ranges(),
                "availability_recurring_annually" => $unit->get_availability_recurring_annually(),
                "buffer_before"                   => $unit->get_buffer_before(),
                "buffer_after"                    => $unit->get_buffer_after(),
                "min_booking_days"                => $unit->get_min_booking_days(),
                "max_booking_days"                => $unit->get_max_booking_days(),
                "connected_calendars"             => $unit->get_connected_calendars(),
                "category_ids"                    => WBK_Model_Utils::get_service_category_ids_for_unit( $unit_id ),
                "attendee_type_adult"             => $unit->get( "attendee_type_adult" ),
                "attendee_type_child"             => $unit->get( "attendee_type_child" ),
                "attendee_type_infant"            => $unit->get( "attendee_type_infant" ),
                "extra_ids"                       => $unit_extra_ids,
            ];
        }
        $extras_catalog = WBK_Model::get_extras();
        $extras_arr = [];
        foreach ( $extras_catalog as $extra_id => $extra_name ) {
            $extra = new WBK_Extra($extra_id);
            if ( !$extra->is_loaded() ) {
                continue;
            }
            $extra_label = WBK_Translation_Processor::translate_string( "webba_extra_" . $extra_id, $extra_name );
            $extra_description = $extra->get_description();
            $extra_has_description = strip_tags( $extra_description ) !== "";
            $extra_image = $extra->get_image();
            $extras_arr[] = [
                "id"              => (int) $extra_id,
                "value"           => (int) $extra_id,
                "label"           => $extra_label,
                "description"     => $extra_description,
                "has_description" => $extra_has_description,
                "image"           => ( !empty( $extra_image ) && $extra_image ? wp_get_attachment_url( $extra_image ) : false ),
                "price"           => $extra->get_price(),
                "min_quantity"    => $extra->get_min_quantity(),
                "max_quantity"    => $extra->get_max_quantity(),
            ];
        }
        $remote_config = WBK_Remote_Config::get_config();
        $admin_theme = get_option( "wbk_admin_theme", "light" );
        $admin_theme = ( $admin_theme === "dark" ? "dark" : "light" );
        $timezone_string = get_option( "wbk_timezone", "UTC" );
        try {
            $timezone_obj = new DateTimeZone($timezone_string);
        } catch ( Exception $e ) {
            $timezone_obj = new DateTimeZone("UTC");
            $timezone_string = "UTC";
        }
        // Minutes east of UTC as negative values (Date.getTimezoneOffset / wbkGetTimezoneOffset).
        $timezone_offset_minutes = (int) round( $timezone_obj->getOffset( new DateTime("now", $timezone_obj) ) * -1 / 60 );
        $booking_redirect_page_id = intval( get_option( "wbk_booking_redirect_page", "" ) );
        $booking_redirect_page = "";
        if ( $booking_redirect_page_id > 0 ) {
            $booking_redirect_permalink = get_page_link( $booking_redirect_page_id );
            $booking_redirect_page = ( is_string( $booking_redirect_permalink ) ? $booking_redirect_permalink : "" );
        }
        $square_credentials = WBK_Options_Utils::get_square_credentials();
        $data = [
            "services"                    => $services_arr,
            "categories"                  => $categories_arr,
            "locations"                   => $locations_arr,
            "staff_members"               => $staff_members_arr,
            "units"                       => $units_arr,
            "extras"                      => $extras_arr,
            "has_services_with_locations" => WBK_Model_Utils::has_services_with_locations(),
            "plugin_url"                  => WP_WEBBA_BOOKING__PLUGIN_URL,
            "site_url"                    => get_site_url(),
            "admin_url"                   => admin_url(),
            "plan_map"                    => WBK_Feature_Gate::get_plan_map(),
            "is_pro"                      => !wbk_fs()->is_free_plan(),
            "current_plan"                => WBK_Feature_Gate::get_current_plan(),
            "feature_display_config"      => [
                "hide_fields"        => (bool) $remote_config["hide_fields"],
                "hide_tables"        => (bool) $remote_config["hide_tables"],
                "table_message_type" => $remote_config["table_message_type"],
            ],
            "assistance_available"        => wbk_is_assistance_available(),
            "multiservice"                => WBK_Feature_Gate::have_required_plan( "start", "only_old_users" ),
            "admin_theme"                 => $admin_theme,
            "settings"                    => [
                "narrow_form"                        => get_option( "wbk_form_layout", "yes" ) !== "yes",
                "week_start"                         => WBK_Date_Time_Utils::getStartOfWeek(),
                "time_format"                        => WBK_Date_Time_Utils::get_time_format(),
                "date_format"                        => WBK_Date_Time_Utils::get_date_format(),
                "wbk_date_format_backend"            => get_option( "wbk_date_format_backend", "inherit" ),
                "wbk_date_format_time_slot_schedule" => get_option( "wbk_date_format_time_slot_schedule", "start-end" ),
                "timezone"                           => $timezone_string,
                "offset"                             => $timezone_offset_minutes,
                "locale"                             => get_locale(),
                "custom_fields"                      => WBK_Model_Utils::get_custom_fields_list(),
                "is_admin"                           => current_user_can( "manage_options" ),
                "price_format"                       => WBK_Format_Utils::get_price_format(),
                "price_fractional"                   => get_option( "wbk_price_fractional", "2" ),
                "price_separator"                    => get_option( "wbk_price_separator", "." ),
                "stripe_publishable_key"             => WBK_Options_Utils::get_stripe_credentials()[0] ?? null,
                "square_application_id"              => $square_credentials[0] ?? null,
                "square_location_id"                 => $square_credentials[2] ?? null,
                "square_environment"                 => ( $square_credentials[3] ?? false ? "sandbox" : "production" ),
                "square_currency"                    => get_option( "wbk_square_currency", "USD" ),
                "square_redirect_url"                => WBK_Options_Utils::get_square_redirect_url(),
                "show_booked_slots"                  => get_option( "wbk_show_booked_slots", "" ) === "yes",
                "allowed_multiple_service_selection" => get_option( "wbk_allow_multiple_services", "yes" ) === "yes",
                "coupons_enabled"                    => $coupons_enabled,
                "tax"                                => WBK_Options_Utils::get_tax(),
                "stripe_redirect_url"                => WBK_Options_Utils::get_stripe_redirect_url(),
                "stripe_fields"                      => get_option( "wbk_stripe_additional_fields", [] ),
                "gift_card_preset_amounts"           => WBK_Options_Processor::sanitize_nested_numbers( get_option( "wbk_gift_card_preset_amounts", [
                    50,
                    75,
                    100,
                    150,
                    200
                ] ) ),
                "gift_card_allow_custom_amount"      => get_option( "wbk_gift_card_allow_custom_amount", "yes" ) === "yes",
                "gift_card_policy"                   => WBK_Gift_Card::get_policy_html(),
                "timezone_picker_enabled"            => get_option( "wbk_enable_timezone_picker", "yes" ) === "yes",
                "show_post_booking_instructions"     => get_option( "wbk_enable_booking_instructions", "" ) === "yes",
                "admin_email"                        => get_option( "wbk_super_admin_email", get_option( "admin_email" ) ),
                "wbk_global_working_hours"           => get_option( "wbk_global_working_hours", "" ),
                "wbk_holydays"                       => get_option( "wbk_holydays", "" ),
                "currency_symbol"                    => get_option( "wbk_payment_price_format_new", '$' ),
                "currency_symbol_position"           => get_option( "wbk_currency_symbol_position", "before" ),
                "booking_redirect_enabled"           => get_option( "wbk_booking_redirect_enabled", "" ),
                "booking_redirect_page"              => $booking_redirect_page,
                "show_endtime"                       => get_option( "wbk_show_endtime", "" ) === "yes",
            ],
            "wording"                     => [
                "service_label"                             => get_option( "wbk_service_label", __( "Select a service", "webba-booking-lite" ) ),
                "category_label"                            => get_option( "wbk_category_label", __( "Select category", "webba-booking-lite" ) ),
                "category"                                  => get_option( "wbk_wording_category", __( "Category", "webba-booking-lite" ) ),
                "select_category"                           => get_option( "wbk_category_label", __( "Select category", "webba-booking-lite" ) ),
                "service"                                   => get_option( "wbk_wording_service", __( "Service", "webba-booking-lite" ) ),
                "select_service"                            => get_option( "wbk_wording_select_services", get_option( "wbk_service_label", __( "Select service", "webba-booking-lite" ) ) ),
                "unit"                                      => get_option( "wbk_wording_unit", __( "Unit", "webba-booking-lite" ) ),
                "select_unit"                               => get_option( "wbk_wording_select_units", __( "Select unit(s)", "webba-booking-lite" ) ),
                "proceed_to_checkout"                       => get_option( "wbk_wording_proceed_to_checkout", __( "Proceed to checkout", "webba-booking-lite" ) ),
                "date_label"                                => get_option( "wbk_date_basic_label", __( "Book an appointment on", "webba-booking-lite" ) ),
                "date_placeholder"                          => get_option( "wbk_date_input_placeholder", __( "date", "webba-booking-lite" ) ),
                "cancel"                                    => get_option( "wbk_user_dashboard_link_text_cancel", __( "Cancel booking", "webba-booking-lite" ) ),
                "confirm_cancel"                            => get_option( "wbk_user_dashboard_link_text_confirm_cancellation", __( "Confirm cancellation", "webba-booking-lite" ) ),
                "bookings"                                  => get_option( "wbk_user_dashboard_section_bookings_label", __( "My Bookings", "webba-booking-lite" ) ),
                "booking_history"                           => get_option( "wbk_user_dashboard_section_past_bookings_label", __( "History", "webba-booking-lite" ) ),
                "reschedule"                                => get_option( "wbk_user_dashboard_link_text_reschedule", __( "Reschedule", "webba-booking-lite" ) ),
                "loading"                                   => get_option( "wbk_user_dashboard_please_wait_state", __( "Please wait...", "webba-booking-lite" ) ),
                "total_amount"                              => get_option( "wbk_total_amount_label", __( "Total amount", "webba-booking-lite" ) ),
                "tax"                                       => get_option( "wbk_tax_label", __( "Tax", "webba-booking-lite" ) ),
                "discount"                                  => get_option( "wbk_payment_discount_item", __( "Discount (-)", "webba-booking-lite" ) ),
                "after_booking_instructions"                => get_option( "wbk_after_booking_instructions", "<h4>Important Information</h4><ul><li>Please arrive 10 minutes before your scheduled appointment time</li><li>Cancellations must be made at least 24 hours in advance</li><li>Bring valid ID for verification at check-in</li></ul>" ),
                "label_login_user"                          => get_option( "wbk_wording_label_login_user", __( "Username or Email Address", "webba-booking-lite" ) ),
                "label_login_password"                      => get_option( "wbk_wording_label_login_password", __( "Password", "webba-booking-lite" ) ),
                "label_login_button"                        => get_option( "wbk_wording_label_login_button", __( "Login", "webba-booking-lite" ) ),
                "no_booking"                                => get_option( "wbk_user_dashboard_no_bookings_available", __( "No bookings available", "webba-booking-lite" ) ),
                "label_login_title"                         => get_option( "wbk_user_dashboard_login_title", __( "Login to your booking manager", "webba-booking-lite" ) ),
                "label_login_description"                   => get_option( "wbk_wording_label_login_description", __( "Access your booking dashboard", "webba-booking-lite" ) ),
                "label_logout"                              => get_option( "wbk_wording_label_logout", __( "Logout", "webba-booking-lite" ) ),
                "label_manage_appointments_title"           => get_option( "wbk_user_dashboard_manage_appointments_title", __( "Manage your appointments and reservations", "webba-booking-lite" ) ),
                "label_upcoming_bookings_title"             => get_option( "wbk_user_dashboard_upcoming_bookings_title", __( "Upcoming", "webba-booking-lite" ) ),
                "label_past_bookings_title"                 => get_option( "wbk_user_dashboard_past_bookings_title", __( "Past", "webba-booking-lite" ) ),
                "label_new_booking_title"                   => get_option( "wbk_user_dashboard_new_booking_title", __( "+ New Booking", "webba-booking-lite" ) ),
                "help_title"                                => get_option( "wbk_sidebar_help_title", __( "Need help?", "webba-booking-lite" ) ),
                "help_phone"                                => get_option( "wbk_sidebar_help_phone", "" ),
                "help_email"                                => get_option( "wbk_sidebar_help_email", "" ),
                "summary"                                   => get_option( "wbk_wording_summary", __( "Summary", "webba-booking-lite" ) ),
                "select_services"                           => get_option( "wbk_wording_select_services", __( "Select service(s)", "webba-booking-lite" ) ),
                "select_units"                              => get_option( "wbk_wording_select_units", __( "Select unit(s)", "webba-booking-lite" ) ),
                "choose_service_proceed"                    => get_option( "wbk_wording_choose_service_proceed", __( "Choose a service to proceed", "webba-booking-lite" ) ),
                "choose_unit_proceed"                       => get_option( "wbk_wording_choose_unit_proceed", __( "Choose a unit to proceed", "webba-booking-lite" ) ),
                "unit_adult"                                => get_option( "wbk_wording_unit_adult", __( "Adult", "webba-booking-lite" ) ),
                "unit_child"                                => get_option( "wbk_wording_unit_child", __( "Child", "webba-booking-lite" ) ),
                "unit_infant"                               => get_option( "wbk_wording_unit_infant", __( "Infant", "webba-booking-lite" ) ),
                "unit_max_attendees"                        => get_option( "wbk_wording_unit_max_attendees", __( "Max attendees", "webba-booking-lite" ) ),
                "unit_select_suitable_range"                => get_option( "wbk_wording_unit_select_suitable_range", __( "Select suitable range", "webba-booking-lite" ) ),
                "unit_date_flexibility"                     => get_option( "wbk_wording_unit_date_flexibility", __( "Date Flexibility", "webba-booking-lite" ) ),
                "unit_exact_match"                          => get_option( "wbk_wording_unit_exact_match", __( "Exact match", "webba-booking-lite" ) ),
                "unit_plus_minus_1_day"                     => get_option( "wbk_wording_unit_plus_minus_1_day", __( "+/- 1 day", "webba-booking-lite" ) ),
                "unit_plus_minus_2_day"                     => get_option( "wbk_wording_unit_plus_minus_2_day", __( "+/- 2 days", "webba-booking-lite" ) ),
                "unit_plus_minus_3_day"                     => get_option( "wbk_wording_unit_plus_minus_3_day", __( "+/- 3 days", "webba-booking-lite" ) ),
                "unit_no_date_selected"                     => get_option( "wbk_wording_unit_no_date_selected", __( "No date selected", "webba-booking-lite" ) ),
                "unit_days"                                 => get_option( "wbk_wording_unit_days", __( "days", "webba-booking-lite" ) ),
                "unit_available_date_ranges"                => get_option( "wbk_wording_unit_available_date_ranges", __( "Available Date Ranges", "webba-booking-lite" ) ),
                "unit_available"                            => get_option( "wbk_wording_unit_available", __( "Available", "webba-booking-lite" ) ),
                "unit_no_available_offers"                  => get_option( "wbk_wording_unit_no_available_offers", __( "No available offers found for the selected range.", "webba-booking-lite" ) ),
                "select_date_time_services"                 => get_option( "wbk_wording_select_date_time_services", __( "Select date & time for services", "webba-booking-lite" ) ),
                "choose_preferred_appointment_slot"         => get_option( "wbk_wording_choose_preferred_appointment_slot", __( "Choose your preferred appointment slot", "webba-booking-lite" ) ),
                "personal_details"                          => get_option( "wbk_wording_personal_details", __( "Personal details", "webba-booking-lite" ) ),
                "fill_contact_information"                  => get_option( "wbk_wording_fill_contact_information", __( "Please fill in your contact information", "webba-booking-lite" ) ),
                "payment_method"                            => get_option( "wbk_payment_methods_title", __( "Payment method", "webba-booking-lite" ) ),
                "select_preferred_payment_method"           => get_option( "wbk_wording_select_preferred_payment_method", __( "Select your preferred payment method", "webba-booking-lite" ) ),
                "back"                                      => get_option( "wbk_back_button_text", __( "Back", "webba-booking-lite" ) ),
                "continue"                                  => get_option( "wbk_next_button_text", __( "Continue", "webba-booking-lite" ) ),
                "submit"                                    => get_option( "wbk_wording_submit", __( "Submit", "webba-booking-lite" ) ),
                "appointment_confirmed"                     => get_option( "wbk_wording_appointment_confirmed", __( "Thank you for your booking!", "webba-booking-lite" ) ),
                "look_forward_seeing_you"                   => get_option( "wbk_wording_look_forward_seeing_you", __( "We look forward to seeing you.", "webba-booking-lite" ) ),
                "payment_information"                       => get_option( "wbk_wording_payment_information", __( "Payment Information", "webba-booking-lite" ) ),
                "add_to_calendar"                           => get_option( "wbk_wording_add_to_calendar", __( "+ Add to Calendar", "webba-booking-lite" ) ),
                "cost_breakdown"                            => get_option( "wbk_wording_cost_breakdown", __( "Cost Breakdown", "webba-booking-lite" ) ),
                "total_amount_paid"                         => get_option( "wbk_wording_total_amount_paid", __( "Total amount", "webba-booking-lite" ) ),
                "booking_success"                           => get_option( "wbk_wording_booking_success", __( "Booking success", "webba-booking-lite" ) ),
                "loading_payment_form"                      => get_option( "wbk_wording_loading_payment_form", __( "Loading payment form...", "webba-booking-lite" ) ),
                "processing"                                => get_option( "wbk_wording_processing", __( "Processing...", "webba-booking-lite" ) ),
                "pay"                                       => get_option( "wbk_wording_pay", __( "Pay", "webba-booking-lite" ) ),
                "pay_with"                                  => get_option( "wbk_wording_pay_with", __( "Pay with", "webba-booking-lite" ) ),
                "payment"                                   => get_option( "wbk_payment_step_title", __( "Payment", "webba-booking-lite" ) ),
                "please_complete_payment_confirm_booking"   => get_option( "wbk_wording_please_complete_payment_confirm_booking", __( "Please complete your payment to confirm your booking.", "webba-booking-lite" ) ),
                "payment_successful"                        => get_option( "wbk_wording_payment_successful", __( "Payment successful", "webba-booking-lite" ) ),
                "thank_you_payment"                         => get_option( "wbk_wording_thank_you_payment", __( "Thank you for your payment.", "webba-booking-lite" ) ),
                "gift_card"                                 => get_option( "wbk_wording_gift_card", __( "Gift card", "webba-booking-lite" ) ),
                "gift_card_for"                             => get_option( "wbk_wording_gift_card_for", __( "Gift card for #recipient_name", "webba-booking-lite" ) ),
                "gift_card_code"                            => get_option( "wbk_wording_gift_card_code", __( "Gift card code", "webba-booking-lite" ) ),
                "gift_card_thank_you_message"               => get_option( "wbk_wording_gift_card_thank_you_message", __( "Thank you for your gift card purchase. A confirmation email will be sent to you, and the recipient will receive their gift on the selected date.", "webba-booking-lite" ) ),
                "please_complete_payment_confirm_gift_card" => get_option( "wbk_wording_please_complete_payment_confirm_gift_card", __( "Please complete your payment to confirm your gift card purchase.", "webba-booking-lite" ) ),
                "total_amount_due"                          => get_option( "wbk_wording_total_amount_due", __( "Total amount due", "webba-booking-lite" ) ),
                "loading_booking_details"                   => get_option( "wbk_wording_loading_booking_details", __( "Loading booking details...", "webba-booking-lite" ) ),
                "complete_your_payment"                     => get_option( "wbk_wording_complete_your_payment", __( "Complete Your Payment", "webba-booking-lite" ) ),
                "select_payment_method_complete_payment"    => get_option( "wbk_wording_select_payment_method_complete_payment", __( "Please select a payment method and complete your payment to confirm your booking.", "webba-booking-lite" ) ),
                "appointment_approved"                      => get_option( "wbk_wording_appointment_approved", __( "Appointment Approved", "webba-booking-lite" ) ),
                "appointment_approved_message"              => get_option( "wbk_wording_appointment_approved_message", __( "You have approved this appointment. The customer has been notified.", "webba-booking-lite" ) ),
                "appointment_cancelled"                     => get_option( "wbk_wording_appointment_cancelled", __( "Appointment Cancelled", "webba-booking-lite" ) ),
                "appointment_cancelled_admin_message"       => get_option( "wbk_wording_appointment_cancelled_admin_message", __( "You have cancelled this appointment. The customer has been notified of the cancellation.", "webba-booking-lite" ) ),
                "appointment_cancelled_customer_message"    => get_option( "wbk_wording_appointment_cancelled_customer_message", __( "You have cancelled your appointment. We hope to see you again soon.", "webba-booking-lite" ) ),
                "booking_approved"                          => get_option( "wbk_wording_booking_approved", __( "Booking approved", "webba-booking-lite" ) ),
                "booking_cancelled"                         => get_option( "wbk_wording_booking_cancelled", __( "Booking cancelled", "webba-booking-lite" ) ),
                "approve_appointment"                       => get_option( "wbk_wording_approve_appointment", __( "Approve Appointment", "webba-booking-lite" ) ),
                "cancel_appointment"                        => get_option( "wbk_cancel_button_text", __( "Cancel Booking", "webba-booking-lite" ) ),
                "bank_transfer_message"                     => __( get_option( "wbk_bank_transfer_message", "Pay by bank transfer" ), "webba-booking-lite" ),
                "pay_on_arrival_message"                    => __( get_option( "wbk_pay_on_arrival_message", "Pay on arrival" ), "webba-booking-lite" ),
                "paypal_message"                            => __( get_option( "wbk_paypal_message", "You will be redirected to PayPal in the next screen." ), "webba-booking-lite" ),
                "mollie_message"                            => __( WBK_Options_Utils::get_mollie_message(), "webba-booking-lite" ),
                "woocommerce_message"                       => __( get_option( "wbk_woo_message", "You will be able to checkout in the next screen." ), "webba-booking-lite" ),
                "show_more"                                 => get_option( "wbk_wording_show_more", __( "Show more", "webba-booking-lite" ) ),
                "show_less"                                 => get_option( "wbk_wording_show_less", __( "Show less", "webba-booking-lite" ) ),
                "toggle_description"                        => get_option( "wbk_wording_toggle_description", __( "Toggle description", "webba-booking-lite" ) ),
                "for_group_bookings_only"                   => get_option( "wbk_wording_for_group_bookings_only", __( "For group bookings only:", "webba-booking-lite" ) ),
                "number_of_people"                          => get_option( "wbk_wording_number_of_people", __( "Number of people:", "webba-booking-lite" ) ),
                "reduce_item"                               => get_option( "wbk_wording_reduce_item", __( "Reduce item", "webba-booking-lite" ) ),
                "increase_item"                             => get_option( "wbk_wording_increase_item", __( "Increase item", "webba-booking-lite" ) ),
                "no_time_selected"                          => get_option( "wbk_wording_no_time_selected", __( "No time selected", "webba-booking-lite" ) ),
                "remove_item"                               => get_option( "wbk_wording_remove_item", __( "Remove item", "webba-booking-lite" ) ),
                "empty_summary"                             => get_option( "wbk_wording_empty_summary", __( "Please select a service and slot to see a summary here.", "webba-booking-lite" ) ),
                "phone"                                     => get_option( "wbk_phone_label", __( "Phone", "webba-booking-lite" ) ),
                "email"                                     => get_option( "wbk_email_label", __( "Email", "webba-booking-lite" ) ),
                "no_services_found"                         => get_option( "wbk_wording_no_services_found", __( "No services found!", "webba-booking-lite" ) ),
                "no_units_found"                            => get_option( "wbk_wording_no_units_found", __( "No units found!", "webba-booking-lite" ) ),
                "show_summary"                              => get_option( "wbk_wording_show_summary", __( "Show summary", "webba-booking-lite" ) ),
                "price_breakdown"                           => get_option( "wbk_wording_price_breakdown", __( "Price breakdown", "webba-booking-lite" ) ),
                "total"                                     => get_option( "wbk_payment_total_title", __( "Total", "webba-booking-lite" ) ),
                "free"                                      => get_option( "wbk_wording_free", __( "Free", "webba-booking-lite" ) ),
                "select_date_time"                          => get_option( "wbk_wording_select_date_time", __( "Select date & time", "webba-booking-lite" ) ),
                "choosing_timeslot_for"                     => get_option( "wbk_wording_choosing_timeslot_for", __( "Choosing time slot for", "webbab-booking-lite" ) ),
                "available"                                 => get_option( "wbk_wording_available", __( "Available", "webba-booking-lite" ) ),
                "booked"                                    => get_option( "wbk_wording_booked", __( "Booked", "webba-booking-lite" ) ),
                "today"                                     => get_option( "wbk_wording_today", __( "Today", "webba-booking-lite" ) ),
                "add_more"                                  => get_option( "wbk_wording_add_more", __( "Add more", "webba-booking-lite" ) ),
                "slots"                                     => get_option( "wbk_wording_slots", __( "slots", "webba-booking-lite" ) ),
                "enter_coupon_code"                         => get_option( "wbk_wording_enter_coupon_code", __( "Enter coupon code", "webba-booking-lite" ) ),
                "apply"                                     => get_option( "wbk_wording_apply", __( "Apply", "webba-booking-lite" ) ),
                "please_select_service"                     => get_option( "wbk_wording_please_select_service", __( "Please select at least one service.", "webba-booking-lite" ) ),
                "please_select_timeslot"                    => get_option( "wbk_wording_please_select_timeslot", __( "Please select a time slot for each selected service.", "webba-booking-lite" ) ),
                "please_fill_out_all_fields"                => get_option( "wbk_wording_please_fill_out_all_fields", __( "Please fill out all required fields.", "webba-booking-lite" ) ),
                "please_select_payment_method"              => get_option( "wbk_wording_please_select_payment_method", __( "Please select a payment method.", "webba-booking-lite" ) ),
                "please_fill_out_payment_form"              => get_option( "wbk_wording_please_fill_out_payment_form", __( "Please fill out payment form.", "webba-booking-lite" ) ),
                "duration"                                  => get_option( "wbk_wording_duration", __( "Duration", "webba-booking-lite" ) ),
                "tax_included"                              => get_option( "wbk_wording_tax_included", __( "Tax incl.", "webba-booking-lite" ) ),
                "select"                                    => get_option( "wbk_wording_select", __( "+ Select", "webba-booking-lite" ) ),
                "selected"                                  => get_option( "wbk_wording_selected", __( "Selected", "webba-booking-lite" ) ),
                "no_available_timeslots"                    => get_option( "wbk_wording_no_available_timeslots", __( "No available time slots", "webba-booking-lite" ) ),
                "hour"                                      => get_option( "wbk_wording_hour", __( "h", "webba-booking-lite" ) ),
                "minute"                                    => get_option( "wbk_wording_minute", __( "min", "webba-booking-lite" ) ),
                "this_field_is_required"                    => get_option( "wbk_wording_this_field_is_required", __( "This field is required", "webba-booking-lite" ) ),
                "the_entered_email_is_invalid"              => get_option( "wbk_wording_the_entered_email_is_invalid", __( "The entered email is invalid", "webba-booking-lite" ) ),
                "please_enter_a_valid_phone_number"         => get_option( "wbk_wording_please_enter_a_valid_phone_number", __( "Please enter a valid phone number", "webba-booking-lite" ) ),
                "the_entered_number_is_invalid"             => get_option( "wbk_wording_the_entered_number_is_invalid", __( "The entered number is invalid", "webba-booking-lite" ) ),
                "plan_required_message"                     => WBK_Feature_Gate::get_plan_limit_message( "", false ),
                "no_bookings_found"                         => get_option( "wbk_wording_no_bookings_found", __( "No bookings found for the provided token", "webba-booking-lite" ) ),
                "service_fees"                              => get_option( "wbk_wording_service_fees", __( "Service Fees", "webba-booking-lite" ) ),
                "full_price"                                => get_option( "wbk_wording_full_price", __( "Full price", "webba-booking-lite" ) ),
                "pay_now"                                   => get_option( "wbk_wording_pay_now", __( "Pay now", "webba-booking-lite" ) ),
                "left_to_pay"                               => get_option( "wbk_wording_left_to_pay", __( "Left to pay", "webba-booking-lite" ) ),
                "show_details"                              => get_option( "wbk_wording_show_details", __( "Show details", "webba-booking-lite" ) ),
                "price"                                     => get_option( "wbk_wording_price", __( "Price", "webba-booking-lite" ) ),
                "to_pay"                                    => get_option( "wbk_wording_to_pay", __( "To pay now", "webba-booking-lite" ) ),
                "total_amount_tax_incl"                     => get_option( "wbk_wording_total_amount_tax_incl", __( "Total Amount (tax incl.)", "webba-booking-lite" ) ),
                "hide_details"                              => get_option( "wbk_wording_hide_details", __( "Hide details", "webba-booking-lite" ) ),
                "location"                                  => get_option( "wbk_wording_location", __( "Location", "webba-booking-lite" ) ),
                "select_location"                           => get_option( "wbk_wording_select_location", __( "Select location", "webba-booking-lite" ) ),
                "please_select_location"                    => get_option( "wbk_wording_please_select_location", __( "Please select a location first to choose services.", "webba-booking-lite" ) ),
                "please_select_location_units"              => get_option( "wbk_wording_please_select_location_units", __( "Please select a location first to choose units.", "webba-booking-lite" ) ),
                "select_staff_member"                       => get_option( "wbk_wording_select_staff_member", __( "SELECT STAFF MEMBER", "webba-booking-lite" ) ),
                "any_available"                             => get_option( "wbk_wording_any_available", __( "Any Available", "webba-booking-lite" ) ),
                "best_available_time"                       => get_option( "wbk_wording_best_available_time", __( "Best available time.", "webba-booking-lite" ) ),
                "select_extras"                             => get_option( "wbk_wording_select_extras", __( "Select extras", "webba-booking-lite" ) ),
                "choose_additional_services"                => get_option( "wbk_wording_choose_additional_services", __( "Choose additional items", "webba-booking-lite" ) ),
                "additional_items"                          => get_option( "wbk_wording_additional_items", __( "Additional items", "webba-booking-lite" ) ),
                "pay_full_amount"                           => get_option( "wbk_wording_pay_full_amount", __( "I want to pay full amount", "webba-booking-lite" ) ),
                "left_to_pay_later"                         => get_option( "wbk_wording_left_to_pay_later", __( "Left to pay later", "webba-booking-lite" ) ),
                "deposits"                                  => get_option( "wbk_wording_deposits", __( "Deposits", "webba-booking-lite" ) ),
                "hide_summary"                              => get_option( "wbk_wording_hide_summary", __( "Hide summary", "webba-booking-lite" ) ),
                "total_booked_items"                        => get_option( "wbk_total_booked_items_label", __( "Total booked items", "webba-booking-lite" ) ),
                "grand_total"                               => get_option( "wbk_grand_total_label", __( "Grand total", "webba-booking-lite" ) ),
                "recurring_booking"                         => get_option( "wbk_wording_recurring_booking", __( "Recurring booking", "webba-booking-lite" ) ),
                "recurring_booking_hint"                    => get_option( "wbk_wording_recurring_booking_hint", __( "This series exceeds the maximum number of slots allowed for this service.", "webba-booking-lite" ) ),
                "recurring_booking_repeat_every"            => get_option( "wbk_wording_recurring_booking_repeat_every", __( "Repeat every", "webba-booking-lite" ) ),
                "recurring_booking_interval"                => get_option( "wbk_wording_recurring_booking_interval", __( "Interval", "webba-booking-lite" ) ),
                "recurring_booking_number_of_time_slots"    => get_option( "wbk_wording_recurring_booking_number_of_time_slots", __( "Number of time slots", "webba-booking-lite" ) ),
                "loading_appointments"                      => get_option( "wbk_wording_loading_appointments", __( "Loading appointments...", "webba-booking-lite" ) ),
                "no_appointments_selected"                  => get_option( "wbk_wording_no_appointments_selected", __( "No appointments selected. Add slots using the controls above or close the popup.", "webba-booking-lite" ) ),
                "unavailable"                               => get_option( "wbk_wording_unavailable", __( "unavailable", "webba-booking-lite" ) ),
                "choose_another_time"                       => get_option( "wbk_wording_choose_another_time", __( "Choose another time", "webba-booking-lite" ) ),
                "select_a_time"                             => get_option( "wbk_wording_select_a_time", __( "Select a time", "webba-booking-lite" ) ),
                "adjusted"                                  => get_option( "wbk_wording_adjusted", __( "adjusted", "webba-booking-lite" ) ),
                "remove_appointment"                        => get_option( "wbk_wording_remove_appointment", __( "Remove appointment", "webba-booking-lite" ) ),
            ],
            "appearance"                  => WBK_Model_Utils::get_appearance_data(),
            "appearance_options"          => get_option( "wbk_appearance_options", [] ),
            "user"                        => $user,
            "current_user_email"          => $current_user_email,
            "is_logged_in"                => is_user_logged_in(),
            "user_data"                   => [
                "first_name" => ( isset( $current_user ) ? $current_user->user_firstname : "" ),
                "last_name"  => ( isset( $current_user ) ? $current_user->user_lastname : "" ),
                "email"      => $current_user_email,
                "phone"      => ( isset( $current_user ) ? get_user_meta( $current_user->ID, "billing_phone", true ) : "" ),
            ],
            "current_user_id"             => get_current_user_id(),
            "reset_all_data_allowed"      => WBK_Reset_All_Data::current_user_can_reset(),
        ];
        $response = new \WP_REST_Response($data);
        $response->set_status( 200 );
        return $response;
    }

    public function get_field_options_permission() : bool {
        if ( current_user_can( "manage_options" ) ) {
            return true;
        }
        return WBK_User_Utils::check_access_to_service();
    }

    public function get_field_options( WP_REST_Request $request ) {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        WBK_Mixpanel::track_event( "v51 react app: get field options", [] );
        $data = [];
        $params = $request->get_params();
        $model = ( isset( $params["model"] ) ? sanitize_text_field( $params["model"] ) : "" );
        $field = ( isset( $params["field"] ) ? sanitize_text_field( $params["field"] ) : "" );
        $form = [];
        if ( isset( $params["form"] ) && is_array( $params["form"] ) ) {
            foreach ( $params["form"] as $form_key => $form_value ) {
                if ( is_array( $form_value ) ) {
                    $form[sanitize_text_field( (string) $form_key )] = wp_json_encode( $form_value );
                    continue;
                }
                $form[sanitize_text_field( (string) $form_key )] = sanitize_text_field( (string) $form_value );
            }
        }
        if ( $model === "services" ) {
            switch ( $field ) {
                case "form":
                    $data[$model][$field] = WBK_Model_Utils::get_cf7_forms();
                    break;
                case "users":
                    $data[$model][$field] = WBK_User_Utils::get_none_admin_wp_users();
                    break;
                case "payment_methods":
                case "service_payment_methods":
                    $data[$model][$field] = WBK_Model_Utils::get_all_payment_methods();
                    break;
                case "google_meet_calendar":
                    // Get all configured Google calendar accounts
                    global $wpdb;
                    $google_calendars_table = get_option( "wbk_db_prefix", "" ) . "wbk_gg_calendars";
                    $query = $wpdb->prepare( "SHOW TABLES LIKE %s", $wpdb->esc_like( $google_calendars_table ) );
                    $calendars_list = [];
                    if ( $wpdb->get_var( $query ) == $google_calendars_table ) {
                        $sql = "SELECT id, name FROM " . $google_calendars_table;
                        $google_accounts = $wpdb->get_results( $sql, ARRAY_A );
                        foreach ( $google_accounts as $account ) {
                            $account_id = $account["id"];
                            $account_name = $account["name"];
                            // Get calendars within this Google account
                            $calendars = WBK_Google::get_google_calendars_in_account( $account_id );
                            if ( is_array( $calendars ) && !empty( $calendars ) ) {
                                foreach ( $calendars as $calendar_id => $calendar_name ) {
                                    // Format: account_id:calendar_id => account_name - calendar_name
                                    $key = $account_id . ":" . $calendar_id;
                                    $label = $account_name . " - " . $calendar_name;
                                    $calendars_list[$key] = $label;
                                }
                            }
                        }
                    }
                    if ( empty( $calendars_list ) ) {
                        $calendars_list["wbk_null"] = __( "No Google calendars available", "webba-booking-lite" );
                    }
                    $data[$model][$field] = $calendars_list;
                    break;
                case "woo_product":
                    $data[$model][$field] = WBK_Model_Utils::get_woocommerce_products();
            }
        } elseif ( $model === "appointments" && ($field === "service_id" || $field === "day" || $field === "time" || $field === "staff_member_id") && empty( $form["unit_id"] ) ) {
            if ( $field === "service_id" || $field === "staff_member_id" ) {
                $service_id = ( isset( $form["service_id"] ) ? (int) $form["service_id"] : 0 );
                if ( !$service_id && isset( $form["appointment_service_id"] ) ) {
                    $service_id = (int) $form["appointment_service_id"];
                }
                $staff_member_ids = ( $service_id > 0 ? WBK_Model_Utils::get_staff_member_ids_by_service( $service_id ) : [] );
                $staff_members_options = [];
                foreach ( $staff_member_ids as $staff_member_id ) {
                    $staff_member = new WBK_Staff_Member($staff_member_id);
                    if ( !$staff_member->is_loaded() ) {
                        continue;
                    }
                    $staff_members_options[$staff_member_id] = $staff_member->get_name();
                }
                $data[$model]["staff_member_id"] = $staff_members_options;
                $data[$model]["appointment_staff_member_id"] = $staff_members_options;
            }
            if ( $form["service_id"] && $form["day"] ) {
                $sp = new WBK_Schedule_Processor();
                date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
                $day = strtotime( $form["day"] );
                $timeslots = $sp->get_time_slots_by_day(
                    $day,
                    $form["service_id"] ?? 0,
                    [
                        "skip_gg_calendar"       => false,
                        "ignore_preparation"     => true,
                        "calculate_availability" => true,
                        "calculate_night_hours"  => false,
                        "filter_availability"    => false,
                    ],
                    $form["id"] ?? null
                );
                foreach ( $timeslots as $slot ) {
                    $data[$model]["time"][$slot->start] = sprintf( "%s (%d available)", $slot->formated_time, $slot->free_places );
                    for ($place = 1; $place <= $slot->free_places && $form["time"] == $slot->start; $place++) {
                        $data[$model]["quantity"][$place] = sprintf( "%d", $place );
                    }
                }
                if ( empty( $data[$model]["time"] ) ) {
                    $data[$model]["time"] = [
                        "wbk_null" => __( "No time slots available", "webba-booking-lite" ),
                    ];
                }
            }
            if ( $field === "staff_member_id" ) {
                $service_id = ( isset( $form["service_id"] ) ? (int) $form["service_id"] : 0 );
                if ( $service_id <= 0 && isset( $form["appointment_service_id"] ) ) {
                    $service_id = (int) $form["appointment_service_id"];
                }
                $unit_id = ( isset( $form["unit_id"] ) ? (int) $form["unit_id"] : 0 );
                if ( $unit_id <= 0 && isset( $form["appointment_unit_id"] ) ) {
                    $unit_id = (int) $form["appointment_unit_id"];
                }
                $location_ids = [];
                if ( $service_id > 0 ) {
                    $service = new WBK_Service($service_id);
                    if ( $service->is_loaded() ) {
                        $service_locations_raw = $service->get( "locations" );
                        if ( !empty( $service_locations_raw ) ) {
                            $decoded_locations = json_decode( $service_locations_raw, true );
                            if ( is_array( $decoded_locations ) ) {
                                $location_ids = $decoded_locations;
                            } elseif ( is_string( $service_locations_raw ) ) {
                                $decoded_locations = json_decode( stripslashes( $service_locations_raw ), true );
                                if ( is_array( $decoded_locations ) ) {
                                    $location_ids = $decoded_locations;
                                }
                            }
                        }
                    }
                } elseif ( $unit_id > 0 ) {
                    $unit = new WBK_Unit($unit_id);
                    if ( $unit->is_loaded() ) {
                        $location_ids = $unit->get_locations();
                    }
                }
                $location_ids = array_values( array_unique( array_filter( array_map( "intval", ( is_array( $location_ids ) ? $location_ids : [] ) ), function ( $id ) {
                    return $id > 0;
                } ) ) );
                $location_options = [];
                foreach ( $location_ids as $location_id ) {
                    $location = new WBK_Location($location_id);
                    if ( !$location->is_loaded() ) {
                        continue;
                    }
                    $location_options[(string) $location_id] = WBK_Translation_Processor::translate_string( "webba_location_" . $location_id, $location->get_name() );
                }
                if ( empty( $location_options ) ) {
                    $location_options = [
                        "wbk_null" => __( "No locations available", "webba-booking-lite" ),
                    ];
                }
                $data[$model]["location_id"] = $location_options;
                $data[$model]["appointment_location_id"] = $location_options;
            }
        } elseif ( $model === "connected_calendars" ) {
            switch ( $field ) {
                case "user_id":
                    $data[$model][$field] = WBK_User_Utils::get_none_admin_wp_users();
                    break;
                case "in_provider_id":
                case "provider":
                    $calendar_id = ( isset( $form["id"] ) ? sanitize_text_field( $form["id"] ) : "" );
                    $provider = ( isset( $form["provider"] ) ? $form["provider"] : (( isset( $form["calendar_provider"] ) ? $form["calendar_provider"] : "" )) );
                    if ( $provider === "google" ) {
                        $webba_connect = new WBK_Webba_Connect();
                        $calendars_list = $webba_connect->get_google_calendars_for_options( $calendar_id );
                        if ( empty( $calendars_list ) ) {
                            $calendars_list["wbk_null"] = __( "No Google calendars available", "webba-booking-lite" );
                        }
                        $data[$model]["in_provider_id"] = $calendars_list;
                    } elseif ( $provider === "outlook" ) {
                        $outlook_calendar = new WBK_Outlook_Calendar_Processor($calendar_id);
                        $calendars_result = $outlook_calendar->get_calendars();
                        $calendars_list = [];
                        if ( !is_wp_error( $calendars_result ) ) {
                            // Format: [id => name] (same as Google)
                            $calendars_list = $calendars_result;
                        }
                        if ( empty( $calendars_list ) ) {
                            $calendars_list["wbk_null"] = __( "No Outlook calendars available", "webba-booking-lite" );
                        }
                        $data[$model]["in_provider_id"] = $calendars_list;
                    } elseif ( $provider === "icloud" ) {
                        $icloud_calendar = new WBK_Icloud_Calendar_Processor($calendar_id);
                        // Prefer cached calendars from auth (same map as auth UI).
                        $auth_parameters = $icloud_calendar->get_auth_parameters();
                        $calendars_list = ( isset( $auth_parameters["calendars"] ) && is_array( $auth_parameters["calendars"] ) ? $auth_parameters["calendars"] : [] );
                        if ( empty( $calendars_list ) ) {
                            $calendars_result = $icloud_calendar->get_calendars();
                            if ( !is_wp_error( $calendars_result ) && is_array( $calendars_result ) ) {
                                $calendars_list = $calendars_result;
                            }
                        }
                        if ( empty( $calendars_list ) ) {
                            $calendars_list["wbk_null"] = __( "No iCloud calendars available", "webba-booking-lite" );
                        }
                        $data[$model]["in_provider_id"] = $calendars_list;
                    } else {
                        $data[$model]["in_provider_id"] = [];
                    }
                    break;
                default:
                    break;
            }
        } elseif ( $model === "email_templates" ) {
            switch ( $field ) {
                case "type":
                    $notification_types = WBK_Model_Utils::get_notification_types();
                    $data[$model][$field] = $notification_types;
                default:
                    break;
            }
        } elseif ( $model === "settings" ) {
            switch ( $field ) {
                case "wbk_email_landing_new":
                case "wbk_user_dashboard_page_link_new":
                case "wbk_stripe_redirect_url_new":
                case "wbk_paypal_redirect_url_new":
                case "wbk_square_redirect_url_new":
                case "wbk_mollie_redirect_url_new":
                case "wbk_gift_card_landing_page":
                    $pages = get_pages();
                    $pages_array = [];
                    foreach ( $pages as $page ) {
                        $pages_array[$page->ID] = $page->post_title;
                    }
                    $data[$model][$field] = $pages_array;
                    break;
                case "wbk_custom_fields_columns":
                    $all_fields = WBK_Form_Builder_Utils::get_all_fields_merged();
                    $options = [];
                    foreach ( $all_fields as $f ) {
                        $slug = ( isset( $f["slug"] ) ? $f["slug"] : "" );
                        if ( $slug === "" ) {
                            continue;
                        }
                        $label = ( isset( $f["placeholder"] ) ? $f["placeholder"] : (( isset( $f["checkboxText"] ) ? $f["checkboxText"] : $slug )) );
                        $options[$slug] = $label;
                    }
                    $data[$model][$field] = $options;
                    break;
                case "wbk_whatsapp_template_booking":
                case "wbk_whatsapp_template_reminder":
                case "wbk_whatsapp_template_payment":
                case "wbk_whatsapp_template_approval":
                    if ( class_exists( "WBK_WhatsApp" ) ) {
                        $data[$model][$field] = WBK_WhatsApp::get_approved_template_options();
                    } else {
                        $data[$model][$field] = [
                            "wbk_null" => __( "WhatsApp is not available", "webba-booking-lite" ),
                        ];
                    }
                    break;
                case "wbk_whatsapp_business_account_id":
                    if ( class_exists( "WBK_WhatsApp" ) ) {
                        $options = WBK_WhatsApp::get_business_account_options();
                        $data[$model][$field] = ( is_wp_error( $options ) ? [
                            "wbk_null" => $options->get_error_message(),
                        ] : $options );
                        $waba_id = "";
                        if ( is_array( $form ) && isset( $form["wbk_whatsapp_business_account_id"] ) ) {
                            $waba_id = sanitize_text_field( $form["wbk_whatsapp_business_account_id"] );
                        }
                        if ( $waba_id === "" || $waba_id === "wbk_null" ) {
                            $waba_id = (string) get_option( "wbk_whatsapp_business_account_id", "" );
                        }
                        $phone_options = WBK_WhatsApp::get_phone_number_options( ( $waba_id !== "" ? $waba_id : null ) );
                        $data[$model]["wbk_whatsapp_phone_number_id"] = ( is_wp_error( $phone_options ) ? [
                            "wbk_null" => $phone_options->get_error_message(),
                        ] : $phone_options );
                    } else {
                        $data[$model][$field] = [];
                    }
                    break;
                case "wbk_whatsapp_phone_number_id":
                    if ( class_exists( "WBK_WhatsApp" ) ) {
                        $waba_id = "";
                        if ( is_array( $form ) && isset( $form["wbk_whatsapp_business_account_id"] ) ) {
                            $waba_id = sanitize_text_field( $form["wbk_whatsapp_business_account_id"] );
                        }
                        $options = WBK_WhatsApp::get_phone_number_options( ( $waba_id !== "" ? $waba_id : null ) );
                        $data[$model][$field] = ( is_wp_error( $options ) ? [
                            "wbk_null" => $options->get_error_message(),
                        ] : $options );
                    } else {
                        $data[$model][$field] = [];
                    }
                    break;
                default:
                    break;
            }
        } elseif ( $model === "staff_members" ) {
            switch ( $field ) {
                case "wordpress_user":
                    $users = WBK_User_Utils::get_none_admin_wp_users();
                    $users_array = [];
                    foreach ( $users as $user_id => $user_name ) {
                        $is_used = WBK_User_Utils::is_wp_user_used_by_staff_member( $user_id );
                        if ( $is_used ) {
                            $users_array[$user_id] = [
                                "label"       => sprintf( "%s (%s)", $user_name, __( "already used", "webba-booking-lite" ) ),
                                "is_disabled" => true,
                            ];
                        } else {
                            $users_array[$user_id] = [
                                "label"       => $user_name,
                                "is_disabled" => false,
                            ];
                        }
                    }
                    $data[$model][$field] = $users_array;
                    break;
                default:
                    break;
            }
        } elseif ( $model === "units" ) {
            switch ( $field ) {
                case "payment_methods":
                case "unit_payment_methods":
                    $data[$model][$field] = WBK_Model_Utils::get_all_payment_methods();
                    break;
                case "woo_product":
                    $data[$model][$field] = WBK_Model_Utils::get_woocommerce_products();
                    break;
                default:
                    break;
            }
        } elseif ( $model === "appointments" && isset( $form["unit_id"] ) ) {
            $resolve_number_of_people = function ( $form_data ) {
                $people_value = null;
                if ( isset( $form_data["number_of_people"] ) ) {
                    $people_value = $form_data["number_of_people"];
                } elseif ( isset( $form_data["appointment_number_of_people"] ) ) {
                    $people_value = $form_data["appointment_number_of_people"];
                }
                if ( $people_value === null || $people_value === "" || $people_value === "null" ) {
                    return null;
                }
                if ( is_array( $people_value ) ) {
                    return $people_value;
                }
                if ( is_string( $people_value ) ) {
                    $decoded_people = json_decode( $people_value, true );
                    if ( json_last_error() === JSON_ERROR_NONE && is_array( $decoded_people ) ) {
                        return $decoded_people;
                    }
                    if ( is_numeric( $people_value ) ) {
                        return (int) $people_value;
                    }
                    return null;
                }
                if ( is_numeric( $people_value ) ) {
                    return (int) $people_value;
                }
                return null;
            };
            switch ( $field ) {
                case "unit_id":
                case "day":
                    // get possible durations
                    $minutes_per_day = 24 * 60;
                    $unit_id = ( isset( $form["unit_id"] ) ? (int) $form["unit_id"] : 0 );
                    $selected_day = ( isset( $form["day"] ) ? sanitize_text_field( $form["day"] ) : "" );
                    $duration_options = [];
                    if ( $unit_id > 0 && $selected_day !== "" ) {
                        $unit = new WBK_Unit($unit_id);
                        if ( $unit->is_loaded() ) {
                            $min_booking_days = (int) ($unit->get_min_booking_days() ?? 1);
                            $max_booking_days_raw = $unit->get_max_booking_days();
                            $max_booking_days = ( $max_booking_days_raw === null ? max( $min_booking_days, 30 ) : (int) $max_booking_days_raw );
                            $min_booking_days = max( 1, $min_booking_days );
                            $max_booking_days = max( $min_booking_days, $max_booking_days );
                            $max_booking_days = min( $max_booking_days, 90 );
                            $number_of_people = $resolve_number_of_people( $form );
                            if ( $number_of_people === null ) {
                                $fallback_quantity = ( isset( $form["quantity"] ) ? (int) $form["quantity"] : 1 );
                                $number_of_people = max( 1, $fallback_quantity );
                            }
                            $form_location = null;
                            if ( isset( $form["location_id"] ) && is_numeric( $form["location_id"] ) ) {
                                $cand = (int) $form["location_id"];
                                if ( $cand > 0 ) {
                                    $ul = $unit->get_locations();
                                    if ( is_array( $ul ) && !empty( $ul ) && in_array( $cand, array_map( "intval", $ul ), true ) ) {
                                        $form_location = $cand;
                                    }
                                }
                            }
                            $start_ts = strtotime( $selected_day );
                            if ( $start_ts !== false ) {
                                $start_day = strtotime( date( "Y-m-d", $start_ts ) );
                                for ($duration = $min_booking_days; $duration <= $max_booking_days; $duration++) {
                                    $end_day = strtotime( "+" . ($duration - 1) . " days", $start_day );
                                    $availability = WBK_Unit_Availability_Processor::get_availability_for_range(
                                        $unit_id,
                                        [
                                            "start" => date( "Y-m-d", $start_day ),
                                            "end"   => date( "Y-m-d", $end_day ),
                                        ],
                                        $number_of_people,
                                        $form_location
                                    );
                                    if ( $availability === false ) {
                                        continue;
                                    }
                                    $duration_in_minutes = $duration * $minutes_per_day;
                                    $duration_options[(string) $duration_in_minutes] = sprintf( _n(
                                        "%d day",
                                        "%d days",
                                        $duration,
                                        "webba-booking-lite"
                                    ), $duration );
                                }
                            }
                        }
                    }
                    if ( empty( $duration_options ) ) {
                        $duration_options = [
                            "wbk_null" => __( "No available durations", "webba-booking-lite" ),
                        ];
                    }
                    $data[$model]["duration_virtual"] = $duration_options;
                    // get connected unit locations here
                    $location_options = [];
                    if ( $unit_id > 0 ) {
                        $unit_locations = ( method_exists( $unit, "get_locations" ) ? $unit->get_locations() : [] );
                        if ( is_array( $unit_locations ) && !empty( $unit_locations ) ) {
                            foreach ( $unit_locations as $location_id ) {
                                // Load location (assume WBK_Location or similar class exists)
                                if ( class_exists( "WBK_Location" ) ) {
                                    $location = new WBK_Location($location_id);
                                    if ( $location->is_loaded() ) {
                                        $location_options[(string) $location_id] = $location->get_name();
                                    }
                                }
                            }
                        }
                    }
                    if ( empty( $location_options ) ) {
                        $location_options = [
                            "wbk_null" => __( "No available locations", "webba-booking-lite" ),
                        ];
                    }
                    $data[$model]["location_id"] = $location_options;
                    break;
                case "duration_virtual":
                    $minutes_per_day = 24 * 60;
                    $unit_id = ( isset( $form["unit_id"] ) ? (int) $form["unit_id"] : 0 );
                    $selected_day = ( isset( $form["day"] ) ? sanitize_text_field( $form["day"] ) : "" );
                    $duration_value = ( isset( $form["duration_virtual"] ) ? (int) $form["duration_virtual"] : 0 );
                    $duration_in_days = ( $duration_value > 0 ? (int) ceil( $duration_value / $minutes_per_day ) : 0 );
                    $offer_options = [];
                    if ( $unit_id > 0 && $selected_day !== "" && $duration_in_days > 0 ) {
                        $number_of_people = $resolve_number_of_people( $form );
                        if ( $number_of_people === null ) {
                            $fallback_quantity = ( isset( $form["quantity"] ) ? (int) $form["quantity"] : 1 );
                            $number_of_people = max( 1, $fallback_quantity );
                        }
                        $unit_for_location = new WBK_Unit($unit_id);
                        $form_location = null;
                        if ( $unit_for_location->is_loaded() ) {
                            if ( isset( $form["location_id"] ) && is_numeric( $form["location_id"] ) ) {
                                $cand = (int) $form["location_id"];
                                if ( $cand > 0 ) {
                                    $ul = $unit_for_location->get_locations();
                                    if ( is_array( $ul ) && !empty( $ul ) && in_array( $cand, array_map( "intval", $ul ), true ) ) {
                                        $form_location = $cand;
                                    }
                                }
                            }
                        }
                        $start_ts = strtotime( $selected_day );
                        if ( $start_ts !== false ) {
                            $start_day = strtotime( date( "Y-m-d", $start_ts ) );
                            $end_day = strtotime( "+" . ($duration_in_days - 1) . " days", $start_day );
                            $base_range = [
                                "start" => date( "Y-m-d", $start_day ),
                                "end"   => date( "Y-m-d", $end_day ),
                            ];
                            $intervals = WBK_Unit_Availability_Processor::get_closest_intervals_for_range(
                                $unit_id,
                                $base_range,
                                $number_of_people,
                                3,
                                $form_location
                            );
                            if ( is_array( $intervals ) ) {
                                foreach ( $intervals as $interval ) {
                                    if ( !is_array( $interval ) || !isset( $interval["range"]["start"] ) || !isset( $interval["range"]["end"] ) ) {
                                        continue;
                                    }
                                    $offer_start = sanitize_text_field( $interval["range"]["start"] );
                                    $offer_end = sanitize_text_field( $interval["range"]["end"] );
                                    $value = $offer_start . "|" . $offer_end;
                                    $label = $offer_start . " - " . $offer_end;
                                    $availability_payload = ( isset( $interval["availability"] ) ? $interval["availability"] : null );
                                    $availability = ( is_string( $availability_payload ) ? json_decode( $availability_payload, true ) : (( is_array( $availability_payload ) ? $availability_payload : null )) );
                                    if ( is_array( $availability ) && isset( $availability["total_formatted"] ) ) {
                                        $label .= " (" . $availability["total_formatted"] . ")";
                                    }
                                    $shift_days = ( isset( $interval["shift_days"] ) ? (int) $interval["shift_days"] : 0 );
                                    if ( $shift_days === 0 ) {
                                        $label .= " [" . __( "Exact match", "webba-booking-lite" ) . "]";
                                    } else {
                                        $label .= " [" . sprintf( _n(
                                            "%+d day",
                                            "%+d days",
                                            abs( $shift_days ),
                                            "webba-booking-lite"
                                        ), $shift_days ) . "]";
                                    }
                                    $offer_options[$value] = $label;
                                }
                            }
                        }
                    }
                    if ( empty( $offer_options ) ) {
                        $offer_options = [
                            "wbk_null" => __( "No available offers", "webba-booking-lite" ),
                        ];
                    }
                    $data[$model]["available_offer_virtual"] = $offer_options;
                    break;
                default:
                    break;
            }
        }
        $response = new WP_REST_Response($data);
        $response->set_status( 200 );
        return $response;
    }

    /**
     * Returns permission for getting google auth data
     *
     * @param WP_REST_Request $request
     * @return boolean
     */
    public function get_gg_auth_data_permission( $params ) : bool {
        return current_user_can( "read" );
    }

    /**
     * Returns google auth data
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function get_gg_auth_data( WP_REST_Request $request ) : WP_REST_Response {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        $data = [];
        $params = $request->get_params();
        $calendar_id = ( isset( $params["calendar_id"] ) ? sanitize_text_field( $params["calendar_id"] ) : "" );
        if ( !$calendar_id ) {
            $data["isAuthenticated"] = false;
            $data["internalError"] = true;
            $response = new \WP_REST_Response($data);
            $response->set_status( 200 );
            return $response;
        }
        $connected_calendar = new WBK_Connected_Calendar($calendar_id);
        if ( !$connected_calendar->is_loaded() ) {
            $data["isAuthenticated"] = false;
            $data["internalError"] = true;
            $response = new \WP_REST_Response($data);
            $response->set_status( 200 );
            return $response;
        }
        if ( $connected_calendar->is_google() ) {
            $webba_connect = new WBK_Webba_Connect();
            $auth_parameters = $webba_connect->get_google_auth_parameters( $calendar_id );
        } elseif ( $connected_calendar->is_outlook() ) {
            $outlook_calendar = new WBK_Outlook_Calendar_Processor($calendar_id);
            $auth_parameters = $outlook_calendar->get_auth_parameters();
            if ( is_wp_error( $auth_parameters ) ) {
                $data["isAuthenticated"] = false;
                $data["internalError"] = true;
                $response = new \WP_REST_Response($data);
                $response->set_status( 200 );
                return $response;
            }
        } elseif ( $connected_calendar->is_icloud() ) {
            $icloud_calendar = new WBK_Icloud_Calendar_Processor($calendar_id);
            $auth_parameters = $icloud_calendar->get_auth_parameters();
        } else {
            $data["isAuthenticated"] = false;
            $data["internalError"] = true;
            $response = new \WP_REST_Response($data);
            $response->set_status( 200 );
            return $response;
        }
        $response = new \WP_REST_Response($auth_parameters);
        $response->set_status( 200 );
        return $response;
    }

    /**
     * Permission for iCloud Calendar management actions.
     *
     * @param WP_REST_Request $request
     * @return bool
     */
    public function icloud_calendar_manage_permission( $request ) : bool {
        return current_user_can( "manage_options" );
    }

    /**
     * Validate calendar_id + nonce for iCloud actions.
     *
     * @param WP_REST_Request $request
     * @return int|WP_Error
     */
    private function icloud_calendar_request_id( WP_REST_Request $request ) {
        $nonce = $request->get_header( "X-WP-Nonce" );
        if ( !$nonce || !wp_verify_nonce( $nonce, "wp_rest" ) ) {
            return new WP_Error("invalid_nonce", "Invalid security token.", [
                "status" => 403,
            ]);
        }
        $calendar_id = (int) $request->get_param( "calendar_id" );
        if ( $calendar_id < 1 ) {
            return new WP_Error("invalid_calendar", "calendar_id is required.", [
                "status" => 400,
            ]);
        }
        $connected = new WBK_Connected_Calendar($calendar_id);
        if ( !$connected->is_loaded() || !$connected->is_icloud() ) {
            return new WP_Error("invalid_calendar", "iCloud connected calendar not found.", [
                "status" => 404,
            ]);
        }
        return $calendar_id;
    }

    /**
     * Connect iCloud with Apple Account email + app-specific password.
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function icloud_calendar_connect( WP_REST_Request $request ) : WP_REST_Response {
        $calendar_id = $this->icloud_calendar_request_id( $request );
        if ( is_wp_error( $calendar_id ) ) {
            return new WP_REST_Response([
                "ok"      => false,
                "message" => $calendar_id->get_error_message(),
            ], (int) ($calendar_id->get_error_data()["status"] ?? 400));
        }
        $processor = new WBK_Icloud_Calendar_Processor($calendar_id);
        $result = $processor->connect_with_credentials( (string) $request->get_param( "email" ), (string) $request->get_param( "app_password" ) );
        if ( is_wp_error( $result ) ) {
            return new WP_REST_Response([
                "ok"      => false,
                "code"    => $result->get_error_code(),
                "message" => WBK_Icloud_Sync_Orchestrator::redact( $result->get_error_message() ),
            ], 400);
        }
        // Never echo passwords.
        return new WP_REST_Response([
            "ok"   => true,
            "data" => $result,
        ], 200);
    }

    /**
     * Test iCloud CalDAV connection.
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function icloud_calendar_test( WP_REST_Request $request ) : WP_REST_Response {
        $calendar_id = $this->icloud_calendar_request_id( $request );
        if ( is_wp_error( $calendar_id ) ) {
            return new WP_REST_Response([
                "ok"      => false,
                "message" => $calendar_id->get_error_message(),
            ], (int) ($calendar_id->get_error_data()["status"] ?? 400));
        }
        $processor = new WBK_Icloud_Calendar_Processor($calendar_id);
        $email = $request->get_param( "email" );
        $password = $request->get_param( "app_password" );
        $result = $processor->test_connection( ( $email ? (string) $email : null ), ( $password ? (string) $password : null ) );
        if ( is_wp_error( $result ) ) {
            return new WP_REST_Response([
                "ok"      => false,
                "code"    => $result->get_error_code(),
                "message" => WBK_Icloud_Sync_Orchestrator::redact( $result->get_error_message() ),
            ], 400);
        }
        return new WP_REST_Response([
            "ok"   => true,
            "data" => $result,
        ], 200);
    }

    /**
     * Disconnect iCloud: delete credentials and stop connection jobs/cache.
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function icloud_calendar_disconnect( WP_REST_Request $request ) : WP_REST_Response {
        $calendar_id = $this->icloud_calendar_request_id( $request );
        if ( is_wp_error( $calendar_id ) ) {
            return new WP_REST_Response([
                "ok"      => false,
                "message" => $calendar_id->get_error_message(),
            ], (int) ($calendar_id->get_error_data()["status"] ?? 400));
        }
        $processor = new WBK_Icloud_Calendar_Processor($calendar_id);
        $result = $processor->clear_access_token();
        if ( is_wp_error( $result ) ) {
            return new WP_REST_Response([
                "ok"      => false,
                "message" => $result->get_error_message(),
            ], 400);
        }
        return new WP_REST_Response([
            "ok" => true,
        ], 200);
    }

    /**
     * Save the single iCloud calendar used for both export and availability.
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function icloud_calendar_save_mapping( WP_REST_Request $request ) : WP_REST_Response {
        $calendar_id = $this->icloud_calendar_request_id( $request );
        if ( is_wp_error( $calendar_id ) ) {
            return new WP_REST_Response([
                "ok"      => false,
                "message" => $calendar_id->get_error_message(),
            ], (int) ($calendar_id->get_error_data()["status"] ?? 400));
        }
        $provider_calendar_id = (string) $request->get_param( "provider_calendar_id" );
        if ( $provider_calendar_id === "" ) {
            return new WP_REST_Response([
                "ok"      => false,
                "message" => __( "Select a calendar.", "webba-booking-lite" ),
            ], 400);
        }
        $processor = new WBK_Icloud_Calendar_Processor($calendar_id);
        $auth = $processor->get_auth_parameters();
        $calendars = ( isset( $auth["calendarDetails"] ) && is_array( $auth["calendarDetails"] ) ? $auth["calendarDetails"] : [] );
        $by_id = [];
        foreach ( $calendars as $cal ) {
            if ( !empty( $cal["id"] ) ) {
                $by_id[$cal["id"]] = $cal;
            }
        }
        if ( !isset( $by_id[$provider_calendar_id] ) ) {
            return new WP_REST_Response([
                "ok"      => false,
                "message" => __( "Unknown calendar.", "webba-booking-lite" ),
            ], 400);
        }
        if ( !empty( $by_id[$provider_calendar_id]["readonly"] ) ) {
            return new WP_REST_Response([
                "ok"      => false,
                "message" => __( "Read-only calendars cannot be selected for export and availability.", "webba-booking-lite" ),
            ], 400);
        }
        $connected = new WBK_Connected_Calendar($calendar_id);
        $connected->set_in_provider_id( $provider_calendar_id );
        $connected->save();
        return new WP_REST_Response([
            "ok"   => true,
            "data" => [
                "message"        => __( "Calendar saved.", "webba-booking-lite" ),
                "in_provider_id" => $connected->get_in_provider_id(),
            ],
        ], 200);
    }

    /**
     * Permission for Gmail auth data
     *
     * @param WP_REST_Request $request
     * @return boolean
     */
    public function get_gmail_auth_data_permission( $request ) : bool {
        return current_user_can( "manage_options" );
    }

    /**
     * Returns Gmail auth status and authorize/revoke URLs
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function get_gmail_auth_data( WP_REST_Request $request ) : WP_REST_Response {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        $webba_connect = new WBK_Webba_Connect();
        $auth_parameters = $webba_connect->get_gmail_auth_parameters();
        $response = new \WP_REST_Response($auth_parameters);
        $response->set_status( 200 );
        return $response;
    }

    /**
     * Returns Outlook auth data
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function get_outlook_auth_data( WP_REST_Request $request ) : WP_REST_Response {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        $data = [];
        $params = $request->get_params();
        $calendar_id = ( isset( $params["calendar_id"] ) ? sanitize_text_field( $params["calendar_id"] ) : "" );
        if ( !$calendar_id ) {
            $data["isAuthenticated"] = false;
            $response = new \WP_REST_Response($data);
            $response->set_status( 200 );
            return $response;
        }
        // For Outlook, we'll use webba_connect for easy auth
        $webba_connect = new WBK_Webba_Connect();
        $token_response = $webba_connect->get_outlook_access_token( $calendar_id );
        if ( $token_response === false || !isset( $token_response["success"] ) || $token_response["success"] !== true || !isset( $token_response["access_token"] ) || empty( $token_response["access_token"] ) ) {
            $data["isAuthenticated"] = false;
            $data["connectionStatus"] = [
                "authUrl" => $webba_connect->get_outlook_authorization_url( $calendar_id ),
            ];
        } else {
            $data["isAuthenticated"] = true;
            $revoke_url = $webba_connect->get_outlook_revoke_url( $calendar_id );
            $data["connectionStatus"] = [
                "revokeUrl" => $revoke_url,
            ];
        }
        // Get calendars if authenticated
        if ( $data["isAuthenticated"] == true ) {
            $outlook = new WBK_Outlook_Calendar_Processor();
            $calendars_result = $outlook->get_calendars();
            if ( !is_wp_error( $calendars_result ) ) {
                $data["calendars"] = $calendars_result;
            }
        }
        $response = new \WP_REST_Response($data);
        $response->set_status( 200 );
        return $response;
    }

    public function resend_email_permission( $request ) : bool {
        if ( current_user_can( "manage_options" ) ) {
            return true;
        }
        if ( isset( $request["id"] ) && is_numeric( $request["id"] ) ) {
            $booking = new WBK_Booking($request["id"]);
            if ( !$booking->is_loaded() ) {
                return false;
            }
            $service = new WBK_Service($booking->get_service());
            if ( !$service->is_loaded() ) {
                return false;
            }
            return WBK_Validator::check_access_to_service( $booking->get_service() );
        }
        return false;
    }

    /**
     * Get cell detail permission
     *
     * @param array $request
     * @return boolean
     */
    public function get_cell_detail_permission( $request ) : bool {
        return current_user_can( "manage_options" );
    }

    /**
     * Get cell detail
     *
     * @param array $request
     * @return WP_REST_Response
     */
    public function get_cell_detail( $request ) : WP_REST_Response {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        $model = ( isset( $request["model"] ) ? sanitize_text_field( $request["model"] ) : "" );
        $data = [];
        switch ( $model ) {
            case "services":
                $data["forms"] = WBK_Model_Utils::get_cf7_forms();
                break;
            default:
                break;
        }
        $response = new \WP_REST_Response($data);
        $response->set_status( 200 );
        return $response;
    }

    public function get_staff_members_permission( $request ) : bool {
        return true;
        // Public endpoint
    }

    public function get_staff_members( WP_REST_Request $request ) : WP_REST_Response {
        try {
            WBK_Translation_Processor::switch_to_locale_from_get_param();
            $service_id = $request->get_param( "service_id" );
            $location_id = $request->get_param( "location_id" );
            if ( !is_numeric( $service_id ) || intval( $service_id ) <= 0 ) {
                return new WP_REST_Response([
                    "error" => "Invalid service ID",
                ], 400);
            }
            $service_id = intval( $service_id );
            $service = new WBK_Service($service_id);
            if ( !$service->is_loaded() ) {
                return new WP_REST_Response([
                    "error" => "Service not found",
                ], 404);
            }
            $location_filter_applied = !is_null( $location_id ) && $location_id !== "";
            if ( $location_filter_applied ) {
                if ( !is_numeric( $location_id ) || intval( $location_id ) <= 0 ) {
                    return new WP_REST_Response([
                        "error" => "Invalid location ID",
                    ], 400);
                }
                $location_id = intval( $location_id );
                $location = new WBK_Location($location_id);
                if ( !$location->is_loaded() ) {
                    return new WP_REST_Response([
                        "error" => "Invalid location ID",
                    ], 400);
                }
            }
            $staff_ids = WBK_Model_Utils::get_staff_member_ids_by_service( $service_id );
            $staff_members = [];
            foreach ( $staff_ids as $staff_id ) {
                $staff_member = new WBK_Staff_Member($staff_id);
                if ( !$staff_member->is_loaded() ) {
                    continue;
                }
                $staff_locations = $staff_member->get_location();
                if ( $location_filter_applied && !in_array( intval( $location_id ), $staff_locations, true ) ) {
                    continue;
                }
                $photo = $staff_member->get_photo();
                $staff_members[] = [
                    "id"        => intval( $staff_id ),
                    "value"     => intval( $staff_id ),
                    "label"     => $staff_member->get_name(),
                    "photo"     => ( !empty( $photo ) && $photo ? wp_get_attachment_url( $photo ) : false ),
                    "services"  => $staff_member->get_services(),
                    "locations" => $staff_locations,
                ];
            }
            $data = [
                "service_id"              => $service_id,
                "location_id"             => ( $location_filter_applied ? $location_id : null ),
                "location_filter_applied" => $location_filter_applied,
                "staff_members"           => $staff_members,
            ];
            return new WP_REST_Response($data, 200);
        } catch ( \Exception $e ) {
            return new WP_REST_Response([
                "error" => "Internal server error",
            ], 500);
        }
    }

    /**
     * Get service availability permission check
     * @return bool
     */
    public function get_service_availability_permission( $request ) : bool {
        return true;
    }

    /**
     * Get service availability for a given service in a date range
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function get_service_availability( WP_REST_Request $request ) : WP_REST_Response {
        try {
            WBK_Translation_Processor::switch_to_locale_from_get_param();
            date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
            $service_id = $request->get_param( "service_id" );
            $start_date = $request->get_param( "start_date" );
            $end_date = $request->get_param( "end_date" );
            $staff_member_id = $request->get_param( "staff_member_id" );
            $first_only = rest_sanitize_boolean( $request->get_param( "first_only" ) );
            if ( !is_numeric( $service_id ) ) {
                return new WP_REST_Response([
                    "error" => "Invalid service ID",
                ], 400);
            }
            $service = new WBK_Service($service_id);
            if ( !$service->is_loaded() ) {
                return new WP_REST_Response([
                    "error" => "Service not found",
                ], 404);
            }
            $start_timestamp = strtotime( $start_date ?? "1970-01-01" );
            $end_timestamp = strtotime( $end_date ?? "1970-01-01" );
            if ( $first_only ) {
                if ( $start_timestamp === false ) {
                    return new WP_REST_Response([
                        "error" => "Invalid date format",
                    ], 400);
                }
            } else {
                if ( $start_timestamp === false || $end_timestamp === false ) {
                    return new WP_REST_Response([
                        "error" => "Invalid date format",
                    ], 400);
                }
                if ( $start_timestamp > $end_timestamp ) {
                    return new WP_REST_Response([
                        "error" => "Start date must be before end date",
                    ], 400);
                }
            }
            $days_difference = ( $first_only ? WBK_Model_Utils::get_availability_search_day_count( $service ) : ceil( ($end_timestamp - $start_timestamp) / 86400 ) + 1 );
            if ( $staff_member_id !== null && (int) $staff_member_id === 0 ) {
                $staff_member_ids = WBK_Model_Utils::get_staff_member_ids_by_service( $service_id );
                $available_dates = [];
                foreach ( $staff_member_ids as $staff_id ) {
                    $dates = WBK_Model_Utils::get_service_availability_in_range(
                        $service_id,
                        $start_date,
                        $days_difference,
                        $staff_id,
                        false,
                        $first_only
                    );
                    $available_dates = array_merge( $available_dates, $dates );
                }
                $available_dates = array_unique( $available_dates );
            } else {
                $available_dates = WBK_Model_Utils::get_service_availability_in_range(
                    $service_id,
                    $start_date,
                    $days_difference,
                    $staff_member_id,
                    false,
                    $first_only
                );
            }
            if ( $first_only ) {
                $earliest_date = WBK_Model_Utils::get_earliest_availability_date( $available_dates );
                if ( !$earliest_date ) {
                    $filtered_dates = [];
                } else {
                    $earliest_parts = array_map( "intval", explode( ",", $earliest_date ) );
                    $filtered_dates = array_values( array_filter( $available_dates, function ( $date ) use($earliest_parts) {
                        $date_parts = array_map( "intval", explode( ",", (string) $date ) );
                        return count( $date_parts ) === 3 && $date_parts[0] === $earliest_parts[0] && $date_parts[1] === $earliest_parts[1];
                    } ) );
                    usort( $filtered_dates, function ( $left, $right ) {
                        $left_parts = array_map( "intval", explode( ",", (string) $left ) );
                        $right_parts = array_map( "intval", explode( ",", (string) $right ) );
                        return $left_parts <=> $right_parts;
                    } );
                }
            } else {
                // Filter dates based on the date parts in the format YYYY,M,D
                $filtered_dates = array_filter( $available_dates, function ( $date ) use($start_timestamp, $end_timestamp) {
                    $date_parts = explode( ",", $date );
                    if ( count( $date_parts ) !== 3 ) {
                        return false;
                    }
                    $year = intval( $date_parts[0] );
                    $month = intval( $date_parts[1] ) + 1;
                    // Month is 0-based in the data
                    $day = intval( $date_parts[2] );
                    $date_timestamp = mktime(
                        0,
                        0,
                        0,
                        $month,
                        $day,
                        $year
                    );
                    return $date_timestamp >= $start_timestamp && $date_timestamp <= $end_timestamp;
                } );
            }
            return new WP_REST_Response([
                "service_id" => $service_id,
                "start_date" => $start_date,
                "end_date"   => $end_date,
                "dates"      => array_values( $filtered_dates ),
            ], 200);
        } catch ( \Exception $e ) {
            return new WP_REST_Response([
                "error" => "Internal server error",
            ], 500);
        } finally {
            date_default_timezone_set( "UTC" );
        }
    }

    public function get_service_time_slots_permission( $request ) : bool {
        return true;
        // Public endpoint, no special permissions needed
    }

    public function get_recurring_booking_time_slots_permission( $request ) : bool {
        return true;
    }

    /**
     * Get unit availability for range permission check.
     *
     * @param WP_REST_Request $request Request object.
     * @return bool
     */
    public function get_unit_availability_for_range_permission( $request ) : bool {
        return true;
        // Public endpoint, no special permissions needed.
    }

    /**
     * Closest-intervals endpoint permission check.
     *
     * @param WP_REST_Request $request Request object.
     * @return bool
     */
    public function get_closest_intervals_for_range_permission( $request ) : bool {
        return true;
    }

    /**
     * Parse and validate unit/range/capacity params shared by unit availability REST handlers.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|array Response on validation error, or
     *         [ unit_id, range, number_of_people, location_id ] on success. location_id may be null.
     */
    private function parse_unit_availability_for_range_request( WP_REST_Request $request ) {
        $unit_id = $request->get_param( "unit_id" );
        if ( !is_numeric( $unit_id ) ) {
            return new WP_REST_Response([
                "error" => "Invalid unit ID",
            ], 400);
        }
        $range = $request->get_param( "range" );
        if ( !is_array( $range ) ) {
            $start = $request->get_param( "start" );
            $end = $request->get_param( "end" );
            if ( $start !== null && $end !== null ) {
                $range = [
                    "start" => $start,
                    "end"   => $end,
                ];
            }
        }
        if ( !is_array( $range ) || !isset( $range["start"] ) || !isset( $range["end"] ) ) {
            return new WP_REST_Response([
                "error" => "Invalid range",
            ], 400);
        }
        $number_of_people = $request->get_param( "number_of_people" );
        if ( $number_of_people === "" || $number_of_people === "null" ) {
            $number_of_people = null;
        } elseif ( is_string( $number_of_people ) ) {
            $decoded_people = json_decode( $number_of_people, true );
            if ( json_last_error() === JSON_ERROR_NONE && is_array( $decoded_people ) ) {
                $number_of_people = $decoded_people;
            } elseif ( is_numeric( $number_of_people ) ) {
                $number_of_people = (int) $number_of_people;
            } else {
                $number_of_people = null;
            }
        }
        $location_id = $request->get_param( "location_id" );
        if ( $location_id === "" || $location_id === null ) {
            $location_id = null;
        } elseif ( is_numeric( $location_id ) && (int) $location_id > 0 ) {
            $location_id = (int) $location_id;
        } else {
            return new WP_REST_Response([
                "error" => "Invalid location_id",
            ], 400);
        }
        $unit_for_validation = new WBK_Unit((int) $unit_id);
        if ( $location_id !== null ) {
            if ( !$unit_for_validation->is_loaded() ) {
                return new WP_REST_Response([
                    "error" => "Unit not found",
                ], 404);
            }
            $ulocs = $unit_for_validation->get_locations();
            if ( is_array( $ulocs ) && !empty( $ulocs ) ) {
                $ulocs = array_map( "intval", $ulocs );
                if ( !in_array( $location_id, $ulocs, true ) ) {
                    return new WP_REST_Response([
                        "error" => "location_id is not available for this unit",
                    ], 400);
                }
            } else {
                $location_id = null;
            }
        }
        if ( $number_of_people !== null ) {
            $unit_for_capacity = ( $unit_for_validation->is_loaded() ? $unit_for_validation : new WBK_Unit((int) $unit_id) );
            if ( !$unit_for_capacity->is_loaded() ) {
                return new WP_REST_Response([
                    "error" => "Unit not found",
                ], 404);
            }
            $unit_capacity = $unit_for_capacity->get_capacity();
            if ( is_array( $number_of_people ) ) {
                $total_people = max( 0, (int) ($number_of_people["adult"] ?? 0) ) + max( 0, (int) ($number_of_people["child"] ?? 0) ) + max( 0, (int) ($number_of_people["infant"] ?? 0) );
            } elseif ( is_int( $number_of_people ) || is_numeric( $number_of_people ) && !is_string( $number_of_people ) ) {
                $total_people = (int) $number_of_people;
            } else {
                return new WP_REST_Response([
                    "error" => "Invalid number_of_people",
                ], 400);
            }
            if ( $total_people < 1 ) {
                return new WP_REST_Response([
                    "error" => "number_of_people must be at least 1",
                ], 400);
            }
            if ( $total_people > $unit_capacity ) {
                return new WP_REST_Response([
                    "error" => "number_of_people exceeds unit capacity",
                ], 400);
            }
        }
        return [
            "unit_id"          => (int) $unit_id,
            "range"            => $range,
            "number_of_people" => $number_of_people,
            "location_id"      => $location_id,
        ];
    }

    /**
     * Public endpoint for unit availability in a date range.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response
     */
    public function get_unit_availability_for_range( WP_REST_Request $request ) : WP_REST_Response {
        $prev_time_zone = date_default_timezone_get();
        date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
        try {
            $parsed = $this->parse_unit_availability_for_range_request( $request );
            if ( $parsed instanceof WP_REST_Response ) {
                return $parsed;
            }
            $availability_response = WBK_Unit_Availability_Processor::get_availability_for_range(
                $parsed["unit_id"],
                $parsed["range"],
                $parsed["number_of_people"],
                $parsed["location_id"] ?? null
            );
            if ( $availability_response === false ) {
                return new WP_REST_Response([
                    "available" => false,
                ], 200);
            }
            if ( is_string( $availability_response ) ) {
                $decoded_response = json_decode( $availability_response, true );
                if ( json_last_error() === JSON_ERROR_NONE && is_array( $decoded_response ) ) {
                    return new WP_REST_Response($decoded_response, 200);
                }
            }
            return new WP_REST_Response($availability_response, 200);
        } catch ( \Exception $e ) {
            return new WP_REST_Response([
                "error" => "Internal server error",
            ], 500);
        } finally {
            date_default_timezone_set( $prev_time_zone );
        }
    }

    /**
     * Public endpoint for closest bookable intervals near a requested range (see WBK_Unit_Availability_Processor::get_closest_intervals_for_range).
     *
     * Expects the same body as get-unit-availability-for-range plus days_to_shift (positive integer).
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response
     */
    public function get_closest_intervals_for_range( WP_REST_Request $request ) : WP_REST_Response {
        $prev_time_zone = date_default_timezone_get();
        date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
        try {
            $parsed = $this->parse_unit_availability_for_range_request( $request );
            if ( $parsed instanceof WP_REST_Response ) {
                return $parsed;
            }
            $days_to_shift = $request->get_param( "days_to_shift" );
            if ( $days_to_shift === null || $days_to_shift === "" || !is_numeric( $days_to_shift ) ) {
                return new WP_REST_Response([
                    "error" => "Invalid days_to_shift",
                ], 400);
            }
            $days_to_shift = (int) $days_to_shift;
            if ( $days_to_shift < 1 ) {
                return new WP_REST_Response([
                    "error" => "days_to_shift must be at least 1",
                ], 400);
            }
            $intervals = WBK_Unit_Availability_Processor::get_closest_intervals_for_range(
                $parsed["unit_id"],
                $parsed["range"],
                $parsed["number_of_people"],
                $days_to_shift,
                $parsed["location_id"] ?? null
            );
            return new WP_REST_Response($intervals, 200);
        } catch ( \Exception $e ) {
            return new WP_REST_Response([
                "error" => "Internal server error",
            ], 500);
        } finally {
            date_default_timezone_set( $prev_time_zone );
        }
    }

    public function get_service_time_slots( WP_REST_Request $request ) : WP_REST_Response {
        try {
            WBK_Translation_Processor::switch_to_locale_from_get_param();
            date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
            $service_id = $request->get_param( "service_id" );
            $date = $request->get_param( "date" );
            $offset = $request->get_param( "offset" ) ?? 0;
            $staff_member_id = $request->get_param( "staff_member_id" );
            if ( !is_numeric( $service_id ) ) {
                return new WP_REST_Response([
                    "error" => "Invalid service ID",
                ], 400);
            }
            $service = new WBK_Service($service_id);
            if ( !$service->is_loaded() ) {
                return new WP_REST_Response([
                    "error" => "Service not found",
                ], 404);
            }
            $staff_member = null;
            if ( isset( $staff_member_id ) && $staff_member_id !== "" ) {
                if ( !ctype_digit( $staff_member_id ) ) {
                    return new WP_REST_Response([
                        "error" => "Wrong staff member ID.",
                    ], 400);
                }
                $staff_member_id = (int) $staff_member_id;
                if ( $staff_member_id !== 0 ) {
                    $staff_member = new WBK_Staff_Member($staff_member_id);
                    if ( !$staff_member->is_loaded() ) {
                        return new WP_REST_Response([
                            "error" => "Staff member not found.",
                        ], 404);
                    }
                    $staff_services = $staff_member->get_services();
                    if ( !in_array( (int) $service_id, array_map( "intval", (array) $staff_services ), true ) ) {
                        return new WP_REST_Response([
                            "error" => "Staff member does not provide this service.",
                        ], 400);
                    }
                }
            } else {
                $staff_member_id = null;
            }
            if ( empty( $date ) ) {
                return new WP_REST_Response([
                    "error" => "Date is required",
                ], 400);
            }
            // Convert date to timestamp
            if ( !is_numeric( $date ) ) {
                $day_to_render = strtotime( $date );
            } else {
                $day_to_render = intval( $date );
            }
            if ( $day_to_render === false ) {
                return new WP_REST_Response([
                    "error" => "Invalid date format",
                ], 400);
            }
            $sp = new WBK_Schedule_Processor();
            $options = [
                "skip_gg_calendar"       => false,
                "ignore_preparation"     => false,
                "calculate_availability" => true,
                "filter_availability"    => false,
                "offset"                 => $offset,
            ];
            if ( $staff_member_id !== null && $staff_member_id === 0 ) {
                $staff_member_ids = WBK_Model_Utils::get_staff_member_ids_by_service( $service_id );
                $slots_by_start = [];
                foreach ( $staff_member_ids as $staff_id ) {
                    $timeslots = $sp->get_time_slots_by_day(
                        $day_to_render,
                        $service_id,
                        $options,
                        null,
                        true,
                        $staff_id
                    );
                    if ( !is_array( $timeslots ) ) {
                        continue;
                    }
                    foreach ( $timeslots as $slot ) {
                        $start = $slot->get_start();
                        $is_locked = (int) $slot->get_status() === -2;
                        if ( !isset( $slots_by_start[$start] ) ) {
                            $slots_by_start[$start] = [
                                "slot"             => $slot,
                                "staff_member_ids" => [],
                                "free_places"      => 0,
                                "locked_count"     => 0,
                                "slot_count"       => 0,
                            ];
                        }
                        $slots_by_start[$start]["staff_member_ids"][] = $staff_id;
                        $slots_by_start[$start]["free_places"] += $slot->get_free_places();
                        $slots_by_start[$start]["slot_count"]++;
                        if ( $is_locked ) {
                            $slots_by_start[$start]["locked_count"]++;
                        }
                    }
                }
                ksort( $slots_by_start );
                $formatted_slots = array_map( function ( $item ) {
                    return [
                        "start_time"           => $item["slot"]->get_start(),
                        "end_time"             => $item["slot"]->get_end(),
                        "free_places"          => $item["free_places"],
                        "formatted_time"       => $item["slot"]->get_formated_time(),
                        "formatted_time_local" => $item["slot"]->get_formated_time_local(),
                        "staff_member_ids"     => $item["staff_member_ids"],
                        "is_locked"            => $item["slot_count"] > 0 && $item["locked_count"] === $item["slot_count"],
                    ];
                }, array_values( $slots_by_start ) );
            } else {
                $timeslots = $sp->get_time_slots_by_day(
                    $day_to_render,
                    $service_id,
                    $options,
                    null,
                    true,
                    $staff_member_id
                );
                if ( !is_array( $timeslots ) ) {
                    $timeslots = [];
                }
                $formatted_slots = array_map( function ( $slot ) use($staff_member_id) {
                    $result = [
                        "start_time"           => $slot->get_start(),
                        "end_time"             => $slot->get_end(),
                        "free_places"          => $slot->get_free_places(),
                        "formatted_time"       => $slot->get_formated_time(),
                        "formatted_time_local" => $slot->get_formated_time_local(),
                        "is_locked"            => (int) $slot->get_status() === -2,
                    ];
                    if ( $staff_member_id !== null ) {
                        $result["staff_member_ids"] = [$staff_member_id];
                    }
                    return $result;
                }, $timeslots );
            }
            $formatted_slots = apply_filters(
                "wbk_frontend_time_slots",
                $formatted_slots,
                $service_id,
                $day_to_render
            );
            return new WP_REST_Response([
                "service_id" => $service_id,
                "date"       => date( "Y-m-d", $day_to_render ),
                "time_slots" => $formatted_slots,
            ], 200);
        } catch ( \Exception $e ) {
            return new WP_REST_Response([
                "error" => "Internal server error",
            ], 500);
        } finally {
            date_default_timezone_set( "UTC" );
        }
    }

    /**
     * Build recurring booking time slots for a selected slot and repeat pattern.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response
     */
    public function get_recurring_booking_time_slots( WP_REST_Request $request ) : WP_REST_Response {
        try {
            WBK_Translation_Processor::switch_to_locale_from_get_param();
            date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
            $service_id = $request->get_param( "service_id" );
            $time_slot = $request->get_param( "time_slot" );
            $repeats = $request->get_param( "repeats" );
            $number_of_timeslots = $request->get_param( "number_of_timeslots" );
            $repeat_interval = $request->get_param( "repeat_interval" );
            $offset = $request->get_param( "offset" ) ?? 0;
            $staff_member_id = $request->get_param( "staff_member_id" );
            if ( !is_numeric( $service_id ) ) {
                return new WP_REST_Response([
                    "error" => "Invalid service ID",
                ], 400);
            }
            $service = new WBK_Service($service_id);
            if ( !$service->is_loaded() ) {
                return new WP_REST_Response([
                    "error" => "Service not found",
                ], 404);
            }
            if ( $time_slot === null || $time_slot === "" || !is_numeric( $time_slot ) ) {
                return new WP_REST_Response([
                    "error" => "Invalid time slot",
                ], 400);
            }
            $time_slot = (int) $time_slot;
            if ( $repeats === null || $repeats === "" || !is_numeric( $repeats ) ) {
                return new WP_REST_Response([
                    "error" => "Invalid repeats",
                ], 400);
            }
            $repeats = (int) $repeats;
            if ( $repeats < 1 ) {
                return new WP_REST_Response([
                    "error" => "Repeats must be at least 1",
                ], 400);
            }
            if ( $number_of_timeslots === null || $number_of_timeslots === "" || !is_numeric( $number_of_timeslots ) ) {
                return new WP_REST_Response([
                    "error" => "Invalid number of time slots",
                ], 400);
            }
            $number_of_timeslots = (int) $number_of_timeslots;
            if ( $number_of_timeslots < 1 ) {
                return new WP_REST_Response([
                    "error" => "Number of time slots must be at least 1",
                ], 400);
            }
            $allowed_intervals = ["day", "week", "month"];
            if ( !in_array( $repeat_interval, $allowed_intervals, true ) ) {
                return new WP_REST_Response([
                    "error" => "Invalid repeat_interval. Use day, week, or month.",
                ], 400);
            }
            if ( $service->get( "recurring_booking_enabled" ) === "yes" ) {
                $recurring_intervals_raw = $service->get( "recurring_intervals" );
                $recurring_intervals = ["day", "week", "month"];
                if ( !empty( $recurring_intervals_raw ) ) {
                    $recurring_intervals_decoded = json_decode( $recurring_intervals_raw );
                    if ( !is_array( $recurring_intervals_decoded ) ) {
                        $recurring_intervals_decoded = json_decode( stripslashes( $recurring_intervals_raw ) );
                    }
                    if ( is_array( $recurring_intervals_decoded ) ) {
                        $recurring_intervals = array_values( array_filter( $recurring_intervals_decoded ) );
                    }
                }
                if ( !in_array( $repeat_interval, $recurring_intervals, true ) ) {
                    return new WP_REST_Response([
                        "error" => "Repeat interval is not allowed for this service.",
                    ], 400);
                }
                $recurring_min_count = (int) $service->get( "recurring_min_appointments" );
                if ( $recurring_min_count < 1 ) {
                    $recurring_min_count = 2;
                }
                $recurring_max_count = (int) $service->get( "recurring_max_appointments" );
                if ( $recurring_max_count < 1 ) {
                    $recurring_max_count = 12;
                }
                if ( $number_of_timeslots < $recurring_min_count || $number_of_timeslots > $recurring_max_count ) {
                    return new WP_REST_Response([
                        "error" => sprintf( "Number of time slots must be between %d and %d for this service.", $recurring_min_count, $recurring_max_count ),
                    ], 400);
                }
            }
            if ( isset( $staff_member_id ) && $staff_member_id !== "" ) {
                if ( !ctype_digit( (string) $staff_member_id ) ) {
                    return new WP_REST_Response([
                        "error" => "Wrong staff member ID.",
                    ], 400);
                }
                $staff_member_id = (int) $staff_member_id;
                if ( $staff_member_id !== 0 ) {
                    $staff_member = new WBK_Staff_Member($staff_member_id);
                    if ( !$staff_member->is_loaded() ) {
                        return new WP_REST_Response([
                            "error" => "Staff member not found.",
                        ], 404);
                    }
                    $staff_services = $staff_member->get_services();
                    if ( !in_array( (int) $service_id, array_map( "intval", (array) $staff_services ), true ) ) {
                        return new WP_REST_Response([
                            "error" => "Staff member does not provide this service.",
                        ], 400);
                    }
                }
            } else {
                $staff_member_id = null;
            }
            $base_day = strtotime( "today midnight", $time_slot );
            if ( $base_day === false ) {
                return new WP_REST_Response([
                    "error" => "Invalid time slot",
                ], 400);
            }
            $time_offset = $time_slot - $base_day;
            $slot_duration = $service->get_duration() * 60;
            $sp = new WBK_Schedule_Processor();
            $options = [
                "skip_gg_calendar"       => false,
                "ignore_preparation"     => false,
                "calculate_availability" => true,
                "filter_availability"    => false,
                "offset"                 => $offset,
            ];
            $recurring_slots = [];
            $last_resolved_start = null;
            $used_start_times = [];
            $occurrence_index = 0;
            $max_occurrences = ($number_of_timeslots + 14) * max( 1, $repeats ) * (( $repeat_interval === "day" ? 7 : 1 ));
            while ( count( $recurring_slots ) < $number_of_timeslots && $occurrence_index < $max_occurrences ) {
                $target_day = $this->get_recurring_booking_target_day( $base_day, $occurrence_index * $repeats, $repeat_interval );
                $occurrence_index++;
                if ( $sp->get_day_status( $target_day, (int) $service_id, $staff_member_id ) != 1 ) {
                    continue;
                }
                $expected_start = strtotime( "today midnight", $target_day ) + $time_offset;
                $resolved = $this->find_recurring_booking_slot(
                    $sp,
                    (int) $service_id,
                    $target_day,
                    $expected_start,
                    $options,
                    $staff_member_id,
                    $last_resolved_start,
                    $used_start_times
                );
                if ( $resolved["slot"] !== null ) {
                    $slot = $resolved["slot"];
                    $timeslot_payload = $this->format_recurring_booking_timeslot( $slot, $staff_member_id );
                } else {
                    $timeslot_payload = [
                        "start_time"           => $expected_start,
                        "end_time"             => $expected_start + $slot_duration,
                        "free_places"          => 0,
                        "formatted_time"       => wp_date( WBK_Date_Time_Utils::get_time_format(), $expected_start ),
                        "formatted_time_local" => wp_date( WBK_Date_Time_Utils::get_time_format(), $expected_start ),
                    ];
                    if ( $staff_member_id !== null ) {
                        $timeslot_payload["staff_member_ids"] = ( $staff_member_id === 0 ? [] : [$staff_member_id] );
                    }
                }
                $recurring_slots[] = [
                    "timeslot" => $timeslot_payload,
                    "status"   => ( $resolved["slot"] === null ? "unavailable" : (( $resolved["status"] === "time_adjusted" ? "adjusted" : "available" )) ),
                ];
                if ( $resolved["slot"] !== null ) {
                    $last_resolved_start = (int) $resolved["slot"]->get_start();
                    $used_start_times[] = $last_resolved_start;
                }
            }
            return new WP_REST_Response([
                "service_id"          => (int) $service_id,
                "repeat_interval"     => $repeat_interval,
                "repeats"             => $repeats,
                "number_of_timeslots" => $number_of_timeslots,
                "time_slots"          => $recurring_slots,
            ], 200);
        } catch ( \Exception $e ) {
            return new WP_REST_Response([
                "error" => "Internal server error",
            ], 500);
        } finally {
            date_default_timezone_set( "UTC" );
        }
    }

    /**
     * Target day (midnight timestamp) for a recurring occurrence.
     *
     * @param int    $base_day        Midnight timestamp of the original booking day.
     * @param int    $repeat_index    Zero-based occurrence index.
     * @param string $repeat_interval day|week|month.
     * @return int
     */
    private function get_recurring_booking_target_day( int $base_day, int $repeat_index, string $repeat_interval ) : int {
        if ( $repeat_index === 0 ) {
            return $base_day;
        }
        $timezone = new \DateTimeZone(get_option( "wbk_timezone", "UTC" ));
        $base_date = new \DateTime("@" . $base_day);
        $base_date->setTimezone( $timezone );
        if ( $repeat_interval === "day" ) {
            $target_date = clone $base_date;
            $target_date->modify( "+{$repeat_index} day" );
        } elseif ( $repeat_interval === "week" ) {
            $target_date = clone $base_date;
            $target_date->modify( "+{$repeat_index} week" );
        } else {
            $target_date = clone $base_date;
            $target_date->modify( "+{$repeat_index} month" );
        }
        return strtotime( "today midnight", $target_date->getTimestamp() );
    }

    /**
     * Fetch time slots for a day (mirrors get_service_time_slots aggregation).
     *
     * @return WBK_Time_Slot[]
     */
    private function fetch_service_time_slots_by_day(
        WBK_Schedule_Processor $sp,
        int $day,
        int $service_id,
        array $options,
        $staff_member_id
    ) : array {
        if ( $staff_member_id !== null && $staff_member_id === 0 ) {
            $staff_member_ids = WBK_Model_Utils::get_staff_member_ids_by_service( $service_id );
            $slots_by_start = [];
            foreach ( $staff_member_ids as $staff_id ) {
                $timeslots = $sp->get_time_slots_by_day(
                    $day,
                    $service_id,
                    $options,
                    null,
                    true,
                    $staff_id
                );
                if ( !is_array( $timeslots ) ) {
                    continue;
                }
                foreach ( $timeslots as $slot ) {
                    $start = $slot->get_start();
                    if ( !isset( $slots_by_start[$start] ) ) {
                        $slots_by_start[$start] = $slot;
                        $slots_by_start[$start]->set_free_places( 0 );
                    }
                    $slots_by_start[$start]->set_free_places( $slots_by_start[$start]->get_free_places() + $slot->get_free_places() );
                }
            }
            ksort( $slots_by_start );
            return array_values( $slots_by_start );
        }
        $timeslots = $sp->get_time_slots_by_day(
            $day,
            $service_id,
            $options,
            null,
            true,
            $staff_member_id
        );
        return ( is_array( $timeslots ) ? $timeslots : [] );
    }

    /**
     * Resolve one recurring occurrence to an available slot.
     *
     * @return array{slot: ?WBK_Time_Slot, status: string}
     */
    private function find_recurring_booking_slot(
        WBK_Schedule_Processor $sp,
        int $service_id,
        int $target_day,
        int $expected_start,
        array $options,
        $staff_member_id,
        ?int $last_resolved_start = null,
        array $used_start_times = []
    ) : array {
        $search_day = $target_day;
        if ( $last_resolved_start !== null ) {
            $day_after_last = strtotime( "+1 day", strtotime( "today midnight", $last_resolved_start ) );
            if ( $day_after_last !== false && $search_day < $day_after_last ) {
                $search_day = $day_after_last;
            }
        }
        $time_offset = $expected_start - strtotime( "today midnight", $expected_start );
        $used_start_times = array_map( "intval", $used_start_times );
        $expected_on_day = strtotime( "today midnight", $search_day ) + $time_offset;
        $timeslots = $this->fetch_service_time_slots_by_day(
            $sp,
            $search_day,
            $service_id,
            $options,
            $staff_member_id
        );
        if ( !empty( $timeslots ) ) {
            foreach ( $timeslots as $slot ) {
                $start = (int) $slot->get_start();
                if ( in_array( $start, $used_start_times, true ) ) {
                    continue;
                }
                if ( $start === $expected_on_day && $slot->get_free_places() > 0 ) {
                    return [
                        "slot"   => $slot,
                        "status" => "exact",
                    ];
                }
            }
            $fallback_slot = $this->find_immediate_next_available_slot( $timeslots, $expected_on_day, $used_start_times );
            if ( $fallback_slot !== null ) {
                return [
                    "slot"   => $fallback_slot,
                    "status" => "time_adjusted",
                ];
            }
        }
        return [
            "slot"   => null,
            "status" => "unavailable",
        ];
    }

    /**
     * Next timeslot in the day's schedule right after the expected start (not any later slot).
     *
     * @param WBK_Time_Slot[] $timeslots
     * @param int             $expected_on_day
     * @param int[]           $used_start_times
     * @return WBK_Time_Slot|null
     */
    private function find_immediate_next_available_slot( array $timeslots, int $expected_on_day, array $used_start_times ) : ?WBK_Time_Slot {
        if ( empty( $timeslots ) ) {
            return null;
        }
        usort( $timeslots, function ( $a, $b ) {
            return $a->get_start() - $b->get_start();
        } );
        $expected_index = null;
        foreach ( $timeslots as $index => $slot ) {
            if ( (int) $slot->get_start() === $expected_on_day ) {
                $expected_index = $index;
                break;
            }
        }
        if ( $expected_index === null ) {
            return null;
        }
        $next_index = $expected_index + 1;
        if ( !isset( $timeslots[$next_index] ) ) {
            return null;
        }
        $next_slot = $timeslots[$next_index];
        $next_start = (int) $next_slot->get_start();
        if ( in_array( $next_start, $used_start_times, true ) || $next_slot->get_free_places() <= 0 ) {
            return null;
        }
        return $next_slot;
    }

    /**
     * @param WBK_Time_Slot $slot
     * @return array<string, mixed>
     */
    private function format_recurring_booking_timeslot( $slot, $staff_member_id ) : array {
        $result = [
            "start_time"           => $slot->get_start(),
            "end_time"             => $slot->get_end(),
            "free_places"          => $slot->get_free_places(),
            "formatted_time"       => $slot->get_formated_time(),
            "formatted_time_local" => $slot->get_formated_time_local(),
        ];
        if ( $staff_member_id !== null ) {
            $result["staff_member_ids"] = ( $staff_member_id === 0 ? [] : [$staff_member_id] );
        }
        return $result;
    }

    public function get_form_fields_permission( $request ) : bool {
        return true;
        // Public endpoint
    }

    public function get_form_fields( WP_REST_Request $request ) : WP_REST_Response {
        try {
            WBK_Translation_Processor::switch_to_locale_from_get_param();
            $service_ids = $request->get_param( "ids" );
            // Validate service IDs
            if ( !is_array( $service_ids ) || empty( $service_ids ) ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => "Service IDs must be a non-empty array",
                ], 400);
            }
            // Validate each ID is a positive integer
            foreach ( $service_ids as $id ) {
                if ( !is_numeric( $id ) || $id <= 0 ) {
                    return new WP_REST_Response([
                        "success" => false,
                        "message" => "Invalid service ID: " . $id,
                    ], 400);
                }
            }
            global $wpdb;
            $db_prefix = $wpdb->prefix;
            $form = new WbkData\Model($db_prefix . "wbk_forms");
            $all_fields = [];
            $found_forms = false;
            // Get fields for each service
            if ( WBK_Feature_Gate::have_required_plan( "standard" ) ) {
                foreach ( $service_ids as $service_id ) {
                    // Get the service
                    $service = new WBK_Service($service_id);
                    if ( !$service->is_loaded() ) {
                        continue;
                    }
                    // Get the form ID from the service
                    $form_id = $service->get( "form_builder" );
                    if ( !$form_id || $form_id == "0" ) {
                        $fields = WBK_Form_Builder_Utils::get_default_fields();
                    } else {
                        $form = new WBK_Form($form_id);
                        if ( !$form->is_loaded() ) {
                            continue;
                        }
                        $fields = $form->get_fields();
                    }
                    if ( is_array( $fields ) ) {
                        $found_forms = true;
                        foreach ( $fields as $field ) {
                            if ( !isset( $field["slug"] ) || isset( $all_fields[$field["slug"]] ) ) {
                                continue;
                            }
                            $all_fields[$field["slug"]] = WBK_Translation_Processor::translate_form_field( $field, $form_id );
                        }
                    }
                }
            }
            if ( !WBK_Feature_Gate::have_required_plan( "standard" ) || $found_forms === false ) {
                $found_forms = true;
                $all_fields = WBK_Form_Builder_Utils::get_default_fields();
                $default_form_id = WBK_Form_Builder_Utils::get_default_form_id();
                $translate_key = ( $default_form_id ? $default_form_id : "default" );
                $all_fields = array_map( function ( $field ) use($translate_key) {
                    return WBK_Translation_Processor::translate_form_field( $field, $translate_key );
                }, $all_fields );
            }
            if ( !$found_forms ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => "No forms found",
                ], 404);
            }
            return new WP_REST_Response([
                "success" => true,
                "data"    => [
                    "service_ids" => $service_ids,
                    "form_fields" => array_values( $all_fields ),
                ],
            ], 200);
        } catch ( \Exception $e ) {
            return new WP_REST_Response([
                "success" => false,
                "message" => "Internal server error",
            ], 500);
        }
    }

    public function get_payment_methods_permission( $request ) : bool {
        return true;
        // Public endpoint
    }

    public function get_payment_methods( WP_REST_Request $request ) {
        try {
            WBK_Translation_Processor::switch_to_locale_from_get_param();
            $scope = sanitize_text_field( (string) $request->get_param( "scope" ) );
            $unit_id_param = $request->get_param( "unit_id" );
            $use_unit = $unit_id_param !== null && $unit_id_param !== "";
            $use_gift_card = $scope === "gift_card";
            $payment_methods_result = [];
            $found_payment_methods = false;
            $service_ids = null;
            $unit_id = null;
            if ( $use_gift_card ) {
                $payment_methods_available = WBK_Model_Utils::get_configured_gift_card_payment_methods();
                $payment_methods_result = array_keys( $payment_methods_available );
                $found_payment_methods = !empty( $payment_methods_result );
                if ( !$found_payment_methods ) {
                    return new WP_REST_Response([
                        "success" => false,
                        "message" => "No payment methods found for gift cards",
                    ], 404);
                }
                $payment_methods_formatted = [];
                foreach ( $payment_methods_result as $method ) {
                    if ( isset( $payment_methods_available[$method] ) ) {
                        $payment_methods_formatted[] = [
                            "id"   => $method,
                            "name" => $payment_methods_available[$method],
                            "icon" => WP_WEBBA_BOOKING__PLUGIN_URL . "/public/images/payments/" . $method . ".svg",
                        ];
                    }
                }
                return new WP_REST_Response([
                    "success" => true,
                    "data"    => [
                        "payment_methods" => $payment_methods_formatted,
                        "scope"           => "gift_card",
                    ],
                ], 200);
            }
            if ( $use_unit ) {
                if ( !is_numeric( $unit_id_param ) || $unit_id_param <= 0 ) {
                    return new WP_REST_Response([
                        "success" => false,
                        "message" => "Invalid unit ID: " . $unit_id_param,
                    ], 400);
                }
                $unit_id = (int) $unit_id_param;
                $unit = new WBK_Unit($unit_id);
                if ( !$unit->is_loaded() ) {
                    return new WP_REST_Response([
                        "success" => false,
                        "message" => "Unit not found",
                    ], 404);
                }
                $payment_methods_unit = json_decode( $unit->get( "payment_methods" ) );
                if ( is_null( $payment_methods_unit ) || !is_array( $payment_methods_unit ) ) {
                    $found_payment_methods = false;
                } else {
                    $payment_methods_result = $payment_methods_unit;
                    $found_payment_methods = true;
                }
            } else {
                $service_ids = $request->get_param( "ids" );
                // Validate service IDs
                if ( !is_array( $service_ids ) || empty( $service_ids ) ) {
                    return new WP_REST_Response([
                        "success" => false,
                        "message" => "Service IDs must be a non-empty array",
                    ], 400);
                }
                // Validate each ID is a positive integer
                foreach ( $service_ids as $id ) {
                    if ( !is_numeric( $id ) || $id <= 0 ) {
                        return new WP_REST_Response([
                            "success" => false,
                            "message" => "Invalid service ID: " . $id,
                        ], 400);
                    }
                }
                // Get payment methods for each service
                foreach ( $service_ids as $service_id ) {
                    $service = new WBK_Service($service_id);
                    if ( !$service->is_loaded() ) {
                        continue;
                    }
                    $payment_methods_service = json_decode( $service->get( "payment_methods" ) );
                    if ( !is_null( $payment_methods_service ) && is_array( $payment_methods_service ) ) {
                        if ( !$found_payment_methods ) {
                            $payment_methods_result = $payment_methods_service;
                            $found_payment_methods = true;
                        } else {
                            $payment_methods_result = array_intersect( $payment_methods_result, $payment_methods_service );
                        }
                    }
                }
            }
            $payment_methods_available = WBK_Model_Utils::get_available_payment_methods();
            // Filter to only include available payment methods
            $payment_methods_result = array_intersect( $payment_methods_result, array_keys( $payment_methods_available ) );
            if ( get_option( "wbk_appointments_default_status", "" ) == "pending" && get_option( "wbk_appointments_allow_payments", "" ) == "enabled" && WBK_Feature_Gate::have_required_plan( "premium", "only_old_users" ) ) {
                $payment_methods_result = array_diff( $payment_methods_result, [
                    "paypal",
                    "mollie",
                    "stripe",
                    "square",
                    "woocommerce"
                ] );
            }
            if ( empty( $payment_methods_result ) ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => ( $use_unit ? "No payment methods found for this unit" : "No payment methods found for one or multiple services" ),
                ], 404);
            }
            if ( !$found_payment_methods ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => ( $use_unit ? "No payment methods found for this unit" : "No payment methods found for one or multiple services" ),
                ], 404);
            }
            // Get all available payment methods to get their labels
            $payment_methods_all = WBK_Model_Utils::get_available_payment_methods();
            // Filter and format the response
            $payment_methods_formatted = [];
            foreach ( $payment_methods_result as $method ) {
                if ( isset( $payment_methods_all[$method] ) ) {
                    // Square uses the same credit-card icon as Stripe on the booking form.
                    $icon_slug = ( $method === "square" ? "stripe" : $method );
                    $payment_methods_formatted[] = [
                        "id"   => $method,
                        "name" => $payment_methods_all[$method],
                        "icon" => WP_WEBBA_BOOKING__PLUGIN_URL . "/public/images/payments/" . $icon_slug . ".svg",
                    ];
                }
            }
            $response_data = [
                "payment_methods" => $payment_methods_formatted,
            ];
            if ( $use_unit ) {
                $response_data["unit_id"] = $unit_id;
            } else {
                $response_data["service_ids"] = $service_ids;
            }
            return new WP_REST_Response([
                "success" => true,
                "data"    => $response_data,
            ], 200);
        } catch ( \Exception $e ) {
            return new WP_REST_Response([
                "success" => false,
                "message" => "Internal server error",
            ], 500);
        }
    }

    public function create_booking_permission( $request ) {
        return true;
        // Public access
    }

    /**
     * Create one or multiple bookings
     *
     * @param WP_REST_Request $request The request object
     *
     * @api {post} /webba-booking/v1/create-booking Create booking(s)
     * @apiDescription Creates one or multiple bookings for specified services and time slots
     *
     * @apiParam {string} name Customer's name
     * @apiParam {string} email Customer's email address
     * @apiParam {number[]} times Array of timestamps for booking slots
     * @apiParam {number[]} services Array of service IDs corresponding to each time slot
     * @apiParam {string} [phone] Customer's phone number
     * @apiParam {string} [comment] Additional comments or description for the booking
     * @apiParam {Object} [extra] Additional custom fields data
     * @apiParam {number} [category] Service category ID
     * @apiParam {string} [attachment] File attachment URL or ID
     * @apiParam {number[]} [quantities] Array of quantities for each booking (defaults to 1)
     * @apiParam {string} [coupon] Coupon code to apply
     * @apiParam {Object|string} [ordered_extras] Order-level map extra ID => quantity (JSON string or object), e.g. {"1":1}. Do not send a separate `extras` array; it is ignored.
     *
     * @apiSuccess {boolean} success Whether the booking was successful
     * @apiSuccess {number[]} booking_ids Array of created booking IDs
     * @apiSuccess {number} skipped_count Number of skipped time slots
     * @apiSuccess {boolean} payment_required Whether payment is required
     * @apiSuccess {string[]} payment_methods Available payment methods
     * @apiSuccess {Object} [payment_details] Payment details if payment is required
     * @apiSuccess {string} [coupon_status] Status of coupon application (if coupon provided)
     *
     * @apiError {boolean} success false
     * @apiError {string} message Error message
     *
     * @return WP_REST_Response
     */
    public function create_booking( $request ) {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
        $params = $request->get_body_params();
        if ( $this->is_create_booking_unit_payload( $params ) ) {
            return $this->create_booking_for_units( $request );
        }
        return $this->create_booking_for_services( $request );
    }

    /**
     * Whether the request targets unit (property) booking instead of services.
     *
     * @param array $params Raw body params.
     * @return bool
     */
    private function is_create_booking_unit_payload( $params ) {
        if ( isset( $params["booking_mode"] ) && $params["booking_mode"] === "units" ) {
            return true;
        }
        if ( !isset( $params["unit_id"] ) || $params["unit_id"] === "" || $params["unit_id"] === null ) {
            return false;
        }
        return is_numeric( $params["unit_id"] );
    }

    /**
     * Normalize `ordered_extras` from create-booking (JSON string or decoded map) and validate against allowed IDs.
     *
     * @param mixed $raw Raw request value (e.g. '{"1":1}' or array).
     * @param int[] $allowed_extra_ids Union of extras allowed on any service or unit in the order.
     * @return array{lines?: array<int, array<string, mixed>>, error?: string}
     */
    private function resolve_create_booking_ordered_extras_lines( $raw, array $allowed_extra_ids ) {
        if ( $raw === null || $raw === "" || $raw === [] ) {
            return [
                "lines" => [],
            ];
        }
        $ordered_extras_param = $raw;
        if ( is_string( $ordered_extras_param ) ) {
            $decoded = json_decode( stripslashes( $ordered_extras_param ), true );
            if ( json_last_error() !== JSON_ERROR_NONE ) {
                return [
                    "error" => __( "Invalid ordered_extras", "webba-booking-lite" ),
                ];
            }
            $ordered_extras_param = $decoded;
        }
        if ( $ordered_extras_param !== null && $ordered_extras_param !== "" && $ordered_extras_param !== [] ) {
            $extras_parse = WBK_Price_Processor::parse_ordered_extras_for_quote( $ordered_extras_param, $allowed_extra_ids );
            if ( !empty( $extras_parse["error"] ) ) {
                return [
                    "error" => $extras_parse["error"],
                ];
            }
            return [
                "lines" => ( !empty( $extras_parse["lines"] ) ? $extras_parse["lines"] : [] ),
            ];
        }
        return [
            "lines" => [],
        ];
    }

    /**
     * Persist ordered extras on wbk_appointments.booking_extra as JSON map extra_id => quantity (e.g. {"1":1}).
     *
     * @param array<int, array<string, mixed>> $lines Lines from parse_ordered_extras_for_quote.
     * @return string JSON payload.
     */
    private function encode_booking_extra_field_from_ordered_lines( array $lines ) {
        $map = [];
        foreach ( $lines as $line ) {
            $eid = ( isset( $line["id"] ) ? (int) $line["id"] : 0 );
            $qty = ( isset( $line["quantity"] ) ? (int) $line["quantity"] : 0 );
            if ( $eid < 1 || $qty < 1 ) {
                continue;
            }
            $map[(string) $eid] = $qty;
        }
        if ( $map === [] ) {
            return "";
        }
        return wp_json_encode( $map, JSON_UNESCAPED_UNICODE );
    }

    /**
     * Create bookings for time-slot services (default flow).
     *
     * @param WP_REST_Request $request Request.
     * @return WP_REST_Response
     */
    private function create_booking_for_services( $request ) {
        global $wpdb;
        $params = $request->get_body_params();
        $params["services"] = ( isset( $params["services"] ) ? json_decode( $params["services"], true ) : [] );
        $params["places"] = ( isset( $params["places"] ) ? json_decode( $params["places"], true ) : [] );
        $params["staff"] = ( isset( $params["staff"] ) ? json_decode( $params["staff"], true ) : [] );
        if ( !is_array( $params["staff"] ) ) {
            $params["staff"] = [];
        }
        $params["location"] = ( isset( $params["location"] ) ? json_decode( $params["location"], true ) : null );
        if ( isset( $params["number_of_people"] ) && is_string( $params["number_of_people"] ) ) {
            $decoded_people = json_decode( $params["number_of_people"], true );
            if ( json_last_error() === JSON_ERROR_NONE ) {
                $params["number_of_people"] = $decoded_people;
            }
        }
        // Validate required fields
        $required_fields = [
            "first_name",
            "email",
            "places",
            "services"
        ];
        foreach ( $required_fields as $field ) {
            if ( !isset( $params[$field] ) || empty( $params[$field] ) ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => "Missing required field: {$field}",
                ], 400);
            }
        }
        // Validate offset parameter
        $offset = 0;
        if ( isset( $params["offset"] ) ) {
            if ( is_numeric( $params["offset"] ) && intval( $params["offset"] ) == $params["offset"] ) {
                $offset = intval( $params["offset"] );
            }
        }
        // Validate places structure
        if ( !is_array( $params["places"] ) ) {
            return new WP_REST_Response([
                "success" => false,
                "message" => "Places must be an object with service IDs as keys",
            ], 400);
        }
        // Extract times in the same order as the services array (one entry per slot).
        $times = [];
        $quantities = [];
        $days = [];
        $slot_counters = [];
        foreach ( $params["services"] as $service_id ) {
            $service_id = intval( $service_id );
            if ( !isset( $params["places"][$service_id] ) || !is_array( $params["places"][$service_id] ) ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => "Missing places for service {$service_id}",
                ], 400);
            }
            if ( !isset( $slot_counters[$service_id] ) ) {
                $slot_counters[$service_id] = 0;
            }
            $slot_index = $slot_counters[$service_id];
            if ( !isset( $params["places"][$service_id][$slot_index] ) ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => "Missing timeslot for service {$service_id}",
                ], 400);
            }
            $slot = $params["places"][$service_id][$slot_index];
            $slot_counters[$service_id]++;
            $slot_time = null;
            if ( isset( $slot["timeslot"] ) && is_numeric( $slot["timeslot"] ) ) {
                $slot_time = intval( $slot["timeslot"] );
            } elseif ( isset( $slot["time"] ) && is_numeric( $slot["time"] ) ) {
                $slot_time = intval( $slot["time"] );
            }
            if ( $slot_time === null ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => "Invalid timeslot for service {$service_id}",
                ], 400);
            }
            $times[] = $slot_time;
            $quantities[] = ( isset( $slot["quantity"] ) && is_numeric( $slot["quantity"] ) ? $slot["quantity"] : 1 );
            $days[] = strtotime( "today midnight", intval( $slot["day"] ) );
        }
        // Validate services
        foreach ( $params["services"] as $service_id ) {
            if ( !is_numeric( $service_id ) || $service_id <= 0 ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => "Invalid service ID: {$service_id}",
                ], 400);
            }
        }
        $coupon_result = false;
        $coupon_status = "not_provided";
        if ( isset( $params["coupon"] ) && !empty( trim( $params["coupon"] ) ) ) {
            $coupon = esc_html( sanitize_text_field( trim( $params["coupon"] ) ) );
            $coupon_result = WBK_Validator::check_coupon_or_gift_card( $coupon, $params["services"] );
            if ( $coupon_result === false ) {
                $coupon_status = "invalid";
            } else {
                $coupon_status = "valid";
            }
        }
        $service_ids_unique = array_values( array_unique( array_map( "intval", $params["services"] ) ) );
        $allowed_extra_ids = WBK_Price_Processor::collect_allowed_extra_ids_for_services( $service_ids_unique );
        $extras_resolve = $this->resolve_create_booking_ordered_extras_lines( ( isset( $params["ordered_extras"] ) ? $params["ordered_extras"] : null ), $allowed_extra_ids );
        if ( isset( $extras_resolve["error"] ) ) {
            return new WP_REST_Response([
                "success" => false,
                "message" => $extras_resolve["error"],
            ], 400);
        }
        $ordered_extras_lines = $extras_resolve["lines"];
        $arr_uploaded_urls = [];
        $files = $request->get_file_params();
        if ( isset( $files["attachments"] ) && is_array( $files["attachments"] ) && count( $files["attachments"] ) > 0 ) {
            if ( !function_exists( "wp_handle_upload" ) ) {
                require_once ABSPATH . "wp-admin/includes/file.php";
            }
            for ($i = 0; $i < count( $files["attachments"]["tmp_name"] ); $i++) {
                $file = [
                    "name"      => $files["attachments"]["name"][$i],
                    "tmp_name"  => $files["attachments"]["tmp_name"][$i],
                    "type"      => $files["attachments"]["type"][$i],
                    "error"     => $files["attachments"]["error"][$i],
                    "size"      => $files["attachments"]["size"][$i],
                    "full_path" => $files["attachments"]["full_path"][$i],
                ];
                $uploaded_file = wp_handle_upload( $file, [
                    "test_form" => false,
                ] );
                if ( $uploaded_file && !isset( $uploaded_file["error"] ) ) {
                    $arr_uploaded_urls[] = $uploaded_file["file"];
                }
            }
        }
        if ( count( $arr_uploaded_urls ) > 0 ) {
            $attachments = json_encode( $arr_uploaded_urls );
        } else {
            $attachments = "";
        }
        // Prepare base booking data
        $base_booking_data = [
            "name"             => sanitize_text_field( $params["first_name"] . " " . $params["last_name"] ),
            "email"            => sanitize_email( $params["email"] ),
            "phone"            => ( isset( $params["phone"] ) ? sanitize_text_field( $params["phone"] ) : "" ),
            "description"      => ( isset( $params["description"] ) ? sanitize_text_field( $params["description"] ) : "" ),
            "extra"            => ( isset( $params["extra"] ) ? $params["extra"] : "" ),
            "service_category" => ( isset( $params["category"] ) ? intval( $params["category"] ) : 0 ),
            "coupon"           => ( $coupon_result !== false && is_array( $coupon_result ) ? $coupon_result[0] : "" ),
            "attachment"       => $attachments,
        ];
        $booking_ids = [];
        $booking_times = [];
        $skipped_count = 0;
        $not_booked_due_limit = false;
        $sp = new WBK_Schedule_Processor();
        $sp->load_data();
        // Process each time slot
        for ($i = 0; $i < count( $times ); $i++) {
            $time = $times[$i];
            $service_id = $params["services"][$i];
            $service = new WBK_Service($service_id);
            if ( !$service->is_loaded() ) {
                continue;
                // Skip invalid service
            }
            // Check if time is in the past
            $ongoing_valid = false;
            if ( get_option( "wbk_allow_ongoing_time_slot", "" ) !== "yes" ) {
                if ( $time > time() ) {
                    $ongoing_valid = true;
                }
            } else {
                $end_time_current = $time + $service->get_duration() * 60;
                if ( $time > time() || $time < time() && $end_time_current > time() ) {
                    $ongoing_valid = true;
                }
            }
            if ( !$ongoing_valid ) {
                $skipped_count++;
                continue;
            }
            // Resolve staff member for this service (format: {"68":"3"} = service_id => staff_member_id)
            $staff_member_id = null;
            if ( isset( $params["staff"][$service_id] ) && is_numeric( $params["staff"][$service_id] ) ) {
                $staff_member_id = (int) $params["staff"][$service_id];
                $staff_member = new WBK_Staff_Member($staff_member_id);
                if ( !$staff_member->is_loaded() ) {
                    $skipped_count++;
                    continue;
                }
                $staff_services = array_map( "intval", $staff_member->get_services() );
                if ( !in_array( (int) $service_id, $staff_services, true ) ) {
                    $skipped_count++;
                    continue;
                }
            }
            // Prepare booking data for this slot
            $booking_data = array_merge( $base_booking_data, [
                "time"        => $time,
                "service_id"  => $service_id,
                "duration"    => $service->get_duration(),
                "time_offset" => $offset,
                "quantity"    => $quantities[$i] ?? 1,
            ] );
            if ( $staff_member_id !== null ) {
                $booking_data["staff_member_id"] = $staff_member_id;
            }
            if ( $params["location"] !== null ) {
                $booking_data["location_id"] = $params["location"];
            }
            if ( !empty( $ordered_extras_lines ) ) {
                $booking_data["booking_extra"] = $this->encode_booking_extra_field_from_ordered_lines( $ordered_extras_lines );
            }
            if ( isset( $params["number_of_people"] ) ) {
                $number_of_people = $params["number_of_people"];
                if ( is_string( $number_of_people ) ) {
                    $decoded_people = json_decode( $number_of_people, true );
                    if ( json_last_error() === JSON_ERROR_NONE ) {
                        $number_of_people = $decoded_people;
                    }
                }
                if ( is_array( $number_of_people ) ) {
                    $booking_data["number_of_people"] = wp_json_encode( $number_of_people );
                } elseif ( is_numeric( $number_of_people ) ) {
                    $booking_data["number_of_people"] = (string) (int) $number_of_people;
                }
            }
            // Validate time slot availability
            $day = $days[$i];
            if ( $sp->get_day_status( $day, $service_id, $staff_member_id ) != 1 ) {
                $skipped_count++;
                continue;
            }
            $timeslots = $sp->get_time_slots_by_day(
                $day,
                $service_id,
                [
                    "skip_gg_calendar"       => false,
                    "ignore_preparation"     => true,
                    "calculate_availability" => true,
                    "offset"                 => $offset,
                ],
                null,
                true,
                $staff_member_id
            );
            $time_slot_valid = false;
            foreach ( $timeslots as $timeslot ) {
                if ( $timeslot->get_start() == $time ) {
                    if ( (is_array( $timeslot->get_status() ) || $timeslot->get_status() == 0) && $booking_data["quantity"] <= $timeslot->get_free_places() ) {
                        $time_slot_valid = true;
                        break;
                    }
                }
            }
            if ( !$time_slot_valid ) {
                $skipped_count++;
                continue;
            }
            // Check booking limits
            if ( get_option( "wbk_appointments_only_one_per_slot", "disabled" ) == "enabled" && WBK_Feature_Gate::have_required_plan( "premium", "only_old_users" ) ) {
                if ( count( WBK_Model_Utils::get_booking_ids_by_time_service_email( $time, $service_id, $booking_data["email"] ) ) > 0 ) {
                    $not_booked_due_limit = true;
                    continue;
                }
            }
            if ( get_option( "wbk_appointments_only_one_per_service", "disabled" ) == "enabled" ) {
                if ( count( WBK_Model_Utils::get_booking_ids_by_service_email( $service_id, $booking_data["email"] ) ) > 0 ) {
                    $not_booked_due_limit = true;
                    continue;
                }
            }
            if ( get_option( "wbk_appointments_only_one_per_day", "disabled" ) == "enabled" ) {
                if ( count( WBK_Model_Utils::get_booking_ids_by_day_service_email( $day, $service_id, $booking_data["email"] ) ) > 0 ) {
                    $not_booked_due_limit = true;
                    continue;
                }
            }
            // Create booking
            $booking_factory = new WBK_Booking_Factory();
            $booking_data = apply_filters( "before_booking_added", $booking_data );
            $status = $booking_factory->build_from_array( $booking_data );
            if ( $status[0] ) {
                $booking_id = $status[1];
                $booking_ids[] = $booking_id;
                $booking_times[] = $time;
                do_action( "wbk_table_after_add", [$booking_id, get_option( "wbk_db_prefix", "" ) . "wbk_appointments"] );
                $booking_data["id"] = $booking_id;
                do_action( "wbk_booking_added", $booking_data );
            }
        }
        // Handle booking results
        if ( empty( $booking_ids ) ) {
            if ( $not_booked_due_limit ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => __( "Limit reached", "webba-booking-lite" ),
                ], 400);
            }
            return new WP_REST_Response([
                "success" => false,
                "message" => __( "No time slots were booked", "webba-booking-lite" ),
            ], 400);
        }
        // Run post-production tasks
        $booking_factory->post_production( $booking_ids, "on_booking" );
        if ( $coupon_result !== false && is_array( $coupon_result ) ) {
            $tax = WBK_Options_Utils::get_tax();
            $payment_details = WBK_Price_Processor::get_payment_items( $booking_ids, $tax, $coupon_result );
            if ( !empty( $ordered_extras_lines ) ) {
                WBK_Price_Processor::apply_ordered_extras_to_payment_data( $payment_details, $ordered_extras_lines, "services" );
            }
            if ( is_array( $payment_details ) && (float) $payment_details["to_pay_total"] <= 0 ) {
                $booking_factory->set_as_paid( $booking_ids, "coupon", 0 );
            }
        }
        // Get payment methods
        $payment_methods = WBK_Model_Utils::get_payment_methods_for_bookings_intersected( $booking_ids );
        $response_data = [
            "success"             => true,
            "booking_ids"         => $booking_ids,
            "skipped_count"       => $skipped_count,
            "times"               => $booking_times,
            "booking_instruction" => WBK_Placeholder_Processor::process_placeholders( get_option( "wbk_after_booking_instructions", "" ), $booking_ids ),
        ];
        if ( $coupon_status !== "not_provided" ) {
            $response_data["coupon_status"] = $coupon_status;
        }
        $pay_full_amount = isset( $params["pay_full_amount"] ) && ($params["pay_full_amount"] === true || $params["pay_full_amount"] === "true" || $params["pay_full_amount"] === 1);
        // Check if payment method is valid
        if ( isset( $params["payment_method"] ) && !empty( $payment_methods ) ) {
            if ( !in_array( $params["payment_method"], $payment_methods ) ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => __( "Invalid payment method", "webba-booking-lite" ),
                ], 400);
            }
            $tax = WBK_Options_Utils::get_tax();
            $payment_details = WBK_Price_Processor::get_payment_items(
                $booking_ids,
                $tax,
                $coupon_result,
                true,
                $pay_full_amount
            );
            if ( !empty( $ordered_extras_lines ) ) {
                WBK_Price_Processor::apply_ordered_extras_to_payment_data( $payment_details, $ordered_extras_lines, "services" );
            }
            $payable = true;
            // Use the reusable payment method processor
            $payment_response = $this->process_payment_method(
                $booking_ids,
                $params["payment_method"],
                $params,
                $payment_details
            );
            // Merge payment response into main response data
            $response_data = array_merge( $response_data, $payment_response );
        } else {
            $tax = WBK_Options_Utils::get_tax();
            $payment_details = WBK_Price_Processor::get_payment_items(
                $booking_ids,
                $tax,
                $coupon_result,
                true,
                $pay_full_amount
            );
            if ( !empty( $ordered_extras_lines ) ) {
                WBK_Price_Processor::apply_ordered_extras_to_payment_data( $payment_details, $ordered_extras_lines, "services" );
            }
            $response_data = array_merge( $response_data, [
                "payment_details"  => $payment_details,
                "payment_required" => false,
            ] );
        }
        date_default_timezone_set( "UTC" );
        return new WP_REST_Response($response_data, 200);
    }

    /**
     * Create bookings for units (range stay). Does not use service timeslots.
     *
     * @param WP_REST_Request $request Request.
     * @return WP_REST_Response
     */
    private function create_booking_for_units( $request ) {
        $params = $request->get_body_params();
        $params["services"] = ( isset( $params["services"] ) ? json_decode( $params["services"], true ) : [] );
        if ( !is_array( $params["services"] ) ) {
            $params["services"] = [];
        }
        $params["places"] = ( isset( $params["places"] ) ? json_decode( $params["places"], true ) : [] );
        $params["staff"] = ( isset( $params["staff"] ) ? json_decode( $params["staff"], true ) : [] );
        if ( !is_array( $params["staff"] ) ) {
            $params["staff"] = [];
        }
        $params["location"] = ( isset( $params["location"] ) ? json_decode( $params["location"], true ) : null );
        $range = ( isset( $params["range"] ) ? $params["range"] : null );
        if ( is_string( $range ) ) {
            $range = json_decode( $range, true );
        }
        if ( isset( $params["number_of_people"] ) && is_string( $params["number_of_people"] ) ) {
            $decoded = json_decode( $params["number_of_people"], true );
            if ( json_last_error() === JSON_ERROR_NONE ) {
                $params["number_of_people"] = $decoded;
            }
        }
        if ( isset( $params["unit_attendees"] ) && is_string( $params["unit_attendees"] ) ) {
            $decoded_ua = json_decode( $params["unit_attendees"], true );
            if ( json_last_error() === JSON_ERROR_NONE && is_array( $decoded_ua ) ) {
                $params["unit_attendees"] = $decoded_ua;
            }
        }
        if ( isset( $params["unit_quantity"] ) && is_string( $params["unit_quantity"] ) ) {
            $decoded_uq = json_decode( $params["unit_quantity"], true );
            if ( json_last_error() === JSON_ERROR_NONE && is_array( $decoded_uq ) ) {
                $params["unit_quantity"] = $decoded_uq;
            }
        }
        $unit_id = ( isset( $params["unit_id"] ) ? (int) $params["unit_id"] : 0 );
        if ( $unit_id < 1 ) {
            return new WP_REST_Response([
                "success" => false,
                "message" => "Missing required field: unit_id",
            ], 400);
        }
        $required_fields = ["first_name", "email", "places"];
        foreach ( $required_fields as $field ) {
            if ( !isset( $params[$field] ) || (( is_array( $params[$field] ) ? empty( $params[$field] ) : $params[$field] === "" )) ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => "Missing required field: {$field}",
                ], 400);
            }
        }
        if ( !is_array( $range ) || !isset( $range["start"], $range["end"] ) || $range["start"] === "" || $range["end"] === "" ) {
            return new WP_REST_Response([
                "success" => false,
                "message" => "Missing required field: range",
            ], 400);
        }
        if ( !is_array( $params["places"] ) ) {
            return new WP_REST_Response([
                "success" => false,
                "message" => "Places must be an object with unit IDs as keys",
            ], 400);
        }
        $unit_key = (string) $unit_id;
        if ( !isset( $params["places"][$unit_key] ) || !is_array( $params["places"][$unit_key] ) || count( $params["places"][$unit_key] ) === 0 ) {
            return new WP_REST_Response([
                "success" => false,
                "message" => "Places must include the selected unit",
            ], 400);
        }
        $unit = new WBK_Unit($unit_id);
        if ( !$unit->is_loaded() ) {
            return new WP_REST_Response([
                "success" => false,
                "message" => __( "Unit not found", "webba-booking-lite" ),
            ], 404);
        }
        $resolved_location = null;
        if ( isset( $params["location"] ) && $params["location"] !== null ) {
            $raw = $params["location"];
            if ( is_array( $raw ) ) {
                if ( !empty( $raw ) ) {
                    $first = reset( $raw );
                    if ( is_numeric( $first ) && (int) $first > 0 ) {
                        $resolved_location = (int) $first;
                    }
                }
            } elseif ( is_numeric( $raw ) && (int) $raw > 0 ) {
                $resolved_location = (int) $raw;
            }
        }
        $unit_locs = $unit->get_locations();
        if ( is_array( $unit_locs ) && !empty( $unit_locs ) ) {
            $unit_locs = array_map( "intval", $unit_locs );
            if ( $resolved_location === null || !in_array( $resolved_location, $unit_locs, true ) ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => __( "A valid location is required for this unit", "webba-booking-lite" ),
                ], 400);
            }
        } else {
            $resolved_location = null;
        }
        $number_of_people = $this->create_booking_units_resolve_number_of_people( $params, $unit_id );
        if ( WBK_Unit_Availability_Processor::get_availability_for_range(
            $unit_id,
            $range,
            $number_of_people,
            $resolved_location
        ) === false ) {
            return new WP_REST_Response([
                "success" => false,
                "message" => __( "Unit is not available for the selected range", "webba-booking-lite" ),
            ], 400);
        }
        $offset = 0;
        if ( isset( $params["offset"] ) ) {
            if ( is_numeric( $params["offset"] ) && intval( $params["offset"] ) == $params["offset"] ) {
                $offset = intval( $params["offset"] );
            }
        }
        $coupon_result = false;
        $coupon_status = "not_provided";
        if ( isset( $params["coupon"] ) && !empty( trim( (string) $params["coupon"] ) ) ) {
            $coupon = esc_html( sanitize_text_field( trim( (string) $params["coupon"] ) ) );
            $coupon_result = WBK_Validator::check_coupon_or_gift_card( $coupon, [] );
            if ( $coupon_result === false ) {
                $coupon_status = "invalid";
            } else {
                $coupon_status = "valid";
            }
        }
        $pre_booking_payment_details = WBK_Price_Processor::get_unit_payment_items( [[
            "unit_id"          => $unit_id,
            "range"            => $range,
            "number_of_people" => $number_of_people,
            "location_id"      => $resolved_location,
        ]], $coupon_result, false );
        if ( $pre_booking_payment_details === -4 ) {
            return new WP_REST_Response([
                "success" => false,
                "message" => __( "Invalid booking data", "webba-booking-lite" ),
            ], 400);
        }
        $allowed_unit_extra_ids = WBK_Price_Processor::collect_allowed_extra_ids_for_units( [[
            "unit_id"          => $unit_id,
            "range"            => $range,
            "number_of_people" => $number_of_people,
            "location_id"      => $resolved_location,
        ]] );
        $extras_resolve_units = $this->resolve_create_booking_ordered_extras_lines( ( isset( $params["ordered_extras"] ) ? $params["ordered_extras"] : null ), $allowed_unit_extra_ids );
        if ( isset( $extras_resolve_units["error"] ) ) {
            return new WP_REST_Response([
                "success" => false,
                "message" => $extras_resolve_units["error"],
            ], 400);
        }
        if ( !empty( $extras_resolve_units["lines"] ) ) {
            WBK_Price_Processor::apply_ordered_extras_to_payment_data( $pre_booking_payment_details, $extras_resolve_units["lines"], "units" );
        }
        $arr_uploaded_urls = [];
        $files = $request->get_file_params();
        if ( isset( $files["attachments"] ) && is_array( $files["attachments"] ) && count( $files["attachments"] ) > 0 ) {
            if ( !function_exists( "wp_handle_upload" ) ) {
                require_once ABSPATH . "wp-admin/includes/file.php";
            }
            for ($i = 0; $i < count( $files["attachments"]["tmp_name"] ); $i++) {
                $file = [
                    "name"      => $files["attachments"]["name"][$i],
                    "tmp_name"  => $files["attachments"]["tmp_name"][$i],
                    "type"      => $files["attachments"]["type"][$i],
                    "error"     => $files["attachments"]["error"][$i],
                    "size"      => $files["attachments"]["size"][$i],
                    "full_path" => $files["attachments"]["full_path"][$i],
                ];
                $uploaded_file = wp_handle_upload( $file, [
                    "test_form" => false,
                ] );
                if ( $uploaded_file && !isset( $uploaded_file["error"] ) ) {
                    $arr_uploaded_urls[] = $uploaded_file["file"];
                }
            }
        }
        if ( count( $arr_uploaded_urls ) > 0 ) {
            $attachments = json_encode( $arr_uploaded_urls );
        } else {
            $attachments = "";
        }
        $phone_raw = ( isset( $params["phone"] ) ? (string) $params["phone"] : "" );
        if ( $phone_raw === "undefined" ) {
            $phone_raw = "";
        }
        $last_name = ( isset( $params["last_name"] ) ? $params["last_name"] : "" );
        $base_booking_data = [
            "name"             => sanitize_text_field( $params["first_name"] . " " . $last_name ),
            "email"            => sanitize_email( $params["email"] ),
            "phone"            => sanitize_text_field( $phone_raw ),
            "description"      => ( isset( $params["description"] ) ? sanitize_text_field( $params["description"] ) : "" ),
            "extra"            => ( isset( $params["extra"] ) ? $params["extra"] : "" ),
            "service_category" => ( isset( $params["category"] ) ? intval( $params["category"] ) : 0 ),
            "coupon"           => ( $coupon_result !== false && is_array( $coupon_result ) ? $coupon_result[0] : "" ),
            "attachment"       => $attachments,
        ];
        $start_ts = strtotime( (string) $range["start"] );
        $end_ts = strtotime( (string) $range["end"] );
        if ( $start_ts === false || $end_ts === false || $end_ts < $start_ts ) {
            return new WP_REST_Response([
                "success" => false,
                "message" => __( "Invalid range", "webba-booking-lite" ),
            ], 400);
        }
        $start_day = strtotime( date( "Y-m-d", $start_ts ) );
        $end_day = strtotime( date( "Y-m-d", $end_ts ) );
        $inclusive_days = (int) (($end_day - $start_day) / DAY_IN_SECONDS) + 1;
        if ( $inclusive_days < 1 ) {
            $inclusive_days = 1;
        }
        $duration_minutes = $inclusive_days * 1440;
        $booking_ids = [];
        $booking_times = [];
        $skipped_count = 0;
        $slot = $params["places"][$unit_key][0];
        $slot_qty = ( isset( $slot["quantity"] ) && is_numeric( $slot["quantity"] ) ? (int) $slot["quantity"] : 1 );
        if ( $slot_qty < 1 ) {
            $slot_qty = 1;
        }
        $booking_data = array_merge( $base_booking_data, [
            "time"                   => $start_day,
            "service_id"             => 0,
            "duration"               => $duration_minutes,
            "time_offset"            => $offset,
            "quantity"               => $slot_qty,
            "unit_id"                => $unit_id,
            "wbk_unit_range_booking" => true,
            "range"                  => $range,
        ] );
        if ( $number_of_people !== null ) {
            if ( is_array( $number_of_people ) ) {
                $booking_data["number_of_people"] = wp_json_encode( $number_of_people );
            } else {
                $booking_data["number_of_people"] = (string) (int) $number_of_people;
            }
        }
        if ( $params["location"] !== null ) {
            $booking_data["location_id"] = $params["location"];
        }
        if ( !empty( $extras_resolve_units["lines"] ) ) {
            $booking_data["booking_extra"] = $this->encode_booking_extra_field_from_ordered_lines( $extras_resolve_units["lines"] );
        }
        $booking_factory = new WBK_Booking_Factory();
        $booking_data = apply_filters( "before_booking_added", $booking_data );
        $status = $booking_factory->build_from_array( $booking_data );
        if ( $status[0] ) {
            $booking_id = $status[1];
            $booking_ids[] = $booking_id;
            $booking_times[] = $start_day;
            do_action( "wbk_table_after_add", [$booking_id, get_option( "wbk_db_prefix", "" ) . "wbk_appointments"] );
            $booking_data["id"] = $booking_id;
            do_action( "wbk_booking_added", $booking_data );
        } else {
            $skipped_count = 1;
        }
        if ( empty( $booking_ids ) ) {
            return new WP_REST_Response([
                "success" => false,
                "message" => __( "No unit bookings were created", "webba-booking-lite" ),
            ], 400);
        }
        $booking_factory->post_production( $booking_ids, "on_booking" );
        if ( $coupon_result !== false && is_array( $coupon_result ) ) {
            if ( is_array( $pre_booking_payment_details ) && (float) $pre_booking_payment_details["to_pay_total"] <= 0 ) {
                $booking_factory->set_as_paid( $booking_ids, "coupon", 0 );
            }
        }
        $unit_payment_methods = [];
        $unit_payment_methods_raw = $unit->get( "payment_methods" );
        if ( !is_null( $unit_payment_methods_raw ) && $unit_payment_methods_raw !== "" ) {
            $decoded_unit_payment_methods = json_decode( $unit_payment_methods_raw, true );
            if ( is_array( $decoded_unit_payment_methods ) ) {
                $unit_payment_methods = $decoded_unit_payment_methods;
            }
        }
        $response_data = [
            "success"             => true,
            "booking_ids"         => $booking_ids,
            "skipped_count"       => $skipped_count,
            "times"               => $booking_times,
            "booking_instruction" => WBK_Placeholder_Processor::process_placeholders( get_option( "wbk_after_booking_instructions", "" ), $booking_ids ),
        ];
        if ( $coupon_status !== "not_provided" ) {
            $response_data["coupon_status"] = $coupon_status;
        }
        $pay_full_amount = isset( $params["pay_full_amount"] ) && ($params["pay_full_amount"] === true || $params["pay_full_amount"] === "true" || $params["pay_full_amount"] === 1);
        $payment_details = $pre_booking_payment_details;
        if ( $payment_details === -4 ) {
            return new WP_REST_Response([
                "success" => false,
                "message" => __( "Invalid booking data", "webba-booking-lite" ),
            ], 400);
        }
        // Check if payment method is valid and initialize payment flow.
        if ( isset( $params["payment_method"] ) && !empty( $unit_payment_methods ) ) {
            if ( !in_array( $params["payment_method"], $unit_payment_methods, true ) ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => __( "Invalid payment method", "webba-booking-lite" ),
                ], 400);
            }
            $payment_response = $this->process_payment_method(
                $booking_ids,
                $params["payment_method"],
                $params,
                $payment_details
            );
            $response_data = array_merge( $response_data, $payment_response );
        } else {
            $response_data = array_merge( $response_data, [
                "payment_details"  => $payment_details,
                "payment_required" => false,
            ] );
        }
        date_default_timezone_set( "UTC" );
        return new WP_REST_Response($response_data, 200);
    }

    /**
     * Resolve attendee / quantity payload for unit availability (mirrors frontend helpers).
     *
     * @param array $params Request params.
     * @param int   $unit_id Unit id.
     * @return array|int|null
     */
    private function create_booking_units_resolve_number_of_people( array $params, $unit_id ) {
        $people = ( isset( $params["number_of_people"] ) ? $params["number_of_people"] : null );
        $attendees = ( isset( $params["unit_attendees"] ) && is_array( $params["unit_attendees"] ) ? $params["unit_attendees"] : [] );
        $quantities = ( isset( $params["unit_quantity"] ) && is_array( $params["unit_quantity"] ) ? $params["unit_quantity"] : [] );
        $uid_key = (string) $unit_id;
        if ( ($people === null || $people === "" || $people === []) && isset( $attendees[$unit_id] ) && is_array( $attendees[$unit_id] ) ) {
            $people = $attendees[$unit_id];
        } elseif ( ($people === null || $people === "" || $people === []) && isset( $attendees[$uid_key] ) && is_array( $attendees[$uid_key] ) ) {
            $people = $attendees[$uid_key];
        }
        if ( ($people === null || $people === "" || $people === []) && isset( $quantities[$unit_id] ) ) {
            $people = $quantities[$unit_id];
        } elseif ( ($people === null || $people === "" || $people === []) && isset( $quantities[$uid_key] ) ) {
            $people = $quantities[$uid_key];
        }
        if ( $people === null || $people === "" ) {
            return null;
        }
        if ( is_string( $people ) ) {
            $decoded = json_decode( $people, true );
            if ( json_last_error() === JSON_ERROR_NONE && is_array( $decoded ) ) {
                return $decoded;
            }
        }
        if ( is_array( $people ) ) {
            return [
                "adult"  => max( 0, (int) ($people["adult"] ?? 0) ),
                "child"  => max( 0, (int) ($people["child"] ?? 0) ),
                "infant" => max( 0, (int) ($people["infant"] ?? 0) ),
            ];
        }
        if ( is_numeric( $people ) ) {
            return (int) $people;
        }
        return null;
    }

    public function execute_paypal_payment_permission( $request ) {
        return true;
    }

    public function execute_stripe_payment_permission( $request ) {
        return true;
    }

    public function execute_square_payment_permission( $request ) {
        return true;
    }

    /**
     * Executes a PayPal payment after user approval
     *
     * This endpoint is called after a user approves a PayPal payment and is redirected back
     * to the site. It completes the payment execution process using the payment ID and payer ID
     * provided by PayPal.
     *
     * @param WP_REST_Request $request Request object containing:
     *                                 - paymentId: The PayPal payment ID
     *                                 - PayerID: The PayPal payer ID
     *
     * @return WP_REST_Response Response object with:
     *                          - status: 'success' or 'error'
     *                          - message: Description of the result
     *                          - HTTP 200 for success
     *                          - HTTP 400 for missing parameters
     *                          - HTTP 404 for booking not found
     *                          - HTTP 500 for execution failures
     */
    public function execute_paypal_payment( $request ) {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
    }

    public function execute_mollie_payment_permission( $request ) {
        return true;
    }

    /**
     * Completes a Mollie payment after the customer returns from checkout.
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function execute_mollie_payment( $request ) {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        return new WP_REST_Response([
            "status"  => "error",
            "message" => "Mollie payment processing not available",
        ], 403);
    }

    /**
     * Mollie webhook. Body contains id=tr_...; status is verified via the Mollie API.
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function mollie_webhook( $request ) {
        return new WP_REST_Response([
            "status" => "ok",
        ], 200);
    }

    /**
     * Executes a Stripe payment after user confirmation
     *
     * This endpoint is called after a user confirms a Stripe payment and completes the
     * payment process. It executes the payment using the payment intent ID provided by Stripe.
     *
     * @param WP_REST_Request $request Request object containing:
     *                                 - payment_intent_id: The Stripe payment intent ID
     *
     * @return WP_REST_Response Response object with:
     *                          - status: 'success' or 'error'
     *                          - message: Description of the result
     *                          - HTTP 200 for success
     *                          - HTTP 400 for missing parameters
     *                          - HTTP 404 for booking not found
     *                          - HTTP 500 for execution failures
     */
    public function execute_stripe_payment( $request ) {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        return new WP_REST_Response([
            "status"  => "error",
            "message" => "Stripe payment processing not available",
        ], 403);
    }

    /**
     * Execute a Square payment after the Web Payments SDK tokenizes the card.
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function execute_square_payment( $request ) {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        return new WP_REST_Response([
            "status"  => "error",
            "message" => "Square payment processing not available",
        ], 403);
    }

    public function get_booking_ids_by_token_permission( $request ) : bool {
        return true;
    }

    public function get_booking_ids_by_token( WP_REST_Request $request ) : WP_REST_Response {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        $token = sanitize_text_field( $request["token"] );
        $token_type = sanitize_text_field( $request["token_type"] );
        if ( empty( $token ) || empty( $token_type ) ) {
            return new WP_REST_Response([
                "status"  => "error",
                "message" => "Token and token type are required",
            ], 400);
        }
        if ( !in_array( $token_type, ["customer_token", "admin_token", "payment_id"] ) ) {
            return new WP_REST_Response([
                "status"  => "error",
                "message" => "Invalid token type",
            ], 400);
        }
        $booking_ids = [];
        if ( $token_type === "customer_token" ) {
            $booking_ids = WBK_Model_Utils::get_booking_ids_by_group_token( $token );
        } elseif ( $token_type === "admin_token" ) {
            $booking_ids = WBK_Model_Utils::get_booking_ids_by_group_admin_token( $token );
        } elseif ( $token_type === "payment_id" ) {
            $booking_ids = WBK_Model_Utils::get_booking_ids_by_payment_id( $token );
        }
        if ( empty( $booking_ids ) ) {
            return new WP_REST_Response([
                "status"  => "error",
                "message" => "No bookings found for the provided token",
            ], 404);
        }
        $first_booking = new WBK_Booking($booking_ids[0]);
        if ( $first_booking->is_loaded() && $first_booking->get( "unit_id" ) > 0 ) {
            $payment_details = WBK_Price_Processor::get_unit_payment_items_post_booked( $booking_ids );
        } else {
            $payment_details = WBK_Price_Processor::get_payment_items_post_booked( $booking_ids );
        }
        $booking_data = [];
        foreach ( $booking_ids as $booking_id ) {
            $booking = new WBK_Booking($booking_id);
            $unit_id = (int) $booking->get( "unit_id" );
            if ( $unit_id > 0 ) {
                $unit = new WBK_Unit($unit_id);
                $booking_data[$booking_id]["duration"] = (int) $booking->get( "duration" );
                $booking_data[$booking_id]["service"] = ( $unit->is_loaded() ? (string) $unit->get( "name" ) : __( "Booking", "webba-booking-lite" ) );
                $booking_data[$booking_id]["service_id"] = 0;
                $booking_data[$booking_id]["unit_id"] = $unit_id;
            } else {
                $service = new WBK_Service($booking->get_service());
                $booking_data[$booking_id]["duration"] = $service->get_duration();
                $booking_data[$booking_id]["service"] = $service->get_name();
                $booking_data[$booking_id]["service_id"] = $service->get_id();
            }
            $booking_data[$booking_id]["time"] = (int) $booking->get_start();
            $booking_data[$booking_id]["quantity"] = $booking->get_quantity();
            $booking_data[$booking_id]["price"] = $booking->get_price();
            $booking_data[$booking_id]["offset"] = $booking->get( "time_offset" );
        }
        $ical_url = "";
        return new WP_REST_Response([
            "status"              => "success",
            "booking_data"        => $booking_data,
            "payment_details"     => $payment_details,
            "ical_url"            => $ical_url,
            "booking_instruction" => WBK_Placeholder_Processor::process_placeholders( get_option( "wbk_after_booking_instructions", "" ), $booking_ids ),
        ], 200);
    }

    public function booking_action_permission( $request ) : bool {
        return true;
        // Public endpoint
    }

    /**
     * Handle booking actions based on token and type
     *
     * @param WP_REST_Request $request Request object containing:
     *                                 - token: The booking group token
     *                                 - type: The action type (admin_cancel, customer_cancel, admin_approve)
     *
     * @return WP_REST_Response Response object with status and message
     */
    public function booking_action( WP_REST_Request $request ) : WP_REST_Response {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        $token = WBK_Validator::get_param_sanitize( sanitize_text_field( $request->get_param( "token" ) ) );
        $type = sanitize_text_field( $request->get_param( "type" ) );
        // Validate required parameters
        if ( empty( $token ) || empty( $type ) ) {
            return new WP_REST_Response([
                "status"  => "error",
                "message" => "Token and type are required",
            ], 400);
        }
        // Validate action type
        $allowed_types = ["admin_cancel", "customer_cancel", "admin_approve"];
        if ( !in_array( $type, $allowed_types ) ) {
            return new WP_REST_Response([
                "status"  => "error",
                "message" => "Invalid action type. Allowed types: " . implode( ", ", $allowed_types ),
            ], 400);
        }
        // Get booking IDs based on token type
        $booking_ids = [];
        if ( $type === "admin_cancel" || $type === "admin_approve" ) {
            $booking_ids = WBK_Model_Utils::get_booking_ids_by_group_admin_token( $token );
        } else {
            $booking_ids = WBK_Model_Utils::get_booking_ids_by_group_token( $token );
        }
        if ( empty( $booking_ids ) ) {
            return new WP_REST_Response([
                "status"  => "error",
                "message" => "No bookings found for the provided token",
            ], 404);
        }
        // Process action based on type
        switch ( $type ) {
            case "admin_cancel":
                $bf = new WBK_Booking_Factory();
                $cancelled_count = 0;
                foreach ( $booking_ids as $booking_id ) {
                    $bf->destroy( $booking_id, "administrator", false );
                    $cancelled_count++;
                }
                if ( $cancelled_count > 0 ) {
                    return new WP_REST_Response([
                        "status"  => "success",
                        "count"   => $cancelled_count,
                        "message" => sprintf( __( "Bookings canceled: %d", "webba-booking-lite" ), $cancelled_count ),
                    ], 200);
                }
                return new WP_REST_Response([
                    "status"  => "error",
                    "message" => __( "No bookings were canceled", "webba-booking-lite" ),
                ], 400);
            case "customer_cancel":
                $booking_ids_not_filtered = $booking_ids;
                $booking_ids = [];
                $valid_items = 0;
                $tokens = [];
                foreach ( $booking_ids_not_filtered as $booking_id ) {
                    $booking = new WBK_Booking($booking_id);
                    if ( !$booking->is_loaded() ) {
                        continue;
                    }
                    if ( $booking->get( "amount_paid" ) > 0 ) {
                        if ( get_option( "wbk_appointments_allow_cancel_paid_new", "" ) != "yes" && WBK_Feature_Gate::have_required_plan( "premium", "only_old_users" ) ) {
                            continue;
                        }
                    }
                    // Check cancellation buffer
                    $buffer = get_option( "wbk_cancellation_buffer", "" );
                    if ( WBK_Feature_Gate::have_required_plan( "premium", "only_old_users" ) ) {
                        if ( $buffer != "" ) {
                            if ( intval( $buffer ) > 0 ) {
                                $buffer_point = intval( $booking->get_start() - intval( $buffer ) * 60 );
                                if ( time() > $buffer_point ) {
                                    continue;
                                }
                            }
                        }
                    }
                    $valid_items++;
                    $booking_ids[] = $booking_id;
                }
                if ( empty( $booking_ids ) ) {
                    return new WP_REST_Response([
                        "status"  => "error",
                        "message" => __( "No bookings are eligible for cancellation", "webba-booking-lite" ),
                    ], 400);
                }
                $bf = new WBK_Booking_Factory();
                $cancelled_count = 0;
                foreach ( $booking_ids as $booking_id ) {
                    $bf->destroy( $booking_id, "customer", false );
                    $cancelled_count++;
                }
                if ( $cancelled_count > 0 ) {
                    return new WP_REST_Response([
                        "status"  => "success",
                        "count"   => $cancelled_count,
                        "message" => sprintf( __( "Bookings canceled: %d", "webba-booking-lite" ), $cancelled_count ),
                    ], 200);
                }
                return new WP_REST_Response([
                    "status"  => "error",
                    "message" => __( "No bookings were canceled", "webba-booking-lite" ),
                ], 400);
            case "admin_approve":
                $bf = new WBK_Booking_Factory();
                $approved_count = $bf->set_as_approved( $booking_ids );
                if ( $approved_count > 0 ) {
                    return new WP_REST_Response([
                        "status"  => "success",
                        "count"   => $approved_count,
                        "message" => sprintf( __( "Bookings approved: %d", "webba-booking-lite" ), $approved_count ),
                    ], 200);
                }
                return new WP_REST_Response([
                    "status"  => "error",
                    "message" => __( "No bookings were approved", "webba-booking-lite" ),
                ], 400);
            default:
                return new WP_REST_Response([
                    "status"  => "error",
                    "message" => "Unknown action type",
                ], 400);
        }
    }

    public function initialize_payment_method_permission( $request ) : bool {
        return true;
        // Public endpoint
    }

    /**
     * Initialize payment method using customer booking tokens
     *
     * @param WP_REST_Request $request Request object containing:
     *                                 - token: The customer booking group token
     *                                 - payment_method: Payment method (paypal, stripe, woocommerce, arrival, bank)
     *                                 - params: Optional additional parameters
     *
     * @return WP_REST_Response Response object with payment processing results
     */
    public function initialize_payment_method( WP_REST_Request $request ) : WP_REST_Response {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        $token = sanitize_text_field( $request->get_param( "token" ) );
        $payment_method = sanitize_text_field( $request->get_param( "payment_method" ) );
        $params = $request->get_params();
        // Validate required parameters
        if ( empty( $token ) || empty( $payment_method ) ) {
            return new WP_REST_Response([
                "status"  => "error",
                "message" => "Token and payment_method are required",
            ], 400);
        }
        // Validate payment method
        $allowed_payment_methods = [
            "paypal",
            "mollie",
            "stripe",
            "square",
            "woocommerce",
            "arrival",
            "bank",
            "google_pay",
            "apple_pay",
            "stripe_others"
        ];
        if ( !in_array( $payment_method, $allowed_payment_methods ) ) {
            return new WP_REST_Response([
                "status"  => "error",
                "message" => "Invalid payment method. Allowed: " . implode( ", ", $allowed_payment_methods ),
            ], 400);
        }
        // Get booking IDs using customer token only
        $booking_ids = WBK_Model_Utils::get_booking_ids_by_group_token( $token );
        if ( empty( $booking_ids ) ) {
            return new WP_REST_Response([
                "status"  => "error",
                "message" => "No bookings found for the provided token",
            ], 404);
        }
        // Get payment details for the bookings
        $payment_details = WBK_Price_Processor::get_payment_items_post_booked( $booking_ids );
        try {
            // Process payment using the existing private method
            $payment_result = $this->process_payment_method(
                $booking_ids,
                $payment_method,
                $params,
                $payment_details
            );
            return new WP_REST_Response([
                "status"         => "success",
                "booking_ids"    => $booking_ids,
                "payment_result" => $payment_result,
            ], 200);
        } catch ( Exception $e ) {
            return new WP_REST_Response([
                "status"  => "error",
                "message" => "Payment processing failed: " . $e->getMessage(),
            ], 500);
        }
    }

    public function send_test_email_permission( $request ) : bool {
        return current_user_can( "manage_options" );
    }

    public function send_test_smtp_permission( $request ) : bool {
        return current_user_can( "manage_options" );
    }

    public function send_test_zapier_permission( $request ) : bool {
        return current_user_can( "manage_options" );
    }

    /**
     * Send a synthetic Zapier Catch Hook test event.
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function send_test_zapier( $request ) : WP_REST_Response {
        if ( !class_exists( "WBK_Zapier" ) ) {
            return new \WP_REST_Response([
                "status"  => "error",
                "message" => __( "Zapier integration is not available.", "webba-booking-lite" ),
            ], 403);
        }
        $result = WBK_Zapier::send_test_event();
        if ( is_wp_error( $result ) ) {
            $code = ( $result->get_error_code() === "wbk_zapier_unavailable" ? 403 : 400 );
            return new \WP_REST_Response([
                "status"  => "error",
                "message" => $result->get_error_message(),
            ], $code);
        }
        return new \WP_REST_Response([
            "status"  => "success",
            "message" => __( "Test event was accepted by Zapier.", "webba-booking-lite" ),
        ], 200);
    }

    /**
     * Permission check for WhatsApp template management endpoints.
     *
     * @param WP_REST_Request $request Request object.
     * @return bool
     */
    public function whatsapp_templates_permission( $request ) : bool {
        return current_user_can( "manage_options" );
    }

    /**
     * Lists WhatsApp templates for the admin template field.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response
     */
    public function get_whatsapp_templates( WP_REST_Request $request ) : WP_REST_Response {
        if ( !class_exists( "WBK_WhatsApp" ) ) {
            return new WP_REST_Response([
                "status"    => "error",
                "message"   => __( "WhatsApp is not available.", "webba-booking-lite" ),
                "templates" => [],
            ], 400);
        }
        $business_account_id = sanitize_text_field( (string) $request->get_param( "business_account_id" ) );
        $templates = WBK_WhatsApp::get_templates_for_admin( ( $business_account_id !== "" ? $business_account_id : null ) );
        if ( is_wp_error( $templates ) ) {
            return new WP_REST_Response([
                "status"    => "error",
                "message"   => $templates->get_error_message(),
                "templates" => [],
            ], 400);
        }
        return new WP_REST_Response([
            "status"              => "success",
            "templates"           => $templates,
            "business_account_id" => ( $business_account_id !== "" ? $business_account_id : (string) get_option( "wbk_whatsapp_business_account_id", "" ) ),
        ], 200);
    }

    /**
     * Creates a WhatsApp template and submits it for Meta approval.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response
     */
    public function create_whatsapp_template( WP_REST_Request $request ) : WP_REST_Response {
        if ( !class_exists( "WBK_WhatsApp" ) ) {
            return new WP_REST_Response([
                "status"  => "error",
                "message" => __( "WhatsApp is not available.", "webba-booking-lite" ),
            ], 400);
        }
        $params = $request->get_json_params();
        if ( !is_array( $params ) ) {
            $params = $request->get_params();
        }
        $template_name = ( isset( $params["name"] ) ? sanitize_text_field( $params["name"] ) : "" );
        $language_code = ( isset( $params["language"] ) ? sanitize_text_field( $params["language"] ) : "en_US" );
        $category = ( isset( $params["category"] ) ? sanitize_text_field( $params["category"] ) : "UTILITY" );
        $body_text = ( isset( $params["body_text"] ) ? sanitize_textarea_field( $params["body_text"] ) : "" );
        $result = WBK_WhatsApp::create_template(
            $template_name,
            $language_code,
            $category,
            $body_text
        );
        if ( is_wp_error( $result ) || $result === false ) {
            return new WP_REST_Response([
                "status"  => "error",
                "message" => ( is_wp_error( $result ) ? $result->get_error_message() : __( "Failed to create WhatsApp template.", "webba-booking-lite" ) ),
            ], 400);
        }
        return new WP_REST_Response([
            "status"   => "success",
            "message"  => __( "Template submitted for approval.", "webba-booking-lite" ),
            "template" => $result,
        ], 200);
    }

    /**
     * Updates a WhatsApp template and resubmits it for Meta approval.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response
     */
    public function update_whatsapp_template( WP_REST_Request $request ) : WP_REST_Response {
        if ( !class_exists( "WBK_WhatsApp" ) ) {
            return new WP_REST_Response([
                "status"  => "error",
                "message" => __( "WhatsApp is not available.", "webba-booking-lite" ),
            ], 400);
        }
        $params = $request->get_json_params();
        if ( !is_array( $params ) ) {
            $params = $request->get_params();
        }
        $template_id = ( isset( $params["id"] ) ? sanitize_text_field( $params["id"] ) : "" );
        $body_text = ( isset( $params["body_text"] ) ? sanitize_textarea_field( $params["body_text"] ) : "" );
        $category = ( isset( $params["category"] ) ? sanitize_text_field( $params["category"] ) : "" );
        $components = ( isset( $params["components"] ) && is_array( $params["components"] ) ? $params["components"] : [] );
        $result = WBK_WhatsApp::update_template(
            $template_id,
            $body_text,
            $components,
            $category
        );
        if ( is_wp_error( $result ) || $result === false ) {
            return new WP_REST_Response([
                "status"  => "error",
                "message" => ( is_wp_error( $result ) ? $result->get_error_message() : __( "Failed to update WhatsApp template.", "webba-booking-lite" ) ),
            ], 400);
        }
        return new WP_REST_Response([
            "status"   => "success",
            "message"  => __( "Template update submitted for approval.", "webba-booking-lite" ),
            "template" => $result,
        ], 200);
    }

    /**
     * Validates a WhatsApp access token and returns WABA/phone dropdown options.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response
     */
    public function validate_whatsapp_token( WP_REST_Request $request ) : WP_REST_Response {
        if ( !class_exists( "WBK_WhatsApp" ) ) {
            return new WP_REST_Response([
                "status"  => "error",
                "message" => __( "WhatsApp is not available.", "webba-booking-lite" ),
            ], 400);
        }
        $params = $request->get_json_params();
        if ( !is_array( $params ) ) {
            $params = $request->get_params();
        }
        $access_token = ( isset( $params["access_token"] ) ? sanitize_text_field( $params["access_token"] ) : "" );
        $result = WBK_WhatsApp::validate_access_token( $access_token );
        if ( is_wp_error( $result ) || $result === false ) {
            return new WP_REST_Response([
                "status"  => "error",
                "message" => ( is_wp_error( $result ) ? $result->get_error_message() : __( "Failed to validate WhatsApp access token.", "webba-booking-lite" ) ),
            ], 400);
        }
        return new WP_REST_Response([
            "status"  => "success",
            "message" => __( "Access token validated successfully.", "webba-booking-lite" ),
            "data"    => $result,
        ], 200);
    }

    /**
     * Returns WhatsApp OAuth status and Connect URLs.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response
     */
    public function get_whatsapp_auth_data( WP_REST_Request $request ) : WP_REST_Response {
        unset($request);
        if ( !class_exists( "WBK_Webba_Connect" ) ) {
            return new WP_REST_Response([
                "isAuthenticated" => false,
                "internalError"   => true,
            ], 200);
        }
        $webba_connect = new WBK_Webba_Connect();
        $token_data = $webba_connect->fetch_facebook_access_token_from_webba_connect( "whatsapp" );
        $access_token = ( is_array( $token_data ) && !empty( $token_data["access_token"] ) ? trim( (string) $token_data["access_token"] ) : trim( (string) get_option( "wbk_whatsapp_access_token", "" ) ) );
        $is_authenticated = $access_token !== "";
        if ( $is_authenticated ) {
            return new WP_REST_Response([
                "isAuthenticated" => true,
                "internalError"   => false,
                "access_token"    => $access_token,
                "revokeUrl"       => $webba_connect->get_facebook_revoke_url( "whatsapp" ),
            ], 200);
        }
        if ( $webba_connect->check_backend_health() === false ) {
            return new WP_REST_Response([
                "isAuthenticated" => false,
                "internalError"   => true,
            ], 200);
        }
        return new WP_REST_Response([
            "isAuthenticated" => false,
            "internalError"   => false,
            "access_token"    => "",
            "authUrl"         => $webba_connect->get_facebook_authorization_url( "whatsapp" ),
        ], 200);
    }

    /**
     * Revokes WhatsApp authorization on Connect and clears the local token.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response
     */
    public function remove_whatsapp_auth( WP_REST_Request $request ) : WP_REST_Response {
        unset($request);
        if ( class_exists( "WBK_Webba_Connect" ) ) {
            $webba_connect = new WBK_Webba_Connect();
            $revoke_url = $webba_connect->get_facebook_revoke_url( "whatsapp" );
            if ( is_string( $revoke_url ) && $revoke_url !== "" ) {
                wp_remote_get( $revoke_url, [
                    "timeout"     => 15,
                    "redirection" => 0,
                    "sslverify"   => strpos( $revoke_url, "https://" ) === 0,
                ] );
            }
            $webba_connect->clear_local_facebook_access_token();
        } else {
            update_option( "wbk_whatsapp_access_token", "" );
            delete_option( "wbk_whatsapp_token_expiry" );
            update_option( "wbk_whatsapp_business_account_id", "" );
            update_option( "wbk_whatsapp_phone_number_id", "" );
            delete_option( "wbk_whatsapp_discovered_waba_ids" );
        }
        return new WP_REST_Response([
            "status"  => "success",
            "message" => __( "WhatsApp authorization removed successfully.", "webba-booking-lite" ),
        ], 200);
    }

    /**
     * Whether the current user can subscribe to push notifications.
     *
     * @param WP_REST_Request $request REST request.
     * @return bool
     */
    public function push_subscribe_permission( $request ) : bool {
        return is_user_logged_in() && (current_user_can( "manage_options" ) || current_user_can( "read" ));
    }

    /**
     * Whether the current user can send a test push notification.
     *
     * @param WP_REST_Request $request REST request.
     * @return bool
     */
    public function send_test_push_permission( $request ) : bool {
        return $this->push_subscribe_permission( $request );
    }

    /**
     * Return public Web Push configuration for the current user.
     *
     * @param WP_REST_Request $request REST request.
     * @return WP_REST_Response
     */
    public function get_push_config( $request ) : WP_REST_Response {
        return new WP_REST_Response(WBK_Push_Processor::get_public_config(), 200);
    }

    /**
     * Save a browser push subscription for the current user.
     *
     * @param WP_REST_Request $request REST request.
     * @return WP_REST_Response
     */
    public function save_push_subscription( $request ) : WP_REST_Response {
        $params = $request->get_json_params();
        if ( !is_array( $params ) ) {
            $params = $request->get_params();
        }
        $endpoint = ( isset( $params["endpoint"] ) ? esc_url_raw( $params["endpoint"] ) : "" );
        $keys = ( isset( $params["keys"] ) && is_array( $params["keys"] ) ? $params["keys"] : [] );
        $p256dh = ( isset( $keys["p256dh"] ) ? WBK_Push_Processor::sanitize_subscription_key( $keys["p256dh"] ) : "" );
        $auth = ( isset( $keys["auth"] ) ? WBK_Push_Processor::sanitize_subscription_key( $keys["auth"] ) : "" );
        if ( $endpoint === "" || $p256dh === "" || $auth === "" ) {
            return new WP_REST_Response([
                "status"  => "error",
                "message" => __( "Invalid browser notification subscription.", "webba-booking-lite" ),
            ], 400);
        }
        $saved = WBK_Push_Processor::save_subscription(
            $endpoint,
            $p256dh,
            $auth,
            get_current_user_id()
        );
        if ( !$saved ) {
            return new WP_REST_Response([
                "status"  => "error",
                "message" => __( "Failed to save the browser notification subscription.", "webba-booking-lite" ),
            ], 500);
        }
        return new WP_REST_Response([
            "status"  => "success",
            "message" => __( "Browser notifications enabled for this browser.", "webba-booking-lite" ),
        ], 200);
    }

    /**
     * Send a test push notification to the current user.
     *
     * @param WP_REST_Request $request REST request.
     * @return WP_REST_Response
     */
    public function send_test_push( $request ) : WP_REST_Response {
        $result = WBK_Push_Processor::send_test( get_current_user_id() );
        $status_code = ( $result["success"] ? 200 : 400 );
        return new WP_REST_Response([
            "status"  => ( $result["success"] ? "success" : "error" ),
            "message" => $result["message"],
        ], $status_code);
    }

    public function send_test_smtp( $request ) : WP_REST_Response {
        $params = $request->get_json_params();
        if ( !is_array( $params ) ) {
            $params = $request->get_params();
        }
        $email = ( isset( $params["email"] ) ? sanitize_email( $params["email"] ) : "" );
        $result = WBK_Mailer::send_test_email( $email );
        if ( !$result["success"] ) {
            return new \WP_REST_Response([
                "status"  => "error",
                "message" => $result["message"],
            ], 400);
        }
        return new \WP_REST_Response([
            "status"  => "success",
            "message" => $result["message"],
        ], 200);
    }

    public function send_test_email( $request ) : WP_REST_Response {
        $id = ( isset( $request["id"] ) ? sanitize_text_field( $request["id"] ) : "" );
        $bookings = ( isset( $request["bookings"] ) ? $request["bookings"] : [] );
        $email = ( isset( $request["email"] ) ? sanitize_text_field( $request["email"] ) : "" );
        if ( !is_array( $bookings ) ) {
            return new \WP_REST_Response([
                "status"  => "error",
                "message" => __( "Bookings should be an array", "webba-booking-lite" ),
            ], 400);
        }
        WBK_Email_Processor::send_test( $bookings, $id, $email );
        $response = new \WP_REST_Response([
            "status"  => "success",
            "message" => __( "Test email sent successfully!", "webba-booking-lite" ),
        ]);
        $response->set_status( 200 );
        return $response;
    }

    /**
     * Returns permission for saving options
     *
     * @param WP_REST_Request $request
     * @return boolean
     */
    public function save_options_permission( $request ) : bool {
        return current_user_can( "manage_options" );
    }

    /**
     * Save options endpoint
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function save_options( $request ) : WP_REST_Response {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        global $wp_settings_fields;
        if ( !isset( $wp_settings_fields["wbk-options"] ) ) {
            if ( !function_exists( "add_settings_section" ) ) {
                require_once ABSPATH . "wp-admin/includes/template.php";
            }
            $backend_options = new WBK_Backend_Options();
            $backend_options->initSettings();
        }
        $params = $request->get_params();
        $form_data = ( isset( $params["form_data"] ) ? $params["form_data"] : "" );
        if ( empty( $form_data ) ) {
            return new \WP_REST_Response([
                "status"  => "error",
                "message" => __( "Form data is required", "webba-booking-lite" ),
            ], 400);
        }
        try {
            $options = json_decode( $form_data, true );
        } catch ( Exception $e ) {
            return new \WP_REST_Response([
                "status"  => "error",
                "message" => __( "Invalid form data", "webba-booking-lite" ),
            ], 400);
        }
        if ( !isset( $options["section"] ) ) {
            return new \WP_REST_Response([
                "status"  => "error",
                "message" => __( "Section is required", "webba-booking-lite" ),
            ], 400);
        }
        if ( !isset( $wp_settings_fields["wbk-options"][$options["section"]] ) ) {
            return new \WP_REST_Response([
                "status"  => "error",
                "message" => __( "Invalid section", "webba-booking-lite" ),
            ], 400);
        }
        $settings_fields = $wp_settings_fields["wbk-options"][$options["section"]];
        $zapier_available = class_exists( "WBK_Feature_Gate" ) && WBK_Feature_Gate::have_required_plan( "premium" );
        foreach ( $settings_fields as $field ) {
            if ( WBK_Options_Processor::is_non_persistent_field( $field ) ) {
                continue;
            }
            $field_id = $field["id"];
            $is_zapier_field = strpos( $field_id, "wbk_zapier_" ) === 0;
            // Pro-only: ignore Zapier setting writes when Pro is unavailable.
            if ( $is_zapier_field && !$zapier_available ) {
                continue;
            }
            if ( isset( $options[$field_id] ) ) {
                $option_value = $options[$field_id];
                $callback = $field["callback"][1] ?? "";
                if ( $callback === "render_nested_numbers" ) {
                    $option_value = WBK_Options_Processor::sanitize_nested_numbers( $option_value );
                }
                if ( $field_id === "wbk_zapier_webhook_url" ) {
                    $option_value = ( is_string( $option_value ) ? trim( $option_value ) : "" );
                    if ( $option_value !== "" && class_exists( "WBK_Zapier" ) ) {
                        $valid = WBK_Zapier::validate_webhook_url( $option_value );
                        if ( is_wp_error( $valid ) ) {
                            return new \WP_REST_Response([
                                "status"  => "error",
                                "message" => $valid->get_error_message(),
                            ], 400);
                        }
                    }
                }
                if ( $field_id === "wbk_zapier_enabled" && $option_value === "yes" && class_exists( "WBK_Zapier" ) ) {
                    $url_to_check = ( isset( $options["wbk_zapier_webhook_url"] ) ? trim( (string) $options["wbk_zapier_webhook_url"] ) : WBK_Zapier::get_configured_webhook_url() );
                    $valid = WBK_Zapier::validate_webhook_url( $url_to_check );
                    if ( is_wp_error( $valid ) ) {
                        return new \WP_REST_Response([
                            "status"  => "error",
                            "message" => $valid->get_error_message(),
                        ], 400);
                    }
                }
                update_option( $field_id, $option_value );
            } else {
                update_option( $field_id, "" );
            }
            if ( $field_id == "wbk_email_admin_daily_time" ) {
                date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
                $time_corr = intval( get_option( "wbk_email_admin_daily_time", "68400" ) );
                $midnight = strtotime( "today midnight" );
                $timestamp = strtotime( "today midnight" ) + $time_corr;
                if ( $timestamp < time() ) {
                    $timestamp += 86400;
                }
                wp_clear_scheduled_hook( "wbk_daily_event" );
                wp_schedule_event( $timestamp, "daily", "wbk_daily_event" );
                date_default_timezone_set( "UTC" );
            }
        }
        do_action( "wbk_options_saved", $options["section"], $options );
        WBK_Mixpanel::update_configuration( false );
        $response = new \WP_REST_Response([
            "status"  => "success",
            "message" => __( "Options saved successfully", "webba-booking-lite" ),
        ]);
        $response->set_status( 200 );
        return $response;
    }

    /**
     * Returns permission for getting options
     *
     * @param WP_REST_Request $request
     * @return boolean
     */
    public function get_options_permission( $request ) : bool {
        return current_user_can( "manage_options" );
    }

    /**
     * Get all options endpoint
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function get_options( $request ) : WP_REST_Response {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        global $wp_settings_fields;
        if ( !isset( $wp_settings_fields["wbk-options"] ) ) {
            if ( !function_exists( "add_settings_section" ) ) {
                require_once ABSPATH . "wp-admin/includes/template.php";
            }
            $backend_options = new WBK_Backend_Options();
            $backend_options->initSettings();
        }
        if ( !isset( $wp_settings_fields["wbk-options"] ) ) {
            return new \WP_REST_Response([
                "status"  => "error",
                "message" => __( "Settings fields not initialized", "webba-booking-lite" ),
            ], 500);
        }
        $settings_fields = $wp_settings_fields["wbk-options"];
        $options_data = [];
        // Sort $settings_fields (which is expected to be an associative array keyed by section id) by section 'priority', maintaining keys.
        if ( is_array( $settings_fields ) ) {
            // fetch global $wp_settings_sections for priorities
            global $wp_settings_sections;
            $sections_for_priorities = ( isset( $wp_settings_sections["wbk-options"] ) ? $wp_settings_sections["wbk-options"] : [] );
            // Compose sortable array: [ section_id, priority, fields ]
            $sortable_sections = [];
            foreach ( $settings_fields as $section_id => $fields ) {
                $priority = ( isset( $sections_for_priorities[$section_id]["priority"] ) ? intval( $sections_for_priorities[$section_id]["priority"] ) : 0 );
                $sortable_sections[] = [
                    "id"       => $section_id,
                    "priority" => $priority,
                    "fields"   => $fields,
                ];
            }
            // Sort by priority
            usort( $sortable_sections, function ( $a, $b ) {
                return $a["priority"] - $b["priority"];
            } );
            // Build sorted settings_fields, preserving original structure (id as key => fields as value)
            $new_settings_fields = [];
            foreach ( $sortable_sections as $entry ) {
                $new_settings_fields[$entry["id"]] = $entry["fields"];
            }
            $settings_fields = $new_settings_fields;
        }
        // Iterate through all sections
        foreach ( $settings_fields as $section_id => $fields ) {
            $section_data = [
                "id"     => $section_id,
                "fields" => [],
            ];
            // Get section title if available
            global $wp_settings_sections;
            if ( isset( $wp_settings_sections["wbk-options"][$section_id] ) ) {
                $section_info = $wp_settings_sections["wbk-options"][$section_id];
                $section_data["title"] = ( isset( $section_info["title"] ) ? $section_info["title"] : "" );
                $section_data["icon"] = ( isset( $section_info["icon"] ) ? $section_info["icon"] : "" );
                $section_data["description"] = ( isset( $section_info["description"] ) ? $section_info["description"] : "" );
                $section_data["sections"] = ( isset( $section_info["sections"] ) ? $section_info["sections"] : [] );
                $section_data["tabs"] = ( isset( $section_info["tabs"] ) ? $section_info["tabs"] : [] );
                $section_data["required_plan"] = ( isset( $section_info["required_plan"] ) ? $section_info["required_plan"] : "" );
                $section_data["editor_view"] = ( isset( $section_info["editor_view"] ) ? $section_info["editor_view"] : false );
            }
            // Iterate through all fields in the section
            foreach ( $fields as $field ) {
                $field_id = $field["id"];
                $field_args = ( isset( $field["args"] ) ? $field["args"] : [] );
                // Get current option value
                $current_value = get_option( $field_id, false );
                // If option doesn't exist, use default value
                if ( $current_value === false && isset( $field_args["default"] ) ) {
                    $current_value = $field_args["default"];
                }
                $field_data = [
                    "id"                    => $field_id,
                    "title"                 => ( isset( $field["title"] ) ? $field["title"] : "" ),
                    "value"                 => $current_value,
                    "default"               => ( isset( $field_args["default"] ) ? $field_args["default"] : "" ),
                    "type"                  => $this->detect_field_type( $field ),
                    "description"           => ( isset( $field_args["description"] ) ? $field_args["description"] : "" ),
                    "placeholder"           => ( isset( $field_args["placeholder"] ) ? $field_args["placeholder"] : "" ),
                    "subsection"            => ( isset( $field_args["subsection"] ) ? $field_args["subsection"] : "basic" ),
                    "tooltip"               => ( isset( $field_args["popup"] ) ? $field_args["popup"] : "" ),
                    "required_plan"         => ( isset( $field_args["required_plan"] ) ? $field_args["required_plan"] : "" ),
                    "available_in_old_free" => ( isset( $field_args["available_in_old_free"] ) ? $field_args["available_in_old_free"] : "" ),
                    "tab"                   => ( isset( $field_args["tab"] ) ? $field_args["tab"] : "" ),
                    "subsection"            => ( isset( $field_args["subsection"] ) ? $field_args["subsection"] : "" ),
                    "sub_type"              => ( isset( $field_args["sub_type"] ) ? $field_args["sub_type"] : "" ),
                    "required"              => !empty( $field_args["required"] ),
                    "dependent_value"       => ( isset( $field_args["dependent_value"] ) ? $field_args["dependent_value"] : "" ),
                    "searchable"            => ( isset( $field_args["searchable"] ) ? $field_args["searchable"] : false ),
                    "radio_type"            => ( isset( $field_args["radio_type"] ) ? $field_args["radio_type"] : "" ),
                    "column_count"          => ( isset( $field_args["column_count"] ) ? intval( $field_args["column_count"] ) : null ),
                    "max_length"            => ( isset( $field_args["max_length"] ) ? intval( $field_args["max_length"] ) : null ),
                ];
                // Add extra field-specific data
                if ( isset( $field_args["extra"] ) ) {
                    $field_data["extra"] = $field_args["extra"];
                }
                // Add dependency information if available
                if ( isset( $field_args["dependency"] ) && is_array( $field_args["dependency"] ) ) {
                    $field_data["dependency"] = $field_args["dependency"];
                }
                // Add checkbox value if it's a checkbox field
                if ( isset( $field_args["checkbox_value"] ) ) {
                    $field_data["checkbox_value"] = $field_args["checkbox_value"];
                }
                if ( $field_id === "wbk_zapier_last_status_notice" && class_exists( "WBK_Zapier" ) ) {
                    $field_data["tooltip"] = WBK_Zapier::get_last_delivery_summary();
                }
                $section_data["fields"][] = $field_data;
            }
            $options_data[$section_id] = $section_data;
        }
        $response = new \WP_REST_Response([
            "status" => "success",
            "data"   => $options_data,
        ]);
        $response->set_status( 200 );
        return $response;
    }

    /**
     * Detect field type based on render callback
     *
     * @param array $field Field data
     * @return string Field type
     */
    private function detect_field_type( $field ) : string {
        if ( !isset( $field["callback"] ) || !is_array( $field["callback"] ) ) {
            return "text";
        }
        $callback_method = $field["callback"][1] ?? "";
        // Map render callbacks to field types
        $type_map = [
            "render_text"              => "text",
            "render_pass"              => "password",
            "render_textarea"          => "textarea",
            "render_checkbox"          => "checkbox",
            "render_select"            => "select",
            "render_radio"             => "radio",
            "render_select_multiple"   => "select_multiple",
            "render_editor"            => "editor",
            "render_google_connect"    => "google_connect",
            "render_zoom_auth"         => "zoom_auth",
            "render_gmail_auth"        => "gmail_auth",
            "render_duration"          => "duration",
            "render_date_multiple"     => "date_multiple",
            "render_business_hours"    => "business_hours",
            "render_notice"            => "notice",
            "render_password"          => "password",
            "render_smtp_test"         => "smtp_test",
            "render_zapier_test"       => "zapier_test",
            "render_whatsapp_template" => "whatsapp_template",
            "render_whatsapp_validate" => "whatsapp_validate",
            "render_whatsapp_auth"     => "whatsapp_auth",
            "render_push_subscribe"    => "push_subscribe",
            "render_file"              => "file",
            "render_nested_numbers"    => "nested_numbers",
        ];
        return $type_map[$callback_method] ?? "text";
    }

    /**
     * Returns permission for gift card code endpoints.
     *
     * @param WP_REST_Request $request
     * @return boolean
     */
    public function check_gift_card_code_permission( WP_REST_Request $request ) : bool {
        return current_user_can( "manage_options" );
    }

    /**
     * Check whether a gift card code is already used.
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function check_gift_card_code( WP_REST_Request $request ) : WP_REST_Response {
        $params = $request->get_params();
        $code = ( isset( $params["code"] ) ? trim( sanitize_text_field( $params["code"] ) ) : "" );
        $exclude_id = ( isset( $params["exclude_id"] ) ? intval( $params["exclude_id"] ) : 0 );
        if ( $code === "" ) {
            $response = new \WP_REST_Response([
                "available" => false,
                "message"   => __( "Gift card code is required.", "webba-booking-lite" ),
            ]);
            $response->set_status( 400 );
            return $response;
        }
        $exists = WBK_Gift_Card::code_exists( $code, ( $exclude_id > 0 ? $exclude_id : null ) );
        $response = new \WP_REST_Response([
            "available" => !$exists,
            "code"      => $code,
            "message"   => ( $exists ? __( "This gift card code is already used.", "webba-booking-lite" ) : __( "This gift card code is available.", "webba-booking-lite" ) ),
        ]);
        $response->set_status( 200 );
        return $response;
    }

    /**
     * Generate a unique unused gift card code.
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function generate_gift_card_code( WP_REST_Request $request ) : WP_REST_Response {
        $code = WBK_Gift_Card::generate_unique_code();
        $response = new \WP_REST_Response([
            "code"      => $code,
            "available" => true,
        ]);
        $response->set_status( 200 );
        return $response;
    }

    /**
     * Public endpoint — gift card purchase form can create a Stripe intent.
     *
     * @param WP_REST_Request $request
     * @return boolean
     */
    public function create_gift_card_stripe_intent_permission( WP_REST_Request $request ) : bool {
        return true;
    }

    /**
     * Create a Stripe payment intent for a gift card purchase amount.
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function create_gift_card_stripe_intent( WP_REST_Request $request ) : WP_REST_Response {
        $params = $request->get_params();
        $amount = ( isset( $params["amount"] ) ? floatval( str_replace( ",", ".", (string) $params["amount"] ) ) : 0 );
        $email = ( isset( $params["email"] ) ? sanitize_email( (string) $params["email"] ) : "" );
        $payment_method = ( isset( $params["payment_method"] ) ? sanitize_text_field( (string) $params["payment_method"] ) : "stripe" );
        $stripe_methods = [
            "stripe",
            "stripe_others",
            "google_pay",
            "apple_pay"
        ];
        $configured = WBK_Model_Utils::get_configured_gift_card_payment_methods();
        if ( !in_array( $payment_method, $stripe_methods, true ) ) {
            return new WP_REST_Response([
                "success" => false,
                "message" => __( "Invalid payment method.", "webba-booking-lite" ),
            ], 400);
        }
        if ( !isset( $configured[$payment_method] ) ) {
            return new WP_REST_Response([
                "success" => false,
                "message" => __( "This payment method is not available for gift cards.", "webba-booking-lite" ),
            ], 400);
        }
        if ( $amount <= 0 ) {
            return new WP_REST_Response([
                "success" => false,
                "message" => __( "Please enter a valid amount", "webba-booking-lite" ),
            ], 400);
        }
        if ( $email === "" || !filter_var( $email, FILTER_VALIDATE_EMAIL ) ) {
            return new WP_REST_Response([
                "success" => false,
                "message" => __( "Please enter a valid email address", "webba-booking-lite" ),
            ], 400);
        }
        $stripe = new WBK_Stripe();
        if ( !$stripe->init( 0 ) ) {
            return new WP_REST_Response([
                "success" => false,
                "message" => __( "Stripe is not configured.", "webba-booking-lite" ),
            ], 400);
        }
        $intent_data = $stripe->create_payment_intent( $payment_method, $email, [
            "to_pay_total" => $amount,
            "description"  => __( "Gift card", "webba-booking-lite" ),
            "items"        => [],
        ] );
        if ( empty( $intent_data["success"] ) ) {
            return new WP_REST_Response([
                "success"        => false,
                "message"        => $intent_data["error"] ?? __( "Unable to initialize Stripe payment.", "webba-booking-lite" ),
                "stripe_details" => [
                    "error" => $intent_data["error"] ?? __( "Unable to initialize Stripe payment.", "webba-booking-lite" ),
                ],
            ], 400);
        }
        return new WP_REST_Response([
            "success" => true,
            "data"    => [
                "to_pay_total"   => $amount,
                "stripe_details" => [
                    "client_secret"  => $intent_data["client_secret"],
                    "intent_id"      => $intent_data["intent_id"],
                    "amount"         => $amount,
                    "payment_method" => $payment_method,
                ],
            ],
        ], 200);
    }

    /**
     * Public endpoint — gift card purchase form.
     *
     * @param WP_REST_Request $request
     * @return boolean
     */
    public function purchase_gift_card_permission( WP_REST_Request $request ) : bool {
        return true;
    }

    /**
     * Purchase a gift card: charge via the selected method, then create the DB row
     * only after payment is completed (or after redirect/cart completion for PayPal/Mollie/Woo).
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function purchase_gift_card( WP_REST_Request $request ) : WP_REST_Response {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        $params = $request->get_params();
        $payment_method = ( isset( $params["payment_method"] ) ? sanitize_text_field( (string) $params["payment_method"] ) : "" );
        $configured = WBK_Model_Utils::get_configured_gift_card_payment_methods();
        if ( $payment_method === "" || !isset( $configured[$payment_method] ) ) {
            return new WP_REST_Response([
                "success" => false,
                "message" => __( "This payment method is not available for gift cards.", "webba-booking-lite" ),
            ], 400);
        }
        $sanitized = WBK_Gift_Card::sanitize_purchase_payload( $params );
        if ( empty( $sanitized["success"] ) ) {
            return new WP_REST_Response([
                "success" => false,
                "message" => $sanitized["message"] ?? __( "Invalid gift card data.", "webba-booking-lite" ),
            ], 400);
        }
        $gift_card_data = $sanitized["data"];
        $amount = floatval( $gift_card_data["amount"] );
        $stripe_methods = [
            "stripe",
            "stripe_others",
            "google_pay",
            "apple_pay"
        ];
        if ( in_array( $payment_method, $stripe_methods, true ) ) {
            if ( !wbk_fs()->is__premium_only() || !wbk_fs()->can_use_premium_code() ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => __( "Stripe is not available.", "webba-booking-lite" ),
                ], 400);
            }
            $stripe_details = ( isset( $params["stripe_details"] ) ? $params["stripe_details"] : [] );
            if ( is_string( $stripe_details ) ) {
                $stripe_details = json_decode( $stripe_details, true );
            }
            if ( !is_array( $stripe_details ) ) {
                $stripe_details = [];
            }
            $intent_id = ( isset( $stripe_details["intent_id"] ) ? sanitize_text_field( (string) $stripe_details["intent_id"] ) : "" );
            if ( $intent_id === "" && isset( $params["payment_intent_id"] ) ) {
                $intent_id = sanitize_text_field( (string) $params["payment_intent_id"] );
            }
            if ( $intent_id === "" ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => __( "Missing Stripe payment intent.", "webba-booking-lite" ),
                ], 400);
            }
            $stripe = new WBK_Stripe();
            if ( !$stripe->init( 0 ) ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => __( "Stripe is not configured.", "webba-booking-lite" ),
                ], 400);
            }
            $payment_intent = $stripe->get_payment_intent( $intent_id );
            if ( !$payment_intent || empty( $payment_intent->status ) || $payment_intent->status !== "succeeded" ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => __( "Payment has not been completed.", "webba-booking-lite" ),
                ], 400);
            }
            if ( WBK_Stripe::is_currency_zero_decimal( get_option( "wbk_stripe_currency", "" ) ) ) {
                $expected = intval( $amount );
            } else {
                $expected = intval( round( $amount * 100 ) );
            }
            if ( intval( $payment_intent->amount ) !== $expected ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => __( "Paid amount does not match the gift card amount.", "webba-booking-lite" ),
                ], 400);
            }
            $created = WBK_Gift_Card::create_from_paid_order( $gift_card_data, $payment_method, $intent_id );
            if ( empty( $created["success"] ) ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => $created["message"] ?? __( "Unable to create gift card.", "webba-booking-lite" ),
                ], 500);
            }
            return new WP_REST_Response([
                "success"          => true,
                "payment_required" => false,
                "payment_method"   => $payment_method,
                "gift_card"        => $created["gift_card"],
                "message"          => __( "Gift card purchased successfully.", "webba-booking-lite" ),
            ], 200);
        }
        if ( $payment_method === "square" ) {
            if ( !wbk_fs()->is__premium_only() || !wbk_fs()->can_use_premium_code() ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => __( "Square is not available.", "webba-booking-lite" ),
                ], 400);
            }
            $source_id = ( isset( $params["square_source_id"] ) ? sanitize_text_field( (string) $params["square_source_id"] ) : "" );
            $verification_token = ( isset( $params["square_verification_token"] ) ? sanitize_text_field( (string) $params["square_verification_token"] ) : "" );
            if ( $source_id === "" ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => __( "Missing Square card details.", "webba-booking-lite" ),
                ], 400);
            }
            $square = new WBK_Square();
            $charge_result = $square->charge_gift_card(
                $amount,
                $source_id,
                wp_generate_uuid4(),
                $verification_token,
                $gift_card_data["buyer_email"]
            );
            if ( !isset( $charge_result[0] ) || intval( $charge_result[0] ) !== 1 ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => $charge_result[1] ?? __( "Unable to complete the payment", "webba-booking-lite" ),
                ], 400);
            }
            $created = WBK_Gift_Card::create_from_paid_order( $gift_card_data, $payment_method, (string) $charge_result[2] );
            if ( empty( $created["success"] ) ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => $created["message"] ?? __( "Unable to create gift card.", "webba-booking-lite" ),
                ], 500);
            }
            return new WP_REST_Response([
                "success"          => true,
                "payment_required" => false,
                "payment_method"   => $payment_method,
                "gift_card"        => $created["gift_card"],
                "message"          => __( "Gift card purchased successfully.", "webba-booking-lite" ),
            ], 200);
        }
        if ( $payment_method === "paypal" ) {
            if ( !wbk_fs()->is__premium_only() || !wbk_fs()->can_use_premium_code() ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => __( "PayPal is not available.", "webba-booking-lite" ),
                ], 400);
            }
            $paypal = new WBK_PayPal();
            $referer = explode( "?", wp_get_referer() );
            $base_url = ( !empty( $referer[0] ) ? $referer[0] : home_url( "/" ) );
            if ( !$paypal->init( $base_url, [] ) ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => __( "Unable to initialize PayPal.", "webba-booking-lite" ),
                ], 500);
            }
            $paypal_result = $paypal->create_gift_card_payment( $gift_card_data );
            if ( $paypal_result === false || empty( $paypal_result["payment_url"] ) ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => __( "Unable to create PayPal payment.", "webba-booking-lite" ),
                ], 500);
            }
            return new WP_REST_Response([
                "success"          => true,
                "payment_required" => true,
                "payment_method"   => "paypal",
                "payment_url"      => $paypal_result["payment_url"],
                "payment_id"       => $paypal_result["payment_id"],
                "payment_details"  => [
                    "item_names"   => [__( "Gift card", "webba-booking-lite" )],
                    "prices"       => [$amount],
                    "quantities"   => [1],
                    "to_pay_total" => $amount,
                    "tax_to_pay"   => 0,
                ],
                "message"          => __( "Please complete your PayPal payment.", "webba-booking-lite" ),
            ], 200);
        }
        if ( $payment_method === "mollie" ) {
            if ( !wbk_fs()->is__premium_only() || !wbk_fs()->can_use_premium_code() ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => __( "Mollie is not available.", "webba-booking-lite" ),
                ], 400);
            }
            $mollie = new WBK_Mollie();
            $referer = explode( "?", wp_get_referer() );
            $base_url = ( !empty( $referer[0] ) ? $referer[0] : home_url( "/" ) );
            if ( !$mollie->init( $base_url, [] ) ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => __( "Unable to initialize Mollie.", "webba-booking-lite" ),
                ], 500);
            }
            $mollie_result = $mollie->create_gift_card_payment( $gift_card_data );
            if ( $mollie_result === false || empty( $mollie_result["payment_url"] ) ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => __( "Unable to create Mollie payment.", "webba-booking-lite" ),
                ], 500);
            }
            return new WP_REST_Response([
                "success"          => true,
                "payment_required" => true,
                "payment_method"   => "mollie",
                "payment_url"      => $mollie_result["payment_url"],
                "payment_id"       => $mollie_result["payment_id"],
                "payment_details"  => [
                    "item_names"   => [__( "Gift card", "webba-booking-lite" )],
                    "prices"       => [$amount],
                    "quantities"   => [1],
                    "to_pay_total" => $amount,
                    "tax_to_pay"   => 0,
                ],
                "message"          => __( "Please complete your Mollie payment.", "webba-booking-lite" ),
            ], 200);
        }
        if ( $payment_method === "woocommerce" ) {
            if ( !wbk_fs()->is__premium_only() || !wbk_fs()->can_use_premium_code() ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => __( "WooCommerce is not available.", "webba-booking-lite" ),
                ], 400);
            }
            $result = WBK_WooCommerce::add_gift_card_to_cart( $gift_card_data );
            $result = json_decode( $result, true );
            if ( !is_array( $result ) || intval( $result["status"] ?? 0 ) !== 1 ) {
                return new WP_REST_Response([
                    "success" => false,
                    "message" => $result["details"] ?? __( "Unable to add gift card to cart.", "webba-booking-lite" ),
                ], 500);
            }
            return new WP_REST_Response([
                "success"          => true,
                "payment_required" => true,
                "payment_method"   => "woocommerce",
                "payment_url"      => $result["details"],
                "payment_details"  => [
                    "item_names"   => [__( "Gift card", "webba-booking-lite" )],
                    "prices"       => [$amount],
                    "quantities"   => [1],
                    "to_pay_total" => $amount,
                    "tax_to_pay"   => 0,
                ],
                "message"          => __( "Gift card added to cart. Please complete checkout.", "webba-booking-lite" ),
            ], 200);
        }
        return new WP_REST_Response([
            "success" => false,
            "message" => __( "Unsupported payment method.", "webba-booking-lite" ),
        ], 400);
    }

    /**
     * Fetch gift card details after a completed redirect payment (PayPal, Mollie).
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function get_gift_card_payment_details( WP_REST_Request $request ) : WP_REST_Response {
        $payment_id = sanitize_text_field( (string) $request->get_param( "payment_id" ) );
        if ( $payment_id === "" ) {
            return new WP_REST_Response([
                "success" => false,
                "message" => __( "Missing payment id.", "webba-booking-lite" ),
            ], 400);
        }
        $gift_card = WBK_Gift_Card::find_by_payment_id( $payment_id );
        if ( !$gift_card ) {
            // Payment may still be processing — also check pending (not yet created).
            $pending = WBK_Gift_Card::get_pending_order( $payment_id );
            if ( $pending ) {
                return new WP_REST_Response([
                    "success" => false,
                    "pending" => true,
                    "message" => __( "Payment is still being processed.", "webba-booking-lite" ),
                ], 202);
            }
            return new WP_REST_Response([
                "success" => false,
                "message" => __( "Gift card not found for this payment.", "webba-booking-lite" ),
            ], 404);
        }
        return new WP_REST_Response([
            "success"         => true,
            "gift_card"       => $gift_card,
            "payment_method"  => $gift_card["payment_method"] ?? "paypal",
            "payment_details" => [
                "item_names"   => [__( "Gift card", "webba-booking-lite" )],
                "prices"       => [floatval( $gift_card["amount"] ?? 0 )],
                "quantities"   => [1],
                "to_pay_total" => floatval( $gift_card["amount"] ?? 0 ),
                "tax_to_pay"   => 0,
            ],
        ], 200);
    }

    /**
     * Public gift card details for the QR landing page.
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function get_gift_card_status( WP_REST_Request $request ) : WP_REST_Response {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        $card_token = sanitize_text_field( (string) $request->get_param( "token" ) );
        $status = WBK_Gift_Card::get_public_status( $card_token );
        if ( $status === null ) {
            return new WP_REST_Response([
                "success" => false,
                "message" => __( "Gift card not found.", "webba-booking-lite" ),
            ], 404);
        }
        return new WP_REST_Response([
            "success"   => true,
            "gift_card" => $status,
        ], 200);
    }

    /**
     * Returns permission for getting dashboard stats
     *
     * @param WP_REST_Request $request
     * @return boolean
     */
    public function get_dashboard_stats_permission( WP_REST_Request $request ) : bool {
        return current_user_can( "manage_options" );
    }

    /**
     * Returns dashboard stats
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function get_dashboard_stats( WP_REST_Request $request ) : WP_REST_Response {
        $params = $request->get_params();
        $data = [];
        $price_format = WBK_Format_Utils::get_price_format();
        $user = wp_get_current_user();
        $current_time = time();
        $last_24_hours_booking_ids = WBK_Model_Utils::get_booking_by_date_range( $current_time - DAY_IN_SECONDS, $current_time );
        if ( empty( $last_24_hours_booking_ids ) ) {
            $sub_title = esc_html__( "No bookings in the last 24 hours", "webba-booking-lite" );
        } else {
            $sub_title = sprintf( esc_html__( "You have %s new bookings in the past 24 hours", "webba-booking-lite" ), count( $last_24_hours_booking_ids ) );
        }
        $date_format = WBK_Date_Time_Utils::get_date_format_backend();
        $date_format_js = str_replace( "d", "dd", $date_format );
        $date_format_js = str_replace( "j", "d", $date_format_js );
        $date_format_js = str_replace( "l", "dddd", $date_format_js );
        $date_format_js = str_replace( "D", "ddd", $date_format_js );
        $date_format_js = str_replace( "m", "mm", $date_format_js );
        $date_format_js = str_replace( "n", "m", $date_format_js );
        $date_format_js = str_replace( "F", "mmmm", $date_format_js );
        $date_format_js = str_replace( "M", "mmm", $date_format_js );
        $date_format_js = str_replace( "y", "yyyy", $date_format_js );
        $date_format_js = str_replace( "Y", "yyyy", $date_format_js );
        $date_format_js = str_replace( "S", "", $date_format_js );
        $date_format_js = str_replace( "s", "", $date_format_js );
        $yesterday = date( "F d, Y", strtotime( "-1 days" ) );
        $last_30_days = date( "F d, Y", strtotime( "-31 days" ) );
        $formatted_yesterday = date( $date_format, strtotime( "-1 days" ) );
        $formatted_last_30_days = date( $date_format, strtotime( "-31 days" ) );
        $db_prefix = get_option( "wbk_db_prefix", "" );
        $table = $db_prefix . "wbk_appointments";
        $pro_version = false;
        $filters = $params["filters"] ?? [];
        $approved = 0;
        $pending = 0;
        $approved_balance = 0;
        $pending_balance = 0;
        $approved_text = esc_html__( "Approved Bookings", "webba-booking-lite" );
        $pending_text = esc_html__( "Pending Bookings", "webba-booking-lite" );
        $slots_text = esc_html__( "Of slots are booked", "webba-booking-lite" );
        $approved_ids = [];
        $pending_ids = [];
        $labels = [];
        $total_data = [];
        $pending_data = [];
        $approved_data = [];
        $prev_time_zone = date_default_timezone_get();
        date_default_timezone_set( get_option( "wbk_timezone" ) );
        $appointment_day_values = [];
        $business_day_values = [];
        $staff_member_filter = null;
        $location_filter = null;
        $business_period = "l_30";
        if ( !empty( $filters ) && is_array( $filters ) ) {
            foreach ( $filters as $filter_row ) {
                if ( !is_array( $filter_row ) ) {
                    continue;
                }
                $filter_name = $filter_row["name"] ?? "";
                $filter_value = $filter_row["value"] ?? "";
                if ( $filter_name === "appointment_day" && $filter_value !== "" ) {
                    $appointment_day_values[] = $filter_value;
                }
                if ( $filter_name === "business_day" && $filter_value !== "" ) {
                    $business_day_values[] = $filter_value;
                }
                if ( $filter_name === "appointment_staff_member_id" && $filter_value !== "" && $filter_value !== "0" && ctype_digit( (string) $filter_value ) ) {
                    $staff_member_filter = (int) $filter_value;
                }
                if ( $filter_name === "appointment_location_id" && $filter_value !== "" && $filter_value !== "0" && ctype_digit( (string) $filter_value ) ) {
                    $location_filter = (int) $filter_value;
                }
                if ( $filter_name === "business_period" && $filter_value !== "" ) {
                    $business_period = (string) $filter_value;
                }
            }
        }
        if ( count( $appointment_day_values ) >= 2 ) {
            $start = strtotime( $appointment_day_values[0] );
            $end = strtotime( $appointment_day_values[1] );
        } else {
            $start = strtotime( "today midnight" ) - 86400 * 31;
            $end = strtotime( "today midnight" ) - 86400;
        }
        if ( $start == $end ) {
            $end = $end + 86400;
        }
        date_default_timezone_set( $prev_time_zone );
        $approved_search = "approved,paid_approved,arrived,added_by_admin_paid";
        $pending_search = "pending,paid,woocommerce,added_by_admin_not_paid";
        $approved_search_arr = explode( ",", $approved_search );
        $pending_search_arr = explode( ",", $pending_search );
        $num = 100;
        $slots_percent = round( ($approved + $pending) * 100 ) / $num;
        $approved = 0;
        $pending = 0;
        if ( $end > $start ) {
            while ( $start <= $end ) {
                $prev_time_zone = date_default_timezone_get();
                date_default_timezone_set( get_option( "wbk_timezone" ) );
                $g_date = date( "Y-m-d", $start );
                date_default_timezone_set( $prev_time_zone );
                $labels[] = $g_date;
                $bookings_on_date = WBK_Model_Utils::get_booking_ids_by_day( $start );
                $total_data[] = count( $bookings_on_date );
                $this_day_approved_ballance = 0;
                $this_day_pending_ballance = 0;
                foreach ( $bookings_on_date as $booking_id ) {
                    $booking = new WBK_Booking($booking_id);
                    if ( !$booking->is_loaded() ) {
                        $response = new \WP_REST_Response([
                            "message" => "Unable to open booking.",
                        ]);
                        $response->set_status( 400 );
                        return $response;
                    }
                    if ( $staff_member_filter !== null && (int) $booking->get_staff_member() !== $staff_member_filter ) {
                        continue;
                    }
                    $price = intval( $booking->get_price() ) * intval( $booking->get_quantity() );
                    if ( in_array( $booking->get_status(), $approved_search_arr ) ) {
                        $this_day_approved_ballance += $price;
                        $approved_balance += $price;
                        $approved++;
                    } else {
                        $this_day_pending_ballance += $price;
                        $pending_balance += $price;
                        $pending++;
                    }
                }
                $approved_data[] = $this_day_approved_ballance;
                $pending_data[] = $this_day_pending_ballance;
                $start = strtotime( "+1 days", $start );
            }
        }
        $graph_options = [];
        if ( !empty( $labels ) ) {
            $graph_options = [
                "labels"   => $labels,
                "datasets" => [[
                    "label"       => esc_html__( "No. of bookings", "webba-booking-lite" ),
                    "data"        => $total_data,
                    "borderWidth" => 1,
                    "yAxisID"     => "y",
                ], [
                    "label"       => esc_html__( "Revenue (approved)", "webba-booking-lite" ),
                    "data"        => $approved_data,
                    "borderWidth" => 1,
                    "yAxisID"     => "yRevenu",
                ], [
                    "label"       => esc_html__( "Revenue (pending)", "webba-booking-lite" ),
                    "data"        => $pending_data,
                    "borderWidth" => 1,
                    "yAxisID"     => "yRevenu",
                ]],
            ];
        }
        $data["chart"] = $graph_options;
        $data["approved"] = $approved;
        $data["pending"] = $pending;
        $data["balance"] = WBK_Format_Utils::format_price( $approved_balance + $pending_balance );
        $data["balance_approved"] = sprintf( "%s %s", WBK_Format_Utils::format_price( $approved_balance ), esc_html__( "approved", "webba-booking-lite" ) );
        $data["balance_pending"] = sprintf( "%s %s", WBK_Format_Utils::format_price( $pending_balance ), esc_html__( "pending", "webba-booking-lite" ) );
        $data["approvedText"] = $approved_text;
        $data["pendingText"] = $pending_text;
        $data["slotsText"] = $slots_text;
        $data["approved_ids"] = $approved_ids;
        $data["pending_ids"] = $pending_ids;
        $data["priceFormat"] = $price_format;
        $data["isPro"] = $pro_version;
        $data["hoursAvailability"] = $this->build_hours_availability_stats( $staff_member_filter );
        $data["businessOverview"] = $this->build_business_overview_stats(
            $business_period,
            $staff_member_filter,
            $location_filter,
            $business_day_values
        );
        $data["welcomeMessage"] = $this->build_welcome_message_stats();
        $response = new \WP_REST_Response($data);
        $response->set_status( 200 );
        return $response;
    }

    /**
     * Build welcome message stats for the dashboard header.
     *
     * @return array
     */
    private function build_welcome_message_stats() : array {
        global $wpdb;
        $prev_time_zone = date_default_timezone_get();
        date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
        $today = strtotime( "today midnight" );
        $now = time();
        $table = get_option( "wbk_db_prefix", "" ) . "wbk_appointments";
        $pending_statuses = [
            "pending",
            "paid",
            "woocommerce",
            "added_by_admin_not_paid"
        ];
        $status_placeholders = implode( ",", array_fill( 0, count( $pending_statuses ), "%s" ) );
        $pending_count = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(id) FROM {$table} WHERE status IN ({$status_placeholders})", $pending_statuses ) );
        $next_appointment_label = "";
        $next_appointment_time = null;
        $next_appointment_relation = "";
        $next_booking_id = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table}\n                WHERE time >= %d\n                AND status NOT IN ('cancelled', 'rejected')\n                ORDER BY time ASC\n                LIMIT 1", $now ) );
        if ( $next_booking_id ) {
            $booking = new WBK_Booking((int) $next_booking_id);
            if ( $booking->is_loaded() ) {
                $appointment_time = (int) $booking->get_start();
                $next_appointment_time = $appointment_time;
                $time_label = date_i18n( WBK_Date_Time_Utils::get_time_format(), $appointment_time );
                $appointment_day = (int) $booking->get_day();
                if ( $appointment_day === $today ) {
                    $next_appointment_relation = "today";
                    $next_appointment_label = sprintf( 
                        /* translators: %s: time of day */
                        esc_html__( "The next appointment is today at %s.", "webba-booking-lite" ),
                        $time_label
                     );
                } elseif ( $appointment_day === strtotime( "+1 day", $today ) ) {
                    $next_appointment_relation = "tomorrow";
                    $next_appointment_label = sprintf( 
                        /* translators: %s: time of day */
                        esc_html__( "The next appointment is tomorrow at %s.", "webba-booking-lite" ),
                        $time_label
                     );
                } else {
                    $next_appointment_relation = "later";
                    $next_appointment_label = sprintf( 
                        /* translators: 1: date, 2: time of day */
                        esc_html__( "The next appointment is on %1\$s at %2\$s.", "webba-booking-lite" ),
                        date_i18n( "M j", $appointment_time ),
                        $time_label
                     );
                }
            }
        }
        if ( $pending_count === 0 ) {
            $pending_title = esc_html__( "All of your bookings has been approved", "webba-booking-lite" );
        } elseif ( $pending_count === 1 ) {
            $pending_title = esc_html__( "1 booking needs your approval", "webba-booking-lite" );
        } else {
            $pending_title = sprintf( 
                /* translators: %d: number of bookings */
                esc_html__( "%d bookings need your approval", "webba-booking-lite" ),
                $pending_count
             );
        }
        $date_label = date_i18n( "l, F j, Y", $today );
        date_default_timezone_set( $prev_time_zone );
        return [
            "title"                   => esc_html__( "Your day, at a glance", "webba-booking-lite" ),
            "dateLabel"               => $date_label,
            "dateTimestamp"           => (int) $today,
            "pendingCount"            => $pending_count,
            "pendingTitle"            => $pending_title,
            "nextAppointmentLabel"    => $next_appointment_label,
            "nextAppointmentTime"     => $next_appointment_time,
            "nextAppointmentRelation" => $next_appointment_relation,
            "hasPending"              => $pending_count > 0,
        ];
    }

    /**
     * Build business overview stats for the dashboard.
     *
     * @param string   $period             Period key (l_7, l_30, l_90, custom).
     * @param int|null $staff_member_id    Optional staff member filter.
     * @param int|null $location_id        Optional location filter.
     * @param array    $custom_day_values  Optional custom date range values.
     * @return array
     */
    private function build_business_overview_stats(
        string $period = "l_30",
        $staff_member_id = null,
        $location_id = null,
        array $custom_day_values = []
    ) : array {
        $period_days_map = [
            "l_7"  => 7,
            "l_30" => 30,
            "l_90" => 90,
        ];
        $confirmed_statuses = [
            "approved",
            "paid_approved",
            "arrived",
            "added_by_admin_paid"
        ];
        $cancelled_statuses = ["cancelled", "rejected"];
        $prev_time_zone = date_default_timezone_get();
        date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
        $today = strtotime( "today midnight" );
        if ( $period === "custom" && count( $custom_day_values ) >= 2 ) {
            $selected_start = strtotime( $custom_day_values[0] . " midnight" );
            $selected_end = strtotime( $custom_day_values[1] . " midnight" );
            if ( $selected_start === false || $selected_end === false ) {
                $selected_end = $today;
                $selected_start = strtotime( "-29 days", $today );
            }
            if ( $selected_start > $selected_end ) {
                $swap = $selected_start;
                $selected_start = $selected_end;
                $selected_end = $swap;
            }
            $period_days = (int) floor( ($selected_end - $selected_start) / DAY_IN_SECONDS ) + 1;
            if ( $period_days < 1 ) {
                $period_days = 1;
            }
        } else {
            if ( $period === "custom" ) {
                $period = "l_30";
            }
            $period_days = $period_days_map[$period] ?? 30;
            $selected_end = $today;
            $selected_start = strtotime( "-" . ($period_days - 1) . " days", $today );
        }
        $previous_end = strtotime( "-1 day", $selected_start );
        $previous_start = strtotime( "-" . ($period_days - 1) . " days", $previous_end );
        $upcoming_start = $today;
        $upcoming_end = strtotime( "+" . ($period_days - 1) . " days", $today );
        $staff_label = esc_html__( "All staff", "webba-booking-lite" );
        if ( $staff_member_id !== null ) {
            $staff_member = new WBK_Staff_Member((int) $staff_member_id);
            if ( $staff_member->is_loaded() && $staff_member->get_name() !== "" ) {
                $staff_label = $staff_member->get_name();
            }
        }
        $location_label = esc_html__( "All locations", "webba-booking-lite" );
        if ( $location_id !== null ) {
            $location = new WBK_Location((int) $location_id);
            if ( $location->is_loaded() && $location->get_name() !== "" ) {
                $location_label = $location->get_name();
            }
        }
        $period_labels = [
            "l_7"    => esc_html__( "Last 7 days", "webba-booking-lite" ),
            "l_30"   => esc_html__( "Last 30 days", "webba-booking-lite" ),
            "l_90"   => esc_html__( "Last 90 days", "webba-booking-lite" ),
            "custom" => esc_html__( "Custom", "webba-booking-lite" ),
        ];
        $period_label = $period_labels[$period] ?? $period_labels["l_30"];
        $selected_bookings = $this->get_business_overview_bookings(
            $selected_start,
            $selected_end,
            $staff_member_id,
            $location_id
        );
        $previous_bookings = $this->get_business_overview_bookings(
            $previous_start,
            $previous_end,
            $staff_member_id,
            $location_id
        );
        $upcoming_bookings = $this->get_business_overview_bookings(
            $upcoming_start,
            $upcoming_end,
            $staff_member_id,
            $location_id
        );
        $outstanding_bookings = $this->get_business_overview_bookings(
            null,
            null,
            $staff_member_id,
            $location_id
        );
        $selected_metrics = $this->summarize_business_overview_bookings( $selected_bookings, $confirmed_statuses, $cancelled_statuses );
        $previous_metrics = $this->summarize_business_overview_bookings( $previous_bookings, $confirmed_statuses, $cancelled_statuses );
        $upcoming_metrics = $this->summarize_business_overview_bookings( $upcoming_bookings, $confirmed_statuses, $cancelled_statuses );
        $outstanding_total = 0.0;
        $outstanding_count = 0;
        $overdue_total = 0.0;
        foreach ( $outstanding_bookings as $booking ) {
            $status = $booking->get_status();
            if ( !in_array( $status, $confirmed_statuses, true ) ) {
                continue;
            }
            $remaining = max( 0.0, (float) $booking->get_price() - (float) $booking->get( "amount_paid" ) );
            if ( $remaining <= 0 ) {
                continue;
            }
            $outstanding_total += $remaining;
            $outstanding_count++;
            if ( (int) $booking->get_day() < $today ) {
                $overdue_total += $remaining;
            }
        }
        $confirmed_delta = $selected_metrics["confirmed_count"] - $previous_metrics["confirmed_count"];
        $payments_delta_percent = 0.0;
        if ( $previous_metrics["payments_collected"] > 0 ) {
            $payments_delta_percent = ($selected_metrics["payments_collected"] - $previous_metrics["payments_collected"]) / $previous_metrics["payments_collected"] * 100;
        } elseif ( $selected_metrics["payments_collected"] > 0 ) {
            $payments_delta_percent = 100.0;
        }
        $selected_cancellation_rate = $selected_metrics["cancellation_rate"];
        $previous_cancellation_rate = $previous_metrics["cancellation_rate"];
        $cancellation_delta_pp = $selected_cancellation_rate - $previous_cancellation_rate;
        $week_count = max( 1, (int) ceil( $period_days / 7 ) );
        $trend_labels = [];
        $trend_label_timestamps = [];
        $trend_selected_bookings = [];
        $trend_previous_bookings = [];
        $trend_selected_payments = [];
        $trend_previous_payments = [];
        for ($week_index = 0; $week_index < $week_count; $week_index++) {
            $week_start = strtotime( "+" . $week_index * 7 . " days", $selected_start );
            $week_end = strtotime( "+6 days", $week_start );
            if ( $week_end > $selected_end ) {
                $week_end = $selected_end;
            }
            $prev_week_start = strtotime( "+" . $week_index * 7 . " days", $previous_start );
            $prev_week_end = strtotime( "+6 days", $prev_week_start );
            if ( $prev_week_end > $previous_end ) {
                $prev_week_end = $previous_end;
            }
            $trend_labels[] = date_i18n( "j M", $week_start );
            $trend_label_timestamps[] = (int) $week_start;
            $selected_week = $this->summarize_business_overview_bookings( $this->filter_bookings_by_day_range( $selected_bookings, $week_start, $week_end ), $confirmed_statuses, $cancelled_statuses );
            $previous_week = $this->summarize_business_overview_bookings( $this->filter_bookings_by_day_range( $previous_bookings, $prev_week_start, $prev_week_end ), $confirmed_statuses, $cancelled_statuses );
            $trend_selected_bookings[] = $selected_week["confirmed_count"];
            $trend_previous_bookings[] = $previous_week["confirmed_count"];
            $trend_selected_payments[] = round( $selected_week["payments_collected"], 2 );
            $trend_previous_payments[] = round( $previous_week["payments_collected"], 2 );
        }
        $top_services = [];
        $service_counts = $selected_metrics["service_counts"];
        arsort( $service_counts );
        $max_service_count = ( !empty( $service_counts ) ? max( $service_counts ) : 0 );
        $service_index = 0;
        foreach ( $service_counts as $service_id => $count ) {
            if ( $service_index >= 4 ) {
                break;
            }
            $service = new WBK_Service((int) $service_id);
            $service_name = ( $service->is_loaded() ? $service->get_name() : esc_html__( "Unknown service", "webba-booking-lite" ) );
            $top_services[] = [
                "id"      => (int) $service_id,
                "name"    => $service_name,
                "count"   => (int) $count,
                "percent" => ( $max_service_count > 0 ? (int) round( $count / $max_service_count * 100 ) : 0 ),
            ];
            $service_index++;
        }
        $comparison_summary = sprintf(
            /* translators: 1: selected date range, 2: previous date range, 3: number of days, 4: staff label, 5: location label */
            esc_html__( "%1\$s · Compared with %2\$s · %3\$d days each · %4\$s · %5\$s", "webba-booking-lite" ),
            $this->format_business_overview_date_range( $selected_start, $selected_end ),
            $this->format_business_overview_date_range( $previous_start, $previous_end ),
            $period_days,
            $staff_label,
            $location_label
        );
        $upcoming_remaining = max( 0.0, $upcoming_metrics["confirmed_value"] - $upcoming_metrics["payments_collected"] );
        $upcoming_paid_percent = 0;
        if ( $upcoming_metrics["confirmed_value"] > 0 ) {
            $upcoming_paid_percent = (int) round( $upcoming_metrics["payments_collected"] / $upcoming_metrics["confirmed_value"] * 100 );
        }
        date_default_timezone_set( $prev_time_zone );
        return [
            "title"             => esc_html__( "Business overview", "webba-booking-lite" ),
            "period"            => $period,
            "periodLabel"       => $period_label,
            "comparisonSummary" => $comparison_summary,
            "selectedStart"     => (int) $selected_start,
            "selectedEnd"       => (int) $selected_end,
            "previousStart"     => (int) $previous_start,
            "previousEnd"       => (int) $previous_end,
            "upcomingStart"     => (int) $upcoming_start,
            "upcomingEnd"       => (int) $upcoming_end,
            "periodDays"        => (int) $period_days,
            "staffLabel"        => $staff_label,
            "locationLabel"     => $location_label,
            "upcomingValue"     => [
                "title"                => esc_html__( "Upcoming booking value", "webba-booking-lite" ),
                "subtitle"             => sprintf( 
                    /* translators: 1: number of days, 2: date range */
                    esc_html__( "Next %1\$d days · %2\$s", "webba-booking-lite" ),
                    $period_days,
                    $this->format_business_overview_date_range( $upcoming_start, $upcoming_end, true )
                 ),
                "total"                => round( $upcoming_metrics["confirmed_value"], 2 ),
                "totalFormatted"       => WBK_Format_Utils::format_price( $upcoming_metrics["confirmed_value"] ),
                "alreadyPaid"          => round( $upcoming_metrics["payments_collected"], 2 ),
                "alreadyPaidFormatted" => WBK_Format_Utils::format_price( $upcoming_metrics["payments_collected"] ),
                "remaining"            => round( $upcoming_remaining, 2 ),
                "remainingFormatted"   => WBK_Format_Utils::format_price( $upcoming_remaining ),
                "paidPercent"          => $upcoming_paid_percent,
                "bookingsLabel"        => sprintf(
                    /* translators: 1: number of bookings, 2: staff label, 3: location label */
                    esc_html__( "%1\$d confirmed bookings · %2\$s · %3\$s", "webba-booking-lite" ),
                    $upcoming_metrics["confirmed_count"],
                    $staff_label,
                    $location_label
                ),
                "note"                 => esc_html__( "Confirmed appointments only · Pending and cancelled excluded", "webba-booking-lite" ),
            ],
            "metrics"           => [
                "confirmedBookings" => [
                    "label"          => esc_html__( "Confirmed bookings", "webba-booking-lite" ),
                    "value"          => $selected_metrics["confirmed_count"],
                    "valueFormatted" => (string) $selected_metrics["confirmed_count"],
                    "comparison"     => sprintf( 
                        /* translators: %s: signed number delta */
                        esc_html__( "%s vs. previous period", "webba-booking-lite" ),
                        (( $confirmed_delta > 0 ? "+" : "" )) . $confirmed_delta
                     ),
                    "comparisonTone" => ( $confirmed_delta >= 0 ? "positive" : "negative" ),
                ],
                "paymentsCollected" => [
                    "label"          => esc_html__( "Payments collected", "webba-booking-lite" ),
                    "value"          => round( $selected_metrics["payments_collected"], 2 ),
                    "valueFormatted" => WBK_Format_Utils::format_price( $selected_metrics["payments_collected"] ),
                    "comparison"     => sprintf( 
                        /* translators: %s: signed percent delta */
                        esc_html__( "%s%% vs. previous period", "webba-booking-lite" ),
                        (( $payments_delta_percent > 0 ? "+" : "" )) . rtrim( rtrim( number_format(
                            $payments_delta_percent,
                            1,
                            ".",
                            ""
                        ), "0" ), "." )
                     ),
                    "comparisonTone" => ( $payments_delta_percent >= 0 ? "positive" : "negative" ),
                ],
                "outstanding"       => [
                    "label"          => esc_html__( "Outstanding · all dates", "webba-booking-lite" ),
                    "value"          => round( $outstanding_total, 2 ),
                    "valueFormatted" => WBK_Format_Utils::format_price( $outstanding_total ),
                    "comparison"     => sprintf( 
                        /* translators: 1: number of bookings, 2: overdue amount */
                        esc_html__( "%1\$d bookings · %2\$s overdue", "webba-booking-lite" ),
                        $outstanding_count,
                        WBK_Format_Utils::format_price( $overdue_total )
                     ),
                    "comparisonTone" => "neutral",
                    "hasAction"      => true,
                ],
                "cancellationRate"  => [
                    "label"          => esc_html__( "Cancellation rate", "webba-booking-lite" ),
                    "value"          => round( $selected_cancellation_rate, 1 ),
                    "valueFormatted" => rtrim( rtrim( number_format(
                        $selected_cancellation_rate,
                        1,
                        ".",
                        ""
                    ), "0" ), "." ) . "%",
                    "comparison"     => sprintf( 
                        /* translators: %s: signed percentage-point delta */
                        esc_html__( "%s pp vs. previous period", "webba-booking-lite" ),
                        (( $cancellation_delta_pp > 0 ? "+" : "" )) . rtrim( rtrim( number_format(
                            $cancellation_delta_pp,
                            1,
                            ".",
                            ""
                        ), "0" ), "." )
                     ),
                    "comparisonTone" => ( $cancellation_delta_pp <= 0 ? "positive" : "negative" ),
                ],
            ],
            "trend"             => [
                "title"           => esc_html__( "Booking trend", "webba-booking-lite" ),
                "subtitle"        => esc_html__( "Confirmed bookings · grouped by appointment date", "webba-booking-lite" ),
                "labels"          => $trend_labels,
                "labelTimestamps" => $trend_label_timestamps,
                "selectedLabel"   => esc_html__( "Selected period", "webba-booking-lite" ),
                "previousLabel"   => esc_html__( "Previous period", "webba-booking-lite" ),
                "bookings"        => [
                    "selected" => $trend_selected_bookings,
                    "previous" => $trend_previous_bookings,
                ],
                "payments"        => [
                    "selected" => $trend_selected_payments,
                    "previous" => $trend_previous_payments,
                ],
            ],
            "topServices"       => [
                "title"       => esc_html__( "Top services", "webba-booking-lite" ),
                "metricLabel" => esc_html__( "Bookings", "webba-booking-lite" ),
                "items"       => $top_services,
            ],
        ];
    }

    /**
     * Load bookings for business overview within an optional day range.
     *
     * @param int|null $start_day Midnight timestamp inclusive, or null for no lower bound.
     * @param int|null $end_day Midnight timestamp inclusive, or null for no upper bound.
     * @param int|null $staff_member_id Optional staff filter.
     * @param int|null $location_id Optional location filter.
     * @return WBK_Booking[]
     */
    private function get_business_overview_bookings(
        $start_day = null,
        $end_day = null,
        $staff_member_id = null,
        $location_id = null
    ) : array {
        global $wpdb;
        $table = get_option( "wbk_db_prefix", "" ) . "wbk_appointments";
        $where = ["1=1"];
        $params = [];
        if ( $start_day !== null ) {
            $where[] = "day >= %d";
            $params[] = (int) $start_day;
        }
        if ( $end_day !== null ) {
            $where[] = "day <= %d";
            $params[] = (int) $end_day;
        }
        if ( $staff_member_id !== null ) {
            $where[] = "staff_member_id = %d";
            $params[] = (int) $staff_member_id;
        }
        if ( $location_id !== null ) {
            $where[] = "location_id = %d";
            $params[] = (int) $location_id;
        }
        $sql = "SELECT id FROM {$table} WHERE " . implode( " AND ", $where );
        if ( !empty( $params ) ) {
            $sql = $wpdb->prepare( $sql, $params );
        }
        $booking_ids = $wpdb->get_col( $sql );
        if ( !is_array( $booking_ids ) || empty( $booking_ids ) ) {
            return [];
        }
        $bookings = [];
        foreach ( $booking_ids as $booking_id ) {
            $booking = new WBK_Booking((int) $booking_id);
            if ( $booking->is_loaded() ) {
                $bookings[] = $booking;
            }
        }
        return $bookings;
    }

    /**
     * Filter booking objects by inclusive day range.
     *
     * @param WBK_Booking[] $bookings
     * @param int $start_day
     * @param int $end_day
     * @return WBK_Booking[]
     */
    private function filter_bookings_by_day_range( array $bookings, int $start_day, int $end_day ) : array {
        $filtered = [];
        foreach ( $bookings as $booking ) {
            $day = (int) $booking->get_day();
            if ( $day >= $start_day && $day <= $end_day ) {
                $filtered[] = $booking;
            }
        }
        return $filtered;
    }

    /**
     * Summarize bookings for confirmed/cancelled/payment metrics.
     *
     * @param WBK_Booking[] $bookings
     * @param string[] $confirmed_statuses
     * @param string[] $cancelled_statuses
     * @return array
     */
    private function summarize_business_overview_bookings( array $bookings, array $confirmed_statuses, array $cancelled_statuses ) : array {
        $confirmed_count = 0;
        $cancelled_count = 0;
        $confirmed_value = 0.0;
        $payments_collected = 0.0;
        $service_counts = [];
        foreach ( $bookings as $booking ) {
            $status = $booking->get_status();
            if ( in_array( $status, $cancelled_statuses, true ) ) {
                $cancelled_count++;
                continue;
            }
            if ( !in_array( $status, $confirmed_statuses, true ) ) {
                continue;
            }
            $confirmed_count++;
            $price = (float) $booking->get_price();
            $amount_paid = (float) $booking->get( "amount_paid" );
            $confirmed_value += $price;
            $payments_collected += $amount_paid;
            $service_id = (int) $booking->get_service();
            if ( $service_id > 0 ) {
                if ( !isset( $service_counts[$service_id] ) ) {
                    $service_counts[$service_id] = 0;
                }
                $service_counts[$service_id]++;
            }
        }
        $denominator = $confirmed_count + $cancelled_count;
        $cancellation_rate = ( $denominator > 0 ? $cancelled_count / $denominator * 100 : 0.0 );
        return [
            "confirmed_count"    => $confirmed_count,
            "cancelled_count"    => $cancelled_count,
            "confirmed_value"    => $confirmed_value,
            "payments_collected" => $payments_collected,
            "cancellation_rate"  => $cancellation_rate,
            "service_counts"     => $service_counts,
        ];
    }

    /**
     * Format a day range label for business overview.
     *
     * @param int  $start_day
     * @param int  $end_day
     * @param bool $include_year
     * @return string
     */
    private function format_business_overview_date_range( int $start_day, int $end_day, bool $include_year = false ) : string {
        $start_month = date_i18n( "M", $start_day );
        $end_month = date_i18n( "M", $end_day );
        $year_suffix = ( $include_year ? ", " . date_i18n( "Y", $end_day ) : "" );
        if ( $start_month === $end_month ) {
            return sprintf(
                "%s %s–%s%s",
                date_i18n( "j", $start_day ),
                $start_month,
                date_i18n( "j", $end_day ),
                $year_suffix
            );
        }
        return sprintf(
            "%s %s–%s %s%s",
            date_i18n( "j", $start_day ),
            $start_month,
            date_i18n( "j", $end_day ),
            $end_month,
            $year_suffix
        );
    }

    /**
     * Build next-7-days hours availability stats for the dashboard.
     *
     * @param int|null $staff_member_id Optional staff member filter.
     * @return array
     */
    private function build_hours_availability_stats( $staff_member_id = null ) : array {
        $staff_label = esc_html__( "All staff", "webba-booking-lite" );
        $service_ids = WBK_Model_Utils::get_service_ids();
        if ( $staff_member_id !== null ) {
            $staff_member = new WBK_Staff_Member((int) $staff_member_id);
            if ( $staff_member->is_loaded() ) {
                $staff_name = $staff_member->get_name();
                if ( $staff_name !== "" ) {
                    $staff_label = $staff_name;
                }
                $staff_services = $staff_member->get_services();
                if ( is_array( $staff_services ) && !empty( $staff_services ) ) {
                    $service_ids = array_values( array_intersect( array_map( "intval", $service_ids ), array_map( "intval", $staff_services ) ) );
                } else {
                    $service_ids = [];
                }
            } else {
                $service_ids = [];
            }
        }
        $prev_time_zone = date_default_timezone_get();
        date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
        $week_start = strtotime( "today midnight" );
        $days_payload = [];
        $week_booked_minutes = 0.0;
        $week_total_minutes = 0.0;
        $week_free_minutes = 0.0;
        $slot_options = [
            "skip_gg_calendar"       => false,
            "ignore_preparation"     => false,
            "calculate_availability" => true,
        ];
        $schedule_processor = new WBK_Schedule_Processor();
        $schedule_processor->load_data();
        $services_cache = [];
        foreach ( $service_ids as $service_id ) {
            $service = new WBK_Service((int) $service_id);
            if ( $service->is_loaded() ) {
                $services_cache[(int) $service_id] = $service;
            }
        }
        for ($day_offset = 0; $day_offset < 7; $day_offset++) {
            $day_timestamp = strtotime( "+" . $day_offset . " days", $week_start );
            $day_booked_minutes = 0.0;
            $day_total_minutes = 0.0;
            $day_free_minutes = 0.0;
            $has_open_service = false;
            foreach ( $services_cache as $service_id => $service ) {
                $day_status = $schedule_processor->get_day_status( $day_timestamp, $service_id, $staff_member_id );
                if ( (int) $day_status !== 1 ) {
                    continue;
                }
                $has_open_service = true;
                $timeslots = $schedule_processor->get_time_slots_by_day(
                    $day_timestamp,
                    $service_id,
                    $slot_options,
                    null,
                    false,
                    $staff_member_id
                );
                if ( !is_array( $timeslots ) || empty( $timeslots ) ) {
                    continue;
                }
                $quantity = max( 1, (int) $service->get_quantity() );
                foreach ( $timeslots as $slot ) {
                    if ( !is_object( $slot ) || !method_exists( $slot, "get_start" ) ) {
                        continue;
                    }
                    $duration_seconds = (int) $slot->get_end() - (int) $slot->get_start();
                    if ( $duration_seconds <= 0 ) {
                        continue;
                    }
                    $duration_minutes = $duration_seconds / 60;
                    $free_places = (int) $slot->get_free_places();
                    if ( $free_places < 0 ) {
                        $free_places = 0;
                    }
                    if ( $free_places > $quantity ) {
                        $free_places = $quantity;
                    }
                    $booked_places = $quantity - $free_places;
                    $day_total_minutes += $quantity * $duration_minutes;
                    $day_booked_minutes += $booked_places * $duration_minutes;
                    $day_free_minutes += $free_places * $duration_minutes;
                }
            }
            $is_closed = !$has_open_service || $day_total_minutes <= 0;
            $booked_percent = null;
            if ( !$is_closed ) {
                $booked_percent = (int) round( $day_booked_minutes / $day_total_minutes * 100 );
                $week_booked_minutes += $day_booked_minutes;
                $week_total_minutes += $day_total_minutes;
                $week_free_minutes += $day_free_minutes;
            }
            $days_payload[] = [
                "date"           => date( "Y-m-d", $day_timestamp ),
                "timestamp"      => (int) $day_timestamp,
                "dayLabel"       => date_i18n( "D", $day_timestamp ),
                "bookedPercent"  => $booked_percent,
                "isClosed"       => $is_closed,
                "remainingHours" => ( $is_closed ? 0 : round( $day_free_minutes / 60, 1 ) ),
            ];
        }
        $first_day = $week_start;
        $last_day = strtotime( "+6 days", $week_start );
        $first_month = date_i18n( "M", $first_day );
        $last_month = date_i18n( "M", $last_day );
        if ( $first_month === $last_month ) {
            $date_range_label = sprintf(
                "%s %s–%s",
                $first_month,
                date_i18n( "j", $first_day ),
                date_i18n( "j", $last_day )
            );
        } else {
            $date_range_label = sprintf(
                "%s %s–%s %s",
                $first_month,
                date_i18n( "j", $first_day ),
                $last_month,
                date_i18n( "j", $last_day )
            );
        }
        $week_booked_percent = 0;
        if ( $week_total_minutes > 0 ) {
            $week_booked_percent = (int) round( $week_booked_minutes / $week_total_minutes * 100 );
        }
        $remaining_hours = round( $week_free_minutes / 60, 1 );
        $open_days_with_availability = array_values( array_filter( $days_payload, function ( $day_row ) {
            return empty( $day_row["isClosed"] ) && (float) $day_row["remainingHours"] > 0;
        } ) );
        usort( $open_days_with_availability, function ( $left, $right ) {
            return (float) $right["remainingHours"] <=> (float) $left["remainingHours"];
        } );
        if ( empty( $open_days_with_availability ) ) {
            $insight_text = esc_html__( "No availability in the week ahead.", "webba-booking-lite" );
        } else {
            $top_days = array_slice( $open_days_with_availability, 0, 2 );
            $weekday_names = [];
            foreach ( $top_days as $day_row ) {
                $weekday_names[] = date_i18n( "l", strtotime( $day_row["date"] . " midnight" ) );
            }
            if ( count( $weekday_names ) === 1 ) {
                $insight_text = sprintf( 
                    /* translators: %s: weekday name */
                    esc_html__( "Most availability on %s.", "webba-booking-lite" ),
                    $weekday_names[0]
                 );
            } else {
                $insight_text = sprintf( 
                    /* translators: 1: weekday name, 2: weekday name */
                    esc_html__( "Most availability on %s and %s.", "webba-booking-lite" ),
                    esc_html( $weekday_names[0] ),
                    esc_html( $weekday_names[1] )
                 );
            }
        }
        date_default_timezone_set( $prev_time_zone );
        $remaining_hours_display = ( fmod( $remaining_hours, 1.0 ) === 0.0 ? (string) (int) $remaining_hours : (string) $remaining_hours );
        return [
            "title"               => esc_html__( "The week ahead", "webba-booking-lite" ),
            "dateRangeLabel"      => $date_range_label,
            "staffLabel"          => $staff_label,
            "bookedPercent"       => $week_booked_percent,
            "remainingHours"      => $remaining_hours,
            "remainingHoursLabel" => sprintf( 
                /* translators: %s: number of hours */
                esc_html__( "%s hours available", "webba-booking-lite" ),
                $remaining_hours_display
             ),
            "insightText"         => $insight_text,
            "days"                => $days_payload,
        ];
    }

    /**
     * Check if user has permission to save admin theme.
     *
     * @param WP_REST_Request $request
     * @return boolean
     */
    public function save_admin_theme_permission( WP_REST_Request $request ) : bool {
        return current_user_can( "manage_options" );
    }

    /**
     * Persist admin light/dark theme preference.
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function save_admin_theme( WP_REST_Request $request ) : WP_REST_Response {
        $theme = sanitize_text_field( (string) $request->get_param( "theme" ) );
        if ( $theme !== "dark" && $theme !== "light" ) {
            $response = new \WP_REST_Response([
                "status"  => "error",
                "message" => __( "Invalid theme value", "webba-booking-lite" ),
            ]);
            $response->set_status( 400 );
            return $response;
        }
        update_option( "wbk_admin_theme", $theme );
        $response = new \WP_REST_Response([
            "status" => "success",
            "theme"  => $theme,
        ]);
        $response->set_status( 200 );
        return $response;
    }

    /**
     * Check if user has permission to save appearance - only admin allowed
     *
     * @param WP_REST_Request $request
     * @return boolean
     */
    public function save_appearance_permission( WP_REST_Request $request ) : bool {
        return current_user_can( "manage_options" );
    }

    /**
     * Save appearance
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function save_appearance( WP_REST_Request $request ) : WP_REST_Response {
        $data = $request->get_params();
        if ( !isset( $data["options"] ) || !is_array( $data["options"] ) || empty( $data["options"] ) ) {
            $response = new \WP_REST_Response([
                "message" => "Unable to save appearance.",
            ]);
            $response->set_status( 400 );
            return $response;
        }
        $appearance_fields = [
            "bg_accent",
            "font",
            "border_radius",
            "shadow",
            "form_type"
        ];
        $required_plans = [
            "standard",
            "premium",
            "pro",
            "proextended"
        ];
        $have_required_plan = false;
        foreach ( $required_plans as $required_plan ) {
            if ( WBK_Feature_Gate::have_required_plan( $required_plan, null ) ) {
                $have_required_plan = true;
                break;
            }
        }
        if ( $have_required_plan ) {
            $appearance_fields = array_merge( $appearance_fields, [
                "bg_button_primary",
                "color_button_primary",
                "bg_button_primary_hover",
                "color_button_primary_hover",
                "bg_button_secondary",
                "color_button_secondary",
                "bg_button_secondary_hover",
                "color_button_secondary_hover",
                "bg_button_inactive",
                "color_button_inactive",
                "bg_button_selected",
                "color_button_selected",
                "bg_button_selected_hover",
                "color_button_selected_hover",
                "button_border_radius",
                "bg_sidebar",
                "color_sidebar",
                "color_border_selected"
            ] );
        }
        $appearance_options = [];
        $default_values = WBK_Appearance_Utils::get_default_appearance_values();
        foreach ( $data["options"] as $key => $value ) {
            if ( in_array( $key, $appearance_fields ) ) {
                if ( $key === "form_type" ) {
                    $allowed_form_types = ["classic", "waterfall"];
                    $sanitized_form_type = sanitize_text_field( $value );
                    $appearance_options[$key] = ( in_array( $sanitized_form_type, $allowed_form_types, true ) ? $sanitized_form_type : $default_values["form_type"] ?? "classic" );
                    continue;
                }
                $appearance_options[sanitize_key( $key )] = sanitize_text_field( $value );
            } elseif ( isset( $default_values[sanitize_key( $key )] ) ) {
                $appearance_options[sanitize_key( $key )] = $default_values[sanitize_key( $key )];
            }
        }
        update_option( "wbk_appearance_options", $appearance_options );
        // generate config in css
        $css_config_string = WBK_Appearance_Utils::generate_css_config( $appearance_options );
        $dir = WP_CONTENT_DIR . DIRECTORY_SEPARATOR . "webba_booking_style";
        file_put_contents( $dir . DIRECTORY_SEPARATOR . "wbk6-frontend-config.css", $css_config_string );
        $response = new \WP_REST_Response([
            "message" => "Appearance saved successfully.",
        ]);
        $response->set_status( 200 );
        return $response;
    }

    /**
     * check if current user can get time slots per day
     * @param  WP_REST_Request $request rest request object
     * @return bool allow or not rest request
     */
    public function get_available_time_slots_day_permission( $request ) {
        return true;
    }

    /**
     * getting time slots for a given day
     * @param  WP_REST_Request $request rest request object
     * @return WP_REST_Response rest response object
     */
    public function get_available_time_slots_day( $request ) {
        $day = $request["date"];
        $service_id = $request["service_id"];
        $current_booking = $request["current_booking"];
        if ( !WBK_Validator::is_service_exists( $service_id ) ) {
            $data = [
                "Reason" => "Service not exists",
            ];
            $response = new \WP_REST_Response($data);
            $response->set_status( 400 );
            return $response;
        }
        if ( !WBK_Validator::is_date( $day ) ) {
            $data = [
                "Reason" => "Wrong date passed",
            ];
            $response = new \WP_REST_Response($data);
            $response->set_status( 400 );
            return $response;
        }
        if ( !WbkData\Validator::check_integer( $current_booking, 1, 2147483647 ) ) {
            $current_booking = null;
        }
        $sp = new WBK_Schedule_Processor();
        date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
        $day = strtotime( $day );
        $timeslots = $sp->get_time_slots_by_day(
            $day,
            $service_id,
            [
                "skip_gg_calendar"       => false,
                "ignore_preparation"     => true,
                "calculate_availability" => true,
                "calculate_night_hours"  => false,
                "filter_availability"    => false,
            ],
            $current_booking
        );
        $data = [
            "time_slots" => $timeslots,
        ];
        $response = new \WP_REST_Response($data);
        $response->set_status( 200 );
        date_default_timezone_set( "UTC" );
        return $response;
    }

    /**
     * Get timezones
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function get_timezones( WP_REST_Request $request ) : WP_REST_Response {
        $timezones = timezone_identifiers_list();
        $response = new WP_REST_Response([
            "timezones" => $timezones,
        ]);
        $response->set_status( 200 );
        return $response;
    }

    /**
     * Remove zoom auth
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function remove_zoom_auth( WP_REST_Request $request ) : WP_REST_Response {
        update_option( "wbk_zoom_auth_stat", "" );
        $data = [
            "status"  => "success",
            "message" => "Zoom auth removed successfully",
        ];
        $response = new WP_REST_Response($data);
        $response->set_status( 200 );
        return $response;
    }

    /**
     * Remove zoom auth permission
     *
     * @param WP_REST_Request $request
     * @return boolean
     */
    public function remove_zoom_auth_permission( WP_REST_Request $request ) : bool {
        return current_user_can( "manage_options" );
    }

    /**
     * Update user calendar in provider id
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function update_user_calendar( WP_REST_Request $request ) : WP_REST_Response {
        $data = $request->get_params();
        if ( !isset( $data["id"] ) || !isset( $data["in_provider_id"] ) ) {
            $response = new WP_REST_Response([
                "message" => "Invalid request",
            ]);
            $response->set_status( 400 );
            return $response;
        }
        $calendar = new WBK_Connected_Calendar($data["id"]);
        if ( !$calendar->is_loaded() ) {
            $response = new WP_REST_Response([
                "message" => "Calendar not found",
            ]);
            $response->set_status( 404 );
            return $response;
        }
        $calendar->set( "in_provider_id", sanitize_text_field( $data["in_provider_id"] ) );
        $calendar->save();
        $response = new WP_REST_Response([
            "message" => "User calendar updated successfully",
        ]);
        $response->set_status( 200 );
        return $response;
    }

    /**
     * Check if current user has permission to update user calendar
     *
     * @param WP_REST_Request $request
     * @return boolean
     */
    public function update_user_calendar_permission( WP_REST_Request $request ) : bool {
        if ( !current_user_can( "read" ) ) {
            return false;
        }
        $params = $request->get_params();
        $calendar_id = ( isset( $params["id"] ) ? absint( $params["id"] ) : 0 );
        if ( $calendar_id === 0 ) {
            return false;
        }
        return WBK_Validator::check_access_to_connected_calendar( $calendar_id );
    }

    public function get_unit_availability_date_ranges_permission( $request ) : bool {
        return true;
    }

    /**
     * Return the availability date ranges and recurring setting for a given unit.
     *
     * Endpoint: GET /webba-booking/v1/get-unit-availability-date-ranges/?unit_id=<id>
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function get_unit_availability_date_ranges( WP_REST_Request $request ) : WP_REST_Response {
        $prev_time_zone = date_default_timezone_get();
        date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
        try {
            $unit_id = $request->get_param( "unit_id" );
            if ( !is_numeric( $unit_id ) ) {
                return new WP_REST_Response([
                    "error" => "Invalid unit ID",
                ], 400);
            }
            $unit = new WBK_Unit((int) $unit_id);
            if ( !$unit->is_loaded() ) {
                return new WP_REST_Response([
                    "error" => "Unit not found",
                ], 404);
            }
            $recurring = $unit->get_availability_recurring_annually();
            $raw = $unit->get_availability_date_ranges();
            $ranges = [];
            if ( $raw !== "" && $raw !== null ) {
                $decoded = json_decode( $raw, true );
                if ( is_array( $decoded ) && isset( $decoded["availability_ranges"] ) && is_array( $decoded["availability_ranges"] ) ) {
                    $ranges = $decoded["availability_ranges"];
                }
            }
            return new WP_REST_Response([
                "date_ranges"                     => $ranges,
                "availability_recurring_annually" => $recurring,
            ], 200);
        } catch ( \Exception $e ) {
            return new WP_REST_Response([
                "error" => "Internal server error",
            ], 500);
        } finally {
            date_default_timezone_set( $prev_time_zone );
        }
    }

    /**
     * Permission for get-schedule: admins or users with access to the service.
     *
     * @param WP_REST_Request $request
     * @return bool
     */
    public function get_schedule_permission( $request ) : bool {
        if ( current_user_can( "manage_options" ) ) {
            return true;
        }
        $service_id = $request->get_param( "service_id" );
        if ( !WBK_Validator::check_integer( $service_id, 1, 9999999 ) ) {
            return false;
        }
        return WBK_Validator::check_access_to_service( $service_id );
    }

    /**
     * Load a month of schedule data with locked/unlocked days and time slots.
     * Based on the legacy wbk_schedule_load AJAX action.
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function get_schedule( WP_REST_Request $request ) : WP_REST_Response {
        try {
            WBK_Translation_Processor::switch_to_locale_from_get_param();
            date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
            $service_id = $request->get_param( "service_id" );
            $month = $request->get_param( "month" );
            if ( !WBK_Validator::check_integer( $service_id, 1, 9999999 ) ) {
                return new WP_REST_Response([
                    "error" => "Invalid service ID",
                ], 400);
            }
            $service_id = (int) $service_id;
            if ( $month === null || $month === "" ) {
                $month = date( "Y-m" );
            }
            if ( !preg_match( '/^\\d{4}-\\d{2}$/', (string) $month ) ) {
                return new WP_REST_Response([
                    "error" => "Invalid month format. Expected YYYY-MM.",
                ], 400);
            }
            $month_start = strtotime( $month . "-01 00:00:00" );
            if ( $month_start === false ) {
                return new WP_REST_Response([
                    "error" => "Invalid month value",
                ], 400);
            }
            $days_in_month = (int) date( "t", $month_start );
            if ( !current_user_can( "manage_options" ) ) {
                if ( !WBK_Validator::check_access_to_service( $service_id ) ) {
                    return new WP_REST_Response([
                        "error" => "Unauthorised access.",
                    ], 403);
                }
            }
            $service = new WBK_Service($service_id);
            if ( !$service->is_loaded() ) {
                return new WP_REST_Response([
                    "error" => "Service not found",
                ], 404);
            }
            $sp = new WBK_Schedule_Processor();
            $sp->load_data();
            $day_to_render = $month_start;
            $month_end = strtotime( "+1 month", $month_start );
            $date_format = WBK_Format_Utils::get_date_format();
            $locked_days_for_service = [];
            $all_locked_days = $sp->get_locked_days();
            if ( isset( $all_locked_days[$service_id] ) && is_array( $all_locked_days[$service_id] ) ) {
                $locked_days_for_service = array_map( "intval", $all_locked_days[$service_id] );
            }
            $unlocked_days_for_service = [];
            $all_unlocked_days = $sp->get_unlocked_days();
            if ( isset( $all_unlocked_days[$service_id] ) && is_array( $all_unlocked_days[$service_id] ) ) {
                $unlocked_days_for_service = array_map( "intval", $all_unlocked_days[$service_id] );
            }
            // Read locked time slots directly from DB for this service + month.
            global $wpdb;
            $locked_slots_table = get_option( "wbk_db_prefix", "" ) . "wbk_locked_time_slots";
            $locked_slot_times = $wpdb->get_col( $wpdb->prepare(
                "SELECT time FROM {$locked_slots_table} WHERE service_id = %d AND time >= %d AND time < %d ORDER BY time ASC",
                $service_id,
                $month_start,
                $month_end
            ) );
            if ( !is_array( $locked_slot_times ) ) {
                $locked_slot_times = [];
            }
            $locked_time_slots = [];
            $locked_time_slots_by_day = [];
            foreach ( $locked_slot_times as $slot_time ) {
                $slot_time = (int) $slot_time;
                if ( $slot_time <= 0 ) {
                    continue;
                }
                $locked_time_slots[] = $slot_time;
                $slot_day = strtotime( date( "Y-m-d", $slot_time ) . " 00:00:00" );
                $locked_time_slots_by_day[$slot_day][] = [
                    "start_time" => $slot_time,
                    "is_locked"  => true,
                ];
            }
            $days = [];
            $locked_days = [];
            $unlocked_days = [];
            for ($i = 1; $i <= $days_in_month; $i++) {
                date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
                $day_status = $sp->get_day_status( $day_to_render, $service_id );
                $is_day_locked = in_array( (int) $day_to_render, $locked_days_for_service, true );
                $is_day_unlocked = in_array( (int) $day_to_render, $unlocked_days_for_service, true );
                if ( $is_day_locked ) {
                    $locked_days[] = (int) $day_to_render;
                }
                if ( $is_day_unlocked ) {
                    $unlocked_days[] = (int) $day_to_render;
                }
                $days[] = [
                    "day"            => (int) $day_to_render,
                    "date"           => date( "Y-m-d", $day_to_render ),
                    "formatted_date" => wp_date( $date_format, $day_to_render, new DateTimeZone(date_default_timezone_get()) ),
                    "day_status"     => (int) $day_status,
                    "is_locked"      => $is_day_locked,
                    "is_unlocked"    => $is_day_unlocked,
                    "time_slots"     => $locked_time_slots_by_day[(int) $day_to_render] ?? [],
                ];
                $day_to_render = strtotime( "tomorrow", $day_to_render );
            }
            return new WP_REST_Response([
                "service_id"        => $service_id,
                "month"             => $month,
                "month_start"       => (int) $month_start,
                "days"              => $days,
                "locked_days"       => $locked_days,
                "unlocked_days"     => $unlocked_days,
                "locked_time_slots" => $locked_time_slots,
            ], 200);
        } catch ( \Exception $e ) {
            return new WP_REST_Response([
                "error" => "Internal server error",
            ], 500);
        } finally {
            date_default_timezone_set( "UTC" );
        }
    }

    /**
     * Permission for connected calendar events: admins or users with access to at least one requested service.
     *
     * @param WP_REST_Request $request
     * @return bool
     */
    public function get_connected_calendar_events_permission( $request ) : bool {
        if ( !is_user_logged_in() ) {
            return false;
        }
        if ( current_user_can( "manage_options" ) ) {
            return true;
        }
        $service_ids = $this->normalize_connected_calendar_service_ids( $request->get_param( "service_ids" ) );
        foreach ( $service_ids as $service_id ) {
            if ( WBK_Validator::check_access_to_service( $service_id ) ) {
                return true;
            }
        }
        return false;
    }

    /**
     * Normalize service_ids from a REST param (array, CSV string, or single value).
     *
     * @param mixed $raw
     * @return int[]
     */
    private function normalize_connected_calendar_service_ids( $raw ) : array {
        if ( $raw === null || $raw === "" ) {
            return [];
        }
        if ( !is_array( $raw ) ) {
            $raw = explode( ",", (string) $raw );
        }
        $service_ids = [];
        foreach ( $raw as $service_id ) {
            if ( !WBK_Validator::check_integer( $service_id, 1, 9999999 ) ) {
                continue;
            }
            $service_ids[] = (int) $service_id;
        }
        return array_values( array_unique( $service_ids ) );
    }

    /**
     * Fetch connected calendar events for the given services and date range.
     * Shared calendars across services are fetched only once.
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function get_connected_calendar_events( WP_REST_Request $request ) : WP_REST_Response {
        $prev_time_zone = date_default_timezone_get();
        try {
            WBK_Translation_Processor::switch_to_locale_from_get_param();
            date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
            if ( !wbk_fs()->is__premium_only() || !wbk_fs()->can_use_premium_code() ) {
                return new WP_REST_Response([
                    "events" => [],
                ], 200);
            }
            $service_ids = $this->normalize_connected_calendar_service_ids( $request->get_param( "service_ids" ) );
            if ( empty( $service_ids ) ) {
                return new WP_REST_Response([
                    "error" => "Invalid service IDs",
                ], 400);
            }
            $start = $request->get_param( "start" );
            $end = $request->get_param( "end" );
            if ( !WBK_Validator::check_integer( $start, 1, 32503680000 ) || !WBK_Validator::check_integer( $end, 1, 32503680000 ) ) {
                return new WP_REST_Response([
                    "error" => "Invalid date range",
                ], 400);
            }
            $start = (int) $start;
            $end = (int) $end;
            if ( $end <= $start ) {
                return new WP_REST_Response([
                    "error" => "Invalid date range",
                ], 400);
            }
            $calendar_ids = [];
            foreach ( $service_ids as $service_id ) {
                if ( !current_user_can( "manage_options" ) && !WBK_Validator::check_access_to_service( $service_id ) ) {
                    continue;
                }
                $service = new WBK_Service($service_id);
                if ( !$service->is_loaded() ) {
                    continue;
                }
                foreach ( $service->get_connected_calendars_for_import() as $calendar_id ) {
                    $calendar_id = (int) $calendar_id;
                    if ( $calendar_id > 0 ) {
                        $calendar_ids[$calendar_id] = $calendar_id;
                    }
                }
            }
            $start_iso = date( "c", $start );
            $end_iso = date( "c", $end );
            $allowed_modes = ["One-way-import", "Two-ways", "One-way"];
            $events = [];
            $index = 0;
            foreach ( $calendar_ids as $calendar_id ) {
                $connected_calendar = new WBK_Connected_Calendar($calendar_id);
                if ( !$connected_calendar->is_loaded() ) {
                    continue;
                }
                $events_result = WBK_Connected_Calendar_Processor::fetch_events_for_calendar_id(
                    $calendar_id,
                    $start_iso,
                    $end_iso,
                    $allowed_modes
                );
                if ( is_wp_error( $events_result ) || !is_array( $events_result ) ) {
                    continue;
                }
                $provider = $connected_calendar->get_provider();
                $calendar_name = $connected_calendar->get_name();
                foreach ( $events_result as $slot ) {
                    if ( !$slot instanceof WBK_Time_Slot ) {
                        continue;
                    }
                    $index++;
                    $title = $slot->get_title();
                    if ( !is_string( $title ) || $title === "" ) {
                        $title = ( $calendar_name !== "" ? $calendar_name : __( "Busy", "webba-booking-lite" ) );
                    }
                    $description = $slot->get_description();
                    $attendees = $slot->get_attendees();
                    $events[] = [
                        "id"            => "connected-" . $calendar_id . "-" . $index . "-" . $slot->get_start(),
                        "title"         => $title,
                        "description"   => ( is_string( $description ) ? $description : "" ),
                        "start"         => (int) $slot->get_start(),
                        "end"           => (int) $slot->get_end(),
                        "attendees"     => ( is_array( $attendees ) ? array_values( $attendees ) : [] ),
                        "calendar_id"   => $calendar_id,
                        "calendar_name" => $calendar_name,
                        "provider"      => $provider,
                    ];
                }
            }
            return new WP_REST_Response([
                "events" => $events,
            ], 200);
        } catch ( \Exception $e ) {
            return new WP_REST_Response([
                "error" => "Internal server error",
            ], 500);
        } finally {
            date_default_timezone_set( $prev_time_zone );
        }
    }

    /**
     * Permission for schedule lock/unlock endpoints.
     * Admins or users with access to the given service.
     *
     * @param WP_REST_Request $request
     * @return bool
     */
    public function schedule_lock_permission( $request ) : bool {
        if ( current_user_can( "manage_options" ) ) {
            return true;
        }
        $service_id = $request->get_param( "service_id" );
        if ( !WBK_Validator::check_integer( $service_id, 1, 9999999 ) ) {
            return false;
        }
        return WBK_Validator::check_access_to_service( $service_id );
    }

    /**
     * Validate service access and IDs for schedule lock operations.
     *
     * @param mixed $service_id
     * @return int|WP_REST_Response
     */
    private function validate_schedule_lock_service( $service_id ) {
        if ( !WBK_Validator::check_integer( $service_id, 1, 9999999 ) ) {
            return new WP_REST_Response([
                "error" => "Invalid service ID",
            ], 400);
        }
        $service_id = (int) $service_id;
        if ( !current_user_can( "manage_options" ) ) {
            if ( !WBK_Validator::check_access_to_service( $service_id ) ) {
                return new WP_REST_Response([
                    "error" => "Unauthorised access.",
                ], 403);
            }
        }
        $service = new WBK_Service($service_id);
        if ( !$service->is_loaded() ) {
            return new WP_REST_Response([
                "error" => "Service not found",
            ], 404);
        }
        return $service_id;
    }

    /**
     * Validate a unix timestamp used for day/time lock operations.
     *
     * @param mixed $value
     * @param string $field
     * @return int|WP_REST_Response
     */
    private function validate_schedule_lock_timestamp( $value, string $field ) {
        if ( !WBK_Validator::check_integer( $value, 1438426800, 2754046000 ) ) {
            return new WP_REST_Response([
                "error" => "Invalid {$field} value",
            ], 400);
        }
        return (int) $value;
    }

    /**
     * Lock a service day. Based on legacy wbk_lock_day AJAX action.
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function lock_day( WP_REST_Request $request ) : WP_REST_Response {
        global $wpdb;
        try {
            date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
            $service_id = $this->validate_schedule_lock_service( $request->get_param( "service_id" ) );
            if ( $service_id instanceof WP_REST_Response ) {
                return $service_id;
            }
            $day = $this->validate_schedule_lock_timestamp( $request->get_param( "day" ), "day" );
            if ( $day instanceof WP_REST_Response ) {
                return $day;
            }
            $table = get_option( "wbk_db_prefix", "" ) . "wbk_days_on_off";
            if ( $wpdb->query( $wpdb->prepare( "DELETE FROM {$table} WHERE day = %d AND service_id = %d", $day, $service_id ) ) === false ) {
                return new WP_REST_Response([
                    "error" => "Internal database error.",
                ], 500);
            }
            if ( $wpdb->insert( $table, [
                "service_id" => $service_id,
                "day"        => $day,
                "status"     => 0,
            ], ["%d", "%d", "%d"] ) === false ) {
                return new WP_REST_Response([
                    "error" => "Internal database error.",
                ], 500);
            }
            return new WP_REST_Response([
                "status"      => "success",
                "service_id"  => $service_id,
                "day"         => $day,
                "date"        => date( "Y-m-d", $day ),
                "is_locked"   => true,
                "is_unlocked" => false,
            ], 200);
        } catch ( \Exception $e ) {
            return new WP_REST_Response([
                "error" => "Internal server error",
            ], 500);
        } finally {
            date_default_timezone_set( "UTC" );
        }
    }

    /**
     * Unlock a service day. Based on legacy wbk_unlock_day AJAX action.
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function unlock_day( WP_REST_Request $request ) : WP_REST_Response {
        global $wpdb;
        try {
            date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
            $service_id = $this->validate_schedule_lock_service( $request->get_param( "service_id" ) );
            if ( $service_id instanceof WP_REST_Response ) {
                return $service_id;
            }
            $day = $this->validate_schedule_lock_timestamp( $request->get_param( "day" ), "day" );
            if ( $day instanceof WP_REST_Response ) {
                return $day;
            }
            $table = get_option( "wbk_db_prefix", "" ) . "wbk_days_on_off";
            if ( $wpdb->query( $wpdb->prepare( "DELETE FROM {$table} WHERE day = %d AND service_id = %d", $day, $service_id ) ) === false ) {
                return new WP_REST_Response([
                    "error" => "Internal database error.",
                ], 500);
            }
            if ( $wpdb->insert( $table, [
                "service_id" => $service_id,
                "day"        => $day,
                "status"     => 1,
            ], ["%d", "%d", "%d"] ) === false ) {
                return new WP_REST_Response([
                    "error" => "Internal database error.",
                ], 500);
            }
            return new WP_REST_Response([
                "status"      => "success",
                "service_id"  => $service_id,
                "day"         => $day,
                "date"        => date( "Y-m-d", $day ),
                "is_locked"   => false,
                "is_unlocked" => true,
            ], 200);
        } catch ( \Exception $e ) {
            return new WP_REST_Response([
                "error" => "Internal server error",
            ], 500);
        } finally {
            date_default_timezone_set( "UTC" );
        }
    }

    /**
     * Lock a service time slot. Based on legacy wbk_lock_time AJAX action.
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function lock_time( WP_REST_Request $request ) : WP_REST_Response {
        global $wpdb;
        try {
            date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
            $service_id = $this->validate_schedule_lock_service( $request->get_param( "service_id" ) );
            if ( $service_id instanceof WP_REST_Response ) {
                return $service_id;
            }
            $time = $this->validate_schedule_lock_timestamp( $request->get_param( "time" ), "time" );
            if ( $time instanceof WP_REST_Response ) {
                return $time;
            }
            $table = get_option( "wbk_db_prefix", "" ) . "wbk_locked_time_slots";
            if ( $wpdb->query( $wpdb->prepare( "DELETE FROM {$table} WHERE time = %d AND service_id = %d", $time, $service_id ) ) === false ) {
                return new WP_REST_Response([
                    "error" => "Internal database error.",
                ], 500);
            }
            if ( $wpdb->insert( $table, [
                "service_id" => $service_id,
                "time"       => $time,
            ], ["%d", "%d"] ) === false ) {
                return new WP_REST_Response([
                    "error" => "Internal database error.",
                ], 500);
            }
            return new WP_REST_Response([
                "status"     => "success",
                "service_id" => $service_id,
                "time"       => $time,
                "date"       => date( "Y-m-d", $time ),
                "is_locked"  => true,
            ], 200);
        } catch ( \Exception $e ) {
            return new WP_REST_Response([
                "error" => "Internal server error",
            ], 500);
        } finally {
            date_default_timezone_set( "UTC" );
        }
    }

    /**
     * Unlock a service time slot. Based on legacy wbk_unlock_time AJAX action.
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function unlock_time( WP_REST_Request $request ) : WP_REST_Response {
        global $wpdb;
        try {
            date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
            $service_id = $this->validate_schedule_lock_service( $request->get_param( "service_id" ) );
            if ( $service_id instanceof WP_REST_Response ) {
                return $service_id;
            }
            $time = $this->validate_schedule_lock_timestamp( $request->get_param( "time" ), "time" );
            if ( $time instanceof WP_REST_Response ) {
                return $time;
            }
            $table = get_option( "wbk_db_prefix", "" ) . "wbk_locked_time_slots";
            if ( $wpdb->query( $wpdb->prepare( "DELETE FROM {$table} WHERE time = %d AND service_id = %d", $time, $service_id ) ) === false ) {
                return new WP_REST_Response([
                    "error" => "Internal database error.",
                ], 500);
            }
            return new WP_REST_Response([
                "status"     => "success",
                "service_id" => $service_id,
                "time"       => $time,
                "date"       => date( "Y-m-d", $time ),
                "is_locked"  => false,
            ], 200);
        } catch ( \Exception $e ) {
            return new WP_REST_Response([
                "error" => "Internal server error",
            ], 500);
        } finally {
            date_default_timezone_set( "UTC" );
        }
    }

    public function get_time_slots_permission( $request ) {
        return is_user_logged_in();
    }

    public function get_time_slots( $request ) {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        $day = explode( "00:00:00", $request["date"] );
        $day = trim( $day[0] );
        if ( !WBK_Validator::is_date( $day ) ) {
            return $this->response_error( "Wrong date." );
        }
        date_default_timezone_set( "UTC" );
        $offset = ( isset( $request["offset"] ) ? (int) $request["offset"] : 0 );
        $day = date( "d-m-Y", strtotime( $day ) - $offset * 60 );
        date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
        $day = strtotime( $day . " 00:00:00" );
        $services = [];
        if ( isset( $request["services"] ) && $request["services"] != "" ) {
            $services = explode( ",", $request["services"] );
        }
        $booking = null;
        if ( isset( $request["booking"] ) && ctype_digit( (string) $request["booking"] ) ) {
            $candidate = new WBK_Booking($request["booking"]);
            if ( $candidate->is_loaded() ) {
                $booking = $candidate;
                $services = [$booking->get_service()];
            }
        }
        if ( count( $services ) == 0 ) {
            return $this->response_error( "No valid services found." );
        }
        $filtered = [];
        foreach ( $services as $service_id ) {
            if ( !WBK_Validator::is_service_exists( $service_id ) ) {
                return $this->response_error( "Wrong service ID." );
            }
            $sp = new WBK_Schedule_Processor();
            $timeslots = $sp->get_time_slots_by_day( $day, $service_id, [
                "skip_gg_calendar"       => false,
                "ignore_preparation"     => false,
                "calculate_availability" => true,
                "filter_availability"    => false,
            ] );
            if ( !is_array( $timeslots ) ) {
                $timeslots = [];
            }
            if ( $booking !== null ) {
                $timeslots = array_values( array_filter( $timeslots, fn( $obj ) => $obj->get_free_places() >= $booking->get_quantity() ) );
            }
            $filtered = $timeslots;
        }
        return new \WP_REST_Response([
            "status"    => "success",
            "timeslots" => $filtered,
        ], 200);
    }

    public function assistance_permission( $request ) {
        return wbk_is_assistance_available() && current_user_can( "manage_options" );
    }

    public function assistance_apply_permission( $request ) {
        return wbk_is_assistance_available() && current_user_can( "manage_options" );
    }

    public function assistance_apply( WP_REST_Request $request ) {
        error_log( "[WBK Assistance Apply] REST assistance_apply called" );
        try {
            $params = $request->get_json_params();
            $actions = [];
            if ( is_array( $params ) && isset( $params["actions"] ) && is_array( $params["actions"] ) ) {
                $actions = $params["actions"];
            }
            $timezone = "";
            if ( is_array( $params ) && isset( $params["timezone"] ) ) {
                $timezone = sanitize_text_field( (string) $params["timezone"] );
            }
            $session_id = "";
            if ( is_array( $params ) && isset( $params["session_id"] ) ) {
                $session_id = WBK_Assistance_Connect::normalize_session_id( (string) $params["session_id"] );
            }
            error_log( "[WBK Assistance Apply] REST payload received " . wp_json_encode( [
                "action_count"       => count( $actions ),
                "timezone"           => $timezone,
                "session_id_present" => $session_id !== "",
                "actions_summary"    => $this->summarize_assistance_actions_for_log( $actions ),
            ] ) );
            error_log( "[WBK Assistance Apply] calling WBK_Assistance::apply_actions " . wp_json_encode( WBK_Assistance::get_apply_debug_context() ) );
            $result = WBK_Assistance::apply_actions( $actions, [
                "timezone" => $timezone,
            ] );
            error_log( "[WBK Assistance Apply] apply_actions returned " . wp_json_encode( [
                "success"       => !empty( $result["success"] ),
                "error_count"   => ( is_array( $result["errors"] ?? null ) ? count( $result["errors"] ) : 0 ),
                "result_count"  => ( is_array( $result["results"] ?? null ) ? count( $result["results"] ) : 0 ),
                "warning_count" => ( is_array( $result["warnings"] ?? null ) ? count( $result["warnings"] ) : 0 ),
                "phase"         => WBK_Assistance::get_last_apply_phase(),
                "errors"        => $result["errors"] ?? [],
            ] ) );
            if ( !empty( $result["success"] ) ) {
                try {
                    WBK_Assistance_Connect::report_assistance_chat_completion( $session_id, $actions, $result );
                } catch ( \Throwable $report_error ) {
                    error_log( "[WBK Assistance Apply] report_assistance_chat_completion failed " . wp_json_encode( [
                        "message"         => $report_error->getMessage(),
                        "exception_class" => get_class( $report_error ),
                        "file"            => $report_error->getFile(),
                        "line"            => $report_error->getLine(),
                    ] ) );
                }
            }
            return new \WP_REST_Response([
                "success"      => !empty( $result["success"] ),
                "results"      => $result["results"] ?? [],
                "errors"       => $result["errors"] ?? [],
                "refs"         => $result["refs"] ?? [],
                "summary"      => $result["summary"] ?? [],
                "warnings"     => $result["warnings"] ?? [],
                "booking_page" => $result["booking_page"] ?? null,
                "debug"        => $result["debug"] ?? null,
            ], 200);
        } catch ( \Throwable $throwable ) {
            error_log( "[WBK Assistance Apply] REST assistance_apply uncaught exception " . wp_json_encode( [
                "message"         => $throwable->getMessage(),
                "exception_class" => get_class( $throwable ),
                "file"            => $throwable->getFile(),
                "line"            => $throwable->getLine(),
                "phase"           => ( class_exists( "WBK_Assistance" ) ? WBK_Assistance::get_last_apply_phase() : "unknown" ),
                "apply_context"   => ( class_exists( "WBK_Assistance" ) ? WBK_Assistance::get_apply_debug_context() : null ),
                "trace"           => $throwable->getTraceAsString(),
            ] ) );
            $debug = null;
            if ( defined( "WP_DEBUG" ) && WP_DEBUG ) {
                $debug = [
                    "source"          => "rest_uncaught_exception",
                    "exception_class" => get_class( $throwable ),
                    "file"            => $throwable->getFile(),
                    "line"            => $throwable->getLine(),
                    "phase"           => ( class_exists( "WBK_Assistance" ) ? WBK_Assistance::get_last_apply_phase() : "unknown" ),
                    "apply_context"   => ( class_exists( "WBK_Assistance" ) ? WBK_Assistance::get_apply_debug_context() : null ),
                    "trace"           => explode( "\n", $throwable->getTraceAsString() ),
                ];
            }
            return new \WP_REST_Response([
                "success"      => false,
                "results"      => [],
                "errors"       => [$throwable->getMessage()],
                "refs"         => [],
                "summary"      => [],
                "warnings"     => [],
                "booking_page" => null,
                "debug"        => $debug,
            ], 500);
        }
    }

    /**
     * @param array<int, mixed> $actions
     * @return array<int, array<string, mixed>>
     */
    private function summarize_assistance_actions_for_log( array $actions ) : array {
        $summary = [];
        foreach ( $actions as $index => $action ) {
            if ( !is_array( $action ) ) {
                $summary[] = [
                    "index"   => $index,
                    "invalid" => true,
                ];
                continue;
            }
            $entry = [
                "index"  => $index,
                "action" => ( isset( $action["action"] ) ? (string) $action["action"] : "" ),
            ];
            if ( isset( $action["table"] ) ) {
                $entry["table"] = (string) $action["table"];
            }
            if ( isset( $action["slug"] ) ) {
                $entry["slug"] = (string) $action["slug"];
            }
            if ( isset( $action["ref"] ) ) {
                $entry["ref"] = (string) $action["ref"];
            }
            if ( isset( $action["fields"] ) && is_array( $action["fields"] ) ) {
                $entry["field_keys"] = array_slice( array_keys( $action["fields"] ), 0, 20 );
            }
            $summary[] = $entry;
        }
        return $summary;
    }

    public function assistance( $request ) {
        $params = $request->get_json_params();
        $prompt = "";
        if ( is_array( $params ) && isset( $params["request"] ) ) {
            $prompt = trim( (string) $params["request"] );
        }
        if ( $prompt === "" ) {
            return new \WP_REST_Response([
                "success" => false,
                "message" => __( "Request text is required.", "webba-booking-lite" ),
            ], 400);
        }
        $messages = WBK_Assistance_Connect::parse_assistance_messages( ( is_array( $params ) ? $params["messages"] ?? null : null ) );
        $config_information = null;
        if ( is_array( $params ) && isset( $params["config_information"] ) && is_array( $params["config_information"] ) ) {
            $config_information = $params["config_information"];
        }
        $session_id = "";
        if ( is_array( $params ) && isset( $params["session_id"] ) ) {
            $session_id = WBK_Assistance_Connect::normalize_session_id( (string) $params["session_id"] );
        }
        $result = WBK_Assistance_Connect::submit_assistance_task(
            $prompt,
            [],
            $messages,
            $config_information,
            true,
            true,
            $session_id
        );
        if ( is_wp_error( $result ) ) {
            $status = $result->get_error_data()["status"] ?? 500;
            if ( !is_numeric( $status ) || $status < 400 ) {
                $status = 500;
            }
            $error_data = $result->get_error_data();
            $response = [
                "success" => false,
                "message" => $result->get_error_message(),
            ];
            if ( is_array( $error_data ) && !empty( $error_data["moderation"] ) ) {
                $response["moderation"] = $error_data["moderation"];
            }
            return new \WP_REST_Response($response, (int) $status);
        }
        return new \WP_REST_Response([
            "success" => true,
            "task_id" => $result["task_id"] ?? null,
            "status"  => $result["status"] ?? "processing",
        ], 202);
    }

    public function assistance_task_status( $request ) {
        $task_id = (int) $request->get_param( "task_id" );
        if ( $task_id <= 0 ) {
            return new \WP_REST_Response([
                "success" => false,
                "message" => __( "Task id is required.", "webba-booking-lite" ),
            ], 400);
        }
        $result = WBK_Assistance_Connect::get_assistance_task_status( $task_id );
        if ( is_wp_error( $result ) ) {
            $status = $result->get_error_data()["status"] ?? 500;
            if ( !is_numeric( $status ) || $status < 400 ) {
                $status = 500;
            }
            $error_data = $result->get_error_data();
            $response = [
                "success" => false,
                "message" => $result->get_error_message(),
            ];
            if ( is_array( $error_data ) && !empty( $error_data["moderation"] ) ) {
                $response["moderation"] = $error_data["moderation"];
            }
            return new \WP_REST_Response($response, (int) $status);
        }
        return new \WP_REST_Response($result, 200);
    }

}
