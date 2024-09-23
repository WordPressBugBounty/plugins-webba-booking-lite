<?php
if ( !defined( 'ABSPATH' ) ) exit;
/*
 * This file is part of Webba Booking plugin
 * (c) plugion.com <hello@plugion.org>


 */

$field = $data[0];
$slug = $data[1];
$ed = $field->get_extra_data();
$multiple = '';
$null_value = 'plugion_null';
if( isset( $ed['multiple'] ) ){
    if( $ed['multiple'] == true ){
        $multiple = 'multiple';
    }
}
$null_string =  plugion_translate_string( 'select option' );
if( isset( $ed['null_value'] ) ){
    $keys = array_keys( $ed['null_value'] );
    $null_value = $keys[0];
    $null_string = $ed['null_value'][0];
}
?>
<div class="plugion_input_container">
    <select id="<?php echo esc_attr( $slug ) ?>" name="<?php echo esc_attr( $field->get_name() ) . '" ' . $multiple . ' ) ' ?> class="plugion_input plugion_input_select plugion_property_input"  data-getter="select" data-validation="select" data-setter="select" data-default="<?php echo esc_attr( $field->get_default_value() ); ?>" data-required="<?php echo esc_attr( $field->get_required() ); ?>">
<?php
    if( isset( $field->get_extra_data()['items'] ) ){
        $items = $field->get_extra_data()['items'];
    } elseif ( isset( $field->get_extra_data()['source'] )) {
        $function = $field->get_extra_data()['source'];
        $items = $function();
    }
    if( $multiple == '' ){
?>
        <option value="<?php echo esc_attr( $null_value ); ?>"><?php echo esc_attr( $null_string ); ?></option>
<?php
    }
    foreach( $items as $key => $value ){
?>
        <option value="<?php echo esc_attr( $key ) ?>"><?php echo esc_attr( $value ) ?></option>
<?php
    }
?>
    </select>
    <label for="<?php echo esc_attr( $slug ) ?>" name="<?php echo esc_attr( $slug ) ?>" class="plugion_input_select_label"><?php echo esc_attr( $field->get_title() ) ?></label>
</div>
