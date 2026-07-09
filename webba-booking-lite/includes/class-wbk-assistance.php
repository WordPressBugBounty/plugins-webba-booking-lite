<?php
if (!defined("ABSPATH")) {
    exit();
}

/**
 * Executes assistance suggested actions (create/update entities, set options).
 */
class WBK_Assistance
{
    private const LOG_PREFIX = "[WBK Assistance Apply]";

    private const APPLY_CODE_VERSION = "2026-07-05-phase-logging";

    private static $apply_phase = "not_started";

    private const BOOKING_PAGE_TITLE = "Booking";

    private const BOOKING_PAGE_SHORTCODE = "[webbabooking]";

    /**
     * WbkData tables that assistance actions may create or update.
     *
     * @var string[]
     */
    private static $entity_tables = [
        "wbk_services",
        "wbk_service_categories",
        "wbk_email_templates",
        "wbk_extras",
        "wbk_forms",
        "wbk_locations",
        "wbk_pricing_rules",
        "wbk_coupons",
        "wbk_connected_calendars",
        "wbk_staff_members",
        "wbk_units",
    ];

    /**
     * @return string[]
     */
    public static function get_entity_tables(): array
    {
        return apply_filters("wbk_assistance_entity_tables", self::$entity_tables);
    }

    private const CHILD_LINK_FIELDS = [
        "wbk_extras" => ["hourly" => "services", "daily" => "units"],
        "wbk_email_templates" => ["hourly" => "services", "daily" => "units"],
        "wbk_service_categories" => ["hourly" => "list", "daily" => "units"],
        "wbk_coupons" => ["hourly" => "services", "daily" => "services"],
    ];

    /**
     * Child entities whose service_id / unit_id should append a ref on the primary entity.
     *
     * @var array<string, array{hourly: string, daily: string, multiple: bool}>
     */
    private const PRIMARY_RECEIVES_LINK = [
        "wbk_locations" => [
            "hourly" => "locations",
            "daily" => "locations",
            "multiple" => true,
        ],
        "wbk_forms" => [
            "hourly" => "form_builder",
            "daily" => "form_id",
            "multiple" => false,
        ],
        "wbk_connected_calendars" => [
            "hourly" => "connected_calendars",
            "daily" => "connected_calendars",
            "multiple" => true,
        ],
    ];

    /**
     * Entity link fields applied in phase 2 after all entities exist.
     *
     * @var string[]
     */
    private const RELATION_FIELD_NAMES = [
        "connected_calendars",
        "services",
        "locations",
        "list",
        "units",
        "form_builder",
        "form_id",
        "service_id",
    ];

    /**
     * Maps relation field names to the entity table they point at.
     *
     * @var array<string, string>
     */
    private const SELECT_FIELD_ENTITY_TABLES = [
        "connected_calendars" => "wbk_connected_calendars",
        "services" => "wbk_services",
        "locations" => "wbk_locations",
        "list" => "wbk_service_categories",
        "units" => "wbk_units",
        "service_id" => "wbk_services",
        "form_builder" => "wbk_forms",
        "form_id" => "wbk_forms",
    ];

    /**
     * @param array<int, array<string, mixed>> $actions
     * @param array<string, mixed> $options
     * @return array{success: bool, results: array<int, array<string, mixed>>, errors: string[], refs: array<string, int>}
     */
    public static function apply_actions(array $actions, array $options = []): array
    {
        self::$apply_phase = "started";
        self::debug_log("apply_actions started", [
            "code_version" => self::APPLY_CODE_VERSION,
            "action_count" => count($actions),
            "is_free_plan" => self::is_free_plan_user(),
            "wbk_is_free_defined" => defined("WBK_IS_FREE"),
        ]);

        try {
            return self::apply_actions_internal($actions, $options);
        } catch (\Throwable $throwable) {
            self::debug_log("apply_actions fatal error", [
                "code_version" => self::APPLY_CODE_VERSION,
                "phase" => self::$apply_phase,
                "exception_class" => get_class($throwable),
                "message" => $throwable->getMessage(),
                "file" => $throwable->getFile(),
                "line" => $throwable->getLine(),
                "trace" => $throwable->getTraceAsString(),
            ]);

            return [
                "success" => false,
                "results" => [],
                "errors" => [
                    trim(
                        __("Apply failed:", "webba-booking-lite") .
                            " " .
                            $throwable->getMessage()
                    ),
                ],
                "refs" => [],
                "summary" => [],
                "warnings" => [],
                "debug" => self::build_apply_debug_payload($throwable),
            ];
        }
    }

    /**
     * Last apply phase reached before success or failure (for REST error logging).
     */
    public static function get_last_apply_phase(): string
    {
        return self::$apply_phase;
    }

    /**
     * @return array<string, mixed>
     */
    public static function get_apply_debug_context(): array
    {
        return [
            "code_version" => self::APPLY_CODE_VERSION,
            "phase" => self::$apply_phase,
            "is_free_plan" => self::is_free_plan_user(),
            "wbk_is_free_defined" => defined("WBK_IS_FREE"),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private static function build_apply_debug_payload(\Throwable $throwable): ?array
    {
        if (!defined("WP_DEBUG") || !WP_DEBUG) {
            return null;
        }

        return [
            "code_version" => self::APPLY_CODE_VERSION,
            "phase" => self::$apply_phase,
            "exception_class" => get_class($throwable),
            "file" => $throwable->getFile(),
            "line" => $throwable->getLine(),
            "trace" => explode("\n", $throwable->getTraceAsString()),
        ];
    }

    private static function set_apply_phase(string $phase): void
    {
        self::$apply_phase = $phase;
        self::debug_log("phase", ["phase" => $phase]);
    }

    /**
     * @param array<int, array<string, mixed>> $actions
     * @param array<string, mixed> $options
     * @return array{success: bool, results: array<int, array<string, mixed>>, errors: string[], refs: array<string, int>}
     */
    private static function apply_actions_internal(array $actions, array $options = []): array
    {
        if ($actions === []) {
            return [
                "success" => false,
                "results" => [],
                "errors" => [__("No actions provided.", "webba-booking-lite")],
                "refs" => [],
            ];
        }

        $browser_timezone = isset($options["timezone"])
            ? sanitize_text_field((string) $options["timezone"])
            : "";
        if ($browser_timezone !== "") {
            self::set_apply_phase("set_browser_timezone");
            self::maybe_set_browser_timezone($browser_timezone);
        }

        if (!function_exists("WbkData")) {
            return [
                "success" => false,
                "results" => [],
                "errors" => [__("Data layer is not available.", "webba-booking-lite")],
                "refs" => [],
            ];
        }

        self::set_apply_phase("load_allowed_options");
        $allowed_tables = array_flip(self::get_entity_tables());
        self::debug_log("loading allowed option slugs");
        $allowed_options = self::get_allowed_option_slugs();
        self::debug_log("allowed option slugs loaded", [
            "count" => count($allowed_options),
        ]);

        self::set_apply_phase("wire_actions");
        $config_mode = self::detect_config_mode($actions);
        $wired_actions = self::wire_entity_connections($actions, $config_mode);

        self::set_apply_phase("collect_pro_skipped");
        $ref_map = [];
        $expected_refs = self::collect_expected_refs($wired_actions);
        /** @var array<int, array{table: string, id: int, ref: string|null}> $created_entities */
        $created_entities = [];
        /** @var array<int, array<string, mixed>> $results */
        $results = [];
        $errors = [];
        /** @var string[] $pro_skipped_messages */
        $pro_skipped_messages = [];
        self::collect_pro_skipped_from_actions($wired_actions, $pro_skipped_messages);

        self::set_apply_phase("partition_actions");
        $create_actions = [];
        $other_actions = [];

        foreach ($wired_actions as $index => $action) {
            if (!is_array($action)) {
                $message = self::translate_with_placeholders(
                    /* translators: {index}: action index */
                    "Action at index {index} is invalid.",
                    ["index" => $index]
                );
                $errors[] = $message;
                $results[$index] = self::result_entry("unknown", false, $message);
                continue;
            }

            $type = isset($action["action"]) ? (string) $action["action"] : "";
            if ($type === "create_entity") {
                $create_actions[$index] = $action;
            } else {
                $other_actions[$index] = $action;
            }
        }

        self::set_apply_phase("create_entities");
        self::debug_log("phase 1 create_entity started", [
            "create_count" => count($create_actions),
        ]);

        foreach ($create_actions as $index => $action) {
            self::set_apply_phase("create_entity:" . $index);
            $table = isset($action["table"]) ? trim((string) $action["table"]) : "";
            self::debug_log("processing create_entity", [
                "index" => $index,
                "table" => $table,
                "ref" => $action["ref"] ?? null,
            ]);

            if ($table === "" || !isset($allowed_tables[$table])) {
                $message = self::translate_with_placeholders(
                    /* translators: {table}: table name */
                    "Unsupported entity table: {table}",
                    ["table" => $table]
                );
                $results[$index] = self::result_entry(
                    "create_entity",
                    false,
                    $message,
                    ["table" => $table]
                );
                $errors[] = $message;
                continue;
            }

            $model = self::get_model($table);
            if ($model === false) {
                $message = self::translate_with_placeholders(
                    /* translators: {table}: table name */
                    "Model not found for table: {table}",
                    ["table" => $table]
                );
                $results[$index] = self::result_entry(
                    "create_entity",
                    false,
                    $message,
                    ["table" => $table]
                );
                $errors[] = $message;
                continue;
            }

            $prepared_fields = self::prepare_create_fields_without_relations(
                $action,
                $model,
                $pro_skipped_messages
            );
            $fields = $prepared_fields["fields"];
            $skipped_pro_fields = $prepared_fields["skipped"];

            self::debug_log("create_entity fields prepared", [
                "index" => $index,
                "table" => $table,
                "fields" => self::summarize_fields_for_log($fields),
            ]);

            $create_result = $model->add_item($fields);
            self::debug_log("create_entity add_item result", [
                "index" => $index,
                "table" => $table,
                "result" => self::summarize_add_item_result_for_log($create_result),
            ]);

            if (!is_array($create_result) || empty($create_result[0])) {
                $invalid = is_array($create_result) && isset($create_result[1])
                    ? $create_result[1]
                    : null;
                $remaining_invalid = self::filter_pro_only_invalid_fields($invalid, $model);

                if ($remaining_invalid === [] && is_array($invalid) && $invalid !== []) {
                    $fields = self::fill_missing_pro_field_defaults($fields, $model);
                    $fields = self::normalize_entity_fields($fields, $model);
                    $fields = self::finalize_service_fields($fields, $table);
                    $create_result = $model->add_item($fields);
                }

                if (!is_array($create_result) || empty($create_result[0])) {
                    $invalid = is_array($create_result) && isset($create_result[1])
                        ? $create_result[1]
                        : null;
                    $remaining_invalid = self::filter_pro_only_invalid_fields($invalid, $model);
                    $message = self::format_create_failure_message(
                        $table,
                        $remaining_invalid !== [] ? $remaining_invalid : null
                    );
                    $results[$index] = self::result_entry(
                        "create_entity",
                        false,
                        $message,
                        [
                            "table" => $table,
                            "invalid_fields" => $remaining_invalid !== [] ? $remaining_invalid : $invalid,
                        ]
                    );
                    $errors[] = $message;
                    continue;
                }
            }

            $id = isset($create_result["id"]) ? (int) $create_result["id"] : 0;
            $ref = isset($action["ref"]) ? trim((string) $action["ref"]) : "";

            if ($ref !== "") {
                $ref_map[$ref] = $id;
            }

            $created_entities[$index] = [
                "table" => $table,
                "id" => $id,
                "ref" => $ref !== "" ? $ref : null,
            ];

            $create_extra = [
                "table" => $table,
                "id" => $id,
                "ref" => $ref !== "" ? $ref : null,
            ];
            if ($skipped_pro_fields !== []) {
                $create_extra["skipped_pro_fields"] = array_column(
                    $skipped_pro_fields,
                    "key"
                );
            }

            $results[$index] = self::result_entry(
                "create_entity",
                true,
                __("Entity created.", "webba-booking-lite"),
                $create_extra
            );
        }

        self::set_apply_phase("apply_entity_relations");
        self::debug_log("phase 2 ref map built", [
            "refs" => $ref_map,
        ]);

        $relation_errors = self::apply_entity_relations(
            $wired_actions,
            $ref_map,
            $config_mode,
            $created_entities,
            $pro_skipped_messages
        );
        foreach ($relation_errors as $relation_error) {
            $errors[] = $relation_error;
        }

        self::set_apply_phase("other_actions");
        foreach ($other_actions as $index => $action) {
            self::set_apply_phase("other_action:" . $index);
            $type = isset($action["action"]) ? (string) $action["action"] : "";

            if ($type === "update_entity") {
                $table = isset($action["table"]) ? trim((string) $action["table"]) : "";
                $id = isset($action["id"]) ? (int) $action["id"] : 0;
                $fields = isset($action["fields"]) && is_array($action["fields"])
                    ? $action["fields"]
                    : [];

                if ($table === "" || !isset($allowed_tables[$table])) {
                    $message = self::translate_with_placeholders(
                        /* translators: {table}: table name */
                        "Unsupported entity table: {table}",
                        ["table" => $table]
                    );
                    $results[$index] = self::result_entry("update_entity", false, $message, [
                        "table" => $table,
                    ]);
                    $errors[] = $message;
                    continue;
                }

                if ($id <= 0) {
                    $message = __("Entity id is required for update.", "webba-booking-lite");
                    $results[$index] = self::result_entry("update_entity", false, $message, [
                        "table" => $table,
                    ]);
                    $errors[] = $message;
                    continue;
                }

                $model = self::get_model($table);
                if ($model === false) {
                    $message = self::translate_with_placeholders(
                        /* translators: {table}: table name */
                        "Model not found for table: {table}",
                        ["table" => $table]
                    );
                    $results[$index] = self::result_entry("update_entity", false, $message, [
                        "table" => $table,
                        "id" => $id,
                    ]);
                    $errors[] = $message;
                    continue;
                }

                $resolved_fields = self::normalize_entity_fields(
                    self::resolve_refs_in_fields($fields, $ref_map, $expected_refs),
                    $model
                );
                $field_filter = self::prepare_entity_fields_for_plan(
                    $resolved_fields,
                    $model,
                    $pro_skipped_messages,
                    false
                );
                $resolved_fields = $field_filter["fields"];
                $skipped_pro_fields = $field_filter["skipped"];

                if ($resolved_fields === [] && $skipped_pro_fields !== []) {
                    $results[$index] = self::result_entry(
                        "update_entity",
                        false,
                        __("No free-plan fields to update.", "webba-booking-lite"),
                        [
                            "table" => $table,
                            "id" => $id,
                            "skipped_pro" => true,
                            "skipped_pro_fields" => array_column(
                                $skipped_pro_fields,
                                "key"
                            ),
                        ]
                    );
                    continue;
                }

                if (self::contains_unresolved_refs($resolved_fields, $ref_map, $expected_refs)) {
                    $message = self::translate_with_placeholders(
                        /* translators: {table}: table name */
                        "Could not resolve entity references for {table} update.",
                        ["table" => $table]
                    );
                    $results[$index] = self::result_entry("update_entity", false, $message, [
                        "table" => $table,
                        "id" => $id,
                    ]);
                    $errors[] = $message;
                    continue;
                }

                $update_result = $model->update_item($resolved_fields, $id);
                if (!is_array($update_result) || empty($update_result[0])) {
                    $message = self::format_create_failure_message($table, null);
                    $results[$index] = self::result_entry("update_entity", false, $message, [
                        "table" => $table,
                        "id" => $id,
                    ]);
                    $errors[] = $message;
                    continue;
                }

                $update_extra = [
                    "table" => $table,
                    "id" => $id,
                ];
                if ($skipped_pro_fields !== []) {
                    $update_extra["skipped_pro_fields"] = array_column(
                        $skipped_pro_fields,
                        "key"
                    );
                }

                $results[$index] = self::result_entry(
                    "update_entity",
                    true,
                    __("Entity updated.", "webba-booking-lite"),
                    $update_extra
                );
                continue;
            }

            if ($type === "set_option") {
                $slug = isset($action["slug"]) ? trim((string) $action["slug"]) : "";
                if ($slug === "" || !isset($allowed_options[$slug])) {
                    $message = self::translate_with_placeholders(
                        /* translators: {slug}: option slug */
                        "Unsupported option: {slug}",
                        ["slug" => $slug]
                    );
                    $results[$index] = self::result_entry("set_option", false, $message, [
                        "slug" => $slug,
                    ]);
                    $errors[] = $message;
                    continue;
                }

                if (!array_key_exists("value", $action)) {
                    $message = self::translate_with_placeholders(
                        /* translators: {slug}: option slug */
                        "Missing value for option {slug}.",
                        ["slug" => $slug]
                    );
                    $results[$index] = self::result_entry("set_option", false, $message, [
                        "slug" => $slug,
                    ]);
                    $errors[] = $message;
                    continue;
                }

                if (self::is_free_plan_user() && self::is_pro_only_option($slug)) {
                    $option_labels = self::get_option_labels();
                    $label = $option_labels[$slug] ?? $slug;
                    $message = self::format_pro_skipped_setting_message($label);
                    self::append_pro_skipped_message($pro_skipped_messages, $message);
                    $results[$index] = self::result_entry("set_option", false, $message, [
                        "slug" => $slug,
                        "skipped_pro" => true,
                    ]);
                    continue;
                }

                update_option($slug, $action["value"]);
                self::handle_option_side_effects($slug);

                $results[$index] = self::result_entry(
                    "set_option",
                    true,
                    __("Option saved.", "webba-booking-lite"),
                    ["slug" => $slug]
                );
                continue;
            }

            $message = self::translate_with_placeholders(
                /* translators: {type}: action type */
                "Unsupported action type: {type}",
                ["type" => $type]
            );
            $results[$index] = self::result_entry($type, false, $message);
            $errors[] = $message;
        }

        self::set_apply_phase("build_response");
        $ordered_results = self::order_results($results, count($actions));
        $has_successful_action = self::has_successful_action($ordered_results);
        $booking_page = $has_successful_action
            ? self::ensure_booking_page()
            : null;
        self::set_apply_phase("build_summary");
        $summary_lines = $has_successful_action
            ? self::build_apply_summary($wired_actions, $ordered_results, $booking_page)
            : [];
        self::set_apply_phase("normalize_summary");
        $summary = $summary_lines !== []
            ? self::normalize_assistance_summary_lines($summary_lines)
            : [];
        $warnings = $pro_skipped_messages !== []
            ? self::normalize_assistance_summary_lines(
                self::unique_assistance_summary_lines($pro_skipped_messages)
            )
            : [];

        self::set_apply_phase("finished");

        $response = [
            "success" => $errors === [],
            "results" => $ordered_results,
            "errors" => $errors,
            "refs" => $ref_map,
            "summary" => $summary,
            "warnings" => $warnings,
            "booking_page" => $booking_page,
        ];

        self::debug_log("apply_actions finished", [
            "success" => $response["success"],
            "error_count" => count($errors),
            "result_count" => count($response["results"]),
            "refs" => $ref_map,
            "booking_page" => $booking_page,
        ]);

        return $response;
    }

    /**
     * @param array<int, array<string, mixed>> $results
     */
    private static function has_successful_action(array $results): bool
    {
        foreach ($results as $result) {
            if (is_array($result) && !empty($result["success"])) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return array<string, mixed>|null
     */
    private static function ensure_booking_page(): ?array
    {
        $existing = self::find_booking_page();
        if ($existing !== null) {
            self::maybe_normalize_booking_page($existing["page_id"]);
            self::maybe_set_booking_landing_page($existing["page_id"]);

            return array_merge(
                self::format_booking_page_info((int) $existing["page_id"]),
                ["created" => false]
            );
        }

        $page_id = wp_insert_post(
            [
                "post_title" => self::BOOKING_PAGE_TITLE,
                "post_content" => self::BOOKING_PAGE_SHORTCODE,
                "post_status" => "publish",
                "post_type" => "page",
                "post_author" => get_current_user_id() ?: 1,
            ],
            true
        );

        if (is_wp_error($page_id)) {
            return [
                "created" => false,
                "error" => $page_id->get_error_message(),
            ];
        }

        $page_id = (int) $page_id;
        self::maybe_set_booking_landing_page($page_id);

        return array_merge(self::format_booking_page_info($page_id), ["created" => true]);
    }

    /**
     * @return array<string, mixed>|null
     */
    private static function find_booking_page(): ?array
    {
        $by_title = get_page_by_title(self::BOOKING_PAGE_TITLE, OBJECT, "page");
        if (
            $by_title instanceof \WP_Post &&
            self::page_has_bare_webbabooking_shortcode($by_title)
        ) {
            return self::format_booking_page_info((int) $by_title->ID);
        }

        $pages = get_posts(
            [
                "post_type" => "page",
                "post_status" => ["draft", "publish", "pending", "private"],
                "posts_per_page" => 100,
                "orderby" => "date",
                "order" => "DESC",
            ]
        );

        foreach ($pages as $page) {
            if (!$page instanceof \WP_Post) {
                continue;
            }

            if (self::page_has_bare_webbabooking_shortcode($page)) {
                return self::format_booking_page_info((int) $page->ID);
            }
        }

        return null;
    }

    private static function page_has_bare_webbabooking_shortcode(\WP_Post $page): bool
    {
        return trim($page->post_content) === self::BOOKING_PAGE_SHORTCODE;
    }

    private static function maybe_normalize_booking_page(int $page_id): void
    {
        if ($page_id <= 0) {
            return;
        }

        $page = get_post($page_id);
        if (!$page instanceof \WP_Post) {
            return;
        }

        $updates = [];

        if (trim($page->post_content) !== self::BOOKING_PAGE_SHORTCODE) {
            $updates["post_content"] = self::BOOKING_PAGE_SHORTCODE;
        }

        if (get_the_title($page_id) !== self::BOOKING_PAGE_TITLE) {
            $updates["post_title"] = self::BOOKING_PAGE_TITLE;
        }

        if ($updates !== []) {
            $updates["ID"] = $page_id;
            wp_update_post($updates);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private static function format_booking_page_info(int $page_id): array
    {
        $page = get_post($page_id);
        $page_url = "";

        if ($page instanceof \WP_Post) {
            if ($page->post_status === "publish") {
                $permalink = get_permalink($page);
                if (is_string($permalink) && $permalink !== "") {
                    $page_url = $permalink;
                }
            } else {
                $preview_url = get_preview_post_link($page);
                if (is_string($preview_url) && $preview_url !== "") {
                    $page_url = $preview_url;
                }
            }
        }

        if ($page_url === "") {
            $permalink = get_permalink($page_id);
            if (is_string($permalink) && $permalink !== "") {
                $page_url = $permalink;
            }
        }

        return [
            "page_id" => $page_id,
            "page_title" => self::BOOKING_PAGE_TITLE,
            "page_url" => $page_url,
        ];
    }

    private static function maybe_set_browser_timezone(string $timezone): void
    {
        $timezone = sanitize_text_field($timezone);
        if ($timezone === "") {
            return;
        }

        if (!in_array($timezone, timezone_identifiers_list(), true)) {
            self::debug_log("ignored invalid browser timezone", [
                "timezone" => $timezone,
            ]);

            return;
        }

        update_option("wbk_timezone", $timezone);
    }

    private static function maybe_set_booking_landing_page(int $page_id): void
    {
        if ($page_id <= 0) {
            return;
        }

        $current_landing = get_option("wbk_email_landing_new", "");
        if (
            $current_landing === "" ||
            $current_landing === "https://webba-booking.com/booking-form-landing-page"
        ) {
            update_option("wbk_email_landing_new", (string) $page_id);
        }
    }

    /**
     * @param array<int, array<string, mixed>> $actions
     * @param array<int, array<string, mixed>> $results
     * @param array<string, mixed>|null $booking_page
     * @return string[]
     */
    private static function build_apply_summary(
        array $actions,
        array $results,
        ?array $booking_page
    ): array {
        $lines = [];
        $entity_labels = self::get_entity_table_labels();
        $option_labels = self::get_option_labels();
        $action_list = array_values($actions);

        foreach ($action_list as $index => $action) {
            if (!is_array($action)) {
                continue;
            }

            $result = $results[$index] ?? null;
            if (!is_array($result) || empty($result["success"])) {
                continue;
            }

            $type = isset($action["action"]) ? (string) $action["action"] : "";
            if ($type === "create_entity") {
                $table = isset($action["table"]) ? (string) $action["table"] : "";
                $fields = isset($action["fields"]) && is_array($action["fields"])
                    ? $action["fields"]
                    : [];
                $name = isset($fields["name"]) ? trim((string) $fields["name"]) : "";
                $label = $entity_labels[$table] ?? $table;

                $lines[] = $name !== ""
                    ? self::translate_with_placeholders(
                        /* translators: {label}: entity label, {name}: entity name */
                        "{label} created: {name}",
                        [
                            "label" => $label,
                            "name" => $name,
                        ]
                    )
                    : self::translate_with_placeholders(
                        /* translators: {label}: entity label */
                        "{label} created.",
                        ["label" => $label]
                    );
                continue;
            }

            if ($type === "update_entity") {
                $table = isset($action["table"]) ? (string) $action["table"] : "";
                $label = $entity_labels[$table] ?? $table;
                $lines[] = self::translate_with_placeholders(
                    /* translators: {label}: entity label */
                    "{label} updated.",
                    ["label" => $label]
                );
                continue;
            }

            if ($type === "set_option") {
                $slug = isset($action["slug"]) ? (string) $action["slug"] : "";
                if ($slug !== "") {
                    $label = $option_labels[$slug] ?? $slug;
                    $lines[] = self::translate_with_placeholders(
                        /* translators: {label}: setting label */
                        "Setting saved: {label}",
                        ["label" => $label]
                    );
                }
            }
        }

        if (is_array($booking_page) && !empty($booking_page["page_id"])) {
            $page_title = !empty($booking_page["page_title"])
                ? (string) $booking_page["page_title"]
                : "Booking";

            if (!empty($booking_page["created"])) {
                $lines[] = self::translate_with_placeholders(
                    /* translators: {title}: page title */
                    'Booking page "{title}" created with [webbabooking] shortcode.',
                    ["title" => $page_title]
                );
            } else {
                $lines[] = self::translate_with_placeholders(
                    /* translators: {title}: page title */
                    'Booking page "{title}" is ready.',
                    ["title" => $page_title]
                );
            }
        } elseif (is_array($booking_page) && !empty($booking_page["error"])) {
            $lines[] = self::translate_with_placeholders(
                /* translators: {error}: error message */
                "Could not create booking page: {error}",
                ["error" => (string) $booking_page["error"]]
            );
        }

        return $lines;
    }

    /**
     * @return array<string, string>
     */
    private static function get_entity_table_labels(): array
    {
        return [
            "wbk_services" => __("Service", "webba-booking-lite"),
            "wbk_service_categories" => __("Category", "webba-booking-lite"),
            "wbk_email_templates" => __("Email template", "webba-booking-lite"),
            "wbk_extras" => __("Extra", "webba-booking-lite"),
            "wbk_forms" => __("Form", "webba-booking-lite"),
            "wbk_locations" => __("Location", "webba-booking-lite"),
            "wbk_pricing_rules" => __("Pricing rule", "webba-booking-lite"),
            "wbk_coupons" => __("Coupon", "webba-booking-lite"),
            "wbk_connected_calendars" => __("Connected calendar", "webba-booking-lite"),
            "wbk_staff_members" => __("Staff member", "webba-booking-lite"),
            "wbk_units" => __("Unit", "webba-booking-lite"),
        ];
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
     * @param array<int, array<string, mixed>> $results
     * @return array<int, array<string, mixed>>
     */
    private static function order_results(array $results, int $count): array
    {
        $ordered = [];

        for ($index = 0; $index < $count; $index++) {
            if (isset($results[$index])) {
                $ordered[] = $results[$index];
                continue;
            }

            $ordered[] = self::result_entry(
                "unknown",
                false,
                __("Action was not processed.", "webba-booking-lite")
            );
        }

        return $ordered;
    }

    /**
     * @param array<int, array<string, mixed>> $actions
     * @return array<string, true>
     */
    private static function collect_expected_refs(array $actions): array
    {
        $refs = [];

        foreach ($actions as $action) {
            if (!is_array($action) || ($action["action"] ?? "") !== "create_entity") {
                continue;
            }

            $ref = isset($action["ref"]) ? trim((string) $action["ref"]) : "";
            if ($ref !== "") {
                $refs[$ref] = true;
            }
        }

        return $refs;
    }

    /**
     * @param array<int, array<string, mixed>> $actions
     */
    private static function detect_config_mode(array $actions): string
    {
        foreach ($actions as $action) {
            if (!is_array($action) || ($action["action"] ?? "") !== "create_entity") {
                continue;
            }

            if (($action["table"] ?? "") === "wbk_units") {
                return "daily";
            }
        }

        return "hourly";
    }

    /**
     * @param array<int, array<string, mixed>> $actions
     * @return array<int, array<string, mixed>>
     */
    private static function wire_entity_connections(array $actions, string $mode): array
    {
        $primary_table = $mode === "daily" ? "wbk_units" : "wbk_services";
        $primary_refs = [];

        foreach ($actions as $action) {
            if (!is_array($action) || ($action["action"] ?? "") !== "create_entity") {
                continue;
            }

            if (($action["table"] ?? "") !== $primary_table) {
                continue;
            }

            $ref = isset($action["ref"]) ? trim((string) $action["ref"]) : "";
            if ($ref !== "") {
                $primary_refs[] = $ref;
            }
        }

        $single_primary_ref = count($primary_refs) === 1 ? $primary_refs[0] : null;
        $related_tables = array_flip(array_keys(self::PRIMARY_RECEIVES_LINK));

        $wired = [];
        $primary_field_updates = [];

        foreach ($actions as $action) {
            if (!is_array($action) || ($action["action"] ?? "") !== "create_entity") {
                $wired[] = $action;
                continue;
            }

            $table = (string) ($action["table"] ?? "");
            $fields = is_array($action["fields"] ?? null) ? $action["fields"] : [];

            if (isset(self::CHILD_LINK_FIELDS[$table])) {
                $action = self::link_child_action_to_primary_refs(
                    $action,
                    $fields,
                    $mode,
                    $primary_refs
                );
                $fields = is_array($action["fields"] ?? null) ? $action["fields"] : $fields;
            } elseif (isset($related_tables[$table])) {
                $link_ref = self::get_primary_link_ref($action, $fields, $mode, $single_primary_ref);
                if ($link_ref !== null) {
                    if ($mode === "daily") {
                        $action["unit_id"] = $link_ref;
                    } else {
                        $action["service_id"] = $link_ref;
                    }
                }
            }

            $table = (string) ($action["table"] ?? "");
            if (isset(self::PRIMARY_RECEIVES_LINK[$table])) {
                $link_ref = self::get_primary_link_ref(
                    $action,
                    is_array($action["fields"] ?? null) ? $action["fields"] : [],
                    $mode,
                    $single_primary_ref
                );
                $entity_ref = isset($action["ref"]) ? trim((string) $action["ref"]) : "";

                if ($link_ref !== null && $entity_ref !== "") {
                    $mapping = self::PRIMARY_RECEIVES_LINK[$table];
                    $field_name = $mapping[$mode];
                    $primary_field_updates[$link_ref][] = [
                        "ref" => $entity_ref,
                        "field" => $field_name,
                        "multiple" => $mapping["multiple"],
                    ];
                }
            }

            $wired[] = $action;
        }

        foreach ($wired as $index => $action) {
            if (!is_array($action) || ($action["action"] ?? "") !== "create_entity") {
                continue;
            }

            if (($action["table"] ?? "") !== $primary_table) {
                continue;
            }

            $ref = isset($action["ref"]) ? trim((string) $action["ref"]) : "";
            if ($ref === "" || !isset($primary_field_updates[$ref])) {
                continue;
            }

            $fields = is_array($action["fields"] ?? null) ? $action["fields"] : [];
            foreach ($primary_field_updates[$ref] as $update) {
                $fields = self::append_ref_to_field(
                    $fields,
                    $update["field"],
                    $update["ref"],
                    $update["multiple"]
                );
            }

            $wired[$index]["fields"] = $fields;
        }

        return $wired;
    }

    /**
     * @param array<string, mixed> $action
     * @param array<string, mixed> $fields
     * @param string[] $primary_refs
     * @return array<string, mixed>
     */
    private static function link_child_action_to_primary_refs(
        array $action,
        array $fields,
        string $mode,
        array $primary_refs
    ): array {
        $table = (string) ($action["table"] ?? "");
        $child_field = self::CHILD_LINK_FIELDS[$table][$mode] ?? null;

        if ($child_field === null) {
            return $action;
        }

        if (self::field_has_link_values($fields, $child_field)) {
            $action["fields"] = $fields;
            return $action;
        }

        $explicit_ref = $mode === "daily"
            ? trim((string) ($action["unit_id"] ?? ""))
            : trim((string) ($action["service_id"] ?? ""));

        if ($explicit_ref !== "") {
            $action["fields"] = self::append_ref_to_field($fields, $child_field, $explicit_ref, true);
            return $action;
        }

        foreach ($primary_refs as $primary_ref) {
            $fields = self::append_ref_to_field($fields, $child_field, $primary_ref, true);
        }

        $action["fields"] = $fields;
        return $action;
    }

    /**
     * @param array<string, mixed> $action
     * @param array<string, mixed> $fields
     */
    private static function get_primary_link_ref(
        array $action,
        array $fields,
        string $mode,
        ?string $single_primary_ref
    ): ?string {
        $explicit = $mode === "daily"
            ? trim((string) ($action["unit_id"] ?? ""))
            : trim((string) ($action["service_id"] ?? ""));

        if ($explicit !== "") {
            return $explicit;
        }

        return $single_primary_ref;
    }

    /**
     * @param array<string, mixed> $fields
     */
    private static function field_has_link_values(array $fields, string $field_name): bool
    {
        $value = $fields[$field_name] ?? null;

        if (is_string($value)) {
            $trimmed = trim($value);
            if ($trimmed === "" || $trimmed === "[]") {
                return false;
            }

            if ($trimmed[0] === "[") {
                $decoded = json_decode($trimmed, true);
                if (is_array($decoded)) {
                    foreach ($decoded as $entry) {
                        if (is_string($entry) && trim($entry) !== "") {
                            return true;
                        }
                    }

                    return false;
                }
            }

            return true;
        }

        if (!is_array($value)) {
            return false;
        }

        foreach ($value as $entry) {
            if (is_string($entry) && trim($entry) !== "") {
                return true;
            }
        }

        return false;
    }

    /**
     * Phase 1: create entities without relation fields.
     *
     * @param array<string, mixed> $action
     * @return array<string, mixed>
     */
    /**
     * @return array{fields: array<string, mixed>, skipped: array<int, array{key: string, label: string}>}
     */
    private static function prepare_create_fields_without_relations(
        array $action,
        $model,
        array &$pro_skipped_messages
    ): array {
        $fields = isset($action["fields"]) && is_array($action["fields"])
            ? $action["fields"]
            : [];

        $table = isset($action["table"]) ? (string) $action["table"] : "";

        foreach (self::RELATION_FIELD_NAMES as $field_name) {
            unset($fields[$field_name]);
        }

        $field_filter = self::prepare_entity_fields_for_plan(
            $fields,
            $model,
            $pro_skipped_messages,
            true
        );
        $normalized = self::normalize_entity_fields($field_filter["fields"], $model);
        $normalized = self::finalize_service_fields($normalized, $table);

        return [
            "fields" => $normalized,
            "skipped" => $field_filter["skipped"],
        ];
    }

    /**
     * Phase 3: resolve refs/names to IDs and persist JSON relation arrays.
     *
     * @param array<int, array<string, mixed>> $actions
     * @param array<string, int> $ref_map
     * @return string[]
     */
    private static function apply_entity_relations(
        array $actions,
        array $ref_map,
        string $mode,
        array $created_entities,
        array &$pro_skipped_messages = []
    ): array {
        if ($ref_map === [] && $created_entities === []) {
            return [];
        }

        $name_to_ref = self::build_name_to_ref_map($actions);
        $updates = self::collect_relation_updates(
            $actions,
            $ref_map,
            $name_to_ref,
            $mode,
            $created_entities
        );
        $errors = [];

        self::debug_log("phase 3 apply_entity_relations started", [
            "update_count" => count($updates),
            "updates" => $updates,
        ]);

        foreach ($updates as $update) {
            $entity_id = $update["id"];
            if ($entity_id <= 0) {
                continue;
            }

            $model = self::get_model($update["table"]);
            $model_fields = self::get_model_field_maps($model)["by_name"];
            $stored_fields = [];

            foreach ($update["fields"] as $field_name => $spec) {
                $field = $model_fields[$field_name] ?? null;
                if (
                    $field !== null &&
                    self::is_free_plan_user() &&
                    self::is_pro_only_model_field($field)
                ) {
                    $label = method_exists($field, "get_title")
                        ? (string) $field->get_title()
                        : $field_name;
                    self::append_pro_skipped_message(
                        $pro_skipped_messages,
                        self::format_pro_skipped_field_message($label)
                    );
                    continue;
                }

                $stored_value = self::format_relation_field_value(
                    $spec["ids"],
                    $spec["multiple"]
                );

                if ($stored_value === null) {
                    continue;
                }

                if (
                    !self::persist_relation_field(
                        $update["table"],
                        $entity_id,
                        $field_name,
                        $stored_value
                    )
                ) {
                    $errors[] = self::translate_with_placeholders(
                        /* translators: {field}: field name, {table}: table name, {id}: entity id */
                        "Failed to set {field} on {table} (ID {id}).",
                        [
                            "field" => $field_name,
                            "table" => $update["table"],
                            "id" => $entity_id,
                        ]
                    );
                    continue;
                }

                $stored_fields[$field_name] = $stored_value;
            }

            if ($stored_fields !== []) {
                self::debug_log("phase 3 relation update applied", [
                    "table" => $update["table"],
                    "id" => $entity_id,
                    "ref" => $update["ref"],
                    "fields" => $stored_fields,
                ]);
            }
        }

        return $errors;
    }

    /**
     * @param int[] $ids
     */
    private static function format_relation_field_value(array $ids, bool $multiple): ?string
    {
        $normalized_ids = array_values(
            array_filter(array_map("intval", $ids), static fn($id) => $id > 0)
        );

        if ($normalized_ids === []) {
            return null;
        }

        if ($multiple) {
            $string_ids = array_map(static fn($id) => (string) $id, $normalized_ids);

            return wp_json_encode($string_ids);
        }

        return (string) $normalized_ids[0];
    }

    private static function persist_relation_field(
        string $table,
        int $entity_id,
        string $field_name,
        string $value
    ): bool {
        $model = self::get_model($table);
        if ($model !== false) {
            $update_result = $model->update_item([$field_name => $value], $entity_id);
            if (is_array($update_result) && !empty($update_result[0])) {
                return true;
            }

            self::debug_log("persist_relation_field update_item failed", [
                "table" => $table,
                "id" => $entity_id,
                "field" => $field_name,
                "value" => $value,
                "result" => self::summarize_add_item_result_for_log($update_result),
            ]);
        }

        global $wpdb;

        $table_name = self::get_table_name($table);
        if ($table_name === "") {
            return false;
        }

        $updated = $wpdb->update(
            $table_name,
            [$field_name => $value],
            ["id" => $entity_id],
            ["%s"],
            ["%d"]
        );

        if ($updated === false) {
            self::debug_log("persist_relation_field failed", [
                "table" => $table_name,
                "id" => $entity_id,
                "field" => $field_name,
                "value" => $value,
                "error" => $wpdb->last_error,
            ]);

            return false;
        }

        return true;
    }

    private static function is_multiple_relation_field(string $field_name): bool
    {
        return in_array(
            $field_name,
            ["services", "units", "locations", "list", "connected_calendars"],
            true
        );
    }

    private static function get_table_name(string $table): string
    {
        global $wpdb;

        $db_prefix = get_option("wbk_db_prefix", "");
        if ($db_prefix === "") {
            $db_prefix = $wpdb->prefix;
        }

        return \WbkData_Model_Utils::clean_up_string($db_prefix . $table);
    }

    /**
     * @param array<int, array<string, mixed>> $actions
     * @return array<string, array<string, string>>
     */
    private static function build_name_to_ref_map(array $actions): array
    {
        $map = [];

        foreach ($actions as $action) {
            if (!is_array($action) || ($action["action"] ?? "") !== "create_entity") {
                continue;
            }

            $table = trim((string) ($action["table"] ?? ""));
            $ref = isset($action["ref"]) ? trim((string) $action["ref"]) : "";
            $fields = is_array($action["fields"] ?? null) ? $action["fields"] : [];
            $name = isset($fields["name"]) ? trim((string) $fields["name"]) : "";

            if ($table === "" || $ref === "" || $name === "") {
                continue;
            }

            $map[$table][self::normalize_entity_name_key($name)] = $ref;
        }

        return $map;
    }

    private static function normalize_entity_name_key(string $name): string
    {
        return strtolower(trim($name));
    }

    /**
     * @param array<string, int> $ref_map
     * @param array<string, array<string, string>> $name_to_ref
     * @return array<int, array{table: string, ref: string|null, id: int, fields: array<string, array{multiple: bool, ids: int[]}>}>
     */
    private static function collect_relation_updates(
        array $actions,
        array $ref_map,
        array $name_to_ref,
        string $mode,
        array $created_entities
    ): array {
        $updates = [];
        $primary_table = $mode === "daily" ? "wbk_units" : "wbk_services";

        foreach ($actions as $index => $action) {
            if (!is_array($action) || ($action["action"] ?? "") !== "create_entity") {
                continue;
            }

            if (!isset($created_entities[$index])) {
                continue;
            }

            $table = trim((string) ($action["table"] ?? ""));
            $entity_ref = isset($action["ref"]) ? trim((string) $action["ref"]) : "";
            $entity_id = (int) $created_entities[$index]["id"];
            $fields = is_array($action["fields"] ?? null) ? $action["fields"] : [];

            if ($table === "" || $entity_id <= 0) {
                continue;
            }

            foreach (self::RELATION_FIELD_NAMES as $field_name) {
                if (!array_key_exists($field_name, $fields)) {
                    continue;
                }

                $target_table = self::SELECT_FIELD_ENTITY_TABLES[$field_name] ?? null;
                if ($target_table === null) {
                    continue;
                }

                $tokens = self::parse_select_value_to_list($fields[$field_name]);
                if ($tokens === []) {
                    continue;
                }

                $multiple = self::is_multiple_relation_field($field_name);

                foreach ($tokens as $token) {
                    $relation_id = self::resolve_link_token_to_id(
                        $token,
                        $ref_map,
                        $name_to_ref,
                        $target_table
                    );

                    if ($relation_id === null) {
                        continue;
                    }

                    self::queue_relation_update(
                        $updates,
                        $table,
                        $entity_ref !== "" ? $entity_ref : (string) $entity_id,
                        $entity_id,
                        $field_name,
                        $relation_id,
                        $multiple
                    );
                }
            }

            if (isset(self::PRIMARY_RECEIVES_LINK[$table])) {
                $primary_ref = $mode === "daily"
                    ? trim((string) ($action["unit_id"] ?? ""))
                    : trim((string) ($action["service_id"] ?? ""));

                if ($primary_ref !== "" && isset($ref_map[$primary_ref])) {
                    $mapping = self::PRIMARY_RECEIVES_LINK[$table];
                    $field_name = $mapping[$mode];
                    self::queue_relation_update(
                        $updates,
                        $primary_table,
                        $primary_ref,
                        (int) $ref_map[$primary_ref],
                        $field_name,
                        $entity_id,
                        $mapping["multiple"]
                    );
                }
            }

            if (isset(self::CHILD_LINK_FIELDS[$table])) {
                $primary_ref = $mode === "daily"
                    ? trim((string) ($action["unit_id"] ?? ""))
                    : trim((string) ($action["service_id"] ?? ""));

                if ($primary_ref !== "" && isset($ref_map[$primary_ref])) {
                    $link_field = self::CHILD_LINK_FIELDS[$table][$mode];
                    self::queue_relation_update(
                        $updates,
                        $table,
                        $entity_ref !== "" ? $entity_ref : (string) $entity_id,
                        $entity_id,
                        $link_field,
                        (int) $ref_map[$primary_ref],
                        true
                    );
                }
            }
        }

        return array_values($updates);
    }

    /**
     * @param array<string, array<string, string>> $name_to_ref
     */
    private static function resolve_link_token_to_id(
        $token,
        array $ref_map,
        array $name_to_ref,
        string $entity_table
    ): ?int {
        if (is_int($token) && $token > 0) {
            return $token;
        }

        if (is_float($token) && floor($token) == $token && $token > 0) {
            return (int) $token;
        }

        if (!is_string($token)) {
            return null;
        }

        $trimmed = trim($token);
        if ($trimmed === "") {
            return null;
        }

        if (ctype_digit($trimmed)) {
            $id = (int) $trimmed;
            return $id > 0 ? $id : null;
        }

        if (isset($ref_map[$trimmed])) {
            return (int) $ref_map[$trimmed];
        }

        $name_key = self::normalize_entity_name_key($trimmed);
        if (isset($name_to_ref[$entity_table][$name_key])) {
            $ref = $name_to_ref[$entity_table][$name_key];
            if (isset($ref_map[$ref])) {
                return (int) $ref_map[$ref];
            }
        }

        return null;
    }

    /**
     * @param array<int, array{table: string, ref: string|null, id: int, fields: array<string, array{multiple: bool, ids: int[]}>}> $updates
     */
    private static function queue_relation_update(
        array &$updates,
        string $table,
        string $entity_key,
        int $entity_id,
        string $field_name,
        int $relation_id,
        bool $multiple
    ): void {
        if ($relation_id <= 0 || $entity_id <= 0) {
            return;
        }

        $update_key = null;
        foreach ($updates as $index => $update) {
            if ($update["table"] === $table && $update["id"] === $entity_id) {
                $update_key = $index;
                break;
            }
        }

        if ($update_key === null) {
            $updates[] = [
                "table" => $table,
                "ref" => $entity_key,
                "id" => $entity_id,
                "fields" => [],
            ];
            $update_key = count($updates) - 1;
        }

        if (!isset($updates[$update_key]["fields"][$field_name])) {
            $updates[$update_key]["fields"][$field_name] = [
                "multiple" => $multiple,
                "ids" => [],
            ];
        }

        if ($multiple) {
            if (!in_array($relation_id, $updates[$update_key]["fields"][$field_name]["ids"], true)) {
                $updates[$update_key]["fields"][$field_name]["ids"][] = $relation_id;
            }
            return;
        }

        $updates[$update_key]["fields"][$field_name]["ids"] = [$relation_id];
    }

    /**
     * @param array<string, mixed> $fields
     * @return array<string, mixed>
     */
    private static function normalize_entity_fields(array $fields, $model): array
    {
        if (
            $model === false ||
            !is_object($model) ||
            !isset($model->fields) ||
            !is_object($model->fields) ||
            !method_exists($model->fields, "get_elements")
        ) {
            self::debug_log("normalize_entity_fields skipped (model fields unavailable)");
            return $fields;
        }

        try {
            $model_fields = $model->fields->get_elements();
        } catch (\Throwable $throwable) {
            self::debug_log("normalize_entity_fields failed to read model fields", [
                "message" => $throwable->getMessage(),
            ]);
            return $fields;
        }

        if (!is_array($model_fields)) {
            return $fields;
        }

        foreach ($model_fields as $field) {
            if (!is_object($field) || !method_exists($field, "get_name")) {
                continue;
            }

            $name = (string) $field->get_name();
            $type = method_exists($field, "get_type") ? (string) $field->get_type() : "";
            $required = method_exists($field, "get_required") ? (bool) $field->get_required() : false;
            $default_value = method_exists($field, "get_default_value")
                ? $field->get_default_value()
                : null;

            if (
                $required &&
                self::is_missing_field_value($fields[$name] ?? null) &&
                !self::is_missing_field_value($default_value)
            ) {
                $fields[$name] = $default_value;
            }

            if (!array_key_exists($name, $fields)) {
                continue;
            }

            if ($type === "checkbox") {
                $fields[$name] = self::normalize_checkbox_value($fields[$name]);
                continue;
            }

            if ($type === "wbk_business_hours") {
                $fields[$name] = self::convert_business_hours_to_intervals($fields[$name]);
                continue;
            }

            if ($type === "select") {
                $fields[$name] = self::normalize_select_value($fields[$name], $field);
                if (self::is_missing_field_value($fields[$name])) {
                    unset($fields[$name]);
                }
                continue;
            }

            if (in_array($type, ["text", "duration", "limitation"], true)) {
                $fields[$name] = self::normalize_scalar_value($fields[$name]);
            }
        }

        return $fields;
    }

    private static function is_missing_field_value($value): bool
    {
        return $value === null || $value === "";
    }

    private static function normalize_checkbox_value($value): string
    {
        if ($value === true || $value === 1 || $value === "1" || $value === "true") {
            return "yes";
        }

        if ($value === false || $value === 0 || $value === "0" || $value === "false") {
            return "";
        }

        return is_string($value) ? trim($value) : "";
    }

    private static function normalize_scalar_value($value): string
    {
        if (is_int($value) || is_float($value)) {
            return (string) $value;
        }

        if (is_string($value)) {
            return trim($value);
        }

        return "";
    }

    /**
     * @param array<string, mixed> $invalid_fields
     */
    private static function format_create_failure_message(string $table, $invalid_fields): string
    {
        $details = self::format_invalid_fields($invalid_fields);
        if ($details === "") {
            return self::translate_with_placeholders(
                /* translators: {table}: table name */
                "Failed to create {table}.",
                ["table" => $table]
            );
        }

        return self::translate_with_placeholders(
            /* translators: {table}: table name, {details}: validation details */
            "Failed to create {table}: {details}",
            [
                "table" => $table,
                "details" => $details,
            ]
        );
    }

    private static function format_invalid_fields($invalid_fields): string
    {
        if (!is_array($invalid_fields)) {
            return "";
        }

        $messages = [];
        foreach ($invalid_fields as $entry) {
            if (!is_array($entry)) {
                continue;
            }

            $field = isset($entry[0]) ? (string) $entry[0] : "";
            $message = isset($entry[1]) ? (string) $entry[1] : "";
            if ($message === "") {
                continue;
            }

            $messages[] = $field !== "" ? $field . ": " . $message : $message;
        }

        return implode("; ", $messages);
    }

    private static function normalize_select_value($value, object $field)
    {
        $extra = method_exists($field, "get_extra_data") ? $field->get_extra_data() : [];
        $multiple = is_array($extra) && !empty($extra["multiple"]);
        $field_name = method_exists($field, "get_name") ? (string) $field->get_name() : "";
        $is_entity_relation = isset(self::SELECT_FIELD_ENTITY_TABLES[$field_name]);

        if ($multiple) {
            if ($is_entity_relation) {
                $items = is_array($value) ? $value : ($value !== null && $value !== "" ? [$value] : []);
                $normalized = [];

                foreach ($items as $item) {
                    $candidate = self::normalize_relation_id($item);
                    if ($candidate !== null) {
                        $normalized[] = $candidate;
                    }
                }

                return $normalized;
            }

            return self::normalize_option_select_values($value);
        }

        if ($is_entity_relation) {
            return self::normalize_relation_id($value);
        }

        return self::normalize_option_select_value($value);
    }

    /**
     * @return string[]
     */
    private static function normalize_option_select_values($value): array
    {
        $normalized = [];

        foreach (self::parse_select_value_to_list($value) as $item) {
            if (!is_string($item) && !is_int($item) && !is_float($item)) {
                continue;
            }

            $candidate = trim((string) $item);
            if ($candidate === "") {
                continue;
            }

            if (!in_array($candidate, $normalized, true)) {
                $normalized[] = $candidate;
            }
        }

        return $normalized;
    }

    private static function normalize_option_select_value($value): ?string
    {
        $values = self::normalize_option_select_values($value);

        return $values !== [] ? $values[0] : null;
    }

    /**
     * @return array<int, mixed>
     */
    private static function parse_select_value_to_list($value): array
    {
        if (is_array($value)) {
            return $value;
        }

        if (!is_string($value)) {
            return $value !== null && $value !== "" ? [(string) $value] : [];
        }

        $trimmed = trim($value);
        if ($trimmed === "") {
            return [];
        }

        if ($trimmed[0] === "[") {
            $decoded = json_decode($trimmed, true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }

        return [$trimmed];
    }

    private static function normalize_relation_id($value)
    {
        if (is_int($value)) {
            return $value;
        }

        if (is_string($value)) {
            $trimmed = trim($value);
            if ($trimmed === "" || $trimmed === "0") {
                return $trimmed === "0" ? "0" : null;
            }

            if (ctype_digit($trimmed)) {
                return (int) $trimmed;
            }

            return null;
        }

        if (is_float($value) && floor($value) == $value) {
            return (int) $value;
        }

        return null;
    }

    /**
     * @param array<string, mixed> $fields
     * @return array<string, mixed>
     */
    private static function finalize_service_fields(array $fields, string $table): array
    {
        if ($table !== "wbk_services") {
            return $fields;
        }

        if (!array_key_exists("business_hours", $fields)) {
            return $fields;
        }

        $raw_business_hours = $fields["business_hours"];
        $intervals = self::convert_business_hours_to_intervals($raw_business_hours);
        if ($intervals === []) {
            unset($fields["business_hours"]);
            self::debug_log("service business_hours removed (could not convert)", [
                "raw" => $raw_business_hours,
            ]);
            return $fields;
        }

        $fields["business_hours"] = $intervals;
        $fields["override_availability"] = "yes";

        self::debug_log("service business_hours finalized", [
            "interval_count" => count($intervals),
            "override_availability" => "yes",
        ]);

        return $fields;
    }

    /**
     * @return array<int, array{start: int, end: int, day_of_week: string, status: string}>
     */
    private static function convert_business_hours_to_intervals($value): array
    {
        if (is_string($value)) {
            $trimmed = trim($value);
            if ($trimmed === "") {
                return [];
            }

            $decoded = json_decode($trimmed, true);
            if (!is_array($decoded)) {
                return [];
            }

            $value = $decoded;
        }

        if (!is_array($value) || $value === []) {
            return [];
        }

        if (self::is_business_hours_interval_list($value)) {
            return self::normalize_business_hour_intervals($value);
        }

        $days = [];
        if (isset($value["days"]) && is_array($value["days"])) {
            foreach ($value["days"] as $day) {
                $mapped = self::map_day_to_number($day);
                if ($mapped !== null) {
                    $days[] = $mapped;
                }
            }
        }

        $schedule = isset($value["schedule"]) && is_array($value["schedule"])
            ? $value["schedule"]
            : [];

        $intervals = [];

        if ($schedule !== []) {
            foreach ($schedule as $entry) {
                if (!is_array($entry)) {
                    continue;
                }

                $day = self::map_day_to_number($entry["day"] ?? ($entry["day_of_week"] ?? null));
                $start = self::time_value_to_seconds($entry["start"] ?? null);
                $end = self::time_value_to_seconds($entry["end"] ?? null);

                if ($day === null || $start === null || $end === null) {
                    continue;
                }

                $intervals[] = self::make_business_hour_interval($start, $end, $day);
            }

            if ($intervals !== []) {
                return $intervals;
            }
        }

        $start = self::time_value_to_seconds($value["start"] ?? null);
        $end = self::time_value_to_seconds($value["end"] ?? null);

        if ($days !== [] && $start !== null && $end !== null) {
            foreach ($days as $day) {
                $intervals[] = self::make_business_hour_interval($start, $end, $day);
            }
        }

        return $intervals;
    }

    /**
     * @param array<int|string, mixed> $intervals
     * @return array<int, array{start: int, end: int, day_of_week: string, status: string}>
     */
    private static function normalize_business_hour_intervals(array $intervals): array
    {
        $normalized = [];

        foreach ($intervals as $interval) {
            if (!is_array($interval)) {
                continue;
            }

            $day = self::map_day_to_number($interval["day_of_week"] ?? ($interval["day"] ?? null));
            $start = self::time_value_to_seconds($interval["start"] ?? null);
            $end = self::time_value_to_seconds($interval["end"] ?? null);

            if ($day === null || $start === null || $end === null) {
                continue;
            }

            $normalized[] = self::make_business_hour_interval(
                $start,
                $end,
                $day,
                isset($interval["status"]) ? (string) $interval["status"] : "active"
            );
        }

        return $normalized;
    }

    private static function make_business_hour_interval(
        int $start,
        int $end,
        string $day_of_week,
        string $status = "active"
    ): array {
        return [
            "start" => $start,
            "end" => $end,
            "day_of_week" => $day_of_week,
            "status" => $status,
        ];
    }

    private static function is_business_hours_interval_list(array $value): bool
    {
        if ($value === []) {
            return false;
        }

        if (array_key_exists("days", $value) || array_key_exists("schedule", $value)) {
            return false;
        }

        $first = reset($value);
        return is_array($first) && (isset($first["day_of_week"]) || isset($first["start"]));
    }

    private static function map_day_to_number($day): ?string
    {
        if (!is_string($day) && !is_int($day)) {
            return null;
        }

        $normalized = strtolower(trim((string) $day));
        if ($normalized === "") {
            return null;
        }

        if (ctype_digit($normalized)) {
            return $normalized;
        }

        $map = [
            "monday" => "1",
            "mon" => "1",
            "tuesday" => "2",
            "tue" => "2",
            "tues" => "2",
            "wednesday" => "3",
            "wed" => "3",
            "thursday" => "4",
            "thu" => "4",
            "thur" => "4",
            "thurs" => "4",
            "friday" => "5",
            "fri" => "5",
            "saturday" => "6",
            "sat" => "6",
            "sunday" => "7",
            "sun" => "7",
        ];

        return $map[$normalized] ?? null;
    }

    private static function time_value_to_seconds($value): ?int
    {
        if ($value === null || $value === "") {
            return null;
        }

        if (is_int($value) || (is_string($value) && ctype_digit(trim($value)))) {
            return (int) $value;
        }

        if (!is_string($value)) {
            return null;
        }

        if (!preg_match("/^(\d{1,2}):(\d{2})$/", trim($value), $matches)) {
            return null;
        }

        return ((int) $matches[1]) * 3600 + ((int) $matches[2]) * 60;
    }

    /**
     * @param array<string, mixed> $action
     * @param array<string, mixed> $fields
     */
    private static function merge_link_metadata_into_fields(
        array $action,
        array $fields,
        string $table
    ): array {
        $service_ref = isset($action["service_id"])
            ? trim((string) $action["service_id"])
            : "";
        $unit_ref = isset($action["unit_id"]) ? trim((string) $action["unit_id"]) : "";

        if ($service_ref !== "") {
            $hourly_field = self::CHILD_LINK_FIELDS[$table]["hourly"] ?? null;
            if ($hourly_field !== null) {
                $fields = self::append_ref_to_field($fields, $hourly_field, $service_ref, true);
            }

            if ($table === "wbk_units") {
                $fields["service_id"] = $service_ref;
            }
        }

        if ($unit_ref !== "") {
            $daily_field = self::CHILD_LINK_FIELDS[$table]["daily"] ?? null;
            if ($daily_field !== null) {
                $fields = self::append_ref_to_field($fields, $daily_field, $unit_ref, true);
            }
        }

        return $fields;
    }

    /**
     * @param array<string, mixed> $fields
     */
    private static function append_ref_to_field(
        array $fields,
        string $field_name,
        string $ref,
        bool $multiple
    ): array {
        if (!$multiple) {
            if (!isset($fields[$field_name]) || $fields[$field_name] === "" || $fields[$field_name] === null) {
                $fields[$field_name] = $ref;
            }
            return $fields;
        }

        $existing = $fields[$field_name] ?? [];
        $refs = is_array($existing)
            ? array_map("strval", $existing)
            : ($existing !== null && $existing !== "" ? [(string) $existing] : []);

        if (!in_array($ref, $refs, true)) {
            $refs[] = $ref;
        }

        $fields[$field_name] = $refs;
        return $fields;
    }

    /**
     * @param array<string, mixed> $fields
     * @param array<string, int> $ref_map
     * @param array<string, true> $expected_refs
     * @return array<string, mixed>
     */
    private static function resolve_refs_in_fields(
        array $fields,
        array $ref_map,
        array $expected_refs
    ): array {
        $resolved = [];

        foreach ($fields as $key => $value) {
            $resolved[$key] = self::resolve_ref_value($value, $ref_map, $expected_refs);
        }

        return $resolved;
    }

    /**
     * @param array<string, int> $ref_map
     * @param array<string, true> $expected_refs
     */
    private static function resolve_ref_value(
        $value,
        array $ref_map,
        array $expected_refs
    ) {
        if (is_array($value)) {
            if (!self::is_list_array($value)) {
                $resolved = [];
                foreach ($value as $key => $item) {
                    $resolved[$key] = self::resolve_ref_value($item, $ref_map, $expected_refs);
                }

                return $resolved;
            }

            $resolved = [];
            foreach ($value as $item) {
                $resolved[] = self::resolve_ref_value($item, $ref_map, $expected_refs);
            }
            return $resolved;
        }

        if (!is_string($value)) {
            return $value;
        }

        $trimmed = trim($value);
        if ($trimmed === "") {
            return $value;
        }

        if (isset($ref_map[$trimmed])) {
            return $ref_map[$trimmed];
        }

        if (isset($expected_refs[$trimmed])) {
            return $trimmed;
        }

        return $value;
    }

    /**
     * @param array<string, mixed> $fields
     * @param array<string, int> $ref_map
     * @param array<string, true> $expected_refs
     */
    private static function contains_unresolved_refs(
        array $fields,
        array $ref_map,
        array $expected_refs
    ): bool {
        foreach ($fields as $value) {
            if (self::value_has_unresolved_ref($value, $ref_map, $expected_refs)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param array<string, int> $ref_map
     * @param array<string, true> $expected_refs
     */
    private static function value_has_unresolved_ref(
        $value,
        array $ref_map,
        array $expected_refs
    ): bool {
        if (is_array($value)) {
            foreach ($value as $item) {
                if (self::value_has_unresolved_ref($item, $ref_map, $expected_refs)) {
                    return true;
                }
            }

            return false;
        }

        if (!is_string($value)) {
            return false;
        }

        $trimmed = trim($value);
        return $trimmed !== "" && isset($expected_refs[$trimmed]) && !isset($ref_map[$trimmed]);
    }

    /**
     * @param array<int|string, mixed> $value
     */
    private static function is_list_array(array $value): bool
    {
        if ($value === []) {
            return true;
        }

        return array_keys($value) === range(0, count($value) - 1);
    }

    private static function get_model(string $table)
    {
        global $wpdb;
        $db_prefix = get_option("wbk_db_prefix", $wpdb->prefix);
        $model_key = $db_prefix . $table;

        return WbkData()->models->get_element_at($model_key);
    }

    /**
     * @return array<string, true>
     */
    private static function get_allowed_option_slugs(): array
    {
        return array_fill_keys(array_keys(self::get_option_labels()), true);
    }

    private static function is_pro_user(): bool
    {
        if (defined("WBK_IS_FREE")) {
            return false;
        }

        if (!function_exists("wbk_fs")) {
            return false;
        }

        $fs = wbk_fs();
        if (!is_object($fs) || !method_exists($fs, "is_free_plan")) {
            return false;
        }

        return !$fs->is_free_plan();
    }

    private static function is_free_plan_user(): bool
    {
        return !self::is_pro_user();
    }

    /**
     * @param array<int, array<string, mixed>> $actions
     * @param string[] $pro_skipped_messages
     */
    private static function collect_pro_skipped_from_actions(
        array $actions,
        array &$pro_skipped_messages
    ): void {
        if (!self::is_free_plan_user()) {
            return;
        }

        foreach ($actions as $action) {
            if (!is_array($action)) {
                continue;
            }

            $type = isset($action["action"]) ? (string) $action["action"] : "";

            if ($type === "set_option") {
                $slug = isset($action["slug"]) ? trim((string) $action["slug"]) : "";
                if ($slug === "" || !self::is_pro_only_option($slug)) {
                    continue;
                }

                $option_labels = self::get_option_labels();
                $label = $option_labels[$slug] ?? $slug;
                self::append_pro_skipped_message(
                    $pro_skipped_messages,
                    self::format_pro_skipped_setting_message($label)
                );
                continue;
            }

            if ($type !== "create_entity" && $type !== "update_entity") {
                continue;
            }

            $table = isset($action["table"]) ? trim((string) $action["table"]) : "";
            $fields = isset($action["fields"]) && is_array($action["fields"])
                ? $action["fields"]
                : [];

            if ($table === "" || $fields === []) {
                continue;
            }

            $model = self::get_model($table);
            if ($model === false) {
                continue;
            }

            $maps = self::get_model_field_maps($model);

            foreach ($fields as $key => $value) {
                $field = self::resolve_model_field($maps, (string) $key);
                if ($field === null || !self::is_pro_only_model_field($field)) {
                    continue;
                }

                $label = method_exists($field, "get_title")
                    ? (string) $field->get_title()
                    : (string) $key;
                self::append_pro_skipped_message(
                    $pro_skipped_messages,
                    self::format_pro_skipped_field_message($label)
                );
            }
        }
    }

    /**
     * @param string[] $messages
     */
    private static function append_pro_skipped_message(
        array &$messages,
        string $message
    ): void {
        if ($message === "" || in_array($message, $messages, true)) {
            return;
        }

        $messages[] = $message;
    }

    /**
     * @param string[] $lines
     * @return string[]
     */
    private static function unique_assistance_summary_lines(array $lines): array
    {
        $unique = [];

        foreach ($lines as $line) {
            if (!is_string($line) || $line === "") {
                continue;
            }

            if (!in_array($line, $unique, true)) {
                $unique[] = $line;
            }
        }

        return $unique;
    }

    private static function is_pro_only_model_field($field): bool
    {
        $extra = method_exists($field, "get_extra_data") ? $field->get_extra_data() : [];
        if (!is_array($extra)) {
            return false;
        }

        if (!empty($extra["pro_version"])) {
            return true;
        }

        return !empty($extra["required_plan"]);
    }

    private static function is_pro_only_option(string $slug): bool
    {
        $args = self::get_option_field_args();
        $field_args = $args[$slug] ?? [];

        return is_array($field_args) && !empty($field_args["required_plan"]);
    }

    /**
     * @return array{by_name: array<string, object>, by_slug: array<string, object>}
     */
    private static function get_model_field_maps($model): array
    {
        $empty = [
            "by_name" => [],
            "by_slug" => [],
        ];

        if (
            $model === false ||
            !is_object($model) ||
            !isset($model->fields) ||
            !is_object($model->fields) ||
            !method_exists($model->fields, "get_elements")
        ) {
            return $empty;
        }

        try {
            $model_fields = $model->fields->get_elements();
        } catch (\Throwable $throwable) {
            self::debug_log("get_model_field_maps failed", [
                "message" => $throwable->getMessage(),
            ]);

            return $empty;
        }

        if (!is_array($model_fields)) {
            return $empty;
        }

        $by_name = [];
        $by_slug = [];

        foreach ($model_fields as $slug => $field) {
            if (!is_object($field) || !method_exists($field, "get_name")) {
                continue;
            }

            $name = (string) $field->get_name();
            $slug_key = is_string($slug) || is_int($slug) ? (string) $slug : $name;
            $by_name[$name] = $field;
            $by_slug[$slug_key] = $field;
        }

        return [
            "by_name" => $by_name,
            "by_slug" => $by_slug,
        ];
    }

    /**
     * @param array{by_name: array<string, object>, by_slug: array<string, object>} $maps
     */
    private static function resolve_model_field(array $maps, string $key)
    {
        return $maps["by_slug"][$key] ?? $maps["by_name"][$key] ?? null;
    }

    /**
     * @param array<string, mixed> $fields
     * @return array<string, mixed>
     */
    private static function fill_missing_pro_field_defaults(array $fields, $model): array
    {
        if (self::is_pro_user()) {
            return $fields;
        }

        foreach (self::get_model_field_maps($model)["by_name"] as $name => $field) {
            if (!self::is_pro_only_model_field($field) || array_key_exists($name, $fields)) {
                continue;
            }

            $default_value = method_exists($field, "get_default_value")
                ? $field->get_default_value()
                : null;
            $field_type = method_exists($field, "get_type") ? (string) $field->get_type() : "";

            if ($field_type === "checkbox") {
                $fields[$name] = self::normalize_checkbox_value($default_value);
                continue;
            }

            if (!self::is_missing_field_value($default_value)) {
                $fields[$name] = $default_value;
                continue;
            }

            if (method_exists($field, "get_required") && $field->get_required()) {
                $fields[$name] = in_array($field_type, ["text", "duration", "limitation"], true)
                    ? "0"
                    : "";
            }
        }

        return $fields;
    }

    /**
     * @return array<int, mixed>
     */
    private static function filter_pro_only_invalid_fields($invalid, $model): array
    {
        if (!is_array($invalid) || self::is_pro_user()) {
            return is_array($invalid) ? $invalid : [];
        }

        $maps = self::get_model_field_maps($model);
        $filtered = [];

        foreach ($invalid as $entry) {
            if (!is_array($entry)) {
                $filtered[] = $entry;
                continue;
            }

            $slug = isset($entry[0]) ? (string) $entry[0] : "";
            $field = self::resolve_model_field($maps, $slug);

            if ($field !== null && self::is_pro_only_model_field($field)) {
                continue;
            }

            $filtered[] = $entry;
        }

        return $filtered;
    }

    /**
     * @param array<string, mixed> $fields
     * @param string[] $pro_skipped_messages
     * @return array{fields: array<string, mixed>, skipped: array<int, array{key: string, label: string}>}
     */
    private static function prepare_entity_fields_for_plan(
        array $fields,
        $model,
        array &$pro_skipped_messages,
        bool $fill_pro_defaults = false
    ): array {
        if (self::is_pro_user()) {
            return [
                "fields" => $fields,
                "skipped" => [],
            ];
        }

        $maps = self::get_model_field_maps($model);
        $resolved_input = [];

        foreach ($fields as $key => $value) {
            $field = self::resolve_model_field($maps, (string) $key);
            $canonical_key = $field !== null
                ? (string) $field->get_name()
                : (string) $key;
            $resolved_input[$canonical_key] = $value;
        }

        $filtered = [];
        $skipped = [];

        foreach ($resolved_input as $key => $value) {
            $field = $maps["by_name"][$key] ?? null;
            if ($field !== null && self::is_pro_only_model_field($field)) {
                $label = method_exists($field, "get_title")
                    ? (string) $field->get_title()
                    : (string) $key;
                $skipped[] = [
                    "key" => (string) $key,
                    "label" => $label,
                ];
                self::append_pro_skipped_message(
                    $pro_skipped_messages,
                    self::format_pro_skipped_field_message($label)
                );
                continue;
            }

            $filtered[$key] = $value;
        }

        if ($fill_pro_defaults) {
            $filtered = self::fill_missing_pro_field_defaults($filtered, $model);
        }

        return [
            "fields" => $filtered,
            "skipped" => $skipped,
        ];
    }

    private static function format_pro_skipped_field_message(string $label): string
    {
        $label = wp_strip_all_tags($label);

        return $label .
            " " .
            __(
                "was not applied because it is available in the Pro version.",
                "webba-booking-lite"
            );
    }

    private static function format_pro_skipped_setting_message(string $label): string
    {
        $label = wp_strip_all_tags($label);

        return __("Setting", "webba-booking-lite") .
            ' "' .
            $label .
            '" ' .
            __(
                "was not applied because it is available in the Pro version.",
                "webba-booking-lite"
            );
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    private static function get_option_field_args(): array
    {
        static $cached_args = null;

        if (is_array($cached_args)) {
            return $cached_args;
        }

        self::get_option_labels();

        global $wp_settings_fields;
        $args_map = [];

        if (
            isset($wp_settings_fields["wbk-options"]) &&
            is_array($wp_settings_fields["wbk-options"])
        ) {
            foreach ($wp_settings_fields["wbk-options"] as $section_fields) {
                if (!is_array($section_fields)) {
                    continue;
                }

                foreach ($section_fields as $field) {
                    if (!is_array($field)) {
                        continue;
                    }

                    $slug = isset($field["id"]) ? (string) $field["id"] : "";
                    if ($slug === "") {
                        continue;
                    }

                    $args_map[$slug] = isset($field["args"]) && is_array($field["args"])
                        ? $field["args"]
                        : [];
                }
            }
        }

        $cached_args = $args_map;

        return $cached_args;
    }

    /**
     * @return array<string, string>
     */
    private static function get_option_labels(): array
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
                self::debug_log("get_option_labels initSettings failed", [
                    "message" => $throwable->getMessage(),
                    "file" => $throwable->getFile(),
                    "line" => $throwable->getLine(),
                ]);

                return [];
            }
        }

        $labels = [];
        if (!isset($wp_settings_fields["wbk-options"]) || !is_array($wp_settings_fields["wbk-options"])) {
            return $labels;
        }

        foreach ($wp_settings_fields["wbk-options"] as $section_fields) {
            if (!is_array($section_fields)) {
                continue;
            }

            foreach ($section_fields as $field) {
                if (!is_array($field)) {
                    continue;
                }

                $slug = isset($field["id"]) ? (string) $field["id"] : "";
                if ($slug === "") {
                    continue;
                }

                $title = isset($field["title"]) ? (string) $field["title"] : "";
                $labels[$slug] = $title !== ""
                    ? wp_strip_all_tags($title)
                    : $slug;
            }
        }

        return $labels;
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

    /**
     * Build a translatable message without sprintf (broken .mo files can strip $s/$d).
     *
     * @param array<string, scalar|null> $values
     */
    private static function translate_with_placeholders(
        string $template,
        array $values = []
    ): string {
        $message = __($template, "webba-booking-lite");

        foreach ($values as $key => $value) {
            $message = str_replace(
                "{" . $key . "}",
                (string) $value,
                $message
            );
        }

        return $message;
    }

    /**
     * @param array<string, mixed> $extra
     * @return array<string, mixed>
     */
    private static function result_entry(
        string $action,
        bool $success,
        string $message,
        array $extra = []
    ): array {
        return array_merge(
            [
                "action" => $action,
                "success" => $success,
                "message" => $message,
            ],
            $extra
        );
    }

    private static function debug_log(string $message, $context = null): void
    {
        if ($context === null) {
            error_log(self::LOG_PREFIX . " " . $message);
            return;
        }

        $encoded = wp_json_encode($context);
        if (!is_string($encoded)) {
            $encoded = print_r($context, true);
        }

        error_log(self::LOG_PREFIX . " " . $message . " " . $encoded);
    }

    /**
     * @param array<string, mixed> $fields
     * @return array<string, mixed>
     */
    private static function summarize_fields_for_log(array $fields): array
    {
        $summary = [];

        foreach ($fields as $key => $value) {
            if (is_array($value)) {
                $summary[$key] = array_slice($value, 0, 5);
                continue;
            }

            if (is_string($value) && strlen($value) > 200) {
                $summary[$key] = substr($value, 0, 200) . "…";
                continue;
            }

            $summary[$key] = $value;
        }

        return $summary;
    }

    private static function summarize_add_item_result_for_log($result)
    {
        if (!is_array($result)) {
            return $result;
        }

        $summary = $result;
        if (isset($summary[1]) && is_array($summary[1])) {
            $summary[1] = array_slice($summary[1], 0, 10);
        }

        return $summary;
    }
}
