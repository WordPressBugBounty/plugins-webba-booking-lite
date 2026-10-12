<?php
/**
 * Webba Connect Class
 *
 * Handles connections to the Webba backend server for various integrations
 *
 * @package WebbaBooking
 * @since 6.0.7
 */

if (!defined("ABSPATH")) {
    exit();
}

/**
 * Class WBK_Webba_Connect
 */
class WBK_Webba_Connect
{
    /**
     * Get backend server URL for server-side API calls
     * Uses WBK_CONNECT_API_URL constant if defined, otherwise defaults to production URL
     * If WordPress is running in Docker and URL contains localhost, converts to host.docker.internal
     *
     * @return string The backe nd server URL
     */
    private static function get_backend_url()
    {
        $url = "";

        // If explicitly defined, use it
        if (defined("WBK_CONNECT_API_URL")) {
            $url = WBK_CONNECT_API_URL;
        } else {
            // Default to production
            $url = "https://connect.webba-booking.com/";
        }

        // If WordPress is running in Docker and URL uses localhost, convert to host.docker.internal
        // This allows Docker containers to reach services on the host machine
        if (self::is_running_in_docker() && strpos($url, "localhost") !== false) {
            $url = str_replace("localhost", "host.docker.internal", $url);
        }

        return $url;
    }

    /**
     * Public base URL for Webba Connect API calls (no trailing slash).
     */
    public static function get_connect_api_url(): string
    {
        return rtrim(self::get_backend_url(), "/");
    }

    /**
     * Get backend server URL for browser-accessible URLs
     * Converts host.docker.internal back to localhost for browser access
     *
     * @return string The backend server URL for browser use
     */
    private static function get_backend_url_for_browser()
    {
        $url = self::get_backend_url();

        // Replace host.docker.internal with localhost for browser access
        // Browsers run on the host machine, not in Docker
        $url = str_replace("host.docker.internal", "localhost", $url);

        return $url;
    }

    /**
     * Check if WordPress is running in Docker
     *
     * @return bool True if running in Docker, false otherwise
     */
    private static function is_running_in_docker()
    {
        // Check for Docker environment indicators
        // Method 1: Check if /.dockerenv file exists
        if (file_exists("/.dockerenv")) {
            return true;
        }

        // Method 2: Check cgroup (Linux containers)
        if (file_exists("/proc/self/cgroup")) {
            $cgroup = file_get_contents("/proc/self/cgroup");
            if (strpos($cgroup, "docker") !== false || strpos($cgroup, "containerd") !== false) {
                return true;
            }
        }

        // Method 3: Check environment variable (some Docker setups set this)
        if (getenv("DOCKER_CONTAINER") === "true" || getenv("container") === "docker") {
            return true;
        }

        return false;
    }

    /**
     * Prepare authentication parameters and return ready query string
     *
     * @param string $return_path Optional return path for authorization flow
     * @param string $endpoint The API endpoint (e.g., 'google/start', 'google/get-access-token')
     * @param string $calendar_id The internal calendar ID
     * @param bool   $allow_assistance_fallback Google-only: allow free-tier Assistance install credentials
     * @return string|false The query string or false on failure
     */
    private function prepare_auth_parameters(
        $return_path = "",
        $endpoint = "",
        $calendar_id = "",
        $allow_assistance_fallback = false
    ) {
        return $this->prepare_signed_auth_parameters(
            "GET",
            $endpoint,
            $return_path,
            $calendar_id,
            $allow_assistance_fallback,
        );
    }

    /**
     * Prepare signed auth query string for Webba Connect API requests.
     *
     * @param string $method HTTP method used in the canonical string (GET or POST)
     * @param string $endpoint Endpoint path without leading slash (e.g. assistance/tasks)
     * @param string $return_path Optional return path
     * @param string $calendar_id Optional calendar id
     * @param bool   $allow_assistance_fallback Google-only: allow free-tier Assistance install credentials
     * @return string|false
     */
    private function prepare_signed_auth_parameters(
        $method = "GET",
        $endpoint = "",
        $return_path = "",
        $calendar_id = "",
        $allow_assistance_fallback = false
    ) {
        // Get site URL
        $site = get_site_url();

        // Validate site URL format
        if (!filter_var($site, FILTER_VALIDATE_URL)) {
            error_log(
                "[WBK_AUTH_DEBUG] prepare_auth_parameters failed: Invalid site URL: " . $site,
            );
            return false;
        }

        $license_id = "";
        $auth_secret = "";
        $auth_source = "freemius";

        // Prefer Freemius license when available (premium / activated).
        $fs = function_exists("wbk_fs") ? wbk_fs() : null;
        if ($fs) {
            $license = $fs->_get_license();
            if ($license && !empty($license->id) && !empty($license->secret_key)) {
                $license_id = (string) $license->id;
                $auth_secret = (string) $license->secret_key;
            }
        }

        // Google free / no Freemius license: reuse existing Assistance install credentials
        // (wbk_connect_install_id + wbk_connect_install_secret). Sent as license_id
        // so Connect token keys and query contract stay unchanged.
        // Outlook, Gmail, and Facebook must keep requiring a Freemius license.
        if ($license_id === "" || $auth_secret === "") {
            if (!$allow_assistance_fallback) {
                error_log(
                    "[WBK_AUTH_DEBUG] prepare_auth_parameters failed: No Freemius license (assistance fallback disabled for this provider)",
                );
                return false;
            }

            if (!$this->ensure_assistance_install_registered()) {
                error_log(
                    "[WBK_AUTH_DEBUG] prepare_auth_parameters failed: Assistance install registration failed",
                );
                return false;
            }

            $license_id = self::get_connect_install_id();
            $auth_secret = self::get_connect_install_secret();
            $auth_source = "assistance_install";

            if ($license_id === "" || $auth_secret === "") {
                error_log(
                    "[WBK_AUTH_DEBUG] prepare_auth_parameters failed: assistance install id/secret missing",
                );
                return false;
            }
        }

        // Generate nonce and timestamp
        $nonce = bin2hex(random_bytes(16));
        $ts = time();

        // Validate nonce format (should be 32 character hex string)
        if (!preg_match('/^[a-f0-9]{32}$/', $nonce)) {
            error_log("[WBK_AUTH_DEBUG] prepare_auth_parameters failed: Invalid nonce format");
            return false;
        }

        // Validate timestamp (should be a positive integer)
        if (!is_numeric($ts) || $ts <= 0) {
            error_log("[WBK_AUTH_DEBUG] prepare_auth_parameters failed: Invalid timestamp: " . $ts);
            return false;
        }

        // Create canonical string for HMAC
        $canonical = implode("\n", [
            strtoupper((string) $method),
            "/" . $endpoint,
            $site,
            $return_path,
            $calendar_id,
            $nonce,
            (string) $ts,
            (string) $license_id,
        ]);

        // Generate state using HMAC
        $state = $this->hmac_b64url($canonical, $auth_secret);

        // Build and return query parameters
        $query_params = [
            "site" => $site,
            "license_id" => (string) $license_id,
            "return" => $return_path,
            "calendar_id" => $calendar_id,
            "nonce" => $nonce,
            "ts" => (string) $ts,
            "v" => "1",
            "state" => $state,
        ];

        error_log(
            "[WBK_AUTH_DEBUG] prepare_auth_parameters success: endpoint=" .
                $endpoint .
                ", site=" .
                $site .
                ", license_id=" .
                $license_id .
                ", calendar_id=" .
                $calendar_id .
                ", auth_source=" .
                $auth_source,
        );

        return http_build_query($query_params);
    }

    /**
     * Stable per-site install id for Assistance API (no Freemius).
     */
    public static function get_connect_install_id(): string
    {
        $id = get_option("wbk_connect_install_id", "");
        if (!is_string($id) || $id === "") {
            if (function_exists("wp_generate_uuid4")) {
                $id = wp_generate_uuid4();
            } else {
                $id = (string) wp_hash(home_url("/") . (defined("ABSPATH") ? ABSPATH : ""));
            }
            update_option("wbk_connect_install_id", $id, true);
        }

        return $id;
    }

    /**
     * Per-site HMAC secret for Assistance API (generated locally, registered on Webba Connect).
     */
    public static function get_connect_install_secret(): string
    {
        $secret = get_option("wbk_connect_install_secret", "");
        if (!is_string($secret) || strlen($secret) < 32) {
            $secret = bin2hex(random_bytes(32));
            update_option("wbk_connect_install_secret", $secret, true);
        }

        return $secret;
    }

    /**
     * Prepare signed auth for Assistance API requests.
     *
     * Uses a stable local install id + per-site secret (wbk_connect_install_* options).
     *
     * @param string $method HTTP method used in the canonical string (GET or POST)
     * @param string $endpoint Endpoint path without leading slash (e.g. assistance/tasks)
     * @return string|false
     */
    private function prepare_assistance_auth_parameters($method = "GET", $endpoint = "")
    {
        $site_url = get_site_url();

        if (!filter_var($site_url, FILTER_VALIDATE_URL)) {
            return false;
        }

        $website_id = self::get_connect_install_id();
        if ($website_id === "") {
            return false;
        }

        $auth_secret = self::get_connect_install_secret();
        if ($auth_secret === "") {
            return false;
        }

        $nonce = bin2hex(random_bytes(16));
        $ts = time();

        if (!preg_match('/^[a-f0-9]{32}$/', $nonce)) {
            return false;
        }

        if (!is_numeric($ts) || $ts <= 0) {
            return false;
        }

        $canonical = implode("\n", [
            strtoupper((string) $method),
            "/" . $endpoint,
            $site_url,
            "",
            "",
            $nonce,
            (string) $ts,
            $website_id,
        ]);

        $state = $this->hmac_b64url($canonical, $auth_secret);

        $query_params = [
            "site" => $site_url,
            "website_id" => $website_id,
            "nonce" => $nonce,
            "ts" => (string) $ts,
            "v" => "1",
            "state" => $state,
        ];

        return http_build_query($query_params);
    }

    /**
     * Register this WordPress site's Assistance credentials on Webba Connect (one-time per install).
     */
    private function register_assistance_install(): bool
    {
        $backend_url = apply_filters("wbk_assistance_connect_api_url", self::get_connect_api_url());
        if ($backend_url && substr($backend_url, -1) !== "/") {
            $backend_url .= "/";
        }

        $website_id = self::get_connect_install_id();
        $site_url = get_site_url();
        $install_secret = self::get_connect_install_secret();

        if (
            $website_id === "" ||
            $install_secret === "" ||
            !filter_var($site_url, FILTER_VALIDATE_URL)
        ) {
            return false;
        }

        $response = wp_remote_post($backend_url . "assistance/register", [
            "timeout" => 30,
            "headers" => [
                "Content-Type" => "application/json",
            ],
            "body" => wp_json_encode([
                "website_id" => $website_id,
                "site" => $site_url,
                "install_secret" => $install_secret,
            ]),
            "sslverify" => strpos($backend_url, "https://") === 0,
        ]);

        if (is_wp_error($response)) {
            return false;
        }

        $response_code = (int) wp_remote_retrieve_response_code($response);
        return $response_code >= 200 && $response_code < 300;
    }

    /**
     * Ensure the local install is registered on Webba Connect before authenticated calls.
     */
    private function ensure_assistance_install_registered(): bool
    {
        if (get_option("wbk_connect_install_registered", "") === "1") {
            return true;
        }

        if (!$this->register_assistance_install()) {
            return false;
        }

        update_option("wbk_connect_install_registered", "1", true);
        return true;
    }

    /**
     * @param array<string, mixed>|null $payload
     * @return array<string, mixed>|false
     */
    private function execute_assistance_api_request(
        string $method,
        string $endpoint,
        string $backend_url,
        ?array $payload = null
    ) {
        $query = $this->prepare_assistance_auth_parameters($method, $endpoint);
        if (!$query) {
            return [
                "success" => false,
                "message" => __("Could not authenticate with Webba Connect.", "webba-booking-lite"),
            ];
        }

        $url = $backend_url . $endpoint . "?" . $query;
        $args = [
            "method" => strtoupper($method),
            "timeout" => 30,
            "headers" => [
                "Content-Type" => "application/json",
            ],
            "sslverify" => strpos($backend_url, "https://") === 0,
        ];

        if ($payload !== null && strtoupper($method) === "POST") {
            $args["body"] = wp_json_encode($payload);
        }

        $response = wp_remote_request($url, $args);

        if (is_wp_error($response)) {
            return [
                "success" => false,
                "message" => $response->get_error_message(),
            ];
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (!is_array($data)) {
            return [
                "success" => false,
                "message" => sprintf(
                    /* translators: 1: HTTP status code, 2: assistance API base URL */
                    __(
                        'Invalid response from Webba Connect (HTTP %1$d). Check that the server is running at %2$s.',
                        "webba-booking-lite",
                    ),
                    (int) $response_code,
                    $backend_url,
                ),
            ];
        }

        if ($response_code < 200 || $response_code >= 300) {
            $data["http_status"] = (int) $response_code;
            return $data;
        }

        return $data;
    }

    /**
     * Create Google authorization URL
     *
     * @param string $calendar_id The internal calendar ID
     * @return string|false The authorization URL or false on failure
     */
    public function get_google_authorization_url($calendar_id = "")
    {
        $return_path = "/wp-admin/admin.php?page=wbk-connected-calendars";

        error_log("[WBK_AUTH_DEBUG] get_google_authorization_url: calendar_id=" . $calendar_id);

        $query = $this->prepare_auth_parameters($return_path, "start", $calendar_id, true);
        if (!$query) {
            error_log(
                "[WBK_AUTH_DEBUG] get_google_authorization_url failed: prepare_auth_parameters returned false",
            );
            return false;
        }

        $url = self::get_backend_url_for_browser() . "google/start?" . $query;
        error_log("[WBK_AUTH_DEBUG] get_google_authorization_url success: url=" . $url);
        return $url;
    }

    /**
     * Create Google revoke authorization URL
     *
     * @param string $calendar_id The internal calendar ID
     * @return string|false The revoke URL or false on failure
     */
    public function get_google_revoke_url($calendar_id = "")
    {
        $return_path =
            "/wp-admin/admin.php?page=wbk-connected-calendars&revoke-gg-calendar=" . $calendar_id;

        // Prepare authentication parameters including HMAC validation
        $query = $this->prepare_auth_parameters($return_path, "revoke-token", $calendar_id, true);
        if (!$query) {
            return false;
        }

        // Create the revoke URL with all parameters as query parameters
        $revoke_url = self::get_backend_url_for_browser() . "google/revoke-token?" . $query;

        return $revoke_url;
    }

    /**
     * Get Google access token
     *
     * @param string $calendar_id The internal calendar ID
     * @return array|false The response array with access token or false on failure
     */
    public function fetch_access_token_from_webba_connect($calendar_id = "", $provider = "google")
    {
        $return_path =
            $provider === "gmail"
                ? "/wp-admin/admin.php?page=wbk-options"
                : "/wp-admin/admin.php?page=wbk-connected-calendars";

        error_log(
            "[WBK_AUTH_DEBUG] fetch_access_token_from_webba_connect: provider=" .
                $provider .
                ", calendar_id=" .
                $calendar_id,
        );

        // Assistance install fallback is Google-only; Gmail still requires Freemius.
        $query = $this->prepare_auth_parameters(
            $return_path,
            "get-access-token",
            $calendar_id,
            $provider === "google",
        );
        if (!$query) {
            error_log(
                "[WBK_AUTH_DEBUG] fetch_access_token failed: prepare_auth_parameters returned false",
            );
            return false;
        }

        $backend_url = self::get_backend_url();

        // Ensure backend URL ends with a slash
        if ($backend_url && substr($backend_url, -1) !== "/") {
            $backend_url .= "/";
        }

        $url = $backend_url . "$provider/get-access-token?" . $query;

        error_log("[WBK_AUTH_DEBUG] fetch_access_token requesting: " . $url);

        // Make the request
        $response = wp_remote_get($url, [
            "timeout" => 30,
            "sslverify" => strpos($backend_url, "https://") === 0,
        ]);

        if (is_wp_error($response)) {
            error_log(
                "[WBK_AUTH_DEBUG] fetch_access_token wp_remote_get error: " .
                    $response->get_error_code() .
                    " - " .
                    $response->get_error_message(),
            );
            return false;
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);

        error_log(
            "[WBK_AUTH_DEBUG] fetch_access_token response: code=" .
                $response_code .
                ", body_len=" .
                strlen($body) .
                ", body_preview=" .
                substr($body, 0, 500),
        );

        $data = json_decode($body, true);

        if (!$data) {
            error_log(
                "[WBK_AUTH_DEBUG] fetch_access_token failed: JSON decode failed or empty body",
            );
            return false;
        }

        // Check HTTP response code - non-2xx codes indicate failure
        if ($response_code < 200 || $response_code >= 300) {
            error_log(
                "[WBK_AUTH_DEBUG] fetch_access_token failed: HTTP " .
                    $response_code .
                    ", error=" .
                    (isset($data["error"]) ? $data["error"] : "no error in body"),
            );
            return false;
        }

        // Check if the response indicates an error in the JSON body
        if (isset($data["error"]) && (!isset($data["success"]) || $data["success"] !== true)) {
            error_log(
                "[WBK_AUTH_DEBUG] fetch_access_token failed: API error=" .
                    $data["error"] .
                    ", status=" .
                    (isset($data["status"]) ? $data["status"] : "n/a"),
            );
            return false;
        }

        error_log(
            "[WBK_AUTH_DEBUG] fetch_access_token success: has_access_token=" .
                (isset($data["access_token"]) ? "yes" : "no"),
        );
        return $data;
    }

    /**
     * Base64 URL encode a string
     *
     * @param string $s The string to encode
     * @return string The base64 URL encoded string
     */
    private function b64url($s)
    {
        return rtrim(strtr(base64_encode($s), "+/", "-_"), "=");
    }

    /**
     * Create HMAC and base64 URL encode it
     *
     * @param string $msg The message to hash
     * @param string $key The secret key
     * @return string The HMAC base64 URL encoded string
     */
    private function hmac_b64url($msg, $key)
    {
        return $this->b64url(hash_hmac("sha256", $msg, $key, true));
    }

    /**
     * Create Outlook authorization URL
     *
     * @param string $calendar_id The internal calendar ID
     * @return string|false The authorization URL or false on failure
     */
    public function get_outlook_authorization_url($calendar_id = "")
    {
        $return_path = "/wp-admin/admin.php?page=wbk-connected-calendars";

        error_log("[WBK_AUTH_DEBUG] get_outlook_authorization_url: calendar_id=" . $calendar_id);

        $query = $this->prepare_auth_parameters($return_path, "start", $calendar_id);
        if (!$query) {
            error_log(
                "[WBK_AUTH_DEBUG] get_outlook_authorization_url failed: prepare_auth_parameters returned false",
            );
            return false;
        }

        $url = self::get_backend_url_for_browser() . "outlook/start?" . $query;
        error_log("[WBK_AUTH_DEBUG] get_outlook_authorization_url success: url=" . $url);
        return $url;
    }

    /**
     * Create Outlook revoke authorization URL
     *
     * @param string $calendar_id The internal calendar ID
     * @return string|false The revoke URL or false on failure
     */
    public function get_outlook_revoke_url($calendar_id = "")
    {
        $return_path =
            "/wp-admin/admin.php?page=wbk-connected-calendars&revoke-outlook-calendar=" .
            $calendar_id;

        // Prepare authentication parameters including HMAC validation
        $query = $this->prepare_auth_parameters($return_path, "revoke-token", $calendar_id);
        if (!$query) {
            return false;
        }

        // Create the revoke URL with all parameters as query parameters
        $revoke_url = self::get_backend_url_for_browser() . "outlook/revoke-token?" . $query;

        return $revoke_url;
    }

    /**
     * Get Outlook access token
     *
     * @param string $calendar_id The internal calendar ID
     * @return array|false The response array with access token or false on failure
     */
    public function fetch_outlook_access_token_from_webba_connect($calendar_id = "")
    {
        $return_path = "/wp-admin/admin.php?page=wbk-connected-calendars";
        error_log("[WBK_AUTH_DEBUG] fetch_outlook_access_token: calendar_id=" . $calendar_id);

        $query = $this->prepare_auth_parameters($return_path, "get-access-token", $calendar_id);
        if (!$query) {
            error_log(
                "[WBK_AUTH_DEBUG] fetch_outlook_access_token failed: prepare_auth_parameters returned false",
            );
            return false;
        }

        $backend_url = self::get_backend_url();

        // Ensure backend URL ends with a slash
        if ($backend_url && substr($backend_url, -1) !== "/") {
            $backend_url .= "/";
        }

        $url = $backend_url . "outlook/get-access-token?" . $query;

        error_log("[WBK_AUTH_DEBUG] fetch_outlook_access_token requesting: " . $url);

        // Make the request
        $response = wp_remote_get($url, [
            "timeout" => 30,
            "sslverify" => strpos($backend_url, "https://") === 0,
        ]);

        if (is_wp_error($response)) {
            error_log(
                "[WBK_AUTH_DEBUG] fetch_outlook_access_token wp_remote_get error: " .
                    $response->get_error_code() .
                    " - " .
                    $response->get_error_message(),
            );
            return false;
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);

        error_log(
            "[WBK_AUTH_DEBUG] fetch_outlook_access_token response: code=" .
                $response_code .
                ", body_preview=" .
                substr($body, 0, 500),
        );

        $data = json_decode($body, true);

        if (!$data) {
            error_log("[WBK_AUTH_DEBUG] fetch_outlook_access_token failed: JSON decode failed");
            return false;
        }

        // Check if the response indicates an error
        if (isset($data["error"])) {
            error_log(
                "[WBK_AUTH_DEBUG] fetch_outlook_access_token API error: " .
                    $data["error"] .
                    ", status=" .
                    (isset($data["status"]) ? $data["status"] : "n/a"),
            );
            return false;
        }

        error_log(
            "[WBK_AUTH_DEBUG] fetch_outlook_access_token success: has_access_token=" .
                (isset($data["access_token"]) ? "yes" : "no"),
        );
        return $data;
    }

    /**
     * Get Outlook access token from webba connect API
     * This method only fetches from API and does not store tokens locally
     *
     * @param string $calendar_id The internal calendar ID
     * @return array|false The access token response or false on failure
     */
    public function get_outlook_access_token($calendar_id = "")
    {
        // Fetch from webba connect API only
        return $this->fetch_outlook_access_token_from_webba_connect($calendar_id);
    }

    /**
     * Check backend health by calling the /health endpoint
     *
     * @return bool|array Returns true if backend is healthy, false on failure, or array with health status details
     */
    public function check_backend_health()
    {
        $backend_url = self::get_backend_url();

        // Ensure backend URL ends with a slash
        if ($backend_url && substr($backend_url, -1) !== "/") {
            $backend_url .= "/";
        }

        $url = $backend_url . "health";

        // Make the request with a shorter timeout for health checks
        $response = wp_remote_get($url, [
            "timeout" => 10,
            "sslverify" => strpos($backend_url, "https://") === 0,
        ]);

        if (is_wp_error($response)) {
            return false;
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);

        // Health endpoint should return 200 status code
        if ($response_code !== 200) {
            return false;
        }

        // Try to decode JSON response if available
        $data = json_decode($body, true);
        if ($data !== null) {
            return $data;
        }

        // If response is not JSON but status is 200, consider it healthy
        return true;
    }

    public function get_google_access_token($calendar_id = "")
    {
        return $this->fetch_access_token_from_webba_connect($calendar_id, "google");
    }

    /**
     * Get Google Calendar authorization status and action URLs via Webba Connect.
     *
     * @param string $calendar_id Internal connected calendar ID
     * @return array{isAuthenticated: bool, internalError: bool, authUrl?: string|null, revokeUrl?: string|null, calendars?: array}
     */
    public function get_google_auth_parameters($calendar_id = "")
    {
        if ($this->check_backend_health() === false) {
            return [
                "isAuthenticated" => false,
                "internalError" => true,
            ];
        }

        $token_response = $this->get_google_access_token($calendar_id);

        if (
            $token_response === false ||
            !isset($token_response["access_token"]) ||
            empty($token_response["access_token"])
        ) {
            $auth_url = $this->get_google_authorization_url($calendar_id);

            return [
                "isAuthenticated" => false,
                "internalError" => $auth_url === false,
                "authUrl" => $auth_url !== false ? $auth_url : null,
            ];
        }

        $revoke_url = $this->get_google_revoke_url($calendar_id);
        $calendars = $this->fetch_google_calendars_list($token_response["access_token"]);

        return [
            "isAuthenticated" => true,
            "internalError" => false,
            "calendars" => is_array($calendars) ? $calendars : [],
            "revokeUrl" => $revoke_url !== false ? $revoke_url : null,
        ];
    }

    /**
     * Google calendar options for admin selects (id => name) via Webba Connect.
     *
     * @param string $calendar_id Internal connected calendar ID
     * @return array<string, string>
     */
    public function get_google_calendars_for_options($calendar_id = "")
    {
        $token_response = $this->get_google_access_token($calendar_id);
        if (
            $token_response === false ||
            !isset($token_response["access_token"]) ||
            empty($token_response["access_token"])
        ) {
            return [];
        }

        $calendars = $this->fetch_google_calendars_list($token_response["access_token"]);
        return is_array($calendars) ? $calendars : [];
    }

    /**
     * Fetch Google Calendar list for the given access token.
     *
     * @param string $access_token Google OAuth access token
     * @return array<string, string>|false Map of calendar id => summary, or false on failure
     */
    private function fetch_google_calendars_list($access_token)
    {
        $access_token = trim((string) $access_token);
        if ($access_token === "") {
            return false;
        }

        $response = wp_remote_get("https://www.googleapis.com/calendar/v3/users/me/calendarList", [
            "timeout" => 30,
            "headers" => [
                "Authorization" => "Bearer " . $access_token,
                "Content-Type" => "application/json",
            ],
        ]);

        if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
            return false;
        }

        $calendars_data = json_decode(wp_remote_retrieve_body($response), true);
        if (!is_array($calendars_data) || empty($calendars_data["items"]) || !is_array($calendars_data["items"])) {
            return [];
        }

        $calendars = [];
        $primary_summary = null;

        $primary_response = wp_remote_get("https://www.googleapis.com/calendar/v3/calendars/primary", [
            "timeout" => 30,
            "headers" => [
                "Authorization" => "Bearer " . $access_token,
                "Content-Type" => "application/json",
            ],
        ]);

        if (
            !is_wp_error($primary_response) &&
            wp_remote_retrieve_response_code($primary_response) === 200
        ) {
            $primary_data = json_decode(wp_remote_retrieve_body($primary_response), true);
            if (is_array($primary_data) && isset($primary_data["summary"])) {
                $primary_summary = $primary_data["summary"];
                $calendars["primary"] = $primary_summary;
            }
        }

        foreach ($calendars_data["items"] as $calendar) {
            if (!isset($calendar["id"], $calendar["summary"])) {
                continue;
            }
            if ($primary_summary !== null && $calendar["summary"] === $primary_summary) {
                continue;
            }
            $calendars[$calendar["id"]] = $calendar["summary"];
        }

        return $calendars;
    }

    /**
    /**
     * Create Gmail authorization URL (tokens stored on Webba Connect).
     *
     * Connect endpoints are prepared here; backend routes will be added later.
     *
     * @param string $resource_id Site-level Gmail resource id (default: gmail)
     * @return string|false The authorization URL or false on failure
     */
    public function get_gmail_authorization_url($resource_id = "gmail")
    {
        $return_path = "/wp-admin/admin.php?page=wbk-options";

        $query = $this->prepare_auth_parameters($return_path, "start", $resource_id);

        if (!$query) {
            return false;
        }

        return self::get_backend_url_for_browser() . "gmail/start?" . $query;
    }

    /**
    /**
     * Create Gmail revoke authorization URL.
     *
     * @param string $resource_id Site-level Gmail resource id (default: gmail)
     * @return string|false The revoke URL or false on failure
     */
    public function get_gmail_revoke_url($resource_id = "gmail")
    {
        $return_path =
            "/wp-admin/admin.php?page=wbk-options&revoke-gmail=" . rawurlencode($resource_id);

        $query = $this->prepare_auth_parameters($return_path, "revoke-token", $resource_id);

        if (!$query) {
            return false;
        }

        return self::get_backend_url_for_browser() . "gmail/revoke-token?" . $query;
    }

    /**
    /**
     * Get Gmail access token from Webba Connect
     *
     * @return array|false The access token response or false on failure
     */
    public function get_gmail_access_token()
    {
        return $this->fetch_access_token_from_webba_connect("", "gmail");
    }

    /**
     * Get Gmail authorization status and action URLs for the options UI
     *
     * @return array{isAuthenticated: bool, internalError: bool, authUrl?: string|null, revokeUrl?: string|null}
     */
    public function get_gmail_auth_parameters()
    {
        if ($this->check_backend_health() === false) {
            return [
                "isAuthenticated" => false,
                "internalError" => true,
            ];
        }

        $token_response = $this->get_gmail_access_token();

        if (
            $token_response === false ||
            !isset($token_response["access_token"]) ||
            empty($token_response["access_token"])
        ) {
            $auth_url = $this->get_gmail_authorization_url();

            return [
                "isAuthenticated" => false,
                "internalError" => $auth_url === false,
                "authUrl" => $auth_url !== false ? $auth_url : null,
            ];
        }

        $revoke_url = $this->get_gmail_revoke_url();

        return [
            "isAuthenticated" => true,
            "internalError" => false,
            "revokeUrl" => $revoke_url !== false ? $revoke_url : null,
        ];
    }

    /**
     * Create Facebook / WhatsApp authorization URL.
     *
     * @param string $resource_id Site-level Facebook resource id.
     * @return string|false
     */
    public function get_facebook_authorization_url($resource_id = "whatsapp")
    {
        $return_path = "/wp-admin/admin.php?page=wbk-options";

        $query = $this->prepare_auth_parameters($return_path, "start", $resource_id);
        if (!$query) {
            return false;
        }

        return self::get_backend_url_for_browser() . "facebook/start?" . $query;
    }

    /**
     * Fetches a Facebook / WhatsApp access token from Connect (Google-style restore).
     *
     * @param string $resource_id Site-level Facebook resource id.
     * @return array|false
     */
    public function fetch_facebook_access_token_from_webba_connect($resource_id = "whatsapp")
    {
        $data = $this->fetch_access_token_from_webba_connect($resource_id, "facebook");
        if (!$data || empty($data["access_token"])) {
            return false;
        }

        $this->apply_facebook_token_response_to_local_cache($data);

        return $data;
    }

    /**
     * Returns whether Connect currently has Facebook / WhatsApp tokens for this site.
     *
     * @param string $resource_id Site-level Facebook resource id.
     * @return bool
     */
    public function has_facebook_access_token_on_webba_connect($resource_id = "whatsapp")
    {
        $data = $this->fetch_access_token_from_webba_connect($resource_id, "facebook");
        return is_array($data) && !empty($data["access_token"]);
    }

    /**
     * Caches Connect Facebook token metadata in site options (short-lived local mirror).
     *
     * @param array $data Connect get-access-token response.
     * @return void
     */
    public function apply_facebook_token_response_to_local_cache($data)
    {
        if (!is_array($data) || empty($data["access_token"])) {
            return;
        }

        $this->save_local_facebook_access_token(
            (string) $data["access_token"],
            isset($data["expiry_date"]) ? $data["expiry_date"] : null,
        );

        if (isset($data["waba_ids"]) && is_array($data["waba_ids"])) {
            $saved_waba_ids = $this->save_discovered_waba_ids($data["waba_ids"]);
            if (
                !empty($saved_waba_ids) &&
                trim((string) get_option("wbk_whatsapp_business_account_id", "")) === ""
            ) {
                update_option(
                    "wbk_whatsapp_business_account_id",
                    sanitize_text_field((string) $saved_waba_ids[0]),
                );
            }
        }

        if (!empty($data["phone_number_id"])) {
            update_option(
                "wbk_whatsapp_phone_number_id",
                sanitize_text_field((string) $data["phone_number_id"]),
            );
        }
    }

    /**
     * Create Facebook / WhatsApp revoke URL.
     *
     * @param string $resource_id Site-level Facebook resource id.
     * @return string|false
     */
    public function get_facebook_revoke_url($resource_id = "whatsapp")
    {
        $return_path =
            "/wp-admin/admin.php?page=wbk-options&revoke-whatsapp=" . rawurlencode($resource_id);

        $query = $this->prepare_auth_parameters($return_path, "revoke-token", $resource_id);
        if (!$query) {
            return false;
        }

        $url = self::get_backend_url_for_browser() . "facebook/revoke-token?" . $query;
        $token = trim((string) get_option("wbk_whatsapp_access_token", ""));
        if ($token !== "") {
            $url .= "&current_token=" . rawurlencode($token);
        }

        return $url;
    }

    /**
     * Decrypts the Facebook token payload from Connect and stores it in wp_options.
     *
     * @param string $payload Encrypted callback payload from Connect.
     * @return bool
     */
    public function store_facebook_token_from_callback($payload)
    {
        $payload = is_string($payload) ? trim($payload) : "";
        if ($payload === "") {
            return false;
        }

        $license_secret = $this->get_freemius_license_secret();
        if (!$license_secret) {
            return false;
        }

        $raw = $this->b64url_decode($payload);
        if (!is_string($raw) || strlen($raw) < 28) {
            return false;
        }

        $iv = substr($raw, 0, 12);
        $tag = substr($raw, 12, 16);
        $ciphertext = substr($raw, 28);
        $key = hash("sha256", $license_secret, true);
        $plaintext = openssl_decrypt($ciphertext, "aes-256-gcm", $key, OPENSSL_RAW_DATA, $iv, $tag);
        if (!is_string($plaintext) || $plaintext === "") {
            return false;
        }

        $data = json_decode($plaintext, true);
        if (!is_array($data) || empty($data["access_token"])) {
            return false;
        }

        $this->save_local_facebook_access_token(
            (string) $data["access_token"],
            isset($data["expiry_date"]) ? $data["expiry_date"] : null,
        );

        if (isset($data["waba_ids"]) && is_array($data["waba_ids"])) {
            $saved_waba_ids = $this->save_discovered_waba_ids($data["waba_ids"]);
            if (
                !empty($saved_waba_ids) &&
                trim((string) get_option("wbk_whatsapp_business_account_id", "")) === ""
            ) {
                update_option(
                    "wbk_whatsapp_business_account_id",
                    sanitize_text_field((string) $saved_waba_ids[0]),
                );
            }
        }

        if (!empty($data["phone_number_id"])) {
            update_option(
                "wbk_whatsapp_phone_number_id",
                sanitize_text_field((string) $data["phone_number_id"]),
            );
        }

        return true;
    }

    /**
     * Asks Connect to inspect a Facebook token and return WABA IDs.
     * Uses the Connect-stored token when $current_token is empty.
     *
     * @param string $current_token Optional current WhatsApp / Facebook access token.
     * @return string[]
     */
    public function inspect_facebook_access_token($current_token = "")
    {
        $query = $this->prepare_auth_parameters(
            "/wp-admin/admin.php?page=wbk-options",
            "inspect-token",
            "whatsapp",
        );
        if (!$query) {
            return [];
        }

        $backend_url = self::get_backend_url();
        if ($backend_url && substr($backend_url, -1) !== "/") {
            $backend_url .= "/";
        }

        $url = $backend_url . "facebook/inspect-token?" . $query;
        $current_token = trim((string) $current_token);
        if ($current_token !== "") {
            $url .= "&current_token=" . rawurlencode($current_token);
        }

        $response = wp_remote_get($url, [
            "timeout" => 30,
            "sslverify" => strpos($backend_url, "https://") === 0,
        ]);
        if (is_wp_error($response)) {
            return [];
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $data = json_decode(wp_remote_retrieve_body($response), true);
        if ($response_code < 200 || $response_code >= 300 || !is_array($data)) {
            return [];
        }

        if (!empty($data["phone_number_id"])) {
            update_option(
                "wbk_whatsapp_phone_number_id",
                sanitize_text_field((string) $data["phone_number_id"]),
            );
        }

        if (empty($data["waba_ids"]) || !is_array($data["waba_ids"])) {
            return [];
        }

        return $this->save_discovered_waba_ids($data["waba_ids"]);
    }

    /**
     * Asks Connect to refresh the site Facebook access token stored on Connect.
     *
     * @param string $current_token Optional current token override.
     * @return bool
     */
    public function refresh_facebook_access_token($current_token = "")
    {
        $query = $this->prepare_auth_parameters(
            "/wp-admin/admin.php?page=wbk-options",
            "refresh-token",
            "whatsapp",
        );
        if (!$query) {
            return false;
        }

        $backend_url = self::get_backend_url();
        if ($backend_url && substr($backend_url, -1) !== "/") {
            $backend_url .= "/";
        }

        $url = $backend_url . "facebook/refresh-token?" . $query;
        $current_token = trim((string) $current_token);
        if ($current_token !== "") {
            $url .= "&current_token=" . rawurlencode($current_token);
        }

        $response = wp_remote_get($url, [
            "timeout" => 30,
            "sslverify" => strpos($backend_url, "https://") === 0,
        ]);
        if (is_wp_error($response)) {
            return false;
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $data = json_decode(wp_remote_retrieve_body($response), true);
        if (
            $response_code < 200 ||
            $response_code >= 300 ||
            !is_array($data) ||
            empty($data["access_token"])
        ) {
            return false;
        }

        $this->apply_facebook_token_response_to_local_cache($data);

        return true;
    }

    /**
     * Clears locally stored Facebook / WhatsApp credentials.
     *
     * @return void
     */
    public function clear_local_facebook_access_token()
    {
        update_option("wbk_whatsapp_access_token", "");
        delete_option("wbk_whatsapp_token_expiry");
        update_option("wbk_whatsapp_business_account_id", "");
        update_option("wbk_whatsapp_phone_number_id", "");
        delete_option("wbk_whatsapp_discovered_waba_ids");
    }

    /**
     * Stores the Facebook / WhatsApp access token in site options.
     *
     * @param string     $access_token Access token.
     * @param int|string $expiry_date  Optional expiry timestamp in milliseconds.
     * @return void
     */
    private function save_local_facebook_access_token($access_token, $expiry_date = null)
    {
        update_option("wbk_whatsapp_access_token", sanitize_text_field((string) $access_token));

        if ($expiry_date !== null && $expiry_date !== "" && intval($expiry_date) > 0) {
            update_option("wbk_whatsapp_token_expiry", (string) intval($expiry_date));
            return;
        }

        delete_option("wbk_whatsapp_token_expiry");
    }

    /**
     * Stores WABA IDs discovered from Facebook token inspection.
     *
     * @param array $waba_ids Raw WABA IDs.
     * @return string[]
     */
    private function save_discovered_waba_ids($waba_ids)
    {
        $normalized = [];
        if (is_array($waba_ids)) {
            foreach ($waba_ids as $waba_id) {
                $value = sanitize_text_field((string) $waba_id);
                if ($value !== "") {
                    $normalized[] = $value;
                }
            }
        }

        $normalized = array_values(array_unique($normalized));
        update_option("wbk_whatsapp_discovered_waba_ids", $normalized);

        return $normalized;
    }

    /**
     * Returns the Freemius license secret for this site.
     *
     * @return string|false
     */
    private function get_freemius_license_secret()
    {
        $fs = wbk_fs();
        if (!$fs) {
            return false;
        }

        $license = $fs->_get_license();
        if (!$license || empty($license->secret_key)) {
            return false;
        }

        return (string) $license->secret_key;
    }

    /**
     * Decodes a base64url string.
     *
     * @param string $data Encoded payload.
     * @return string|false
     */
    private function b64url_decode($data)
    {
        $remainder = strlen($data) % 4;
        if ($remainder) {
            $data .= str_repeat("=", 4 - $remainder);
        }

        return base64_decode(strtr($data, "-_", "+/"), true);
    }

    /**
     * Create an async assistance task on Webba Connect.
     *
     * @param array<string, mixed> $payload
     * @return array<string, mixed>|false
     */
    public function create_assistance_task(array $payload)
    {
        return $this->request_assistance_api("POST", "assistance/tasks", $payload);
    }

    /**
     * Fetch assistance task status/result from Webba Connect.
     *
     * @return array<string, mixed>|false
     */
    public function get_assistance_task(string $task_id)
    {
        $task_id = trim($task_id);
        if ($task_id === "") {
            return false;
        }

        return $this->request_assistance_api("GET", "assistance/tasks/" . rawurlencode($task_id));
    }

    /**
     * Report a completed assistance setup (booking page created) to Webba Connect.
     *
     * @param array<string, mixed> $payload
     * @return array<string, mixed>|false
     */
    public function complete_assistance_chat_history(array $payload)
    {
        return $this->request_assistance_api("POST", "assistance/chat-history/complete", $payload);
    }

    /**
     * Fetch plugin remote configuration from Webba Connect.
     *
     * @return array<string, mixed>|false
     */
    public function get_remote_config()
    {
        return $this->request_assistance_api("GET", "plugin/config");
    }

    /**
     * @param array<string, mixed>|null $payload
     * @return array<string, mixed>|false
     */
    private function request_assistance_api(
        string $method,
        string $endpoint,
        ?array $payload = null
    ) {
        if (!$this->ensure_assistance_install_registered()) {
            return [
                "success" => false,
                "message" => __(
                    "Could not register this site with Webba Connect.",
                    "webba-booking-lite",
                ),
            ];
        }

        $backend_url = apply_filters("wbk_assistance_connect_api_url", self::get_connect_api_url());
        if ($backend_url && substr($backend_url, -1) !== "/") {
            $backend_url .= "/";
        }

        $response = $this->execute_assistance_api_request(
            $method,
            $endpoint,
            $backend_url,
            $payload,
        );

        if (
            is_array($response) &&
            (int) ($response["http_status"] ?? 0) === 401 &&
            ($response["code"] ?? "") === "install_not_registered"
        ) {
            delete_option("wbk_connect_install_registered");
            if ($this->ensure_assistance_install_registered()) {
                $response = $this->execute_assistance_api_request(
                    $method,
                    $endpoint,
                    $backend_url,
                    $payload,
                );
            }
        }

        return $response;
    }
}
