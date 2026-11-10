<?php
if (!defined("ABSPATH")) {
    exit();
}

/**
 * Stripe delayed / off-session charge orchestration.
 *
 * Uses WP-Cron single events (same pattern as Zapier) — Action Scheduler is not used.
 */
class WBK_Stripe_Delayed_Payment
{
    const CRON_HOOK = "wbk_stripe_delayed_charge";
    const META_FIELD = "stripe_delayed_meta";
    const STATE_FIELD = "stripe_charge_status";

    const TIMING_IMMEDIATE = "immediate";
    const TIMING_HOURS_BEFORE = "hours_before";
    const TIMING_AT_START = "at_start";
    const TIMING_AT_END = "at_end";

    const STATE_CARD_SAVED = "card_saved";
    const STATE_SCHEDULED = "scheduled";
    const STATE_PROCESSING = "processing";
    const STATE_PAID = "paid";
    const STATE_FAILED = "failed";

    /** @var array<int, array{start:int,end:int}> */
    private static $booking_snapshots = [];

    public function __construct()
    {
        add_action(self::CRON_HOOK, [$this, "cron_charge_booking"], 10, 2);
        add_action("wbk_booking_status_changed", [$this, "on_status_changed"], 10, 3);
        add_action("wbk_booking_force_deleted", [$this, "on_force_deleted"], 10, 2);
        add_action("wbkdata_on_before_item_updated", [$this, "on_before_item_updated"], 10, 4);
        add_action("wbk_booking_updated", [$this, "on_booking_updated"], 10, 1);
        add_action("wbk_after_set_as_paid", [$this, "on_bookings_paid"], 20, 2);
        add_action("wbk_daily_event", [$this, "sweep_due_charges"]);
    }

    /**
     * Global charge timing from settings. Defaults to immediate for existing installs.
     */
    public static function get_configured_timing(): string
    {
        $timing = (string) get_option("wbk_stripe_charge_timing", self::TIMING_IMMEDIATE);
        $allowed = [
            self::TIMING_IMMEDIATE,
            self::TIMING_HOURS_BEFORE,
            self::TIMING_AT_START,
            self::TIMING_AT_END,
        ];
        if (!in_array($timing, $allowed, true)) {
            return self::TIMING_IMMEDIATE;
        }
        return $timing;
    }

    public static function get_configured_hours_before(): float
    {
        $hours = get_option("wbk_stripe_charge_hours_before", "24");
        if (!is_numeric($hours) || floatval($hours) < 0) {
            return 24.0;
        }
        return floatval($hours);
    }

    public static function is_delayed_timing($timing = null): bool
    {
        if ($timing === null) {
            $timing = self::get_configured_timing();
        }
        return $timing !== self::TIMING_IMMEDIATE;
    }

    /**
     * Snapshot of timing settings at booking time.
     *
     * @return array{timing:string,hours_before:float}
     */
    public static function snapshot_timing_config(): array
    {
        return [
            "timing" => self::get_configured_timing(),
            "hours_before" => self::get_configured_hours_before(),
        ];
    }

    /**
     * Calculate UTC unix timestamp when the charge should run.
     *
     * Booking start/end are stored as unix timestamps interpreted in business timezone.
     *
     * @param int $booking_start Unix start
     * @param int $booking_end Unix end
     * @param string $timing
     * @param float $hours_before
     * @return int UTC unix timestamp
     */
    public static function calculate_charge_at(
        int $booking_start,
        int $booking_end,
        string $timing,
        float $hours_before = 0
    ): int {
        switch ($timing) {
            case self::TIMING_HOURS_BEFORE:
                return (int) ($booking_start - (int) round($hours_before * HOUR_IN_SECONDS));
            case self::TIMING_AT_START:
                return (int) $booking_start;
            case self::TIMING_AT_END:
                return (int) $booking_end;
            case self::TIMING_IMMEDIATE:
            default:
                return time();
        }
    }

    /**
     * Whether charge_at is already due (should take payment immediately).
     */
    public static function should_charge_immediately(int $charge_at): bool
    {
        return $charge_at <= time();
    }

    /**
     * Human-readable timing label for customer agreement UI.
     */
    public static function format_timing_label(
        string $timing,
        float $hours_before = 0,
        int $charge_at = 0
    ): string {
        switch ($timing) {
            case self::TIMING_HOURS_BEFORE:
                $hours_label =
                    $hours_before == 1
                        ? __("1 hour before the booking starts", "webba-booking-lite")
                        : sprintf(
                            /* translators: %s: number of hours */
                            __("%s hours before the booking starts", "webba-booking-lite"),
                            rtrim(rtrim(number_format($hours_before, 2, ".", ""), "0"), "."),
                        );
                return $hours_label;
            case self::TIMING_AT_START:
                return __("when the booking starts", "webba-booking-lite");
            case self::TIMING_AT_END:
                return __("when the booking ends", "webba-booking-lite");
            default:
                return __("immediately", "webba-booking-lite");
        }
    }

    /**
     * @param WBK_Booking $booking
     * @return array<string,mixed>
     */
    public static function get_meta(WBK_Booking $booking): array
    {
        $raw = $booking->get(self::META_FIELD);
        if (!is_string($raw) || $raw === "") {
            return [];
        }
        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : [];
    }

    /**
     * @param WBK_Booking $booking
     * @param array<string,mixed> $meta
     */
    public static function save_meta(WBK_Booking $booking, array $meta): void
    {
        $booking->set(self::META_FIELD, wp_json_encode($meta));
        if (isset($meta["state"])) {
            $booking->set(self::STATE_FIELD, (string) $meta["state"]);
        }
        $booking->save();
    }

    /**
     * Apply the same delayed-payment meta to all bookings in a group.
     *
     * @param int[] $booking_ids
     * @param array<string,mixed> $meta
     */
    public static function save_meta_for_bookings(array $booking_ids, array $meta): void
    {
        foreach ($booking_ids as $booking_id) {
            $booking = new WBK_Booking((int) $booking_id);
            if (!$booking->is_loaded()) {
                continue;
            }
            self::save_meta($booking, $meta);
        }
    }

    /**
     * Build initial snapshot meta after successful card setup.
     *
     * @param int[] $booking_ids
     * @param array<string,mixed> $payment_details
     * @param array{timing:string,hours_before:float} $timing_snapshot
     * @return array<string,mixed>|WP_Error
     */
    public static function build_setup_meta(
        array $booking_ids,
        array $payment_details,
        array $timing_snapshot,
        string $customer_id,
        string $payment_method_id,
        string $setup_intent_id
    ) {
        $first = new WBK_Booking((int) $booking_ids[0]);
        if (!$first->is_loaded()) {
            return new WP_Error(
                "wbk_stripe_delayed_booking",
                __("Unable to open booking", "webba-booking-lite"),
            );
        }

        $start = (int) $first->get_start();
        $end = (int) $first->get_end();
        if ($end < $start) {
            $end = $start;
        }

        $timing = $timing_snapshot["timing"] ?? self::TIMING_IMMEDIATE;
        $hours = floatval($timing_snapshot["hours_before"] ?? 0);
        $charge_at = self::calculate_charge_at($start, $end, $timing, $hours);

        $amount = floatval($payment_details["to_pay_total"] ?? 0);
        $currency = strtolower((string) get_option("wbk_stripe_currency", "usd"));
        $job_token = self::generate_job_token($booking_ids, $charge_at, $amount);

        $state =
            self::should_charge_immediately($charge_at)
                ? self::STATE_CARD_SAVED
                : self::STATE_SCHEDULED;

        return [
            "timing" => $timing,
            "hours_before" => $hours,
            "amount" => $amount,
            "currency" => $currency,
            "charge_at" => $charge_at,
            "state" => $state,
            "customer_id" => $customer_id,
            "payment_method_id" => $payment_method_id,
            "setup_intent_id" => $setup_intent_id,
            "payment_intent_id" => "",
            "idempotency_key" => "wbk_dc_" . $job_token,
            "job_token" => $job_token,
            "booking_ids" => array_map("intval", $booking_ids),
            "created_at" => time(),
        ];
    }

    /**
     * @param int[] $booking_ids
     */
    public static function generate_job_token(array $booking_ids, int $charge_at, float $amount): string
    {
        sort($booking_ids);
        $seed =
            implode("-", array_map("intval", $booking_ids)) .
            "|" .
            $charge_at .
            "|" .
            number_format($amount, 2, ".", "");
        return substr(hash("sha256", $seed . "|" . wp_salt("auth")), 0, 32);
    }

    /**
     * Schedule (or replace) the delayed charge cron for a booking group.
     *
     * @param int[] $booking_ids
     * @param array<string,mixed> $meta
     */
    public static function schedule_charge(array $booking_ids, array $meta): void
    {
        if (empty($booking_ids) || empty($meta["job_token"])) {
            return;
        }

        $primary_id = (int) $booking_ids[0];
        $job_token = (string) $meta["job_token"];
        $charge_at = (int) ($meta["charge_at"] ?? 0);

        self::unschedule_charge($primary_id, $job_token);

        if (($meta["state"] ?? "") === self::STATE_PAID) {
            return;
        }

        if (self::should_charge_immediately($charge_at)) {
            // Caller may charge immediately; still allow a near-term cron as fallback.
            $charge_at = time();
        }

        $timestamp = max(time(), $charge_at);
        wp_schedule_single_event($timestamp, self::CRON_HOOK, [$primary_id, $job_token]);

        if (function_exists("spawn_cron")) {
            spawn_cron();
        }
    }

    public static function unschedule_charge(int $primary_booking_id, string $job_token = ""): void
    {
        $crons = _get_cron_array();
        if (!is_array($crons)) {
            return;
        }

        foreach ($crons as $timestamp => $hooks) {
            if (!isset($hooks[self::CRON_HOOK]) || !is_array($hooks[self::CRON_HOOK])) {
                continue;
            }
            foreach ($hooks[self::CRON_HOOK] as $key => $event) {
                $args = $event["args"] ?? [];
                $arg_booking = isset($args[0]) ? (int) $args[0] : 0;
                $arg_token = isset($args[1]) ? (string) $args[1] : "";
                if ($arg_booking !== $primary_booking_id) {
                    continue;
                }
                if ($job_token !== "" && $arg_token !== $job_token) {
                    // Still clear any job for this booking when replacing.
                }
                wp_unschedule_event((int) $timestamp, self::CRON_HOOK, $args);
            }
        }
    }

    /**
     * Cancel pending jobs for bookings (cancel / delete).
     *
     * @param int[] $booking_ids
     */
    public static function cancel_pending_for_bookings(array $booking_ids): void
    {
        foreach ($booking_ids as $booking_id) {
            $booking = new WBK_Booking((int) $booking_id);
            if (!$booking->is_loaded()) {
                self::unschedule_charge((int) $booking_id);
                continue;
            }
            $meta = self::get_meta($booking);
            $token = (string) ($meta["job_token"] ?? "");
            $group = !empty($meta["booking_ids"])
                ? array_map("intval", $meta["booking_ids"])
                : [(int) $booking_id];
            self::unschedule_charge((int) $group[0], $token);

            if (
                isset($meta["state"]) &&
                in_array(
                    $meta["state"],
                    [self::STATE_SCHEDULED, self::STATE_CARD_SAVED],
                    true,
                )
            ) {
                $meta["state"] = "cancelled";
                self::save_meta($booking, $meta);
            }
        }
    }

    /**
     * Cron callback.
     *
     * @param int $booking_id
     * @param string $job_token
     */
    public function cron_charge_booking($booking_id, $job_token = "")
    {
        self::execute_scheduled_charge((int) $booking_id, (string) $job_token);
    }

    /**
     * Daily sweep for due charges missed by WP-Cron.
     */
    public function sweep_due_charges(): void
    {
        global $wpdb;
        $table = get_option("wbk_db_prefix", "") . "wbk_appointments";
        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $rows = $wpdb->get_results(
            "SELECT id, stripe_delayed_meta, stripe_charge_status, amount_paid, status
             FROM {$table}
             WHERE stripe_charge_status IN ('scheduled','card_saved','processing')
             LIMIT 200",
            ARRAY_A,
        );
        if (!is_array($rows)) {
            return;
        }

        foreach ($rows as $row) {
            $meta = json_decode((string) ($row["stripe_delayed_meta"] ?? ""), true);
            if (!is_array($meta)) {
                continue;
            }
            $charge_at = (int) ($meta["charge_at"] ?? 0);
            if ($charge_at > time() + 60) {
                continue;
            }
            if (in_array((string) ($row["status"] ?? ""), ["cancelled", "rejected"], true)) {
                continue;
            }
            if (floatval($row["amount_paid"] ?? 0) > 0) {
                continue;
            }
            self::execute_scheduled_charge((int) $row["id"], (string) ($meta["job_token"] ?? ""));
        }
    }

    /**
     * Execute (or resume) an off-session charge for a booking group.
     *
     * @return array{success:bool,message?:string,skipped?:bool}
     */
    public static function execute_scheduled_charge(int $booking_id, string $job_token = ""): array
    {
        $booking = new WBK_Booking($booking_id);
        if (!$booking->is_loaded()) {
            return ["success" => false, "skipped" => true, "message" => "booking_missing"];
        }

        $meta = self::get_meta($booking);
        if (empty($meta)) {
            return ["success" => false, "skipped" => true, "message" => "no_meta"];
        }

        if ($job_token !== "" && ($meta["job_token"] ?? "") !== $job_token) {
            return ["success" => false, "skipped" => true, "message" => "job_token_mismatch"];
        }

        $status = (string) $booking->get("status");
        if (in_array($status, ["cancelled", "rejected"], true)) {
            return ["success" => false, "skipped" => true, "message" => "cancelled"];
        }

        if (self::is_booking_paid($booking) || ($meta["state"] ?? "") === self::STATE_PAID) {
            return ["success" => true, "skipped" => true, "message" => "already_paid"];
        }

        $booking_ids = !empty($meta["booking_ids"])
            ? array_map("intval", $meta["booking_ids"])
            : [$booking_id];

        // Concurrency guard
        $lock_key = "wbk_stripe_dc_lock_" . ($meta["job_token"] ?? $booking_id);
        if (get_transient($lock_key)) {
            return ["success" => false, "skipped" => true, "message" => "locked"];
        }
        set_transient($lock_key, 1, 120);

        try {
            // Reconcile existing PaymentIntent before creating another.
            if (!empty($meta["payment_intent_id"])) {
                $reconciled = self::reconcile_existing_intent($booking_ids, $meta);
                if ($reconciled !== null) {
                    return $reconciled;
                }
            }

            if (($meta["state"] ?? "") === self::STATE_FAILED) {
                // Do not blindly retry declines.
                return ["success" => false, "skipped" => true, "message" => "failed_no_retry"];
            }

            $customer_id = (string) ($meta["customer_id"] ?? "");
            $pm_id = (string) ($meta["payment_method_id"] ?? "");
            $amount = floatval($meta["amount"] ?? 0);
            $currency = (string) ($meta["currency"] ?? get_option("wbk_stripe_currency", "usd"));

            if ($amount <= 0) {
                self::mark_group_state($booking_ids, $meta, self::STATE_PAID);
                return ["success" => true, "skipped" => true, "message" => "zero_amount"];
            }

            if ($customer_id === "" || $pm_id === "") {
                self::mark_charge_failed(
                    $booking_ids,
                    $meta,
                    __("Saved payment method is missing.", "webba-booking-lite"),
                );
                return ["success" => false, "message" => "missing_payment_method"];
            }

            $service_id = (int) $booking->get_service();
            $stripe = new WBK_Stripe();
            if (!$stripe->init($service_id)) {
                // Transient config issue — leave scheduled for retry via sweep.
                return ["success" => false, "message" => "stripe_init_failed"];
            }

            $meta["state"] = self::STATE_PROCESSING;
            self::save_meta_for_bookings($booking_ids, $meta);

            $idempotency = (string) ($meta["idempotency_key"] ?? ("wbk_dc_" . $meta["job_token"]));
            $result = $stripe->create_off_session_payment_intent([
                "amount" => $amount,
                "currency" => $currency,
                "customer" => $customer_id,
                "payment_method" => $pm_id,
                "description" => self::build_description($booking_ids),
                "metadata" => [
                    "wbk_booking_ids" => implode(",", $booking_ids),
                    "wbk_job_token" => (string) ($meta["job_token"] ?? ""),
                ],
                "receipt_email" => (string) $booking->get("email"),
                "idempotency_key" => $idempotency,
            ]);

            if (empty($result["success"])) {
                $error_type = $result["error_type"] ?? "api";
                if (in_array($error_type, ["card", "authentication_required"], true)) {
                    self::mark_charge_failed(
                        $booking_ids,
                        $meta,
                        (string) ($result["error"] ?? "Payment declined"),
                    );
                    return ["success" => false, "message" => "declined"];
                }
                // Transient API/network — keep scheduled/processing for safe retry with same idempotency.
                $meta["state"] = self::STATE_SCHEDULED;
                $meta["last_error"] = (string) ($result["error"] ?? "api_error");
                self::save_meta_for_bookings($booking_ids, $meta);
                self::schedule_charge($booking_ids, $meta);
                return ["success" => false, "message" => "transient_error"];
            }

            /** @var object $intent */
            $intent = $result["intent"];
            $meta["payment_intent_id"] = $intent->id;
            foreach ($booking_ids as $id) {
                $b = new WBK_Booking((int) $id);
                if ($b->is_loaded()) {
                    $b->set("payment_id", $intent->id);
                    $b->save();
                }
            }

            if ($intent->status === "succeeded") {
                return self::finalize_paid($booking_ids, $meta, $intent);
            }

            if (
                $intent->status === "requires_action" ||
                $intent->status === "requires_payment_method"
            ) {
                self::mark_charge_failed(
                    $booking_ids,
                    $meta,
                    __(
                        "Additional customer authentication is required to complete the payment.",
                        "webba-booking-lite",
                    ),
                );
                return ["success" => false, "message" => "requires_action"];
            }

            // processing / requires_capture — wait for webhook
            $meta["state"] = self::STATE_PROCESSING;
            self::save_meta_for_bookings($booking_ids, $meta);
            return ["success" => true, "message" => "processing"];
        } finally {
            delete_transient($lock_key);
        }
    }

    /**
     * @param int[] $booking_ids
     * @param array<string,mixed> $meta
     * @return array{success:bool,message?:string,skipped?:bool}|null
     */
    private static function reconcile_existing_intent(array $booking_ids, array &$meta)
    {
        $first = new WBK_Booking((int) $booking_ids[0]);
        $stripe = new WBK_Stripe();
        if (!$first->is_loaded() || !$stripe->init((int) $first->get_service())) {
            return null;
        }
        $intent = $stripe->get_payment_intent((string) $meta["payment_intent_id"]);
        if (!is_object($intent)) {
            return null;
        }
        if ($intent->status === "succeeded") {
            return self::finalize_paid($booking_ids, $meta, $intent);
        }
        if (in_array($intent->status, ["canceled", "requires_payment_method"], true)) {
            // Allow a new attempt only if previous was canceled and not a hard decline state.
            if (($meta["state"] ?? "") !== self::STATE_FAILED) {
                $meta["payment_intent_id"] = "";
                // Rotate idempotency for a fresh attempt after cancel.
                $meta["idempotency_key"] =
                    "wbk_dc_" . ($meta["job_token"] ?? "") . "_r" . time();
            }
            return null;
        }
        if ($intent->status === "processing") {
            $meta["state"] = self::STATE_PROCESSING;
            self::save_meta_for_bookings($booking_ids, $meta);
            return ["success" => true, "skipped" => true, "message" => "processing"];
        }
        return null;
    }

    /**
     * @param int[] $booking_ids
     * @param array<string,mixed> $meta
     * @param object $intent
     */
    public static function finalize_paid(array $booking_ids, array $meta, $intent): array
    {
        $already = true;
        foreach ($booking_ids as $id) {
            $b = new WBK_Booking((int) $id);
            if ($b->is_loaded() && !self::is_booking_paid($b)) {
                $already = false;
                break;
            }
        }
        if ($already) {
            self::mark_group_state($booking_ids, $meta, self::STATE_PAID);
            return ["success" => true, "skipped" => true, "message" => "already_paid"];
        }

        $currency = (string) ($meta["currency"] ?? get_option("wbk_stripe_currency", ""));
        if (WBK_Stripe::is_currency_zero_decimal($currency)) {
            $paid_total = floatval($intent->amount);
        } else {
            $paid_total = floatval($intent->amount) / 100;
        }

        $method = "stripe";
        $first = new WBK_Booking((int) $booking_ids[0]);
        if ($first->is_loaded() && $first->get("payment_method")) {
            $method = (string) $first->get("payment_method");
        }
        if ($method === "" || $method === "arrival") {
            $method = "stripe";
        }

        $factory = new WBK_Booking_Factory();
        $factory->set_as_paid($booking_ids, $method, $paid_total);

        $meta["state"] = self::STATE_PAID;
        $meta["payment_intent_id"] = $intent->id;
        $meta["paid_at"] = time();
        self::save_meta_for_bookings($booking_ids, $meta);
        self::unschedule_charge((int) $booking_ids[0], (string) ($meta["job_token"] ?? ""));

        return ["success" => true, "message" => "paid"];
    }

    /**
     * @param int[] $booking_ids
     * @param array<string,mixed> $meta
     */
    public static function mark_charge_failed(
        array $booking_ids,
        array $meta,
        string $error_message
    ): void {
        $meta["state"] = self::STATE_FAILED;
        $meta["last_error"] = $error_message;
        $meta["failed_at"] = time();
        self::save_meta_for_bookings($booking_ids, $meta);
        self::unschedule_charge((int) $booking_ids[0], (string) ($meta["job_token"] ?? ""));
        self::notify_charge_failed($booking_ids, $error_message);
    }

    /**
     * @param int[] $booking_ids
     * @param array<string,mixed> $meta
     */
    private static function mark_group_state(array $booking_ids, array $meta, string $state): void
    {
        $meta["state"] = $state;
        self::save_meta_for_bookings($booking_ids, $meta);
    }

    public static function is_booking_paid(WBK_Booking $booking): bool
    {
        // Do not treat a saved payment_method alone as paid (delayed SetupIntent path).
        if (floatval($booking->get("amount_paid")) > 0) {
            return true;
        }
        return $booking->get("paid_with_coupon") === "yes";
    }

    /**
     * @param int[] $booking_ids
     */
    private static function build_description(array $booking_ids): string
    {
        $names = [];
        foreach ($booking_ids as $id) {
            $b = new WBK_Booking((int) $id);
            if (!$b->is_loaded()) {
                continue;
            }
            $service = new WBK_Service($b->get_service());
            if ($service->is_loaded()) {
                $names[] = $service->get_name();
            }
        }
        return implode(", ", array_unique($names));
    }

    /**
     * Notify admin and send customer recovery payment link.
     *
     * @param int[] $booking_ids
     */
    public static function notify_charge_failed(array $booking_ids, string $error_message): void
    {
        $first = new WBK_Booking((int) $booking_ids[0]);
        if (!$first->is_loaded()) {
            return;
        }

        $admin_email = get_option("wbk_super_admin_email", get_option("admin_email"));
        $subject = sprintf(
            /* translators: %d: booking id */
            __("[Webba Booking] Delayed Stripe charge failed for booking #%d", "webba-booking-lite"),
            (int) $booking_ids[0],
        );
        $body =
            __("A scheduled Stripe charge could not be completed.", "webba-booking-lite") .
            "\n\n" .
            __("Error:", "webba-booking-lite") .
            " " .
            $error_message .
            "\n" .
            __("Booking IDs:", "webba-booking-lite") .
            " " .
            implode(", ", $booking_ids) .
            "\n" .
            __("Customer:", "webba-booking-lite") .
            " " .
            $first->get("email");

        if (is_email($admin_email)) {
            wp_mail($admin_email, $subject, $body);
        }

        // Customer recovery via existing payment landing link.
        $landing = WBK_Options_Utils::get_email_landing_page_link();
        $customer_email = $first->get("email");
        if ($landing && is_email($customer_email)) {
            $token = $first->get("token");
            $link = esc_url($landing) . "?order_payment=" . rawurlencode((string) $token);
            $cust_subject = __(
                "Action required: complete your booking payment",
                "webba-booking-lite",
            );
            $cust_body =
                __(
                    "We were unable to charge the card saved for your booking. Please use the secure link below to complete payment:",
                    "webba-booking-lite",
                ) .
                "\n\n" .
                $link .
                "\n\n" .
                $error_message;
            wp_mail($customer_email, $cust_subject, $cust_body);
        }
    }

    /**
     * Handle verified Stripe webhook events related to delayed charges.
     *
     * @param object $event Stripe\Event
     */
    public static function handle_webhook_event($event): void
    {
        $type = $event->type ?? "";
        $object = $event->data->object ?? null;
        if (!$object) {
            return;
        }

        if ($type === "payment_intent.succeeded") {
            $pi_id = $object->id ?? "";
            $booking_ids = WBK_Model_Utils::get_booking_ids_by_payment_id($pi_id);
            if (empty($booking_ids)) {
                $meta_ids = self::find_booking_ids_by_payment_intent($pi_id);
                $booking_ids = $meta_ids;
            }
            if (empty($booking_ids)) {
                return;
            }
            $booking = new WBK_Booking((int) $booking_ids[0]);
            $meta = $booking->is_loaded() ? self::get_meta($booking) : [];
            if (empty($meta["booking_ids"])) {
                $meta["booking_ids"] = $booking_ids;
            }
            self::finalize_paid($booking_ids, $meta, $object);
            return;
        }

        if ($type === "payment_intent.payment_failed") {
            $pi_id = $object->id ?? "";
            $booking_ids = WBK_Model_Utils::get_booking_ids_by_payment_id($pi_id);
            if (empty($booking_ids)) {
                $booking_ids = self::find_booking_ids_by_payment_intent($pi_id);
            }
            if (empty($booking_ids)) {
                return;
            }
            $booking = new WBK_Booking((int) $booking_ids[0]);
            $meta = $booking->is_loaded() ? self::get_meta($booking) : [];
            if (empty($meta["booking_ids"])) {
                $meta["booking_ids"] = $booking_ids;
            }
            $message =
                $object->last_payment_error->message ??
                __("Payment failed", "webba-booking-lite");
            self::mark_charge_failed($booking_ids, $meta, (string) $message);
        }
    }

    /**
     * @return int[]
     */
    private static function find_booking_ids_by_payment_intent(string $pi_id): array
    {
        global $wpdb;
        if ($pi_id === "") {
            return [];
        }
        $table = get_option("wbk_db_prefix", "") . "wbk_appointments";
        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $ids = $wpdb->get_col(
            $wpdb->prepare(
                "SELECT id FROM {$table} WHERE stripe_delayed_meta LIKE %s LIMIT 50",
                "%" . $wpdb->esc_like($pi_id) . "%",
            ),
        );
        return array_map("intval", is_array($ids) ? $ids : []);
    }

    public function on_status_changed($booking_id, $prev, $new)
    {
        if (in_array((string) $new, ["cancelled", "rejected"], true)) {
            self::cancel_pending_for_bookings([(int) $booking_id]);
        }
    }

    public function on_force_deleted($booking_id, $snapshot = [])
    {
        self::unschedule_charge((int) $booking_id);
    }

    public function on_before_item_updated($model_name, $model_name_raw, $id, $fields = [])
    {
        if ($model_name !== get_option("wbk_db_prefix", "") . "wbk_appointments") {
            return;
        }
        $booking = new WBK_Booking((int) $id);
        if (!$booking->is_loaded()) {
            return;
        }
        self::$booking_snapshots[(int) $id] = [
            "start" => (int) $booking->get_start(),
            "end" => (int) $booking->get_end(),
        ];
    }

    public function on_booking_updated($booking_id)
    {
        $booking_id = (int) $booking_id;
        if ($booking_id < 1 || !isset(self::$booking_snapshots[$booking_id])) {
            return;
        }
        $before = self::$booking_snapshots[$booking_id];
        unset(self::$booking_snapshots[$booking_id]);

        $booking = new WBK_Booking($booking_id);
        if (!$booking->is_loaded()) {
            return;
        }

        $meta = self::get_meta($booking);
        if (empty($meta) || empty($meta["timing"]) || $meta["timing"] === self::TIMING_IMMEDIATE) {
            return;
        }

        $new_start = (int) $booking->get_start();
        $new_end = (int) $booking->get_end();
        if ($new_start === (int) $before["start"] && $new_end === (int) $before["end"]) {
            return;
        }

        // Rescheduling while payment is processing — do not start a second charge.
        if (($meta["state"] ?? "") === self::STATE_PROCESSING) {
            return;
        }
        if (($meta["state"] ?? "") === self::STATE_PAID || self::is_booking_paid($booking)) {
            return;
        }
        if (($meta["state"] ?? "") === self::STATE_FAILED) {
            return;
        }

        $charge_at = self::calculate_charge_at(
            $new_start,
            $new_end,
            (string) $meta["timing"],
            floatval($meta["hours_before"] ?? 0),
        );
        $booking_ids = !empty($meta["booking_ids"])
            ? array_map("intval", $meta["booking_ids"])
            : [$booking_id];

        self::unschedule_charge((int) $booking_ids[0], (string) ($meta["job_token"] ?? ""));

        $meta["charge_at"] = $charge_at;
        $meta["job_token"] = self::generate_job_token(
            $booking_ids,
            $charge_at,
            floatval($meta["amount"] ?? 0),
        );
        $meta["idempotency_key"] = "wbk_dc_" . $meta["job_token"];

        if (self::should_charge_immediately($charge_at)) {
            $meta["state"] = self::STATE_CARD_SAVED;
            self::save_meta_for_bookings($booking_ids, $meta);
            self::execute_scheduled_charge((int) $booking_ids[0], (string) $meta["job_token"]);
            return;
        }

        $meta["state"] = self::STATE_SCHEDULED;
        self::save_meta_for_bookings($booking_ids, $meta);
        self::schedule_charge($booking_ids, $meta);
    }

    /**
     * @param int[] $booking_ids
     */
    public function on_bookings_paid($booking_ids, $method = "")
    {
        if (!is_array($booking_ids)) {
            return;
        }
        foreach ($booking_ids as $booking_id) {
            $booking = new WBK_Booking((int) $booking_id);
            if (!$booking->is_loaded()) {
                continue;
            }
            $meta = self::get_meta($booking);
            if (empty($meta)) {
                continue;
            }
            $meta["state"] = self::STATE_PAID;
            self::save_meta($booking, $meta);
            self::unschedule_charge(
                (int) (!empty($meta["booking_ids"][0]) ? $meta["booking_ids"][0] : $booking_id),
                (string) ($meta["job_token"] ?? ""),
            );
        }
    }
}
