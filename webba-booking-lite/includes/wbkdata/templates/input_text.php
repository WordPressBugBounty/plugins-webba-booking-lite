<?php
if (!defined('ABSPATH'))
    exit;
/*
 * This file is part of Webba Booking plugin
 * (c) wbkdata.com <hello@wbkdata.org>


 */

$field = $data[0];
$slug = $data[1];
$ed = $field->get_extra_data();

if (isset($ed['type'])) {
    $data_type = $ed['type'];
} else {
    $data_type = '';
}
if ($data_type == 'password') {
    $type = 'type="password"';
} else {
    $type = 'type="text"';
}
?>
<div class="wbkdata_input_container">
    <input id="<?php echo esc_attr($slug) ?>" name="<?php echo esc_attr($field->get_name()); ?>" <?php echo esc_attr($type); ?> data-default="<?php echo esc_attr($field->get_default_value()); ?>" required
        class="wbkdata_input wbkdata_input_text wbkdata_simple_text_input wbkdata_property_input" data-validation="text"
        data-type="<?php echo esc_attr($data_type) ?>"
        data-required="<?php echo esc_attr($field->get_required()); ?>">
    <label for="<?php echo esc_attr($slug) ?>"
        class="wbkdata_input_text_label"><?php echo esc_attr($field->get_title()) ?></label>
</div>