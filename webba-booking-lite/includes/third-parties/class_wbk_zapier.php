<?php
if (!defined("ABSPATH")) {
    exit();
}

/**
 * Outbound Zapier Catch Hook integration (Pro).
 *
 * Persists webhook deliveries and processes them asynchronously via WP-Cron.
 * Chosen over Action Scheduler because the plugin has no existing durable queue;
 * a dedicated table + WP-Cron is the smallest WordPress-compatible approach that
 * supports retries, locking, and retention without a new framework.
 */
class WBK_Zapier
{
    const SCHEMA_VERSION = 1;
    const CRON_HOOK = "wbk_zapier_process_queue";
    const LOCK_SECONDS = 60;
    const REQUEST_TIMEOUT = 8;
    const MAX_ATTEMPTS = 5;
    const RETENTION_DAYS = 14;
    const HOST = "hooks.zapier.com";

    /** @var array<int, array{start:int,end:int,status:string}> */
    private static $booking_snapshots = [];

    public function __construct()
    {
        add_action("init", [$this, "ensure_table"]);
        add_action("admin_init", [$this, "maybe_process_queue_on_admin"]);
        add_action("wbebba_after_bookings_added", [$this, "on_bookings_added"], 20);
        add_action("wbk_booking_status_changed", [$this, "on_status_changed"], 10, 3);
        add_action("wbk_booking_force_deleted", [$this, "on_force_deleted"], 10, 2);
        add_action("wbk_after_set_as_paid", [$this, "on_bookings_paid"], 20, 2);
        add_action("wbkdata_on_before_item_updated", [$this, "on_before_item_updated"], 10, 4);
        add_action("wbk_booking_updated", [$this, "on_booking_updated"], 10, 1);
        add_action("wbk_options_saved", [$this, "on_options_saved"], 10, 2);
        add_action(self::CRON_HOOK, [$this, "cron_process_queue"]);
        add_action("wbk_daily_event", [$this, "cleanup_old_deliveries"]);
        add_action("wp_ajax_wbk_zapier_process_queue", [$this, "ajax_process_queue"]);
        add_action("wp_ajax_nopriv_wbk_zapier_process_queue", [
            $this,
            "ajax_process_queue",
        ]);
    }

    public static function is_available(): bool
    {
        return class_exists("WBK_Feature_Gate") &&
            WBK_Feature_Gate::have_required_plan("premium");
    }

    public static function is_enabled(): bool
    {
        if (!self::is_available()) {
            return false;
        }
        return self::is_truthy_option(get_option("wbk_zapier_enabled", ""));
    }

    public function ensure_table(): void
    {
        if (!self::is_available()) {
            return;
        }
        if (!class_exists("WBK_Migration_Zapier_Deliveries")) {
            require_once WP_WEBBA_BOOKING__PLUGIN_DIR .
                "/includes/migrations/class-wbk-migration-zapier-deliveries.php";
        }
        WBK_Migration_Zapier_Deliveries::run();
    }

    /**
     * Validate a Zapier Catch Hook URL.
     *
     * @param string $url
     * @return true|WP_Error
     */
    public static function validate_webhook_url($url)
    {
        $url = is_string($url) ? trim($url) : "";
        if ($url === "") {
            return new WP_Error(
                "wbk_zapier_url_empty",
                __("Webhook URL is required.", "webba-booking-lite"),
            );
        }

        if (!wp_http_validate_url($url)) {
            return new WP_Error(
                "wbk_zapier_url_invalid",
                __("Webhook URL is not a valid URL.", "webba-booking-lite"),
            );
        }

        $parts = wp_parse_url($url);
        if (!is_array($parts)) {
            return new WP_Error(
                "wbk_zapier_url_invalid",
                __("Webhook URL could not be parsed.", "webba-booking-lite"),
            );
        }

        if (($parts["scheme"] ?? "") !== "https") {
            return new WP_Error(
                "wbk_zapier_url_scheme",
                __("Webhook URL must use HTTPS.", "webba-booking-lite"),
            );
        }

        if (($parts["host"] ?? "") !== self::HOST) {
            return new WP_Error(
                "wbk_zapier_url_host",
                __("Webhook URL must use hooks.zapier.com.", "webba-booking-lite"),
            );
        }

        if (isset($parts["port"])) {
            return new WP_Error(
                "wbk_zapier_url_port",
                __("Custom ports are not allowed on webhook URLs.", "webba-booking-lite"),
            );
        }

        if (!empty($parts["user"]) || !empty($parts["pass"])) {
            return new WP_Error(
                "wbk_zapier_url_credentials",
                __("Credentials in webhook URLs are not allowed.", "webba-booking-lite"),
            );
        }

        $path = isset($parts["path"]) ? (string) $parts["path"] : "";
        // Catch Hook paths: /hooks/catch/{hook_id}/{hook_key}/ (trailing slash optional)
        if (
            !preg_match(
                '#^/hooks/catch/[A-Za-z0-9_-]+/[A-Za-z0-9_-]+/?$#',
                $path,
            )
        ) {
            return new WP_Error(
                "wbk_zapier_url_path",
                __(
                    "Webhook URL must be a valid Zapier Catch Hook path.",
                    "webba-booking-lite",
                ),
            );
        }

        return true;
    }

    public static function get_configured_webhook_url(): string
    {
        return trim((string) get_option("wbk_zapier_webhook_url", ""));
    }

    public static function webhook_url_hash($url): string
    {
        return hash("sha256", (string) $url);
    }

    public static function is_event_enabled($event_type): bool
    {
        $map = [
            "booking.created" => "wbk_zapier_event_created",
            "booking.cancelled" => "wbk_zapier_event_cancelled",
            "booking.rescheduled" => "wbk_zapier_event_rescheduled",
            "booking.paid" => "wbk_zapier_event_paid",
        ];
        if (!isset($map[$event_type])) {
            return false;
        }
        $value = get_option($map[$event_type], "");
        return self::is_truthy_option($value);
    }

    /**
     * @param mixed $value
     */
    private static function is_truthy_option($value): bool
    {
        if (is_bool($value)) {
            return $value;
        }
        $value = strtolower(trim((string) $value));
        return in_array($value, ["yes", "true", "1", "on"], true);
    }

    public function maybe_process_queue_on_admin(): void
    {
        if (!self::is_available() || !self::is_enabled()) {
            return;
        }
        // Drain a few pending jobs when an admin loads wp-admin.
        self::process_queue(5);
    }

    public function ajax_process_queue(): void
    {
        $token = isset($_REQUEST["token"])
            ? sanitize_text_field(wp_unslash((string) $_REQUEST["token"]))
            : "";
        if ($token === "" || !hash_equals(self::queue_worker_token(), $token)) {
            status_header(403);
            wp_die("forbidden", 403);
        }
        self::process_queue(10);
        wp_die("ok", 200);
    }

    private static function queue_worker_token(): string
    {
        return hash_hmac("sha256", "wbk_zapier_process_queue", wp_salt("auth"));
    }

    /**
     * Remember booking start/end/status before an update.
     *
     * @param int $booking_id
     */
    public static function remember_booking_state($booking_id): void
    {
        $booking_id = (int) $booking_id;
        if ($booking_id < 1) {
            return;
        }
        $booking = new WBK_Booking($booking_id);
        if (!$booking->is_loaded()) {
            return;
        }
        self::$booking_snapshots[$booking_id] = [
            "start" => (int) $booking->get_start(),
            "end" => (int) $booking->get_end(),
            "status" => (string) $booking->get("status"),
        ];
    }

    public function on_before_item_updated($model_name, $model_name_raw, $id, $fields = [])
    {
        if ($model_name !== get_option("wbk_db_prefix", "") . "wbk_appointments") {
            return;
        }
        self::remember_booking_state((int) $id);
    }

    /**
     * @param int[] $booking_ids
     */
    public function on_bookings_added($booking_ids)
    {
        if (!self::is_enabled() || !self::is_event_enabled("booking.created")) {
            return;
        }
        if (!is_array($booking_ids)) {
            return;
        }
        foreach ($booking_ids as $booking_id) {
            self::enqueue_event("booking.created", (int) $booking_id);
        }
    }

    /**
     * Fired after a booking is marked paid by any payment method.
     *
     * @param int[] $booking_ids
     * @param string $method
     */
    public function on_bookings_paid($booking_ids, $method = "")
    {
        if (!self::is_enabled() || !self::is_event_enabled("booking.paid")) {
            return;
        }
        if (!is_array($booking_ids) || empty($booking_ids)) {
            return;
        }
        foreach ($booking_ids as $booking_id) {
            self::enqueue_event("booking.paid", (int) $booking_id, [
                "payment_method" => (string) $method,
            ]);
        }
    }

    /**
     * @param int $booking_id
     * @param string $prev_status
     * @param string $new_status
     */
    public function on_status_changed($booking_id, $prev_status, $new_status)
    {
        if (!self::is_enabled() || !self::is_event_enabled("booking.cancelled")) {
            return;
        }
        $prev_status = (string) $prev_status;
        $new_status = (string) $new_status;
        if ($prev_status === $new_status) {
            return;
        }
        if (!in_array($new_status, ["cancelled", "rejected"], true)) {
            return;
        }
        if (in_array($prev_status, ["cancelled", "rejected"], true)) {
            return;
        }
        self::enqueue_event("booking.cancelled", (int) $booking_id);
    }

    /**
     * @param int $booking_id
     * @param array $snapshot
     */
    public function on_force_deleted($booking_id, $snapshot = [])
    {
        if (!self::is_enabled() || !self::is_event_enabled("booking.cancelled")) {
            return;
        }
        $prev = isset($snapshot["status"]) ? (string) $snapshot["status"] : "";
        if (in_array($prev, ["cancelled", "rejected"], true)) {
            return;
        }
        $payload = is_array($snapshot) && !empty($snapshot["payload"])
            ? $snapshot["payload"]
            : null;
        self::enqueue_event("booking.cancelled", (int) $booking_id, [
            "payload" => $payload,
        ]);
    }

    /**
     * @param int $booking_id
     */
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

        $new_status = (string) $booking->get("status");
        $prev_status = (string) ($before["status"] ?? "");

        // Status transitions to cancelled/rejected are handled by status_changed when
        // set_booking_status is used; WbkData updates may only change columns here.
        if (
            self::is_enabled() &&
            self::is_event_enabled("booking.cancelled") &&
            $prev_status !== $new_status &&
            in_array($new_status, ["cancelled", "rejected"], true) &&
            !in_array($prev_status, ["cancelled", "rejected"], true)
        ) {
            self::enqueue_event("booking.cancelled", $booking_id);
        }

        $new_start = (int) $booking->get_start();
        $new_end = (int) $booking->get_end();
        $old_start = (int) ($before["start"] ?? 0);
        $old_end = (int) ($before["end"] ?? 0);

        if ($old_start === $new_start && $old_end === $new_end) {
            return;
        }

        if (!self::is_enabled() || !self::is_event_enabled("booking.rescheduled")) {
            return;
        }

        self::enqueue_event("booking.rescheduled", $booking_id, [
            "previous" => [
                "start" => $old_start,
                "end" => $old_end,
            ],
        ]);
    }

    /**
     * Sanitize Zapier settings after save; clear unsafe values when Pro is gone.
     *
     * @param string $section
     * @param array $options
     */
    public function on_options_saved($section = "", $options = [])
    {
        if ($section !== "" && $section !== "wbk_integrations_settings_section") {
            return;
        }

        if (!self::is_available()) {
            update_option("wbk_zapier_enabled", "");
            return;
        }

        // If Zapier is enabled but no events are selected, enable "new booking"
        // so the common setup works without a silent no-op.
        if (self::is_truthy_option(get_option("wbk_zapier_enabled", ""))) {
            $any_event =
                self::is_event_enabled("booking.created") ||
                self::is_event_enabled("booking.cancelled") ||
                self::is_event_enabled("booking.rescheduled") ||
                self::is_event_enabled("booking.paid");
            if (!$any_event) {
                update_option("wbk_zapier_event_created", "yes");
            }
        }

        $url = self::get_configured_webhook_url();
        if ($url === "") {
            return;
        }
        $valid = self::validate_webhook_url($url);
        if (is_wp_error($valid)) {
            update_option("wbk_zapier_webhook_url", "");
            update_option("wbk_zapier_enabled", "");
            update_option(
                "wbk_zapier_last_status",
                "error: " . $valid->get_error_message(),
            );
            update_option("wbk_zapier_last_status_at", gmdate("c"));
        }
    }

    /**
     * @param string $event_type
     * @param int $booking_id
     * @param array $extra
     * @return string|false event_id or false
     */
    /**
     * Whether the booking's service has Zapier enabled.
     *
     * @param int $booking_id
     */
    public static function is_service_zapier_enabled($booking_id): bool
    {
        $booking = new WBK_Booking((int) $booking_id);
        if (!$booking->is_loaded()) {
            return false;
        }
        $service_id = (int) $booking->get_service();
        if ($service_id < 1) {
            return false;
        }
        $service = new WBK_Service($service_id);
        if (!$service->is_loaded()) {
            return false;
        }
        return (string) $service->get("zapier") === "yes";
    }

    public static function enqueue_event($event_type, $booking_id, $extra = [])
    {
        if (!self::is_enabled()) {
            return false;
        }
        if (!self::is_event_enabled($event_type) && empty($extra["force"])) {
            return false;
        }
        if (
            empty($extra["skip_service_check"]) &&
            !self::is_service_zapier_enabled((int) $booking_id)
        ) {
            return false;
        }

        $url = self::get_configured_webhook_url();
        $valid = self::validate_webhook_url($url);
        if (is_wp_error($valid)) {
            return false;
        }

        // Ensure the deliveries table exists before inserting.
        if (!class_exists("WBK_Migration_Zapier_Deliveries")) {
            require_once WP_WEBBA_BOOKING__PLUGIN_DIR .
                "/includes/migrations/class-wbk-migration-zapier-deliveries.php";
        }
        WBK_Migration_Zapier_Deliveries::run();

        if (!empty($extra["payload"]) && is_array($extra["payload"])) {
            $payload = $extra["payload"];
        } else {
            $payload = self::build_payload(
                $event_type,
                (int) $booking_id,
                $extra,
            );
        }
        if ($payload === null) {
            return false;
        }

        $event_id = isset($payload["id"])
            ? (string) $payload["id"]
            : self::generate_event_id();

        global $wpdb;
        $table = self::table_name();
        $now = gmdate("Y-m-d H:i:s");

        $inserted = $wpdb->insert(
            $table,
            [
                "event_id" => $event_id,
                "event_type" => $event_type,
                "booking_id" => (int) $booking_id,
                "webhook_url_hash" => self::webhook_url_hash($url),
                "payload" => wp_json_encode($payload),
                "status" => "pending",
                "attempts" => 0,
                "max_attempts" => self::MAX_ATTEMPTS,
                "next_attempt_at" => $now,
                "created_at" => $now,
                "updated_at" => $now,
            ],
            ["%s", "%s", "%d", "%s", "%s", "%s", "%d", "%d", "%s", "%s", "%s"],
        );

        if (!$inserted) {
            return false;
        }

        self::schedule_queue_run(time());
        // Fire a separate non-blocking request so delivery does not wait on WP-Cron
        // and does not run inside the customer booking response.
        self::dispatch_queue_worker();
        return $event_id;
    }

    /**
     * Send a synthetic test event synchronously (admin only path).
     *
     * @return true|WP_Error
     */
    public static function send_test_event()
    {
        if (!self::is_available()) {
            return new WP_Error(
                "wbk_zapier_unavailable",
                __("Zapier integration requires a Pro plan.", "webba-booking-lite"),
            );
        }
        if (!self::is_enabled()) {
            return new WP_Error(
                "wbk_zapier_disabled",
                __("Enable the Zapier integration first.", "webba-booking-lite"),
            );
        }

        $url = self::get_configured_webhook_url();
        $valid = self::validate_webhook_url($url);
        if (is_wp_error($valid)) {
            return $valid;
        }

        $payload = self::build_test_payload();
        $result = self::deliver_payload($url, $payload);

        // Test results are shown only in the settings UI for this session.
        // Do not persist them as last-delivery status.
        if (is_wp_error($result)) {
            return $result;
        }

        return true;
    }

    public function cron_process_queue(): void
    {
        self::process_queue(10);
    }

    /**
     * Process pending deliveries.
     *
     * @param int $limit
     * @return int number processed
     */
    public static function process_queue($limit = 10)
    {
        if (!self::is_available()) {
            return 0;
        }

        global $wpdb;
        $table = self::table_name();
        $now = gmdate("Y-m-d H:i:s");
        $limit = max(1, (int) $limit);
        $processed = 0;

        $rows = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT id FROM {$table}
                WHERE status = 'pending'
                  AND next_attempt_at <= %s
                  AND (locked_until IS NULL OR locked_until < %s)
                ORDER BY next_attempt_at ASC
                LIMIT %d",
                $now,
                $now,
                $limit,
            ),
        );

        if (!is_array($rows) || empty($rows)) {
            return 0;
        }

        foreach ($rows as $row) {
            if (self::process_delivery((int) $row->id)) {
                $processed++;
            }
        }

        // Schedule another run if more pending work remains.
        $remaining = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM {$table}
                WHERE status = 'pending' AND next_attempt_at <= %s",
                gmdate("Y-m-d H:i:s"),
            ),
        );
        if ($remaining > 0) {
            self::schedule_queue_run(time() + 30);
        }

        return $processed;
    }

    /**
     * @param int $delivery_id
     * @return bool whether a claim/send was attempted
     */
    public static function process_delivery($delivery_id)
    {
        global $wpdb;
        $table = self::table_name();
        $now = gmdate("Y-m-d H:i:s");
        $lock_until = gmdate("Y-m-d H:i:s", time() + self::LOCK_SECONDS);

        // Claim row to prevent concurrent workers.
        $claimed = $wpdb->query(
            $wpdb->prepare(
                "UPDATE {$table}
                SET locked_until = %s, updated_at = %s
                WHERE id = %d
                  AND status = 'pending'
                  AND (locked_until IS NULL OR locked_until < %s)",
                $lock_until,
                $now,
                $delivery_id,
                $now,
            ),
        );

        if (!$claimed) {
            return false;
        }

        $delivery = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$table} WHERE id = %d", $delivery_id),
        );
        if (!$delivery) {
            return false;
        }

        if (!self::is_enabled()) {
            $wpdb->update(
                $table,
                [
                    "status" => "cancelled",
                    "last_error" => "integration_disabled",
                    "updated_at" => gmdate("Y-m-d H:i:s"),
                ],
                ["id" => $delivery_id],
                ["%s", "%s", "%s"],
                ["%d"],
            );
            self::clear_lock($delivery_id);
            return true;
        }

        $url = self::get_configured_webhook_url();
        $valid = self::validate_webhook_url($url);
        if (is_wp_error($valid)) {
            $wpdb->update(
                $table,
                [
                    "status" => "cancelled",
                    "last_error" => "invalid_webhook_url",
                    "updated_at" => gmdate("Y-m-d H:i:s"),
                ],
                ["id" => $delivery_id],
                ["%s", "%s", "%s"],
                ["%d"],
            );
            self::clear_lock($delivery_id);
            return true;
        }

        $current_hash = self::webhook_url_hash($url);
        if (!hash_equals((string) $delivery->webhook_url_hash, $current_hash)) {
            $wpdb->update(
                $table,
                [
                    "status" => "cancelled",
                    "last_error" => "webhook_url_changed",
                    "updated_at" => gmdate("Y-m-d H:i:s"),
                ],
                ["id" => $delivery_id],
                ["%s", "%s", "%s"],
                ["%d"],
            );
            self::clear_lock($delivery_id);
            return true;
        }

        $payload = json_decode((string) $delivery->payload, true);
        if (!is_array($payload)) {
            $wpdb->update(
                $table,
                [
                    "status" => "failed",
                    "last_error" => "invalid_payload",
                    "updated_at" => gmdate("Y-m-d H:i:s"),
                ],
                ["id" => $delivery_id],
                ["%s", "%s", "%s"],
                ["%d"],
            );
            self::clear_lock($delivery_id);
            return true;
        }

        $attempts = (int) $delivery->attempts + 1;
        $result = self::deliver_payload($url, $payload);

        if (!is_wp_error($result)) {
            $wpdb->update(
                $table,
                [
                    "status" => "delivered",
                    "attempts" => $attempts,
                    "last_http_code" => (int) $result,
                    "delivered_at" => gmdate("Y-m-d H:i:s"),
                    "updated_at" => gmdate("Y-m-d H:i:s"),
                    // Drop full customer payload after successful delivery.
                    "payload" => wp_json_encode([
                        "id" => $payload["id"] ?? $delivery->event_id,
                        "event" => $payload["event"] ?? $delivery->event_type,
                        "schema_version" =>
                            $payload["schema_version"] ?? self::SCHEMA_VERSION,
                        "redacted" => true,
                    ]),
                ],
                ["id" => $delivery_id],
                ["%s", "%d", "%d", "%s", "%s", "%s"],
                ["%d"],
            );
            self::clear_lock($delivery_id);
            $wpdb->query(
                $wpdb->prepare(
                    "UPDATE {$table} SET last_error = NULL WHERE id = %d",
                    $delivery_id,
                ),
            );
            self::update_last_status(
                "success",
                sprintf(
                    /* translators: %s: event type */
                    __("Delivered %s", "webba-booking-lite"),
                    (string) $delivery->event_type,
                ),
            );
            return true;
        }

        $http_code = (int) $result->get_error_data("http_code");
        $retryable = self::is_retryable_error($result);
        $max_attempts = (int) $delivery->max_attempts;
        $should_retry = $retryable && $attempts < $max_attempts;

        if ($should_retry) {
            $delay = self::backoff_seconds($attempts);
            $wpdb->update(
                $table,
                [
                    "status" => "pending",
                    "attempts" => $attempts,
                    "last_http_code" => $http_code > 0 ? $http_code : 0,
                    "last_error" => self::safe_error_message($result),
                    "next_attempt_at" => gmdate("Y-m-d H:i:s", time() + $delay),
                    "updated_at" => gmdate("Y-m-d H:i:s"),
                ],
                ["id" => $delivery_id],
                ["%s", "%d", "%d", "%s", "%s", "%s"],
                ["%d"],
            );
            self::clear_lock($delivery_id);
            self::schedule_queue_run(time() + $delay);
            self::update_last_status(
                "retrying",
                self::safe_error_message($result),
            );
        } else {
            $wpdb->update(
                $table,
                [
                    "status" => "failed",
                    "attempts" => $attempts,
                    "last_http_code" => $http_code > 0 ? $http_code : 0,
                    "last_error" => self::safe_error_message($result),
                    "updated_at" => gmdate("Y-m-d H:i:s"),
                    "payload" => wp_json_encode([
                        "id" => $payload["id"] ?? $delivery->event_id,
                        "event" => $payload["event"] ?? $delivery->event_type,
                        "schema_version" =>
                            $payload["schema_version"] ?? self::SCHEMA_VERSION,
                        "redacted" => true,
                    ]),
                ],
                ["id" => $delivery_id],
                ["%s", "%d", "%d", "%s", "%s", "%s"],
                ["%d"],
            );
            self::clear_lock($delivery_id);
            self::update_last_status("failed", self::safe_error_message($result));
        }

        return true;
    }

    public static function cleanup_old_deliveries(): void
    {
        global $wpdb;
        $table = self::table_name();
        $cutoff = gmdate(
            "Y-m-d H:i:s",
            time() - self::RETENTION_DAYS * DAY_IN_SECONDS,
        );
        $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM {$table}
                WHERE created_at < %s
                  AND status IN ('delivered', 'failed', 'cancelled')",
                $cutoff,
            ),
        );
    }

    /**
     * @param string $url
     * @param array $payload
     * @return int|WP_Error HTTP status on success
     */
    public static function deliver_payload($url, array $payload)
    {
        $valid = self::validate_webhook_url($url);
        if (is_wp_error($valid)) {
            return $valid;
        }

        $response = wp_remote_post($url, [
            "timeout" => self::REQUEST_TIMEOUT,
            "redirection" => 0,
            "headers" => [
                "Content-Type" => "application/json",
                "Accept" => "application/json",
            ],
            "body" => wp_json_encode($payload),
            "data_format" => "body",
        ]);

        if (is_wp_error($response)) {
            $error = new WP_Error(
                "wbk_zapier_http_error",
                __("Network error while delivering webhook.", "webba-booking-lite"),
            );
            $error->add_data(true, "retryable");
            return $error;
        }

        $code = (int) wp_remote_retrieve_response_code($response);
        if ($code >= 200 && $code < 300) {
            return $code;
        }

        $retryable = $code === 429 || ($code >= 500 && $code <= 599);
        $error = new WP_Error(
            "wbk_zapier_http_status",
            sprintf(
                /* translators: %d: HTTP status code */
                __("Webhook delivery failed with HTTP %d.", "webba-booking-lite"),
                $code,
            ),
        );
        $error->add_data($code, "http_code");
        $error->add_data($retryable, "retryable");
        return $error;
    }

    /**
     * @param string $event_type
     * @param int $booking_id
     * @param array $extra
     * @return array|null
     */
    public static function build_payload($event_type, $booking_id, $extra = [])
    {
        $booking = new WBK_Booking($booking_id);
        if (!$booking->is_loaded()) {
            return null;
        }

        $service_id = (int) $booking->get_service();
        $service_name = "";
        if ($service_id > 0) {
            $service = new WBK_Service($service_id);
            if ($service->is_loaded()) {
                $service_name = (string) $service->get_name();
            }
        }

        $timezone = get_option("wbk_timezone", "UTC");
        $start = (int) $booking->get_start();
        $end = (int) $booking->get_end();

        $payload = [
            "id" => self::generate_event_id(),
            "event" => $event_type,
            "schema_version" => self::SCHEMA_VERSION,
            "occurred_at" => gmdate("c"),
            "booking_id" => (int) $booking_id,
            "status" => (string) $booking->get("status"),
            "service" => [
                "id" => $service_id,
                "name" => $service_name,
            ],
            "start" => self::format_timestamp($start, $timezone),
            "end" => self::format_timestamp($end, $timezone),
            "timezone" => $timezone,
            "customer" => [
                "name" => (string) $booking->get_name(),
                "email" => (string) $booking->get("email"),
                "phone" => (string) $booking->get_phone(),
            ],
            "price" => [
                "amount" => (float) $booking->get_price(),
                "currency" => self::get_currency_code(),
                "payment_status" =>
                    $event_type === "booking.paid"
                        ? "paid"
                        : self::infer_payment_status($booking),
                "payment_method" => !empty($extra["payment_method"])
                    ? (string) $extra["payment_method"]
                    : (string) $booking->get("payment_method"),
                "amount_paid" => (string) $booking->get("amount_paid"),
            ],
            "custom_fields" => self::extract_custom_fields($booking),
            "quantity" => (int) $booking->get("quantity"),
        ];

        $staff_member_id = (int) $booking->get_staff_member();

        if (!is_null($staff_member_id) && $staff_member_id > 0) {
            $staff_member = new WBK_Staff_Member($staff_member_id);
            
            if ($staff_member->is_loaded()) {
                $payload["staff_member"] = [
                    "id" => $staff_member_id,
                    "name" => $staff_member->get_name(),
                    "email" => $staff_member->get("email"),
                ];
            }
        }

        $location_id = (int) $booking->get('location_id');
        if (!is_null($location_id) && $location_id > 0) {
            $location = new WBK_Location($location_id);
            if ($location->is_loaded()) {
                $payload["location"] = [
                    "id" => $location_id,
                    "name" => $location->get_name(),
                    "address" => $location->get("address"),
                ];
            }
        }


        if ($event_type === "booking.rescheduled" && !empty($extra["previous"])) {
            $payload["previous"] = [
                "start" => self::format_timestamp(
                    (int) ($extra["previous"]["start"] ?? 0),
                    $timezone,
                ),
                "end" => self::format_timestamp(
                    (int) ($extra["previous"]["end"] ?? 0),
                    $timezone,
                ),
            ];
        }

        return $payload;
    }

    public static function build_test_payload(): array
    {
        $timezone = get_option("wbk_timezone", "UTC");
        $start = time() + HOUR_IN_SECONDS;
        $end = $start + HOUR_IN_SECONDS;

        return [
            "id" => self::generate_event_id(),
            "event" => "booking.created",
            "schema_version" => self::SCHEMA_VERSION,
            "occurred_at" => gmdate("c"),
            "is_test" => true,
            "booking_id" => 0,
            "status" => "approved",
            "service" => [
                "id" => 0,
                "name" => "Zapier Test Service",
            ],
            "start" => self::format_timestamp($start, $timezone),
            "end" => self::format_timestamp($end, $timezone),
            "timezone" => $timezone,
            "customer" => [
                "name" => "Zapier Test Customer",
                "email" => "zapier-test@example.com",
                "phone" => "+10000000000",
            ],
            "price" => [
                "amount" => 0,
                "currency" => self::get_currency_code(),
                "payment_status" => "unpaid",
                "payment_method" => "",
                "amount_paid" => "",
            ],
            "custom_fields" => [],
            "quantity" => 1,
            "staff_member" => [
                "id" => 0,
                "name" => "Zapier Test Staff Member",
                "email" => "zapier-test@example.com",
            ],
            "location" => [
                "id" => 0,
                "name" => "Zapier Test Location",
            ],
        ];
    }

    /**
     * @param WBK_Booking $booking
     * @return array<int, array{id:string,label:string,value:string}>
     */
    private static function extract_custom_fields($booking): array
    {
        $extra = $booking->get("extra");
        if ($extra === "" || $extra === "[]" || $extra === null) {
            return [];
        }
        $decoded = json_decode((string) $extra, true);
        if (!is_array($decoded)) {
            return [];
        }
        $fields = [];
        foreach ($decoded as $item) {
            if (!is_array($item) || count($item) < 3) {
                continue;
            }
            $fields[] = [
                "id" => (string) $item[0],
                "label" => (string) $item[1],
                "value" => is_array($item[2])
                    ? implode(", ", array_map("strval", $item[2]))
                    : (string) $item[2],
            ];
        }
        return $fields;
    }

    /**
     * @param WBK_Booking $booking
     */
    private static function infer_payment_status($booking): string
    {
        $amount_paid = $booking->get("amount_paid");
        $method = (string) $booking->get("payment_method");
        if ($method !== "" || ($amount_paid !== "" && $amount_paid !== null && (float) $amount_paid > 0)) {
            return "paid";
        }
        if ($booking->get("paid_with_coupon") === "yes") {
            return "paid";
        }
        return "unpaid";
    }

    private static function get_currency_code(): string
    {
        $candidates = [
            get_option("wbk_stripe_currency", ""),
            get_option("wbk_paypal_currency", ""),
            get_option("wbk_mollie_currency", ""),
            get_option("wbk_square_currency", ""),
        ];
        foreach ($candidates as $code) {
            $code = strtoupper(trim((string) $code));
            if ($code !== "" && preg_match("/^[A-Z]{3}$/", $code)) {
                return $code;
            }
        }
        $symbol = trim((string) get_option("wbk_payment_price_format_new", "$"));
        return $symbol !== "" ? $symbol : "USD";
    }

    private static function format_timestamp($timestamp, $timezone): string
    {
        $timestamp = (int) $timestamp;
        if ($timestamp < 1) {
            return "";
        }
        try {
            $tz = new DateTimeZone($timezone ?: "UTC");
        } catch (Exception $e) {
            $tz = new DateTimeZone("UTC");
        }
        $dt = new DateTime("@{$timestamp}");
        $dt->setTimezone($tz);
        return $dt->format("c");
    }

    private static function generate_event_id(): string
    {
        try {
            return "wbk_" . bin2hex(random_bytes(16));
        } catch (Exception $e) {
            return "wbk_" . wp_generate_uuid4();
        }
    }

    private static function table_name(): string
    {
        global $wpdb;
        return get_option("wbk_db_prefix", $wpdb->prefix) . "wbk_zapier_deliveries";
    }

    private static function schedule_queue_run($timestamp): void
    {
        $timestamp = max(time(), (int) $timestamp);
        $next = wp_next_scheduled(self::CRON_HOOK);
        if ($next && (int) $next > $timestamp) {
            wp_unschedule_event($next, self::CRON_HOOK);
            $next = false;
        }
        if (!$next) {
            wp_schedule_single_event($timestamp, self::CRON_HOOK);
        }
        // Nudge cron when possible without blocking the customer request.
        if (function_exists("spawn_cron")) {
            spawn_cron();
        }
    }

    /**
     * Trigger queue processing in a separate HTTP request (non-blocking).
     */
    private static function dispatch_queue_worker(): void
    {
        $url = add_query_arg(
            [
                "action" => "wbk_zapier_process_queue",
                "token" => self::queue_worker_token(),
            ],
            admin_url("admin-ajax.php"),
        );

        wp_remote_post($url, [
            "timeout" => 0.01,
            "blocking" => false,
            "sslverify" => apply_filters("https_local_ssl_verify", false),
            "headers" => [
                "Connection" => "Close",
            ],
        ]);
    }

    /**
     * Clear worker lock without writing empty-string datetimes.
     *
     * @param int $delivery_id
     */
    private static function clear_lock($delivery_id): void
    {
        global $wpdb;
        $table = self::table_name();
        $wpdb->query(
            $wpdb->prepare(
                "UPDATE {$table} SET locked_until = NULL WHERE id = %d",
                (int) $delivery_id,
            ),
        );
    }

    /**
     * @param WP_Error $error
     */
    private static function is_retryable_error($error): bool
    {
        $data = $error->get_error_data("retryable");
        if ($data !== null) {
            return (bool) $data;
        }
        return $error->get_error_code() === "wbk_zapier_http_error";
    }

    private static function backoff_seconds($attempt): int
    {
        // Bounded exponential backoff: 60, 300, 1500, 3600, 3600 ...
        $base = 60 * (int) pow(5, max(0, (int) $attempt - 1));
        return min(3600, max(60, $base));
    }

    /**
     * @param WP_Error $error
     */
    private static function safe_error_message($error): string
    {
        $message = $error->get_error_message();
        // Never include webhook URL material in stored messages.
        $url = self::get_configured_webhook_url();
        if ($url !== "") {
            $message = str_replace($url, "[webhook]", $message);
        }
        return substr(sanitize_text_field($message), 0, 255);
    }

    private static function update_last_status($status, $message = ""): void
    {
        update_option("wbk_zapier_last_status", sanitize_text_field((string) $status));
        update_option("wbk_zapier_last_status_at", gmdate("c"));
        update_option(
            "wbk_zapier_last_status_message",
            sanitize_text_field((string) $message),
        );
    }

    public static function get_last_delivery_summary(): string
    {
        $status = (string) get_option("wbk_zapier_last_status", "");
        $at = (string) get_option("wbk_zapier_last_status_at", "");
        $message = (string) get_option("wbk_zapier_last_status_message", "");

        // Ignore legacy test-event status that was previously persisted.
        if (
            $message !== "" &&
            stripos($message, "Test event") !== false
        ) {
            delete_option("wbk_zapier_last_status");
            delete_option("wbk_zapier_last_status_at");
            delete_option("wbk_zapier_last_status_message");
            return __("No deliveries yet.", "webba-booking-lite");
        }

        if ($status === "") {
            return __("No deliveries yet.", "webba-booking-lite");
        }
        $parts = [ucfirst($status)];
        if ($at !== "") {
            $parts[] = $at;
        }
        if ($message !== "") {
            $parts[] = $message;
        }
        return implode(" — ", $parts);
    }
}
