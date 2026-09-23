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
        "whatsapp_graph_version" => "v22.0",
        "whatsapp_template_language" => "en_US",
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
        $stored = get_option(self::OPTION_KEY, false);
        if (
            $stored === false ||
            (is_array($stored) && !isset($stored["whatsapp_graph_version"]))
        ) {
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

        if (isset($data["whatsapp_graph_version"])) {
            $graph_version = self::normalize_graph_version(
                (string) $data["whatsapp_graph_version"]
            );
            if ($graph_version !== "") {
                $config["whatsapp_graph_version"] = $graph_version;
            }
        }

        if (isset($data["whatsapp_template_language"])) {
            $language = self::normalize_template_language(
                (string) $data["whatsapp_template_language"]
            );
            if ($language !== "") {
                $config["whatsapp_template_language"] = $language;
            }
        }

        return $config;
    }

    /**
     * Returns the WhatsApp Graph API version from Connect.
     *
     * @return string
     */
    public static function get_whatsapp_graph_version(): string
    {
        $config = self::get_config();
        $version = isset($config["whatsapp_graph_version"])
            ? trim((string) $config["whatsapp_graph_version"])
            : "";

        return $version !== "" ? $version : "v22.0";
    }

    /**
     * Returns the WhatsApp template language fallback from Connect.
     *
     * @return string
     */
    public static function get_whatsapp_template_language(): string
    {
        $config = self::get_config();
        $language = isset($config["whatsapp_template_language"])
            ? trim((string) $config["whatsapp_template_language"])
            : "";

        return $language !== "" ? $language : "en_US";
    }

    /**
     * Normalizes a Graph API version string.
     *
     * @param string $value Raw version value.
     * @return string
     */
    private static function normalize_graph_version(string $value): string
    {
        $value = trim($value);
        if (!preg_match('/^v?(\d+(?:\.\d+)?)$/i', $value, $matches)) {
            return "";
        }

        return "v" . $matches[1];
    }

    /**
     * Normalizes a WhatsApp template language code.
     *
     * @param string $value Raw language value.
     * @return string
     */
    private static function normalize_template_language(string $value): string
    {
        $value = trim($value);
        if (!preg_match('/^[a-z]{2}(?:_[A-Z]{2})?$/', $value)) {
            return "";
        }

        return $value;
    }
}
