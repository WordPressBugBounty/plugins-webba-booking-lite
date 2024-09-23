<?php
if ( !defined( 'ABSPATH' ) ) exit;

$data =  $data[0];

$html = '<div class="wbk-details-sub-title">' . esc_html( get_option( 'wbk_payment_details_title', 'Payment details' ) ) . '</div>';
$html .= '<hr class="wbk-form-separator">';

$i = 0;
foreach( $data['item_names'] as $item_name ){
    $price = $data['quantities'][$i] * $data['prices'][$i];
    $html .= '<div class="wbk-col-9-12 wbk-amount-label">' . esc_html( $item_name ) .' <span class="wbk_payment_details_qty">('. esc_html( $data['quantities'][$i] ) . ')</span></div>';
    $html .= '<div class="wbk-col-3-12 wbk-amount-label wbk-align-right">'. WBK_Format_Utils::format_price( $price ) .'</div>';
    $html .= '<div class="wbk-clear"></div>';
    $i++;
}
/*
if( is_numeric( $data['amount_of_discount'] ) && $data['amount_of_discount'] > 0 ){
    $html .= '<div class="wbk-col-9-12 wbk-amount-label">' . esc_html( get_option( 'wbk_payment_discount_item', __( 'Discount', 'webba-booking-lite' ) ) ) . '</div>';
    $html .= '<div class="wbk-col-3-12 wbk-amount-label wbk-align-right">'. WBK_Format_Utils::format_price( $data['amount_of_discount'] ) .'</div>';
    $html .= '<div class="wbk-clear"></div>';
}
*/
$html .= '<div class="wbk-col-9-12 wbk-amount-label">' . esc_html( get_option( 'wbk_payment_subtotal_title', '' ) ) . '</div>';
$html .= '<div class="wbk-col-3-12 wbk-amount-label wbk-align-right">'. WBK_Format_Utils::format_price( $data['subtotal'] ) .'</div>';
$html .= '<div class="wbk-clear"></div>';

if( is_numeric( $data['tax_to_pay'] ) && $data['tax_to_pay'] > 0 ){
     
    $html .= '<div class="wbk-col-9-12 wbk-amount-label">' . esc_html( get_option( 'wbk_tax_label', __( 'Tax', 'webba-booking-lite' ) )  ) . '</div>';
    $html .= '<div class="wbk-col-3-12 wbk-amount-label wbk-align-right">'. WBK_Format_Utils::format_price( $data['tax_to_pay'] ) .'</div>';
    $html .= '<div class="wbk-clear"></div>';
}

$html .= '<hr class="wbk-form-separator">';
$html .= '<div class="wbk-col-9-12 wbk-amount-label"><strong>'. esc_html( get_option( 'wbk_payment_total_title', '' ) ) .'</strong></div>';
$html .= '<div class="wbk-col-3-12 wbk-amount-label wbk-align-right"><strong>' . WBK_Format_Utils::format_price( $data['total'] ) . '</strong></div>';

echo $html;
