<?php
if (!defined('ABSPATH')) {
    exit();
}

/**
 * Sends WhatsApp notifications via Meta Cloud API.
 */
class WBK_WhatsApp
{
    /**
     * Sends a WhatsApp notification for a booking event.
     *
     * @param int|array $bookings Booking ID or list of booking IDs.
     * @param string    $event    Event key: booking|reminder|payment|approval.
     * @return bool|WP_Error True on success, false when skipped, WP_Error on failure.
     */
    public static function send($bookings, $event)
    {
        if (!wbk_fs()->is__premium_only() || !wbk_fs()->can_use_premium_code()) {
            return false;
        }

        if (!WBK_Feature_Gate::check_if_plan_is_enough('premium')) {
            return false;
        }

        $event = sanitize_key($event);
        if ($event === '') {
            return false;
        }

        if (get_option('wbk_whatsapp_send_on_' . $event, '') !== 'true') {
            return false;
        }

        $template_selection = trim((string) get_option('wbk_whatsapp_template_' . $event, ''));
        if ($template_selection === '') {
            return false;
        }

        $template_parts = self::parse_template_selection($template_selection);
        $template_name = $template_parts['name'];
        $language_code = $template_parts['language'];

        if ($template_name === '') {
            return false;
        }

        $booking_id = self::resolve_booking_id($bookings);
        if ($booking_id === null) {
            return false;
        }

        $booking = new WBK_Booking($booking_id);
        if ($booking->get_name() === '') {
            return false;
        }

        $recipient_phone = self::normalize_phone($booking->get_phone());
        if ($recipient_phone === '') {
            return false;
        }

        if ($language_code === '') {
            $language_code = self::get_template_language_fallback();
        }
        if ($language_code === '') {
            $language_code = 'en_US';
        }

        $body_parameters = self::build_template_parameters(
            $bookings,
            (string) get_option('wbk_whatsapp_template_params_' . $event, '')
        );

        return self::send_template(
            $recipient_phone,
            $template_name,
            $language_code,
            $body_parameters
        );
    }

    /**
     * Returns approved WhatsApp templates as select options.
     *
     * Option values use "template_name|||language" so language is stored with the selection.
     *
     * @return array<string, string>
     */
    public static function get_approved_template_options()
    {
        $templates = self::fetch_message_templates(['APPROVED']);
        if (is_wp_error($templates)) {
            return [
                'wbk_null' => $templates->get_error_message(),
            ];
        }

        if (empty($templates)) {
            return [
                'wbk_null' => __(
                    'No approved WhatsApp templates found',
                    'webba-booking-lite'
                ),
            ];
        }

        $options = [];
        foreach ($templates as $template) {
            $template_name = isset($template['name']) ? (string) $template['name'] : '';
            $language_code = isset($template['language'])
                ? (string) $template['language']
                : '';
            if ($template_name === '') {
                continue;
            }

            $option_value = $template_name . '|||' . $language_code;
            $options[$option_value] = sprintf(
                '%s (%s)',
                $template_name,
                $language_code !== '' ? $language_code : 'unknown'
            );
        }

        if (empty($options)) {
            return [
                'wbk_null' => __(
                    'No approved WhatsApp templates found',
                    'webba-booking-lite'
                ),
            ];
        }

        return $options;
    }

    /**
     * Fetches message templates from Meta WhatsApp Cloud API.
     *
     * @param string[] $statuses Template statuses to include. Empty array returns all.
     * @return array|WP_Error
     */
    /**
     * Refreshes the WhatsApp access token through Webba Connect (source of truth).
     *
     * @return string|false
     */
    public static function sync_access_token_from_connect()
    {
        if (!class_exists('WBK_Webba_Connect')) {
            return false;
        }

        $webba_connect = new WBK_Webba_Connect();
        $data = $webba_connect->fetch_facebook_access_token_from_webba_connect(
            'whatsapp'
        );
        if (!is_array($data) || empty($data['access_token'])) {
            // Fallback for older Connect builds that only expose refresh-token.
            $local_token = trim((string) get_option('wbk_whatsapp_access_token', ''));
            if (
                $local_token === '' ||
                !$webba_connect->refresh_facebook_access_token($local_token)
            ) {
                return false;
            }

            return trim((string) get_option('wbk_whatsapp_access_token', ''));
        }

        return trim((string) $data['access_token']);
    }

    /**
     * Returns a usable WhatsApp access token, restoring from Connect when needed.
     *
     * @param string|null $override Optional token override.
     * @return string
     */
    public static function get_access_token($override = null)
    {
        if ($override !== null) {
            $override_token = trim((string) $override);
            if ($override_token !== '') {
                return $override_token;
            }
        }

        $token = trim((string) get_option('wbk_whatsapp_access_token', ''));
        $expiry = (int) get_option('wbk_whatsapp_token_expiry', 0);
        $needs_refresh =
            $token === '' ||
            ($expiry > 0 && $expiry < (time() + 24 * 60 * 60) * 1000);

        if ($needs_refresh) {
            $restored = self::sync_access_token_from_connect();
            if (is_string($restored) && $restored !== '') {
                return $restored;
            }
        }

        return $token;
    }

    /**
     * Fetches WhatsApp message templates from Meta Graph API.
     *
     * @param string[]    $statuses            Optional status filter. Empty means all statuses.
     * @param string|null $business_account_id Optional WABA override.
     * @return array|WP_Error
     */
    public static function fetch_message_templates(
        $statuses = ['APPROVED'],
        $business_account_id = null
    ) {
        $access_token = self::get_access_token();
        $business_account_id = trim(
            (string) ($business_account_id !== null && $business_account_id !== ''
                ? $business_account_id
                : get_option('wbk_whatsapp_business_account_id', ''))
        );
        $api_version = self::get_graph_api_version();

        if ($access_token === '' || $business_account_id === '') {
            return new WP_Error(
                'wbk_whatsapp_missing_credentials',
                __(
                    'WhatsApp access token or business account ID is not configured.',
                    'webba-booking-lite'
                )
            );
        }

        if ($api_version === '') {
            $api_version = 'v22.0';
        }

        $endpoint = add_query_arg(
            [
                'limit' => 100,
                'fields' => 'id,name,status,language,category,components',
            ],
            sprintf(
                'https://graph.facebook.com/%s/%s/message_templates',
                rawurlencode($api_version),
                rawurlencode($business_account_id)
            )
        );

        $response = wp_remote_get($endpoint, [
            'timeout' => 30,
            'headers' => [
                'Authorization' => 'Bearer ' . $access_token,
            ],
        ]);

        if (is_wp_error($response)) {
            error_log(
                'Failed to fetch WhatsApp templates: ' . $response->get_error_message()
            );
            return $response;
        }

        $status_code = (int) wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        $decoded_body = json_decode($response_body, true);

        if ($status_code < 200 || $status_code >= 300) {
            $error_message = __('Failed to fetch WhatsApp templates.', 'webba-booking-lite');
            if (isset($decoded_body['error']['message'])) {
                $error_message = $decoded_body['error']['message'];
            }

            error_log('Failed to fetch WhatsApp templates: ' . $error_message);
            return new WP_Error('wbk_whatsapp_api_error', $error_message, [
                'status' => $status_code,
                'body' => $decoded_body,
            ]);
        }

        $templates = [];
        if (isset($decoded_body['data']) && is_array($decoded_body['data'])) {
            foreach ($decoded_body['data'] as $template) {
                if (!is_array($template)) {
                    continue;
                }

                $template_status = isset($template['status'])
                    ? strtoupper((string) $template['status'])
                    : '';
                if (!empty($statuses) && !in_array($template_status, $statuses, true)) {
                    continue;
                }

                $templates[] = $template;
            }
        }

        return $templates;
    }

    /**
     * Returns templates formatted for the admin template field UI.
     *
     * @param string|null $business_account_id Optional WABA override.
     * @return array|WP_Error
     */
    public static function get_templates_for_admin($business_account_id = null)
    {
        $templates = self::fetch_message_templates([], $business_account_id);
        if (is_wp_error($templates)) {
            return $templates;
        }

        $formatted = [];
        foreach ($templates as $template) {
            $formatted[] = self::format_template_for_admin($template);
        }

        return $formatted;
    }

    /**
     * Creates a WhatsApp message template and submits it for Meta review.
     *
     * @param string $template_name Template name (lowercase, underscores).
     * @param string $language_code Language code, e.g. en_US.
     * @param string $category      UTILITY|MARKETING|AUTHENTICATION.
     * @param string $body_text     Template body text with optional {{n}} variables.
     * @return array|WP_Error
     */
    public static function create_template(
        $template_name,
        $language_code,
        $category,
        $body_text
    ) {
        $template_name = self::sanitize_template_name($template_name);
        $language_code = trim((string) $language_code);
        $category = strtoupper(trim((string) $category));
        $body_text = trim((string) $body_text);

        if ($template_name === '' || $language_code === '' || $body_text === '') {
            return new WP_Error(
                'wbk_whatsapp_invalid_template',
                __('Template name, language, and body text are required.', 'webba-booking-lite')
            );
        }

        if ($category === '') {
            $category = 'UTILITY';
        }

        $payload = [
            'name' => $template_name,
            'language' => $language_code,
            'category' => $category,
            'allow_category_change' => true,
            'components' => [self::build_body_component($body_text)],
        ];

        $result = self::request_waba_api('message_templates', 'POST', $payload);
        if (is_wp_error($result)) {
            return $result;
        }

        return [
            'id' => isset($result['id']) ? (string) $result['id'] : '',
            'status' => isset($result['status'])
                ? strtoupper((string) $result['status'])
                : 'PENDING',
            'category' => isset($result['category'])
                ? strtoupper((string) $result['category'])
                : $category,
            'name' => $template_name,
            'language' => $language_code,
            'body_text' => $body_text,
            'selection_value' => $template_name . '|||' . $language_code,
        ];
    }

    /**
     * Updates an existing WhatsApp message template and resubmits it for review.
     *
     * @param string $template_id   Meta template ID.
     * @param string $body_text     Updated body text.
     * @param array  $components    Existing template components to preserve non-body parts.
     * @param string $category      Optional category override.
     * @return array|WP_Error
     */
    public static function update_template(
        $template_id,
        $body_text,
        $components = [],
        $category = ''
    ) {
        $template_id = trim((string) $template_id);
        $body_text = trim((string) $body_text);
        $category = strtoupper(trim((string) $category));

        if ($template_id === '' || $body_text === '') {
            return new WP_Error(
                'wbk_whatsapp_invalid_template',
                __('Template ID and body text are required.', 'webba-booking-lite')
            );
        }

        $updated_components = [];
        $body_replaced = false;

        if (is_array($components)) {
            foreach ($components as $component) {
                if (!is_array($component)) {
                    continue;
                }

                $component_type = isset($component['type'])
                    ? strtoupper((string) $component['type'])
                    : '';
                if ($component_type === 'BODY') {
                    $updated_components[] = self::build_body_component($body_text);
                    $body_replaced = true;
                    continue;
                }

                $updated_components[] = $component;
            }
        }

        if (!$body_replaced) {
            $updated_components[] = self::build_body_component($body_text);
        }

        $payload = [
            'components' => $updated_components,
        ];
        if ($category !== '') {
            $payload['category'] = $category;
        }

        $result = self::request_graph_api($template_id, 'POST', $payload);
        if (is_wp_error($result)) {
            return $result;
        }

        return [
            'id' => $template_id,
            'status' => isset($result['status'])
                ? strtoupper((string) $result['status'])
                : 'PENDING',
            'success' => !empty($result['success']) || !isset($result['error']),
            'body_text' => $body_text,
        ];
    }

    /**
     * Formats a raw Meta template payload for the admin UI.
     *
     * @param array $template Raw template data.
     * @return array
     */
    public static function format_template_for_admin($template)
    {
        $template_name = isset($template['name']) ? (string) $template['name'] : '';
        $language_code = isset($template['language'])
            ? (string) $template['language']
            : '';
        $components = isset($template['components']) && is_array($template['components'])
            ? $template['components']
            : [];

        return [
            'id' => isset($template['id']) ? (string) $template['id'] : '',
            'name' => $template_name,
            'language' => $language_code,
            'status' => isset($template['status'])
                ? strtoupper((string) $template['status'])
                : '',
            'category' => isset($template['category'])
                ? strtoupper((string) $template['category'])
                : '',
            'body_text' => self::extract_body_text($components),
            'components' => $components,
            'selection_value' => $template_name . '|||' . $language_code,
            'label' => sprintf(
                '%s (%s)',
                $template_name,
                $language_code !== '' ? $language_code : 'unknown'
            ),
        ];
    }

    /**
     * Extracts BODY text from template components.
     *
     * @param array $components Template components.
     * @return string
     */
    public static function extract_body_text($components)
    {
        if (!is_array($components)) {
            return '';
        }

        foreach ($components as $component) {
            if (!is_array($component)) {
                continue;
            }

            $component_type = isset($component['type'])
                ? strtoupper((string) $component['type'])
                : '';
            if ($component_type === 'BODY' && isset($component['text'])) {
                return (string) $component['text'];
            }
        }

        return '';
    }

    /**
     * Builds a BODY component payload, including examples when variables exist.
     *
     * @param string $body_text Template body text.
     * @return array
     */
    protected static function build_body_component($body_text)
    {
        $component = [
            'type' => 'BODY',
            'text' => $body_text,
        ];

        $variable_count = self::count_body_variables($body_text);
        if ($variable_count > 0) {
            $examples = [];
            for ($index = 1; $index <= $variable_count; $index++) {
                $examples[] = 'example' . $index;
            }

            $component['example'] = [
                'body_text' => [$examples],
            ];
        }

        return $component;
    }

    /**
     * Counts numbered body variables like {{1}} in template text.
     *
     * @param string $body_text Template body text.
     * @return int
     */
    protected static function count_body_variables($body_text)
    {
        if (!preg_match_all('/\{\{(\d+)\}\}/', (string) $body_text, $matches)) {
            return 0;
        }

        $numbers = array_map('intval', $matches[1]);
        if (empty($numbers)) {
            return 0;
        }

        return max($numbers);
    }

    /**
     * Sanitizes a template name for Meta requirements.
     *
     * @param string $template_name Raw template name.
     * @return string
     */
    protected static function sanitize_template_name($template_name)
    {
        $template_name = strtolower(trim((string) $template_name));
        $template_name = preg_replace('/[^a-z0-9_]+/', '_', $template_name);
        $template_name = trim((string) $template_name, '_');

        return $template_name;
    }

    /**
     * Sends a request against the configured WABA edge.
     *
     * @param string     $edge    Edge path, e.g. message_templates.
     * @param string     $method  HTTP method.
     * @param array|null $payload Optional JSON body.
     * @return array|WP_Error
     */
    protected static function request_waba_api($edge, $method = 'GET', $payload = null)
    {
        $business_account_id = trim(
            (string) get_option('wbk_whatsapp_business_account_id', '')
        );
        if ($business_account_id === '') {
            return new WP_Error(
                'wbk_whatsapp_missing_credentials',
                __(
                    'WhatsApp business account ID is not configured.',
                    'webba-booking-lite'
                )
            );
        }

        return self::request_graph_api(
            $business_account_id . '/' . ltrim((string) $edge, '/'),
            $method,
            $payload
        );
    }

    /**
     * Returns the Graph API version published by Webba Connect.
     *
     * @return string
     */
    protected static function get_graph_api_version()
    {
        if (class_exists('WBK_Remote_Config')) {
            return WBK_Remote_Config::get_whatsapp_graph_version();
        }

        return 'v22.0';
    }

    /**
     * Returns the template language fallback published by Webba Connect.
     *
     * @return string
     */
    protected static function get_template_language_fallback()
    {
        if (class_exists('WBK_Remote_Config')) {
            return WBK_Remote_Config::get_whatsapp_template_language();
        }

        return 'en_US';
    }

    /**
     * Sends a request to the Meta Graph API.
     *
     * @param string     $path    Path after version, e.g. {id}/message_templates.
     * @param string     $method  HTTP method.
     * @param array|null $payload Optional JSON body.
     * @return array|WP_Error
     */
    protected static function request_graph_api($path, $method = 'GET', $payload = null)
    {
        $access_token = self::get_access_token();
        $api_version = self::get_graph_api_version();

        if ($access_token === '') {
            return new WP_Error(
                'wbk_whatsapp_missing_credentials',
                __('WhatsApp access token is not configured.', 'webba-booking-lite')
            );
        }

        if ($api_version === '') {
            $api_version = 'v22.0';
        }

        $endpoint = sprintf(
            'https://graph.facebook.com/%s/%s',
            rawurlencode($api_version),
            ltrim((string) $path, '/')
        );

        $args = [
            'timeout' => 30,
            'method' => strtoupper((string) $method),
            'headers' => [
                'Authorization' => 'Bearer ' . $access_token,
                'Content-Type' => 'application/json',
            ],
        ];

        if ($payload !== null) {
            $args['body'] = wp_json_encode($payload);
        }

        $response = wp_remote_request($endpoint, $args);
        if (is_wp_error($response)) {
            error_log('WhatsApp Graph API request failed: ' . $response->get_error_message());
            return $response;
        }

        $status_code = (int) wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        $decoded_body = json_decode($response_body, true);

        if ($status_code < 200 || $status_code >= 300) {
            $error_message = __('WhatsApp API request failed.', 'webba-booking-lite');
            if (isset($decoded_body['error']['message'])) {
                $error_message = $decoded_body['error']['message'];
            }

            error_log('WhatsApp Graph API request failed: ' . $error_message);
            return new WP_Error('wbk_whatsapp_api_error', $error_message, [
                'status' => $status_code,
                'body' => $decoded_body,
            ]);
        }

        return is_array($decoded_body) ? $decoded_body : [];
    }

    /**
     * Parses a stored template selection into name and language.
     *
     * @param string $template_selection Stored option value.
     * @return array{name: string, language: string}
     */
    protected static function parse_template_selection($template_selection)
    {
        $template_selection = trim((string) $template_selection);
        if ($template_selection === '' || $template_selection === 'wbk_null') {
            return [
                'name' => '',
                'language' => '',
            ];
        }

        if (strpos($template_selection, '|||') !== false) {
            $parts = explode('|||', $template_selection, 2);
            return [
                'name' => trim((string) $parts[0]),
                'language' => isset($parts[1]) ? trim((string) $parts[1]) : '',
            ];
        }

        return [
            'name' => $template_selection,
            'language' => '',
        ];
    }

    /**
     * Sends an approved WhatsApp template message.
     *
     * @param string   $recipient_phone Digits-only E.164 phone without leading +.
     * @param string   $template_name   Meta-approved template name.
     * @param string   $language_code   Template language code, e.g. en_US.
     * @param string[] $body_parameters  Ordered body variable values for {{1}}, {{2}}, ...
     * @return bool|WP_Error
     */
    public static function send_template(
        $recipient_phone,
        $template_name,
        $language_code = 'en_US',
        $body_parameters = []
    ) {
        $recipient_phone = self::normalize_phone($recipient_phone);
        $template_name = trim((string) $template_name);
        $language_code = trim((string) $language_code);

        if ($recipient_phone === '' || $template_name === '') {
            return false;
        }

        if ($language_code === '') {
            $language_code = 'en_US';
        }

        $payload = [
            'messaging_product' => 'whatsapp',
            'to' => $recipient_phone,
            'type' => 'template',
            'template' => [
                'name' => $template_name,
                'language' => [
                    'code' => $language_code,
                ],
            ],
        ];

        if (!empty($body_parameters) && is_array($body_parameters)) {
            $parameters = [];
            foreach ($body_parameters as $parameter_value) {
                $parameters[] = [
                    'type' => 'text',
                    'text' => (string) $parameter_value,
                ];
            }

            $payload['template']['components'] = [
                [
                    'type' => 'body',
                    'parameters' => $parameters,
                ],
            ];
        }

        return self::request_messages_api($payload);
    }

    /**
     * Sends a free-form text message (only valid inside the 24-hour customer service window).
     *
     * @param string $recipient_phone Digits-only E.164 phone without leading +.
     * @param string $message         Message body.
     * @return bool|WP_Error
     */
    public static function send_text($recipient_phone, $message)
    {
        $recipient_phone = self::normalize_phone($recipient_phone);
        $message = trim((string) $message);

        if ($recipient_phone === '' || $message === '') {
            return false;
        }

        $payload = [
            'messaging_product' => 'whatsapp',
            'to' => $recipient_phone,
            'type' => 'text',
            'text' => [
                'preview_url' => false,
                'body' => $message,
            ],
        ];

        return self::request_messages_api($payload);
    }

    /**
     * Validates an access token and returns discoverable WABA and phone number options.
     *
     * @param string|null $access_token Optional token override. Uses saved option when empty.
     * @return array|WP_Error
     */
    public static function validate_access_token($access_token = null)
    {
        $access_token = self::get_access_token($access_token);

        if ($access_token === '') {
            return new WP_Error(
                'wbk_whatsapp_missing_token',
                __('WhatsApp access token is required.', 'webba-booking-lite')
            );
        }

        $api_version = self::get_graph_api_version();
        if ($api_version === '') {
            $api_version = 'v22.0';
        }

        $waba_ids = self::discover_waba_ids($access_token, $api_version);
        if (is_wp_error($waba_ids)) {
            return $waba_ids;
        }

        if (empty($waba_ids)) {
            update_option('wbk_whatsapp_access_token', $access_token);

            return [
                'valid' => true,
                'business_account_id' => '',
                'phone_number_id' => '',
                'business_account_options' => [
                    'wbk_null' => __(
                        'No WhatsApp Business Accounts found',
                        'webba-booking-lite'
                    ),
                ],
                'phone_number_options' => [
                    'wbk_null' => __(
                        'Connect WhatsApp to load phone numbers',
                        'webba-booking-lite'
                    ),
                ],
            ];
        }

        $business_account_options = [];
        $phone_number_options = [];
        $selected_waba_id = '';
        $selected_phone_number_id = '';
        $stored_waba_id = trim(
            (string) get_option('wbk_whatsapp_business_account_id', '')
        );

        foreach ($waba_ids as $waba_id) {
            $waba_id = trim((string) $waba_id);
            if ($waba_id === '') {
                continue;
            }

            $business_account_options[$waba_id] = self::resolve_waba_label(
                $waba_id,
                $access_token,
                $api_version
            );

            if ($selected_waba_id === '' && $waba_id === $stored_waba_id) {
                $selected_waba_id = $waba_id;
            }
        }

        if ($selected_waba_id === '' && !empty($business_account_options)) {
            $selected_waba_id = (string) array_key_first($business_account_options);
        }

        if ($selected_waba_id !== '') {
            $phones = self::fetch_phone_numbers_for_waba(
                $selected_waba_id,
                $access_token,
                $api_version
            );
            if (is_wp_error($phones)) {
                return $phones;
            }

            $phone_number_options = $phones;
            if (!empty($phone_number_options)) {
                $stored_phone_id = trim(
                    (string) get_option('wbk_whatsapp_phone_number_id', '')
                );
                if (
                    $stored_phone_id !== '' &&
                    isset($phone_number_options[$stored_phone_id])
                ) {
                    $selected_phone_number_id = $stored_phone_id;
                } else {
                    $selected_phone_number_id = (string) array_key_first(
                        $phone_number_options
                    );
                }
            }
        }

        update_option('wbk_whatsapp_access_token', $access_token);
        if ($selected_waba_id !== '') {
            update_option('wbk_whatsapp_business_account_id', $selected_waba_id);
        }
        if ($selected_phone_number_id !== '') {
            update_option('wbk_whatsapp_phone_number_id', $selected_phone_number_id);
        }

        return [
            'valid' => true,
            'business_account_id' => $selected_waba_id,
            'phone_number_id' => $selected_phone_number_id,
            'business_account_options' => $business_account_options,
            'phone_number_options' => !empty($phone_number_options)
                ? $phone_number_options
                : [
                    'wbk_null' => __(
                        'No phone numbers found for the selected business account',
                        'webba-booking-lite'
                    ),
                ],
        ];
    }

    /**
     * Returns WABA select options using the saved access token.
     *
     * @return array<string, string>
     */
    public static function get_business_account_options()
    {
        $access_token = self::get_access_token();
        $stored_waba = trim((string) get_option('wbk_whatsapp_business_account_id', ''));

        if ($access_token === '') {
            return [
                'wbk_null' => __(
                    'Connect WhatsApp to load business accounts',
                    'webba-booking-lite'
                ),
            ];
        }

        $api_version = self::get_graph_api_version();
        if ($api_version === '') {
            $api_version = 'v22.0';
        }

        $waba_ids = self::discover_waba_ids($access_token, $api_version);
        if (is_wp_error($waba_ids) || empty($waba_ids)) {
            if ($stored_waba !== '') {
                return [
                    $stored_waba => self::resolve_waba_label(
                        $stored_waba,
                        $access_token,
                        $api_version
                    ),
                ];
            }

            return [
                'wbk_null' => __(
                    'No WhatsApp Business Accounts found',
                    'webba-booking-lite'
                ),
            ];
        }

        $options = [];
        foreach ($waba_ids as $waba_id) {
            $waba_id = trim((string) $waba_id);
            if ($waba_id === '') {
                continue;
            }
            $options[$waba_id] = self::resolve_waba_label(
                $waba_id,
                $access_token,
                $api_version
            );
        }

        return $options;
    }

    /**
     * Resolves a readable label for a WhatsApp Business Account ID.
     *
     * @param string $waba_id      WhatsApp Business Account ID.
     * @param string $access_token Access token.
     * @param string $api_version  Graph API version.
     * @return string
     */
    protected static function resolve_waba_label($waba_id, $access_token, $api_version)
    {
        $waba_id = trim((string) $waba_id);
        $fallback = sprintf(
            __('WhatsApp Business Account (%s)', 'webba-booking-lite'),
            $waba_id
        );

        if ($waba_id === '' || $access_token === '') {
            return $fallback;
        }

        $endpoint = add_query_arg(
            ['fields' => 'id,name'],
            sprintf(
                'https://graph.facebook.com/%s/%s',
                rawurlencode($api_version),
                rawurlencode($waba_id)
            )
        );

        $response = wp_remote_get($endpoint, [
            'timeout' => 20,
            'headers' => [
                'Authorization' => 'Bearer ' . $access_token,
            ],
        ]);

        if (is_wp_error($response)) {
            return $fallback;
        }

        $status_code = (int) wp_remote_retrieve_response_code($response);
        $decoded_body = json_decode(wp_remote_retrieve_body($response), true);
        if ($status_code < 200 || $status_code >= 300 || !is_array($decoded_body)) {
            return $fallback;
        }

        $name = isset($decoded_body['name']) ? trim((string) $decoded_body['name']) : '';
        if ($name === '') {
            return $fallback;
        }

        return sprintf('%s (%s)', $name, $waba_id);
    }

    /**
     * Returns phone number select options for a WABA.
     *
     * @param string|null $waba_id Optional WABA override.
     * @return array<string, string>|WP_Error
     */
    public static function get_phone_number_options($waba_id = null)
    {
        $access_token = self::get_access_token();
        $waba_id = trim(
            (string) ($waba_id !== null
                ? $waba_id
                : get_option('wbk_whatsapp_business_account_id', ''))
        );

        if ($access_token === '' || $waba_id === '' || $waba_id === 'wbk_null') {
            return [
                'wbk_null' => __(
                    'Connect WhatsApp to load phone numbers',
                    'webba-booking-lite'
                ),
            ];
        }

        $api_version = self::get_graph_api_version();
        if ($api_version === '') {
            $api_version = 'v22.0';
        }

        $phones = self::fetch_phone_numbers_for_waba(
            $waba_id,
            $access_token,
            $api_version
        );
        if (is_wp_error($phones)) {
            return $phones;
        }

        if (empty($phones)) {
            $stored_phone = trim((string) get_option('wbk_whatsapp_phone_number_id', ''));
            if ($stored_phone !== '') {
                return [$stored_phone => $stored_phone];
            }

            return [
                'wbk_null' => __('No WhatsApp phone numbers found', 'webba-booking-lite'),
            ];
        }

        return $phones;
    }

    /**
     * Returns WABA IDs Facebook attached to the token when specific accounts were selected.
     *
     * @param string $access_token Access token.
     * @param string $api_version  Graph API version.
     * @return string[]
     */
    protected static function extract_whatsapp_target_ids($access_token, $api_version)
    {
        $waba_ids = [];
        $debug_endpoint = add_query_arg(
            [
                'input_token' => $access_token,
                'access_token' => $access_token,
            ],
            sprintf(
                'https://graph.facebook.com/%s/debug_token',
                rawurlencode($api_version)
            )
        );

        $debug_response = wp_remote_get($debug_endpoint, ['timeout' => 30]);
        if (is_wp_error($debug_response)) {
            return $waba_ids;
        }

        $debug_body = json_decode(wp_remote_retrieve_body($debug_response), true);
        if (
            !isset($debug_body['data']['granular_scopes']) ||
            !is_array($debug_body['data']['granular_scopes'])
        ) {
            return $waba_ids;
        }

        foreach ($debug_body['data']['granular_scopes'] as $scope_data) {
            if (!is_array($scope_data)) {
                continue;
            }
            $scope_name = isset($scope_data['scope'])
                ? (string) $scope_data['scope']
                : '';
            if (strpos($scope_name, 'whatsapp_') !== 0) {
                continue;
            }
            if (
                empty($scope_data['target_ids']) ||
                !is_array($scope_data['target_ids'])
            ) {
                continue;
            }
            foreach ($scope_data['target_ids'] as $target_id) {
                $value = trim((string) $target_id);
                if ($value !== '') {
                    $waba_ids[] = $value;
                }
            }
        }

        return array_values(array_unique($waba_ids));
    }

    /**
     * Discovers WABA IDs associated with an access token.
     *
     * @param string $access_token Access token.
     * @param string $api_version  Graph API version.
     * @return string[]|WP_Error
     */
    protected static function discover_waba_ids($access_token, $api_version)
    {
        $selected_ids = self::extract_whatsapp_target_ids(
            $access_token,
            $api_version
        );
        if (!empty($selected_ids)) {
            return $selected_ids;
        }

        $waba_ids = [];

        $stored_ids = get_option('wbk_whatsapp_discovered_waba_ids', []);
        if (is_array($stored_ids)) {
            foreach ($stored_ids as $stored_id) {
                $value = trim((string) $stored_id);
                if ($value !== '') {
                    $waba_ids[] = $value;
                }
            }
        }

        if (class_exists('WBK_Webba_Connect')) {
            $webba_connect = new WBK_Webba_Connect();
            $inspected_ids = $webba_connect->inspect_facebook_access_token(
                $access_token
            );
            if (is_array($inspected_ids)) {
                $waba_ids = array_merge($waba_ids, $inspected_ids);
            }
        }

        $debug_endpoint = add_query_arg(
            [
                'input_token' => $access_token,
                'access_token' => $access_token,
            ],
            sprintf(
                'https://graph.facebook.com/%s/debug_token',
                rawurlencode($api_version)
            )
        );

        $debug_response = wp_remote_get($debug_endpoint, ['timeout' => 30]);
        if (!is_wp_error($debug_response)) {
            $debug_body = json_decode(wp_remote_retrieve_body($debug_response), true);
            if (
                isset($debug_body['data']['granular_scopes']) &&
                is_array($debug_body['data']['granular_scopes'])
            ) {
                foreach ($debug_body['data']['granular_scopes'] as $scope_data) {
                    if (!is_array($scope_data)) {
                        continue;
                    }
                    $scope_name = isset($scope_data['scope'])
                        ? (string) $scope_data['scope']
                        : '';
                    if (
                        strpos($scope_name, 'whatsapp_') !== 0 &&
                        $scope_name !== 'whatsapp_business_management' &&
                        $scope_name !== 'whatsapp_business_messaging'
                    ) {
                        continue;
                    }
                    if (
                        empty($scope_data['target_ids']) ||
                        !is_array($scope_data['target_ids'])
                    ) {
                        continue;
                    }
                    foreach ($scope_data['target_ids'] as $target_id) {
                        $waba_ids[] = (string) $target_id;
                    }
                }
            }
        }

        $assigned_endpoint = add_query_arg(
            [
                'fields' => 'id,name,phone_numbers{id}',
                'limit' => 100,
            ],
            sprintf(
                'https://graph.facebook.com/%s/me/assigned_whatsapp_business_accounts',
                rawurlencode($api_version)
            )
        );
        $assigned_response = wp_remote_get($assigned_endpoint, [
            'timeout' => 30,
            'headers' => [
                'Authorization' => 'Bearer ' . $access_token,
            ],
        ]);
        if (!is_wp_error($assigned_response)) {
            $assigned_body = json_decode(
                wp_remote_retrieve_body($assigned_response),
                true
            );
            if (isset($assigned_body['data']) && is_array($assigned_body['data'])) {
                foreach ($assigned_body['data'] as $account) {
                    if (!is_array($account) || empty($account['id'])) {
                        continue;
                    }
                    $waba_ids[] = (string) $account['id'];
                }
            }
        }

        $accounts_endpoint = sprintf(
            'https://graph.facebook.com/%s/me/whatsapp_business_accounts',
            rawurlencode($api_version)
        );
        $accounts_response = wp_remote_get($accounts_endpoint, [
            'timeout' => 30,
            'headers' => [
                'Authorization' => 'Bearer ' . $access_token,
            ],
        ]);
        if (!is_wp_error($accounts_response)) {
            $accounts_body = json_decode(
                wp_remote_retrieve_body($accounts_response),
                true
            );
            if (isset($accounts_body['data']) && is_array($accounts_body['data'])) {
                foreach ($accounts_body['data'] as $account) {
                    if (!is_array($account) || empty($account['id'])) {
                        continue;
                    }
                    $waba_ids[] = (string) $account['id'];
                }
            }
        }

        $businesses_endpoint = add_query_arg(
            ['fields' => 'id,name'],
            sprintf(
                'https://graph.facebook.com/%s/me/businesses',
                rawurlencode($api_version)
            )
        );

        $businesses_response = wp_remote_get($businesses_endpoint, [
            'timeout' => 30,
            'headers' => [
                'Authorization' => 'Bearer ' . $access_token,
            ],
        ]);

        if (is_wp_error($businesses_response)) {
            return array_values(array_unique(array_filter($waba_ids)));
        }

        $businesses_code = (int) wp_remote_retrieve_response_code($businesses_response);
        $businesses_body = json_decode(wp_remote_retrieve_body($businesses_response), true);

        if ($businesses_code < 200 || $businesses_code >= 300) {
            return array_values(array_unique(array_filter($waba_ids)));
        }

        if (isset($businesses_body['data']) && is_array($businesses_body['data'])) {
            foreach ($businesses_body['data'] as $business) {
                if (!is_array($business) || empty($business['id'])) {
                    continue;
                }

                $business_id = (string) $business['id'];
                foreach (
                    [
                        'owned_whatsapp_business_accounts',
                        'client_whatsapp_business_accounts',
                    ]
                    as $edge
                ) {
                    $edge_endpoint = sprintf(
                        'https://graph.facebook.com/%s/%s/%s',
                        rawurlencode($api_version),
                        rawurlencode($business_id),
                        $edge
                    );

                    $edge_response = wp_remote_get($edge_endpoint, [
                        'timeout' => 30,
                        'headers' => [
                            'Authorization' => 'Bearer ' . $access_token,
                        ],
                    ]);

                    if (is_wp_error($edge_response)) {
                        continue;
                    }

                    $edge_body = json_decode(
                        wp_remote_retrieve_body($edge_response),
                        true
                    );
                    if (
                        !isset($edge_body['data']) ||
                        !is_array($edge_body['data'])
                    ) {
                        continue;
                    }

                    foreach ($edge_body['data'] as $account) {
                        if (!is_array($account) || empty($account['id'])) {
                            continue;
                        }
                        $waba_ids[] = (string) $account['id'];
                    }
                }
            }
        }

        return array_values(array_unique(array_filter($waba_ids)));
    }

    /**
     * Fetches phone numbers for a WABA as select options.
     *
     * @param string $waba_id      WhatsApp Business Account ID.
     * @param string $access_token Access token.
     * @param string $api_version  Graph API version.
     * @return array<string, string>|WP_Error
     */
    protected static function fetch_phone_numbers_for_waba(
        $waba_id,
        $access_token,
        $api_version
    ) {
        $endpoint = add_query_arg(
            [
                'fields' => 'id,display_phone_number,verified_name,quality_rating',
            ],
            sprintf(
                'https://graph.facebook.com/%s/%s/phone_numbers',
                rawurlencode($api_version),
                rawurlencode($waba_id)
            )
        );

        $response = wp_remote_get($endpoint, [
            'timeout' => 30,
            'headers' => [
                'Authorization' => 'Bearer ' . $access_token,
            ],
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $status_code = (int) wp_remote_retrieve_response_code($response);
        $decoded_body = json_decode(wp_remote_retrieve_body($response), true);

        if ($status_code < 200 || $status_code >= 300) {
            $error_message = __(
                'Failed to load WhatsApp phone numbers.',
                'webba-booking-lite'
            );
            if (isset($decoded_body['error']['message'])) {
                $error_message = $decoded_body['error']['message'];
            }

            return new WP_Error('wbk_whatsapp_api_error', $error_message, [
                'status' => $status_code,
                'body' => $decoded_body,
            ]);
        }

        $options = [];
        if (isset($decoded_body['data']) && is_array($decoded_body['data'])) {
            foreach ($decoded_body['data'] as $phone) {
                if (!is_array($phone) || empty($phone['id'])) {
                    continue;
                }

                $phone_id = (string) $phone['id'];
                $display = isset($phone['display_phone_number'])
                    ? (string) $phone['display_phone_number']
                    : $phone_id;
                $verified_name = isset($phone['verified_name'])
                    ? (string) $phone['verified_name']
                    : '';

                $options[$phone_id] =
                    $verified_name !== ''
                        ? sprintf('%s (%s)', $verified_name, $display)
                        : $display;
            }
        }

        return $options;
    }

    /**
     * Posts a payload to the WhatsApp Cloud API messages endpoint.
     *
     * @param array $payload Request body.
     * @return bool|WP_Error
     */
    protected static function request_messages_api($payload)
    {
        $access_token = self::get_access_token();
        $phone_number_id = trim((string) get_option('wbk_whatsapp_phone_number_id', ''));
        $api_version = self::get_graph_api_version();

        if ($access_token === '' || $phone_number_id === '') {
            return new WP_Error(
                'wbk_whatsapp_missing_credentials',
                'WhatsApp access token or phone number ID is not configured.'
            );
        }

        if ($api_version === '') {
            $api_version = 'v22.0';
        }

        $endpoint = sprintf(
            'https://graph.facebook.com/%s/%s/messages',
            rawurlencode($api_version),
            rawurlencode($phone_number_id)
        );

        $response = wp_remote_post($endpoint, [
            'timeout' => 30,
            'headers' => [
                'Authorization' => 'Bearer ' . $access_token,
                'Content-Type' => 'application/json',
            ],
            'body' => wp_json_encode($payload),
        ]);

        if (is_wp_error($response)) {
            error_log('Failed to send WhatsApp message: ' . $response->get_error_message());
            return $response;
        }

        $status_code = (int) wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        $decoded_body = json_decode($response_body, true);

        if ($status_code < 200 || $status_code >= 300) {
            $error_message = 'WhatsApp API request failed.';
            if (isset($decoded_body['error']['message'])) {
                $error_message = $decoded_body['error']['message'];
            }

            error_log('Failed to send WhatsApp message: ' . $error_message);
            return new WP_Error('wbk_whatsapp_api_error', $error_message, [
                'status' => $status_code,
                'body' => $decoded_body,
            ]);
        }

        return true;
    }

    /**
     * Builds ordered template body parameters from placeholder tokens.
     *
     * @param int|array $bookings Booking ID or list of booking IDs.
     * @param string    $placeholder_list Comma-separated placeholders, e.g. #customer_name,#service_name.
     * @return string[]
     */
    protected static function build_template_parameters($bookings, $placeholder_list)
    {
        $placeholder_list = trim($placeholder_list);
        if ($placeholder_list === '') {
            return [];
        }

        $placeholders = array_filter(
            array_map('trim', explode(',', $placeholder_list))
        );
        $parameters = [];

        foreach ($placeholders as $placeholder) {
            if ($placeholder === '') {
                continue;
            }

            if ($placeholder[0] !== '#') {
                $placeholder = '#' . $placeholder;
            }

            $resolved_value = WBK_Placeholder_Processor::process_placeholders(
                $placeholder,
                $bookings
            );
            $parameters[] = $resolved_value;
        }

        return $parameters;
    }

    /**
     * Resolves the first booking ID from mixed input.
     *
     * @param int|array $bookings Booking ID or list of booking IDs.
     * @return int|null
     */
    protected static function resolve_booking_id($bookings)
    {
        if (is_array($bookings) && count($bookings) > 0) {
            return (int) $bookings[0];
        }

        if (is_numeric($bookings)) {
            return (int) $bookings;
        }

        return null;
    }

    /**
     * Normalizes a phone number to digits only (E.164 without +).
     *
     * @param string $phone_number Raw phone number.
     * @return string
     */
    protected static function normalize_phone($phone_number)
    {
        return preg_replace('/[^0-9]/', '', (string) $phone_number);
    }
}
