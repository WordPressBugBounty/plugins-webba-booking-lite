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
        $get_item_names = true,
        $pay_full_amount = false
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
        $item_staffs = [];

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
            $is_deposit = !$pay_full_amount && ($price['to_pay'] != $price['price']);
            if ($is_deposit) {
                $has_deposited_item = true;
                if ($item_net + $item_tax > $price['to_pay']) {
                    $to_pay = $price['to_pay'] * $booking->get_quantity();
                } else {
                    $to_pay = $item_net + $item_tax * $booking->get_quantity();
                }
            } else {
                $to_pay = $item_net + $item_tax;
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
            $deposit_items[] = $is_deposit;
            $item_service_fees[] = self::get_service_fees([$booking_id])[0];
            $item_staffs[] = $booking->get_staff_member();
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
                'staff_member' => $item_staffs[$i] ?? null,
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

    /**
     * Build payment items for unit bookings.
     *
     * Expected row shape:
     * [
     *   "unit_id" => int,
     *   "range" => ["start" => "Y-m-d", "end" => "Y-m-d"],
     *   "number_of_people" => array|int|null,
     *   "location_id" => int|null
     * ]
     *
     * @param array      $unit_bookings Unit booking rows.
     * @param array|null $coupon Coupon result array from WBK_Validator::check_coupon.
     * @param bool       $pay_full_amount Kept for signature parity, not used for units.
     * @return array|int
     */
    static function get_unit_payment_items($unit_bookings, $coupon = null, $pay_full_amount = false)
    {
        if (!is_array($unit_bookings)) {
            return -4;
        }

        $subtotal = 0.0;
        $tax_total = 0.0;
        $discount_total = 0.0;
        $to_pay_total = 0.0;
        $woo_total = 0.0;

        $item_names = [];
        $prices = [];
        $quantities = [];
        $sku = [];
        $item_nets = [];
        $item_taxes = [];
        $item_discounts = [];
        $items = [];
        $unit_breakdowns = [];
        $unit_ids = [];

        foreach ($unit_bookings as $unit_booking) {
            if (!is_array($unit_booking)) {
                return -4;
            }
            $unit_id = isset($unit_booking["unit_id"]) ? (int) $unit_booking["unit_id"] : 0;
            if ($unit_id < 1) {
                return -4;
            }
            $range = isset($unit_booking["range"]) && is_array($unit_booking["range"])
                ? $unit_booking["range"]
                : null;
            if (!$range || !isset($range["start"], $range["end"])) {
                return -4;
            }

            $number_of_people = array_key_exists("number_of_people", $unit_booking)
                ? $unit_booking["number_of_people"]
                : null;
            $location_id = null;
            if (isset($unit_booking["location_id"]) && is_numeric($unit_booking["location_id"])) {
                $location_id = (int) $unit_booking["location_id"];
            } elseif (isset($unit_booking["location"]) && is_numeric($unit_booking["location"])) {
                $location_id = (int) $unit_booking["location"];
            }

            $availability_payload = WBK_Unit_Availability_Processor::get_availability_for_range(
                $unit_id,
                $range,
                $number_of_people,
                $location_id,
            );
            if ($availability_payload === false) {
                return -4;
            }

            $availability = is_string($availability_payload)
                ? json_decode($availability_payload, true)
                : $availability_payload;
            if (!is_array($availability)) {
                return -4;
            }

            $line_subtotal = isset($availability["subtotal"]) ? (float) $availability["subtotal"] : 0.0;
            $line_tax = isset($availability["tax"]) ? (float) $availability["tax"] : 0.0;
            $line_total = isset($availability["total"]) ? (float) $availability["total"] : 0.0;

            $subtotal += $line_subtotal;
            $tax_total += $line_tax;
            $to_pay_total += $line_total;
            $woo_total += $line_total;
            $unit_ids[] = $unit_id;
            $unit_breakdowns[] = isset($availability["breakdown"]) && is_array($availability["breakdown"])
                ? $availability["breakdown"]
                : [];

            $item_names[] = "";
            $prices[] = self::format_price_number($line_subtotal);
            $quantities[] = 1;
            $sku[] = $unit_id;
            $item_nets[] = self::format_price_number($line_subtotal);
            $item_taxes[] = self::format_price_number($line_tax);
            $item_discounts[] = self::format_price_number(0);
            $items[] = [
                "id" => $unit_id,
                "price" => self::format_price_number($line_subtotal),
                "item_to_pay" => self::format_price_number($line_total),
                "booking_id" => null,
                "have_deposit" => false,
                "service_fee" => 0,
                "staff_member" => null,
            ];
        }

        // Coupon behavior aligned with service payment details output shape.
        if (is_array($coupon)) {
            if (isset($coupon[2]) && (float) $coupon[2] > 0) {
                $discount_total = ($subtotal * (float) $coupon[2]) / 100;
            } elseif (isset($coupon[1]) && (float) $coupon[1] > 0) {
                $discount_total = (float) $coupon[1];
            }
        }

        if ($discount_total > 0) {
            $subtotal = max(0, $subtotal - $discount_total);
            $tax_rate = self::get_tax_for_messages();
            $tax_total = self::get_tax_amount($subtotal, $tax_rate);
            $to_pay_total = $subtotal + $tax_total;
        }

        $total = $subtotal + $tax_total;
        $left_to_pay = 0;
        $effective_tax_rate = self::get_tax_for_messages();
        $woo_total = $effective_tax_rate > 0
            ? $to_pay_total / (1 + $effective_tax_rate / 100)
            : $to_pay_total;

        return [
            "item_names" => $item_names,
            "prices" => $prices,
            "tax_to_pay" => self::format_price_number($tax_total),
            "quantities" => $quantities,
            "subtotal" => self::format_price_number($subtotal),
            "total" => self::format_price_number($total),
            "sku" => $sku,
            "item_nets" => $item_nets,
            "item_taxes" => $item_taxes,
            "item_discounts" => $item_discounts,
            "to_pay_total" => self::format_price_number($to_pay_total),
            "left_to_pay" => self::format_price_number($left_to_pay),
            "items" => $items,
            "discount" => self::format_price_number($discount_total),
            "service_fees" => self::format_price_number(0),
            "woo_total" => self::format_price_number($woo_total),
            "unit_breakdowns" => $unit_breakdowns,
            "unit_ids" => array_values(array_unique($unit_ids)),
        ];
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

    static function get_unit_payment_items_post_booked($booking_ids)
    {
        if (!is_array($booking_ids) || count($booking_ids) == 0) {
            return 0;
        }

        $first_booking = new WBK_Booking($booking_ids[0]);
        if (!$first_booking->is_loaded()) {
            return -4;
        }

        $coupon_id = $first_booking->get('coupon');
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

        $unit_bookings = [];
        foreach ($booking_ids as $booking_id) {
            $booking = new WBK_Booking($booking_id);
            if (!$booking->is_loaded()) {
                continue;
            }

            $unit_id = (int) $booking->get('unit_id');
            if ($unit_id < 1) {
                continue;
            }

            $start_day = strtotime(date('Y-m-d', (int) $booking->get('time')));
            $duration_minutes = (int) $booking->get('duration');
            $duration_days = max(1, (int) ceil($duration_minutes / 1440));
            $end_day = $start_day + (($duration_days - 1) * DAY_IN_SECONDS);

            $number_of_people = null;
            $people_raw = $booking->get('number_of_people');
            if (is_string($people_raw) && $people_raw !== '') {
                $decoded_people = json_decode($people_raw, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded_people)) {
                    $number_of_people = $decoded_people;
                } elseif (is_numeric($people_raw)) {
                    $number_of_people = (int) $people_raw;
                }
            } elseif (is_numeric($people_raw)) {
                $number_of_people = (int) $people_raw;
            }

            $location_id = null;
            $location_raw = $booking->get('location_id');
            if (is_numeric($location_raw) && (int) $location_raw > 0) {
                $location_id = (int) $location_raw;
            }

            $unit_bookings[] = [
                'unit_id' => $unit_id,
                'range' => [
                    'start' => date('Y-m-d', $start_day),
                    'end' => date('Y-m-d', $end_day),
                ],
                'number_of_people' => $number_of_people,
                'location_id' => $location_id,
            ];
        }

        if (empty($unit_bookings)) {
            return -4;
        }

        $payment_items = self::get_unit_payment_items($unit_bookings, $coupon_result, false);
        if ($payment_items !== -4) {
            return $payment_items;
        }

        // Fallback for post-booked unit rows: avoid availability-based failures
        // caused by counting the just-created booking in the same range.
        $subtotal = 0.0;
        $tax_total = 0.0;
        $to_pay_total = 0.0;
        $item_names = [];
        $prices = [];
        $quantities = [];
        $sku = [];
        $item_nets = [];
        $item_taxes = [];
        $item_discounts = [];
        $items = [];
        $unit_breakdowns = [];
        $unit_ids = [];

        foreach ($unit_bookings as $unit_booking) {
            $unit_id = (int) ($unit_booking['unit_id'] ?? 0);
            $range = $unit_booking['range'] ?? null;
            if ($unit_id < 1 || !is_array($range) || !isset($range['start'], $range['end'])) {
                continue;
            }
            $unit = new WBK_Unit($unit_id);
            if (!$unit->is_loaded()) {
                continue;
            }

            $start_day = strtotime((string) $range['start']);
            $end_day = strtotime((string) $range['end']);
            if ($start_day === false || $end_day === false || $end_day < $start_day) {
                continue;
            }
            $start_day = strtotime(date('Y-m-d', $start_day));
            $end_day = strtotime(date('Y-m-d', $end_day));

            $number_of_people = $unit_booking['number_of_people'] ?? null;
            $unit_price = $unit->get_price();
            $line_subtotal = 0.0;
            $line_breakdown = [
                'weekday' => ['days' => 0, 'subtotal' => 0.0],
                'weekend' => ['days' => 0, 'subtotal' => 0.0],
            ];

            for ($day = $start_day; $day <= $end_day; $day += DAY_IN_SECONDS) {
                $is_weekend = in_array((int) date('N', $day), [6, 7], true);
                $pricing_key = $is_weekend ? 'weekend_holiday' : 'weekday';
                $day_type = $is_weekend ? 'weekend' : 'weekday';
                $day_total = 0.0;
                $line_breakdown[$day_type]['days']++;

                if ($unit->get_charge_per_person() && is_array($number_of_people)) {
                    $pricing_data = [];
                    if (
                        is_array($unit_price) &&
                        isset($unit_price['pricing']) &&
                        is_array($unit_price['pricing']) &&
                        isset($unit_price['pricing'][$pricing_key]) &&
                        is_array($unit_price['pricing'][$pricing_key])
                    ) {
                        $pricing_data = $unit_price['pricing'][$pricing_key];
                    }
                    $adult_count = max(0, (int) ($number_of_people['adult'] ?? 0));
                    $child_count = max(0, (int) ($number_of_people['child'] ?? 0));
                    $infant_count = max(0, (int) ($number_of_people['infant'] ?? 0));
                    $day_total =
                        ((float) ($pricing_data['adult'] ?? 0) * $adult_count) +
                        ((float) ($pricing_data['child'] ?? 0) * $child_count) +
                        ((float) ($pricing_data['infant'] ?? 0) * $infant_count);
                } else {
                    if (
                        isset($unit_price['pricing']) &&
                        is_array($unit_price['pricing']) &&
                        isset($unit_price['pricing'][$pricing_key])
                    ) {
                        $bucket = $unit_price['pricing'][$pricing_key];
                        if (is_numeric($bucket)) {
                            $day_total = (float) $bucket;
                        } elseif (is_array($bucket)) {
                            $day_total = (float) ($bucket['price'] ?? 0);
                        }
                    }
                }

                $line_breakdown[$day_type]['subtotal'] += $day_total;
                $line_subtotal += $day_total;
            }

            $line_tax = self::get_tax_amount($line_subtotal, self::get_tax_for_messages());
            $line_total = $line_subtotal + $line_tax;

            $subtotal += $line_subtotal;
            $tax_total += $line_tax;
            $to_pay_total += $line_total;
            $unit_ids[] = $unit_id;
            $unit_breakdowns[] = $line_breakdown;
            $item_names[] = '';
            $prices[] = self::format_price_number($line_subtotal);
            $quantities[] = 1;
            $sku[] = $unit_id;
            $item_nets[] = self::format_price_number($line_subtotal);
            $item_taxes[] = self::format_price_number($line_tax);
            $item_discounts[] = self::format_price_number(0);
            $items[] = [
                'id' => $unit_id,
                'price' => self::format_price_number($line_subtotal),
                'item_to_pay' => self::format_price_number($line_total),
                'booking_id' => null,
                'have_deposit' => false,
                'service_fee' => 0,
                'staff_member' => null,
            ];
        }

        if (empty($unit_ids)) {
            return -4;
        }

        $discount_total = 0.0;
        if (is_array($coupon_result)) {
            if (isset($coupon_result[2]) && (float) $coupon_result[2] > 0) {
                $discount_total = ($subtotal * (float) $coupon_result[2]) / 100;
            } elseif (isset($coupon_result[1]) && (float) $coupon_result[1] > 0) {
                $discount_total = (float) $coupon_result[1];
            }
        }
        if ($discount_total > 0) {
            $subtotal = max(0, $subtotal - $discount_total);
            $tax_total = self::get_tax_amount($subtotal, self::get_tax_for_messages());
            $to_pay_total = $subtotal + $tax_total;
        }

        $total = $subtotal + $tax_total;
        $woo_total = self::get_tax_for_messages() > 0
            ? $to_pay_total / (1 + self::get_tax_for_messages() / 100)
            : $to_pay_total;

        return [
            'item_names' => $item_names,
            'prices' => $prices,
            'tax_to_pay' => self::format_price_number($tax_total),
            'quantities' => $quantities,
            'subtotal' => self::format_price_number($subtotal),
            'total' => self::format_price_number($total),
            'sku' => $sku,
            'item_nets' => $item_nets,
            'item_taxes' => $item_taxes,
            'item_discounts' => $item_discounts,
            'to_pay_total' => self::format_price_number($to_pay_total),
            'left_to_pay' => self::format_price_number(0),
            'items' => $items,
            'discount' => self::format_price_number($discount_total),
            'service_fees' => self::format_price_number(0),
            'woo_total' => self::format_price_number($woo_total),
            'unit_breakdowns' => $unit_breakdowns,
            'unit_ids' => array_values(array_unique($unit_ids)),
        ];
    }

    /**
     * Decode extra IDs from a service/unit "extras" JSON field.
     *
     * @param mixed $raw
     * @return int[]
     */
    private static function decode_extra_ids_from_entity_field($raw)
    {
        if ($raw === null || $raw === '' || $raw === false) {
            return [];
        }
        if (is_array($raw)) {
            $decoded = $raw;
        } else {
            $decoded = json_decode((string) $raw);
            if (!is_array($decoded)) {
                $decoded = json_decode(stripslashes((string) $raw));
            }
        }
        if (!is_array($decoded)) {
            return [];
        }
        $ids = [];
        foreach ($decoded as $extra_id_item) {
            if ($extra_id_item === null || $extra_id_item === '') {
                continue;
            }
            $extra_id_int = (int) $extra_id_item;
            if ($extra_id_int > 0) {
                $ids[] = $extra_id_int;
            }
        }
        return array_values(array_unique($ids));
    }

    /**
     * @param int $service_id
     * @return int[]
     */
    public static function get_allowed_extra_ids_for_service($service_id)
    {
        $service_id = (int) $service_id;
        if ($service_id < 1) {
            return [];
        }
        $service = new WBK_Service($service_id);
        if (!$service->is_loaded()) {
            return [];
        }
        return self::decode_extra_ids_from_entity_field($service->get('extras'));
    }

    /**
     * @param int $unit_id
     * @return int[]
     */
    public static function get_allowed_extra_ids_for_unit($unit_id)
    {
        $unit_id = (int) $unit_id;
        if ($unit_id < 1) {
            return [];
        }
        $unit = new WBK_Unit($unit_id);
        if (!$unit->is_loaded()) {
            return [];
        }
        return self::decode_extra_ids_from_entity_field($unit->get('extras'));
    }

    /**
     * @param array<int, int[]> $lists
     * @return int[]
     */
    public static function union_allowed_extra_id_lists(array $lists)
    {
        $seen = [];
        foreach ($lists as $list) {
            foreach ($list as $id) {
                $id = (int) $id;
                if ($id > 0) {
                    $seen[$id] = true;
                }
            }
        }
        ksort($seen, SORT_NUMERIC);
        return array_map('intval', array_keys($seen));
    }

    /**
     * Extra IDs quotable on the order if any booked service allows them (union per service).
     *
     * @param int[] $service_ids
     * @return int[]
     */
    public static function collect_allowed_extra_ids_for_services(array $service_ids)
    {
        $service_ids = array_values(array_unique(array_map('intval', $service_ids)));
        $lists = [];
        foreach ($service_ids as $sid) {
            if ($sid > 0) {
                $lists[] = self::get_allowed_extra_ids_for_service($sid);
            }
        }
        return self::union_allowed_extra_id_lists($lists);
    }

    /**
     * Extra IDs quotable on the order if any booked unit allows them (union per unit type in the quote).
     *
     * @param array[] $unit_bookings
     * @return int[]
     */
    public static function collect_allowed_extra_ids_for_units(array $unit_bookings)
    {
        $unit_ids = [];
        foreach ($unit_bookings as $row) {
            if (!is_array($row)) {
                continue;
            }
            $uid = isset($row['unit_id']) ? (int) $row['unit_id'] : 0;
            if ($uid > 0) {
                $unit_ids[] = $uid;
            }
        }
        $unit_ids = array_values(array_unique($unit_ids));
        $lists = [];
        foreach ($unit_ids as $uid) {
            $lists[] = self::get_allowed_extra_ids_for_unit($uid);
        }
        return self::union_allowed_extra_id_lists($lists);
    }

    /**
     * Validate ordered extras (entire order, not per timeslot) and build line totals.
     *
     * @param mixed $ordered_extras id => quantity map from REST
     * @param int[] $allowed_ids ids allowed for this quote
     * @return array{lines: array<int, array<string, mixed>>, error?: string}
     */
    public static function parse_ordered_extras_for_quote($ordered_extras, array $allowed_ids)
    {
        if ($ordered_extras === null || $ordered_extras === '' || $ordered_extras === []) {
            return ['lines' => []];
        }
        if (is_object($ordered_extras)) {
            $ordered_extras = json_decode(json_encode($ordered_extras), true);
        }
        if (!is_array($ordered_extras)) {
            return ['lines' => [], 'error' => __('Invalid ordered_extras', 'webba-booking-lite')];
        }

        $allowed_lookup = array_fill_keys($allowed_ids, true);
        $lines = [];

        foreach ($ordered_extras as $id_key => $qty_val) {
            $extra_id = is_int($id_key) ? $id_key : (int) $id_key;
            $qty = (int) $qty_val;
            if ($extra_id < 1 || $qty < 1) {
                return [
                    'lines' => [],
                    'error' => __('Invalid extra id or quantity in ordered_extras', 'webba-booking-lite'),
                ];
            }
            if (!isset($allowed_lookup[$extra_id])) {
                return [
                    'lines' => [],
                    'error' => __('Extra is not available for this booking', 'webba-booking-lite'),
                ];
            }
            if (isset($lines[$extra_id])) {
                return [
                    'lines' => [],
                    'error' => __('Duplicate extra id in ordered_extras', 'webba-booking-lite'),
                ];
            }

            $extra_obj = new WBK_Extra($extra_id);
            if (!$extra_obj->is_loaded()) {
                return ['lines' => [], 'error' => __('Invalid extra', 'webba-booking-lite')];
            }
            $min_q = $extra_obj->get_min_quantity();
            $max_q = $extra_obj->get_max_quantity();
            if ($qty < $min_q || $qty > $max_q) {
                return [
                    'lines' => [],
                    'error' => __('Extra quantity out of range', 'webba-booking-lite'),
                ];
            }

            $unit_price = $extra_obj->get_price();
            if (!is_numeric($unit_price)) {
                return ['lines' => [], 'error' => __('Invalid extra price', 'webba-booking-lite')];
            }
            $unit_price = (float) $unit_price;

            $catalog = WBK_Model::get_extras();
            $base_name = isset($catalog[$extra_id]) ? $catalog[$extra_id] : '';
            $name = WBK_Translation_Processor::translate_string(
                'webba_extra_' . $extra_id,
                $base_name,
            );

            $lines[$extra_id] = [
                'id' => $extra_id,
                'quantity' => $qty,
                'name' => $name,
                'unit_price' => $unit_price,
                'line_net' => $unit_price * $qty,
            ];
        }

        return ['lines' => array_values($lines)];
    }

    /**
     * Add order-level extras to a payment quote: increases subtotal and tax.
     *
     * @param array      $payment_data from get_payment_items / get_unit_payment_items (modified in place)
     * @param array      $lines        from parse_ordered_extras_for_quote
     * @param string     $tax_mode     services|units — units recap tax on whole subtotal after extras
     */
    public static function apply_ordered_extras_to_payment_data(
        array &$payment_data,
        array $lines,
        $tax_mode = 'services'
    ) {
        if (empty($lines)) {
            return;
        }

        $tax_rate = self::get_tax_for_messages();
        $extras_subtotal_add = 0.0;

        foreach ($lines as $line) {
            $net = (float) $line['line_net'];
            $extras_subtotal_add += $net;
            $extra_id = (int) $line['id'];
            $name = (string) $line['name'];
            $qty = (int) $line['quantity'];
            $line_tax = self::get_tax_amount($net, $tax_rate);
            $line_to_pay = $net + $line_tax;

            $payment_data['item_names'][] = $name;
            $payment_data['prices'][] = self::format_price_number($net);
            $payment_data['quantities'][] = $qty;
            $payment_data['sku'][] = 'extra:' . $extra_id;
            $payment_data['item_nets'][] = self::format_price_number($net);
            $payment_data['item_taxes'][] = self::format_price_number($line_tax);
            $payment_data['item_discounts'][] = self::format_price_number(0);
            $payment_data['items'][] = [
                'id' => 'extra:' . $extra_id,
                'price' => self::format_price_number($net),
                'item_to_pay' => self::format_price_number($line_to_pay),
                'booking_id' => null,
                'have_deposit' => false,
                'service_fee' => 0,
                'staff_member' => null,
            ];
        }

        $new_subtotal = floatval($payment_data['subtotal']) + $extras_subtotal_add;

        if ($tax_mode === 'units') {
            $new_tax = self::get_tax_amount($new_subtotal, $tax_rate);
            $new_total = $new_subtotal + $new_tax;
            $payment_data['subtotal'] = self::format_price_number($new_subtotal);
            $payment_data['tax_to_pay'] = self::format_price_number($new_tax);
            $payment_data['total'] = self::format_price_number($new_total);
            $payment_data['to_pay_total'] = self::format_price_number($new_total);
            $payment_data['left_to_pay'] = self::format_price_number(0);
        } else {
            $extras_tax_add = 0.0;
            foreach ($lines as $line) {
                $extras_tax_add += self::get_tax_amount((float) $line['line_net'], $tax_rate);
            }
            $payment_data['subtotal'] = self::format_price_number($new_subtotal);
            $payment_data['tax_to_pay'] = self::format_price_number(
                floatval($payment_data['tax_to_pay']) + $extras_tax_add
            );
            $payment_data['total'] = self::format_price_number(
                floatval($payment_data['subtotal']) + floatval($payment_data['tax_to_pay'])
            );
            $extras_to_pay_add = 0.0;
            foreach ($lines as $line) {
                $net = (float) $line['line_net'];
                $extras_to_pay_add += $net + self::get_tax_amount($net, $tax_rate);
            }
            $payment_data['to_pay_total'] = self::format_price_number(
                floatval($payment_data['to_pay_total']) + $extras_to_pay_add
            );
            $payment_data['left_to_pay'] = self::format_price_number(
                floatval($payment_data['total']) - floatval($payment_data['to_pay_total'])
            );
        }

        $effective_tax_rate = self::get_tax_for_messages();
        $payment_data['woo_total'] = self::format_price_number(
            $effective_tax_rate > 0
                ? floatval($payment_data['to_pay_total']) / (1 + $effective_tax_rate / 100)
                : floatval($payment_data['to_pay_total'])
        );

        $ordered_payload = [];
        foreach ($lines as $line) {
            $ordered_payload[] = [
                'id' => (int) $line['id'],
                'quantity' => (int) $line['quantity'],
                'line_net' => self::format_price_number((float) $line['line_net']),
            ];
        }
        $payment_data['ordered_extras'] = $ordered_payload;
        $payment_data['ordered_extras_subtotal'] = self::format_price_number($extras_subtotal_add);
    }
}
