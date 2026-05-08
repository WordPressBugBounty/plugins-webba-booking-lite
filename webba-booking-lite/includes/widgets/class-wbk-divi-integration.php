<?php
if (!defined("ABSPATH")) {
    exit();
}

/**
 * Integrates Webba Booking with Divi builder.
 */
class WBK_Divi_Integration
{
    /**
     * Registers Divi related hooks.
     */
    public function __construct()
    {
        add_action("init", [$this, "register_divi5_module"], 20);
        add_action("wp", [$this, "register_divi5_module"], 1);
        add_action("et_builder_ready", [$this, "register_divi5_module"], 5);
        add_action("wp_enqueue_scripts", [$this, "enqueue_builder_front_assets"]);
        add_action(
            "divi_visual_builder_assets_before_enqueue_scripts",
            [$this, "enqueue_divi5_builder_register_script"]
        );

        if (did_action("et_builder_ready")) {
            $this->register_divi5_module();
        }
    }

    /**
     * Registers Divi 5 module.
     *
     * @return void
     */
    public function register_divi5_module()
    {
        if (!class_exists("ET\\Builder\\Packages\\ModuleLibrary\\ModuleRegistration")) {
            return;
        }

        $module_file =
            WP_WEBBA_BOOKING__PLUGIN_DIR .
            "/includes/widgets/class-wbk-divi5-booking-module.php";

        if (!file_exists($module_file)) {
            return;
        }

        include_once $module_file;

        if (class_exists("WBK_Divi5_Booking_Module")) {
            WBK_Divi5_Booking_Module::register();
        }
    }

    /**
     * Determines whether request runs in Divi visual builder context.
     *
     * @return bool
     */
    private function is_divi_builder_request()
    {
        if (function_exists("et_core_is_fb_enabled") && et_core_is_fb_enabled()) {
            return true;
        }

        if (isset($_GET["et_fb"]) && $_GET["et_fb"] === "1") {
            return true;
        }

        if (isset($_REQUEST["et_fb"]) && $_REQUEST["et_fb"] === "1") {
            return true;
        }

        if (
            isset($_REQUEST["action"]) &&
            in_array(
                $_REQUEST["action"],
                ["et_fb_ajax_render_shortcode", "et_fb_get_computed_styles"],
                true
            )
        ) {
            return true;
        }

        return false;
    }

    /**
     * Loads booking frontend assets in Divi builder preview.
     *
     * @return void
     */
    public function enqueue_builder_front_assets()
    {
        if (!$this->is_divi_builder_request()) {
            return;
        }

        if (!wp_script_is("wbk-frontend-v6-script", "registered")) {
            wp_register_script(
                "wbk-frontend-v6-script",
                WP_WEBBA_BOOKING__PLUGIN_URL . "/build/frontend/index.js",
                ["wp-element", "wp-api-fetch", "wp-data"],
                WP_WEBBA_BOOKING__VERSION,
                true
            );
        }

        if (!wp_style_is("wbk-frontend6", "registered")) {
            wp_register_style(
                "wbk-frontend6",
                WP_WEBBA_BOOKING__PLUGIN_URL . "/build/frontend/index.css",
                [],
                WP_WEBBA_BOOKING__VERSION
            );
        }

        if (!wp_style_is("wbk-frontend-style-config", "registered")) {
            wp_register_style(
                "wbk-frontend-style-config",
                content_url() . "/webba_booking_style/wbk6-frontend-config.css",
                [],
                WP_WEBBA_BOOKING__VERSION
            );
        }

        wp_enqueue_script("jquery-effects-fade");
        wp_enqueue_style("wbk-frontend-style-config");
        wp_enqueue_style("wbk-frontend6");
        wp_enqueue_script("wbk-frontend-v6-script");

        $this->enqueue_divi5_module_register_script_for_current_window();
    }

    /**
     * Enqueues Divi 5 app-window script that registers module in module library.
     *
     * @return void
     */
    public function enqueue_divi5_builder_register_script()
    {
        if (
            !function_exists("et_core_is_fb_enabled") ||
            !et_core_is_fb_enabled()
        ) {
            return;
        }

        if (!class_exists("WBK_Divi5_Booking_Module")) {
            $module_file =
                WP_WEBBA_BOOKING__PLUGIN_DIR .
                "/includes/widgets/class-wbk-divi5-booking-module.php";
            if (file_exists($module_file)) {
                include_once $module_file;
            }
        }

        $metadata = class_exists("WBK_Divi5_Booking_Module")
            ? WBK_Divi5_Booking_Module::get_builder_module_metadata()
            : [];

        $this->enqueue_divi5_module_register_script_for_current_window($metadata);
    }

    /**
     * Enqueues module register script in the current window context.
     *
     * @param array|null $metadata Optional metadata payload.
     *
     * @return void
     */
    private function enqueue_divi5_module_register_script_for_current_window($metadata = null)
    {
        if ($metadata === null) {
            if (!class_exists("WBK_Divi5_Booking_Module")) {
                $module_file =
                    WP_WEBBA_BOOKING__PLUGIN_DIR .
                    "/includes/widgets/class-wbk-divi5-booking-module.php";
                if (file_exists($module_file)) {
                    include_once $module_file;
                }
            }

            $metadata = class_exists("WBK_Divi5_Booking_Module")
                ? WBK_Divi5_Booking_Module::get_builder_module_metadata()
                : [];
        }

        wp_enqueue_script(
            "wbk-divi5-module-register",
            WP_WEBBA_BOOKING__PLUGIN_URL . "/public/js/wbk-divi5-module-register.js",
            [],
            WP_WEBBA_BOOKING__VERSION,
            true
        );

        wp_add_inline_script(
            "wbk-divi5-module-register",
            "window.wbkDivi5ModuleMetadata = " . wp_json_encode($metadata) . ";",
            "before"
        );
    }
}
