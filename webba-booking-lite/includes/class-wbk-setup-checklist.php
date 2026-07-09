<?php
if (!defined('ABSPATH')) {
    exit();
}

/**
 * Setup checklist onboarding for the admin dashboard.
 */
class WBK_Setup_Checklist
{
    public const OPTION_DISMISSED = 'wbk_setup_checklist_dismissed';
    public const OPTION_MANUAL_COMPLETED = 'wbk_setup_checklist_manual_completed';
    public const OPTION_SKIPPED = 'wbk_setup_checklist_skipped_steps';
    public const OPTION_WIZARD_COMPLETED = 'wbk_setup_wizard_completed';

    public const STEP_GENERAL_SETTINGS = 'general_settings';
    public const STEP_CREATE_SERVICE = 'create_service';
    public const STEP_EMBED_FORM = 'embed_form';
    public const STEP_EMAIL_NOTIFICATIONS = 'email_notifications';
    public const STEP_CONNECT_CALENDAR = 'connect_calendar';
    public const STEP_PAYMENT_SETTINGS = 'payment_settings';
    public const STEP_ADVANCED_RULES = 'advanced_booking_rules';

    /**
     * Ordered list of checklist step identifiers.
     *
     * @return string[]
     */
    public static function get_step_ids(): array
    {
        return [
            self::STEP_GENERAL_SETTINGS,
            self::STEP_CREATE_SERVICE,
            self::STEP_EMBED_FORM,
            self::STEP_EMAIL_NOTIFICATIONS,
            self::STEP_CONNECT_CALENDAR,
            self::STEP_PAYMENT_SETTINGS,
            self::STEP_ADVANCED_RULES,
        ];
    }

    public function __construct()
    {
        add_action('rest_api_init', function () {
            register_rest_route('webba-booking/v1', '/setup-checklist', [
                'methods' => 'GET',
                'callback' => [$this, 'get_checklist'],
                'permission_callback' => [$this, 'permission_callback'],
            ]);

            register_rest_route('webba-booking/v1', '/setup-checklist/dismiss', [
                'methods' => 'POST',
                'callback' => [$this, 'dismiss_checklist'],
                'permission_callback' => [$this, 'permission_callback'],
            ]);

            register_rest_route('webba-booking/v1', '/setup-checklist/complete-step', [
                'methods' => 'POST',
                'callback' => [$this, 'complete_step'],
                'permission_callback' => [$this, 'permission_callback'],
            ]);

            register_rest_route('webba-booking/v1', '/setup-checklist/save-email-notifications', [
                'methods' => 'POST',
                'callback' => [$this, 'save_email_notifications'],
                'permission_callback' => [$this, 'permission_callback'],
            ]);

            register_rest_route('webba-booking/v1', '/setup-checklist/skip-step', [
                'methods' => 'POST',
                'callback' => [$this, 'skip_step'],
                'permission_callback' => [$this, 'permission_callback'],
            ]);

            register_rest_route('webba-booking/v1', '/onboarding/relaunch', [
                'methods' => 'POST',
                'callback' => [$this, 'relaunch_onboarding'],
                'permission_callback' => [$this, 'permission_callback'],
            ]);
        });
    }

    /**
     * Permission callback for setup checklist endpoints.
     *
     * @return bool
     */
    public function permission_callback(): bool
    {
        return current_user_can('manage_options');
    }

    /**
     * Return the full checklist state.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response
     */
    public function get_checklist(WP_REST_Request $request): WP_REST_Response
    {
        return new WP_REST_Response(self::build_state(), 200);
    }

    /**
     * Dismiss the setup checklist popup.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response
     */
    public function dismiss_checklist(WP_REST_Request $request): WP_REST_Response
    {
        update_option(self::OPTION_DISMISSED, 'true');
        WBK_Mixpanel::track_event('setup checklist dismissed', []);

        return new WP_REST_Response([
            'status' => 'success',
            'state' => self::build_state(),
        ], 200);
    }

    /**
     * Restore the setup checklist for users who dismissed it earlier.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response
     */
    public function relaunch_onboarding(WP_REST_Request $request): WP_REST_Response
    {
        self::relaunch();

        WBK_Mixpanel::track_event('setup checklist relaunched', []);

        return new WP_REST_Response([
            'status' => 'success',
            'checklist' => self::build_state(),
        ], 200);
    }

    /**
     * Show the setup checklist again after it was dismissed.
     *
     * @return void
     */
    public static function relaunch(): void
    {
        delete_option(self::OPTION_DISMISSED);
    }

    /**
     * Manually mark a checklist step as completed.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response
     */
    public function complete_step(WP_REST_Request $request): WP_REST_Response
    {
        $step_id = sanitize_text_field($request->get_param('step_id') ?? '');

        if (!in_array($step_id, self::get_step_ids(), true)) {
            return new WP_REST_Response([
                'status' => 'fail',
                'reason' => 'invalid step',
            ], 400);
        }

        $manual_completed = self::get_manual_completed_steps();
        if (!in_array($step_id, $manual_completed, true)) {
            $manual_completed[] = $step_id;
            update_option(self::OPTION_MANUAL_COMPLETED, $manual_completed);
        }

        WBK_Mixpanel::track_event('setup checklist step completed', [
            'step' => $step_id,
        ]);

        return new WP_REST_Response([
            'status' => 'success',
            'state' => self::build_state(),
        ], 200);
    }

    /**
     * Save email template enabled states and mark the email notifications step complete.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response
     */
    public function save_email_notifications(WP_REST_Request $request): WP_REST_Response
    {
        $templates = $request->get_param('templates');

        if (!is_array($templates)) {
            return new WP_REST_Response([
                'status' => 'fail',
                'reason' => 'invalid templates',
            ], 400);
        }

        foreach ($templates as $template_data) {
            if (!is_array($template_data)) {
                continue;
            }

            $template_id = intval($template_data['id'] ?? 0);
            if ($template_id <= 0) {
                continue;
            }

            $enabled = ($template_data['enabled'] ?? false) === true
                || ($template_data['enabled'] ?? '') === 'yes'
                ? 'yes'
                : '';

            $template = new WBK_Email_Template($template_id);
            if (!$template->is_loaded()) {
                continue;
            }

            $template->set('enabled', $enabled);
            $template->save();
        }

        $manual_completed = self::get_manual_completed_steps();
        if (!in_array(self::STEP_EMAIL_NOTIFICATIONS, $manual_completed, true)) {
            $manual_completed[] = self::STEP_EMAIL_NOTIFICATIONS;
            update_option(self::OPTION_MANUAL_COMPLETED, $manual_completed);
        }

        WBK_Mixpanel::track_event('setup checklist step completed', [
            'step' => self::STEP_EMAIL_NOTIFICATIONS,
        ]);

        return new WP_REST_Response([
            'status' => 'success',
            'state' => self::build_state(),
        ], 200);
    }

    /**
     * Skip an optional checklist step.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response
     */
    public function skip_step(WP_REST_Request $request): WP_REST_Response
    {
        $step_id = sanitize_text_field($request->get_param('step_id') ?? '');

        if (!self::is_skippable_step($step_id)) {
            return new WP_REST_Response([
                'status' => 'fail',
                'reason' => 'step not skippable',
            ], 400);
        }

        $skipped_steps = self::get_skipped_steps();
        if (!in_array($step_id, $skipped_steps, true)) {
            $skipped_steps[] = $step_id;
            update_option(self::OPTION_SKIPPED, $skipped_steps);
        }

        WBK_Mixpanel::track_event('setup checklist step skipped', [
            'step' => $step_id,
        ]);

        return new WP_REST_Response([
            'status' => 'success',
            'state' => self::build_state(),
        ], 200);
    }

    /**
     * Mark wizard-related checklist steps as complete.
     *
     * @return void
     */
    public static function mark_wizard_completed(): void
    {
        update_option(self::OPTION_WIZARD_COMPLETED, 'true');

        $manual_completed = self::get_manual_completed_steps();
        $wizard_steps = [self::STEP_GENERAL_SETTINGS];
        $updated = false;

        foreach ($wizard_steps as $step_id) {
            if (!in_array($step_id, $manual_completed, true)) {
                $manual_completed[] = $step_id;
                $updated = true;
            }
        }

        if ($updated) {
            update_option(self::OPTION_MANUAL_COMPLETED, $manual_completed);
        }
    }

    /**
     * Build the checklist state payload for the admin UI.
     *
     * @return array
     */
    public static function build_state(): array
    {
        $steps = self::build_steps();
        $completed_count = 0;

        foreach ($steps as $step) {
            if ($step['status'] === 'completed') {
                $completed_count++;
            }
        }

        $total_count = count($steps);
        $active_step = self::resolve_active_step($steps);
        $is_complete = $completed_count === $total_count;
        $is_dismissed = get_option(self::OPTION_DISMISSED, '') === 'true';

        return [
            'dismissed' => $is_dismissed,
            'is_complete' => $is_complete,
            'completed_count' => $completed_count,
            'total_count' => $total_count,
            'progress_percent' => $total_count > 0
                ? (int) round(($completed_count / $total_count) * 100)
                : 0,
            'active_step' => $active_step,
            'shortcode' => '[webbabooking]',
            'steps' => $steps,
            'resources' => self::get_resources(),
            'email_templates' => self::get_email_templates_for_checklist(),
        ];
    }

    /**
     * Build step definitions with computed completion status.
     *
     * @return array
     */
    private static function build_steps(): array
    {
        $admin_url = admin_url();
        $manual_completed = self::get_manual_completed_steps();
        $definitions = [
            self::STEP_GENERAL_SETTINGS => [
                'title' => __('Configure General Settings', 'webba-booking-lite'),
                'description' => __(
                    'Set the business timezone, local currency, and primary administrator email. This ensures all appointment schedules and business info display accurately to customers from day one.',
                    'webba-booking-lite'
                ),
                'required_plans' => [],
                'action_url' => $admin_url . 'admin.php?page=wbk-options&tab=options',
                'guide_url' => 'https://webba-booking.com/documentation/setup-general-settings/',
            ],
            self::STEP_CREATE_SERVICE => [
                'title' => __('Create Your First Service', 'webba-booking-lite'),
                'description' => __(
                    'Define the service name, price, duration, slot frequency, and booking capacity.',
                    'webba-booking-lite'
                ),
                'required_plans' => [],
                'action_url' => $admin_url . 'admin.php?page=wbk-services&tab=services',
                'guide_url' => '',
            ],
            self::STEP_EMBED_FORM => [
                'title' => __('Embed the Booking Form', 'webba-booking-lite'),
                'description' => __(
                    'Publish the booking form on your website. You can use it by adding a shortcode, Gutenberg block, Elementor widget, or Divi module.',
                    'webba-booking-lite'
                ),
                'required_plans' => [],
                'action_url' => $admin_url . 'edit.php?post_type=page',
                'guide_url' => 'https://webba-booking.com/documentation/how-to-add-booking-form/',
            ],
            self::STEP_EMAIL_NOTIFICATIONS => [
                'title' => __('Set Up Email Notifications', 'webba-booking-lite'),
                'description' => __(
                    'Configure automated email triggers for booking confirmations, cancellations, and reminders. This step ensures that both the administrator and the customer receive timely notifications.',
                    'webba-booking-lite'
                ),
                'required_plans' => [],
                'action_url' => $admin_url . 'admin.php?page=wbk-email-templates&tab=email-templates',
                'guide_url' => 'https://webba-booking.com/documentation/email-notifications/',
            ],
            self::STEP_CONNECT_CALENDAR => [
                'title' => __('Connect Your Calendar', 'webba-booking-lite'),
                'description' => __(
                    'Link the system with Google or Microsoft Calendar to activate two-way synchronization. This allows external appointments to automatically block out availability, eliminating double-bookings.',
                    'webba-booking-lite'
                ),
                'required_plans' => ['start'],
                'action_url' => $admin_url . 'admin.php?page=wbk-connected-calendars&tab=connected-calendars',
                'guide_url' => 'https://webba-booking.com/documentation/google-calendar-integration/',
            ],
            self::STEP_PAYMENT_SETTINGS => [
                'title' => __('Configure Payment Settings', 'webba-booking-lite'),
                'description' => __(
                    'Activate payment gateways like Stripe, PayPal, or WooCommerce integration. This allows your businesses to accept online deposits or full payments directly through the booking form.',
                    'webba-booking-lite'
                ),
                'required_plans' => ['standard'],
                'action_url' => $admin_url . 'admin.php?page=wbk-options&tab=options#wbk_payment_settings_section',
                'guide_url' => 'https://webba-booking.com/documentation/online-payments/',
            ],
            self::STEP_ADVANCED_RULES => [
                'title' => __('Explore Advanced Booking Rules', 'webba-booking-lite'),
                'description' => __(
                    'Configure booking rules, restrictions, booking form behavior, and advanced options.',
                    'webba-booking-lite'
                ),
                'required_plans' => [],
                'action_url' => $admin_url . 'admin.php?page=wbk-options&tab=options#wbk_advanced_booking_rules_section',
                'guide_url' => 'https://webba-booking.com/documentation/advanced-booking-rules/',
            ],
        ];

        $steps = [];
        $active_assigned = false;

        foreach (self::get_step_ids() as $step_id) {
            $definition = $definitions[$step_id];
            $skipped = self::is_step_skipped($step_id);
            $manually_completed = in_array($step_id, $manual_completed, true);
            $auto_completed = self::is_step_auto_completed($step_id);
            $is_completed = self::is_step_completed(
                $step_id,
                $manually_completed,
                $skipped,
                $auto_completed
            );

            if ($is_completed) {
                $status = 'completed';
            } elseif (!$active_assigned) {
                $status = 'in_progress';
                $active_assigned = true;
            } else {
                $status = 'pending';
            }

            $steps[] = [
                'id' => $step_id,
                'title' => $definition['title'],
                'description' => $definition['description'],
                'status' => $status,
                'required_plans' => $definition['required_plans'],
                'action_url' => $definition['action_url'],
                'guide_url' => $definition['guide_url'],
                'skippable' => self::is_skippable_step($step_id),
                'skipped' => $skipped,
                'auto_completed' => $auto_completed,
                'manually_completed' => $manually_completed,
            ];
        }

        return $steps;
    }

    /**
     * Resolve the active step identifier.
     *
     * @param array $steps Built step list.
     * @return string
     */
    private static function resolve_active_step(array $steps): string
    {
        foreach ($steps as $step) {
            if ($step['status'] === 'in_progress') {
                return $step['id'];
            }
        }

        $step_ids = self::get_step_ids();
        return $step_ids[0] ?? self::STEP_GENERAL_SETTINGS;
    }

    /**
     * Steps that require explicit user confirmation in the checklist UI.
     *
     * @param string $step_id Step identifier.
     * @return bool
     */
    private static function is_manual_only_step(string $step_id): bool
    {
        return in_array(
            $step_id,
            [
                self::STEP_EMAIL_NOTIFICATIONS,
                self::STEP_PAYMENT_SETTINGS,
                self::STEP_ADVANCED_RULES,
            ],
            true
        );
    }

    /**
     * Steps that can be skipped from the checklist.
     *
     * @param string $step_id Step identifier.
     * @return bool
     */
    public static function is_skippable_step(string $step_id): bool
    {
        return in_array(
            $step_id,
            [
                self::STEP_CONNECT_CALENDAR,
                self::STEP_PAYMENT_SETTINGS,
                self::STEP_ADVANCED_RULES,
            ],
            true
        );
    }

    /**
     * Determine whether a checklist step is complete.
     *
     * @param string $step_id Step identifier.
     * @param bool $manually_completed Whether the step was confirmed manually.
     * @param bool $skipped Whether the step was skipped.
     * @param bool $auto_completed Whether the step was auto-detected as complete.
     * @return bool
     */
    private static function is_step_completed(
        string $step_id,
        bool $manually_completed,
        bool $skipped,
        bool $auto_completed
    ): bool {
        if ($step_id === self::STEP_CREATE_SERVICE) {
            return self::has_bookable_items();
        }

        if ($skipped || $manually_completed) {
            return true;
        }

        if (self::is_manual_only_step($step_id)) {
            return false;
        }

        return $auto_completed;
    }

    /**
     * Determine whether a step is auto-completed from plugin data.
     *
     * @param string $step_id Step identifier.
     * @return bool
     */
    private static function is_step_auto_completed(string $step_id): bool
    {
        switch ($step_id) {
            case self::STEP_GENERAL_SETTINGS:
                return get_option(self::OPTION_WIZARD_COMPLETED, '') === 'true'
                    || self::has_general_settings_configured();

            case self::STEP_CREATE_SERVICE:
                return self::has_bookable_items();

            case self::STEP_EMBED_FORM:
                return self::is_booking_form_embedded();

            case self::STEP_EMAIL_NOTIFICATIONS:
                return false;

            case self::STEP_CONNECT_CALENDAR:
                return self::has_connected_calendar();

            case self::STEP_PAYMENT_SETTINGS:
                return false;

            case self::STEP_ADVANCED_RULES:
                return false;

            default:
                return false;
        }
    }

    /**
     * Get email templates for the checklist step UI.
     *
     * @return array
     */
    public static function get_email_templates_for_checklist(): array
    {
        global $wpdb;

        $table = get_option('wbk_db_prefix', '') . 'wbk_email_templates';

        if ($wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $table)) !== $table) {
            return [];
        }

        $rows = $wpdb->get_results(
            "SELECT id, name, type, recipients, enabled FROM {$table} ORDER BY id ASC",
            ARRAY_A
        );

        if (!is_array($rows)) {
            return [];
        }

        $notification_types = WBK_Model_Utils::get_notification_types();
        $recipient_labels_map = [
            'admin' => __('Administrator(s)', 'webba-booking-lite'),
            'customer' => __('Customer', 'webba-booking-lite'),
            'group' => __('Group Users', 'webba-booking-lite'),
        ];

        $templates = [];

        foreach ($rows as $row) {
            $recipients = json_decode($row['recipients'] ?? '[]', true);
            if (!is_array($recipients)) {
                $recipients = [];
            }

            $recipient_labels = [];
            foreach ($recipients as $recipient) {
                if (isset($recipient_labels_map[$recipient])) {
                    $recipient_labels[] = $recipient_labels_map[$recipient];
                }
            }

            $type = isset($row['type']) ? (string) $row['type'] : '';
            $type_label = isset($notification_types[$type])
                ? $notification_types[$type]
                : $type;

            $templates[] = [
                'id' => (int) $row['id'],
                'name' => isset($row['name']) ? (string) $row['name'] : '',
                'type' => $type,
                'type_label' => $type_label,
                'recipients' => array_values($recipients),
                'recipient_labels' => $recipient_labels,
                'enabled' => ($row['enabled'] ?? '') === 'yes',
            ];
        }

        return $templates;
    }

    /**
     * Check whether core general settings are configured.
     *
     * @return bool
     */
    private static function has_general_settings_configured(): bool
    {
        $timezone = get_option('wbk_timezone', false);
        $currency = get_option('wbk_payment_price_format_new', false);

        return $timezone !== false
            && $timezone !== ''
            && $currency !== false
            && $currency !== '';
    }

    /**
     * Check whether at least one service or unit exists.
     *
     * @return bool
     */
    private static function has_bookable_items(): bool
    {
        global $wpdb;

        $prefix = get_option('wbk_db_prefix', $wpdb->prefix);
        $services_table = $prefix . 'wbk_services';
        $units_table = $prefix . 'wbk_units';

        if ($wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $services_table)) === $services_table) {
            $services_count = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$services_table}");
            if ($services_count > 0) {
                return true;
            }
        }

        if ($wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $units_table)) === $units_table) {
            $units_count = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$units_table}");
            if ($units_count > 0) {
                return true;
            }
        }

        return false;
    }

    /**
     * Detect whether the booking form is embedded on a published page.
     *
     * @return bool
     */
    public static function is_booking_form_embedded(): bool
    {
        global $wpdb;

        $content_patterns = [
            '%[webbabooking%',
            '%[webba_booking%',
            '%[webba_multi_service_booking%',
            '%<!-- wp:webba-booking/form%',
            '%webba_booking_form_v6%',
        ];

        foreach ($content_patterns as $pattern) {
            $count = (int) $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT COUNT(*) FROM {$wpdb->posts}
                    WHERE post_status = 'publish'
                    AND post_type IN ('page', 'post')
                    AND post_content LIKE %s",
                    $pattern
                )
            );

            if ($count > 0) {
                return true;
            }
        }

        $elementor_patterns = [
            '%wbk_booking_form%',
            '%webba_booking_form_v6%',
            '%wbk_elementor_booking_form_scope%',
        ];

        foreach ($elementor_patterns as $pattern) {
            $count = (int) $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT COUNT(*) FROM {$wpdb->postmeta} pm
                    INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
                    WHERE pm.meta_key = '_elementor_data'
                    AND p.post_status = 'publish'
                    AND p.post_type IN ('page', 'post')
                    AND pm.meta_value LIKE %s",
                    $pattern
                )
            );

            if ($count > 0) {
                return true;
            }
        }

        $divi_count = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM {$wpdb->posts}
                WHERE post_status = 'publish'
                AND post_type IN ('page', 'post')
                AND post_content LIKE %s",
                '%wbk_divi_booking_form_scope%'
            )
        );

        return $divi_count > 0;
    }

    /**
     * Check whether a calendar integration is connected.
     *
     * @return bool
     */
    private static function has_connected_calendar(): bool
    {
        global $wpdb;

        $prefix = get_option('wbk_db_prefix', $wpdb->prefix);
        $connected_table = $prefix . 'wbk_connected_calendars';
        $legacy_table = $prefix . 'wbk_gg_calendars';

        if ($wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $connected_table)) === $connected_table) {
            $connected_count = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$connected_table}");
            if ($connected_count > 0) {
                return true;
            }
        }

        if ($wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $legacy_table)) === $legacy_table) {
            $legacy_count = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$legacy_table}");
            if ($legacy_count > 0) {
                return true;
            }
        }

        return get_option('wbk_gg_clientid', '') !== '';
    }

    /**
     * Get skipped step identifiers.
     *
     * @return string[]
     */
    private static function get_skipped_steps(): array
    {
        $stored = get_option(self::OPTION_SKIPPED, []);

        if (!is_array($stored)) {
            return [];
        }

        return array_values(
            array_filter(
                $stored,
                function ($step_id) {
                    return is_string($step_id)
                        && self::is_skippable_step($step_id);
                }
            )
        );
    }

    /**
     * Check whether a step was skipped.
     *
     * @param string $step_id Step identifier.
     * @return bool
     */
    private static function is_step_skipped(string $step_id): bool
    {
        return in_array($step_id, self::get_skipped_steps(), true);
    }

    /**
     * Get manually completed step identifiers.
     *
     * @return string[]
     */
    private static function get_manual_completed_steps(): array
    {
        $stored = get_option(self::OPTION_MANUAL_COMPLETED, []);

        if (!is_array($stored)) {
            return [];
        }

        return array_values(
            array_filter(
                $stored,
                function ($step_id) {
                    return is_string($step_id)
                        && in_array($step_id, self::get_step_ids(), true);
                }
            )
        );
    }

    /**
     * Sidebar resource links for the checklist UI.
     *
     * @return array
     */
    private static function get_resources(): array
    {
        return [
            'video_url' => 'https://www.youtube.com/watch?v=7VvZz5ZJhZQ',
            'documentation_url' => 'https://webba-booking.com/documentation',
            'support_url' => admin_url('admin.php?page=wbk-main-contact'),
            'pricing_url' => admin_url('admin.php?page=wbk-main-pricing'),
        ];
    }
}
