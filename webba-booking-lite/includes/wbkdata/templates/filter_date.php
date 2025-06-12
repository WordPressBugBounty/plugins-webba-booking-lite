<?php
if (!defined('ABSPATH'))
    exit;
/*
 * This file is part of Webba Booking plugin
 */

$field = $data[0];
$slug = $data[1];

if (isset($field->get_extra_data()['date_format'])) {
    $date_fomrat = $field->get_extra_data()['date_format'];
} else {
    $date_fomrat = get_option('date_format');
}
$date_fomrat = str_replace('d', 'dd', $date_fomrat);
$date_fomrat = str_replace('j', 'd', $date_fomrat);
$date_fomrat = str_replace('l', 'dddd', $date_fomrat);
$date_fomrat = str_replace('D', 'ddd', $date_fomrat);
$date_fomrat = str_replace('m', 'mm', $date_fomrat);
$date_fomrat = str_replace('n', 'm', $date_fomrat);
$date_fomrat = str_replace('F', 'mmmm', $date_fomrat);
$date_fomrat = str_replace('M', 'mmm', $date_fomrat);
$date_fomrat = str_replace('y', 'yy', $date_fomrat);
$date_fomrat = str_replace('Y', 'yyyy', $date_fomrat);
$date_fomrat = str_replace('S', '', $date_fomrat);
$date_fomrat = str_replace('s', '', $date_fomrat);

?>

<div class="wbkdata_input_container">
    <input id="<?php echo esc_attr($slug) ?>" name="<?php echo esc_attr($field->get_name()); ?>"
        class="wbkdata_input wbkdata_input_text wbkdata_filter_input" data-validation="date" type="text"
        data-dateformat="<?php echo esc_attr($date_fomrat) ?>" data-setter="date" data-getter="date" required>
    <label for="<?php echo esc_attr($slug) ?>" name="<?php echo esc_attr($slug) ?>"
        class="wbkdata_input_text_label"><?php echo esc_html($field->get_title()) ?></label>
</div>