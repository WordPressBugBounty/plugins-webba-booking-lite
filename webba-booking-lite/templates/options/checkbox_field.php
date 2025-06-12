<?php
if ( !defined( 'ABSPATH' ) ) exit;

$slug = $data['id'];
$args = $data['args'];
$value = get_option( $slug, $args['default'] );

if( ! empty( $args['dependency'] ) ){
    $dependency = ' data-dependency = \'' . json_encode( $args['dependency'] ) . '\'';
} else {
    $dependency = '';
}
?>

<div class="field-block-wb with-slidebox-wb"<?php echo $dependency; ?>>
    <div class="label-wb">
        <label for="<?php echo esc_attr( $slug ); ?>"><?php echo esc_html( $data['title'] ); ?></label>
        <?php if ( ! empty( $args['popup'] ) ) { ?>
            <div class="help-popover-wb" data-js="help-popover-wb">
                <span class="help-icon-wb" data-js="help-icon-wb">?</span>
                <div class="help-popover-box-wb" data-js="help-popover-box-wb"><?php echo $args['popup']; ?></div>
            </div>
        <?php } ?>
    </div>

    <input
            class="slidebox-wb wbk_option_input"
            type="checkbox"
            id="<?php echo esc_attr( $slug ); ?>"
            name="<?php echo esc_attr( $slug ); ?>"
            value="<?php echo esc_attr( $args['checkbox_value'] ); ?>" <?php echo checked( $args['checkbox_value'], $value, false ) ?>
    />
</div>
