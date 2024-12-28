<?php
if (!defined('ABSPATH'))
    exit;
$booking_ids = $data[0];
if (count($booking_ids) == 0) {
    $valid = false;
    $content = '';
    $title = get_option('wbk_email_landing_text_invalid_token', '');
} else {
    $valid = true;
    $title = '';
    foreach ($booking_ids as $booking_id) {
        $booking = new WBK_Booking($booking_id);
        if (!$booking->is_loaded()) {
            continue;
        }
        $title_this = get_option('wbk_appointment_information', '');
        $title .= WBK_Placeholder_Processor::process_placeholders($title_this, $booking_id);
    }
    // prepare and render auth url
    $google = new WBK_Google();
    if ($google->init(null) !== TRUE) {
        $valid = false;
    }
    $auth_url = $google->get_auth_url();
    $link_text = get_option('wbk_add_gg_button_text', 'Add to my Google Calendar');
    $content = '<input type="button" class="wbk-button wbk-width-100 wbk-addgg-link" data-link="' . esc_url($auth_url) . '" value="' . esc_html($link_text) . '"	>';
}
?>
<div class="wbk-outer-container wbk_booking_form_container">
    <div class="wbk-inner-container">
        <div class="wbk-frontend-row">
            <div class="wbk-col-12-12">
                <div class="input-label-wbk">
                    <?php echo $title . $content; ?>
                </div>
            </div>
        </div>
    </div>
</div>