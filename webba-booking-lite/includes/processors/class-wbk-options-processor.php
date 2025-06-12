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

    private function __construct()
    {
    }

    public function add_option(
        $slug,
        $type,
        $title,
        $section,
        $args = [],
        $subsection = 'basic',
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
            case 'editor':
                $render_callback = 'render_editor';
                $validation_callback = 'validate_editor';
                break;
            case 'select_multiple':
                $render_callback = 'render_select_multiple';
                $validation_callback = 'validate_select_multiple';
                break;
            case 'this_domain_url':
                $render_callback = 'render_text';
                $validation_callback = 'validate_this_domain_url';
                break;
            case 'zoom_auth':
                $render_callback = 'render_zoom_auth';
                $validation_callback = 'validate_zoom_auth';
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
        if (!empty($args['default']) && get_option($slug) === false && $args['default'] !== false) {
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
    public function validate_zoom_auth($input)
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
    public function render_zoom_auth($args)
    {
        WBK_Renderer::load_template('options/zoom_auth', $args);
    }
    public function render_editor($args)
    {
        WBK_Renderer::load_template('options/editor_field', $args);
    }
    public function wbk_settings_section_callback($arg)
    {
    }

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
