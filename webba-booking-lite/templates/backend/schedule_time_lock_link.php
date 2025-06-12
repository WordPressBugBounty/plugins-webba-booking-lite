<?php
if ( !defined( 'ABSPATH' ) ) exit;
$service_id = $data[0];
$time = $data[1];
?>
<a id="time_lock_<?php echo esc_attr( $service_id . '_' . $time   ) ?>"><span class="dashicons dashicons-unlock"></span></a>
