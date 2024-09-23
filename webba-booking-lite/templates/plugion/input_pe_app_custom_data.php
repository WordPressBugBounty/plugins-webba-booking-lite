<?php
if (!defined('ABSPATH')) {
    exit();
}

$field = $data[0];
$slug = $data[1];
$extra = $field->get_extra_data();

?>
<textarea id="<?php echo $slug; ?>" data-getter="wbk_app_custom_data" data-setter="wbk_app_custom_data"
    name="<?php echo $field->get_name(); ?>" data-default="<?php echo $field->get_default_value(); ?>"
    class="plugion_hidden plugion_property_input" type="text" required data-validation="textarea"
    data-required="<?php echo $field->get_required(); ?>"></textarea>
<?php
$ids = get_option('wbk_custom_fields_columns', '');
if ($ids != '') {
    $ids = explode(',', $ids);
    $i = 0;
    foreach ($ids as $id) {

        $i++;
        $title = '';
        preg_match('/\[[^\]]*\]/', $id, $matches);
        if (is_array($matches) && count($matches) > 0) {
            $title = esc_html(rtrim(ltrim($matches[0], '['), ']'));
        }
        $id = explode('[', $id);
        $id = $id[0];
        if ($title == '') {
            $title = $id;
        }
        if ($i > 1) {
            $container_class = 'plugion_field_container';
        } else {
            $container_class = '';
        }
        ?>
        <div class="<?php echo $container_class; ?>">
            <div class="label-wb">
                <label for="<?php echo esc_attr($slug) .
                    '_' .
                    esc_attr($id); ?>">
                    <?php echo esc_html(
                        stripslashes($title)
                    ); ?>
                </label>
                <?php if (!empty($extra['tooltip'])) { ?>
                    <div class="help-popover-wb" data-js="help-popover-wb">
                        <span class="help-icon-wb" data-js="help-icon-wb">?</span>
                        <div class="help-popover-box-wb" data-js="help-popover-box-wb">
                            <?php echo $extra[
                                'tooltip'
                            ]; ?>
                        </div>
                    </div>
                <?php } ?>
            </div>
            <div class="field-wrapper-wb">
                <input id="<?php echo esc_attr($slug) .
                    '_' .
                    esc_attr(
                        $id
                    ); ?>" name="<?php echo $field->get_name(); ?>" data-title="<?php echo esc_attr(
                        $title
                    ); ?>" data-field-id="<?php echo trim(
                         esc_attr($id)
                     ); ?>" class="plugion_input plugion_input_text plugion_simple_text_input wbk_custom_data_item"
                    type="text" required>
            </div>
        </div>
        <?php
    }
}


?>