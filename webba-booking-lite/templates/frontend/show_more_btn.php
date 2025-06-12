<?php
if ( !defined( 'ABSPATH' ) ) exit;
$day_to_render = $data[0];
?>
<div class="wbk-frontend-row" id="wbk-show_more_container">
    <input type="button" class="wbk-button"  id="wbk-show_more_btn" value="<?php echo esc_html( __( 'Show more', 'webba-booking-lite' ) ); ?>"  />
    <input type="hidden" id="wbk-show-more-start" value="<?php echo esc_html( $day_to_render ); ?>">
</div>
<?php
?>
