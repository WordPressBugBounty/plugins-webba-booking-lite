<?php
if (!defined('ABSPATH')) {
    exit();
}
date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
$timeslot = $data[0];
$service_id = $data[1];
$locked_time_slots = $data[2];
$is_new = false;

$timeslot->is_duplicated = false;
$service = new WBK_Service($service_id);
$html_schedule = '';

if (
    $service->get_quantity() == 1 &&
    $timeslot->get_free_places() == 0 &&
    $timeslot->get_status() == 0
) {
    $timeslot->set_status(-2);
}
$time = $timeslot->get_formated_time_backend();
$status_class = '';
$time_controls = '';

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
        $slot_title = WBK_Placeholder_Processor::process_placeholders(get_option('wbk_backend_calendar_booking_text', '#customer_name [#service_name]'), $booking->get_id());
        $time_controls .=
            '<a class="wbk-appointment-backend" id="wbk_appointment_' .
            esc_attr($booking_id) .
            '_' .
            esc_attr($service_id) .
            '_1" >' .
            esc_html(
                str_replace(
                    '&#039;',
                    "'",
                    stripslashes(
                        $slot_title
                    )
                )
            ) .
            '</a>';
    }
}

if ($timeslot->get_status() > 0 && !is_array($timeslot->get_status())) {
    $booking_ids = WBK_Model_Utils::get_booking_ids_by_service_and_time(
        $service_id,
        $timeslot->get_start()
    );
    $time_controls = '';
    if ($booking_ids) {
        foreach ($booking_ids as $booking_id) {
            $booking = new WBK_Booking($booking_id);
            if (!$booking->is_loaded()) {
                continue;
            }
            $slot_title = WBK_Placeholder_Processor::process_placeholders(get_option('wbk_backend_calendar_booking_text', '#customer_name [#service_name]'), $booking->get_id());
            $time_controls .=
                '<a class="wbk-appointment-backend" id="wbk_appointment_' .
                esc_attr($booking_id) .
                '_' .
                esc_attr($service_id) .
                '_1" >' .
                esc_html(
                    str_replace(
                        '&#039;',
                        "'",
                        stripslashes(
                            $slot_title
                        )
                    )
                ) .
                '</a>';
        }
    }
}

$time_controls = apply_filters(
    'wbk_backend_schedule_time_controls',
    $time_controls,
    $timeslot,
    $service_id
);

if ($timeslot->get_status() != 0) {
    $booking_ids = WBK_Model_Utils::get_booking_ids_by_service_and_time(
        $service_id,
        $timeslot->get_start()
    );
    if ($booking_ids) {
        foreach ($booking_ids as $booking_id) {
            $booking = new WBK_Booking($booking_id);

            $time_range =
                wp_date(
                    get_option('time_format'),
                    $booking->get_start(),
                    new DateTimeZone(date_default_timezone_get())
                ) . '   ';
            // $time_range .= ' - ' .  wp_date( get_option('time_format'), $booking->get_end(), new DateTimeZone( date_default_timezone_get() ) ) . ' ';
            $slot_title = WBK_Placeholder_Processor::process_placeholders(get_option('wbk_backend_calendar_booking_text', '#customer_name [#service_name]'), $booking->get_id());
            $timeslot->title =
                $time_range .
                str_replace(
                    '&#039;',
                    "'",
                    stripslashes(
                        $slot_title
                    )
                );

            if (!$booking->is_loaded()) {
                continue;
            }
            if (count($booking_ids) > 1) {
                $timeslot->is_duplicated = true;
                $html_schedule .= '<div class="fc-duplicated-event">';
            }
            if ($is_new || count($booking_ids) > 1) {
                $slot_title = WBK_Placeholder_Processor::process_placeholders(get_option('wbk_backend_calendar_booking_text', '#customer_name [#service_name]'), $booking->get_id());
                $html_schedule .=
                    '<div class="fc-event-main-frame">
                                <div class="fc-event-title-container">
                                    <div class="fc-event-title fc-sticky">' .
                    $time_range .
                    esc_html(
                        str_replace(
                            '&#039;',
                            "'",
                            $slot_title
                        )
                    ) .
                    '</div>
                                </div>
                            </div>';
            }
            if ($service->get_quantity() > 1) {
                $quantity = ' (' . $booking->get_quantity() . ')';
            } else {
                $quantity = '';
            }
            $slot_title = WBK_Placeholder_Processor::process_placeholders(get_option('wbk_backend_calendar_booking_text', '#customer_name [#service_name]'), $booking->get_id());

            $html_schedule .=
                '<div class="event-popover-wb">
                                    <div class="popover-title-wb">' .
                esc_html(
                    str_replace(
                        '&#039;',
                        "'",
                        $slot_title
                    ) . $quantity
                ) .
                '</div>
                                    <div class="popover-time-wb">' .
                date(get_option('time_format'), $timeslot->start) .
                '-' .
                date(get_option('time_format'), $timeslot->end) .
                '</div>
                                    <div class="popover-time-wb">' .
                $booking->get('description') .
                '</div>
                                    <div class="popover-service-wb">' .
                $service->get('name') .
                '</div>
                                   
                                    <div class="popover-footer-wb">
                                        <div class="popover-name-letter-wb">' .
                mb_substr(
                    str_replace(
                        '&#039;',
                        "'",
                        stripslashes($booking->get_name())
                    ),
                    0,
                    1
                ) .
                '</div>
                                        <div class="popover-name-wb">' .
                esc_html(
                    str_replace(
                        '&#039;',
                        "'",
                        stripslashes($booking->get_name())
                    )
                ) .
                '</div>' .
                '<div class="popover-edit-wb wbk-appointment-backend" id="wbk_appointment_' .
                esc_attr($booking_id) .
                '_' .
                esc_attr($service_id) .
                '_1" data-timeslot-timestamp="' .
                $timeslot->start .
                '"></div>' .
                '</div>
                               </div>';
            if (count($booking_ids) > 1) {
                $html_schedule .= '</div>';
            }
        }
    }
} else {
    $html_schedule .=
        '<div class="timeslot_container" data-timeslot-timestamp="' .
        $timeslot->start .
        '">
                            <div class="timeslot_time ' .
        $status_class .
        '">' .
        $time .
        '</div>
                            <div class="timeslot_controls">' .
        $time_controls .
        '
                            </div>
                        </div>';
}

echo $html_schedule;
