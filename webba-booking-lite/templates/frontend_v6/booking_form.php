<?php
if (!defined('ABSPATH')) {
    exit();
}

$service = $data[0];
$category_list = $data[1];
$category = $data[2];
$multiservice = $data[3] ?? false;
$allowed_params = [
    'admin_approve',
    'admin_cancel',
    'cancelation',
    'order_payment',
    'PayerID',
    'paymentId',
    'paypal_status',
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
    data-multiservice="<?php echo esc_attr($multiservice); ?>" <?php echo $extra_data_attrs; ?>></div>
    