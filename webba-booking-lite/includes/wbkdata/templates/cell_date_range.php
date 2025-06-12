<?php
if (!defined('ABSPATH'))
    exit;
/*
 * This file is part of Webba Booking plugin



 */

$field = $data[0];
$value = $data[2];

if (is_null($value) || $value == '') {
    return;
}
if (isset($field->get_extra_data()['time_zone'])) {
    $time_zone = $field->get_extra_data()['time_zone'];
} else {
    $time_zone = get_option('timezone_string');
}
$time_zone_obj = new DateTimeZone($time_zone);

$value = explode('-', $value);
$start = trim($value[0]);
$end = trim($value[1]);

$start = new DateTime($start);

$end = new DateTime($end);

echo wp_date(get_option('wbk_date_format_backend'), $start->getTimestamp(), $time_zone_obj) . ' - ' . wp_date(get_option('wbk_date_format_backend'), $end->getTimestamp(), $time_zone_obj);
