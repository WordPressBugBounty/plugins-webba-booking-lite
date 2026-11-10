<?php
if (!defined('ABSPATH')) {
    exit();
}
// webba booking Stripe integration class
class WBK_Stripe
{
    protected $api_key;
    protected $api_sectet;
    protected $tax;
    protected $currency;

    public function init($service_id)
    {
        return false;
    }
    public static function get_currencies()
    {
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
            'ZMW',
        ];
    }
    public static function is_currency_zero_decimal($currency)
    {
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
            'XPF',
        ];
        if (in_array($currency, $arr_list)) {
            return true;
        } else {
            return false;
        }
    }

    public function charge($app_ids, $amount, $payment_id, $intent_id = null)
    {
        return [0, __('Payment method not supported')];
    }

    public static function render_initial_form(
        $input,
        $payment_method,
        $booking_ids,
        $button_class
    ) {
        return $input;
    }
    public function create_payment_intent($booking_ids, $payment_details) {}

    public function create_customer(string $email, string $name = '')
    {
        return [
            'success' => false,
            'error' => __('Payment method not supported', 'webba-booking-lite'),
        ];
    }

    public function create_setup_intent(string $customer_id, string $payment_method = 'stripe')
    {
        return [
            'success' => false,
            'error' => __('Payment method not supported', 'webba-booking-lite'),
        ];
    }

    public function get_setup_intent(string $intent_id)
    {
        return false;
    }

    public function create_off_session_payment_intent(array $args)
    {
        return [
            'success' => false,
            'error' => __('Payment method not supported', 'webba-booking-lite'),
            'error_type' => 'unsupported',
        ];
    }

    public function construct_webhook_event(string $payload, string $sig_header)
    {
        return new WP_Error(
            'wbk_stripe_unavailable',
            __('Payment method not supported', 'webba-booking-lite')
        );
    }

    public static function get_webhook_url(): string
    {
        return rest_url('webba-booking/v1/stripe-webhook');
    }

    public static function is_local_webhook_host(?string $url = null): bool
    {
        $url = $url !== null && $url !== '' ? $url : self::get_webhook_url();
        $host = wp_parse_url($url, PHP_URL_HOST);
        if (!$host) {
            return true;
        }

        $host = strtolower((string) $host);
        if (in_array($host, ['localhost', '127.0.0.1', '::1'], true)) {
            return true;
        }
        if (substr($host, -6) === '.local' || substr($host, -5) === '.test') {
            return true;
        }
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return !filter_var(
                $host,
                FILTER_VALIDATE_IP,
                FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
            );
        }

        return false;
    }

    public static function get_webhook_endpoint_option_key(bool $test_mode): string
    {
        return $test_mode
            ? 'wbk_stripe_webhook_endpoint_id_test'
            : 'wbk_stripe_webhook_endpoint_id_live';
    }

    public function init_for_webhooks(): bool
    {
        return false;
    }

    public function provision_webhook_endpoint(bool $regenerate = false)
    {
        return new WP_Error(
            'wbk_stripe_credentials',
            __(
                'Configure your Stripe secret key before generating the webhook signing secret.',
                'webba-booking-lite'
            )
        );
    }
}
?>
