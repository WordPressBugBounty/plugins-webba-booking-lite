<?php

use WebbaBooking\Utilities\WBK_Options_Utils;
if ( !defined( 'ABSPATH' ) ) {
    exit;
}
// Webba Booking Stripe integration class
class WBK_Stripe {
    protected $api_key;

    protected $api_sectet;

    protected $test_mode;

    public $tax;

    protected $currency;

    public function init( $service_id ) {
        return false;
    }

    public static function get_currencies() {
        return [
            'USD',
            'AED',
            'AFN',
            'ALL',
            'AMD',
            'ANG',
            'AOA',
            'ARS',
            'AUD',
            'AWG',
            'AZN',
            'BAM',
            'BBD',
            'BDT',
            'BGN',
            'BIF',
            'BMD',
            'BND',
            'BOB',
            'BRL',
            'BSD',
            'BWP',
            'BZD',
            'CAD',
            'CDF',
            'CHF',
            'CLP',
            'CNY',
            'COP',
            'CRC',
            'CVE',
            'CZK',
            'DJF',
            'DKK',
            'DOP',
            'DZD',
            'EGP',
            'ETB',
            'EUR',
            'FJD',
            'FKP',
            'GBP',
            'GEL',
            'GIP',
            'GMD',
            'GNF',
            'GTQ',
            'GYD',
            'HKD',
            'HNL',
            'HRK',
            'HTG',
            'HUF',
            'IDR',
            'ILS',
            'INR',
            'ISK',
            'JMD',
            'JPY',
            'KES',
            'KGS',
            'KHR',
            'KMF',
            'KRW',
            'KYD',
            'KZT',
            'LAK',
            'LBP',
            'LKR',
            'LRD',
            'LSL',
            'MAD',
            'MDL',
            'MGA',
            'MKD',
            'MMK',
            'MNT',
            'MOP',
            'MRO',
            'MUR',
            'MVR',
            'MWK',
            'MXN',
            'MYR',
            'MZN',
            'NAD',
            'NGN',
            'NIO',
            'NOK',
            'NPR',
            'NZD',
            'PAB',
            'PEN',
            'PGK',
            'PHP',
            'PKR',
            'PLN',
            'PYG',
            'QAR',
            'RON',
            'RSD',
            'RUB',
            'RWF',
            'SAR',
            'SBD',
            'SCR',
            'SEK',
            'SGD',
            'SHP',
            'SLL',
            'SOS',
            'SRD',
            'STD',
            'SVC',
            'SZL',
            'THB',
            'TJS',
            'TOP',
            'TRY',
            'TTD',
            'TWD',
            'TZS',
            'UAH',
            'UGX',
            'UYU',
            'UZS',
            'VND',
            'VUV',
            'WST',
            'XAF',
            'XCD',
            'XOF',
            'XPF',
            'YER',
            'ZAR',
            'ZMW'
        ];
    }

    public static function is_currency_zero_decimal( $currency ) {
        $arr_list = [
            'MGA',
            'BIF',
            'CLP',
            'PYG',
            'DJF',
            'RWF',
            'GNF',
            'JPY',
            'VND',
            'VUV',
            'XAF',
            'KMF',
            'KRW',
            'XOF',
            'XPF'
        ];
        if ( in_array( $currency, $arr_list ) ) {
            return true;
        } else {
            return false;
        }
    }

    public function create_payment_intent(
        string $payment_method,
        string $user_email,
        array $payment_details,
        $payment_method_id = null
    ) {
        return [
            'success' => false,
            'error'   => __( 'Payment method not supported', 'webba-booking-lite' ),
        ];
    }

    /**
     * Update payment intent
     *
     * @param string $intent_id
     * @param array $params
     * @return void
     */
    public function update_payment_intent( string $intent_id, array $params ) {
        try {
            \Stripe\Stripe::setAppInfo(
                'WordPress Webba Booking plugin',
                '6.2',
                'https://webba-booking.com/',
                'TECH-000370'
            );
            \Stripe\Stripe::setApiVersion( '2022-08-01' );
            \Stripe\Stripe::setApiKey( $this->api_sectet );
            if ( $this->test_mode === true && $this->get_stripe_key_mode() !== 'test' ) {
                return [
                    'success' => false,
                    'error'   => __( 'Invalid Stripe test keys', 'webba-booking-lite' ),
                ];
            } else {
                if ( $this->test_mode === false && $this->get_stripe_key_mode() !== 'live' ) {
                    return [
                        'success' => false,
                        'error'   => __( 'Invalid Stripe live keys', 'webba-booking-lite' ),
                    ];
                }
            }
            $payment_intent = \Stripe\PaymentIntent::update( $intent_id, $params );
            if ( $payment_intent ) {
                return [
                    'success' => true,
                    'data'    => $payment_intent,
                ];
            }
            return [
                'success' => false,
                'error'   => __( 'Payment intent not found', 'webba-booking-lite' ),
            ];
        } catch ( Exception $e ) {
            return [
                'success' => false,
                'error'   => $e->getMessage(),
            ];
        }
    }

    /**
     * Get payment intent
     * @param string $intent_id
     */
    public function get_payment_intent( string $intent_id ) {
        try {
            \Stripe\Stripe::setAppInfo(
                'WordPress Webba Booking plugin',
                '6.2',
                'https://webba-booking.com/',
                'TECH-000370'
            );
            \Stripe\Stripe::setApiVersion( '2022-08-01' );
            \Stripe\Stripe::setApiKey( $this->api_sectet );
            if ( $this->test_mode === true && $this->get_stripe_key_mode() !== 'test' ) {
                return [
                    'success' => false,
                    'error'   => __( 'Invalid Stripe test keys', 'webba-booking-lite' ),
                ];
            } else {
                if ( $this->test_mode === false && $this->get_stripe_key_mode() !== 'live' ) {
                    return [
                        'success' => false,
                        'error'   => __( 'Invalid Stripe live keys', 'webba-booking-lite' ),
                    ];
                }
            }
            $intent = Stripe\PaymentIntent::retrieve( $intent_id, [] );
            return $intent;
        } catch ( Exception $e ) {
            return false;
        }
    }

    public function charge(
        $booking_ids,
        $payment_details,
        $payment_id,
        $intent_id = null
    ) {
        return [0, __( 'Payment method not supported' )];
    }

    public function charge_v5(
        $booking_ids,
        $payment_details,
        $method_id,
        $intent_id = null
    ) {
        return [0, __( 'Payment method not supported' )];
    }

    public static function render_initial_form(
        $input,
        $payment_method,
        $booking_ids,
        $button_class
    ) {
        if ( $payment_method == 'stripe' ) {
            return $input .= WBK_Renderer::load_template( 'frontend/stripe_init', [$booking_ids, $button_class], false );
        }
        return $input;
    }

    /**
     * Get the Stripe key mode (test or live)
     *
     * @return string 'test', 'live' or 'invalid'
     */
    public function get_stripe_key_mode() : string {
        if ( strpos( $this->api_sectet, 'sk_test_' ) === 0 ) {
            return 'test';
        } elseif ( strpos( $this->api_sectet, 'sk_live_' ) === 0 ) {
            return 'live';
        }
        return 'invalid';
    }

}
