<?php
if (!defined('ABSPATH')) {
    exit();
}

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

// *** Free group time slot
if ($timeslot->get_free_places() > 0) {

    $sufix = '';
    if (get_option('wbk_multi_booking', '') == 'enabled') {
        $sufix = '_' . $timeslot->getStart() . '_' . $service->get_id();
    }
    ?>
    <li>
        <label>
            <input class="timeslot_radio-w" type="radio" name="day-<?php echo esc_attr(
                $day_to_render
            ) . $sufix; ?>">
            <span class="radio-time-block-w radio-time-block-w timeslot-animation-w">
                <span class="radio-time-inner-w">
                    <span class="radio-checkmark"></span>
                    <span class="time-w time-long-w" data-server-date="<?php echo esc_attr(
                        $date
                    ); ?>" data-local-date="<?php echo esc_attr(
                         $local_date
                     ); ?>" data-server-time="<?php echo esc_attr(
                          $time
                      ); ?>" data-local-time="<?php echo esc_attr(
                           $local_time
                       ); ?>" data-index="<?php echo esc_attr($index); ?>" data-start="<?php echo esc_attr(
                               $timeslot->getStart()
                           ); ?>" data-end="<?php echo esc_attr(
                                $timeslot->get_end()
                            ); ?>" data-service="<?php echo esc_html(
                                 $service->get_id()
                             ); ?>">
                        <span class="wbk_time_slot_time_string"><?php echo esc_html($time); ?></span>
                    </span>
                </span><!-- /.radio-time-inner-w -->
                <span class="available-w">
                    <img src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL .
                        '/public/images/'; ?>group-default-icon.png" alt="group" class="group-default-icon-w">
                    <img src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL .
                        '/public/images/'; ?>group-active-icon.png" alt="group" class="group-active-icon-w">
                    <?php echo esc_html(
                        get_option(
                            'wbk_available_label',
                            __('Available', 'webba-booking-lite')
                        )
                    ) .
                        ': ' .
                        $timeslot->get_free_places(); ?>
                </span>
                <?php if (
                    get_option('wbk_show_details_of_previous_bookings', '') ==
                    'true'
                ) { ?><span class="available-w">
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
                <?php do_action('wbk_group_time_slot_custom_html', $service->get_id(), $timeslot); ?>
            </span>
        </label>
    </li>
    <?php
} elseif (get_option('wbk_show_booked_slots', 'enabled') == 'enabled') { ?>
    <li>
        <label>
            <input class="timeslot_radio-w" type="radio" name="time-1" disabled="">
            <span class="radio-time-block-w timeslot-animation-w">
                <span class="radio-checkmark"></span>
                <span class="time-w time-long-w" data-server-date="<?php echo esc_attr(
                    $date
                ); ?>" data-local-date="<?php echo esc_attr(
                     $local_date
                 ); ?>" data-server-time="<?php echo esc_attr(
                      $time
                  ); ?>" data-local-time="<?php echo esc_attr(
                       $local_time
                   ); ?>" data-index="<?php echo esc_attr($index); ?>" data-start="<?php esc_attr(
                           $timeslot->getStart()
                       ); ?>" data-end="<?php echo esc_attr(
                            $timeslot->get_end()
                        ); ?>" data-service="<?php esc_html(
                             $service->get_id()
                         ); ?>">
                    <span class="wbk_time_slot_time_string"></span> <?php echo esc_html($time); ?></span>

            </span>
            <?php if (
                get_option('wbk_show_details_of_previous_bookings', '') ==
                'true'
            ) { ?><span class="available-w1">
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
                        echo '</br><span>' . $booking->get_name() .
                            ' ' .
                            $booking->get_custom_field_value('last_name') .
                            '</span>';
                    }
                    ?>
                </span>

            <?php } ?>
            <?php do_action('wbk_group_time_slot_custom_html'); ?>
            </span><!-- /.radio-time-block-w -->
        </label>
    </li>
<?php }
