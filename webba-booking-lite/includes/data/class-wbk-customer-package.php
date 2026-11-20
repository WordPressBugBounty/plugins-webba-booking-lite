<?php
if (!defined("ABSPATH")) {
    exit();
}

/**
 * Per-customer visit package instance with append-only ledger.
 */
class WBK_Customer_Package extends WBK_Model_Object
{
    const STATUS_ACTIVE = "active";
    const STATUS_EXHAUSTED = "exhausted";
    const STATUS_EXPIRED = "expired";
    const STATUS_CANCELLED = "cancelled";
    const STATUS_SUSPENDED = "suspended";

    const LEDGER_PURCHASE = "purchase";
    const LEDGER_GRANT = "grant";
    const LEDGER_CONSUME = "consume";
    const LEDGER_RESTORE = "restore";
    const LEDGER_ADJUST = "adjust";
    const LEDGER_HOLD = "hold";
    const LEDGER_RELEASE_HOLD = "release_hold";

    public function __construct($id = null)
    {
        $this->table_name = get_option("wbk_db_prefix", "") . "wbk_customer_packages";
        parent::__construct($id);
    }

    /**
     * @return bool
     */
    public function is_loaded()
    {
        return absint($this->get("user_id")) > 0 && absint($this->get("product_id")) > 0;
    }

    /**
     * @return array
     */
    public function get_rules()
    {
        $raw = $this->get("rules_snapshot");
        if (is_string($raw) && $raw !== "") {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }
        if (is_array($raw)) {
            return $raw;
        }
        return [];
    }

    /**
     * @return array<int,array>
     */
    public function get_ledger()
    {
        $raw = $this->get("ledger");
        if (is_string($raw) && $raw !== "") {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }
        if (is_array($raw)) {
            return $raw;
        }
        return [];
    }

    /**
     * @param array $entry
     * @return bool
     */
    public function append_ledger_entry(array $entry)
    {
        $ledger = $this->get_ledger();
        $ledger[] = array_merge(
            [
                "time" => time(),
                "actor" => "system",
                "credits" => 0,
                "type" => "",
                "booking_id" => 0,
                "reason" => "",
            ],
            $entry,
        );
        $this->set("ledger", wp_json_encode($ledger));
        return $this->save() !== false;
    }

    /**
     * @return int
     */
    public function get_remaining_credits()
    {
        return max(0, intval($this->get("remaining_credits")));
    }

    /**
     * @return int
     */
    public function get_held_credits()
    {
        return max(0, absint($this->get("held_credits")));
    }

    /**
     * Credits available to spend (remaining minus held).
     *
     * @return int
     */
    public function get_available_credits()
    {
        return max(0, $this->get_remaining_credits() - $this->get_held_credits());
    }

    /**
     * Refresh status from credits / expiry.
     *
     * @return void
     */
    public function refresh_status()
    {
        $status = (string) $this->get("status");
        if (in_array($status, [self::STATUS_CANCELLED, self::STATUS_SUSPENDED], true)) {
            return;
        }
        $expires_at = absint($this->get("expires_at"));
        if ($expires_at > 0 && time() > $expires_at) {
            $this->set("status", self::STATUS_EXPIRED);
            $this->save();
            return;
        }
        if ($this->get_remaining_credits() <= 0) {
            $this->set("status", self::STATUS_EXHAUSTED);
        } else {
            $this->set("status", self::STATUS_ACTIVE);
        }
        $this->save();
    }

    /**
     * @return bool
     */
    public function is_redeemable()
    {
        $this->refresh_status();
        if ((string) $this->get("status") !== self::STATUS_ACTIVE) {
            return false;
        }
        return $this->get_available_credits() > 0;
    }

    /**
     * @param int $service_id
     * @return bool
     */
    public function is_service_eligible($service_id)
    {
        $rules = $this->get_rules();
        if (!empty($rules["applicable_for_all_services"]) && $rules["applicable_for_all_services"] === "yes") {
            return true;
        }
        $services = isset($rules["services"]) && is_array($rules["services"])
            ? array_map("absint", $rules["services"])
            : [];
        if (empty($services)) {
            return true;
        }
        return in_array(absint($service_id), $services, true);
    }

    /**
     * Validate frequency rules for a booking at $booking_time.
     *
     * @param int $booking_time Unix timestamp of booking start
     * @param int $exclude_booking_id
     * @return true|WP_Error
     */
    public function check_frequency_rules($booking_time, $exclude_booking_id = 0)
    {
        $booking_time = absint($booking_time);
        $rules = $this->get_rules();
        $user_id = absint($this->get("user_id"));
        $package_id = absint($this->get_id());

        $min_interval_days = absint($rules["min_interval_days"] ?? 0);
        $max_per_day = absint($rules["max_visits_per_day"] ?? 0);
        $max_per_week = absint($rules["max_visits_per_week"] ?? 0);
        $max_per_month = absint($rules["max_visits_per_month"] ?? 0);

        if ($min_interval_days <= 0 && $max_per_day <= 0 && $max_per_week <= 0 && $max_per_month <= 0) {
            return true;
        }

        $existing = self::get_package_booking_times_for_user($user_id, $package_id, $exclude_booking_id);

        if ($min_interval_days > 0) {
            $min_gap = $min_interval_days * DAY_IN_SECONDS;
            foreach ($existing as $existing_time) {
                if (abs($booking_time - $existing_time) < $min_gap) {
                    $next = max($existing_time + $min_gap, time());
                    return new WP_Error(
                        "package_min_interval",
                        sprintf(
                            /* translators: %s: formatted date */
                            __("Next package visit available on %s.", "webba-booking-lite"),
                            date_i18n(get_option("date_format") . " " . get_option("time_format"), $next),
                        ),
                        ["status" => 400, "next_available" => $next],
                    );
                }
            }
        }

        if ($max_per_day > 0) {
            $day_start = strtotime("midnight", $booking_time);
            $day_end = $day_start + DAY_IN_SECONDS - 1;
            $count = self::count_times_in_range($existing, $day_start, $day_end);
            if ($count >= $max_per_day) {
                return new WP_Error(
                    "package_max_per_day",
                    __("Maximum package visits for this day have been reached.", "webba-booking-lite"),
                    ["status" => 400],
                );
            }
        }

        if ($max_per_week > 0) {
            $week_start = strtotime("monday this week", strtotime("midnight", $booking_time));
            $week_end = $week_start + 7 * DAY_IN_SECONDS - 1;
            $count = self::count_times_in_range($existing, $week_start, $week_end);
            if ($count >= $max_per_week) {
                return new WP_Error(
                    "package_max_per_week",
                    __("Maximum package visits for this week have been reached.", "webba-booking-lite"),
                    ["status" => 400],
                );
            }
        }

        if ($max_per_month > 0) {
            $month_start = strtotime(date("Y-m-01 00:00:00", $booking_time));
            $month_end = strtotime(date("Y-m-t 23:59:59", $booking_time));
            $count = self::count_times_in_range($existing, $month_start, $month_end);
            if ($count >= $max_per_month) {
                return new WP_Error(
                    "package_max_per_month",
                    __("Maximum package visits for this month have been reached.", "webba-booking-lite"),
                    ["status" => 400],
                );
            }
        }

        return true;
    }

    /**
     * @param array<int> $times
     * @param int $start
     * @param int $end
     * @return int
     */
    private static function count_times_in_range(array $times, $start, $end)
    {
        $count = 0;
        foreach ($times as $t) {
            if ($t >= $start && $t <= $end) {
                $count++;
            }
        }
        return $count;
    }

    /**
     * Booking start times that used this package (or any package for user when package_id=0).
     *
     * @param int $user_id
     * @param int $package_id
     * @param int $exclude_booking_id
     * @return array<int>
     */
    public static function get_package_booking_times_for_user($user_id, $package_id = 0, $exclude_booking_id = 0)
    {
        global $wpdb;
        $user = get_userdata(absint($user_id));
        if (!$user) {
            return [];
        }
        $bookings_table = get_option("wbk_db_prefix", "") . "wbk_appointments";
        $sql =
            "SELECT time FROM {$bookings_table} WHERE email = %s AND package_id > 0 AND status NOT IN ('cancelled','rejected')";
        $args = [$user->user_email];
        if (absint($package_id) > 0) {
            $sql .= " AND package_id = %d";
            $args[] = absint($package_id);
        }
        if (absint($exclude_booking_id) > 0) {
            $sql .= " AND id <> %d";
            $args[] = absint($exclude_booking_id);
        }
        $rows = $wpdb->get_col($wpdb->prepare($sql, $args));
        if (!is_array($rows)) {
            return [];
        }
        return array_map("absint", $rows);
    }

    /**
     * Hold credits between booking create and payment confirmation.
     *
     * @param int    $credits
     * @param int    $booking_id
     * @param string $actor
     * @return true|WP_Error
     */
    public function hold_credits($credits, $booking_id = 0, $actor = "system")
    {
        $credits = absint($credits);
        if ($credits <= 0) {
            return true;
        }
        if (!$this->is_redeemable() || $this->get_available_credits() < $credits) {
            return new WP_Error(
                "package_insufficient_credits",
                __("Not enough package visits remaining.", "webba-booking-lite"),
                ["status" => 400],
            );
        }
        $this->set("held_credits", $this->get_held_credits() + $credits);
        $this->save();
        $this->append_ledger_entry([
            "type" => self::LEDGER_HOLD,
            "credits" => $credits,
            "booking_id" => absint($booking_id),
            "actor" => $actor,
            "reason" => "hold",
        ]);
        return true;
    }

    /**
     * @param int    $credits
     * @param int    $booking_id
     * @param string $actor
     * @return bool
     */
    public function release_hold($credits, $booking_id = 0, $actor = "system")
    {
        $credits = absint($credits);
        if ($credits <= 0) {
            return true;
        }
        $this->set("held_credits", max(0, $this->get_held_credits() - $credits));
        $this->save();
        $this->append_ledger_entry([
            "type" => self::LEDGER_RELEASE_HOLD,
            "credits" => $credits,
            "booking_id" => absint($booking_id),
            "actor" => $actor,
            "reason" => "release_hold",
        ]);
        return true;
    }

    /**
     * Consume credits permanently (after payment confirmed).
     *
     * @param int    $credits
     * @param int    $booking_id
     * @param string $actor
     * @param bool   $from_hold
     * @return true|WP_Error
     */
    public function consume_credits($credits, $booking_id = 0, $actor = "system", $from_hold = true)
    {
        $credits = absint($credits);
        if ($credits <= 0) {
            return true;
        }

        if ($from_hold) {
            $held = $this->get_held_credits();
            if ($held >= $credits) {
                $this->set("held_credits", $held - $credits);
            }
        } elseif ($this->get_available_credits() < $credits) {
            return new WP_Error(
                "package_insufficient_credits",
                __("Not enough package visits remaining.", "webba-booking-lite"),
                ["status" => 400],
            );
        }

        $remaining = max(0, $this->get_remaining_credits() - $credits);
        $this->set("remaining_credits", $remaining);

        $rules = $this->get_rules();
        $activated = absint($this->get("activated_at"));
        if ($activated <= 0 && ($rules["validity_starts"] ?? "") === WBK_Package_Product::START_ON_FIRST_USE) {
            $now = time();
            $this->set("activated_at", $now);
            $product = new WBK_Package_Product(absint($this->get("product_id")));
            if ($product->is_loaded()) {
                $expires = $product->calculate_expires_at($now);
                if ($expires > 0) {
                    $this->set("expires_at", $expires);
                }
            }
        }

        $this->save();
        $this->append_ledger_entry([
            "type" => self::LEDGER_CONSUME,
            "credits" => -$credits,
            "booking_id" => absint($booking_id),
            "actor" => $actor,
            "reason" => "booking",
        ]);
        $this->refresh_status();
        do_action("wbk_package_credits_consumed", $this->get_id(), $credits, $booking_id);
        return true;
    }

    /**
     * Restore credits after cancel (within policy).
     *
     * @param int    $credits
     * @param int    $booking_id
     * @param string $actor
     * @param string $reason
     * @return bool
     */
    public function restore_credits($credits, $booking_id = 0, $actor = "system", $reason = "cancel")
    {
        $credits = absint($credits);
        if ($credits <= 0) {
            return true;
        }
        $total = max(absint($this->get("total_credits")), $this->get_remaining_credits() + $credits);
        $this->set("remaining_credits", min($total, $this->get_remaining_credits() + $credits));
        $this->save();
        $this->append_ledger_entry([
            "type" => self::LEDGER_RESTORE,
            "credits" => $credits,
            "booking_id" => absint($booking_id),
            "actor" => $actor,
            "reason" => $reason,
        ]);
        $this->refresh_status();
        do_action("wbk_package_credits_restored", $this->get_id(), $credits, $booking_id);
        return true;
    }

    /**
     * Admin adjust remaining credits.
     *
     * @param int    $delta
     * @param string $reason
     * @param string $actor
     * @return true|WP_Error
     */
    public function adjust_credits($delta, $reason = "", $actor = "administrator")
    {
        $delta = intval($delta);
        if ($delta === 0) {
            return true;
        }
        $new_remaining = $this->get_remaining_credits() + $delta;
        if ($new_remaining < 0) {
            return new WP_Error(
                "package_invalid_adjust",
                __("Cannot reduce credits below zero.", "webba-booking-lite"),
                ["status" => 400],
            );
        }
        if ($delta > 0) {
            $this->set("total_credits", absint($this->get("total_credits")) + $delta);
        }
        $this->set("remaining_credits", $new_remaining);
        $this->save();
        $this->append_ledger_entry([
            "type" => self::LEDGER_ADJUST,
            "credits" => $delta,
            "actor" => $actor,
            "reason" => $reason !== "" ? $reason : "admin_adjust",
        ]);
        $this->refresh_status();
        return true;
    }

    /**
     * Create a customer package from a product (purchase or grant).
     *
     * @param WBK_Package_Product $product
     * @param int                 $user_id
     * @param array               $args
     * @return int|WP_Error package id
     */
    public static function create_from_product(WBK_Package_Product $product, $user_id, array $args = [])
    {
        global $wpdb;

        $user_id = absint($user_id);
        if ($user_id <= 0 || !$product->is_loaded()) {
            return new WP_Error("invalid_package", __("Invalid package or user.", "webba-booking-lite"));
        }

        $user = get_userdata($user_id);
        if (!$user) {
            return new WP_Error("invalid_user", __("User not found.", "webba-booking-lite"));
        }

        $now = time();
        $rules = $product->get_rules_snapshot();
        $validity_starts = $rules["validity_starts"] ?? WBK_Package_Product::START_ON_PURCHASE;
        $activated_at = $validity_starts === WBK_Package_Product::START_ON_PURCHASE ? $now : 0;
        $expires_at = 0;
        if ($activated_at > 0) {
            $expires_at = $product->calculate_expires_at($activated_at);
        } elseif (($rules["expiry_type"] ?? "") === WBK_Package_Product::EXPIRY_FIXED) {
            $expires_at = absint($rules["expiry_fixed_date"] ?? 0);
        }

        $source = isset($args["source"]) ? sanitize_text_field($args["source"]) : "purchase";
        $visits = $product->get_visit_count();
        $table = get_option("wbk_db_prefix", "") . "wbk_customer_packages";

        $inserted = $wpdb->insert(
            $table,
            [
                "product_id" => absint($product->get_id()),
                "user_id" => $user_id,
                "email" => $user->user_email,
                "name" => (string) $product->get("name"),
                "total_credits" => $visits,
                "remaining_credits" => $visits,
                "held_credits" => 0,
                "status" => self::STATUS_ACTIVE,
                "purchased_at" => $now,
                "activated_at" => $activated_at,
                "expires_at" => $expires_at,
                "payment_method" => isset($args["payment_method"])
                    ? sanitize_text_field($args["payment_method"])
                    : "",
                "payment_ref" => isset($args["payment_ref"])
                    ? sanitize_text_field($args["payment_ref"])
                    : "",
                "amount_paid" => isset($args["amount_paid"]) ? floatval($args["amount_paid"]) : 0,
                "rules_snapshot" => wp_json_encode($rules),
                "ledger" => "[]",
            ],
            [
                "%d",
                "%d",
                "%s",
                "%s",
                "%d",
                "%d",
                "%d",
                "%s",
                "%d",
                "%d",
                "%d",
                "%s",
                "%s",
                "%f",
                "%s",
                "%s",
            ],
        );

        if ($inserted === false) {
            return new WP_Error("package_create_failed", __("Could not create package.", "webba-booking-lite"));
        }

        $package_id = absint($wpdb->insert_id);
        $package = new self($package_id);
        $package->append_ledger_entry([
            "type" => $source === "grant" ? self::LEDGER_GRANT : self::LEDGER_PURCHASE,
            "credits" => $visits,
            "actor" => isset($args["actor"]) ? sanitize_text_field($args["actor"]) : "system",
            "reason" => $source,
        ]);

        do_action("wbk_customer_package_created", $package_id, $source);
        return $package_id;
    }

    /**
     * Active packages for a user, soonest-to-expire first.
     *
     * @param int $user_id
     * @param int $service_id Optional filter
     * @return array<self>
     */
    public static function get_redeemable_for_user($user_id, $service_id = 0)
    {
        global $wpdb;
        $user_id = absint($user_id);
        if ($user_id <= 0) {
            return [];
        }
        $table = get_option("wbk_db_prefix", "") . "wbk_customer_packages";
        $rows = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT id FROM {$table}
                 WHERE user_id = %d
                   AND status = %s
                   AND remaining_credits > 0
                   AND (expires_at = 0 OR expires_at >= %d)
                 ORDER BY CASE WHEN expires_at = 0 THEN 1 ELSE 0 END ASC, expires_at ASC, purchased_at ASC",
                $user_id,
                self::STATUS_ACTIVE,
                time(),
            ),
            ARRAY_A,
        );
        if (!is_array($rows)) {
            return [];
        }
        $packages = [];
        foreach ($rows as $row) {
            $pkg = new self(absint($row["id"]));
            if (!$pkg->is_loaded() || !$pkg->is_redeemable()) {
                continue;
            }
            if ($service_id > 0 && !$pkg->is_service_eligible($service_id)) {
                continue;
            }
            $packages[] = $pkg;
        }
        return $packages;
    }

    /**
     * @param int $user_id
     * @return array<array>
     */
    public static function get_all_for_user($user_id)
    {
        global $wpdb;
        $user_id = absint($user_id);
        if ($user_id <= 0) {
            return [];
        }
        $table = get_option("wbk_db_prefix", "") . "wbk_customer_packages";
        $rows = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$table} WHERE user_id = %d ORDER BY purchased_at DESC",
                $user_id,
            ),
            ARRAY_A,
        );
        return is_array($rows) ? $rows : [];
    }

    /**
     * Public DTO for dashboard / booking form.
     *
     * @return array
     */
    public function to_public_array()
    {
        $rules = $this->get_rules();
        return [
            "id" => absint($this->get_id()),
            "product_id" => absint($this->get("product_id")),
            "name" => (string) $this->get("name"),
            "total_credits" => absint($this->get("total_credits")),
            "remaining_credits" => $this->get_remaining_credits(),
            "available_credits" => $this->get_available_credits(),
            "status" => (string) $this->get("status"),
            "purchased_at" => absint($this->get("purchased_at")),
            "activated_at" => absint($this->get("activated_at")),
            "expires_at" => absint($this->get("expires_at")),
            "rules" => [
                "applicable_for_all_services" =>
                    ($rules["applicable_for_all_services"] ?? "") === "yes",
                "services" => isset($rules["services"]) ? array_map("absint", (array) $rules["services"]) : [],
                "min_interval_days" => absint($rules["min_interval_days"] ?? 0),
                "max_visits_per_week" => absint($rules["max_visits_per_week"] ?? 0),
                "max_visits_per_month" => absint($rules["max_visits_per_month"] ?? 0),
                "max_visits_per_day" => absint($rules["max_visits_per_day"] ?? 0),
            ],
            "ledger" => $this->get_ledger(),
        ];
    }

    /**
     * Find a customer package created from a payment reference.
     *
     * @param string $payment_ref
     * @param int    $user_id Optional owner filter.
     * @return self|null
     */
    public static function find_by_payment_ref($payment_ref, $user_id = 0)
    {
        global $wpdb;

        $payment_ref = sanitize_text_field((string) $payment_ref);
        $user_id = absint($user_id);
        if ($payment_ref === "") {
            return null;
        }

        $table = get_option("wbk_db_prefix", "") . "wbk_customer_packages";
        if ($user_id > 0) {
            $package_id = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT id FROM {$table} WHERE payment_ref = %s AND user_id = %d ORDER BY id DESC LIMIT 1",
                    $payment_ref,
                    $user_id,
                ),
            );
        } else {
            $package_id = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT id FROM {$table} WHERE payment_ref = %s ORDER BY id DESC LIMIT 1",
                    $payment_ref,
                ),
            );
        }

        $package_id = absint($package_id);
        if ($package_id <= 0) {
            return null;
        }

        $package = new self($package_id);
        return $package->is_loaded() ? $package : null;
    }

    /**
     * @return array<string,string>
     */
    public static function get_status_options()
    {
        return [
            self::STATUS_ACTIVE => __("Active", "webba-booking-lite"),
            self::STATUS_EXHAUSTED => __("Exhausted", "webba-booking-lite"),
            self::STATUS_EXPIRED => __("Expired", "webba-booking-lite"),
            self::STATUS_CANCELLED => __("Cancelled", "webba-booking-lite"),
            self::STATUS_SUSPENDED => __("Suspended", "webba-booking-lite"),
        ];
    }
}
