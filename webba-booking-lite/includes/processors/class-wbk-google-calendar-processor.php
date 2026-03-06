<?php

use PHPUnit\Runner\AfterIncompleteTestHook;
use function PHPUnit\Framework\assertFalse;
if ( !defined( "ABSPATH" ) ) {
    exit;
}
class WBK_Google_Calendar_Processor extends WBK_Connected_Calendar_Processor {
    /**
     * Connected calendar instance
     * @var WBK_Connected_Calendar|null
     */
    protected $connected_calendar;

    /**
     * Constructor
     *
     * Usage patterns:
     * - new WBK_Google_Calendar_Processor() - no parameters
     * - new WBK_Google_Calendar_Processor($id) - WordPress DB ID as int/string
     *
     * @param int|string|null $id The WordPress DB ID (internal ID)
     */
    public function __construct( $id = null ) {
    }

    /**
     * Set the WordPress DB ID and reinitialize connected calendar
     *
     * @param int|string $id The WordPress DB ID
     * @return void
     */
    public function set_id( $id ) {
    }

    /**
     * Get access token, with support for both legacy and webba connect methods
     *
     * @return string|WP_Error Access token on success, WP_Error on failure
     */
    public function get_access_token() {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Fetch token from webba connect API for Google
     *
     * @return array|false API response array or false on failure
     */
    protected function fetch_token_from_api() {
        return false;
    }

    /**
     * Get Google Calendar access token from legacy storage (wp_options and wbk_gg_calendars table)
     * Checks if token is expired and refreshes it if needed
     *
     * @return string|WP_Error Access token on success, WP_Error on failure
     */
    protected function get_google_access_token_legacy() {
        return new WP_Error("premium_required", "Premium features are required for legacy Google Calendar integration.");
    }

    /**
     * Get Outlook Calendar access token from webba connect
     *
     * @return string|WP_Error Access token on success, WP_Error on failure
     */
    protected function get_outlook_access_token() {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Check if the access token is valid by making a lightweight API call
     *
     * @return bool|WP_Error True if token is valid, false if invalid, WP_Error on error
     */
    public function check_access_token() {
        return false;
    }

    /**
     * Create a calendar event in the primary calendar
     *
     * @param int $timestamp Unix timestamp for the event start time
     * @param string $title Event title/summary
     * @param string $description Event description (optional)
     * @param int $duration_minutes Event duration in minutes (default: 60)
     * @param bool $google_meet_enabled Whether to enable Google Meet (default: false)
     * @param array $attendee_emails Array of attendee email addresses (optional)
     * @return string|array|WP_Error Event ID on success (or array with [event_id, meet_link] if Google Meet enabled), WP_Error on failure
     */
    public function create_calendar_event(
        $timestamp,
        $title = "",
        $description = "",
        $duration_minutes = 60,
        $google_meet_enabled = false,
        $attendee_emails = []
    ) {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Override: Create a calendar event based on a booking ID
     * Uses parent implementation with Google-specific field name and Google Meet support
     *
     * @param int $booking_id The booking ID
     * @param string $event_id_field_name The booking field name to store event ID
     * @param bool $google_meet_enabled Whether Google Meet is enabled for this calendar
     * @param array $attendee_emails Array of attendee email addresses
     * @return string|array|WP_Error Event ID on success (or array with [event_id, meet_link] if Google Meet enabled), WP_Error on failure
     */
    public function create_event_from_booking(
        $booking_id,
        $event_id_field_name = null,
        $google_meet_enabled = false,
        $attendee_emails = []
    ) {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Update a calendar event in Google Calendar
     *
     * @param string $event_id The event ID to update
     * @param int $timestamp Unix timestamp for the event start time
     * @param string $title Event title/summary
     * @param string $description Event description (optional)
     * @param int $duration_minutes Event duration in minutes
     * @param bool $google_meet_enabled Whether to enable Google Meet (default: false)
     * @param array $attendee_emails Array of attendee email addresses (optional)
     * @return string|array|WP_Error Event ID on success (or array with [event_id, meet_link] if Google Meet enabled), WP_Error on failure
     */
    public function update_calendar_event(
        $event_id,
        $timestamp,
        $title = "",
        $description = "",
        $duration_minutes = 60,
        $google_meet_enabled = false,
        $attendee_emails = []
    ) {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Override: Update a calendar event based on a booking ID
     * Uses parent implementation with Google-specific field names and Google Meet support
     *
     * @param int $booking_id The booking ID
     * @param string|array $event_id_field_names The booking field name(s) to retrieve event ID
     * @param bool $google_meet_enabled Whether Google Meet is enabled for this calendar
     * @param array $attendee_emails Array of attendee email addresses
     * @return string|array|WP_Error Event ID on success (or array with [event_id, meet_link] if Google Meet enabled), WP_Error on failure
     */
    public function update_event_from_booking(
        $booking_id,
        $event_id_field_names = null,
        $google_meet_enabled = false,
        $attendee_emails = []
    ) {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Delete a calendar event from Google Calendar by event ID
     *
     * @param string $event_id The Google Calendar event ID to delete
     * @return bool|WP_Error True on success, WP_Error on failure
     */
    public function delete_calendar_event( $event_id ) {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Get all calendars for the authenticated user
     *
     * @return array|WP_Error Array of calendars with 'id' and 'name' on success, WP_Error on failure
     */
    public function get_calendars() {
        return new WP_Error("calendars_fetch_failed", "Failed to fetch calendars", []);
    }

    /**
     * Get a specific calendar by ID
     *
     * @param string $calendar_id The calendar ID
     * @return array|WP_Error Calendar data with 'id' and 'name' on success, WP_Error on failure
     */
    public function get_calendar_by_id( $calendar_id ) {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Fetch calendar events in a date range for availability blocking
     * Returns array of WBK_Time_Slot objects representing busy time ranges
     *
     * @param string $start ISO 8601 formatted start datetime
     * @param string $end ISO 8601 formatted end datetime
     * @return array|WP_Error Array of WBK_Time_Slot on success, WP_Error on failure
     */
    public function fetch_events_in_range( $start, $end ) {
        return new WP_Error("events_fetch_failed", "Premium features are required.");
    }

    /**
     * Get a calendar event from Google Calendar API by event ID
     *
     * @param string $event_id The event ID to retrieve
     * @return array|WP_Error Event data on success, WP_Error on failure
     */
    public function get_calendar_event( $event_id ) {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Prepare aggregated event data from multiple bookings for group services
     *
     * @param array $booking_ids Array of booking IDs
     * @param int $service_id The service ID
     * @return array|WP_Error Array with 'title', 'description', 'start_timestamp', 'duration' on success, WP_Error on failure
     */
    protected static function prepare_group_event_data( $booking_ids, $service_id ) {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Delete the event from Google Calendar (provider-specific implementation).
     * Handles both gg_event_id formats: JSON array [[calendar_id, event_id], ...] or simple string.
     *
     * @param WBK_Booking $booking The booking instance
     * @param array $calendar_ids Array of connected Google calendar IDs
     * @return bool|WP_Error True on success, WP_Error on failure
     */
    public static function delete_event_from_booking_for_calendars( $booking, $calendar_ids ) {
        return true;
    }

    /**
     * Update the event in Google Calendar (provider-specific implementation).
     * Handles both gg_event_id formats: JSON array [[calendar_id, event_id], ...] or simple string.
     *
     * @param WBK_Booking $booking The booking instance
     * @param WBK_Service $service The service instance
     * @param array $calendar_ids Array of connected Google calendar IDs
     * @return bool|WP_Error True on success, WP_Error on failure
     */
    public static function update_event_from_booking_for_calendars( $booking, $service, $calendar_ids ) {
        return true;
    }

    /**
     * Process adding a booking to Google Calendar (provider-specific implementation)
     * Handles group services based on wbk_gg_group_service_export option
     *
     * @param WBK_Booking $booking The booking instance
     * @param WBK_Service $service The service instance
     * @param array $calendar_ids Array of calendar IDs to process
     * @return void|WP_Error WP_Error on failure
     */
    public static function process_adding_for_calendars( $booking, $service, $calendar_ids ) {
    }

    /**
     * Process adding a booking to Google Calendar for group services
     * Creates one event for all bookings at the same time slot, or updates existing event
     *
     * @param int $booking_id The booking ID
     * @param int $service_id The service ID
     * @param array $calendar_ids Array of calendar IDs
     * @return void|WP_Error WP_Error on failure
     */
    protected static function process_group_service_adding( $booking_id, $service_id, $calendar_ids ) {
    }

    /**
     * Get revoke URL for Google Calendar authentication
     * Checks if using easy auth (webba connect) or legacy method and returns appropriate revoke URL
     *
     * @return string|false|WP_Error Revoke URL on success, false on failure, WP_Error on error
     */
    public function get_revoke_url() {
        return false;
    }

    public function get_auth_parameters() {
        return [
            "isAuthenticated" => false,
            "internalError"   => true,
        ];
    }

    /**
     * Clear access token for the calendar
     * Clears the access token from the connected calendar record
     *
     * @return bool|WP_Error True on success, WP_Error on failure
     */
    public function clear_access_token() {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    public function is_google_calendar() {
        return false;
    }

    public function get_easy_authorization_status() {
        return "";
    }

}
