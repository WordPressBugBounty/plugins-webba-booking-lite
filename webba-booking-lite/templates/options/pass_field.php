<?php
if ( !defined( 'ABSPATH' ) ) exit;

$slug = $data['id'];
$args = $data['args'];
$value = get_option( $slug, $args['default'] );
$placeholder = ! empty( $args['placeholder'] ) ? $args['placeholder'] : '';

if( ! empty( $args['dependency'] ) ){
    $dependency = ' data-dependency = \'' . json_encode( $args['dependency'] ) . '\'';
} else {
    $dependency = '';
}
?>

<div class="field-block-wb"<?php echo $dependency; ?>>
    <div class="label-wb">
        <label for="<?php echo esc_attr( $slug ); ?>"><?php echo esc_html( $data['title'] ); ?></label>
        <?php if ( ! empty( $args['popup'] ) ) { ?>
            <div class="help-popover-wb" data-js="help-popover-wb">
                <span class="help-icon-wb" data-js="help-icon-wb">?</span>
                <div class="help-popover-box-wb" data-js="help-popover-box-wb"><?php echo $args['popup']; ?></div>
            </div>
        <?php } ?>
    </div>
    <div class="field-wrapper-wb">
        <input type="password" id="<?php echo esc_attr( $slug ); ?>" placeholder="<?php echo esc_attr( $placeholder ); ?>" name="<?php echo esc_attr( $slug ); ?>" value="<?php echo esc_attr( $value ); ?>">
    </div>
    <?php if ( ! empty( $args['description'] ) ) { ?>
        <div class="hint-wb"><?php echo $args['description']; ?></div>
    <?php } ?>
</div>