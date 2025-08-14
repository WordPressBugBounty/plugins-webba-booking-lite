<?php

// check if accessed directly
if ( !defined( 'ABSPATH' ) ) {
    exit;
}
class WBK_Frontend_Booking {
    private $scenario;

    public function __construct() {
        // add shortcode
        add_shortcode( 'webba_booking', [$this, 'wbk_shc_webba_booking'] );
        add_shortcode( 'webbabooking', [$this, 'wbk_shc_webbabooking'] );
        add_shortcode( 'webba_email_landing', [$this, 'wbk_email_landing_shortcode'] );
        add_shortcode( 'webba_multi_service_booking', [$this, 'wbk_shc_multi_service_booking'] );
        // init scripts
        add_action( 'wp_enqueue_scripts', [$this, 'wp_enqueue_scripts'] );
        // param process
        add_action( 'wp_loaded', [$this, 'param_processing'] );
        add_shortcode( 'webba_user_dashboard', [$this, 'wbk_user_dashboard_shortcode'] );
    }

    // deprecated shortcodes
    public function wbk_email_landing_shortcode() {
        return do_shortcode( '[webbabooking]' );
    }

    public function wbk_shc_multi_service_booking( $attr ) {
        extract( shortcode_atts( [
            'category'      => '0',
            'skip_services' => '0',
            'category_list' => '0',
        ], $attr ) );
        return do_shortcode( '[webbabooking multiservice=yes]' );
    }

    public function wbk_shc_webba_booking( $attr ) {
        extract( shortcode_atts( [
            'service' => '0',
        ], $attr ) );
        extract( shortcode_atts( [
            'category' => '0',
        ], $attr ) );
        extract( shortcode_atts( [
            'category_list' => '0',
        ], $attr ) );
        if ( $service != '0' ) {
            return do_shortcode( '[webbabooking service=' . $service . ']' );
        }
        if ( $category != '0' ) {
            return do_shortcode( '[webbabooking category=' . $category . ']' );
        }
        if ( $category_list != '0' ) {
            return do_shortcode( '[webbabooking category_list=yes]' );
        }
        return do_shortcode( '[webbabooking]' );
    }

    public function render( $template, $data ) {
        return;
    }

    // end of deprecated shortcodes
    public function param_processing() {
        if ( isset( $_GET['error'] ) ) {
            wp_redirect( get_permalink() . '?ggadd_cancelled=1' );
            exit;
        }
        if ( isset( $_GET['ggeventadd'] ) ) {
            $ggeventadd = $_GET['ggeventadd'];
            $ggeventadd = WBK_Validator::wbk_sanitize( $ggeventadd );
            $appointment_ids = WBK_Model_Utils::get_booking_ids_by_group_token( $ggeventadd );
            if ( count( $appointment_ids ) > 0 ) {
                if ( !session_id() ) {
                    session_start();
                }
                $_SESSION['wbk_ggeventaddtoken'] = $ggeventadd;
            }
        }
        if ( isset( $_GET['code'] ) ) {
            if ( !session_id() ) {
                session_start();
            }
        }
        // check if called as payment result
        if ( isset( $_GET['pp_aprove'] ) ) {
            if ( $_GET['pp_aprove'] == 'true' ) {
                if ( isset( $_GET['paymentId'] ) && isset( $_GET['PayerID'] ) ) {
                    $paymentId = $_GET['paymentId'];
                    $PayerID = $_GET['PayerID'];
                    $paypal = new WBK_PayPal();
                    $booking_ids = WBK_Model_Utils::get_booking_ids_by_payment_id( $paymentId );
                    $init_result = $paypal->init( false, $booking_ids );
                    if ( $init_result === false ) {
                        wp_redirect( get_permalink() . '?paypal_status=2' );
                        exit;
                    } else {
                        $execResult = $paypal->execute_payment( $paymentId, $PayerID );
                        if ( $execResult === false ) {
                            wp_redirect( get_permalink() . '?paypal_status=3' );
                            exit;
                        } else {
                            $pp_redirect_url = trim( get_option( 'wbk_paypal_redirect_url', '' ) );
                            if ( $pp_redirect_url != '' ) {
                                if ( filter_var( $pp_redirect_url, FILTER_VALIDATE_URL ) !== false ) {
                                }
                            }
                        }
                    }
                } else {
                    wp_redirect( get_permalink() . '?paypal_status=4' );
                    exit;
                }
            } elseif ( $_GET['pp_aprove'] == 'false' ) {
                if ( isset( $_GET['cancel_token'] ) ) {
                    $cancel_token = $_GET['cancel_token'];
                    $cancel_token = str_replace( '"', '', $cancel_token );
                    $cancel_token = str_replace( '<', '', $cancel_token );
                    $cancel_token = str_replace( '\'', '', $cancel_token );
                    $cancel_token = str_replace( '>', '', $cancel_token );
                    $cancel_token = str_replace( '/', '', $cancel_token );
                    $cancel_token = str_replace( '\\', '', $cancel_token );
                    WBK_Model_Utils::clear_payment_id_by_token( $cancel_token );
                }
                wp_redirect( get_permalink() . '?paypal_status=5' );
                exit;
            }
        }
    }

    public function wbk_shc_webbabooking( $attr ) {
        extract( shortcode_atts( [
            'service' => '0',
        ], $attr ) );
        extract( shortcode_atts( [
            'category' => '0',
        ], $attr ) );
        extract( shortcode_atts( [
            'category_list' => 'no',
        ], $attr ) );
        extract( shortcode_atts( [
            'compatibility' => 'no',
        ], $attr ) );
        $tracking_service = $service;
        if ( $category > 0 ) {
            $service_ids = WBK_Model_Utils::get_services_in_category( $category );
        } else {
            $service_ids = WBK_Model_Utils::get_service_ids();
        }
        $category_ids = WBK_Model_Utils::get_service_categories();
        if ( isset( $_GET['service'] ) && is_numeric( $_GET['service'] ) ) {
            $service = $_GET['service'];
        }
        $cnt = WBK_Renderer::load_template( 'frontend_v6/booking_form', [$service, $category_list, $category], false );
        return $cnt;
    }

    public function wp_enqueue_scripts() {
        $select_date_extended_label = get_option( 'wbk_date_extended_label', '' );
        $select_date_basic_label = get_option( 'wbk_date_basic_label', '' );
        $select_slots_label = get_option( 'wbk_slots_label', '' );
        $thanks_message = get_option( 'wbk_book_thanks_message', '' );
        $select_date_placeholder = WBK_Validator::alfa_numeric( get_option( 'wbk_date_input_placeholder', '' ) );
        // Localize the script with new data
        $checkout_label = get_option( 'wbk_checkout_button_text', '' );
        $checkout_label = str_replace( '#selected_count', '<span class="wbk_multi_selected_count"></span>', $checkout_label );
        $checkout_label = str_replace( '#total_count', '<span class="wbk_multi_total_count"></span>', $checkout_label );
        $checkout_label = str_replace( '#low_limit', '<span class="wbk_multi_low_limit"></span>', $checkout_label );
        $continuous_appointments = get_option( 'wbk_appointments_continuous' );
        if ( is_array( $continuous_appointments ) ) {
            $continuous_appointments = implode( ',', $continuous_appointments );
        } else {
            $continuous_appointments = '';
        }
    }

    private function has_shortcode_strong( $shortcode ) {
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

    // check if post has shortcode using option wbk_check_short_code
    // if wbk_check_short_code is disable - always return true
    private function has_shortcode( $shortcode = '' ) {
        if ( get_option( 'wbk_check_short_code', 'disabled' ) == 'disabled' ) {
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

    public function wbk_user_dashboard_shortcode() {
    }

}
