<?php
if ( !defined( 'ABSPATH' ) ) exit;

$field = $data[0];
$slug = $data[1];
$extra = $field->get_extra_data();

$field_type = ! empty( $extra['field_type'] ) ? $extra['field_type'] : 'text';
$type = ! empty( $extra['type'] ) ? $extra['type'] : '';
?>
<div class="label-wb">
    <label for="<?php echo esc_attr( $slug ); ?>"><?php echo esc_attr( $field->get_title() ); ?></label>
    <?php if ( ! empty( $extra['tooltip'] ) ) { ?>
        <div class="help-popover-wb" data-js="help-popover-wb">
            <span class="help-icon-wb" data-js="help-icon-wb">?</span>
            <div class="help-popover-box-wb" data-js="help-popover-box-wb"><?php echo $extra['tooltip']; ?></div>
        </div>
    <?php } ?>
</div>
<div class="field-wrapper-wb">
    <input id="<?php echo esc_attr( $slug ) ?>" name="<?php echo esc_attr( $field->get_name() ); ?>" type="<?php echo $field_type; ?>" data-default="<?php echo esc_attr( $field->get_default_value() ); ?>" required class="plugion_input plugion_input_text plugion_simple_text_input plugion_property_input" data-validation="text" data-type="<?php echo esc_attr( $type ) ?>" data-required="<?php echo esc_attr( $field->get_required() ); ?>">
</div>
