<?php
if ( !defined( 'ABSPATH' ) ) exit;
$title = $data[1];
$tokens = $data[2];

if( !is_array( $tokens ) || count( $tokens ) < 1 ){
    return;
}

$tokens = implode( '-', $tokens );
 
$email_cancel_label = esc_html( stripslashes( get_option( 'wbk_booking_cancel_email_label', '' ) ) );

?>
<p>
    <?php echo $title; ?>
</p>
<div class="field-row-w mt-30-w">
    <label><?php echo $email_cancel_label; ?></label>
    <input type="text" data-validationmsg="<?php echo esc_attr( __( 'Please, enter email' ), 'webba-booking-lite' ) ?>" class="input-text-w wbk-input"  data-validation="email" name="email" >
</div>
<input type="hidden" name="app_token" value="<?php echo esc_html( $tokens ); ?>" ?>