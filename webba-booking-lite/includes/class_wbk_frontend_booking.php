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
            $ggeventadd = WBK_Db_Utils::wbk_sanitize( $ggeventadd );
            $appointment_ids = WBK_Db_Utils::getAppointmentIdsByGroupToken( $ggeventadd );
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
        if ( isset( $_GET['pp_aprove'] ) && !wbk_is5() ) {
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
                                    wp_redirect( $pp_redirect_url );
                                    exit;
                                }
                            }
                            wp_redirect( get_permalink() . '?paypal_status=1' );
                            exit;
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
                    WBK_Db_Utils::clearPaymentIdByToken( $cancel_token );
                }
                wp_redirect( get_permalink() . '?paypal_status=5' );
                exit;
            }
        }
    }

    public function wbk_shc_webbabooking( $attr ) {
        $get_processing = WBK_Renderer::load_template( 'frontend/get_parameters_processing', [], false );
        if ( $get_processing != '' ) {
            return $get_processing;
        }
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
            'multiservice' => 'no',
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
        $this->scenario = [];
        if ( $service == 0 ) {
            if ( $multiservice != 'yes' ) {
                if ( $category_list == 'yes' ) {
                    $templates = [
                        'frontend_v5/category_dropdown'    => [$category_ids],
                        'frontend_v5/service_single_radio' => [$service_ids, false, true],
                    ];
                } else {
                    $templates = [
                        'frontend_v5/service_single_radio' => [$service_ids, false, false],
                    ];
                }
            } else {
                if ( $category_list == 'yes' ) {
                    $templates = [
                        'frontend_v5/category_dropdown' => [$category_ids],
                        'frontend_v5/service_multiple'  => [$service_ids, false, true],
                    ];
                } else {
                    $templates = [
                        'frontend_v5/service_multiple' => [$service_ids, false, false],
                    ];
                }
            }
            $this->scenario[] = [
                'title'     => esc_html( get_option( 'wbk_service_step_title', __( 'Service', 'webba-booking-lite' ) ) ),
                'slug'      => 'services',
                'templates' => $templates,
                'request'   => '',
            ];
            $this->scenario[] = [
                'title'     => esc_html( get_option( 'wbk_date_time_step_title', __( 'Date and time', 'webba-booking-lite' ) ) ),
                'slug'      => 'date_time',
                'templates' => [
                    'frontend_v5/date_time' => [false],
                ],
                'request'   => 'wbk_prepare_service_data',
            ];
        } else {
            $service_ids = [$service];
            $this->scenario[] = [
                'title'     => esc_html( get_option( 'wbk_date_time_step_title', __( 'Date and time', 'webba-booking-lite' ) ) ),
                'slug'      => 'date_time',
                'templates' => [
                    'frontend_v5/service_dropdown' => [$service_ids, true],
                    'frontend_v5/date_time'        => [true],
                ],
                'request'   => 'wbk_prepare_service_data',
            ];
        }
        // detect if there are free services
        $free_services = 0;
        $paid_services = 0;
        foreach ( $service_ids as $service_id ) {
            $service = new WBK_Service($service_id);
            if ( !$service->is_loaded() ) {
                continue;
            }
            if ( $service->get_payment_methods() == '' ) {
                $free_services++;
            } else {
                if ( $service->has_only_arrival_payment_method() ) {
                    $free_services++;
                } else {
                    $paid_services++;
                }
            }
        }
        $this->scenario[] = [
            'title'   => esc_html( get_option( 'wbk_details_step_title', __( 'Details', 'webba-booking-lite' ) ) ),
            'slug'    => 'form',
            'request' => 'wbk_render_booking_form',
        ];
        if ( $paid_services > 0 ) {
            $payment_slug = 'payment';
            if ( $free_services > 0 ) {
                $payment_slug = 'payment_optional';
            }
            // only paid services
            $this->scenario[] = [
                'title'   => esc_html( get_option( 'wbk_payment_step_title', __( 'Payment', 'webba-booking-lite' ) ) ),
                'slug'    => $payment_slug,
                'request' => 'wbk_book',
            ];
            $this->scenario[] = [
                'slug'    => 'final_screen',
                'request' => 'wbk_approve_payment',
            ];
        } else {
            $this->scenario[] = [
                'slug'    => 'final_screen',
                'request' => 'wbk_book',
            ];
        }
        $compatibility_html = '';
        if ( $compatibility == 'yes' ) {
            $compatibility_html = '<span class="wbk_compatibility"></span>';
        }
        if ( get_option( 'wbk_initial_shortcode_render_tracked', '' ) != 'true' ) {
            if ( WBK_Model_Utils::get_total_count_of_bookings() == 0 ) {
                $data['service'] = $tracking_service;
                $data['category'] = $category;
                $data['category_list'] = $category_list;
                $data['multiservice'] = $multiservice;
                WBK_Mixpanel::track_event( "1st shortcode rendering", $data );
                update_option( 'wbk_initial_shortcode_render_tracked', 'true' );
            } else {
                update_option( 'wbk_initial_shortcode_render_tracked', 'true' );
            }
        }
        return $compatibility_html . WBK_Renderer::load_template( 'frontend_v5/webba5_form_container', [$this->scenario], false );
    }

    public function wp_enqueue_scripts() {
        $select_date_extended_label = get_option( 'wbk_date_extended_label', '' );
        $select_date_basic_label = get_option( 'wbk_date_basic_label', '' );
        $select_slots_label = get_option( 'wbk_slots_label', '' );
        $thanks_message = get_option( 'wbk_book_thanks_message', '' );
        $select_date_placeholder = WBK_Validator::alfa_numeric( get_option( 'wbk_date_input_placeholder', '' ) );
        $booked_text = get_option( 'wbk_booked_text', '' );
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
