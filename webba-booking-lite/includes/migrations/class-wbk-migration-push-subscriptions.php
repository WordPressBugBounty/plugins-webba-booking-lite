<?php
if (!defined("ABSPATH")) {
    exit();
}

/**
 * Migration: create wbk_push_subscriptions table for administrator Web Push endpoints.
 */
class WBK_Migration_Push_Subscriptions
{
    /**
     * Create the push subscriptions table if it does not exist.
     *
     * @return void
     */
    public static function run(): void
    {
        global $wpdb;

        $table = get_option("wbk_db_prefix", $wpdb->prefix) . "wbk_push_subscriptions";
        $charset_collate = $wpdb->get_charset_collate();

        $sql =
            "CREATE TABLE IF NOT EXISTS {$table} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            endpoint varchar(500) NOT NULL,
            p256dh varchar(255) NOT NULL,
            auth varchar(255) NOT NULL,
            user_id bigint(20) unsigned NOT NULL DEFAULT 0,
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY endpoint (endpoint(191)),
            KEY user_id (user_id)
        ) {$charset_collate};";

        require_once ABSPATH . "wp-admin/includes/upgrade.php";
        dbDelta($sql);
    }
}
