<?php

use WebbaBooking\Utilities\WBK_Options_Utils;

if (!defined('ABSPATH')) {
    exit();
}
class WBK_Price_Processor
{
    static function calculate_single_booking_price($booking, $bookings)
    {
        if (!is_object($booking)) {
            $booking = new WBK_Booking($booking);
            if (!$booking->is_loaded()) {
                return ['price' => 0];
            }
            if (is_array($bookings)) {
                $booking_temp = [];
                foreach ($bookings as $booking_id) {
                    $booking_this = new WBK_Booking($booking_id);
                    if (!$booking_this->is_loaded()) {
                        continue;
                    }
                    $booking_temp[] = $booking_this;
                }
                $bookings = $booking_temp;
            }
        }
        $service = new WBK_Service($booking->get_service());
        $price_details = [];

        if (!$service->is_loaded()) {
            return ['price' => 0];
        }

        // Check if deposit is available for the service
        $to_pay = 0;
        if ($service->is_deposit_enabled()) {
            $deposit_amount = $service->get_deposit_amount();
            if (!is_null($deposit_amount) && $deposit_amount > 0) {
                $to_pay = $deposit_amount;
            }
        }
        $default_price = $service->get_price();
        $price_details[] = [
            'type' => 'service_price',
            'amount' => $default_price,
            'service_id' => $service->get_id(),
        ];

        $sort_array = [];
        $pricing_rules = $service->get_pricing_rules();

        $pricing_rules_obj = [];
        foreach ($pricing_rules as $pricing_rule_id) {
            $rule = new WBK_Pricing_Rule($pricing_rule_id);
            $pricing_rules_obj[] = $rule;
        }
        usort($pricing_rules_obj, function ($first, $second) {
            return (int) $first->get_priority() < $second->get_priority();
        });

        $switch_back = false;
        if (date_default_timezone_get() == 'UTC') {
            date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
            $switch_back = true;
        }
        foreach ($pricing_rules_obj as $rule) {
            $multiplier = 1;
            //$rule = new WBK_Pricing_Rule( $pricing_rule_id );
            $apply_rule = false;

            if ($rule->get_amount() >= 0) {
                switch ($rule->get_type()) {
                    case 'date_range':
                        $dates = explode('-', $rule->get_date_range());
                        if (is_array($dates) && count($dates) == 2) {
                            $start = strtotime(trim($dates[0]));
                            $end = strtotime(trim($dates[1]));
                            if (
                                $booking->get_day() >= $start &&
                                $booking->get_day() <= $end
                            ) {
                                $apply_rule = true;
                            }
                        }
                        break;
                    case 'early_booking':
                        $days = ($booking->get_day() - time()) / 86400;
                        if (
                            $days >= $rule->get_days_number() &&
                            $rule->get_days_number() != 0
                        ) {
                            $apply_rule = true;
                        }
                        break;
                    case 'custom_field':
                        $custom_field_value = $booking->get_custom_field_value(
                            $rule->get_custom_field_id()
                        );
                        if (
                            is_numeric($custom_field_value) &&
                            $rule->get_multiply_amount() == 'yes'
                        ) {
                            $multiplier = $custom_field_value;
                        }
                        if (!is_null($custom_field_value)) {
                            switch ($rule->get_custom_field_operator()) {
                                case 'equals':
                                    if (
                                        $rule->get_custom_field_value() ==
                                        $custom_field_value
                                    ) {
                                        $apply_rule = true;
                                    }
                                    break;
                                case 'more_than':
                                    if (
                                        is_numeric(
                                            $rule->get_custom_field_value()
                                        ) &&
                                        is_numeric($custom_field_value) &&
                                        $rule->get_custom_field_value() <
                                            $custom_field_value
                                    ) {
                                        $apply_rule = true;
                                    }
                                    break;
                                case 'less_than':
                                    if (
                                        is_numeric(
                                            $rule->get_custom_field_value()
                                        ) &&
                                        is_numeric($custom_field_value) &&
                                        $rule->get_custom_field_value() >
                                            $custom_field_value
                                    ) {
                                        $apply_rule = true;
                                    }
                                    break;
                            }
                        }

                        break;
                    case 'number_of_seats':
                        $number_of_seats = $booking->get_quantity();
                        switch ($rule->get_number_of_seats_operator()) {
                            case 'equals':
                                if (
                                    $rule->get_number_of_seats_value() ==
                                    $number_of_seats
                                ) {
                                    $apply_rule = true;
                                }
                                break;
                            case 'more_than':
                                if (
                                    $rule->get_number_of_seats_value() <
                                    $number_of_seats
                                ) {
                                    $apply_rule = true;
                                }
                                break;
                            case 'less_than':
                                if (
                                    $rule->get_number_of_seats_value() >
                                    $number_of_seats
                                ) {
                                    $apply_rule = true;
                                }
                                break;
                        }

                        break;
                    case 'number_of_timeslots':
                        if ($rule->get_only_same_service() == 'yes') {
                            $i = 0;
                            foreach ($bookings as $booking_this) {
                                if (
                                    $booking_this->get_service() ==
                                    $booking->get_service()
                                ) {
                                    $i++;
                                }
                            }
                            $number_of_timeslots = $i;
                        } else {
                            $number_of_timeslots = count($bookings);
                        }
                        switch ($rule->get_number_of_timeslots_operator()) {
                            case 'equals':
                                if (
                                    $rule->get_number_of_timeslots_value() ==
                                    $number_of_timeslots
                                ) {
                                    $apply_rule = true;
                                }
                                break;
                            case 'more_than':
                                if (
                                    $rule->get_number_of_timeslots_value() <
                                    $number_of_timeslots
                                ) {
                                    $apply_rule = true;
                                }
                                break;
                            case 'less_than':
                                if (
                                    $rule->get_number_of_timeslots_value() >
                                    $number_of_timeslots
                                ) {
                                    $apply_rule = true;
                                }
                                break;
                        }

                        break;
                    case 'day_of_week_and_time':
                        $day_time = json_decode($rule->get_day_time());

                        if (is_array($day_time)) {
                            $slots = [];
                            $sort_array = [];
                            foreach ($day_time as $item) {
                                $dow = date('N', $booking->get_day());
                                if ($dow == $item->day_of_week) {
                                    if (
                                        $booking->get_start() >=
                                            $item->start +
                                                $booking->get_day() &&
                                        $booking->get_start() <
                                            $item->end + $booking->get_day()
                                    ) {
                                        $apply_rule = true;
                                    }
                                }
                            }
                        }
                        break;
                }
                if ($apply_rule) {
                    if (
                        $rule->get_fixed_percent() == 'fixed' ||
                        $rule->get_action() == 'replace'
                    ) {
                        $amount = $rule->get_amount();
                    } else {
                        $amount = ($default_price / 100) * $rule->get_amount();
                    }
                    $amount = $amount * $multiplier;
                    if ($rule->get_related_to_seats_number()) {
                        $amount = $amount / $booking->get_quantity();
                    }
                    $amount_signed = 0;
                    if ($rule->get_is_for_entire_order()) {
                        $amount = $amount / count($bookings);
                    }
                    switch ($rule->get_action()) {
                        case 'increase':
                            $default_price += $amount;
                            $amount_signed = $amount;
                            break;
                        case 'reduce':
                            $default_price -= $amount;
                            $amount_signed = $amount * -1;
                            break;
                        case 'replace':
                            $default_price = $amount;
                            $amount_signed = $amount;
                            break;
                    }
                    $price_details[] = [
                        'type' => 'pricing_rule',
                        'amount' => $amount_signed,
                        'rule_id' => $rule->get_id(),
                        'rule_name' => $rule->get_name(),
                    ];
                }
            }
        }
        if ($switch_back) {
            date_default_timezone_set('UTC');
        }
        $default_price = apply_filters(
            'webba_after_pricing_rule_applied',
            $default_price,
            $booking,
            $bookings
        );
        if ($to_pay == 0) {
            $to_pay = $default_price;
        }
        return [
            'price' => $default_price,
            'price_details' => $price_details,
            'to_pay' => $to_pay,
        ];
    }

    static function get_multiple_booking_price($booking_ids)
    {
        $total = 0;
        foreach ($booking_ids as $booking_id) {
            $booking = new WBK_Booking($booking_id);
            if ($booking->get_name() == '') {
                continue;
            }
            $total +=
                floatval(floatval($booking->get_price())) *
                floatval(floatval($booking->get_quantity()));
        }

        return $total;
    }

    static function get_tax_for_messages()
    {
        if (wbk_is5()) {
            $tax = WBK_Options_Utils::get_tax();
   
            return $tax;
        }
        $tax_rule = get_option('wbk_tax_for_messages', 'paypal');
        if ($tax_rule == 'paypal') {
            $tax = get_option('wbk_paypal_tax', 0);
        }
        if ($tax_rule == 'stripe') {
            $tax = get_option('wbk_stripe_tax', 0);
        }
        if ($tax_rule == 'none') {
            $tax = 0;
        }
        return $tax;
    }

    static function get_total_amount($sub_total, $tax)
    {
        if (is_numeric($tax) && $tax > 0) {
            $tax_amount = ($sub_total / 100) * $tax;
            $total = $sub_total + $tax_amount;
        } else {
            $total = $sub_total;
        }
        return $total;
    }

    static function get_tax_amount($sub_total, $tax)
    {
        if (is_numeric($tax) && $tax > 0) {
            $tax_amount = ($sub_total / 100) * $tax;
        } else {
            $tax_amount = 0;
        }
        return $tax_amount;
    }

    /**
     * Format a numeric value according to the fractional digits setting
     *
     * @param mixed $value The value to format
     * @return mixed Formatted value or original value if null/empty
     */
    static function format_price_number($value)
    {
        if ($value === null || $value === '') {
            return $value;
        }
        $fractional_digits = intval(get_option('wbk_price_fractional', '2'));
        return round(floatval($value), $fractional_digits);
    }
    static function get_service_fees($booking_ids)
    {
        $service_fees = [];
        $service_fee_descriptions = [];
        if (is_array($booking_ids)) {
            foreach ($booking_ids as $booking_id) {
                if (is_numeric($booking_id)) {
                    $booking = new WBK_Booking($booking_id);
                    if (!$booking->is_loaded()) {
                        continue;
                    }
                } else {
                    $booking = $booking_id;
                }
                $service = new WBK_Service($booking->get_service());
                if (!$service->is_loaded()) {
                    continue;
                }
                if ($service->get_fee() !== null) {
                    if (is_numeric($service->get_fee())) {
                        $service_fees[
                            $booking->get_service()
                        ] = $service->get_fee();
                        $service_fee_description = get_option(
                            'wbk_service_fee_description'
                        );
                        $service_fee_description = str_replace(
                            '#service',
                            $service->get_name(),
                            $service_fee_description
                        );
                        $service_fee_descriptions[
                            $booking->get_service()
                        ] = $service_fee_description;
                    }
                }
            }
        }
        $service_fee_total = 0;
        foreach ($service_fees as $fee) {
            $service_fee_total += $fee;
        }
        return [$service_fee_total, $service_fees, $service_fee_descriptions];
    }
    static function get_total_tax_fees($bookings)
    {
        $total_amount = self::get_multiple_booking_price($bookings);
        $service_fee = self::get_service_fees($bookings);
        if (get_option('wbk_do_not_tax_deposit', '') == 'true' && get_option('wbk_add_tax_on_top', '') == 'yes') {
            $tax_value = self::get_tax_amount(
                $total_amount,
                self::get_tax_for_messages()
            );
            $total_amount += $tax_value + $service_fee[0];
        } else {
            $total_amount += $service_fee[0];
            $tax_value = self::get_tax_amount(
                $total_amount,
                self::get_tax_for_messages()
            );
            $total_amount += $tax_value;
        }

        return $total_amount;
    }

    static function get_total_detailed($bookings, $tax = null)
    {
        $total_amount = self::get_multiple_booking_price($bookings);
        $service_fee = self::get_service_fees($bookings);
        if (is_null($tax)) {
            $tax = self::get_tax_for_messages();
        }
        if (get_option('wbk_do_not_tax_deposit', '') == 'true' && get_option('wbk_add_tax_on_top', '') == 'yes') {
            $tax_value = self::get_tax_amount($total_amount, $tax);
            $total_amount += $tax_value + $service_fee[0];
        } else {
            $total_amount += $service_fee[0];
            $tax_value = self::get_tax_amount($total_amount, $tax);
            $total_amount += $tax_value;
        }
        return [
            'total' => $total_amount,
            'fee' => $service_fee[0],
            'tax' => $tax_value,
        ];
    }

    /**
     * Calculate discount amount from coupon code
     *
     * @param string $coupon Coupon code
     * @param float $amount Amount to apply discount to
     * @param array $service_ids Array of service IDs for coupon validation
     * @return float Discount amount
     */
    static function calculate_coupon_discount($coupon, $amount, $service_ids)
    {
        if (empty($coupon) || empty($service_ids) || $amount <= 0) {
            return 0;
        }

        $coupon = esc_html(sanitize_text_field(trim($coupon)));
        $service_ids = array_unique($service_ids);

        // Validate coupon
        $coupon_result = WBK_Validator::check_coupon($coupon, $service_ids);

        if (!is_array($coupon_result)) {
            return 0;
        }

        // Apply coupon discount
        if ($coupon_result[2] == 100) {
            // 100% discount
            return $amount;
        } else {
            // Partial discount
            if ($coupon_result[2] > 0) {
                // Percentage discount
                return ($amount * $coupon_result[2]) / 100;
            } elseif ($coupon_result[1] > 0) {
                // Fixed amount discount
                return $coupon_result[1];
            }
        }

        return 0;
    }

    static function get_payment_items(
        $booking_ids,
        $tax = 0,
        $coupon = null,
        $get_item_names = true
    ) {
        $subtotal = 0;
        $tax_total = 0;
        $discount_total = 0;
        $to_pay_total = 0;
        $woo_total = 0;

        $item_names = [];
        $prices = [];
        $quantities = [];
        $services = [];
        $item_nets = [];
        $item_taxes = [];
        $item_discounts = [];
        $item_to_pays = [];
        $booking_ids_array = [];
        $deposit_items = [];
        $item_service_fees = [];

        $bookings = [];
        foreach ($booking_ids as $booking_id) {
            // Handle both booking IDs and booking objects
            if (is_object($booking_id) && is_a($booking_id, 'WBK_Booking')) {
                $booking = $booking_id;
            } else {
                $booking = new WBK_Booking($booking_id);
                if (!$booking->is_loaded()) {
                    return -4;
                }
            }
            $bookings[] = $booking;
        }

        $is_coupon_fixed = false;
        $coupon_result = null;

        // Determine tax rate to use
        $tax_rate = $tax > 0 ? $tax : self::get_tax_for_messages();

        // Check if coupon is fixed amount
        if ($coupon != false && !is_null($coupon) && is_array($coupon)) {
            if (isset($coupon[1]) && $coupon[1] > 0) {
                $is_coupon_fixed = true;
                $coupon_result = $coupon;
            }
        }
        $has_deposited_item = false;
        foreach ($bookings as $booking) {
            $service = new WBK_Service($booking->get_service());
            if (!$service->is_loaded()) {
                return -4;
            }
            if ($booking->get('status') == 'cancelled') {
                continue;
            }

            // Calculate price using calculate_single_booking_price
            $price = self::calculate_single_booking_price($booking, $bookings);
            $item_price = (float)$price['price'] * (int)$booking->get_quantity();

            // Calculate discount per item
            // Ignore if deposit is enabled
            $discount = 0;
            if ($coupon != false && !is_null($coupon) && is_array($coupon)) {
                if ($is_coupon_fixed) {
                    // Fixed coupon: don't apply discount per item, will apply at subtotal level
                    $discount = 0;
                } else {
                    // Percentage coupon: calculate discount per item from coupon result array
                    if (isset($coupon[2]) && $coupon[2] > 0) {
                        if ($coupon[2] == 100) {
                            // 100% discount
                            $discount = $item_price;
                        } else {
                            // Partial percentage discount
                            $discount = ($item_price / 100) * $coupon[2];
                        }
                    }
                }
            }

            $subtotal += $item_price - $discount;
            $item_net = $item_price - $discount;
            $item_tax = self::get_tax_amount($item_net, $tax_rate);

            $tax_total += $item_tax;
            $discount_total += $discount;

            $to_pay = 0;
            if ($price['to_pay'] != $price['price']) {
                $has_deposited_item = true;
                if ($item_net + $item_tax > $price['to_pay']) {
                    $to_pay = $price['to_pay'] * $booking->get_quantity();
                } else {
                    $to_pay = $item_net + $item_tax * $booking->get_quantity();
                }
            } else {
                $to_pay += $item_net + $item_tax;
            }
            $to_pay_total += $to_pay;
            if ($get_item_names) {
                $item_names[] = WBK_Placeholder_Processor::process_placeholders(
                    get_option('wbk_payment_item_name', ''),
                    $booking->get_id()
                );
            } else {
                $item_names[] = '';
            }

            $woo_total += $to_pay;

            $prices[] = $item_price;
            $quantities[] = $booking->get_quantity();
            $services[] = $booking->get_service();
            $item_nets[] = $item_net;
            $item_taxes[] = $item_tax;
            $item_discounts[] = $discount;
            $item_to_pays[] = $to_pay;
            $booking_ids_array[] = $booking->get_id();
            $deposit_items[] = $price['to_pay'] != $price['price'];
            $item_service_fees[] = self::get_service_fees([$booking_id])[0];
        }

        $subtotal = apply_filters(
            'webba_after_subtotal_calculated',
            $subtotal,
            $booking_ids
        );

        // Apply fixed coupon discount to subtotal if applicable
        if ($is_coupon_fixed && $coupon_result != null) {
            $subtotal -= $coupon_result[1];
            $discount_total += $coupon_result[1];
            $tax_total = self::get_tax_amount($subtotal, $tax_rate);

            // if order has no deposited item, subtract discount from to pay total
            // if order has deposited item, subtract discount from to pay total only if discount is greater than to pay total
            if (!$has_deposited_item) {
                if ($to_pay_total > $coupon_result[1]) {
                    $to_pay_total -=
                        $coupon_result[1] +
                        self::get_tax_amount($discount_total, $tax_rate);
                } else {
                    $to_pay_total = 0;
                }
            }
        }

        // Calculate service fees
        $service_fee = self::get_service_fees($booking_ids);
        $service_fees_total = $service_fee[0];

        if ($service_fees_total > 0) {
            $subtotal += $service_fees_total;
            $item_names[] = implode(', ', $service_fee[2]);
            $prices[] = $service_fees_total;
            $quantities[] = 1;
            $services[] = 'Service fee';

            $item_nets[] = $service_fees_total;
            $item_taxes[] = null;
            $item_discounts[] = null;
            $item_to_pays[] = $service_fees_total;
            $booking_ids_array[] = null;
            if (!$has_deposited_item) {
                $to_pay_total += $service_fees_total;
                $woo_total += $service_fees_total;
            }
        }

        // Calculate service fees tax
        if (get_option('wbk_do_not_tax_deposit', '') != 'true' && get_option('wbk_add_tax_on_top', '') == 'yes') {
            $service_fees_tax = self::get_tax_amount(
                $service_fees_total,
                $tax_rate
            );
            $tax_total += $service_fees_tax;
            if (!$has_deposited_item) {
                $to_pay_total += $service_fees_tax;
                $woo_total += $service_fees_tax;
            }
        }

        $total = $subtotal + $tax_total;

        // Add discount item to payment items if applicable
        $amount_of_discount = $discount_total;
        if ($amount_of_discount > 0) {
            // Insert discount item before service fee
            $discount_index =
                count($item_names) - ($service_fees_total > 0 ? 1 : 0);
            array_splice(
                $item_names,
                $discount_index,
                0,
                get_option(
                    'wbk_payment_discount_item',
                    __('Discount (-)', 'webba-booking-lite')
                )
            );
            array_splice($prices, $discount_index, 0, $amount_of_discount * -1);
            array_splice($quantities, $discount_index, 0, 1);
            array_splice($services, $discount_index, 0, 0);
            // Discount items don't have net/tax/discount breakdowns
            array_splice($item_nets, $discount_index, 0, null);
            array_splice($item_taxes, $discount_index, 0, null);
            array_splice($item_discounts, $discount_index, 0, null);
            array_splice($item_to_pays, $discount_index, 0, null);
            array_splice($booking_ids_array, $discount_index, 0, null);
        }

        // Build items summary array
        $items = [];
        for ($i = 0; $i < count($item_names); $i++) {
            $items[] = [
                'id' => $services[$i],
                'price' => $item_nets[$i],
                'item_to_pay' => $item_to_pays[$i],
                'booking_id' => $booking_ids_array[$i],
                'have_deposit' => $deposit_items[$i],
                'service_fee' => $item_service_fees[$i],
            ];
        }

        // Format all numeric arrays
        $prices = array_map([self::class, 'format_price_number'], $prices);
        $item_nets = array_map(
            [self::class, 'format_price_number'],
            $item_nets
        );
        $item_taxes = array_map(
            [self::class, 'format_price_number'],
            $item_taxes
        );
        $item_discounts = array_map(
            [self::class, 'format_price_number'],
            $item_discounts
        );

        // Format items array
        foreach ($items as &$item) {
            if ($item['price'] !== null) {
                $item['price'] = self::format_price_number($item['price']);
            }
            if ($item['item_to_pay'] !== null) {
                $item['item_to_pay'] = self::format_price_number(
                    $item['item_to_pay']
                );
            }
        }
        unset($item);

        // calculate final woo total
        $woo_total = $woo_total / (1 + $tax_rate / 100);

        // Calculate left_to_pay before formatting to avoid rounding errors
        $left_to_pay = $total - $to_pay_total;

        // Add total service fee to the returned data array
        $data = [
            'item_names' => $item_names,
            'prices' => $prices,
            'tax_to_pay' => self::format_price_number($tax_total),
            'quantities' => $quantities,
            'subtotal' => self::format_price_number($subtotal),
            'total' => self::format_price_number($total),
            'sku' => $services,
            'item_nets' => $item_nets,
            'item_taxes' => $item_taxes,
            'item_discounts' => $item_discounts,
            'to_pay_total' => self::format_price_number($to_pay_total),
            'left_to_pay' => self::format_price_number($left_to_pay),
            'items' => $items,
            'discount' => self::format_price_number($discount_total),
            'service_fees' => self::format_price_number($service_fees_total),
            'woo_total' => self::format_price_number($woo_total),
        ];

        return $data;
    }

    static function get_payment_items_post_booked($booking_ids)
    {
        if (!is_array($booking_ids) || count($booking_ids) == 0) {
            return 0;
        }
        $booking = new WBK_Booking($booking_ids[0]);
        $tax = WBK_Options_Utils::get_tax();
        $coupon_id = $booking->get('coupon');
        $coupon_result = false;
        if (!is_null($coupon_id) && is_numeric($coupon_id) && $coupon_id > 0) {
            $coupon = new WBK_Coupon($coupon_id);
            if ($coupon->is_loaded()) {
                $coupon_result = [
                    $coupon_id,
                    $coupon->get('amount_fixed'),
                    $coupon->get('amount_percentage'),
                ];
            }
        }

        return self::get_payment_items($booking_ids, $tax, $coupon_result);
    }
}
