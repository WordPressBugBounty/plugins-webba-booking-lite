<?php
/**
 * Prevents caching of Webba Booking REST API responses by cache plugins and proxies.
 * Works with: LiteSpeed Cache, WP Fastest Cache, W3 Total Cache, WP Super Cache, Cache Enabler.
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Prevents caching of Webba Booking REST API responses by cache plugins and proxies.
 * Works with: LiteSpeed Cache, WP Fastest Cache, W3 Total Cache, WP Super Cache, Cache Enabler.
 * 
 * @package Webba Booking
 */
class WBK_REST_Cache_Prevention
{
    /**
     * Constructor
     */
    public function __construct()
    {
        add_action('plugins_loaded', [__CLASS__, 'early_no_cache'], 0);
        add_action('litespeed_init', [__CLASS__, 'litespeed_no_cache']);
        add_filter('rest_send_nocache_headers', [__CLASS__, 'skip_wp_nocache_headers']);
        add_filter('rest_post_dispatch', [__CLASS__, 'rest_response_headers'], 10, 3);
        add_filter('cache_enabler_bypass', [__CLASS__, 'cache_enabler_bypass']);
    }

    /**
     * Skips WP nocache headers for Webba Booking REST API requests.
     * 
     * @param bool $send Whether to send nocache headers.
     * @return bool False to skip WP nocache headers, true to send them.
     */
    public static function skip_wp_nocache_headers(bool $send): bool
    {
        if (self::is_webba_booking_rest_request()) {
            return false;
        }

        return $send;
    }

    /**
     * Checks if the current request is a Webba Booking REST API request.
     * 
     * @return bool True if the current request is a Webba Booking REST API request, false otherwise.
     */
    public static function is_webba_booking_rest_request(): bool
    {
        $uri        = isset($_SERVER['REQUEST_URI']) ? sanitize_text_field(wp_unslash($_SERVER['REQUEST_URI'])) : '';
        $rest_route = isset($_GET['rest_route']) ? sanitize_text_field(wp_unslash($_GET['rest_route'])) : '';
        $is_rest    = (strpos($uri, 'wp-json') !== false) || $rest_route !== '';
        if (!$is_rest) {
            return false;
        }
        $our = ['wbkdata', 'wbk/v', 'webba-booking'];
        foreach ($our as $ns) {
            if (strpos($uri, $ns) !== false || strpos($rest_route, $ns) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Early no cache for Webba Booking REST API requests.
     * 
     * @return void
     */
    public static function early_no_cache(): void
    {
        if (!self::is_webba_booking_rest_request()) {
            return;
        }
        if (!defined('DONOTCACHEPAGE')) {
            define('DONOTCACHEPAGE', true);
        }
        $wpfc_exclude = 'wpfc_exclude_current_page';
        if (function_exists($wpfc_exclude)) {
            $wpfc_exclude();
        }
    }

    /**
     * Sets LiteSpeed no cache for Webba Booking REST API requests.
     * 
     * @return void
     */
    public static function litespeed_no_cache(): void
    {
        if (self::is_webba_booking_rest_request()) {
            do_action('litespeed_control_set_nocache', 'webba-booking-rest-api');
        }
    }

    /**
     * Sets cache control headers for Webba Booking REST API requests.
     * 
     * @param WP_REST_Response $response The response object.
     * @param WP_REST_Server $server The server object.
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public static function rest_response_headers(WP_REST_Response $response, WP_REST_Server $server, WP_REST_Request $request): WP_REST_Response
    {
        if (!($response instanceof WP_REST_Response)) {
            return $response;
        }
        $route = $request->get_route();
        $our   = ['/wbkdata/v1/', '/wbk/v1/', '/wbk/v2/', '/webba-booking/v1/'];
        foreach ($our as $prefix) {
            if (strpos($route, $prefix) === 0) {
                $response->header('Cache-Control', 'no-cache, no-store, must-revalidate');
                $response->header('Pragma', 'no-cache');
                $response->header('Expires', '0');
                break;
            }
        }

        return $response;
    }

    /**
     * Bypasses Cache Enabler for Webba Booking REST API requests.
     * 
     * @param bool $bypass Whether to bypass Cache Enabler.
     * @return bool True to bypass Cache Enabler, false otherwise.
     */
    public static function cache_enabler_bypass(bool $bypass): bool
    {
        if (self::is_webba_booking_rest_request()) {
            return true;
        }

        return $bypass;
    }
}
