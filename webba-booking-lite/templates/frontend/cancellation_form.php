<?php
if (!defined('ABSPATH'))
    exit;
$valid_items = $data[0];
$title = $data[1];
$tokens = $data[2];

if ($valid_items > 0) {
    $email_cancel_label = esc_html(get_option('wbk_booking_cancel_email_label', ''));
    $content = '<label class="input-label-wbk" for="wbk-customer_email">' . $email_cancel_label . '</label>';
    $content .= '<input name="wbk-email" class="wbk-input wbk-width-100 wbk-mb-10" id="wbk-customer_email" type="text">';
    $cancel_label = esc_html(get_option('wbk_cancel_button_text', ''));
    $content .= '<input class="wbk-button wbk-width-100 wbk-mt-10-mb-10" id="wbk-cancel_booked_appointment" data-appointment="' . esc_attr(implode('-', $tokens)) . '" value="' . esc_attr($cancel_label) . '" type="button">';
} else {
    $content = '';
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
        <div class="wbk-frontend-row" id="wbk-cancel-result">
        </div>
    </div>
</div>
<?php
date_default_timezone_set('UTC');
return;
