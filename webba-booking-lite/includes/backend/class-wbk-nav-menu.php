<?php
if (!defined('ABSPATH')) {
    exit();
}

/**
 * Registers the Webba Booking accordion on the WordPress menu editor
 * and outputs popup data attributes on frontend menu links.
 */
class WBK_Nav_Menu
{
    /**
     * Menu item meta keys mapped to frontend data attributes.
     *
     * @var array<string, string>
     */
    private $attribute_meta_map = [
        '_wbk_menu_service' => 'data-service',
        '_wbk_menu_category' => 'data-category',
        '_wbk_menu_location' => 'data-location',
        '_wbk_menu_staff' => 'data-staff',
        '_wbk_menu_units' => 'data-units',
    ];

    /**
     * POST argument keys mapped to menu item meta keys.
     *
     * @var array<string, string>
     */
    private $post_arg_meta_map = [
        'menu-item-wbk-service' => '_wbk_menu_service',
        'menu-item-wbk-category' => '_wbk_menu_category',
        'menu-item-wbk-location' => '_wbk_menu_location',
        'menu-item-wbk-staff' => '_wbk_menu_staff',
        'menu-item-wbk-units' => '_wbk_menu_units',
    ];

    /**
     * Hooks menu editor assets and frontend link attributes.
     */
    public function __construct()
    {
        add_filter(
            'nav_menu_link_attributes',
            [$this, 'add_link_attributes'],
            10,
            4
        );

        if (!is_admin()) {
            return;
        }

        add_action('admin_head-nav-menus.php', [$this, 'register_meta_box']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_assets']);
        add_filter(
            'postbox_classes_nav-menus_wbk_booking_form_nav',
            [$this, 'keep_meta_box_open']
        );
        add_action(
            'wp_update_nav_menu_item',
            [$this, 'save_menu_item_meta'],
            10,
            3
        );
    }

    /**
     * Adds the Webba Booking meta box to the menu editor sidebar.
     *
     * @return void
     */
    public function register_meta_box()
    {
        add_meta_box(
            'wbk_booking_form_nav',
            __('Webba Booking', 'webba-booking-lite'),
            [$this, 'render_meta_box'],
            'nav-menus',
            'side',
            'default'
        );
    }

    /**
     * Renders the booking popup fields for the menu editor accordion.
     *
     * @return void
     */
    public function render_meta_box()
    {
        global $nav_menu_selected_id;

        $disabled_attr = function_exists('wp_nav_menu_disabled_check')
            ? wp_nav_menu_disabled_check($nav_menu_selected_id, false)
            : disabled($nav_menu_selected_id, 0, false);
        $is_disabled = $disabled_attr ? '1' : '0';

        echo '<div class="customlinkdiv">';
        echo '<div id="wbk_nav_menu_booking" data-disabled="' .
            esc_attr($is_disabled) .
            '">';
        echo '<p class="howto">' .
            esc_html__(
                'Add a menu link that opens the booking form popup. Optional filters below are passed as data attributes.',
                'webba-booking-lite'
            ) .
            '</p>';
        echo '<p>';
        echo '<label for="wbk-nav-menu-booking-label">';
        echo '<span>' .
            esc_html__('Navigation Label', 'webba-booking-lite') .
            '</span>';
        echo '<input type="text" id="wbk-nav-menu-booking-label" class="regular-text menu-item-textbox" value="' .
            esc_attr__('Book now', 'webba-booking-lite') .
            '"' .
            $disabled_attr .
            ' />';
        echo '</label>';
        echo '</p>';
        echo '<div id="wbk_nav_menu_booking_filters"></div>';
        echo '<p class="button-controls wp-clearfix">';
        echo '<span class="add-to-menu">';
        echo '<button type="button" id="wbk-nav-menu-booking-add" class="button button-secondary right"' .
            $disabled_attr .
            '>';
        echo esc_html__('Add to Menu', 'webba-booking-lite');
        echo '</button>';
        echo '<span class="spinner"></span>';
        echo '</span>';
        echo '</p>';
        echo '</div>';
        echo '</div>';
    }

    /**
     * Removes the postbox closed class so accordion content stays visible.
     *
     * @param string[] $classes Postbox classes for the Webba Booking meta box.
     * @return string[]
     */
    public function keep_meta_box_open($classes)
    {
        return array_values(
            array_filter($classes, function ($class) {
                return $class !== 'closed';
            })
        );
    }

    /**
     * Enqueues the menu editor React bundle on the nav-menus screen.
     *
     * @param string $hook_suffix Current admin page hook.
     * @return void
     */
    public function enqueue_assets($hook_suffix)
    {
        global $pagenow;

        if ($hook_suffix !== 'nav-menus.php' && $pagenow !== 'nav-menus.php') {
            return;
        }

        wp_enqueue_style(
            'wbk-nav-menu-booking-style',
            WP_WEBBA_BOOKING__PLUGIN_URL . '/public/css/wbk-nav-menu-booking.css',
            [],
            WP_WEBBA_BOOKING__VERSION
        );

        wp_enqueue_script(
            'wbk-nav-menu-booking',
            WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/wbk-nav-menu-booking.js',
            ['nav-menu'],
            WP_WEBBA_BOOKING__VERSION,
            true
        );

        $script_path = WP_WEBBA_BOOKING__PLUGIN_DIR . '/build/nav-menu/index.js';
        $style_path = WP_WEBBA_BOOKING__PLUGIN_DIR . '/build/nav-menu/index.css';
        $asset_path = WP_WEBBA_BOOKING__PLUGIN_DIR . '/build/nav-menu/index.asset.php';

        if (!file_exists($script_path)) {
            return;
        }

        $asset = file_exists($asset_path)
            ? include $asset_path
            : [
                'dependencies' => [
                    'wp-element',
                    'wp-api-fetch',
                    'wp-data',
                    'wp-i18n',
                ],
                'version' => WP_WEBBA_BOOKING__VERSION,
            ];

        $dependencies = array_unique(
            array_merge($asset['dependencies'], [
                'wp-element',
                'wp-api-fetch',
                'wp-data',
                'nav-menu',
                'wbk-nav-menu-booking',
            ])
        );
        $version = isset($asset['version'])
            ? $asset['version']
            : WP_WEBBA_BOOKING__VERSION;

        if (file_exists($style_path)) {
            wp_enqueue_style(
                'wbk-nav-menu-style',
                WP_WEBBA_BOOKING__PLUGIN_URL . '/build/nav-menu/index.css',
                [],
                $version
            );
        }

        wp_enqueue_script(
            'wbk-nav-menu-script',
            WP_WEBBA_BOOKING__PLUGIN_URL . '/build/nav-menu/index.js',
            $dependencies,
            $version,
            true
        );
    }

    /**
     * Stores booking popup filters on a newly added custom menu item.
     *
     * @param int   $menu_id         Menu term ID.
     * @param int   $menu_item_db_id Menu item post ID.
     * @param array $args            Menu item arguments from the request.
     * @return void
     */
    public function save_menu_item_meta($menu_id, $menu_item_db_id, $args)
    {
        unset($menu_id);

        $posted_item = $this->find_posted_booking_menu_item($args);
        if ($posted_item === null) {
            return;
        }

        update_post_meta($menu_item_db_id, '_wbk_menu_popup', '1');

        foreach ($this->post_arg_meta_map as $arg_key => $meta_key) {
            $value = isset($posted_item[$arg_key])
                ? sanitize_text_field($posted_item[$arg_key])
                : '';

            if ($value === '') {
                delete_post_meta($menu_item_db_id, $meta_key);
                continue;
            }

            update_post_meta($menu_item_db_id, $meta_key, $value);
        }
    }

    /**
     * Finds posted booking-popup fields for the menu item being saved.
     *
     * WordPress strips unknown menu-item keys before wp_update_nav_menu_item,
     * so AJAX "Add to Menu" values are read from the original request.
     *
     * @param array $args Menu item arguments passed to the save hook.
     * @return array|null
     */
    private function find_posted_booking_menu_item($args)
    {
        if (!empty($args['menu-item-wbk-popup'])) {
            return $args;
        }

        if (empty($_POST['menu-item']) || !is_array($_POST['menu-item'])) {
            return null;
        }

        $title = isset($args['menu-item-title']) ? $args['menu-item-title'] : '';
        $url = isset($args['menu-item-url']) ? $args['menu-item-url'] : '';

        foreach ($_POST['menu-item'] as $item) {
            if (!is_array($item) || empty($item['menu-item-wbk-popup'])) {
                continue;
            }

            $item_title = isset($item['menu-item-title'])
                ? $item['menu-item-title']
                : '';
            $item_url = isset($item['menu-item-url'])
                ? $item['menu-item-url']
                : '';

            if ($item_title !== $title || $item_url !== $url) {
                continue;
            }

            return $item;
        }

        return null;
    }

    /**
     * Adds booking form data attributes to matching menu links.
     *
     * @param array    $atts  Link attributes.
     * @param WP_Post  $item  Menu item.
     * @param stdClass $args  Menu arguments.
     * @param int      $depth Menu depth.
     * @return array
     */
    public function add_link_attributes($atts, $item, $args, $depth)
    {
        unset($args, $depth);

        foreach ($this->attribute_meta_map as $meta_key => $attribute_name) {
            $value = get_post_meta($item->ID, $meta_key, true);
            if ($value === '' || $value === false) {
                continue;
            }

            $atts[$attribute_name] = $value;
        }

        return $atts;
    }
}
