<?php
/**
 * Remote Config Class
 *
 * Pulls configuration from the Webba Connect server and stores it locally.
 * Designed to support multiple config payloads as the product evolves.
 *
 * @package WebbaBooking
 */

if (!defined("ABSPATH")) {
    exit();
}

/**
 * Class WBK_Remote_Config
 */
class WBK_Remote_Config
{
    /**
     * WordPress option key for stored remote config.
     */
    public const OPTION_KEY = "wbk_remote_config";

    /**
     * Default config used when remote sync fails.
     *
     * @var array<string, bool|string>
     */
    private const DEFAULT_CONFIG = [
        "hide_fields" => true,
        "hide_tables" => false,
        "table_message_type" => "banner",
    ];

    /**
     * Register hooks.
     *
     * @return void
     */
    public static function init(): void
    {
        add_action("wbk_daily_event", [__CLASS__, "sync"]);
        add_action("init", [__CLASS__, "maybe_bootstrap_config"], 20);
    }

    /**
     * Fetch config on first run when no local value exists.
     *
     * @return void
     */
    public static function maybe_bootstrap_config(): void
    {
        if (get_option(self::OPTION_KEY, false) === false) {
            self::sync();
        }
    }

    /**
     * Get the stored remote config with defaults applied.
     *
     * @return array<string, bool|string>
     */
    public static function get_config(): array
    {
        $stored = get_option(self::OPTION_KEY, false);

        if (!is_array($stored)) {
            return self::DEFAULT_CONFIG;
        }

        return self::normalize_config($stored);
    }

    /**
     * Pull remote config from the central server and persist it locally.
     *
     * @return bool True when remote config was fetched and stored successfully.
     */
    public static function sync(): bool
    {
        if (!class_exists("WBK_Webba_Connect")) {
            self::store_config(self::DEFAULT_CONFIG);
            return false;
        }

        $webba_connect = new WBK_Webba_Connect();
        $response = $webba_connect->get_remote_config();

        if (!is_array($response)) {
            self::store_config(self::DEFAULT_CONFIG);
            return false;
        }

        if (isset($response["success"]) && $response["success"] === false) {
            self::store_config(self::DEFAULT_CONFIG);
            return false;
        }

        self::store_config(self::normalize_config($response));
        return true;
    }

    /**
     * Persist config in the options table.
     *
     * @param array<string, bool|string> $config
     * @return void
     */
    private static function store_config(array $config): void
    {
        update_option(self::OPTION_KEY, $config, false);
    }

    /**
     * Sanitize and merge remote config with defaults.
     *
     * @param array<string, mixed> $data
     * @return array<string, bool|string>
     */
    private static function normalize_config(array $data): array
    {
        $config = self::DEFAULT_CONFIG;

        if (array_key_exists("hide_fields", $data)) {
            $config["hide_fields"] = (bool) $data["hide_fields"];
        }

        if (array_key_exists("hide_tables", $data)) {
            $config["hide_tables"] = (bool) $data["hide_tables"];
        }

        if (isset($data["table_message_type"])) {
            $message_type = sanitize_text_field((string) $data["table_message_type"]);
            if (in_array($message_type, ["banner", "locked"], true)) {
                $config["table_message_type"] = $message_type;
            }
        }

        return $config;
    }
}
