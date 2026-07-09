<?php
if (!defined('ABSPATH')) {
    exit();
}

/**
 * Guided feature tour with sequential tooltip balloons in the admin area.
 */
class WBK_Feature_Tour
{
    public const OPTION_COMPLETED_STEPS = 'wbk_feature_tour_completed_steps';
    public const OPTION_DISABLED = 'wbk_feature_tour_disabled';

    /**
     * Ordered list of feature tour step identifiers.
     *
     * @return string[]
     */
    public static function get_step_ids(): array
    {
        return array_keys(self::get_step_definitions());
    }

    /**
     * Step definitions for the guided admin tour.
     *
     * @return array<string, array<string, mixed>>
     */
    public static function get_step_definitions(): array
    {
        return [
            'dashboard' => [
                'message' => __(
                    'See an overview of your bookings, revenue, and key metrics at a glance.',
                    'webba-booking-lite'
                ),
                'button_text' => __('Got it!', 'webba-booking-lite'),
                'anchor' => '#adminmenu a[href*="page=wbk-dashboard"]',
                'placement' => 'right',
                'admin_only' => false,
            ],
            'services' => [
                'message' => __(
                    'Create and manage the services and units your customers can book.',
                    'webba-booking-lite'
                ),
                'button_text' => __('Makes sense!', 'webba-booking-lite'),
                'anchor' => '#adminmenu a[href*="page=wbk-services"]',
                'placement' => 'right',
                'admin_only' => false,
            ],
            'staff_members' => [
                'message' => __(
                    'Add team members and assign them to services.',
                    'webba-booking-lite'
                ),
                'button_text' => __('Sounds good!', 'webba-booking-lite'),
                'anchor' => '#adminmenu a[href*="page=wbk-staff-members"]',
                'placement' => 'right',
                'admin_only' => true,
            ],
            'locations' => [
                'message' => __(
                    'Set up locations where your services take place.',
                    'webba-booking-lite'
                ),
                'button_text' => __('Understood!', 'webba-booking-lite'),
                'anchor' => '#adminmenu a[href*="page=wbk-locations"]',
                'placement' => 'right',
                'admin_only' => true,
            ],
            'bookings' => [
                'message' => __(
                    'This is where you can see and manage all the bookings.',
                    'webba-booking-lite'
                ),
                'button_text' => __('Sounds easy!', 'webba-booking-lite'),
                'anchor' => '#adminmenu a[href*="page=wbk-appointments"]',
                'placement' => 'right',
                'admin_only' => false,
            ],
            'schedule' => [
                'message' => __(
                    'View and manage your availability on the calendar.',
                    'webba-booking-lite'
                ),
                'button_text' => __('Nice!', 'webba-booking-lite'),
                'anchor' => '#adminmenu a[href*="page=wbk-calendar"]',
                'placement' => 'right',
                'admin_only' => false,
            ],
            'form_builder' => [
                'message' => __(
                    'Customize the booking form fields your customers fill out.',
                    'webba-booking-lite'
                ),
                'button_text' => __('Show me more!', 'webba-booking-lite'),
                'anchor' => '#adminmenu a[href*="page=wbk-form-builder"]',
                'placement' => 'right',
                'admin_only' => false,
            ],
            'form_styler' => [
                'message' => __(
                    'Adjust colors, fonts, and styles for your booking form.',
                    'webba-booking-lite'
                ),
                'button_text' => __('Love it!', 'webba-booking-lite'),
                'anchor' => '#adminmenu a[href*="page=wbk-appearance"]',
                'placement' => 'right',
                'admin_only' => false,
            ],
            'email_notifications' => [
                'message' => __(
                    'Configure email notifications sent to you and your customers.',
                    'webba-booking-lite'
                ),
                'button_text' => __('Got it!', 'webba-booking-lite'),
                'anchor' => '#adminmenu a[href*="page=wbk-email-templates"]',
                'placement' => 'right',
                'admin_only' => false,
            ],
            'pricing_rules' => [
                'message' => __(
                    'Set dynamic pricing rules based on date, time, or demand.',
                    'webba-booking-lite'
                ),
                'button_text' => __('Makes sense!', 'webba-booking-lite'),
                'anchor' => '#adminmenu a[href*="page=wbk-pricing-rules"]',
                'placement' => 'right',
                'admin_only' => false,
            ],
            'coupons' => [
                'message' => __(
                    'Create discount codes for your booking forms.',
                    'webba-booking-lite'
                ),
                'button_text' => __('Sounds easy!', 'webba-booking-lite'),
                'anchor' => '#adminmenu a[href*="page=wbk-coupons"]',
                'placement' => 'right',
                'admin_only' => false,
            ],
            'connected_calendars' => [
                'message' => __(
                    'Sync bookings with Google Calendar and other calendars.',
                    'webba-booking-lite'
                ),
                'button_text' => __('Understood!', 'webba-booking-lite'),
                'anchor' => '#adminmenu a[href*="page=wbk-connected-calendars"]',
                'placement' => 'right',
                'admin_only' => false,
            ],
            'settings_menu' => [
                'message' => __(
                    'Access all plugin settings and integrations from here.',
                    'webba-booking-lite'
                ),
                'button_text' => __('Got it!', 'webba-booking-lite'),
                'anchor' => '#adminmenu a[href*="page=wbk-options"]',
                'placement' => 'right',
                'admin_only' => false,
            ],
            'shortcode_builder' => [
                'message' => __(
                    'Generate a shortcode to embed the booking form on any page.',
                    'webba-booking-lite'
                ),
                'button_text' => __('Sounds easy!', 'webba-booking-lite'),
                'anchor' => '[data-feature-tour="shortcode-builder"]',
                'placement' => 'bottom',
                'admin_only' => false,
            ],
            'quick_setup_guide' => [
                'message' => __(
                    'Open the Quick Setup Guide anytime to revisit onboarding steps and tips.',
                    'webba-booking-lite'
                ),
                'button_text' => __('Makes sense!', 'webba-booking-lite'),
                'anchor' => '[data-feature-tour="quick-setup-guide"]',
                'placement' => 'bottom',
                'admin_only' => false,
            ],
            'header_settings' => [
                'message' => __(
                    'Quick access to settings related to the page you are on.',
                    'webba-booking-lite'
                ),
                'button_text' => __('Got it!', 'webba-booking-lite'),
                'anchor' => '[data-feature-tour="header-settings"]',
                'placement' => 'bottom',
                'admin_only' => false,
            ],
        ];
    }

    public function __construct()
    {
        add_action('rest_api_init', function () {
            register_rest_route('webba-booking/v1', '/feature-tour', [
                'methods' => 'GET',
                'callback' => [$this, 'get_tour'],
                'permission_callback' => [$this, 'permission_callback'],
            ]);

            register_rest_route('webba-booking/v1', '/feature-tour/complete-step', [
                'methods' => 'POST',
                'callback' => [$this, 'complete_step'],
                'permission_callback' => [$this, 'permission_callback'],
            ]);

            register_rest_route('webba-booking/v1', '/feature-tour/dismiss', [
                'methods' => 'POST',
                'callback' => [$this, 'dismiss_tour'],
                'permission_callback' => [$this, 'permission_callback'],
            ]);
        });
    }

    /**
     * Permission callback for feature tour endpoints.
     *
     * @return bool
     */
    public function permission_callback(): bool
    {
        return current_user_can('manage_options');
    }

    /**
     * Return the full feature tour state.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response
     */
    public function get_tour(WP_REST_Request $request): WP_REST_Response
    {
        return new WP_REST_Response(self::build_state(), 200);
    }

    /**
     * Mark a feature tour step as completed.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public function complete_step(WP_REST_Request $request)
    {
        $step_id = sanitize_text_field($request->get_param('step_id'));

        if (!$step_id || !in_array($step_id, self::get_step_ids(), true)) {
            return new WP_Error(
                'invalid_step',
                __('Invalid feature tour step.', 'webba-booking-lite'),
                ['status' => 400]
            );
        }

        $completed = self::get_completed_steps();

        if (!in_array($step_id, $completed, true)) {
            $completed[] = $step_id;
            update_option(self::OPTION_COMPLETED_STEPS, $completed);
        }

        WBK_Mixpanel::track_event('feature tour step completed', [
            'step_id' => $step_id,
        ]);

        return new WP_REST_Response([
            'status' => 'success',
            'state' => self::build_state(),
        ], 200);
    }

    /**
     * Dismiss the feature tour for the current user.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response
     */
    public function dismiss_tour(WP_REST_Request $request): WP_REST_Response
    {
        update_option(self::OPTION_DISABLED, 'true');

        WBK_Mixpanel::track_event('feature tour dismissed', []);

        return new WP_REST_Response([
            'status' => 'success',
            'state' => self::build_state(),
        ], 200);
    }

    /**
     * Build the feature tour state payload.
     *
     * @return array<string, mixed>
     */
    public static function build_state(): array
    {
        if (self::is_disabled()) {
            return [
                'steps' => [],
                'active_step' => null,
                'is_complete' => true,
                'disabled' => true,
                'completed_count' => 0,
                'total_count' => 0,
            ];
        }

        $completed = self::get_completed_steps();
        $definitions = self::get_step_definitions();
        $is_admin = self::is_admin_user();
        $steps = [];

        foreach ($definitions as $step_id => $definition) {
            if (!empty($definition['admin_only']) && !$is_admin) {
                continue;
            }

            $steps[] = [
                'id' => $step_id,
                'message' => $definition['message'],
                'button_text' => $definition['button_text'],
                'anchor' => $definition['anchor'],
                'placement' => $definition['placement'],
                'completed' => in_array($step_id, $completed, true),
            ];
        }

        $active_step = null;

        foreach ($steps as $step) {
            if (!$step['completed']) {
                $active_step = $step;
                break;
            }
        }

        $completed_count = count(
            array_filter($steps, function ($step) {
                return $step['completed'];
            })
        );

        return [
            'steps' => $steps,
            'active_step' => $active_step,
            'is_complete' => $active_step === null,
            'completed_count' => $completed_count,
            'total_count' => count($steps),
        ];
    }

    /**
     * Determine whether the feature tour is disabled.
     *
     * @return bool
     */
    public static function is_disabled(): bool
    {
        return get_option(self::OPTION_DISABLED, '') === 'true';
    }

    /**
     * Get stored completed step identifiers.
     *
     * @return string[]
     */
    public static function get_completed_steps(): array
    {
        $completed = get_option(self::OPTION_COMPLETED_STEPS, []);

        if (!is_array($completed)) {
            return [];
        }

        return array_values(
            array_filter(
                array_map('sanitize_text_field', $completed),
                function ($step_id) {
                    return in_array($step_id, self::get_step_ids(), true);
                }
            )
        );
    }

    /**
     * Determine whether the current user is a site administrator.
     *
     * @return bool
     */
    private static function is_admin_user(): bool
    {
        return current_user_can('manage_options');
    }
}
