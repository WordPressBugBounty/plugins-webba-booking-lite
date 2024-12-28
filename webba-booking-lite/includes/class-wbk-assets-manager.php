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

    public function __construct( $css, $js ) {
        $this->css = $css;
        $this->js = $js;
        add_action( 'admin_enqueue_scripts', [$this, 'admin_enqueue_scripts'], 20 );
        add_action( 'wp_enqueue_scripts', [$this, 'wp_enqueue_scripts'], 20 );
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
            Plugion()->initialize_assets( false, false );
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
                            $item[5]
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
        if ( isset( $_GET['page'] ) && $_GET['page'] == 'wbk-schedule' ) {
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
                'phone_required' => get_option( 'wbk_phone_required', '3' ),
                'wbkb_nonce'     => wp_create_nonce( 'wbkb_nonce' ),
                'ajaxurl'        => admin_url( 'admin-ajax.php' ),
                'week_start'     => get_option( 'start_of_week', '1' ),
            ];
            wp_localize_script( 'wbk-schedule', 'wbkl10n', $translation_array );
        }
        plugion_localize_script( 'wbk5-backend-script' );
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
        error_log( var_export( $has_shortcode, true ) );
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
            if ( $item[0] == 'frontend5' && $has_shortcode && get_option( 'wbk_mode', 'webba5' ) == 'webba5' ) {
                wp_enqueue_style(
                    $item[2],
                    $item[3],
                    $item[4],
                    $item[5]
                );
            }
            if ( $item[0] == 'frontend' && get_option( 'wbk_mode', 'webba5' ) != 'webba5' ) {
                wp_enqueue_style(
                    $item[2],
                    $item[3],
                    $item[4],
                    $item[5]
                );
            }
            if ( $item[0] == 'frontend-ud' && $has_ud_shortcode ) {
                wp_enqueue_style(
                    $item[2],
                    $item[3],
                    $item[4],
                    $item[5]
                );
            }
        }
        foreach ( $this->js as $item ) {
            if ( $item[0] == 'frontend5' && $has_shortcode && get_option( 'wbk_mode', 'webba5' ) == 'webba5' ) {
                $this_in_footer = $in_footer;
                if ( $item[2] == 'wbk-frontend-v7' ) {
                    $this_in_footer = true;
                }
                wp_enqueue_script(
                    $item[2],
                    $item[3],
                    $item[4],
                    $item[5],
                    $this_in_footer
                );
            }
            if ( $item[0] == 'frontend' && get_option( 'wbk_mode', 'webba5' ) != 'webba5' ) {
                wp_enqueue_script(
                    $item[2],
                    $item[3],
                    $item[4],
                    $item[5],
                    $in_footer
                );
            }
            if ( $item[0] == 'frontend-ud' && $has_ud_shortcode ) {
                wp_enqueue_script(
                    $item[2],
                    $item[3],
                    $item[4],
                    $item[5],
                    true
                );
            }
        }
        $start_of_week = get_option( 'start_of_week' );
        if ( $start_of_week != '0' && $start_of_week != '1' ) {
            $start_of_week = '0';
        }
        $select_slots_label = WBK_Validator::kses( get_option( 'wbk_slots_label', '' ) );
        $thanks_message = WBK_Validator::kses( get_option( 'wbk_book_thanks_message', '' ) );
        $select_date_placeholder = WBK_Validator::alfa_numeric( get_option( 'wbk_date_input_placeholder', '' ) );
        $booked_text = WBK_Validator::kses( get_option( 'wbk_booked_text', '' ) );
        $checkout_label = WBK_Validator::kses( get_option( 'wbk_checkout_button_text', '' ) );
        $checkout_label = str_replace( '#selected_count', '<span class="wbk_multi_selected_count"></span>', $checkout_label );
        $checkout_label = str_replace( '#total_count', '<span class="wbk_multi_total_count"></span>', $checkout_label );
        $checkout_label = str_replace( '#low_limit', '<span class="wbk_multi_low_limit"></span>', $checkout_label );
        $continuous_appointments = get_option( 'wbk_appointments_continuous' );
        if ( is_array( $continuous_appointments ) ) {
            $continuous_appointments = implode( ',', $continuous_appointments );
        } else {
            $continuous_appointments = '';
        }
        $wbk_phone_requeired = get_option( 'wbk_phone_required', '3' );
        if ( $wbk_phone_requeired == '' ) {
            $wbk_phone_requeired = '0';
        }
        $translation_array = [
            'mode'                           => get_option( 'wbk_mode', 'extended' ),
            'phonemask'                      => get_option( 'wbk_phone_mask', 'enabled' ),
            'phoneformat'                    => get_option( 'wbk_phone_format', '' ),
            'ajaxurl'                        => admin_url( 'admin-ajax.php' ),
            'selectdatestart'                => WBK_Validator::kses( get_option( 'wbk_date_extended_label', '' ) ),
            'selectdatestartbasic'           => WBK_Validator::kses( get_option( 'wbk_date_basic_label', '' ) ),
            'selecttime'                     => WBK_Validator::kses( get_option( 'wbk_slots_label', '' ) ),
            'selectdate'                     => $select_date_placeholder,
            'thanksforbooking'               => $thanks_message,
            'january'                        => __( 'January' ),
            'february'                       => __( 'February' ),
            'march'                          => __( 'March' ),
            'april'                          => __( 'April' ),
            'may'                            => __( 'May' ),
            'june'                           => __( 'June' ),
            'july'                           => __( 'July' ),
            'august'                         => __( 'August' ),
            'september'                      => __( 'September' ),
            'october'                        => __( 'October' ),
            'november'                       => __( 'November' ),
            'december'                       => __( 'December' ),
            'jan'                            => __( 'Jan' ),
            'feb'                            => __( 'Feb' ),
            'mar'                            => __( 'Mar' ),
            'apr'                            => __( 'Apr' ),
            'mays'                           => __( 'May' ),
            'jun'                            => __( 'Jun' ),
            'jul'                            => __( 'Jul' ),
            'aug'                            => __( 'Aug' ),
            'sep'                            => __( 'Sep' ),
            'oct'                            => __( 'Oct' ),
            'nov'                            => __( 'Nov' ),
            'dec'                            => __( 'Dec' ),
            'sunday'                         => __( 'Sunday' ),
            'monday'                         => __( 'Monday' ),
            'tuesday'                        => __( 'Tuesday' ),
            'wednesday'                      => __( 'Wednesday' ),
            'thursday'                       => __( 'Thursday' ),
            'friday'                         => __( 'Friday' ),
            'saturday'                       => __( 'Saturday' ),
            'sun'                            => __( 'Sun' ),
            'mon'                            => __( 'Mon' ),
            'tue'                            => __( 'Tue' ),
            'wed'                            => __( 'Wed' ),
            'thu'                            => __( 'Thu' ),
            'fri'                            => __( 'Fri' ),
            'sat'                            => __( 'Sat' ),
            'today'                          => __( 'Today' ),
            'clear'                          => __( 'Clear' ),
            'close'                          => __( 'Close' ),
            'startofweek'                    => $start_of_week,
            'nextmonth'                      => __( 'Next month', 'webba-booking-lite' ),
            'prevmonth'                      => __( 'Previous  month', 'webba-booking-lite' ),
            'hide_form'                      => get_option( 'wbk_hide_from_on_booking', 'disabled' ),
            'booked_text'                    => $booked_text,
            'show_booked'                    => get_option( 'wbk_show_booked_slots', 'disabled' ),
            'multi_booking'                  => get_option( 'wbk_multi_booking', 'disabled' ),
            'checkout'                       => $checkout_label,
            'multi_limit'                    => get_option( 'wbk_multi_booking_max', '' ),
            'multi_limit_default'            => get_option( 'wbk_multi_booking_max', '' ),
            'phone_required'                 => $wbk_phone_requeired,
            'show_desc'                      => get_option( 'wbk_show_service_description', 'disabled' ),
            'date_input'                     => get_option( 'wbk_date_input', 'popup' ),
            'allow_attachment'               => get_option( 'wbk_allow_attachemnt', 'no' ),
            'stripe_public_key'              => get_option( 'wbk_stripe_publishable_key', '' ),
            'override_stripe_error'          => get_option( 'wbk_stripe_card_input_mode', 'no' ),
            'stripe_card_error_message'      => get_option( 'wbk_stripe_card_element_error_message', 'incorrect input' ),
            'something_wrong'                => __( 'Something went wrong, please try again.', 'webba-booking-lite' ),
            'time_slot_booked'               => __( 'Time slot(s) already booked.', 'webba-booking-lite' ),
            'pp_redirect'                    => get_option( 'wbk_paypal_auto_redirect', 'disabled' ),
            'show_prev_booking'              => get_option( 'wbk_show_details_prev_booking', 'disabled' ),
            'scroll_container'               => get_option( 'wbk_scroll_container', 'html, body' ),
            'continious_appointments'        => $continuous_appointments,
            'show_suitable_hours'            => get_option( 'wbk_show_suitable_hours', 'yes' ),
            'stripe_redirect_url'            => get_option( 'wbk_stripe_redirect_url', '' ),
            'stripe_mob_size'                => get_option( 'wbk_stripe_mob_font_size', '' ),
            'auto_add_to_cart'               => get_option( 'wbk_woo_auto_add_to_cart', 'disabled' ),
            'range_selection'                => get_option( 'wbk_range_selection', 'disabled' ),
            'picker_format'                  => WBK_Db_Utils::convertDateFormatForPicker(),
            'scroll_value'                   => get_option( 'wbk_scroll_value', '120' ),
            'field_required'                 => get_option( 'wbk_validation_error_message', '' ),
            'error_status_scroll_value'      => '0',
            'limit_per_email_message'        => get_option( 'wbk_limit_by_email_reached_message', __( 'You have reached your booking limit.', 'webba-booking-lite' ) ),
            'stripe_hide_postal'             => get_option( 'wbk_stripe_hide_postal', 'false' ),
            'jquery_no_conflict'             => get_option( 'wbk_jquery_nc', 'disabled' ),
            'no_available_dates'             => get_option( 'wbk_no_dates_label', __( 'No available dates message', 'webba-booking-lite' ) ),
            'auto_select_first_date'         => get_option( 'wbk_auto_select_first_date', 'disabled' ),
            'book_text_timeslot'             => WBK_Validator::alfa_numeric( get_option( 'wbk_book_text_timeslot', __( 'Book', 'webba-booking-lite' ) ) ),
            'deselect_text_timeslot'         => get_option( 'wbk_deselect_text_timeslot', '' ),
            'wbkf_nonce'                     => wp_create_nonce( 'wbkf_nonce' ),
            'wrong_field'                    => __( 'Wrong field', 'webba-booking-lite' ),
            'approve_payment_text'           => esc_html( get_option( 'wbk_approve_button_text', __( 'Approve payment', 'webba-booking-lite' ) ) ),
            'continue'                       => __( 'Continue', 'webba-booking-lite' ),
            'of'                             => esc_html( get_option( 'wbk_step_separator', __( 'of', 'webba-booking-lite' ) ) ),
            'auto_next'                      => get_option( 'wbk_auto_next_on_timeslot_selection', '' ),
            'disable_details_scroll'         => esc_html( get_option( 'wbk_disable_scroll_on_details_step', '' ) ),
            'local_time_by_default'          => esc_html( get_option( 'wbk_show_local_time_by_default', '' ) ),
            'multi_limit_service_label'      => esc_html( get_option( 'wbk_multi_limits_label', '#service_name: select from #min to #max timeslots. Selected: #selected_count.' ) ),
            'wbk_automatically_select_today' => esc_html( get_option( 'wbk_automatically_select_today', '' ) ),
        ];
        $sanitized_array = [];
        foreach ( $translation_array as $key => $value ) {
            $sanitized_array[$key] = WBK_Validator::alfa_numeric( $value );
        }
        wp_localize_script( 'wbk-frontend', 'wbkl10n', $sanitized_array );
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

}
