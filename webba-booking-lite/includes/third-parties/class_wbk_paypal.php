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
        return false;
    }

    public function create_payment_on_paypal( $payment_details ) {
        return false;
    }

    public function create_payment_v5( $booking_ids ) {
    }

    public function create_payment( $booking_ids, $coupon, $payment_details ) {
        return -1;
    }

    protected function createWebProfile() {
        return false;
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
            return $input .= WBK_Renderer::load_template( 'frontend/paypal_init', [$booking_ids, $button_class], false );
        }
        return $input;
    }

    private function conversion( $price ) {
        $multiplier = get_option( 'wbk_paypal_multiplier', '' );
        if ( $multiplier == '' ) {
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

    public function execute_paypal_payment( $payment_id, $payer_id ) {
        if ( !wbk_fs()->is__premium_only() || !wbk_fs()->can_use_premium_code() ) {
            return false;
        }
        try {
            // Get the payment object from PayPal
            $payment = Payment::get( $payment_id, $this->apiContext );
            if ( !$payment ) {
                return false;
            }
            // Create payment execution object with payer ID
            $execution = new PaymentExecution();
            $execution->setPayerId( $payer_id );
            // Get booking IDs associated with this payment
            $booking_ids = WBK_Model_Utils::get_booking_ids_by_payment_id( $payment_id );
            if ( empty( $booking_ids ) ) {
                return false;
            }
            // Check for coupon
            $coupon_result = false;
            if ( count( $booking_ids ) > 0 ) {
                $booking = new WBK_Booking($booking_ids[0]);
                if ( $booking->is_loaded() ) {
                    $coupon_id = $booking->get( 'coupon' );
                    if ( !is_null( $coupon_id ) && is_numeric( $coupon_id ) && $coupon_id > 0 ) {
                        $coupon = new WBK_Coupon($coupon_id);
                        if ( $coupon->is_loaded() ) {
                            $coupon_result = [$coupon_id, $coupon->get( 'amount_fixed' ), $coupon->get( 'amount_percentage' )];
                        }
                    }
                }
            }
            // Get payment details
            $payment_details = WBK_Price_Processor::get_payment_items( $booking_ids, $this->tax, $coupon_result );
            // Set up transaction details
            $transaction = new Transaction();
            $amount = new Amount();
            $details = new Details();
            // Set payment details
            $details->setShipping( 0 )->setTax( $this->conversion( $payment_details['tax_to_pay'] ) )->setSubtotal( $this->conversion( $payment_details['subtotal'] ) );
            $amount->setCurrency( $this->currency )->setTotal( $this->conversion( $payment_details['total'] ) )->setDetails( $details );
            $transaction->setAmount( $amount );
            $execution->addTransaction( $transaction );
            // Execute the payment
            $result = $payment->execute( $execution, $this->apiContext );
            if ( $result ) {
                // Mark bookings as paid
                $booking_factory = new WBK_Booking_Factory();
                $booking_factory->set_as_paid( $booking_ids, 'PayPal', $payment_details['total'] );
                return true;
            }
            return false;
        } catch ( Exception $ex ) {
            return false;
        }
    }

}
