<?php
if ( !defined( 'ABSPATH' ) ) exit;

$booking_ids  = $data[0];
$button_class = $data[1];

$btn_text = esc_attr( get_option( 'wbk_woo_button_text', __( 'Add to cart', 'webba-booking-lite' ) ) );

echo '<input class="wbk-button wbk-width-100 wbk-mt-10-mb-10 wbk-payment-init wbk-payment-init-woo ' . esc_attr( $button_class ) .'" data-method="woocommerce" data-app-id="'. esc_attr( implode(',',  $booking_ids ) ) . '"  value="' . $btn_text . '  " type="button">';
