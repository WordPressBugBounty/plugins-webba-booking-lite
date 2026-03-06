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
     * @return string The backend server URL
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
            "GET",
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
}
