<?php

use WebbaBooking\Utilities\WBK_Options_Utils;
if ( !defined( 'ABSPATH' ) ) {
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
        add_action( 'rest_api_init', function () {
            register_rest_route( 'webba-booking/v1', '/get-booking-ids-by-token', [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_booking_ids_by_token'],
                'permission_callback' => [$this, 'get_booking_ids_by_token_permission'],
            ] );
            register_rest_route( 'wbk/v1', '/get-service-list/', [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_service_list'],
                'permission_callback' => [$this, 'get_service_list_permission'],
            ] );
            register_rest_route( 'wbk/v1', '/appointments-status-change/', [
                'methods'             => 'POST',
                'callback'            => [$this, 'appointments_status_change'],
                'permission_callback' => [$this, 'appointments_status_change_permission'],
            ] );
            register_rest_route( 'wbk/v1', '/resend-email/', [
                'methods'             => 'POST',
                'callback'            => [$this, 'resend_email'],
                'permission_callback' => [$this, 'resend_email_permission'],
            ] );
            register_rest_route( 'wbk/v1', '/get-wp-users/', [
                'methods'             => 'POST',
                'callback'            => [$this, 'get_wp_users'],
                'permission_callback' => [$this, 'get_wp_users_permission'],
            ] );
            register_rest_route( 'wbk/v1', '/csv-export/', [
                'methods'             => 'POST',
                'callback'            => [$this, 'wbk_csv_export'],
                'permission_callback' => [$this, 'wbk_csv_export_permission'],
            ] );
            register_rest_route( 'wbk/v2', '/get-preset/', [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_preset'],
                'permission_callback' => [$this, 'get_preset_permission'],
            ] );
            register_rest_route( 'wbk/v2', '/login', [
                'methods'             => 'POST',
                'callback'            => [$this, 'login'],
                'permission_callback' => [$this, 'login_permission'],
            ] );
            register_rest_route( 'wbk/v2', '/get-user-bookings', [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_user_bookings'],
                'permission_callback' => [$this, 'get_user_bookings_permission'],
            ] );
            register_rest_route( 'wbk/v2', '/get-time-slots', [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_time_slots'],
                'permission_callback' => [$this, 'get_time_slots_permission'],
            ] );
            register_rest_route( 'wbk/v2', '/update-booking', [
                'methods'             => 'POST',
                'callback'            => [$this, 'update_booking'],
                'permission_callback' => [$this, 'update_booking_permission'],
            ] );
            register_rest_route( 'wbk/v2', '/delete-booking', [
                'methods'             => 'POST',
                'callback'            => [$this, 'delete_booking'],
                'permission_callback' => [$this, 'delete_booking_permission'],
            ] );
            register_rest_route( 'wbk/v2', '/get-field-options/', [
                'methods'             => 'POST',
                'callback'            => [$this, 'get_field_options'],
                'permission_callback' => [$this, 'get_field_options_permission'],
            ] );
            register_rest_route( 'wbk/v2', '/get-gg-auth-data/', [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_gg_auth_data'],
                'permission_callback' => [$this, 'get_gg_auth_data_permission'],
            ] );
            register_rest_route( 'wbk/v2', '/get-dashboard-stats/', [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_dashboard_stats'],
                'permission_callback' => [$this, 'get_dashboard_stats_permission'],
            ] );
            register_rest_route( 'wbk/v2', '/get-cell-detail/', [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_cell_detail'],
                'permission_callback' => [$this, 'get_cell_detail_permission'],
            ] );
            register_rest_route( 'wbk/v2', '/save-appearance/', [
                'methods'             => 'POST',
                'callback'            => [$this, 'save_appearance'],
                'permission_callback' => [$this, 'save_appearance_permission'],
            ] );
            register_rest_route( 'webba-booking/v1', '/get-service-availability/', [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_service_availability'],
                'permission_callback' => [$this, 'get_service_availability_permission'],
            ] );
            register_rest_route( 'wbk/v1', '/get-available-time-slots-day/', [
                'methods'             => 'POST',
                'callback'            => [$this, 'get_available_time_slots_day'],
                'permission_callback' => [$this, 'get_available_time_slots_day_permission'],
            ] );
            register_rest_route( 'webba-booking/v1', '/get-service-time-slots/', [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_service_time_slots'],
                'permission_callback' => [$this, 'get_service_time_slots_permission'],
            ] );
            register_rest_route( 'webba-booking/v1', '/get-form-fields', [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_form_fields'],
                'permission_callback' => [$this, 'get_form_fields_permission'],
            ] );
            register_rest_route( 'webba-booking/v1', '/get-payment-methods', [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_payment_methods'],
                'permission_callback' => [$this, 'get_payment_methods_permission'],
            ] );
            register_rest_route( 'webba-booking/v1', '/create-booking', [
                'methods'             => 'POST',
                'callback'            => [$this, 'create_booking'],
                'permission_callback' => [$this, 'create_booking_permission'],
            ] );
            register_rest_route( 'webba-booking/v1', '/calculate-amounts/', [
                'methods'             => 'POST',
                'callback'            => [$this, 'calculate_amounts_rest'],
                'permission_callback' => '__return_true',
            ] );
            register_rest_route( 'webba-booking/v1', '/execute-paypal-payment', [
                'methods'             => 'POST',
                'callback'            => [$this, 'execute_paypal_payment'],
                'permission_callback' => [$this, 'execute_paypal_payment_permission'],
            ] );
            register_rest_route( 'webba-booking/v1', '/execute-stripe-payment', [
                'methods'             => 'POST',
                'callback'            => [$this, 'execute_stripe_payment'],
                'permission_callback' => [$this, 'execute_stripe_payment_permission'],
            ] );
            register_rest_route( 'webba-booking/v1', '/booking-action', [
                'methods'             => 'POST',
                'callback'            => [$this, 'booking_action'],
                'permission_callback' => [$this, 'booking_action_permission'],
            ] );
            register_rest_route( 'webba-booking/v1', '/initialize-payment-method', [
                'methods'             => 'POST',
                'callback'            => [$this, 'initialize_payment_method'],
                'permission_callback' => [$this, 'initialize_payment_method_permission'],
            ] );
            register_rest_route( 'wbk/v2', '/send-test-email/', [
                'methods'             => 'POST',
                'callback'            => [$this, 'send_test_email'],
                'permission_callback' => [$this, 'send_test_email_permission'],
            ] );
            register_rest_route( 'webba-booking/v1', '/get-timezones/', [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_timezones'],
                'permission_callback' => '__return_true',
            ] );
            register_rest_route( 'wbk/v2', '/save-options/', [
                'methods'             => 'POST',
                'callback'            => [$this, 'save_options'],
                'permission_callback' => [$this, 'save_options_permission'],
            ] );
            register_rest_route( 'wbk/v2', '/get-options/', [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_options'],
                'permission_callback' => [$this, 'get_options_permission'],
            ] );
            register_rest_route( 'wbk/v2', '/remove-zoom-auth/', [
                'methods'             => 'POST',
                'callback'            => [$this, 'remove_zoom_auth'],
                'permission_callback' => [$this, 'remove_zoom_auth_permission'],
            ] );
        } );
        add_action( 'wp_ajax_wbk_calculate_amounts', [$this, 'calculate_amounts'] );
        add_action( 'wp_ajax_nopriv_wbk_calculate_amounts', [$this, 'calculate_amounts'] );
        add_action( 'wp_ajax_wbk_search_time', [$this, 'search_time'] );
        add_action( 'wp_ajax_nopriv_wbk_search_time', [$this, 'search_time'] );
        add_action( 'wp_ajax_wbk-render-days', [$this, 'render_days'] );
        add_action( 'wp_ajax_nopriv_wbk-render-days', [$this, 'render_days'] );
        add_action( 'wp_ajax_wbk_render_booking_form', [$this, 'render_booking_form'] );
        add_action( 'wp_ajax_nopriv_wbk_render_booking_form', [$this, 'render_booking_form'] );
        add_action( 'wp_ajax_wbk_book', [$this, 'book'] );
        add_action( 'wp_ajax_nopriv_wbk_book', [$this, 'book'] );
        add_action( 'wp_ajax_wbk_prepare_payment', [$this, 'prepare_payment'] );
        add_action( 'wp_ajax_nopriv_wbk_prepare_payment', [$this, 'prepare_payment'] );
        add_action( 'wp_ajax_wbk_cancel_appointment', [$this, 'cancel_booking'] );
        add_action( 'wp_ajax_nopriv_wbk_cancel_appointment', [$this, 'cancel_booking'] );
        add_action( 'wp_ajax_wbk_schedule_tools_action', [$this, 'schedule_tools_action'] );
        add_action( 'wp_ajax_wbk_report_error', [$this, 'wbk_report_error'] );
        add_action( 'wp_ajax_nopriv_wbk_report_error', [$this, 'wbk_report_error'] );
        add_action( 'wp_ajax_wbk_backend_hide_notice', [$this, 'wbk_backend_hide_notice'] );
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
            case 'paypal':
                break;
            case 'stripe':
            case 'google_pay':
            case 'apple_pay':
            case 'stripe_others':
                break;
            case 'woocommerce':
                break;
            case 'arrival':
                foreach ( $booking_ids as $booking_id ) {
                    $booking = new WBK_Booking($booking_id);
                    if ( !$booking->is_loaded() ) {
                        continue;
                    }
                    $booking->set( 'payment_method', 'Pay on arrival' );
                    $booking->save();
                }
                if ( get_option( 'wbk_email_customer_paymentrcvd_payonarrival_status', '' ) == 'true' ) {
                    WBK_Email_Processor::send( $booking_ids, 'payment' );
                }
                $response_data['payment_required'] = false;
                $response_data['message'] = get_option( 'wbk_pay_on_arrival_message', '' );
                $response_data['payment_details'] = $payment_details;
                break;
            case 'bank':
                foreach ( $booking_ids as $booking_id ) {
                    $booking = new WBK_Booking($booking_id);
                    if ( !$booking->is_loaded() ) {
                        continue;
                    }
                    $booking->set( 'payment_method', 'Bank transfer' );
                    $booking->save();
                }
                $response_data['payment_required'] = false;
                $response_data['message'] = get_option( 'wbk_bank_transfer_message', '' );
                $response_data['payment_details'] = $payment_details;
                break;
            default:
                $response_data['payment_required'] = false;
                break;
        }
        return $response_data;
    }

    function login( $request ) {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        $params = $request->get_json_params();
        $credentials = [
            'user_login'    => $params['username'],
            'user_password' => $params['password'],
            'remember'      => true,
        ];
        $user = wp_signon( $credentials );
        if ( is_wp_error( $user ) ) {
            return new WP_Error('invalid_login', 'Invalid username or password.', [
                'status' => 403,
            ]);
        }
        wp_set_current_user( $user->ID );
        return new \WP_REST_Response([
            'token' => wp_create_nonce( 'wp_rest' ),
            'user'  => $user->data,
        ], 200);
    }

    public function wbk_csv_export_permission() {
        return true;
    }

    public function get_wp_users_permission( $request ) {
        return true;
    }

    public function appointments_status_change_permission( $request ) {
        $table = sanitize_text_field( $request['table'] );
        if ( false === WbkData()->tables->get_element_at( $table ) ) {
            return false;
        }
        if ( is_numeric( $request['row_id'] ) ) {
            return WbkData()->tables->get_element_at( $table )->current_user_can_update();
        }
        return WbkData()->tables->get_element_at( $table )->current_user_can_add();
    }

    public function resend_email( $request ) {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        $booking_id = sanitize_text_field( $request['id'] );
        $error_status = false;
        $error_messages = [];
        if ( !WBK_Validator::check_integer( $booking_id, 1, 2758537351 ) ) {
            $error_status = true;
            $error_messages[] = 'Wrong booking id.';
        }
        $booking = new WBK_Booking($booking_id);
        if ( !$booking->is_loaded() ) {
            $error_status = true;
            $error_messages[] = 'Unable to open booking.';
        }
        $action = sanitize_text_field( $request['notification_type'] );
        $actions = [
            'booking_created_by_customer',
            'booking_paid',
            'booking_approved',
            'booking_finished'
        ];
        if ( !in_array( $action, $actions ) ) {
            $error_status = true;
            $error_messages[] = 'Wrong notification type.';
        }
        if ( $error_status ) {
            $response = new \WP_REST_Response([
                'message' => implode( ',', $error_messages ) . '.',
            ]);
            $response->set_status( 400 );
            return $response;
        }
        WBK_Email_Processor::send( [$booking_id], $action, true );
        $response = new \WP_REST_Response([
            'message' => __( 'Email sent', 'webba-booking-lite' ),
        ]);
        $response->set_status( 200 );
        return $response;
    }

    public function get_wp_users( $request ) {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        $data = [
            'none_admin_users' => WBK_User_Utils::get_none_admin_wp_users(),
        ];
        $response = new \WP_REST_Response($data);
        $response->set_status( 200 );
        return $response;
    }

    public function appointments_status_change( $request ) {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        $table = trim( sanitize_text_field( $request['table'] ) );
        $row_id = trim( sanitize_text_field( $request['row_id'] ) );
        $status = trim( sanitize_text_field( $request['status'] ) );
        if ( false === WbkData()->tables->get_element_at( $table ) ) {
            $response = new \WP_REST_Response();
            $response->set_status( 400 );
            return $response;
        }
        global $wpdb;
        $table = WbkData()->tables->get_element_at( $table );
        $table_name = $table->get_table_name();
        $wpdb->update( $table_name, [
            'status' => $status,
        ], [
            'id' => $row_id,
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
        $html = '';
        foreach ( $services as $id => $service ) {
            $html .= '<option value="' . $id . '">' . $service . '</option>';
        }
        $data = [
            'html' => $html,
        ];
        $response = new \WP_REST_Response($data);
        $response->set_status( 200 );
        return $response;
    }

    public function get_service_list_permission( $request ) {
        $table = sanitize_text_field( $request['table'] );
        return WbkData()->tables->get_element_at( $table )->current_user_can_add();
    }

    /**
     * function CSV export
     * @return null
     */
    public function wbk_csv_export( $request ) {
        if ( !WBK_Feature_Gate::have_required_plan( 'standard' ) ) {
            return new \WP_REST_Response([
                'error' => 'You need to upgrade to a premium plan to export CSV.',
            ], 403);
        }
        WBK_Translation_Processor::switch_to_locale_from_get_param();
    }

    /**
     * Calculate discount amount from coupon code
     *
     * @param string $coupon Coupon code
     * @param float $amount Amount to apply discount to
     * @param array $service_ids Array of service IDs for coupon validation
     * @return float Discount amount
     */
    private function calculate_coupon_discount( $coupon, $amount, $service_ids ) {
        if ( empty( $coupon ) || empty( $service_ids ) || $amount <= 0 ) {
            return 0;
        }
        $coupon = esc_html( sanitize_text_field( trim( $coupon ) ) );
        $service_ids = array_unique( $service_ids );
        // Validate coupon
        $coupon_result = WBK_Validator::check_coupon( $coupon, $service_ids );
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
                // Fixed amount discount
                return $coupon_result[1];
            }
        }
        return 0;
    }

    /**
     * REST API endpoint for calculating amounts
     *
     * @param WP_REST_Request $request Request object
     * @return WP_REST_Response Response object
     */
    public function calculate_amounts_rest( $request ) {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        $params = $request->get_params();
        // Extract data from new places structure
        $places = ( isset( $params['places'] ) ? $params['places'] : [] );
        $services = ( isset( $params['services'] ) ? $params['services'] : [] );
        $extra_data = ( isset( $params['extra'] ) ? stripslashes( $params['extra'] ) : '' );
        // Validate places structure
        if ( !is_array( $places ) || empty( $places ) ) {
            return new WP_REST_Response([
                'error' => 'Places data is required',
            ], 400);
        }
        // Extract times, services, and quantities from places
        $times = [];
        $booking_services = [];
        $quantities = [];
        foreach ( $places as $service_id => $slots ) {
            if ( !WBK_Validator::check_integer( $service_id, 1, 2758537351 ) ) {
                return new WP_REST_Response([
                    'error' => 'Invalid service ID: ' . $service_id,
                ], 400);
            }
            if ( !is_array( $slots ) ) {
                return new WP_REST_Response([
                    'error' => 'Invalid slots data for service: ' . $service_id,
                ], 400);
            }
            foreach ( $slots as $slot ) {
                if ( !isset( $slot['time'] ) || !isset( $slot['quantity'] ) ) {
                    return new WP_REST_Response([
                        'error' => 'Missing time or quantity in slot',
                    ], 400);
                }
                $time = $slot['time'];
                $quantity = $slot['quantity'];
                if ( !is_numeric( $time ) || !WBK_Validator::check_integer( $quantity, 1, 2758537351 ) ) {
                    return new WP_REST_Response([
                        'error' => 'Invalid time or quantity',
                    ], 400);
                }
                $times[] = intval( $time );
                $booking_services[] = intval( $service_id );
                $quantities[] = intval( $quantity );
            }
        }
        // Validate services from the services array
        foreach ( $services as $service_this ) {
            if ( !WBK_Validator::check_integer( $service_this, 1, 2758537351 ) ) {
                return new WP_REST_Response([
                    'error' => 'Invalid service ID',
                ], 400);
            }
        }
        $name = ( isset( $params['first_name'] ) && isset( $params['last_name'] ) ? sanitize_text_field( $params['first_name'] . ' ' . $params['last_name'] ) : 'blank' );
        $desc = '';
        $phone = ( isset( $params['phone'] ) ? sanitize_text_field( $params['phone'] ) : '' );
        // Create bookings array
        $bookings = [];
        for ($i = 0; $i < count( $times ); $i++) {
            $time = $times[$i];
            $service = $booking_services[$i];
            $quantity = $quantities[$i];
            if ( !is_numeric( $time ) || !is_numeric( $service ) || !is_numeric( $quantity ) ) {
                return new WP_REST_Response([
                    'error' => 'Invalid parameters',
                ], 400);
            }
            $day = strtotime( date( 'Y-m-d', $time ) . ' 00:00:00' );
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
            $bookings[] = $booking;
        }
        // Calculate totals
        if ( count( $bookings ) > 60 ) {
            return new WP_REST_Response([
                'error' => 'Too many bookings',
            ], 400);
        }
        // Get all service IDs for coupon validation
        $service_ids = [];
        foreach ( $bookings as $booking ) {
            $service_ids[] = $booking->get_service();
        }
        $service_ids = array_unique( $service_ids );
        // Validate coupon if provided
        $coupon_result = null;
        if ( isset( $params['coupon'] ) && !empty( trim( $params['coupon'] ) ) ) {
            $coupon_result = WBK_Validator::check_coupon( $params['coupon'], $service_ids );
            if ( $coupon_result === false ) {
                $coupon_result = null;
            }
        }
        // Use get_payment_items to calculate all totals
        $payment_data = WBK_Price_Processor::get_payment_items(
            $bookings,
            0,
            // tax will be calculated automatically
            $coupon_result,
            false
        );
        // Check for errors
        if ( $payment_data === -4 ) {
            return new WP_REST_Response([
                'error' => 'Invalid booking data',
            ], 400);
        }
        $stripe_payment_methods = [
            'stripe',
            'stripe_others',
            'google_pay',
            'apple_pay'
        ];
        if ( isset( $params['payment_method'] ) && in_array( $params['payment_method'], $stripe_payment_methods ) ) {
            $payment_data['email'] = $params['email'] ?? '';
            if ( $payment_data['to_pay_total'] > 0 && (!isset( $params['stripe_details'] ) || $params['stripe_details']['service_ids'] !== $service_ids || $params['stripe_details']['coupon_id'] !== $params['coupon'] || $params['stripe_details']['payment_method'] !== $params['payment_method']) ) {
                // services or coupon changed, create new intent
                $stripe = new WBK_Stripe();
                $stripe->init( $params['service_id'] );
                $intent_data = $stripe->create_payment_intent( $params['payment_method'], $params['email'], $payment_data );
                if ( $intent_data['success'] ) {
                    $payment_data['stripe_details']['client_secret'] = $intent_data['client_secret'];
                    $payment_data['stripe_details']['intent_id'] = $intent_data['intent_id'];
                    $payment_data['stripe_details']['amount'] = $payment_data['to_pay_total'];
                    $payment_data['stripe_details']['service_ids'] = $service_ids;
                    $payment_data['stripe_details']['coupon_id'] = $params['coupon'];
                    $payment_data['stripe_details']['payment_method'] = $params['payment_method'];
                } else {
                    $payment_data['stripe_details']['error'] = $intent_data['error'];
                }
            } elseif ( isset( $params['stripe_details'] ) && !isset( $params['stripe_details']['error'] ) ) {
                $payment_data['stripe_details'] = $params['stripe_details'];
            } else {
                unset($payment_data['stripe_details']);
            }
        }
        if ( isset( $payment_data['item_names'] ) ) {
            unset($payment_data['item_names']);
        }
        return new WP_REST_Response($payment_data, 200);
    }

    public function cancel_booking() {
        if ( !wp_verify_nonce( $_POST['nonce'], 'wbkf_nonce' ) ) {
            wp_die();
            return;
        }
        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        $email = strtolower( $_POST['email'] );
        $app_token = $_POST['app_token'];
        if ( !WBK_Validator::check_email( $email ) ) {
            echo json_encode( [
                'status'      => 'fail',
                'description' => 'Wrong email address',
            ] );
            date_default_timezone_set( 'UTC' );
            wp_die();
            return;
        }
        $booking_ids = WBK_Model_Utils::get_booking_ids_by_group_token( $app_token );
        if ( count( $booking_ids ) > 50 ) {
            echo json_encode( [
                'status'      => 'fail',
                'description' => 'Something went wrong',
            ] );
            wp_die();
            return;
        }
        $valid = true;
        $arr_tokens = explode( '-', $app_token );
        $i = 0;
        $multi_booking_valid = true;
        foreach ( $booking_ids as $booking_id ) {
            $booking = new WBK_Booking($booking_id);
            if ( !$booking->is_loaded() ) {
                $multi_booking_valid = false;
                continue;
            }
            if ( $booking->get( 'email' ) != $email ) {
                $multi_booking_valid = false;
            }
        }
        foreach ( $booking_ids as $booking_id ) {
            $booking = new WBK_Booking($booking_id);
            $booking->set( 'canceled_by', __( 'customer', 'webba-booking-lite' ) );
            $booking->save();
        }
        foreach ( $booking_ids as $booking_id ) {
            $bf = new WBK_Booking_Factory();
            $bf->destroy( $booking_id, 'customer', false );
            $i++;
        }
        if ( $multi_booking_valid && count( $booking_ids ) > 0 ) {
            $message = '<div class="thank-you-block-w"><div class="thank-you-content-w">' . esc_html( get_option( 'wbk_booking_canceled_message', 'Your booking has been cancelled.' ) ) . '</div></div>';
            echo json_encode( [
                'status'         => 'success',
                'thanks_message' => $message,
            ] );
        } else {
            $message = esc_html( get_option( 'wbk_booking_cancel_error_message', '' ) );
            echo json_encode( [
                'status'      => 'fail',
                'description' => stripslashes( $message ),
            ] );
        }
        date_default_timezone_set( 'UTC' );
        wp_die();
        return;
    }

    public function wbk_backend_hide_notice() {
        $notice = sanitize_text_field( $_POST['notice'] );
        if ( $notice == 'wbk_show_go_preimum_1' ) {
            update_option( 'wbk_show_go_preimum_1', 'false' );
        }
        if ( !wp_verify_nonce( $_POST['nonce'], 'wbkf_nonce' ) ) {
            wp_die();
            return;
        }
        if ( $notice == 'wbk_after_setup_notice' ) {
            update_option( 'wbk_sms_setup_required', '' );
            update_option( 'wbk_payments_setup_required', '' );
            update_option( 'wbk_google_setup_required', '' );
        }
        wp_die();
        return;
    }

    public function schedule_tools_action() {
        global $wpdb;
        global $current_user;
        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        if ( !wp_verify_nonce( $_POST['nonce'], 'wbkb_nonce' ) ) {
            wp_die();
            return;
        }
        if ( !isset( $_POST['lock_action'] ) ) {
            echo json_encode( [
                'status'  => 0,
                'message' => 'Wrong action.',
            ] );
            wp_die();
            return;
        }
        if ( $_POST['lock_action'] != 'lock' && $_POST['lock_action'] != 'unlock' ) {
            echo json_encode( [
                'status'  => 0,
                'message' => 'Wrong action target.',
            ] );
            wp_die();
            return;
        }
        $lock_action = sanitize_text_field( $_POST['lock_action'] );
        if ( !isset( $_POST['lock_target'] ) ) {
            echo json_encode( [
                'status'  => 0,
                'message' => 'Wrong action target.',
            ] );
            wp_die();
            return;
        }
        if ( $_POST['lock_target'] != 'dates' && $_POST['lock_target'] != 'timeslots' ) {
            echo json_encode( [
                'status'  => 0,
                'message' => 'Wrong action target.',
            ] );
            wp_die();
            return;
        }
        $lock_target = sanitize_text_field( $_POST['lock_target'] );
        $date_range = sanitize_text_field( $_POST['date_range'] );
        $date_range = explode( ' - ', $date_range );
        if ( !is_array( $date_range ) || count( $date_range ) != 2 ) {
            echo json_encode( [
                'status'  => 0,
                'message' => 'Wrong date range.',
            ] );
            wp_die();
            return;
        }
        $start = strtotime( $date_range[0] );
        $end = strtotime( $date_range[1] );
        if ( $end < $start ) {
            echo json_encode( [
                'status'  => 0,
                'message' => 'Wrong date range.',
            ] );
            wp_die();
            return;
        }
        $service_id = sanitize_text_field( $_POST['service'] );
        $category_id = sanitize_text_field( $_POST['category'] );
        if ( !is_numeric( $service_id ) && !is_numeric( $category_id ) ) {
            echo json_encode( [
                'status'  => 0,
                'message' => 'Wrong service or category.',
            ] );
            wp_die();
            return;
        }
        if ( $lock_target == 'timeslots' ) {
            $from = sanitize_text_field( $_POST['from'] );
            $to = sanitize_text_field( $_POST['to'] );
            if ( !WBK_Validator::check_integer( $from, 900, 85500 ) || !WBK_Validator::check_integer( $to, 0, 86400 ) ) {
                echo json_encode( [
                    'status'  => 0,
                    'message' => 'Wrong time interval.',
                ] );
                wp_die();
                return;
            }
            if ( $from >= $to ) {
                echo json_encode( [
                    'status'  => 0,
                    'message' => 'Wrong time interval.',
                ] );
                wp_die();
                return;
            }
        } else {
            $excluded_dates = explode( ',', sanitize_text_field( $_POST['exclude_dates'] ) );
            $excluded_dates_temp = [];
            foreach ( $excluded_dates as $date ) {
                $date = strtotime( $date );
                if ( $date ) {
                    $excluded_dates_temp[] = $date;
                }
            }
            $excluded_dates = $excluded_dates_temp;
        }
        $days_of_week = explode( ',', $_POST['days_of_week'] );
        if ( !is_array( $days_of_week ) ) {
            echo json_encode( [
                'status'  => 0,
                'message' => 'Wrong days of the week.',
            ] );
            wp_die();
            return;
        }
        if ( count( $days_of_week ) == 0 || count( $days_of_week ) > 7 ) {
            echo json_encode( [
                'status'  => 0,
                'message' => 'Wrong days of the week.',
            ] );
            wp_die();
            return;
        }
        foreach ( $days_of_week as $day_of_week ) {
            if ( !WBK_Validator::check_integer( $day_of_week, 1, 7 ) ) {
                echo json_encode( [
                    'status'  => 0,
                    'message' => 'Wrong days of the week.',
                ] );
                wp_die();
                return;
            }
        }
        $total_locked = 0;
        $arr_service_ids = [$service_id];
        if ( $category_id != -1 ) {
            if ( WBK_Validator::check_integer( $category_id, 1, 999999 ) ) {
                $arr_service_ids = WBK_Model_Utils::get_services_in_category( $category_id );
            }
        }
        $sp = new WBK_Schedule_Processor();
        $sp->load_data();
        foreach ( $arr_service_ids as $service_id ) {
            if ( !current_user_can( 'manage_options' ) ) {
                if ( !WBK_Validator::check_access_to_service( $service_id ) ) {
                    echo json_encode( [
                        'status'  => 0,
                        'message' => 'Unauthorised access.',
                    ] );
                    wp_die();
                    return;
                }
            }
            $service = new WBK_Service($service_id);
            if ( !$service->is_loaded() ) {
                continue;
            }
            $curent_day = $start;
            while ( $curent_day <= $end ) {
                if ( !in_array( date( 'N', $curent_day ), $days_of_week ) ) {
                    $curent_day = strtotime( 'tomorrow', $curent_day );
                    continue;
                }
                if ( is_array( $excluded_dates ) && in_array( $curent_day, $excluded_dates ) ) {
                    $curent_day = strtotime( 'tomorrow', $curent_day );
                    continue;
                }
                if ( $lock_target == 'dates' ) {
                    if ( $wpdb->query( $wpdb->prepare( 'DELETE FROM ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_days_on_off WHERE day = %d and service_id = %d', $curent_day, $service_id ) ) === false ) {
                        echo json_encode( [
                            'status'  => 0,
                            'message' => 'Internal database error.',
                        ] );
                        wp_die();
                        return;
                    } else {
                        $total_locked++;
                    }
                    if ( $lock_action == 'lock' ) {
                        $status = 0;
                    } else {
                        $status = 1;
                    }
                    if ( $wpdb->insert( get_option( 'wbk_db_prefix', '' ) . 'wbk_days_on_off', [
                        'service_id' => $service_id,
                        'day'        => $curent_day,
                        'status'     => $status,
                    ], ['%d', '%d', '%d'] ) === false ) {
                        echo json_encode( [
                            'status'  => 0,
                            'message' => 'Internal database error.',
                        ] );
                        wp_die();
                        return;
                    }
                    $curent_day = strtotime( 'tomorrow', $curent_day );
                    continue;
                }
                $day_time_start = WBK_Time_Math_Utils::adjust_times( $curent_day, $from, get_option( 'wbk_timezone', 'UTC' ) );
                $day_time_end = WBK_Time_Math_Utils::adjust_times( $curent_day, $to, get_option( 'wbk_timezone', 'UTC' ) );
                $i = 1;
                $timeslots = $sp->get_time_slots_by_day( $curent_day, $service_id, [
                    'skip_gg_calendar'       => true,
                    'ignore_preparation'     => true,
                    'calculate_availability' => false,
                ] );
                foreach ( $timeslots as $timeslot ) {
                    if ( $timeslot->get_start() < $day_time_start || $timeslot->get_start() > $day_time_end ) {
                        continue;
                    }
                    if ( $wpdb->query( $wpdb->prepare( 'DELETE FROM ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_locked_time_slots WHERE time = %d and service_id = %d', $timeslot->get_start(), $service_id ) ) === false ) {
                        echo json_encode( [
                            'status'  => 0,
                            'message' => 'Internal database error.',
                        ] );
                        wp_die();
                        return;
                    } else {
                        $total_locked++;
                    }
                    if ( $lock_action == 'lock' ) {
                        if ( $wpdb->insert( get_option( 'wbk_db_prefix', '' ) . 'wbk_locked_time_slots', [
                            'service_id' => $service_id,
                            'time'       => $timeslot->get_start(),
                        ], ['%d', '%d'] ) === false ) {
                            echo json_encode( [
                                'status'  => 0,
                                'message' => 'Internal database error.',
                            ] );
                            wp_die();
                            return;
                        }
                    }
                    $i++;
                }
                $curent_day = strtotime( 'tomorrow', $curent_day );
            }
        }
        if ( $lock_action == 'lock' ) {
            echo json_encode( [
                'status'  => 1,
                'message' => __( 'Total locked: ', 'webba-booking-lite' ) . $total_locked,
            ] );
        } else {
            echo json_encode( [
                'status'  => 1,
                'message' => __( 'Total unlocked: ', 'webba-booking-lite' ) . $total_locked,
            ] );
        }
        date_default_timezone_set( 'UTC' );
        wp_die();
        return;
    }

    public function wbk_report_error() {
        wp_die();
        return;
        $headers = 'From: ' . stripslashes( get_option( 'wbk_from_name' ) ) . ' <' . get_option( 'wbk_from_email' ) . '>' . "\r\n";
        $when_allowed = ['prepare_service_data'];
        $when = $_POST['when'];
        if ( !in_array( $when, $when_allowed ) ) {
            wp_die();
            return;
        }
        $post_details = $_POST['details'];
        if ( !is_array( $post_details ) || count( $post_details ) == 0 ) {
            wp_die();
            return;
        }
        $details = 'Request: ' . $when . '<br>Service: ' . $post_details[0];
        $solution = '<br>For more information on troubleshooting please read the following article: <a href="https://webba-booking.com/documentaion/troubleshooting/hanging-after-service-selected/">Hanging when service selected</a>.';
        add_filter( 'wp_mail_content_type', [$this, 'set_email_content_type'] );
        wp_mail(
            get_bloginfo( 'admin_email' ),
            'Problem with the Webba Booking plugin',
            'The Webba Booking plugin could not complete the request. <br><br>Details:<br> ' . $details . '<br>' . $solution,
            $headers
        );
        remove_filter( 'wp_mail_content_type', [$this, 'set_email_content_type'] );
    }

    public function set_email_content_type() {
        return 'text/html';
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
        $bookings_ids = WBK_Model_Utils::get_bookings_by_customer_email( $current_user->user_email, !isset( $request['pastBookings'] ) && $request['pastBookings'] !== true );
        $bookings = [];
        foreach ( $bookings_ids as $booking_id ) {
            $booking_data = WBK_Model_Utils::get_booking_data( $booking_id );
            if ( $booking_data !== false ) {
                $bookings[] = $booking_data;
            }
        }
        $data = [
            'bookings' => $bookings,
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
            'description' => $error_message,
        ];
        $response = new \WP_REST_Response($data);
        $response->set_status( 400 );
        return $response;
    }

    public function get_time_slots_permission( $request ) {
        return is_user_logged_in();
    }

    public function get_time_slots( $request ) {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        $day = explode( '00:00:00', $request['date'] );
        $day = $day[0];
        if ( !WBK_Validator::is_date( $day ) ) {
            return $this->response_error( 'Wrong date.' );
        }
        date_default_timezone_set( 'UTC' );
        $day = date( 'd-m-Y', strtotime( $day ) - $request['offset'] * 60 );
        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        $day = strtotime( $day . ' 00:00:00' );
        $services = [];
        if ( isset( $request['services'] ) && $request['services'] != '' ) {
            $services = explode( ',', $request['services'] );
        }
        if ( isset( $request['booking'] ) ) {
            if ( ctype_digit( $request['booking'] ) ) {
                $booking = new WBK_Booking($request['booking']);
                if ( $booking->is_loaded() ) {
                    $services = [$booking->get_service()];
                }
            }
        }
        if ( count( $services ) == 0 ) {
            return $this->response_error( 'No valid services found.' );
        }
        foreach ( $services as $service_id ) {
            if ( !WBK_Validator::is_service_exists( $service_id ) ) {
                return $this->response_error( 'Wrong service ID.' );
            }
            $sp = new WBK_Schedule_Processor();
            $timeslots = $sp->get_time_slots_by_day( $day, $service_id, [
                'skip_gg_calendar'       => false,
                'ignore_preparation'     => false,
                'calculate_availability' => true,
                'filter_availability'    => false,
            ] );
            if ( $booking->is_loaded() ) {
                $filtered = array_values( array_filter( $timeslots, fn( $obj ) => $obj->get_free_places() >= $booking->get_quantity() ) );
            } else {
                $filtered = $timeslots;
            }
        }
        return new \WP_REST_Response([
            'status'    => 'success',
            'timeslots' => $filtered,
        ], 200);
    }

    public function update_booking_permission( $request ) {
        if ( !isset( $request['booking'] ) || !ctype_digit( $request['booking'] ) ) {
            return false;
        }
        if ( current_user_can( 'manage_options' ) ) {
            return true;
        }
        return WBK_Validator::is_booking_made_by_current_user( $request['booking'] );
    }

    public function update_booking( $request ) {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        if ( !isset( $request['booking'] ) || !ctype_digit( $request['booking'] ) ) {
            return $this->response_error( 'Wrong booking passed.' );
        }
        if ( !ctype_digit( $request['time'] ) ) {
            return $this->response_error( 'Wrong time.' );
        }
        $time = intval( $request['time'] );
        if ( $time < time() ) {
            return $this->response_error( 'Wrong time.' );
        }
        $booking = new WBK_Booking($request['booking']);
        if ( $booking->is_loaded() ) {
            date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
            $booking->set( 'time', $time );
            $booking->set( 'day', strtotime( 'midnight', $time ) );
            date_default_timezone_set( 'UTC' );
            $booking->save();
            $bf = new WBK_Booking_Factory();
            $bf->update( $booking->get_id() );
            $data = [
                'booking' => WBK_Model_Utils::get_booking_data( $request['booking'] ),
            ];
            $response = new \WP_REST_Response($data, 200);
            $response->set_status( 200 );
            return $response;
        }
        return $this->response_error( 'Something went wrong.' );
    }

    public function delete_booking_permission( $request ) {
        if ( !isset( $request['booking'] ) || !ctype_digit( $request['booking'] ) ) {
            return false;
        }
        if ( current_user_can( 'manage_options' ) ) {
            return true;
        }
        return WBK_Validator::is_booking_made_by_current_user( $request['booking'] );
    }

    public function delete_booking( $request ) {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        if ( !isset( $request['booking'] ) || !ctype_digit( $request['booking'] ) ) {
            return $this->response_error( 'Wrong booking passed.' );
        }
        $booking = new WBK_Booking($request['booking']);
        if ( !$booking->is_loaded() ) {
            return $this->response_error( 'Wrong booking passed.' );
        }
        $buffer = get_option( 'wbk_cancellation_buffer', '' );
        if ( $buffer != '' ) {
            if ( intval( $buffer ) > 0 ) {
                $buffer_point = intval( $booking->get_start() - intval( $buffer ) * 60 );
                if ( time() > $buffer_point ) {
                    return $this->response_error( __( 'This booking isn\'t eligible for cancellation.', 'webba-booking-lite' ) );
                }
            }
        }
        $bf = new WBK_Booking_Factory();
        if ( $bf->destroy( $request['booking'], 'customer' ) == false ) {
            return $this->response_error( 'Something went wrong.' );
        }
        return new \WP_REST_Response([
            'status' => 'success',
        ], 200);
    }

    public function get_preset( $request ) {
        WBK_Mixpanel::track_event( 'v51 react app: get preset', [] );
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        $services = WBK_Model_Utils::get_services();
        $services_arr = [];
        foreach ( $services as $id => $name ) {
            $service = new WBK_Service($id);
            if ( !$service->is_loaded() ) {
                continue;
            }
            $has_description = true;
            if ( strip_tags( $service->get_description() ) == '' ) {
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
            $name = WBK_Translation_Processor::translate_string( 'webba_service_' . $id, $name );
            $description = WBK_Translation_Processor::translate_string( 'webba_service_description_' . $id, $service->get_description() );
            $service_data = [
                'id'                    => $id,
                'value'                 => $id,
                'label'                 => $name,
                'payable'               => $service->is_payable(),
                'description'           => $description,
                'has_description'       => $has_description,
                'business_days'         => $business_days,
                'duration'              => $service->get_duration(),
                'image'                 => ( !empty( $service->get( 'image' ) ) && $service->get( 'image' ) ? wp_get_attachment_url( $service->get( 'image' ) ) : false ),
                'price'                 => $service->get( 'price' ),
                'min_quantity'          => $service->get_min_quantity(),
                'max_quantity'          => $service->get_max_quantity(),
                'min_slots'             => $service->get( 'multi_mode_low_limit' ),
                'max_slots'             => $service->get( 'multi_mode_limit' ),
                'consecutive_timeslots' => $service->get( 'consecutive_timeslots' ) === 'yes',
                'group_booking'         => $service->get( 'group_booking' ) === 'yes',
                'limited_timeslot'      => $service->get( 'limited_timeslot' ) === 'yes',
                'hide_price'            => $service->get_hide_price(),
            ];
            $services_arr[] = $service_data;
        }
        $service_categories = WBK_Model_Utils::get_service_categories();
        if ( $service_categories === null ) {
            $service_categories = [];
        }
        $categories_arr = [];
        foreach ( $service_categories as $id => $name ) {
            $name = WBK_Translation_Processor::translate_string( 'webba_service_category_' . $id, $name );
            $category_data = [
                'id'       => $id,
                'name'     => $name,
                'services' => WBK_Model_Utils::get_services_in_category( $id ),
            ];
            if ( $category_data['services'] == false ) {
                $category_data['services'] = [];
            }
            $categories_arr[] = $category_data;
        }
        $user = false;
        if ( is_user_logged_in() ) {
            $current_user = wp_get_current_user();
            $user = $current_user->user_login;
            $current_user_email = $current_user->user_email;
        }
        $coupons_enabled = get_option( 'wbk_allow_coupons', 'yes' ) === 'enabled';
        if ( !WBK_Feature_Gate::have_required_plan( 'premium' ) ) {
            $coupons_enabled = false;
        }
        $data = [
            'services'           => $services_arr,
            'categories'         => $categories_arr,
            'plugin_url'         => WP_WEBBA_BOOKING__PLUGIN_URL,
            'site_url'           => get_site_url(),
            'admin_url'          => admin_url(),
            'plan_map'           => WBK_Feature_Gate::get_plan_map(),
            'multiservice'       => WBK_Feature_Gate::have_required_plan( 'start', 'only_old_users' ),
            'settings'           => [
                'narrow_form'                        => get_option( 'wbk_form_layout', 'yes' ) !== 'yes',
                'week_start'                         => WBK_Date_Time_Utils::getStartOfWeek(),
                'time_format'                        => WBK_Date_Time_Utils::get_time_format(),
                'date_format'                        => WBK_Date_Time_Utils::get_date_format(),
                'timezone'                           => get_option( 'wbk_timezone', 'UTC' ),
                'locale'                             => get_locale(),
                'custom_fields'                      => WBK_Model_Utils::get_custom_fields_list(),
                'is_admin'                           => current_user_can( 'manage_options' ),
                'price_format'                       => WBK_Format_Utils::get_price_format(),
                'price_fractional'                   => get_option( 'wbk_price_fractional', '2' ),
                'price_separator'                    => get_option( 'wbk_price_separator', '.' ),
                'stripe_publishable_key'             => WBK_Options_Utils::get_stripe_credentials()[0] ?? null,
                'show_booked_slots'                  => get_option( 'wbk_show_booked_slots', '' ) === 'enabled',
                'allowed_multiple_service_selection' => get_option( 'wbk_allow_multiple_services', 'yes' ) === 'yes',
                'coupons_enabled'                    => $coupons_enabled,
                'tax'                                => WBK_Options_Utils::get_tax(),
                'stripe_redirect_url'                => WBK_Options_Utils::get_stripe_redirect_url(),
                'stripe_fields'                      => get_option( 'wbk_stripe_additional_fields', [] ),
                'timezone_picker_enabled'            => get_option( 'wbk_enable_timezone_picker', 'yes' ) === 'yes',
                'show_post_booking_instructions'     => get_option( 'wbk_enable_booking_instructions', 'yes' ) === 'yes',
                'admin_email'                        => get_option( 'wbk_super_admin_email', get_option( 'admin_email' ) ),
            ],
            'wording'            => [
                'service_label'                           => get_option( 'wbk_service_label', __( 'Select a service', 'webba-booking-lite' ) ),
                'category_label'                          => get_option( 'wbk_category_label', __( 'Select category', 'webba-booking-lite' ) ),
                'date_label'                              => get_option( 'wbk_date_basic_label', __( 'Book an appointment on', 'webba-booking-lite' ) ),
                'date_placeholder'                        => get_option( 'wbk_date_input_placeholder', __( 'date', 'webba-booking-lite' ) ),
                'cancel'                                  => get_option( 'wbk_user_dashboard_link_text_cancel', __( 'Cancel booking', 'webba-booking-lite' ) ),
                'confirm_cancel'                          => get_option( 'wbk_user_dashboard_link_text_confirm_cancellation', __( 'Confirm cancellation', 'webba-booking-lite' ) ),
                'bookings'                                => get_option( 'wbk_user_dashboard_section_bookings_label', __( 'My Bookings', 'webba-booking-lite' ) ),
                'booking_history'                         => get_option( 'wbk_user_dashboard_section_past_bookings_label', __( 'History', 'webba-booking-lite' ) ),
                'reschedule'                              => get_option( 'wbk_user_dashboard_link_text_reschedule', __( 'Reschedule', 'webba-booking-lite' ) ),
                'loading'                                 => get_option( 'wbk_user_dashboard_please_wait_state', __( 'Please wait...', 'webba-booking-lite' ) ),
                'total_amount'                            => get_option( 'wbk_total_amount_label', __( 'Total amount', 'webba-booking-lite' ) ),
                'tax'                                     => get_option( 'wbk_tax_label', __( 'Tax', 'webba-booking-lite' ) ),
                'discount'                                => get_option( 'wbk_payment_discount_item', __( 'Discount (-)', 'webba-booking-lite' ) ),
                'after_booking_instructions'              => get_option( 'wbk_after_booking_instructions', '<h4>Important Information</h4><ul><li>Please arrive 10 minutes before your scheduled appointment time</li><li>Cancellations must be made at least 24 hours in advance</li><li>Bring valid ID for verification at check-in</li></ul>' ),
                'label_login_user'                        => get_option( 'wbk_wording_label_login_user', __( 'Username or Email Address', 'webba-booking-lite' ) ),
                'label_login_password'                    => get_option( 'wbk_wording_label_login_password', __( 'Password', 'webba-booking-lite' ) ),
                'label_login_button'                      => get_option( 'wbk_wording_label_login_button', __( 'Login', 'webba-booking-lite' ) ),
                'no_booking'                              => get_option( 'wbk_user_dashboard_no_bookings_available', __( 'No bookings available', 'webba-booking-lite' ) ),
                'label_login_title'                       => get_option( 'wbk_user_dashboard_login_title', __( 'Login to your booking manager', 'webba-booking-lite' ) ),
                'help_title'                              => get_option( 'wbk_sidebar_help_title', __( 'Need help?', 'webba-booking-lite' ) ),
                'help_phone'                              => get_option( 'wbk_sidebar_help_phone', '' ),
                'help_email'                              => get_option( 'wbk_sidebar_help_email', '' ),
                'summary'                                 => get_option( 'wbk_wording_summary', __( 'Summary', 'webba-booking-lite' ) ),
                'select_services'                         => get_option( 'wbk_wording_select_services', __( 'Select service(s)', 'webba-booking-lite' ) ),
                'choose_service_proceed'                  => get_option( 'wbk_wording_choose_service_proceed', __( 'Choose a service to proceed', 'webba-booking-lite' ) ),
                'select_date_time_services'               => get_option( 'wbk_wording_select_date_time_services', __( 'Select date & time for services', 'webba-booking-lite' ) ),
                'choose_preferred_appointment_slot'       => get_option( 'wbk_wording_choose_preferred_appointment_slot', __( 'Choose your preferred appointment slot', 'webba-booking-lite' ) ),
                'personal_details'                        => get_option( 'wbk_wording_personal_details', __( 'Personal details', 'webba-booking-lite' ) ),
                'fill_contact_information'                => get_option( 'wbk_wording_fill_contact_information', __( 'Please fill in your contact information', 'webba-booking-lite' ) ),
                'payment_method'                          => get_option( 'wbk_payment_methods_title', __( 'Payment method', 'webba-booking-lite' ) ),
                'select_preferred_payment_method'         => get_option( 'wbk_wording_select_preferred_payment_method', __( 'Select your preferred payment method', 'webba-booking-lite' ) ),
                'back'                                    => get_option( 'wbk_back_button_text', __( 'Back', 'webba-booking-lite' ) ),
                'continue'                                => get_option( 'wbk_next_button_text', __( 'Continue', 'webba-booking-lite' ) ),
                'submit'                                  => get_option( 'wbk_wording_submit', __( 'Submit', 'webba-booking-lite' ) ),
                'appointment_confirmed'                   => get_option( 'wbk_wording_appointment_confirmed', __( 'Thank you for your booking!', 'webba-booking-lite' ) ),
                'look_forward_seeing_you'                 => get_option( 'wbk_wording_look_forward_seeing_you', __( 'We look forward to seeing you.', 'webba-booking-lite' ) ),
                'payment_information'                     => get_option( 'wbk_wording_payment_information', __( 'Payment Information', 'webba-booking-lite' ) ),
                'add_to_calendar'                         => get_option( 'wbk_wording_add_to_calendar', __( '+ Add to Calendar', 'webba-booking-lite' ) ),
                'cost_breakdown'                          => get_option( 'wbk_wording_cost_breakdown', __( 'Cost Breakdown', 'webba-booking-lite' ) ),
                'total_amount_paid'                       => get_option( 'wbk_wording_total_amount_paid', __( 'Total amount', 'webba-booking-lite' ) ),
                'booking_success'                         => get_option( 'wbk_wording_booking_success', __( 'Booking success', 'webba-booking-lite' ) ),
                'loading_payment_form'                    => get_option( 'wbk_wording_loading_payment_form', __( 'Loading payment form...', 'webba-booking-lite' ) ),
                'processing'                              => get_option( 'wbk_wording_processing', __( 'Processing...', 'webba-booking-lite' ) ),
                'pay'                                     => get_option( 'wbk_wording_pay', __( 'Pay', 'webba-booking-lite' ) ),
                'pay_with'                                => get_option( 'wbk_wording_pay_with', __( 'Pay with', 'webba-booking-lite' ) ),
                'payment'                                 => get_option( 'wbk_payment_step_title', __( 'Payment', 'webba-booking-lite' ) ),
                'please_complete_payment_confirm_booking' => get_option( 'wbk_wording_please_complete_payment_confirm_booking', __( 'Please complete your payment to confirm your booking.', 'webba-booking-lite' ) ),
                'payment_successful'                      => get_option( 'wbk_wording_payment_successful', __( 'Payment successful', 'webba-booking-lite' ) ),
                'thank_you_payment'                       => get_option( 'wbk_wording_thank_you_payment', __( 'Thank you for your payment.', 'webba-booking-lite' ) ),
                'total_amount_due'                        => get_option( 'wbk_wording_total_amount_due', __( 'Total amount due', 'webba-booking-lite' ) ),
                'loading_booking_details'                 => get_option( 'wbk_wording_loading_booking_details', __( 'Loading booking details...', 'webba-booking-lite' ) ),
                'complete_your_payment'                   => get_option( 'wbk_wording_complete_your_payment', __( 'Complete Your Payment', 'webba-booking-lite' ) ),
                'select_payment_method_complete_payment'  => get_option( 'wbk_wording_select_payment_method_complete_payment', __( 'Please select a payment method and complete your payment to confirm your booking.', 'webba-booking-lite' ) ),
                'appointment_approved'                    => get_option( 'wbk_wording_appointment_approved', __( 'Appointment Approved', 'webba-booking-lite' ) ),
                'appointment_approved_message'            => get_option( 'wbk_wording_appointment_approved_message', __( 'You have approved this appointment. The customer has been notified.', 'webba-booking-lite' ) ),
                'appointment_cancelled'                   => get_option( 'wbk_wording_appointment_cancelled', __( 'Appointment Cancelled', 'webba-booking-lite' ) ),
                'appointment_cancelled_admin_message'     => get_option( 'wbk_wording_appointment_cancelled_admin_message', __( 'You have cancelled this appointment. The customer has been notified of the cancellation.', 'webba-booking-lite' ) ),
                'appointment_cancelled_customer_message'  => get_option( 'wbk_wording_appointment_cancelled_customer_message', __( 'You have cancelled your appointment. We hope to see you again soon.', 'webba-booking-lite' ) ),
                'booking_approved'                        => get_option( 'wbk_wording_booking_approved', __( 'Booking approved', 'webba-booking-lite' ) ),
                'booking_cancelled'                       => get_option( 'wbk_wording_booking_cancelled', __( 'Booking cancelled', 'webba-booking-lite' ) ),
                'approve_appointment'                     => get_option( 'wbk_wording_approve_appointment', __( 'Approve Appointment', 'webba-booking-lite' ) ),
                'cancel_appointment'                      => get_option( 'wbk_cancel_button_text', __( 'Cancel Booking', 'webba-booking-lite' ) ),
                'bank_transfer_message'                   => __( get_option( 'wbk_bank_transfer_message', 'Pay by bank transfer' ), 'webba-booking-lite' ),
                'pay_on_arrival_message'                  => __( get_option( 'wbk_pay_on_arrival_message', 'Pay on arrival' ), 'webba-booking-lite' ),
                'paypal_message'                          => __( get_option( 'wbk_paypal_message', 'You will be redirected to PayPal in the next screen.' ), 'webba-booking-lite' ),
                'woocommerce_message'                     => __( get_option( 'wbk_woo_message', 'You will be able to checkout in the next screen.' ), 'webba-booking-lite' ),
                'show_more'                               => get_option( 'wbk_wording_show_more', __( 'Show more', 'webba-booking-lite' ) ),
                'show_less'                               => get_option( 'wbk_wording_show_less', __( 'Show less', 'webba-booking-lite' ) ),
                'toggle_description'                      => get_option( 'wbk_wording_toggle_description', __( 'Toggle description', 'webba-booking-lite' ) ),
                'for_group_bookings_only'                 => get_option( 'wbk_wording_for_group_bookings_only', __( 'For group bookings only:', 'webba-booking-lite' ) ),
                'number_of_people'                        => get_option( 'wbk_wording_number_of_people', __( 'Number of people:', 'webba-booking-lite' ) ),
                'reduce_item'                             => get_option( 'wbk_wording_reduce_item', __( 'Reduce item', 'webba-booking-lite' ) ),
                'increase_item'                           => get_option( 'wbk_wording_increase_item', __( 'Increase item', 'webba-booking-lite' ) ),
                'no_time_selected'                        => get_option( 'wbk_wording_no_time_selected', __( 'No time selected', 'webba-booking-lite' ) ),
                'remove_item'                             => get_option( 'wbk_wording_remove_item', __( 'Remove item', 'webba-booking-lite' ) ),
                'empty_summary'                           => get_option( 'wbk_wording_empty_summary', __( 'Please select a service and slot to see a summary here.', 'webba-booking-lite' ) ),
                'phone'                                   => get_option( 'wbk_phone_label', __( 'Phone', 'webba-booking-lite' ) ),
                'email'                                   => get_option( 'wbk_email_label', __( 'Email', 'webba-booking-lite' ) ),
                'no_services_found'                       => get_option( 'wbk_wording_no_services_found', __( 'No services found!', 'webba-booking-lite' ) ),
                'show_summary'                            => get_option( 'wbk_wording_show_summary', __( 'Show summary', 'webba-booking-lite' ) ),
                'total'                                   => get_option( 'wbk_payment_total_title', __( 'Total', 'webba-booking-lite' ) ),
                'free'                                    => get_option( 'wbk_wording_free', __( 'Free', 'webba-booking-lite' ) ),
                'select_date_time'                        => get_option( 'wbk_wording_select_date_time', __( 'Select date & time', 'webba-booking-lite' ) ),
                'choosing_timeslot_for'                   => get_option( 'wbk_wording_choosing_timeslot_for', __( 'Choosing time slot for', 'webbab-booking-lite' ) ),
                'available'                               => get_option( 'wbk_wording_available', __( 'Available', 'webba-booking-lite' ) ),
                'booked'                                  => get_option( 'wbk_wording_booked', __( 'Booked', 'webba-booking-lite' ) ),
                'today'                                   => get_option( 'wbk_wording_today', __( 'Today', 'webba-booking-lite' ) ),
                'add_more'                                => get_option( 'wbk_wording_add_more', __( 'Add more', 'webba-booking-lite' ) ),
                'slots'                                   => get_option( 'wbk_wording_slots', __( 'slots', 'webba-booking-lite' ) ),
                'enter_coupon_code'                       => get_option( 'wbk_wording_enter_coupon_code', __( 'Enter coupon code', 'webba-booking-lite' ) ),
                'apply'                                   => get_option( 'wbk_wording_apply', __( 'Apply', 'webba-booking-lite' ) ),
                'please_select_service'                   => get_option( 'wbk_wording_please_select_service', __( 'Please select at least one service.', 'webba-booking-lite' ) ),
                'please_select_timeslot'                  => get_option( 'wbk_wording_please_select_timeslot', __( 'Please select a time slot for each selected service.', 'webba-booking-lite' ) ),
                'please_fill_out_all_fields'              => get_option( 'wbk_wording_please_fill_out_all_fields', __( 'Please fill out all required fields.', 'webba-booking-lite' ) ),
                'please_select_payment_method'            => get_option( 'wbk_wording_please_select_payment_method', __( 'Please select a payment method.', 'webba-booking-lite' ) ),
                'please_fill_out_payment_form'            => get_option( 'wbk_wording_please_fill_out_payment_form', __( 'Please fill out payment form.', 'webba-booking-lite' ) ),
                'duration'                                => get_option( 'wbk_wording_duration', __( 'Duration', 'webba-booking-lite' ) ),
                'tax_included'                            => get_option( 'wbk_wording_tax_included', __( 'Tax incl.', 'webba-booking-lite' ) ),
                'select'                                  => get_option( 'wbk_wording_select', __( '+ Select', 'webba-booking-lite' ) ),
                'selected'                                => get_option( 'wbk_wording_selected', __( 'Selected', 'webba-booking-lite' ) ),
                'no_available_timeslots'                  => get_option( 'wbk_wording_no_available_timeslots', __( 'No available time slots', 'webba-booking-lite' ) ),
                'hour'                                    => get_option( 'wbk_wording_hour', __( 'h', 'webba-booking-lite' ) ),
                'minute'                                  => get_option( 'wbk_wording_minute', __( 'min', 'webba-booking-lite' ) ),
                'this_field_is_required'                  => get_option( 'wbk_wording_this_field_is_required', __( 'This field is required', 'webba-booking-lite' ) ),
                'the_entered_email_is_invalid'            => get_option( 'wbk_wording_the_entered_email_is_invalid', __( 'The entered email is invalid', 'webba-booking-lite' ) ),
                'please_enter_a_valid_phone_number'       => get_option( 'wbk_wording_please_enter_a_valid_phone_number', __( 'Please enter a valid phone number', 'webba-booking-lite' ) ),
                'the_entered_number_is_invalid'           => get_option( 'wbk_wording_the_entered_number_is_invalid', __( 'The entered number is invalid', 'webba-booking-lite' ) ),
                'plan_required_message'                   => WBK_Feature_Gate::get_plan_limit_message( '', false ),
                'no_bookings_found'                       => get_option( 'wbk_wording_no_bookings_found', __( 'No bookings found for the provided token', 'webba-booking-lite' ) ),
                'service_fees'                            => get_option( 'wbk_wording_service_fees', __( 'Service Fees', 'webba-booking-lite' ) ),
                'full_price'                              => get_option( 'wbk_wording_full_price', __( 'Full price', 'webba-booking-lite' ) ),
                'pay_now'                                 => get_option( 'wbk_wording_pay_now', __( 'Pay now', 'webba-booking-lite' ) ),
                'left_to_pay'                             => get_option( 'wbk_wording_left_to_pay', __( 'Left to pay', 'webba-booking-lite' ) ),
                'show_details'                            => get_option( 'wbk_wording_show_details', __( 'Show details', 'webba-booking-lite' ) ),
                'hide_details'                            => get_option( 'wbk_wording_hide_details', __( 'Hide details', 'webba-booking-lite' ) ),
            ],
            'appearance'         => WBK_Model_Utils::get_appearance_data(),
            'appearance_options' => get_option( 'wbk_appearance_options', [] ),
            'user'               => $user,
            'current_user_email' => $current_user_email,
            'is_logged_in'       => is_user_logged_in(),
            'user_data'          => [
                'first_name' => ( isset( $current_user ) ? $current_user->user_firstname : '' ),
                'last_name'  => ( isset( $current_user ) ? $current_user->user_lastname : '' ),
                'email'      => $current_user_email,
                'phone'      => ( isset( $current_user ) ? get_user_meta( $current_user->ID, 'billing_phone', true ) : '' ),
            ],
            'current_user_id'    => get_current_user_id(),
        ];
        $response = new \WP_REST_Response($data);
        $response->set_status( 200 );
        return $response;
    }

    public function get_field_options_permission() : bool {
        if ( current_user_can( 'manage_options' ) ) {
            return true;
        }
        return WBK_User_Utils::check_access_to_service();
    }

    public function get_field_options( WP_REST_Request $request ) {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        WBK_Mixpanel::track_event( 'v51 react app: get field options', [] );
        $data = [];
        $params = $request->get_params();
        $model = ( isset( $params['model'] ) ? sanitize_text_field( $params['model'] ) : '' );
        $field = ( isset( $params['field'] ) ? sanitize_text_field( $params['field'] ) : '' );
        $form = ( isset( $params['form'] ) ? array_map( 'sanitize_text_field', $params['form'] ) : '' );
        if ( $model === 'services' ) {
            switch ( $field ) {
                case 'form':
                    $data[$model][$field] = WBK_Model_Utils::get_cf7_forms();
                    break;
                case 'users':
                    $data[$model][$field] = WBK_User_Utils::get_none_admin_wp_users();
                    break;
                case 'payment_methods':
                    $data[$model][$field] = WBK_Model_Utils::get_available_payment_methods();
                    break;
                case 'google_meet_calendar':
                    // Get all configured Google calendar accounts
                    global $wpdb;
                    $google_calendars_table = get_option( 'wbk_db_prefix', '' ) . 'wbk_gg_calendars';
                    $query = $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( $google_calendars_table ) );
                    $calendars_list = [];
                    if ( $wpdb->get_var( $query ) == $google_calendars_table ) {
                        $sql = 'SELECT id, name FROM ' . $google_calendars_table;
                        $google_accounts = $wpdb->get_results( $sql, ARRAY_A );
                        foreach ( $google_accounts as $account ) {
                            $account_id = $account['id'];
                            $account_name = $account['name'];
                            // Get calendars within this Google account
                            $calendars = WBK_Google::get_google_calendars_in_account( $account_id );
                            if ( is_array( $calendars ) && !empty( $calendars ) ) {
                                foreach ( $calendars as $calendar_id => $calendar_name ) {
                                    // Format: account_id:calendar_id => account_name - calendar_name
                                    $key = $account_id . ':' . $calendar_id;
                                    $label = $account_name . ' - ' . $calendar_name;
                                    $calendars_list[$key] = $label;
                                }
                            }
                        }
                    }
                    if ( empty( $calendars_list ) ) {
                        $calendars_list['plugion_null'] = __( 'No Google calendars available', 'webba-booking-lite' );
                    }
                    $data[$model][$field] = $calendars_list;
                    break;
                case 'woo_product':
                    $data[$model][$field] = WBK_Model_Utils::get_woocommerce_products();
            }
        } elseif ( $model === 'appointments' && ($field === 'service_id' || $field === 'day' || $field === 'time') && $form['service_id'] && $form['day'] ) {
            $sp = new WBK_Schedule_Processor();
            date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
            $day = strtotime( $form['day'] );
            $timeslots = $sp->get_time_slots_by_day(
                $day,
                $form['service_id'] ?? 0,
                [
                    'skip_gg_calendar'       => false,
                    'ignore_preparation'     => true,
                    'calculate_availability' => true,
                    'calculate_night_hours'  => false,
                    'filter_availability'    => false,
                ],
                $form['id'] ?? null
            );
            foreach ( $timeslots as $slot ) {
                $data[$model]['time'][$slot->start] = sprintf( '%s (%d available)', $slot->formated_time, $slot->free_places );
                for ($place = 1; $place <= $slot->free_places && $form['time'] == $slot->start; $place++) {
                    $data[$model]['quantity'][$place] = sprintf( '%d', $place );
                }
            }
            if ( empty( $data[$model]['time'] ) ) {
                $data[$model]['time'] = [
                    'plugion_null' => __( 'No time slots available', 'webba-booking-lite' ),
                ];
            }
        } elseif ( $model === 'gg_calendars' ) {
            switch ( $field ) {
                case 'user_id':
                    $data[$model][$field] = WBK_User_Utils::get_none_admin_wp_users();
                    break;
                case 'ggid':
                    $calendar_id = ( isset( $form['id'] ) ? sanitize_text_field( $form['id'] ) : '' );
                    if ( $calendar_id ) {
                        $data[$model][$field] = WBK_Google::get_google_calendars_in_account( $calendar_id );
                    } else {
                        $data[$model][$field] = [];
                    }
                    break;
                default:
                    break;
            }
        } elseif ( $model === 'email_templates' ) {
            switch ( $field ) {
                case 'type':
                    $notification_types = WBK_Model_Utils::get_notification_types();
                    $data[$model][$field] = $notification_types;
                default:
                    break;
            }
        } elseif ( $model === 'settings' ) {
            switch ( $field ) {
                case 'wbk_email_landing_new':
                case 'wbk_user_dashboard_page_link_new':
                case 'wbk_stripe_redirect_url_new':
                case 'wbk_paypal_redirect_url_new':
                    $pages = get_pages();
                    $pages_array = [];
                    foreach ( $pages as $page ) {
                        $pages_array[$page->ID] = $page->post_title;
                    }
                    $data[$model][$field] = $pages_array;
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
        return current_user_can( 'read' );
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
        $calendar_id = ( isset( $params['calendar_id'] ) ? sanitize_text_field( $params['calendar_id'] ) : '' );
        if ( !$calendar_id ) {
            $data['isAuthenticated'] = false;
            $response = new \WP_REST_Response($data);
            $response->set_status( 200 );
            return $response;
        }
        $google_calendar = new WBK_Google_Calendar($calendar_id);
        $easy_auth = $google_calendar->get( 'easy_auth' );
        if ( $easy_auth == 'yes' ) {
            $webba_connect = new WBK_Webba_Connect();
            $access_token = $webba_connect->get_google_access_token( $calendar_id );
            if ( $access_token === false ) {
                $data['isAuthenticated'] = false;
                $data['connectionStatus'] = [
                    'authUrl' => $webba_connect->get_google_authorization_url( $calendar_id ),
                ];
            } else {
                $data['isAuthenticated'] = true;
                $revoke_url = $webba_connect->get_google_revoke_url( $calendar_id );
                $data['connectionStatus'] = [
                    'revokeUrl' => $revoke_url,
                ];
            }
        } else {
            $credentials = [get_option( 'wbk_gg_clientid', '' ), get_option( 'wbk_gg_secret', '' )];
            $credentials = apply_filters( 'wbk_gg_credentials', $credentials );
            if ( $credentials[0] == '' || $credentials[1] == '' ) {
                $data['isAuthenticated'] = false;
                $data['connectionStatus'] = [2, 'credentials are not set'];
            } else {
                $calendars = WBK_Google::get_google_calendars_in_account( $calendar_id );
                if ( is_array( $calendars ) ) {
                    $data['isAuthenticated'] = true;
                    $data['connectionStatus'] = [1, 'authorized'];
                } else {
                    $data['isAuthenticated'] = false;
                    $data['connectionStatus'] = [2, 'calendar not authorized'];
                }
            }
        }
        if ( $data['isAuthenticated'] == true ) {
            $google = new WBK_Google();
            $google->init( $calendar_id );
            $data['calendars'] = $google->get_all_calendars();
        }
        $response = new \WP_REST_Response($data);
        $response->set_status( 200 );
        return $response;
    }

    public function resend_email_permission( $request ) : bool {
        if ( current_user_can( 'manage_options' ) ) {
            return true;
        }
        if ( isset( $request['id'] ) && is_numeric( $request['id'] ) ) {
            $booking = new WBK_Booking($request['id']);
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
        return current_user_can( 'manage_options' );
    }

    /**
     * Get cell detail
     *
     * @param array $request
     * @return WP_REST_Response
     */
    public function get_cell_detail( $request ) : WP_REST_Response {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        $model = ( isset( $request['model'] ) ? sanitize_text_field( $request['model'] ) : '' );
        $data = [];
        switch ( $model ) {
            case 'services':
                $data['forms'] = WBK_Model_Utils::get_cf7_forms();
                break;
            default:
                break;
        }
        $response = new \WP_REST_Response($data);
        $response->set_status( 200 );
        return $response;
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
            date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
            $service_id = $request->get_param( 'service_id' );
            $start_date = $request->get_param( 'start_date' );
            $end_date = $request->get_param( 'end_date' );
            if ( !is_numeric( $service_id ) ) {
                return new WP_REST_Response([
                    'error' => 'Invalid service ID',
                ], 400);
            }
            $service = new WBK_Service($service_id);
            if ( !$service->is_loaded() ) {
                return new WP_REST_Response([
                    'error' => 'Service not found',
                ], 404);
            }
            $start_timestamp = strtotime( $start_date ?? '1970-01-01' );
            $end_timestamp = strtotime( $end_date ?? '1970-01-01' );
            if ( $start_timestamp === false || $end_timestamp === false ) {
                return new WP_REST_Response([
                    'error' => 'Invalid date format',
                ], 400);
            }
            if ( $start_timestamp > $end_timestamp ) {
                return new WP_REST_Response([
                    'error' => 'Start date must be before end date',
                ], 400);
            }
            $days_difference = ceil( ($end_timestamp - $start_timestamp) / 86400 ) + 1;
            $available_dates = WBK_Model_Utils::get_service_availability_in_range( $service_id, $start_date, $days_difference );
            // Filter dates based on the date parts in the format YYYY,M,D
            $filtered_dates = array_filter( $available_dates, function ( $date ) use($start_timestamp, $end_timestamp) {
                $date_parts = explode( ',', $date );
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
            return new WP_REST_Response([
                'service_id' => $service_id,
                'start_date' => $start_date,
                'end_date'   => $end_date,
                'dates'      => array_values( $filtered_dates ),
            ], 200);
        } catch ( \Exception $e ) {
            return new WP_REST_Response([
                'error' => 'Internal server error',
            ], 500);
        } finally {
            date_default_timezone_set( 'UTC' );
        }
    }

    public function get_service_time_slots_permission( $request ) : bool {
        return true;
        // Public endpoint, no special permissions needed
    }

    public function get_service_time_slots( WP_REST_Request $request ) : WP_REST_Response {
        try {
            WBK_Translation_Processor::switch_to_locale_from_get_param();
            date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
            $service_id = $request->get_param( 'service_id' );
            $date = $request->get_param( 'date' );
            $offset = $request->get_param( 'offset' ) ?? 0;
            if ( !is_numeric( $service_id ) ) {
                return new WP_REST_Response([
                    'error' => 'Invalid service ID',
                ], 400);
            }
            $service = new WBK_Service($service_id);
            if ( !$service->is_loaded() ) {
                return new WP_REST_Response([
                    'error' => 'Service not found',
                ], 404);
            }
            if ( empty( $date ) ) {
                return new WP_REST_Response([
                    'error' => 'Date is required',
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
                    'error' => 'Invalid date format',
                ], 400);
            }
            $sp = new WBK_Schedule_Processor();
            $timeslots = $sp->get_time_slots_by_day( $day_to_render, $service_id, [
                'skip_gg_calendar'       => false,
                'ignore_preparation'     => false,
                'calculate_availability' => true,
                'filter_availability'    => false,
                'offset'                 => $offset,
            ] );
            if ( !is_array( $timeslots ) ) {
                $timeslots = [];
            }
            $formatted_slots = array_map( function ( $slot ) {
                return [
                    'start_time'           => $slot->get_start(),
                    'end_time'             => $slot->get_end(),
                    'free_places'          => $slot->get_free_places(),
                    'formatted_time'       => $slot->get_formated_time(),
                    'formatted_time_local' => $slot->get_formated_time_local(),
                ];
            }, $timeslots );
            return new WP_REST_Response([
                'service_id' => $service_id,
                'date'       => date( 'Y-m-d', $day_to_render ),
                'time_slots' => $formatted_slots,
            ], 200);
        } catch ( \Exception $e ) {
            return new WP_REST_Response([
                'error' => 'Internal server error',
            ], 500);
        } finally {
            date_default_timezone_set( 'UTC' );
        }
    }

    public function get_form_fields_permission( $request ) : bool {
        return true;
        // Public endpoint
    }

    public function get_form_fields( WP_REST_Request $request ) : WP_REST_Response {
        try {
            WBK_Translation_Processor::switch_to_locale_from_get_param();
            $service_ids = $request->get_param( 'ids' );
            // Validate service IDs
            if ( !is_array( $service_ids ) || empty( $service_ids ) ) {
                return new WP_REST_Response([
                    'success' => false,
                    'message' => 'Service IDs must be a non-empty array',
                ], 400);
            }
            // Validate each ID is a positive integer
            foreach ( $service_ids as $id ) {
                if ( !is_numeric( $id ) || $id <= 0 ) {
                    return new WP_REST_Response([
                        'success' => false,
                        'message' => 'Invalid service ID: ' . $id,
                    ], 400);
                }
            }
            global $wpdb;
            $db_prefix = $wpdb->prefix;
            $form = new WbkData\Model($db_prefix . 'wbk_forms');
            $all_fields = [];
            $found_forms = false;
            // Get fields for each service
            if ( !WBK_Feature_Gate::have_required_plan( 'standard' ) ) {
                $found_forms = true;
                $all_fields = WBK_Form_Builder_Utils::get_default_fields();
            } else {
                foreach ( $service_ids as $service_id ) {
                    // Get the service
                    $service = new WBK_Service($service_id);
                    if ( !$service->is_loaded() ) {
                        continue;
                    }
                    // Get the form ID from the service
                    $form_id = $service->get( 'form_builder' );
                    if ( !$form_id || $form_id == '0' ) {
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
                            // Only add the field if it has a slug and we haven't seen this slug before
                            if ( isset( $field['slug'] ) && !isset( $all_fields[$field['slug']] ) && isset( $field['placeholder'] ) ) {
                                $all_fields[$field['slug']] = $field;
                                $all_fields[$field['slug']]['placeholder'] = WBK_Translation_Processor::translate_string( 'webba_form_field_' . $form_id . '_' . $field['slug'], $field['placeholder'] );
                            } elseif ( isset( $field['slug'] ) && !isset( $all_fields[$field['slug']] ) && isset( $field['checkboxText'] ) ) {
                                $all_fields[$field['slug']] = $field;
                                $all_fields[$field['slug']]['checkboxText'] = WBK_Translation_Processor::translate_string( 'webba_form_field_' . $form_id . '_' . $field['slug'], $field['checkboxText'] );
                            } else {
                                $all_fields[$field['slug']] = $field;
                            }
                        }
                    }
                }
            }
            if ( !$found_forms ) {
                return new WP_REST_Response([
                    'success' => false,
                    'message' => 'No forms found',
                ], 404);
            }
            return new WP_REST_Response([
                'success' => true,
                'data'    => [
                    'service_ids' => $service_ids,
                    'form_fields' => array_values( $all_fields ),
                ],
            ], 200);
        } catch ( \Exception $e ) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Internal server error',
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
            $service_ids = $request->get_param( 'ids' );
            // Validate service IDs
            if ( !is_array( $service_ids ) || empty( $service_ids ) ) {
                return new WP_REST_Response([
                    'success' => false,
                    'message' => 'Service IDs must be a non-empty array',
                ], 400);
            }
            // Validate each ID is a positive integer
            foreach ( $service_ids as $id ) {
                if ( !is_numeric( $id ) || $id <= 0 ) {
                    return new WP_REST_Response([
                        'success' => false,
                        'message' => 'Invalid service ID: ' . $id,
                    ], 400);
                }
            }
            $payment_methods_result = [];
            $found_payment_methods = false;
            // Get payment methods for each service
            foreach ( $service_ids as $service_id ) {
                $service = new WBK_Service($service_id);
                if ( !$service->is_loaded() ) {
                    continue;
                }
                $payment_methods_service = json_decode( $service->get( 'payment_methods' ) );
                if ( !is_null( $payment_methods_service ) && is_array( $payment_methods_service ) ) {
                    if ( !$found_payment_methods ) {
                        $payment_methods_result = $payment_methods_service;
                        $found_payment_methods = true;
                    } else {
                        $payment_methods_result = array_intersect( $payment_methods_result, $payment_methods_service );
                    }
                }
            }
            $payment_methods_available = WBK_Model_Utils::get_available_payment_methods();
            // Filter to only include available payment methods
            $payment_methods_result = array_intersect( $payment_methods_result, array_keys( $payment_methods_available ) );
            if ( get_option( 'wbk_appointments_default_status', '' ) == 'pending' && get_option( 'wbk_appointments_allow_payments', '' ) == 'enabled' && WBK_Feature_Gate::have_required_plan( 'premium', 'only_old_users' ) ) {
                $payment_methods_result = array_diff( $payment_methods_result, ['paypal', 'stripe', 'woocommerce'] );
            }
            if ( empty( $payment_methods_result ) ) {
                return new WP_REST_Response([
                    'success' => false,
                    'message' => 'No payment methods found for one or multiple services',
                ], 404);
            }
            if ( !$found_payment_methods ) {
                return new WP_REST_Response([
                    'success' => false,
                    'message' => 'No payment methods found for one or multiple services',
                ], 404);
            }
            // Get all available payment methods to get their labels
            $payment_methods_all = WBK_Model_Utils::get_available_payment_methods();
            // Filter and format the response
            $payment_methods_formatted = [];
            foreach ( $payment_methods_result as $method ) {
                if ( isset( $payment_methods_all[$method] ) ) {
                    $payment_methods_formatted[] = [
                        'id'   => $method,
                        'name' => $payment_methods_all[$method],
                        'icon' => WP_WEBBA_BOOKING__PLUGIN_URL . '/public/images/payments/' . $method . '.svg',
                    ];
                }
            }
            return new WP_REST_Response([
                'success' => true,
                'data'    => [
                    'service_ids'     => $service_ids,
                    'payment_methods' => $payment_methods_formatted,
                ],
            ], 200);
        } catch ( \Exception $e ) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Internal server error',
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
        global $wpdb;
        $params = $request->get_body_params();
        $params['services'] = ( isset( $params['services'] ) ? json_decode( $params['services'], true ) : [] );
        $params['places'] = ( isset( $params['places'] ) ? json_decode( $params['places'], true ) : [] );
        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        // Validate required fields
        $required_fields = [
            'first_name',
            'email',
            'places',
            'services'
        ];
        foreach ( $required_fields as $field ) {
            if ( !isset( $params[$field] ) || empty( $params[$field] ) ) {
                return new WP_REST_Response([
                    'success' => false,
                    'message' => "Missing required field: {$field}",
                ], 400);
            }
        }
        // Validate offset parameter
        $offset = 0;
        if ( isset( $params['offset'] ) ) {
            if ( is_numeric( $params['offset'] ) && intval( $params['offset'] ) == $params['offset'] ) {
                $offset = intval( $params['offset'] );
            }
        }
        // Validate places structure
        if ( !is_array( $params['places'] ) ) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Places must be an object with service IDs as keys',
            ], 400);
        }
        // Extract times from places
        $times = [];
        $quantities = [];
        $days = [];
        foreach ( $params['places'] as $service_id => $slots ) {
            foreach ( $slots as $slot ) {
                // Support both new (time) and old (timeslot) formats
                $slot_time = null;
                if ( isset( $slot['timeslot'] ) && is_numeric( $slot['timeslot'] ) ) {
                    $slot_time = intval( $slot['timeslot'] );
                } elseif ( isset( $slot['time'] ) && is_numeric( $slot['time'] ) ) {
                    $slot_time = intval( $slot['time'] );
                }
                if ( $slot_time === null ) {
                    return new WP_REST_Response([
                        'success' => false,
                        'message' => "Invalid timeslot for service {$service_id}",
                    ], 400);
                }
                $times[] = $slot_time;
                $quantities[] = ( isset( $slot['quantity'] ) && is_numeric( $slot['quantity'] ) ? $slot['quantity'] : 1 );
                $days[] = strtotime( 'today midnight', intval( $slot['day'] ) );
            }
        }
        // Validate services
        foreach ( $params['services'] as $service_id ) {
            if ( !is_numeric( $service_id ) || $service_id <= 0 ) {
                return new WP_REST_Response([
                    'success' => false,
                    'message' => "Invalid service ID: {$service_id}",
                ], 400);
            }
        }
        $coupon_result = false;
        $coupon_status = 'not_provided';
        if ( isset( $params['coupon'] ) && !empty( trim( $params['coupon'] ) ) ) {
            $coupon = esc_html( sanitize_text_field( trim( $params['coupon'] ) ) );
            $coupon_result = WBK_Validator::check_coupon( $coupon, $params['services'] );
            if ( $coupon_result === false ) {
                $coupon_status = 'invalid';
            } else {
                $coupon_status = 'valid';
            }
        }
        $arr_uploaded_urls = [];
        $files = $request->get_file_params();
        if ( isset( $files['attachments'] ) && is_array( $files['attachments'] ) && count( $files['attachments'] ) > 0 ) {
            if ( !function_exists( 'wp_handle_upload' ) ) {
                require_once ABSPATH . 'wp-admin/includes/file.php';
            }
            for ($i = 0; $i < count( $files['attachments']['tmp_name'] ); $i++) {
                $file = [
                    'name'      => $files['attachments']['name'][$i],
                    'tmp_name'  => $files['attachments']['tmp_name'][$i],
                    'type'      => $files['attachments']['type'][$i],
                    'error'     => $files['attachments']['error'][$i],
                    'size'      => $files['attachments']['size'][$i],
                    'full_path' => $files['attachments']['full_path'][$i],
                ];
                $uploaded_file = wp_handle_upload( $file, [
                    'test_form' => false,
                ] );
                if ( $uploaded_file && !isset( $uploaded_file['error'] ) ) {
                    $arr_uploaded_urls[] = $uploaded_file['file'];
                }
            }
        }
        if ( count( $arr_uploaded_urls ) > 0 ) {
            $attachments = json_encode( $arr_uploaded_urls );
        } else {
            $attachments = '';
        }
        // Prepare base booking data
        $base_booking_data = [
            'name'             => sanitize_text_field( $params['first_name'] . ' ' . $params['last_name'] ),
            'email'            => sanitize_email( $params['email'] ),
            'phone'            => ( isset( $params['phone'] ) ? sanitize_text_field( $params['phone'] ) : '' ),
            'description'      => ( isset( $params['description'] ) ? sanitize_text_field( $params['description'] ) : '' ),
            'extra'            => ( isset( $params['extra'] ) ? $params['extra'] : '' ),
            'service_category' => ( isset( $params['category'] ) ? intval( $params['category'] ) : 0 ),
            'coupon'           => ( $coupon_result !== false && is_array( $coupon_result ) ? $coupon_result[0] : '' ),
            'attachment'       => $attachments,
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
            $service_id = $params['services'][$i];
            $service = new WBK_Service($service_id);
            if ( !$service->is_loaded() ) {
                continue;
                // Skip invalid service
            }
            // Check if time is in the past
            $ongoing_valid = false;
            if ( get_option( 'wbk_allow_ongoing_time_slot', 'disallow' ) == 'disallow' ) {
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
            // Prepare booking data for this slot
            $booking_data = array_merge( $base_booking_data, [
                'time'        => $time,
                'service_id'  => $service_id,
                'duration'    => $service->get_duration(),
                'time_offset' => $offset,
                'quantity'    => $quantities[$i] ?? 1,
            ] );
            // Validate time slot availability
            $day = $days[$i];
            if ( $sp->get_day_status( $day, $service_id ) != 1 ) {
                $skipped_count++;
                continue;
            }
            $timeslots = $sp->get_time_slots_by_day( $day, $service_id, [
                'skip_gg_calendar'       => false,
                'ignore_preparation'     => true,
                'calculate_availability' => true,
                'offset'                 => $offset,
            ] );
            $time_slot_valid = false;
            foreach ( $timeslots as $timeslot ) {
                if ( $timeslot->get_start() == $time ) {
                    if ( (is_array( $timeslot->get_status() ) || $timeslot->get_status() == 0) && $booking_data['quantity'] <= $timeslot->get_free_places() ) {
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
            if ( get_option( 'wbk_appointments_only_one_per_slot', 'disabled' ) == 'enabled' && WBK_Feature_Gate::have_required_plan( 'premium', 'only_old_users' ) ) {
                if ( count( WBK_Model_Utils::get_booking_ids_by_time_service_email( $time, $service_id, $booking_data['email'] ) ) > 0 ) {
                    $not_booked_due_limit = true;
                    continue;
                }
            }
            // Create booking
            $booking_factory = new WBK_Booking_Factory();
            $booking_data = apply_filters( 'before_booking_added', $booking_data );
            $status = $booking_factory->build_from_array( $booking_data );
            if ( $status[0] ) {
                $booking_id = $status[1];
                $booking_ids[] = $booking_id;
                $booking_times[] = $time;
                do_action( 'wbk_table_after_add', [$booking_id, get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments'] );
                $booking_data['id'] = $booking_id;
                do_action( 'wbk_booking_added', $booking_data );
            }
        }
        // Handle booking results
        if ( empty( $booking_ids ) ) {
            if ( $not_booked_due_limit ) {
                return new WP_REST_Response([
                    'success' => false,
                    'message' => __( 'Limit reached', 'webba-booking-lite' ),
                ], 400);
            }
            return new WP_REST_Response([
                'success' => false,
                'message' => __( 'No time slots were booked', 'webba-booking-lite' ),
            ], 400);
        }
        // Run post-production tasks
        $booking_factory->post_production( $booking_ids, 'on_booking' );
        if ( $coupon_result !== false && is_array( $coupon_result ) ) {
            $tax = WBK_Options_Utils::get_tax();
            $payment_details = WBK_Price_Processor::get_payment_items_post_booked( $booking_ids );
            if ( $coupon_result[2] == 100 || $payment_details['subtotal'] <= 0 ) {
                $booking_factory->set_as_paid( $booking_ids, 'coupon', 0 );
            }
        }
        // Get payment methods
        $payment_methods = WBK_Model_Utils::get_payment_methods_for_bookings_intersected( $booking_ids );
        $response_data = [
            'success'             => true,
            'booking_ids'         => $booking_ids,
            'skipped_count'       => $skipped_count,
            'times'               => $booking_times,
            'booking_instruction' => WBK_Placeholder_Processor::process_placeholders( get_option( 'wbk_after_booking_instructions', '' ), $booking_ids ),
        ];
        if ( $coupon_status !== 'not_provided' ) {
            $response_data['coupon_status'] = $coupon_status;
        }
        // Check if payment method is valid
        if ( isset( $params['payment_method'] ) && !empty( $payment_methods ) ) {
            if ( !in_array( $params['payment_method'], $payment_methods ) ) {
                return new WP_REST_Response([
                    'success' => false,
                    'message' => __( 'Invalid payment method', 'webba-booking-lite' ),
                ], 400);
            }
            $tax = WBK_Options_Utils::get_tax();
            $payment_details = WBK_Price_Processor::get_payment_items( $booking_ids, $tax, $coupon_result );
            $payable = true;
            // Use the reusable payment method processor
            $payment_response = $this->process_payment_method(
                $booking_ids,
                $params['payment_method'],
                $params,
                $payment_details
            );
            // Merge payment response into main response data
            $response_data = array_merge( $response_data, $payment_response );
        } else {
            $payment_details = WBK_Price_Processor::get_payment_items( $booking_ids );
            $response_data = array_merge( $response_data, [
                'payment_details' => $payment_details,
            ] );
        }
        date_default_timezone_set( 'UTC' );
        return new WP_REST_Response($response_data, 200);
    }

    public function execute_paypal_payment_permission( $request ) {
        return true;
    }

    public function execute_stripe_payment_permission( $request ) {
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
            'status'  => 'error',
            'message' => 'Stripe payment processing not available',
        ], 403);
    }

    public function get_booking_ids_by_token_permission( $request ) : bool {
        return true;
    }

    public function get_booking_ids_by_token( WP_REST_Request $request ) : WP_REST_Response {
        WBK_Translation_Processor::switch_to_locale_from_get_param();
        $token = sanitize_text_field( $request['token'] );
        $token_type = sanitize_text_field( $request['token_type'] );
        if ( empty( $token ) || empty( $token_type ) ) {
            return new WP_REST_Response([
                'status'  => 'error',
                'message' => 'Token and token type are required',
            ], 400);
        }
        if ( !in_array( $token_type, ['customer_token', 'admin_token', 'payment_id'] ) ) {
            return new WP_REST_Response([
                'status'  => 'error',
                'message' => 'Invalid token type',
            ], 400);
        }
        $booking_ids = [];
        if ( $token_type === 'customer_token' ) {
            $booking_ids = WBK_Model_Utils::get_booking_ids_by_group_token( $token );
        } elseif ( $token_type === 'admin_token' ) {
            $booking_ids = WBK_Model_Utils::get_booking_ids_by_group_admin_token( $token );
        } elseif ( $token_type === 'payment_id' ) {
            $booking_ids = WBK_Model_Utils::get_booking_ids_by_payment_id( $token );
        }
        if ( empty( $booking_ids ) ) {
            return new WP_REST_Response([
                'status'  => 'error',
                'message' => 'No bookings found for the provided token',
            ], 404);
        }
        $payment_details = WBK_Price_Processor::get_payment_items_post_booked( $booking_ids );
        $booking_data = [];
        foreach ( $booking_ids as $booking_id ) {
            $booking = new WBK_Booking($booking_id);
            $service = new WBK_Service($booking->get_service());
            $booking_data[$booking_id]['duration'] = $service->get_duration();
            $booking_data[$booking_id]['service'] = $service->get_name();
            $booking_data[$booking_id]['service_id'] = $service->get_id();
            $booking_data[$booking_id]['time'] = $booking->get_start() / 1000;
            $booking_data[$booking_id]['quantity'] = $booking->get_quantity();
            $booking_data[$booking_id]['price'] = $booking->get_price();
            $booking_data[$booking_id]['offset'] = $booking->get( 'time_offset' );
        }
        $ical_url = '';
        return new WP_REST_Response([
            'status'              => 'success',
            'booking_data'        => $booking_data,
            'payment_details'     => $payment_details,
            'ical_url'            => $ical_url,
            'booking_instruction' => WBK_Placeholder_Processor::process_placeholders( get_option( 'wbk_after_booking_instructions', '' ), $booking_ids ),
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
        $token = WBK_Validator::get_param_sanitize( sanitize_text_field( $request->get_param( 'token' ) ) );
        $type = sanitize_text_field( $request->get_param( 'type' ) );
        // Validate required parameters
        if ( empty( $token ) || empty( $type ) ) {
            return new WP_REST_Response([
                'status'  => 'error',
                'message' => 'Token and type are required',
            ], 400);
        }
        // Validate action type
        $allowed_types = ['admin_cancel', 'customer_cancel', 'admin_approve'];
        if ( !in_array( $type, $allowed_types ) ) {
            return new WP_REST_Response([
                'status'  => 'error',
                'message' => 'Invalid action type. Allowed types: ' . implode( ', ', $allowed_types ),
            ], 400);
        }
        // Get booking IDs based on token type
        $booking_ids = [];
        if ( $type === 'admin_cancel' || $type === 'admin_approve' ) {
            $booking_ids = WBK_Model_Utils::get_booking_ids_by_group_admin_token( $token );
        } else {
            $booking_ids = WBK_Model_Utils::get_booking_ids_by_group_token( $token );
        }
        if ( empty( $booking_ids ) ) {
            return new WP_REST_Response([
                'status'  => 'error',
                'message' => 'No bookings found for the provided token',
            ], 404);
        }
        // Process action based on type
        switch ( $type ) {
            case 'admin_cancel':
                $bf = new WBK_Booking_Factory();
                $cancelled_count = 0;
                foreach ( $booking_ids as $booking_id ) {
                    $bf->destroy( $booking_id, 'administrator', false );
                    $cancelled_count++;
                }
                if ( $cancelled_count > 0 ) {
                    return new WP_REST_Response([
                        'status'  => 'success',
                        'count'   => $cancelled_count,
                        'message' => sprintf( __( 'Bookings canceled: %d', 'webba-booking-lite' ), $cancelled_count ),
                    ], 200);
                }
                return new WP_REST_Response([
                    'status'  => 'error',
                    'message' => __( 'No bookings were canceled', 'webba-booking-lite' ),
                ], 400);
            case 'customer_cancel':
                $booking_ids_not_filtered = $booking_ids;
                $booking_ids = [];
                $valid_items = 0;
                $tokens = [];
                foreach ( $booking_ids_not_filtered as $booking_id ) {
                    $booking = new WBK_Booking($booking_id);
                    if ( !$booking->is_loaded() ) {
                        continue;
                    }
                    if ( $booking->get( 'amount_paid' ) > 0 ) {
                        if ( get_option( 'wbk_appointments_allow_cancel_paid_new', '' ) != 'yes' && WBK_Feature_Gate::have_required_plan( 'premium', 'only_old_users' ) ) {
                            continue;
                        }
                    }
                    // Check cancellation buffer
                    $buffer = get_option( 'wbk_cancellation_buffer', '' );
                    if ( WBK_Feature_Gate::have_required_plan( 'premium', 'only_old_users' ) ) {
                        if ( $buffer != '' ) {
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
                        'status'  => 'error',
                        'message' => __( 'No bookings are eligible for cancellation', 'webba-booking-lite' ),
                    ], 400);
                }
                $bf = new WBK_Booking_Factory();
                $cancelled_count = 0;
                foreach ( $booking_ids as $booking_id ) {
                    $bf->destroy( $booking_id, 'customer', false );
                    $cancelled_count++;
                }
                if ( $cancelled_count > 0 ) {
                    return new WP_REST_Response([
                        'status'  => 'success',
                        'count'   => $cancelled_count,
                        'message' => sprintf( __( 'Bookings canceled: %d', 'webba-booking-lite' ), $cancelled_count ),
                    ], 200);
                }
                return new WP_REST_Response([
                    'status'  => 'error',
                    'message' => __( 'No bookings were canceled', 'webba-booking-lite' ),
                ], 400);
            case 'admin_approve':
                $bf = new WBK_Booking_Factory();
                $approved_count = $bf->set_as_approved( $booking_ids );
                if ( $approved_count > 0 ) {
                    return new WP_REST_Response([
                        'status'  => 'success',
                        'count'   => $approved_count,
                        'message' => sprintf( __( 'Bookings approved: %d', 'webba-booking-lite' ), $approved_count ),
                    ], 200);
                }
                return new WP_REST_Response([
                    'status'  => 'error',
                    'message' => __( 'No bookings were approved', 'webba-booking-lite' ),
                ], 400);
            default:
                return new WP_REST_Response([
                    'status'  => 'error',
                    'message' => 'Unknown action type',
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
        $token = sanitize_text_field( $request->get_param( 'token' ) );
        $payment_method = sanitize_text_field( $request->get_param( 'payment_method' ) );
        $params = $request->get_params();
        // Validate required parameters
        if ( empty( $token ) || empty( $payment_method ) ) {
            return new WP_REST_Response([
                'status'  => 'error',
                'message' => 'Token and payment_method are required',
            ], 400);
        }
        // Validate payment method
        $allowed_payment_methods = [
            'paypal',
            'stripe',
            'woocommerce',
            'arrival',
            'bank',
            'google_pay',
            'apple_pay',
            'stripe_others'
        ];
        if ( !in_array( $payment_method, $allowed_payment_methods ) ) {
            return new WP_REST_Response([
                'status'  => 'error',
                'message' => 'Invalid payment method. Allowed: ' . implode( ', ', $allowed_payment_methods ),
            ], 400);
        }
        // Get booking IDs using customer token only
        $booking_ids = WBK_Model_Utils::get_booking_ids_by_group_token( $token );
        if ( empty( $booking_ids ) ) {
            return new WP_REST_Response([
                'status'  => 'error',
                'message' => 'No bookings found for the provided token',
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
                'status'         => 'success',
                'booking_ids'    => $booking_ids,
                'payment_result' => $payment_result,
            ], 200);
        } catch ( Exception $e ) {
            return new WP_REST_Response([
                'status'  => 'error',
                'message' => 'Payment processing failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function send_test_email_permission( $request ) : bool {
        return current_user_can( 'manage_options' );
    }

    public function send_test_email( $request ) : WP_REST_Response {
        $id = ( isset( $request['id'] ) ? sanitize_text_field( $request['id'] ) : '' );
        $bookings = ( isset( $request['bookings'] ) ? $request['bookings'] : [] );
        $email = ( isset( $request['email'] ) ? sanitize_text_field( $request['email'] ) : '' );
        if ( !is_array( $bookings ) ) {
            return new \WP_REST_Response([
                'status'  => 'error',
                'message' => __( 'Bookings should be an array', 'webba-booking-lite' ),
            ], 400);
        }
        WBK_Email_Processor::send_test( $bookings, $id, $email );
        $response = new \WP_REST_Response([
            'status'  => 'success',
            'message' => __( 'Test email sent successfully!', 'webba-booking-lite' ),
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
        return current_user_can( 'manage_options' );
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
        if ( !isset( $wp_settings_fields['wbk-options'] ) ) {
            if ( !function_exists( 'add_settings_section' ) ) {
                require_once ABSPATH . 'wp-admin/includes/template.php';
            }
            $backend_options = new WBK_Backend_Options();
            $backend_options->initSettings();
        }
        $params = $request->get_params();
        $form_data = ( isset( $params['form_data'] ) ? $params['form_data'] : '' );
        if ( empty( $form_data ) ) {
            return new \WP_REST_Response([
                'status'  => 'error',
                'message' => __( 'Form data is required', 'webba-booking-lite' ),
            ], 400);
        }
        try {
            $options = json_decode( $form_data, true );
        } catch ( Exception $e ) {
            return new \WP_REST_Response([
                'status'  => 'error',
                'message' => __( 'Invalid form data', 'webba-booking-lite' ),
            ], 400);
        }
        if ( !isset( $options['section'] ) ) {
            return new \WP_REST_Response([
                'status'  => 'error',
                'message' => __( 'Section is required', 'webba-booking-lite' ),
            ], 400);
        }
        if ( !isset( $wp_settings_fields['wbk-options'][$options['section']] ) ) {
            return new \WP_REST_Response([
                'status'  => 'error',
                'message' => __( 'Invalid section', 'webba-booking-lite' ),
            ], 400);
        }
        $settings_fields = $wp_settings_fields['wbk-options'][$options['section']];
        foreach ( $settings_fields as $field ) {
            if ( isset( $options[$field['id']] ) ) {
                update_option( $field['id'], $options[$field['id']] );
            } else {
                update_option( $field['id'], '' );
            }
            if ( $field['id'] == 'wbk_email_admin_daily_time' ) {
                date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
                $time_corr = intval( get_option( 'wbk_email_admin_daily_time', '68400' ) );
                $midnight = strtotime( 'today midnight' );
                $timestamp = strtotime( 'today midnight' ) + $time_corr;
                if ( $timestamp < time() ) {
                    $timestamp += 86400;
                }
                wp_clear_scheduled_hook( 'wbk_daily_event' );
                wp_schedule_event( $timestamp, 'daily', 'wbk_daily_event' );
                date_default_timezone_set( 'UTC' );
            }
        }
        do_action( 'wbk_options_saved' );
        WBK_Mixpanel::update_configuration( false );
        $response = new \WP_REST_Response([
            'status'  => 'success',
            'message' => __( 'Options saved successfully', 'webba-booking-lite' ),
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
        return current_user_can( 'manage_options' );
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
        if ( !isset( $wp_settings_fields['wbk-options'] ) ) {
            if ( !function_exists( 'add_settings_section' ) ) {
                require_once ABSPATH . 'wp-admin/includes/template.php';
            }
            $backend_options = new WBK_Backend_Options();
            $backend_options->initSettings();
        }
        if ( !isset( $wp_settings_fields['wbk-options'] ) ) {
            return new \WP_REST_Response([
                'status'  => 'error',
                'message' => __( 'Settings fields not initialized', 'webba-booking-lite' ),
            ], 500);
        }
        $settings_fields = $wp_settings_fields['wbk-options'];
        $options_data = [];
        // Sort $settings_fields (which is expected to be an associative array keyed by section id) by section 'priority', maintaining keys.
        if ( is_array( $settings_fields ) ) {
            // fetch global $wp_settings_sections for priorities
            global $wp_settings_sections;
            $sections_for_priorities = ( isset( $wp_settings_sections['wbk-options'] ) ? $wp_settings_sections['wbk-options'] : [] );
            // Compose sortable array: [ section_id, priority, fields ]
            $sortable_sections = [];
            foreach ( $settings_fields as $section_id => $fields ) {
                $priority = ( isset( $sections_for_priorities[$section_id]['priority'] ) ? intval( $sections_for_priorities[$section_id]['priority'] ) : 0 );
                $sortable_sections[] = [
                    'id'       => $section_id,
                    'priority' => $priority,
                    'fields'   => $fields,
                ];
            }
            // Sort by priority
            usort( $sortable_sections, function ( $a, $b ) {
                return $a['priority'] - $b['priority'];
            } );
            // Build sorted settings_fields, preserving original structure (id as key => fields as value)
            $new_settings_fields = [];
            foreach ( $sortable_sections as $entry ) {
                $new_settings_fields[$entry['id']] = $entry['fields'];
            }
            $settings_fields = $new_settings_fields;
        }
        // Iterate through all sections
        foreach ( $settings_fields as $section_id => $fields ) {
            $section_data = [
                'id'     => $section_id,
                'fields' => [],
            ];
            // Get section title if available
            global $wp_settings_sections;
            if ( isset( $wp_settings_sections['wbk-options'][$section_id] ) ) {
                $section_info = $wp_settings_sections['wbk-options'][$section_id];
                $section_data['title'] = ( isset( $section_info['title'] ) ? $section_info['title'] : '' );
                $section_data['icon'] = ( isset( $section_info['icon'] ) ? $section_info['icon'] : '' );
                $section_data['description'] = ( isset( $section_info['description'] ) ? $section_info['description'] : '' );
                $section_data['sections'] = ( isset( $section_info['sections'] ) ? $section_info['sections'] : [] );
                $section_data['tabs'] = ( isset( $section_info['tabs'] ) ? $section_info['tabs'] : [] );
                $section_data['required_plan'] = ( isset( $section_info['required_plan'] ) ? $section_info['required_plan'] : '' );
                $section_data['editor_view'] = ( isset( $section_info['editor_view'] ) ? $section_info['editor_view'] : false );
            }
            // Iterate through all fields in the section
            foreach ( $fields as $field ) {
                $field_id = $field['id'];
                $field_args = ( isset( $field['args'] ) ? $field['args'] : [] );
                // Get current option value
                $current_value = get_option( $field_id, false );
                // If option doesn't exist, use default value
                if ( $current_value === false && isset( $field_args['default'] ) ) {
                    $current_value = $field_args['default'];
                }
                $field_data = [
                    'id'                    => $field_id,
                    'title'                 => ( isset( $field['title'] ) ? $field['title'] : '' ),
                    'value'                 => $current_value,
                    'default'               => ( isset( $field_args['default'] ) ? $field_args['default'] : '' ),
                    'type'                  => $this->detect_field_type( $field ),
                    'description'           => ( isset( $field_args['description'] ) ? $field_args['description'] : '' ),
                    'placeholder'           => ( isset( $field_args['placeholder'] ) ? $field_args['placeholder'] : '' ),
                    'subsection'            => ( isset( $field_args['subsection'] ) ? $field_args['subsection'] : 'basic' ),
                    'tooltip'               => ( isset( $field_args['popup'] ) ? $field_args['popup'] : '' ),
                    'required_plan'         => ( isset( $field_args['required_plan'] ) ? $field_args['required_plan'] : '' ),
                    'available_in_old_free' => ( isset( $field_args['available_in_old_free'] ) ? $field_args['available_in_old_free'] : '' ),
                    'tab'                   => ( isset( $field_args['tab'] ) ? $field_args['tab'] : '' ),
                    'subsection'            => ( isset( $field_args['subsection'] ) ? $field_args['subsection'] : '' ),
                    'sub_type'              => ( isset( $field_args['sub_type'] ) ? $field_args['sub_type'] : '' ),
                    'dependent_value'       => ( isset( $field_args['dependent_value'] ) ? $field_args['dependent_value'] : '' ),
                    'searchable'            => ( isset( $field_args['searchable'] ) ? $field_args['searchable'] : false ),
                ];
                // Add extra field-specific data
                if ( isset( $field_args['extra'] ) ) {
                    $field_data['extra'] = $field_args['extra'];
                }
                // Add dependency information if available
                if ( isset( $field_args['dependency'] ) && is_array( $field_args['dependency'] ) ) {
                    $field_data['dependency'] = $field_args['dependency'];
                }
                // Add checkbox value if it's a checkbox field
                if ( isset( $field_args['checkbox_value'] ) ) {
                    $field_data['checkbox_value'] = $field_args['checkbox_value'];
                }
                $section_data['fields'][] = $field_data;
            }
            $options_data[$section_id] = $section_data;
        }
        $response = new \WP_REST_Response([
            'status' => 'success',
            'data'   => $options_data,
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
        if ( !isset( $field['callback'] ) || !is_array( $field['callback'] ) ) {
            return 'text';
        }
        $callback_method = $field['callback'][1] ?? '';
        // Map render callbacks to field types
        $type_map = [
            'render_text'            => 'text',
            'render_pass'            => 'password',
            'render_textarea'        => 'textarea',
            'render_checkbox'        => 'checkbox',
            'render_select'          => 'select',
            'render_select_multiple' => 'select_multiple',
            'render_editor'          => 'editor',
            'render_google_connect'  => 'google_connect',
            'render_zoom_auth'       => 'zoom_auth',
            'render_duration'        => 'duration',
            'render_date_multiple'   => 'date_multiple',
            'render_business_hours'  => 'business_hours',
            'render_notice'          => 'notice',
            'render_password'        => 'password',
        ];
        return $type_map[$callback_method] ?? 'text';
    }

    /**
     * Returns permission for getting dashboard stats
     *
     * @param WP_REST_Request $request
     * @return boolean
     */
    public function get_dashboard_stats_permission( WP_REST_Request $request ) : bool {
        return current_user_can( 'manage_options' );
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
            $sub_title = esc_html__( 'No bookings in the last 24 hours', 'webba-booking-lite' );
        } else {
            $sub_title = sprintf( esc_html__( 'You have %s new bookings in the past 24 hours', 'webba-booking-lite' ), count( $last_24_hours_booking_ids ) );
        }
        $date_format = WBK_Date_Time_Utils::get_date_format_backend();
        $date_format_js = str_replace( 'd', 'dd', $date_format );
        $date_format_js = str_replace( 'j', 'd', $date_format_js );
        $date_format_js = str_replace( 'l', 'dddd', $date_format_js );
        $date_format_js = str_replace( 'D', 'ddd', $date_format_js );
        $date_format_js = str_replace( 'm', 'mm', $date_format_js );
        $date_format_js = str_replace( 'n', 'm', $date_format_js );
        $date_format_js = str_replace( 'F', 'mmmm', $date_format_js );
        $date_format_js = str_replace( 'M', 'mmm', $date_format_js );
        $date_format_js = str_replace( 'y', 'yyyy', $date_format_js );
        $date_format_js = str_replace( 'Y', 'yyyy', $date_format_js );
        $date_format_js = str_replace( 'S', '', $date_format_js );
        $date_format_js = str_replace( 's', '', $date_format_js );
        $yesterday = date( 'F d, Y', strtotime( '-1 days' ) );
        $last_30_days = date( 'F d, Y', strtotime( '-31 days' ) );
        $formatted_yesterday = date( $date_format, strtotime( '-1 days' ) );
        $formatted_last_30_days = date( $date_format, strtotime( '-31 days' ) );
        $db_prefix = get_option( 'wbk_db_prefix', '' );
        $table = $db_prefix . 'wbk_appointments';
        $pro_version = false;
        $filters = $params['filters'] ?? [];
        $approved = 0;
        $pending = 0;
        $approved_balance = 0;
        $pending_balance = 0;
        $approved_text = esc_html__( 'Approved Bookings', 'webba-booking-lite' );
        $pending_text = esc_html__( 'Pending Bookings', 'webba-booking-lite' );
        $slots_text = esc_html__( 'Of slots are booked', 'webba-booking-lite' );
        $approved_ids = [];
        $pending_ids = [];
        $labels = [];
        $total_data = [];
        $pending_data = [];
        $approved_data = [];
        $prev_time_zone = date_default_timezone_get();
        date_default_timezone_set( get_option( 'wbk_timezone' ) );
        if ( empty( $filters ) ) {
            $start = strtotime( 'today midnight' ) - 86400 * 31;
            $end = strtotime( 'today midnight' ) - 86400;
        } else {
            $start = strtotime( $filters[0]['value'] );
            $end = strtotime( $filters[1]['value'] );
        }
        if ( $start == $end ) {
            $end = $end + 86400;
        }
        date_default_timezone_set( $prev_time_zone );
        $approved_search = 'approved,paid_approved,arrived,added_by_admin_paid';
        $pending_search = 'pending,paid,woocommerce,added_by_admin_not_paid';
        $approved_search_arr = explode( ',', $approved_search );
        $pending_search_arr = explode( ',', $pending_search );
        $num = 100;
        $slots_percent = round( ($approved + $pending) * 100 ) / $num;
        $approved = 0;
        $pending = 0;
        if ( $end > $start ) {
            while ( $start <= $end ) {
                $prev_time_zone = date_default_timezone_get();
                date_default_timezone_set( get_option( 'wbk_timezone' ) );
                $g_date = date( 'Y-m-d', $start );
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
                            'message' => 'Unable to open booking.',
                        ]);
                        $response->set_status( 400 );
                        return $response;
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
                $start = strtotime( '+1 days', $start );
            }
        }
        $graph_options = [];
        if ( !empty( $labels ) ) {
            $graph_options = [
                'labels'   => $labels,
                'datasets' => [[
                    'label'       => esc_html__( 'No. of bookings', 'webba-booking-lite' ),
                    'data'        => $total_data,
                    'borderWidth' => 1,
                    'yAxisID'     => 'y',
                ], [
                    'label'       => esc_html__( 'Revenue (approved)', 'webba-booking-lite' ),
                    'data'        => $approved_data,
                    'borderWidth' => 1,
                    'yAxisID'     => 'yRevenu',
                ], [
                    'label'       => esc_html__( 'Revenue (pending)', 'webba-booking-lite' ),
                    'data'        => $pending_data,
                    'borderWidth' => 1,
                    'yAxisID'     => 'yRevenu',
                ]],
            ];
        }
        $data['chart'] = $graph_options;
        $data['approved'] = $approved;
        $data['pending'] = $pending;
        $data['balance'] = WBK_Format_Utils::format_price( $approved_balance + $pending_balance );
        $data['balance_approved'] = sprintf( '%s %s', WBK_Format_Utils::format_price( $approved_balance ), esc_html__( 'approved', 'webba-booking-lite' ) );
        $data['balance_pending'] = sprintf( '%s %s', WBK_Format_Utils::format_price( $pending_balance ), esc_html__( 'pending', 'webba-booking-lite' ) );
        $data['approvedText'] = $approved_text;
        $data['pendingText'] = $pending_text;
        $data['slotsText'] = $slots_text;
        $data['approved_ids'] = $approved_ids;
        $data['pending_ids'] = $pending_ids;
        $data['priceFormat'] = $price_format;
        $data['isPro'] = $pro_version;
        $response = new \WP_REST_Response($data);
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
        return current_user_can( 'manage_options' );
    }

    /**
     * Save appearance
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function save_appearance( WP_REST_Request $request ) : WP_REST_Response {
        $data = $request->get_params();
        if ( !isset( $data['options'] ) || !is_array( $data['options'] ) || empty( $data['options'] ) ) {
            $response = new \WP_REST_Response([
                'message' => 'Unable to save appearance.',
            ]);
            $response->set_status( 400 );
            return $response;
        }
        $appearance_fields = [
            'bg_accent',
            'font',
            'border_radius',
            'shadow'
        ];
        $required_plans = ['standard', 'premium', 'pro'];
        $have_required_plan = false;
        foreach ( $required_plans as $required_plan ) {
            if ( WBK_Feature_Gate::have_required_plan( $required_plan, null ) ) {
                $have_required_plan = true;
                break;
            }
        }
        if ( $have_required_plan ) {
            $appearance_fields = array_merge( $appearance_fields, [
                'bg_button_primary',
                'color_button_primary',
                'bg_button_primary_hover',
                'color_button_primary_hover',
                'bg_button_secondary',
                'color_button_secondary',
                'bg_button_secondary_hover',
                'color_button_secondary_hover',
                'bg_button_inactive',
                'color_button_inactive',
                'bg_button_selected',
                'color_button_selected',
                'bg_button_selected_hover',
                'color_button_selected_hover',
                'button_border_radius',
                'bg_sidebar',
                'color_sidebar',
                'color_border_selected'
            ] );
        }
        $appearance_options = [];
        $default_values = WBK_Appearance_Utils::get_default_appearance_values();
        foreach ( $data['options'] as $key => $value ) {
            if ( in_array( $key, $appearance_fields ) ) {
                $appearance_options[sanitize_key( $key )] = sanitize_text_field( $value );
            } elseif ( isset( $default_values[sanitize_key( $key )] ) ) {
                $appearance_options[sanitize_key( $key )] = $default_values[sanitize_key( $key )];
            }
        }
        update_option( 'wbk_appearance_options', $appearance_options );
        // generate config in css
        $css_config_string = WBK_Appearance_Utils::generate_css_config( $appearance_options );
        $dir = WP_CONTENT_DIR . DIRECTORY_SEPARATOR . 'webba_booking_style';
        file_put_contents( $dir . DIRECTORY_SEPARATOR . 'wbk6-frontend-config.css', $css_config_string );
        $response = new \WP_REST_Response([
            'message' => 'Appearance saved successfully.',
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
        $day = $request['date'];
        $service_id = $request['service_id'];
        $current_booking = $request['current_booking'];
        if ( !WBK_Validator::is_service_exists( $service_id ) ) {
            $data = [
                'Reason' => 'Service not exists',
            ];
            $response = new \WP_REST_Response($data);
            $response->set_status( 400 );
            return $response;
        }
        if ( !WBK_Validator::is_date( $day ) ) {
            $data = [
                'Reason' => 'Wrong date passed',
            ];
            $response = new \WP_REST_Response($data);
            $response->set_status( 400 );
            return $response;
        }
        if ( !WbkData\Validator::check_integer( $current_booking, 1, 2147483647 ) ) {
            $current_booking = null;
        }
        $sp = new WBK_Schedule_Processor();
        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        $day = strtotime( $day );
        $timeslots = $sp->get_time_slots_by_day(
            $day,
            $service_id,
            [
                'skip_gg_calendar'       => false,
                'ignore_preparation'     => true,
                'calculate_availability' => true,
                'calculate_night_hours'  => false,
                'filter_availability'    => false,
            ],
            $current_booking
        );
        $data = [
            'time_slots' => $timeslots,
        ];
        $response = new \WP_REST_Response($data);
        $response->set_status( 200 );
        date_default_timezone_set( 'UTC' );
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
            'timezones' => $timezones,
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
        update_option( 'wbk_zoom_auth_stat', '' );
        $data = [
            'status'  => 'success',
            'message' => 'Zoom auth removed successfully',
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
        return current_user_can( 'manage_options' );
    }

}
