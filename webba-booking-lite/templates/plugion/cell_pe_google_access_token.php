<?php
if ( !defined( 'ABSPATH' ) ) exit;

$field = $data[0];
$slug = $data[1];
$value = $data[2];
$row = $data[3];
$calendar_id = $row['id'];

if ( wbk_fs()->is__premium_only() ) {
    if ( wbk_fs()->can_use_premium_code() ) {
        $credentials = array( get_option( 'wbk_gg_clientid', '' ),  get_option( 'wbk_gg_secret', '' ) );
        $credentials = apply_filters( 'wbk_gg_credentials', $credentials );
        $client_id =  $credentials[0];
        $client_secret = $credentials[1];
        if( $client_id  == '' || $client_secret == '' ){
            echo '<div class="authorization-message-wb failed-wb">
                    <div class="message-title-wb">' . __( 'Authorization failed', 'webba-booking-lite' ) . '</div>
                    <div class="message-subtitle-wb">' . __( 'Google API credentials not set', 'webba-booking-lite' ) . '</div>
                </div>';
            return;
        }
        $google = new WBK_Google();
        $google->init( $calendar_id );
        $connection_status =  $google->connect();
        $control_html = '<a target="_blank" class="wbk_google_auth_link" href="' .  get_admin_url()  . 'admin.php?page=wbk-gg-calendars&clid=' . $calendar_id . '">' . __( 'Manage authorization', 'webba-booking-lite' ) .'</a>';
        if ( $connection_status[0] == 1 ) {
            echo '<div class="authorization-message-wb successfull-wb">
                    <div class="message-title-wb">' .  __( 'Authorized', 'webba-booking-lite' ) . '</div>
                    <div class="message-subtitle-wb">' .  __( 'Calendar name on Google:', 'webba-booking-lite' ) . ' ' . $connection_status[1] . '. ' . $control_html . '</div>
                </div>';
        } elseif ( $connection_status[0] == 0 ) {
            echo '<div class="authorization-message-wb failed-wb">
                    <div class="message-title-wb">' . __( 'Authorization required', 'webba-booking-lite' ) . '</div>
                    <div class="message-subtitle-wb">' . __( 'Click on the link below to start the authorization process', 'webba-booking-lite' ) . '. ' . $control_html . '</div>
                    <div class="message-subtitle-wb">' .  __( 'Details: ', 'webba-booking-lite' ) . $connection_status[1] . '</div>
                </div>';
        } elseif ( $connection_status[0] == 2 ) {
            echo '<div class="authorization-message-wb failed-wb">
                    <div class="message-title-wb">' . __( 'Authorization failed', 'webba-booking-lite' ) . '</div>
                    <div class="message-subtitle-wb">' . __( 'Check Google API credentials, calendar ID and try to re-authorize this calendar', 'webba-booking-lite' ) . '. ' . $control_html . '</div>
                    <div class="message-subtitle-wb">' .  __( 'Details: ', 'webba-booking-lite' ) . $connection_status[1] . '</div>
                </div>';
        }
    }
}
