<?php
if ( !defined( 'ABSPATH' ) ) exit;

echo esc_html( get_option( 'wbk_pay_on_arrival_message', __( 'Your booking should be paid on arrival', 'webba-booking-lite' ) ) );

?>
