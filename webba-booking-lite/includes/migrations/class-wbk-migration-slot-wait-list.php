<?php
if (!defined("ABSPATH")) {
    exit();
}

/**
 * Migration: create wbk_slot_wait_list table for customer slot wait-list subscriptions.
 */
class WBK_Migration_Slot_Wait_List
{
    /**
     * Create the wait-list table if it does not exist.
     *
     * @return void
     */
    public static function run(): void
    {
        global $wpdb;

        $table = get_option("wbk_db_prefix", $wpdb->prefix) . "wbk_slot_wait_list";
        $charset_collate = $wpdb->get_charset_collate();

        $sql =
            "CREATE TABLE IF NOT EXISTS {$table} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            service_id bigint(20) unsigned NOT NULL,
            day int unsigned NOT NULL,
            time int unsigned NOT NULL,
            staff_member_id bigint(20) unsigned NOT NULL DEFAULT 0,
            email varchar(255) NOT NULL,
            name varchar(255) DEFAULT NULL,
            quantity int unsigned NOT NULL DEFAULT 1,
            token varchar(64) NOT NULL,
            status varchar(20) NOT NULL DEFAULT 'pending',
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            notified_at datetime DEFAULT NULL,
            PRIMARY KEY  (id),
            KEY service_time_status (service_id, time, status),
            KEY day_status (day, status),
            KEY email_status (email(191), status),
            KEY token (token)
        ) {$charset_collate};";

        require_once ABSPATH . "wp-admin/includes/upgrade.php";
        dbDelta($sql);
    }
}
