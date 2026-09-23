<?php
if (!defined('ABSPATH')) {
    exit();
}

class WBK_Mollie
{
    public function init($referer = false, $booking_ids = [])
    {
        return false;
    }

    public static function get_currencies()
    {
        return [
            'AUD' => __('Australian Dollar', 'webba-booking-lite'),
            'BGN' => __('Bulgarian Lev', 'webba-booking-lite'),
            'BRL' => __('Brazilian Real', 'webba-booking-lite'),
            'CAD' => __('Canadian Dollar', 'webba-booking-lite'),
            'CHF' => __('Swiss Franc', 'webba-booking-lite'),
            'CZK' => __('Czech Koruna', 'webba-booking-lite'),
            'DKK' => __('Danish Krone', 'webba-booking-lite'),
            'EUR' => __('Euro', 'webba-booking-lite'),
            'GBP' => __('Pound Sterling', 'webba-booking-lite'),
            'HKD' => __('Hong Kong Dollar', 'webba-booking-lite'),
            'HUF' => __('Hungarian Forint', 'webba-booking-lite'),
            'ILS' => __('Israeli New Sheqel', 'webba-booking-lite'),
            'ISK' => __('Icelandic Krona', 'webba-booking-lite'),
            'JPY' => __('Japanese Yen', 'webba-booking-lite'),
            'MXN' => __('Mexican Peso', 'webba-booking-lite'),
            'MYR' => __('Malaysian Ringgit', 'webba-booking-lite'),
            'NOK' => __('Norwegian Krone', 'webba-booking-lite'),
            'NZD' => __('New Zealand Dollar', 'webba-booking-lite'),
            'PHP' => __('Philippine Peso', 'webba-booking-lite'),
            'PLN' => __('Polish Zloty', 'webba-booking-lite'),
            'RON' => __('Romanian Leu', 'webba-booking-lite'),
            'SEK' => __('Swedish Krona', 'webba-booking-lite'),
            'SGD' => __('Singapore Dollar', 'webba-booking-lite'),
            'THB' => __('Thai Baht', 'webba-booking-lite'),
            'TWD' => __('Taiwan New Dollar', 'webba-booking-lite'),
            'USD' => __('U.S. Dollar', 'webba-booking-lite'),
            'ZAR' => __('South African Rand', 'webba-booking-lite'),
        ];
    }

    public function create_payment_v6($booking_ids, $payment_details = null)
    {
        return false;
    }

    /**
     * Create a Mollie checkout payment for a gift card purchase.
     *
     * @param array $gift_card_data
     * @return array|false
     */
    public function create_gift_card_payment($gift_card_data)
    {
        return false;
    }

    public function complete_if_paid($payment_id)
    {
        return false;
    }

    public static function render_initial_form(
        $input,
        $payment_method,
        $booking_ids,
        $button_class
    ) {
        return $input;
    }
}
