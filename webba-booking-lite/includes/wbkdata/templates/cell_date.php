<?php
if ( !defined( 'ABSPATH' ) ) exit;
/*
 * This file is part of Webba Booking plugin



 */

$field = $data[0];
$value = $data[2];

if ( is_null( $value ) || $value == '' ) {
    return;
}

if( isset( $field->get_extra_data()['date_format'] ) ){
    $date_format =  $field->get_extra_data()['date_format'];
} else {
    $date_format = get_option('date_format');
}

if ( isset( $field->get_extra_data()['time_zone'] ) ) {
    $time_zone =  $field->get_extra_data()['time_zone'];
} else {
    $time_zone =  get_option('timezone_string');
}

$date = new DateTime( $value );
if( $date != FALSE ){
    $timestamp = $date->getTimestamp();
} else {
    $timestamp = 0;
}


$date = $value;

$date = wp_date( $date_format, $timestamp, new DateTimeZone( $time_zone ) );
echo $date;
