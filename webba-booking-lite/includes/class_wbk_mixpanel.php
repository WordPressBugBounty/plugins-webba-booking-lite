<?php
if (!defined('ABSPATH'))
    exit;

class WBK_Mixpanel
{
    const PROJECT_TOKEN = "253966a60c813a3ea17ea0a6bcaa4479";

    public static function update_configuration($initial = true)
    {
        global $wp_settings_sections, $wp_settings_fields;
        if (self::is_localhost() || ($initial && get_option('wbk_initial_configuration_tracked') == 'true')) {
            return;
        }

        $host = self::get_host();
        $data = ['name' => self::get_host()];
        if (empty($wp_settings_sections['wbk-options']) || empty($wp_settings_fields['wbk-options'])) {
            return;
        }
        $settings_fields = $wp_settings_fields['wbk-options'];
        foreach ($settings_fields as $section => $fields) {
            foreach ($fields as $field) {
                if (
                    $field['id'] == 'wbk_gg_clientid' ||
                    $field['id'] == 'wbk_gg_secret' ||
                    $field['id'] == 'wbk_paypal_sandbox_clientid' ||
                    $field['id'] == 'wbk_paypal_sandbox_secret' ||
                    $field['id'] == 'wbk_paypal_live_clientid' ||
                    $field['id'] == 'wbk_paypal_live_secret' ||
                    $field['id'] == 'wbk_stripe_publishable_key' ||
                    $field['id'] == 'wbk_stripe_secret_key' ||
                    $field['id'] == 'wbk_twilio_account_sid' ||
                    $field['id'] == 'wbk_twilio_auth_token' ||
                    $field['id'] == 'wbk_twilio_phone_number' ||
                    $field['id'] == 'wbk_zoom_client_id' ||
                    $field['id'] == 'wbk_zoom_client_secret' ||
                    $field['id'] == 'wbk_zoom_auth_stat' ||
                    $field['id'] == 'wbk_email_current_invoice_number'

                ) {
                    continue;
                }
                $value = get_option($field['id']);
                if (is_array($value)) {
                    $value = implode(',', $value);
                }
                $value = trim(stripslashes(strip_tags($value)));
                if ($value == '') {
                    $value = '[empty]';
                }
                $data[$field['title']] = $value;
            }
        }

        try {
            $mp = Mixpanel::getInstance(self::PROJECT_TOKEN);
            if (!is_array($data) || empty($data)) {
                throw new InvalidArgumentException('Invalid data provided. Expected a non-empty array.');
            }
            $mp->people->set(self::get_host(), $data, $ip = 0);
        } catch (Exception $e) {
            error_log('Error in tracking: ' . $e->getMessage());
        }
        if ($initial) {
            update_option('wbk_initial_configuration_tracked', 'true');
        }
    }
    public static function is_localhost()
    {
        $host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '';
        if ($host == '') {
            return false;
        }
        return
            stripos($host, 'localhost') !== false ||
            substr($host, -4) === '.dev' ||
            substr($host, -5) === '.test';
    }
    public static function get_host()
    {
        if (self::is_localhost()) {
            // return 'Test user';
        }
        return isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '';
    }
    public static function track_event($event, $details)
    {
        if (self::is_localhost()) {
            return;
        }

        try {
            $mp = Mixpanel::getInstance(self::PROJECT_TOKEN);
            $mp->identify(self::get_host());
            $mp->track($event, $details);
        } catch (Exception $e) {
            error_log('Error in tracking: ' . $e->getMessage());
        }

    }

}