<?php
if ( !defined( 'ABSPATH' ) ) exit;
?>
<div class="field-row-w ">
    <label><?php echo esc_html( get_option( 'wbk_coupon_label', __( 'Coupon', 'webba-booking-lite') ) );?></label>
    <input type="text" class="input-text-w wbk-input wbk_input_small wbk_coupon_input" name="coupon">
    <button type="button" class="button-w wbk_apply_coupon" disabled=""><?php echo esc_html( get_option( 'wbk_coupon_apply_text', __( 'Apply' ) ) ); ?><span class="btn-ring-wb" style="opacity: 0;"></span></button>
</div>