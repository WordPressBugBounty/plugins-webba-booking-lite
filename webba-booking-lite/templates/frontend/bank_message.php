<?php
if ( !defined( 'ABSPATH' ) ) exit;

$booking_ids =       $data[0];
$html = esc_html( get_option( 'wbk_bank_transfer_message', __( 'Pay with a bank transfer', 'webba-booking-lite' ) ) );
echo apply_filters( 'wbk_bank_transfer_message', $html, $booking_ids );





?>
