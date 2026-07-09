<?php
if (!defined("ABSPATH")) {
    exit();
}

/**
 * Clears all WbkData entities and restores plugin options to defaults.
 * Enabled only when WBK_RESET_ALL_DATA_ENABLED is defined as true in wp-config.php.
 */
class WBK_Reset_All_Data
{
    /**
     * @var array<string, int>
     */
    private static $table_delete_priorities = [
        "wbk_appointments" => 10,
        "wbk_cancelled_appointments" => 10,
        "wbk_extras" => 20,
        "wbk_units" => 20,
        "wbk_pricing_rules" => 30,
        "wbk_coupons" => 30,
        "wbk_email_templates" => 40,
        "wbk_connected_calendars" => 40,
        "wbk_staff_members" => 40,
        "wbk_locations" => 40,
        "wbk_forms" => 50,
        "wbk_service_categories" => 80,
        "wbk_services" => 90,
    ];

    public static function is_config_enabled(): bool
    {
        return defined("WBK_RESET_ALL_DATA_ENABLED") && WBK_RESET_ALL_DATA_ENABLED;
    }

    public static function current_user_can_reset(): bool
    {
        if (!self::is_config_enabled()) {
            return false;
        }

        if (!current_user_can("manage_options")) {
            return false;
        }

        return (bool) apply_filters(
            "wbk_reset_all_data_allowed",
            true,
            get_current_user_id()
        );
    }

    public static function rest_permission($request): bool
    {
        return self::current_user_can_reset();
    }

    public static function handle_rest_reset($request): \WP_REST_Response
    {
        $params = $request->get_json_params();
        $confirm = "";

        if (is_array($params) && isset($params["confirm"])) {
            $confirm = trim((string) $params["confirm"]);
        }

        if ($confirm !== "RESET") {
            return new \WP_REST_Response(
                [
                    "success" => false,
                    "message" => __(
                        'Confirmation required. Send { "confirm": "RESET" }.',
                        "webba-booking-lite"
                    ),
                    "entities" => [],
                    "options_reset" => 0,
                    "errors" => [
                        __(
                            "Missing or invalid confirmation token.",
                            "webba-booking-lite"
                        ),
                    ],
                ],
                400,
            );
        }

        $result = self::reset_all();

        return new \WP_REST_Response(
            $result,
            !empty($result["success"]) ? 200 : 500,
        );
    }

    /**
     * @return array{
     *     success: bool,
     *     message: string,
     *     entities: array<int, array{table: string, deleted: int, error: string|null}>,
     *     options_reset: int,
     *     errors: string[]
     * }
     */
    public static function reset_all(): array
    {
        if (!self::current_user_can_reset()) {
            return [
                "success" => false,
                "message" => __(
                    "Reset all data is not enabled for this site.",
                    "webba-booking-lite"
                ),
                "entities" => [],
                "options_reset" => 0,
                "errors" => [
                    __(
                        'Add define( \'WBK_RESET_ALL_DATA_ENABLED\', true ); to wp-config.php.',
                        "webba-booking-lite"
                    ),
                ],
            ];
        }

        if (!function_exists("WbkData")) {
            return [
                "success" => false,
                "message" => __("WbkData is not available.", "webba-booking-lite"),
                "entities" => [],
                "options_reset" => 0,
                "errors" => [__("WbkData is not available.", "webba-booking-lite")],
            ];
        }

        $entity_results = self::delete_all_entities();
        $option_results = self::reset_options_to_defaults();
        $errors = [];

        foreach ($entity_results as $entry) {
            if (!empty($entry["error"])) {
                $errors[] = sprintf(
                    /* translators: 1: table name, 2: error message */
                    __('Failed to clear %1$s: %2$s', 'webba-booking-lite'),
                    $entry["table"],
                    $entry["error"]
                );
            }
        }

        $errors = array_merge($errors, $option_results["errors"]);

        $deleted_total = array_sum(array_column($entity_results, "deleted"));

        return [
            "success" => $errors === [],
            "message" => $errors === []
                ? sprintf(
                    /* translators: 1: deleted entity count, 2: reset option count */
                    __(
                        'Reset complete. Removed %1$d entities and restored %2$d options.',
                        'webba-booking-lite'
                    ),
                    $deleted_total,
                    $option_results["count"]
                )
                : __("Reset completed with errors.", "webba-booking-lite"),
            "entities" => $entity_results,
            "options_reset" => $option_results["count"],
            "errors" => $errors,
        ];
    }

    /**
     * @return array<int, array{table: string, deleted: int, error: string|null}>
     */
    private static function delete_all_entities(): array
    {
        $models = WbkData()->models->get_elements();
        if (!is_array($models) || $models === []) {
            return [];
        }

        uasort(
            $models,
            static function ($left, $right) {
                $left_key = is_object($left) && method_exists($left, "get_model_name")
                    ? (string) $left->get_model_name()
                    : "";
                $right_key = is_object($right) && method_exists($right, "get_model_name")
                    ? (string) $right->get_model_name()
                    : "";

                return self::get_table_delete_priority($left_key)
                    <=> self::get_table_delete_priority($right_key);
            }
        );

        $results = [];

        foreach ($models as $model) {
            if (!is_object($model) || !method_exists($model, "get_model_name")) {
                continue;
            }

            $results[] = self::delete_all_rows_for_model($model);
        }

        return $results;
    }

    /**
     * @return array{table: string, deleted: int, error: string|null}
     */
    private static function delete_all_rows_for_model($model): array
    {
        global $wpdb;

        $table = (string) $model->get_model_name();
        if ($table === "" || !preg_match("/^[A-Za-z0-9_]+$/", $table)) {
            return [
                "table" => $table,
                "deleted" => 0,
                "error" => __("Invalid table name.", "webba-booking-lite"),
            ];
        }

        $deleted = (int) $wpdb->get_var("SELECT COUNT(*) FROM `{$table}`");
        $result = $wpdb->query("DELETE FROM `{$table}`");

        if ($result === false) {
            return [
                "table" => $table,
                "deleted" => 0,
                "error" => (string) $wpdb->last_error,
            ];
        }

        /**
         * Fires after a WbkData table is cleared during reset-all-data.
         *
         * @param string $table
         * @param object $model
         */
        do_action("wbk_reset_all_data_table_cleared", $table, $model);

        return [
            "table" => $table,
            "deleted" => $deleted,
            "error" => null,
        ];
    }

    /**
     * @return array{count: int, errors: string[]}
     */
    private static function reset_options_to_defaults(): array
    {
        global $wp_settings_fields;

        if (!isset($wp_settings_fields["wbk-options"])) {
            try {
                if (!function_exists("add_settings_section")) {
                    require_once ABSPATH . "wp-admin/includes/template.php";
                }

                $backend_options = new WBK_Backend_Options();
                $backend_options->initSettings();
            } catch (\Throwable $throwable) {
                return [
                    "count" => 0,
                    "errors" => [$throwable->getMessage()],
                ];
            }
        }

        if (
            !isset($wp_settings_fields["wbk-options"]) ||
            !is_array($wp_settings_fields["wbk-options"])
        ) {
            return [
                "count" => 0,
                "errors" => [
                    __("Settings fields not initialized.", "webba-booking-lite"),
                ],
            ];
        }

        $count = 0;
        $errors = [];

        foreach ($wp_settings_fields["wbk-options"] as $section_fields) {
            if (!is_array($section_fields)) {
                continue;
            }

            foreach ($section_fields as $field) {
                if (!isset($field["id"]) || !is_string($field["id"]) || $field["id"] === "") {
                    continue;
                }

                $slug = $field["id"];
                $args = isset($field["args"]) && is_array($field["args"]) ? $field["args"] : [];

                if (array_key_exists("default", $args) && $args["default"] === false) {
                    delete_option($slug);
                } elseif (array_key_exists("default", $args)) {
                    update_option($slug, $args["default"]);
                } else {
                    delete_option($slug);
                }

                self::handle_option_side_effects($slug);
                $count++;
            }
        }

        return [
            "count" => $count,
            "errors" => $errors,
        ];
    }

    private static function handle_option_side_effects(string $slug): void
    {
        if ($slug !== "wbk_email_admin_daily_time") {
            return;
        }

        date_default_timezone_set(get_option("wbk_timezone", "UTC"));
        $time_corr = intval(get_option("wbk_email_admin_daily_time", "68400"));
        $timestamp = strtotime("today midnight") + $time_corr;
        if ($timestamp < time()) {
            $timestamp += 86400;
        }
        wp_clear_scheduled_hook("wbk_daily_event");
        wp_schedule_event($timestamp, "daily", "wbk_daily_event");
        date_default_timezone_set("UTC");
    }

    private static function get_table_delete_priority(string $model_key): int
    {
        foreach (self::$table_delete_priorities as $suffix => $priority) {
            if ($suffix !== "" && substr($model_key, -strlen($suffix)) === $suffix) {
                return $priority;
            }
        }

        return 50;
    }
}
