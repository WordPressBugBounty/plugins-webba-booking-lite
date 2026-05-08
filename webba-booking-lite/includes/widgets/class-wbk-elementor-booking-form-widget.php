<?php
if (!defined('ABSPATH')) {
    exit();
}

/**
 * Elementor widget for rendering the Webba Booking React form mount.
 */
class WBK_Elementor_Booking_Form_Widget extends \Elementor\Widget_Base
{
    /**
     * Returns default appearance values.
     *
     * @return array
     */
    private function get_appearance_defaults(): array
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
     * Returns border radius choices used by appearance editor.
     *
     * @return array
     */
    private function get_border_radius_options(): array
    {
        return [
            '0' => __('None', 'webba-booking-lite'),
            '2px' => __('2px', 'webba-booking-lite'),
            '4px' => __('4px', 'webba-booking-lite'),
            '6px' => __('6px', 'webba-booking-lite'),
            '8px' => __('8px (Default)', 'webba-booking-lite'),
            '10px' => __('10px', 'webba-booking-lite'),
            '12px' => __('12px', 'webba-booking-lite'),
            '14px' => __('14px', 'webba-booking-lite'),
            '16px' => __('16px', 'webba-booking-lite'),
            '18px' => __('18px', 'webba-booking-lite'),
            '20px' => __('20px', 'webba-booking-lite'),
            '22px' => __('22px', 'webba-booking-lite'),
            '24px' => __('24px', 'webba-booking-lite'),
            '26px' => __('26px', 'webba-booking-lite'),
            '28px' => __('28px', 'webba-booking-lite'),
            '30px' => __('30px', 'webba-booking-lite'),
            '32px' => __('32px', 'webba-booking-lite'),
            '34px' => __('34px', 'webba-booking-lite'),
            '36px' => __('36px', 'webba-booking-lite'),
            '38px' => __('38px', 'webba-booking-lite'),
            '40px' => __('40px', 'webba-booking-lite'),
        ];
    }

    private function get_scope_selector(): string
    {
        return '{{WRAPPER}} .wbk_elementor_booking_form_scope';
    }

    private function get_variable_selectors(string $css_variable): array
    {
        return [
            $this->get_scope_selector() => $css_variable . ': {{VALUE}};',
        ];
    }

    private function get_accent_selectors(): array
    {
        $declarations = [
            '--wbk-bg-accent: {{VALUE}}',
            '--wbk-primary-50: color-mix(in srgb, {{VALUE}} 5%, white 95%)',
            '--wbk-primary-100: color-mix(in srgb, {{VALUE}} 10%, white 90%)',
            '--wbk-primary-200: color-mix(in srgb, {{VALUE}} 20%, white 80%)',
            '--wbk-primary-300: color-mix(in srgb, {{VALUE}} 30%, white 70%)',
            '--wbk-primary-400: color-mix(in srgb, {{VALUE}} 40%, white 60%)',
            '--wbk-primary-500: {{VALUE}}',
            '--wbk-primary-600: color-mix(in srgb, {{VALUE}} 88%, black 12%)',
            '--wbk-primary-700: color-mix(in srgb, {{VALUE}} 76%, black 24%)',
            '--wbk-primary-800: color-mix(in srgb, {{VALUE}} 64%, black 36%)',
            '--wbk-primary-900: color-mix(in srgb, {{VALUE}} 52%, black 48%)',
            '--wbk-primary-950: color-mix(in srgb, {{VALUE}} 44%, black 56%)',
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
        ];

        return [
            $this->get_scope_selector() => implode(';', $declarations) . ';',
        ];
    }

    private function get_sidebar_selectors(): array
    {
        $declarations = [
            '--wbk-bg-sidebar: {{VALUE}}',
            '--wbk-secondary-50: color-mix(in srgb, {{VALUE}} 5%, white 95%)',
            '--wbk-secondary-100: color-mix(in srgb, {{VALUE}} 10%, white 90%)',
            '--wbk-secondary-200: color-mix(in srgb, {{VALUE}} 20%, white 80%)',
            '--wbk-secondary-300: color-mix(in srgb, {{VALUE}} 30%, white 70%)',
            '--wbk-secondary-400: color-mix(in srgb, {{VALUE}} 40%, white 60%)',
            '--wbk-secondary-500: {{VALUE}}',
            '--wbk-secondary-600: color-mix(in srgb, {{VALUE}} 88%, black 12%)',
            '--wbk-secondary-700: color-mix(in srgb, {{VALUE}} 76%, black 24%)',
            '--wbk-secondary-800: color-mix(in srgb, {{VALUE}} 64%, black 36%)',
            '--wbk-secondary-900: color-mix(in srgb, {{VALUE}} 52%, black 48%)',
            '--wbk-secondary-950: color-mix(in srgb, {{VALUE}} 44%, black 56%)',
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

        return [
            $this->get_scope_selector() => implode(';', $declarations) . ';',
        ];
    }

    private function normalize_id_list($value): array
    {
        if (is_array($value)) {
            $value = array_map('intval', $value);
            $value = array_filter($value, fn($item) => $item > 0);
            return array_values(array_unique($value));
        }

        if (is_numeric($value)) {
            $int_value = intval($value);
            return $int_value > 0 ? [$int_value] : [];
        }

        if (!is_string($value)) {
            return [];
        }

        $value = trim($value);
        if ($value === '') {
            return [];
        }

        $decoded = json_decode($value, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            return $this->normalize_id_list($decoded);
        }

        if (strpos($value, ',') !== false) {
            $parts = array_map('trim', explode(',', $value));
            return $this->normalize_id_list($parts);
        }

        return is_numeric($value) ? [intval($value)] : [];
    }

    private function get_shortcode_filter_value(array $widget_settings, string $key): string
    {
        if (!isset($widget_settings[$key])) {
            return '';
        }
        $value = trim((string) $widget_settings[$key]);
        if ($value === '' || $value === '0') {
            return '';
        }
        return $value;
    }

    private function get_shortcode_picker_data(): array
    {
        global $wpdb;
        $table_prefixes = [];
        $configured_prefix = get_option('wbk_db_prefix', '');
        if (!empty($configured_prefix)) {
            $table_prefixes[] = $configured_prefix;
        }
        if (!in_array($wpdb->prefix, $table_prefixes, true)) {
            $table_prefixes[] = $wpdb->prefix;
        }

        $detect_table_prefix = function (string $suffix) use ($wpdb, $table_prefixes): string {
            foreach ($table_prefixes as $prefix) {
                $table_name = $prefix . $suffix;
                $query = $wpdb->prepare('SHOW TABLES LIKE %s', $table_name);
                if ($wpdb->get_var($query) === $table_name) {
                    return $prefix;
                }
            }
            return '';
        };

        $resolved_prefix = $detect_table_prefix('wbk_services');
        if ($resolved_prefix === '') {
            return [
                'services' => [],
                'categories' => [],
                'locations' => [],
                'staff_members' => [],
            ];
        }

        $services_rows = $wpdb->get_results(
            'SELECT id, name, locations FROM ' . $resolved_prefix . 'wbk_services',
            ARRAY_A
        );
        $categories_rows = $wpdb->get_results(
            'SELECT id, name, list FROM ' . $resolved_prefix . 'wbk_service_categories',
            ARRAY_A
        );
        $locations_rows = $wpdb->get_results(
            'SELECT id, name FROM ' . $resolved_prefix . 'wbk_locations',
            ARRAY_A
        );
        $staff_rows = $wpdb->get_results(
            'SELECT id, name, services, locations FROM ' . $resolved_prefix . 'wbk_staff_members',
            ARRAY_A
        );

        $services = [];
        foreach ($services_rows as $service_row) {
            $service_id = intval($service_row['id']);
            $locations = $this->normalize_id_list($service_row['locations'] ?? '');
            $services[] = [
                'id' => $service_id,
                'label' => (string) ($service_row['name'] ?? ''),
                'locations' => $locations,
                'staff_members' => [],
            ];
        }

        $categories = [];
        foreach ($categories_rows as $category_row) {
            $service_ids = $this->normalize_id_list($category_row['list'] ?? '');
            $categories[] = [
                'id' => intval($category_row['id']),
                'name' => (string) ($category_row['name'] ?? ''),
                'services' => $service_ids,
            ];
        }

        $locations = [];
        foreach ($locations_rows as $location_row) {
            $locations[] = [
                'id' => intval($location_row['id']),
                'label' => (string) ($location_row['name'] ?? ''),
            ];
        }

        $staff_members = [];
        foreach ($staff_rows as $staff_row) {
            $staff_members[] = [
                'id' => intval($staff_row['id']),
                'label' => (string) ($staff_row['name'] ?? ''),
                'services' => $this->normalize_id_list($staff_row['services'] ?? ''),
                'locations' => $this->normalize_id_list($staff_row['locations'] ?? ''),
            ];
        }

        foreach ($staff_members as $staff_member) {
            foreach ($services as &$service_item) {
                if (in_array($service_item['id'], $staff_member['services'], true)) {
                    $service_item['staff_members'][] = $staff_member['id'];
                }
            }
        }
        unset($service_item);

        return [
            'services' => $services,
            'categories' => $categories,
            'locations' => $locations,
            'staff_members' => $staff_members,
        ];
    }

    private function get_visible_service_ids(
        array $picker_data,
        array $selection,
        string $ignore = ''
    ): array {
        $visible_ids = [];
        foreach ($picker_data['services'] as $service) {
            $visible_ids[(string) $service['id']] = true;
        }

        if (!empty($selection['service']) && $ignore !== 'service') {
            $service_key = (string) $selection['service'];
            $visible_ids = isset($visible_ids[$service_key]) ? [$service_key => true] : [];
        }

        if (!empty($selection['category']) && $ignore !== 'category') {
            $from_categories = [];
            foreach ($picker_data['categories'] as $category) {
                if ((string) $category['id'] !== (string) $selection['category']) {
                    continue;
                }
                foreach ($category['services'] as $service_id) {
                    $from_categories[(string) $service_id] = true;
                }
            }
            $visible_ids = array_intersect_key($visible_ids, $from_categories);
        }

        if (!empty($selection['location']) && $ignore !== 'location') {
            $from_locations = [];
            foreach ($picker_data['services'] as $service) {
                if (in_array(intval($selection['location']), $service['locations'], true)) {
                    $from_locations[(string) $service['id']] = true;
                }
            }
            $visible_ids = array_intersect_key($visible_ids, $from_locations);
        }

        if (!empty($selection['staff']) && $ignore !== 'staff') {
            $from_staff = [];
            foreach ($picker_data['staff_members'] as $staff_member) {
                if ((string) $staff_member['id'] !== (string) $selection['staff']) {
                    continue;
                }
                foreach ($staff_member['services'] as $service_id) {
                    $from_staff[(string) $service_id] = true;
                }
            }
            $visible_ids = array_intersect_key($visible_ids, $from_staff);
        }

        return array_keys($visible_ids);
    }

    private function get_shortcode_options(array $picker_data, array $selection): array
    {
        $service_options = ['' => __('All Services', 'webba-booking-lite')];
        foreach ($picker_data['services'] as $service) {
            if (empty($service['id'])) {
                continue;
            }
            $service_options[(string) $service['id']] = $service['label'];
        }

        $category_options = [];
        foreach ($picker_data['categories'] as $category) {
            if (empty($category['id'])) {
                continue;
            }
            $category_options[(string) $category['id']] = sprintf(
                '%s (ID: %d)',
                $category['name'],
                $category['id']
            );
        }

        $location_options = [];
        foreach ($picker_data['locations'] as $location) {
            if (empty($location['id'])) {
                continue;
            }
            $location_options[(string) $location['id']] = $location['label'];
        }

        $staff_options = [];
        foreach ($picker_data['staff_members'] as $staff_member) {
            if (empty($staff_member['id'])) {
                continue;
            }
            $staff_options[(string) $staff_member['id']] = $staff_member['label'];
        }

        return [
            'service' => $service_options,
            'category' => $category_options,
            'location' => $location_options,
            'staff' => $staff_options,
        ];
    }

    private function get_attribute_value($value, bool $allow_multiple = false): string
    {
        if ($allow_multiple) {
            $ids = $this->normalize_id_list($value);
            return count($ids) > 0 ? implode(',', $ids) : '0';
        }

        if (is_array($value)) {
            $value = reset($value);
        }
        $value = intval($value);
        return $value > 0 ? (string) $value : '0';
    }

    /**
     * Returns internal widget name.
     *
     * @return string
     */
    public function get_name()
    {
        return 'wbk_booking_form';
    }

    /**
     * Returns widget title.
     *
     * @return string
     */
    public function get_title()
    {
        return __('Webba Booking Form', 'webba-booking-lite');
    }

    /**
     * Returns widget icon.
     *
     * @return string
     */
    public function get_icon()
    {
        return 'eicon-calendar';
    }

    /**
     * Returns widget categories.
     *
     * @return array
     */
    public function get_categories()
    {
        return ['general'];
    }

    /**
     * Adds a subsection title in the Style tab (with optional top separator).
     *
     * @param string $control_id Unique control id.
     * @param string $label      Subsection title.
     * @param bool   $with_separator_before Whether to show a line above the heading.
     *
     * @return void
     */
    private function add_style_subsection_heading(
        string $control_id,
        string $label,
        bool $with_separator_before = true
    ): void {
        $config = [
            'type' => \Elementor\Controls_Manager::HEADING,
            'label' => $label,
        ];
        if ($with_separator_before) {
            $config['separator'] = 'before';
        }
        $this->add_control($control_id, $config);
    }

    /**
     * Registers widget controls.
     *
     * @return void
     */
    protected function register_controls()
    {
        $defaults = $this->get_appearance_defaults();
        $picker_data = $this->get_shortcode_picker_data();
        $shortcode_options = $this->get_shortcode_options(
            $picker_data,
            [
                'service' => '',
                'category' => '',
                'location' => '',
                'staff' => '',
            ]
        );

        $this->start_controls_section(
            'wbk_booking_context',
            [
                'label' => __('Booking Context', 'webba-booking-lite'),
            ]
        );

        $this->add_control(
            'service',
            [
                'label' => __('Service', 'webba-booking-lite'),
                'type' => \Elementor\Controls_Manager::SELECT2,
                'options' => $shortcode_options['service'],
                'default' => '',
                'label_block' => true,
            ]
        );

        $this->add_control(
            'category',
            [
                'label' => __('Category', 'webba-booking-lite'),
                'type' => \Elementor\Controls_Manager::SELECT2,
                'options' => $shortcode_options['category'],
                'default' => [],
                'multiple' => true,
                'label_block' => true,
            ]
        );

        $this->add_control(
            'location',
            [
                'label' => __('Location', 'webba-booking-lite'),
                'type' => \Elementor\Controls_Manager::SELECT2,
                'options' => $shortcode_options['location'],
                'default' => [],
                'multiple' => true,
                'label_block' => true,
            ]
        );

        $this->add_control(
            'staff',
            [
                'label' => __('Staff', 'webba-booking-lite'),
                'type' => \Elementor\Controls_Manager::SELECT2,
                'options' => $shortcode_options['staff'],
                'default' => [],
                'multiple' => true,
                'label_block' => true,
            ]
        );

        $this->add_control(
            'category_list',
            [
                'label' => __('Show Category List', 'webba-booking-lite'),
                'type' => \Elementor\Controls_Manager::SWITCHER,
                'return_value' => 'yes',
                'default' => 'yes',
            ]
        );

        $this->end_controls_section();

        $this->start_controls_section(
            'wbk_appearance_general',
            [
                'label' => __('General', 'webba-booking-lite'),
                'tab' => \Elementor\Controls_Manager::TAB_STYLE,
            ]
        );

        $this->add_control(
            'bg_accent',
            [
                'label' => __('Accent Color', 'webba-booking-lite'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'default' => $defaults['bg_accent'],
                'render_type' => 'ui',
                'selectors' => $this->get_accent_selectors(),
            ]
        );

        $this->add_control(
            'font',
            [
                'label' => __('Font', 'webba-booking-lite'),
                'type' => \Elementor\Controls_Manager::SELECT,
                'default' => '"Ubuntu", sans-serif',
                'options' => [
                    '"Ubuntu", sans-serif' => __(
                        'Default Webba Font',
                        'webba-booking-lite'
                    ),
                    'inherit' => __('Inherited From Theme', 'webba-booking-lite'),
                ],
                'render_type' => 'ui',
                'selectors' => $this->get_variable_selectors('--wbk-font'),
            ]
        );

        $this->add_control(
            'border_radius',
            [
                'label' => __('Form Border Radius', 'webba-booking-lite'),
                'type' => \Elementor\Controls_Manager::SELECT,
                'default' => $defaults['border_radius'],
                'options' => $this->get_border_radius_options(),
                'render_type' => 'ui',
                'selectors' => $this->get_variable_selectors('--wbk-border-radius'),
            ]
        );

        $this->add_group_control(
            \Elementor\Group_Control_Box_Shadow::get_type(),
            [
                'name' => 'shadow',
                'label' => __('Form Shadow', 'webba-booking-lite'),
                'selector' =>
                    '{{WRAPPER}} .wbk_elementor_booking_form_scope .wbk_booking_form__body',
            ]
        );

        $this->end_controls_section();

        $this->start_controls_section(
            'wbk_appearance_advanced',
            [
                'label' => __('Advanced', 'webba-booking-lite'),
                'tab' => \Elementor\Controls_Manager::TAB_STYLE,
            ]
        );

        $this->add_style_subsection_heading(
            'wbk_style_heading_button_radius',
            __("Buttons' Border Radius", 'webba-booking-lite'),
            false
        );

        $this->add_control(
            'button_border_radius',
            [
                'label' => __("Buttons' Border Radius", 'webba-booking-lite'),
                'type' => \Elementor\Controls_Manager::SELECT,
                'default' => $defaults['button_border_radius'],
                'options' => $this->get_border_radius_options(),
                'render_type' => 'ui',
                'selectors' => $this->get_variable_selectors('--wbk-button-border-radius'),
            ]
        );

        $this->add_style_subsection_heading(
            'wbk_style_heading_button_primary',
            __('Main Button', 'webba-booking-lite'),
            true
        );

        $this->add_control(
            'bg_button_primary',
            [
                'label' => __('Default Color', 'webba-booking-lite'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'default' => $defaults['bg_button_primary'],
                'render_type' => 'ui',
                'selectors' => $this->get_variable_selectors('--wbk-bg-button-primary'),
            ]
        );
        $this->add_control(
            'color_button_primary',
            [
                'label' => __('Default Text Color', 'webba-booking-lite'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'default' => $defaults['color_button_primary'],
                'render_type' => 'ui',
                'selectors' => $this->get_variable_selectors('--wbk-color-button-primary'),
            ]
        );
        $this->add_control(
            'bg_button_primary_hover',
            [
                'label' => __('Hover-on Color', 'webba-booking-lite'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'default' => $defaults['bg_button_primary_hover'],
                'render_type' => 'ui',
                'selectors' => $this->get_variable_selectors('--wbk-bg-button-primary-hover'),
            ]
        );
        $this->add_control(
            'color_button_primary_hover',
            [
                'label' => __('Hover-on Text Color', 'webba-booking-lite'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'default' => $defaults['color_button_primary_hover'],
                'render_type' => 'ui',
                'selectors' => $this->get_variable_selectors('--wbk-color-button-primary-hover'),
            ]
        );

        $this->add_style_subsection_heading(
            'wbk_style_heading_button_inactive',
            __(
                'Inactive Button (when action is needed to activate)',
                'webba-booking-lite'
            ),
            true
        );

        $this->add_control(
            'bg_button_inactive',
            [
                'label' => __('Default Color', 'webba-booking-lite'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'default' => $defaults['bg_button_inactive'],
                'render_type' => 'ui',
                'selectors' => $this->get_variable_selectors('--wbk-bg-button-inactive'),
            ]
        );
        $this->add_control(
            'color_button_inactive',
            [
                'label' => __('Default Text Color', 'webba-booking-lite'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'default' => $defaults['color_button_inactive'],
                'render_type' => 'ui',
                'selectors' => $this->get_variable_selectors('--wbk-color-button-inactive'),
            ]
        );

        $this->add_style_subsection_heading(
            'wbk_style_heading_button_selected',
            __(
                'Selected Button (when selecting service in mobile)',
                'webba-booking-lite'
            ),
            true
        );

        $this->add_control(
            'bg_button_selected',
            [
                'label' => __('Default Color', 'webba-booking-lite'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'default' => $defaults['bg_button_selected'],
                'render_type' => 'ui',
                'selectors' => $this->get_variable_selectors('--wbk-bg-button-selected'),
            ]
        );
        $this->add_control(
            'color_button_selected',
            [
                'label' => __('Default Text Color', 'webba-booking-lite'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'default' => $defaults['color_button_selected'],
                'render_type' => 'ui',
                'selectors' => $this->get_variable_selectors('--wbk-color-button-selected'),
            ]
        );
        $this->add_control(
            'bg_button_selected_hover',
            [
                'label' => __('Hover-on Color', 'webba-booking-lite'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'default' => $defaults['bg_button_selected_hover'],
                'render_type' => 'ui',
                'selectors' => $this->get_variable_selectors('--wbk-bg-button-selected-hover'),
            ]
        );
        $this->add_control(
            'color_button_selected_hover',
            [
                'label' => __('Hover-on Text Color', 'webba-booking-lite'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'default' => $defaults['color_button_selected_hover'],
                'render_type' => 'ui',
                'selectors' => $this->get_variable_selectors('--wbk-color-button-selected-hover'),
            ]
        );
        $this->add_control(
            'bg_button_selected_selected',
            [
                'label' => __('Selected Color', 'webba-booking-lite'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'default' => $defaults['bg_button_selected_selected'],
                'render_type' => 'ui',
                'selectors' => $this->get_variable_selectors('--wbk-bg-button-selected-selected'),
            ]
        );
        $this->add_control(
            'color_button_selected_selected',
            [
                'label' => __('Selected Text Color', 'webba-booking-lite'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'default' => $defaults['color_button_selected_selected'],
                'render_type' => 'ui',
                'selectors' => $this->get_variable_selectors('--wbk-color-button-selected-selected'),
            ]
        );

        $this->add_style_subsection_heading(
            'wbk_style_heading_button_secondary',
            __('+Add More Button (in the Sidebar)', 'webba-booking-lite'),
            true
        );

        $this->add_control(
            'bg_button_secondary',
            [
                'label' => __('Default Color', 'webba-booking-lite'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'default' => $defaults['bg_button_secondary'],
                'render_type' => 'ui',
                'selectors' => $this->get_variable_selectors('--wbk-bg-button-secondary'),
            ]
        );
        $this->add_control(
            'color_button_secondary',
            [
                'label' => __('Default Text Color', 'webba-booking-lite'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'default' => $defaults['color_button_secondary'],
                'render_type' => 'ui',
                'selectors' => $this->get_variable_selectors('--wbk-color-button-secondary'),
            ]
        );
        $this->add_control(
            'bg_button_secondary_hover',
            [
                'label' => __('Hover-on Color', 'webba-booking-lite'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'default' => $defaults['bg_button_secondary_hover'],
                'render_type' => 'ui',
                'selectors' => $this->get_variable_selectors('--wbk-bg-button-secondary-hover'),
            ]
        );
        $this->add_control(
            'color_button_secondary_hover',
            [
                'label' => __('Hover-on Text Color', 'webba-booking-lite'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'default' => $defaults['color_button_secondary_hover'],
                'render_type' => 'ui',
                'selectors' => $this->get_variable_selectors('--wbk-color-button-secondary-hover'),
            ]
        );

        $this->add_style_subsection_heading(
            'wbk_style_heading_sidebar',
            __('Sidebar styling', 'webba-booking-lite'),
            true
        );

        $this->add_control(
            'bg_sidebar',
            [
                'label' => __('Background Color', 'webba-booking-lite'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'default' => $defaults['bg_sidebar'],
                'render_type' => 'ui',
                'selectors' => $this->get_sidebar_selectors(),
            ]
        );
        $this->add_control(
            'color_sidebar',
            [
                'label' => __('Text Color', 'webba-booking-lite'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'default' => $defaults['color_sidebar'],
                'render_type' => 'ui',
                'selectors' => $this->get_variable_selectors('--wbk-color-sidebar'),
            ]
        );

        $this->add_style_subsection_heading(
            'wbk_style_heading_selected_elements',
            __(
                'Selected Elements styling (service boxes, dates, timeslots)',
                'webba-booking-lite'
            ),
            true
        );

        $this->add_control(
            'color_border_selected',
            [
                'label' => __('Border Color', 'webba-booking-lite'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'default' => $defaults['color_border_selected'],
                'render_type' => 'ui',
                'selectors' => $this->get_variable_selectors('--wbk-color-border-selected'),
            ]
        );

        $this->end_controls_section();
    }

    /**
     * Renders widget output.
     *
     * @return void
     */
    protected function render()
    {
        $settings = $this->get_settings_for_display();
        $service = $this->get_attribute_value($settings['service'] ?? '0', false);
        $category = $this->get_attribute_value($settings['category'] ?? [], true);
        $location = $this->get_attribute_value($settings['location'] ?? [], true);
        $staff = $this->get_attribute_value($settings['staff'] ?? [], true);
        $category_list = !empty($settings['category_list']) ? 'yes' : 'no';
        $hide_category = !empty($settings['category_list']) ? 'no' : 'yes';

        if (!class_exists('WBK_Renderer')) {
            return;
        }

        echo '<div class="wbk_elementor_booking_form_scope">';

        echo WBK_Renderer::load_template(
            'frontend_v6/booking_form',
            [$service, $category_list, $category, $location, $staff, 'no', $hide_category],
            false
        );

        echo '</div>';
    }
}
?>
