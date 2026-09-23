<?php
if (!defined("ABSPATH")) {
    exit();
}
class WBK_Gift_Card extends WBK_Model_Object
{
    const PENDING_TRANSIENT_PREFIX = "wbk_gc_pending_";
    const PENDING_CANCEL_PREFIX = "wbk_gc_cancel_";
    const PENDING_TTL = DAY_IN_SECONDS;

    public function __construct($id = null)
    {
        $this->table_name = get_option("wbk_db_prefix", "") . "wbk_gift_cards";
        parent::__construct($id);
    }

    /**
     * Gift cards use `code`, not `name`.
     *
     * @return bool
     */
    public function is_loaded()
    {
        $code = $this->get("code");
        return $code !== false && $code !== "";
    }

    /**
     * Check whether a gift card code is already used.
     *
     * @param string   $code
     * @param int|null $exclude_id Optional gift card ID to ignore (current item).
     * @return bool
     */
    public static function code_exists($code, $exclude_id = null)
    {
        global $wpdb;

        $code = trim(sanitize_text_field((string) $code));
        if ($code === "") {
            return false;
        }

        $table = get_option("wbk_db_prefix", "") . "wbk_gift_cards";
        $query = $wpdb->prepare(
            "SELECT id FROM {$table} WHERE code = %s",
            $code,
        );

        if ($exclude_id !== null && intval($exclude_id) > 0) {
            $query = $wpdb->prepare(
                "SELECT id FROM {$table} WHERE code = %s AND id <> %d",
                $code,
                intval($exclude_id),
            );
        }

        $found = $wpdb->get_var($query);
        return !empty($found);
    }

    /**
     * Find a gift card row by its code.
     *
     * @param string $code
     * @return array|null
     */
    public static function find_by_code($code)
    {
        global $wpdb;

        $code = trim(sanitize_text_field((string) $code));
        if ($code === "") {
            return null;
        }

        $table = get_option("wbk_db_prefix", "") . "wbk_gift_cards";
        $row = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM {$table} WHERE UPPER(code) = UPPER(%s)",
                $code,
            ),
            ARRAY_A,
        );

        return is_array($row) ? $row : null;
    }

    /**
     * Normalize gift card history to an array of time/amount entries.
     *
     * @param mixed $raw JSON string or array.
     * @return array<int, array{time:int, amount:float}>
     */
    public static function parse_history($raw)
    {
        if (is_array($raw)) {
            $decoded = $raw;
        } else {
            $decoded = json_decode((string) $raw, true);
        }
        if (!is_array($decoded)) {
            return [];
        }

        $history = [];
        foreach ($decoded as $entry) {
            if (!is_array($entry)) {
                continue;
            }
            $amount = isset($entry["amount"]) ? floatval($entry["amount"]) : 0;
            if ($amount <= 0) {
                continue;
            }
            $history[] = [
                "time" => isset($entry["time"]) ? intval($entry["time"]) : 0,
                "amount" => $amount,
            ];
        }

        return $history;
    }

    /**
     * Sum of amounts already redeemed from history.
     *
     * @param mixed $raw JSON string or array.
     * @return float
     */
    public static function used_amount_from_history($raw)
    {
        $used = 0.0;
        foreach (self::parse_history($raw) as $entry) {
            $used += $entry["amount"];
        }
        return $used;
    }

    /**
     * Remaining gift card balance after history redemptions.
     *
     * @param array $row Gift card row.
     * @return float
     */
    public static function remaining_amount_from_row($row)
    {
        if (!is_array($row)) {
            return 0.0;
        }
        $amount = floatval($row["amount"] ?? 0);
        $used = self::used_amount_from_history($row["history"] ?? "[]");
        return max(0, $amount - $used);
    }

    /**
     * Append a redemption to history and persist.
     *
     * @param float $amount
     * @return int|false
     */
    public function record_usage($amount)
    {
        $amount = floatval($amount);
        if ($amount <= 0 || !$this->is_loaded()) {
            return false;
        }

        $remaining = self::remaining_amount_from_row([
            "amount" => $this->get("amount"),
            "history" => $this->get("history"),
        ]);
        if ($amount > $remaining) {
            $amount = $remaining;
        }
        if ($amount <= 0) {
            return false;
        }

        $history = self::parse_history($this->get("history"));
        $history[] = [
            "time" => time(),
            "amount" => $amount,
        ];
        $this->set("history", wp_json_encode($history));
        return $this->save();
    }

    /**
     * Generate a unique gift card code that is not already stored.
     *
     * @param int $length
     * @param int $max_attempts
     * @return string
     */
    public static function generate_unique_code($length = 10, $max_attempts = 50)
    {
        $length = max(6, intval($length));
        $max_attempts = max(1, intval($max_attempts));

        for ($i = 0; $i < $max_attempts; $i++) {
            $code = strtoupper(wp_generate_password($length, false, false));
            if (!self::code_exists($code)) {
                return $code;
            }
        }

        // Extremely unlikely fallback: append a unique suffix.
        return strtoupper(wp_generate_password($length, false, false)) .
            strtoupper(substr(md5(uniqid((string) mt_rand(), true)), 0, 6));
    }

    /**
     * Sanitize and validate gift card purchase payload from the frontend.
     *
     * @param array $params
     * @return array{success:bool,message?:string,data?:array}
     */
    public static function sanitize_purchase_payload($params)
    {
        $buyer_name = isset($params["buyer_name"])
            ? sanitize_text_field((string) $params["buyer_name"])
            : "";
        $buyer_email = isset($params["buyer_email"])
            ? sanitize_email((string) $params["buyer_email"])
            : "";
        $recipient_name = isset($params["recipient_name"])
            ? sanitize_text_field((string) $params["recipient_name"])
            : "";
        $recipient_email = isset($params["recipient_email"])
            ? sanitize_email((string) $params["recipient_email"])
            : "";
        $message = isset($params["message"])
            ? sanitize_textarea_field((string) $params["message"])
            : "";
        $design = isset($params["design"])
            ? sanitize_key((string) $params["design"])
            : "";
        $amount = isset($params["amount"])
            ? floatval(str_replace(",", ".", (string) $params["amount"]))
            : 0;
        $send_on = isset($params["send_on"])
            ? sanitize_text_field((string) $params["send_on"])
            : "";
        $send_timezone = isset($params["send_timezone"])
            ? sanitize_text_field((string) $params["send_timezone"])
            : "";
        $expiration_date = isset($params["expiration_date"])
            ? sanitize_text_field((string) $params["expiration_date"])
            : "";
        $applicable_for_all_services =
            isset($params["applicable_for_all_services"]) &&
            in_array(
                $params["applicable_for_all_services"],
                ["yes", "1", 1, true, "true"],
                true,
            )
                ? "yes"
                : "";
        $services = [];
        if (isset($params["services"])) {
            if (is_string($params["services"])) {
                $decoded = json_decode($params["services"], true);
                $services = is_array($decoded)
                    ? $decoded
                    : array_filter(array_map("trim", explode(",", $params["services"])));
            } elseif (is_array($params["services"])) {
                $services = $params["services"];
            }
        }
        $services = array_values(
            array_filter(
                array_map("intval", $services),
                function ($id) {
                    return $id > 0;
                },
            ),
        );

        if ($buyer_name === "") {
            return [
                "success" => false,
                "message" => __("Please enter your name", "webba-booking-lite"),
            ];
        }
        if ($buyer_email === "" || !filter_var($buyer_email, FILTER_VALIDATE_EMAIL)) {
            return [
                "success" => false,
                "message" => __(
                    "Please enter a valid email address",
                    "webba-booking-lite",
                ),
            ];
        }
        if ($recipient_name === "") {
            return [
                "success" => false,
                "message" => __(
                    "Please enter the recipient name",
                    "webba-booking-lite",
                ),
            ];
        }
        if (
            $recipient_email === "" ||
            !filter_var($recipient_email, FILTER_VALIDATE_EMAIL)
        ) {
            return [
                "success" => false,
                "message" => __(
                    "Please enter a valid recipient email",
                    "webba-booking-lite",
                ),
            ];
        }
        if ($amount <= 0) {
            return [
                "success" => false,
                "message" => __(
                    "Please enter a valid amount",
                    "webba-booking-lite",
                ),
            ];
        }
        if ($design === "" || !WBK_Gift_Card_Design::get_variant($design)) {
            return [
                "success" => false,
                "message" => __(
                    "Please choose a gift card design",
                    "webba-booking-lite",
                ),
            ];
        }
        if ($send_on === "") {
            return [
                "success" => false,
                "message" => __(
                    "Please select a send date",
                    "webba-booking-lite",
                ),
            ];
        }

        $send_on_ts = self::datetime_string_to_timestamp($send_on, $send_timezone);
        if ($send_on_ts === false) {
            return [
                "success" => false,
                "message" => __(
                    "Please select a valid send date and time",
                    "webba-booking-lite",
                ),
            ];
        }

        if ($send_on_ts < time() - 120) {
            return [
                "success" => false,
                "message" => __(
                    "Send date cannot be in the past",
                    "webba-booking-lite",
                ),
            ];
        }

        $expiration_ts = 0;
        if ($expiration_date !== "") {
            $expiration_ts = self::date_string_to_timestamp($expiration_date);
            if ($expiration_ts === false) {
                return [
                    "success" => false,
                    "message" => __(
                        "Please select a valid expiration date",
                        "webba-booking-lite",
                    ),
                ];
            }
        } else {
            $expiration_ts = self::get_default_expiration_timestamp($send_on_ts);
        }

        if ($expiration_ts && $send_on_ts >= $expiration_ts) {
            return [
                "success" => false,
                "message" => __(
                    "Send date must be earlier than the expiration date.",
                    "webba-booking-lite",
                ),
            ];
        }

        if ($applicable_for_all_services !== "yes" && empty($services)) {
            return [
                "success" => false,
                "message" => __(
                    "Please select at least one service",
                    "webba-booking-lite",
                ),
            ];
        }

        return [
            "success" => true,
            "data" => [
                "buyer_name" => $buyer_name,
                "buyer_email" => $buyer_email,
                "recipient_name" => $recipient_name,
                "recipient_email" => $recipient_email,
                "message" => $message,
                "design" => $design,
                "amount" => $amount,
                "send_on" => $send_on_ts,
                "expiration_date" => $expiration_ts,
                "applicable_for_all_services" => $applicable_for_all_services,
                "services" =>
                    $applicable_for_all_services === "yes"
                        ? []
                        : $services,
            ],
        ];
    }

    /**
     * Convert Y-m-d date string to a Unix timestamp in the site timezone.
     *
     * @param string $date
     * @return int|false
     */
    public static function date_string_to_timestamp($date)
    {
        $date = trim((string) $date);
        if ($date === "") {
            return false;
        }
        if (is_numeric($date)) {
            return intval($date);
        }

        $timezone = wp_timezone();
        $dt = DateTime::createFromFormat("Y-m-d H:i:s", $date . " 00:00:00", $timezone);
        if ($dt === false) {
            return false;
        }
        return $dt->getTimestamp();
    }

    /**
     * Convert a date or datetime string to a Unix timestamp in the given timezone.
     *
     * @param string $datetime
     * @param string $timezone_string IANA timezone id, or empty for the site timezone.
     * @return int|false
     */
    public static function datetime_string_to_timestamp($datetime, $timezone_string = "")
    {
        $datetime = trim((string) $datetime);
        if ($datetime === "") {
            return false;
        }
        if (is_numeric($datetime)) {
            return intval($datetime);
        }

        $timezone = self::resolve_timezone($timezone_string);
        $formats = [
            "Y-m-d H:i:s",
            "Y-m-d H:i",
            "Y-m-d\\TH:i:s",
            "Y-m-d\\TH:i",
            "Y-m-d",
        ];

        foreach ($formats as $format) {
            $dt = DateTime::createFromFormat($format, $datetime, $timezone);
            if (!$dt instanceof DateTime) {
                continue;
            }

            $errors = DateTime::getLastErrors();
            if (
                is_array($errors) &&
                ((int) $errors["warning_count"] > 0 || (int) $errors["error_count"] > 0)
            ) {
                continue;
            }

            if ($format === "Y-m-d") {
                $dt->setTime(0, 0, 0);
            }

            return $dt->getTimestamp();
        }

        return false;
    }

    /**
     * Resolve an IANA timezone id, falling back to the site timezone.
     *
     * @param string $timezone_string
     * @return DateTimeZone
     */
    public static function resolve_timezone($timezone_string)
    {
        $timezone_string = trim((string) $timezone_string);
        if ($timezone_string !== "") {
            try {
                return new DateTimeZone($timezone_string);
            } catch (Exception $exception) {
            }
        }

        return wp_timezone();
    }

    /**
     * Expiration timestamp from the default validity setting, based on send date.
     *
     * @param int $send_on_ts
     * @return int
     */
    public static function get_default_expiration_timestamp($send_on_ts)
    {
        $months = intval(get_option("wbk_gift_card_default_validity", "12"));
        if ($months <= 0) {
            $months = 12;
        }

        $dt = (new DateTime("@" . intval($send_on_ts)))->setTimezone(wp_timezone());
        $dt->modify("+" . $months . " months");

        return $dt->getTimestamp();
    }

    /**
     * Sanitized gift card policy HTML from global settings, or empty when unset.
     *
     * @return string
     */
    public static function get_policy_html()
    {
        $policy = get_option("wbk_gift_card_policy", "");
        if (!is_string($policy)) {
            return "";
        }

        $policy = trim(wp_unslash($policy));
        if ($policy === "" || trim(wp_strip_all_tags($policy)) === "") {
            return "";
        }

        return WBK_Validator::wbk_kses($policy);
    }

    /**
     * Gift card policy block for recipient emails, including the section heading.
     *
     * @return string
     */
    public static function get_policy_email_html()
    {
        $policy = self::get_policy_html();
        if ($policy === "") {
            return "";
        }

        return '<div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;">' .
            '<p style="margin:0 0 8px;font-weight:bold;font-size:16px;color:#111827;">' .
            esc_html(__("Gift card policy", "webba-booking-lite")) .
            "</p>" .
            $policy .
            "</div>";
    }

    /**
     * Persist a paid gift card order into the database.
     *
     * @param array  $data Sanitized purchase payload.
     * @param string $payment_method
     * @param string $payment_id
     * @return array{success:bool,message?:string,gift_card?:array}
     */
    public static function create_from_paid_order(
        $data,
        $payment_method = "",
        $payment_id = ""
    ) {
        if (!is_array($data) || empty($data["amount"])) {
            return [
                "success" => false,
                "message" => __(
                    "Invalid gift card order data.",
                    "webba-booking-lite",
                ),
            ];
        }

        // Idempotency: if this payment already created a gift card, return it.
        if ($payment_id !== "") {
            $existing = self::find_by_payment_id($payment_id);
            if ($existing) {
                return [
                    "success" => true,
                    "gift_card" => $existing,
                    "already_created" => true,
                ];
            }
        }

        $code = self::generate_unique_code();
        $fields = [
            "code" => $code,
            "buyer_name" => $data["buyer_name"],
            "buyer_email" => $data["buyer_email"],
            "recipient_name" => $data["recipient_name"],
            "recipient_email" => $data["recipient_email"],
            "message" => isset($data["message"])
                ? sanitize_textarea_field((string) $data["message"])
                : "",
            "design" =>
                isset($data["design"]) &&
                WBK_Gift_Card_Design::get_variant($data["design"])
                    ? sanitize_key((string) $data["design"])
                    : "",
            "amount" => (string) $data["amount"],
            "send_on" => intval($data["send_on"]),
            "expiration_date" => intval($data["expiration_date"] ?? 0),
            "applicable_for_all_services" =>
                ($data["applicable_for_all_services"] ?? "") === "yes"
                    ? "yes"
                    : "",
            "services" => wp_json_encode(
                ($data["applicable_for_all_services"] ?? "") === "yes"
                    ? []
                    : array_values(array_map("intval", $data["services"] ?? [])),
            ),
            "history" => "[]",
            "sent" => "",
        ];

        $gift_card = new self($fields);
        $insert_id = $gift_card->save();

        if (!$insert_id) {
            return [
                "success" => false,
                "message" => __(
                    "Unable to create gift card.",
                    "webba-booking-lite",
                ),
            ];
        }

        // Store payment reference in a transient/meta map for idempotency lookups.
        if ($payment_id !== "") {
            set_transient(
                self::PENDING_TRANSIENT_PREFIX . "created_" . md5($payment_id),
                [
                    "id" => intval($insert_id),
                    "code" => $code,
                    "amount" => floatval($data["amount"]),
                    "payment_method" => $payment_method,
                    "payment_id" => $payment_id,
                    "buyer_email" => $data["buyer_email"],
                    "buyer_name" => $data["buyer_name"],
                    "recipient_name" => $data["recipient_name"],
                ],
                self::PENDING_TTL * 7,
            );
        }

        /**
         * Fires after a gift card is created from a completed payment.
         *
         * @param int    $insert_id
         * @param array  $data
         * @param string $payment_method
         * @param string $payment_id
         */
        do_action(
            "wbk_gift_card_created_from_payment",
            intval($insert_id),
            $data,
            $payment_method,
            $payment_id,
        );

        return [
            "success" => true,
            "gift_card" => [
                "id" => intval($insert_id),
                "code" => $code,
                "amount" => floatval($data["amount"]),
                "payment_method" => $payment_method,
                "payment_id" => $payment_id,
                "buyer_email" => $data["buyer_email"],
                "buyer_name" => $data["buyer_name"],
                "recipient_name" => $data["recipient_name"],
                "recipient_email" => $data["recipient_email"],
            ],
        ];
    }

    /**
     * @param string $payment_id
     * @return array|null
     */
    public static function find_by_payment_id($payment_id)
    {
        $payment_id = sanitize_text_field((string) $payment_id);
        if ($payment_id === "") {
            return null;
        }
        $found = get_transient(
            self::PENDING_TRANSIENT_PREFIX . "created_" . md5($payment_id),
        );
        return is_array($found) ? $found : null;
    }

    /**
     * Whether this payment id belongs to a pending or completed gift card order.
     *
     * @param string $payment_id
     * @return bool
     */
    public static function has_payment($payment_id)
    {
        if (self::find_by_payment_id($payment_id)) {
            return true;
        }
        $pending = self::get_pending_order($payment_id);
        return is_array($pending) && ($pending['type'] ?? '') === 'gift_card';
    }

    /**
     * Store unpaid gift card order details until payment completes.
     *
     * @param string $key Payment ID, cancel token, or WooCommerce cart key.
     * @param array  $data
     * @return void
     */
    public static function store_pending_order($key, $data)
    {
        $key = sanitize_text_field((string) $key);
        if ($key === "" || !is_array($data)) {
            return;
        }
        set_transient(
            self::PENDING_TRANSIENT_PREFIX . md5($key),
            $data,
            self::PENDING_TTL,
        );
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
        $data = get_transient(self::PENDING_TRANSIENT_PREFIX . md5($key));
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
        delete_transient(self::PENDING_TRANSIENT_PREFIX . md5($key));
    }

    /**
     * Map PayPal cancel token to payment id for cleanup.
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
        set_transient(
            self::PENDING_CANCEL_PREFIX . md5($cancel_token),
            $payment_id,
            self::PENDING_TTL,
        );
    }

    /**
     * @param string $cancel_token
     * @return string|null
     */
    public static function get_payment_id_by_cancel_token($cancel_token)
    {
        $cancel_token = sanitize_text_field((string) $cancel_token);
        if ($cancel_token === "") {
            return null;
        }
        $payment_id = get_transient(
            self::PENDING_CANCEL_PREFIX . md5($cancel_token),
        );
        return is_string($payment_id) && $payment_id !== "" ? $payment_id : null;
    }

    /**
     * Clear pending gift card data after PayPal cancellation.
     *
     * @param string $cancel_token
     * @return void
     */
    public static function clear_pending_by_cancel_token($cancel_token)
    {
        $payment_id = self::get_payment_id_by_cancel_token($cancel_token);
        if ($payment_id) {
            self::delete_pending_order($payment_id);
        }
        $cancel_token = sanitize_text_field((string) $cancel_token);
        if ($cancel_token !== "") {
            delete_transient(self::PENDING_CANCEL_PREFIX . md5($cancel_token));
        }
    }

    /**
     * Whether the recipient delivery email has already been sent.
     *
     * @return bool
     */
    public function is_recipient_notified()
    {
        return $this->get("sent") === "yes";
    }

    /**
     * Mark the recipient delivery email as sent.
     *
     * @return void
     */
    public function mark_recipient_notified()
    {
        $this->set("sent", "yes");
        $this->save();
    }

    /**
     * Whether Send card on is today or in the past (site timezone).
     *
     * @return bool
     */
    public function is_delivery_due()
    {
        $send_on = intval($this->get("send_on"));
        if ($send_on <= 0) {
            return false;
        }

        return $send_on <= time();
    }

    /**
     * Gift card IDs whose send-on date has arrived and that are not yet delivered.
     *
     * @param int|null $now
     * @return int[]
     */
    public static function get_ids_due_for_delivery($now = null)
    {
        global $wpdb;

        $now = $now === null ? time() : intval($now);
        $table = get_option("wbk_db_prefix", "") . "wbk_gift_cards";
        $ids = $wpdb->get_col(
            $wpdb->prepare(
                "SELECT id FROM {$table} WHERE send_on > 0 AND send_on <= %d AND (sent IS NULL OR sent = '' OR sent = '0')",
                $now,
            ),
        );

        if (!is_array($ids)) {
            return [];
        }

        return array_map("intval", $ids);
    }

    /**
     * Landing page URL for a gift card QR code, including the gift card id.
     *
     * @param int $gift_card_id
     * @return string
     */
    public static function get_landing_url($gift_card_id)
    {
        $gift_card_id = intval($gift_card_id);
        if ($gift_card_id <= 0) {
            return "";
        }

        $permalink = \WebbaBooking\Utilities\WBK_Options_Utils::get_gift_card_landing_page_link();
        if ($permalink === "") {
            return "";
        }

        return add_query_arg("gift_card_id", $gift_card_id, $permalink);
    }

    /**
     * Whether a gift card is still within its validity period.
     *
     * @param array $row Gift card row.
     * @return bool
     */
    public static function is_active_from_row($row)
    {
        if (!is_array($row)) {
            return false;
        }

        $expiration = intval($row["expiration_date"] ?? 0);
        if ($expiration <= 0) {
            return true;
        }

        return $expiration >= time();
    }

    /**
     * Public gift card details for the QR landing page.
     *
     * @param int $gift_card_id
     * @return array|null
     */
    public static function get_public_status($gift_card_id)
    {
        $gift_card_id = intval($gift_card_id);
        if ($gift_card_id <= 0) {
            return null;
        }

        $gift_card = new self($gift_card_id);
        if (!$gift_card->is_loaded()) {
            return null;
        }

        $row = [
            "amount" => $gift_card->get("amount"),
            "history" => $gift_card->get("history"),
            "expiration_date" => $gift_card->get("expiration_date"),
        ];
        $expiration = intval($row["expiration_date"]);
        $expiration_label = "";
        if ($expiration > 0) {
            $expiration_label = wp_date(
                WBK_Format_Utils::get_date_format(),
                $expiration,
                wp_timezone(),
            );
        }

        $amount = floatval($row["amount"] ?? 0);
        $remaining = self::remaining_amount_from_row($row);

        return [
            "id" => $gift_card->get_id(),
            "code" => (string) $gift_card->get("code"),
            "amount" => $amount,
            "remaining" => $remaining,
            "amount_formatted" => WBK_Format_Utils::format_price($amount),
            "remaining_formatted" => WBK_Format_Utils::format_price($remaining),
            "active" => self::is_active_from_row($row),
            "expiration_label" => $expiration_label,
        ];
    }
}
