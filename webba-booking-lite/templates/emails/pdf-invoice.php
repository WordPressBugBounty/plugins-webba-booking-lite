<?php
if (!defined("ABSPATH")) {
    exit();
}

$company_information = isset($company_information) && is_array($company_information)
    ? $company_information
    : [];
$customer = isset($customer) && is_array($customer) ? $customer : [];
$invoice_meta = isset($invoice_meta) && is_array($invoice_meta) ? $invoice_meta : [];
$line_items = isset($line_items) && is_array($line_items) ? $line_items : [];
$totals = isset($totals) && is_array($totals) ? $totals : [];

$company_name = isset($company_information["name"]) ? (string) $company_information["name"] : "";
$company_address = isset($company_information["address"])
    ? (string) $company_information["address"]
    : "";
$company_phone = isset($company_information["phone"]) ? (string) $company_information["phone"] : "";
$company_email = isset($company_information["email"]) ? (string) $company_information["email"] : "";
$company_logo = isset($company_information["logo"]) ? (string) $company_information["logo"] : "";

$customer_name = isset($customer["name"]) ? (string) $customer["name"] : "";
$customer_email = isset($customer["email"]) ? (string) $customer["email"] : "";
$customer_phone = isset($customer["phone"]) ? (string) $customer["phone"] : "";

$invoice_number = isset($invoice_meta["number"]) ? (string) $invoice_meta["number"] : "";
$invoice_date = isset($invoice_meta["date"]) ? (string) $invoice_meta["date"] : "";
$invoice_status = isset($invoice_meta["status"]) ? (string) $invoice_meta["status"] : "";
$is_paid = !empty($invoice_meta["is_paid"]);
$payment_method = isset($invoice_meta["payment_method"])
    ? (string) $invoice_meta["payment_method"]
    : "";
$booking_reference = isset($invoice_meta["booking_reference"])
    ? (string) $invoice_meta["booking_reference"]
    : "";
?>
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title><?php echo esc_html(sprintf(__("Invoice %s", "webba-booking-lite"), $invoice_number)); ?></title>
    <style type="text/css">
        @page {
            margin: 28px 32px 36px 32px;
        }

        body {
            margin: 0;
            padding: 0;
            color: #1a2332;
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            line-height: 1.45;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        .header-table {
            margin-bottom: 6px;
        }

        .brand-cell {
            width: 58%;
            vertical-align: top;
            padding: 0 16px 0 0;
        }

        .invoice-cell {
            width: 42%;
            vertical-align: top;
            text-align: right;
            padding: 0;
        }

        .logo {
            max-height: 52px;
            max-width: 180px;
            margin-bottom: 8px;
        }

        .company-name {
            color: #0e9482;
            font-size: 18px;
            font-weight: bold;
            letter-spacing: 0.2px;
            margin: 0 0 6px 0;
        }

        .company-detail {
            color: #5c6b7a;
            font-size: 10px;
            line-height: 1.5;
            margin: 0;
        }

        .invoice-kicker {
            color: #0e9482;
            font-size: 10px;
            font-weight: bold;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin: 0 0 4px 0;
        }

        .invoice-title {
            color: #1a2332;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 0.5px;
            margin: 0 0 8px 0;
        }

        .invoice-number {
            color: #1a2332;
            font-size: 13px;
            font-weight: bold;
            margin: 0 0 10px 0;
        }

        .meta-label {
            color: #5c6b7a;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }

        .meta-value {
            color: #1a2332;
            font-size: 11px;
            font-weight: bold;
        }

        .status-paid,
        .status-unpaid {
            display: inline-block;
            padding: 3px 8px;
            font-size: 9px;
            font-weight: bold;
            letter-spacing: 0.6px;
            text-transform: uppercase;
        }

        .status-paid {
            background-color: #e7f7f3;
            color: #0e9482;
        }

        .status-unpaid {
            background-color: #fff4e5;
            color: #c2410c;
        }

        .accent-bar {
            height: 4px;
            background-color: #0e9482;
            margin: 10px 0 18px 0;
        }

        .section-table {
            margin-bottom: 18px;
        }

        .bill-to-cell {
            width: 54%;
            vertical-align: top;
        }

        .section-heading {
            color: #0e9482;
            font-size: 9px;
            font-weight: bold;
            letter-spacing: 1.2px;
            text-transform: uppercase;
            padding: 0 0 6px 0;
        }

        .party-box {
            background-color: #f4f7f8;
            padding: 12px 14px;
        }

        .party-name {
            font-size: 13px;
            font-weight: bold;
            margin: 0 0 4px 0;
        }

        .party-detail {
            color: #5c6b7a;
            font-size: 10px;
            margin: 0;
        }

        .details-cell {
            width: 46%;
            padding-left: 16px;
            vertical-align: top;
        }

        .detail-row td {
            padding: 3px 0;
            vertical-align: top;
        }

        .detail-label {
            color: #5c6b7a;
            width: 42%;
        }

        .items-table {
            margin-bottom: 8px;
        }

        .items-table th {
            background-color: #1a2332;
            color: #ffffff;
            font-size: 9px;
            font-weight: bold;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            padding: 9px 10px;
            text-align: left;
        }

        .items-table th.col-qty,
        .items-table th.col-amount,
        .items-table td.col-qty,
        .items-table td.col-amount {
            text-align: right;
        }

        .items-table td {
            border-bottom: 1px solid #e4e8ee;
            padding: 10px;
            vertical-align: top;
        }

        .item-title {
            font-size: 11px;
            font-weight: bold;
            color: #1a2332;
        }

        .item-meta {
            color: #5c6b7a;
            font-size: 9px;
            padding-top: 3px;
        }

        .col-desc {
            width: 52%;
        }

        .col-schedule {
            width: 26%;
        }

        .col-qty {
            width: 8%;
        }

        .col-amount {
            width: 14%;
        }

        .totals-wrap {
            margin-top: 8px;
        }

        .totals-cell {
            width: 280px;
            vertical-align: top;
        }

        .totals-table {
            width: 280px;
        }

        .totals-table td {
            padding: 5px 0;
        }

        .totals-label {
            color: #5c6b7a;
            text-align: left;
            padding-right: 16px;
        }

        .totals-value {
            text-align: right;
            font-weight: bold;
        }

        .totals-total td {
            border-top: 2px solid #1a2332;
            padding-top: 8px;
        }

        .totals-total .totals-label,
        .totals-total .totals-value {
            color: #0e9482;
            font-size: 13px;
        }

        .totals-due td {
            background-color: #f4f7f8;
            padding: 8px 10px;
        }

        .footer-note {
            margin-top: 28px;
            border-top: 1px solid #e4e8ee;
            padding-top: 12px;
            color: #5c6b7a;
            font-size: 9px;
        }

        .footer-thanks {
            color: #1a2332;
            font-size: 11px;
            font-weight: bold;
            margin: 0 0 4px 0;
        }
    </style>
</head>
<body>
    <table class="header-table">
        <tr>
            <td class="brand-cell">
                <?php if ($company_logo !== "") : ?>
                    <img class="logo" src="<?php echo esc_attr($company_logo); ?>" alt="<?php echo esc_attr($company_name); ?>"/>
                <?php elseif ($company_name !== "") : ?>
                    <div class="company-name"><?php echo esc_html($company_name); ?></div>
                <?php endif; ?>

                <?php if ($company_logo !== "" && $company_name !== "") : ?>
                    <div class="company-name"><?php echo esc_html($company_name); ?></div>
                <?php endif; ?>

                <?php if ($company_address !== "") : ?>
                    <p class="company-detail"><?php echo nl2br(esc_html($company_address)); ?></p>
                <?php endif; ?>

                <?php if ($company_phone !== "" || $company_email !== "") : ?>
                    <p class="company-detail">
                        <?php
                        $company_contacts = array_filter([$company_phone, $company_email]);
                        echo esc_html(implode("  ·  ", $company_contacts));
                        ?>
                    </p>
                <?php endif; ?>
            </td>
            <td class="invoice-cell">
                <div class="invoice-kicker"><?php echo esc_html(__("Tax invoice", "webba-booking-lite")); ?></div>
                <div class="invoice-title"><?php echo esc_html(__("INVOICE", "webba-booking-lite")); ?></div>
                <?php if ($invoice_number !== "") : ?>
                    <div class="invoice-number">#<?php echo esc_html($invoice_number); ?></div>
                <?php endif; ?>
                <table>
                    <?php if ($invoice_date !== "") : ?>
                        <tr>
                            <td class="meta-label"><?php echo esc_html(__("Date", "webba-booking-lite")); ?></td>
                            <td class="meta-value"><?php echo esc_html($invoice_date); ?></td>
                        </tr>
                    <?php endif; ?>
                    <?php if ($invoice_status !== "") : ?>
                        <tr>
                            <td class="meta-label"><?php echo esc_html(__("Status", "webba-booking-lite")); ?></td>
                            <td>
                                <span class="<?php echo $is_paid ? "status-paid" : "status-unpaid"; ?>">
                                    <?php echo esc_html($invoice_status); ?>
                                </span>
                            </td>
                        </tr>
                    <?php endif; ?>
                </table>
            </td>
        </tr>
    </table>

    <div class="accent-bar"></div>

    <table class="section-table">
        <tr>
            <td class="bill-to-cell">
                <div class="section-heading"><?php echo esc_html(__("Bill to", "webba-booking-lite")); ?></div>
                <div class="party-box">
                    <div class="party-name"><?php echo esc_html($customer_name !== "" ? $customer_name : __("Customer", "webba-booking-lite")); ?></div>
                    <?php if ($customer_email !== "") : ?>
                        <p class="party-detail"><?php echo esc_html($customer_email); ?></p>
                    <?php endif; ?>
                    <?php if ($customer_phone !== "") : ?>
                        <p class="party-detail"><?php echo esc_html($customer_phone); ?></p>
                    <?php endif; ?>
                </div>
            </td>
            <td class="details-cell">
                <div class="section-heading"><?php echo esc_html(__("Invoice details", "webba-booking-lite")); ?></div>
                <table>
                    <?php if ($booking_reference !== "") : ?>
                        <tr class="detail-row">
                            <td class="detail-label"><?php echo esc_html(__("Booking ID", "webba-booking-lite")); ?></td>
                            <td class="meta-value">#<?php echo esc_html($booking_reference); ?></td>
                        </tr>
                    <?php endif; ?>
                    <?php if ($payment_method !== "") : ?>
                        <tr class="detail-row">
                            <td class="detail-label"><?php echo esc_html(__("Payment method", "webba-booking-lite")); ?></td>
                            <td class="meta-value"><?php echo esc_html($payment_method); ?></td>
                        </tr>
                    <?php endif; ?>
                    <?php if ($invoice_date !== "") : ?>
                        <tr class="detail-row">
                            <td class="detail-label"><?php echo esc_html(__("Issue date", "webba-booking-lite")); ?></td>
                            <td class="meta-value"><?php echo esc_html($invoice_date); ?></td>
                        </tr>
                    <?php endif; ?>
                </table>
            </td>
        </tr>
    </table>

    <table class="items-table">
        <thead>
            <tr>
                <th class="col-desc"><?php echo esc_html(__("Description", "webba-booking-lite")); ?></th>
                <th class="col-schedule"><?php echo esc_html(__("Date / time", "webba-booking-lite")); ?></th>
                <th class="col-qty"><?php echo esc_html(__("Qty", "webba-booking-lite")); ?></th>
                <th class="col-amount"><?php echo esc_html(__("Amount", "webba-booking-lite")); ?></th>
            </tr>
        </thead>
        <tbody>
            <?php if (count($line_items) === 0) : ?>
                <tr>
                    <td colspan="4"><?php echo esc_html(__("No items on this invoice.", "webba-booking-lite")); ?></td>
                </tr>
            <?php endif; ?>
            <?php foreach ($line_items as $line_item) : ?>
                <?php
                $item_title = isset($line_item["title"]) ? (string) $line_item["title"] : "";
                $item_schedule = isset($line_item["schedule"]) ? (string) $line_item["schedule"] : "";
                $item_duration = isset($line_item["duration"]) ? (string) $line_item["duration"] : "";
                $item_extras = isset($line_item["extras"]) ? (string) $line_item["extras"] : "";
                $item_staff = isset($line_item["staff"]) ? (string) $line_item["staff"] : "";
                $item_quantity = isset($line_item["quantity"]) ? (string) $line_item["quantity"] : "1";
                $item_amount = isset($line_item["amount"]) ? (string) $line_item["amount"] : "";
                ?>
                <tr>
                    <td class="col-desc">
                        <div class="item-title"><?php echo esc_html($item_title); ?></div>
                        <?php if ($item_duration !== "") : ?>
                            <div class="item-meta"><?php echo esc_html($item_duration); ?></div>
                        <?php endif; ?>
                        <?php if ($item_staff !== "") : ?>
                            <div class="item-meta"><?php echo esc_html(sprintf(__("Staff: %s", "webba-booking-lite"), $item_staff)); ?></div>
                        <?php endif; ?>
                        <?php if ($item_extras !== "") : ?>
                            <div class="item-meta"><?php echo esc_html(sprintf(__("Extras: %s", "webba-booking-lite"), $item_extras)); ?></div>
                        <?php endif; ?>
                    </td>
                    <td class="col-schedule"><?php echo esc_html($item_schedule); ?></td>
                    <td class="col-qty"><?php echo esc_html($item_quantity); ?></td>
                    <td class="col-amount"><?php echo esc_html($item_amount); ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>

    <table class="totals-wrap">
        <tr>
            <td></td>
            <td class="totals-cell">
                <table class="totals-table">
                    <?php if (!empty($totals["subtotal"])) : ?>
                        <tr>
                            <td class="totals-label"><?php echo esc_html(__("Subtotal", "webba-booking-lite")); ?></td>
                            <td class="totals-value"><?php echo esc_html($totals["subtotal"]); ?></td>
                        </tr>
                    <?php endif; ?>
                    <?php if (!empty($totals["show_discount"])) : ?>
                        <tr>
                            <td class="totals-label"><?php echo esc_html($totals["discount_label"]); ?></td>
                            <td class="totals-value">-<?php echo esc_html($totals["discount"]); ?></td>
                        </tr>
                    <?php endif; ?>
                    <?php if (!empty($totals["show_fees"])) : ?>
                        <tr>
                            <td class="totals-label"><?php echo esc_html(__("Service fee", "webba-booking-lite")); ?></td>
                            <td class="totals-value"><?php echo esc_html($totals["fees"]); ?></td>
                        </tr>
                    <?php endif; ?>
                    <?php if (!empty($totals["show_tax"])) : ?>
                        <tr>
                            <td class="totals-label"><?php echo esc_html($totals["tax_label"]); ?></td>
                            <td class="totals-value"><?php echo esc_html($totals["tax"]); ?></td>
                        </tr>
                    <?php endif; ?>
                    <tr class="totals-total">
                        <td class="totals-label"><?php echo esc_html(__("Total", "webba-booking-lite")); ?></td>
                        <td class="totals-value"><?php echo esc_html(isset($totals["total"]) ? $totals["total"] : ""); ?></td>
                    </tr>
                    <?php if (!empty($totals["show_amount_paid"])) : ?>
                        <tr>
                            <td class="totals-label"><?php echo esc_html(__("Amount paid", "webba-booking-lite")); ?></td>
                            <td class="totals-value"><?php echo esc_html($totals["amount_paid"]); ?></td>
                        </tr>
                    <?php endif; ?>
                    <?php if (!empty($totals["show_balance_due"])) : ?>
                        <tr class="totals-due">
                            <td class="totals-label"><?php echo esc_html(__("Balance due", "webba-booking-lite")); ?></td>
                            <td class="totals-value"><?php echo esc_html($totals["balance_due"]); ?></td>
                        </tr>
                    <?php endif; ?>
                </table>
            </td>
        </tr>
    </table>

    <div class="footer-note">
        <p class="footer-thanks"><?php echo esc_html(__("Thank you for your booking.", "webba-booking-lite")); ?></p>
        <p>
            <?php echo esc_html(__("This invoice was generated automatically. Please contact us if you have any questions about this booking or payment.", "webba-booking-lite")); ?>
        </p>
        <?php if ($company_email !== "" || $company_phone !== "") : ?>
            <p>
                <?php
                echo esc_html(
                    sprintf(
                        __("Contact: %s", "webba-booking-lite"),
                        implode("  ·  ", array_filter([$company_email, $company_phone])),
                    ),
                );
                ?>
            </p>
        <?php endif; ?>
    </div>
</body>
</html>
