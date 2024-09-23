<?php
if ( !defined( 'ABSPATH' ) ) exit;

$day_to_render = $data[0];
$timeslot = $data[1];
$offset = $data[2];
$service = $data[3];
$timeslots = $data[4];

$time = $timeslot->get_formated_time();
$local_time_str = $timeslot->get_formated_time_local();
 
$timeslot_html = '';
$slot_html = '';
// *** Free time slot or multiple booking per slot
if ( ( $timeslot->get_status() == 0 && $timeslot->get_free_places() != 0 ) || is_array( $timeslot->get_status() ) ) {
    if ( $service->get_quantity( $timeslot->get_start() ) > 1 ) {
        $available_count = $timeslot->get_free_places();
        if ( $available_count == 0 ) {
            $slot_html = '<input  data-start="' . esc_attr( $timeslot->get_start() ) . '" data-service="' . esc_html( $service->get_id() ) . '"  type="button" value="' . get_option( 'wbk_booked_text', '' ) . '" class="wbk-slot-button wbk-slot-booked" />';
        }
    }
    if( $slot_html == '' ){
        $slot_html = '<input type="button"  data-service="' . esc_html( $service->get_id() ) . '"  data-end="' . esc_attr( $timeslot->get_end() ) . '"  data-start="' . esc_attr( $timeslot->getStart() ) . '" value="' . $time . '" id="wbk-timeslot-btn_' . esc_attr( $timeslot->get_start() ) . '" data-available="' . esc_attr( $available_count ) . '"   class="wbk-slot-button" />';
    }
    if( count( $timeslots ) == 1 ){
        $timeslot_html .= '<li class="wbk-col-12-12-12">';
    } else {
        $timeslot_html .= '<li class="wbk-col-4-6-12">';
    }
    $timeslot_html .= '<div class="wbk-slot-inner">'.
                $slot_html
            .'</div>
        </li>';
};
// End of *** Free time slot or multiple booking per slot

// *** Locked time slot (on the Schedule page or by Google caneldar or ext lockers)
if( $timeslot->get_status() == -2 && get_option( 'wbk_show_locked_as_booked', 'no' ) == 'yes' ){
    $slot_button =  get_option ( 'wbk_booked_text', '' );
    $slot_html = '<input  data-start="' . esc_attr( $timeslot->get_start() ) . '" data-service="' . esc_attr( $service->get_id() ) . '"  type="button" value="' . $slot_button .'" class="wbk-slot-button wbk-slot-booked" />';
    $timeslot_html .=
            '<li class="wbk-col-4-6-12">
                <div class="wbk-slot-inner">'.
                    $slot_html
                .'</div>
            </li>';
}
// End of Booked time slot

// single booked time slot
if( ( $timeslot->get_status() > 0 ||  $timeslot->get_free_places() == 0 ) && !is_array( $timeslot->get_status() ) ) {
    if( get_option( 'wbk_show_booked_slots', 'disabled' ) == 'enabled'){
        $slot_button = get_option ( 'wbk_booked_text', '' );
        $pre_time = get_option( 'wbk_server_time_format', '' );
        if( $pre_time != '' ){
            $time = $pre_time . ' ' . $time;
        }
        $post_time = get_option( 'wbk_server_time_format2', '' );
        if( $post_time != '' ){
            $time = $time . ' ' . $post_time;
        }
        $slot_html = '<input data-start="' . esc_attr( $timeslot->get_start() ) . '" type="button" value="' . $slot_button .'" class="wbk-slot-button wbk-slot-booked" />';
        $timeslot_html .=
            '<li class="wbk-col-4-6-12">
                <div class="wbk-slot-inner">'.
                    $slot_html
                .'</div>
            </li>';
    }
}

echo $timeslot_html;
