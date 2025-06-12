<?php
if ( !defined( 'ABSPATH' ) ) exit;
    // add get parameters

?>
<div class="wbk-frontend-row wbk_date_container" id="wbk-date-container">
</div>
<?php
    if( get_option( 'wbk_mode', 'extended' ) == 'extended' ){
?>
        <div class="wbk-frontend-row wbk_time_container" id="wbk-time-container">
        </div>
<?php
    }
?>
<div class="wbk-frontend-row wbk_slots_container" id="wbk-slots-container">
</div>
<div class="wbk-frontend-row wbk_booking_form_container" id="wbk-booking-form-container">
</div>
<div class="wbk-frontend-row wbk_booking_done" id="wbk-booking-done">
</div>
<div class="wbk-frontend-row wbk_payment" id="wbk-payment">
</div>
