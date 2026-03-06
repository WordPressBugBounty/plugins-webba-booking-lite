<?php

if ( !defined( "ABSPATH" ) ) {
    exit;
}
class WBK_Outlook_Calendar_Processor extends WBK_Connected_Calendar_Processor {
    /**
     * Extended property ID for Microsoft Graph: "createdby" marker (Webba Booking)
     * Format: String {guid} Name createdby
     */
    const CREATEDBY_EXTENDED_PROPERTY_ID = "String {66f5a359-4659-4830-9070-00047ec6ac6e} Name createdby";

    /**
     * Constructor
     *
     * Usage patterns:
     * - new WBK_Outlook_Calendar_Processor() - no parameters
     * - new WBK_Outlook_Calendar_Processor($id) - WordPress DB ID as int/string
     *
     * @param int|string|null $id The WordPress DB ID (internal ID)
     */
    public function __construct( $id = null ) {
    }

    /**
     * Get access token, checking local storage first and fetching from WBK_Webba_Connect if expired or not cached
     *
     * @return string|WP_Error Access token on success, WP_Error on failure
     */
    public function get_access_token() {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Fetch token from webba connect API for Outlook
     *
     * @return array|false API response array or false on failure
     */
    protected function fetch_token_from_api() {
        return false;
    }

    /**
     * Prepare token data structure for storage (Outlook-specific)
     *
     * @param array $fetch_result The API response from fetch_token_from_api()
     * @return array Token data array ready for JSON encoding
     */
    protected function prepare_token_data( $fetch_result ) {
        return [];
    }

    /**
     * Create a calendar event in the primary calendar
     *
     * @param int $timestamp Unix timestamp for the event start time
     * @param string $title Event title/subject
     * @param string $description Event description (optional)
     * @param int $duration_minutes Event duration in minutes (default: 60)
     * @return string|WP_Error Event ID on success, WP_Error on failure
     */
    public function create_calendar_event(
        $timestamp,
        $title = "",
        $description = "",
        $duration_minutes = 60
    ) {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Override: Create a calendar event based on a booking ID
     * Uses parent implementation with Outlook-specific field name
     *
     * @param int $booking_id The booking ID
     * @param string $event_id_field_name The booking field name to store event ID
     * @return string|WP_Error Event ID on success, WP_Error on failure
     */
    public function create_event_from_booking( $booking_id, $event_id_field_name = null ) {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Update a calendar event in Outlook
     *
     * @param string $event_id The event ID to update
     * @param int $timestamp Unix timestamp for the event start time
     * @param string $title Event title/subject
     * @param string $description Event description (optional)
     * @param int $duration_minutes Event duration in minutes
     * @return string|WP_Error Event ID on success, WP_Error on failure
     */
    public function update_calendar_event(
        $event_id,
        $timestamp,
        $title = "",
        $description = "",
        $duration_minutes = 60
    ) {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Override: Update a calendar event based on a booking ID
     * Uses parent implementation with Outlook-specific field names
     *
     * @param int $booking_id The booking ID
     * @param string|array $event_id_field_names The booking field name(s) to retrieve event ID
     * @return string|array|WP_Error Event ID on success, WP_Error on failure
     */
    public function update_event_from_booking( $booking_id, $event_id_field_names = null ) {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Delete a calendar event from Outlook by event ID
     *
     * @param string $event_id The Outlook event ID to delete
     * @return bool|WP_Error True on success, WP_Error on failure
     */
    public function delete_calendar_event( $event_id ) {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Get all calendars for the authenticated user
     * Primary (default) calendar is returned first, matching Google Calendar behavior.
     *
     * @return array|WP_Error Array of calendars with 'id' and 'name' on success, WP_Error on failure
     */
    public function get_calendars() {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Get auth parameters for the connected Outlook calendar
     * Returns the same format as WBK_Google_Calendar_Processor::get_auth_parameters()
     *
     * @return array|WP_Error Auth parameters array or WP_Error on failure
     */
    public function get_auth_parameters() {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Clear access token for the calendar
     * Clears the access token from the connected calendar record (used when revoking via webba-connect)
     *
     * @return bool|WP_Error True on success, WP_Error on failure
     */
    public function clear_access_token() {
        return new WP_Error("premium_required", "Premium features are required.");
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
     * Parse Microsoft Graph dateTimeTimeZone to Unix timestamp.
     * Microsoft returns dateTime in UTC or the event's timezone; timeZone indicates which.
     * Without timezone-aware parsing, strtotime() uses server timezone and misinterprets UTC times.
     *
     * @param string $date_time e.g. "2026-02-16T08:00:00.0000000"
     * @param string $time_zone e.g. "UTC" or "W. Europe Standard Time" or "Europe/Warsaw"
     * @return int|false Unix timestamp or false on parse failure
     */
    private function parse_microsoft_datetime( $date_time, $time_zone ) {
        $tz = $this->map_microsoft_timezone_to_iana( $time_zone );
        try {
            $dt = new DateTime($date_time, new DateTimeZone($tz));
            return $dt->getTimestamp();
        } catch ( Exception $e ) {
            return false;
        }
    }

    /**
     * Map Microsoft/Windows timezone identifiers to IANA (PHP-compatible) timezone.
     *
     * @param string $ms_tz Microsoft timezone (e.g. "UTC", "W. Europe Standard Time")
     * @return string IANA timezone (e.g. "UTC", "Europe/Warsaw")
     */
    private function map_microsoft_timezone_to_iana( $ms_tz ) {
        if ( empty( $ms_tz ) ) {
            return "UTC";
        }
        $ms_tz = trim( $ms_tz );
        $map = [
            "UTC"                            => "UTC",
            "W. Europe Standard Time"        => "Europe/Berlin",
            "Central European Standard Time" => "Europe/Warsaw",
            "Central European Summer Time"   => "Europe/Warsaw",
            "Romance Standard Time"          => "Europe/Paris",
            "GMT Standard Time"              => "Europe/London",
            "Eastern Standard Time"          => "America/New_York",
            "Pacific Standard Time"          => "America/Los_Angeles",
        ];
        if ( isset( $map[$ms_tz] ) ) {
            return $map[$ms_tz];
        }
        if ( @timezone_open( $ms_tz ) !== false ) {
            return $ms_tz;
        }
        return "UTC";
    }

    /**
     * Fetch calendar events in a date range for availability blocking
     * Returns array of WBK_Time_Slot objects representing busy time ranges
     * Mirrors Google Calendar behavior: ignores free events when wbk_gg_ignore_free is yes,
     * and supports all-day events.
     *
     * @param string $start ISO 8601 formatted start datetime
     * @param string $end ISO 8601 formatted end datetime
     * @return array|WP_Error Array of WBK_Time_Slot on success, WP_Error on failure
     */
    public function fetch_events_in_range( $start, $end ) {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Get a calendar event from Microsoft Graph API by event ID
     *
     * @param string $event_id The event ID to retrieve
     * @return array|WP_Error Event data on success, WP_Error on failure
     */
    public function get_calendar_event( $event_id ) {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Delete the event from Outlook Calendar (provider-specific implementation).
     * Uses outlook_event_id or appointment_outlook_event_id from the booking.
     * Handles both formats: JSON array [[calendar_id, event_id], ...] (same as Google) or simple string.
     *
     * @param WBK_Booking $booking The booking instance
     * @param array $calendar_ids Array of connected Outlook calendar IDs
     * @return bool|WP_Error True on success, WP_Error on failure
     */
    public static function delete_event_from_booking_for_calendars( $booking, $calendar_ids ) {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Update the event in Outlook Calendar (provider-specific implementation).
     * Handles both outlook_event_id formats: JSON array [[calendar_id, event_id], ...] or simple string.
     *
     * @param WBK_Booking $booking The booking instance
     * @param WBK_Service $service The service instance
     * @param array $calendar_ids Array of connected Outlook calendar IDs
     * @return bool|WP_Error True on success, WP_Error on failure
     */
    public static function update_event_from_booking_for_calendars( $booking, $service, $calendar_ids ) {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Process adding a booking to Outlook Calendar (provider-specific implementation).
     * Stores event IDs in array format [[calendar_id, event_id], ...] for consistency with Google.
     *
     * @param WBK_Booking $booking The booking instance
     * @param WBK_Service $service The service instance
     * @param array $calendar_ids Array of calendar IDs to process
     * @return void|WP_Error WP_Error on failure
     */
    public static function process_adding_for_calendars( $booking, $service, $calendar_ids ) {
    }

}
