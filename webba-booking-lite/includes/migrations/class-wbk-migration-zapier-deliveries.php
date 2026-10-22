<?php
if (!defined("ABSPATH")) {
    exit();
}

/**
 * Migration: create wbk_zapier_deliveries table for outbound Zapier webhooks.
 */
class WBK_Migration_Zapier_Deliveries
{
    public static function run(): void
    {
        global $wpdb;

        $table = get_option("wbk_db_prefix", $wpdb->prefix) . "wbk_zapier_deliveries";
        $charset_collate = $wpdb->get_charset_collate();

        $sql =
            "CREATE TABLE IF NOT EXISTS {$table} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            event_id varchar(64) NOT NULL DEFAULT '',
            event_type varchar(64) NOT NULL DEFAULT '',
            booking_id bigint(20) unsigned NOT NULL DEFAULT 0,
            webhook_url_hash varchar(64) NOT NULL DEFAULT '',
            payload longtext NOT NULL,
            status varchar(20) NOT NULL DEFAULT 'pending',
            attempts int unsigned NOT NULL DEFAULT 0,
            max_attempts int unsigned NOT NULL DEFAULT 5,
            next_attempt_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            locked_until datetime NULL,
            last_http_code smallint NULL,
            last_error varchar(255) NULL,
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            delivered_at datetime NULL,
            PRIMARY KEY (id),
            UNIQUE KEY idx_event_id (event_id),
            KEY idx_status_next (status, next_attempt_at),
            KEY idx_locked_until (locked_until),
            KEY idx_created_at (created_at)
        ) {$charset_collate};";

        require_once ABSPATH . "wp-admin/includes/upgrade.php";
        dbDelta($sql);
    }
}
