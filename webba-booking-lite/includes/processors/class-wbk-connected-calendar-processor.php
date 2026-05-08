<?php

if ( !defined( "ABSPATH" ) ) {
    exit;
}
/**
 * Abstract base class for connected calendar integrations (Google, Outlook, etc.)
 *
 * Provides common functionality for calendar API operations while allowing
 * each provider to implement API-specific details.
 *
 * Both Google Calendar and Outlook Calendar classes extend this base class
 * to share common booking processing logic while maintaining their own
 * API-specific implementations.
 *
 * This class handles ONLY API interactions - no database operations.
 */
abstract class WBK_Connected_Calendar_Processor {
    /**
     * Internal WordPress DB ID - used for reading data from DB and fetching access tokens
     * @var int|null
     */
    protected $id;

    /**
     * Provider calendar ID - used for all direct API calls to Google Calendar and Microsoft APIs
     * @var string
     */
    protected $calendar_id;

    /**
     * Provider - used for all direct API calls to Google Calendar and Microsoft APIs
     * @var string
     */
    protected $provider;

    /**
     * Constructor
     *
     * Usage patterns:
     * - new WBK_Google_Calendar_Processor() - no parameters
     * - new WBK_Google_Calendar_Processor($id) - WordPress DB ID as int/string
     *
     * The constructor accepts the WordPress DB ID and initializes calendar_id from the database.
     *
     * @param int|string|null $id The WordPress DB ID (internal ID)
     */
    public function __construct( $id = null ) {
    }

    /**
     * Get the WordPress DB ID
     *
     * @return int|null
     */
    public function get_id() {
        return null;
    }

    /**
     * Set the WordPress DB ID
     *
     * @param int|string $id The WordPress DB ID
     * @return void
     */
    public function set_id( $id ) {
    }

    /**
     * Get the provider
     *
     * @return string
     */
    public function get_provider() {
        return "";
    }

    /**
     * Get the provider calendar ID (for API operations)
     *
     * @return string
     */
    public function get_calendar_id() {
        return "";
    }

    /**
     * Set the provider calendar ID
     *
     * @param string $calendar_id The provider calendar ID
     * @return void
     */
    public function set_calendar_id( $calendar_id ) {
    }

    /**
     * Abstract method: Get access token for API authentication
     * Each provider implements their own token retrieval logic
     *
     * @return string|array|WP_Error Access token on success, WP_Error on failure
     */
    public abstract function get_access_token();

    /**
     * Clear access token for the calendar (used when revoking via webba-connect)
     *
     * @return bool|WP_Error True on success, WP_Error on failure
     */
    public abstract function clear_access_token();

    /**
     * Get connected calendar instance, ensuring it's loaded
     *
     * @return WBK_Connected_Calendar|WP_Error Connected calendar instance on success, WP_Error on failure
     */
    protected function get_connected_calendar() {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Get access token from cache
     * Checks if stored token exists and is valid (not expired)
     *
     * @param WBK_Connected_Calendar $connected_calendar The connected calendar instance
     * @return string|false Access token if valid, false otherwise
     */
    protected function get_access_token_from_cache( $connected_calendar ) {
        return false;
    }

    /**
     * Fetch access token from webba connect API and store it locally
     * This method only handles the remote API call - no local storage checking
     * Child classes implement fetch_token_from_api() for provider-specific API calls
     *
     * @param WBK_Connected_Calendar $connected_calendar The connected calendar instance
     * @return string|WP_Error Access token on success, WP_Error on failure
     */
    protected function get_access_token_from_webba_connect( $connected_calendar ) {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Fetch token from webba connect API
     * Each provider implements this method to call the appropriate API endpoint
     *
     * @return array|false API response array or false on failure
     */
    protected function fetch_token_from_api() {
        return false;
    }

    /**
     * Prepare token data structure for storage
     * Can be overridden by child classes for provider-specific token data
     *
     * @param array $fetch_result The API response from fetch_token_from_api()
     * @return array Token data array ready for JSON encoding
     */
    protected function prepare_token_data( $fetch_result ) {
        return [];
    }

    /**
     * Abstract method: Create a calendar event via API
     *
     * @param int $timestamp Unix timestamp for the event start time
     * @param string $title Event title/subject
     * @param string $description Event description (optional)
     * @param int $duration_minutes Event duration in minutes
     * @return string|array|WP_Error Event ID on success, WP_Error on failure
     */
    public abstract function create_calendar_event(
        $timestamp,
        $title = "",
        $description = "",
        $duration_minutes = 60
    );

    /**
     * Abstract method: Update a calendar event via API
     *
     * @param string $event_id The event ID to update
     * @param int $timestamp Unix timestamp for the event start time
     * @param string $title Event title/subject
     * @param string $description Event description (optional)
     * @param int $duration_minutes Event duration in minutes
     * @return string|array|WP_Error Event ID on success, WP_Error on failure
     */
    public abstract function update_calendar_event(
        $event_id,
        $timestamp,
        $title = "",
        $description = "",
        $duration_minutes = 60
    );

    /**
     * Abstract method: Delete a calendar event via API
     *
     * @param string $event_id The event ID to delete
     * @return bool|WP_Error True on success, WP_Error on failure
     */
    public abstract function delete_calendar_event( $event_id );

    /**
     * Abstract method: Get all calendars for the authenticated user
     *
     * @return array|WP_Error Array of calendars with 'id' and 'name' on success, WP_Error on failure
     */
    public abstract function get_calendars();

    /**
     * Abstract method: Get a specific calendar by ID
     *
     * @param string $calendar_id The calendar ID
     * @return array|WP_Error Calendar data with 'id' and 'name' on success, WP_Error on failure
     */
    public abstract function get_calendar_by_id( $calendar_id );

    /**
     * Abstract method: Fetch calendar events in a date range for availability blocking
     * Returns array of WBK_Time_Slot objects representing busy time ranges
     *
     * @param string $start ISO 8601 formatted start datetime
     * @param string $end ISO 8601 formatted end datetime
     * @return array|WP_Error Array of WBK_Time_Slot on success, WP_Error on failure
     */
    public abstract function fetch_events_in_range( $start, $end );

    /**
     * Common method: Get calendar IDs only
     *
     * @return array|WP_Error Array of calendar IDs on success, WP_Error on failure
     */
    public function get_calendar_ids() {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Common method: Get calendar names only
     *
     * @return array|WP_Error Array of calendar names on success, WP_Error on failure
     */
    public function get_calendar_names() {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Common method: Prepare event title and description from booking
     * Shared logic for processing placeholders and options
     *
     * @param int $booking_id The booking ID
     * @return array|WP_Error Array with booking data on success, WP_Error on failure
     */
    protected function prepare_event_data_from_booking( $booking_id ) {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Resolve connected calendar WordPress IDs for export: service calendars, or unit calendars
     * when the booking is unit-only (service_id 0).
     *
     * @param WBK_Booking $booking Booking.
     * @return array{0: ?WBK_Service, 1: ?WBK_Unit, 2: int[]} Service (or null), unit (or null), calendar ids.
     */
    public static function get_connected_calendar_ids_for_booking( $booking ) {
        return [null, null, []];
    }

    /**
     * Whether the booking has at least one connected calendar configured for export.
     *
     * @param WBK_Booking $booking Booking.
     * @return bool
     */
    public static function booking_has_connected_calendars_for_export( $booking ) {
        $resolved = self::get_connected_calendar_ids_for_booking( $booking );
        return !empty( $resolved[2] );
    }

    /**
     * Common method: Create a calendar event based on a booking ID
     * Uses abstract create_calendar_event() for API-specific implementation
     *
     * @param int $booking_id The booking ID
     * @param string $event_id_field_name The booking field name to store event ID (e.g., 'outlook_event_id', 'gg_event_id')
     * @return string|array|WP_Error Event ID on success, WP_Error on failure
     */
    public function create_event_from_booking( $booking_id, $event_id_field_name = null ) {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Common method: Update a calendar event based on a booking ID
     * Uses abstract update_calendar_event() for API-specific implementation
     *
     * @param int $booking_id The booking ID
     * @param string|array $event_id_field_names The booking field name(s) to retrieve event ID
     * @return string|array|WP_Error Event ID on success, WP_Error on failure
     */
    public function update_event_from_booking( $booking_id, $event_id_field_names = null ) {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Common method: Format timestamp to ISO 8601 with timezone
     *
     * @param int $timestamp Unix timestamp
     * @param string $timezone Timezone string (defaults to WordPress option)
     * @return string ISO 8601 formatted datetime string
     */
    protected function format_datetime( $timestamp, $timezone = null ) {
        return "";
    }

    /**
     * Common helper: Format start and end datetime for calendar events
     *
     * @param int $timestamp Unix timestamp for start time
     * @param int $duration_minutes Duration in minutes
     * @param string|null $timezone Timezone string (defaults to WordPress option)
     * @return array Array with 'start' and 'end' datetime strings
     */
    protected function format_start_end_datetime( $timestamp, $duration_minutes, $timezone = null ) {
        return [
            "start"    => "",
            "end"      => "",
            "timezone" => "UTC",
        ];
    }

    /**
     * Abstract method: Process adding booking to calendars (provider-specific implementation)
     * Each provider implements this to handle their specific calendar creation logic
     *
     * @param WBK_Booking $booking The booking instance
     * @param WBK_Service $service The service instance
     * @param array $calendar_ids Array of calendar IDs to process
     * @return void|WP_Error WP_Error on failure
     */
    public static abstract function process_adding_for_calendars( $booking, $service, $calendar_ids );

    /**
     * Add booking to external calendars for unit-based bookings (service_id 0).
     *
     * @param WBK_Booking $booking       Booking.
     * @param array       $calendar_ids Connected calendar row IDs.
     * @return void|WP_Error
     */
    public static abstract function process_adding_for_unit_booking( $booking, $calendar_ids );

    /**
     * Abstract method: Delete event from calendars (provider-specific implementation)
     * Each provider implements this to handle their specific event ID field and deletion logic
     *
     * @param WBK_Booking $booking The booking instance
     * @param array $calendar_ids Array of calendar IDs to process
     * @return bool|WP_Error True on success, WP_Error on failure
     */
    public static abstract function delete_event_from_booking_for_calendars( $booking, $calendar_ids );

    /**
     * Abstract method: Update event in calendars (provider-specific implementation)
     * Each provider implements this to handle their specific event ID field and update logic
     *
     * @param WBK_Booking $booking The booking instance
     * @param WBK_Service $service The service instance
     * @param array $calendar_ids Array of calendar IDs to process
     * @return bool|WP_Error True on success, WP_Error on failure
     */
    public static abstract function update_event_from_booking_for_calendars( $booking, $service, $calendar_ids );

    /**
     * Common method: Process adding a booking to calendars
     * Handles common validation and delegates to provider-specific implementation
     *
     * @param int $booking_id The booking ID
     * @return void|WP_Error WP_Error on failure
     */
    public static function process_adding( $booking_id ) {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Process adding a booking to all calendar types (Google, Outlook, etc.)
     * Automatically detects calendar provider types and calls the appropriate processor
     *
     * @param int $booking_id The booking ID
     * @return void|WP_Error WP_Error on failure
     */
    public static function process_adding_all_types( $booking_id ) {
    }

    /**
     * Check if the booking has an event in any connected calendar (Google or Outlook).
     *
     * @param int $booking_id The booking ID
     * @return bool True if event exists in connected calendar, false otherwise
     */
    public static function is_event_added_to_connected_calendars( $booking_id ) {
        return false;
    }

    /**
     * Delete the event from connected calendars (Google, Outlook, etc.) by booking ID.
     * Common orchestration: loads booking, service, groups calendars by provider,
     * delegates to each provider's delete_event_from_booking_for_calendars.
     *
     * @param int $booking_id The booking ID
     * @return bool|WP_Error True on success (or if no events to delete), WP_Error on failure
     */
    public static function delete_event_from_connected_calendars( $booking_id ) {
        return true;
    }

    /**
     * Update the event in connected calendars (Google, Outlook, etc.) by booking ID.
     * Common orchestration: loads booking, service, groups calendars by provider,
     * delegates to each provider's update_event_from_booking_for_calendars.
     *
     * @param int $booking_id The booking ID
     * @return bool|WP_Error True on success (or if no events to update), WP_Error on failure
     */
    public static function update_event_from_connected_calendars( $booking_id ) {
        return true;
    }

    /**
     * Get the processor class name for a given provider
     *
     * @param string $provider The provider name (e.g., 'google', 'outlook')
     * @return string|null The processor class name or null if not found
     */
    protected static function get_processor_class_for_provider( $provider ) {
        return null;
    }

    /**
     * Get processor instance for a connected calendar based on its provider
     *
     * @param WBK_Connected_Calendar $connected_calendar The connected calendar instance
     * @return WBK_Connected_Calendar_Processor|null Processor instance or null if provider not supported
     */
    public static function get_processor_for_calendar( $connected_calendar ) {
        return null;
    }

    /**
     * Fetch events from a connected calendar using its provider processor.
     *
     * @param int $calendar_id WordPress connected calendar ID.
     * @param string $start_iso ISO 8601 start datetime.
     * @param string $end_iso ISO 8601 end datetime.
     * @param array $allowed_modes Allowed connected calendar modes.
     * @return array|WP_Error
     */
    public static function fetch_events_for_calendar_id(
        $calendar_id,
        $start_iso,
        $end_iso,
        $allowed_modes = ["One-way-import", "Two-ways"]
    ) {
        if ( !wbk_fs()->is__premium_only() || !wbk_fs()->can_use_premium_code() ) {
            return [];
        }
        $connected_calendar = new WBK_Connected_Calendar((int) $calendar_id);
        if ( !$connected_calendar->is_loaded() ) {
            return [];
        }
        if ( !is_array( $allowed_modes ) || empty( $allowed_modes ) ) {
            $allowed_modes = ["One-way-import", "Two-ways"];
        }
        if ( !in_array( $connected_calendar->get_mode(), $allowed_modes, true ) ) {
            return [];
        }
        $processor = self::get_processor_for_calendar( $connected_calendar );
        if ( $processor === null ) {
            return [];
        }
        return $processor->fetch_events_in_range( $start_iso, $end_iso );
    }

    /**
     * Load blockers for explicitly provided connected calendars.
     *
     * @param int $start timestamp.
     * @param int $end timestamp.
     * @param array $calendar_ids connected calendar IDs.
     * @param array $allowed_modes Allowed connected calendar modes.
     * @return array
     */
    public static function load_events_in_range_by_calendar_ids(
        $start,
        $end,
        $calendar_ids,
        $allowed_modes = ["One-way-import", "Two-ways"]
    ) {
        if ( !wbk_fs()->is__premium_only() || !wbk_fs()->can_use_premium_code() ) {
            return [];
        }
        if ( !is_array( $calendar_ids ) || empty( $calendar_ids ) ) {
            return [];
        }
        $event_data_arr = [];
        $start_iso = date( "c", $start );
        $end_iso = date( "c", $end );
        foreach ( $calendar_ids as $calendar_id ) {
            $events_result = self::fetch_events_for_calendar_id(
                $calendar_id,
                $start_iso,
                $end_iso,
                $allowed_modes
            );
            if ( is_wp_error( $events_result ) ) {
                continue;
            }
            if ( is_array( $events_result ) && !empty( $events_result ) ) {
                $event_data_arr = array_merge( $event_data_arr, $events_result );
            }
        }
        return $event_data_arr;
    }

}
