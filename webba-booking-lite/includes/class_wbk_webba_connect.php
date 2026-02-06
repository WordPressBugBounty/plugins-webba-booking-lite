<?php
/**
 * Webba Connect Class
 *
 * Handles connections to the Webba backend server for various integrations
 *
 * @package WebbaBooking
 * @since 6.0.7
 */

if (!defined('ABSPATH')) {
    exit();
}

/**
 * Class WBK_Webba_Connect
 */
class WBK_Webba_Connect
{
    /**
     * Backend server URL constant
     */
    const BACKEND_URL = 'https://connect.webba-booking.com/';

    /**
     * Prepare authentication parameters and return ready query string
     *
     * @param string $return_path Optional return path for authorization flow
     * @param string $endpoint The API endpoint (e.g., 'google/start', 'google/get-access-token')
     * @param string $calendar_id The internal calendar ID
     * @return string|false The query string or false on failure
     */
    private function prepare_auth_parameters(
        $return_path = '',
        $endpoint = '',
        $calendar_id = ''
    ) {
        // Get Freemius instance
        $fs = wbk_fs();

        if (!$fs) {
            return false;
        }

        // Get license information
        $license = $fs->_get_license();
        if (!$license) {
            return false;
        }

        $license_id = $license->id;
        $license_secret = $license->secret_key;

        if (!$license_id || !$license_secret) {
            return false;
        }

        // Get site URL
        $site = get_site_url();

        // Validate site URL format
        if (!filter_var($site, FILTER_VALIDATE_URL)) {
            return false;
        }

        // Generate nonce and timestamp
        $nonce = bin2hex(random_bytes(16));
        $ts = time();

        // Validate nonce format (should be 32 character hex string)
        if (!preg_match('/^[a-f0-9]{32}$/', $nonce)) {
            return false;
        }

        // Validate timestamp (should be a positive integer)
        if (!is_numeric($ts) || $ts <= 0) {
            return false;
        }

        // Create canonical string for HMAC
        $canonical = implode("\n", [
            'GET',
            '/' . $endpoint,
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
            'site' => $site,
            'license_id' => (string) $license_id,
            'return' => $return_path,
            'calendar_id' => $calendar_id,
            'nonce' => $nonce,
            'ts' => (string) $ts,
            'v' => '1',
            'state' => $state,
        ];

        return http_build_query($query_params);
    }

    /**
     * Create Google authorization URL
     *
     * @param string $calendar_id The internal calendar ID
     * @return string|false The authorization URL or false on failure
     */
    public function get_google_authorization_url($calendar_id = '')
    {
        $return_path = '/wp-admin/admin.php?page=wbk-gg-calendars';

        $query = $this->prepare_auth_parameters(
            $return_path,
            'start',
            $calendar_id
        );
        if (!$query) {
            return false;
        }

        return self::BACKEND_URL . 'google/start?' . $query;
    }

    /**
     * Create Google revoke authorization URL
     *
     * @param string $calendar_id The internal calendar ID
     * @return string|false The revoke URL or false on failure
     */
    public function get_google_revoke_url($calendar_id = '')
    {
        $return_path =
            '/wp-admin/admin.php?page=wbk-gg-calendars&revoke-gg-calendar=' .
            $calendar_id;

        // Prepare authentication parameters including HMAC validation
        $query = $this->prepare_auth_parameters(
            $return_path,
            'revoke-token',
            $calendar_id
        );
        if (!$query) {
            return false;
        }

        // Create the revoke URL with all parameters as query parameters
        $revoke_url = self::BACKEND_URL . 'google/revoke-token?' . $query;

        return $revoke_url;
    }

    /**
     * Get Google access token
     *
     * @param string $calendar_id The internal calendar ID
     * @return array|false The response array with access token or false on failure
     */
    public function fetch_access_token_from_webba_connect($calendar_id = '')
    {
        $return_path = '/wp-admin/admin.php?page=wbk-gg-calendars';
        $query = $this->prepare_auth_parameters(
            $return_path,
            'get-access-token',
            $calendar_id
        );
        if (!$query) {
            return false;
        }

        $url = self::BACKEND_URL . 'google/get-access-token?' . $query;
        // Make the request
        $response = wp_remote_get($url);

        if (is_wp_error($response)) {
            return false;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (!$data) {
            return false;
        }

        // Check if the response indicates an error
        if (isset($data['error'])) {
            return $data;
        }

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
        return rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
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
        return $this->b64url(hash_hmac('sha256', $msg, $key, true));
    }

    /**
     * Get access token and refresh if needed
     *
     * @param string $calendar_id The internal calendar ID
     * @return array|false The access token response or false on failure
     */
    public function get_google_access_token($calendar_id = '')
    {
        $google_calendar = new WBK_Google_Calendar($calendar_id);
        $auth_status = $google_calendar->get_access_token();
        // check if token is stored and not expired
        if (
            $auth_status &&
            $auth_status['status'] === 'authorized' &&
            $auth_status['expires_at'] > time()
        ) {
            return $auth_status['access_token'];
        }

        // otherwise fetch from webba connect
        $fetch_result = $this->fetch_access_token_from_webba_connect(
            $calendar_id
        );

        if ($fetch_result && $fetch_result['success'] === true) {
            $google_calendar->set_access_token([
                'status' => 'authorized',
                'access_token' => $fetch_result['access_token'],
                'expires_at' =>
                    round($fetch_result['expiry_date'] / 1000) - 300,
            ]);
            $google_calendar->save();
            return $fetch_result['access_token'];
        } else {
            $google_calendar->set_access_token([
                'status' => 'not_authorized',
            ]);
            $google_calendar->save();
            return false;
        }

        return $fetch_result;
    }
}
