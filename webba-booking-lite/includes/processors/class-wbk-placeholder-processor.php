<?php
if (!defined('ABSPATH')) {
    exit();
}
class WBK_Placeholder_Processor
{
    public static function process_placeholders($message, $bookings)
    {
        if (is_numeric($bookings)) {
            $booking = new WBK_Booking($bookings);
            if (!$booking->is_loaded()) {
                return $message;
            }

            $tax = get_option('wbk_general_tax', '0');
            if (trim($tax) == '') {
                $tax = '0';
            }
            $payment_details = WBK_Price_Processor::get_payment_items(
                [$bookings],
                $tax,
                null,
                false
            );
            $message = self::message_placeholder_processing_old(
                $message,
                $booking->get_id(),
                $booking->get_service(),
                $payment_details
            );
        } elseif (is_array($bookings)) {
            $price_format = get_option('wbk_payment_price_format', '$#price');
            $total_amount = WBK_Price_Processor::get_total_tax_fees($bookings);
            $total_amount = str_replace(
                '#price',
                number_format(
                    $total_amount,
                    get_option('wbk_price_fractional', '2'),
                    get_option('wbk_price_separator', '.'),
                    ''
                ),
                $price_format
            );

            $token_arr = [];
            $token_arr_admin = [];

            if (WBK_Validator::check_email_loop($message)) {
                $looped = self::get_string_between(
                    $message,
                    '[appointment_loop_start]',
                    '[appointment_loop_end]'
                );
                $looped_html = '';
                $start = '';
                $end = '';
                foreach ($bookings as $booking_id) {
                    $booking = new WBK_Booking($booking_id);
                    if (!$booking->is_loaded()) {
                        return $message;
                    }
                    if ($start == '') {
                        $start = $booking->get_start();
                    }
                    $end = $booking->get_end();
                    $token_arr[] = $booking->get('token');
                    $token_arr_admin[] = $booking->get('admin_token');
                    $looped_html .= self::message_placeholder_processing_old(
                        $looped,
                        $booking_id,
                        $booking->get_service()
                    );
                }
            } else {
                if (is_array($bookings) && count($bookings) > 0) {
                    $booking = new WBK_Booking($bookings[0]);
                    if (!$booking->is_loaded()) {
                        return $message;
                    }
                    return self::message_placeholder_processing_old(
                        $message,
                        $bookings[0],
                        $booking->get_service()
                    );
                } else {
                    return $message;
                }
            }

            $search_tag =
                '[appointment_loop_start]' . $looped . '[appointment_loop_end]';
            $message = str_replace($search_tag, $looped_html, $message);

            $date_format = WBK_Format_Utils::get_date_format();
            $time_format = WBK_Format_Utils::get_time_format();
            $timezone_to_use = WBK_Date_Time_Utils::convert_default_time_zone_to_utc(
                $start
            );

            $time_range =
                wp_date($time_format, $start, $timezone_to_use) .
                ' - ' .
                wp_date($time_format, $end, $timezone_to_use);
            $message = str_replace('#time_range', $time_range, $message);
            $message = str_replace(
                '#selected_count',
                count($bookings),
                $message
            );

            $token = '';
            $admin_token = '';
            if (count($token_arr) > 0) {
                $token = implode('-', $token_arr);
            }
            if (count($token_arr_admin) > 0) {
                $admin_token = implode('-', $token_arr_admin);
            }
            $booking = new WBK_Booking($booking_id);
            if (!$booking->is_loaded()) {
                return $message;
            }
            $tax = get_option('wbk_general_tax', '0');
            if (trim($tax) == '') {
                $tax = '0';
            }
            $payment_details = WBK_Price_Processor::get_payment_items(
                $bookings,
                $tax,
                null,
                false
            );
            $message = self::message_placeholder_processing_old(
                $message,
                $booking_id,
                $booking->get_service(),
                $payment_details,
                $token,
                $admin_token
            );
        }
        return stripslashes($message);
    }
    public static function process_not_booked_item_placeholders(
        $service_ids,
        $times,
        $category_id
    ) {
        $date_format = WBK_Format_Utils::get_date_format();
        $time_format = WBK_Format_Utils::get_time_format();
        $time_zone_client = $_POST['time_zone_client'];
        $form_label_initial = explode(
            '[split]',
            html_entity_decode(
                html_entity_decode(get_option('wbk_form_label', ''))
            )
        );

        if (count($form_label_initial) == 2) {
            $html =
                '<div class="wbk-details-sub-title">' .
                $form_label_initial[0] .
                '</div>';
            /*fix */
            $html = str_replace(
                '#total_amount',
                '<span class="wbk_form_label_total"></span>',
                $html
            );
            $repeatable_part = $form_label_initial[1];
        } else {
            $html = '';
            $repeatable_part = $form_label_initial[0];
            $html = str_replace(
                '#total_amount',
                '<span class="wbk_form_label_total"></span>',
                $html
            );
        }

        $times_by_service = [];
        for ($i = 0; $i < count($service_ids); $i++) {
            $times_by_service[$service_ids[$i]][] = $times[$i];
        }

        $service_ids = array_unique($service_ids);

        if ($category_id == 0) {
            $category = '';
        } else {
        }

        $html = '';

        foreach ($service_ids as $service_id) {
            $form_label = $repeatable_part;
            $service = new WBK_Service($service_id);

            $form_label = str_replace(
                '#service',
                $service->get_name(),
                $form_label
            );
            $price_format = get_option('wbk_payment_price_format', '$#price');
            $price = str_replace(
                '#price',
                number_format(
                    $service->get_price(),
                    get_option('wbk_price_fractional', '2'),
                    get_option('wbk_price_separator', '.'),
                    ''
                ),
                $price_format
            );
            $form_label = str_replace('#price', $price, $form_label);

            $form_label = str_replace(
                '#description',
                $service->get_description(),
                $form_label
            );

            $date_collect = [];
            $time_collect = [];
            $datetime_collect = [];
            $datetime_n_collect = [];
            $datetimerange_n_collect = [];
            $time_local_collect = [];
            $date_local_collect = [];
            $date_n_collect = [];
            $datetime_local_collect = [];

            $start = 2554146984;
            $end = 0;
            $start_local = 2554146984;
            $end_local = 0;

            $times_this = $times_by_service[$service_id];

            foreach ($times_this as $time) {
                $correction = 0;
                if (WBK_Date_Time_Utils::is_correction_needed($time)) {
                    $correction = -3600;
                }
                //$timezone =  new DateTimeZone( get_option( 'wbk_timezone', 'UTC' ) );
                $timezone = WBK_Time_Math_Utils::get_utc_offset_by_time($time);
                $current_offset =
                    WBK_Time_Math_Utils::get_offset_differnce_with_local(
                        $time
                    ) * 60;

                $cur_start = $time;
                $cur_end = $cur_start + $service->get_duration() * 60;
                $time += $correction;

                if ($cur_start < $start) {
                    $start = $cur_start;
                    $start_local = $start + $current_offset;
                }
                if ($cur_end > $end) {
                    $end = $cur_end;
                    $end_local = $end + $current_offset;
                }

                $end_this = $time + $service->get_duration() * 60;

                $date_collect[] = esc_html(
                    wp_date(
                        $date_format,
                        $time,
                        new DateTimeZone(date_default_timezone_get())
                    )
                );
                $time_collect[] = esc_html(
                    wp_date(
                        $time_format,
                        $time,
                        new DateTimeZone(date_default_timezone_get())
                    )
                );
                $time_local_collect[] = esc_html(
                    wp_date(
                        $time_format,
                        $time + $current_offset,
                        new DateTimeZone(date_default_timezone_get())
                    )
                );
                $date_local_collect[] = esc_html(
                    wp_date(
                        $date_format,
                        $time + $current_offset,
                        new DateTimeZone(date_default_timezone_get())
                    )
                );
                $datetime_collect[] =
                    esc_html(
                        wp_date(
                            $date_format,
                            $time,
                            new DateTimeZone(date_default_timezone_get())
                        )
                    ) .
                    ' ' .
                    esc_html(
                        wp_date(
                            $time_format,
                            $time,
                            new DateTimeZone(date_default_timezone_get())
                        )
                    );
                $datetime_local_collect[] =
                    wp_date(
                        $date_format,
                        $time + $current_offset,
                        new DateTimeZone(date_default_timezone_get())
                    ) .
                    ' ' .
                    esc_html(
                        wp_date(
                            $time_format,
                            $time + $current_offset,
                            new DateTimeZone(date_default_timezone_get())
                        )
                    );
                $datetime_n_collect[] =
                    '<br>' .
                    esc_html(
                        wp_date(
                            $date_format,
                            $time,
                            new DateTimeZone(date_default_timezone_get())
                        )
                    ) .
                    ' ' .
                    esc_html(
                        wp_date(
                            $time_format,
                            $time,
                            new DateTimeZone(date_default_timezone_get())
                        )
                    );
                $datetimerange_n_collect[] =
                    '<br>' .
                    esc_html(
                        wp_date(
                            $date_format,
                            $time,
                            new DateTimeZone(date_default_timezone_get())
                        )
                    ) .
                    '   ' .
                    esc_html(
                        wp_date(
                            $time_format,
                            $time,
                            new DateTimeZone(date_default_timezone_get())
                        )
                    ) .
                    ' - ' .
                    esc_html(
                        wp_date(
                            $time_format,
                            $end_this,
                            new DateTimeZone(date_default_timezone_get())
                        )
                    );
                $date_n_collect[] =
                    '<br>' .
                    esc_html(
                        wp_date(
                            $date_format,
                            $time,
                            new DateTimeZone(date_default_timezone_get())
                        )
                    );
            }

            $time_range =
                esc_html(
                    wp_date(
                        $time_format,
                        $start,
                        new DateTimeZone(date_default_timezone_get())
                    )
                ) .
                ' - ' .
                esc_html(
                    wp_date(
                        $time_format,
                        $end,
                        new DateTimeZone(date_default_timezone_get())
                    )
                );
            $local_time_range =
                esc_html(
                    wp_date(
                        $time_format,
                        $start_local,
                        new DateTimeZone(date_default_timezone_get())
                    )
                ) .
                ' - ' .
                esc_html(
                    wp_date(
                        $time_format,
                        $end_local,
                        new DateTimeZone(date_default_timezone_get())
                    )
                );
            $single_start_date = esc_html(
                wp_date(
                    $date_format,
                    $start,
                    new DateTimeZone(date_default_timezone_get())
                )
            );

            $form_label = str_replace(
                '#date',
                implode(', ', $date_collect),
                $form_label
            );
            $form_label = str_replace(
                '#time',
                implode(', ', $time_collect),
                $form_label
            );
            $form_label = str_replace(
                '#local',
                implode(', ', $time_local_collect),
                $form_label
            );
            $form_label = str_replace(
                '#dlocal',
                implode(', ', $date_local_collect),
                $form_label
            );
            $form_label = str_replace(
                '#dt',
                implode(', ', $datetime_collect),
                $form_label
            );
            $form_label = str_replace(
                '#drt',
                implode('', $datetime_n_collect),
                $form_label
            );
            $form_label = str_replace(
                '#dre',
                implode('', $datetimerange_n_collect),
                $form_label
            );
            $form_label = str_replace(
                '#dlt',
                implode(', ', $datetime_local_collect),
                $form_label
            );
            $form_label = str_replace(
                '#dnl',
                implode('', $date_n_collect),
                $form_label
            );
            $form_label = str_replace('#range', $time_range, $form_label);
            $form_label = str_replace(
                '#lrange',
                $local_time_range,
                $form_label
            );
            $form_label = str_replace('#sd', $single_start_date, $form_label);

            $category_name = '';
            if ($category_id != 0) {
                $category = new WBK_Service_Category($category_id);
                if ($category->is_loaded()) {
                    $category_name = $category->get_name();
                }
            }
            $form_label = str_replace('#category', $category_name, $form_label);

            $form_label = str_replace(
                '#total_amount',
                '<span class="wbk_form_label_total"></span>',
                $form_label
            );
            if (is_array($time)) {
                $form_label = str_replace(
                    '#selected_count',
                    count($time),
                    $form_label
                );
            }
            if (get_option('wbk_mode', 'webba5') != 'webba5') {
                $html .=
                    '<div class="wbk-details-sub-title">' .
                    $form_label .
                    ' </div>';
            } else {
                $html = $form_label;
            }
        }
        return $html;
    }

    public static function get_string_between($string, $start, $end)
    {
        $string = ' ' . $string;
        $ini = strpos($string, $start);
        if ($ini == 0) {
            return '';
        }
        $ini += strlen($start);
        $len = strpos($string, $end, $ini) - $ini;
        return substr($string, $ini, $len);
    }

    public static function message_placeholder_processing_old(
        $message,
        $booking_id,
        $service_id,
        $payment_details = null,
        $multi_token = null,
        $multi_token_admin = null
    ) {

        $booking = new WBK_Booking($booking_id);
        if (!$booking->is_loaded()) {
            return;
        }
        $service = new WBK_Service($service_id);
        if (!$service->is_loaded()) {
            return;
        }
        $current_category = $booking->get('service_category');
        $timezone_to_use = WBK_Date_Time_Utils::convert_default_time_zone_to_utc(
            $booking->get_start()
        );

        $correction = 0;
        if (WBK_Date_Time_Utils::is_correction_needed($booking->get_start())) {
            $correction = -3600;
        }

        $date_format = WBK_Format_Utils::get_date_format();
        $time_format = WBK_Format_Utils::get_time_format();

        // Zoom placeholders
        $booking = new WBK_Booking($booking_id);
        if (
            !is_null($booking->get('zoom_meeting_url')) &&
            $booking->get('zoom_meeting_url') != ''
        ) {
            $zoom_url =
                '<a href="' .
                esc_attr($booking->get('zoom_meeting_url')) .
                '" target="_blank" rel="noopener">' .
                esc_html(
                    get_option(
                        'wbk_zoom_link_text',
                        'Click here to open your meeting in Zoom'
                    )
                ) .
                '</a>';
            $zoom_pass = $booking->get('zoom_meeting_pwd');
            $zoom_meeting_id = $booking->get('zoom_meeting_id');
        } else {
            $zoom_url = '';
            $zoom_pass = '';
            $zoom_meeting_id = '';
        }
        $message = str_replace('amp;', '', $message);

        $message = str_replace('#zoom_url', $zoom_url, $message);
        $message = str_replace('#zoom_pass', $zoom_pass, $message);
        $message = str_replace('#zoom_meeting_id', $zoom_meeting_id, $message);

        $message = str_replace('#admin_token', $booking->get('admin_token'), $message);
        $message = str_replace('#token', $booking->get('token'), $message);

        // processing links for payment, cancelation and google event addings
        $payment_link_url = get_option('wbk_email_landing', '');
        $payment_link_text = get_option('wbk_email_landing_text', '');
        $cancel_link_text = get_option('wbk_email_landing_text_cancel', '');
        $gg_add_link_text = get_option(
            'wbk_email_landing_text_gg_event_add',
            __(
                'Click here to add this event to your Google Calendar.',
                'webba-booking-lite'
            )
        );

        $payment_link = '';
        $cancel_link = '';
        $gg_add_link = '';
        $payment_token = '';
        if ($payment_link_url != '') {
            if ($multi_token == null) {
                $token = $booking->get('token');
                if (
                    $booking->get('status') == 'pending' ||
                    $booking->get('status') == 'approved'
                ) {
                    $payment_token = $token;
                }
            } else {
                $token = $multi_token;
                $payment_token = $token;
            }
            if ($token != false) {
                if ($payment_token != '') {
                    $payment_link =
                        '<a target="_blank" target="_blank" href="' .
                        esc_url($payment_link_url) .
                        '?order_payment=' .
                        esc_html($payment_token) .
                        '">' .
                        trim(esc_html($payment_link_text)) .
                        '</a>';
                } else {
                    $payment_link = '';
                }
                $cancel_link =
                    '<a target="_blank" target="_blank" href="' .
                    esc_url($payment_link_url) .
                    '?cancelation=' .
                    esc_html($token) .
                    '">' .
                    trim(esc_html($cancel_link_text)) .
                    '</a>';
                $gg_add_link =
                    '<a target="_blank" target="_blank" href="' .
                    esc_url($payment_link_url) .
                    '?ggeventadd=' .
                    esc_html($token) .
                    '">' .
                    trim(esc_html($gg_add_link_text)) .
                    '</a>';
            }
        }
        // end landing for payment
        // begin admin management links
        $admin_cancel_link = '';
        $admin_approve_link = '';
        $admin_cancel_link_text = get_option(
            'wbk_email_landing_text_cancel_admin',
            __('Click here to cancel this booking.', 'webba-booking-lite')
        );
        $admin_approve_link_text = get_option(
            'wbk_email_landing_text_approve_admin',
            __('Click here to approve this booking.', 'webba-booking-lite')
        );
        if (get_option('wbk_allow_manage_by_link', 'no') == 'yes') {
            if ($payment_link_url != '') {
                if ($multi_token_admin == null) {
                    $token = $booking->get('admin_token');
                } else {
                    $token = $multi_token_admin;
                }
                if ($token != false) {
                    $admin_cancel_link =
                        '<a target="_blank" target="_blank" href="' .
                        esc_url($payment_link_url) .
                        '?admin_cancel=' .
                        esc_html($token) .
                        '">' .
                        trim(esc_html($admin_cancel_link_text)) .
                        '</a>';
                    $admin_approve_link =
                        '<a target="_blank" target="_blank" href="' .
                        esc_url($payment_link_url) .
                        '?admin_approve=' .
                        esc_html($token) .
                        '">' .
                        trim(esc_html($admin_approve_link_text)) .
                        '</a>';
                }
            }
        }
        // end admin management links
        // begin total amount
        // processing discounts (coupons)
        $coupon_id = $booking->get('coupon');
        $discount_data = null;
        if (is_numeric($coupon_id) && $coupon_id > 0) {
            $coupon = new WBK_Coupon($coupon_id);
            if (!$coupon->is_loaded()) {
                $discount_data = [
                    $coupon->get('amount_fixed'),
                    $coupon->get('amount_percentage'),
                ];
                $coupon_name = $coupon->get('name');
            } else {
                $coupon_name = '';
            }
        } else {
            $coupon_name = '';
        }

        if (!is_null($payment_details)) {
            $tax_amount = WBK_Format_Utils::format_price(
                $payment_details['tax_to_pay']
            );
            $subtotal_amount = WBK_Format_Utils::format_price(
                $payment_details['subtotal']
            );
            $total_amount = WBK_Format_Utils::format_price(
                $payment_details['total']
            );
        } else {
            $subtotal_amount = '';
            $tax_amount = '';
            $total_amount = '';
        }
        // end total amount

        // beging extra data
        $extra_data = trim($booking->get('extra'));

        if (isset($extra_data) && $extra_data != '[]') {
            $custom_fields = json_decode($extra_data);
            if ($custom_fields != null) {
                foreach ($custom_fields as $custom_field) {
                    if (is_array($custom_field) && count($custom_field) == 3) {
                        $custom_placeholder = '#field_' . $custom_field[0];
                        $message = str_replace(
                            $custom_placeholder,
                            $custom_field[2],
                            $message
                        );
                    }
                }
            }
        }
        // end extra data
        $current_category_name = '';
        if (is_numeric($current_category) && $current_category > 0) {
            $category = new WBK_Service_Category($current_category);
            if ($category->is_loaded()) {
                $current_category_name = $category->get_name();
            }
        }
        $status = '';
        $status_list = WBK_Model_Utils::get_booking_status_list();
        if (isset($status_list[$booking->get('status')])) {
            $status = $status_list[$booking->get('status')];
        }
        $paymnent_method = $booking->get('payment_method');
        $short_token = $booking->get('token');

        if (strlen($short_token) >= 10) {
            $short_token = strtoupper(substr($short_token, 0, 10));
        } else {
            $short_token = '';
        }

        $created_on = $booking->get('created_on');

        $attachment = '';
        if (get_option('wbk_allow_attachemnt', 'no') == 'yes') {
            $attachment = $booking->get('attachment');
            if ($attachment !== '') {
                $attachment = json_decode($attachment);
                if (is_array($attachment)) {
                    $attachment = $attachment[0];
                    $parts = explode('wp-content', $attachment);
                    $attachment =
                        rtrim(site_url(), '/') .
                        '/wp-content/' .
                        ltrim($parts[1], '/');
                    $attachment =
                        '<a rel="noopener" target="_blank" href="' .
                        esc_url($attachment) .
                        '">' .
                        esc_html($attachment) .
                        '</a>';
                }
            }
        }

        $message = str_replace('#attachment', $attachment, $message);
        $message = str_replace('#coupon', $coupon_name, $message);

        $message = str_replace(
            '#service_description',
            $service->get_description(),
            $message
        );
        $message = str_replace(
            '#booked_on_date',
            wp_date($date_format, $created_on, $timezone_to_use),
            $message
        );
        $message = str_replace(
            '#booked_on_time',
            wp_date($time_format, $created_on, $timezone_to_use),
            $message
        );
        $message = str_replace('#uniqueid', $short_token, $message);
        $message = str_replace('#payment_method', $paymnent_method, $message);
        $message = str_replace('#user_ip', $booking->get('user_ip'), $message);
        $message = str_replace('#status', $status, $message);
        $message = str_replace('#cancel_link', $cancel_link, $message);
        $message = str_replace('#payment_link', $payment_link, $message);
        $message = str_replace('#add_event_link', $gg_add_link, $message);
        $message = str_replace(
            '#admin_cancel_link',
            $admin_cancel_link,
            $message
        );
        $message = str_replace(
            '#admin_approve_link',
            $admin_approve_link,
            $message
        );

        if ($booking->get('canceled_by') != false) {
            $message = str_replace(
                '#canceled_by',
                $booking->get('canceled_by'),
                $message
            );
        } else {
            $message = str_replace(
                '#canceled_by',
                __('no data', 'webba-booking-lite'),
                $message
            );
        }

        $message = str_replace('#total_amount', $total_amount, $message);
        $message = str_replace('#subtotal_amount', $subtotal_amount, $message);

        $message = str_replace('#tax_amount', $tax_amount, $message);
        $category_names = WBK_Model_Utils::get_category_names_by_service(
            $service->get_id()
        );
        $message = str_replace('#category_names', $category_names, $message);
        $message = str_replace(
            '#current_category_name',
            $current_category_name,
            $message
        );
        if (function_exists('pll__')) {
            $message = str_replace(
                '#service_name',
                pll__($service->get_name()),
                $message
            );
        } else {
            $message = str_replace(
                '#service_name',
                $service->get_name(),
                $message
            );
        }
        $message = str_replace('#duration', $service->get_duration(), $message);
        $message = str_replace(
            '#customer_name',
            $booking->get_name(),
            $message
        );

        $booking_start = $booking->get_start() + $correction;

        $message = str_replace(
            '#appointment_day',
            wp_date(
                $date_format,
                $booking->get_day() + $correction,
                $timezone_to_use
            ),
            $message
        );
        $message = str_replace(
            '#appointment_time',
            wp_date($time_format, $booking_start, $timezone_to_use),
            $message
        );

        $message = str_replace(
            '#appointment_local_time',
            wp_date($time_format, $booking->get_local_time(), $timezone_to_use),
            $message
        );
        $message = str_replace(
            '#appointment_local_date',
            wp_date($date_format, $booking->get_local_time(), $timezone_to_use),
            $message
        );
        $message = str_replace(
            '#customer_phone',
            $booking->get_phone(),
            $message
        );
        $message = str_replace(
            '#customer_email',
            $booking->get('email'),
            $message
        );
        $message = str_replace(
            '#customer_comment',
            $booking->get('description'),
            $message
        );
        $message = str_replace(
            '#items_count',
            $booking->get('quantity'),
            $message
        );
        $message = str_replace('#appointment_id', $booking->get_id(), $message);
        $message = str_replace(
            '#customer_custom',
            $booking->get_formated_extra(),
            $message
        );
        $time_range =
            wp_date(
                $time_format,
                $booking->get_start() + $correction,
                $timezone_to_use
            ) .
            ' - ' .
            wp_date(
                $time_format,
                $booking->get_start() +
                $correction +
                $service->get_duration() * 60,
                $timezone_to_use
            );

        $message = str_replace('#time_range', $time_range, $message);

        $message = str_replace(
            '#invoice_number',
            get_option('wbk_email_current_invoice_number', '1'),
            $message
        );
        $price_format = get_option('wbk_payment_price_format', '$#price');

        $one_slot_price = str_replace(
            '#price',
            number_format(
                $service->get_price(),
                get_option('wbk_price_fractional', '2'),
                get_option('wbk_price_separator', '.'),
                ''
            ),
            $price_format
        );
        $message = str_replace('#one_slot_price', $one_slot_price, $message);

        $moment_price = WBK_Format_Utils::price_to_float(
            $booking->get('moment_price')
        );
        $moment_price = str_replace(
            '#price',
            number_format(
                $moment_price,
                get_option('wbk_price_fractional', '2'),
                get_option('wbk_price_separator', '.'),
                ''
            ),
            $price_format
        );
        $message = str_replace('#appprice', $moment_price, $message);

        $user_dashboard_page_link = sprintf(
            '<a href="%s" target="_blank">%s</a>',
            esc_url(get_option('wbk_user_dashboard_page_link', '')),
            esc_html(get_option('wbk_user_dashboard_link_label', ''))
        );
        $message = str_replace('#dashboard_page', $user_dashboard_page_link, $message);

        $userdata = get_query_var('wbk_user_data', false);

        if ($userdata && is_array($userdata) && !empty($userdata)) {
            foreach ($userdata as $placeholder => $value) {
                $message = str_replace('#' . $placeholder, $value, $message);
            }
        }

        $dynamic_placehodlers = get_option('wbk_general_dynamic_placeholders');
        if ($dynamic_placehodlers != '') {
            $items = explode(',', $dynamic_placehodlers);
            if (is_array($items)) {
                foreach ($items as $item) {
                    $message = str_replace(trim($item), '', $message);
                }
            }
        }
        return $message;
    }

    public static function process($message, $bookings)
    {
        $current_time_zone = date_default_timezone_get();
        date_default_timezone_set(get_option('wbk_timezone', 'UTC'));

        $message = str_replace('#booking_order', self::process_order_placeholder($bookings), $message);

        if (get_option('wbk_multi_booking', '') == 'enabled') {
            $message = WBK_Placeholder_Processor::process_placeholders($message, $bookings);
        } else {
            $message = WBK_Placeholder_Processor::process_placeholders($message, $bookings[0]);
        }
        date_default_timezone_set($current_time_zone);
        return $message;
    }
    public static function process_order_placeholder($bookings)
    {
        $prev_timezone = date_default_timezone_get();
        date_default_timezone_set(
            get_option('wbk_timezone', 'UTC')
        );
        $rows = [];
        foreach ($bookings as $booking_id) {
            $booking = new WBK_Booking($booking_id);
            if (!$booking->is_loaded()) {
                continue;
            }
            $rows[] = self::message_placeholder_processing_old('#service_name #appointment_day #appointment_time', $booking_id, $booking->get_service());

        }
        date_default_timezone_set($prev_timezone);
        return implode("<br/>", $rows);
    }

    public static function process_agenda_placehoder($message, $bookings)
    {
        $agenda = '<table style="text-align:left;">';
        $agenda .=
            '<tr>
									  <th style="margin:0;background:#ccc;border:1px solid #fff;padding:5px;">' .
            __('Service', 'webba-booking-lite') .
            '</th>
									  <th style="margin:0;background:#ccc;border:1px solid #fff;padding:5px;">' .
            __('Time', 'webba-booking-lite') .
            '</th>
									  <th style="margin:0;background:#ccc;border:1px solid #fff;padding:5px;">' .
            __('Name', 'webba-booking-lite') .
            '</th>
									  <th style="margin:0;background:#ccc;border:1px solid #fff;padding:5px;">' .
            __('Email', 'webba-booking-lite') .
            '</th>
									  <th style="margin:0;background:#ccc;border:1px solid #fff;padding:5px;">' .
            __('Phone', 'webba-booking-lite') .
            '</th>
   								  	  <th style="margin:0;background:#ccc;border:1px solid #fff;padding:5px;">' .
            __('Places booked', 'webba-booking-lite') .
            '</th>
									  <th style="margin:0;background:#ccc;border:1px solid #fff;padding:5px;">' .
            __('Status', 'webba-booking-lite') .
            '</th>
									  <th style="margin:0;background:#ccc;border:1px solid #fff;padding:5px;">' .
            __('Additional information', 'webba-booking-lite') .
            '</th>
        </tr>';

        foreach ($bookings as $booking_id) {

            $booking = new WBK_Booking($booking_id);
            if (!$booking->is_loaded()) {
                continue;
            }

            $skip_status = ['pending', 'arrived'];
            if (in_array($status, $skip_status)) {
                continue;
            }

            $service = new WBK_Service($booking->get_service());
            if (!$service->is_loaded()) {
                continue;
            }

            $time_format = WBK_Date_Time_Utils::get_time_format();

            date_default_timezone_set(
                get_option('wbk_timezone', 'UTC')
            );
            $time_string = wp_date(
                $time_format,
                $booking->get_start(),
                new DateTimeZone(date_default_timezone_get())
            );
            date_default_timezone_set('UTC');

            $extra_data = trim($booking->get('extra'));
            $extra_content = '';
            if ($extra_data != '') {
                $extra = json_decode($extra_data);
                foreach ($extra as $item) {
                    if (count($item) != 3) {
                        continue;
                    }
                    $extra_content .=
                        $item[1] . ': ' . $item[2] . '. ';
                }
            }

            $status = $booking->get_status();

            $status_list = WBK_Model_Utils::get_booking_status_list();
            if (isset($status_list[$status])) {
                $status = $status_list[$status][0];
            } else {
                $status = '';
            }

            $agenda .=
                '<tr><td style="margin:0;border:1px solid #ccc;padding:5px;">' .
                $service->get_name() .
                '</td><td style="margin:0;border:1px solid #ccc;padding:5px;">' .
                $time_string .
                '</td><td style="margin:0;border:1px solid #ccc;padding:5px;">' .
                stripslashes($booking->get_name()) .
                '</td><td style="margin:0;border:1px solid #ccc;padding:5px;">' .
                $booking->get('email') .
                '</td><td style="margin:0;border:1px solid #ccc;padding:5px;">' .
                $booking->get('phone') .
                '</td><td style="margin:0;border:1px solid #ccc;padding:5px;">' .
                $booking->get_quantity() .
                '</td><td style="margin:0;border:1px solid #ccc;padding:5px;">' .
                $status .
                '</td><td style="margin:0;border:1px solid #ccc;padding:5px;">' .
                $extra_content .
                '</td></tr>';

        }

        $agenda .= '</table>';

        return str_replace('#tomorrow_agenda', $agenda, $message);
    }
}
