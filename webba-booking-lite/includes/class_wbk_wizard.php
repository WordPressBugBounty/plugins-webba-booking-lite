<?php

if ( !defined( 'ABSPATH' ) ) {
    exit;
}
class WBK_Wizard {
    public function __construct() {
        add_action( 'rest_api_init', function () {
            register_rest_route( 'webba-booking/v1', '/wizard/submit-initial-setup', [
                'methods'             => 'POST',
                'callback'            => [$this, 'wbk_wizard_initial_setup'],
                'permission_callback' => [$this, 'wbk_wizard_initial_setup_permission'],
            ] );
            register_rest_route( 'webba-booking/v1', '/wizard/submit-final-setup', [
                'methods'             => 'POST',
                'callback'            => [$this, 'wbk_wizard_final_setup'],
                'permission_callback' => [$this, 'wbk_wizard_final_setup_permission'],
            ] );
        } );
    }

    /**
     * Permission callback for the initial setup
     *
     * @param WP_REST_Request $request
     * @return boolean
     */
    public function wbk_wizard_initial_setup_permission( WP_REST_Request $request ) : bool {
        return current_user_can( 'manage_options' );
    }

    /**
     * Permission callback for the final setup
     *
     * @param WP_REST_Request $request
     * @return boolean
     */
    public function wbk_wizard_final_setup_permission( WP_REST_Request $request ) : bool {
        return current_user_can( 'manage_options' );
    }

    /**
     * Initial setup endpoint
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function wbk_wizard_initial_setup( WP_REST_Request $request ) : WP_REST_Response {
        $params = $request->get_params();
        // Check required fields
        $required_fields = [
            'email',
            'timezone',
            'currency',
            'service_name',
            'service_description',
            'service_price',
            'service_duration',
            'service_interval',
            'service_buffer',
            'service_advance',
            'wbk_global_working_hours'
        ];
        foreach ( $required_fields as $field ) {
            if ( !isset( $params[$field] ) ) {
                return new WP_REST_Response([
                    'status' => 'fail',
                    'reason' => 'missing field: ' . $field,
                ], 400);
            }
        }
        // Validate and sanitize input
        $service_name = esc_html( sanitize_text_field( trim( $params['service_name'] ) ) );
        if ( $service_name == '' ) {
            return new WP_REST_Response([
                'status' => 'fail',
                'reason' => 'wrong service name',
            ], 400);
        }
        $duration = intval( $params['service_duration'] );
        if ( !WBK_Validator::check_integer( $duration, 5, 1440 ) ) {
            return new WP_REST_Response([
                'status' => 'fail',
                'reason' => 'duration',
            ], 400);
        }
        $min_quantity = 1;
        $max_quantity = 1;
        $quantity = 1;
        if ( !isset( $params['wbk_global_working_hours'] ) || !is_array( $params['wbk_global_working_hours'] ) ) {
            return new WP_REST_Response([
                'status' => 'fail',
                'reason' => 'invalid business hours',
            ], 400);
        }
        update_option( 'wbk_global_working_hours', json_encode( $params['wbk_global_working_hours'] ) );
        // Create service
        $service = new WBK_Service();
        // Basic info
        $service->set( 'name', $service_name );
        $service->set( 'description', sanitize_text_field( $params['service_description'] ) );
        $service->set( 'email', sanitize_email( $params['email'] ) );
        $service->set( 'priority', '0' );
        $service->set( 'form', '0' );
        $service->set( 'extcalendar', '' );
        // service color
        $existing_services = WBK_Model_Utils::get_service_ids();
        $existing_colors = [];
        foreach ( $existing_services as $existing_service_id ) {
            $existing_service = new WBK_Service($existing_service_id);
            if ( !$existing_service->is_loaded() ) {
                continue;
            }
            $existing_colors[] = $existing_service->get( 'color' );
        }
        $service->set( 'color', WBK_Appearance_Utils::generate_random_color( $existing_colors ) );
        $service->set( 'business_hours', $business_hours_json );
        // Service settings (group size limits & slot capacity)
        $service->set( 'min_quantity', $min_quantity );
        $service->set( 'max_quantity', $max_quantity );
        $service->set( 'quantity', $quantity );
        $service->set( 'duration', $duration );
        $service->set( 'step', intval( $params['service_interval'] ) );
        $service->set( 'interval_between', intval( $params['service_buffer'] ) );
        $service->set( 'price', floatval( $params['service_price'] ) );
        $service->set( 'service_fee', '0' );
        $service->set( 'hide_price', ( !empty( $params['service_hide_price'] ) && $params['service_hide_price'] === 'yes' ? 'yes' : '' ) );
        // overrides
        $service->set( 'override_email', '' );
        $service->set( 'override_availability', '' );
        $service->set( 'override_step', '' );
        $service->set( 'business_hours', '' );
        if ( isset( $params['service_payment_methods'] ) ) {
            $payment_methods = $params['service_payment_methods'];
            if ( is_string( $payment_methods ) ) {
                $decoded = json_decode( $payment_methods, true );
                $payment_methods = ( is_array( $decoded ) ? $decoded : [] );
            }
            if ( is_array( $payment_methods ) ) {
                $service->set( 'payment_methods', json_encode( array_values( $payment_methods ) ) );
            }
        }
        // Templates
        $service->set( 'notification_template', '0' );
        $service->set( 'reminder_template', '0' );
        $service->set( 'invoice_template', '0' );
        $service->set( 'booking_changed_template', '0' );
        $service->set( 'approval_template', '0' );
        $service->set( 'prepare_time', intval( $params['service_advance'] ) );
        // Save service
        $service_id = $service->save();
        // Save global settings
        update_option( 'wbk_timezone', sanitize_text_field( $params['timezone'] ) );
        update_option( 'wbk_payment_price_format_new', sanitize_text_field( $params['currency_symbol'] ) );
        if ( isset( $params['wbk_sidebar_help_email'] ) ) {
            update_option( 'wbk_sidebar_help_email', sanitize_text_field( $params['wbk_sidebar_help_email'] ) );
        }
        if ( isset( $params['wbk_sidebar_help_phone'] ) ) {
            update_option( 'wbk_sidebar_help_phone', sanitize_text_field( $params['wbk_sidebar_help_phone'] ) );
        }
        // Process closed dates
        if ( isset( $params['closed_dates'] ) ) {
            update_option( 'wbk_holydays', $params['closed_dates'] );
        }
        // Return shortcode
        WBK_Mixpanel::track_event( 'service created', [] );
        WBK_Mixpanel::track_event( 'setup wizard basic setup complete', [] );
        return new WP_REST_Response([
            'status'    => 'success',
            'shortcode' => '[webbabooking]',
        ], 200);
    }

    /**
     * Final setup endpoint
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function wbk_wizard_final_setup( WP_REST_Request $request ) : WP_REST_Response {
        $params = $request->get_params();
        if ( !isset( $params['final_action'] ) ) {
            return new WP_REST_Response([
                'status' => 'fail',
                'reason' => 'wrong finalize',
            ], 400);
        }
        if ( $params['final_action'] != 'setup_advanced' && $params['final_action'] != 'finalize' ) {
            return new WP_REST_Response([
                'status' => 'fail',
                'reason' => 'wrong finalize',
            ], 400);
        }
        if ( isset( $params['enable_emails'] ) ) {
            update_option( 'wbk_email_customer_book_status', 'true' );
            update_option( 'wbk_email_admin_book_status', 'true' );
        } else {
            update_option( 'wbk_email_customer_book_status', '' );
            update_option( 'wbk_email_admin_book_status', '' );
        }
        if ( isset( $params['enable_sms'] ) ) {
            update_option( 'wbk_sms_setup_required', 'true' );
        } else {
            update_option( 'wbk_sms_setup_required', 'false' );
        }
        if ( isset( $params['enable_payments'] ) ) {
            update_option( 'wbk_payments_setup_required', 'true' );
        } else {
            update_option( 'wbk_payments_setup_required', 'false' );
        }
        if ( isset( $params['enable_google'] ) ) {
            update_option( 'wbk_google_setup_required', 'true' );
        } else {
            update_option( 'wbk_google_setup_required', 'false' );
        }
        $url = esc_url( get_admin_url() . 'admin.php?page=wbk-services' );
        WBK_Mixpanel::track_event( 'setup wizard full setup complete', [] );
        return new WP_REST_Response([
            'status' => 'success',
            'url'    => $url,
        ], 200);
    }

}
