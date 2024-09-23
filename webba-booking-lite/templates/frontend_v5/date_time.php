<?php
if (!defined('ABSPATH'))
    exit;
if ($data[0] == true) {
    $hidden_class = ' wbk_hidden ';
} else {
    $hidden_class = '';
}
?>

<div class="field-row-w wbk_date_picked_row <?php echo $hidden_class; ?> ">
    <label><?php echo esc_html__(get_option('wbk_date_basic_label', 'Select date')); ?></label>
    <div class="styled-as-select-w">
        <input type="text" class="input-text-w wbk_date wbk-input" name="date_formated"
            placeholder="<?php echo esc_html__(get_option('wbk_date_input_placeholder', 'date')); ?>">
    </div>
    <?php
    if (wbk_is_multi_booking()) {
        ?>
        <div class="wbk_horizontal_calendar_container wbk_fade_out">
            <div class="calendar-horizontal-w" id="calendar-horizontal-w"></div>
        </div>
        <?php
    }
    ?>
</div>
<label class="checkbox-row-w one-row-w mb-30-w mt-30-w wbk_hidden wbk_local_time_switcher wbl_local_time_switcher">
    <span class="checkbox-custom-w">
        <input type="checkbox" class="wbk_local_time_checkbox" value="true" name="local_time_switcher">
        <span class="checkmark-w"></span>
    </span>
    <span class="checkbox-text-w">
        <span
            class="checkbox-title-w"><?php echo esc_html(get_option('wbk_local_time_label', __('Your local time', 'webba-booking-lite'))); ?></span>
    </span>
</label>

<?php
WBK_Renderer::load_template('frontend_v5/timeslots_selection', null);
if (get_option('wbk_multi_booking', '') == 'enabled') {
    $name_html = 'name="time[]"';
} else {
    $name_html = 'name="time"';
}
?>

<select multiple class="wbk-input wbk_times wbk_hidden" data-validation="must_have_items"
    data-validationmsg="<?php echo esc_html__('Please, select timeslot(s)', 'webba-booking-lite'); ?>"
    style="display:block" <?php echo $name_html; ?>>
</select>

<select multiple class="wbk-input wbk_services_final wbk_hidden" data-validation="must_have_items"
    data-validationmsg="<?php echo esc_html__('Please, select timeslot(s)', 'webba-booking-lite'); ?>"
    style="display:block" name="services[]">
</select>