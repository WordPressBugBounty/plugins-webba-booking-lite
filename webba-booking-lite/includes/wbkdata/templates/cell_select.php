<?php
if (!defined('ABSPATH'))
    exit;
/*
 * This file is part of Webba Booking plugin



 */

$field = $data[0];
$value = $data[2];
$ed = $field->get_extra_data();

if ($value == 'wbkdata_null') {
    echo '';
}
if (isset($field->get_extra_data()['items'])) {
    $items = $field->get_extra_data()['items'];
} elseif (isset($field->get_extra_data()['source'])) {
    $function = $field->get_extra_data()['source'];
    $items = $function();
}
if (isset($ed['multiple'])) {
    $result = array();
    $value = json_decode($value, TRUE);
    if (is_array($value)) {
        foreach ($value as $key) {
            if (isset($items[$key])) {
                $result[] = $items[$key];
            }
        }
    }
    echo esc_html(implode(', ', $result));
} else {
    if (isset($items[$value])) {
        echo esc_html($items[$value]);
    }
}
?>