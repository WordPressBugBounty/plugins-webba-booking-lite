<?php
if (!defined('ABSPATH')) {
    exit();
}
$service_ids = $data[0];
?>

<label class="input-label-wbk service-label-wbk wbk_hidden">
    <?php echo WBK_Validator::kses(
        get_option('service-label-wbk', __('Select service', 'webba-booking-lite'))
    ); ?>
</label>
<ul class="service-list-v5-wbk">

    <?php foreach ($service_ids as $service_id) {

        $service = new WBK_Service($service_id);
        if (!$service->is_loaded()) {
            continue;
        }
        $pricing_rules = json_encode($service->get_pricing_rules());
        if ($service->get('payment_methods') == '') {
            $payable = 'false';
        } else {
            if (
                get_option('wbk_appointments_default_status', '') == 'pending' &&
                get_option('wbk_appointments_allow_payments', '') == 'enabled'
            ) {
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
        $service_name = apply_filters(
            'wpml_translate_single_string',
            $service_name,
            'webba-booking-lite',
            'Service name id ' . $service->get_id()
        );
        if (function_exists('pll__')) {
            $service_description = pll__($service->get_description(true));
        } else {
            $service_description = $service->get_description(true);
        }
        $service_description = apply_filters(
            'wpml_translate_single_string',
            $service->get_description(false),
            'webba-booking-lite',
            'Service description id ' . $service->get_id()
        );
        ?>
                    <li class="wbk_service_item  timeslot-animation-w wbk_hidden" data-servicei_id="<?php echo esc_attr(
                        $service->get_id()
                    ); ?>">
                        <label class="custom-radiobutton-wbk">
                            <span style="display:inline-block">
                                <span class="wbk_single_service_title">
                                    <?php echo $service_name; ?>
                                </span>
                                <img class="wbk_service_sub_img wbk_service_sub_img_clock" src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL .
                                    '/public/images/clock_grey.png"'; ?>   height=" 20">
                                <img class="wbk_service_sub_img_active wbk_service_sub_img_active_clock" src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL .
                                    '/public/images/clock_white.png"'; ?>   height=" 20">
                                <span class="wbk_single_service_sub_title wbk_single_service_sub_title_minutes">
                                    <?php echo $service->get_duration() .
                                        ' ' .
                                        esc_html(
                                            get_option(
                                                'wbk_minutes_label',
                                                __('min', 'webba-booking-lite')
                                            )
                                        ); ?>
                                </span>
                                <?php if ($service->get_price() > 0) { ?>
                                                <img class="wbk_service_sub_img wbk_service_sub_img_money" src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL .
                                                    '/public/images/money_grey.png"'; ?>   height=" 20">
                                                <img class="wbk_service_sub_img_active wbk_service_sub_img_active_money" src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL .
                                                    '/public/images/money_white.png"'; ?>   height=" 20">
                                                <span class="wbk_single_service_sub_title wbk_single_service_sub_title_money">
                                                    <?php echo WBK_Format_Utils::format_price(
                                                        $service->get_price()
                                                    ); ?>
                                                </span>
                                <?php } ?>
                            </span><br>
                            <input type="radio" data-pricing-rules="<?php echo esc_attr(
                                $pricing_rules
                            ); ?>" data-payable="<?php echo esc_attr(
                                 $payable
                             ); ?>" class="wbk-input wbk_hidden wbk_services wbk_service_radio" data-validation="positive"
                                name="service" value="<?php echo $service->get_id(); ?>"
                                data-min="<?php echo esc_attr($service->get_multi_mode_low_limit()); ?>"
                                data-max="<?php echo esc_attr($service->get_multi_mode_limit()); ?>"
                                data-consecutive="<?php echo esc_attr($service->get('consecutive_timeslots')); ?>">
                            <span class=" checkmark-w">
                            </span>
                            <?php if (trim($service_description) != '') { ?>
                                            <div class="wbk_service_description_switcher_holder">
                                                <div class="wbk_service_description_switcher">
                                                </div>
                                                <span class="wbk_read_more">
                                                    <?php echo esc_html(get_option('wbk_readmore_text', __('Read more'))); ?>
                                                </span>
                                            </div>
                                            <div class="wbk_service_description_holder wbk_hidden">
                                                <?php echo $service_description; ?>
                                            </div>
                            <?php } ?>
                        </label>
                    </li>
                    <?php
    } ?>
</ul>