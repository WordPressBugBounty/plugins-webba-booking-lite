<?php
if ( !defined( 'ABSPATH' ) ) exit;

$booking_ids  = $data[0];
$button_class = $data[1];

$paypal_btn_text = esc_attr( get_option( 'wbk_payment_pay_with_paypal_btn_text', '' ) );

echo '<input class="wbk-button wbk-width-100 wbk-mt-10-mb-10 wbk-payment-init ' . esc_attr( $button_class ) .'" data-method="paypal" data-app-id="'. esc_attr( implode(',',  $booking_ids ) ) . '"  value="' . $paypal_btn_text . '  " type="button">';
