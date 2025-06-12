<?php

//WBK stat class
// check if accessed directly
if ( !defined( 'ABSPATH' ) ) {
    exit;
}
class WBK_Admin_Notices {
    public static function labelUpdate() {
        return;
    }

    public static function colorUpdate() {
        return;
    }

    public static function appearanceUpdate() {
        if ( get_option( 'wbk_appearance_saved', '' ) != 'true' ) {
            return '<div class="notice notice-warning is-dismissible"><p>Webba Booking: Please setup appearance settings.
					</p><button type="button" class="notice-dismiss"><span class="screen-reader-text">Dismiss this notice.</span></button></div>';
        }
        return;
    }

    public static function updateNotice() {
        return '';
    }

    public static function wbk_4_0_update() {
        return '';
    }

    public static function sms_compability() {
        return '';
    }

    public static function stripe_conflict() {
    }

    public static function booking_form_label() {
        return '';
    }

    public static function setup_required() {
        if ( get_option( 'wbk_sms_setup_required', '' ) == 'true' || get_option( 'wbk_payments_setup_required', '' ) == 'true' || get_option( 'wbk_google_setup_required', '' ) == 'true' ) {
            WBK_Renderer::load_template( 'backend/after_setup_notice', null );
        }
    }

}
