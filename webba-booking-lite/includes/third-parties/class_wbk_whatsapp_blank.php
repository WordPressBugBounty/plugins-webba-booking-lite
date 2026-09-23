<?php
if (!defined('ABSPATH')) {
    exit();
}

/**
 * Blank WhatsApp sender used when the premium WhatsApp feature is unavailable.
 */
class WBK_WhatsApp
{
    /**
     * No-op send handler for non-premium installs.
     *
     * @param int|array $bookings Booking ID or list of booking IDs.
     * @param string    $event    Event key.
     * @return bool
     */
    public static function send($bookings, $event)
    {
        return false;
    }

    /**
     * No-op template sender for non-premium installs.
     *
     * @param string   $recipient_phone Recipient phone number.
     * @param string   $template_name   Template name.
     * @param string   $language_code   Language code.
     * @param string[] $body_parameters  Template body parameters.
     * @return bool
     */
    public static function send_template(
        $recipient_phone,
        $template_name,
        $language_code = 'en_US',
        $body_parameters = []
    ) {
        return false;
    }

    /**
     * No-op text sender for non-premium installs.
     *
     * @param string $recipient_phone Recipient phone number.
     * @param string $message         Message body.
     * @return bool
     */
    public static function send_text($recipient_phone, $message)
    {
        return false;
    }

    /**
     * Returns an empty template list for non-premium installs.
     *
     * @return array<string, string>
     */
    public static function get_approved_template_options()
    {
        return [];
    }

    /**
     * Returns an empty admin template list for non-premium installs.
     *
     * @param string|null $business_account_id Optional WABA override.
     * @return array
     */
    public static function get_templates_for_admin($business_account_id = null)
    {
        return [];
    }

    /**
     * No-op create handler for non-premium installs.
     *
     * @param string $template_name Template name.
     * @param string $language_code Language code.
     * @param string $category      Category.
     * @param string $body_text     Body text.
     * @return bool
     */
    public static function create_template(
        $template_name,
        $language_code,
        $category,
        $body_text
    ) {
        return false;
    }

    /**
     * No-op update handler for non-premium installs.
     *
     * @param string $template_id Template ID.
     * @param string $body_text   Body text.
     * @param array  $components  Components.
     * @param string $category    Category.
     * @return bool
     */
    public static function update_template(
        $template_id,
        $body_text,
        $components = [],
        $category = ''
    ) {
        return false;
    }

    /**
     * No-op token validation for non-premium installs.
     *
     * @param string|null $access_token Access token.
     * @return bool
     */
    public static function validate_access_token($access_token = null)
    {
        return false;
    }

    /**
     * Empty token for non-premium installs.
     *
     * @param string|null $override Optional token override.
     * @return string
     */
    public static function get_access_token($override = null)
    {
        unset($override);
        return '';
    }

    /**
     * No-op token refresh for non-premium installs.
     *
     * @return false
     */
    public static function sync_access_token_from_connect()
    {
        return false;
    }

    /**
     * Empty WABA options for non-premium installs.
     *
     * @return array
     */
    public static function get_business_account_options()
    {
        return [];
    }

    /**
     * Empty phone options for non-premium installs.
     *
     * @param string|null $waba_id Optional WABA ID.
     * @return array
     */
    public static function get_phone_number_options($waba_id = null)
    {
        return [];
    }
}
