<?php

if ( !defined( 'ABSPATH' ) ) {
    exit;
}
/**
 * Class WBK_Assets_Manager is used to load CSS and JS files depended on detecting of backend or frontend
 */
class WBK_Assets_Manager {
    protected $css;

    protected $js;

    public function __construct( $css, $js, $directory = '' ) {
        $this->css = $css;
        $this->js = $js;
        add_action( 'admin_enqueue_scripts', [$this, 'admin_enqueue_scripts'], 20 );
        add_action( 'admin_enqueue_scripts', [$this, 'admin_enqueue_scripts_textdomain'], 200 );
        add_action( 'wp_enqueue_scripts', [$this, 'wp_enqueue_scripts'], 999999 );
        add_action( 'enqueue_block_editor_assets', [$this, 'enqueue_block_editor_assets'], 999999 );
    }

    public function admin_enqueue_scripts() {
        $admin_pages = [
            'wbk-services',
            'wbk-email-templates',
            'wbk-service-categories',
            'wbk-appointments',
            'wbk-coupons',
            'wbk-gg-calendars',
            'wbk-pricing-rules',
            'wbk-dashboard',
            'wbk-spa'
        ];
        if ( isset( $_GET['page'] ) && in_array( $_GET['page'], $admin_pages ) ) {
            wp_enqueue_style( 'editor-buttons' );
            wp_enqueue_media();
        }
        foreach ( $this->css as $item ) {
            if ( $item[0] == 'backend' ) {
                if ( isset( $_GET['page'] ) || $item[1] == 'all' ) {
                    if ( $item[1] == 'all' || in_array( $_GET['page'], $item[1] ) ) {
                        wp_enqueue_style(
                            $item[2],
                            $item[3],
                            $item[4],
                            $item[5]
                        );
                    }
                }
            }
        }
        foreach ( $this->js as $item ) {
            if ( $item[0] == 'backend' ) {
                if ( isset( $_GET['page'] ) || $item[1] == 'all' ) {
                    if ( $item[1] == 'all' || isset( $_GET['page'] ) && is_array( $item[1] ) && in_array( $_GET['page'], $item[1] ) ) {
                        wp_enqueue_script(
                            $item[2],
                            $item[3],
                            $item[4],
                            $item[5],
                            true
                        );
                    }
                }
            }
        }
        $translation_array = [
            'disable_nice_select' => get_option( 'wbk_disable_nice_select', '' ),
            'export_csv'          => __( 'Export to CSV', 'webba-booking-lite' ),
            'start_export'        => __( 'Start export', 'webba-booking-lite' ),
            'please_wait'         => __( 'Please wait...', 'webba-booking-lite' ),
            'edit'                => __( 'Edit', 'webba-booking-lite' ),
            'new'                 => __( 'New', 'webba-booking-lite' ),
            'january'             => __( 'January' ),
            'february'            => __( 'February' ),
            'march'               => __( 'March' ),
            'april'               => __( 'April' ),
            'may'                 => __( 'May' ),
            'june'                => __( 'June' ),
            'july'                => __( 'July' ),
            'august'              => __( 'August' ),
            'september'           => __( 'September' ),
            'october'             => __( 'October' ),
            'november'            => __( 'November' ),
            'december'            => __( 'December' ),
            'jan'                 => __( 'Jan' ),
            'feb'                 => __( 'Feb' ),
            'mar'                 => __( 'Mar' ),
            'apr'                 => __( 'Apr' ),
            'mays'                => __( 'May' ),
            'jun'                 => __( 'Jun' ),
            'jul'                 => __( 'Jul' ),
            'aug'                 => __( 'Aug' ),
            'sep'                 => __( 'Sep' ),
            'oct'                 => __( 'Oct' ),
            'nov'                 => __( 'Nov' ),
            'dec'                 => __( 'Dec' ),
            'sunday'              => __( 'Sunday' ),
            'monday'              => __( 'Monday' ),
            'tuesday'             => __( 'Tuesday' ),
            'wednesday'           => __( 'Wednesday' ),
            'thursday'            => __( 'Thursday' ),
            'friday'              => __( 'Friday' ),
            'saturday'            => __( 'Saturday' ),
            'sun'                 => __( 'Sun' ),
            'mon'                 => __( 'Mon' ),
            'tue'                 => __( 'Tue' ),
            'wed'                 => __( 'Wed' ),
            'thu'                 => __( 'Thu' ),
            'fri'                 => __( 'Fri' ),
            'sat'                 => __( 'Sat' ),
            'today'               => __( 'Today' ),
            'clear'               => __( 'Clear' ),
            'close'               => __( 'Close' ),
            'duplication_warning' => __( 'Duplication of bookings is highly discouraged because it can lead to errors in determining free timeslots.', 'webba-booking-lite' ),
            'wbkb_nonce'          => wp_create_nonce( 'wbkb_nonce' ),
            'ajaxurl'             => admin_url( 'admin-ajax.php' ),
            'empty_table'         => esc_html__( 'No data available', 'webba-booking-lite' ),
            'nofication_icon'     => WP_WEBBA_BOOKING__PLUGIN_URL . '/public/images/notification-icon.png',
        ];
        wp_localize_script( 'wbk5-backend-script', 'wbk_dashboardl10n', $translation_array );
        wp_localize_script( 'wbk-backend-script', 'wbk_dashboardl10n_old', $translation_array );
        // remove in V5
        if ( isset( $_GET['page'] ) && ($_GET['page'] == 'wbk-calendar' || $_GET['page'] == 'wbk-options') ) {
            wp_deregister_script( 'chosen' );
            $translation_array = [
                'addappointment' => __( 'Add appointment', 'webba-booking-lite' ),
                'add'            => __( 'Add', 'webba-booking-lite' ),
                'close'          => __( 'Close', 'webba-booking-lite' ),
                'appointment'    => __( 'Appointment', 'webba-booking-lite' ),
                'delete'         => __( 'Delete', 'webba-booking-lite' ),
                'shownextweek'   => __( 'Show next week', 'webba-booking-lite' ),
                'phonemask'      => get_option( 'wbk_phone_mask', 'enabled' ),
                'phoneformat'    => get_option( 'wbk_phone_format', '' ),
                'confirm'        => __( 'Confirm', 'webba-booking-lite' ),
                'wbkb_nonce'     => wp_create_nonce( 'wbkb_nonce' ),
                'ajaxurl'        => admin_url( 'admin-ajax.php' ),
                'week_start'     => get_option( 'start_of_week', '1' ),
            ];
            //  wp_localize_script('wbk-options', 'wbkl10n', $translation_array);
            wp_localize_script( 'wbk-schedule', 'wbkl10n', $translation_array );
        }
        wbkdata_localize_script( 'wbk5-backend-script' );
    }

    public function admin_enqueue_scripts_textdomain() {
        $admin_pages = [
            'wbk-services',
            'wbk-email-templates',
            'wbk-service-categories',
            'wbk-appointments',
            'wbk-coupons',
            'wbk-gg-calendars',
            'wbk-pricing-rules',
            'wbk-dashboard',
            'wbk-spa'
        ];
        if ( isset( $_GET['page'] ) && in_array( $_GET['page'], $admin_pages ) ) {
            $res = wp_set_script_translations( 'wbk-react-admin', 'webba-booking-lite', WP_WEBBA_BOOKING__PLUGIN_DIR . '/' . 'languages/' );
        }
    }

    public function wp_enqueue_scripts() {
        if ( get_option( 'wbk_load_js_in_footer', '' ) == 'true' ) {
            $in_footer = true;
        } else {
            $in_footer = false;
        }
        $has_shortcode = false;
        if ( $this->has_shortcode( 'webba_booking' ) || $this->has_shortcode( 'webba_email_landing' ) || $this->has_shortcode( 'webbabooking' ) || $this->has_shortcode( 'webba_multi_service_booking' ) ) {
            $has_shortcode = true;
        }
        $has_ud_shortcode = $this->has_shortcode( 'webba_user_dashboard' );
        if ( !$has_ud_shortcode ) {
            $has_ud_shortcode = $this->has_shortcode( 'webbabooking' );
        }
        if ( isset( $_GET['ct_builder'] ) ) {
            return;
        }
        if ( isset( $_GET['action'] ) && $_GET['action'] == 'oxy_render_oxy-site-navigation' ) {
            return;
        }
        if ( isset( $_GET['action'] ) && $_GET['action'] == 'oxy_render_oxy-shape-divider' ) {
            return;
        }
        if ( isset( $_GET['action'] ) && $_GET['action'] == 'oxy_render_oxy-mini-cart' ) {
            return;
        }
        wp_enqueue_script( 'jquery-effects-fade' );
        foreach ( $this->css as $item ) {
            if ( $item[0] == 'frontend6' && $has_shortcode ) {
                wp_enqueue_style(
                    $item[2],
                    $item[3],
                    $item[4],
                    $item[5]
                );
            }
        }
        foreach ( $this->js as $item ) {
            if ( $item[0] == 'frontend6' && $has_shortcode ) {
                wp_enqueue_script(
                    $item[2],
                    $item[3],
                    $item[4],
                    $item[5],
                    true
                );
            }
        }
    }

    private function has_shortcode( $shortcode = '' ) {
        if ( get_option( 'wbk_check_short_code', '' ) == '' && $shortcode != 'webba_user_dashboard' ) {
            return true;
        }
        $post_to_check = get_post( get_the_ID() );
        if ( !$post_to_check ) {
            return false;
        }
        $found = false;
        if ( !$shortcode ) {
            return $found;
        }
        if ( stripos( $post_to_check->post_content, '[' . $shortcode ) !== false ) {
            $found = true;
        }
        return $found;
    }

    public function enqueue_block_editor_assets() : void {
        wp_enqueue_style( 'wbk-frontend-style-config', content_url() . '/webba_booking_style/wbk6-frontend-config.css' );
    }

}
