<?php
if (!defined("ABSPATH")) {
    exit();
}

/**
 * Local persistence for async AI assistance tasks.
 */
class WBK_Ai_Tasks
{
    private static function table_name(): string
    {
        global $wpdb;

        return get_option("wbk_db_prefix", $wpdb->prefix) . "wbk_ai_tasks";
    }

    /**
     * @return array<string, mixed>|null
     */
    public static function create(
        string $request_text = "",
        string $session_id = ""
    ): ?array {
        global $wpdb;

        self::ensure_table();

        $now = current_time("mysql");
        $inserted = $wpdb->insert(
            self::table_name(),
            [
                "remote_task_id" => "",
                "status" => "pending",
                "session_id" => $session_id,
                "request_text" => $request_text,
                "created_at" => $now,
                "updated_at" => $now,
            ],
            ["%s", "%s", "%s", "%s", "%s", "%s"],
        );

        if (!$inserted) {
            return null;
        }

        return self::get_by_id((int) $wpdb->insert_id);
    }

    /**
     * @return array<string, mixed>|null
     */
    public static function get_by_id(int $id): ?array
    {
        global $wpdb;

        self::ensure_table();

        $row = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM " . self::table_name() . " WHERE id = %d",
                $id,
            ),
            ARRAY_A,
        );

        return is_array($row) ? $row : null;
    }

    /**
     * @return array<string, mixed>|null
     */
    public static function get_by_remote_task_id(string $remote_task_id): ?array
    {
        global $wpdb;

        self::ensure_table();

        $remote_task_id = trim($remote_task_id);
        if ($remote_task_id === "") {
            return null;
        }

        $row = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM " .
                    self::table_name() .
                    " WHERE remote_task_id = %s LIMIT 1",
                $remote_task_id,
            ),
            ARRAY_A,
        );

        return is_array($row) ? $row : null;
    }

    public static function mark_processing(int $id, string $remote_task_id): bool
    {
        return self::update(
            $id,
            [
                "remote_task_id" => $remote_task_id,
                "status" => "processing",
            ],
        );
    }

    /**
     * @param array<string, mixed> $result
     */
    public static function mark_completed(int $id, array $result): bool
    {
        $now = current_time("mysql");

        return self::update($id, [
            "status" => "completed",
            "result" => wp_json_encode($result),
            "error_message" => null,
            "completed_at" => $now,
        ]);
    }

    public static function mark_failed(int $id, string $error_message): bool
    {
        $now = current_time("mysql");

        return self::update($id, [
            "status" => "failed",
            "error_message" => $error_message,
            "completed_at" => $now,
        ]);
    }

    /**
     * @param array<string, mixed|null> $fields
     */
    private static function update(int $id, array $fields): bool
    {
        global $wpdb;

        self::ensure_table();

        $fields["updated_at"] = current_time("mysql");

        $updated = $wpdb->update(
            self::table_name(),
            $fields,
            ["id" => $id],
            null,
            ["%d"],
        );

        return $updated !== false;
    }

    private static function ensure_table(): void
    {
        static $ready = false;

        if ($ready) {
            return;
        }

        if (!class_exists("WBK_Migration_Ai_Tasks")) {
            require_once WP_WEBBA_BOOKING__PLUGIN_DIR .
                "/includes/migrations/class-wbk-migration-ai-tasks.php";
        }

        WBK_Migration_Ai_Tasks::run();
        $ready = true;
    }
}
