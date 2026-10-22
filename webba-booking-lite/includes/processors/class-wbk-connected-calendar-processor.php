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
        $this->id = ( $id ? intval( $id ) : null );
        $this->calendar_id = "";
        $this->provider = "";
        // Initialize calendar_id from database using id
        if ( $this->id !== null ) {
            $connected_calendar = new WBK_Connected_Calendar($this->id);
            if ( $connected_calendar->is_loaded() ) {
                $this->calendar_id = $connected_calendar->get_in_provider_id();
                $this->provider = $connected_calendar->get_provider();
            }
        }
    }

    /**
     * Get the WordPress DB ID
     *
     * @return int|null
     */
    public function get_id() {
        return $this->id;
    }

    /**
     * Set the WordPress DB ID
     *
     * @param int|string $id The WordPress DB ID
     * @return void
     */
    public function set_id( $id ) {
        $this->id = intval( $id );
        // Reload calendar_id from database
        if ( $this->id !== null ) {
            $connected_calendar = new WBK_Connected_Calendar($this->id);
            if ( $connected_calendar->is_loaded() ) {
                $this->calendar_id = $connected_calendar->get_in_provider_id();
            }
        }
    }

    /**
     * Get the provider
     *
     * @return string
     */
    public function get_provider() {
        return $this->provider;
    }

    /**
     * Get the provider calendar ID (for API operations)
     *
     * @return string
     */
    public function get_calendar_id() {
        return $this->calendar_id;
    }

    /**
     * Set the provider calendar ID
     *
     * @param string $calendar_id The provider calendar ID
     * @return void
     */
    public function set_calendar_id( $calendar_id ) {
        $this->calendar_id = ( $calendar_id ? $calendar_id : "" );
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
        if ( $this->id === null ) {
            return new WP_Error("no_calendar_id", "Calendar ID is required to get access token.");
        }
        $connected_calendar = new WBK_Connected_Calendar($this->id);
        if ( !$connected_calendar->is_loaded() ) {
            return new WP_Error("connected_calendar_not_loaded", "Connected calendar not loaded.");
        }
        return $connected_calendar;
    }

    /**
     * Get access token from cache
     * Checks if stored token exists and is valid (not expired)
     *
     * @param WBK_Connected_Calendar $connected_calendar The connected calendar instance
     * @return string|false Access token if valid, false otherwise
     */
    protected function get_access_token_from_cache( $connected_calendar ) {
        $stored_token_json = $connected_calendar->get_access_token();
        if ( empty( $stored_token_json ) ) {
            return false;
        }
        $stored_token = json_decode( $stored_token_json, true );
        if ( $stored_token && isset( $stored_token["status"] ) && $stored_token["status"] === "authorized" && isset( $stored_token["expires_at"] ) && $stored_token["expires_at"] > time() && isset( $stored_token["access_token"] ) && !empty( $stored_token["access_token"] ) ) {
            return $stored_token["access_token"];
        }
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
        // Token doesn't exist or is expired, fetch from API
        if ( !class_exists( "WBK_Webba_Connect" ) ) {
            return new WP_Error("webba_connect_not_available", "WBK_Webba_Connect class not found. Please ensure the plugin is properly installed.");
        }
        // Fetch token from API (provider-specific implementation)
        $fetch_result = $this->fetch_token_from_api();
        if ( !$fetch_result ) {
            return new WP_Error("fetch_failed", "Failed to fetch access token from webba-connect.");
        }
        // Check if the response indicates an error
        if ( isset( $fetch_result["error"] ) || isset( $fetch_result["success"] ) && $fetch_result["success"] !== true ) {
            $error_message = ( isset( $fetch_result["error"] ) ? $fetch_result["error"] : "Unknown error" );
            return new WP_Error("fetch_error", "Failed to fetch access token: " . $error_message);
        }
        // Extract token data from response
        if ( !isset( $fetch_result["access_token"] ) || empty( $fetch_result["access_token"] ) ) {
            return new WP_Error("missing_access_token", "Access token not found in webba-connect response.");
        }
        // Prepare token data (provider-specific, can be overridden)
        $token_data = $this->prepare_token_data( $fetch_result );
        // Store token locally
        $connected_calendar->set_access_token( json_encode( $token_data ) );
        $connected_calendar->save();
        return $fetch_result["access_token"];
    }

    /**
     * Fetch token from webba connect API
     * Each provider implements this method to call the appropriate API endpoint
     *
     * @return array|false API response array or false on failure
     */
    protected function fetch_token_from_api() {
        // This should be implemented by child classes
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
        // Calculate expiration timestamp from expiry_date (milliseconds) or default to 1 hour
        $expiry_date = ( isset( $fetch_result["expiry_date"] ) ? intval( $fetch_result["expiry_date"] ) : null );
        $expires_at = ( $expiry_date ? round( $expiry_date / 1000 ) - 300 : time() + 3600 );
        // Subtract 5 minutes buffer, default to 1 hour if no expiry
        return [
            "status"       => "authorized",
            "access_token" => $fetch_result["access_token"],
            "expires_at"   => $expires_at,
        ];
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
     * Returns array of WBK_Time_Slot objects representing busy time ranges.
     * Slots include title and description; Google slots also include attendees.
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
        $calendars = $this->get_calendars();
        if ( is_wp_error( $calendars ) ) {
            return $calendars;
        }
        // Format: [id => name], IDs are keys
        return array_keys( $calendars );
    }

    /**
     * Common method: Get calendar names only
     *
     * @return array|WP_Error Array of calendar names on success, WP_Error on failure
     */
    public function get_calendar_names() {
        $calendars = $this->get_calendars();
        if ( is_wp_error( $calendars ) ) {
            return $calendars;
        }
        // Format: [id => name], names are values
        return array_values( $calendars );
    }

    /**
     * Common method: Prepare event title and description from booking
     * Shared logic for processing placeholders and options
     *
     * @param int $booking_id The booking ID
     * @return array|WP_Error Array with booking data on success, WP_Error on failure
     */
    protected function prepare_event_data_from_booking( $booking_id ) {
        // Load booking
        $booking = new WBK_Booking($booking_id);
        if ( !$booking->is_loaded() ) {
            return new WP_Error("booking_not_found", "Booking not found with ID: " . $booking_id);
        }
        $service = null;
        $service_id = (int) $booking->get_service();
        if ( $service_id > 0 ) {
            $service = new WBK_Service($service_id);
            if ( !$service->is_loaded() ) {
                return new WP_Error("service_not_loaded", "Service could not be loaded for ID: " . $service_id);
            }
        } else {
            $unit_id = (int) $booking->get( "unit_id" );
            if ( $unit_id < 1 ) {
                return new WP_Error("service_not_found", "Service not found for booking ID: " . $booking_id);
            }
            $unit = new WBK_Unit($unit_id);
            if ( !$unit->is_loaded() ) {
                return new WP_Error("unit_not_loaded", "Unit could not be loaded for ID: " . $unit_id);
            }
        }
        // Get title and description from options
        $title = get_option( "wbk_gg_calendar_event_title", "#customer_name" );
        $description = get_option( "wbk_gg_calendar_event_description", "#customer_name #customer_phone" );
        // Replace {n} with newline in description
        $description = str_replace( "{n}", "\n", $description );
        // Process placeholders
        if ( class_exists( "WBK_Placeholder_Processor" ) ) {
            $title = WBK_Placeholder_Processor::process_placeholders( $title, $booking_id );
            $description = WBK_Placeholder_Processor::process_placeholders( $description, $booking_id );
        }
        // Sanitize: remove "undefined" that can appear when placeholder values
        // come from JavaScript serialization (e.g. custom fields, dropdown values)
        $title = ( is_string( $title ) ? str_replace( "undefined", "", $title ) : $title );
        $description = ( is_string( $description ) ? str_replace( "undefined", "", $description ) : $description );
        $title = trim( preg_replace( "/\\s+/", " ", $title ) );
        $description = trim( preg_replace( "/\\s+/", " ", $description ) );
        if ( $title === "" ) {
            $title = ( $booking->get_name() ?: __( "Booking", "webba-booking-lite" ) );
        }
        // Get booking date, time, and duration
        $start_timestamp = $booking->get_start();
        if ( !$start_timestamp ) {
            return new WP_Error("invalid_booking_time", "Booking has no start time");
        }
        if ( $service !== null ) {
            $duration = $service->get_duration();
        } else {
            $duration = (int) $booking->get( "duration" );
            if ( $duration < 1 ) {
                $duration = 60;
            }
        }
        return [
            "booking"         => $booking,
            "service"         => $service,
            "title"           => $title,
            "description"     => $description,
            "start_timestamp" => $start_timestamp,
            "duration"        => $duration,
        ];
    }

    /**
     * Resolve connected calendar WordPress IDs for export: service calendars, or unit calendars
     * when the booking is unit-only (service_id 0).
     *
     * @param WBK_Booking $booking Booking.
     * @return array{0: ?WBK_Service, 1: ?WBK_Unit, 2: int[]} Service (or null), unit (or null), calendar ids.
     */
    public static function get_connected_calendar_ids_for_booking( $booking ) {
        $service = new WBK_Service((int) $booking->get_service());
        if ( $service->is_loaded() ) {
            $raw = $service->get( "connected_calendars" );
            $ids = ( is_string( $raw ) ? json_decode( $raw, true ) : [] );
            if ( !is_array( $ids ) ) {
                $ids = [];
            }
            return [$service, null, array_map( "intval", $ids )];
        }
        $unit_id = (int) $booking->get( "unit_id" );
        if ( $unit_id > 0 ) {
            $unit = new WBK_Unit($unit_id);
            if ( $unit->is_loaded() ) {
                return [null, $unit, $unit->get_connected_calendars()];
            }
        }
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
        $event_data = $this->prepare_event_data_from_booking( $booking_id );
        if ( is_wp_error( $event_data ) ) {
            return $event_data;
        }
        // Create the calendar event using provider-specific implementation
        $event_id = $this->create_calendar_event(
            $event_data["start_timestamp"],
            $event_data["title"],
            $event_data["description"],
            $event_data["duration"]
        );
        // Handle result (can be string ID or array [id, meet_link] for Google Meet)
        if ( is_wp_error( $event_id ) ) {
            return $event_id;
        }
        // Extract event ID if result is an array (e.g., Google Meet returns [event_id, meet_link])
        $result_event_id = ( is_array( $event_id ) ? $event_id[0] : $event_id );
        // If event creation was successful, store the event ID in the booking
        if ( $result_event_id && $event_id_field_name ) {
            $event_data["booking"]->set( $event_id_field_name, $result_event_id );
            $event_data["booking"]->save();
        }
        return $event_id;
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
        $event_data = $this->prepare_event_data_from_booking( $booking_id );
        if ( is_wp_error( $event_data ) ) {
            return $event_data;
        }
        // Get event ID from booking
        $event_id = null;
        if ( $event_id_field_names ) {
            if ( is_array( $event_id_field_names ) ) {
                // Try multiple field names (for backward compatibility)
                foreach ( $event_id_field_names as $field_name ) {
                    $event_id = $event_data["booking"]->get( $field_name );
                    if ( !empty( $event_id ) ) {
                        break;
                    }
                }
            } else {
                $event_id = $event_data["booking"]->get( $event_id_field_names );
            }
        }
        if ( empty( $event_id ) ) {
            return new WP_Error("event_id_not_found", "Event ID not found for booking ID: " . $booking_id);
        }
        // Update the calendar event using provider-specific implementation
        return $this->update_calendar_event(
            $event_id,
            $event_data["start_timestamp"],
            $event_data["title"],
            $event_data["description"],
            $event_data["duration"]
        );
    }

    /**
     * Common method: Format timestamp to ISO 8601 with timezone
     *
     * @param int $timestamp Unix timestamp
     * @param string $timezone Timezone string (defaults to WordPress option)
     * @return string ISO 8601 formatted datetime string
     */
    protected function format_datetime( $timestamp, $timezone = null ) {
        if ( $timezone === null ) {
            $timezone = get_option( "wbk_timezone", "UTC" );
        }
        $timezone_obj = new DateTimeZone($timezone);
        $datetime_obj = new DateTime("@" . $timestamp);
        $datetime_obj->setTimezone( $timezone_obj );
        return $datetime_obj->format( "c" );
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
        if ( $timezone === null ) {
            $timezone = get_option( "wbk_timezone", "UTC" );
        }
        $timezone_obj = new DateTimeZone($timezone);
        $start_datetime_obj = new DateTime("@" . $timestamp);
        $start_datetime_obj->setTimezone( $timezone_obj );
        $start_datetime = $start_datetime_obj->format( "c" );
        $end_timestamp = $timestamp + $duration_minutes * 60;
        $end_datetime_obj = new DateTime("@" . $end_timestamp);
        $end_datetime_obj->setTimezone( $timezone_obj );
        $end_datetime = $end_datetime_obj->format( "c" );
        return [
            "start"    => $start_datetime,
            "end"      => $end_datetime,
            "timezone" => $timezone,
        ];
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
        $booking = new WBK_Booking($booking_id);
        if ( !$booking->is_loaded() ) {
            return new WP_Error("booking_not_found", "Booking not found with ID: " . $booking_id);
        }
        list( $service, $unit, $calendar_ids ) = self::get_connected_calendar_ids_for_booking( $booking );
        if ( !is_array( $calendar_ids ) || empty( $calendar_ids ) ) {
            return new WP_Error("no_calendar_ids", "No calendar IDs found for this booking");
        }
        if ( $service !== null && $service->is_loaded() ) {
            return static::process_adding_for_calendars( $booking, $service, $calendar_ids );
        }
        return static::process_adding_for_unit_booking( $booking, $calendar_ids );
    }

    /**
     * Process adding a booking to all calendar types (Google, Outlook, etc.)
     * Automatically detects calendar provider types and calls the appropriate processor
     *
     * @param int $booking_id The booking ID
     * @return void|WP_Error WP_Error on failure
     */
    public static function process_adding_all_types( $booking_id ) {
        $booking = new WBK_Booking($booking_id);
        if ( !$booking->is_loaded() ) {
            return new WP_Error("booking_not_found", "Booking not found with ID: " . $booking_id);
        }
        list( $service, $unit, $calendar_ids ) = self::get_connected_calendar_ids_for_booking( $booking );
        if ( !is_array( $calendar_ids ) || empty( $calendar_ids ) ) {
            return new WP_Error("no_calendar_ids", "No calendar IDs found for this booking");
        }
        // Group calendars by provider type
        $calendars_by_provider = [];
        foreach ( $calendar_ids as $calendar_id ) {
            $connected_calendar = new WBK_Connected_Calendar($calendar_id);
            if ( !$connected_calendar->is_loaded() ) {
                continue;
            }
            $provider = $connected_calendar->get_provider();
            if ( !isset( $calendars_by_provider[$provider] ) ) {
                $calendars_by_provider[$provider] = [];
            }
            $calendars_by_provider[$provider][] = $calendar_id;
        }
        // Process each provider type
        foreach ( $calendars_by_provider as $provider => $provider_calendar_ids ) {
            $processor_class = self::get_processor_class_for_provider( $provider );
            if ( $processor_class && class_exists( $processor_class ) ) {
                if ( $service !== null && $service->is_loaded() ) {
                    $processor_class::process_adding_for_calendars( $booking, $service, $provider_calendar_ids );
                } else {
                    $processor_class::process_adding_for_unit_booking( $booking, $provider_calendar_ids );
                }
            }
        }
    }

    /**
     * Check if the booking has an event in any connected calendar (Google or Outlook).
     *
     * @param int $booking_id The booking ID
     * @return bool True if event exists in connected calendar, false otherwise
     */
    public static function is_event_added_to_connected_calendars( $booking_id ) {
        $booking = new WBK_Booking($booking_id);
        if ( !$booking->is_loaded() ) {
            return false;
        }
        $gg_event_id = $booking->get( "gg_event_id" );
        $outlook_event_id = $booking->get( "outlook_event_id" );
        if ( empty( $gg_event_id ) ) {
            $gg_event_id = $booking->get( "appointment_gg_event_id" );
        }
        if ( empty( $outlook_event_id ) ) {
            $outlook_event_id = $booking->get( "appointment_outlook_event_id" );
        }
        return !empty( $gg_event_id ) || !empty( $outlook_event_id );
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
        $booking = new WBK_Booking($booking_id);
        if ( !$booking->is_loaded() ) {
            return new WP_Error("booking_not_found", "Booking not found with ID: " . $booking_id);
        }
        list( $service, $unit, $calendar_ids ) = self::get_connected_calendar_ids_for_booking( $booking );
        if ( !is_array( $calendar_ids ) || empty( $calendar_ids ) ) {
            return true;
        }
        // Group calendars by provider type
        $calendars_by_provider = [];
        foreach ( $calendar_ids as $calendar_id ) {
            $connected_calendar = new WBK_Connected_Calendar($calendar_id);
            if ( !$connected_calendar->is_loaded() ) {
                continue;
            }
            $provider = $connected_calendar->get_provider();
            if ( !isset( $calendars_by_provider[$provider] ) ) {
                $calendars_by_provider[$provider] = [];
            }
            $calendars_by_provider[$provider][] = $calendar_id;
        }
        $errors = [];
        foreach ( $calendars_by_provider as $provider => $provider_calendar_ids ) {
            $processor_class = self::get_processor_class_for_provider( $provider );
            if ( $processor_class && class_exists( $processor_class ) ) {
                $result = $processor_class::delete_event_from_booking_for_calendars( $booking, $provider_calendar_ids );
                if ( is_wp_error( $result ) ) {
                    $errors[] = $result->get_error_message();
                }
            }
        }
        if ( !empty( $errors ) ) {
            return new WP_Error("delete_failed", "Failed to delete from connected calendars: " . implode( "; ", $errors ));
        }
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
        $booking = new WBK_Booking($booking_id);
        if ( !$booking->is_loaded() ) {
            return new WP_Error("booking_not_found", "Booking not found with ID: " . $booking_id);
        }
        list( $service, $unit, $calendar_ids ) = self::get_connected_calendar_ids_for_booking( $booking );
        if ( !is_array( $calendar_ids ) || empty( $calendar_ids ) ) {
            return true;
        }
        // Group calendars by provider type
        $calendars_by_provider = [];
        foreach ( $calendar_ids as $calendar_id ) {
            $connected_calendar = new WBK_Connected_Calendar($calendar_id);
            if ( !$connected_calendar->is_loaded() ) {
                continue;
            }
            $provider = $connected_calendar->get_provider();
            if ( !isset( $calendars_by_provider[$provider] ) ) {
                $calendars_by_provider[$provider] = [];
            }
            $calendars_by_provider[$provider][] = $calendar_id;
        }
        $errors = [];
        foreach ( $calendars_by_provider as $provider => $provider_calendar_ids ) {
            $processor_class = self::get_processor_class_for_provider( $provider );
            if ( $processor_class && class_exists( $processor_class ) ) {
                $result = $processor_class::update_event_from_booking_for_calendars( $booking, $service, $provider_calendar_ids );
                if ( is_wp_error( $result ) ) {
                    $errors[] = $result->get_error_message();
                }
            }
        }
        if ( !empty( $errors ) ) {
            return new WP_Error("update_failed", "Failed to update in connected calendars: " . implode( "; ", $errors ));
        }
        return true;
    }

    /**
     * Get the processor class name for a given provider
     *
     * @param string $provider The provider name (e.g., 'google', 'outlook')
     * @return string|null The processor class name or null if not found
     */
    protected static function get_processor_class_for_provider( $provider ) {
        return ( isset( $provider_map[$provider] ) ? $provider_map[$provider] : null );
    }

    /**
     * Get processor instance for a connected calendar based on its provider
     *
     * @param WBK_Connected_Calendar $connected_calendar The connected calendar instance
     * @return WBK_Connected_Calendar_Processor|null Processor instance or null if provider not supported
     */
    public static function get_processor_for_calendar( $connected_calendar ) {
        $provider = $connected_calendar->get_provider();
        $processor_class = self::get_processor_class_for_provider( $provider );
        if ( $processor_class === null || !class_exists( $processor_class ) ) {
            return null;
        }
        return new $processor_class($connected_calendar->get_id());
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
        if ( !is_array( $calendar_ids ) || empty( $calendar_ids ) ) {
            return [];
        }
        $calendar_ids = array_values( array_unique( array_filter( array_map( "intval", $calendar_ids ), function ( $calendar_id ) {
            return $calendar_id > 0;
        } ) ) );
        if ( empty( $calendar_ids ) ) {
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
