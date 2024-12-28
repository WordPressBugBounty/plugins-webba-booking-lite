<?php
if (!defined('ABSPATH'))
    exit;
$category_ids = $data[0];
?>
<label
    class="input-label-wbk wbk-category-input-label"><?php echo WBK_Validator::kses(get_option('wbk_category_label', 'Select category')); ?>
</label>
<select class="wbk-select wbk-input" id="wbk-category-id">
    <option value="0" selected="selected"><?php echo __('select...', 'webba-booking-lite'); ?></option>
    <?php
    foreach ($category_ids as $category_id => $category_name) {
        $arr_services = WBK_Model_Utils::get_services_in_category($category_id);

        if ($arr_services === FALSE) {
            continue;
        }
        $services_data = '';
        if (is_array($arr_services) && count($arr_services) > 0) {
            $services_data = implode('-', $arr_services);
        }
        ?>
        <option data-services="<?php echo esc_attr($services_data); ?>" value="<?php echo esc_attr($category_id); ?>">
            <?php echo esc_attr($category_name); ?></option>
        <?php
    }
    ?>
</select>