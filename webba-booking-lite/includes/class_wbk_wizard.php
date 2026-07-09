<?php
if (!defined('ABSPATH')) {
    exit();
}

class WBK_Wizard
{
    public function __construct()
    {
        add_action('rest_api_init', function(){
            register_rest_route('webba-booking/v1', '/wizard/submit-initial-setup', [
                'methods' => 'POST',
                'callback' => [$this, 'wbk_wizard_initial_setup'],
                'permission_callback' => [$this, 'wbk_wizard_initial_setup_permission'],
            ]);

            register_rest_route('webba-booking/v1', '/wizard/submit-final-setup', [
                'methods' => 'POST',
                'callback' => [$this, 'wbk_wizard_final_setup'],
                'permission_callback' => [$this, 'wbk_wizard_final_setup_permission'],
            ]);
        });
    }

    /**
     * Permission callback for the initial setup
     *
     * @param WP_REST_Request $request
     * @return boolean
     */
    public function wbk_wizard_initial_setup_permission(WP_REST_Request $request): bool
    {
        return current_user_can('manage_options');
    }

    /**
     * Permission callback for the final setup
     *
     * @param WP_REST_Request $request
     * @return boolean
     */
    public function wbk_wizard_final_setup_permission(WP_REST_Request $request): bool
    {
        return current_user_can('manage_options');
    }

    /**
     * Initial setup endpoint
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function wbk_wizard_initial_setup(WP_REST_Request $request): WP_REST_Response
    {
        $params = $request->get_params();
        $service_type = sanitize_text_field($params['service_type'] ?? 'hourly');

        if ($service_type !== 'hourly' && $service_type !== 'daily') {
            return new WP_REST_Response([
                'status' => 'fail',
                'reason' => 'invalid service type',
            ], 400);
        }

        $common_required = ['email', 'timezone', 'currency', 'service_type'];
        foreach ($common_required as $field) {
            if (!isset($params[$field]) || $params[$field] === '') {
                return new WP_REST_Response([
                    'status' => 'fail',
                    'reason' => 'missing field: ' . $field,
                ], 400);
            }
        }

        if ($service_type === 'daily') {
            $daily_response = $this->wizard_create_daily_unit($params);
            if ($daily_response instanceof WP_REST_Response) {
                return $daily_response;
            }
        } else {
            $hourly_response = $this->wizard_create_hourly_service($params);
            if ($hourly_response instanceof WP_REST_Response) {
                return $hourly_response;
            }
        }

        $this->wizard_save_global_settings($params);

        WBK_Mixpanel::track_event(
            $service_type === 'daily' ? 'unit created' : 'service created',
            []
        );
        WBK_Mixpanel::track_event('setup wizard basic setup complete', []);

        return new WP_REST_Response([
            'status' => 'success',
            'shortcode' => '[webbabooking]',
        ], 200);
    }

    /**
     * Create an hourly service from wizard params.
     *
     * @param array $params Request params.
     * @return true|WP_REST_Response
     */
    private function wizard_create_hourly_service(array $params)
    {
        $required_fields = [
            'service_name',
            'service_description',
            'service_price',
            'service_duration',
            'service_interval',
            'service_buffer',
            'service_advance',
            'wbk_global_working_hours',
        ];

        if (wbk_fs()->is__premium_only() && wbk_fs()->can_use_premium_code()) {
            $required_fields = array_merge($required_fields, [
                'service_min_quantity',
                'service_max_quantity',
            ]);
        }

        foreach ($required_fields as $field) {
            if (!isset($params[$field])) {
                return new WP_REST_Response([
                    'status' => 'fail',
                    'reason' => 'missing field: ' . $field,
                ], 400);
            }
        }

        $service_name = esc_html(sanitize_text_field(trim($params['service_name'])));
        if ($service_name === '') {
            return new WP_REST_Response([
                'status' => 'fail',
                'reason' => 'wrong service name',
            ], 400);
        }

        $duration = intval($params['service_duration']);
        if (!WBK_Validator::check_integer($duration, 5, 1440)) {
            return new WP_REST_Response([
                'status' => 'fail',
                'reason' => 'duration',
            ], 400);
        }

        $min_quantity = 1;
        $max_quantity = 1;
        $quantity = 1;
        if (wbk_fs()->is__premium_only() && wbk_fs()->can_use_premium_code()) {
            $min_quantity = intval($params['service_min_quantity'] ?? 1);
            $max_quantity = intval($params['service_max_quantity'] ?? 1);
            $quantity = isset($params['service_quantity'])
                ? intval($params['service_quantity'])
                : $max_quantity;
            if (
                !WBK_Validator::check_integer($min_quantity, 1, 10000) ||
                !WBK_Validator::check_integer($max_quantity, 1, 10000) ||
                !WBK_Validator::check_integer($quantity, 1, 10000)
            ) {
                return new WP_REST_Response([
                    'status' => 'fail',
                    'reason' => 'wrong quantity',
                ], 400);
            }
            if ($min_quantity > $max_quantity) {
                return new WP_REST_Response([
                    'status' => 'fail',
                    'reason' => 'min_quantity cannot exceed max_quantity',
                ], 400);
            }
            $quantity = max($quantity, $max_quantity);
        }

        if (
            !isset($params['wbk_global_working_hours']) ||
            !is_array($params['wbk_global_working_hours'])
        ) {
            return new WP_REST_Response([
                'status' => 'fail',
                'reason' => 'invalid business hours',
            ], 400);
        }

        update_option(
            'wbk_global_working_hours',
            json_encode($params['wbk_global_working_hours'])
        );

        $service = new WBK_Service();
        $service->set('name', $service_name);
        $service->set('description', sanitize_text_field($params['service_description']));
        $service->set('email', sanitize_email($params['email']));
        $service->set('priority', '0');
        $service->set('form', '0');
        $service->set('extcalendar', '');

        $existing_services = WBK_Model_Utils::get_service_ids();
        $existing_colors = [];
        foreach ($existing_services as $existing_service_id) {
            $existing_service = new WBK_Service($existing_service_id);
            if (!$existing_service->is_loaded()) {
                continue;
            }
            $existing_colors[] = $existing_service->get('color');
        }
        $service->set('color', WBK_Appearance_Utils::generate_random_color($existing_colors));
        $service->set('min_quantity', $min_quantity);
        $service->set('max_quantity', $max_quantity);
        $service->set('quantity', $quantity);
        $service->set('duration', $duration);
        $service->set('step', intval($params['service_interval']));
        $service->set('interval_between', intval($params['service_buffer']));
        $service->set('price', floatval($params['service_price']));
        $service->set('service_fee', '0');
        $service->set(
            'hide_price',
            (!empty($params['service_hide_price']) && $params['service_hide_price'] === 'yes')
                ? 'yes'
                : ''
        );
        $service->set('override_email', '');
        $service->set('override_availability', '');
        $service->set('override_step', '');
        $service->set('business_hours', '');

        if (isset($params['service_payment_methods'])) {
            $payment_methods = $this->wizard_decode_json_array($params['service_payment_methods']);
            if (is_array($payment_methods)) {
                $service->set('payment_methods', json_encode(array_values($payment_methods)));
            }
        }

        $service->set('notification_template', '0');
        $service->set('reminder_template', '0');
        $service->set('invoice_template', '0');
        $service->set('booking_changed_template', '0');
        $service->set('approval_template', '0');
        $service->set('prepare_time', intval($params['service_advance']));
        $service->save();

        return true;
    }

    /**
     * Create a daily unit from wizard params.
     *
     * @param array $params Request params.
     * @return true|WP_REST_Response
     */
    private function wizard_create_daily_unit(array $params)
    {
        if (!wbk_fs()->is__premium_only() || !wbk_fs()->can_use_premium_code()) {
            return new WP_REST_Response([
                'status' => 'fail',
                'reason' => 'daily service requires premium plan',
            ], 400);
        }

        $required_fields = [
            'unit_name',
            'unit_quantity',
            'unit_capacity',
            'unit_price',
        ];

        foreach ($required_fields as $field) {
            if (!isset($params[$field]) || $params[$field] === '') {
                return new WP_REST_Response([
                    'status' => 'fail',
                    'reason' => 'missing field: ' . $field,
                ], 400);
            }
        }

        $unit_name = esc_html(sanitize_text_field(trim($params['unit_name'])));
        if ($unit_name === '') {
            return new WP_REST_Response([
                'status' => 'fail',
                'reason' => 'wrong unit name',
            ], 400);
        }

        $unit_quantity = intval($params['unit_quantity']);
        $unit_capacity = intval($params['unit_capacity']);
        if (
            !WBK_Validator::check_integer($unit_quantity, 1, 10000) ||
            !WBK_Validator::check_integer($unit_capacity, 1, 10000)
        ) {
            return new WP_REST_Response([
                'status' => 'fail',
                'reason' => 'wrong unit quantity',
            ], 400);
        }

        $unit = new WBK_Unit();
        $unit->set('name', $unit_name);
        $unit->set(
            'description',
            isset($params['unit_description'])
                ? sanitize_text_field($params['unit_description'])
                : ''
        );
        if (!empty($params['unit_image'])) {
            $unit->set('image', sanitize_text_field($params['unit_image']));
        }
        $unit->set('form_id', '0');
        $unit->set('quantity', (string) $unit_quantity);
        $unit->set('capacity', (string) $unit_capacity);
        $unit->set('attendee_type_adult', 'yes');

        $unit_price = $params['unit_price'];
        if (is_array($unit_price)) {
            $unit_price = json_encode($unit_price);
        } elseif (is_string($unit_price)) {
            $unit_price = wp_unslash($unit_price);
        }
        $unit->set('price', $unit_price);

        if (!empty($params['unit_min_booking_days'])) {
            $unit->set('min_booking_days', sanitize_text_field($params['unit_min_booking_days']));
        }
        if (!empty($params['unit_max_booking_days'])) {
            $unit->set('max_booking_days', sanitize_text_field($params['unit_max_booking_days']));
        }
        if (isset($params['unit_buffer_before']) && $params['unit_buffer_before'] !== '') {
            $unit->set('buffer_before', sanitize_text_field($params['unit_buffer_before']));
        }
        if (isset($params['unit_buffer_after']) && $params['unit_buffer_after'] !== '') {
            $unit->set('buffer_after', sanitize_text_field($params['unit_buffer_after']));
        }

        if (isset($params['unit_payment_methods'])) {
            $payment_methods = $this->wizard_decode_json_array($params['unit_payment_methods']);
            if (is_array($payment_methods)) {
                $unit->set('payment_methods', json_encode(array_values($payment_methods)));
            }
        }

        $unit->save();

        return true;
    }

    /**
     * Persist wizard global settings shared by hourly and daily flows.
     *
     * @param array $params Request params.
     * @return void
     */
    private function wizard_save_global_settings(array $params): void
    {
        update_option('wbk_timezone', sanitize_text_field($params['timezone']));
        update_option(
            'wbk_payment_price_format_new',
            sanitize_text_field($params['currency_symbol'])
        );
        if (isset($params['wbk_sidebar_help_email'])) {
            update_option(
                'wbk_sidebar_help_email',
                sanitize_text_field($params['wbk_sidebar_help_email'])
            );
        }
        if (isset($params['wbk_sidebar_help_phone'])) {
            update_option(
                'wbk_sidebar_help_phone',
                sanitize_text_field($params['wbk_sidebar_help_phone'])
            );
        }
        if (isset($params['closed_dates'])) {
            update_option('wbk_holydays', $params['closed_dates']);
        }
    }

    /**
     * Decode a JSON array from request param.
     *
     * @param mixed $value Param value.
     * @return array|null
     */
    private function wizard_decode_json_array($value)
    {
        if (is_array($value)) {
            return $value;
        }
        if (!is_string($value)) {
            return null;
        }
        $decoded = json_decode($value, true);
        return is_array($decoded) ? $decoded : null;
    }

    /**
     * Final setup endpoint
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function wbk_wizard_final_setup(WP_REST_Request $request): WP_REST_Response
    {
        $params = $request->get_params();

        if (!isset($params['final_action'])) {
            return new WP_REST_Response([
                'status' => 'fail',
                'reason' => 'wrong finalize',
            ], 400);
        }

        if (
            $params['final_action'] != 'setup_advanced' &&
            $params['final_action'] != 'finalize'
        ) {
            return new WP_REST_Response([
                'status' => 'fail',
                'reason' => 'wrong finalize',
            ], 400);
        }

        if (isset($params['enable_emails'])) {
            update_option('wbk_email_customer_book_status', 'true');
            update_option('wbk_email_admin_book_status', 'true');
        } else {
            update_option('wbk_email_customer_book_status', '');
            update_option('wbk_email_admin_book_status', '');
        }

        if (isset($params['enable_sms'])) {
            update_option('wbk_sms_setup_required', 'true');
        } else {
            update_option('wbk_sms_setup_required', 'false');
        }

        if (isset($params['enable_payments'])) {
            update_option('wbk_payments_setup_required', 'true');
        } else {
            update_option('wbk_payments_setup_required', 'false');
        }

        if (isset($params['enable_google'])) {
            update_option('wbk_google_setup_required', 'true');
        } else {
            update_option('wbk_google_setup_required', 'false');
        }

        WBK_Setup_Checklist::mark_wizard_completed();

        $url = esc_url(get_admin_url() . 'admin.php?page=wbk-services');

        WBK_Mixpanel::track_event('setup wizard full setup complete', []);
        return new WP_REST_Response([
            'status' => 'success',
            'url' => $url,
        ], 200);
    }
}
