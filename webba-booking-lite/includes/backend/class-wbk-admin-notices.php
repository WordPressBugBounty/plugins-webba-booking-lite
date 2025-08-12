<?php

defined('ABSPATH') or exit;

/**
 * Used to show admin notices
 * Supports conditional views, dismissal
 *
 * @package WBK
 */
class WBK_Admin_Notices2
{
    /**
     * Option key to store ignored notices
     *
     * @var string
     */
    private $option_key = 'wbk_ignore_notices';

    /**
     * Ignored notices
     *
     * @var array
     */
    private $ignored = [];

    public function __construct()
    {
        $this->ignored = get_option($this->option_key, []);

        add_action('admin_notices', [$this, 'show_notices']);
        add_action('wp_ajax_wbk_dismiss_notice', [$this, 'dismiss_notice']);
    }

    /**
     * Show admin notices on hook fire
     *
     * @return void
     */
    public function show_notices(): void
    {
        $notices = $this->get_notices();

        if (!is_admin()) {
            return;
        }

        foreach ($notices as $id => $notice) {
            if (!isset($notice['message']) || empty($notice['message'])) {
                continue;
            }

            if (isset($notice['condition']) && !$notice['condition']()) {
                continue;
            }

            $props = [
                'dismissible' => true,
                'id' => $id,
                'additional_classes' => ['wbk-admin-notice']
            ];

            if (isset($notice['type'])) {
                $props['type'] = $notice['type'];
            }
            if (function_exists('wp_admin_notice')) {
                wp_admin_notice($notice['message'], $props);
            }
        }
    }

    /**
     * Check if notice should be shown
     *
     * @param string $notice_id
     * @return boolean
     */
    private function should_show(string $notice_id): bool
    {
        return !in_array($notice_id, $this->ignored);
    }

    /**
     * Dismiss notice
     *
     * @return void
     */
    public function dismiss_notice(): void
    {
        $notice_id = trim(sanitize_text_field($_POST['notice_id']));

        $this->ignored[] = $notice_id;
        $this->ignored = array_unique($this->ignored);

        update_option($this->option_key, $this->ignored);
    }

    /**
     * Get notices
     *
     * @return array
     */
    protected function get_notices(): array
    {
        $notices = [
            'inform_email_duplication_v_5118' => [
                'message' => sprintf(__('IMPORTANT: please double check your <a href="%s/">Email Notifications</a> page for any template duplication to avoid multiple emails. Also make sure that the templates have at least 1 or all services assigned. Read more in our <a href="%s" target="_blank">documentation</a>.', 'webba-booking-lite'), admin_url('admin.php?page=wbk-email-templates&tab=email-templates'), 'https://webba-booking.com/documentation/email-notifications/'),
                'type' => 'info',
                'condition' => function () {
                    return isset($_GET['page']) && 0 === strpos($_GET['page'], 'wbk-');
                }
            ]
        ];

        if (wbk_fs()->is_free_plan()) {
            $notices['new_changes_v_606'] = [
                'message' => sprintf(__('IMPORTANT! Webba Booking v6 is here and it may affect your current configuration. <a href="%s" target="_blank">Please read more about it here</a>', 'webba-booking-lite') , 'https://webba-booking.com/blog/webba-6-0/'),
                'type' => 'info',
                'condition' => function () {
                    return isset($_GET['page']) && 0 === strpos($_GET['page'], 'wbk-');
                }
            ];
        }

        return array_filter($notices, function ($props, $id) {
            return $this->should_show($id);
        }, ARRAY_FILTER_USE_BOTH);
    }
}
