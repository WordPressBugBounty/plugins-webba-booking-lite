<?php
if (!defined("ABSPATH")) {
    exit();
}

/**
 * Migration: create wbk_ai_tasks table for async assistance requests.
 */
class WBK_Migration_Ai_Tasks
{
    public static function run(): void
    {
        global $wpdb;

        $table = get_option("wbk_db_prefix", $wpdb->prefix) . "wbk_ai_tasks";
        $charset_collate = $wpdb->get_charset_collate();

        $sql =
            "CREATE TABLE IF NOT EXISTS {$table} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            remote_task_id varchar(64) NOT NULL DEFAULT '',
            status varchar(20) NOT NULL DEFAULT 'pending',
            session_id varchar(128) NOT NULL DEFAULT '',
            request_text longtext NULL,
            result longtext NULL,
            error_message text NULL,
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            completed_at datetime NULL,
            PRIMARY KEY (id),
            KEY idx_remote_task_id (remote_task_id),
            KEY idx_session_id (session_id),
            KEY idx_status (status)
        ) {$charset_collate};";

        require_once ABSPATH . "wp-admin/includes/upgrade.php";
        dbDelta($sql);
    }
}
