<?php
if (!defined("ABSPATH")) {
    exit();
}

use ET\Builder\Packages\ModuleLibrary\ModuleRegistration;

/**
 * Handles Divi 5 native booking module.
 */
class WBK_Divi5_Booking_Module
{
    /**
     * Returns builder metadata with dynamic picker options.
     *
     * @return array
     */
    public static function get_builder_module_metadata()
    {
        $module_json_file =
            WP_WEBBA_BOOKING__PLUGIN_DIR . "/includes/widgets/divi5/booking-form/module.json";

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

        $module_attributes = self::get_module_attributes_with_picker_options($module_json_file);
        if (!empty($module_attributes)) {
            $module_json["attributes"] = $module_attributes;
        }

        $module_json = self::inject_appearance_groups_into_metadata($module_json);
        $module_json["wbkPickerData"] = self::get_normalized_picker_data_for_builder();
        $module_json["wbkAppearanceDefaults"] = self::get_appearance_defaults();
        $module_json["wbkAdvancedAppearanceLocked"] = class_exists("WBK_Feature_Gate")
            ? !WBK_Feature_Gate::have_required_plan("standard")
            : true;
        $module_json["wbkUpgradeUrl"] = admin_url("admin.php?page=wbk-main-pricing");
        $module_json["wbkUpgradeMessage"] = class_exists("WBK_Feature_Gate")
            ? WBK_Feature_Gate::get_plan_limit_message("standard", true)
            : __("Available in PLUS", "webba-booking-lite");

        return $module_json;
    }

    /**
     * Registers Divi 5 module.
     *
     * @return bool
     */
    public static function register()
    {
        if (!class_exists("ET\\Builder\\Packages\\ModuleLibrary\\ModuleRegistration")) {
            return false;
        }

        $module_path = WP_WEBBA_BOOKING__PLUGIN_DIR . "/includes/widgets/divi5/booking-form";
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

        $register_args = [
            "render_callback" => [self::class, "render_callback"],
        ];

        $module_attributes = self::get_module_attributes_with_picker_options($module_json_file);
        if (!empty($module_attributes)) {
            $register_args["attributes"] = $module_attributes;
        }

        $registered_block = ModuleRegistration::register_module($module_path, $register_args);

        return $registered_block instanceof \WP_Block_Type;
    }

    /**
     * Renders Divi 5 booking module output.
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

        $service_value = self::get_attr_value($attrs, ["content", "advanced", "service"], "0");
        $service = is_array($service_value) ? "0" : strval($service_value ?: "0");

        $category_ids = self::normalize_id_list(
            self::get_attr_value($attrs, ["content", "advanced", "category"], [])
        );
        $location_ids = self::normalize_id_list(
            self::get_attr_value($attrs, ["content", "advanced", "location"], [])
        );
        $staff_ids = self::normalize_id_list(
            self::get_attr_value($attrs, ["content", "advanced", "staff"], [])
        );
        $category_list_toggle = self::get_attr_value($attrs, ["content", "advanced", "categoryList"], "off");
        $category_list = $category_list_toggle === "on" ? "yes" : "no";
        $hide_category = $category_list_toggle === "on" ? "no" : "yes";

        $category = count($category_ids) > 0 ? implode(",", $category_ids) : "0";
        $location = count($location_ids) > 0 ? implode(",", $location_ids) : "0";
        $staff = count($staff_ids) > 0 ? implode(",", $staff_ids) : "0";

        if (!class_exists("WBK_Renderer")) {
            return '<div class="wbk_divi_booking_form_scope"></div>';
        }

        $appearance_styles = self::build_appearance_style_declarations($attrs);
        $style_attr = $appearance_styles === "" ? "" : ' style="' . esc_attr($appearance_styles) . '"';

        $output = '<div class="wbk_divi_booking_form_scope"' . $style_attr . '>';
        $output .= WBK_Renderer::load_template(
            "frontend_v6/booking_form",
            [$service, $category_list, $category, $location, $staff, "no", $hide_category],
            false
        );
        $output .= "</div>";

        return $output;
    }

    /**
     * Returns module block name from module json file.
     *
     * @param string $module_json_file Module json path.
     *
     * @return string
     */
    public static function get_module_name($module_json_file)
    {
        if (!file_exists($module_json_file)) {
            return "";
        }

        $content = file_get_contents($module_json_file);
        if (!is_string($content) || $content === "") {
            return "";
        }

        $module_json = json_decode($content, true);
        
        if (!is_array($module_json) || empty($module_json["name"])) {
            return "";
        }

        return strval($module_json["name"]);
    }

    /**
     * Registers and enqueues booking frontend assets.
     *
     * @return void
     */
    private static function enqueue_front_assets()
    {
        if (class_exists("WBK_Gutenberg_Booking_Form_Block")) {
            WBK_Gutenberg_Booking_Form_Block::enqueue_frontend_assets();
        }
    }

    /**
     * Returns module attributes with runtime picker options.
     *
     * @param string $module_json_file Module json path.
     *
     * @return array
     */
    private static function get_module_attributes_with_picker_options($module_json_file)
    {
        if (!file_exists($module_json_file)) {
            return [];
        }

        $content = file_get_contents($module_json_file);
        if (!is_string($content) || $content === "") {
            return [];
        }

        $module_json = json_decode($content, true);
        if (!is_array($module_json) || !isset($module_json["attributes"])) {
            return [];
        }

        $attributes = $module_json["attributes"];
        $picker_data = self::get_picker_data();

        $service_options = ["0" => ["label" => __("All Services", "webba-booking-lite")]];
        foreach ($picker_data["services"] as $service) {
            $id = isset($service["id"]) ? strval($service["id"]) : "";
            $label = isset($service["label"]) ? strval($service["label"]) : "";
            if ($id === "" || $label === "") {
                continue;
            }
            $service_options[$id] = ["label" => $label];
        }

        $category_options = [];
        foreach ($picker_data["categories"] as $category) {
            $id = isset($category["id"]) ? strval($category["id"]) : "";
            $name = isset($category["name"]) ? strval($category["name"]) : "";
            if ($id === "" || $name === "") {
                continue;
            }
            $category_options[] = [
                "value" => $id,
                "label" => sprintf("%s (ID: %s)", $name, $id),
            ];
        }

        $location_options = [];
        foreach ($picker_data["locations"] as $location) {
            $id = isset($location["id"]) ? strval($location["id"]) : "";
            $label = isset($location["label"]) ? strval($location["label"]) : "";
            if ($id === "" || $label === "") {
                continue;
            }
            $location_options[] = [
                "value" => $id,
                "label" => $label,
            ];
        }

        $staff_options = [];
        foreach ($picker_data["staff_members"] as $staff) {
            $id = isset($staff["id"]) ? strval($staff["id"]) : "";
            $label = isset($staff["label"]) ? strval($staff["label"]) : "";
            if ($id === "" || $label === "") {
                continue;
            }
            $staff_options[] = [
                "value" => $id,
                "label" => $label,
            ];
        }

        $attributes["content"]["settings"]["advanced"]["service"]["item"]["component"]["props"]["options"] =
            $service_options;
        $attributes["content"]["settings"]["advanced"]["category"]["item"]["component"]["props"]["options"] =
            $category_options;
        $attributes["content"]["settings"]["advanced"]["location"]["item"]["component"]["props"]["options"] =
            $location_options;
        $attributes["content"]["settings"]["advanced"]["staff"]["item"]["component"]["props"]["options"] =
            $staff_options;

        $attributes = self::inject_appearance_controls_into_attributes($attributes);

        return $attributes;
    }

    /**
     * Returns default appearance values.
     *
     * @return array
     */
    private static function get_appearance_defaults()
    {
        $static_defaults = [
            "bg_accent" => "#15B8A9",
            "font" => '"Ubuntu", sans-serif',
            "border_radius" => "8px",
            "shadow" => "0px 0px 16px 0px #3f3f4629",
            "button_border_radius" => "8px",
            "bg_button_primary" => "#15B8A9",
            "color_button_primary" => "#ffffff",
            "bg_button_primary_hover" => "#1A5B57",
            "color_button_primary_hover" => "#ffffff",
            "bg_button_inactive" => "#edeff3",
            "color_button_inactive" => "#ffffff",
            "bg_button_selected" => "#15B8A9",
            "color_button_selected" => "#ffffff",
            "bg_button_selected_hover" => "#1A5B57",
            "color_button_selected_hover" => "#ffffff",
            "bg_button_selected_selected" => "#ffffff",
            "color_button_selected_selected" => "#22292f",
            "bg_button_secondary" => "#edeff2",
            "color_button_secondary" => "#ffffff",
            "bg_button_secondary_hover" => "#1A5B57",
            "color_button_secondary_hover" => "#ffffff",
            "bg_sidebar" => "#f9fafb",
            "color_sidebar" => "#22292F",
            "color_border_selected" => "#15B8A9",
        ];

        $defaults = $static_defaults;
        if (class_exists("WBK_Appearance_Utils")) {
            $defaults = WBK_Appearance_Utils::get_default_appearance_values();
        }

        $saved = get_option("wbk_appearance_options", []);
        if (!is_array($saved) || empty($saved)) {
            return $defaults;
        }

        $merged = $defaults;
        foreach ($saved as $key => $value) {
            if (!is_string($key) || !array_key_exists($key, $defaults)) {
                continue;
            }
            if (is_scalar($value) || $value === null) {
                $merged[$key] = (string) $value;
            }
        }

        return $merged;
    }

    /**
     * Returns border radius choices used by appearance editor.
     *
     * @return array
     */
    private static function get_border_radius_options()
    {
        return [
            "0" => __("None", "webba-booking-lite"),
            "2px" => __("2px", "webba-booking-lite"),
            "4px" => __("4px", "webba-booking-lite"),
            "6px" => __("6px", "webba-booking-lite"),
            "8px" => __("8px (Default)", "webba-booking-lite"),
            "10px" => __("10px", "webba-booking-lite"),
            "12px" => __("12px", "webba-booking-lite"),
            "14px" => __("14px", "webba-booking-lite"),
            "16px" => __("16px", "webba-booking-lite"),
            "18px" => __("18px", "webba-booking-lite"),
            "20px" => __("20px", "webba-booking-lite"),
            "22px" => __("22px", "webba-booking-lite"),
            "24px" => __("24px", "webba-booking-lite"),
            "26px" => __("26px", "webba-booking-lite"),
            "28px" => __("28px", "webba-booking-lite"),
            "30px" => __("30px", "webba-booking-lite"),
            "32px" => __("32px", "webba-booking-lite"),
            "34px" => __("34px", "webba-booking-lite"),
            "36px" => __("36px", "webba-booking-lite"),
            "38px" => __("38px", "webba-booking-lite"),
            "40px" => __("40px", "webba-booking-lite"),
        ];
    }

    /**
     * Injects Design groups into module metadata.
     *
     * @param array $module_json Module metadata.
     *
     * @return array
     */
    private static function inject_appearance_groups_into_metadata($module_json)
    {
        if (!is_array($module_json)) {
            return $module_json;
        }

        if (!isset($module_json["settings"]) || !is_array($module_json["settings"])) {
            $module_json["settings"] = [];
        }
        if (!isset($module_json["settings"]["groups"]) || !is_array($module_json["settings"]["groups"])) {
            $module_json["settings"]["groups"] = [];
        }

        $group_order = [
            ["slug" => "designGeneral", "label" => __("General", "webba-booking-lite"), "priority" => 10],
            ["slug" => "designButtonRadius", "label" => __("Buttons Border Radius", "webba-booking-lite"), "priority" => 20],
            ["slug" => "designMainButton", "label" => __("Main Button", "webba-booking-lite"), "priority" => 30],
            ["slug" => "designInactiveButton", "label" => __("Inactive Button", "webba-booking-lite"), "priority" => 40],
            ["slug" => "designSelectedButton", "label" => __("Selected Button", "webba-booking-lite"), "priority" => 50],
            ["slug" => "designSecondaryButton", "label" => __("Secondary Button", "webba-booking-lite"), "priority" => 60],
            ["slug" => "designSidebar", "label" => __("Sidebar Styling", "webba-booking-lite"), "priority" => 70],
            ["slug" => "designSelectedElements", "label" => __("Selected Elements Styling", "webba-booking-lite"), "priority" => 80],
        ];

        foreach ($group_order as $group) {
            $module_json["settings"]["groups"][$group["slug"]] = [
                "panel" => "design",
                "priority" => $group["priority"],
                "groupName" => $group["slug"],
                "component" => [
                    "name" => "divi/composite",
                    "props" => [
                        "groupLabel" => $group["label"],
                    ],
                ],
            ];
        }

        return $module_json;
    }

    /**
     * Injects appearance controls into module attributes.
     *
     * @param array $attributes Module attributes.
     *
     * @return array
     */
    private static function inject_appearance_controls_into_attributes($attributes)
    {
        if (!isset($attributes["content"]["settings"]["advanced"])) {
            return $attributes;
        }

        $defaults = self::get_appearance_defaults();
        $radius_options = self::get_border_radius_options();
        $advanced =& $attributes["content"]["settings"]["advanced"];

        $create_select_field = function ($group_slug, $attr_name, $label, $default, $priority, $options) {
            return [
                "groupType" => "group-item",
                "item" => [
                    "groupSlug" => $group_slug,
                    "attrName" => "content.advanced." . $attr_name,
                    "label" => $label,
                    "priority" => $priority,
                    "render" => true,
                    "defaultAttr" => [
                        "desktop" => [
                            "value" => strval($default),
                        ],
                    ],
                    "features" => [
                        "responsive" => false,
                        "hover" => false,
                        "sticky" => false,
                        "preset" => "content",
                    ],
                    "component" => [
                        "type" => "field",
                        "name" => "divi/select",
                        "props" => [
                            "options" => $options,
                        ],
                    ],
                ],
            ];
        };

        $create_color_field = function ($group_slug, $attr_name, $label, $default, $priority) {
            return [
                "groupType" => "group-item",
                "item" => [
                    "groupSlug" => $group_slug,
                    "attrName" => "content.advanced." . $attr_name,
                    "label" => $label,
                    "priority" => $priority,
                    "render" => true,
                    "defaultAttr" => [
                        "desktop" => [
                            "value" => strval($default),
                        ],
                    ],
                    "features" => [
                        "responsive" => false,
                        "hover" => false,
                        "sticky" => false,
                        "preset" => "content",
                    ],
                    "component" => [
                        "type" => "field",
                        "name" => "divi/color-picker",
                    ],
                ],
            ];
        };

        $font_options = [
            '"Ubuntu", sans-serif' => ["label" => __("Default Webba Font", "webba-booking-lite")],
            "inherit" => ["label" => __("Inherited From Theme", "webba-booking-lite")],
        ];

        $advanced["bg_accent"] = $create_color_field("designGeneral", "bg_accent", __("Accent Color", "webba-booking-lite"), $defaults["bg_accent"] ?? "#15B8A9", 10);
        $advanced["font"] = $create_select_field("designGeneral", "font", __("Font", "webba-booking-lite"), $defaults["font"] ?? '"Ubuntu", sans-serif', 20, $font_options);
        $advanced["border_radius"] = $create_select_field("designGeneral", "border_radius", __("Form Border Radius", "webba-booking-lite"), $defaults["border_radius"] ?? "8px", 30, $radius_options);

        $advanced["button_border_radius"] = $create_select_field("designButtonRadius", "button_border_radius", __("Buttons Border Radius", "webba-booking-lite"), $defaults["button_border_radius"] ?? "8px", 10, $radius_options);

        $advanced["bg_button_primary"] = $create_color_field("designMainButton", "bg_button_primary", __("Main Button Color", "webba-booking-lite"), $defaults["bg_button_primary"] ?? "#15B8A9", 10);
        $advanced["color_button_primary"] = $create_color_field("designMainButton", "color_button_primary", __("Main Button Text Color", "webba-booking-lite"), $defaults["color_button_primary"] ?? "#ffffff", 20);
        $advanced["bg_button_primary_hover"] = $create_color_field("designMainButton", "bg_button_primary_hover", __("Main Button Hover Color", "webba-booking-lite"), $defaults["bg_button_primary_hover"] ?? "#1A5B57", 30);
        $advanced["color_button_primary_hover"] = $create_color_field("designMainButton", "color_button_primary_hover", __("Main Button Hover Text Color", "webba-booking-lite"), $defaults["color_button_primary_hover"] ?? "#ffffff", 40);

        $advanced["bg_button_inactive"] = $create_color_field("designInactiveButton", "bg_button_inactive", __("Inactive Button Color", "webba-booking-lite"), $defaults["bg_button_inactive"] ?? "#edeff3", 10);
        $advanced["color_button_inactive"] = $create_color_field("designInactiveButton", "color_button_inactive", __("Inactive Button Text Color", "webba-booking-lite"), $defaults["color_button_inactive"] ?? "#ffffff", 20);

        $advanced["bg_button_selected"] = $create_color_field("designSelectedButton", "bg_button_selected", __("Selected Button Color", "webba-booking-lite"), $defaults["bg_button_selected"] ?? "#15B8A9", 10);
        $advanced["color_button_selected"] = $create_color_field("designSelectedButton", "color_button_selected", __("Selected Button Text Color", "webba-booking-lite"), $defaults["color_button_selected"] ?? "#ffffff", 20);
        $advanced["bg_button_selected_hover"] = $create_color_field("designSelectedButton", "bg_button_selected_hover", __("Selected Button Hover Color", "webba-booking-lite"), $defaults["bg_button_selected_hover"] ?? "#1A5B57", 30);
        $advanced["color_button_selected_hover"] = $create_color_field("designSelectedButton", "color_button_selected_hover", __("Selected Button Hover Text Color", "webba-booking-lite"), $defaults["color_button_selected_hover"] ?? "#ffffff", 40);
        $advanced["bg_button_selected_selected"] = $create_color_field("designSelectedButton", "bg_button_selected_selected", __("Selected Button Active Color", "webba-booking-lite"), $defaults["bg_button_selected_selected"] ?? "#ffffff", 50);
        $advanced["color_button_selected_selected"] = $create_color_field("designSelectedButton", "color_button_selected_selected", __("Selected Button Active Text Color", "webba-booking-lite"), $defaults["color_button_selected_selected"] ?? "#22292f", 60);

        $advanced["bg_button_secondary"] = $create_color_field("designSecondaryButton", "bg_button_secondary", __("Secondary Button Color", "webba-booking-lite"), $defaults["bg_button_secondary"] ?? "#edeff2", 10);
        $advanced["color_button_secondary"] = $create_color_field("designSecondaryButton", "color_button_secondary", __("Secondary Button Text Color", "webba-booking-lite"), $defaults["color_button_secondary"] ?? "#ffffff", 20);
        $advanced["bg_button_secondary_hover"] = $create_color_field("designSecondaryButton", "bg_button_secondary_hover", __("Secondary Button Hover Color", "webba-booking-lite"), $defaults["bg_button_secondary_hover"] ?? "#1A5B57", 30);
        $advanced["color_button_secondary_hover"] = $create_color_field("designSecondaryButton", "color_button_secondary_hover", __("Secondary Button Hover Text Color", "webba-booking-lite"), $defaults["color_button_secondary_hover"] ?? "#ffffff", 40);

        $advanced["bg_sidebar"] = $create_color_field("designSidebar", "bg_sidebar", __("Sidebar Background Color", "webba-booking-lite"), $defaults["bg_sidebar"] ?? "#f9fafb", 10);
        $advanced["color_sidebar"] = $create_color_field("designSidebar", "color_sidebar", __("Sidebar Text Color", "webba-booking-lite"), $defaults["color_sidebar"] ?? "#22292F", 20);

        $advanced["color_border_selected"] = $create_color_field("designSelectedElements", "color_border_selected", __("Selected Element Border Color", "webba-booking-lite"), $defaults["color_border_selected"] ?? "#15B8A9", 10);

        return $attributes;
    }

    /**
     * Builds appearance style declarations from Divi attributes.
     *
     * @param array $attrs Module attrs.
     *
     * @return string
     */
    private static function build_appearance_style_declarations($attrs)
    {
        $defaults = self::get_appearance_defaults();
        $get = function ($key) use ($attrs, $defaults) {
            $value = self::get_attr_value($attrs, ["content", "advanced", $key], null);
            if ($value === null || $value === "") {
                return strval($defaults[$key] ?? "");
            }
            return strval($value);
        };

        $bg_accent = $get("bg_accent");
        $bg_sidebar = $get("bg_sidebar");

        $declarations = [
            "--wbk-bg-accent: " . $bg_accent,
            "--wbk-font: " . $get("font"),
            "--wbk-border-radius: " . $get("border_radius"),
            "--wbk-shadow: " . $get("shadow"),
            "--wbk-button-border-radius: " . $get("button_border_radius"),
            "--wbk-bg-button-primary: " . $get("bg_button_primary"),
            "--wbk-color-button-primary: " . $get("color_button_primary"),
            "--wbk-bg-button-primary-hover: " . $get("bg_button_primary_hover"),
            "--wbk-color-button-primary-hover: " . $get("color_button_primary_hover"),
            "--wbk-bg-button-inactive: " . $get("bg_button_inactive"),
            "--wbk-color-button-inactive: " . $get("color_button_inactive"),
            "--wbk-bg-button-selected: " . $get("bg_button_selected"),
            "--wbk-color-button-selected: " . $get("color_button_selected"),
            "--wbk-bg-button-selected-hover: " . $get("bg_button_selected_hover"),
            "--wbk-color-button-selected-hover: " . $get("color_button_selected_hover"),
            "--wbk-bg-button-selected-selected: " . $get("bg_button_selected_selected"),
            "--wbk-color-button-selected-selected: " . $get("color_button_selected_selected"),
            "--wbk-bg-button-secondary: " . $get("bg_button_secondary"),
            "--wbk-color-button-secondary: " . $get("color_button_secondary"),
            "--wbk-bg-button-secondary-hover: " . $get("bg_button_secondary_hover"),
            "--wbk-color-button-secondary-hover: " . $get("color_button_secondary_hover"),
            "--wbk-bg-sidebar: " . $bg_sidebar,
            "--wbk-color-sidebar: " . $get("color_sidebar"),
            "--wbk-color-border-selected: " . $get("color_border_selected"),
            "--wbk-primary-50: color-mix(in srgb, " . $bg_accent . " 5%, white 95%)",
            "--wbk-primary-100: color-mix(in srgb, " . $bg_accent . " 10%, white 90%)",
            "--wbk-primary-200: color-mix(in srgb, " . $bg_accent . " 20%, white 80%)",
            "--wbk-primary-300: color-mix(in srgb, " . $bg_accent . " 30%, white 70%)",
            "--wbk-primary-400: color-mix(in srgb, " . $bg_accent . " 40%, white 60%)",
            "--wbk-primary-500: " . $bg_accent,
            "--wbk-primary-600: color-mix(in srgb, " . $bg_accent . " 88%, black 12%)",
            "--wbk-primary-700: color-mix(in srgb, " . $bg_accent . " 76%, black 24%)",
            "--wbk-primary-800: color-mix(in srgb, " . $bg_accent . " 64%, black 36%)",
            "--wbk-primary-900: color-mix(in srgb, " . $bg_accent . " 52%, black 48%)",
            "--wbk-primary-950: color-mix(in srgb, " . $bg_accent . " 44%, black 56%)",
            "--wbk-primary-text-50: #22292F",
            "--wbk-primary-text-100: #22292F",
            "--wbk-primary-text-200: #22292F",
            "--wbk-primary-text-300: #22292F",
            "--wbk-primary-text-400: #22292F",
            "--wbk-primary-text-500: #FFFFFF",
            "--wbk-primary-text-600: #FFFFFF",
            "--wbk-primary-text-700: #FFFFFF",
            "--wbk-primary-text-800: #FFFFFF",
            "--wbk-primary-text-900: #FFFFFF",
            "--wbk-primary-text-950: #FFFFFF",
            "--wbk-primary-filter-500: none",
            "--wbk-secondary-50: color-mix(in srgb, " . $bg_sidebar . " 5%, white 95%)",
            "--wbk-secondary-100: color-mix(in srgb, " . $bg_sidebar . " 10%, white 90%)",
            "--wbk-secondary-200: color-mix(in srgb, " . $bg_sidebar . " 20%, white 80%)",
            "--wbk-secondary-300: color-mix(in srgb, " . $bg_sidebar . " 30%, white 70%)",
            "--wbk-secondary-400: color-mix(in srgb, " . $bg_sidebar . " 40%, white 60%)",
            "--wbk-secondary-500: " . $bg_sidebar,
            "--wbk-secondary-600: color-mix(in srgb, " . $bg_sidebar . " 88%, black 12%)",
            "--wbk-secondary-700: color-mix(in srgb, " . $bg_sidebar . " 76%, black 24%)",
            "--wbk-secondary-800: color-mix(in srgb, " . $bg_sidebar . " 64%, black 36%)",
            "--wbk-secondary-900: color-mix(in srgb, " . $bg_sidebar . " 52%, black 48%)",
            "--wbk-secondary-950: color-mix(in srgb, " . $bg_sidebar . " 44%, black 56%)",
            "--wbk-secondary-text-50: #22292F",
            "--wbk-secondary-text-100: #22292F",
            "--wbk-secondary-text-200: #22292F",
            "--wbk-secondary-text-300: #22292F",
            "--wbk-secondary-text-400: #22292F",
            "--wbk-secondary-text-500: #22292F",
            "--wbk-secondary-text-600: #FFFFFF",
            "--wbk-secondary-text-700: #FFFFFF",
            "--wbk-secondary-text-800: #FFFFFF",
            "--wbk-secondary-text-900: #FFFFFF",
            "--wbk-secondary-text-950: #FFFFFF",
            "--wbk-secondary-filter-500: none",
        ];

        return implode("; ", $declarations) . ";";
    }

    /**
     * Returns picker data from preset endpoint.
     *
     * @return array
     */
    private static function get_picker_data()
    {
        if (function_exists("rest_do_request")) {
            try {
                $request = new \WP_REST_Request("GET", "/wbk/v2/get-preset");
                $response = rest_do_request($request);
                if (!is_wp_error($response) && $response instanceof \WP_REST_Response) {
                    $preset_data = $response->get_data();
                    if (is_array($preset_data)) {
                        return [
                            "services" => $preset_data["services"] ?? [],
                            "categories" => $preset_data["categories"] ?? [],
                            "locations" => $preset_data["locations"] ?? [],
                            "staff_members" => $preset_data["staff_members"] ?? [],
                        ];
                    }
                }
            } catch (\Throwable $exception) {
            }
        }

        global $wbk_request_manager;
        if (
            isset($wbk_request_manager) &&
            is_object($wbk_request_manager) &&
            method_exists($wbk_request_manager, "get_preset")
        ) {
            try {
                $preset_request = new \WP_REST_Request("GET", "/wbk/v2/get-preset");
                $preset_response = $wbk_request_manager->get_preset($preset_request);
                if ($preset_response instanceof \WP_REST_Response) {
                    $preset_data = $preset_response->get_data();
                    if (is_array($preset_data)) {
                        return [
                            "services" => $preset_data["services"] ?? [],
                            "categories" => $preset_data["categories"] ?? [],
                            "locations" => $preset_data["locations"] ?? [],
                            "staff_members" => $preset_data["staff_members"] ?? [],
                        ];
                    }
                }
            } catch (\Throwable $exception) {
            }
        }

        return [
            "services" => [],
            "categories" => [],
            "locations" => [],
            "staff_members" => [],
        ];
    }

    /**
     * Returns normalized picker data for builder-side filtering logic.
     *
     * @return array
     */
    private static function get_normalized_picker_data_for_builder()
    {
        $picker_data = self::get_picker_data();

        $services = [];
        foreach ($picker_data["services"] as $service) {
            $id = isset($service["id"]) ? strval($service["id"]) : "";
            if ($id === "") {
                continue;
            }
            $services[] = [
                "id" => $id,
                "label" => isset($service["label"]) ? strval($service["label"]) : "",
                "locations" => array_values(
                    array_map(
                        "strval",
                        array_filter((array) ($service["locations"] ?? []), function ($value) {
                            return $value !== null && $value !== "";
                        })
                    )
                ),
            ];
        }

        $categories = [];
        foreach ($picker_data["categories"] as $category) {
            $id = isset($category["id"]) ? strval($category["id"]) : "";
            if ($id === "") {
                continue;
            }
            $categories[] = [
                "id" => $id,
                "name" => isset($category["name"]) ? strval($category["name"]) : "",
                "services" => array_values(
                    array_map(
                        "strval",
                        array_filter((array) ($category["services"] ?? []), function ($value) {
                            return $value !== null && $value !== "";
                        })
                    )
                ),
            ];
        }

        $locations = [];
        foreach ($picker_data["locations"] as $location) {
            $id = isset($location["id"]) ? strval($location["id"]) : "";
            if ($id === "") {
                continue;
            }
            $locations[] = [
                "id" => $id,
                "label" => isset($location["label"]) ? strval($location["label"]) : "",
            ];
        }

        $staff_members = [];
        foreach ($picker_data["staff_members"] as $staff_member) {
            $id = isset($staff_member["id"]) ? strval($staff_member["id"]) : "";
            if ($id === "") {
                continue;
            }
            $staff_members[] = [
                "id" => $id,
                "label" => isset($staff_member["label"]) ? strval($staff_member["label"]) : "",
                "services" => array_values(
                    array_map(
                        "strval",
                        array_filter((array) ($staff_member["services"] ?? []), function ($value) {
                            return $value !== null && $value !== "";
                        })
                    )
                ),
                "location" => array_values(
                    array_map(
                        "strval",
                        array_filter((array) ($staff_member["location"] ?? []), function ($value) {
                            return $value !== null && $value !== "";
                        })
                    )
                ),
            ];
        }

        return [
            "services" => $services,
            "categories" => $categories,
            "locations" => $locations,
            "staff_members" => $staff_members,
        ];
    }

    /**
     * Reads module attribute in Divi shape.
     *
     * @param array $attrs Attributes.
     * @param array $path Path segments.
     * @param mixed $default Default value.
     *
     * @return mixed
     */
    private static function get_attr_value($attrs, $path, $default = null)
    {
        if (!is_array($attrs)) {
            return $default;
        }

        $value = $attrs;
        foreach ($path as $segment) {
            if (!is_array($value) || !array_key_exists($segment, $value)) {
                return $default;
            }
            $value = $value[$segment];
        }

        if (is_array($value) && isset($value["desktop"]) && is_array($value["desktop"])) {
            if (array_key_exists("value", $value["desktop"])) {
                return $value["desktop"]["value"];
            }
        }

        if (is_array($value) && array_key_exists("value", $value)) {
            return $value["value"];
        }

        return $value;
    }

    /**
     * Normalizes multi-select values from Divi checkboxes.
     *
     * @param mixed $value Field value.
     *
     * @return array
     */
    private static function normalize_id_list($value)
    {
        if (is_array($value)) {
            $is_associative = array_keys($value) !== range(0, count($value) - 1);
            if ($is_associative) {
                $selected_ids = [];
                foreach ($value as $key => $selected) {
                    if ($selected === true || $selected === 1 || $selected === "1" || $selected === "on") {
                        $selected_ids[] = $key;
                    }
                }
                $value = $selected_ids;
            }
        }

        if (!is_array($value)) {
            if (is_string($value) && strpos($value, ",") !== false) {
                $value = array_map("trim", explode(",", $value));
            } elseif ($value === null || $value === "" || $value === "0") {
                $value = [];
            } else {
                $value = [$value];
            }
        }

        $ids = [];
        foreach ($value as $item) {
            $id = intval($item);
            if ($id > 0) {
                $ids[] = strval($id);
            }
        }

        return array_values(array_unique($ids));
    }
}
