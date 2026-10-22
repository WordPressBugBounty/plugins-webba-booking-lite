<?php

if (!defined('ABSPATH')) {
    exit();
}

final class WBK_Options_Processor
{
    /**
     * The single instance of the class.
     * @var WBK_Options_Processor
     */
    protected static $inst = null;

    protected $options;

    private function __construct() {}

    public function add_option(
        $slug,
        $type,
        $title,
        $section,
        $args = [],
        $subsection = '',
        $page = 'wbk-options',
        $group = 'wbk_options'
    ) {
        switch ($type) {
            case 'text_alfa_numeric':
                $render_callback = 'render_text';
                $validation_callback = 'validate_text_alfa_numeric';
                break;
            case 'pass':
                $render_callback = 'render_pass';
                $validation_callback = 'validate_text';
                break;
            case 'textarea':
                $render_callback = 'render_textarea';
                $validation_callback = 'validate_textarea';
                break;
            case 'checkbox':
                $render_callback = 'render_checkbox';
                $validation_callback = 'validate_checkbox';
                break;
            case 'select':
                $render_callback = 'render_select';
                $validation_callback = 'validate_select';
                break;
            case 'radio':
                // Rendered by React admin UI; stub keeps WP settings registration working.
                $render_callback = 'render_radio';
                $validation_callback = 'validate_select';
                break;
            case 'editor':
                $render_callback = 'render_editor';
                $validation_callback = 'validate_editor';
                break;
            case 'select_multiple':
                $render_callback = 'render_select_multiple';
                $validation_callback = 'validate_select_multiple';
                break;
            case 'duration':
                $render_callback = 'render_duration';
                $validation_callback = 'validate_duration';
                break;
            case 'date_multiple':
                $render_callback = 'render_date_multiple';
                $validation_callback = 'validate_date_multiple';
                break;
            case 'business_hours':
                $render_callback = 'render_business_hours';
                $validation_callback = 'validate_business_hours';
                break;
            case 'notice':
                $render_callback = 'render_notice';
                $validation_callback = 'validate_notice';
                break;
            case 'password':
                $render_callback = 'render_password';
                $validation_callback = 'validate_password';
                break;
            case 'smtp_test':
                $render_callback = 'render_smtp_test';
                $validation_callback = 'validate_smtp_test';
                break;
            case 'zapier_test':
                $render_callback = 'render_zapier_test';
                $validation_callback = 'validate_zapier_test';
                break;
            case 'whatsapp_template':
                $render_callback = 'render_whatsapp_template';
                $validation_callback = 'validate_whatsapp_template';
                break;
            case 'whatsapp_validate':
                $render_callback = 'render_whatsapp_validate';
                $validation_callback = 'validate_whatsapp_validate';
                break;
            case 'whatsapp_auth':
                $render_callback = 'render_whatsapp_auth';
                $validation_callback = 'validate_whatsapp_auth';
                break;
            case 'push_subscribe':
                $render_callback = 'render_push_subscribe';
                $validation_callback = 'validate_push_subscribe';
                break;
            case 'this_domain_url':
                $render_callback = 'render_text';
                $validation_callback = 'validate_this_domain_url';
                break;
            case 'zoom_auth':
                $render_callback = 'render_zoom_auth';
                $validation_callback = 'validate_zoom_auth';
                break;
            case 'gmail_auth':
                $render_callback = 'render_gmail_auth';
                $validation_callback = 'validate_gmail_auth';
                break;
            case 'google_connect':
                $render_callback = 'render_google_connect';
                $validation_callback = 'validate_google_connect';
                break;
            case 'file':
                $render_callback = 'render_file';
                $validation_callback = 'validate_file';
                break;
            case 'nested_numbers':
                $render_callback = 'render_nested_numbers';
                $validation_callback = 'validate_nested_numbers';
                break;

            default:
                $render_callback = 'render_text';
                $validation_callback = 'validate_text';
                break;
        }

        $default_args = [
            'default' => '',
            'extra' => [],
            'dependency' => [],
            'description' => '',
            'popup' => '',
            'subsection' => $subsection,
            'checkbox_value' => 'enabled',
            'placeholder' => '',
        ];

        $args = array_merge($default_args, $args);

        // update default values
        if (
            !empty($args['default']) &&
            get_option($slug) === false &&
            $args['default'] !== false
        ) {
            update_option($slug, $args['default']);
        }

        add_settings_field(
            $slug,
            $title,
            [$this, $render_callback],
            $page,
            $section,
            $args
        );
        register_setting($group, $slug, [$this, $validation_callback]);
    }
    public function validate_text($input)
    {
        return WBK_Validator::kses($input);
    }
    public function validate_text_alfa_numeric($input)
    {
        return WBK_Validator::alfa_numeric($input);
    }
    public function validate_textarea($input)
    {
        return WBK_Validator::kses($input);
    }
    public function validate_checkbox($input)
    {
        return sanitize_text_field($input);
    }
    public function validate_select($input)
    {
        return sanitize_text_field($input);
    }

    public function add_style_tag($styles)
    {
        $styles[] = 'display';
        return $styles;
    }

    public function validate_editor($input)
    {
        add_filter('safe_style_css', [$this, 'add_style_tag'], 10, 1);
        $result = WBK_Validator::kses($input);
        remove_filter('safe_style_css', [$this, 'add_style_tag']);
        return $result;
    }
    public function validate_select_multiple($input)
    {
        return $input;
    }
    public function validate_duration($input)
    {
        return $input;
    }
    public function validate_date_multiple($input)
    {
        return $input;
    }
    public function validate_business_hours($input)
    {
        return $input;
    }
    public function validate_zoom_auth($input)
    {
        return $input;
    }
    public function validate_gmail_auth($input)
    {
        return '';
    }
    public function validate_google_connect($input)
    {
        return $input;
    }
    public function validate_this_domain_url($input)
    {
        return $input;
        if (
            substr(strtolower($input), 0, strlen(get_site_url())) ==
            strtolower(get_home_url())
        ) {
            return $input;
        }
        return '';
    }
    public function validate_notice($input)
    {
        return $input;
    }
    public function validate_password($input)
    {
        return $input;
    }
    public function validate_smtp_test($input)
    {
        return '';
    }
    public function validate_zapier_test($input)
    {
        return '';
    }
    public function validate_whatsapp_template($input)
    {
        return sanitize_text_field($input);
    }
    public function validate_whatsapp_validate($input)
    {
        return '';
    }
    public function validate_whatsapp_auth($input)
    {
        return $input;
    }
    public function validate_push_subscribe($input)
    {
        return '';
    }
    public function render_text($args)
    {
        $html = WBK_Renderer::load_template('options/text_field', $args, false);
        echo apply_filters('wbk_options_text_field', $html, $args);
    }
    public function render_pass($args)
    {
        WBK_Renderer::load_template('options/pass_field', $args);
    }
    public function render_textarea($args)
    {
        WBK_Renderer::load_template('options/textarea_field', $args);
    }
    public function render_checkbox($args)
    {
        WBK_Renderer::load_template('options/checkbox_field', $args);
    }
    public function render_select($args)
    {
        WBK_Renderer::load_template('options/select_field', $args);
    }
    public function render_select_multiple($args)
    {
        WBK_Renderer::load_template('options/select_multiple_field', $args);
    }
    public function render_duration($args)
    {
        WBK_Renderer::load_template('options/duration_field', $args);
    }
    public function render_date_multiple($args)
    {
        WBK_Renderer::load_template('options/date_multiple_field', $args);
    }
    public function render_business_hours($args)
    {
        WBK_Renderer::load_template('options/business_hours_field', $args);
    }
    public function render_zoom_auth($args)
    {
        WBK_Renderer::load_template('options/zoom_auth', $args);
    }
    public function render_gmail_auth($args)
    {
        echo '';
    }
    public function render_google_connect($args)
    {
        WBK_Renderer::load_template('options/google_connect', $args);
    }
    public function render_editor($args)
    {
        WBK_Renderer::load_template('options/editor_field', $args);
    }
    public function render_notice($args)
    {
        WBK_Renderer::load_template('options/notice_field', $args);
    }
    public function render_password($args)
    {
        WBK_Renderer::load_template('options/password_field', $args);
    }
    public function render_smtp_test($args)
    {
        echo '';
    }
    public function render_zapier_test($args)
    {
        echo '';
    }
    public function render_whatsapp_template($args)
    {
        echo '';
    }
    public function render_whatsapp_validate($args)
    {
        echo '';
    }
    public function render_whatsapp_auth($args)
    {
        echo '';
    }
    public function render_push_subscribe($args)
    {
        echo '';
    }

    /**
     * Settings field is rendered by the React admin UI.
     *
     * @param array $args Field arguments.
     * @return void
     */
    public function render_nested_numbers($args)
    {
        echo '';
    }

    /**
     * Keep a nested numbers option as an ordered list of numbers.
     *
     * @param mixed $input Submitted value.
     * @return array
     */
    public function validate_nested_numbers($input)
    {
        return self::sanitize_nested_numbers($input);
    }

    /**
     * Normalize a nested numbers value to a list of numbers.
     *
     * @param mixed $input Submitted value.
     * @return array
     */
    public static function sanitize_nested_numbers($input): array
    {
        $items = $input;
        if (is_string($input)) {
            $decoded = json_decode($input, true);
            $items = is_array($decoded) ? $decoded : [];
        }
        if (!is_array($items)) {
            return [];
        }

        $numbers = [];
        foreach ($items as $item) {
            if ($item === '' || $item === null || !is_numeric($item)) {
                continue;
            }
            $numbers[] = $item + 0;
        }

        return $numbers;
    }

    /**
     * Whether a settings field is UI-only and must not be written by save-options.
     *
     * @param array $field WordPress settings field descriptor.
     * @return bool
     */
    public static function is_non_persistent_field($field): bool
    {
        $callback = "";
        if (isset($field["callback"][1]) && is_string($field["callback"][1])) {
            $callback = $field["callback"][1];
        }

        return in_array(
            $callback,
            [
                "render_push_subscribe",
                "render_smtp_test",
                "render_zapier_test",
                "render_notice",
            ],
            true,
        );
    }
    public function render_radio($args)
    {
        echo '';
    }

    public function wbk_settings_section_callback($arg) {}

    /**
     * returns instance of object
     */
    public static function Instance()
    {
        if (is_null(self::$inst)) {
            self::$inst = new self();
        }

        return self::$inst;
    }

    /**
     * Reset default option values
     */
    public static function reset_defaults()
    {
        global $wp_settings_fields;
        $settings_fields = $wp_settings_fields['wbk-options'];
        foreach ($settings_fields as $section => $fields) {
            foreach ($fields as $field) {
                update_option($field['id'], $field['args']['default']);
            }
        }
    }
}

if (!function_exists('wbk_opt')) {
    function wbk_opt()
    {
        return WBK_Options_Processor::instance();
    }
}
