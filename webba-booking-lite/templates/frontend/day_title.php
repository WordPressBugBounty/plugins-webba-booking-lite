<?php
if ( !defined( 'ABSPATH' ) ) exit;
$date_format = WBK_Format_Utils::get_date_format();
$day_to_render = $data[0];
$offset = $data[1];
$date_regular = wp_date ( $date_format, $day_to_render, new DateTimeZone( date_default_timezone_get() ) );
$timezone = new DateTimeZone( get_option( 'wbk_timezone', 'UTC' ) );
$current_offset =  $offset * - 60 - $timezone->getOffset( new DateTime );
$date_local = wp_date ( $date_format, $day_to_render + $current_offset, new DateTimeZone( date_default_timezone_get() ) );
$day_title = get_option( 'wbk_day_label',  '#date' );
$day_title = str_replace( '#date', $date_regular, $day_title );
$day_title = str_replace( '#local_date', $date_local, $day_title );
?>
<div class="wbk-col-12-12">
    <div class="wbk-day-title">
        <?php echo esc_html( $day_title ); ?>
    </div>
    <hr class="wbk-day-separator">
</div>
<?php

?>
