<?php
if (!defined("ABSPATH")) {
    exit();
}

/**
 * CalDAV discovery for iCloud: principal → calendar-home-set → calendars.
 */
class WBK_Caldav_Discovery
{
    /** @var WBK_Caldav_Client */
    private $client;

    /**
     * @param WBK_Caldav_Client $client
     */
    public function __construct(WBK_Caldav_Client $client)
    {
        $this->client = $client;
    }

    /**
     * Full discovery from https://caldav.icloud.com.
     *
     * @return array|WP_Error {
     *   principal_url: string,
     *   calendar_home_set: string,
     *   calendars: array<int, array{id:string,href:string,name:string,writable:bool,readonly:bool}>
     * }
     */
    public function discover()
    {
        $principal = $this->discover_principal(WBK_Caldav_Client::DISCOVERY_ROOT);
        if (is_wp_error($principal)) {
            return $principal;
        }

        $home = $this->discover_calendar_home($principal);
        if (is_wp_error($home)) {
            return $home;
        }

        $calendars = $this->discover_calendars($home);
        if (is_wp_error($calendars)) {
            return $calendars;
        }

        return [
            "principal_url" => $principal,
            "calendar_home_set" => $home,
            "calendars" => $calendars,
        ];
    }

    /**
     * @param string $root_url
     * @return string|WP_Error Absolute principal URL
     */
    public function discover_principal($root_url)
    {
        $xml =
            '<?xml version="1.0" encoding="UTF-8"?>' .
            '<d:propfind xmlns:d="DAV:">' .
            "<d:prop><d:current-user-principal/></d:prop>" .
            "</d:propfind>";

        $response = $this->client->propfind($root_url, $xml, "0");
        if (is_wp_error($response)) {
            return $response;
        }
        if ((int) $response["code"] === 401) {
            return new WP_Error(
                "icloud_auth_failed",
                "Invalid Apple Account email or app-specific password. Reconnect required."
            );
        }
        if ((int) $response["code"] !== 207 && (int) $response["code"] !== 200) {
            return new WP_Error(
                "principal_discovery_failed",
                "Failed to discover iCloud principal.",
                ["status" => $response["code"]]
            );
        }

        $entries = $this->client->parse_multistatus($response["body"]);
        if (is_wp_error($entries)) {
            return $entries;
        }

        foreach ($entries as $entry) {
            if (!empty($entry["props"]["current-user-principal"])) {
                return WBK_Caldav_Url_Validator::resolve_and_validate(
                    $entry["props"]["current-user-principal"],
                    $response["url"]
                );
            }
        }

        return new WP_Error("principal_missing", "current-user-principal not found in response.");
    }

    /**
     * @param string $principal_url
     * @return string|WP_Error
     */
    public function discover_calendar_home($principal_url)
    {
        $xml =
            '<?xml version="1.0" encoding="UTF-8"?>' .
            '<d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">' .
            "<d:prop><c:calendar-home-set/></d:prop>" .
            "</d:propfind>";

        $response = $this->client->propfind($principal_url, $xml, "0");
        if (is_wp_error($response)) {
            return $response;
        }
        if ((int) $response["code"] === 401) {
            return new WP_Error(
                "icloud_auth_failed",
                "Invalid Apple Account email or app-specific password. Reconnect required."
            );
        }
        if ((int) $response["code"] !== 207 && (int) $response["code"] !== 200) {
            return new WP_Error(
                "calendar_home_discovery_failed",
                "Failed to discover calendar-home-set.",
                ["status" => $response["code"]]
            );
        }

        $entries = $this->client->parse_multistatus($response["body"]);
        if (is_wp_error($entries)) {
            return $entries;
        }

        foreach ($entries as $entry) {
            if (!empty($entry["props"]["calendar-home-set"])) {
                return WBK_Caldav_Url_Validator::resolve_and_validate(
                    $entry["props"]["calendar-home-set"],
                    $response["url"]
                );
            }
        }

        return new WP_Error("calendar_home_missing", "calendar-home-set not found in response.");
    }

    /**
     * @param string $calendar_home_url
     * @return array|WP_Error
     */
    public function discover_calendars($calendar_home_url)
    {
        $xml =
            '<?xml version="1.0" encoding="UTF-8"?>' .
            '<d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:ical="http://apple.com/ns/ical/">' .
            "<d:prop>" .
            "<d:displayname/>" .
            "<d:resourcetype/>" .
            "<d:current-user-privilege-set/>" .
            "<c:supported-calendar-component-set/>" .
            "<cs:getctag/>" .
            "<ical:calendar-color/>" .
            "</d:prop>" .
            "</d:propfind>";

        $response = $this->client->propfind($calendar_home_url, $xml, "1");
        if (is_wp_error($response)) {
            return $response;
        }
        if ((int) $response["code"] === 401) {
            return new WP_Error(
                "icloud_auth_failed",
                "Invalid Apple Account email or app-specific password. Reconnect required."
            );
        }
        if ((int) $response["code"] !== 207 && (int) $response["code"] !== 200) {
            return new WP_Error(
                "calendars_discovery_failed",
                "Failed to list iCloud calendars.",
                ["status" => $response["code"]]
            );
        }

        $entries = $this->client->parse_multistatus($response["body"]);
        if (is_wp_error($entries)) {
            return $entries;
        }

        $calendars = [];
        foreach ($entries as $entry) {
            $types = isset($entry["props"]["resourcetype"]) ? $entry["props"]["resourcetype"] : [];
            if (!is_array($types) || !in_array("calendar", $types, true)) {
                continue;
            }

            $href_abs = WBK_Caldav_Url_Validator::resolve_and_validate(
                $entry["href"],
                $response["url"]
            );
            if (is_wp_error($href_abs)) {
                continue;
            }

            $writable = $this->is_writable_from_props($entry["props"], $response["body"], $entry["href"]);
            $name = !empty($entry["props"]["displayname"])
                ? $entry["props"]["displayname"]
                : basename(rtrim($entry["href"], "/"));

            $calendars[] = [
                "id" => $href_abs,
                "href" => $href_abs,
                "name" => $name,
                "writable" => $writable,
                "readonly" => !$writable,
            ];
        }

        return $calendars;
    }

    /**
     * Detect write privilege from privilege-set text in the response snippet.
     *
     * @param array  $props
     * @param string $raw_xml
     * @param string $href
     * @return bool
     */
    private function is_writable_from_props($props, $raw_xml, $href)
    {
        // Prefer privilege markers in the full XML near this href.
        $escaped = preg_quote($href, "/");
        if (
            preg_match(
                "/" . $escaped . "[\\s\\S]{0,4000}<(?:d:)?privilege>[\\s\\S]{0,200}<(?:d:)?write/i",
                $raw_xml
            ) ||
            preg_match(
                "/" . $escaped . "[\\s\\S]{0,4000}<(?:d:)?write(?:-content|-properties)?/i",
                $raw_xml
            )
        ) {
            return true;
        }

        // Some iCloud calendars omit privilege-set for writable personal calendars.
        // Treat absence as writable unless explicitly marked read / no-write.
        if (
            preg_match(
                "/" . $escaped . "[\\s\\S]{0,4000}<(?:d:)?privilege>[\\s\\S]{0,200}read/i",
                $raw_xml
            ) &&
            !preg_match(
                "/" . $escaped . "[\\s\\S]{0,4000}<(?:d:)?write/i",
                $raw_xml
            )
        ) {
            // Has read privilege block but no write nearby → likely read-only shared calendar.
            if (
                preg_match(
                    "/" . $escaped . "[\\s\\S]{0,4000}current-user-privilege-set/i",
                    $raw_xml
                )
            ) {
                return false;
            }
        }

        unset($props);
        return true;
    }
}
