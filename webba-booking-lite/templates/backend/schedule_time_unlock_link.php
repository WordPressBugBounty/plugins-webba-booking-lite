<?php
if ( !defined( 'ABSPATH' ) ) exit;
$service_id = $data[0];
$time = $data[1];
?>
<a class="red_font" id="time_unlock_<?php echo esc_attr( $service_id . '_' . $time ) ?>"><span class="dashicons dashicons-lock"></span></a></a>
