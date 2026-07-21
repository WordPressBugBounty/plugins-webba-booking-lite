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
     * @return string|false The query string or false on failure
     */
    private function prepare_auth_parameters($return_path = "", $endpoint = "", $calendar_id = "")
    {
        return $this->prepare_signed_auth_parameters(
            "GET",
            $endpoint,
            $return_path,
            $calendar_id,
        );
    }

    /**
     * Prepare signed auth query string for Webba Connect API requests.
     *
     * @param string $method HTTP method used in the canonical string (GET or POST)
     * @param string $endpoint Endpoint path without leading slash (e.g. assistance/tasks)
     * @param string $return_path Optional return path
     * @param string $calendar_id Optional calendar id
     * @return string|false
     */
    private function prepare_signed_auth_parameters(
        $method = "GET",
        $endpoint = "",
        $return_path = "",
        $calendar_id = ""
    ) {
        // Get Freemius instance
        $fs = wbk_fs();

        if (!$fs) {
            error_log("[WBK_AUTH_DEBUG] prepare_auth_parameters failed: wbk_fs() returned null/empty");
            return false;
        }

        // Get license information
        $license = $fs->_get_license();
        if (!$license) {
            error_log("[WBK_AUTH_DEBUG] prepare_auth_parameters failed: No license found from Freemius");
            return false;
        }

        $license_id = $license->id;
        $license_secret = $license->secret_key;

        if (!$license_id || !$license_secret) {
            error_log(
                "[WBK_AUTH_DEBUG] prepare_auth_parameters failed: license_id or license_secret missing. " .
                    "license_id=" . ($license_id ?: "[empty]") . ", secret_present=" . ($license_secret ? "yes" : "no"),
            );
            return false;
        }

        // Get site URL
        $site = get_site_url();

        // Validate site URL format
        if (!filter_var($site, FILTER_VALIDATE_URL)) {
            error_log("[WBK_AUTH_DEBUG] prepare_auth_parameters failed: Invalid site URL: " . $site);
            return false;
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
        $state = $this->hmac_b64url($canonical, $license_secret);

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
            "[WBK_AUTH_DEBUG] prepare_auth_parameters success: endpoint=" . $endpoint .
                ", site=" . $site . ", license_id=" . $license_id . ", calendar_id=" . $calendar_id,
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
                $id = (string) wp_hash(
                    home_url("/") . (defined("ABSPATH") ? ABSPATH : ""),
                );
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
    private function prepare_assistance_auth_parameters(
        $method = "GET",
        $endpoint = ""
    ) {
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
        $backend_url = apply_filters(
            "wbk_assistance_connect_api_url",
            self::get_connect_api_url(),
        );
        if ($backend_url && substr($backend_url, -1) !== "/") {
            $backend_url .= "/";
        }

        $website_id = self::get_connect_install_id();
        $site_url = get_site_url();
        $install_secret = self::get_connect_install_secret();

        if ($website_id === "" || $install_secret === "" || !filter_var($site_url, FILTER_VALIDATE_URL)) {
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
                "message" => __(
                    "Could not authenticate with Webba Connect.",
                    "webba-booking-lite",
                ),
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

        $query = $this->prepare_auth_parameters($return_path, "start", $calendar_id);
        if (!$query) {
            error_log("[WBK_AUTH_DEBUG] get_google_authorization_url failed: prepare_auth_parameters returned false");
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
        $query = $this->prepare_auth_parameters($return_path, "revoke-token", $calendar_id);
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
        $return_path = "/wp-admin/admin.php?page=wbk-connected-calendars";

        error_log(
            "[WBK_AUTH_DEBUG] fetch_access_token_from_webba_connect: provider=" . $provider .
                ", calendar_id=" . $calendar_id,
        );

        $query = $this->prepare_auth_parameters($return_path, "get-access-token", $calendar_id);
        if (!$query) {
            error_log("[WBK_AUTH_DEBUG] fetch_access_token failed: prepare_auth_parameters returned false");
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
                "[WBK_AUTH_DEBUG] fetch_access_token wp_remote_get error: " . $response->get_error_code() .
                    " - " . $response->get_error_message(),
            );
            return false;
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);

        error_log(
            "[WBK_AUTH_DEBUG] fetch_access_token response: code=" . $response_code .
                ", body_len=" . strlen($body) . ", body_preview=" . substr($body, 0, 500),
        );

        $data = json_decode($body, true);

        if (!$data) {
            error_log("[WBK_AUTH_DEBUG] fetch_access_token failed: JSON decode failed or empty body");
            return false;
        }

        // Check HTTP response code - non-2xx codes indicate failure
        if ($response_code < 200 || $response_code >= 300) {
            error_log(
                "[WBK_AUTH_DEBUG] fetch_access_token failed: HTTP " . $response_code .
                    ", error=" . (isset($data["error"]) ? $data["error"] : "no error in body"),
            );
            return false;
        }

        // Check if the response indicates an error in the JSON body
        if (isset($data["error"]) && (!isset($data["success"]) || $data["success"] !== true)) {
            error_log(
                "[WBK_AUTH_DEBUG] fetch_access_token failed: API error=" . $data["error"] .
                    ", status=" . (isset($data["status"]) ? $data["status"] : "n/a"),
            );
            return false;
        }

        error_log("[WBK_AUTH_DEBUG] fetch_access_token success: has_access_token=" . (isset($data["access_token"]) ? "yes" : "no"));
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
            error_log("[WBK_AUTH_DEBUG] get_outlook_authorization_url failed: prepare_auth_parameters returned false");
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
        error_log(
            "[WBK_AUTH_DEBUG] fetch_outlook_access_token: calendar_id=" . $calendar_id,
        );

        $query = $this->prepare_auth_parameters($return_path, "get-access-token", $calendar_id);
        if (!$query) {
            error_log("[WBK_AUTH_DEBUG] fetch_outlook_access_token failed: prepare_auth_parameters returned false");
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
                    $response->get_error_code() . " - " . $response->get_error_message(),
            );
            return false;
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);

        error_log(
            "[WBK_AUTH_DEBUG] fetch_outlook_access_token response: code=" . $response_code .
                ", body_preview=" . substr($body, 0, 500),
        );

        $data = json_decode($body, true);

        if (!$data) {
            error_log("[WBK_AUTH_DEBUG] fetch_outlook_access_token failed: JSON decode failed");
            return false;
        }

        // Check if the response indicates an error
        if (isset($data["error"])) {
            error_log(
                "[WBK_AUTH_DEBUG] fetch_outlook_access_token API error: " . $data["error"] .
                    ", status=" . (isset($data["status"]) ? $data["status"] : "n/a"),
            );
            return false;
        }

        error_log("[WBK_AUTH_DEBUG] fetch_outlook_access_token success: has_access_token=" . (isset($data["access_token"]) ? "yes" : "no"));
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
     * Create Gmail authorization URL (tokens stored on Webba Connect).
     *
     * Connect endpoints are prepared here; backend routes will be added later.
     *
     * @param string $resource_id Site-level Gmail resource id (default: gmail)
     * @return string|false
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
     * Create Gmail revoke authorization URL.
     *
     * @param string $resource_id Site-level Gmail resource id (default: gmail)
     * @return string|false
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
     * Fetch Gmail access token from Webba Connect.
     *
     * @param string $resource_id Site-level Gmail resource id (default: gmail)
     * @return array|false
     */
    public function get_gmail_access_token($resource_id = "gmail")
    {
        return $this->fetch_access_token_from_webba_connect($resource_id, "gmail");
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

        return $this->request_assistance_api(
            "GET",
            "assistance/tasks/" . rawurlencode($task_id),
        );
    }

    /**
     * Report a completed assistance setup (booking page created) to Webba Connect.
     *
     * @param array<string, mixed> $payload
     * @return array<string, mixed>|false
     */
    public function complete_assistance_chat_history(array $payload)
    {
        return $this->request_assistance_api(
            "POST",
            "assistance/chat-history/complete",
            $payload,
        );
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

        $backend_url = apply_filters(
            "wbk_assistance_connect_api_url",
            self::get_connect_api_url(),
        );
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
