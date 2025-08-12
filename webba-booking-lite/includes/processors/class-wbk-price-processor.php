<?php
if (!defined('ABSPATH')) {
    exit;
}
class WBK_Price_Processor
{
    static function calculate_single_booking_price($booking, $bookings)
    {
        if (!is_object($booking)) {
            $booking = new WBK_Booking($booking);
            if ($booking->get_name() == '') {
                return array('price' => 0);
            }
            if (is_array($bookings)) {
                $booking_temp = array();
                foreach ($bookings as $booking_id) {
                    $booking_this = new WBK_Booking($booking_id);
                    if ($booking_this->get_name() == '') {
                        continue;
                    }
                    $booking_temp[] = $booking_this;
                }
                $bookings = $booking_temp;
            }
        }
        $service = new WBK_Service($booking->get_service());
        $price_details = array();


        if ($service->get_name() == '') {
            return array('price' => 0);
        }
        $default_price = $service->get_price();
        $price_details[] = array('type' => 'service_price', 'amount' => $default_price, 'service_id' => $service->get_id());

        $sort_array = array();
        $pricing_rules = $service->get_pricing_rules();

        $pricing_rules_obj = array();
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
                            if ($booking->get_day() >= $start && $booking->get_day() <= $end) {
                                $apply_rule = true;
                            }
                        }
                        break;
                    case 'early_booking':
                        $days = ($booking->get_day() - time()) / 86400;
                        if ($days >= $rule->get_days_number() && $rule->get_days_number() <> 0) {
                            $apply_rule = true;
                        }
                        break;
                    case 'custom_field':
                        $custom_field_value = $booking->get_custom_field_value($rule->get_custom_field_id());
                        if (is_numeric($custom_field_value) && $rule->get_multiply_amount() == 'yes') {
                            $multiplier = $custom_field_value;
                        }
                        if (!is_null($custom_field_value)) {
                            switch ($rule->get_custom_field_operator()) {
                                case 'equals':
                                    if ($rule->get_custom_field_value() == $custom_field_value) {
                                        $apply_rule = true;
                                    }
                                    break;
                                case 'more_than':
                                    if (
                                        is_numeric($rule->get_custom_field_value()) && is_numeric($custom_field_value)
                                        && $rule->get_custom_field_value() < $custom_field_value
                                    ) {
                                        $apply_rule = true;
                                    }
                                    break;
                                case 'less_than':
                                    if (
                                        is_numeric($rule->get_custom_field_value()) && is_numeric($custom_field_value)
                                        && $rule->get_custom_field_value() > $custom_field_value
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
                                if ($rule->get_number_of_seats_value() == $number_of_seats) {
                                    $apply_rule = true;
                                }
                                break;
                            case 'more_than':
                                if ($rule->get_number_of_seats_value() < $number_of_seats) {
                                    $apply_rule = true;
                                }
                                break;
                            case 'less_than':
                                if ($rule->get_number_of_seats_value() > $number_of_seats) {
                                    $apply_rule = true;
                                }
                                break;
                        }

                        break;
                    case 'number_of_timeslots':
                        if ($rule->get_only_same_service() == 'yes') {
                            $i = 0;
                            foreach ($bookings as $booking_this) {
                                if ($booking_this->get_service() == $booking->get_service()) {
                                    $i++;
                                }
                            }
                            $number_of_timeslots = $i;
                        } else {
                            $number_of_timeslots = count($bookings);

                        }
                        switch ($rule->get_number_of_timeslots_operator()) {

                            case 'equals':
                                if ($rule->get_number_of_timeslots_value() == $number_of_timeslots) {
                                    $apply_rule = true;
                                }
                                break;
                            case 'more_than':

                                if ($rule->get_number_of_timeslots_value() < $number_of_timeslots) {
                                    $apply_rule = true;
                                }
                                break;
                            case 'less_than':

                                if ($rule->get_number_of_timeslots_value() > $number_of_timeslots) {
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
                                        $booking->get_start() >= ($item->start + $booking->get_day()) &&
                                        $booking->get_start() < ($item->end + $booking->get_day())
                                    ) {
                                        $apply_rule = true;
                                    }
                                }
                            }
                        }
                        break;
                }
                if ($apply_rule) {
                    if ($rule->get_fixed_percent() == 'fixed' || $rule->get_action() == 'replace') {
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
                    $price_details[] = array('type' => 'pricing_rule', 'amount' => $amount_signed, 'rule_id' => $rule->get_id(), 'rule_name' => $rule->get_name());
                }
            }
        }
        if ($switch_back) {
            date_default_timezone_set('UTC');
        }
        $default_price = apply_filters('webba_after_pricing_rule_applied', $default_price, $booking, $bookings);
        return array('price' => $default_price, 'price_details' => $price_details);

    }

    static function get_multiple_booking_price($booking_ids)
    {
        $total = 0;
        foreach ($booking_ids as $booking_id) {
            $booking = new WBK_Booking($booking_id);
            if ($booking->get_name() == '') {
                continue;
            }
            $total += floatval(floatval($booking->get_price())) * floatval(floatval($booking->get_quantity()));

        }

        return $total;
    }

    static function get_tax_for_messages()
    {
        if (wbk_is5()) {
            $tax = get_option('wbk_general_tax', '0');
            if (trim($tax) == '') {
                $tax = '0';
            }
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
            $tax_amount = (($sub_total) / 100) * $tax;
            $total = $sub_total + $tax_amount;
        } else {
            $total = $sub_total;
        }
        return $total;
    }

    static function get_tax_amount($sub_total, $tax)
    {
        if (is_numeric($tax) && $tax > 0) {
            $tax_amount = (($sub_total) / 100) * $tax;
        } else {
            $tax_amount = 0;
        }
        return $tax_amount;
    }
    static function get_servcie_fees($booking_ids)
    {
        $service_fees = array();
        $service_fee_descriptions = array();
        if (is_array($booking_ids)) {
            foreach ($booking_ids as $booking_id) {
                $booking = new WBK_Booking($booking_id);
                if ($booking->get_name() == '') {
                    continue;
                }
                $service = new WBK_Service($booking->get_service());
                if ($service->get_name() == '') {
                    continue;
                }
                if ($service->get_fee() !== null) {
                    if (is_numeric($service->get_fee())) {
                        $service_fees[$booking->get_service()] = $service->get_fee();
                        $service_fee_description = get_option('wbk_service_fee_description');
                        $service_fee_description = str_replace('#service', $service->get_name(), $service_fee_description);
                        $service_fee_descriptions[$booking->get_service()] = $service_fee_description;
                    }
                }
            }
        }
        $service_fee_total = 0;
        foreach ($service_fees as $fee) {
            $service_fee_total += $fee;
        }
        return array($service_fee_total, $service_fees, $service_fee_descriptions);
    }
    static function get_total_tax_fees($bookings)
    {
        $total_amount = self::get_multiple_booking_price($bookings);
        $service_fee = self::get_servcie_fees($bookings);
        if (get_option('wbk_do_not_tax_deposit', '') == 'true') {
            $tax_value = self::get_tax_amount($total_amount, self::get_tax_for_messages());
            $total_amount += $tax_value + $service_fee[0];
        } else {
            $total_amount += $service_fee[0];
            $tax_value = self::get_tax_amount($total_amount, self::get_tax_for_messages());
            $total_amount += $tax_value;
        }

        return $total_amount;
    }

    static function get_total_detailed($bookings, $tax = null)
    {
        $total_amount = self::get_multiple_booking_price($bookings);
        $service_fee = self::get_servcie_fees($bookings);
        if (is_null($tax)) {
            $tax = self::get_tax_for_messages();
        }
        if (get_option('wbk_do_not_tax_deposit', '') == 'true') {
            $tax_value = self::get_tax_amount($total_amount, $tax);
            $total_amount += $tax_value + $service_fee[0];
        } else {
            $total_amount += $service_fee[0];
            $tax_value = self::get_tax_amount($total_amount, $tax);
            $total_amount += $tax_value;
        }
        return array(
            'total' => $total_amount,
            'fee' => $service_fee[0],
            'tax' => $tax_value
        );
    }

    static function get_payment_items($booking_ids, $tax = 0, $coupon = null, $get_item_names = true)
    {
        $subtotal = 0;
        $item_names = array();
        $prices = array();
        $quantities = array();
        $services = array();

        $bookings = [];
        foreach ($booking_ids as $booking_id) {
            $booking = new WBK_Booking($booking_id);
            if (!$booking->is_loaded()) {
                return -4;
            }
            $bookings[] = $booking;
            $service = new WBK_Service($booking->get_service());
            if (!$service->is_loaded()) {
                return -4;
            }
            if ($get_item_names) {
                $item_names[] = WBK_Placeholder_Processor::process_placeholders(get_option('wbk_payment_item_name', ''), $booking_id);
            } else {
                $item_names[] = '';
            }
            if ($booking->get('status') == 'cancelled') {
                continue;
            }
            $prices[] = $booking->get_price();
            $quantities[] = $booking->get_quantity();
            $services[] = $booking->get_service();
            $subtotal += floatval($booking->get_price()) * floatval($booking->get_quantity());

        }
        $subtotal = apply_filters('webba_after_subtotal_calculated', $subtotal, $booking_ids);

        if ($coupon != FALSE && !is_null($coupon)) {
            if ($coupon[1] > 0) {
                $amount_of_discount = $coupon[1];
            } elseif ($coupon[2] > 0) {
                $amount_of_discount = ($subtotal / 100) * $coupon[2];
            }
            $subtotal -= $amount_of_discount;
            $item_names[] = get_option('wbk_payment_discount_item', __('Discount (-)', 'webba-booking-lite'));
            $prices[] = $amount_of_discount * (-1);
            $quantities[] = 1;
            $services[] = 0;

        } else {
            $amount_of_discount = 0;
        }

        $service_fee = WBK_Price_Processor::get_servcie_fees($booking_ids);
        if ($service_fee[0] > 0) {
            $subtotal += $service_fee[0];
            $item_names[] = implode(', ', $service_fee[2]);
            $prices[] = $service_fee[0];
            $quantities[] = 1;
            $services[] = 'Service fee';
        }

        if (get_option('wbk_do_not_tax_deposit', '') == 'true') {
            $tax_to_pay = (($subtotal - $service_fee[0]) / 100) * $tax;
        } else {
            $tax_to_pay = (($subtotal) / 100) * $tax;
        }

        $total = $subtotal + $tax_to_pay;

        $data = array(
            'item_names' => $item_names,
            'prices' => $prices,
            'tax_to_pay' => $tax_to_pay,
            'amount_of_discount' => $amount_of_discount,
            'quantities' => $quantities,
            'subtotal' => $subtotal,
            'total' => $total,
            'sku' => $services,
            'service_fee' => $service_fee
        );

        return $data;
    }

    static function get_payment_items_post_booked($booking_ids)
    {
        if (!is_array($booking_ids) || count($booking_ids) == 0) {
            return 0;
        }
        $booking = new WBK_Booking($booking_ids[0]);
        $tax = get_option('wbk_general_tax', '0');
        if (trim($tax) == '') {
            $tax = '0';
        }
        $coupon_id = $booking->get('coupon');
        $coupon_result = FALSE;
        if (!is_null($coupon_id) && is_numeric($coupon_id) && $coupon_id > 0) {
            $coupon = new WBK_Coupon($coupon_id);
            if ($coupon->is_loaded()) {
                $coupon_result = array($coupon_id, $coupon->get('amount_fixed'), $coupon->get('amount_percentage'));
            }
        }


        return self::get_payment_items($booking_ids, $tax, $coupon_result);

    }

}
