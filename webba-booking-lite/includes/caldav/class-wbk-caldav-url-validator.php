<?php
if (!defined("ABSPATH")) {
    exit();
}

/**
 * Validates CalDAV URLs for iCloud: HTTPS only, trusted hosts, safe redirects.
 */
class WBK_Caldav_Url_Validator
{
    /**
     * Allowed host suffixes for iCloud CalDAV.
     *
     * @var string[]
     */
    private static $trusted_suffixes = [
        "caldav.icloud.com",
        "icloud.com",
        "icloud.com.cn",
    ];

    /**
     * @param string $url
     * @return bool
     */
    public static function is_trusted_url($url)
    {
        if (!is_string($url) || $url === "") {
            return false;
        }

        $parts = wp_parse_url($url);
        if (!is_array($parts)) {
            return false;
        }
        if (empty($parts["scheme"]) || strtolower($parts["scheme"]) !== "https") {
            return false;
        }
        if (empty($parts["host"])) {
            return false;
        }

        return self::is_trusted_host($parts["host"]);
    }

    /**
     * @param string $host
     * @return bool
     */
    public static function is_trusted_host($host)
    {
        $host = strtolower((string) $host);
        foreach (self::$trusted_suffixes as $suffix) {
            if ($host === $suffix || substr($host, -strlen("." . $suffix)) === "." . $suffix) {
                return true;
            }
        }
        return false;
    }

    /**
     * Resolve a possibly relative href against a base URL and validate.
     *
     * @param string $href
     * @param string $base_url
     * @return string|WP_Error Absolute trusted HTTPS URL
     */
    public static function resolve_and_validate($href, $base_url)
    {
        if (!is_string($href) || $href === "") {
            return new WP_Error("invalid_href", "Empty CalDAV href.");
        }

        if (strpos($href, "http://") === 0 || strpos($href, "https://") === 0) {
            $absolute = $href;
        } else {
            $base = wp_parse_url($base_url);
            if (!is_array($base) || empty($base["scheme"]) || empty($base["host"])) {
                return new WP_Error("invalid_base", "Invalid CalDAV base URL.");
            }
            $origin = $base["scheme"] . "://" . $base["host"];
            if (!empty($base["port"])) {
                $origin .= ":" . $base["port"];
            }
            if (strpos($href, "/") === 0) {
                $absolute = $origin . $href;
            } else {
                $base_path = isset($base["path"]) ? $base["path"] : "/";
                $dir = rtrim(preg_replace("#/[^/]*$#", "/", $base_path), "/") . "/";
                $absolute = $origin . $dir . $href;
            }
        }

        if (!self::is_trusted_url($absolute)) {
            return new WP_Error(
                "untrusted_caldav_host",
                "Refusing CalDAV URL on untrusted host.",
                ["url" => $absolute]
            );
        }

        return $absolute;
    }
}
