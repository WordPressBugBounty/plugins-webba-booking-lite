<?php
if (!defined('ABSPATH')) {
    exit();
}

$timeslots = $data[0];
$service_id = $data[1];
$locked_time_slots = $data[2];

$service = new WBK_Service($service_id);

$html_schedule = '';
foreach ($timeslots as $timeslot) {
    $booking_details = '';
    if (
        $service->get_quantity() == 1 &&
        $timeslot->get_free_places() == 0 &&
        $timeslot->get_status() == 0
    ) {
        $timeslot->set_status(-2);
    }
    $time = $timeslot->get_formated_time_backend();
    $status_class = '';
    $time_controls =
        '<a id="app_add_' .
        esc_attr($service_id . '_' . $timeslot->getStart()) .
        '"><span class="dashicons dashicons-welcome-add-page"></span></a>';
    $time_controls .= WBK_Renderer::load_template(
        'backend/schedule_time_lock_link',
        [$service_id, $timeslot->get_start()],
        false
    );

    if (is_array($timeslot->get_status())) {
        $time_controls = '';
        $items_booked = 0;

        foreach ($timeslot->get_status() as $booking_id) {
            $booking = new WBK_Booking($booking_id);
            if (!$booking->is_loaded()) {
                continue;
            }
            $items_booked += $booking->get_quantity();
            $time_controls .=
                '<a data-id="' . esc_html($booking->get_id()) . '" class="wbk-appointment-backend wbk_backend_calends_sht_booking">' .
                esc_html($booking->get_name()) .
                ' </a>';
            $booking_details .= '<div data-id="' . esc_html($booking->get_id()) . '" style="display:none" class="wbk_backend_calendar_booking_details">';
            $booking_details .= WBK_Placeholder_Processor::process_placeholders(get_option('wbk_backend_calendar_booking_text', '#customer_name [#service_name]'), $booking->get_id()) . '</br>';
            $booking_details .= $booking->get('email') . '</br>';
            if ($booking->get('phone')) {
                $booking_details .= $booking->get('phone') . '</br>';
            }
            $booking_details .= '</div>';
        }

        if (in_array($timeslot->get_start(), $locked_time_slots)) {
            $status_class = 'red_font';
            $time_controls .= WBK_Renderer::load_template(
                'backend/schedule_time_unlock_link',
                [$service_id, $timeslot->get_start()],
                false
            );
        } else {
            $time_controls .= WBK_Renderer::load_template(
                'backend/schedule_time_lock_link',
                [$service_id, $timeslot->get_start()],
                false
            );
        }
    }

    if (
        $timeslot->get_status() == -2 ||
        (in_array($timeslot->get_start(), $locked_time_slots) &&
            !is_array($timeslot->get_status()))
    ) {
        $status_class = 'red_font';
        $time_controls = WBK_Renderer::load_template(
            'backend/schedule_time_unlock_link',
            [$service_id, $timeslot->get_start()],
            false
        );
        $booking_ids = WBK_Model_Utils::get_booking_ids_by_service_and_time(
            $service_id,
            $timeslot->get_start()
        );

        foreach ($booking_ids as $booking_id) {
            $booking = new WBK_Booking($booking_id);
            if (!$booking->is_loaded()) {
                continue;
            }
            $time_controls .=
                '<a data-id="' . esc_html($booking->get_id()) . '" class="wbk-appointment-backend wbk_backend_calends_sht_booking">' .
                esc_html($booking->get_name()) .
                ' </a>';
            $booking_details .= '<div data-id="' . esc_html($booking->get_id()) . '" style="display:none" class="wbk_backend_calendar_booking_details">';
            $booking_details .= WBK_Placeholder_Processor::process_placeholders(get_option('wbk_backend_calendar_booking_text', '#customer_name [#service_name]'), $booking->get_id()) . '</br>';
            $booking_details .= $booking->get('email') . '</br>';
            if ($booking->get('phone')) {
                $booking_details .= $booking->get('phone') . '</br>';
            }
            $booking_details .= '</div>';
        }
    }

    if ($timeslot->get_status() > 0 && !is_array($timeslot->get_status())) {
        $booking_ids = WBK_Model_Utils::get_booking_ids_by_service_and_time(
            $service_id,
            $timeslot->get_start()
        );
        $time_controls = '';
        foreach ($booking_ids as $booking_id) {
            $booking = new WBK_Booking($booking_id);
            if (!$booking->is_loaded()) {
                continue;
            }
            $time_controls .=
                '<a data-id="' . esc_html($booking->get_id()) . '" class="wbk-appointment-backend wbk_backend_calends_sht_booking">' .
                esc_html($booking->get_name()) .
                ' </a>';
            $booking_details .= '<div data-id="' . esc_html($booking->get_id()) . '" style="display:none" class="wbk_backend_calendar_booking_details">';
            $booking_details .= WBK_Placeholder_Processor::process_placeholders(get_option('wbk_backend_calendar_booking_text', '#customer_name [#service_name]'), $booking->get_id()) . '</br>';
            $booking_details .= $booking->get('email') . '</br>';
            if ($booking->get('phone')) {
                $booking_details .= $booking->get('phone') . '</br>';
            }
            $booking_details .= '</div>';
        }
    }

    $time_controls = apply_filters(
        'wbk_backend_schedule_time_controls',
        $time_controls,
        $timeslot,
        $service_id
    );

    $html_schedule .=
        '<div class="timeslot_container">
                            <div class="timeslot_time ' .
        $status_class .
        '">' .
        $time .
        '</div>
                            <div class="timeslot_controls">' .
        $time_controls .
        '
                            </div>
                            <div class="cb"></div>' . $booking_details . '
                        </div>';
}

echo $html_schedule;
