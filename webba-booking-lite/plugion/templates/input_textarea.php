<?php
if ( !defined( 'ABSPATH' ) ) exit;
/*
 * This file is part of Webba Booking plugin
 * (c) plugion.com <hello@plugion.org>


 */

$field = $data[0];
$slug = $data[1];

?>

<div class="plugion_input_container">
    <textarea  id="<?php echo esc_attr( $slug ) ?>" name="<?php echo esc_attr( $field->get_name() ); ?>" data-default="<?php echo esc_attr( $field->get_default_value() ); ?>" class="plugion_input plugion_input_text plugion_input_textarea plugion_property_input" type="text" required data-validation="textarea" data-required="<?php echo esc_attr( $field->get_required() ); ?>"></textarea>
    <label for="<?php echo esc_attr( $slug ) ?>" name="<?php echo esc_attr( $slug ) ?>" class="plugion_input_text_label"><?php echo esc_attr( $field->get_title() ) ?></label>
</div>
