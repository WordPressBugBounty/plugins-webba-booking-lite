<?php
if ( !defined( 'ABSPATH' ) ) exit;
$field = $data[0];
$slug = $data[1];
$extra = $field->get_extra_data();

?>

<div class="toggle-editor-wrapper-wb" data-js="toggle-editor-wrapper-wb">
    <div class="label-wb">
        <label for="<?php echo esc_attr( $slug ); ?>"><?php echo esc_html( $field->get_title() ); ?></label>
        <?php if ( ! empty( $extra['tooltip']  ) ) { ?>
            <div class="help-popover-wb" data-js="help-popover-wb">
                <span class="help-icon-wb" data-js="help-icon-wb">?</span>
                <div class="help-popover-box-wb" data-js="help-popover-box-wb"><?php echo $extra['tooltip']; ?></div>
            </div>
        <?php } ?>
    </div>
    <textarea  id="<?php echo esc_attr( $slug ) ?>" name="<?php echo esc_attr( $field->get_name() ); ?>" data-default="<?php echo esc_attr( $field->get_default_value() ); ?>" class="plugion_input plugion_input_text plugion_input_textarea plugion_input_editor plugion_property_input" type="text" required data-validation="editor" data-setter="editor" data-getter="editor" data-required="<?php echo esc_attr( $field->get_required() ); ?>"></textarea>
</div>
