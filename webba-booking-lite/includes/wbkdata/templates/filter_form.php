<?php
if (!defined('ABSPATH'))
    exit;
/*
 * This file is part of Webba Booking plugin



 */

$slug = $data;
do_action('wbkdata_before_filter_form', $slug);
if (count(WbkData()->tables->get_element_at($slug)->get_data('filters')) == 0) {
    return;
}
?>
<div style="display:none;" class="wbkdata_filter_form" data-table="<?php echo esc_attr($slug); ?>">
    <div class="wbkdata_property_header">
        <span class="wbkdata_filter_title">
            <?php
            echo wbkdata_translate_string('Filters for') . ' ' . WbkData()->tables->get_element_at($slug)->get_multiple_item_name();
            ?>
        </span>
        <div class="wbkdata_form_controls">
            <input type="button" class="wbkdata_transparent_white_button wbkdata_button" id="wbkdata_filter_apply"
                value="<?php echo wbkdata_translate_string('Apply'); ?>">
            <input type="button" class="wbkdata_transparent_white_button wbkdata_button" id="wbkdata_filter_apply_close"
                value="<?php echo wbkdata_translate_string('Apply and close') ?>">
        </div>
        <a class="wbkdata_dark_button wbkdata_filter_cancel" href="#"></a>
        <div class="wbkdata_line_loader wbkdata_hidden"></div>
    </div>
    <div class="wbkdata_filter_content_outer">
        <div class="wbkdata_overlay wbkdata_hidden"></div>
        <div class="wbkdata_filter_content_inner">
            <div id="wbkdata_filter_info">
            </div>
            <?php
            foreach (WbkData()->tables->get_element_at($slug)->get_data('filters') as $field_slug => $field) {
                if ($field->get_filter_type() == '') {
                    continue;
                }
                ?>
                    <div class="wbkdata_filter_container">
                        <?php
                        if (!has_action('wbkdata_filter_' . $field->get_filter_type())) {
                            echo '<p>No action found for the <strong>' . 'wbkdata_filter_' . $field->get_filter_type() . '</strong></p>';
                        }
                        do_action('wbkdata_filter_' . $field->get_filter_type(), [$field, $field_slug]); ?>
                    </div>
                    <?php
            }
            ?>
        </div>
    </div>
</div>
<?php
do_action('wbkdata_after_filter_form', $slug);

?>