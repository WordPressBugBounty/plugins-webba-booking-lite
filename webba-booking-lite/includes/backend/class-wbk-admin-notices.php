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
        ];

        return array_filter($notices, function ($props, $id) {
            return $this->should_show($id);
        }, ARRAY_FILTER_USE_BOTH);
    }
}
