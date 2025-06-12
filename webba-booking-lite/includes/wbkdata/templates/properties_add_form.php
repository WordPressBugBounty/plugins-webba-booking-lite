<?php
if (!defined('ABSPATH'))
    exit;

$slug = $data;
do_action('wbkdata_before_properties_add_form', $slug);
?>
<div class="wbkdata_property_container_add_form sidebar-roll-part-wrapper-wb">
    <div class="sidebar-roll-wb" data-js="sidebar-roll-wb" data-name="<?php echo $slug; ?>">
        <form>
            <span class="close-button-wb" data-js="close-button-wb"><img
                    src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/close-icon2.png" alt="close"></span>

            <div class="sidebar-roll-title-wb">
                <?php echo esc_attr(wbkdata_translate_string('New')) . ' ' . WbkData()->tables->get_element_at($slug)->get_single_item_name(); ?>
            </div>
            <div class="sidebar-roll-content-wb">
                <div class="sidebar-roll-content-inner-wb" data-scrollbar="true" tabindex="-1"
                    style="overflow: hidden; outline: none;">
                    <div class="scroll-content">

                        <?php
                        $sections = array_unique(WbkData()->tables->get_element_at($slug)->get_data('property_sections_add'));
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
                                                foreach (WbkData()->tables->get_element_at($slug)->get_data('property_fields_add') as $field_slug => $field) {
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
                                                            $dependency = array();
                                                            foreach ($arr_dependency as $value) {
                                                                $dependency[] = '["' . implode('","', $value) . '"]';
                                                            }
                                                            $dependency .= ']';
                                                            $dependency = str_replace('][', '],[', $dependency);
                                                        }
                                                    } else {
                                                        $dependency = '[]';
                                                    } ?>

                                                        <div class="wbkdata_field_container"
                                                            data-dependency='<?php echo esc_attr($dependency); ?>'>
                                                            <?php
                                                            if (!has_action('wbkdata_property_field_' . $field->get_type())) {
                                                                echo esc_html('<p>No action found for the <strong>' . 'wbkdata_property_field_' . $field->get_type()) . '</strong></p>';
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
                            foreach (WbkData()->tables->get_element_at($slug)->get_data('property_fields_add') as $field_slug => $field) {
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
                                        $dependency = str_replace('][', '],[', $dependency);
                                    }
                                } else {
                                    $dependency = '';
                                } ?>
                                        <div class="field-block-wb wbkdata_field_container"
                                            data-dependency='<?php echo esc_attr($dependency); ?>'>
                                            <?php
                                            if (!has_action('wbkdata_property_field_' . $field->get_type())) {
                                                echo esc_html('<p>No action found for the <strong>' . 'wbkdata_property_field_' . $field->get_type()) . '</strong></p>';
                                            }
                                            do_action('wbkdata_property_field_' . $field->get_type(), [$field, $field_slug]); ?>
                                        </div>
                                        <?php
                            }
                        }
                        ?>



                    </div>
                    <div class="scrollbar-track scrollbar-track-x show" style="display: none;">
                        <div class="scrollbar-thumb scrollbar-thumb-x"
                            style="width: 532px; transform: translate3d(0px, 0px, 0px);"></div>
                    </div>
                    <div class="scrollbar-track scrollbar-track-y show" style="display: none;">
                        <div class="scrollbar-thumb scrollbar-thumb-y"
                            style="height: 743px; transform: translate3d(0px, 0px, 0px);"></div>
                    </div>
                </div><!-- /.sidebar-roll-content-inner-wb -->

            </div><!-- /.sidebar-roll-content-wb -->

            <div class="buttons-block-wb">
                <button class="button-wb button-light-wb">Cancel</button>
                <button id="wbkdata_properties_save"
                    class="button-wb"><?php echo esc_html(__('Save', 'webba-booking-lite')); ?></button>
            </div><!-- /.buttons-block-wb -->

        </form>
    </div><!-- /.sidebar-roll-wb -->
</div>
<?php
do_action('wbkdata_after_properties_add_form', $slug);
?>