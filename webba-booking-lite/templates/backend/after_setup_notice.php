<?php

if ( !defined( 'ABSPATH' ) ) {
    exit;
}
$logo_path = WP_WEBBA_BOOKING__PLUGIN_URL . '/freemius/assets/img/webba-booking-lite.png';
if ( isset( $_GET['page'] ) && $_GET['page'] == 'wbk-options' ) {
    return '';
}
$output = '';
$what_to_do = array();
if ( get_option( 'wbk_sms_setup_required', '' ) == 'true' ) {
    if ( get_option( 'wbk_twilio_account_sid', '' ) == '' ) {
        $what_to_do[] = 'SMS notifications';
    }
}
if ( get_option( 'wbk_payments_setup_required', '' ) == 'true' ) {
    if ( get_option( 'wbk_stripe_publishable_key', '' ) == '' && get_option( 'wbk_paypal_sandbox_clientid', '' ) == '' && get_option( 'wbk_woo_product_id', '' ) == '' ) {
        $what_to_do[] = 'online payments';
    }
}
if ( get_option( 'wbk_google_setup_required', '' ) == 'true' ) {
    if ( get_option( 'wbk_gg_clientid', '' ) == '' ) {
        $what_to_do[] = 'Google Calendar integration';
    }
}
if ( count( $what_to_do ) == 0 ) {
    return '';
}
if ( $output == '' ) {
    $output = 'The ' . implode( ', ', $what_to_do ) . ' requires a Webba Premium subscription. You can <a target="_blank" rel="noopener" href="https://webba-booking.com/pricing/" ><strong>upgrade your plan here</strong></a>.';
    $output .= '<p><a class="button button-primary wbk_notice_button" href="https://webba-booking.com/pricing/" target="_blank" rel="noopener">Upgrade to Webba Premium</a>';
    $output .= '<a class="button button-secondary" style="margin-left:3px;" onclick="wbk_hide_admin_notice(\'wbk_after_setup_notice\')" href="#">Maybe later</a></p>';
}
?>
<div style="margin-top:25px;" class="notice notice-info is-dismissible wbk_notice wbk_after_setup_notice"
    data-nonce="<?php 
echo wp_create_nonce( 'wbkb_nonce' );
?>">
    <div style="display:block; float: left;">
        <img src="<?php 
echo $logo_path;
?>" style="width:75px;height:75px">
    </div>
    <div style="display:block; float: left; margin-left: 20px;">
        <p><strong>Webba Booking:</strong> </p>

        <?php 
echo $output;
?>
        <button type="button" class="notice-dismiss">
            <span class="screen-reader-text">

            </span>
        </button>
    </div>
    <div style="clear:both"></div>
</div>