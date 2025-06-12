<?php
if ( !defined( 'ABSPATH' ) ) exit;

$booking_ids  = $data[0];
$button_class = $data[1];

$stripe_btn_text = esc_attr( get_option( 'wbk_stripe_button_text', '' ) );

echo '<input class="wbk-button wbk-width-100 wbk-mt-10-mb-10 wbk-payment-init '. esc_attr( $button_class ) .'" data-method="stripe" data-app-id="'. esc_attr( implode(',', $booking_ids ) ) . '"  value="' . $stripe_btn_text . '" type="button">';
