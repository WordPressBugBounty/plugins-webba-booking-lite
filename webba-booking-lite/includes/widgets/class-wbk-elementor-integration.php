<?php
if (!defined('ABSPATH')) {
    exit();
}

/**
 * Integrates Webba Booking frontend app with Elementor.
 */
class WBK_Elementor_Integration
{
    /**
     * Prevents duplicate enqueue calls from multiple Elementor hooks.
     *
     * @var bool
     */
    private $assets_enqueued = false;

    /**
     * Registers initialization hook.
     */
    public function __construct()
    {
        if (did_action('elementor/loaded')) {
            $this->init();
            return;
        }

        add_action('elementor/loaded', [$this, 'init']);
    }

    /**
     * Registers Elementor hooks when Elementor is available.
     *
     * @return void
     */
    public function init()
    {
        if (!class_exists('\Elementor\Plugin')) {
            return;
        }

        add_action('elementor/widgets/register', [$this, 'register_widgets']);
        add_action('elementor/frontend/after_enqueue_scripts', [$this, 'enqueue_assets']);
        add_action('elementor/frontend/after_enqueue_styles', [$this, 'enqueue_assets']);
        add_action('elementor/preview/enqueue_scripts', [$this, 'enqueue_assets']);
        add_action('elementor/preview/enqueue_styles', [$this, 'enqueue_assets']);
        add_action('elementor/editor/after_enqueue_scripts', [$this, 'enqueue_assets']);
        add_action('elementor/editor/after_enqueue_styles', [$this, 'enqueue_assets']);
        add_action('elementor/editor/after_enqueue_scripts', [$this, 'enqueue_editor_script']);
    }

    /**
     * Registers Webba Booking Elementor widgets.
     *
     * @param \Elementor\Widgets_Manager $widgets_manager Elementor widgets manager.
     *
     * @return void
     */
    public function register_widgets($widgets_manager)
    {
        require_once WP_WEBBA_BOOKING__PLUGIN_DIR .
            '/includes/widgets/class-wbk-elementor-booking-form-widget.php';

        $widget_class_name = 'WBK_Elementor_Booking_Form_Widget';
        if (!class_exists($widget_class_name)) {
            return;
        }

        $widgets_manager->register(new $widget_class_name());
    }

    /**
     * Enqueues existing frontend v6 assets for Elementor pages.
     *
     * @return void
     */
    public function enqueue_assets()
    {
        if ($this->assets_enqueued) {
            return;
        }

        $this->register_assets();
        wp_enqueue_script('jquery-effects-fade');
        wp_enqueue_style('wbk-frontend-style-config');
        wp_enqueue_style('wbk-frontend6');
        wp_enqueue_script('wbk-frontend-v6-script');

        $this->assets_enqueued = true;
    }

    /**
     * Registers frontend handles when they are not yet registered.
     *
     * @return void
     */
    private function register_assets()
    {
        if (!wp_script_is('wbk-frontend-v6-script', 'registered')) {
            wp_register_script(
                'wbk-frontend-v6-script',
                WP_WEBBA_BOOKING__PLUGIN_URL . '/build/frontend/index.js',
                ['wp-element', 'wp-api-fetch', 'wp-data'],
                WP_WEBBA_BOOKING__VERSION,
                true
            );
        }

        if (!wp_style_is('wbk-frontend6', 'registered')) {
            wp_register_style(
                'wbk-frontend6',
                WP_WEBBA_BOOKING__PLUGIN_URL . '/build/frontend/index.css',
                [],
                WP_WEBBA_BOOKING__VERSION
            );
        }

        if (!wp_style_is('wbk-frontend-style-config', 'registered')) {
            wp_register_style(
                'wbk-frontend-style-config',
                content_url() . '/webba_booking_style/wbk6-frontend-config.css',
                [],
                WP_WEBBA_BOOKING__VERSION
            );
        }
    }

    /**
     * Enqueues Elementor editor-only control filtering logic.
     *
     * @return void
     */
    public function enqueue_editor_script()
    {
        $editor_filters_path =
            WP_WEBBA_BOOKING__PLUGIN_DIR . '/public/js/wbk-elementor-editor-filters.js';
        $editor_filters_version = file_exists($editor_filters_path)
            ? filemtime($editor_filters_path)
            : WP_WEBBA_BOOKING__VERSION;

        wp_enqueue_script(
            'wbk-elementor-editor-filters',
            WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/wbk-elementor-editor-filters.js',
            ['jquery', 'wp-api-fetch'],
            $editor_filters_version,
            true
        );

        $is_advanced_appearance_locked = true;
        if (class_exists('WBK_Feature_Gate')) {
            $is_advanced_appearance_locked = !WBK_Feature_Gate::have_required_plan(
                'standard'
            );
        }

        wp_localize_script(
            'wbk-elementor-editor-filters',
            'wbkElementorAdvancedAppearanceLock',
            [
                'locked' => $is_advanced_appearance_locked,
                'upgradeUrl' => admin_url('admin.php?page=wbk-main-pricing'),
                'title' => __('Upgrade Required', 'webba-booking-lite'),
                'message' => class_exists('WBK_Feature_Gate')
                    ? WBK_Feature_Gate::get_plan_limit_message('standard', true)
                    : __('Available in PLUS', 'webba-booking-lite'),
                'button' => __('Upgrade', 'webba-booking-lite'),
            ]
        );
    }
}
?>
