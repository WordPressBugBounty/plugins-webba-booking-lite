<?php

if ( !defined( 'ABSPATH' ) ) {
    exit;
}
class WBK_Wizard {
    public function __construct() {
        add_action( 'admin_enqueue_scripts', [$this, 'admin_enqueue_scripts'], 20 );
        add_action( 'wp_ajax_wbk_wizard_initial_setup', [$this, 'wbk_wizard_initial_setup'] );
        add_action( 'wp_ajax_wbk_wizard_final_setup', [$this, 'wbk_wizard_final_setup'] );
    }

    public function wbk_wizard_initial_setup() {
        if ( !wp_verify_nonce( $_POST['nonce'], 'wbkb_nonce' ) ) {
            echo json_encode( [
                'status' => 'fail',
                'reason' => 'too many requests',
            ] );
            wp_die();
            return;
        }
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
            if ( !isset( $_POST[$field] ) ) {
                echo json_encode( [
                    'status' => 'fail',
                    'reason' => 'missing field: ' . $field,
                ] );
                wp_die();
                return;
            }
        }
        // Validate and sanitize input
        $service_name = esc_html( sanitize_text_field( trim( $_POST['service_name'] ) ) );
        if ( $service_name == '' ) {
            echo json_encode( [
                'status' => 'fail',
                'reason' => 'wrong service name',
            ] );
            wp_die();
            return;
        }
        $duration = intval( $_POST['service_duration'] );
        if ( !WBK_Validator::check_integer( $duration, 5, 1440 ) ) {
            echo json_encode( [
                'status' => 'fail',
                'reason' => 'duration',
            ] );
            wp_die();
            return;
        }
        $business_hours_json = ( isset( $_POST['wbk_global_working_hours'] ) ? stripslashes( sanitize_text_field( $_POST['wbk_global_working_hours'] ) ) : '' );
        $business_hours_arr = json_decode( $business_hours_json, true );
        if ( !is_array( $business_hours_arr ) ) {
            echo json_encode( [
                'status' => 'fail',
                'reason' => 'invalid business hours',
            ] );
            wp_die();
            return;
        }
        update_option( 'wbk_global_working_hours', $business_hours_json );
        // Create service
        $service = new WBK_Service();
        // Basic info
        $service->set( 'name', $service_name );
        $service->set( 'description', sanitize_text_field( $_POST['service_description'] ) );
        $service->set( 'email', sanitize_email( $_POST['email'] ) );
        $service->set( 'priority', '0' );
        $service->set( 'form', '0' );
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
        $service->set( 'duration', $duration );
        $service->set( 'step', intval( $_POST['service_interval'] ) );
        $service->set( 'interval_between', intval( $_POST['service_buffer'] ) );
        $service->set( 'price', floatval( $_POST['service_price'] ) );
        $service->set( 'service_fee', '0' );
        $service->set( 'hide_price', ( !empty( $_POST['service_hide_price'] ) && $_POST['service_hide_price'] === 'yes' ? 'yes' : '' ) );
        // Templates
        $service->set( 'notification_template', '0' );
        $service->set( 'reminder_template', '0' );
        $service->set( 'invoice_template', '0' );
        $service->set( 'booking_changed_template', '0' );
        $service->set( 'approval_template', '0' );
        $service->set( 'prepare_time', intval( $_POST['service_advance'] ) );
        // Save service
        $service_id = $service->save();
        // Save global settings
        update_option( 'wbk_timezone', sanitize_text_field( $_POST['timezone'] ) );
        update_option( 'wbk_payment_price_format_new', sanitize_text_field( $_POST['currency_symbol'] ) );
        if ( isset( $_POST['wbk_sidebar_help_email'] ) ) {
            update_option( 'wbk_sidebar_help_email', sanitize_text_field( $_POST['wbk_sidebar_help_email'] ) );
        }
        if ( isset( $_POST['wbk_sidebar_help_phone'] ) ) {
            update_option( 'wbk_sidebar_help_phone', sanitize_text_field( $_POST['wbk_sidebar_help_phone'] ) );
        }
        // Process closed dates
        if ( isset( $_POST['closed_dates'] ) ) {
            $closed_dates = json_decode( stripslashes( $_POST['closed_dates'] ), true );
            $holiday_dates = [];
            foreach ( $closed_dates as $range ) {
                $start = DateTime::createFromFormat( 'm/d/Y', $range['start'] );
                $end = DateTime::createFromFormat( 'm/d/Y', $range['end'] );
                $interval = new DateInterval('P1D');
                $date_range = new DatePeriod($start, $interval, $end->modify( '+1 day' ));
                foreach ( $date_range as $date ) {
                    $holiday_dates[] = $date->format( 'Y-m-d' );
                }
            }
            update_option( 'wbk_holydays', implode( ',', $holiday_dates ) );
        }
        // Return shortcode
        echo json_encode( [
            'status'    => 'success',
            'shortcode' => '[webbabooking]',
        ] );
        WBK_Mixpanel::track_event( 'service created', [] );
        WBK_Mixpanel::track_event( 'setup wizard basic setup complete', [] );
        wp_die();
        return;
    }

    public function wbk_wizard_final_setup() {
        if ( !wp_verify_nonce( $_POST['nonce'], 'wbkb_nonce' ) ) {
            echo json_encode( [
                'status' => 'fail',
                'reason' => 'too many requests',
            ] );
            wp_die();
            return;
        }
        if ( !isset( $_POST['final_action'] ) ) {
            echo json_encode( [
                'status' => 'fail',
                'reason' => 'wrong finalize',
            ] );
            wp_die();
            return;
        }
        if ( $_POST['final_action'] != 'setup_advanced' && $_POST['final_action'] != 'finalize' ) {
            echo json_encode( [
                'status' => 'fail',
                'reason' => 'wrong finalize',
            ] );
            wp_die();
            return;
        }
        if ( isset( $_POST['enable_emails'] ) ) {
            update_option( 'wbk_email_customer_book_status', 'true' );
            update_option( 'wbk_email_admin_book_status', 'true' );
        } else {
            update_option( 'wbk_email_customer_book_status', '' );
            update_option( 'wbk_email_admin_book_status', '' );
        }
        if ( isset( $_POST['enable_sms'] ) ) {
            update_option( 'wbk_sms_setup_required', 'true' );
        } else {
            update_option( 'wbk_sms_setup_required', 'false' );
        }
        if ( isset( $_POST['enable_payments'] ) ) {
            update_option( 'wbk_payments_setup_required', 'true' );
        } else {
            update_option( 'wbk_payments_setup_required', 'false' );
        }
        if ( isset( $_POST['enable_google'] ) ) {
            update_option( 'wbk_google_setup_required', 'true' );
        } else {
            update_option( 'wbk_google_setup_required', 'false' );
        }
        $finalize = sanitize_text_field( $_POST['final_action'] );
        $url = esc_url( get_admin_url() . 'admin.php?page=wbk-services' );
        echo json_encode( [
            'status' => 'success',
            'url'    => $url,
        ] );
        WBK_Mixpanel::track_event( 'setup wizard full setup complete', [] );
        wp_die();
        return;
    }

    public function admin_enqueue_scripts() {
        wp_enqueue_script(
            'wbk-wizard',
            WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/wbk-wizard.js',
            [
                'jquery',
                'jquery-ui-slider',
                'jquery-touch-punch',
                'jquery-ui-draggable',
                'wbk-validator'
            ],
            WP_WEBBA_BOOKING__VERSION
        );
        $translation_array = [
            'nonce'                  => wp_create_nonce( 'wbkb_nonce' ),
            'ajaxurl'                => admin_url( 'admin-ajax.php' ),
            'setup_advanced_options' => esc_html__( 'Setup Advanced Options', 'webba-booking-lite' ),
            'finish_setup_wizard'    => esc_html__( 'Finish the Setup Wizard', 'webba-booking-lite' ),
            'settings_url'           => esc_url( get_admin_url() . 'admin.php?page=wbk-options' ),
            'admin_url'              => esc_url( get_admin_url() ),
        ];
        wp_localize_script( 'wbk-wizard', 'wbk_wizardl10n', $translation_array );
    }

}
