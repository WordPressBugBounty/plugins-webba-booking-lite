<?php
if ( !defined( 'ABSPATH' ) ) exit;

$payment = $data[0];

$paypal_btn_text = esc_attr( trim( get_option( 'wbk_payment_approve_text', '' ) ) );

echo '<input type="button" class="wbk-button wbk-width-100 wbk-mt-10-mb-10 wbk-approval-link" data-link="' . esc_url( $payment[0]->getApprovalLink() ) . '"  value="' . $paypal_btn_text . '">';
