<?php
if (!defined("ABSPATH")) {
    exit();
}

/**
 * Proxies Assistance chat requests to the Webba Connect AI service.
 */
class WBK_Assistance_Connect
{
    /**
     * @var array<string, string[]>
     */
    private static $entity_summary_fields = [
        "wbk_services" => [
            "name",
            "description",
            "duration",
            "quantity",
            "price",
            "business_hours",
            "form_builder",
        ],
        "wbk_service_categories" => ["name", "list"],
        "wbk_email_templates" => ["name", "type", "enabled"],
        "wbk_extras" => ["name", "price", "duration"],
        "wbk_forms" => ["name"],
        "wbk_locations" => ["name", "address", "description"],
        "wbk_pricing_rules" => ["name", "type", "priority"],
        "wbk_coupons" => ["name", "amount_fixed", "amount_percentage"],
        "wbk_connected_calendars" => ["name", "provider"],
        "wbk_staff_members" => ["name", "email"],
        "wbk_units" => ["name", "service_id"],
    ];

    public static function get_entity_tables(): array
    {
        return apply_filters(
            "wbk_assistance_entity_tables",
            WBK_Assistance::get_entity_tables()
        );
    }

    /**
     * @return string[]
     */
    public static function get_data_paths(): array
    {
        $paths = [WP_WEBBA_BOOKING__PLUGIN_DIR . "/data/assistance"];

        if (wbk_is_assistance_lab_available()) {
            array_unshift(
                $paths,
                WP_WEBBA_BOOKING__PLUGIN_DIR . "/assistantlab/data"
            );
        }

        return apply_filters("wbk_assistance_data_paths", $paths);
    }

    public static function is_running_in_container(): bool
    {
        return file_exists("/.dockerenv");
    }

    public static function get_service_url(): string
    {
        if (class_exists("WBK_Webba_Connect")) {
            return WBK_Webba_Connect::get_connect_api_url();
        }

        if (defined("WBK_CONNECT_API_URL") && is_string(WBK_CONNECT_API_URL)) {
            return rtrim(WBK_CONNECT_API_URL, "/");
        }

        return "https://connect.webba-booking.com";
    }

    public static function collect_current_entities(): array
    {
        if (!function_exists("WbkData")) {
            return [];
        }

        global $wpdb;
        $db_prefix = get_option("wbk_db_prefix", $wpdb->prefix);
        $max_per_table = (int) apply_filters("wbk_assistance_entities_per_table", 50);
        $snapshot = [];

        foreach (self::get_entity_tables() as $table) {
            $model_key = $db_prefix . $table;
            $model = WbkData()->models->get_element_at($model_key);

            if (false === $model) {
                continue;
            }

            $rows = $model->get_items([]);
            if (!is_array($rows)) {
                $rows = [];
            }

            $summary_fields = self::$entity_summary_fields[$table] ?? ["name", "title"];
            $items = [];

            foreach (array_slice($rows, 0, max(1, $max_per_table)) as $row) {
                $item = ["id" => isset($row->id) ? (int) $row->id : 0];
                if ($item["id"] <= 0) {
                    continue;
                }

                foreach ($summary_fields as $field_name) {
                    if (!isset($row->$field_name)) {
                        continue;
                    }

                    $value = $row->$field_name;
                    if (is_string($value) && strlen($value) > 300) {
                        $value = substr($value, 0, 300) . "…";
                    }
                    $item[$field_name] = $value;
                }

                $items[] = $item;
            }

            $snapshot[] = [
                "table" => $table,
                "count" => count($rows),
                "items" => $items,
            ];
        }

        return apply_filters("wbk_assistance_entities_snapshot", $snapshot);
    }

    public static function request_assistance(
        string $prompt,
        array $entities = [],
        array $messages = [],
        ?array $config_information = null,
        bool $collect_entities_when_empty = true,
        bool $require_reference_data = false,
        string $session_id = ""
    ) {
        $submit = self::submit_assistance_task(
            $prompt,
            $entities,
            $messages,
            $config_information,
            $collect_entities_when_empty,
            $require_reference_data,
            $session_id,
        );

        if (is_wp_error($submit)) {
            return $submit;
        }

        return self::wait_for_assistance_task((int) $submit["task_id"]);
    }

    /**
     * Create a local and remote assistance task without waiting for completion.
     *
     * @return array<string, mixed>|\WP_Error
     */
    public static function submit_assistance_task(
        string $prompt,
        array $entities = [],
        array $messages = [],
        ?array $config_information = null,
        bool $collect_entities_when_empty = true,
        bool $require_reference_data = false,
        string $session_id = ""
    ) {
        if ($entities === [] && $collect_entities_when_empty) {
            $entities = self::collect_current_entities();
        }

        $payload = self::build_assistance_payload(
            $prompt,
            $entities,
            $messages,
            $config_information,
            $require_reference_data,
            $session_id,
        );

        if (is_wp_error($payload)) {
            return $payload;
        }

        $session_id = self::normalize_session_id($session_id);
        $local_task = WBK_Ai_Tasks::create($prompt, $session_id);

        if (!is_array($local_task) || empty($local_task["id"])) {
            return new \WP_Error(
                "wbk_assistance_task_create_failed",
                __("Could not create assistance task.", "webba-booking-lite"),
                ["status" => 500],
            );
        }

        $local_task_id = (int) $local_task["id"];
        $webba_connect = new WBK_Webba_Connect();
        $create_response = $webba_connect->create_assistance_task($payload);

        if (
            !is_array($create_response) ||
            empty($create_response["success"]) ||
            empty($create_response["task_id"])
        ) {
            $message = is_array($create_response) && !empty($create_response["message"])
                ? (string) $create_response["message"]
                : __("Failed to submit assistance request to Webba Connect.", "webba-booking-lite");
            $moderation = is_array($create_response["moderation"] ?? null)
                ? $create_response["moderation"]
                : null;
            $message = self::resolve_assistance_failure_message($message, $moderation);
            $http_status = is_array($create_response) && !empty($create_response["http_status"])
                ? (int) $create_response["http_status"]
                : 502;

            WBK_Ai_Tasks::mark_failed($local_task_id, $message);

            return new \WP_Error("wbk_assistance_task_submit_failed", $message, [
                "status" => $http_status >= 400 ? $http_status : 502,
                "moderation" => $moderation,
            ]);
        }

        $remote_task_id = (string) $create_response["task_id"];
        WBK_Ai_Tasks::mark_processing($local_task_id, $remote_task_id);

        return [
            "success" => true,
            "task_id" => $local_task_id,
            "status" => "processing",
        ];
    }

    /**
     * Refresh task status from Webba Connect (single poll).
     *
     * @return array<string, mixed>|\WP_Error
     */
    public static function get_assistance_task_status(int $local_task_id)
    {
        $local_task = WBK_Ai_Tasks::get_by_id($local_task_id);

        if (!is_array($local_task)) {
            return new \WP_Error(
                "wbk_assistance_task_not_found",
                __("Assistance task not found.", "webba-booking-lite"),
                ["status" => 404],
            );
        }

        $status = isset($local_task["status"])
            ? (string) $local_task["status"]
            : "pending";

        if ($status === "completed") {
            return self::format_assistance_task_response(
                $local_task_id,
                "completed",
                self::decode_assistance_task_result($local_task["result"] ?? null),
            );
        }

        if ($status === "failed") {
            $result = self::decode_assistance_task_result($local_task["result"] ?? null);
            $moderation = is_array($result["moderation"] ?? null)
                ? $result["moderation"]
                : null;
            $message = !empty($local_task["error_message"])
                ? (string) $local_task["error_message"]
                : __("Webba AI request failed.", "webba-booking-lite");

            return self::format_assistance_task_failure(
                $local_task_id,
                $message,
                $moderation,
            );
        }

        $remote_task_id = trim((string) ($local_task["remote_task_id"] ?? ""));
        if ($remote_task_id === "") {
            return [
                "success" => true,
                "task_id" => $local_task_id,
                "status" => $status,
                "phase" => null,
            ];
        }

        $webba_connect = new WBK_Webba_Connect();
        $task_response = $webba_connect->get_assistance_task($remote_task_id);

        if (!is_array($task_response)) {
            return new \WP_Error(
                "wbk_assistance_task_poll_failed",
                __("Failed to fetch assistance task status.", "webba-booking-lite"),
                ["status" => 502],
            );
        }

        if (empty($task_response["success"])) {
            $message = !empty($task_response["message"])
                ? (string) $task_response["message"]
                : __("Failed to fetch assistance task status.", "webba-booking-lite");
            $moderation = is_array($task_response["moderation"] ?? null)
                ? $task_response["moderation"]
                : null;
            $http_status = !empty($task_response["http_status"])
                ? (int) $task_response["http_status"]
                : 502;
            $message = self::resolve_assistance_failure_message($message, $moderation);

            return new \WP_Error("wbk_assistance_task_poll_failed", $message, [
                "status" => $http_status >= 400 ? $http_status : 502,
                "moderation" => $moderation,
            ]);
        }

        $remote_status = isset($task_response["status"])
            ? (string) $task_response["status"]
            : "pending";

        if ($remote_status === "completed") {
            $result = is_array($task_response["result"] ?? null)
                ? $task_response["result"]
                : [];

            WBK_Ai_Tasks::mark_completed($local_task_id, $result);

            return self::format_assistance_task_response(
                $local_task_id,
                "completed",
                $result,
            );
        }

        if ($remote_status === "failed") {
            $result = is_array($task_response["result"] ?? null)
                ? $task_response["result"]
                : [];
            $moderation = is_array($result["moderation"] ?? null)
                ? $result["moderation"]
                : null;
            $message = !empty($task_response["error_message"])
                ? (string) $task_response["error_message"]
                : __("Webba AI request failed.", "webba-booking-lite");

            WBK_Ai_Tasks::mark_failed($local_task_id, $message);

            return self::format_assistance_task_failure(
                $local_task_id,
                $message,
                $moderation,
            );
        }

        return [
            "success" => true,
            "task_id" => $local_task_id,
            "status" => $remote_status,
            "phase" => isset($task_response["phase"])
                ? (string) $task_response["phase"]
                : null,
        ];
    }

    /**
     * Block until an assistance task completes or times out (server-side polling).
     *
     * @return array<string, mixed>|\WP_Error
     */
    public static function wait_for_assistance_task(
        int $local_task_id,
        int $timeout_seconds = 120,
        int $poll_interval_ms = 1000
    ) {
        $started_at = microtime(true);

        while (true) {
            $elapsed = microtime(true) - $started_at;
            if ($elapsed >= $timeout_seconds) {
                $message = __("Assistance request timed out.", "webba-booking-lite");
                WBK_Ai_Tasks::mark_failed($local_task_id, $message);

                return new \WP_Error("wbk_assistance_task_timeout", $message, [
                    "status" => 504,
                ]);
            }

            $status_response = self::get_assistance_task_status($local_task_id);

            if (is_wp_error($status_response)) {
                WBK_Ai_Tasks::mark_failed(
                    $local_task_id,
                    $status_response->get_error_message(),
                );
                return $status_response;
            }

            $status = isset($status_response["status"])
                ? (string) $status_response["status"]
                : "pending";

            if ($status === "completed") {
                return $status_response;
            }

            if ($status === "failed") {
                $message = !empty($status_response["message"])
                    ? (string) $status_response["message"]
                    : __("Webba AI request failed.", "webba-booking-lite");

                return new \WP_Error("wbk_assistance_task_failed", $message, [
                    "status" => 502,
                ]);
            }

            usleep(max(100, $poll_interval_ms) * 1000);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private static function format_assistance_task_failure(
        int $local_task_id,
        string $message,
        ?array $moderation = null
    ): array {
        return [
            "success" => false,
            "task_id" => $local_task_id,
            "status" => "failed",
            "message" => self::resolve_assistance_failure_message($message, $moderation),
            "moderation" => $moderation,
        ];
    }

    private static function resolve_assistance_failure_message(
        string $message,
        ?array $moderation = null
    ): string {
        $blocked = is_array($moderation) && !empty($moderation["blocked"]);
        $moderation_failed = is_array($moderation) && !empty($moderation["failed"]);

        if (
            $blocked ||
            $moderation_failed ||
            $message === "Your account has been blocked" ||
            $message === "Content failed moderation check"
        ) {
            return __(
                "Your account has been blocked and can no longer use the assistance feature.",
                "webba-booking-lite",
            );
        }

        return $message;
    }

    /**
     * @return array<string, mixed>
     */
    private static function format_assistance_task_response(
        int $local_task_id,
        string $status,
        array $result
    ): array {
        if (
            isset($result["collected_summary"]) &&
            is_array($result["collected_summary"])
        ) {
            $result["collected_summary"] = self::normalize_assistance_summary_lines(
                $result["collected_summary"]
            );
        }

        if (isset($result["question"]) && is_string($result["question"])) {
            $result["question"] = self::normalize_assistance_summary_text(
                $result["question"]
            );
        }

        return array_merge(
            [
                "success" => !empty($result["success"]),
                "task_id" => $local_task_id,
                "status" => $status,
            ],
            $result,
        );
    }

    /**
     * @param string[] $lines
     * @return string[]
     */
    private static function normalize_assistance_summary_lines(array $lines): array
    {
        return array_map(
            [self::class, "normalize_assistance_summary_text"],
            $lines
        );
    }

    private static function normalize_assistance_summary_text(string $text): string
    {
        return str_replace(["\u{2014}", "\u{2013}"], "-", $text);
    }

    /**
     * @return array<string, mixed>
     */
    private static function decode_assistance_task_result($raw): array
    {
        if (is_array($raw)) {
            return $raw;
        }

        if (!is_string($raw) || trim($raw) === "") {
            return [];
        }

        $decoded = json_decode($raw, true);

        return is_array($decoded) ? $decoded : [];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public static function parse_assistance_messages($raw): array
    {
        if (!is_array($raw)) {
            return [];
        }

        $allowed_missing = [
            "service_description",
            "service_duration",
            "service_attendees",
            "business_days",
            "business_hours_times",
            "business_hours",
            "service_price",
            "currency",
            "unit_description",
            "min_booking_days",
            "unit_quantity",
            "unit_price",
            "config_mode",
        ];
        $messages = [];

        foreach ($raw as $turn) {
            if (!is_array($turn)) {
                continue;
            }

            $role = isset($turn["role"]) ? (string) $turn["role"] : "";
            $content = isset($turn["content"]) ? trim((string) $turn["content"]) : "";

            if (
                ($role !== "user" && $role !== "assistant") ||
                $content === ""
            ) {
                continue;
            }

            $parsed_turn = [
                "role" => $role,
                "content" => $content,
            ];

            $missing = isset($turn["missing"]) ? (string) $turn["missing"] : "";
            if (in_array($missing, $allowed_missing, true)) {
                $parsed_turn["missing"] = $missing;
            }

            if (
                isset($turn["config_information"]) &&
                is_array($turn["config_information"])
            ) {
                $parsed_turn["config_information"] = $turn["config_information"];
            }

            $config_mode = isset($turn["config_mode"])
                ? (string) $turn["config_mode"]
                : "";
            if (in_array($config_mode, ["hourly", "daily"], true)) {
                $parsed_turn["config_mode"] = $config_mode;
            }

            $messages[] = $parsed_turn;
        }

        return $messages;
    }

    /**
     * @return array<string, mixed>|\WP_Error
     */
    public static function build_assistance_payload(
        string $prompt,
        array $entities,
        array $messages,
        ?array $config_information,
        bool $require_reference_data = false,
        string $session_id = ""
    ) {
        $prompt = trim($prompt);

        if ($prompt === "") {
            return new \WP_Error(
                "wbk_assistance_invalid_request",
                __("Request text is required.", "webba-booking-lite"),
            );
        }

        $model = self::load_assistance_model_payload();
        $settings = self::load_assistance_settings_payload();

        if ($require_reference_data && (!is_array($model) || !is_array($settings))) {
            return new \WP_Error(
                "wbk_assistance_reference_data_missing",
                __(
                    "Assistance configuration data is missing. Please reinstall or update the plugin.",
                    "webba-booking-lite",
                ),
                ["status" => 503],
            );
        }

        $payload = [
            "request" => $prompt,
            "entities" => $entities,
        ];

        if ($messages !== []) {
            $payload["messages"] = $messages;
        }

        if (is_array($config_information)) {
            $payload["config_information"] = $config_information;
        }

        if (is_array($model)) {
            $payload["model"] = $model;
        }

        if (is_array($settings)) {
            $payload["settings"] = $settings;
        }

        $website_id = self::get_connect_install_id();
        if ($website_id !== "") {
            $payload["website_id"] = $website_id;
        }

        $session_id = self::normalize_session_id($session_id);
        if ($session_id !== "") {
            $payload["session_id"] = $session_id;
        }

        return $payload;
    }

    public static function normalize_session_id(string $session_id): string
    {
        $session_id = trim($session_id);

        if ($session_id === "") {
            return "";
        }

        if (!preg_match('/^[A-Za-z0-9._-]{8,128}$/', $session_id)) {
            return "";
        }

        return $session_id;
    }

    /**
     * Stable per-site install id for Assistance (stored in wbk_connect_install_id).
     */
    public static function get_connect_install_id(): string
    {
        if (!class_exists("WBK_Webba_Connect")) {
            return "";
        }

        return WBK_Webba_Connect::get_connect_install_id();
    }

    /**
     * @deprecated Use get_connect_install_id().
     */
    public static function get_freemius_website_id(): string
    {
        return self::get_connect_install_id();
    }

    /**
     * @return array<string, mixed>|null
     */
    public static function load_assistance_model_payload(): ?array
    {
        return self::load_assistance_json_file("model.json");
    }

    /**
     * @return array<string, mixed>|null
     */
    public static function load_assistance_settings_payload(): ?array
    {
        return self::load_assistance_json_file("settings.json");
    }

    /**
     * @return array<string, mixed>|null
     */
    private static function load_assistance_json_file(string $filename): ?array
    {
        foreach (self::get_data_paths() as $dir) {
            $file_path = rtrim($dir, "/") . "/" . $filename;

            if (!is_readable($file_path)) {
                continue;
            }

            $raw = file_get_contents($file_path);

            if (!is_string($raw) || trim($raw) === "") {
                continue;
            }

            $decoded = json_decode($raw, true);

            if (is_array($decoded)) {
                return $decoded;
            }
        }

        return null;
    }

    public static function get_connection_hint(): string
    {
        $url = self::get_service_url();

        if (self::is_running_in_container()) {
            return sprintf(
                /* translators: %s: Webba Connect service URL */
                __(
                    'Could not reach Webba Connect at %s. If running locally, override with define("WBK_CONNECT_API_URL", "http://host.docker.internal:3000") in wp-config.php.',
                    "webba-booking-lite",
                ),
                $url,
            );
        }

        return sprintf(
            /* translators: %s: Webba Connect service URL */
            __(
                'Could not reach Webba Connect at %s. Override with define("WBK_CONNECT_API_URL", "...") in wp-config.php if needed.',
                "webba-booking-lite",
            ),
            $url,
        );
    }

    /**
     * @param array<int, array<string, mixed>> $actions
     * @param array<string, mixed> $apply_result
     */
    public static function report_assistance_chat_completion(
        string $session_id,
        array $actions,
        array $apply_result
    ): void {
        $session_id = self::normalize_session_id($session_id);
        if ($session_id === "") {
            return;
        }

        $website_id = self::get_freemius_website_id();
        if ($website_id === "") {
            return;
        }

        $booking_page = is_array($apply_result["booking_page"] ?? null)
            ? $apply_result["booking_page"]
            : null;
        $summary = is_array($apply_result["summary"] ?? null)
            ? $apply_result["summary"]
            : [];

        $payload = [
            "website_id" => $website_id,
            "session_id" => $session_id,
            "actions" => $actions,
            "summary" => $summary,
            "content" => __(
                "Your booking setup is ready.",
                "webba-booking-lite",
            ),
        ];

        if (is_array($booking_page)) {
            $payload["booking_page"] = $booking_page;
        }

        $webba_connect = new WBK_Webba_Connect();
        $webba_connect->complete_assistance_chat_history($payload);
    }
}
