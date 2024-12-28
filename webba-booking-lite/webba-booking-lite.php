<?php

/**
 * Plugin Name: Webba Booking
 * Plugin URI: https://webba-booking.com
 * Description: Webba Booking is a powerful and easy-to-use WordPress booking plugin made to create, manage and accept online bookings with ease, through a modern and user-friendly booking interface.
 * Version: 5.0.56
 * Author: WebbaPlugins
 * Author URI: https://webba-booking.com
 *   */
// check if accessed directly
if ( !defined( 'ABSPATH' ) ) {
    exit;
}
// added for the capabilities with the old versions of WordPress
if ( !function_exists( 'wp_date' ) ) {
    function wp_date(  $format, $timestamp, $timezone  ) {
        return date_i18n( $format, $timestamp );
    }

}
if ( !class_exists( 'WBK_Model_Utils' ) ) {
    include 'includes/utilities/class_wbk_model_utils.php';
}
if ( !function_exists( 'wbk_fs' ) ) {
    // Create a helper function for easy SDK access.
    function wbk_fs() {
        global $wbk_fs;
        $first_page = 'admin.php?page=wbk-options';
        if ( get_option( 'wbk_timezone' ) === false ) {
            $first_page .= '&wbk-activation=true';
        }
        if ( !isset( $wbk_fs ) ) {
            // Include Freemius SDK.
            require_once dirname( __FILE__ ) . '/freemius/start.php';
            $wbk_fs = fs_dynamic_init( [
                'id'              => '4728',
                'slug'            => 'webba-booking-lite',
                'premium_slug'    => 'webba-booking',
                'type'            => 'plugin',
                'public_key'      => 'pk_89934c199e211bbc3aa24e2396ef9',
                'is_premium'      => false,
                'has_addons'      => false,
                'has_paid_plans'  => true,
                'has_affiliation' => 'selected',
                'menu'            => [
                    'slug'       => 'wbk-main',
                    'first-path' => $first_page,
                    'support'    => false,
                ],
                'is_live'         => true,
            ] );
        }
        return $wbk_fs;
    }

    // Init Freemius.
    wbk_fs();
    // Signal that SDK was initiated.
    do_action( 'wbk_fs_loaded' );
}
if ( !defined( 'WP_WEBBA_BOOKING__PLUGIN_DIR' ) ) {
    define( 'WP_WEBBA_BOOKING__PLUGIN_DIR', dirname( __FILE__ ) );
    define( 'WP_WEBBA_BOOKING__PLUGIN_URL', plugins_url( plugin_basename( WP_WEBBA_BOOKING__PLUGIN_DIR ) ) );
}
if ( !defined( 'WP_WEBBA_BOOKING__VERSION' ) ) {
    define( 'WP_WEBBA_BOOKING__VERSION', '5.0.56' );
}
if ( !function_exists( 'wbk_plugins_loaded' ) && !function_exists( 'wbk_load_textdomain' ) ) {
    include 'vendor/autoload.php';
    include 'plugion/autoload.php';
    include 'deprecated/class_wbk_entity.php';
    include 'includes/class_wbk_backend.php';
    include 'deprecated/class_wbk_appointment_deprecated.php';
    include 'deprecated/class_wbk_service_deprecated.php';
    include 'deprecated/class_wbk_db_utils.php';
    include 'deprecated/class_wbk_email_notifications.php';
    include 'includes/backend/class_wbk_admin_notices.php';
    require 'deprecated/wbk_wording.php';
    require 'deprecated/class_wbk_date_time_utils.php';
    if ( get_option( 'wbk_stripe_publishable_key', '' ) != '' ) {
        require 'includes/third-parties/class_wbk_stripe.php';
    } else {
        require 'includes/third-parties/class_wbk_stripe_blank.php';
    }
    require 'includes/third-parties/class_wbk_woocommerce.php';
    require 'includes/third-parties/class_wbk_gg_blank.php';
    if ( version_compare( PHP_VERSION, '7.4.0' ) >= 0 ) {
        include 'includes/third-parties/class_wbk_zoom.php';
    } else {
        include 'includes/third-parties/class_wbk_zoom_blank.php';
    }
    add_action( 'template_redirect', 'wbk_template_redirect' );
    function wbk_template_redirect() {
        if ( isset( $_GET['wbk_zoom_auth'] ) && isset( $_GET['code'] ) ) {
            if ( class_exists( 'WBK_Zoom' ) ) {
                $wbk_zoom = new WBK_Zoom();
                $wbk_zoom->generate_access_token( $_GET['code'] );
                wp_redirect( get_admin_url( null, 'admin.php?page=wbk-options&tab=wbk_zoom_settings_section' ) );
            }
        }
    }

    // Utilities
    include 'includes/utilities/class_wbk_time_math_utils.php';
    include 'includes/utilities/class_wbk_user_utils.php';
    include 'includes/utilities/class-wbk-model-updater.php';
    include 'includes/utilities/class-wbk-format-utils.php';
    include 'includes/utilities/class_wbk_validator.php';
    // Data
    include 'includes/data/class-wbk-model-object.php';
    include 'includes/data/class-wbk-service.php';
    include 'includes/data/class-wbk-service-category.php';
    include 'includes/data/class-wbk-coupon.php';
    include 'includes/data/class-wbk-email-template.php';
    include 'includes/data/class-wbk-pricing-rule.php';
    include 'includes/data/class-wbk-booking.php';
    include 'includes/data/class-wbk-model.php';
    include 'includes/data/class-wbk_time_slot.php';
    // factories
    include 'includes/utilities/class-wbk-booking-factory.php';
    // Plugion extensions
    include 'includes/plugion_extensions/class-wbk-pe-business-hours.php';
    include 'includes/plugion_extensions/class-wbk-google-access-token.php';
    include 'includes/plugion_extensions/class-wbk-pe-date.php';
    include 'includes/plugion_extensions/class-wbk-pe-time.php';
    include 'includes/plugion_extensions/class-wbk-pe-app-custom-data.php';
    include 'includes/plugion_extensions/plugion_hooks.php';
    // Request manager
    include 'includes/class-wbk-request-manager.php';
    // Processors
    include 'includes/processors/class-wbk-schedule-processor.php';
    include 'includes/processors/class-wbk-price-processor.php';
    include 'includes/processors/class-wbk-placeholder-processor.php';
    include 'includes/processors/class-wbk-options-processor.php';
    include 'includes/processors/class-wbk-email-processor.php';
    // user controller
    include 'includes/class-wbk-booking-user.php';
    // Assets manager
    include 'includes/class-wbk-assets-manager.php';
    // Renderer
    include 'includes/class-wbk-renderer.php';
    // Frontend
    include 'includes/class_wbk_frontend_booking.php';
    add_action( 'init', 'wbk_init', 30 );
    add_action( 'wbk_daily_event', 'wbk_daily' );
    add_action( 'plugins_loaded', 'wbk_plugins_loaded', 10 );
    add_action( 'init', 'wbk_regular_routine', 40 );
    add_filter(
        'plugion_strings',
        'wbk_plugion_strings',
        10,
        1
    );
    add_action( 'init', 'wbk_admin_permission', 9 );
    // Wizard
    include 'includes/class_wbk_wizard.php';
    // init plugion extensions
    $wbk_google_access_token_obj = new WBK_Google_Access_Token();
    $wbk_pe_business_hours_obj = new WBK_PE_Business_Hours();
    $wbk_pe_date_obj = new WBK_PE_Date();
    $wbk_pe_time_obj = new WBK_PE_Time();
    $wbk_request_manager = new WBK_Request_Manager();
    $wbk_pe_appointment_custom_data = new WBK_PE_Appointment_Custom_Data();
    $wbk_model = new WBK_Model();
    // init frontend / backend
    if ( is_admin() ) {
        $backend = new WBK_Backend();
    } else {
        $frontend = new WBK_Frontend_Booking();
    }
    $wizard = new WBK_Wizard();
    $js_array = [[
        'backend',
        [
            'wbk-services',
            'wbk-email-templates',
            'wbk-service-categories',
            'wbk-coupons',
            'wbk-pricing-rules'
        ],
        'wbk-tinymce',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/wbk-tinymce.js',
        ['wp-tinymce'],
        WP_WEBBA_BOOKING__VERSION
    ], [
        'backend',
        [
            'wbk-services',
            'wbk-email-templates',
            'wbk-service-categories',
            'wbk-coupons',
            'wbk-pricing-rules'
        ],
        'jquery-repeater',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/public/vendor/jquery.repeater/jquery.repeater.min.js',
        ['jquery'],
        WP_WEBBA_BOOKING__VERSION
    ]];
    $js_array[] = [
        'frontend',
        null,
        'wbk-common-script',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/wbk-form.js',
        ['jquery'],
        WP_WEBBA_BOOKING__VERSION
    ];
    $js_array[] = [
        'frontend',
        null,
        'wbk-validator',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/wbk-validator.js',
        ['jquery'],
        WP_WEBBA_BOOKING__VERSION
    ];
    $js_array[] = [
        'frontend5',
        null,
        'wbk-validator',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/wbk-validator.js',
        ['jquery'],
        WP_WEBBA_BOOKING__VERSION
    ];
    if ( get_option( 'wbk_phone_mask', 'enabled' ) == 'enabled' ) {
        $js_array[] = [
            'frontend',
            null,
            'jquery-maskedinput',
            WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/jquery.maskedinput.min.js',
            ['jquery', 'jquery-ui-core', 'jquery-effects-core'],
            WP_WEBBA_BOOKING__VERSION
        ];
        $js_array[] = [
            'backend',
            ['wbk-schedule'],
            'jquery-maskedinput',
            WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/jquery.maskedinput.min.js',
            ['jquery', 'jquery-ui-core', 'jquery-effects-core'],
            WP_WEBBA_BOOKING__VERSION
        ];
    } elseif ( get_option( 'wbk_phone_mask', 'enabled' ) == 'enabled_mask_plugin' ) {
        $js_array[] = [
            'frontend',
            null,
            'jquery-maskedinput',
            WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/jquery.mask.js',
            ['jquery', 'jquery-ui-core', 'jquery-effects-core'],
            WP_WEBBA_BOOKING__VERSION
        ];
        $js_array[] = [
            'backend',
            null,
            'jquery-maskedinput',
            WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/jquery.mask.js',
            ['jquery', 'jquery-ui-core', 'jquery-effects-core'],
            WP_WEBBA_BOOKING__VERSION
        ];
    }
    if ( get_option( 'wbk_pickadate_load', 'yes' ) == 'yes' ) {
        $js_array[] = [
            'frontend',
            null,
            'picker',
            WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/picker.js',
            ['jquery', 'jquery-ui-core', 'jquery-effects-core'],
            WP_WEBBA_BOOKING__VERSION
        ];
        $js_array[] = [
            'frontend',
            null,
            'picker-date',
            WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/picker.date.js',
            ['jquery', 'jquery-ui-core', 'jquery-effects-core'],
            WP_WEBBA_BOOKING__VERSION
        ];
        $js_array[] = [
            'frontend',
            null,
            'picker-legacy',
            WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/legacy.js',
            ['jquery', 'jquery-ui-core', 'jquery-effects-core'],
            WP_WEBBA_BOOKING__VERSION
        ];
        $js_array[] = [
            'frontend5',
            null,
            'picker',
            WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/picker.js',
            ['jquery', 'jquery-ui-core', 'jquery-effects-core'],
            WP_WEBBA_BOOKING__VERSION
        ];
        $js_array[] = [
            'frontend5',
            null,
            'picker-date',
            WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/picker.date.js',
            ['jquery', 'jquery-ui-core', 'jquery-effects-core'],
            WP_WEBBA_BOOKING__VERSION
        ];
        $js_array[] = [
            'frontend5',
            null,
            'picker-legacy',
            WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/legacy.js',
            ['jquery', 'jquery-ui-core', 'jquery-effects-core'],
            WP_WEBBA_BOOKING__VERSION
        ];
    }
    $js_array[] = [
        'frontend',
        null,
        'wbk-frontend',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/wbk-frontend.js',
        ['jquery', 'jquery-ui-core', 'jquery-effects-core'],
        WP_WEBBA_BOOKING__VERSION
    ];
    $js_array[] = [
        'frontend5',
        null,
        'wbk-vendor',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/vendor.js',
        ['jquery', 'jquery-ui-core', 'jquery-effects-core'],
        WP_WEBBA_BOOKING__VERSION
    ];
    $js_array[] = [
        'frontend5',
        null,
        'wbk-frontend',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/wbk5-frontend.js',
        [
            'jquery',
            'jquery-ui-core',
            'jquery-effects-core',
            'wbk-vendor'
        ],
        WP_WEBBA_BOOKING__VERSION
    ];
    $js_array[] = [
        'frontend-ud',
        null,
        'wbk-frontend-v7-script',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/build/frontend/index.js',
        ['wp-element', 'wp-api-fetch', 'wp-data'],
        WP_WEBBA_BOOKING__VERSION
    ];
    $css_array = [];
    $css_array[] = [
        'frontend5',
        null,
        'wbk-frontend-style-custom',
        content_url() . '/webba_booking_style/wbk5-frontend-custom-style.css',
        [],
        WP_WEBBA_BOOKING__VERSION
    ];
    $css_array[] = [
        'frontend',
        null,
        'wbk-frontend-style',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/public/css/wbk-frontend-default-style.css',
        [],
        WP_WEBBA_BOOKING__VERSION
    ];
    $css_array[] = [
        'frontend',
        null,
        'picker-classic',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/public/css/classic.css',
        [],
        WP_WEBBA_BOOKING__VERSION
    ];
    $css_array[] = [
        'frontend',
        null,
        'picker-classic-date',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/public/css/classic.date.css',
        [],
        WP_WEBBA_BOOKING__VERSION
    ];
    $css_array[] = [
        'frontend5',
        null,
        'picker-classic',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/public/css/classic.css',
        [],
        WP_WEBBA_BOOKING__VERSION
    ];
    $css_array[] = [
        'frontend5',
        null,
        'picker-classic-date',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/public/css/classic.date.css',
        [],
        WP_WEBBA_BOOKING__VERSION
    ];
    $css_array[] = [
        'backend',
        [
            'wbk-schedule',
            'wbk-options',
            'wbk-gg-calendars',
            'wbk-appearance',
            'wbk-services',
            'wbk-pricing-rules',
            'wbk-appointments',
            'wbk-coupons',
            'wbk-service-categories',
            'wbk-email-templates',
            'wbk-dashboard',
            'wbk-spa'
        ],
        'wbk-backend-style',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/public/css/wbk5-backend.css',
        [],
        WP_WEBBA_BOOKING__VERSION
    ];
    $css_array[] = [
        'backend',
        ['__wbk-schedule', 'wbk-options', 'wbk-gg-calendars'],
        'chosen-style',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/public/css/chosen.min.css',
        [],
        WP_WEBBA_BOOKING__VERSION
    ];
    $css_array[] = [
        'backend',
        ['wbk-schedule', 'wbk-options', 'wbk-gg-calendars'],
        'multidate-picker-style',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/public/css/jquery.datepick.css',
        [],
        WP_WEBBA_BOOKING__VERSION
    ];
    $css_array[] = [
        'backend',
        ['wbk-schedule'],
        'wbk-backend-style-old',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/public/css/wbk-backend.css',
        [],
        WP_WEBBA_BOOKING__VERSION
    ];
    $js_array[] = [
        'backend',
        ['wbk-schedule', 'wbk-options'],
        'jquery-plugin-wbk',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/jquery.plugin.js',
        ['jquery', 'jquery-ui-core', 'jquery-effects-core'],
        WP_WEBBA_BOOKING__VERSION
    ];
    $js_array[] = [
        'backend',
        ['wbk-schedule'],
        'wbk-schedule',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/wbk-schedule.js',
        ['jquery', 'jquery-ui-core', 'jquery-ui-dialog'],
        WP_WEBBA_BOOKING__VERSION
    ];
    $js_array[] = [
        'backend',
        ['wbk-schedule', 'wbk-options'],
        'wbk-validator',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/wbk-validator.js',
        ['jquery'],
        WP_WEBBA_BOOKING__VERSION
    ];
    $js_array[] = [
        'backend',
        ['wbk-options'],
        'wbk-options',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/wbk-options.js',
        ['jquery', 'wbk5-backend-plugins'],
        WP_WEBBA_BOOKING__VERSION
    ];
    $js_array[] = [
        'backend',
        ['wbk-schedule', 'wbk-options'],
        'wbk-chosen',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/chosen.jquery.min.js',
        ['jquery', 'jquery-ui-core', 'jquery-ui-tabs'],
        WP_WEBBA_BOOKING__VERSION
    ];
    $js_array[] = [
        'backend',
        ['wbk-schedule', 'wbk-options'],
        'multidate-picker',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/jquery.datepick.min.js',
        ['jquery'],
        WP_WEBBA_BOOKING__VERSION
    ];
    $js_array[] = [
        'backend',
        ['wbk-appearance', 'wbk-schedule', 'wbk-options'],
        'wbk-backend-script',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/wbk-backend.js',
        ['jquery'],
        WP_WEBBA_BOOKING__VERSION
    ];
    $js_array[] = [
        'backend',
        [
            'wbk-schedule',
            'wbk-options',
            'wbk-gg-calendars',
            'wbk-appearance',
            'wbk-services',
            'wbk-pricing-rules',
            'wbk-appointments',
            'wbk-coupons',
            'wbk-service-categories',
            'wbk-email-templates',
            'wbk-dashboard'
        ],
        'wbk5-backend-plugins',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/wbk5-backend-plugins.js',
        ['jquery'],
        WP_WEBBA_BOOKING__VERSION
    ];
    $js_array[] = [
        'backend',
        [
            'wbk-gg-calendars',
            'wbk-services',
            'wbk-pricing-rules',
            'wbk-appointments',
            'wbk-appearance',
            'wbk-coupons',
            'wbk-service-categories',
            'wbk-email-templates',
            'wbk-dashboard'
        ],
        'wbk5-backend-script',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/wbk5-backend.js',
        [
            'jquery',
            'jquery-ui-core',
            'jquery-effects-core',
            'jquery-effects-slide'
        ],
        WP_WEBBA_BOOKING__VERSION
    ];
    $js_array[] = [
        'backend',
        ['wbk-appearance', 'wbk-schedule'],
        'nice-select',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/plugion/vendor/jquery-nice-select/js/jquery.nice-select.min.js',
        ['jquery'],
        WP_WEBBA_BOOKING__VERSION
    ];
    if ( get_option( 'wbk_form_layout', 'default' ) == 'default' ) {
        $css_array[] = [
            'frontend5',
            null,
            'wbk-frontend5-style',
            WP_WEBBA_BOOKING__PLUGIN_URL . '/public/css/wbk5-frontend-760-style.css',
            [],
            WP_WEBBA_BOOKING__VERSION
        ];
    } else {
        $css_array[] = [
            'frontend5',
            null,
            'wbk-frontend5-style',
            WP_WEBBA_BOOKING__PLUGIN_URL . '/public/css/wbk5-frontend-600-style.css',
            [],
            WP_WEBBA_BOOKING__VERSION
        ];
    }
    $css_array[] = [
        'frontend-ud',
        null,
        'wbk-frontend-v7',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/build/frontend/index.css',
        [],
        WP_WEBBA_BOOKING__VERSION
    ];
    $css_array[] = [
        'backend',
        ['wbk-appearance'],
        'wbk-frontend5-style',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/public/css/wbk5-frontend-760-style.css',
        [],
        WP_WEBBA_BOOKING__VERSION
    ];
    $js_array[] = [
        'backend',
        'all',
        'wbk-admin-notices',
        WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/wbk_admin_notices.js',
        ['jquery'],
        WP_WEBBA_BOOKING__VERSION
    ];
    $wbk_assets_manager = new WBK_Assets_Manager($css_array, $js_array);
}
// activation/deactivation hooks
register_activation_hook( __FILE__, 'wbk_activate' );
register_deactivation_hook( __FILE__, 'wbk_deactivate' );
register_uninstall_hook( __FILE__, 'wbk_uninstall' );
// localization
if ( !function_exists( 'wbk_plugins_loaded' ) ) {
    function wbk_plugins_loaded() {
        wbk_cleanup_attachements();
        load_plugin_textdomain( 'webba-booking-lite', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/' );
        $arr_ids = WBK_Model_Utils::get_service_ids();
        if ( function_exists( 'pll_register_string' ) ) {
            foreach ( $arr_ids as $id ) {
                $service = new WBK_Service($id);
                if ( !$service->is_loaded() ) {
                    continue;
                }
                pll_register_string( 'webba_service_' . $id, $service->get_name(), 'webba-booking' );
            }
        }
        foreach ( $arr_ids as $id ) {
            $service = new WBK_Service($id);
            if ( !$service->is_loaded() ) {
                continue;
            }
            do_action(
                'wpml_register_single_string',
                'webba-booking-lite',
                'Service name id ' . $id,
                $service->get_name()
            );
            do_action(
                'wpml_register_single_string',
                'webba-booking-lite',
                'Service description id ' . $id,
                $service->get_description()
            );
        }
        $arr_ids = WBK_Model_Utils::get_service_category_ids();
        if ( function_exists( 'pll_register_string' ) ) {
            foreach ( $arr_ids as $id ) {
                $category = new WBK_Service_Category($id);
                if ( !$category->is_loaded() ) {
                    continue;
                }
                pll_register_string( 'webba_category_' . $id, $category->get_name(), 'webba-booking' );
            }
        }
        foreach ( $arr_ids as $id ) {
            $category = new WBK_Service_Category($id);
            if ( !$category->is_loaded() ) {
                continue;
            }
            do_action(
                'wpml_register_single_string',
                'webba-booking-lite',
                'Category name id ' . $id,
                $category->get_name()
            );
        }
    }

}
if ( !function_exists( 'wbk_get_translation_string' ) ) {
    function wbk_get_translation_string(  $option, $key, $default_value  ) {
        $string = get_option( $option, __( $default_value, 'webba-booking-lite' ) );
        if ( $string == '' ) {
            global $wbk_wording;
            $string = sanitize_text_field( $wbk_wording[$key] );
        }
        return $string;
    }

}
if ( !function_exists( 'wbk_activate' ) ) {
    function wbk_activate() {
    }

}
if ( !function_exists( 'wbk_daily' ) ) {
    function wbk_daily() {
        $noifications = new WBK_Email_Notifications(0, 0);
        $noifications->send( 'daily' );
        // send arrival notification
    }

}
if ( !function_exists( 'wbk_init' ) ) {
    if ( is_plugin_active( 'webba-booking-lite/webba-booking-lite.php' ) && is_plugin_active( 'webba-booking/webba-booking-lite.php' ) ) {
        add_action( 'admin_notices', 'wbk_deactivation_alert' );
    }
    function wbk_init() {
        WBK_Model_Updater::create_ht_file();
        WBK_Model_Updater::run_previous_update();
        WBK_Model_Updater::run_update();
        register_block_type( __DIR__ . DIRECTORY_SEPARATOR . 'build' . DIRECTORY_SEPARATOR . 'block' );
        WBK_Email_Processor::send_late_notifications( 'arrival' );
    }

}
if ( !function_exists( 'wbk_deactivate' ) ) {
    function wbk_deactivate() {
        wp_clear_scheduled_hook( 'wbk_daily_event' );
    }

}
if ( !function_exists( 'wbk_uninstall' ) ) {
    function wbk_uninstall() {
        return;
        // drop tables
        // WBK_Db_Utils::dropTables();
    }

}
if ( !function_exists( 'wbk_deactivation_alert' ) ) {
    function wbk_deactivation_alert() {
        echo '<div class="notice notice-error is-dismissible"><p>Webba Booking: Please deactivate the free version of Webba Booking in order to gain access to premium features. All data and settings are already saved.
        </p><button type="button" class="notice-dismiss"><span class="screen-reader-text">Dismiss this notice.</span></button></div>';
    }

}
if ( !function_exists( 'wbk_cleanup_attachements' ) ) {
    function wbk_cleanup_attachements() {
        if ( get_option( 'wbk_delete_attachemnt', 'no' ) == 'no' || get_option( 'wbk_delete_attachemnt', 'no' ) == '' ) {
            return;
        }
        global $wpdb;
        $prefix = $wpdb->prefix;
        $query = $wpdb->prepare( 'SHOW TABLES LIKE %s', $prefix . $wpdb->esc_like( 'wbk_appointments' ) );
        if ( $wpdb->get_var( $query ) != $prefix . 'wbk_appointments' ) {
            return;
        }
        $result = $wpdb->get_results( 'Select * from ' . $prefix . "wbk_appointments where attachment  <> '' LIMIT 10 ", ARRAY_A );
        foreach ( $result as $item ) {
            $file = json_decode( $item['attachment'] );
            if ( is_array( $file ) ) {
                $file = $file[0];
                try {
                    if ( file_exists( $file ) ) {
                        unlink( $file );
                    }
                } catch ( \Exception $e ) {
                }
                $wpdb->update(
                    get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments',
                    [
                        'attachment' => '',
                    ],
                    [
                        'id' => $item['id'],
                    ],
                    ['%s'],
                    ['%d']
                );
            }
        }
    }

}
if ( !function_exists( 'wbk_plugion_strings' ) ) {
    function wbk_plugion_strings(  $input  ) {
        $input['%s is required'] = __( '%s is required', 'webba-booking-lite' );
        $input['%s must be a maximum of 256 characters'] = __( '%s must be a maximum of 256 characters', 'webba-booking-lite' );
        $input['Value of %s is not acceptable'] = __( 'Value of %s is not acceptable', 'webba-booking-lite' );
        $input['%s must be a maximum of 65535 characters'] = __( '%s must be a maximum of 65535 characters', 'webba-booking-lite' );
        $input['Validation of %s failed'] = __( 'Validation of %s failed', 'webba-booking-lite' );
        $input['Field %s is empty'] = __( 'Field %s is empty', 'webba-booking-lite' );
        $input['The following fields are wrong:'] = 'The following fields are wrong:';
        $input['Loading...'] = __( 'Loading...', 'webba-booking-lite' );
        $input['Element not found'] = __( 'Element not found', 'webba-booking-lite' );
        $input['Bad request'] = __( 'Bad request', 'webba-booking-lite' );
        $input['Failed'] = __( 'Failed', 'webba-booking-lite' );
        $input['Forbidden'] = __( 'Forbidden', 'webba-booking-lite' );
        $input['Please, set at least one filter'] = __( 'Please, set at least one filter', 'webba-booking-lite' );
        $input['No data available'] = __( 'No data available', 'webba-booking-lite' );
        $input['Here _START_ to _END_ of _TOTAL_ entries'] = __( 'Here _START_ to _END_ of _TOTAL_ entries', 'webba-booking-lite' );
        $input['Showing 0 to 0 of 0 entries'] = __( 'Showing 0 to 0 of 0 entries', 'webba-booking-lite' );
        $input['(filtered from _MAX_ total entries)'] = __( '(filtered from _MAX_ total entries)', 'webba-booking-lite' );
        $input['Show _MENU_ entries'] = __( 'Show _MENU_ entries', 'webba-booking-lite' );
        $input['Processing...'] = __( 'Processing...', 'webba-booking-lite' );
        $input['Search'] = __( 'Search', 'webba-booking-lite' );
        $input['No matching records found'] = __( 'No matching records found', 'webba-booking-lite' );
        $input['First'] = __( 'First', 'webba-booking-lite' );
        $input['Last'] = __( 'Last', 'webba-booking-lite' );
        $input['Next'] = __( 'Next', 'webba-booking-lite' );
        $input['Previous'] = __( 'Previous', 'webba-booking-lite' );
        $input[': activate to sort column ascending'] = __( ': activate to sort column ascending', 'webba-booking-lite' );
        $input[': activate to sort column descending'] = __( ': activate to sort column descending', 'webba-booking-lite' );
        $input['Filters for'] = __( 'Filters for', 'webba-booking-lite' );
        $input['Apply'] = __( 'Apply', 'webba-booking-lite' );
        $input['Apply and close'] = __( 'Apply and close', 'webba-booking-lite' );
        $input['Date'] = __( 'Date', 'webba-booking-lite' );
        $input['Time'] = __( 'Time', 'webba-booking-lite' );
        $input['Filters'] = __( 'Filters', 'webba-booking-lite' );
        $input['Save and close'] = __( 'Save and close', 'webba-booking-lite' );
        $input['New'] = __( 'New', 'webba-booking-lite' );
        $input['Are you sure?'] = __( 'Are you sure?', 'webba-booking-lite' );
        $input['Yes, delete it.'] = __( 'Yes, delete it.', 'webba-booking-lite' );
        $input['select option'] = __( 'select option', 'webba-booking-lite' );
        return $input;
    }

}
if ( !function_exists( 'wbk_is5' ) ) {
    function wbk_is5() {
        if ( get_option( 'wbk_mode' ) == 'webba5' ) {
            return true;
        } else {
            return false;
        }
    }

}
if ( !function_exists( 'wbk_is_multi_booking' ) ) {
    function wbk_is_multi_booking() {
        if ( get_option( 'wbk_multi_booking', '' ) == 'enabled' ) {
            return true;
        } else {
            return false;
        }
    }

}
if ( !function_exists( 'wbk_regular_routine' ) ) {
    function wbk_regular_routine() {
        WBK_Db_Utils::deleteExpiredAppointments();
        WBK_Model_Utils::auto_set_arrived_satus();
        if ( isset( $_GET['test'] ) ) {
            wbk_daily();
        }
    }

}
if ( !function_exists( 'wbk_admin_permission' ) ) {
    function wbk_admin_permission() {
        if ( is_admin() && !empty( $_REQUEST['page'] ) && $_REQUEST['page'] == 'wbk-dashboard' ) {
            if ( !current_user_can( 'manage_options' ) ) {
                http_response_code( 403 );
                die( 'Forbidden' );
            }
        }
    }

}