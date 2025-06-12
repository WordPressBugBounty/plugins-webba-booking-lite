<?php

if ( !defined( 'ABSPATH' ) ) {
    exit;
}
/**
 * Class WBK_Request_Manager is used to perform requests to the REST API
 */
class WBK_Request_Manager {
    /**
     * constructor
     */
    public function __construct() {
        add_action( 'rest_api_init', function () {
            register_rest_route( 'wbk/v1', '/get-service-list/', [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_service_list'],
                'permission_callback' => [$this, 'get_service_list_permission'],
            ] );
            register_rest_route( 'wbk/v2', '/get-services-and-categories/', [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_services_and_categories'],
                'permission_callback' => [$this, 'get_services_and_categories_permission'],
            ] );
            register_rest_route( 'wbk/v1', '/appointments-status-change/', [
                'methods'             => 'POST',
                'callback'            => [$this, 'appointments_status_change'],
                'permission_callback' => [$this, 'appointments_status_change_permission'],
            ] );
            register_rest_route( 'wbk/v1', '/resend-email/', [
                'methods'             => 'POST',
                'callback'            => [$this, 'resend_email'],
                'permission_callback' => [$this, 'resend_email_permission'],
            ] );
            register_rest_route( 'wbk/v1', '/get-wp-users/', [
                'methods'             => 'POST',
                'callback'            => [$this, 'get_wp_users'],
                'permission_callback' => [$this, 'get_wp_users_permission'],
            ] );
            register_rest_route( 'wbk/v1', '/csv-export/', [
                'methods'             => 'POST',
                'callback'            => [$this, 'wbk_csv_export'],
                'permission_callback' => [$this, 'wbk_csv_export_permission'],
            ] );
            register_rest_route( 'wbk/v1', '/get-available-time-slots-day/', [
                'methods'             => 'POST',
                'callback'            => [$this, 'get_available_time_slots_day'],
                'permission_callback' => [$this, 'get_available_time_slots_day_permission'],
            ] );
            register_rest_route( 'wbk/v1', '/get-dashboard/', [
                'methods'             => 'POST',
                'callback'            => [$this, 'get_dashboard'],
                'permission_callback' => [$this, 'get_dashboard_permission'],
            ] );
            register_rest_route( 'wbk/v2', '/get-preset/', [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_preset'],
                'permission_callback' => [$this, 'get_preset_permission'],
            ] );
            register_rest_route( 'wbk/v2', '/login', [
                'methods'             => 'POST',
                'callback'            => [$this, 'login'],
                'permission_callback' => [$this, 'login_permission'],
            ] );
            register_rest_route( 'wbk/v2', '/get-user-bookings', [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_user_bookings'],
                'permission_callback' => [$this, 'get_user_bookings_permission'],
            ] );
            register_rest_route( 'wbk/v2', '/get-time-slots', [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_time_slots'],
                'permission_callback' => [$this, 'get_time_slots_permission'],
            ] );
            register_rest_route( 'wbk/v2', '/update-booking', [
                'methods'             => 'POST',
                'callback'            => [$this, 'update_booking'],
                'permission_callback' => [$this, 'update_booking_permission'],
            ] );
            register_rest_route( 'wbk/v2', '/delete-booking', [
                'methods'             => 'POST',
                'callback'            => [$this, 'delete_booking'],
                'permission_callback' => [$this, 'delete_booking_permission'],
            ] );
            register_rest_route( 'wbk/v2', '/get-field-options/', [
                'methods'             => 'POST',
                'callback'            => [$this, 'get_field_options'],
                'permission_callback' => [$this, 'get_field_options_permission'],
            ] );
            register_rest_route( 'wbk/v2', '/get-gg-auth-data/', [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_gg_auth_data'],
                'permission_callback' => [$this, 'get_gg_auth_data_permission'],
            ] );
            register_rest_route( 'wbk/v2', '/get-dashboard-stats/', [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_dashboard_stats'],
                'permission_callback' => [$this, 'get_dashboard_stats_permission'],
            ] );
            register_rest_route( 'wbk/v2', '/get-cell-detail/', [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_cell_detail'],
                'permission_callback' => [$this, 'get_cell_detail_permission'],
            ] );
            register_rest_route( 'wbk/v2', '/send-test-email/', [
                'methods'             => 'POST',
                'callback'            => [$this, 'send_test_email'],
                'permission_callback' => [$this, 'send_test_email_permission'],
            ] );
        } );
        add_action( 'wp_ajax_wbk_calculate_amounts', [$this, 'calculate_amounts'] );
        add_action( 'wp_ajax_nopriv_wbk_calculate_amounts', [$this, 'calculate_amounts'] );
        add_action( 'wp_ajax_wbk_search_time', [$this, 'search_time'] );
        add_action( 'wp_ajax_nopriv_wbk_search_time', [$this, 'search_time'] );
        add_action( 'wp_ajax_wbk-render-days', [$this, 'render_days'] );
        add_action( 'wp_ajax_nopriv_wbk-render-days', [$this, 'render_days'] );
        add_action( 'wp_ajax_wbk_prepare_service_data', [$this, 'prepare_service_data'] );
        add_action( 'wp_ajax_nopriv_wbk_prepare_service_data', [$this, 'prepare_service_data'] );
        add_action( 'wp_ajax_wbk_render_booking_form', [$this, 'render_booking_form'] );
        add_action( 'wp_ajax_nopriv_wbk_render_booking_form', [$this, 'render_booking_form'] );
        add_action( 'wp_ajax_wbk_book', [$this, 'book'] );
        add_action( 'wp_ajax_nopriv_wbk_book', [$this, 'book'] );
        add_action( 'wp_ajax_wbk_prepare_payment', [$this, 'prepare_payment'] );
        add_action( 'wp_ajax_nopriv_wbk_prepare_payment', [$this, 'prepare_payment'] );
        add_action( 'wp_ajax_wbk_cancel_appointment', [$this, 'cancel_booking'] );
        add_action( 'wp_ajax_nopriv_wbk_cancel_appointment', [$this, 'cancel_booking'] );
        add_action( 'wp_ajax_wbk_save_appearance', [$this, 'save_appearance'] );
        add_action( 'wp_ajax_wbk_schedule_tools_action', [$this, 'schedule_tools_action'] );
        add_action( 'wp_ajax_wbk_report_error', [$this, 'wbk_report_error'] );
        add_action( 'wp_ajax_nopriv_wbk_report_error', [$this, 'wbk_report_error'] );
        add_action( 'wp_ajax_wbk_apply_coupon', [$this, 'wbk_apply_coupon'] );
        add_action( 'wp_ajax_nopriv_wbk_apply_coupon', [$this, 'wbk_apply_coupon'] );
        add_action( 'wp_ajax_wbk_approve_payment', [$this, 'wbk_approve_payment'] );
        add_action( 'wp_ajax_nopriv_wbk_approve_payment', [$this, 'wbk_approve_payment'] );
        add_action( 'wp_ajax_wbk_backend_hide_notice', [$this, 'wbk_backend_hide_notice'] );
    }

    function login( $request ) {
        $params = $request->get_json_params();
        $credentials = [
            'user_login'    => $params['username'],
            'user_password' => $params['password'],
            'remember'      => true,
        ];
        $user = wp_signon( $credentials );
        if ( is_wp_error( $user ) ) {
            return new WP_Error('invalid_login', 'Invalid username or password.', [
                'status' => 403,
            ]);
        }
        wp_set_current_user( $user->ID );
        return new \WP_REST_Response([
            'token' => wp_create_nonce( 'wp_rest' ),
            'user'  => $user->data,
        ], 200);
    }

    public function get_services_and_categories() {
        $services = WBK_Model_Utils::get_services();
        $services_arr = [];
        foreach ( $services as $id => $name ) {
            $service = new WBK_Service($id);
            if ( !$service->is_loaded() ) {
                continue;
            }
            $services_arr[] = [
                'id'      => $id,
                'name'    => $name,
                'payable' => $service->is_payable(),
            ];
        }
        $data = [
            'services' => $services_arr,
        ];
        $response = new \WP_REST_Response($data);
        $response->set_status( 200 );
        return $response;
    }

    public function get_services_and_categories_permission() {
        return true;
    }

    public function wbk_apply_coupon() {
        if ( get_option( 'wbk_disable_security', '' ) != 'true' && !wp_verify_nonce( $_POST['nonce'], 'wbkf_nonce' ) ) {
            wp_die();
            return;
        }
        $coupon = esc_html( sanitize_text_field( trim( $_POST['coupon'] ) ) );
        $service_ids = $_POST['services'];
        foreach ( $service_ids as $service_this ) {
            if ( !WBK_Validator::check_integer( $service_this, 1, 2758537351 ) ) {
                echo json_encode( [
                    'status'      => 'fail',
                    'description' => 'Wrong service IDs',
                ] );
                wp_die();
                return;
            }
        }
        $booking_ids = json_decode( $_POST['booking_ids'] );
        if ( is_null( $booking_ids ) || !is_array( $booking_ids ) ) {
            echo json_encode( [
                'status'      => 'fail',
                'description' => 'Wrong booking IDs',
            ] );
            wp_die();
            return;
        }
        foreach ( $booking_ids as $booking_id ) {
            if ( !WBK_Validator::check_integer( $booking_id, 1, 99999999 ) ) {
                echo json_encode( [
                    'status'      => 'fail',
                    'description' => 'Wrong booking IDs',
                ] );
                wp_die();
                return;
            }
        }
        $tax = get_option( 'wbk_general_tax', '0' );
        if ( trim( $tax ) == '' ) {
            $tax = '0';
        }
        $payment_details = WBK_Price_Processor::get_payment_items_post_booked( $booking_ids );
        $coupon_result = WBK_Validator::check_coupon( $coupon, $service_ids );
        if ( is_array( $coupon_result ) ) {
            foreach ( $booking_ids as $booking_id ) {
                $booking = new WBK_Booking($booking_id);
                if ( !$booking->is_loaded() ) {
                    continue;
                }
                $booking->set( 'coupon', $coupon_result[0] );
                $booking->save();
            }
        }
        $payment_details = WBK_Price_Processor::get_payment_items_post_booked( $booking_ids );
        if ( $coupon_result[2] == 100 ) {
            $this->wbk_set_appointment_as_paid_with_coupon( $booking_ids, 'coupon' );
        }
        if ( $payment_details['subtotal'] <= 0 ) {
            $this->wbk_set_appointment_as_paid_with_coupon( $booking_ids, 'coupon' );
        }
        if ( $coupon_result == false ) {
            echo json_encode( [
                'status' => 'not_applied',
            ] );
        } else {
            $payment_card = WBK_Renderer::load_template( 'frontend_v5/payment_card', [$payment_details, $booking_ids], false );
            echo json_encode( [
                'status'       => 'applied',
                'payment_card' => $payment_card,
            ] );
        }
        wp_die();
        return;
    }

    public function wbk_approve_payment() {
        if ( get_option( 'wbk_disable_security', '' ) != 'true' && !wp_verify_nonce( $_POST['nonce'], 'wbkf_nonce' ) ) {
            wp_die();
            return;
        }
        $booking_ids = json_decode( $_POST['booking_ids'] );
        if ( is_null( $booking_ids ) || !is_array( $booking_ids ) ) {
            echo json_encode( [
                'status'      => 'fail',
                'description' => 'Wrong booking IDs',
            ] );
            wp_die();
            return;
        }
        foreach ( $booking_ids as $booking_id ) {
            if ( !WBK_Validator::check_integer( $booking_id, 1, 99999999 ) ) {
                echo json_encode( [
                    'status'      => 'fail',
                    'description' => 'Wrong booking IDs',
                ] );
                wp_die();
                return;
            }
        }
        $tax = get_option( 'wbk_general_tax', '0' );
        if ( trim( $tax ) == '' ) {
            $tax = '0';
        }
        $booking = new WBK_Booking($booking_ids[0]);
        if ( !$booking->is_loaded() ) {
            echo json_encode( [
                'status'      => 'error',
                'description' => esc_html( __( 'Unable to open booking', 'webba-booking-lite' ) ),
            ] );
            date_default_timezone_set( 'UTC' );
            wp_die();
            return;
        }
        $coupon_id = $booking->get( 'coupon' );
        $coupon_result = false;
        if ( !is_null( $coupon_id ) && is_numeric( $coupon_id ) && $coupon_id > 0 ) {
            $coupon = new WBK_Coupon($coupon_id);
            if ( $coupon->is_loaded() ) {
                $coupon_result = [$coupon_id, $coupon->get( 'amount_fixed' ), $coupon->get( 'amount_percentage' )];
            }
        }
        $time_zone = date_default_timezone_get();
        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        $payment_details = WBK_Price_Processor::get_payment_items( $booking_ids, $tax, $coupon_result );
        date_default_timezone_set( $time_zone );
        $payment_method = $_POST['payment-method'];
        switch ( $payment_method ) {
            case 'arrival':
            case 'bank':
                foreach ( $booking_ids as $booking_id ) {
                    $booking = new WBK_Booking($booking_id);
                    if ( !$booking->is_loaded() ) {
                        continue;
                    }
                    if ( $payment_method == 'arrival' ) {
                        $booking->set( 'payment_method', 'Pay on arrival' );
                    } else {
                        $booking->set( 'payment_method', 'Bank transfer' );
                    }
                    $booking->save();
                }
                if ( $payment_method == 'arrival' && get_option( 'wbk_email_customer_paymentrcvd_payonarrival_status', '' ) == 'true' ) {
                    WBK_Email_Processor::send( $booking_ids, 'payment' );
                }
                echo json_encode( [
                    'status'         => 'success',
                    'thanks_message' => WBK_Renderer::load_template( 'frontend_v5/thank_you_message', [$booking_ids], false ),
                ] );
                //
                break;
            case 'woocommerce':
                $result = WBK_WooCommerce::add_to_cart( $booking_ids );
                $result = json_decode( $result, true );
                if ( is_null( $result ) ) {
                    echo json_encode( [
                        'status' => 'fail',
                        'result' => 'Unexpected error occoured.',
                    ] );
                } else {
                    if ( $result['status'] == 0 ) {
                        echo json_encode( [
                            'status'      => 'fail',
                            'description' => $result['details'],
                        ] );
                    } elseif ( $result['status'] == 1 ) {
                        echo json_encode( [
                            'status' => 'success',
                            'url'    => $result['details'],
                        ] );
                    }
                }
                break;
            case 'paypal':
                foreach ( $booking_ids as $booking_id ) {
                    $booking = new WBK_Booking($booking_id);
                    if ( !$booking->is_loaded() ) {
                        continue;
                    }
                    $booking->set( 'payment_method', '' );
                    $booking->save();
                }
                $paypal = new WBK_PayPal();
                $referer = explode( '?', wp_get_referer() );
                if ( $paypal->init( $referer[0], $booking_ids ) === false ) {
                    echo json_encode( [
                        'status' => 'fail',
                        'result' => 'Unable to initilize PayPal API',
                    ] );
                }
                $url = $paypal->create_payment_v5( $booking_ids );
                if ( $url === false ) {
                    echo json_encode( [
                        'status' => 'fail',
                        'result' => 'Unable to create payment',
                    ] );
                }
                echo json_encode( [
                    'status'         => 'success',
                    'thanks_message' => '',
                    'url'            => $url,
                ] );
                break;
            case 'stripe':
                $error_message = get_option( 'wbk_stripe_api_error_message', 'Payment failed: #response' );
                if ( isset( $_POST['payment_method_id'] ) ) {
                    $payment_method_id = $_POST['payment_method_id'];
                } else {
                    $error_message = str_replace( '#response', __( 'Payment method not set', 'webba-booking-lite' ), $error_message );
                    echo json_encode( [
                        'status'      => 'fail',
                        'description' => $error_message,
                    ] );
                    wp_die();
                    return;
                }
                if ( isset( $_POST['payment_intent_id'] ) ) {
                    $payment_intent_id = $_POST['payment_intent_id'];
                } else {
                    $error_message = str_replace( '#response', __( 'Payment intent not set', 'webba-booking-lite' ), $error_message );
                    echo json_encode( [
                        'status'      => 'fail',
                        'description' => $error_message,
                    ] );
                    wp_die();
                    return;
                }
                $stripe = new WBK_Stripe();
                if ( $stripe->init( $booking->get_service() ) == false ) {
                    $error_message = str_replace( '#response', __( 'Unable to initalize Stripe object', 'webba-booking-lite' ), $error_message );
                    echo json_encode( [
                        'status'      => 'fail',
                        'description' => $error_message,
                    ] );
                    wp_die();
                    return;
                }
                if ( $payment_method_id != '' ) {
                    // validate token
                    if ( !isset( $payment_method_id ) || $payment_method_id == '' ) {
                        $error_message = str_replace( '#response', __( 'Invalid payment id', 'webba-booking-lite' ), $error_message );
                        echo json_encode( [
                            'status'      => 'fail',
                            'description' => $error_message,
                        ] );
                        wp_die();
                        return;
                    }
                    if ( WBK_Stripe::is_currency_zero_decimal( get_option( 'wbk_stripe_currency', '' ) ) ) {
                        $safe_value = $payment_details['total'];
                    } else {
                        $safe_value = $payment_details['total'] * 100;
                    }
                }
                if ( $payment_method_id != '' ) {
                    $result = $stripe->charge_v5(
                        $booking_ids,
                        $payment_details,
                        $payment_method_id,
                        ''
                    );
                } else {
                    $result = $stripe->charge_v5(
                        $booking_ids,
                        $payment_details,
                        $payment_method_id,
                        $_POST['payment_intent_id']
                    );
                }
                if ( $result[0] == 1 && count( $booking_ids ) > 0 ) {
                    $booking_factory = new WBK_Booking_Factory();
                    $booking_factory->set_as_paid( $booking_ids, 'Stripe' );
                }
                if ( $result[0] == 1 || $result[0] == 2 ) {
                    if ( get_option( 'wbk_stripe_redirect_url', '' ) == '' ) {
                        $result['url'] = '';
                        $result['thanks_message'] = WBK_Renderer::load_template( 'frontend_v5/thank_you_message', [$booking_ids], false );
                    } else {
                        $result['url'] = get_option( 'wbk_stripe_redirect_url', '' );
                        $result['thanks_message'] = '';
                    }
                    echo json_encode( [
                        'status' => 'success',
                        'result' => $result,
                    ] );
                } else {
                    if ( count( $result ) == 2 ) {
                        echo json_encode( [
                            'status'      => 'fail',
                            'description' => $result[1],
                        ] );
                    } else {
                        echo json_encode( [
                            'status'      => 'fail',
                            'description' => 'Uknown error',
                        ] );
                    }
                }
                break;
        }
        wp_die();
        return;
    }

    /**
     * getting time slots for a given day
     * @param  WP_REST_Request $request rest request object
     * @return WP_REST_Response rest response object
     */
    public function get_available_time_slots_day( $request ) {
        $day = $request['date'];
        $service_id = $request['service_id'];
        $current_booking = $request['current_booking'];
        if ( !WBK_Validator::is_service_exists( $service_id ) ) {
            $data = [
                'Reason' => 'Service not exists',
            ];
            $response = new \WP_REST_Response($data);
            $response->set_status( 400 );
            return $response;
        }
        if ( !WBK_Validator::is_date( $day ) ) {
            $data = [
                'Reason' => 'Wrong date passed',
            ];
            $response = new \WP_REST_Response($data);
            $response->set_status( 400 );
            return $response;
        }
        if ( !WbkData\Validator::check_integer( $current_booking, 1, 2147483647 ) ) {
            $current_booking = null;
        }
        $sp = new WBK_Schedule_Processor();
        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        $day = strtotime( $day );
        $timeslots = $sp->get_time_slots_by_day(
            $day,
            $service_id,
            [
                'skip_gg_calendar'       => false,
                'ignore_preparation'     => true,
                'calculate_availability' => true,
                'calculate_night_hours'  => false,
                'filter_availability'    => false,
            ],
            $current_booking
        );
        $data = [
            'time_slots' => $timeslots,
        ];
        $response = new \WP_REST_Response($data);
        $response->set_status( 200 );
        date_default_timezone_set( 'UTC' );
        return $response;
    }

    /**
     * check if current user can get time slots per day
     * @param  WP_REST_Request $request rest request object
     * @return bool allow or not rest request
     */
    public function get_available_time_slots_day_permission( $request ) {
        return true;
    }

    public function wbk_csv_export_permission() {
        return true;
    }

    public function get_wp_users_permission( $request ) {
        return true;
    }

    public function appointments_status_change_permission( $request ) {
        $table = sanitize_text_field( $request['table'] );
        if ( false === WbkData()->tables->get_element_at( $table ) ) {
            return false;
        }
        if ( is_numeric( $request['row_id'] ) ) {
            return WbkData()->tables->get_element_at( $table )->current_user_can_update();
        }
        return WbkData()->tables->get_element_at( $table )->current_user_can_add();
    }

    public function resend_email( $request ) {
        $booking_id = sanitize_text_field( $request['id'] );
        $error_status = false;
        $error_messages = [];
        if ( !WBK_Validator::check_integer( $booking_id, 1, 2758537351 ) ) {
            $error_status = true;
            $error_messages[] = 'Wrong booking id.';
        }
        $booking = new WBK_Booking($booking_id);
        if ( !$booking->is_loaded() ) {
            $error_status = true;
            $error_messages[] = 'Unable to open booking.';
        }
        $action = sanitize_text_field( $request['notification_type'] );
        $actions = [
            'booking_created_by_customer',
            'booking_paid',
            'booking_approved',
            'booking_finished'
        ];
        if ( !in_array( $action, $actions ) ) {
            $error_status = true;
            $error_messages[] = 'Wrong notification type.';
        }
        if ( $error_status ) {
            $response = new \WP_REST_Response([
                'message' => implode( ',', $error_messages ) . '.',
            ]);
            $response->set_status( 400 );
            return $response;
        }
        WBK_Email_Processor::send( [$booking_id], $action, true );
        $response = new \WP_REST_Response([
            'message' => __( 'Email sent', 'webba-booking-lite' ),
        ]);
        $response->set_status( 200 );
        return $response;
    }

    public function get_wp_users( $request ) {
        $data = [
            'none_admin_users' => WBK_User_Utils::get_none_admin_wp_users(),
        ];
        $response = new \WP_REST_Response($data);
        $response->set_status( 200 );
        return $response;
    }

    public function appointments_status_change( $request ) {
        $table = trim( sanitize_text_field( $request['table'] ) );
        $row_id = trim( sanitize_text_field( $request['row_id'] ) );
        $status = trim( sanitize_text_field( $request['status'] ) );
        if ( false === WbkData()->tables->get_element_at( $table ) ) {
            $response = new \WP_REST_Response();
            $response->set_status( 400 );
            return $response;
        }
        global $wpdb;
        $table = WbkData()->tables->get_element_at( $table );
        $table_name = $table->get_table_name();
        $wpdb->update( $table_name, [
            'status' => $status,
        ], [
            'id' => $row_id,
        ] );
        $bf = new WBK_Booking_Factory();
        $bf->update( $row_id );
        $response = new \WP_REST_Response();
        $response->set_status( 200 );
        return $response;
    }

    public function get_service_list() {
        $services = WBK_Model_Utils::get_services();
        $html = '';
        foreach ( $services as $id => $service ) {
            $html .= '<option value="' . $id . '">' . $service . '</option>';
        }
        $data = [
            'html' => $html,
        ];
        $response = new \WP_REST_Response($data);
        $response->set_status( 200 );
        return $response;
    }

    public function get_service_list_permission( $request ) {
        $table = sanitize_text_field( $request['table'] );
        return WbkData()->tables->get_element_at( $table )->current_user_can_add();
    }

    public function get_dashboard_permission( $request ) {
        if ( !current_user_can( 'manage_options' ) ) {
            return false;
        }
        $table = sanitize_text_field( $request['table'] );
        if ( false === WbkData()->tables->get_element_at( $table ) ) {
            return false;
        }
        return WbkData()->tables->get_element_at( $table )->сurrent_user_can_view();
    }

    /**
     * function CSV export
     * @return null
     */
    public function wbk_csv_export( $request ) {
    }

    public function calculate_amounts() {
        if ( get_option( 'wbk_disable_security', '' ) != 'true' && !wp_verify_nonce( $_POST['nonce'], 'wbkf_nonce' ) ) {
            wp_die();
            return;
        }
        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        if ( wbk_is_multi_booking() ) {
            $times = $_POST['time'];
        } else {
            $times = explode( ',', $_POST['time'] );
        }
        if ( isset( $_POST['service'] ) ) {
            $services = explode( ',', $_POST['service'] );
        }
        $quantities = $_POST['quantities'];
        $services = $_POST['services'];
        $extra_data = stripslashes( $_POST['extra'] );
        foreach ( $services as $service_this ) {
            if ( !WBK_Validator::check_integer( $service_this, 1, 2758537351 ) ) {
                echo -1;
                date_default_timezone_set( 'UTC' );
                wp_die();
                return;
            }
        }
        foreach ( $quantities as $quantity_this ) {
            if ( !WBK_Validator::check_integer( $quantity_this, 1, 2758537351 ) ) {
                echo -1;
                date_default_timezone_set( 'UTC' );
                wp_die();
                return;
            }
        }
        if ( !wbk_is5() ) {
            $desc = sanitize_text_field( $_POST['desc'] );
            $name = sanitize_text_field( $_POST['name'] );
        } else {
            $desc = '';
            $name = 'blank';
        }
        $phone = sanitize_text_field( $_POST['phone'] );
        $i = -1;
        $bookings = [];
        foreach ( $times as $time ) {
            $i++;
            $service = 0;
            if ( isset( $services[$i] ) ) {
                $service = $services[$i];
            }
            $quantity = 0;
            if ( isset( $quantities[$i] ) ) {
                $quantity = $quantities[$i];
            }
            if ( !is_numeric( $time ) || !is_numeric( $service ) || !is_numeric( $quantity ) ) {
                return 0;
            }
            $day = strtotime( date( 'Y-m-d', $time ) . ' 00:00:00' );
            $booking = new WBK_Booking(null);
            $booking->set_parameters(
                $day,
                $time,
                $service,
                $quantity,
                $name,
                $phone,
                $desc,
                $extra_data
            );
            $bookings[] = $booking;
        }
        $sub_total = 0;
        if ( count( $bookings ) > 60 ) {
            wp_die();
            return;
        }
        foreach ( $bookings as $booking ) {
            $price = WBK_Price_Processor::calculate_single_booking_price( $booking, $bookings );
            $sub_total += $price['price'] * $booking->get_quantity();
        }
        $sub_total = apply_filters( 'webba_after_subtotal_calculated', $sub_total, $bookings );
        $service_fees = 0;
        $services = array_unique( $services );
        if ( count( $services ) > 50 ) {
            wp_die();
            return;
        }
        foreach ( $services as $service ) {
            $service = new WBK_Service($service);
            $service_fees += $service->get_fee();
        }
        if ( get_option( 'wbk_do_not_tax_deposit', '' ) != 'true' ) {
            $sub_total += $service_fees;
        }
        $price_format = get_option( 'wbk_payment_price_format', '$#price' );
        $sub_total_formated = str_replace( '#price', number_format(
            $sub_total,
            get_option( 'wbk_price_fractional', '2' ),
            get_option( 'wbk_price_separator', '.' ),
            ''
        ), $price_format );
        $tax_amount = WBK_Price_Processor::get_tax_amount( $sub_total, WBK_Price_Processor::get_tax_for_messages() );
        $tax_amount_formated = str_replace( '#price', number_format(
            $tax_amount,
            get_option( 'wbk_price_fractional', '2' ),
            get_option( 'wbk_price_separator', '.' ),
            ''
        ), $price_format );
        $total_amount = WBK_Price_Processor::get_total_amount( $sub_total, WBK_Price_Processor::get_tax_for_messages() );
        if ( get_option( 'wbk_do_not_tax_deposit', '' ) == 'true' ) {
            $total_amount += $service_fees;
        }
        $total_formated = str_replace( '#price', number_format(
            $total_amount,
            get_option( 'wbk_price_fractional', '2' ),
            get_option( 'wbk_price_separator', '.' ),
            ''
        ), $price_format );
        date_default_timezone_set( 'UTC' );
        $result = [
            'sub_total'          => $sub_total,
            'tax'                => $tax_amount,
            'total'              => $total_amount,
            'sub_total_formated' => $sub_total_formated,
            'tax_formated'       => $tax_amount_formated,
            'total_formated'     => $total_formated,
            'amount_token'       => $_POST['amount_update_token'],
        ];
        $result = json_encode( $result );
        echo $result;
        wp_die();
        return;
    }

    public function search_time() {
        if ( get_option( 'wbk_disable_security', '' ) != 'true' && !wp_verify_nonce( $_POST['nonce'], 'wbkf_nonce' ) ) {
            wp_die();
            return;
        }
        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        if ( isset( $_POST['initial_services'] ) ) {
            $service_ids = $_POST['initial_services'];
            $multi_service = true;
        } else {
            $service_ids = [$_POST['service']];
            $multi_service = false;
        }
        $date = $_POST['date'];
        $offset = $_POST['offset'];
        $time_zone_client = $_POST['time_zone_client'];
        if ( !is_numeric( $offset ) ) {
            $offset = 0;
        }
        if ( !is_numeric( $date ) ) {
            $day_to_render = strtotime( $date );
        } else {
            $day_to_render = $date;
        }
        if ( $time_zone_client != '' ) {
            $this_tz = new DateTimeZone($time_zone_client);
            $date_this = ( new DateTime('@' . $day_to_render) )->setTimezone( new DateTimeZone($time_zone_client) );
            $offset = $this_tz->getOffset( $date_this );
            $offset = $offset * -1 / 60;
        }
        // validation
        foreach ( $service_ids as $service_id ) {
            if ( !WBK_Validator::check_integer( $day_to_render, 0, 4901674778 ) ) {
                date_default_timezone_set( 'UTC' );
                echo -25;
                wp_die();
                return;
            }
        }
        if ( !WBK_Validator::check_integer( $day_to_render, 0, 4901674778 ) ) {
            date_default_timezone_set( 'UTC' );
            echo -5;
            wp_die();
            return;
        }
        // end validation
        $sp = new WBK_Schedule_Processor();
        $sp->load_data();
        if ( is_array( $service_ids ) ) {
            $i = 0;
            // set number of days to show - $output_count
            if ( get_option( 'wbk_mode', 'extended' ) == 'extended' ) {
                $output_count = apply_filters( 'wbk_days_extended_mode', get_option( 'wbk_days_in_extended_mode', 'default' ), $service_id );
                if ( $output_count == 'default' ) {
                    $output_count = 2;
                } else {
                    $output_count = $output_count - 1;
                }
            } else {
                $output_count = 0;
            }
            $html = '';
            $limit_year = 0;
            while ( $i <= $output_count ) {
                $limit_year++;
                if ( $limit_year > 360 ) {
                    $i = $output_count + 1;
                    continue;
                }
                $day_title_for_multiple = '';
                $take_day_into_account = false;
                $slots_html = '';
                if ( count( $service_ids ) > 50 ) {
                    wp_die();
                    return;
                }
                foreach ( $service_ids as $service_id ) {
                    $service = new WBK_Service($service_id);
                    if ( !$service->is_loaded() ) {
                        date_default_timezone_set( 'UTC' );
                        echo -5;
                        die;
                        return;
                    }
                    $limit_end = 0;
                    $range = $service->get_availability_range();
                    if ( !is_null( $range ) && is_array( $range ) && count( $range ) == 2 ) {
                        $limit_end = strtotime( $range[1] );
                    }
                    if ( $limit_end != 0 && get_option( 'wbk_mode', 'extended' ) == 'extended' ) {
                        if ( $day_to_render > $limit_end ) {
                            //$i = $output_count + 1;
                            continue;
                        }
                    }
                    $day_status = $sp->get_day_status( $day_to_render, $service_id );
                    if ( $day_status == 1 ) {
                        $time_after = $day_to_render;
                        $timeslots = $sp->get_time_slots_by_day( $day_to_render, $service_id, [
                            'skip_gg_calendar'       => false,
                            'ignore_preparation'     => false,
                            'calculate_availability' => true,
                        ] );
                        $slots_html .= WBK_Renderer::load_template( 'frontend/day_with_timeslots', [
                            $day_to_render,
                            $timeslots,
                            $offset,
                            $service_id,
                            $multi_service,
                            $time_after
                        ], false );
                        if ( $slots_html != '' ) {
                            $take_day_into_account = true;
                        }
                    }
                    // todo procees only one slot and skip time slot selection
                    $skip_value = apply_filters( 'wbk_skip_timeslots', get_option( 'wbk_skip_timeslot_select', 'disabled' ), $service_id );
                    if ( substr_count( $slots_html, 'wbk-timeslot-btn' ) == 1 && $skip_value == 'enabled' ) {
                        $first_time = $timeslots[0]->get_start();
                        $form_html = WBK_Renderer::load_template( 'frontend/form_title', [$service_ids, [$first_time]], false );
                        $form_html .= WBK_Renderer::load_template( 'frontend/form_fields', [$service_ids, [$first_time]], false );
                        $form_html = apply_filters(
                            'wbk_form_html',
                            $form_html,
                            $service_id,
                            $first_time
                        );
                        $result = [
                            'dest' => 'form',
                            'data' => $form_html,
                            'time' => $first_time,
                        ];
                        date_default_timezone_set( 'UTC' );
                        echo json_encode( $result );
                        wp_die();
                        return;
                    }
                    // end first time slot
                }
                if ( $take_day_into_account ) {
                    $html .= $day_title_for_multiple . $slots_html;
                    $i++;
                }
                if ( get_option( 'wbk_mode', 'extended' ) == 'extended' ) {
                    $day_to_render = strtotime( 'tomorrow', $day_to_render );
                } else {
                    $i++;
                }
            }
        } else {
        }
        if ( $html == '' ) {
            $html .= WBK_Renderer::load_template( 'frontend/no_results', [], false );
        }
        if ( get_option( 'wbk_show_cancel_button', 'disabled' ) == 'enabled' && get_option( 'wbk_mode' ) != 'webba5' ) {
            global $wbk_wording;
            $cancel_label = get_option( 'wbk_cancel_button_text', '' );
            $html .= '<input class="wbk-button wbk-width-100 wbk-cancel-button"  value="' . esc_attr( $cancel_label ) . '" type="button">';
        }
        $result = [
            'dest' => 'slot',
            'data' => $html,
        ];
        echo json_encode( $result );
        date_default_timezone_set( 'UTC' );
        die;
        return;
    }

    public function render_days() {
        if ( get_option( 'wbk_disable_security', '' ) != 'true' && !wp_verify_nonce( $_POST['nonce'], 'wbkf_nonce' ) ) {
            wp_die();
            return;
        }
        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        $total_steps = $_POST['step'];
        $service_id = $_POST['service'];
        if ( !WBK_Validator::check_integer( $service_id, 1, 9999999999 ) ) {
            echo -1;
            wp_die();
            return;
        }
        $service = new WBK_Service($service_id);
        $sp = new WBK_Schedule_Processor();
        $sp->load_unlocked_days();
        WBK_Renderer::load_template( 'frontend/suitable_hours', [$service_id, $sp], true );
        wp_die();
        return;
    }

    public function prepare_service_data() {
        try {
            if ( get_option( 'wbk_disable_security', '' ) != 'true' && !wp_verify_nonce( $_POST['nonce'], 'wbkf_nonce' ) ) {
                wp_die();
                return;
            }
            date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
            if ( isset( $_POST['service'] ) ) {
                $service_id = $_POST['service'];
            }
            $offset = $_POST['offset'];
            if ( isset( $_POST['initial_services'] ) ) {
                $service_id = $_POST['initial_services'];
            }
            $result = [];
            if ( !is_array( $service_id ) ) {
                if ( !is_numeric( $service_id ) ) {
                    $result['disabilities'] = '';
                    $result['limits'] = '';
                    $result['abilities'] = '';
                    echo json_encode( $result );
                    date_default_timezone_set( 'UTC' );
                    wp_die();
                    return;
                }
                if ( get_option( 'wbk_date_input', 'popup' ) == 'popup' || get_option( 'wbk_date_input', 'popup' ) == 'classic' || get_option( 'wbk_mode', 'webba5' ) == 'webba5' ) {
                    $disabilities = WBK_Model_Utils::get_service_availability_in_range( $service_id, get_option( 'wbk_avaiability_popup_calendar', 365 ) );
                    $result['disabilities'] = implode( ';', $disabilities );
                    $result['limits'] = WBK_Model_Utils::get_service_limits( $service_id );
                    $result['abilities'] = '';
                    $result['week_disabilities'] = WBK_Model_Utils::get_service_weekly_availability( $service_id );
                } else {
                    $abilities = WBK_Model_Utils::get_service_availability_in_range( $service_id, get_option( 'wbk_date_input_dropdown_count', 7 ), 'dropdown' );
                    $result['disabilities'] = '';
                    $result['limits'] = '';
                    $result['abilities'] = implode( ';', $abilities );
                    $result['week_disabilities'] = '';
                }
            } else {
                $service_ids = $service_id;
                $total_array = [];
                $use_limits = true;
                $range_start = 7863319160;
                $range_end = 0;
                if ( count( $service_ids ) > 50 ) {
                    wp_die();
                    return;
                }
                foreach ( $service_ids as $service_id ) {
                    if ( !is_numeric( $service_id ) ) {
                        continue;
                    }
                    if ( get_option( 'wbk_date_input', 'popup' ) == 'popup' || get_option( 'wbk_date_input', 'popup' ) == 'classic' ) {
                        $current_data = WBK_Model_Utils::get_service_availability_in_range( $service_id, get_option( 'wbk_avaiability_popup_calendar', 365 ) );
                    } else {
                        $current_data = WBK_Model_Utils::get_service_availability_in_range( $service_id, get_option( 'wbk_date_input_dropdown_count', 7 ), 'dropdown' );
                    }
                    if ( count( $total_array ) == 0 ) {
                        $total_array = $current_data;
                    } else {
                        $total_array = array_merge( $total_array, $current_data );
                    }
                    $service = new WBK_Service($service_id);
                    if ( !is_null( $service->get_availability_range() ) && is_array( $service->get_availability_range() ) && count( $service->get_availability_range() ) == 2 ) {
                        $availability_range = $service->get_availability_range();
                        $current_start = strtotime( trim( $availability_range[0] ) );
                        $current_end = strtotime( trim( $availability_range[1] ) );
                        if ( $current_start < $range_start ) {
                            $range_start = $current_start;
                        }
                        if ( $current_end > $range_end ) {
                            $range_end = $current_end;
                        }
                    } else {
                        $use_limits = false;
                    }
                }
                $total_array = array_unique( $total_array );
                $toal_array_filtered = [];
                if ( get_option( 'wbk_date_input', 'popup' ) == 'dropdown' ) {
                    foreach ( $total_array as $item ) {
                        if ( strpos( $item, '-HM-wbk_dropdown_limit_reached' ) !== false ) {
                            continue;
                        }
                        $toal_array_filtered[] = $item;
                    }
                }
                $multi_serv_date_limit = get_option( 'wbk_avaiability_popup_calendar', '360' );
                if ( $use_limits ) {
                    $result['limits'] = date( 'Y,n,j', $range_start ) . '-' . date( 'Y,n,j', $range_end );
                } else {
                    $result['limits'] = date( 'Y,n,j', strtotime( 'today midnight' ) ) . '-' . date( 'Y,n,j', strtotime( 'today midnight' ) + 86400 * $multi_serv_date_limit );
                }
                $result['week_disabilities'] = '';
                if ( get_option( 'wbk_date_input', 'popup' ) == 'popup' || get_option( 'wbk_date_input', 'popup' ) == 'classic' ) {
                    $result['disabilities'] = implode( ';', $total_array );
                    $result['abilities'] = '';
                } else {
                    $result['disabilities'] = '';
                    $result['abilities'] = implode( ';', $toal_array_filtered );
                }
            }
            echo json_encode( $result );
            date_default_timezone_set( 'UTC' );
            wp_die();
            return;
        } catch ( \Exception $exception ) {
        }
    }

    public function render_booking_form() {
        if ( get_option( 'wbk_disable_security', '' ) != 'true' && !wp_verify_nonce( $_POST['nonce'], 'wbkf_nonce' ) ) {
            wp_die();
            return;
        }
        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        $time = $_POST['time'];
        if ( isset( $_POST['service'] ) ) {
            $service_ids = [];
            if ( is_array( $time ) ) {
                foreach ( $time as $time_this ) {
                    $service_ids[] = $_POST['service'];
                }
            } else {
                $service_ids[] = $_POST['service'];
            }
        } else {
            $service_ids = $_POST['services'];
            foreach ( $service_ids as $service_this ) {
                if ( !WBK_Validator::check_integer( $service_this, 1, 2758537351 ) ) {
                    echo -1;
                    date_default_timezone_set( 'UTC' );
                    wp_die();
                    return;
                }
            }
        }
        if ( is_array( $time ) ) {
            foreach ( $time as $time_this ) {
                if ( !WBK_Validator::check_integer( $time_this, 0, 2758537351 ) ) {
                    echo -2;
                    date_default_timezone_set( 'UTC' );
                    wp_die();
                    return;
                }
            }
        } else {
            if ( !WBK_Validator::check_integer( $time, 0, 2758537351 ) ) {
                echo -1;
                date_default_timezone_set( 'UTC' );
                wp_die();
                return;
            }
            $time = [$time];
        }
        if ( count( $service_ids ) > 50 ) {
            wp_die();
            return;
        }
        $category_id = 0;
        if ( isset( $_POST['category'] ) && is_numeric( $_POST['category'] ) ) {
            $category_id = $_POST['category'];
        }
        $html = WBK_Renderer::load_template( 'frontend/form_title', [$service_ids, $time, $category_id] );
        if ( wbk_is5() ) {
            $html .= WBK_Renderer::load_template( 'frontend_v5/form_fields', [$service_ids, $time, $category_id] );
        } else {
            $html .= WBK_Renderer::load_template( 'frontend/form_fields', [$service_ids, $time, $category_id] );
        }
        echo apply_filters( 'wbk_post_render_booking_form', $html );
        date_default_timezone_set( 'UTC' );
        wp_die();
        return;
    }

    public function book() {
        if ( get_option( 'wbk_disable_security', '' ) != 'true' && !wp_verify_nonce( $_POST['nonce'], 'wbkf_nonce' ) ) {
            wp_die();
            return;
        }
        global $wpdb;
        $arr_uploaded_urls = [];
        if ( get_option( 'wbk_allow_attachemnt', 'no' ) == 'yes' ) {
            foreach ( $_FILES as $file ) {
                $uploaded_file = wp_handle_upload( $file, [
                    'test_form' => false,
                ] );
                if ( $uploaded_file && !isset( $uploaded_file['error'] ) ) {
                    $arr_uploaded_urls[] = $uploaded_file['file'];
                }
            }
        }
        if ( count( $arr_uploaded_urls ) > 0 ) {
            $attachments = json_encode( $arr_uploaded_urls );
        } else {
            $attachments = '';
        }
        // external validation used by 3d parties
        $wbk_external_validation = true;
        $wbk_external_validation = apply_filters( 'wbk_booking_form_validation', $wbk_external_validation, $_POST );
        if ( $wbk_external_validation == false ) {
            echo -1;
            date_default_timezone_set( 'UTC' );
            die;
        }
        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        if ( isset( $_POST['category'] ) && $_POST['category'] != 'undefined' ) {
            $current_category = esc_html( sanitize_text_field( $_POST['category'] ) );
        } else {
            $current_category = 0;
        }
        if ( wbk_is_multi_booking() ) {
            $times = $_POST['time'];
        } else {
            $times = explode( ',', $_POST['time'] );
        }
        if ( isset( $_POST['services'] ) ) {
            $services = $_POST['services'];
            foreach ( $services as $service_this ) {
                if ( !WBK_Validator::check_integer( $service_this, 1, 2758537351 ) ) {
                    echo -1;
                    date_default_timezone_set( 'UTC' );
                    wp_die();
                    return;
                }
            }
        }
        if ( isset( $_POST['time_zone_client'] ) ) {
            $time_zone_client = $_POST['time_zone_client'];
        } else {
            $time_zone_client = '';
        }
        if ( isset( $_POST['locale'] ) ) {
            $booking_data['locale'] = esc_html( $_POST['locale'] );
        }
        $per_serv_quantity_result = [];
        if ( isset( $_POST['service'] ) && $_POST['service'] != 'undefined' ) {
            $service_id = $_POST['service'];
            $multi_service = false;
        } else {
            $multi_service = true;
        }
        if ( $_POST['quantities'] != '' ) {
            $per_serv_quantity = $_POST['quantities'];
            $i = 0;
            foreach ( $per_serv_quantity as $cur_quantity ) {
                $per_serv_quantity_result['service-' . $services[$i]] = $cur_quantity;
                $i++;
            }
        }
        $booking_data['name'] = esc_html( trim( apply_filters( 'wbk_field_before_book', sanitize_text_field( $_POST['custname'] ), 'name' ) ) );
        $booking_data['email'] = esc_html( strtolower( trim( apply_filters( 'wbk_field_before_book', sanitize_text_field( $_POST['email'] ), 'email' ) ) ) );
        $booking_data['phone'] = esc_html( trim( sanitize_text_field( $_POST['phone'] ) ) );
        $booking_data['extra'] = stripcslashes( $_POST['extra'] );
        if ( isset( $_POST['comment'] ) ) {
            $booking_data['description'] = WBK_Validator::remove_emoji( esc_html( sanitize_text_field( $_POST['comment'] ) ) );
        } else {
            $booking_data['description'] = '';
        }
        $booking_data['service_category'] = $current_category;
        $booking_data['attachment'] = $attachments;
        $booking_ids = [];
        $i = -1;
        $skipped_count = 0;
        $serices_used = [];
        $notification_booking_ids = [];
        $not_booked_due_limit = false;
        $services_used = [];
        $sp = new WBK_Schedule_Processor();
        if ( count( $times ) > 50 ) {
            wp_die();
            return;
        }
        foreach ( $times as $time ) {
            $i++;
            $booking_data_this = $booking_data;
            $booking_data_this['time'] = $time;
            if ( $multi_service ) {
                $service_id = $services[$i];
            }
            $booking_data_this['service_id'] = $service_id;
            $service = new WBK_Service($service_id);
            $ongoing_valid = false;
            if ( get_option( 'wbk_allow_ongoing_time_slot', 'disallow' ) == 'disallow' ) {
                if ( $time > time() ) {
                    $ongoing_valid = true;
                }
            } else {
                $end_time_current = $time + $service->get_duration() * 60;
                if ( $time > time() || $time < time() && $end_time_current > time() ) {
                    $ongoing_valid = true;
                }
            }
            if ( !$ongoing_valid ) {
                continue;
            }
            $booking_data_this['time_offset'] = WBK_Time_Math_Utils::get_offset_local( $time );
            if ( isset( $per_serv_quantity_result['service-' . $service_id] ) ) {
                $quantity_this = $per_serv_quantity_result['service-' . $service_id];
            } else {
                $service = new WBK_Service($service_id);
                if ( $service->get_quantity() == 1 ) {
                    $quantity_this = 1;
                } else {
                    $quantity_this = $quantity;
                }
            }
            $booking_data_this['quantity'] = esc_html( sanitize_text_field( $quantity_this ) );
            // ** double check for closed days
            $day = strtotime( 'today midnight', $time );
            $sp->load_data();
            if ( $sp->get_day_status( $day, $service_id ) != 1 ) {
                $skipped_count++;
                continue;
            }
            // ** double check for timeslot status and available places
            $timeslots = $sp->get_time_slots_by_day( $day, $service_id, [
                'skip_gg_calendar'       => false,
                'ignore_preparation'     => true,
                'calculate_availability' => true,
                'calculate_night_hours'  => false,
            ] );
            $time_slot_valid = false;
            foreach ( $timeslots as $timeslot ) {
                if ( $timeslot->get_start() == $time ) {
                    if ( is_array( $timeslot->get_status() ) || $timeslot->get_status() == 0 ) {
                        if ( $booking_data_this['quantity'] <= $timeslot->get_free_places() ) {
                            $time_slot_valid = true;
                        }
                    }
                }
            }
            if ( !$time_slot_valid ) {
                $skipped_count++;
                continue;
            }
            $booking_data_this['duration'] = $service->get_duration();
            // START LIMIT VALIDATION
            if ( get_option( 'wbk_appointments_only_one_per_slot', 'disabled' ) == 'enabled' ) {
                if ( count( WBK_Model_Utils::get_booking_ids_by_time_service_email( $time, $service_id, $booking_data['email'] ) ) > 0 ) {
                    $not_booked_due_limit = true;
                    continue;
                }
            }
            if ( get_option( 'wbk_appointments_only_one_per_service', 'disabled' ) == 'enabled' ) {
                if ( count( WBK_Model_Utils::get_booking_ids_by_service_email( $service_id, $booking_data['email'] ) ) > 0 ) {
                    $not_booked_due_limit = true;
                    continue;
                }
            }
            if ( get_option( 'wbk_appointments_only_one_per_day', 'disabled' ) == 'enabled' ) {
                if ( count( WBK_Model_Utils::get_booking_ids_by_day_service_email( $day, $service_id, $booking_data['email'] ) ) > 0 ) {
                    $not_booked_due_limit = true;
                    continue;
                }
            }
            // END LIMIT VALIDATION
            $boking_factory = new WBK_Booking_Factory();
            $booking_data_this = apply_filters( 'before_booking_added', $booking_data_this );
            $status = $boking_factory->build_from_array( $booking_data_this );
            $booking_data_this['id'] = $wpdb->insert_id;
            if ( $status[0] == true ) {
                $booking_ids[] = $status[1];
                $notification_booking_ids = $status[1];
                do_action( 'wbk_table_after_add', [$status[1], get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments'] );
                $wbk_action_data = [
                    'appointment_id' => $status[1],
                    'customer'       => $booking_data_this['name'],
                    'email'          => $booking_data_this['email'],
                    'phone'          => $booking_data_this['phone'],
                    'time'           => $booking_data_this['time'],
                    'serice id'      => $booking_data_this['service_id'],
                    'service_id'     => $booking_data_this['service_id'],
                    'duration'       => $booking_data_this['duration'],
                    'comment'        => $booking_data_this['description'],
                    'quantity'       => $booking_data_this['quantity'],
                ];
                do_action( 'wbk_add_appointment', $wbk_action_data );
                do_action( 'wbk_booking_added', $booking_data_this );
            }
        }
        if ( count( $booking_ids ) == 0 && $not_booked_due_limit == true ) {
            if ( wbk_is5() ) {
                echo json_encode( [
                    'status'      => 'fail',
                    'description' => __( 'Limit reached', 'webba-booking-lite' ),
                ] );
            } else {
                echo '-14';
            }
            date_default_timezone_set( 'UTC' );
            wp_die();
            return;
        }
        if ( count( $booking_ids ) == 0 ) {
            if ( wbk_is5() ) {
                echo json_encode( [
                    'status'      => 'fail',
                    'description' => __( 'Time slot was not booked', 'webba-booking-lite' ),
                ] );
            } else {
                echo '-13';
            }
            date_default_timezone_set( 'UTC' );
            wp_die();
            return;
        }
        if ( get_option( 'wbk_woo_prefil_fields', '' ) == 'true' ) {
            if ( !session_id() ) {
                session_start();
            }
            $booking = new WBK_Booking($booking_ids[0]);
            $last_name = $booking->get_custom_field_value( 'last_name' );
            if ( is_null( $last_name ) ) {
                $last_name = '';
            }
            $_SESSION['wbk_name'] = $booking->get_name();
            $_SESSION['wbk_email'] = $booking->get( 'email' );
            $_SESSION['wbk_phone'] = $booking->get( 'phone' );
            $_SESSION['wbk_last_name'] = $last_name;
        }
        $boking_factory->post_production( $booking_ids, 'on_booking' );
        WBK_Mixpanel::track_event( "booking created", [
            'booking_type' => 'frontend',
        ] );
        $payment_methods = WBK_Model_Utils::get_payment_methods_for_bookings_intersected( $booking_ids );
        if ( get_option( 'wbk_appointments_default_status', '' ) == 'pending' && get_option( 'wbk_appointments_allow_payments', '' ) == 'enabled' ) {
            $payable = false;
        } else {
            if ( is_array( $payment_methods ) && count( $payment_methods ) == 1 && $payment_methods[0] == 'arrival' && get_option( 'wbk_skip_on_arrival_payment_method', 'true' ) == 'true' ) {
                $payable = false;
            } else {
                $payable = true;
            }
        }
        if ( count( $payment_methods ) > 0 && $payable ) {
            $tax = get_option( 'wbk_general_tax', '0' );
            if ( trim( $tax ) == '' ) {
                $tax = '0';
            }
            $payment_details = WBK_Price_Processor::get_payment_items( $booking_ids, $tax );
            if ( count( $payment_methods ) == 1 && $payment_methods[0] == 'woocommerce' && get_option( 'wbk_woo_auto_add_to_cart', '' ) == 'true' ) {
                $result = json_decode( WBK_WooCommerce::add_to_cart( $booking_ids ), true );
                if ( $result['status'] == 1 ) {
                    $result = [
                        'redirect' => $result['details'],
                    ];
                } else {
                    $result = [
                        'status'      => 'fail',
                        'description' => __( 'Unable to add product the cart', 'webba-booking-lite' ),
                    ];
                }
                echo json_encode( $result );
                date_default_timezone_set( 'UTC' );
                wp_die();
                return;
            }
            $payment_card = WBK_Renderer::load_template( 'frontend_v5/payment_card', [$payment_details, $booking_ids], false );
            if ( get_option( 'wbk_allow_coupons' ) == 'enabled' ) {
                $coupon_field = WBK_Renderer::load_template( 'frontend_v5/coupon_field', [$payment_details], false );
            } else {
                $coupon_field = '';
            }
            $payment_methods_html = WBK_Renderer::load_template( 'frontend_v5/payment_methods', [$payment_methods], false );
            $result = [
                'thanks_message' => $payment_card . $coupon_field . $payment_methods_html,
            ];
        } else {
            $thanks_message = WBK_Renderer::load_template( 'frontend_v5/thank_you_message', [$booking_ids], false );
            $result = [
                'thanks_message' => $thanks_message,
            ];
        }
        echo json_encode( $result );
        date_default_timezone_set( 'UTC' );
        wp_die();
        return;
    }

    public function prepare_payment() {
        if ( get_option( 'wbk_disable_security', '' ) != 'true' && !wp_verify_nonce( $_POST['nonce'], 'wbkf_nonce' ) ) {
            wp_die();
            return;
        }
        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        $method = sanitize_text_field( $_POST['method'] );
        $booking_ids_unfiltered = explode( ',', sanitize_text_field( $_POST['app_id'] ) );
        $referer = explode( '?', wp_get_referer() );
        $coupon = sanitize_text_field( trim( $_POST['coupon'] ) );
        $booking_ids = [];
        $service_ids = [];
        $sub_total = 0;
        $pay_not_approved = get_option( 'wbk_appointments_allow_payments', 'disabled' );
        if ( count( $booking_ids_unfiltered ) > 50 ) {
            wp_die();
            return;
        }
        foreach ( $booking_ids_unfiltered as $booking_id ) {
            if ( !is_numeric( $booking_id ) ) {
                continue;
            }
            $booking = new WBK_Booking($booking_id);
            if ( !$booking->is_loaded( $booking ) ) {
                continue;
            }
            $status = $booking->get( 'status' );
            $price = $booking->get_price();
            if ( $status == 'woocommerce' || $status == 'paid' || $status == 'paid_approved' || $status == 'pending' && $pay_not_approved == 'enabled' || is_null( $status ) ) {
                continue;
            }
            $sub_total += $price;
            $booking_ids[] = $booking_id;
            $service_ids[] = $booking->get_service();
        }
        if ( count( $booking_ids ) == 0 ) {
            $html = get_option( 'wbk_nothing_to_pay_message', '' );
            if ( $method == 'woocommerce' ) {
                echo json_encode( [
                    'status'  => 0,
                    'details' => $html,
                ] );
            } else {
                echo $html;
            }
            date_default_timezone_set( 'UTC' );
            wp_die();
            return;
        }
        if ( get_option( 'wbk_allow_coupons', 'disabled' ) == 'enabled' ) {
            if ( $coupon != '' ) {
                $coupon_result = WBK_Validator::check_coupon( $coupon, $service_ids );
            } else {
                $coupon_result = false;
            }
        } else {
            $coupon_result = false;
        }
        if ( is_array( $coupon_result ) ) {
            foreach ( $booking_ids as $booking_id ) {
                $booking = new WBK_Booking($booking_id);
                if ( !$booking->is_loaded() ) {
                    continue;
                }
                $booking->set( 'coupon', $coupon_result[0] );
                $booking->save();
            }
            if ( $coupon_result[2] == 100 ) {
                $this->wbk_set_appointment_as_paid_with_coupon( $booking_ids, $method );
            }
            if ( $coupon_result[1] >= $sub_total ) {
                $this->wbk_set_appointment_as_paid_with_coupon( $booking_ids, $method );
            }
        }
        $coupon_status_html = '';
        if ( get_option( 'wbk_allow_coupons', 'disabled' ) == 'enabled' && $coupon != '' ) {
            global $wbk_wording;
            if ( is_array( $coupon_result ) ) {
                $coupon_status_html = esc_html( get_option( 'wbk_coupon_applied', __( 'Coupon applied', 'webba-booking-lite' ) ) );
                $coupon_this = $coupon_result[0];
            } else {
                $coupon_status_html = get_option( 'wbk_coupon_not_applied', __( 'Coupon not applied', 'webba-booking-lite' ) );
                $coupon_this = 0;
            }
            foreach ( $booking_ids as $booking_id ) {
                $booking = new WBK_Booking($booking_id);
                if ( !$booking->is_loaded() ) {
                    continue;
                }
                $booking->set( 'coupon', $coupon_this );
                $booking->save();
            }
        }
        if ( $method == 'arrival' ) {
            foreach ( $booking_ids as $booking_id ) {
                $booking = new WBK_Booking($booking_id);
                if ( !$booking->is_loaded() ) {
                    continue;
                }
                $booking->set( 'payment_method', 'Pay on arrival' );
            }
            $html = WBK_Renderer::load_template( 'frontend/pay_on_arrival_message', [], false );
        }
        if ( $method == 'bank' ) {
            foreach ( $booking_ids as $booking_id ) {
                $booking = new WBK_Booking($booking_id);
                if ( !$booking->is_loaded() ) {
                    continue;
                }
                $booking->set( 'payment_method', 'Bank transfer' );
            }
            $html = WBK_Renderer::load_template( 'frontend/bank_message', [$booking_ids], false );
        }
        if ( $method == 'paypal' ) {
        }
        if ( $method == 'stripe' ) {
        }
        if ( $method == 'woocommerce' ) {
            $result = WBK_WooCommerce::add_to_cart( $booking_ids );
            echo $result;
            wp_die();
            return;
        }
        $html = '<div class="wbk-details-sub-title">' . $coupon_status_html . '</div>' . $html;
        echo $html;
        date_default_timezone_set( 'UTC' );
        wp_die();
        return;
    }

    public function charge_stripe() {
        if ( get_option( 'wbk_disable_security', '' ) != 'true' && !wp_verify_nonce( $_POST['nonce'], 'wbkf_nonce' ) ) {
            wp_die();
            return;
        }
    }

    public function wbk_set_appointment_as_paid_with_coupon( $booking_ids, $method ) {
        $bf = new WBK_Booking_Factory();
        $bf->set_as_paid( $booking_ids, 'coupon' );
        if ( $method == 'coupon' ) {
            $thanks_message = WBK_Renderer::load_template( 'frontend_v5/thank_you_message', [$booking_ids], false );
            $thanks_message = str_replace( 'wbk_hide_if_paid', 'wbk_hidden', $thanks_message );
            echo json_encode( [
                'status'         => 'payment_complete',
                'thanks_message' => $thanks_message,
            ] );
            wp_die();
            return;
        }
        if ( $method == 'paypal' && get_option( 'wbk_paypal_redirect_url' ) != '' ) {
            echo 'redirect:' . get_option( 'wbk_paypal_redirect_url' );
            wp_die();
            return;
        }
        if ( $method == 'stripe' && get_option( 'wbk_stripe_redirect_url' ) != '' ) {
            echo 'redirect:' . get_option( 'wbk_stripe_redirect_url' );
            wp_die();
            return;
        }
        if ( $method == 'woocommerce' ) {
            echo json_encode( [
                'status'  => 5,
                'details' => '',
            ] );
            date_default_timezone_set( 'UTC' );
            wp_die();
            return;
        }
        echo WBK_Renderer::load_template( 'frontend/payment_complete', [], false );
        date_default_timezone_set( 'UTC' );
        wp_die();
        return;
    }

    public function cancel_booking() {
        if ( get_option( 'wbk_disable_security', '' ) != 'true' && !wp_verify_nonce( $_POST['nonce'], 'wbkf_nonce' ) ) {
            wp_die();
            return;
        }
        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        $email = strtolower( $_POST['email'] );
        $app_token = $_POST['app_token'];
        if ( !WBK_Validator::check_email( $email ) ) {
            echo json_encode( [
                'status'      => 'fail',
                'description' => 'Wrong email address',
            ] );
            date_default_timezone_set( 'UTC' );
            wp_die();
            return;
        }
        $booking_ids = WBK_Model_Utils::get_booking_ids_by_group_token( $app_token );
        if ( count( $booking_ids ) > 50 ) {
            echo json_encode( [
                'status'      => 'fail',
                'description' => 'Something went wrong',
            ] );
            wp_die();
            return;
        }
        $valid = true;
        $arr_tokens = explode( '-', $app_token );
        $i = 0;
        $multi_booking_valid = true;
        foreach ( $booking_ids as $booking_id ) {
            $booking = new WBK_Booking($booking_id);
            if ( !$booking->is_loaded() ) {
                $multi_booking_valid = false;
                continue;
            }
            if ( $booking->get( 'email' ) != $email ) {
                $multi_booking_valid = false;
            }
        }
        foreach ( $booking_ids as $booking_id ) {
            $booking = new WBK_Booking($booking_id);
            $booking->set( 'canceled_by', __( 'customer', 'webba-booking-lite' ) );
            $booking->save();
        }
        foreach ( $booking_ids as $booking_id ) {
            $bf = new WBK_Booking_Factory();
            $bf->destroy( $booking_id, 'customer', false );
            $i++;
        }
        if ( $multi_booking_valid && count( $booking_ids ) > 0 ) {
            $message = '<div class="thank-you-block-w"><div class="thank-you-content-w">' . esc_html( get_option( 'wbk_booking_canceled_message', 'Your booking has been cancelled.' ) ) . '</div></div>';
            echo json_encode( [
                'status'         => 'success',
                'thanks_message' => $message,
            ] );
        } else {
            $message = esc_html( get_option( 'wbk_booking_cancel_error_message', '' ) );
            echo json_encode( [
                'status'      => 'fail',
                'description' => stripslashes( $message ),
            ] );
        }
        date_default_timezone_set( 'UTC' );
        wp_die();
        return;
    }

    public function wbk_backend_hide_notice() {
        $notice = sanitize_text_field( $_POST['notice'] );
        if ( $notice == 'wbk_show_go_preimum_1' ) {
            update_option( 'wbk_show_go_preimum_1', 'false' );
        }
        if ( get_option( 'wbk_disable_security', '' ) != 'true' && !wp_verify_nonce( $_POST['nonce'], 'wbkf_nonce' ) ) {
            wp_die();
            return;
        }
        if ( $notice == 'wbk_after_setup_notice' ) {
            update_option( 'wbk_sms_setup_required', '' );
            update_option( 'wbk_payments_setup_required', '' );
            update_option( 'wbk_google_setup_required', '' );
        }
        wp_die();
        return;
    }

    public function schedule_tools_action() {
        global $wpdb;
        global $current_user;
        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        if ( get_option( 'wbk_disable_security', '' ) != 'true' && !wp_verify_nonce( $_POST['nonce'], 'wbkf_nonce' ) ) {
            wp_die();
            return;
        }
        if ( !isset( $_POST['lock_action'] ) ) {
            echo json_encode( [
                'status'  => 0,
                'message' => 'Wrong action.',
            ] );
            wp_die();
            return;
        }
        if ( $_POST['lock_action'] != 'lock' && $_POST['lock_action'] != 'unlock' ) {
            echo json_encode( [
                'status'  => 0,
                'message' => 'Wrong action target.',
            ] );
            wp_die();
            return;
        }
        $lock_action = sanitize_text_field( $_POST['lock_action'] );
        if ( !isset( $_POST['lock_target'] ) ) {
            echo json_encode( [
                'status'  => 0,
                'message' => 'Wrong action target.',
            ] );
            wp_die();
            return;
        }
        if ( $_POST['lock_target'] != 'dates' && $_POST['lock_target'] != 'timeslots' ) {
            echo json_encode( [
                'status'  => 0,
                'message' => 'Wrong action target.',
            ] );
            wp_die();
            return;
        }
        $lock_target = sanitize_text_field( $_POST['lock_target'] );
        $date_range = sanitize_text_field( $_POST['date_range'] );
        $date_range = explode( ' - ', $date_range );
        if ( !is_array( $date_range ) || count( $date_range ) != 2 ) {
            echo json_encode( [
                'status'  => 0,
                'message' => 'Wrong date range.',
            ] );
            wp_die();
            return;
        }
        $start = strtotime( $date_range[0] );
        $end = strtotime( $date_range[1] );
        if ( $end < $start ) {
            echo json_encode( [
                'status'  => 0,
                'message' => 'Wrong date range.',
            ] );
            wp_die();
            return;
        }
        $service_id = sanitize_text_field( $_POST['service'] );
        $category_id = sanitize_text_field( $_POST['category'] );
        if ( !is_numeric( $service_id ) && !is_numeric( $category_id ) ) {
            echo json_encode( [
                'status'  => 0,
                'message' => 'Wrong service or category.',
            ] );
            wp_die();
            return;
        }
        if ( $lock_target == 'timeslots' ) {
            $from = sanitize_text_field( $_POST['from'] );
            $to = sanitize_text_field( $_POST['to'] );
            if ( !WBK_Validator::check_integer( $from, 900, 85500 ) || !WBK_Validator::check_integer( $to, 0, 86400 ) ) {
                echo json_encode( [
                    'status'  => 0,
                    'message' => 'Wrong time interval.',
                ] );
                wp_die();
                return;
            }
            if ( $from >= $to ) {
                echo json_encode( [
                    'status'  => 0,
                    'message' => 'Wrong time interval.',
                ] );
                wp_die();
                return;
            }
        } else {
            $excluded_dates = explode( ',', sanitize_text_field( $_POST['exclude_dates'] ) );
            $excluded_dates_temp = [];
            foreach ( $excluded_dates as $date ) {
                $date = strtotime( $date );
                if ( $date ) {
                    $excluded_dates_temp[] = $date;
                }
            }
            $excluded_dates = $excluded_dates_temp;
        }
        $days_of_week = explode( ',', $_POST['days_of_week'] );
        if ( !is_array( $days_of_week ) ) {
            echo json_encode( [
                'status'  => 0,
                'message' => 'Wrong days of the week.',
            ] );
            wp_die();
            return;
        }
        if ( count( $days_of_week ) == 0 || count( $days_of_week ) > 7 ) {
            echo json_encode( [
                'status'  => 0,
                'message' => 'Wrong days of the week.',
            ] );
            wp_die();
            return;
        }
        foreach ( $days_of_week as $day_of_week ) {
            if ( !WBK_Validator::check_integer( $day_of_week, 1, 7 ) ) {
                echo json_encode( [
                    'status'  => 0,
                    'message' => 'Wrong days of the week.',
                ] );
                wp_die();
                return;
            }
        }
        $total_locked = 0;
        $arr_service_ids = [$service_id];
        if ( $category_id != -1 ) {
            if ( WBK_Validator::check_integer( $category_id, 1, 999999 ) ) {
                $arr_service_ids = WBK_Model_Utils::get_services_in_category( $category_id );
            }
        }
        $sp = new WBK_Schedule_Processor();
        $sp->load_data();
        foreach ( $arr_service_ids as $service_id ) {
            if ( !current_user_can( 'manage_options' ) ) {
                if ( !WBK_Validator::check_access_to_service( $service_id ) ) {
                    echo json_encode( [
                        'status'  => 0,
                        'message' => 'Unauthorised access.',
                    ] );
                    wp_die();
                    return;
                }
            }
            $service = new WBK_Service($service_id);
            if ( !$service->is_loaded() ) {
                continue;
            }
            $curent_day = $start;
            while ( $curent_day <= $end ) {
                if ( !in_array( date( 'N', $curent_day ), $days_of_week ) ) {
                    $curent_day = strtotime( 'tomorrow', $curent_day );
                    continue;
                }
                if ( is_array( $excluded_dates ) && in_array( $curent_day, $excluded_dates ) ) {
                    $curent_day = strtotime( 'tomorrow', $curent_day );
                    continue;
                }
                if ( $lock_target == 'dates' ) {
                    if ( $wpdb->query( $wpdb->prepare( 'DELETE FROM ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_days_on_off WHERE day = %d and service_id = %d', $curent_day, $service_id ) ) === false ) {
                        echo json_encode( [
                            'status'  => 0,
                            'message' => 'Internal database error.',
                        ] );
                        wp_die();
                        return;
                    } else {
                        $total_locked++;
                    }
                    if ( $lock_action == 'lock' ) {
                        $status = 0;
                    } else {
                        $status = 1;
                    }
                    if ( $wpdb->insert( get_option( 'wbk_db_prefix', '' ) . 'wbk_days_on_off', [
                        'service_id' => $service_id,
                        'day'        => $curent_day,
                        'status'     => $status,
                    ], ['%d', '%d', '%d'] ) === false ) {
                        echo json_encode( [
                            'status'  => 0,
                            'message' => 'Internal database error.',
                        ] );
                        wp_die();
                        return;
                    }
                    $curent_day = strtotime( 'tomorrow', $curent_day );
                    continue;
                }
                $day_time_start = WBK_Time_Math_Utils::adjust_times( $curent_day, $from, get_option( 'wbk_timezone', 'UTC' ) );
                $day_time_end = WBK_Time_Math_Utils::adjust_times( $curent_day, $to, get_option( 'wbk_timezone', 'UTC' ) );
                $i = 1;
                $timeslots = $sp->get_time_slots_by_day( $curent_day, $service_id, [
                    'skip_gg_calendar'       => true,
                    'ignore_preparation'     => true,
                    'calculate_availability' => false,
                ] );
                foreach ( $timeslots as $timeslot ) {
                    if ( $timeslot->get_start() < $day_time_start || $timeslot->get_start() > $day_time_end ) {
                        continue;
                    }
                    if ( $wpdb->query( $wpdb->prepare( 'DELETE FROM ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_locked_time_slots WHERE time = %d and service_id = %d', $timeslot->get_start(), $service_id ) ) === false ) {
                        echo json_encode( [
                            'status'  => 0,
                            'message' => 'Internal database error.',
                        ] );
                        wp_die();
                        return;
                    } else {
                        $total_locked++;
                    }
                    if ( $lock_action == 'lock' ) {
                        if ( $wpdb->insert( get_option( 'wbk_db_prefix', '' ) . 'wbk_locked_time_slots', [
                            'service_id' => $service_id,
                            'time'       => $timeslot->get_start(),
                        ], ['%d', '%d'] ) === false ) {
                            echo json_encode( [
                                'status'  => 0,
                                'message' => 'Internal database error.',
                            ] );
                            wp_die();
                            return;
                        }
                    }
                    $i++;
                }
                $curent_day = strtotime( 'tomorrow', $curent_day );
            }
        }
        if ( $lock_action == 'lock' ) {
            echo json_encode( [
                'status'  => 1,
                'message' => __( 'Total locked: ', 'webba-booking-lite' ) . $total_locked,
            ] );
        } else {
            echo json_encode( [
                'status'  => 1,
                'message' => __( 'Total unlocked: ', 'webba-booking-lite' ) . $total_locked,
            ] );
        }
        date_default_timezone_set( 'UTC' );
        wp_die();
        return;
    }

    public function save_appearance() {
        if ( get_option( 'wbk_disable_security', '' ) != 'true' && !wp_verify_nonce( $_POST['nonce'], 'wbkf_nonce' ) ) {
            wp_die();
            return;
        }
        if ( !current_user_can( 'manage_options' ) ) {
            wp_die();
            return;
        }
        $allowed_classes = [
            'appointment-status-wrapper-w',
            'button-wbk',
            'wb_slot_checked',
            'middleDay',
            'checkmark-w',
            'checkbox-subtitle-w',
            'circle-chart-wbk',
            'wbk_service_item_active'
        ];
        $allowed_properties = [
            'background-color',
            'color',
            'border-radius',
            'border-color',
            'background-color,border-color'
        ];
        $allowed_ids = [
            'wbk_appearance_field_1',
            'wbk_appearance_field_2',
            'wbk_appearance_field_3',
            'wbk_appearance_field_4'
        ];
        $app_data = stripslashes( $_POST['appearance_data'] );
        $app_data = json_decode( $app_data );
        if ( !is_array( $app_data ) ) {
            wp_die();
            return;
        }
        if ( count( $app_data ) > 30 ) {
            wp_die();
            return;
        }
        $classes = [];
        $ids = [];
        foreach ( $app_data as $item ) {
            if ( !in_array( $item->class, $allowed_classes ) || !in_array( $item->property, $allowed_properties ) || !in_array( $item->id, $allowed_ids ) ) {
                wp_die();
                return;
            }
            switch ( $item->property ) {
                case 'color':
                case 'border-color':
                case 'background-color':
                case 'background-color,border-color':
                    if ( !WBK_Validator::check_color( $item->value ) ) {
                        wp_die();
                        return;
                    }
                    break;
                case 'border-radius':
                    if ( !WBK_Validator::check_integer( $item->value, 0, 50 ) ) {
                        wp_die();
                        return;
                    }
                    break;
            }
            $properties = explode( ',', $item->property );
            foreach ( $properties as $property ) {
                $classes[$item->class][] = [$property, $item->value];
            }
            $ids[$item->id] = $item->value;
        }
        $css_content = '';
        foreach ( $classes as $class_name => $class_itmes ) {
            if ( $class_name == 'middleDay' ) {
                $class_name = 'middleDay > .cell_inner';
            }
            if ( $class_name == 'checkmark-w' ) {
                $class_name = 'checkbox-custom-w input:checked ~ .checkmark-w';
            }
            $css_content .= '.' . $class_name . '{';
            foreach ( $class_itmes as $key => $value ) {
                if ( $class_name == 'checkbox-subtitle-w' ) {
                    $value[0] = 'color';
                }
                $css_content .= $value[0] . ': ' . $value[1] . ' !important;';
            }
            $css_content .= '}' . PHP_EOL;
        }
        update_option( 'wbk_apperance_data', $ids );
        $dir = WP_CONTENT_DIR . DIRECTORY_SEPARATOR . 'webba_booking_style';
        if ( !is_dir( $dir ) ) {
            mkdir( $dir );
        }
        file_put_contents( $dir . DIRECTORY_SEPARATOR . 'index.html', '' );
        file_put_contents( $dir . DIRECTORY_SEPARATOR . 'wbk5-frontend-custom-style.css', $css_content );
        WBK_Mixpanel::track_event( "appearance saved", [] );
    }

    public function wbk_report_error() {
        wp_die();
        return;
        $headers = 'From: ' . stripslashes( get_option( 'wbk_from_name' ) ) . ' <' . get_option( 'wbk_from_email' ) . '>' . "\r\n";
        $when_allowed = ['prepare_service_data'];
        $when = $_POST['when'];
        if ( !in_array( $when, $when_allowed ) ) {
            wp_die();
            return;
        }
        $post_details = $_POST['details'];
        if ( !is_array( $post_details ) || count( $post_details ) == 0 ) {
            wp_die();
            return;
        }
        $details = 'Request: ' . $when . '<br>Service: ' . $post_details[0];
        $solution = '<br>For more information on troubleshooting please read the following article: <a href="https://webba-booking.com/documentaion/troubleshooting/hanging-after-service-selected/">Hanging when service selected</a>.';
        add_filter( 'wp_mail_content_type', [$this, 'set_email_content_type'] );
        wp_mail(
            get_bloginfo( 'admin_email' ),
            'Problem with the Webba Booking plugin',
            'The Webba Booking plugin could not complete the request. <br><br>Details:<br> ' . $details . '<br>' . $solution,
            $headers
        );
        remove_filter( 'wp_mail_content_type', [$this, 'set_email_content_type'] );
    }

    public function set_email_content_type() {
        return 'text/html';
    }

    /**
     * get_dashboard
     * @param  WP_REST_Request $request rest request object
     * @return WP_REST_Response rest response object
     */
    public function get_dashboard( $request ) {
        $table = trim( sanitize_text_field( $request['table'] ) );
        $filters = ( !empty( $request['filters'] ) ? $request['filters'] : [] );
        $data = null;
        if ( false === WbkData()->tables->get_element_at( $table ) ) {
            $response = new \WP_REST_Response($data);
            $response->set_status( 400 );
            return $response;
        }
        $result = WbkData()->tables->get_element_at( $table )->get_rows( $filters );
        if ( false === $result ) {
            $response = new \WP_REST_Response($data);
            $response->set_status( 404 );
            return $response;
        }
        $data = \WBK_Renderer::load_template( 'backend/dashboard_blocks', [
            'table'   => $table,
            'filters' => $filters,
        ], false );
        $response = new \WP_REST_Response($data);
        $response->set_status( 200 );
        return $response;
    }

    public function get_preset_permission( $request ) {
        return true;
    }

    public function login_permission( $request ) {
        return true;
    }

    public function get_user_bookings( $request ) {
        $current_user = wp_get_current_user();
        $bookings_ids = WBK_Model_Utils::get_bookings_by_customer_email( $current_user->user_email, !isset( $request['pastBookings'] ) && $request['pastBookings'] !== true );
        $bookings = [];
        foreach ( $bookings_ids as $booking_id ) {
            $booking_data = WBK_Model_Utils::get_booking_data( $booking_id );
            if ( $booking_data !== false ) {
                $bookings[] = $booking_data;
            }
        }
        $data = [
            'bookings' => $bookings,
        ];
        $response = new \WP_REST_Response($data, 200);
        $response->set_status( 200 );
        return $response;
    }

    public function get_user_bookings_permission( $request ) {
        return is_user_logged_in();
    }

    public function response_error( $error_message ) {
        $data = [
            'description' => $error_message,
        ];
        $response = new \WP_REST_Response($data);
        $response->set_status( 400 );
        return $response;
    }

    public function get_time_slots_permission( $request ) {
        return is_user_logged_in();
    }

    public function get_time_slots( $request ) {
        $day = explode( '00:00:00', $request['date'] );
        $day = $day[0];
        if ( !WBK_Validator::is_date( $day ) ) {
            return $this->response_error( 'Wrong date.' );
        }
        date_default_timezone_set( 'UTC' );
        $day = date( 'd-m-Y', strtotime( $day ) - $request['offset'] * 60 );
        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        $day = strtotime( $day . ' 00:00:00' );
        $services = [];
        if ( isset( $request['services'] ) && $request['services'] != '' ) {
            $services = explode( ',', $request['services'] );
        }
        if ( isset( $request['booking'] ) ) {
            if ( ctype_digit( $request['booking'] ) ) {
                $booking = new WBK_Booking($request['booking']);
                if ( $booking->is_loaded() ) {
                    $services = [$booking->get_service()];
                }
            }
        }
        if ( count( $services ) == 0 ) {
            return $this->response_error( 'No valid services found.' );
        }
        foreach ( $services as $service_id ) {
            if ( !WBK_Validator::is_service_exists( $service_id ) ) {
                return $this->response_error( 'Wrong service ID.' );
            }
            $sp = new WBK_Schedule_Processor();
            $timeslots = $sp->get_time_slots_by_day( $day, $service_id, [
                'skip_gg_calendar'       => false,
                'ignore_preparation'     => false,
                'calculate_availability' => true,
                'calculate_night_hours'  => false,
                'filter_availability'    => false,
            ] );
            if ( $booking->is_loaded() ) {
                $filtered = array_values( array_filter( $timeslots, fn( $obj ) => $obj->get_free_places() >= $booking->get_quantity() ) );
            } else {
                $filtered = $timeslots;
            }
        }
        return new \WP_REST_Response([
            'status'    => 'success',
            'timeslots' => $filtered,
        ], 200);
    }

    public function update_booking_permission( $request ) {
        if ( !isset( $request['booking'] ) || !ctype_digit( $request['booking'] ) ) {
            return false;
        }
        if ( current_user_can( 'manage_options' ) ) {
            return true;
        }
        return WBK_Validator::is_booking_made_by_current_user( $request['booking'] );
    }

    public function update_booking( $request ) {
        if ( !isset( $request['booking'] ) || !ctype_digit( $request['booking'] ) ) {
            return $this->response_error( 'Wrong booking passed.' );
        }
        if ( !ctype_digit( $request['time'] ) ) {
            return $this->response_error( 'Wrong time.' );
        }
        $time = intval( $request['time'] );
        if ( $time < time() ) {
            return $this->response_error( 'Wrong time.' );
        }
        $booking = new WBK_Booking($request['booking']);
        if ( $booking->is_loaded() ) {
            date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
            $booking->set( 'time', $time );
            $booking->set( 'day', strtotime( 'midnight', $time ) );
            date_default_timezone_set( 'UTC' );
            $booking->save();
            WBK_Email_Processor::send( [$request['booking']], 'booking_updated_by_customer' );
            $data = [
                'booking' => WBK_Model_Utils::get_booking_data( $request['booking'] ),
            ];
            $response = new \WP_REST_Response($data, 200);
            $response->set_status( 200 );
            return $response;
        }
        return $this->response_error( 'Something went wrong.' );
    }

    public function delete_booking_permission( $request ) {
        if ( !isset( $request['booking'] ) || !ctype_digit( $request['booking'] ) ) {
            return false;
        }
        if ( current_user_can( 'manage_options' ) ) {
            return true;
        }
        return WBK_Validator::is_booking_made_by_current_user( $request['booking'] );
    }

    public function delete_booking( $request ) {
        if ( !isset( $request['booking'] ) || !ctype_digit( $request['booking'] ) ) {
            return $this->response_error( 'Wrong booking passed.' );
        }
        $bf = new WBK_Booking_Factory();
        if ( $bf->destroy( $request['booking'], 'customer' ) == false ) {
            return $this->response_error( 'Something went wrong.' );
        }
        return new \WP_REST_Response([
            'status' => 'success',
        ], 200);
    }

    public function get_preset( $request ) {
        WBK_Mixpanel::track_event( "v51 react app: get preset", [] );
        $services = WBK_Model_Utils::get_services();
        $services_arr = [];
        foreach ( $services as $id => $name ) {
            $service = new WBK_Service($id);
            if ( !$service->is_loaded() ) {
                continue;
            }
            $has_description = true;
            if ( strip_tags( $service->get_description() ) == '' ) {
                $has_description = false;
            }
            $business_hours = json_decode(
                $service->get_business_hours(),
                false,
                512,
                JSON_THROW_ON_ERROR
            );
            $business_days = [];
            try {
                if ( isset( $business_hours ) && is_array( $business_hours ) ) {
                    foreach ( $business_hours as $item ) {
                        if ( isset( $item->day_of_week ) ) {
                            $business_days[] = $item->day_of_week;
                        }
                    }
                    $business_days = array_unique( $business_days );
                }
            } catch ( Exception $e ) {
                $business_days = [];
            }
            $service_data = [
                'id'              => $id,
                'value'           => $id,
                'label'           => $name,
                'payable'         => $service->is_payable(),
                'description'     => $service->get_description(),
                'has_description' => $has_description,
                'business_days'   => $business_days,
                'duration'        => $service->get_duration() . ' ' . esc_html( get_option( 'wbk_minutes_label', __( 'min', 'webba-booking-lite' ) ) ),
            ];
            if ( $service->get_price() > 0 ) {
                $service_data['price'] = WBK_Format_Utils::format_price( $service->get_price() );
            }
            $services_arr[] = $service_data;
        }
        $service_categories = WBK_Model_Utils::get_service_categories();
        $categories_arr = [];
        foreach ( $service_categories as $id => $name ) {
            $category_data = [
                'value'    => $id,
                'label'    => $name,
                'services' => WBK_Model_Utils::get_services_in_category( $id ),
            ];
            if ( $category_data['services'] == false ) {
                $category_data['services'] = [];
            }
            $categories_arr[] = $category_data;
        }
        $user = false;
        if ( is_user_logged_in() ) {
            $current_user = wp_get_current_user();
            $user = $current_user->user_login;
            $current_user_email = ( current_user_can( 'manage_options' ) ? $current_user->user_email : '' );
        }
        $data = [
            'services'           => $services_arr,
            'categories'         => $categories_arr,
            'plugin_url'         => WP_WEBBA_BOOKING__PLUGIN_URL,
            'admin_url'          => admin_url(),
            'is_pro'             => wbk_fs()->is__premium_only() && wbk_fs()->can_use_premium_code(),
            'settings'           => [
                'narrow_form'   => get_option( 'wbk_form_layout' ) == 'narrow',
                'week_start'    => get_option( 'start_of_week', '1' ),
                'time_format'   => get_option( 'time_format' ),
                'date_format'   => get_option( 'date_format' ),
                'timezone'      => get_option( 'wbk_timezone', 'UTC' ),
                'locale'        => get_locale(),
                'custom_fields' => WBK_Model_Utils::get_custom_fields_list(),
                'is_admin'      => current_user_can( 'manage_options' ),
                'price_format'  => get_option( 'wbk_payment_price_format', '$#price' ),
            ],
            'wording'            => [
                'service_label'        => get_option( 'wbk_service_label', __( 'Select a service', 'webba-booking-lite' ) ),
                'category_label'       => get_option( 'wbk_category_label', __( 'Select category', 'webba-booking-lite' ) ),
                'date_label'           => get_option( 'wbk_date_basic_label', __( 'Book an appointment on', 'webba-booking-lite' ) ),
                'date_placeholder'     => get_option( 'wbk_date_input_placeholder', __( 'date', 'webba-booking-lite' ) ),
                'cancel'               => get_option( 'wbk_user_dashboard_link_text_cancel', __( 'Cancel booking', 'webba-booking-lite' ) ),
                'confirm_cancel'       => get_option( 'wbk_user_dashboard_link_text_confirm_cancellation', __( 'Confirm cancellation', 'webba-booking-lite' ) ),
                'bookings'             => get_option( 'wbk_user_dashboard_section_bookings_label', __( 'My Bookings', 'webba-booking-lite' ) ),
                'booking_history'      => get_option( 'wbk_user_dashboard_section_past_bookings_label', __( 'History', 'webba-booking-lite' ) ),
                'reschedule'           => get_option( 'wbk_user_dashboard_link_text_reschedule', __( 'Reschedule', 'webba-booking-lite' ) ),
                'loading'              => get_option( 'wbk_user_dashboard_please_wait_state', __( 'Please wait...', 'webba-booking-lite' ) ),
                'label_login_user'     => __( 'Username or Email Address' ),
                'label_login_password' => __( 'Password' ),
                'label_login_button'   => __( 'Login' ),
                'no_booking'           => get_option( 'wbk_user_dashboard_no_bookings_available', __( 'No bookings available', 'webba-booking-lite' ) ),
                'label_login_title'    => get_option( 'wbk_user_dashboard_login_title', __( 'Login to your booking manager', 'webba-booking-lite' ) ),
            ],
            'appearance'         => WBK_Model_Utils::get_appearance_data(),
            'user'               => $user,
            'current_user_email' => $current_user_email,
        ];
        $response = new \WP_REST_Response($data);
        $response->set_status( 200 );
        return $response;
    }

    public function get_field_options_permission() : bool {
        if ( current_user_can( 'manage_options' ) ) {
            return true;
        }
        return WBK_User_Utils::check_access_to_service();
    }

    public function get_field_options( WP_REST_Request $request ) {
        WBK_Mixpanel::track_event( "v51 react app: get field options", [] );
        $data = [];
        $params = $request->get_params();
        $model = ( isset( $params['model'] ) ? sanitize_text_field( $params['model'] ) : '' );
        $field = ( isset( $params['field'] ) ? sanitize_text_field( $params['field'] ) : '' );
        $form = ( isset( $params['form'] ) ? array_map( 'sanitize_text_field', $params['form'] ) : '' );
        if ( $model === 'services' ) {
            switch ( $field ) {
                case 'form':
                    $data[$model][$field] = WBK_Model_Utils::get_cf7_forms();
                    break;
                case 'users':
                    $data[$model][$field] = WBK_User_Utils::get_none_admin_wp_users();
                    break;
                case 'payment_methods':
                    $payment_methods = [
                        'arrival' => 'On arrival',
                        'bank'    => 'Bank transfer',
                    ];
                    $data[$model][$field] = $payment_methods;
                    break;
            }
        } else {
            if ( $model === 'appointments' && ($field === 'service_id' || $field === 'day' || $field === 'time') && $form['service_id'] && $form['day'] ) {
                $sp = new WBK_Schedule_Processor();
                date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
                $day = strtotime( $form['day'] );
                $timeslots = $sp->get_time_slots_by_day(
                    $day,
                    $form['service_id'] ?? 0,
                    [
                        'skip_gg_calendar'       => false,
                        'ignore_preparation'     => true,
                        'calculate_availability' => true,
                        'calculate_night_hours'  => false,
                        'filter_availability'    => false,
                    ],
                    $form['id'] ?? null
                );
                foreach ( $timeslots as $slot ) {
                    $data[$model]['time'][$slot->start] = sprintf( '%s (%d available)', $slot->formated_time, $slot->free_places );
                    for ($place = 1; $place <= $slot->free_places && $form['time'] == $slot->start; $place++) {
                        $data[$model]['quantity'][$place] = sprintf( '%d', $place );
                    }
                }
                if ( empty( $data[$model]['time'] ) ) {
                    $data[$model]['time'] = [
                        'plugion_null' => __( 'No time slots available', 'webba-booking-lite' ),
                    ];
                }
            }
        }
        $response = new WP_REST_Response($data);
        $response->set_status( 200 );
        return $response;
    }

    /**
     * Returns permission for getting google auth data
     *
     * @param WP_REST_Request $request
     * @return boolean
     */
    public function get_gg_auth_data_permission( $params ) : bool {
        return true;
    }

    /**
     * Returns google auth data
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function get_gg_auth_data( WP_REST_Request $request ) : WP_REST_Response {
        $data = [];
        $params = $request->get_params();
        $calendar_id = ( isset( $params['calendar_id'] ) ? sanitize_text_field( $params['calendar_id'] ) : null );
        $credentials = array(get_option( 'wbk_gg_clientid', '' ), get_option( 'wbk_gg_secret', '' ));
        $credentials = apply_filters( 'wbk_gg_credentials', $credentials );
        $data['isAuthenticated'] = $credentials[0] && $credentials[1];
        if ( $calendar_id !== null ) {
            $google = new WBK_Google();
            $google->init( $calendar_id );
            $data['connectionStatus'] = $google->connect();
        }
        $response = new \WP_REST_Response($data);
        $response->set_status( 200 );
        return $response;
    }

    public function resend_email_permission( $request ) : bool {
        if ( current_user_can( 'manage_options' ) ) {
            return true;
        }
        if ( isset( $request['id'] ) && is_numeric( $request['id'] ) ) {
            $booking = new WBK_Booking($request['id']);
            if ( !$booking->is_loaded() ) {
                return false;
            }
            $service = new WBK_Service($booking->get_service());
            if ( !$service->is_loaded() ) {
                return false;
            }
            return WBK_Validator::check_access_to_service( $booking->get_service() );
        }
        return false;
    }

    /**
     * Returns permission for getting dashboard stats
     *
     * @param WP_REST_Request $request
     * @return boolean
     */
    public function get_dashboard_stats_permission( WP_REST_Request $request ) : bool {
        return current_user_can( 'manage_options' );
    }

    /**
     * Returns dashboard stats
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function get_dashboard_stats( WP_REST_Request $request ) : WP_REST_Response {
        $params = $request->get_params();
        $data = [];
        $price_format = get_option( 'wbk_payment_price_format', '$#price' );
        $user = wp_get_current_user();
        $current_time = time();
        $last_24_hours_booking_ids = WBK_Model_Utils::get_booking_by_date_range( $current_time - DAY_IN_SECONDS, $current_time );
        if ( empty( $last_24_hours_booking_ids ) ) {
            $sub_title = esc_html__( 'No bookings in the last 24 hours', 'webba-booking-lite' );
        } else {
            $sub_title = sprintf( esc_html__( 'You have %s new bookings in the past 24 hours', 'webba-booking-lite' ), count( $last_24_hours_booking_ids ) );
        }
        $date_format = get_option( 'wbk_date_format_backend', 'm/d/y' );
        $date_format_js = str_replace( 'd', 'dd', $date_format );
        $date_format_js = str_replace( 'j', 'd', $date_format_js );
        $date_format_js = str_replace( 'l', 'dddd', $date_format_js );
        $date_format_js = str_replace( 'D', 'ddd', $date_format_js );
        $date_format_js = str_replace( 'm', 'mm', $date_format_js );
        $date_format_js = str_replace( 'n', 'm', $date_format_js );
        $date_format_js = str_replace( 'F', 'mmmm', $date_format_js );
        $date_format_js = str_replace( 'M', 'mmm', $date_format_js );
        $date_format_js = str_replace( 'y', 'yyyy', $date_format_js );
        $date_format_js = str_replace( 'Y', 'yyyy', $date_format_js );
        $date_format_js = str_replace( 'S', '', $date_format_js );
        $date_format_js = str_replace( 's', '', $date_format_js );
        $yesterday = date( 'F d, Y', strtotime( "-1 days" ) );
        $last_30_days = date( 'F d, Y', strtotime( "-31 days" ) );
        $formatted_yesterday = date( $date_format, strtotime( "-1 days" ) );
        $formatted_last_30_days = date( $date_format, strtotime( "-31 days" ) );
        $db_prefix = get_option( 'wbk_db_prefix', '' );
        $table = $db_prefix . 'wbk_appointments';
        $pro_version = false;
        $filters = $params['filters'] ?? [];
        $approved = 0;
        $pending = 0;
        $approved_balance = 0;
        $pending_balance = 0;
        $approved_text = esc_html__( 'Approved Bookings', 'webba-booking-lite' );
        $pending_text = esc_html__( 'Pending Bookings', 'webba-booking-lite' );
        $slots_text = esc_html__( 'Of slots are booked', 'webba-booking-lite' );
        $approved_ids = [];
        $pending_ids = [];
        $labels = [];
        $total_data = [];
        $pending_data = [];
        $approved_data = [];
        $prev_time_zone = date_default_timezone_get();
        date_default_timezone_set( get_option( 'wbk_timezone' ) );
        if ( empty( $filters ) ) {
            $start = strtotime( 'today midnight' ) - 86400 * 31;
            $end = strtotime( 'today midnight' ) - 86400;
        } else {
            $start = strtotime( $filters[0]['value'] );
            $end = strtotime( $filters[1]['value'] );
        }
        if ( $start == $end ) {
            $end = $end + 86400;
        }
        date_default_timezone_set( $prev_time_zone );
        $approved_search = 'approved,paid_approved,arrived,added_by_admin_paid';
        $pending_search = 'pending,paid,woocommerce,added_by_admin_not_paid';
        $approved_search_arr = explode( ',', $approved_search );
        $pending_search_arr = explode( ',', $pending_search );
        $num = 100;
        $slots_percent = round( ($approved + $pending) * 100 ) / $num;
        $approved = 0;
        $pending = 0;
        if ( $end > $start ) {
            while ( $start <= $end ) {
                $prev_time_zone = date_default_timezone_get();
                date_default_timezone_set( get_option( 'wbk_timezone' ) );
                $g_date = date( 'Y-m-d', $start );
                date_default_timezone_set( $prev_time_zone );
                $labels[] = $g_date;
                $bookings_on_date = WBK_Model_Utils::get_booking_ids_by_day( $start );
                $total_data[] = count( $bookings_on_date );
                $this_day_approved_ballance = 0;
                $this_day_pending_ballance = 0;
                foreach ( $bookings_on_date as $booking_id ) {
                    $booking = new WBK_Booking($booking_id);
                    if ( !$booking->is_loaded() ) {
                        $response = new \WP_REST_Response([
                            'message' => 'Unable to open booking.',
                        ]);
                        $response->set_status( 400 );
                        return $response;
                    }
                    $price = intval( $booking->get_price() ) * intval( $booking->get_quantity() );
                    if ( in_array( $booking->get_status(), $approved_search_arr ) ) {
                        $this_day_approved_ballance += $price;
                        $approved_balance += $price;
                        $approved++;
                    } else {
                        $this_day_pending_ballance += $price;
                        $pending_balance += $price;
                        $pending++;
                    }
                }
                $approved_data[] = $this_day_approved_ballance;
                $pending_data[] = $this_day_pending_ballance;
                $start = strtotime( '+1 days', $start );
            }
        }
        $graph_options = [];
        if ( !empty( $labels ) ) {
            $graph_options = [
                'labels'   => $labels,
                'datasets' => [[
                    'label'       => esc_html__( 'No. of bookings', 'webba-booking-lite' ),
                    'data'        => $total_data,
                    'borderWidth' => 1,
                    'yAxisID'     => 'y',
                ], [
                    'label'       => esc_html__( 'Revenue (approved)', 'webba-booking-lite' ),
                    'data'        => $approved_data,
                    'borderWidth' => 1,
                    'yAxisID'     => 'yRevenu',
                ], [
                    'label'       => esc_html__( 'Revenue (pending)', 'webba-booking-lite' ),
                    'data'        => $pending_data,
                    'borderWidth' => 1,
                    'yAxisID'     => 'yRevenu',
                ]],
            ];
        }
        $data['chart'] = $graph_options;
        $data['approved'] = $approved;
        $data['pending'] = $pending;
        $data['balance'] = WBK_Format_Utils::format_price( $approved_balance + $pending_balance );
        $data['balance_approved'] = sprintf( '%s %s', WBK_Format_Utils::format_price( $approved_balance ), esc_html__( 'approved', 'webba-booking-lite' ) );
        $data['balance_pending'] = sprintf( '%s %s', WBK_Format_Utils::format_price( $pending_balance ), esc_html__( 'pending', 'webba-booking-lite' ) );
        $data['approvedText'] = $approved_text;
        $data['pendingText'] = $pending_text;
        $data['slotsText'] = $slots_text;
        $data['approved_ids'] = $approved_ids;
        $data['pending_ids'] = $pending_ids;
        $data['priceFormat'] = $price_format;
        $data['isPro'] = $pro_version;
        $response = new \WP_REST_Response($data);
        $response->set_status( 200 );
        return $response;
    }

    /**
     * Get cell detail permission
     *
     * @param array $request
     * @return boolean
     */
    public function get_cell_detail_permission( $request ) : bool {
        return current_user_can( 'manage_options' );
    }

    /**
     * Get cell detail
     *
     * @param array $request
     * @return WP_REST_Response
     */
    public function get_cell_detail( $request ) : WP_REST_Response {
        $model = ( isset( $request['model'] ) ? sanitize_text_field( $request['model'] ) : '' );
        $data = [];
        switch ( $model ) {
            case 'services':
                $data['forms'] = WBK_Model_Utils::get_cf7_forms();
                break;
            default:
                break;
        }
        $response = new \WP_REST_Response($data);
        $response->set_status( 200 );
        return $response;
    }

    public function send_test_email_permission( $request ) : bool {
        return current_user_can( 'manage_options' );
    }

    public function send_test_email( $request ) : WP_REST_Response {
        $id = ( isset( $request['id'] ) ? sanitize_text_field( $request['id'] ) : '' );
        $bookings = ( isset( $request['bookings'] ) ? $request['bookings'] : [] );
        $email = ( isset( $request['email'] ) ? sanitize_text_field( $request['email'] ) : '' );
        if ( !is_array( $bookings ) ) {
            return new \WP_REST_Response([
                'status'  => 'error',
                'message' => __( 'Bookings should be an array', 'webba-booking-lite' ),
            ], 400);
        }
        WBK_Email_Processor::send_test( $bookings, $id, $email );
        $response = new \WP_REST_Response([
            'status'  => 'success',
            'message' => __( 'Test email sent successfully!', 'webba-booking-lite' ),
        ]);
        $response->set_status( 200 );
        return $response;
    }

}
