<?php
/**
 * Feature Gate Class
 *
 * Handles free/pro logic and feature access control
 *
 * @package WebbaBooking
 * @since 6.0.7
 */

if (!defined('ABSPATH')) {
    exit();
}

/**
 * Class WBK_Feature_Gate
 */
class WBK_Feature_Gate
{
    /**
     * Cutoff date for determining old/legacy users
     */
    const OLD_USER_CUTOFF_DATE = '2024-11-24';

    /**
     * Constructor
     */
    public function __construct() {}

    /**
     * Check if a feature is available based on plan and free logic
     *
     * @param string $minimal_plan The plan level required (e.g., 'free', 'pro')
     * @param string|null $free_logic string or null for free logic handling
     * @return bool True if feature is available
     */
    public static function have_required_plan($minimal_plan, $free_logic = null)
    {
        if (wbk_fs()->is_free_plan()) {
            // user is on free plan
            if ($free_logic === 'only_old_users') {
                return self::is_old_user();
            } else {
                return false;
            }
        } else {
            // user is on paid plan
            if (self::check_if_plan_is_enough($minimal_plan)) {
                return true;
            } else {
                return false;
            }
        }
    }

    static function is_old_user()
    {
        $fs = wbk_fs();
        if (!is_object($fs)) {
            return false;
        }
        if (!method_exists($fs, 'get_storage')) {
            return false;
        }
        $storage = $fs->get_storage();
        if (!is_object($storage)) {
            return false;
        }

        if (isset($storage->install_timestamp)) {
            if (
                $storage->install_timestamp <
                strtotime(self::OLD_USER_CUTOFF_DATE)
            ) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if current plan meets the minimal plan requirement
     *
     * @param string $minimal_plan The minimal plan required ('start', 'standard', or 'premium')
     * @return bool True if current plan meets or exceeds the minimal plan requirement
     */
    static function check_if_plan_is_enough($minimal_plan)
    {
        if (wbk_fs()->is_plan_or_trial('pro', true)) {
            return true;
        }
        if (wbk_fs()->is_plan_or_trial('exchangeplan', true)) {
            return true;
        }
        if (wbk_fs()->is_plan_or_trial('6sites', true)) {
            return true;
        }

        // Define plan hierarchy (lower index = lower tier)
        $plan_hierarchy = ['start', 'standard', 'premium'];

        // Validate minimal plan
        $minimal_index = array_search($minimal_plan, $plan_hierarchy);
        if ($minimal_index === false) {
            return false;
        }

        // Check current plan against hierarchy
        foreach ($plan_hierarchy as $index => $plan) {
            if (wbk_fs()->is_plan_or_trial($plan, true)) {
                return $index >= $minimal_index;
            }
        }

        return false;
    }

    public static function get_plan_limit_message(
        $minimal_plan,
        $process_placeholders = true
    ) {
        $template = __(
            'Available in #plan',
            'webba-booking-lite'
        );

        $plan_name = self::get_plan_display_name($minimal_plan);

        if ($process_placeholders) {
            $template = str_replace('#plan', $plan_name, $template);
        }


        return $template;
    }

    /**
     * Get all available plans in priority order
     *
     * @return array Array of plan names in priority order (highest to lowest)
     */
    public static function get_all_plans()
    {
        return [
            'pro',
            'exchangeplan',
            '6sites',
            'premium',
            'standard',
            'start',
        ];
    }

    /**
     * Get the current plan name
     *
     * @return string The current plan name ('free', 'pro', 'exchangeplan', '6sites', 'start', 'standard', 'premium')
     */
    public static function get_current_plan()
    {
        if (wbk_fs()->is_free_plan()) {
            return 'free';
        }

        foreach (self::get_all_plans() as $plan) {
            if (wbk_fs()->is_plan_or_trial($plan, true)) {
                return $plan;
            }
        }

        return 'free';
    }

    /**
     * Get plan comparison map showing if the current plan is sufficient for each plan requirement
     *
     * @return array Array where key is plan name and value is boolean indicating if current plan is enough for that requirement
     */
    public static function get_plan_map()
    {
        $all_plans = self::get_all_plans();
        $current_plan = self::get_current_plan();
        $result = [];

        foreach ($all_plans as $plan) {
            if ($current_plan === 'free') {
                $result[$plan] = false;
                continue;
            }

            $result[$plan] = self::check_if_plan_is_enough($plan);
        }
        $result['old_free'] = $current_plan === 'free' && self::is_old_user();
        return $result;
    }

    /**
     * Get plan display name based on plan slug
     *
     * @param string $plan_slug The plan slug (e.g., 'start', 'standard', 'premium')
     * @return string The plan display name (e.g., 'Start', 'Plus', 'Pro')
     */
    public static function get_plan_display_name($plan_slug)
    {
        $plan_map = [
            'start' => 'Start',
            'standard' => 'Plus',
            'premium' => 'Pro',
        ];

        return strtoupper(
            isset($plan_map[$plan_slug]) ? $plan_map[$plan_slug] : $plan_slug
        );
    }
}
