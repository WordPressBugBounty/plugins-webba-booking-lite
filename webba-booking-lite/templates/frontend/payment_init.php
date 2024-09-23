<?php
if ( !defined( 'ABSPATH' ) ) exit;
$payment_methods = $data[0];
$booking_ids = $data[1];
$button_class = $data[2];
 

$payment_init_html = '';

if( get_option( 'wbk_allow_coupons', 'disabled' ) == 'enabled' ){
    $payment_init_html .= '<input class="wbk-input" id="wbk-coupon" placeholder="' . esc_attr( WBK_Validator::alfa_numeric( get_option( 'wbk_coupon_field_placeholder',  __( 'coupon code', 'webba-booking-lite' ) ) ) ). '" >';
}
foreach( $payment_methods as $payment_method ){
    $payment_init_html = apply_filters( 'wbk_payment_method_init', $payment_init_html, $payment_method, $booking_ids, $button_class );
    if( $payment_method == 'arrival'  ){
		$button_text = esc_html( get_option( 'wbk_pay_on_arrival_button_text', __( 'Pay on arrival', 'webba-booking-lite' ) ) );
		$payment_init_html .= '<input class="wbk-button wbk-width-100 wbk-mt-10-mb-10 wbk-payment-init wbk-payment-on-booking-init" data-method="arrival" data-app-id="'. esc_html( implode(',',  $booking_ids ) ) . '"  value="' . $button_text . '  " type="button">';
	}
	if( $payment_method == 'bank' ){
		$button_text = esc_html( get_option( 'wbk_bank_transfer_button_text', __( 'Pay by bank transfer', 'webba-booking-lite' ) ) );
		$payment_init_html .= '<input class="wbk-button wbk-width-100 wbk-mt-10-mb-10 wbk-payment-init wbk-payment-on-booking-init" data-method="bank" data-app-id="'. esc_html( implode(',',  $booking_ids ) ) . '"  value="' . $button_text . '  " type="button">';
	}
}
if( $button_class != 'wbk_payment_button_afterform' ){
?>
	<div class="wbk-outer-container wbk_booking_form_container">
		<div class="wbk-inner-container">
			<div class="wbk-frontend-row">
				<div class="wbk-col-12-12">
					<div class="wbk-input-label">
<?php			
}	
				echo $payment_init_html . '<div class="wbk-frontend-row wbk_payment" id="wbk-payment"></div>';
if( $button_class != 'wbk_payment_button_afterform' ){
?>
				</div>
			</div>
		</div>
	</div>
</div>
<?php
}
?>