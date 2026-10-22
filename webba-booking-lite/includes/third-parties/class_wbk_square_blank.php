<?php
if (!defined('ABSPATH')) {
    exit();
}

class WBK_Square
{
    public $tax;

    public function init($service_id = null)
    {
        return false;
    }

    public static function get_currencies()
    {
        return ['USD', 'CAD', 'AUD', 'GBP', 'EUR', 'JPY'];
    }

    public static function is_currency_zero_decimal($currency)
    {
        return in_array(strtoupper($currency), ['JPY'], true);
    }

    public function get_frontend_details()
    {
        return [];
    }

    public function create_pending_payment(array $booking_ids, array $payment_details)
    {
        return [
            'success' => false,
            'error' => __('Payment method not supported', 'webba-booking-lite'),
        ];
    }

    public function charge(
        $booking_ids,
        $payment_details,
        $source_id,
        $idempotency_key,
        $verification_token = ''
    ) {
        return [0, __('Payment method not supported')];
    }

    /**
     * Square gift card payments are not available in the lite version.
     *
     * @param float  $amount
     * @param string $source_id
     * @param string $idempotency_key
     * @param string $verification_token
     * @param string $buyer_email
     * @return array
     */
    public function charge_gift_card(
        $amount,
        $source_id,
        $idempotency_key,
        $verification_token = '',
        $buyer_email = ''
    ) {
        return [0, __('Payment method not supported', 'webba-booking-lite')];
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
