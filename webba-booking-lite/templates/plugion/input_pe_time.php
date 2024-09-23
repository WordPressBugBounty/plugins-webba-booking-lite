<?php
if ( !defined( 'ABSPATH' ) ) exit;
/*
 * This file is part of Webba Booking plugin
 */

$field = $data[0];
$slug = $data[1];
$default = ! empty( $field->get_default_value() ) ? $field->get_default_value() : 'plugion_null';
$ed = $field->get_extra_data();
$extra = $field->get_extra_data();

if( isset( $ed['null_value'] ) ){
    $keys = array_keys( $ed['null_value'] );
    $null_value = $keys[0];
    $null_string = $ed['null_value'][0];
} else {
    $null_string =  plugion_translate_string( 'select option' );
    $null_value = 'plugion_null';
}
?>

<div class="label-wb">
    <label for="<?php echo esc_attr( $slug ) ?>"><?php echo esc_attr( $field->get_title() ) ?></label>
    <?php if ( ! empty(  $extra['tooltip']) ) { ?>
        <div class="help-popover-wb" data-js="help-popover-wb">
            <span class="help-icon-wb" data-js="help-icon-wb">?</span>
            <div class="help-popover-box-wb" data-js="help-popover-box-wb"><?php echo  $extra['tooltip']; ?></div>
        </div>
    <?php } ?>
</div>
<div class="custom-select-wb">
    <select id="<?php echo esc_attr( $slug ) ?>" name="<?php echo $field->get_name(); ?>"  class="plugion_input plugion_input_select plugion_property_input" data-validation="select" data-setter="select" data-default="<?php echo esc_attr( $default ); ?>" data-required="<?php echo $field->get_required(); ?>">
        <option value="<?php echo $null_value; ?>"><?php echo $null_string; ?></option>
    </select>
</div>