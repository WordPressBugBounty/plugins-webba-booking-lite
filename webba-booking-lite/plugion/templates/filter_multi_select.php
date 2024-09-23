<?php
if ( !defined( 'ABSPATH' ) ) exit;
/*
 * This file is part of Webba Booking plugin



 */

$field = $data[0];
$slug = $data[1];
$filter_extra = $field->get_filter_extra();

?>

<div class="plugion_input_container">
    <select id="<?php echo esc_attr( $slug ); ?>" name="<?php echo esc_attr( $field->get_name() ); ?>" multiple class="plugion_input plugion_input_select plugion_filter_input" data-getter="select" data-validation="select" data-setter="select" data-default="" data-required="1">
<?php
    $items = $field->get_filter_value();
    $i = 0;
    foreach( $items as $value ){
        $title = $value;
        if( !is_null( $filter_extra ) && is_array( $filter_extra ) && isset( $filter_extra[ $value ] ) ){
            $title =  $filter_extra[ $value ];
        }
?>
        <option selected value="<?php echo esc_attr( $value ) ?>"><?php echo esc_html( $title ) ?></option>
<?php
        $i++;
    }
?>
    </select>
    <label for="<?php echo esc_attr( $slug ) ?>" name="<?php echo esc_attr( $slug ) ?>" class="plugion_input_select_label"><?php echo esc_html( $field->get_title() ) ?></label>
    <a href="#" class="plugion_element_sublink plugion_select_all_options"><?php echo plugion_translate_string('select all');  ?></a>
    <a href="#" class="plugion_element_sublink plugion_deselect_all_options"><?php echo plugion_translate_string('deselect all');  ?></a>
</div>
