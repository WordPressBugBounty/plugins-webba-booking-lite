<?php
namespace WebbaBooking\Utilities;

defined('ABSPATH') or exit;

/**
 * It contains utility functions to get the options from the database based on logical operations
 *
 * @package WebbaBooking
 */
class WBK_Options_Utils
{
    /**
     * Get the Stripe credentials
     *
     * @return array
     */
    public static function get_stripe_credentials(): array
    {
        $test_mode = get_option('wbk_stripe_test_mode', '');
        if ($test_mode === 'yes') {
            return [
                trim(get_option('wbk_stripe_sandbox_publishable_key')),
                trim(get_option('wbk_stripe_sandbox_secret_key')),
                true
            ];
        }

        return [
            trim(get_option('wbk_stripe_publishable_key')),
            trim(get_option('wbk_stripe_secret_key')),
            false
        ];
    }

    /**
     * Get the Stripe redirect URL
     *
     * @return string
     */
    public static function get_stripe_redirect_url(): string
    {
        $redirect_url = get_option('wbk_stripe_redirect_url_new', '');

        if ($redirect_url && is_numeric($redirect_url)) {
            return get_permalink($redirect_url);
        }

        return '';
    }

    /**
     * Get the PayPal redirect URL
     *
     * @return string
     */
    public static function get_paypal_redirect_url(): string
    {
        $redirect_url = get_option('wbk_paypal_redirect_url_new', '');
        if ($redirect_url && is_numeric($redirect_url)) {
            return get_permalink($redirect_url);
        }

        return '';
    }

    /**
     * Get the PayPal credentials
     *
     * @return array
     */
    public static function get_paypal_credentials(): array
    {
        $test_mode = get_option('wbk_paypal_test_mode', '');
        if ($test_mode === 'yes') {
            return [
                trim(get_option('wbk_paypal_sandbox_clientid')),
                trim(get_option('wbk_paypal_sandbox_secret')),
                true
            ];
        }

        return [
            trim(get_option('wbk_paypal_live_clientid')),
            trim(get_option('wbk_paypal_live_secret')),
            false
        ];
    }

    /**
     * Get the tax amount
     *
     * @return float
     */
    public static function get_tax(): float
    {
        $tax_enabled = get_option('wbk_add_tax_on_top', '');
        $tax         = 0;

        if ($tax_enabled == 'yes') {
            $tax = get_option('wbk_general_tax', '0');

            if (trim($tax) == '') {
                $tax = '0';
            }

            $tax = floatval($tax);

            if ($tax <= 0) {
                $tax = 0;
            }
        }

        return $tax;
    }

    /**
     * Get the global step for the service
     * If the step is 'duration', return the duration
     * If the step is a number, return the step
     * If the step is not set, return the duration
     *
     * @param integer $duration
     * @return integer
     */
    public static function get_service_global_step(int $duration): int
    {
        $step = get_option('wbk_global_timeslot_interval', 'duration');

        if ($step === 'duration') {
            return intval($duration);
        }

        return intval($step);
    }

    /**
     * Get the default business hours
     *
     * @return array
     */
    public static function get_default_business_hours(): array
    {
        return [
            [
                'start'       => 32400,
                'end'         => 46800,
                'day_of_week' => '1',
                'status'      => 'active'
            ],
            [
                'start'       => 50400,
                'end'         => 64800,
                'day_of_week' => '1',
                'status'      => 'active'
            ],
            [
                'start'       => 32400,
                'end'         => 46800,
                'day_of_week' => '2',
                'status'      => 'active'
            ],
            [
                'start'       => 50400,
                'end'         => 64800,
                'day_of_week' => '2',
                'status'      => 'active'
            ],
            [
                'start'       => 32400,
                'end'         => 46800,
                'day_of_week' => '3',
                'status'      => 'active'
            ],
            [
                'start'       => 50400,
                'end'         => 64800,
                'day_of_week' => '3',
                'status'      => 'active'
            ],
            [
                'start'       => 32400,
                'end'         => 46800,
                'day_of_week' => '4',
                'status'      => 'active'
            ],
            [
                'start'       => 50400,
                'end'         => 64800,
                'day_of_week' => '4',
                'status'      => 'active'
            ],
            [
                'start'       => 32400,
                'end'         => 46800,
                'day_of_week' => '5',
                'status'      => 'active'
            ],
            [
                'start'       => 50400,
                'end'         => 64800,
                'day_of_week' => '5',
                'status'      => 'active'
            ]
        ];
    }

    public static function get_service_global_business_hours(): string
    {
        $default_hours = json_encode(self::get_default_business_hours());
        $hours         = get_option('wbk_global_working_hours', $default_hours);

        if (is_array($hours)) {
            return json_encode($hours);
        }

        if (empty($hours)) {
            return '';
        }

        return $hours;
    }

    /**
     * Get the dashboard page link
     *
     * @return string
     */
    public static function get_dashboard_page_link(): string
    {
        $dashboard_page_link = get_option('wbk_user_dashboard_page_link_new', '');
        if ($dashboard_page_link && is_numeric($dashboard_page_link)) {
            return get_permalink($dashboard_page_link);
        }

        return '';
    }

    /**
     * Get the email landing page link
     *
     * @return string
     */
    public static function get_email_landing_page_link(): string
    {
        $email_landing_page_link = get_option('wbk_email_landing_new', '');
        if ($email_landing_page_link && is_numeric($email_landing_page_link)) {
            return get_permalink($email_landing_page_link);
        }

        return '';
    }
}
