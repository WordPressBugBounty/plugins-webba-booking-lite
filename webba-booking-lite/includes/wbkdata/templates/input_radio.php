<?php
if (!defined('ABSPATH'))
    exit;
/*
 * This file is part of Webba Booking plugin
 */

$field = $data[0];
$slug = $data[1];
?>

<label for="<?php echo esc_attr($slug); ?>"
    class="wbkdata_input_label"><?php echo esc_html($field->get_title()); ?></label>
<?php
$i = 0;
foreach ($field->get_extra_data() as $key => $value) {
    $i++;
    if ($field->get_default_value() === $key) {
        $checked = ' checked ';
    } else {
        $checked = '';
    } ?>
    <input class="wbkdata_input wbkdata_input_radio wbkdata_property_input" value="<?php echo esc_attr($key); ?>"
        data-setter="radio" data-getter="radio" data-validation="radio" type="radio"
        name="<?php echo esc_attr($field->get_name()); ?>" id="<?php echo esc_attr($slug . $i); ?>" <?php echo esc_attr($checked); ?> />
    <label class="wbkdata_input_radio_label"
        for="<?php echo esc_attr($slug . $i); ?>"><?php echo esc_html($value) ?></label>
    <?php
}
?>