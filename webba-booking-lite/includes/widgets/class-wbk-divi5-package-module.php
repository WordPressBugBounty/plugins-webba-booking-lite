<?php
if (!defined("ABSPATH")) {
    exit();
}

use ET\Builder\Packages\ModuleLibrary\ModuleRegistration;

/**
 * Divi 5 module for the package purchase form.
 */
class WBK_Divi5_Package_Module extends WBK_Divi5_Booking_Module
{
    /**
     * Returns builder metadata with appearance controls.
     *
     * @return array
     */
    public static function get_builder_module_metadata()
    {
        $module_json_file =
            WP_WEBBA_BOOKING__PLUGIN_DIR . "/includes/widgets/divi5/package-form/module.json";

        if (!file_exists($module_json_file)) {
            return [];
        }

        $content = file_get_contents($module_json_file);
        if (!is_string($content) || $content === "") {
            return [];
        }

        $module_json = json_decode($content, true);
        if (!is_array($module_json)) {
            return [];
        }

        if (isset($module_json["attributes"]) && is_array($module_json["attributes"])) {
            $module_json["attributes"] = self::inject_appearance_controls_into_attributes(
                $module_json["attributes"]
            );
        }

        $module_json = self::inject_appearance_groups_into_metadata($module_json);
        $module_json["wbkAppearanceDefaults"] = self::get_appearance_defaults();
        $module_json["wbkAdvancedAppearanceLocked"] = class_exists("WBK_Feature_Gate")
            ? !WBK_Feature_Gate::have_required_plan("standard")
            : true;
        $module_json["wbkUpgradeUrl"] = admin_url("admin.php?page=wbk-main-pricing");
        $module_json["wbkUpgradeMessage"] = class_exists("WBK_Feature_Gate")
            ? WBK_Feature_Gate::get_plan_limit_message("standard", true)
            : __("Available in PLUS", "webba-booking-lite");
        $module_json["wbkModuleKind"] = "packages";

        return $module_json;
    }

    /**
     * Registers the package form module.
     *
     * @return bool
     */
    public static function register()
    {
        if (!class_exists("ET\\Builder\\Packages\\ModuleLibrary\\ModuleRegistration")) {
            return false;
        }

        $module_path = WP_WEBBA_BOOKING__PLUGIN_DIR . "/includes/widgets/divi5/package-form";
        $module_json_file = $module_path . "/module.json";
        if (!file_exists($module_json_file)) {
            return false;
        }

        $module_name = self::get_module_name($module_json_file);
        if ($module_name === "") {
            return false;
        }

        if (\WP_Block_Type_Registry::get_instance()->is_registered($module_name)) {
            return true;
        }

        $metadata = self::get_builder_module_metadata();
        $register_args = [
            "render_callback" => [self::class, "render_callback"],
        ];

        if (!empty($metadata["attributes"]) && is_array($metadata["attributes"])) {
            $register_args["attributes"] = $metadata["attributes"];
        }

        $registered_block = ModuleRegistration::register_module($module_path, $register_args);

        return $registered_block instanceof \WP_Block_Type;
    }

    /**
     * Renders the package purchase form.
     *
     * @param array     $attrs Module attributes.
     * @param string    $content Child content.
     * @param \WP_Block $block Current block.
     *
     * @return string
     */
    public static function render_callback($attrs, $content, \WP_Block $block)
    {
        self::enqueue_front_assets();

        $appearance_styles = self::build_appearance_style_declarations($attrs);
        $style_attr = $appearance_styles === "" ? "" : ' style="' . esc_attr($appearance_styles) . '"';

        $output = '<div class="wbk_divi_package_form_scope"' . $style_attr . ">";
        if (class_exists("WBK_Renderer")) {
            $output .= WBK_Renderer::load_template("frontend_v6/packages", [], false);
        }
        $output .= "</div>";

        return $output;
    }
}
