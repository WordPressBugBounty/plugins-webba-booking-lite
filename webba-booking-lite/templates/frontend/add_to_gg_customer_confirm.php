<?php
if (!defined('ABSPATH'))
    exit;
$booking_ids = $data[0];
$adding_result = $data[1];
if (count($booking_ids) == 0) {
    $valid = FALSE;
} else {
    if ($adding_result > 0) {
        $title = get_option('wbk_gg_calendar_add_event_success', __('Booking data added to Google Calendar.', 'webba-booking-lite'));
    } else {

        $title = get_option('wbk_gg_calendar_add_event_canceled', __('Booking data not added to Google Calendar.', 'webba-booking-lite'));
    }
    $content = '';

    $valid = TRUE;
}

if ($valid == true) {
    ?>
    <div class="wbk-outer-container wbk_booking_form_container">
        <div class="wbk-inner-container">
            <div class="wbk-frontend-row">
                <div class="wbk-col-12-12">
                    <div class="wbk-input-label">
                        <?php echo $title . $content; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <?php
}
?>