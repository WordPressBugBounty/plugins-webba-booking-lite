<?php
if (!defined('ABSPATH')) {
    exit();
}
$field = $data[0];
$slug = $data[1];
$time_format = get_option('wbk_time_format', 'g:i A');
if (strpos($time_format, 'a') != false || strpos($time_format, 'A') != false) {
    $time_format = 'ampm';
} else {
    $time_format = 'no_ampm';
}
$extra = $field->get_extra_data();
?>

<div class="new-service-content-item-wb active-wb" data-js-item="hours">
    <div class="business-hours-area-wb" data-js-business-hours-area>
        <div class="field-block-wb" data-js-business-hours-field-block>
            <div class="label-wb">
                <label><b><?php echo $field->get_title(); ?></b></label>
                <?php if (!empty($extra['tooltip'])) { ?>
                    <div class="help-popover-wb" data-js="help-popover-wb">
                        <span class="help-icon-wb" data-js="help-icon-wb">?</span>
                        <div class="help-popover-box-wb" data-js="help-popover-box-wb"><?php echo $extra[
                            'tooltip'
                        ]; ?></div>
                    </div>
                <?php } ?>
            </div>
            <input data-format="<?php echo esc_attr(
                $time_format
            ); ?>" data-setter="wbk_business_hours" data-getter="wbk_business_hours_v4" id="<?php echo esc_attr(
                 $slug
             ); ?>" name="<?php echo $field->get_name(); ?>" data-default="<?php echo $field->get_default_value(); ?>"
                class="plugion_input plugion_property_input" type="hidden" data-validation="wbk_business_hours" required
                data-required="<?php echo $field->get_required(); ?>">

            <div class="repeater">
                <div data-repeater-list="dow_availability">
                    <div data-repeater-item class="field-wrapper-wb business-hours-row-wb wbk_business_hours_group"
                        data-js-business-hours-row>
                        <div class="select-wrapper-wb">
                            <div class="custom-select-wb">
                                <select name="day_of_week" class="plugion_input_select wbk_bh_data_day"
                                    data-getter="select" data-validation="select" data-setter="select">
                                    <option data-number="7" value="7"><?php echo __(
                                        'Sunday',
                                        'webba-booking-lite'
                                    ); ?></option>
                                    <option selected data-number="1" value="1"><?php echo __(
                                        'Monday',
                                        'webba-booking-lite'
                                    ); ?></option>
                                    <option data-number="2" value="2"><?php echo __(
                                        'Tuesday',
                                        'webba-booking-lite'
                                    ); ?></option>
                                    <option data-number="3" value="3"><?php echo __(
                                        'Wednesday',
                                        'webba-booking-lite'
                                    ); ?></option>
                                    <option data-number="4" value="4"><?php echo __(
                                        'Thursday',
                                        'webba-booking-lite'
                                    ); ?></option>
                                    <option data-number="5" value="5"><?php echo __(
                                        'Friday',
                                        'webba-booking-lite'
                                    ); ?></option>
                                    <option data-number="6" value="6"><?php echo __(
                                        'Saturday',
                                        'webba-booking-lite'
                                    ); ?></option>
                                </select>
                            </div>
                        </div>

                        <div class="right-part-wb">
                            <div class="slider-wrapper-wb" data-js-slider-wrapper-wb>
                                <input type="text" value="9:00 AM - 12:15 PM" readonly
                                    class="slider-range-working-hours-time-wb" data-js-business-hours-time>
                                <div class="slider-range-working-hours-wb" data-js-business-hours-slider></div>
                            </div>
                            <div class="switcher on" data-js-toggle-business-hours></div>
                            <input type="hidden" name="status" value="active" data-js-status-business-hours />

                            <span data-repeater-delete class="delete-row-wb">
                                <img src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/close-icon2.png"
                                    alt="close">
                            </span>
                            <div class="plugion_input_container">
                                <input type="text" name="start" style="display:none"
                                    class="plugion_input_select wbk_bh_data_start" value="">
                                <input type="text" name="end" style="display:none"
                                    class="plugion_input_select wbk_bh_data_end" value="">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="add-time-interval-bock-wb">
                    <button type="button" data-repeater-create
                        class="wbk_repeater_add_btn button-wbkb button-light-wb">Add time interval</button>
                </div>
            </div>
        </div>


    </div>
</div>