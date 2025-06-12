<?php
if (!defined('ABSPATH'))
    exit;
$date_format = WBK_Format_Utils::get_date_format();

$day_to_render = $data[0];
$timeslots = $data[1];
$offset = $data[2];
$service_id = $data[3];
$multi_service = $data[4];
$time_after = $data[5];

$pre_slot = '';
$post_slot = '';

$service = new WBK_Service($service_id);
if (!$service->is_loaded()) {
    echo '';
    return;
}
if (function_exists('pll__')) {
    $service_name = pll__($service->get_name(true));
} else {
    $service_name = $service->get_name(true);
}
$service_name = apply_filters(
    'wpml_translate_single_string',
    $service_name,
    'webba-booking-lite',
    'Service name id ' . $service->get_id()
);
$service_name = apply_filters('wbk_service_name_before_timeslots', $service_name);
$title = '<p><b>' . esc_html($service_name) . '</b></p>';
$time_slots = WBK_Renderer::load_template('frontend_v5/day_timeslots', array($timeslots, $day_to_render, $service_id, $offset, $time_after), false);


if ($time_slots != '') {
    echo $pre_slot . $title . $time_slots . $post_slot;
} else {
    echo '';
}
?>