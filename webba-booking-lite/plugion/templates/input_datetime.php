<?php
if ( !defined( 'ABSPATH' ) ) exit;
/*
 * This file is part of Webba Booking plugin



 */

$field = $data[0];
$slug = $data[1];

if( isset( $field->get_extra_data()['time_zone'] ) ){
    $time = new \DateTime('now', new DateTimeZone( $field->get_extra_data()['time_zone'] ));
    $time_zone =  'UTC' . $time->format('P');
} else {
    if( get_option('timezone_string') != '' ){
        $time = new \DateTime('now', new DateTimeZone( get_option('timezone_string') ) );
        $time_zone =  'UTC' . $time->format('P');
    } else {
        $time = new \DateTime('now');
        $offset = get_option( 'gmt_offset' );
		if( $offset > 0 ){
			$sign = '+';
		} else {
			$sign = '-';
            $offset = $offset * -1;
        }
		$offset_int = floor( $offset );
        $offset_fractional = $offset - $offset_int;
        switch ( $offset_fractional) {
            case 0.5:
                $offset_fractional = ':30';
                break;
            case 0.75:
                $offset_fractional = ':45';
                break;
            default:
                $offset_fractional = '';
                break;
        }
	    $time_zone =  'UTC' . $sign . $offset_int . $offset_fractional;
    }
}

if( isset( $field->get_extra_data()['date_format'] ) ){
    $date_fomrat =  $field->get_extra_data()['date_format'];
} else {
    $date_fomrat = get_option('date_format');
}
$date_fomrat = str_replace( 'd', 'dd', $date_fomrat );
$date_fomrat = str_replace( 'j', 'd', $date_fomrat );
$date_fomrat = str_replace( 'l', 'dddd', $date_fomrat );
$date_fomrat = str_replace( 'D', 'ddd', $date_fomrat );
$date_fomrat = str_replace( 'm', 'mm', $date_fomrat );
$date_fomrat = str_replace( 'n', 'm', $date_fomrat );
$date_fomrat = str_replace( 'F', 'mmmm', $date_fomrat );
$date_fomrat = str_replace( 'M', 'mmm', $date_fomrat );
$date_fomrat = str_replace( 'y', 'yy', $date_fomrat );
$date_fomrat = str_replace( 'Y', 'yyyy', $date_fomrat );
$date_fomrat = str_replace( 'S', '', $date_fomrat );
$date_fomrat = str_replace( 's', '', $date_fomrat );

if( isset( $field->get_extra_data()['time_format'] ) ){
    $time_format =  $field->get_extra_data()['time_format'];
} else {
    $time_format = get_option('time_format');
}
$time_format = str_replace( 'h', 'hh', $time_format );
$time_format = str_replace( 'g', 'h', $time_format );
$time_format = str_replace( 'H', 'HH', $time_format );
$time_format = str_replace( 'G', 'H', $time_format );
$time_format = str_replace( 's', '', $time_format );
$time_format = str_replace( 'T', '', $time_format );
?>

<input type="hidden"  id="<?php echo esc_attr( $slug ) ?>" name="<?php echo esc_attr( $field->get_name() ); ?>" class="plugion_input plugion_input_datetime plugion_property_input" type="text" data-timezone="<?php echo esc_attr( $time_zone ) ?>" data-dateformat="<?php echo esc_attr( $date_fomrat ) ?>"  data-timeformat="<?php echo esc_attr( $time_format ) ?>" data-default="<?php echo esc_attr( $field->get_default_value() );?>" data-setter="datetime" data-getter="datetime" data-validation="datetime"  data-date="" data-time="" data-required="<?php echo esc_attr( $field->get_required() ); ?>">
<label class="plugion_hidden" for="<?php echo esc_attr( $slug ) ?>"><?php echo esc_html( $field->get_title() ); ?></label>
<div class="plugion_input_container_small">
    <input id="<?php echo esc_attr( $slug ) . '_date'  ?>" class="plugion_input_datetime_date plugion_input_datetime_part plugion_input_text" required>
    <label for="<?php echo esc_attr( $slug ). '_date' ?>" class="plugion_input_text_label"><?php echo esc_html( plugion_translate_string( 'Date' ) ) ?></label>
</div>

<div class="plugion_input_container_small">
    <input id="<?php echo esc_attr( $slug ) . '_time'  ?>" class="plugion_input_datetime_time plugion_input_datetime_part plugion_input_text" required>
    <label for="<?php echo esc_attr( $slug ) . '_time' ?>"   class="plugion_input_text_label"><?php echo esc_html( plugion_translate_string( 'Time' ) ) ?></label>
</div>

<div style="clear: both"></div>
