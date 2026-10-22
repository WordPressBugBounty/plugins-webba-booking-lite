<?php
if (!defined("ABSPATH")) {
    exit();
}

/**
 * Helpers for iCloud Calendar: event mapping, connection status, optional manual busy sync.
 * No background cron — export and busy import run on demand like Google/Outlook.
 */
class WBK_Icloud_Sync_Orchestrator
{
    const LOCK_PREFIX = "wbk_icloud_sync_lock_";
    const BUSY_OPTION_PREFIX = "wbk_icloud_busy_cache_";
    const MAP_OPTION = "wbk_icloud_event_map";
    const STATUS_OPTION_PREFIX = "wbk_icloud_conn_status_";

    /**
     * Clear any leftover cron hooks from older builds.
     *
     * @return void
     */
    public static function init()
    {
        self::clear_legacy_schedule();
    }

    /**
     * @return void
     */
    public static function clear_legacy_schedule()
    {
        wp_clear_scheduled_hook("wbk_icloud_calendar_sync");
        wp_clear_scheduled_hook("wbk_icloud_export_job");
    }

    /**
     * Manual busy sync for one connection (with lock).
     *
     * @param int $connection_id
     * @return true|WP_Error
     */
    public static function sync_connection_busy($connection_id)
    {
        $connection_id = (int) $connection_id;
        if (!self::acquire_lock($connection_id)) {
            return new WP_Error("sync_locked", "Sync already in progress for this connection.");
        }

        try {
            $processor = new WBK_Icloud_Calendar_Processor($connection_id);
            $result = $processor->sync_busy_intervals();
            if (is_wp_error($result)) {
                if ($result->get_error_code() === "icloud_auth_failed") {
                    self::set_connection_status($connection_id, [
                        "connected" => false,
                        "needs_reconnect" => true,
                        "last_error" => $result->get_error_message(),
                        "last_error_at" => time(),
                    ]);
                } else {
                    self::set_connection_status($connection_id, [
                        "last_error" => self::redact($result->get_error_message()),
                        "last_error_at" => time(),
                    ]);
                }
                return $result;
            }

            self::set_connection_status($connection_id, [
                "connected" => true,
                "needs_reconnect" => false,
                "last_success_at" => time(),
                "last_error" => "",
            ]);
            return true;
        } finally {
            self::release_lock($connection_id);
        }
    }

    /**
     * @param int $connection_id
     * @return bool
     */
    public static function acquire_lock($connection_id)
    {
        $key = self::LOCK_PREFIX . (int) $connection_id;
        if (get_transient($key)) {
            return false;
        }
        set_transient($key, 1, 4 * MINUTE_IN_SECONDS);
        return true;
    }

    /**
     * @param int $connection_id
     * @return void
     */
    public static function release_lock($connection_id)
    {
        delete_transient(self::LOCK_PREFIX . (int) $connection_id);
    }

    /**
     * @param int   $connection_id
     * @param array $intervals
     * @param int   $range_start
     * @param int   $range_end
     * @return void
     */
    public static function store_busy_cache($connection_id, $intervals, $range_start, $range_end)
    {
        update_option(
            self::BUSY_OPTION_PREFIX . (int) $connection_id,
            [
                "intervals" => array_values($intervals),
                "range_start" => (int) $range_start,
                "range_end" => (int) $range_end,
                "synced_at" => time(),
            ],
            false,
        );
    }

    /**
     * @param int $connection_id
     * @return array|null
     */
    public static function get_busy_cache($connection_id)
    {
        $cache = get_option(self::BUSY_OPTION_PREFIX . (int) $connection_id, null);
        return is_array($cache) ? $cache : null;
    }

    /**
     * @param int $connection_id
     * @return void
     */
    public static function clear_connection_data($connection_id)
    {
        $connection_id = (int) $connection_id;
        delete_option(self::BUSY_OPTION_PREFIX . $connection_id);
        delete_option(self::STATUS_OPTION_PREFIX . $connection_id);
        self::release_lock($connection_id);

        $map = get_option(self::MAP_OPTION, []);
        if (is_array($map)) {
            foreach (array_keys($map) as $key) {
                if (strpos((string) $key, $connection_id . ":") === 0) {
                    unset($map[$key]);
                }
            }
            update_option(self::MAP_OPTION, $map, false);
        }
    }

    /**
     * @param int   $connection_id
     * @param int   $booking_id
     * @param array $data
     * @return void
     */
    public static function upsert_mapping($connection_id, $booking_id, $data)
    {
        $map = get_option(self::MAP_OPTION, []);
        if (!is_array($map)) {
            $map = [];
        }
        $key = (int) $connection_id . ":" . (int) $booking_id;
        $map[$key] = array_merge(
            [
                "connection_id" => (int) $connection_id,
                "booking_id" => (int) $booking_id,
                "uid" => "",
                "href" => "",
                "etag" => "",
                "calendar_href" => "",
                "state" => "synced",
                "updated_at" => time(),
            ],
            is_array($data) ? $data : [],
        );
        $map[$key]["updated_at"] = time();
        update_option(self::MAP_OPTION, $map, false);
    }

    /**
     * @param int $connection_id
     * @param int $booking_id
     * @return array|null
     */
    public static function get_mapping($connection_id, $booking_id)
    {
        $map = get_option(self::MAP_OPTION, []);
        if (!is_array($map)) {
            return null;
        }
        $key = (int) $connection_id . ":" . (int) $booking_id;
        return isset($map[$key]) && is_array($map[$key]) ? $map[$key] : null;
    }

    /**
     * @param int $connection_id
     * @param int $booking_id
     * @return void
     */
    public static function delete_mapping($connection_id, $booking_id)
    {
        $map = get_option(self::MAP_OPTION, []);
        if (!is_array($map)) {
            return;
        }
        unset($map[(int) $connection_id . ":" . (int) $booking_id]);
        update_option(self::MAP_OPTION, $map, false);
    }

    /**
     * @param int $connection_id
     * @return string[]
     */
    public static function get_webba_uids_for_connection($connection_id)
    {
        $map = get_option(self::MAP_OPTION, []);
        if (!is_array($map)) {
            return [];
        }
        $prefix = (int) $connection_id . ":";
        $uids = [];
        foreach ($map as $key => $row) {
            if (strpos((string) $key, $prefix) !== 0) {
                continue;
            }
            if (!empty($row["uid"])) {
                $uids[] = (string) $row["uid"];
            }
        }
        return $uids;
    }

    /**
     * @param int   $connection_id
     * @param array $patch
     * @return void
     */
    public static function set_connection_status($connection_id, $patch)
    {
        $key = self::STATUS_OPTION_PREFIX . (int) $connection_id;
        $current = get_option($key, []);
        if (!is_array($current)) {
            $current = [];
        }
        update_option($key, array_merge($current, $patch), false);
    }

    /**
     * @param int $connection_id
     * @return array
     */
    public static function get_connection_status($connection_id)
    {
        $status = get_option(self::STATUS_OPTION_PREFIX . (int) $connection_id, []);
        return is_array($status) ? $status : [];
    }

    /**
     * @param string $message
     * @return string
     */
    public static function redact($message)
    {
        $message = (string) $message;
        $message = preg_replace(
            "/[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}/i",
            "[redacted-email]",
            $message,
        );
        // Only redact an attached secret value, not the phrase itself (e.g. user-facing errors).
        $message = preg_replace(
            "/app-specific password\\s*[:=]\\s*\\S+/i",
            "app-specific password [redacted]",
            $message,
        );
        $message = preg_replace("/Basic\\s+[A-Za-z0-9+\\/=]+/", "Basic [redacted]", $message);
        return $message;
    }
}
