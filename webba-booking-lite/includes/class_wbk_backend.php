<?php

// check if accessed directly
if ( !defined( 'ABSPATH' ) ) {
    exit;
}
include 'backend/class_wbk_backend_options.php';
include 'backend/class_wbk_backend_schedule.php';
// define main backend class
class WBK_Backend {
    // 	available components of backend (based on files in classes folder)
    private $components;

    public function __construct() {
        //add action for wp menu construction
        add_action( 'admin_menu', [$this, 'createAdminMenu'] );
        //set components of backend
        add_action( 'admin_notices', [$this, 'admin_notices'] );
        add_action(
            'in_plugin_update_message-webba-booking/webba-booking-lite.php',
            [$this, 'prefix_plugin_update_message'],
            10,
            2
        );
        add_action(
            'in_plugin_update_message-webba-booking-lite/webba-booking-lite.php',
            [$this, 'prefix_plugin_update_message'],
            10,
            2
        );
        $backend_schedule = new WBK_Backend_Schedule();
        $backend_options = new WBK_Backend_Options();
    }

    public function prefix_plugin_update_message( $data, $response ) {
        if ( isset( $data['upgrade_notice'] ) ) {
            $message = str_replace( ['<p>', '</p>'], ['<div>', '</div>'], $data['upgrade_notice'] );
            echo '<style type="text/css">
			#webba-booking-lite-update .update-message p:not(:first-child){
				display: none;
			}
            </style>';
        }
    }

    public function settings_updated() {
        if ( isset( $_GET['settings-updated'] ) && $_GET['settings-updated'] ) {
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

    public function inline_upload_enquene() {
        wp_enqueue_script( 'wp-tinymce' );
        // add common css
        if ( isset( $_GET['page'] ) && ($_GET['page'] == 'wbk-options' || $_GET['page'] == 'wbk-schedule' || $_GET['page'] == 'wbk-gg-calendars' || $_GET['page'] == 'wbk-forms') ) {
        }
    }

    public function createAdminMenu() {
        global $current_user;
        if ( current_user_can( 'manage_options' ) || WBK_Validator::checkAccessToSchedule() || WBK_Validator::checkAccessToGgCalendarPage() ) {
            $root_name = __( 'Webba Booking', 'webba-booking-lite' );
            $root_name = apply_filters( 'wbk_root_menu_title', $root_name );
            add_menu_page(
                $root_name,
                $root_name,
                'read',
                'wbk-main',
                ['WBK_Renderer', 'render_backend_page'],
                WP_WEBBA_BOOKING__PLUGIN_URL . '/public/images/webba-booking.png'
            );
            add_submenu_page(
                'wbk-main',
                __( 'Dashboard', 'webba-booking-lite' ),
                __( 'Dashboard', 'webba-booking-lite' ),
                'manage_options',
                'wbk-dashboard',
                ['WBK_Renderer', 'render_backend_page']
            );
            add_submenu_page(
                'wbk-main',
                __( 'Services', 'webba-booking-lite' ),
                __( 'Services', 'webba-booking-lite' ),
                'read',
                'wbk-services',
                ['WBK_Renderer', 'render_backend_page']
            );
            add_submenu_page(
                'wbk-main',
                __( 'Bookings', 'webba-booking-lite' ),
                __( 'Bookings', 'webba-booking-lite' ),
                'read',
                'wbk-appointments',
                ['WBK_Renderer', 'render_backend_page']
            );
            add_submenu_page(
                'wbk-main',
                __( 'Calendar', 'webba-booking-lite' ),
                __( 'Calendar', 'webba-booking-lite' ),
                'read',
                'wbk-schedule',
                ['WBK_Renderer', 'render_backend_page']
            );
            add_submenu_page(
                'wbk-main',
                __( 'Appearance', 'webba-booking-lite' ),
                __( 'Appearance', 'webba-booking-lite' ),
                'manage_options',
                'wbk-appearance',
                ['WBK_Renderer', 'render_backend_page']
            );
            add_submenu_page(
                'wbk-main',
                __( 'Email templates', 'webba-booking-lite' ),
                __( 'Email templates', 'webba-booking-lite' ),
                'manage_options',
                'wbk-email-templates',
                ['WBK_Renderer', 'render_backend_page']
            );
            add_submenu_page(
                'wbk-main',
                __( 'Pricing rules', 'webba-booking-lite' ),
                __( 'Pricing rules', 'webba-booking-lite' ),
                'manage_options',
                'wbk-pricing-rules',
                ['WBK_Renderer', 'render_backend_page']
            );
            $hook = add_submenu_page(
                'wbk-main',
                __( 'SETTINGS', 'webba-booking-lite' ),
                __( 'SETTINGS', 'webba-booking-lite' ),
                'manage_options',
                'wbk-options',
                ['WBK_Renderer', 'render_backend_page']
            );
            add_action( 'load-' . $hook, [$this, 'settings_updated'] );
            global $submenu;
            unset($submenu['wbk-main'][0]);
        }
    }

    protected function is_edit_page( $new_edit = null ) {
        global $pagenow;
        //make sure we are on the backend
        if ( !is_admin() ) {
            return false;
        }
        if ( $new_edit == 'edit' ) {
            return in_array( $pagenow, ['post.php'] );
        } elseif ( $new_edit == 'new' ) {
            return in_array( $pagenow, ['post-new.php'] );
        } else {
            return in_array( $pagenow, ['post.php', 'post-new.php'] );
        }
    }

    public function admin_notices() {
        echo WBK_Admin_Notices::setup_required();
        echo WBK_Admin_Notices::sms_compability();
        echo WBK_Admin_Notices::stripe_conflict();
    }

}
