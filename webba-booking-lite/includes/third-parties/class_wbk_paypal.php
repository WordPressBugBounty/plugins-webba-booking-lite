<?php

if ( !defined( 'ABSPATH' ) ) {
    exit;
}
// webba booking PayPal integration class
use PayPal\Auth\OAuthTokenCredential;
use PayPal\Rest\ApiContext;
use PayPal\Api\Amount;
use PayPal\Api\Details;
use PayPal\Api\Item;
use PayPal\Api\ItemList;
use PayPal\Api\Payer;
use PayPal\Api\Payment;
use PayPal\Api\RedirectUrls;
use PayPal\Api\Transaction;
use PayPal\Api\ExecutePayment;
use PayPal\Api\PaymentExecution;
class WBK_PayPal {
    protected $apiContext;

    protected $currency;

    public $tax;

    protected $fee;

    protected $referer;

    protected $experience_profile_id;

    public function init( $referer, $booking_ids ) {
        return FALSE;
    }

    public function create_payment_on_paypal( $payment_details ) {
        return FALSE;
    }

    public function create_payment_v5( $booking_ids ) {
    }

    public function create_payment( $booking_ids, $coupon, $payment_details ) {
        return -1;
    }

    protected function createWebProfile() {
        return FALSE;
    }

    public function getWebProfileId() {
        return '';
    }

    public function execute_payment( $paymentId, $payerId ) {
        return false;
    }

    public static function render_initial_form(
        $input,
        $payment_method,
        $booking_ids,
        $button_class
    ) {
        if ( $payment_method == 'paypal' ) {
            return $input .= WBK_Renderer::load_template( 'frontend/paypal_init', array($booking_ids, $button_class), false );
        }
        return $input;
    }

    private function conversion( $price ) {
        if ( get_option( 'wbk_paypal_multiplier', '' ) == '' ) {
            return $price;
        } elseif ( filter_var( $multiplier, FILTER_VALIDATE_FLOAT ) && $multiplier > 0 ) {
            return number_format(
                floatval( $multiplier ) * floatval( $price ),
                2,
                '.',
                ''
            );
        }
        return $price;
    }

}
