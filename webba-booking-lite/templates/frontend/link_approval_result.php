<?php
if (!defined('ABSPATH'))
    exit;
$count = $data[0];
if (!is_numeric($count)) {
    return;
}
?>
<div class="wbk-outer-container wbk_booking_form_container">
    <div class="wbk-inner-container">
        <div class="wbk-frontend-row">
            <div class="wbk-col-12-12">
                <div class="input-label-wbk">
                    <?php
                    $message = esc_html(get_option('wbk_booking_approved_message_admin', __('Bookings approved: #count', 'webba-booking-lite')));
                    if ($count > 1) {
                        $count = '<span class="wbk_mutiple_counter">: ' . $count . '</span>';
                    } else {
                        $count = '';
                    }
                    echo str_replace('#count', $count, $message);
                    ?>
                </div>

            </div>
        </div>
    </div>
</div>