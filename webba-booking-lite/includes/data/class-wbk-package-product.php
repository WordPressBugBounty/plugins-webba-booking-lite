<?php
if (!defined("ABSPATH")) {
    exit();
}

/**
 * Sellable visit-package template.
 */
class WBK_Package_Product extends WBK_Model_Object
{
    const STATUS_DRAFT = "draft";
    const STATUS_PUBLISHED = "published";
    const STATUS_ARCHIVED = "archived";

    const EXPIRY_NONE = "none";
    const EXPIRY_FIXED = "fixed";
    const EXPIRY_RELATIVE = "relative";

    const START_ON_PURCHASE = "purchase";
    const START_ON_FIRST_USE = "first_use";

    public function __construct($id = null)
    {
        $this->table_name = get_option("wbk_db_prefix", "") . "wbk_package_products";
        parent::__construct($id);
    }

    /**
     * @return bool
     */
    public function is_loaded()
    {
        $name = $this->get("name");
        return $name !== false && $name !== "";
    }

    /**
     * @return bool
     */
    public function is_purchasable()
    {
        return $this->is_loaded() && $this->get("status") === self::STATUS_PUBLISHED;
    }

    /**
     * @return int
     */
    public function get_visit_count()
    {
        return max(1, absint($this->get("visit_count")));
    }

    /**
     * @return float
     */
    public function get_price()
    {
        return floatval($this->get("price"));
    }

    /**
     * @return array<int>
     */
    public function get_service_ids()
    {
        if ($this->get("applicable_for_all_services") === "yes") {
            return [];
        }
        $raw = $this->get("services");
        if (is_string($raw) && $raw !== "") {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                return array_map("absint", $decoded);
            }
            if (strpos($raw, ",") !== false) {
                return array_map("absint", explode(",", $raw));
            }
        }
        if (is_array($raw)) {
            return array_map("absint", $raw);
        }
        return [];
    }

    /**
     * Payment methods configured for this package product.
     * Falls back to arrival when none are set (legacy packages).
     *
     * @return array<int, string>
     */
    public function get_payment_methods()
    {
        $raw = $this->get("payment_methods");
        $methods = [];
        if (is_string($raw) && $raw !== "") {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                $methods = $decoded;
            } elseif (strpos($raw, ",") !== false) {
                $methods = array_map("trim", explode(",", $raw));
            } else {
                $methods = [$raw];
            }
        } elseif (is_array($raw)) {
            $methods = $raw;
        }

        $methods = array_values(
            array_filter(array_map("sanitize_text_field", $methods)),
        );
        if (empty($methods)) {
            return ["arrival"];
        }
        return $methods;
    }

    /**
     * @param int $service_id
     * @return bool
     */
    public function is_service_eligible($service_id)
    {
        $service_id = absint($service_id);
        if ($service_id <= 0) {
            return false;
        }
        if ($this->get("applicable_for_all_services") === "yes") {
            return true;
        }
        $services = $this->get_service_ids();
        return empty($services) || in_array($service_id, $services, true);
    }

    /**
     * Snapshot of rules stored on customer packages at purchase time.
     *
     * @return array
     */
    public function get_rules_snapshot()
    {
        return [
            "name" => (string) $this->get("name"),
            "visit_count" => $this->get_visit_count(),
            "applicable_for_all_services" =>
                $this->get("applicable_for_all_services") === "yes" ? "yes" : "",
            "services" => $this->get_service_ids(),
            "min_interval_days" => absint($this->get("min_interval_days")),
            "max_visits_per_week" => absint($this->get("max_visits_per_week")),
            "max_visits_per_month" => absint($this->get("max_visits_per_month")),
            "max_visits_per_day" => absint($this->get("max_visits_per_day")),
            "cancel_restore_credits" =>
                $this->get("cancel_restore_credits") === "yes" ? "yes" : "",
            "expiry_type" => (string) $this->get("expiry_type"),
            "expiry_fixed_date" => absint($this->get("expiry_fixed_date")),
            "expiry_relative_days" => absint($this->get("expiry_relative_days")),
            "validity_starts" => (string) $this->get("validity_starts"),
        ];
    }

    /**
     * @param int $from_timestamp
     * @return int 0 = no expiry
     */
    public function calculate_expires_at($from_timestamp)
    {
        $from_timestamp = absint($from_timestamp);
        $type = (string) $this->get("expiry_type");
        if ($type === self::EXPIRY_FIXED) {
            return absint($this->get("expiry_fixed_date"));
        }
        if ($type === self::EXPIRY_RELATIVE) {
            $days = absint($this->get("expiry_relative_days"));
            if ($days <= 0) {
                return 0;
            }
            return $from_timestamp + $days * DAY_IN_SECONDS;
        }
        return 0;
    }

    /**
     * Published products for storefront, ordered by name.
     *
     * @return array<array>
     */
    public static function get_published_products()
    {
        global $wpdb;
        $table = get_option("wbk_db_prefix", "") . "wbk_package_products";
        $rows = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$table} WHERE status = %s ORDER BY name ASC",
                self::STATUS_PUBLISHED,
            ),
            ARRAY_A,
        );
        return is_array($rows) ? $rows : [];
    }

    /**
     * @return array<string,string>
     */
    public static function get_status_options()
    {
        return [
            self::STATUS_DRAFT => __("Draft", "webba-booking-lite"),
            self::STATUS_PUBLISHED => __("Published", "webba-booking-lite"),
            self::STATUS_ARCHIVED => __("Archived", "webba-booking-lite"),
        ];
    }

    /**
     * @return array<string,string>
     */
    public static function get_expiry_type_options()
    {
        return [
            self::EXPIRY_NONE => __("No expiry", "webba-booking-lite"),
            self::EXPIRY_FIXED => __("Fixed end date", "webba-booking-lite"),
            self::EXPIRY_RELATIVE => __("Relative from start", "webba-booking-lite"),
        ];
    }

    /**
     * @return array<string,string>
     */
    public static function get_validity_starts_options()
    {
        return [
            self::START_ON_PURCHASE => __("On purchase", "webba-booking-lite"),
            self::START_ON_FIRST_USE => __("On first use", "webba-booking-lite"),
        ];
    }
}
