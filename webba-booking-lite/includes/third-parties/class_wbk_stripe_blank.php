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
}
?>
