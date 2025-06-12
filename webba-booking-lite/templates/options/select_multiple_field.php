<?php
if ( !defined( 'ABSPATH' ) ) exit;

$slug = $data['id'];
$args = $data['args'];
$value = (array) get_option( $slug, $args['default'] );

if( ! empty( $args['dependency'] ) ){
    $dependency = ' data-dependency = \'' . json_encode( $args['dependency'] ) . '\'';
} else {
    $dependency = '';
}
?>
<div class="field-block-wb"<?php echo $dependency; ?>>
    <div class="label-wb">
        <label><?php echo esc_html( $data['title'] ); ?></label>
        <?php if ( ! empty( $args['popup'] ) ) { ?>
            <div class="help-popover-wb" data-js="help-popover-wb">
                <span class="help-icon-wb" data-js="help-icon-wb">?</span>
                <div class="help-popover-box-wb" data-js="help-popover-box-wb"><?php echo $args['popup']; ?></div>
            </div>
        <?php } ?>
    </div>
    <div class="custom-multiple-select-wb">
        <select id="<?php echo esc_attr( $slug ); ?>" name="<?php echo esc_attr( $slug ); ?>[]" class="wbk_option_input wbk_option_multi_select" multiple  >
            <?php foreach( $args['extra'] as $key => $name ) {
                if( in_array( $key, $value ) ){
                    $selected = ' selected';
                } else {
                    $selected = '';
                }
                echo '<option'. $selected . ' value="' . esc_attr( $key ) . '">' . esc_html( $name ) . '</option>';
            } ?>
        </select>
 
        <?php if ( ! empty( $args['description'] ) ) { ?>
            <div class="hint-wb"><?php echo $args['description']; ?></div>
        <?php } ?>
    </div>
</div>
