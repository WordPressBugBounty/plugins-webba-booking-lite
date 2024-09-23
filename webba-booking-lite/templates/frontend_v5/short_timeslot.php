<?php
if (!defined('ABSPATH'))
    exit;

$day_to_render = $data[0];
$timeslot = $data[1];
$offset = $data[2];
$service = $data[3];
$timeslots = $data[4];
$index = $data[5];

$time = $timeslot->get_formated_time();
$local_time = $timeslot->get_formated_time_local();

$date = $timeslot->get_formated_date();
$local_date = $timeslot->get_formated_date_local();

$timeslot_html = '';
$slot_html = '';

// *** Free single time slot

if ($timeslot->get_status() == 0 && $timeslot->get_free_places() > 0) {
    $sufix = '';
    if (get_option('wbk_multi_booking', '') == 'enabled') {
        $sufix = '_' . $timeslot->getStart() . '_' . $service->get_id();
    }
    ?>
    <li>
        <label>
            <input class="timeslot_radio-w" type="radio" name="day-<?php echo esc_attr($day_to_render) . $sufix; ?>">
            <span class="radio-time-block-w timeslot-animation-w">
                <span class="radio-checkmark"></span>
                <span class="time-w" data-server-date="<?php echo esc_attr($date); ?>"
                    data-local-date="<?php echo esc_attr($local_date); ?>" data-server-time="<?php echo esc_attr($time); ?>"
                    data-local-time="<?php echo esc_attr($local_time); ?>"
                    data-start="<?php echo esc_attr($timeslot->getStart()); ?>"
                    data-end="<?php echo esc_attr($timeslot->get_end()); ?>" data-index="<?php echo esc_attr($index); ?>"
                    data-service="<?php echo esc_html($service->get_id()); ?>"><span
                        class="wbk_time_slot_time_string"><?php echo esc_html($time); ?></span>
                </span>
            </span>
        </label>
    </li>
    <?php
} elseif (get_option('wbk_show_booked_slots', 'enabled') == 'enabled') {
    ?>
    <li>
        <label>
            <input class="timeslot_radio-w" type="radio" name="time-1" disabled="">
            <span class="radio-time-block-w timeslot-animation-w">
                <span class="radio-checkmark"></span>
                <span data-server-date="<?php echo esc_attr($date); ?>"
                    data-local-date="<?php echo esc_attr($local_date); ?>" data-server-time="<?php echo esc_attr($time); ?>"
                    data-local-time="<?php echo esc_attr($local_time); ?>"
                    data-start="<?php esc_attr($timeslot->getStart()); ?>"
                    data-end="<?php echo esc_attr($timeslot->get_end()); ?>" data-index="<?php echo esc_attr($index); ?>"
                    data-service="<?php esc_html($service->get_id()); ?>"><span
                        class="wbk_time_slot_time_string"><?php echo esc_html($time); ?></span></span>
                <?php if (
                    get_option('wbk_show_details_of_previous_bookings', '') ==
                    'true'
                ) { ?><span style="width:100%; display:block;clear:both;text-decoration:underline;">
                        <?php
                        $booking_ids = WBK_Model_Utils::get_booking_ids_by_service_and_time(
                            $service->get_id(),
                            $timeslot->getStart()
                        );
                        foreach ($booking_ids as $booking_id) {
                            $booking = new WBK_Booking($booking_id);
                            if (!$booking->is_loaded()) {
                                continue;
                            }
                            echo $booking->get_name() .
                                ' ' .
                                $booking->get_custom_field_value('last_name') .
                                '</br>';
                        }
                        ?>
                    </span>

                <?php } ?>
            </span>
        </label>
    </li>
    <?php
}


