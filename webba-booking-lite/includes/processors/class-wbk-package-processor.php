<?php
if (!defined("ABSPATH")) {
    exit();
}

/**
 * Visit package purchase, redemption, and cancel restore.
 */
class WBK_Package_Processor
{
    /**
     * @return bool
     */
    public static function is_enabled()
    {
        if (!WBK_Feature_Gate::have_required_plan("premium")) {
            return false;
        }
        return get_option("wbk_packages_enabled", "yes") === "yes";
    }

    /**
     * Credits required for a booking quantity (MVP: 1 per seat).
     *
     * @param int $quantity
     * @return int
     */
    public static function credits_for_quantity($quantity)
    {
        return max(1, absint($quantity));
    }

    /**
     * Validate that a package can cover a booking.
     *
     * @param int $package_id
     * @param int $user_id
     * @param int $service_id
     * @param int $booking_time
     * @param int $quantity
     * @param int $exclude_booking_id
     * @return WBK_Customer_Package|WP_Error
     */
    public static function validate_redemption(
        $package_id,
        $user_id,
        $service_id,
        $booking_time,
        $quantity = 1,
        $exclude_booking_id = 0
    ) {
        if (!self::is_enabled()) {
            return new WP_Error(
                "packages_disabled",
                __("Visit packages are not available.", "webba-booking-lite"),
                ["status" => 400],
            );
        }

        $package = new WBK_Customer_Package(absint($package_id));
        if (!$package->is_loaded()) {
            return new WP_Error(
                "package_not_found",
                __("Package not found.", "webba-booking-lite"),
                ["status" => 404],
            );
        }
        if (absint($package->get("user_id")) !== absint($user_id)) {
            return new WP_Error(
                "package_not_owned",
                __("This package belongs to another account.", "webba-booking-lite"),
                ["status" => 403],
            );
        }
        if (!$package->is_redeemable()) {
            return new WP_Error(
                "package_not_redeemable",
                __("This package cannot be used.", "webba-booking-lite"),
                ["status" => 400],
            );
        }
        if (!$package->is_service_eligible($service_id)) {
            return new WP_Error(
                "package_service_ineligible",
                __("This package does not cover the selected service.", "webba-booking-lite"),
                ["status" => 400],
            );
        }

        $credits = self::credits_for_quantity($quantity);
        if ($package->get_available_credits() < $credits) {
            return new WP_Error(
                "package_insufficient_credits",
                __("Not enough package visits remaining.", "webba-booking-lite"),
                ["status" => 400],
            );
        }

        $freq = $package->check_frequency_rules($booking_time, $exclude_booking_id);
        if (is_wp_error($freq)) {
            return $freq;
        }

        return $package;
    }

    /**
     * Pick best redeemable package for user/service.
     *
     * @param int $user_id
     * @param int $service_id
     * @param int $booking_time
     * @param int $quantity
     * @return WBK_Customer_Package|null
     */
    public static function find_best_package($user_id, $service_id, $booking_time, $quantity = 1)
    {
        $packages = WBK_Customer_Package::get_redeemable_for_user($user_id, $service_id);
        $credits = self::credits_for_quantity($quantity);
        foreach ($packages as $package) {
            if ($package->get_available_credits() < $credits) {
                continue;
            }
            $freq = $package->check_frequency_rules($booking_time);
            if (is_wp_error($freq)) {
                continue;
            }
            return $package;
        }
        return null;
    }

    /**
     * Apply package to bookings after create / on pay.
     *
     * @param array $booking_ids
     * @param int   $package_id
     * @param bool  $consume_immediately
     * @return true|WP_Error
     */
    public static function apply_to_bookings(array $booking_ids, $package_id, $consume_immediately = false)
    {
        if (empty($booking_ids)) {
            return true;
        }

        $user_id = get_current_user_id();
        $first = new WBK_Booking(absint($booking_ids[0]));
        if (!$first->is_loaded()) {
            return new WP_Error("invalid_booking", __("Invalid booking.", "webba-booking-lite"));
        }

        if ($user_id <= 0) {
            $user = get_user_by("email", $first->get("email"));
            $user_id = $user ? absint($user->ID) : 0;
        }
        if ($user_id <= 0) {
            return new WP_Error(
                "package_login_required",
                __("Please log in to use a visit package.", "webba-booking-lite"),
                ["status" => 401],
            );
        }

        $total_credits = 0;
        foreach ($booking_ids as $booking_id) {
            $booking = new WBK_Booking(absint($booking_id));
            if (!$booking->is_loaded()) {
                continue;
            }
            $total_credits += self::credits_for_quantity(max(1, absint($booking->get("quantity"))));
        }

        $package = self::validate_redemption(
            $package_id,
            $user_id,
            absint($first->get("service_id")),
            absint($first->get("time")),
            $total_credits,
        );
        if (is_wp_error($package)) {
            return $package;
        }

        $hold = $package->hold_credits($total_credits, absint($booking_ids[0]), "customer");
        if (is_wp_error($hold)) {
            return $hold;
        }

        foreach ($booking_ids as $booking_id) {
            $booking = new WBK_Booking(absint($booking_id));
            if (!$booking->is_loaded()) {
                continue;
            }
            $credits = self::credits_for_quantity(max(1, absint($booking->get("quantity"))));
            $booking->set("package_id", absint($package->get_id()));
            $booking->set("package_credits_used", $credits);
            $booking->set("payment_method", "package");
            $booking->set("moment_price", "0");
            $booking->save();
        }

        if ($consume_immediately) {
            return self::consume_for_bookings($booking_ids);
        }

        return true;
    }

    /**
     * Price of one visit on a customer package.
     *
     * Uses the package price divided by the visits allocated to that package.
     *
     * @param WBK_Customer_Package $package Customer package being redeemed.
     * @return float
     */
    public static function visit_price($package)
    {
        $visits = max(1, absint($package->get("total_credits")));
        $price = 0.0;
        $product = new WBK_Package_Product(absint($package->get("product_id")));
        if ($product->is_loaded()) {
            $price = $product->get_price();
            if (absint($package->get("total_credits")) <= 0) {
                $visits = $product->get_visit_count();
            }
        }
        if ($price <= 0) {
            $price = floatval($package->get("amount_paid"));
        }

        return $visits > 0 ? $price / $visits : 0.0;
    }

    /**
     * Paid amounts for bookings redeemed with a package.
     *
     * Each booking is charged the visit price times its quantity.
     * Several time slots are separate bookings, so each one is charged.
     *
     * @param array $booking_ids Booking ids created for this checkout.
     * @return array{total: float, per_booking: array<int, float>}
     */
    public static function payment_amounts_for_bookings(array $booking_ids)
    {
        $per_booking = [];
        $total = 0.0;
        if (empty($booking_ids)) {
            return ["total" => $total, "per_booking" => $per_booking];
        }

        $first = new WBK_Booking(absint($booking_ids[0]));
        if (!$first->is_loaded()) {
            return ["total" => $total, "per_booking" => $per_booking];
        }

        $package = new WBK_Customer_Package(absint($first->get("package_id")));
        if (!$package->is_loaded()) {
            return ["total" => $total, "per_booking" => $per_booking];
        }

        $visit_price = self::visit_price($package);
        foreach ($booking_ids as $booking_id) {
            $booking = new WBK_Booking(absint($booking_id));
            if (!$booking->is_loaded()) {
                continue;
            }
            $credits = self::credits_for_quantity(max(1, absint($booking->get("quantity"))));
            $amount = $visit_price * $credits;
            $per_booking[absint($booking_id)] = $amount;
            $total += $amount;
        }

        return ["total" => $total, "per_booking" => $per_booking];
    }

    /**
     * Store the package price and amount paid on each booking.
     *
     * @param array<int, float> $per_booking Amount owed by each booking id.
     * @return void
     */
    public static function assign_paid_amounts(array $per_booking)
    {
        $decimals = absint(get_option("wbk_price_fractional", "2"));
        $separator = (string) get_option("wbk_price_separator", ".");
        foreach ($per_booking as $booking_id => $amount) {
            $booking = new WBK_Booking(absint($booking_id));
            if (!$booking->is_loaded()) {
                continue;
            }
            $formatted = number_format((float) $amount, $decimals, $separator, "");
            $booking->set("moment_price", $formatted);
            $booking->set("amount_paid", $formatted);
            $booking->set("payment_method", "package");
            $booking->save();
        }
    }

    /**
     * Finalize credit consumption for package-paid bookings.
     *
     * @param array $booking_ids
     * @return true|WP_Error
     */
    public static function consume_for_bookings(array $booking_ids)
    {
        $by_package = [];
        foreach ($booking_ids as $booking_id) {
            $booking = new WBK_Booking(absint($booking_id));
            if (!$booking->is_loaded()) {
                continue;
            }
            $package_id = absint($booking->get("package_id"));
            $credits = absint($booking->get("package_credits_used"));
            if ($package_id <= 0 || $credits <= 0) {
                continue;
            }
            if (!isset($by_package[$package_id])) {
                $by_package[$package_id] = ["credits" => 0, "booking_id" => absint($booking_id)];
            }
            $by_package[$package_id]["credits"] += $credits;
        }

        foreach ($by_package as $package_id => $data) {
            $package = new WBK_Customer_Package($package_id);
            if (!$package->is_loaded()) {
                continue;
            }
            $result = $package->consume_credits(
                $data["credits"],
                $data["booking_id"],
                "system",
                true,
            );
            if (is_wp_error($result)) {
                return $result;
            }
        }
        return true;
    }

    /**
     * Restore or forfeit package credits when a booking is cancelled.
     *
     * @param int    $booking_id
     * @param string $by customer|administrator|auto
     * @param bool   $force_forfeit
     * @return void
     */
    public static function handle_booking_cancel($booking_id, $by = "customer", $force_forfeit = false)
    {
        $booking = new WBK_Booking(absint($booking_id));
        if (!$booking->is_loaded()) {
            return;
        }
        $package_id = absint($booking->get("package_id"));
        $credits = absint($booking->get("package_credits_used"));
        if ($package_id <= 0 || $credits <= 0) {
            return;
        }

        $package = new WBK_Customer_Package($package_id);
        if (!$package->is_loaded()) {
            return;
        }

        // Release any outstanding hold first.
        if ($package->get_held_credits() > 0) {
            $package->release_hold(min($credits, $package->get_held_credits()), $booking_id, $by);
        }

        $rules = $package->get_rules();
        $should_restore = !$force_forfeit;
        if ($by === "customer") {
            $should_restore = ($rules["cancel_restore_credits"] ?? "yes") === "yes";
        }
        if ($by === "administrator" && $force_forfeit) {
            $should_restore = false;
        }

        // Only restore if credits were already consumed (remaining was reduced).
        $ledger = $package->get_ledger();
        $consumed = false;
        foreach ($ledger as $entry) {
            if (
                ($entry["type"] ?? "") === WBK_Customer_Package::LEDGER_CONSUME &&
                absint($entry["booking_id"] ?? 0) === absint($booking_id)
            ) {
                $consumed = true;
                break;
            }
        }

        if ($should_restore && $consumed) {
            $package->restore_credits($credits, $booking_id, $by, "cancel_restore");
        }
    }

    /**
     * Purchase a published package for the current user.
     *
     * @param int    $product_id
     * @param int    $user_id
     * @param string $payment_method
     * @param string $payment_ref
     * @return int|WP_Error package id
     */
    public static function complete_purchase($product_id, $user_id, $payment_method = "", $payment_ref = "")
    {
        if (!self::is_enabled()) {
            return new WP_Error(
                "packages_disabled",
                __("Visit packages are not available.", "webba-booking-lite"),
            );
        }

        $product = new WBK_Package_Product(absint($product_id));
        if (!$product->is_purchasable()) {
            return new WP_Error(
                "package_not_for_sale",
                __("This package is not available for purchase.", "webba-booking-lite"),
            );
        }

        $limit = absint($product->get("max_active_per_customer"));
        if ($limit > 0) {
            $active = 0;
            foreach (WBK_Customer_Package::get_all_for_user($user_id) as $row) {
                if (($row["status"] ?? "") === WBK_Customer_Package::STATUS_ACTIVE) {
                    $active++;
                }
            }
            if ($active >= $limit) {
                return new WP_Error(
                    "package_active_limit",
                    __("You already have the maximum number of active packages.", "webba-booking-lite"),
                );
            }
        }

        return WBK_Customer_Package::create_from_product($product, $user_id, [
            "source" => "purchase",
            "payment_method" => $payment_method,
            "payment_ref" => $payment_ref,
            "amount_paid" => $product->get_price(),
            "actor" => "customer",
        ]);
    }

    /**
     * Admin grant without payment.
     *
     * @param int $product_id
     * @param int $user_id
     * @return int|WP_Error
     */
    public static function grant($product_id, $user_id)
    {
        $product = new WBK_Package_Product(absint($product_id));
        if (!$product->is_loaded()) {
            return new WP_Error("invalid_product", __("Package product not found.", "webba-booking-lite"));
        }
        return WBK_Customer_Package::create_from_product($product, $user_id, [
            "source" => "grant",
            "payment_method" => "admin_grant",
            "amount_paid" => 0,
            "actor" => "administrator",
        ]);
    }

    /**
     * Store an unpaid package checkout until PayPal confirms it.
     *
     * @param string $key Payment id or cancel token.
     * @param array  $data Pending checkout data.
     * @return void
     */
    public static function store_pending_order($key, $data)
    {
        $key = sanitize_text_field((string) $key);
        if ($key === "" || !is_array($data)) {
            return;
        }
        set_transient("wbk_pkg_pending_" . md5($key), $data, DAY_IN_SECONDS);
    }

    /**
     * @param string $key
     * @return array|null
     */
    public static function get_pending_order($key)
    {
        $key = sanitize_text_field((string) $key);
        if ($key === "") {
            return null;
        }
        $data = get_transient("wbk_pkg_pending_" . md5($key));
        return is_array($data) ? $data : null;
    }

    /**
     * @param string $key
     * @return void
     */
    public static function delete_pending_order($key)
    {
        $key = sanitize_text_field((string) $key);
        if ($key === "") {
            return;
        }
        delete_transient("wbk_pkg_pending_" . md5($key));
    }

    /**
     * Remember which PayPal payment a cancel token belongs to.
     *
     * @param string $cancel_token
     * @param string $payment_id
     * @return void
     */
    public static function store_cancel_token($cancel_token, $payment_id)
    {
        $cancel_token = sanitize_text_field((string) $cancel_token);
        $payment_id = sanitize_text_field((string) $payment_id);
        if ($cancel_token === "" || $payment_id === "") {
            return;
        }
        set_transient("wbk_pkg_cancel_" . md5($cancel_token), $payment_id, DAY_IN_SECONDS);
    }

    /**
     * Remove a cancelled PayPal checkout.
     *
     * @param string $cancel_token
     * @return void
     */
    public static function clear_pending_by_cancel_token($cancel_token)
    {
        $cancel_token = sanitize_text_field((string) $cancel_token);
        if ($cancel_token === "") {
            return;
        }
        $payment_id = get_transient("wbk_pkg_cancel_" . md5($cancel_token));
        if (is_string($payment_id) && $payment_id !== "") {
            self::delete_pending_order($payment_id);
        }
        delete_transient("wbk_pkg_cancel_" . md5($cancel_token));
    }
}
