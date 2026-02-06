<?php

use WebbaBooking\Utilities\WBK_Options_Utils;
if ( !defined( 'ABSPATH' ) ) {
    exit;
}
// webba booking Google integration class
if ( get_option( 'wbk_gg_client_version', '2.5' ) == '2.5' ) {
    require_once __DIR__ . DIRECTORY_SEPARATOR . 'api' . DIRECTORY_SEPARATOR . 'google_api' . DIRECTORY_SEPARATOR . 'google-api-2.5' . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php';
}
if ( get_option( 'wbk_gg_client_version', '2.5' ) == '2.9.1' ) {
    require_once __DIR__ . DIRECTORY_SEPARATOR . 'api' . DIRECTORY_SEPARATOR . 'google_api' . DIRECTORY_SEPARATOR . 'google-api-2.9.1' . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php';
}
if ( get_option( 'wbk_gg_client_version', '2.5' ) == '2.13.0' ) {
    require_once __DIR__ . DIRECTORY_SEPARATOR . 'api' . DIRECTORY_SEPARATOR . 'google_api' . DIRECTORY_SEPARATOR . 'google-api-2.13.0' . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php';
}
class WBK_Google {
    protected $client;

    protected $calendar_id;

    protected $ggid;

    protected $scopes;

    public function init( $calendar_id ) {
        return false;
    }

    public function get_auth_url() {
        return $this->client->createAuthUrl();
    }

    // connect to google and get calendar authorization status
    // 0 - no token set
    // 1 - authorization success
    // 2 - authorization failed
    public function connect() {
        return [2, 'not connected, premium feature not available'];
    }

    public function render_calendar_block() {
        return '';
    }

    public function process_auth_code( $authCode ) {
        return 0;
    }

    protected function get_access_token() {
        return '';
    }

    protected function get_gg_calendar_id() {
        return 0;
    }

    protected function save_access_token( $access_token ) {
    }

    public function get_calendar_name() {
        return '';
    }

    public function get_calendar_mode() {
        return '';
    }

    public function clearToken() {
    }

    public function insert_event(
        $title,
        $description,
        $start,
        $end,
        $time_zone,
        $calendar_id = '',
        $use_current_time_zone = false,
        $google_meet_enabled = null,
        $service_email = '',
        $booking_email = ''
    ) {
        return false;
    }

    public function update_event(
        $event_id,
        $title,
        $description,
        $start = null,
        $end = null,
        $time_zone = null
    ) {
        return false;
    }

    public function delete_event( $event_id ) {
        return false;
    }

    public function init_calendar_by_authcode( $code ) {
        return false;
    }

    public function getEventsTimeRanges( $start, $end ) {
        return false;
    }

    public function get_all_calendars() {
        return false;
    }

    public static function add_booking_to_gg_calendar( $booking_id ) {
    }

    static function set_google_events_data( $booking_id, $event_data, $meet_link = null ) {
    }

    static function delete_booking_data_from_gg_calendar( $booking_id, $by_time = true ) {
    }

    static function update_booking_data_in_gg_calendar( $booking_id ) {
    }

    static function add_booking_to_customer_calendar( $booking_ids, $code ) {
        return false;
    }

    public static function get_google_calendars_in_account( $calendar_id ) {
        return false;
    }

}
