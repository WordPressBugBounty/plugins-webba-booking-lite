<?php
if ( !defined( 'ABSPATH' ) ) exit;
$service_id = $data[0];
$service = new WBK_Service( $service_id );
$sp = $data[1];

$select_hours_label = get_option( 'wbk_hours_label', '' );
$time_format = WBK_Format_Utils::get_time_format();
$show_hours =  get_option( 'wbk_show_suitable_hours', 'yes');
if( $show_hours == 'yes' ){
    $row_class = 'wbk-frontend-row';
} else {
    $row_class = 'wbk_hidden';
}
?>
<div class="wbk-col-12-12">
<?php
if( $show_hours == 'yes' ){
?>
    <label class="wbk-input-label"><? echo WBK_Validator::kses( $select_hours_label  ); ?></label>
    <hr class="wbk-hours-separator">
<?php
}
$hours_step = $service->get_step() * 60;
for ( $i = 1;  $i <= 7;  $i++ ) {
    if( $sp->is_working_day( $i, $service_id ) || $sp->is_unlockced_has_dow( $i, $service_id ) ){
?>
        <div class="<?php echo esc_attr( $row_class ); ?> ">
 <?php
        switch ( $i ) {
        case 1:
            $day_name_translated = __( 'Monday', 'webba-booking-lite' );
            $day_name = 'monday';
            break;
        case 2:
            $day_name_translated = __( 'Tuesday', 'webba-booking-lite' );
            $day_name = 'tuesday';
            break;
        case 3:
            $day_name_translated = __( 'Wednesday', 'webba-booking-lite' );
            $day_name = 'wednesday';
            break;
        case 4:
            $day_name_translated = __( 'Thursday', 'webba-booking-lite' );
            $day_name = 'thursday';
            break;
        case 5:
            $day_name_translated = __( 'Friday', 'webba-booking-lite' );
            $day_name = 'friday';
            break;
        case 6:
            $day_name_translated = __( 'Saturday', 'webba-booking-lite' );
            $day_name = 'saturday';
            break;
        case 7:
            $day_name_translated = __( 'Sunday', 'webba-booking-lite' );
            $day_name = 'sunday';
            break;
    }

    ob_start();
?>
        <select id="wbk-time_<?php echo esc_attr( $day_name ) ?>" class="wbk-input wbk-time_after">
<?php
            $intervals = $sp->get_business_hours_intervals_by_dow( $i, $service_id );
            $timeslots = [];
            foreach ($intervals as $interval) {
                $start = $interval->start;
                $end =   $interval->end;
                if( get_option('wbk_show_suitable_hours', 'yes' == 'yes' ) ){
                    $start = 0;
                }
                for ( $time = $start; $time <= $end - $service->get_duration()  * 60 ; $time += $hours_step ) {
?>
                    <option value="<?php echo esc_attr( $time ); ?>"><?php echo esc_html( __( 'from', 'webba-booking-lite' ) ) . ' ' . wp_date ( $time_format, $time, new DateTimeZone( 'UTC' ) ); ?></option>
<?php
            }
        }
?>
        </select>
<?php
        $select = ob_get_clean();
?>
        <div class="wbk-col-3-12 wbk-table-cell">
            <input type="checkbox" value="<?php echo WBK_Validator::alfa_numeric( $day_name ); ?>" class="wbk-checkbox" id="wbk-day_<?php echo WBK_Validator::alfa_numeric( $day_name ); ?>" checked="checked"/>
            <label for="wbk-day_<?php echo WBK_Validator::alfa_numeric( $day_name ); ?>" class="wbk-checkbox-label"><?php echo esc_html( $day_name_translated ); ?></label>
        </div>
        <div class="wbk-col-9-12"><?php echo $select; ?></div>
        </div>
        <div class="wbk-clear"></div>

<?php
    }
}
?>
<div class="wbk-clear"></div>
<input type="button" class="wbk-button" id="wbk-search_time_btn" value="<?php echo esc_html( __( 'Search time slots', 'webba-booking-lite' ) ); ?>">
<?php
?>
