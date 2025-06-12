<?php
if (!defined('ABSPATH'))
    exit;

$payment_items = $data[0];
$booking_ids = $data[1];
$temp = array();
foreach ($booking_ids as $id) {
    $temp[] = intval($id);
}
$booking_ids = json_encode($temp);

?>

<div class="payment-details-wrapper-w">
    <table cellpadding="0" cellspacing="0">
        <thead>
            <tr>
                <td>
                    <?php echo esc_html(get_option('wbk_payment_details_title', 'Payment details')); ?>
                </td>
                <td></td>
            </tr>
        </thead>
        <tbody>
            <?php
            $i = 0;

            foreach ($payment_items['item_names'] as $item_name) {
                ?>
                <tr>
                    <td>
                        <?php echo esc_html($item_name); ?>
                    </td>
                    <td>
                        <?php echo WBK_Format_Utils::format_price($payment_items['prices'][$i] * $payment_items['quantities'][$i]); ?>
                    </td>
                </tr>
                <?php
                $i++;
            }
            if ($payment_items['tax_to_pay'] > 0) {
                ?>
                <tr>
                    <td>
                        <?php echo esc_html(get_option('wbk_tax_label', __('Tax', 'webba-booking-lite'))); ?>
                    </td>
                    <td>
                        <?php echo WBK_Format_Utils::format_price($payment_items['tax_to_pay']); ?>
                    </td>
                </tr>
                <?php
            }
            ?>
        </tbody>

        <tfoot>
            <tr>
                <td>
                    <?php echo esc_html(get_option('wbk_payment_subtotal_title', __('Subtotal', 'webba-booking-lite'))); ?>
                </td>
                <td>
                    <?php echo WBK_Format_Utils::format_price($payment_items['subtotal']); ?>
                </td>
            </tr>
            <tr>
                <td>
                    <?php echo esc_html(get_option('wbk_payment_total_title', __('Total', 'webba-booking-lite'))); ?>
                </td>
                <td>
                    <?php echo WBK_Format_Utils::format_price($payment_items['total']); ?>
                </td>
            </tr>
        </tfoot>
    </table>
    <input type="hidden" name="booking_ids" value="<?php echo esc_attr($booking_ids); ?>">
</div>