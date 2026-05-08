<?php
if (!defined('ABSPATH')) {
    exit();
}

/**
 * Server render and asset loading for the Webba Booking Gutenberg block.
 */
class WBK_Gutenberg_Booking_Form_Block
{
    /**
     * Renders the booking form block on the front end.
     *
     * @param array    $attributes Block attributes.
     * @param string   $content    Inner blocks content.
     * @param WP_Block $block      Block instance.
     *
     * @return string
     */
    public static function render($attributes, $content, $block)
    {
        self::enqueue_frontend_assets();

        $service = self::get_single_id_string($attributes['service'] ?? '');
        $category_list = !empty($attributes['categoryList']) ? 'yes' : 'no';
        $hide_category = !empty($attributes['categoryList']) ? 'no' : 'yes';
        $category = self::format_id_csv($attributes['category'] ?? []);
        $location = self::format_id_csv($attributes['location'] ?? []);
        $staff = self::format_id_csv($attributes['staff'] ?? []);

        $appearance = self::resolve_appearance_from_attributes(is_array($attributes) ? $attributes : []);
        $inline_style = self::build_scope_inline_style($appearance);
        $style_attr = $inline_style === '' ? '' : ' style="' . esc_attr($inline_style) . '"';

        if (!class_exists('WBK_Renderer')) {
            return '<div class="wbk_elementor_booking_form_scope"' . $style_attr . '></div>';
        }

        $html = '<div class="wbk_elementor_booking_form_scope"' . $style_attr . '>';
        $html .= WBK_Renderer::load_template(
            'frontend_v6/booking_form',
            [$service, $category_list, $category, $location, $staff, 'no', $hide_category],
            false
        );
        $html .= '</div>';

        return $html;
    }

    /**
     * Registers and enqueues booking frontend assets (v6 bundle).
     *
     * @return void
     */
    public static function enqueue_frontend_assets()
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

        wp_enqueue_script('jquery-effects-fade');
        wp_enqueue_style('wbk-frontend-style-config');
        wp_enqueue_style('wbk-frontend6');
        wp_enqueue_script('wbk-frontend-v6-script');
    }

    /**
     * Returns default appearance values (aligned with Elementor / Divi).
     *
     * @return array
     */
    private static function get_appearance_defaults()
    {
        $static_defaults = [
            'bg_accent' => '#15B8A9',
            'font' => '"Ubuntu", sans-serif',
            'border_radius' => '8px',
            'shadow' => '0px 0px 16px 0px #3f3f4629',
            'button_border_radius' => '8px',
            'bg_button_primary' => '#15B8A9',
            'color_button_primary' => '#ffffff',
            'bg_button_primary_hover' => '#1A5B57',
            'color_button_primary_hover' => '#ffffff',
            'bg_button_inactive' => '#edeff3',
            'color_button_inactive' => '#ffffff',
            'bg_button_selected' => '#15B8A9',
            'color_button_selected' => '#ffffff',
            'bg_button_selected_hover' => '#1A5B57',
            'color_button_selected_hover' => '#ffffff',
            'bg_button_selected_selected' => '#ffffff',
            'color_button_selected_selected' => '#22292f',
            'bg_button_secondary' => '#edeff2',
            'color_button_secondary' => '#ffffff',
            'bg_button_secondary_hover' => '#1A5B57',
            'color_button_secondary_hover' => '#ffffff',
            'bg_sidebar' => '#f9fafb',
            'color_sidebar' => '#22292F',
            'color_border_selected' => '#15B8A9',
        ];

        $defaults = $static_defaults;
        if (class_exists('WBK_Appearance_Utils')) {
            $defaults = WBK_Appearance_Utils::get_default_appearance_values();
        }

        $saved = get_option('wbk_appearance_options', []);
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
     * Merges block appearance attributes with defaults.
     *
     * @param array $attributes Block attributes.
     *
     * @return array
     */
    private static function resolve_appearance_from_attributes(array $attributes)
    {
        $defaults = self::get_appearance_defaults();
        $keys = [
            'bg_accent',
            'font',
            'border_radius',
            'shadow',
            'button_border_radius',
            'bg_button_primary',
            'color_button_primary',
            'bg_button_primary_hover',
            'color_button_primary_hover',
            'bg_button_inactive',
            'color_button_inactive',
            'bg_button_selected',
            'color_button_selected',
            'bg_button_selected_hover',
            'color_button_selected_hover',
            'bg_button_selected_selected',
            'color_button_selected_selected',
            'bg_button_secondary',
            'color_button_secondary',
            'bg_button_secondary_hover',
            'color_button_secondary_hover',
            'bg_sidebar',
            'color_sidebar',
            'color_border_selected',
        ];

        $out = [];
        foreach ($keys as $key) {
            $value = $attributes[$key] ?? null;
            if ($value === null || $value === '') {
                $out[$key] = strval($defaults[$key] ?? '');
            } else {
                $out[$key] = strval($value);
            }
        }

        return $out;
    }

    /**
     * Builds inline CSS custom properties for the scope wrapper.
     *
     * @param array $appearance Resolved appearance map.
     *
     * @return string
     */
    private static function build_scope_inline_style(array $appearance)
    {
        $bg_accent = $appearance['bg_accent'];
        $bg_sidebar = $appearance['bg_sidebar'];

        $declarations = [
            '--wbk-bg-accent: ' . $bg_accent,
            '--wbk-font: ' . $appearance['font'],
            '--wbk-border-radius: ' . $appearance['border_radius'],
            '--wbk-shadow: ' . $appearance['shadow'],
            '--wbk-button-border-radius: ' . $appearance['button_border_radius'],
            '--wbk-bg-button-primary: ' . $appearance['bg_button_primary'],
            '--wbk-color-button-primary: ' . $appearance['color_button_primary'],
            '--wbk-bg-button-primary-hover: ' . $appearance['bg_button_primary_hover'],
            '--wbk-color-button-primary-hover: ' . $appearance['color_button_primary_hover'],
            '--wbk-bg-button-inactive: ' . $appearance['bg_button_inactive'],
            '--wbk-color-button-inactive: ' . $appearance['color_button_inactive'],
            '--wbk-bg-button-selected: ' . $appearance['bg_button_selected'],
            '--wbk-color-button-selected: ' . $appearance['color_button_selected'],
            '--wbk-bg-button-selected-hover: ' . $appearance['bg_button_selected_hover'],
            '--wbk-color-button-selected-hover: ' . $appearance['color_button_selected_hover'],
            '--wbk-bg-button-selected-selected: ' . $appearance['bg_button_selected_selected'],
            '--wbk-color-button-selected-selected: ' . $appearance['color_button_selected_selected'],
            '--wbk-bg-button-secondary: ' . $appearance['bg_button_secondary'],
            '--wbk-color-button-secondary: ' . $appearance['color_button_secondary'],
            '--wbk-bg-button-secondary-hover: ' . $appearance['bg_button_secondary_hover'],
            '--wbk-color-button-secondary-hover: ' . $appearance['color_button_secondary_hover'],
            '--wbk-bg-sidebar: ' . $bg_sidebar,
            '--wbk-color-sidebar: ' . $appearance['color_sidebar'],
            '--wbk-color-border-selected: ' . $appearance['color_border_selected'],
            '--wbk-primary-50: color-mix(in srgb, ' . $bg_accent . ' 5%, white 95%)',
            '--wbk-primary-100: color-mix(in srgb, ' . $bg_accent . ' 10%, white 90%)',
            '--wbk-primary-200: color-mix(in srgb, ' . $bg_accent . ' 20%, white 80%)',
            '--wbk-primary-300: color-mix(in srgb, ' . $bg_accent . ' 30%, white 70%)',
            '--wbk-primary-400: color-mix(in srgb, ' . $bg_accent . ' 40%, white 60%)',
            '--wbk-primary-500: ' . $bg_accent,
            '--wbk-primary-600: color-mix(in srgb, ' . $bg_accent . ' 88%, black 12%)',
            '--wbk-primary-700: color-mix(in srgb, ' . $bg_accent . ' 76%, black 24%)',
            '--wbk-primary-800: color-mix(in srgb, ' . $bg_accent . ' 64%, black 36%)',
            '--wbk-primary-900: color-mix(in srgb, ' . $bg_accent . ' 52%, black 48%)',
            '--wbk-primary-950: color-mix(in srgb, ' . $bg_accent . ' 44%, black 56%)',
            '--wbk-primary-text-50: #22292F',
            '--wbk-primary-text-100: #22292F',
            '--wbk-primary-text-200: #22292F',
            '--wbk-primary-text-300: #22292F',
            '--wbk-primary-text-400: #22292F',
            '--wbk-primary-text-500: #FFFFFF',
            '--wbk-primary-text-600: #FFFFFF',
            '--wbk-primary-text-700: #FFFFFF',
            '--wbk-primary-text-800: #FFFFFF',
            '--wbk-primary-text-900: #FFFFFF',
            '--wbk-primary-text-950: #FFFFFF',
            '--wbk-primary-filter-500: none',
            '--wbk-secondary-50: color-mix(in srgb, ' . $bg_sidebar . ' 5%, white 95%)',
            '--wbk-secondary-100: color-mix(in srgb, ' . $bg_sidebar . ' 10%, white 90%)',
            '--wbk-secondary-200: color-mix(in srgb, ' . $bg_sidebar . ' 20%, white 80%)',
            '--wbk-secondary-300: color-mix(in srgb, ' . $bg_sidebar . ' 30%, white 70%)',
            '--wbk-secondary-400: color-mix(in srgb, ' . $bg_sidebar . ' 40%, white 60%)',
            '--wbk-secondary-500: ' . $bg_sidebar,
            '--wbk-secondary-600: color-mix(in srgb, ' . $bg_sidebar . ' 88%, black 12%)',
            '--wbk-secondary-700: color-mix(in srgb, ' . $bg_sidebar . ' 76%, black 24%)',
            '--wbk-secondary-800: color-mix(in srgb, ' . $bg_sidebar . ' 64%, black 36%)',
            '--wbk-secondary-900: color-mix(in srgb, ' . $bg_sidebar . ' 52%, black 48%)',
            '--wbk-secondary-950: color-mix(in srgb, ' . $bg_sidebar . ' 44%, black 56%)',
            '--wbk-secondary-text-50: #22292F',
            '--wbk-secondary-text-100: #22292F',
            '--wbk-secondary-text-200: #22292F',
            '--wbk-secondary-text-300: #22292F',
            '--wbk-secondary-text-400: #22292F',
            '--wbk-secondary-text-500: #22292F',
            '--wbk-secondary-text-600: #FFFFFF',
            '--wbk-secondary-text-700: #FFFFFF',
            '--wbk-secondary-text-800: #FFFFFF',
            '--wbk-secondary-text-900: #FFFFFF',
            '--wbk-secondary-text-950: #FFFFFF',
            '--wbk-secondary-filter-500: none',
        ];

        return implode('; ', $declarations) . ';';
    }

    /**
     * Normalizes a scalar or array to a comma-separated id string for the template (0 if empty).
     *
     * @param mixed $value Attribute value.
     *
     * @return string
     */
    private static function format_id_csv($value)
    {
        if (is_array($value)) {
            $ids = array_map('intval', $value);
            $ids = array_filter($ids, fn($id) => $id > 0);
            $ids = array_values(array_unique($ids));
            return count($ids) > 0 ? implode(',', $ids) : '0';
        }

        if (is_numeric($value)) {
            $int_value = intval($value);
            return $int_value > 0 ? (string) $int_value : '0';
        }

        if (!is_string($value)) {
            return '0';
        }

        $value = trim($value);
        if ($value === '' || $value === '0') {
            return '0';
        }

        $decoded = json_decode($value, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            return self::format_id_csv($decoded);
        }

        if (strpos($value, ',') !== false) {
            $parts = array_map('trim', explode(',', $value));
            return self::format_id_csv($parts);
        }

        return is_numeric($value) ? (string) intval($value) : '0';
    }

    /**
     * Returns a single service id or 0.
     *
     * @param mixed $value Service attribute.
     *
     * @return string
     */
    private static function get_single_id_string($value)
    {
        if (is_array($value)) {
            $value = reset($value);
        }
        $int_value = intval($value);
        return $int_value > 0 ? (string) $int_value : '0';
    }
}
