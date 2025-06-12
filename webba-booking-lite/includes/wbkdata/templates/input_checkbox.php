<?php
if (!defined('ABSPATH'))
    exit;

$field = $data[0];
$slug = $data[1];
$data = $field->get_extra_data();
$keys = array_keys($data);
$extra = $field->get_extra_data();
?>

<div class="plution_checkbox">
    <label for="<?php echo esc_attr($slug) ?>"><?php echo esc_html($field->get_title()); ?></label>
    <?php if (!empty($extra['tooltip'])) { ?>
        <div class="help-popover-wb" data-js="help-popover-wb">
            <span class="help-icon-wb" data-js="help-icon-wb">?</span>
            <div class="help-popover-box-wb" data-js="help-popover-box-wb"><?php echo $extra['tooltip']; ?></div>
        </div>
    <?php } ?>
    <br><input id="<?php echo esc_attr($slug) ?>" name="<?php echo esc_attr($field->get_name()); ?>"
        class="wbkdata_input wbkdata_input_checkbox wbkdata_property_input" type="checkbox"
        value="<?php echo esc_attr($keys[0]); ?>" data-validation="checkbox" data-getter="checkbox"
        data-setter="checkbox">
</div>