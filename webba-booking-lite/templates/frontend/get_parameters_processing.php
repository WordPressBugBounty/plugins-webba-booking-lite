<?php
if (!defined('ABSPATH')) {
    exit();
}
date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
$html = '';
if (isset($_GET['ggeventadd'])) {
    $token = $_GET['ggeventadd'];
    $token = WBK_Validator::get_param_sanitize($token);
    $booking_ids = WBK_Model_Utils::get_booking_ids_by_group_token($token);
    $booking_ids = array_unique($booking_ids);
    if (count($booking_ids) == 0) {
        $message = get_option(
            'wbk_email_landing_text_invalid_token',
            'Booking not found'
        );
    }
    $title = [];
    foreach ($booking_ids as $booking_id) {
        $booking = new WBK_Booking($booking_id);
        if (!$booking->is_loaded()) {
            continue;
        }
        $title_this = get_option('wbk_appointment_information', '');
        $title[] = WBK_Placeholder_Processor::process_placeholders(
            $title_this,
            $booking_id
        );
    }
    if (count($title) == 0) {
        $message = get_option(
            'wbk_email_landing_text_invalid_token',
            'Booking not found'
        );
    } else {
        $message = implode('<br>', $title);
        $google = new WBK_Google();
        if ($google->init(null) !== true) {
            $valid = false;
        }
        $auth_url = $google->get_auth_url();
        $link_text = get_option(
            'wbk_add_gg_button_text',
            'Add to my Google Calendar'
        );
        $message .=
            '<input type="button" class="button-w mt-30-w wbk-addgg-link" data-link="' .
            esc_url($auth_url) .
            '" value="' .
            esc_html($link_text) .
            '"	>';
    }

    WBK_Renderer::load_template('frontend_v5/webba5_form_container', [
        null,
        stripslashes($message),
    ]);
    return;
}

if (isset($_GET['code'])) {
    $code = $_GET['code'];
    if (
        isset($_SESSION['wbk_ggeventaddtoken']) &&
        $_SESSION['wbk_ggeventaddtoken'] != ''
    ) {
        $token = WBK_Validator::get_param_sanitize(
            $_SESSION['wbk_ggeventaddtoken']
        );
        $booking_ids = WBK_Model_Utils::get_booking_ids_by_group_token($token);
        $booking_ids = array_unique($booking_ids);
        $adding_result = WBK_Google::add_booking_to_customer_calendar(
            $booking_ids,
            $code
        );
        if ($adding_result > 0) {
            $title = get_option(
                'wbk_gg_calendar_add_event_success',
                __('Booking data added to Google Calendar.', 'webba-booking-lite')
            );
        } else {
            $title = get_option(
                'wbk_gg_calendar_add_event_canceled',
                __('Booking data not added to Google Calendar.', 'webba-booking-lite')
            );
        }
        WBK_Renderer::load_template('frontend_v5/webba5_form_container', [
            null,
            stripslashes($title),
        ]);
        return;
    }
}

if (isset($_GET['paypal_status']) && is_numeric($_GET['paypal_status'])) {
    $paypal_status = intval($_GET['paypal_status']);
    if ($paypal_status >= 1 && $paypal_status <= 5) {
        $html = WBK_Renderer::load_template(
            'frontend_v5/paypal_result_status',
            [$paypal_status],
            false
        );
    }
}

if (get_option('wbk_allow_manage_by_link', 'no') == 'yes') {
    if (isset($_GET['admin_approve'])) {
        $cancelation = $_GET['admin_approve'];
        $cancelation = WBK_Validator::get_param_sanitize($cancelation);
        $booking_ids = WBK_Model_Utils::get_booking_ids_by_group_admin_token(
            $cancelation
        );

        $bf = new WBK_Booking_Factory();
        $i = $bf->set_as_approved($booking_ids);

        if ($i > 0) {
            $message = __('Bookings approved: ', 'webba-booking-lite') . $i;
            WBK_Renderer::load_template('frontend_v5/webba5_form_container', [
                null,
                $message,
            ]);
            return;
        }
        return;
    }
}

if (get_option('wbk_allow_manage_by_link', 'no') == 'yes') {
    if (isset($_GET['admin_cancel'])) {
        $cancelation = $_GET['admin_cancel'];
        $cancelation = WBK_Validator::get_param_sanitize($cancelation);
        $booking_ids = WBK_Model_Utils::get_booking_ids_by_group_admin_token(
            $cancelation
        );

        $valid = false;
        $i = 0;

        $customer_notification_mode = get_option(
            'wbk_email_customer_cancel_multiple_mode',
            'foreach'
        );
        $multiple = false;
        if (
            get_option('wbk_multi_booking') == 'enabled' ||
            get_option('wbk_multi_booking') == 'enabled_slot'
        ) {
            $multiple = true;
        }
        if (
            $multiple &&
            $customer_notification_mode == 'one' &&
            get_option('wbk_email_customer_appointment_cancel_status', '') ==
            'true'
        ) {
            if (count($booking_ids) > 0) {
                $appointment = new WBK_Appointment_deprecated();
                if ($appointment->setId($booking_ids[0])) {
                    if ($appointment->load()) {
                        $recipient = $appointment->getEmail();
                        $noifications = new WBK_Email_Notifications(null, null);
                        $subject = get_option(
                            'wbk_email_customer_appointment_cancel_subject',
                            ''
                        );
                        $message = get_option(
                            'wbk_email_customer_appointment_cancel_message',
                            ''
                        );
                        $noifications->sendMultipleNotification(
                            $booking_ids,
                            $message,
                            $subject,
                            $recipient
                        );
                        // send to administrator
                        $service_id = $appointment->getService();
                        $service = WBK_Db_Utils::initServiceById($service_id);
                        if ($service != false) {
                            $subject = get_option(
                                'wbk_email_adimn_appointment_cancel_subject',
                                ''
                            );
                            $message = get_option(
                                'wbk_email_adimn_appointment_cancel_message',
                                ''
                            );
                            $noifications->sendMultipleNotification(
                                $booking_ids,
                                $message,
                                $subject,
                                $service->getEmail()
                            );
                            $super_admin_email = get_option(
                                'wbk_super_admin_email',
                                ''
                            );
                            if ($super_admin_email != '') {
                                $noifications->sendMultipleNotification(
                                    $booking_ids,
                                    $message,
                                    $subject,
                                    $super_admin_email
                                );
                            }
                        }
                    }
                }
            }
        }

        $bf = new WBK_Booking_Factory();

        foreach ($booking_ids as $booking_id) {
            $bf->destroy($booking_id, 'administrator', true);
            $i++;
        }
        if ($i > 0) {
            $message = __('Bookings canceled: ', 'webba-booking-lite') . $i;
            WBK_Renderer::load_template('frontend_v5/webba5_form_container', [
                null,
                $message,
            ]);
            return;
        }
        return;
    }
}

if (isset($_GET['cancelation'])) {
    $cancelation = $_GET['cancelation'];
    $cancelation = WBK_Validator::get_param_sanitize($cancelation);
    $booking_ids_not_filtered = WBK_Model_Utils::get_booking_ids_by_group_token(
        $cancelation
    );
    $booking_ids = [];
    $tokens = [];
    if (count($booking_ids_not_filtered) == 0) {
        WBK_Renderer::load_template('frontend_v5/webba5_form_container', [
            null,
            __('Bookings not found.', 'webba-booking-lite'),
        ]);
        return;
    } else {
        $title_all = [];
        $valid_items = 0;
        foreach ($booking_ids_not_filtered as $booking_id) {
            $booking = new WBK_Booking($booking_id);
            if (!$booking->is_loaded()) {
                continue;
            }
            $title_this = get_option('wbk_appointment_information', '');
            $title = WBK_Placeholder_Processor::process_placeholders(
                $title_this,
                $booking_id
            );
            if (
                $booking->get('status') == 'paid' ||
                $booking->get('status') == 'paid_approved'
            ) {
                if (
                    get_option(
                        'wbk_appointments_allow_cancel_paid',
                        'disallow'
                    ) == 'disallow'
                ) {
                    global $wbk_wording;
                    $paid_error_message = get_option(
                        'wbk_booking_couldnt_be_canceled',
                        ''
                    );
                    $title .= ' - ' . esc_html($paid_error_message);
                    $title_all[] = $title;
                    continue;
                }
            }
            // check buffer
            $buffer = get_option('wbk_cancellation_buffer', '');
            if ($buffer != '') {
                if (intval($buffer) > 0) {
                    $buffer_point = intval(
                        $booking->get_start() - intval($buffer) * 60
                    );
                    if (time() > $buffer_point) {
                        $cancel_error_message = get_option(
                            'wbk_booking_couldnt_be_canceled2',
                            ''
                        );
                        $title .= ' - ' . esc_html($cancel_error_message);
                        $title_all[] = $title;
                        continue;
                    }
                }
            }
            // end check buffer
            $valid_items++;
            $title_all[] = $title;
            $booking_ids[] = $booking_id;
            $tokens[] = $booking->get('token');
        }
        $title = implode('<br>', $title_all);

        if ($valid_items == 0) {
            WBK_Renderer::load_template('frontend_v5/webba5_form_container', [
                null,
                get_option(
                    'wbk_booking_couldnt_be_canceled2',
                    __(
                        'Sorry, you can not cancel because you have exceeded the time allowed to do so.',
                        'webba-booking-lite'
                    )
                ),
            ]);
            return;
        }

        $templates = [
            'frontend_v5/cancellation_form' => [$valid_items, $title, $tokens],
        ];
        $scenario[] = [
            'title' => esc_html(
                get_option(
                    'wbk_booking_cancel_form_title',
                    __('Cancellation', 'webba-booking-lite')
                )
            ),
            'slug' => 'link_cancellation',
            'templates' => $templates,
            'request' => 'wbk_approve_payment',
        ];
        $scenario[] = [
            'slug' => 'final_screen',
            'request' => 'wbk_cancel_appointment',
        ];
        WBK_Renderer::load_template(
            'frontend_v5/webba5_form_container',
            [$scenario],
            true
        );
        return;
    }
}

if (isset($_GET['order_payment'])) {
    $order_payment = $_GET['order_payment'];
    $order_payment = WBK_Validator::get_param_sanitize($order_payment);
    $booking_ids = WBK_Model_Utils::get_booking_ids_by_group_token(
        $order_payment
    );

    $found_valid_bookings = 0;
    if (count($booking_ids) > 0) {
        $title = [];
        foreach ($booking_ids as $booking_id) {
            $booking = new WBK_Booking($booking_id);
            if (!$booking->is_loaded()) {
                continue;
            }
            $valid = true;
            if (
                $booking->get('status') != 'paid' &&
                $booking->get('status') != 'paid_approved' &&
                $booking->get('status') != 'woocommerce'
            ) {
                $title_this = get_option('wbk_appointment_information', '');
                $title_this = WBK_Placeholder_Processor::process_placeholders(
                    $title_this,
                    [$booking_id]
                );
                $title[] = $title_this;
                $found_valid_bookings++;
            }
        }
        $title = implode('<br>', $title);
        if ($found_valid_bookings == 0) {
            $title = esc_html(get_option('wbk_nothing_to_pay_message', ''));
        }
    }

    if ($found_valid_bookings > 0) {
        $payment_methods = WBK_Model_Utils::get_payment_methods_for_bookings_intersected(
            $booking_ids
        );
        if (count($payment_methods) > 0) {
            $tax = get_option('wbk_general_tax', '0');
            if (trim($tax) == '') {
                $tax = '0';
            }
            $payment_details = WBK_Price_Processor::get_payment_items(
                $booking_ids,
                $tax
            );
            $payment_card = WBK_Renderer::load_template(
                'frontend_v5/payment_card',
                [$payment_details, $booking_ids],
                false
            );
            if (get_option('wbk_allow_coupons') == 'enabled') {
                $coupon_field = WBK_Renderer::load_template(
                    'frontend_v5/coupon_field',
                    [$payment_details],
                    false
                );
            } else {
                $coupon_field = '';
            }
            $payment_methods_html = WBK_Renderer::load_template(
                'frontend_v5/payment_methods',
                [$payment_methods],
                false
            );
            $templates = [
                'frontend_v5/payment_card' => [$payment_details, $booking_ids],
            ];
            if (get_option('wbk_allow_coupons') == 'enabled') {
                $templates['frontend_v5/coupon_field'] = [$payment_details];
            }
            $templates['frontend_v5/payment_methods'] = [$payment_methods];
            $result = [
                'thanks_message' =>
                    $payment_card . $coupon_field . $payment_methods_html,
            ];
            $scenario[] = [
                'title' => esc_html__('Payment', 'webba-booking-lite'),
                'slug' => 'link_payment',
                'templates' => $templates,
                'request' => 'wbk_approve_payment',
            ];

            $scenario[] = [
                'slug' => 'final_screen',
                'request' => 'wbk_approve_payment',
            ];

            WBK_Renderer::load_template(
                'frontend_v5/webba5_form_container',
                [$scenario],
                true
            );
            return;
        }
    }

    WBK_Renderer::load_template(
        'frontend_v5/webba5_form_container',
        [null, get_option('wbk_nothing_to_pay_message', '')],
        true
    );
    return;
}

if (isset($_GET['pp_aprove']) && wbk_is5()) {
    $message = '';
    if ($_GET['pp_aprove'] == 'true') {
        if (isset($_GET['paymentId']) && isset($_GET['PayerID'])) {
            $paymentId = $_GET['paymentId'];
            $PayerID = $_GET['PayerID'];
            $paypal = new WBK_PayPal();
            $booking_ids = WBK_Model_Utils::get_booking_ids_by_payment_id(
                $paymentId
            );
            $init_result = $paypal->init(false, $booking_ids);
            $status = false;
            if ($init_result === false) {
                $status = false;
                $messsage = 'PayPal error 1';
            } else {
                $execResult = $paypal->execute_payment($paymentId, $PayerID);
                if ($execResult === false) {
                    $messsage = 'PayPal error 2';
                } else {
                    $pp_redirect_url = trim(
                        get_option('wbk_paypal_redirect_url', '')
                    );
                    if ($pp_redirect_url != '') {
                        if (
                            filter_var(
                                $pp_redirect_url,
                                FILTER_VALIDATE_URL
                            ) !== false
                        ) {
                            wp_redirect($pp_redirect_url);
                            exit();
                        }
                    }
                    $messsage = WBK_Renderer::load_template(
                        'frontend_v5/thank_you_message',
                        [$booking_ids],
                        false
                    );
                }
            }
        } else {
            $messsage = 'PayPal error 4';
        }
    } elseif ($_GET['pp_aprove'] == 'false') {
        $message = 'Payment cancelled';//, 'webba-booking-lite');
        if (isset($_GET['cancel_token'])) {
            $cancel_token = $_GET['cancel_token'];
            $cancel_token = str_replace('"', '', $cancel_token);
            $cancel_token = str_replace('<', '', $cancel_token);
            $cancel_token = str_replace('\'', '', $cancel_token);
            $cancel_token = str_replace('>', '', $cancel_token);
            $cancel_token = str_replace('/', '', $cancel_token);
            $cancel_token = str_replace('\\', '', $cancel_token);
            WBK_Db_Utils::clearPaymentIdByToken($cancel_token);
        }


    }
    echo WBK_Renderer::load_template(
        'frontend_v5/webba5_form_container',
        [null, $message],
        false
    );
}

date_default_timezone_set('UTC');
echo $html;
?>