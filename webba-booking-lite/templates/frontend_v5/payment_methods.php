<?php

if (!defined('ABSPATH'))
    exit;
$payment_methods = $data[0];
$titles = array(
    'paypal' => get_option('wbk_payment_pay_with_paypal_btn_text', 'PayPal payment button text'),
    'stripe' => get_option('wbk_stripe_button_text', 'Pay with credit card'),
    'woocommerce' => get_option('wbk_woo_button_text', 'WooCommerce button text'),
    'arrival' => get_option('wbk_pay_on_arrival_button_text', 'Pay on arrival'),
    'bank' => get_option('wbk_bank_transfer_button_text', 'Pay by bank transfer'),
);
$descriptions = array(
    'paypal' => esc_html(get_option('wbk_paypal_prompt', __('You will be redirected to PayPal to approve the payment.', 'webba-booking-lite'))),
    'stripe' => WBK_Renderer::load_template('frontend_v5/stripe_elements', null, false),
    'arrival' => get_option('wbk_pay_on_arrival_message', 'Pay on arrival'),
    'bank' => get_option('wbk_bank_transfer_message', 'Pay by bank transfer'),
    'woocommerce' => '',
);

$payment_methods_all = WbkData()->models->get_element_at(get_option('wbk_db_prefix', '') . 'wbk_services')->fields->get_element_at('service_payment_methods')->get_extra_data()['items'];
$payment_methods_html = '';

?>
<p class="first-text-w custom-w">
    <b><?php echo esc_html(get_option('wbk_payment_methods_title', __('Please tell us how you would like to pay', 'webba-booking-lite'))); ?></b>
</p>
<ul class="payment-method-list-w">
    <?php
    foreach ($payment_methods as $payment_method) {
        if (!isset($payment_methods_all[$payment_method])) {
            continue;
        }
        ?>
        <li>
            <label class="custom-radiobutton-wbk">
                <span style="display:inline-block"><?php echo $titles[$payment_method]; ?></span><br>
                <input type="radio" class="wbk-input" name="payment-method" value="<?php echo esc_attr($payment_method) ?>">
                <span class="checkmark-w"></span>
            </label>
            <div class="wbk_payment_method_desc" style="display:none"><?php echo $descriptions[$payment_method]; ?></div>
        </li>
        <?php
    }
    ?>
</ul>