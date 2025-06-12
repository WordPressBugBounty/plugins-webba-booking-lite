<?php
if (!defined('ABSPATH'))
    exit;
/*
 * This file is part of Webba Booking plugin



 */

$field = $data[0];
$slug = $data[1];

?>

<div class="wbkdata_input_container">
    <input id="<?php echo esc_attr($slug); ?>" name="<?php echo esc_attr($slug); ?>"
        class="wbkdata_input wbkdata_input_text wbkdata_filter_input" type="text" data-validation="text" required>
    <label for="<?php echo esc_attr($slug); ?>" name="<?php echo esc_attr($slug); ?>"
        class="wbkdata_input_text_label"><?php echo esc_html($field->get_title()); ?></label>
</div>