<?php

use WebbaBooking\Utilities\WBK_Options_Utils;
if ( !defined( 'ABSPATH' ) ) {
    exit;
}
class WBK_Mollie {
    /**
     * @var \Mollie\Api\MollieApiClient|null
     */
    protected $client;

    protected $currency;

    protected $test_mode;

    protected $referer;

    public function init( $referer = false, $booking_ids = [] ) {
        return false;
    }

    public static function get_currencies() {
        return [
            'AUD' => __( 'Australian Dollar', 'webba-booking-lite' ),
            'BGN' => __( 'Bulgarian Lev', 'webba-booking-lite' ),
            'BRL' => __( 'Brazilian Real', 'webba-booking-lite' ),
            'CAD' => __( 'Canadian Dollar', 'webba-booking-lite' ),
            'CHF' => __( 'Swiss Franc', 'webba-booking-lite' ),
            'CZK' => __( 'Czech Koruna', 'webba-booking-lite' ),
            'DKK' => __( 'Danish Krone', 'webba-booking-lite' ),
            'EUR' => __( 'Euro', 'webba-booking-lite' ),
            'GBP' => __( 'Pound Sterling', 'webba-booking-lite' ),
            'HKD' => __( 'Hong Kong Dollar', 'webba-booking-lite' ),
            'HUF' => __( 'Hungarian Forint', 'webba-booking-lite' ),
            'ILS' => __( 'Israeli New Sheqel', 'webba-booking-lite' ),
            'ISK' => __( 'Icelandic Krona', 'webba-booking-lite' ),
            'JPY' => __( 'Japanese Yen', 'webba-booking-lite' ),
            'MXN' => __( 'Mexican Peso', 'webba-booking-lite' ),
            'MYR' => __( 'Malaysian Ringgit', 'webba-booking-lite' ),
            'NOK' => __( 'Norwegian Krone', 'webba-booking-lite' ),
            'NZD' => __( 'New Zealand Dollar', 'webba-booking-lite' ),
            'PHP' => __( 'Philippine Peso', 'webba-booking-lite' ),
            'PLN' => __( 'Polish Zloty', 'webba-booking-lite' ),
            'RON' => __( 'Romanian Leu', 'webba-booking-lite' ),
            'SEK' => __( 'Swedish Krona', 'webba-booking-lite' ),
            'SGD' => __( 'Singapore Dollar', 'webba-booking-lite' ),
            'THB' => __( 'Thai Baht', 'webba-booking-lite' ),
            'TWD' => __( 'Taiwan New Dollar', 'webba-booking-lite' ),
            'USD' => __( 'U.S. Dollar', 'webba-booking-lite' ),
            'ZAR' => __( 'South African Rand', 'webba-booking-lite' ),
        ];
    }

    public static function is_currency_zero_decimal( $currency ) {
        return in_array( strtoupper( $currency ), ['ISK', 'JPY'], true );
    }

    public static function format_amount( $amount, $currency ) {
        if ( self::is_currency_zero_decimal( $currency ) ) {
            return (string) intval( round( (float) $amount ) );
        }
        return number_format(
            (float) $amount,
            2,
            '.',
            ''
        );
    }

    public function create_payment_v6( $booking_ids, $payment_details = null ) {
        return false;
    }

    /**
     * Create a Mollie checkout payment for a gift card purchase.
     *
     * @param array $gift_card_data Sanitized gift card payload (must include amount).
     * @return array|false { payment_url, payment_id } or false
     */
    public function create_gift_card_payment( $gift_card_data ) {
        return false;
    }

    /**
     * Fetch the payment from Mollie and mark bookings paid when status is paid.
     *
     * @param string $payment_id
     * @return string|false Payment status or false on failure.
     */
    public function complete_if_paid( $payment_id ) {
        return false;
    }

    /**
     * Create a gift card from a paid Mollie payment when no booking rows exist.
     *
     * @param \Mollie\Api\Resources\Payment $payment
     * @return string Payment status.
     */
    protected function complete_gift_card_if_paid( $payment ) {
        $payment_id = (string) $payment->id;
        $existing = WBK_Gift_Card::find_by_payment_id( $payment_id );
        if ( $existing ) {
            return ( $payment->isPaid() ? 'paid' : $payment->status );
        }
        $pending = WBK_Gift_Card::get_pending_order( $payment_id );
        $is_gift_card = is_array( $pending ) && ($pending['type'] ?? '') === 'gift_card' && !empty( $pending['gift_card'] );
        if ( !$is_gift_card ) {
            $metadata_type = '';
            if ( !empty( $payment->metadata->type ) ) {
                $metadata_type = (string) $payment->metadata->type;
            }
            if ( $metadata_type !== 'gift_card' ) {
                return $payment->status;
            }
        }
        if ( !$payment->isPaid() ) {
            return $payment->status;
        }
        if ( !$is_gift_card ) {
            return $payment->status;
        }
        $result = WBK_Gift_Card::create_from_paid_order( $pending['gift_card'], 'mollie', $payment_id );
        if ( !empty( $result['success'] ) ) {
            WBK_Gift_Card::delete_pending_order( $payment_id );
            return 'paid';
        }
        return $payment->status;
    }

    public static function render_initial_form(
        $input,
        $payment_method,
        $booking_ids,
        $button_class
    ) {
        return $input;
    }

    protected function get_key_mode( $api_key ) {
        if ( strpos( $api_key, 'test_' ) === 0 ) {
            return 'test';
        }
        if ( strpos( $api_key, 'live_' ) === 0 ) {
            return 'live';
        }
        return 'invalid';
    }

    protected function get_base_url() {
        if ( is_string( $this->referer ) && $this->referer !== '' ) {
            $parts = explode( '?', $this->referer );
            return $parts[0];
        }
        $referer = wp_get_referer();
        if ( $referer ) {
            $parts = explode( '?', $referer );
            return $parts[0];
        }
        return home_url( '/' );
    }

    protected function get_webhook_url() {
        $webhook_url = rest_url( 'webba-booking/v1/mollie-webhook' );
        $host = wp_parse_url( $webhook_url, PHP_URL_HOST );
        if ( !$host || in_array( $host, ['localhost', '127.0.0.1'], true ) || substr( $host, -6 ) === '.local' || substr( $host, -5 ) === '.test' ) {
            return '';
        }
        return $webhook_url;
    }

    protected function bookings_already_paid( $booking_ids ) {
        foreach ( $booking_ids as $booking_id ) {
            $booking = new WBK_Booking($booking_id);
            if ( !$booking->is_loaded() ) {
                continue;
            }
            if ( floatval( $booking->get( 'amount_paid' ) ) > 0 ) {
                return true;
            }
        }
        return false;
    }

}
