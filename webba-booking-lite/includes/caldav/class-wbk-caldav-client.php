<?php
if (!defined("ABSPATH")) {
    exit();
}

/**
 * Low-level CalDAV/WebDAV transport using WordPress HTTP API.
 * Handles PROPFIND, REPORT, PUT, DELETE, multi-status XML, and safe redirects.
 */
class WBK_Caldav_Client
{
    const DISCOVERY_ROOT = "https://caldav.icloud.com/";

    /** @var string */
    private $username;

    /** @var string */
    private $password;

    /** @var int */
    private $timeout = 30;

    /**
     * @param string $username Apple Account email
     * @param string $password App-specific password
     */
    public function __construct($username, $password)
    {
        $this->username = (string) $username;
        $this->password = (string) $password;
    }

    /**
     * @param string $method
     * @param string $url
     * @param array  $args
     * @return array|WP_Error {code,headers,body,url}
     */
    public function request($method, $url, $args = [])
    {
        $validated = WBK_Caldav_Url_Validator::resolve_and_validate($url, self::DISCOVERY_ROOT);
        if (is_wp_error($validated)) {
            return $validated;
        }
        $url = $validated;

        $headers = isset($args["headers"]) && is_array($args["headers"]) ? $args["headers"] : [];
        $headers["Authorization"] = "Basic " . base64_encode($this->username . ":" . $this->password);
        if (!isset($headers["User-Agent"])) {
            $headers["User-Agent"] = "WebbaBooking-CalDAV/1.0";
        }

        $redirects = 0;
        $max_redirects = isset($args["max_redirects"]) ? (int) $args["max_redirects"] : 5;

        while (true) {
            $response = wp_remote_request($url, [
                "method" => strtoupper($method),
                "headers" => $headers,
                "body" => isset($args["body"]) ? $args["body"] : null,
                "timeout" => $this->timeout,
                "redirection" => 0,
                "sslverify" => true,
                "reject_unsafe_urls" => true,
            ]);

            if (is_wp_error($response)) {
                return $response;
            }

            $code = (int) wp_remote_retrieve_response_code($response);
            $resp_headers = wp_remote_retrieve_headers($response);
            $body = wp_remote_retrieve_body($response);
            $header_array = [];
            if (is_object($resp_headers) && method_exists($resp_headers, "getAll")) {
                $header_array = $resp_headers->getAll();
            } elseif (is_array($resp_headers)) {
                $header_array = $resp_headers;
            }

            if (in_array($code, [301, 302, 303, 307, 308], true) && $redirects < $max_redirects) {
                $location = $this->get_header_value($header_array, "location");
                if (empty($location)) {
                    return new WP_Error("caldav_redirect_missing", "Redirect without Location header.");
                }
                $next = WBK_Caldav_Url_Validator::resolve_and_validate($location, $url);
                if (is_wp_error($next)) {
                    return $next;
                }
                $url = $next;
                $redirects++;
                continue;
            }

            return [
                "code" => $code,
                "headers" => $header_array,
                "body" => $body,
                "url" => $url,
            ];
        }
    }

    /**
     * @param string $url
     * @param string $xml_body
     * @param string $depth
     * @return array|WP_Error
     */
    public function propfind($url, $xml_body, $depth = "0")
    {
        return $this->request("PROPFIND", $url, [
            "headers" => [
                "Depth" => (string) $depth,
                "Content-Type" => "application/xml; charset=utf-8",
                "Accept" => "application/xml, text/xml",
            ],
            "body" => $xml_body,
        ]);
    }

    /**
     * @param string $url
     * @param string $xml_body
     * @param string $depth
     * @return array|WP_Error
     */
    public function report($url, $xml_body, $depth = "1")
    {
        return $this->request("REPORT", $url, [
            "headers" => [
                "Depth" => (string) $depth,
                "Content-Type" => "application/xml; charset=utf-8",
                "Accept" => "application/xml, text/xml",
            ],
            "body" => $xml_body,
        ]);
    }

    /**
     * @param string      $url
     * @param string      $ical_body
     * @param string|null $etag If-Match value for updates; null uses If-None-Match: *
     * @return array|WP_Error
     */
    public function put_event($url, $ical_body, $etag = null)
    {
        $headers = [
            "Content-Type" => "text/calendar; charset=utf-8",
            "Accept" => "*/*",
        ];
        if ($etag === null || $etag === "") {
            $headers["If-None-Match"] = "*";
        } else {
            $headers["If-Match"] = $etag;
        }

        return $this->request("PUT", $url, [
            "headers" => $headers,
            "body" => $ical_body,
        ]);
    }

    /**
     * @param string      $url
     * @param string|null $etag
     * @return array|WP_Error
     */
    public function delete($url, $etag = null)
    {
        $headers = ["Accept" => "*/*"];
        if (!empty($etag)) {
            $headers["If-Match"] = $etag;
        }
        return $this->request("DELETE", $url, ["headers" => $headers]);
    }

    /**
     * Parse a multi-status (207) XML response into response entries.
     *
     * @param string $xml
     * @return array|WP_Error List of [href, status, props]
     */
    public function parse_multistatus($xml)
    {
        if (!is_string($xml) || $xml === "") {
            return new WP_Error("empty_xml", "Empty CalDAV XML response.");
        }

        $previous = libxml_use_internal_errors(true);
        $disable_entities = function_exists("libxml_disable_entity_loader");
        if ($disable_entities) {
            // phpcs:ignore PHPCompatibility.FunctionUse.RemovedFunctions
            $prev_entity = @libxml_disable_entity_loader(true);
        }

        $dom = new DOMDocument();
        $loaded = $dom->loadXML($xml, LIBXML_NONET | LIBXML_NOERROR | LIBXML_NOWARNING | LIBXML_NOCDATA);
        if ($disable_entities) {
            // phpcs:ignore PHPCompatibility.FunctionUse.RemovedFunctions
            @libxml_disable_entity_loader($prev_entity);
        }
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        if (!$loaded) {
            return new WP_Error("xml_parse_error", "Failed to parse CalDAV XML.");
        }

        $xpath = new DOMXPath($dom);
        $xpath->registerNamespace("d", "DAV:");
        $xpath->registerNamespace("c", "urn:ietf:params:xml:ns:caldav");
        $xpath->registerNamespace("cs", "http://calendarserver.org/ns/");
        $xpath->registerNamespace("ical", "http://apple.com/ns/ical/");

        $entries = [];
        foreach ($xpath->query("//d:response") as $response_node) {
            $href_nodes = $xpath->query("d:href", $response_node);
            $href = $href_nodes->length ? $this->decode_xml_text($href_nodes->item(0)->textContent) : "";
            $status = "";
            $status_nodes = $xpath->query(".//d:status", $response_node);
            if ($status_nodes->length) {
                $status = trim($status_nodes->item(0)->textContent);
            }

            $props = [];
            foreach ($xpath->query("d:propstat/d:prop/*", $response_node) as $prop_node) {
                $local = $prop_node->localName;
                if ($local === "resourcetype") {
                    $types = [];
                    foreach ($prop_node->childNodes as $child) {
                        if ($child->nodeType === XML_ELEMENT_NODE) {
                            $types[] = $child->localName;
                        }
                    }
                    $props["resourcetype"] = $types;
                } elseif ($local === "current-user-principal" || $local === "calendar-home-set") {
                    $inner = $xpath->query("d:href", $prop_node);
                    $props[$local] = $inner->length
                        ? $this->decode_xml_text($inner->item(0)->textContent)
                        : "";
                } elseif ($local === "calendar-data") {
                    $props["calendar-data"] = $prop_node->textContent;
                } elseif ($local === "getetag") {
                    $props["getetag"] = trim($prop_node->textContent);
                } elseif ($local === "displayname") {
                    $props["displayname"] = $this->decode_xml_text($prop_node->textContent);
                } elseif ($local === "calendar-user-address-set") {
                    $addresses = [];
                    foreach ($xpath->query("d:href", $prop_node) as $addr) {
                        $addresses[] = $this->decode_xml_text($addr->textContent);
                    }
                    $props[$local] = $addresses;
                } else {
                    $props[$local] = trim($prop_node->textContent);
                }
            }

            $entries[] = [
                "href" => $href,
                "status" => $status,
                "props" => $props,
            ];
        }

        return $entries;
    }

    /**
     * @param array  $headers
     * @param string $name
     * @return string
     */
    public function get_header_value($headers, $name)
    {
        $name_l = strtolower($name);
        foreach ($headers as $key => $value) {
            if (strtolower((string) $key) === $name_l) {
                if (is_array($value)) {
                    return (string) reset($value);
                }
                return (string) $value;
            }
        }
        return "";
    }

    /**
     * @param string $text
     * @return string
     */
    private function decode_xml_text($text)
    {
        return html_entity_decode(trim((string) $text), ENT_QUOTES | ENT_XML1, "UTF-8");
    }
}
