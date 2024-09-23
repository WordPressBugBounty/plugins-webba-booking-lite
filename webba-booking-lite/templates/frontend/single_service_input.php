<?php
if (!defined('ABSPATH'))
    exit;
$service_id = $data[0];
$service = new WBK_Service($service_id);
if (get_option('wbk_show_service_description', 'disabled') == 'enabled') {
    $service_description = WBK_Validator::kses($service->get_description());
    $service_description = apply_filters('wpml_translate_single_string', $service->get_description(false), 'webba-booking-lite', 'Service description id ' . $service->get_id());
    if (function_exists('pll__')) {
        $service_description = pll__($service_description);
    }

    ?>
    <div class="wbk_description_holder" id="wbk_description_holder">
        <label class="wbk-input-label">
            <p><?php echo $service_description; ?></p>
        </label>
    </div>
    <?php
}
?>
<input type="hidden" class="wbk_services" data-attribute_name="service-id" id="wbk-service-id"
    data-multi-low-limit="<?php echo esc_attr($service->get_multi_mode_low_limit()); ?>"
    data-multi-limit="<?php echo esc_attr($service->get_multi_mode_limit()); ?>"
    data-consecutive="<?php echo esc_attr($service->get('consecutive_timeslots')); ?>"
    value=" <?php echo intval($service_id); ?>"
    data-consecutive="<?php esc_attr($service->get('consecutive_timeslots')); ?>" />
<input type="hidden" id="wbk_current_category" value="0">
<?php
?>