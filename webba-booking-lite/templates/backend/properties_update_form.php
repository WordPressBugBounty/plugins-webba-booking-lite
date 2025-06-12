<?php
if (!defined('ABSPATH'))
    exit;

$slug = $data;
do_action('wbkdata_before_properties_update_form', $slug);
?>
<div style="display:none;" class="wbkdata_property_container_update_form" data-table="<?php echo esc_attr($slug); ?>">
    <div class="wbkdata_property_header">
        <span class="wbkdata_properties_title">
            New service
        </span>
        <div class="wbkdata_form_controls">
            <input type="button" class="wbkdata_transparent_white_button wbkdata_button" id="wbkdata_properties_save"
                value="<?php echo esc_attr(wbkdata_translate_string('Save')); ?>">
            <input type="button" class="wbkdata_transparent_white_button wbkdata_button"
                id="wbkdata_properties_save_close"
                value="<?php echo esc_attr(wbkdata_translate_string('Save and close')) ?>">
            <?php
            if (WbkData()->tables->get_element_at($slug)->current_user_can_delete()) {
                ?>
                    <input type="button" class="wbkdata_transparent_white_button wbkdata_button" id="wbkdata_properties_delete"
                        value="<?php echo esc_attr(wbkdata_translate_string('Delete')); ?>">
                    <div class="wbkdata_small_popup wbkdata_delete_conirmation_holder">
                        <?php echo esc_attr(wbkdata_translate_string('Are you sure?')) ?><br>
                        <input type="button" class="wbkdata_transparent_dark_button wbkdata_button"
                            id="wbkdata_properties_delete_confirm"
                            value="<?php echo esc_attr(wbkdata_translate_string('Yes, delete it.')); ?>">
                    </div>
                    <?php
            }
            ?>
            <input type="button" class="wbkdata_transparent_white_button wbkdata_hidden wbkdata_button"
                id="wbkdata_properties_discard"
                value="<?php echo esc_attr(wbkdata_translate_string('Discard changes')) ?>">
        </div>
        <a class="wbkdata_dark_button wbkdata_properties_cancel" href="#"></a>
        <div class="wbkdata_line_loader wbkdata_hidden"></div>
    </div>
    <div class="wbkdata_property_content_outer">
        <div class="wbkdata_overlay wbkdata_hidden"></div>
        <div class="wbkdata_property_content_inner">
            <div id="wbkdata_propery_info">
            </div>
            <div data-accordion-group>
                <?php
                $sections = array_unique(WbkData()->tables->get_element_at($slug)->get_data('property_sections_update'));
                if (count($sections) > 1) {
                    foreach ($sections as $section) {
                        if (!array_key_exists($section, WbkData()->tables->get_element_at($slug)->sections)) {
                            continue;
                        } ?>
                                <div class="wbkdata_accordion open" data-accordion>
                                    <div class="wbkdata_accordion_control" data-control>
                                        <?php echo esc_attr(WbkData()->tables->get_element_at($slug)->sections[$section]); ?>
                                    </div>
                                    <div class="wbkdata_accordion_section" data-content>
                                        <?php
                                        foreach (WbkData()->tables->get_element_at($slug)->get_data('property_fields_update') as $field_slug => $field) {
                                            if ($field->get_section() !== $section) {
                                                continue;
                                            }
                                            if (is_array($field->get_dependency())) {
                                                $arr_dependency = $field->get_dependency();
                                                if (isset($arr_dependency['administrator'])) {
                                                    $user = wp_get_current_user();
                                                    $role = $user->roles[0];
                                                    if (isset($arr_dependency[$role])) {
                                                        $arr_dependency = $arr_dependency[$role];
                                                        $dependency = '[';
                                                        foreach ($arr_dependency as $value) {
                                                            $dependency .= '["' . implode('","', $value) . '"]';
                                                        }
                                                        $dependency .= ']';
                                                        $dependency = str_replace('][', '],[', $dependency);
                                                    } else {
                                                        $dependency = '';
                                                    }
                                                } else {
                                                    $dependency = '[';
                                                    foreach ($arr_dependency as $value) {
                                                        $dependency .= '["' . implode('","', $value) . '"]';
                                                    }
                                                    $dependency .= ']';
                                                    $dependency = str_ireplace('][', '],[', $dependency);
                                                }
                                            } else {
                                                $dependency = '[]';
                                            } ?>

                                                <div class="wbkdata_field_container" data-dependency='<?php echo esc_attr($dependency); ?>'>
                                                    <?php
                                                    if (!has_action('wbkdata_property_field_' . $field->get_type())) {
                                                        echo esc_html('No action found for the ' . 'wbkdata_property_field_' . $field->get_type()) . '  )';
                                                    }
                                                    do_action('wbkdata_property_field_' . $field->get_type(), [$field, $field_slug]); ?>
                                                </div>
                                                <?php
                                        } ?>
                                        <div style="clear:both;display:block;height:10px;border:none;"></div>
                                    </div>
                                </div>
                                <?php
                    }
                } else {
                    foreach (WbkData()->tables->get_element_at($slug)->get_data('property_fields_update') as $field_slug => $field) {
                        if (is_array($field->get_dependency())) {
                            $arr_dependency = $field->get_dependency();
                            if (isset($arr_dependency['administrator'])) {
                                $user = wp_get_current_user();
                                $role = $user->roles[0];
                                if (isset($arr_dependency[$role])) {
                                    $arr_dependency = $arr_dependency[$role];
                                    $dependency = '[';
                                    foreach ($arr_dependency as $value) {
                                        $dependency .= '["' . implode('","', $value) . '"]';
                                    }
                                    $dependency .= ']';
                                } else {
                                    $dependency = '';
                                }
                            } else {
                                $dependency = '[';
                                foreach ($arr_dependency as $value) {
                                    $dependency .= '["' . implode('","', $value) . '"]';
                                }
                                $dependency .= ']';
                                $dependency = str_replace('][', '],[', $dependency);
                            }
                        } else {
                            $dependency = '';
                        } ?>
                                <div class="wbkdata_field_container" data-dependency='<?php echo esc_attr($dependency); ?>'>
                                    <?php
                                    if (!has_action('wbkdata_property_field_' . $field->get_type())) {
                                        echo esc_html('No action found for the ' . 'wbkdata_property_field_' . $field->get_type());
                                    }
                                    do_action('wbkdata_property_field_' . $field->get_type(), [$field, $field_slug]); ?>
                                </div>
                                <?php
                    }
                }
                ?>

            </div>
        </div>
    </div>
</div>
<?php
do_action('wbkdata_after_properties_update_form', $slug);
?>