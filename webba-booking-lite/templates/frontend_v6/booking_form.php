<?php
if (!defined('ABSPATH')) {
    exit();
}

$service = $data[0];
$category_list = $data[1];
$category = $data[2];
$location = isset($data[3]) ? $data[3] : '0';
$staff = isset($data[4]) ? $data[4] : '0';
$allowed_params = [
    'admin_approve',
    'admin_cancel',
    'cancelation',
    'order_payment',
    'PayerID',
    'paymentId',
    'paypal_status',
    'payment_intent',
    'redirect_status',
];

$extra_data_attrs = '';
foreach ($allowed_params as $param) {
    if (isset($_GET[$param])) {
        $value = sanitize_text_field(wp_unslash($_GET[$param]));
        $attr_name = 'data-' . $param;
        $extra_data_attrs .= ' ' . $attr_name . '="' . esc_attr($value) . '"';
    }
}


?>
<div class="webba_booking_form_v6" data-service="<?php echo esc_attr($service); ?>"
    data-category-list="<?php echo esc_attr(
        $category_list
    ); ?>" data-category="<?php echo esc_attr($category); ?>"
    data-location="<?php echo esc_attr($location); ?>" data-staff="<?php echo esc_attr($staff); ?>" <?php echo $extra_data_attrs; ?>></div>
    