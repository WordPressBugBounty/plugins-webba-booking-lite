<?php
if (!defined('ABSPATH')) {
    exit();
}

$allowed_params = [
    'PayerID',
    'paymentId',
    'paypal_status',
    'mollie_status',
    'gift_card_id',
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
<div id="wbk_gift_card" class="webba_gift_card_form"<?php echo $extra_data_attrs; ?>></div>
