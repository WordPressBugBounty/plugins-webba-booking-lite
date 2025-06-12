<?php
if (!defined('ABSPATH'))
    exit;
$service_ids = $data[0];
$is_hidden = $data[1];
$for_category = false;
if (isset($data[2])) {
    $for_category = $data[2];
}
if ($for_category) {
    $row_class = 'wbk_hidden';
} else {
    $row_class = '';
}
?>
<?php


if ($is_hidden) {
    $service = new WBK_Service($service_ids[0]);
    $pricing_rules = json_encode($service->get_pricing_rules());
    ?>
        <select data-pricing-rules="<?php echo esc_attr($pricing_rules); ?>"
            class="wbk-select wbk-input wbk_services wbk_services_hidden wbk_hidden" name="service">
            <?php
} else {
    ?>
            <div class="field-row-w wbk_services_row_container <?php echo $row_class; ?>">
                <label
                    class="input-label-wbk"><?php echo WBK_Validator::kses(get_option('service-label-wbk', __('Select service', 'webba-booking-lite'))); ?></label>
                <div class="custom-select-w">
                    <select class="wbk-select wbk-input wbk_services" name="service" data-validation="positive"
                        data-validationmsg="<?php echo esc_html__('Please, select a service.', 'webba-booking-lite'); ?>">
                        <option value="0" data-payable="false" selected="selected">
                            <?php echo esc_html(__('select...', 'webba-booking-lite')) ?>
                        </option>
                        <?php
}
?>
                <?php
                foreach ($service_ids as $service_id) {
                    $service = new WBK_Service($service_id);
                    if (!$service->is_loaded()) {
                        continue;
                    }
                    if ($service->get('payment_methods') == '') {
                        $payable = 'false';
                    } else {
                        if (get_option('wbk_appointments_default_status', '') == 'pending' && get_option('wbk_appointments_allow_payments', '') == 'enabled') {
                            $payable = 'false';
                        } else {
                            if ($service->has_only_arrival_payment_method()) {
                                $payable = 'false';
                            } else {
                                $payable = 'true';
                            }
                        }
                    }
                    if (function_exists('pll__')) {
                        $service_name = pll__($service->get_name(true));
                    } else {
                        $service_name = $service->get_name(true);
                    }
                    $service_name = apply_filters('wpml_translate_single_string', $service_name, 'webba-booking-lite', 'Service name id ' . $service->get_id());
                    if (function_exists('pll__')) {
                        $service_description = pll__($service->get_description(true));
                    } else {
                        $service_description = $service->get_description(true);
                    }
                    apply_filters('wpml_translate_single_string', $service->get_description(false), 'webba-booking-lite', 'Service description id ' . $service->get_id());
                    if (get_option('wbk_show_service_description', 'disabled') == 'disabled') {
                        ?>
                                <option value="<?php echo esc_attr($service->get_id()); ?>"
                                    data-payable="<?php echo esc_attr($payable); ?>"
                                    data-multi-low-limit="<?php echo esc_attr($service->get_multi_mode_low_limit()); ?>"
                                    data-multi-limit="<?php esc_attr($service->get_multi_mode_limit()); ?>"
                                    data-consecutive="<?php echo esc_attr($service->get('consecutive_timeslots')); ?>">
                                    <?php echo WBK_Validator::kses($service_name) ?>
                                </option>
                                <?php
                    } else {
                        ?>
                                <option data-desc=" <?php echo htmlspecialchars(WBK_Validator::kses($service_description)); ?>"
                                    data-payable="<?php echo esc_attr($payable); ?>" value="<?php echo esc_attr($service->get_id()); ?>"
                                    data-multi-low-limit="<?php echo esc_attr($service->get_multi_mode_low_limit()); ?>"
                                    data-multi-limit="<?php echo esc_attr($service->get_multi_mode_limit()); ?>"
                                    data-consecutive="<?php echo esc_attr($service->get('consecutive_timeslots')); ?>">
                                    <?php echo WBK_Validator::kses($service_name); ?>
                                </option>
                                <?php
                    }
                }
                ?>
            </select>

            <?php
            if (!$is_hidden) {
                ?>
                </div>
            </div>
            <div class=" wbk_description_holder">
                <label class="input-label-wbk">
                </label>
            </div>
            <?php
            }
            ?>