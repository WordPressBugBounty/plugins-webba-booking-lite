<?php

use WebbaBooking\Utilities\WBK_Options_Utils;
if ( !defined( 'ABSPATH' ) ) {
    exit;
}
/**
 * Webba Booking Square payment gateway.
 *
 * Mirrors the Stripe integration: tokenize on the booking form, then
 * create a payment server-side after the booking exists.
 */
class WBK_Square {
    protected $application_id;

    protected $access_token;

    protected $location_id;

    protected $test_mode;

    public $tax;

    protected $currency;

    public function init( $service_id = null ) {
        return false;
    }

    public static function get_currencies() {
        return [
            'USD',
            'CAD',
            'AUD',
            'GBP',
            'EUR',
            'JPY'
        ];
    }

    public static function is_currency_zero_decimal( $currency ) {
        return in_array( strtoupper( $currency ), ['JPY'], true );
    }

    /**
     * Public details needed to mount Square Web Payments SDK.
     *
     * @return array
     */
    public function get_frontend_details() {
        return [
            'application_id' => $this->application_id,
            'location_id'    => $this->location_id,
            'currency'       => $this->currency,
            'environment'    => ( $this->test_mode ? 'sandbox' : 'production' ),
        ];
    }

    /**
     * Create a pending Square payment reference for bookings.
     *
     * @param array $booking_ids
     * @param array $payment_details
     * @return array
     */
    public function create_pending_payment( array $booking_ids, array $payment_details ) {
        return [
            'success' => false,
            'error'   => __( 'Payment method not supported', 'webba-booking-lite' ),
        ];
    }

    /**
     * Charge a Square payment using a Web Payments SDK token.
     *
     * @param array  $booking_ids
     * @param array  $payment_details
     * @param string $source_id
     * @param string $idempotency_key
     * @param string $verification_token
     * @return array
     */
    public function charge(
        $booking_ids,
        $payment_details,
        $source_id,
        $idempotency_key,
        $verification_token = ''
    ) {
        return [0, __( 'Payment method not supported' )];
    }

    /**
     * Charge a Square payment for a gift card purchase.
     *
     * @param float  $amount
     * @param string $source_id
     * @param string $idempotency_key
     * @param string $verification_token
     * @param string $buyer_email
     * @return array [1, message, square_payment_id] on success, [0, message] on failure.
     */
    public function charge_gift_card(
        $amount,
        $source_id,
        $idempotency_key,
        $verification_token = '',
        $buyer_email = ''
    ) {
        return [0, __( 'Payment method not supported', 'webba-booking-lite' )];
    }

    /**
     * Create and complete a Square payment for the given amount.
     *
     * @param float  $amount
     * @param string $source_id
     * @param string $idempotency_key
     * @param string $verification_token
     * @param string $buyer_email
     * @param string $note
     * @return array{success:bool,payment_id?:string,error?:string}
     */
    protected function create_payment(
        $amount,
        $source_id,
        $idempotency_key,
        $verification_token,
        $buyer_email,
        $note
    ) {
        if ( self::is_currency_zero_decimal( $this->currency ) ) {
            $safe_value = (int) round( $amount );
        } else {
            $safe_value = (int) round( $amount * 100 );
        }
        $body = [
            'source_id'       => $source_id,
            'idempotency_key' => $idempotency_key,
            'amount_money'    => [
                'amount'   => $safe_value,
                'currency' => strtoupper( $this->currency ),
            ],
            'location_id'     => $this->location_id,
            'autocomplete'    => true,
            'note'            => $note,
        ];
        if ( !empty( $verification_token ) ) {
            $body['verification_token'] = $verification_token;
        }
        if ( !empty( $buyer_email ) && filter_var( $buyer_email, FILTER_VALIDATE_EMAIL ) ) {
            $body['buyer_email_address'] = $buyer_email;
        }
        $response = $this->api_request( 'payments', $body );
        if ( empty( $response['success'] ) ) {
            return [
                'success' => false,
                'error'   => ( isset( $response['error'] ) ? $response['error'] : __( 'unknown error', 'webba-booking-lite' ) ),
            ];
        }
        $payment = ( isset( $response['payment'] ) ? $response['payment'] : [] );
        $status = ( isset( $payment['status'] ) ? $payment['status'] : '' );
        if ( $status !== 'COMPLETED' && $status !== 'APPROVED' ) {
            return [
                'success' => false,
                'error'   => __( 'unknown error', 'webba-booking-lite' ),
            ];
        }
        return [
            'success'    => true,
            'payment_id' => ( isset( $payment['id'] ) ? $payment['id'] : $idempotency_key ),
        ];
    }

    public static function render_initial_form(
        $input,
        $payment_method,
        $booking_ids,
        $button_class
    ) {
        if ( $payment_method == 'square' ) {
            return $input;
        }
        return $input;
    }

    /**
     * POST to Square Payments API.
     *
     * @param string $endpoint
     * @param array  $body
     * @return array
     */
    protected function api_request( $endpoint, array $body ) {
        $base = ( $this->test_mode ? 'https://connect.squareupsandbox.com/v2/' : 'https://connect.squareup.com/v2/' );
        $response = wp_remote_post( $base . ltrim( $endpoint, '/' ), [
            'timeout' => 30,
            'headers' => [
                'Authorization'  => 'Bearer ' . $this->access_token,
                'Content-Type'   => 'application/json',
                'Square-Version' => '2024-01-18',
            ],
            'body'    => wp_json_encode( $body ),
        ] );
        if ( is_wp_error( $response ) ) {
            return [
                'success' => false,
                'error'   => $response->get_error_message(),
            ];
        }
        $code = wp_remote_retrieve_response_code( $response );
        $decoded = json_decode( wp_remote_retrieve_body( $response ), true );
        if ( !is_array( $decoded ) ) {
            return [
                'success' => false,
                'error'   => __( 'Invalid response from Square', 'webba-booking-lite' ),
            ];
        }
        if ( $code >= 200 && $code < 300 && isset( $decoded['payment'] ) ) {
            return [
                'success' => true,
                'payment' => $decoded['payment'],
            ];
        }
        return [
            'success' => false,
            'error'   => $this->get_customer_error_message( ( isset( $decoded['errors'] ) && is_array( $decoded['errors'] ) ? $decoded['errors'] : [] ) ),
        ];
    }

    /**
     * Convert Square API error codes into safe, customer-facing messages.
     *
     * Square's `detail` field is intended for developers and can contain
     * technical messages such as "Authorization error: 'CVV_FAILURE'".
     *
     * @param array $errors Square API error objects.
     * @return string
     */
    private function get_customer_error_message( array $errors ) {
        $messages = [
            'CVV_FAILURE'                  => __( 'The card security code is incorrect. Check the CVV and try again.', 'webba-booking-lite' ),
            'ADDRESS_VERIFICATION_FAILURE' => __( 'The billing address or postal code does not match the card. Check it and try again.', 'webba-booking-lite' ),
            'INSUFFICIENT_FUNDS'           => __( 'The card has insufficient funds. Use another card or contact your bank.', 'webba-booking-lite' ),
            'CARD_DECLINED'                => __( 'The card was declined. Use another card or contact your bank.', 'webba-booking-lite' ),
            'GENERIC_DECLINE'              => __( 'The card was declined. Use another card or contact your bank.', 'webba-booking-lite' ),
            'EXPIRATION_FAILURE'           => __( 'The card expiration date is incorrect. Check it and try again.', 'webba-booking-lite' ),
            'INVALID_EXPIRATION'           => __( 'The card expiration date is incorrect. Check it and try again.', 'webba-booking-lite' ),
            'CARD_EXPIRED'                 => __( 'The card has expired. Use another card.', 'webba-booking-lite' ),
            'PAN_FAILURE'                  => __( 'The card number is invalid. Check it and try again.', 'webba-booking-lite' ),
            'INVALID_CARD'                 => __( 'The card details are invalid. Check them and try again.', 'webba-booking-lite' ),
            'CARD_NOT_SUPPORTED'           => __( 'This card is not supported. Use another payment method.', 'webba-booking-lite' ),
            'INVALID_PIN'                  => __( 'The card PIN is incorrect. Check it and try again.', 'webba-booking-lite' ),
            'TRANSACTION_LIMIT'            => __( 'The card transaction limit was exceeded. Use another card or contact your bank.', 'webba-booking-lite' ),
            'PAYMENT_LIMIT_EXCEEDED'       => __( 'The payment limit was exceeded. Use another payment method.', 'webba-booking-lite' ),
            'TEMPORARY_ERROR'              => __( 'The payment service is temporarily unavailable. Please try again.', 'webba-booking-lite' ),
        ];
        foreach ( $errors as $error ) {
            $code = ( isset( $error['code'] ) ? strtoupper( (string) $error['code'] ) : '' );
            if ( isset( $messages[$code] ) ) {
                return $messages[$code];
            }
        }
        return __( 'The payment could not be completed. Check your card details or use another card.', 'webba-booking-lite' );
    }

}
