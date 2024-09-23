<?php
if (!defined('ABSPATH')) {
    exit;
}
/*
 * This file is part of Webba Booking plugin
 * (c) plugion.com <hello@plugion.org>


 */

$field = $data[0];
$slug = $data[1];
$ed = $field->get_extra_data();
$multiple = '';
$null_value = 'plugion_null';
$items = array();
if (isset($ed['multiple'])) {
    if ($ed['multiple'] == true) {
        $multiple = ' multiple';
    }
}
$default = ('' != $field->get_default_value()) || !empty($multiple) ? $field->get_default_value() : 'plugion_null';
$extra = $field->get_extra_data();

$null_string = __('Select option', 'webba-booking-lite');
if (isset($ed['null_value'])) {
    $keys = array_keys($ed['null_value']);
    $null_value = $keys[0];
    $null_string = $ed['null_value'][0];
}
?>
<div class="label-wb">
    <label for="<?php echo esc_attr($slug) ?>"><?php echo esc_attr($field->get_title()) ?></label>
    <?php if (!empty($extra['tooltip'])) { ?>
        <div class="help-popover-wb" data-js="help-popover-wb">
            <span class="help-icon-wb" data-js="help-icon-wb">?</span>
            <div class="help-popover-box-wb" data-js="help-popover-box-wb"><?php echo $extra['tooltip']; ?></div>
        </div>
    <?php } ?>
</div>
<div class="<?php echo $multiple ? 'custom-multiple-select-wb' : 'custom-select-wb'; ?>">
    <select id="<?php echo esc_attr($slug) ?>" name="<?php echo esc_attr($field->get_name()); ?>" <?php echo $multiple; ?> class="plugion_input plugion_input_select plugion_property_input" data-getter="select"
        data-validation="select" data-setter="select" data-default="<?php echo esc_attr($default); ?>" <?php echo !empty($multiple) ? ' data-placeholder="Select options"' : ''; ?>
        data-required="<?php echo esc_attr($field->get_required()); ?>">
        <?php if (isset($field->get_extra_data()['items'])) {
            $items = $field->get_extra_data()['items'];
        } elseif (isset($field->get_extra_data()['source'])) {
            $function = $field->get_extra_data()['source'];
            $items = $function();
        }
        if ($multiple == '') { ?>
            <option value="<?php echo esc_attr($null_value); ?>" selected><?php echo esc_attr($null_string); ?></option>
        <?php }
        foreach ($items as $key => $value) { ?>
            <option value="<?php echo esc_attr($key) ?>"><?php echo esc_attr($value) ?></option>
        <?php } ?>
    </select>
</div>