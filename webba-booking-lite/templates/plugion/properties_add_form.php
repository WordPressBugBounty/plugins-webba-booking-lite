<?php
if (!defined('ABSPATH'))
    exit;
$slug = $data;
$help_url = '';
if ($slug == get_option('wbk_db_prefix', '') . 'wbk_gg_calendars') {
    $help_url = '<a href="https://webba-booking.com/documentation/google-calendar/" rel="noopener" target="_blank"  class="wbk_question_sign" ></a>';
}
$table = Plugion()->tables->get_element_at($slug);
do_action('plugion_before_properties_form', $slug);
?>
<div class="plugion_property_container_form sidebar-roll-part-wrapper-wb <?php echo $slug; ?>"
    data-table="<?php echo $slug; ?>">
    <div class="sidebar-roll-wb" data-js="sidebar-roll-wb">
        <form>
            <span class="close-button-wbkb " data-js="close-button-wbkb">
                <img src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/close-icon2.png" alt="close">

                <button class="delete-confirm-wb sidebar_confirm_wb single-delete-confirm-wb wbk_hidden"
                    data-table="wp_wbk_appointments" type="button" style="display: inline-block;">
                    <?php echo esc_html(__('Yes, close it.', 'webba-booking-lite')); ?></button>
            </span>
            <div class="sidebar-roll-title-wb">
                <span class="property_form_title"><?php echo esc_attr(__('New', 'webba-booking-lite')); ?></span>
                <?php echo $table->get_single_item_name() . $help_url; ?>
            </div>
            <div class="sidebar-roll-content-wb">
                <div class="sidebar-roll-content-inner-wb">
                    <div class="scroll-content">
                        <ul class="new-service-menu-wb">
                            <?php
                            $sections = array_unique($table->get_data('property_sections_add'));
                            if (count($sections) > 1) { ?>
                                    <?php foreach ($sections as $key => $section) {
                                        if (array_key_exists($section, $table->sections)) { ?>
                                                    <li class="plugion_row_controls_tabs<?php echo 0 == $key ? ' active-wb' : ''; ?>"
                                                        data-js-item="<?php echo $section; ?>">
                                                        <?php echo esc_attr($table->sections[$section]); ?>
                                                    </li>
                                            <?php }
                                    } ?>
                            <?php } ?>
                        </ul>
                        <div class="new-service-menu-content-wb">
                            <?php
                            foreach ($sections as $key => $section) { ?>
                                    <div class="new-service-content-item-wb<?php echo 0 == $key ? ' active-wb' : ''; ?>"
                                        data-js-item="<?php echo $section; ?>">
                                        <?php foreach ($table->get_data('property_fields_add') as $field_slug => $field) {
                                            if ($field->get_section() !== $section) {
                                                continue;
                                            }
                                            $dependency = $table->get_dependency_by_field($field); ?>
                                                <div class="field-block-wb" data-dependency='<?php echo esc_attr($dependency); ?>'>
                                                    <?php if (!has_action('plugion_property_field_' . $field->get_type())) {
                                                        echo esc_html('<p>No action found for the <strong>' . 'plugion_property_field_' . $field->get_type()) . '</strong></p>';
                                                    }
                                                    do_action('plugion_property_field_' . $field->get_type(), [$field, $field_slug]); ?>
                                                </div>
                                        <?php } ?>
                                    </div>
                            <?php } ?>
                        </div>
                    </div>
                </div>
            </div>

            <div class="buttons-block-wb two-buttons-wbkb">
                <div class="manipulations-block-wb">
                    <span class="item-wb plugion_duplicate_row" data-table="<?php echo $slug; ?>"><img
                            src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/duplicate-icon.png"
                            alt="duplicate"></span>
                    <span class="item-wb plugion_delete_row" data-type="edit" data-table="<?php echo $slug; ?>"><img
                            src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/delete-icon.png"
                            alt="delete"></span>
                    <button class="delete-confirm-wb single-delete-edit-confirm-wb" data-table="wp_wbk_appointments"
                        type="button">Yes, delete it.</button>
                </div>
                <div class="asd">
                    <button type="button" class="plugion_properties_save button-wbkb"
                        data-table="<?php echo $slug; ?>">Save</button>
                    <div class="plugion_propery_info"></div>
                </div>
            </div>
        </form>
    </div>
</div>
<?php
do_action('plugion_after_properties_form', $slug);
