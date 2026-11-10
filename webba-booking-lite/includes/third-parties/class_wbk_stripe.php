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

    /**
     * Configure Stripe SDK with current credentials.
     *
     * @return true|array{success:false,error:string}
     */
    protected function configure_api() {
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
        }
        if ( $this->test_mode === false && $this->get_stripe_key_mode() !== 'live' ) {
            return [
                'success' => false,
                'error'   => __( 'Invalid Stripe live keys', 'webba-booking-lite' ),
            ];
        }
        return true;
    }

    /**
     * Create or reuse a Stripe Customer for off-session charging.
     *
     * @return array{success:bool,customer_id?:string,error?:string}
     */
    public function create_customer( string $email, string $name = '' ) {
        if ( !wbk_fs()->is__premium_only() || !wbk_fs()->can_use_premium_code() ) {
            return [
                'success' => false,
                'error'   => __( 'Payment method not supported', 'webba-booking-lite' ),
            ];
        }
        $configured = $this->configure_api();
        if ( $configured !== true ) {
            return $configured;
        }
        try {
            $params = [
                'email'    => $email,
                'metadata' => [
                    'wbk_source' => 'webba_booking',
                ],
            ];
            if ( $name !== '' ) {
                $params['name'] = $name;
            }
            $customer = \Stripe\Customer::create( $params );
            return [
                'success'     => true,
                'customer_id' => $customer->id,
            ];
        } catch ( Exception $e ) {
            return [
                'success' => false,
                'error'   => $e->getMessage(),
            ];
        }
    }

    /**
     * Create a SetupIntent for saving a card for future off-session use.
     *
     * @return array{success:bool,intent?:object,intent_id?:string,client_secret?:string,error?:string}
     */
    public function create_setup_intent( string $customer_id, string $payment_method = 'stripe' ) {
        if ( !wbk_fs()->is__premium_only() || !wbk_fs()->can_use_premium_code() ) {
            return [
                'success' => false,
                'error'   => __( 'Payment method not supported', 'webba-booking-lite' ),
            ];
        }
        $configured = $this->configure_api();
        if ( $configured !== true ) {
            return $configured;
        }
        try {
            $params = [
                'customer'             => $customer_id,
                'usage'                => 'off_session',
                'payment_method_types' => ['card'],
            ];
            if ( $payment_method === 'stripe_others' ) {
                $params['automatic_payment_methods'] = [
                    'enabled' => true,
                ];
                unset($params['payment_method_types']);
            }
            $intent = \Stripe\SetupIntent::create( $params );
            return [
                'success'       => true,
                'intent'        => $intent,
                'intent_id'     => $intent->id,
                'client_secret' => $intent->client_secret,
            ];
        } catch ( Exception $e ) {
            return [
                'success' => false,
                'error'   => $e->getMessage(),
            ];
        }
    }

    /**
     * Retrieve a SetupIntent.
     *
     * @return object|false
     */
    public function get_setup_intent( string $intent_id ) {
        $configured = $this->configure_api();
        if ( $configured !== true ) {
            return false;
        }
        try {
            return \Stripe\SetupIntent::retrieve( $intent_id, [] );
        } catch ( Exception $e ) {
            return false;
        }
    }

    /**
     * Create and confirm an off-session PaymentIntent for a saved payment method.
     *
     * @param array{
     *   amount:float|int,
     *   currency:string,
     *   customer:string,
     *   payment_method:string,
     *   description?:string,
     *   metadata?:array,
     *   receipt_email?:string,
     *   idempotency_key?:string
     * } $args
     * @return array{success:bool,intent?:object,error?:string,error_type?:string}
     */
    public function create_off_session_payment_intent( array $args ) {
        if ( !wbk_fs()->is__premium_only() || !wbk_fs()->can_use_premium_code() ) {
            return [
                'success'    => false,
                'error'      => __( 'Payment method not supported', 'webba-booking-lite' ),
                'error_type' => 'unsupported',
            ];
        }
        $configured = $this->configure_api();
        if ( $configured !== true ) {
            return array_merge( $configured, [
                'error_type' => 'config',
            ] );
        }
        $currency = strtolower( (string) ($args['currency'] ?? $this->currency) );
        $amount = $args['amount'] ?? 0;
        if ( WBK_Stripe::is_currency_zero_decimal( $currency ) ) {
            $safe_value = (int) round( floatval( $amount ) );
        } else {
            $safe_value = (int) round( floatval( $amount ) * 100 );
        }
        $params = [
            'amount'               => $safe_value,
            'currency'             => $currency,
            'customer'             => $args['customer'],
            'payment_method'       => $args['payment_method'],
            'off_session'          => true,
            'confirm'              => true,
            'payment_method_types' => ['card'],
        ];
        if ( !empty( $args['description'] ) ) {
            $params['description'] = $args['description'];
        }
        if ( !empty( $args['metadata'] ) && is_array( $args['metadata'] ) ) {
            $params['metadata'] = $args['metadata'];
        }
        if ( !empty( $args['receipt_email'] ) && filter_var( $args['receipt_email'], FILTER_VALIDATE_EMAIL ) ) {
            $params['receipt_email'] = $args['receipt_email'];
        }
        $opts = [];
        if ( !empty( $args['idempotency_key'] ) ) {
            $opts['idempotency_key'] = $args['idempotency_key'];
        }
        try {
            $intent = \Stripe\PaymentIntent::create( $params, $opts );
            return [
                'success' => true,
                'intent'  => $intent,
            ];
        } catch ( \Stripe\Exception\CardException $e ) {
            return [
                'success'    => false,
                'error'      => $e->getMessage(),
                'error_type' => 'card',
            ];
        } catch ( \Stripe\Exception\InvalidRequestException $e ) {
            $msg = $e->getMessage();
            $type = ( stripos( $msg, 'authentication' ) !== false ? 'authentication_required' : 'invalid_request' );
            return [
                'success'    => false,
                'error'      => $msg,
                'error_type' => $type,
            ];
        } catch ( \Stripe\Exception\ApiConnectionException $e ) {
            return [
                'success'    => false,
                'error'      => $e->getMessage(),
                'error_type' => 'network',
            ];
        } catch ( \Stripe\Exception\RateLimitException $e ) {
            return [
                'success'    => false,
                'error'      => $e->getMessage(),
                'error_type' => 'rate_limit',
            ];
        } catch ( Exception $e ) {
            $msg = $e->getMessage();
            $type = 'api';
            if ( stripos( $msg, 'authentication_required' ) !== false || stripos( $msg, 'requires authentication' ) !== false ) {
                $type = 'authentication_required';
            }
            return [
                'success'    => false,
                'error'      => $msg,
                'error_type' => $type,
            ];
        }
    }

    /**
     * Public REST URL Stripe should call for webhook events.
     */
    public static function get_webhook_url() : string {
        return rest_url( 'webba-booking/v1/stripe-webhook' );
    }

    /**
     * Whether a URL host is local / not reachable by Stripe webhooks.
     */
    public static function is_local_webhook_host( ?string $url = null ) : bool {
        $url = ( $url !== null && $url !== '' ? $url : self::get_webhook_url() );
        $host = wp_parse_url( $url, PHP_URL_HOST );
        if ( !$host ) {
            return true;
        }
        $host = strtolower( (string) $host );
        if ( in_array( $host, ['localhost', '127.0.0.1', '::1'], true ) ) {
            return true;
        }
        if ( substr( $host, -6 ) === '.local' || substr( $host, -5 ) === '.test' ) {
            return true;
        }
        if ( filter_var( $host, FILTER_VALIDATE_IP ) ) {
            return !filter_var( $host, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE );
        }
        return false;
    }

    /**
     * Option key for the Stripe webhook endpoint ID (test vs live).
     */
    public static function get_webhook_endpoint_option_key( bool $test_mode ) : string {
        return ( $test_mode ? 'wbk_stripe_webhook_endpoint_id_test' : 'wbk_stripe_webhook_endpoint_id_live' );
    }

    /**
     * Load Stripe API credentials without requiring currency/tax (webhook setup).
     *
     * @return bool
     */
    public function init_for_webhooks() : bool {
        if ( !(wbk_fs()->is__premium_only() && wbk_fs()->can_use_premium_code()) ) {
            return false;
        }
        \Stripe\Stripe::setAppInfo(
            'WordPress Webba Booking plugin',
            '5.0',
            'https://webba-booking.com/',
            'TECH-000370'
        );
        \Stripe\Stripe::setApiVersion( '2022-08-01' );
        $credentials = WBK_Options_Utils::get_stripe_credentials();
        $this->api_key = $credentials[0] ?? '';
        $this->api_sectet = $credentials[1] ?? '';
        $this->test_mode = $credentials[2] ?? false;
        $this->currency = get_option( 'wbk_stripe_currency', '' );
        $this->tax = get_option( 'wbk_stripe_tax', 0 );
        if ( $this->api_sectet === '' ) {
            return false;
        }
        \Stripe\Stripe::setApiKey( $this->api_sectet );
        return true;
    }

    /**
     * Normalize a webhook URL for comparison (scheme/host/path; ignore trailing slash).
     */
    private static function normalize_webhook_url( string $url ) : string {
        $parts = wp_parse_url( trim( $url ) );
        if ( !is_array( $parts ) || empty( $parts['host'] ) ) {
            return rtrim( strtolower( trim( $url ) ), '/' );
        }
        $scheme = strtolower( (string) ($parts['scheme'] ?? 'https') );
        $host = strtolower( (string) $parts['host'] );
        $path = ( isset( $parts['path'] ) ? rtrim( (string) $parts['path'], '/' ) : '' );
        return $scheme . '://' . $host . $path;
    }

    /**
     * Delete every Stripe webhook endpoint that targets the Webba webhook URL
     * (covers Dashboard-created duplicates the plugin did not track).
     */
    private function delete_webhook_endpoints_for_url( string $url ) : void {
        $target = self::normalize_webhook_url( $url );
        try {
            $endpoints = \Stripe\WebhookEndpoint::all( [
                'limit' => 100,
            ] );
        } catch ( Exception $e ) {
            return;
        }
        if ( !isset( $endpoints->data ) || !is_array( $endpoints->data ) ) {
            return;
        }
        foreach ( $endpoints->data as $endpoint ) {
            $endpoint_url = ( isset( $endpoint->url ) ? (string) $endpoint->url : '' );
            if ( $endpoint_url === '' || self::normalize_webhook_url( $endpoint_url ) !== $target ) {
                continue;
            }
            try {
                $endpoint->delete();
            } catch ( Exception $e ) {
                // Continue removing remaining matches.
            }
        }
    }

    /**
     * Create (or regenerate) a Stripe webhook endpoint and persist the signing secret.
     *
     * @param bool $regenerate Delete any previously provisioned endpoint and create a new one.
     * @return array|WP_Error { secret: string, url: string, endpoint_id: string }
     */
    public function provision_webhook_endpoint( bool $regenerate = false ) {
        if ( !$this->init_for_webhooks() ) {
            return new WP_Error('wbk_stripe_credentials', __( 'Configure your Stripe secret key before generating the webhook signing secret.', 'webba-booking-lite' ));
        }
        $url = self::get_webhook_url();
        $endpoint_option = self::get_webhook_endpoint_option_key( (bool) $this->test_mode );
        $existing_secret = trim( (string) get_option( 'wbk_stripe_webhook_secret', '' ) );
        $existing_endpoint_id = trim( (string) get_option( $endpoint_option, '' ) );
        if ( !$regenerate && $existing_secret !== '' ) {
            return [
                'secret'      => $existing_secret,
                'url'         => $url,
                'endpoint_id' => $existing_endpoint_id,
            ];
        }
        // Remove tracked endpoint and any other Stripe endpoints pointing at this URL
        // (manual Dashboard endpoints often cause signature mismatches after Regenerate).
        $this->delete_webhook_endpoints_for_url( $url );
        delete_option( $endpoint_option );
        try {
            $endpoint = \Stripe\WebhookEndpoint::create( [
                'url'            => $url,
                'enabled_events' => ['payment_intent.succeeded', 'payment_intent.payment_failed'],
                'description'    => 'Webba Booking delayed charges',
            ] );
        } catch ( Exception $e ) {
            return new WP_Error('wbk_stripe_webhook_create', $e->getMessage());
        }
        $secret = ( isset( $endpoint->secret ) ? (string) $endpoint->secret : '' );
        $endpoint_id = ( isset( $endpoint->id ) ? (string) $endpoint->id : '' );
        if ( $secret === '' || $endpoint_id === '' ) {
            return new WP_Error('wbk_stripe_webhook_create', __( 'Stripe did not return a webhook signing secret. Please try again.', 'webba-booking-lite' ));
        }
        update_option( 'wbk_stripe_webhook_secret', $secret );
        update_option( $endpoint_option, $endpoint_id );
        return [
            'secret'      => $secret,
            'url'         => $url,
            'endpoint_id' => $endpoint_id,
        ];
    }

    /**
     * Verify and construct a Stripe webhook event.
     *
     * @return object|WP_Error Stripe\Event
     */
    public function construct_webhook_event( string $payload, string $sig_header ) {
        $secret = trim( (string) get_option( 'wbk_stripe_webhook_secret', '' ) );
        if ( $secret === '' ) {
            return new WP_Error('wbk_stripe_webhook_secret', __( 'Stripe webhook secret is not configured.', 'webba-booking-lite' ));
        }
        // Webhook verification only needs the signing secret; still load API key if available.
        if ( empty( $this->api_sectet ) ) {
            $credentials = WBK_Options_Utils::get_stripe_credentials();
            $this->api_key = $credentials[0] ?? '';
            $this->api_sectet = $credentials[1] ?? '';
            $this->test_mode = $credentials[2] ?? false;
            $this->currency = get_option( 'wbk_stripe_currency', '' );
        }
        try {
            return \Stripe\Webhook::constructEvent( $payload, $sig_header, $secret );
        } catch ( \UnexpectedValueException $e ) {
            return new WP_Error('wbk_stripe_webhook_payload', $e->getMessage());
        } catch ( \Stripe\Exception\SignatureVerificationException $e ) {
            return new WP_Error('wbk_stripe_webhook_signature', $e->getMessage());
        } catch ( Exception $e ) {
            return new WP_Error('wbk_stripe_webhook', $e->getMessage());
        }
    }

}
