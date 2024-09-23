<?php
if ( !defined( 'ABSPATH' ) ) exit;
$timeslots = $data[0];
$day_to_render = $data[1];
$service_id = $data[2];
$offset = $data[3];
$time_after  = $data[4];


$service = new WBK_Service( $service_id );
if( !$service->is_loaded() ){
    return;
}
$timeslots_html = '';
for ( $i =  0; $i < count( $timeslots ); $i++ ) {
    $timeslot =  $timeslots[$i];
    if( $timeslot->get_start() < $time_after ){
        continue;
    }
    
    if( get_option( 'wbk_timeslot_format', 'detailed' ) == 'detailed' ){
        $timeslots_html .= WBK_Renderer::load_template( 'frontend/single_timeslot_detailed', array( $day_to_render, $timeslot, $offset, $service, $timeslots ), false );

    } else {
        $timeslots_html .= WBK_Renderer::load_template( 'frontend/single_timeslot_short', array( $day_to_render, $timeslot, $offset, $service, $timeslots ), false );
    }
}
if( $timeslots_html!= ''){
?>
    <div class="wbk-col-12-12 wbk-text-center">
        <ul class="wbk-timeslot-list">
            <?php echo $timeslots_html; ?>
        </ul>
    </div>
<?php
} else {
    echo '';
}
?>
