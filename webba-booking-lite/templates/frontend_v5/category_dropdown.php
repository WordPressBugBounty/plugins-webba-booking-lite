<?php
if (!defined('ABSPATH'))
    exit;
$category_ids = $data[0];

?>

<div class="field-row-w">
    <label class="input-label-wbk">
        <?php echo WBK_Validator::kses(get_option('wbk_category_label', __('Select category', 'webba-booking-lite'))); ?>
    </label>
    <div class="custom-select-w">
        <select class="wbk-select wbk-input wbk_service_categories" name="category" data-validation="positive"
            data-validationmsg="<?php echo esc_html__('Please, select a service.', 'webba-booking-lite'); ?>">
            <option value="0" data-payable="false" selected="selected">
                <?php echo esc_html(__('select...', 'webba-booking-lite')) ?>
            </option>
            <?php
            foreach ($category_ids as $key => $value) {
                $category = new WBK_Service_Category($key);
                if (!$category->is_loaded()) {
                    continue;
                }
                $arr_services = WBK_Model_Utils::get_services_in_category($key);
                if ($arr_services === FALSE) {
                    continue;
                }
                $services_data = '';
                if (is_array($arr_services) && count($arr_services) > 0) {
                    $services_data = implode('-', $arr_services);
                }

                if (function_exists('pll__')) {
                    $category_name = pll__($category->get_name(true));
                } else {
                    $category_name = $category->get_name(true);
                }
                $category_name = apply_filters('wpml_translate_single_string', $category_name, 'webba-booking-lite', 'Category name id ' . $category->get_id());
                ?>
                <option data-services="<?php echo esc_attr($services_data); ?>"
                    value="<?php echo esc_attr($category->get_id()); ?>">
                    <?php echo esc_html($category_name); ?>
                </option>
                <?php
            }
            ?>
        </select>
    </div>
</div>