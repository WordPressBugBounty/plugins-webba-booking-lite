<?php
if ( !defined( 'ABSPATH' ) ) exit;

$slug = $data['id'];
$args = $data['args'];
$value = stripslashes( get_option( $slug, $args['default'] ) );
$placeholder = ! empty( $args['placeholder'] ) ? $args['placeholder'] : '';

if( ! empty( $args['dependency'] ) ){
    $dependency = ' data-dependency = \'' . json_encode( $args['dependency'] ) . '\'';
} else {
    $dependency = '';
}
?>
<div class="field-block-wb"<?php echo $dependency; ?>>
    <div class="label-wb mobile-two-rows-wb">
        <label for="<?php echo esc_attr( $slug ); ?>"><?php echo esc_html( $data['title'] ); ?></label>
        <?php if ( ! empty( $args['popup'] ) ) { ?>
            <div class="help-popover-wb" data-js="help-popover-wb">
                <span class="help-icon-wb" data-js="help-icon-wb">?</span>
                <div class="help-popover-box-wb" data-js="help-popover-box-wb"><?php echo $args['popup']; ?></div>
            </div>
        <?php } ?>
    </div>
    <div class="field-wrapper-wb">
        <textarea name="<?php echo esc_attr( $slug ); ?>" placeholder="<?php echo esc_attr( $placeholder ); ?>" id="<?php echo esc_attr( $slug ); ?>"><?php echo esc_attr( $value ); ?></textarea>
    </div>
    <?php if ( ! empty( $args['description'] ) ) { ?>
        <div class="hint-wb"><?php echo $args['description']; ?></div>
    <?php } ?>
</div>
