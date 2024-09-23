<?php
if ( !defined( 'ABSPATH' ) ) exit;
/*
 * This file is part of Webba Booking plugin



 */

$field = $data[0];
$value = $data[2];
$row_data = $data[3];

if( isset( $row_data['duration'] ) && !is_null(isset( $row_data['duration'] ) ) && $row_data['duration'] != '' ){
    $duration = $row_data['duration'] * 60;
    $end = $value + $duration;
} else {
    $end = 0;
}

date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
$day = strtotime( $row_data['day'] );
date_default_timezone_set( 'UTC' );

if ( is_null( $value ) || $value == '' ) {
    return;
}

if( isset( $field->get_extra_data()['time_format'] ) ){
    $time_format =  $field->get_extra_data()['time_format'];
} else {
    $time_format = get_option('time_format');
}

if ( isset( $field->get_extra_data()['time_zone'] ) ) {
    $time_zone =  $field->get_extra_data()['time_zone'];
} else {
    $time_zone =  get_option('timezone_string');
}


$timezone_to_use = WBK_Time_Math_Utils::get_utc_offset_by_time( $value );
date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
$time = date( $time_format, $value );
if( get_option( 'wbk_date_format_time_slot_schedule', 'start' ) == 'start-end' && $end != 0){
    $time .= ' - ' . wp_date( $time_format, $end, $timezone_to_use );

}
echo $time;
