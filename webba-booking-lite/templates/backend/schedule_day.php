<?php
if ( !defined( 'ABSPATH' ) ) exit;

$day_status = $data[0];
$timeslots = $data[1];
$day_to_render = $data[2];
$service_id = $data[3];
$locked_time_slots = $data[4];

$service = new WBK_Service( $service_id );
if( !$service->is_loaded() ){
	return;
}

$date_format = WBK_Format_Utils::get_date_format();
$time_format = WBK_Format_Utils::get_time_format();

$status_class_day = 'green_bg';
if ( $day_status == 0 ) {
	$status_class_day = 'red_bg';
}
$today = strtotime('today');
if ( $day_to_render < $today ) {
	$status_class_day = 'gray_bg';
	$html_day_controls = '';
} else {
	if ( $day_status == 0 ){
		$html_day_controls = '<div class="day_controls" id="day_controls_' . esc_attr( $day_to_render ). '">' .
								   WBK_Renderer::load_template( 'backend/schedule_day_unlock_link', array( $service_id, $day_to_render ), false ) .
							  '</div>';
	} else {
		 $html_day_controls = '<div class="day_controls" id="day_controls_' . esc_attr( $day_to_render ) . '">' .
									WBK_Renderer::load_template( 'backend/schedule_day_lock_link', array( $service_id, $day_to_render ), false ) .
							   '</div>';
	}
}

$html_schedule = '';
$html_schedule = WBK_Renderer::load_template( 'backend/schedule_day_timeslots', array( $timeslots, $service_id, $locked_time_slots ), false );
	
 
$html =  '<div class="day_container">' .
				'<div id="day_title_' . $day_to_render . '" class="day_title ' . $status_class_day . '">'.
					wp_date( $date_format, $day_to_render, new DateTimeZone( date_default_timezone_get() ) ).
					'</div>' . $html_day_controls . '
					<div>'.
					$html_schedule
					.'</div>
			</div>';

echo $html;
