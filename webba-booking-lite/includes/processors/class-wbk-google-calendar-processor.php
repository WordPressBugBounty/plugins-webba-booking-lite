<?php

use PHPUnit\Runner\AfterIncompleteTestHook;

use function PHPUnit\Framework\assertFalse;

if (!defined("ABSPATH")) {
    exit();
}

class WBK_Google_Calendar_Processor extends WBK_Connected_Calendar_Processor
{
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
    public function __construct($id = null)
    {
        parent::__construct($id);

        // Initialize connected calendar
        if ($this->id !== null) {
            $this->connected_calendar = new WBK_Connected_Calendar($this->id);
        } else {
            $this->connected_calendar = null;
        }
    }

    /**
     * Set the WordPress DB ID and reinitialize connected calendar
     *
     * @param int|string $id The WordPress DB ID
     * @return void
     */
    public function set_id($id)
    {
        parent::set_id($id);

        // Reinitialize connected calendar
        if ($this->id !== null) {
            $this->connected_calendar = new WBK_Connected_Calendar($this->id);
        } else {
            $this->connected_calendar = null;
        }
    }

    /**
     * Get access token, with support for both legacy and webba connect methods
     *
     * @return string|WP_Error Access token on success, WP_Error on failure
     */
    public function get_access_token()
    {
        // Ensure connected calendar is initialized
        if ($this->connected_calendar === null) {
            if ($this->id === null) {
                return new WP_Error(
                    "no_calendar_id",
                    "Calendar ID is required to get access token.",
                );
            }
            $this->connected_calendar = new WBK_Connected_Calendar($this->id);
        }

        if (!$this->connected_calendar->is_loaded()) {
            return new WP_Error(
                "connected_calendar_not_loaded",
                "Connected calendar not loaded.",
            );
        }

        // Check if using easy auth (webba connect) or legacy method
        if ($this->connected_calendar->get_easy_auth() === true) {
            // Check cache first
            $cached_token = $this->get_access_token_from_cache($this->connected_calendar);
            if ($cached_token !== false) {
                return $cached_token;
            }

            // Cache expired or missing, fetch from webba connect and store in cache
            return $this->get_access_token_from_webba_connect($this->connected_calendar);
        } else {
            return $this->get_google_access_token_legacy();
        }

        return new WP_Error("unknown_provider", "Unknown calendar provider.");
    }

    /**
     * Fetch token from webba connect API for Google
     *
     * @return array|false API response array or false on failure
     */
    protected function fetch_token_from_api()
    {
        $webba_connect = new WBK_Webba_Connect();
        return $webba_connect->fetch_access_token_from_webba_connect(
            $this->id !== null ? strval($this->id) : "",
            "google",
        );
    }

    /**
     * Get Google Calendar access token from legacy storage (wp_options and wbk_gg_calendars table)
     * Checks if token is expired and refreshes it if needed
     *
     * @return string|WP_Error Access token on success, WP_Error on failure
     */
    protected function get_google_access_token_legacy()
    {
        // Check if Google API client is available
        $google_api_version = get_option("wbk_gg_client_version", "2.5");
        $google_api_path =
            __DIR__ .
            DIRECTORY_SEPARATOR .
            ".." .
            DIRECTORY_SEPARATOR .
            "third-parties" .
            DIRECTORY_SEPARATOR .
            "api" .
            DIRECTORY_SEPARATOR .
            "google_api" .
            DIRECTORY_SEPARATOR .
            "google-api-{$google_api_version}" .
            DIRECTORY_SEPARATOR .
            "vendor" .
            DIRECTORY_SEPARATOR .
            "autoload.php";

        if (file_exists($google_api_path)) {
            require_once $google_api_path;
        }

        if (!class_exists("Google_Client")) {
            return new WP_Error(
                "google_client_not_available",
                "Google API client library is not available.",
            );
        }

        // Get access token from legacy wbk_gg_calendars table
        global $wpdb;
        $table_name = get_option("wbk_db_prefix", "") . "wbk_connected_calendars";

        if ($this->id === null) {
            return new WP_Error(
                "no_calendar_id",
                "Calendar ID is required for legacy access token retrieval.",
            );
        }

        $access_token_json = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT access_token FROM {$table_name} WHERE id = %d",
                $this->id,
            ),
        );

        if (empty($access_token_json)) {
            return new WP_Error(
                "legacy_token_not_found",
                "Legacy access token not found for calendar ID: " . $this->id,
            );
        }

        // Parse token data
        $token_data = json_decode($access_token_json, true);
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($token_data)) {
            // If not valid JSON, return as-is (might be plain token)
            return $access_token_json;
        }

        // Get credentials from wp_options
        $credentials = [get_option("wbk_gg_clientid", ""), get_option("wbk_gg_secret", "")];
        $credentials = apply_filters("wbk_gg_credentials", $credentials);
        $client_id = $credentials[0];
        $client_secret = $credentials[1];

        if (empty($client_id) || empty($client_secret)) {
            return new WP_Error(
                "credentials_not_set",
                "Google Calendar credentials are not configured.",
            );
        }

        try {
            // Initialize Google Client
            $client = new Google_Client();
            $client->setClientId($client_id);
            $client->setClientSecret($client_secret);
            $client->setApplicationName("Webba Booking");
            $client->setScopes([
                Google_Service_Calendar::CALENDAR_READONLY,
                Google_Service_Calendar::CALENDAR_EVENTS,
            ]);
            $client->setAccessType("offline");
            $client->setPrompt("consent");
            $client->setApprovalPrompt("force");

            // Set the access token
            $client->setAccessToken($access_token_json);

            // Check if token is expired and refresh if needed
            if ($client->isAccessTokenExpired()) {
                $refresh_token = $client->getRefreshToken();
                if (empty($refresh_token)) {
                    return new WP_Error(
                        "refresh_token_missing",
                        "Refresh token is missing. Re-authorization required.",
                    );
                }

                // Refresh the token
                $refreshed_token_data = $client->fetchAccessTokenWithRefreshToken(
                    $refresh_token,
                );

                if (isset($refreshed_token_data["error"])) {
                    return new WP_Error(
                        "token_refresh_failed",
                        "Failed to refresh access token: " . $refreshed_token_data["error"],
                    );
                }

                // Save the refreshed token back to database
                $refreshed_token_json = json_encode($refreshed_token_data);
                $wpdb->update(
                    $table_name,
                    ["access_token" => $refreshed_token_json],
                    ["id" => $this->id],
                    ["%s"],
                    ["%d"],
                );

                // Update token_data with refreshed data
                $token_data = $refreshed_token_data;
            }

            // Return the access token string
            if (isset($token_data["access_token"])) {
                return $token_data["access_token"];
            }

            return new WP_Error(
                "invalid_token_format",
                "Access token not found in token data.",
            );
        } catch (\Exception $e) {
            return new WP_Error(
                "token_processing_error",
                "Error processing access token: " . $e->getMessage(),
            );
        }
        return new WP_Error(
            "premium_required",
            "Premium features are required for legacy Google Calendar integration.",
        );
    }

    /**
     * Get Outlook Calendar access token from webba connect
     *
     * @return string|WP_Error Access token on success, WP_Error on failure
     */
    protected function get_outlook_access_token()
    {
        if (!class_exists("WBK_Webba_Connect")) {
            return new WP_Error(
                "webba_connect_not_available",
                "WBK_Webba_Connect class not found. Please ensure the plugin is properly installed.",
            );
        }

        $webba_connect = new WBK_Webba_Connect();
        // Use id (WordPress DB ID) for fetching access token from Webba Connect
        $fetch_result = $webba_connect->fetch_access_token_from_webba_connect(
            $this->id !== null ? strval($this->id) : "",
        );

        if (!$fetch_result) {
            return new WP_Error(
                "fetch_failed",
                "Failed to fetch access token from webba-connect.",
            );
        }

        // Check if the response indicates an error
        if (
            isset($fetch_result["error"]) ||
            (isset($fetch_result["success"]) && $fetch_result["success"] !== true)
        ) {
            $error_message = isset($fetch_result["error"])
                ? $fetch_result["error"]
                : "Unknown error";
            return new WP_Error(
                "fetch_error",
                "Failed to fetch access token: " . $error_message,
            );
        }

        // Extract token data from response
        if (!isset($fetch_result["access_token"]) || empty($fetch_result["access_token"])) {
            return new WP_Error(
                "missing_access_token",
                "Access token not found in webba-connect response.",
            );
        }

        return $fetch_result["access_token"];
    }

    /**
     * Check if the access token is valid by making a lightweight API call
     *
     * @return bool|WP_Error True if token is valid, false if invalid, WP_Error on error
     */
    public function check_access_token()
    {
        // Get access token (will refresh if expired for legacy tokens)
        $access_token_result = $this->get_access_token();

        if (is_wp_error($access_token_result)) {
            return false;
        }

        // Handle both string and array formats (backward compatibility)
        $access_token =
            is_array($access_token_result) && isset($access_token_result["access_token"])
                ? $access_token_result["access_token"]
                : $access_token_result;

        if (empty($access_token)) {
            return false;
        }

        // Make a lightweight API call to verify token validity
        // Using calendarList with maxResults=1 to minimize API usage
        $api_endpoint =
            "https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=1";

        $response = wp_remote_get($api_endpoint, [
            "headers" => [
                "Authorization" => "Bearer " . $access_token,
                "Content-Type" => "application/json",
            ],
        ]);

        if (is_wp_error($response)) {
            return false;
        }

        $response_code = wp_remote_retrieve_response_code($response);

        // Token is valid if we get a 200 response
        if ($response_code === 200) {
            return true;
        }

        // Token is invalid if we get 401 Unauthorized
        if ($response_code === 401) {
            return false;
        }

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
        // Get access token (will refresh if expired)
        $access_token_result = $this->get_access_token();

        if (is_wp_error($access_token_result)) {
            return $access_token_result;
        }

        // Handle both string and array formats (backward compatibility)
        $access_token =
            is_array($access_token_result) && isset($access_token_result["access_token"])
                ? $access_token_result["access_token"]
                : $access_token_result;

        // Format start and end times using helper method
        $datetime_data = $this->format_start_end_datetime($timestamp, $duration_minutes);
        $start_datetime = $datetime_data["start"];
        $end_datetime = $datetime_data["end"];
        $timezone = $datetime_data["timezone"];

        // Determine calendar ID (use 'primary' if not specified)
        $calendar_id = $this->get_calendar_id();
        $calendar_id_for_api = !empty($calendar_id) ? urlencode($calendar_id) : "primary";

        // Prepare event data for Google Calendar API
        $event_data = [
            "summary" => $title,
            "extendedProperties" => [
                "private" => [
                    "createdby" => get_option("wbk_gg_created_by", "webba_booking"),
                ],
            ],
            "start" => [
                "dateTime" => $start_datetime,
                "timeZone" => $timezone,
            ],
            "end" => [
                "dateTime" => $end_datetime,
                "timeZone" => $timezone,
            ],
        ];

        // Add description if provided
        if (!empty($description)) {
            $event_data["description"] = $description;
        }

        // Add attendees if provided
        if (!empty($attendee_emails)) {
            $attendees = [];
            foreach ($attendee_emails as $email) {
                if (!empty($email)) {
                    $attendees[] = ["email" => $email];
                }
            }
            if (!empty($attendees)) {
                $event_data["attendees"] = $attendees;
            }
        }

        // Add Google Meet conference data if enabled
        if ($google_meet_enabled) {
            $event_data["conferenceData"] = [
                "createRequest" => [
                    "conferenceSolutionKey" => [
                        "type" => "hangoutsMeet",
                    ],
                    "requestId" => uniqid(),
                ],
            ];
        }

        $api_endpoint =
            "https://www.googleapis.com/calendar/v3/calendars/" .
            $calendar_id_for_api .
            "/events";

        // Add conferenceDataVersion parameter if Google Meet is enabled
        $query_params = [];
        if ($google_meet_enabled) {
            $query_params["conferenceDataVersion"] = 1;
        }
        if (!empty($query_params)) {
            $api_endpoint .= "?" . http_build_query($query_params);
        }

        $response = wp_remote_post($api_endpoint, [
            "headers" => [
                "Authorization" => "Bearer " . $access_token,
                "Content-Type" => "application/json",
            ],
            "body" => json_encode($event_data),
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);

        if ($response_code !== 200) {
            return new WP_Error(
                "event_creation_failed",
                "Failed to create calendar event",
                [
                    "status" => $response_code,
                    "body" => $response_body,
                ],
            );
        }

        $event_result = json_decode($response_body, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return new WP_Error(
                "json_parse_error",
                "Failed to parse event creation response",
                [
                    "body" => $response_body,
                ],
            );
        }

        if (!isset($event_result["id"])) {
            return new WP_Error(
                "missing_event_id",
                "Event creation response missing event ID",
                [
                    "response" => $event_result,
                ],
            );
        }

        // Extract meet link if Google Meet is enabled
        $meet_link = null;
        if ($google_meet_enabled && isset($event_result["conferenceData"])) {
            $conference_data = $event_result["conferenceData"];
            if (
                isset($conference_data["entryPoints"]) &&
                is_array($conference_data["entryPoints"])
            ) {
                foreach ($conference_data["entryPoints"] as $entry_point) {
                    if (
                        isset($entry_point["entryPointType"]) &&
                        $entry_point["entryPointType"] === "video"
                    ) {
                        $meet_link = isset($entry_point["uri"])
                            ? $entry_point["uri"]
                            : null;
                        break;
                    }
                }
            }
        }

        // Return meet link if available, otherwise just event ID
        if ($meet_link !== null) {
            return [$event_result["id"], $meet_link];
        }

        return $event_result["id"];
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
        if ($event_id_field_name === null) {
            $event_id_field_name = "gg_event_id";
        }

        $event_data = $this->prepare_event_data_from_booking($booking_id);

        if (is_wp_error($event_data)) {
            return $event_data;
        }

        // Create the calendar event with Google Meet support
        $event_result = $this->create_calendar_event(
            $event_data["start_timestamp"],
            $event_data["title"],
            $event_data["description"],
            $event_data["duration"],
            $google_meet_enabled,
            $attendee_emails,
        );

        // Handle result (can be string ID or array [id, meet_link])
        if (is_wp_error($event_result)) {
            return $event_result;
        }

        $event_id = is_array($event_result) ? $event_result[0] : $event_result;
        $meet_link =
            is_array($event_result) && isset($event_result[1]) ? $event_result[1] : null;

        // Store event ID in booking
        if ($event_id && $event_id_field_name) {
            $event_data["booking"]->set($event_id_field_name, $event_id);
            $event_data["booking"]->save();
        }

        // Store meet link if available
        if ($meet_link !== null) {
            $event_data["booking"]->set("google_meet_link", $meet_link);
            $event_data["booking"]->save();
        }

        return $event_result;
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
        // Get access token (will refresh if expired)
        $access_token_result = $this->get_access_token();

        if (is_wp_error($access_token_result)) {
            return $access_token_result;
        }

        // Handle both string and array formats (backward compatibility)
        $access_token =
            is_array($access_token_result) && isset($access_token_result["access_token"])
                ? $access_token_result["access_token"]
                : $access_token_result;

        // Format start and end times using helper method
        $datetime_data = $this->format_start_end_datetime($timestamp, $duration_minutes);
        $start_datetime = $datetime_data["start"];
        $end_datetime = $datetime_data["end"];
        $timezone = $datetime_data["timezone"];

        // Determine calendar ID (use 'primary' if not specified)
        $calendar_id = $this->get_calendar_id();
        $calendar_id_for_api = !empty($calendar_id) ? urlencode($calendar_id) : "primary";

        // Prepare event data for Google Calendar API
        $event_data = [
            "summary" => $title,
            "extendedProperties" => [
                "private" => [
                    "createdby" => get_option("wbk_gg_created_by", "webba_booking"),
                ],
            ],
            "start" => [
                "dateTime" => $start_datetime,
                "timeZone" => $timezone,
            ],
            "end" => [
                "dateTime" => $end_datetime,
                "timeZone" => $timezone,
            ],
        ];

        // Add description if provided
        if (!empty($description)) {
            $event_data["description"] = $description;
        }

        // Get existing event to preserve conference data if Google Meet is enabled
        $existing_event = null;
        if ($google_meet_enabled) {
            $existing_event_result = $this->get_calendar_event($event_id);
            if (!is_wp_error($existing_event_result)) {
                $existing_event = $existing_event_result;
            }
        }

        // Handle attendees - merge existing and new ones
        $all_attendees = [];
        if (
            $google_meet_enabled &&
            $existing_event &&
            isset($existing_event["attendees"])
        ) {
            // Preserve existing attendees
            foreach ($existing_event["attendees"] as $existing_attendee) {
                if (isset($existing_attendee["email"])) {
                    $all_attendees[$existing_attendee["email"]] = $existing_attendee;
                }
            }
        }
        // Add new attendees
        foreach ($attendee_emails as $email) {
            if (!empty($email)) {
                $all_attendees[$email] = ["email" => $email];
            }
        }
        if (!empty($all_attendees)) {
            $event_data["attendees"] = array_values($all_attendees);
        }

        // Handle Google Meet conference data
        if ($google_meet_enabled) {
            // Preserve existing conference data if available
            if ($existing_event && isset($existing_event["conferenceData"])) {
                $event_data["conferenceData"] = $existing_event["conferenceData"];
            } else {
                // Create new conference data
                $event_data["conferenceData"] = [
                    "createRequest" => [
                        "conferenceSolutionKey" => [
                            "type" => "hangoutsMeet",
                        ],
                        "requestId" => uniqid(),
                    ],
                ];
            }
        }

        $api_endpoint =
            "https://www.googleapis.com/calendar/v3/calendars/" .
            $calendar_id_for_api .
            "/events/" .
            urlencode($event_id);

        // Add conferenceDataVersion parameter if Google Meet is enabled
        $query_params = [];
        if ($google_meet_enabled) {
            $query_params["conferenceDataVersion"] = 1;
        }
        if (!empty($query_params)) {
            $api_endpoint .= "?" . http_build_query($query_params);
        }

        $response = wp_remote_request($api_endpoint, [
            "method" => "PUT",
            "headers" => [
                "Authorization" => "Bearer " . $access_token,
                "Content-Type" => "application/json",
            ],
            "body" => json_encode($event_data),
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);

        if ($response_code !== 200) {
            return new WP_Error("event_update_failed", "Failed to update calendar event", [
                "status" => $response_code,
                "body" => $response_body,
            ]);
        }

        $event_result = json_decode($response_body, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return new WP_Error(
                "json_parse_error",
                "Failed to parse event update response",
                [
                    "body" => $response_body,
                ],
            );
        }

        if (!isset($event_result["id"])) {
            return new WP_Error(
                "missing_event_id",
                "Event update response missing event ID",
                [
                    "response" => $event_result,
                ],
            );
        }

        // Extract meet link if Google Meet is enabled
        $meet_link = null;
        if ($google_meet_enabled && isset($event_result["conferenceData"])) {
            $conference_data = $event_result["conferenceData"];
            if (
                isset($conference_data["entryPoints"]) &&
                is_array($conference_data["entryPoints"])
            ) {
                foreach ($conference_data["entryPoints"] as $entry_point) {
                    if (
                        isset($entry_point["entryPointType"]) &&
                        $entry_point["entryPointType"] === "video"
                    ) {
                        $meet_link = isset($entry_point["uri"])
                            ? $entry_point["uri"]
                            : null;
                        break;
                    }
                }
            }
        }

        // Return meet link if available, otherwise just event ID
        if ($meet_link !== null) {
            return [$event_result["id"], $meet_link];
        }

        return $event_result["id"];
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
        if ($event_id_field_names === null) {
            $event_id_field_names = ["appointment_gg_event_id", "gg_event_id"];
        }

        $event_data = $this->prepare_event_data_from_booking($booking_id);

        if (is_wp_error($event_data)) {
            return $event_data;
        }

        // Get event ID from booking
        $event_id = null;
        if ($event_id_field_names) {
            if (is_array($event_id_field_names)) {
                // Try multiple field names (for backward compatibility)
                foreach ($event_id_field_names as $field_name) {
                    $event_id = $event_data["booking"]->get($field_name);
                    if (!empty($event_id)) {
                        break;
                    }
                }
            } else {
                $event_id = $event_data["booking"]->get($event_id_field_names);
            }
        }

        if (empty($event_id)) {
            return new WP_Error(
                "event_id_not_found",
                "Event ID not found for booking ID: " . $booking_id,
            );
        }

        // Update the calendar event with Google Meet support
        $event_result = $this->update_calendar_event(
            $event_id,
            $event_data["start_timestamp"],
            $event_data["title"],
            $event_data["description"],
            $event_data["duration"],
            $google_meet_enabled,
            $attendee_emails,
        );

        // Handle result (can be string ID or array [id, meet_link])
        if (is_wp_error($event_result)) {
            return $event_result;
        }

        $result_event_id = is_array($event_result) ? $event_result[0] : $event_result;
        $meet_link =
            is_array($event_result) && isset($event_result[1]) ? $event_result[1] : null;

        // Store meet link if available
        if ($meet_link !== null) {
            $event_data["booking"]->set("google_meet_link", $meet_link);
            $event_data["booking"]->save();
        }

        return $event_result;
    }

    /**
     * Delete a calendar event from Google Calendar by event ID
     *
     * @param string $event_id The Google Calendar event ID to delete
     * @return bool|WP_Error True on success, WP_Error on failure
     */
    public function delete_calendar_event($event_id)
    {
        if (empty($event_id)) {
            return new WP_Error("invalid_event_id", "Event ID cannot be empty");
        }

        // Get access token (will refresh if expired)
        $access_token_result = $this->get_access_token();

        if (is_wp_error($access_token_result)) {
            return $access_token_result;
        }

        // Handle both string and array formats (backward compatibility)
        $access_token =
            is_array($access_token_result) && isset($access_token_result["access_token"])
                ? $access_token_result["access_token"]
                : $access_token_result;

        // Determine calendar ID (use 'primary' if not specified)
        $calendar_id = $this->get_calendar_id();
        $calendar_id_for_api = !empty($calendar_id) ? urlencode($calendar_id) : "primary";

        $api_endpoint =
            "https://www.googleapis.com/calendar/v3/calendars/" .
            $calendar_id_for_api .
            "/events/" .
            urlencode($event_id);

        $response = wp_remote_request($api_endpoint, [
            "method" => "DELETE",
            "headers" => [
                "Authorization" => "Bearer " . $access_token,
                "Content-Type" => "application/json",
            ],
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);

        // Google Calendar API returns 204 No Content on successful deletion
        if ($response_code !== 204 && $response_code !== 200) {
            return new WP_Error(
                "event_deletion_failed",
                "Failed to delete calendar event",
                [
                    "status" => $response_code,
                    "body" => $response_body,
                ],
            );
        }

        return true;
    }

    /**
     * Get all calendars for the authenticated user
     *
     * @return array|WP_Error Array of calendars with 'id' and 'name' on success, WP_Error on failure
     */
    public function get_calendars()
    {
        // Get access token (will refresh if expired)
        $access_token_result = $this->get_access_token();

        if (is_wp_error($access_token_result)) {
            return new WP_Error("calendars_fetch_failed", "Failed to fetch calendars", []);
        }

        // Handle both string and array formats (backward compatibility)
        $access_token =
            is_array($access_token_result) && isset($access_token_result["access_token"])
                ? $access_token_result["access_token"]
                : $access_token_result;

        $api_endpoint = "https://www.googleapis.com/calendar/v3/users/me/calendarList";

        $response = wp_remote_get($api_endpoint, [
            "headers" => [
                "Authorization" => "Bearer " . $access_token,
                "Content-Type" => "application/json",
            ],
        ]);

        if (is_wp_error($response)) {
            return new WP_Error("calendars_fetch_failed", "Failed to fetch calendars", []);
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);

        if ($response_code !== 200) {
            return new WP_Error("calendars_fetch_failed", "Failed to fetch calendars", [
                "status" => $response_code,
                "body" => $response_body,
            ]);
        }

        $calendars_data = json_decode($response_body, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return new WP_Error(
                "calendars_fetch_failed",
                "Failed to parse calendars response",
                [
                    "body" => $response_body,
                ],
            );
        }

        if (!isset($calendars_data["items"]) || !is_array($calendars_data["items"])) {
            return new WP_Error(
                "calendars_fetch_failed",
                "Calendars response missing items array",
                [
                    "response" => $calendars_data,
                ],
            );
        }

        // Add the primary calendar first
        $primary_api_endpoint = "https://www.googleapis.com/calendar/v3/calendars/primary";
        $primary_response = wp_remote_get($primary_api_endpoint, [
            "headers" => [
                "Authorization" => "Bearer " . $access_token,
                "Content-Type" => "application/json",
            ],
        ]);

        $calendars = [];
        $primary_summary = null;

        if (
            !is_wp_error($primary_response) &&
            wp_remote_retrieve_response_code($primary_response) === 200
        ) {
            $primary_data = json_decode(wp_remote_retrieve_body($primary_response), true);
            if (isset($primary_data["summary"])) {
                $primary_summary = $primary_data["summary"];
                $calendars["primary"] = $primary_summary;
            }
        }

        // Add other calendars (excluding primary to avoid duplication)
        foreach ($calendars_data["items"] as $calendar) {
            if (isset($calendar["id"]) && isset($calendar["summary"])) {
                if (
                    $primary_summary === null ||
                    $calendar["summary"] !== $primary_summary
                ) {
                    $calendars[$calendar["id"]] = $calendar["summary"];
                }
            }
        }

        return $calendars;
        return new WP_Error("calendars_fetch_failed", "Failed to fetch calendars", []);
    }

    /**
     * Get a specific calendar by ID
     *
     * @param string $calendar_id The calendar ID
     * @return array|WP_Error Calendar data with 'id' and 'name' on success, WP_Error on failure
     */
    public function get_calendar_by_id($calendar_id)
    {
        // Get access token (will refresh if expired)
        $access_token_result = $this->get_access_token();

        if (is_wp_error($access_token_result)) {
            return $access_token_result;
        }

        // Handle both string and array formats (backward compatibility)
        $access_token =
            is_array($access_token_result) && isset($access_token_result["access_token"])
                ? $access_token_result["access_token"]
                : $access_token_result;

        $api_endpoint =
            "https://www.googleapis.com/calendar/v3/calendars/" . urlencode($calendar_id);

        $response = wp_remote_get($api_endpoint, [
            "headers" => [
                "Authorization" => "Bearer " . $access_token,
                "Content-Type" => "application/json",
            ],
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);

        if ($response_code !== 200) {
            return new WP_Error("calendar_fetch_failed", "Failed to fetch calendar", [
                "status" => $response_code,
                "body" => $response_body,
            ]);
        }

        $calendar_data = json_decode($response_body, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return new WP_Error("json_parse_error", "Failed to parse calendar response", [
                "body" => $response_body,
            ]);
        }

        if (!isset($calendar_data["id"]) || !isset($calendar_data["summary"])) {
            return new WP_Error(
                "invalid_response",
                "Calendar response missing id or summary",
                [
                    "response" => $calendar_data,
                ],
            );
        }

        return [
            "id" => $calendar_data["id"],
            "name" => $calendar_data["summary"],
        ];
    }

    /**
     * Fetch calendar events in a date range for availability blocking
     * Returns array of WBK_Time_Slot objects representing busy time ranges,
     * including title, description, and attendees.
     *
     * @param string $start ISO 8601 formatted start datetime
     * @param string $end ISO 8601 formatted end datetime
     * @return array|WP_Error Array of WBK_Time_Slot on success, WP_Error on failure
     */
    public function fetch_events_in_range($start, $end)
    {
        $access_token_result = $this->get_access_token();

        if (is_wp_error($access_token_result)) {
            return $access_token_result;
        }

        $access_token =
            is_array($access_token_result) && isset($access_token_result["access_token"])
                ? $access_token_result["access_token"]
                : $access_token_result;

        $calendar_id = $this->get_calendar_id();
        $calendar_id_for_api = !empty($calendar_id) ? urlencode($calendar_id) : "primary";

        $api_endpoint =
            "https://www.googleapis.com/calendar/v3/calendars/" .
            $calendar_id_for_api .
            "/events?" .
            http_build_query([
                "singleEvents" => "true",
                "timeMin" => $start,
                "timeMax" => $end,
                "maxResults" => 2000,
            ]);

        $response = wp_remote_get($api_endpoint, [
            "headers" => [
                "Authorization" => "Bearer " . $access_token,
                "Content-Type" => "application/json",
            ],
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);

        if ($response_code !== 200) {
            return new WP_Error("events_fetch_failed", "Failed to fetch calendar events", [
                "status" => $response_code,
                "body" => $response_body,
            ]);
        }

        $events_data = json_decode($response_body, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return new WP_Error("json_parse_error", "Failed to parse events response", [
                "body" => $response_body,
            ]);
        }

        $result = [];
        $items =
            isset($events_data["items"]) && is_array($events_data["items"])
                ? $events_data["items"]
                : [];

        foreach ($items as $event) {
            if (
                isset($event["transparency"]) &&
                $event["transparency"] === "transparent" &&
                get_option("wbk_gg_ignore_free", "no") === "yes"
            ) {
                continue;
            }
            if (isset($event["extendedProperties"]["private"]["createdby"])) {
                if (
                    $event["extendedProperties"]["private"]["createdby"] ===
                        get_option("wbk_gg_created_by", "webba_booking") &&
                    get_option("wbk_ignore_webba_events", "yes") === "yes"
                ) {
                    $event_id_parts = isset($event["id"]) ? explode("_", $event["id"]) : [];
                    if (count($event_id_parts) !== 2) {
                        continue;
                    }
                }
            }

            $event_start = "";
            if (isset($event["start"]["dateTime"])) {
                $event_start = $event["start"]["dateTime"];
            } elseif (isset($event["start"]["date"])) {
                $event_start = $event["start"]["date"];
            }
            $event_end = "";
            if (isset($event["end"]["dateTime"])) {
                $event_end = $event["end"]["dateTime"];
            } elseif (isset($event["end"]["date"])) {
                $event_end = $event["end"]["date"];
            }

            if (empty($event_start) || empty($event_end)) {
                continue;
            }

            $start_ts = strtotime($event_start);
            $end_ts = strtotime($event_end);
            $slot = new WBK_Time_Slot($start_ts, $end_ts);
            $slot->set_title(isset($event["summary"]) ? $event["summary"] : "");
            $slot->set_description(
                isset($event["description"]) ? $event["description"] : ""
            );

            $attendees = [];
            if (isset($event["attendees"]) && is_array($event["attendees"])) {
                foreach ($event["attendees"] as $attendee) {
                    if (empty($attendee["email"])) {
                        continue;
                    }
                    $mapped_attendee = [
                        "email" => $attendee["email"],
                    ];
                    if (!empty($attendee["displayName"])) {
                        $mapped_attendee["displayName"] = $attendee["displayName"];
                    }
                    if (!empty($attendee["responseStatus"])) {
                        $mapped_attendee["responseStatus"] = $attendee["responseStatus"];
                    }
                    $attendees[] = $mapped_attendee;
                }
            }
            $slot->set_attendees($attendees);

            $result[] = $slot;
        }

        return $result;
        return new WP_Error("events_fetch_failed", "Premium features are required.");
    }

    /**
     * Get a calendar event from Google Calendar API by event ID
     *
     * @param string $event_id The event ID to retrieve
     * @return array|WP_Error Event data on success, WP_Error on failure
     */
    public function get_calendar_event($event_id)
    {
        if (empty($event_id)) {
            return new WP_Error("invalid_event_id", "Event ID cannot be empty");
        }

        // Get access token (will refresh if expired)
        $access_token_result = $this->get_access_token();

        if (is_wp_error($access_token_result)) {
            return $access_token_result;
        }

        // Handle both string and array formats (backward compatibility)
        $access_token =
            is_array($access_token_result) && isset($access_token_result["access_token"])
                ? $access_token_result["access_token"]
                : $access_token_result;

        // Determine calendar ID (use 'primary' if not specified)
        $calendar_id = $this->get_calendar_id();
        $calendar_id_for_api = !empty($calendar_id) ? urlencode($calendar_id) : "primary";

        $api_endpoint =
            "https://www.googleapis.com/calendar/v3/calendars/" .
            $calendar_id_for_api .
            "/events/" .
            urlencode($event_id);

        $response = wp_remote_get($api_endpoint, [
            "headers" => [
                "Authorization" => "Bearer " . $access_token,
                "Content-Type" => "application/json",
            ],
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);

        if ($response_code !== 200) {
            return new WP_Error("event_fetch_failed", "Failed to fetch calendar event", [
                "status" => $response_code,
                "body" => $response_body,
            ]);
        }

        $event_result = json_decode($response_body, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return new WP_Error("json_parse_error", "Failed to parse event response", [
                "body" => $response_body,
            ]);
        }

        return $event_result;
    }

    /**
     * Prepare aggregated event data from multiple bookings for group services
     *
     * @param array $booking_ids Array of booking IDs
     * @param int $service_id The service ID
     * @return array|WP_Error Array with 'title', 'description', 'start_timestamp', 'duration' on success, WP_Error on failure
     */
    protected static function prepare_group_event_data($booking_ids, $service_id)
    {
        if (empty($booking_ids)) {
            return new WP_Error("no_bookings", "No booking IDs provided");
        }

        $title_arr = [];
        $description_arr = [];
        $start_timestamp = null;
        $duration = null;

        foreach ($booking_ids as $booking_id) {
            $booking = new WBK_Booking($booking_id);
            if (!$booking->is_loaded()) {
                continue;
            }

            // Additional check to avoid appearance of not paid appointments in the calendar
            if (get_option("wbk_gg_when_add", "onbooking") == "onpaymentorapproval") {
                if (
                    get_option("wbk_appointments_default_status", "approved") == "approved"
                ) {
                    if ($booking->get("status") == "approved") {
                        continue;
                    }
                }
            }

            // Get title and description templates
            $title = get_option("wbk_gg_calendar_event_title", "#customer_name");
            $title = apply_filters("wbk_gg_calendar_event_title", $title, $service_id);

            $description = get_option(
                "wbk_gg_calendar_event_description",
                "#customer_name #customer_phone",
            );
            $description = apply_filters(
                "wbk_gg_calendar_event_description",
                $description,
                $service_id,
            );
            $description = str_replace("{n}", "\n", $description);

            // Process placeholders
            if (class_exists("WBK_Placeholder_Processor")) {
                $title = WBK_Placeholder_Processor::process_placeholders(
                    $title,
                    $booking_id,
                );
                $description = WBK_Placeholder_Processor::process_placeholders(
                    $description,
                    $booking_id,
                );
            }

            // Sanitize: remove "undefined" from placeholder output
            $title = is_string($title)
                ? trim(preg_replace("/\s+/", " ", str_replace("undefined", "", $title)))
                : $title;
            $description = is_string($description)
                ? trim(
                    preg_replace("/\s+/", " ", str_replace("undefined", "", $description)),
                )
                : $description;

            $title_arr[] = $title;
            $description_arr[] = $description;

            // Set start timestamp and duration from first booking
            if ($start_timestamp === null) {
                $start_timestamp = $booking->get_start();
                $service = new WBK_Service($service_id);
                if ($service->is_loaded()) {
                    $duration = $service->get_duration();
                }
            }
        }

        if (empty($title_arr)) {
            return new WP_Error("no_valid_bookings", "No valid bookings found");
        }

        return [
            "title" => implode(", ", $title_arr),
            "description" => implode("\n\n", $description_arr),
            "start_timestamp" => $start_timestamp,
            "duration" => $duration ? $duration : 60,
        ];
    }

    /**
     * Delete the event from Google Calendar (provider-specific implementation).
     * Handles both gg_event_id formats: JSON array [[calendar_id, event_id], ...] or simple string.
     *
     * @param WBK_Booking $booking The booking instance
     * @param array $calendar_ids Array of connected Google calendar IDs
     * @return bool|WP_Error True on success, WP_Error on failure
     */
    public static function delete_event_from_booking_for_calendars($booking, $calendar_ids)
    {
        $event_id_raw = $booking->get("gg_event_id");

        if (empty($event_id_raw)) {
            return true;
        }

        $event_pairs = json_decode($event_id_raw, true);

        if (is_array($event_pairs) && !empty($event_pairs)) {
            foreach ($event_pairs as $pair) {
                if (!is_array($pair) || !isset($pair[0], $pair[1])) {
                    continue;
                }
                $calendar_id = $pair[0];
                $event_id = $pair[1];
                if (empty($event_id)) {
                    continue;
                }
                $processor = new self($calendar_id);
                $result = $processor->delete_calendar_event($event_id);
                if (is_wp_error($result)) {
                    return $result;
                }
            }
        } else {
            $event_id = is_string($event_id_raw) ? $event_id_raw : null;
            if (!empty($event_id)) {
                $last_error = null;
                foreach ($calendar_ids as $calendar_id) {
                    $processor = new self($calendar_id);
                    $result = $processor->delete_calendar_event($event_id);
                    if (!is_wp_error($result)) {
                        return true;
                    }
                    $last_error = $result;
                }
                if ($last_error !== null) {
                    return $last_error;
                }
            }
        }

        return true;
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
    public static function update_event_from_booking_for_calendars(
        $booking,
        $service,
        $calendar_ids
    ) {
        $event_id_raw = $booking->get("appointment_gg_event_id");
        if (empty($event_id_raw)) {
            $event_id_raw = $booking->get("gg_event_id");
        }

        if (empty($event_id_raw)) {
            return true;
        }

        $processor = new self(!empty($calendar_ids) ? $calendar_ids[0] : null);
        $event_data = $processor->prepare_event_data_from_booking($booking->get_id());

        if (is_wp_error($event_data)) {
            return $event_data;
        }

        $event_pairs = json_decode($event_id_raw, true);

        if (is_array($event_pairs) && !empty($event_pairs)) {
            foreach ($event_pairs as $pair) {
                if (!is_array($pair) || !isset($pair[0], $pair[1])) {
                    continue;
                }
                $calendar_id = $pair[0];
                $event_id = $pair[1];
                if (empty($event_id)) {
                    continue;
                }
                $google = new self($calendar_id);
                $google_meet_enabled = false;
                if ($service && $service->is_loaded()) {
                    $google_meet_enabled =
                        class_exists("WBK_Feature_Gate") &&
                        WBK_Feature_Gate::have_required_plan("premium") &&
                        $service->get("google_meet_calendar") == $calendar_id &&
                        $service->get("google_meet_enabled") == "yes";
                }
                $attendee_emails = [];
                if ($google_meet_enabled) {
                    $service_email = $service->get("email");
                    if (!empty($service_email)) {
                        $attendee_emails[] = $service_email;
                    }
                    $booking_email = $booking->get("email");
                    if (!empty($booking_email)) {
                        $attendee_emails[] = $booking_email;
                    }
                    $attendee_emails = array_unique($attendee_emails);
                }
                $result = $google->update_calendar_event(
                    $event_id,
                    $event_data["start_timestamp"],
                    $event_data["title"],
                    $event_data["description"],
                    $event_data["duration"],
                    $google_meet_enabled,
                    $attendee_emails,
                );
                if (is_wp_error($result)) {
                    return $result;
                }
            }
        } else {
            $event_id = is_string($event_id_raw) ? $event_id_raw : null;
            if (!empty($event_id)) {
                $last_error = null;
                foreach ($calendar_ids as $calendar_id) {
                    $google = new self($calendar_id);
                    $google_meet_enabled = false;
                    if ($service && $service->is_loaded()) {
                        $google_meet_enabled =
                            class_exists("WBK_Feature_Gate") &&
                            WBK_Feature_Gate::have_required_plan("premium") &&
                            $service->get("google_meet_calendar") == $calendar_id &&
                            $service->get("google_meet_enabled") == "yes";
                    }
                    $attendee_emails = [];
                    if ($google_meet_enabled) {
                        $service_email = $service->get("email");
                        if (!empty($service_email)) {
                            $attendee_emails[] = $service_email;
                        }
                        $booking_email = $booking->get("email");
                        if (!empty($booking_email)) {
                            $attendee_emails[] = $booking_email;
                        }
                        $attendee_emails = array_unique($attendee_emails);
                    }
                    $result = $google->update_calendar_event(
                        $event_id,
                        $event_data["start_timestamp"],
                        $event_data["title"],
                        $event_data["description"],
                        $event_data["duration"],
                        $google_meet_enabled,
                        $attendee_emails,
                    );
                    if (!is_wp_error($result)) {
                        return true;
                    }
                    $last_error = $result;
                }
                if ($last_error !== null) {
                    return $last_error;
                }
            }
        }

        return true;
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
    public static function process_adding_for_calendars($booking, $service, $calendar_ids)
    {
        $service_id = $service->get_id();
        $group_service_export = get_option(
            "wbk_gg_group_service_export",
            "event_foreach_appointment",
        );

        // Check if this is a group service that should use one event for all bookings
        $is_group_one_event =
            $service->get_quantity() > 1 && $group_service_export == "one_event";

        if ($is_group_one_event) {
            // Handle group service with one event for all bookings
            return self::process_group_service_adding(
                $booking->get_id(),
                $service_id,
                $calendar_ids,
            );
        } else {
            // Handle individual events (one per booking) or single quantity services
            $event_data_arr = [];
            $meet_link = null;

            foreach ($calendar_ids as $calendar_id) {
                $google = new WBK_Google_Calendar_Processor($calendar_id);
                if (!$google->is_google_calendar()) {
                    continue;
                }
                // Check if Google Meet is enabled for this calendar
                $google_meet_enabled = false;
                if (
                    class_exists("WBK_Feature_Gate") &&
                    WBK_Feature_Gate::have_required_plan("premium") &&
                    $service->get("google_meet_calendar") == $calendar_id &&
                    $service->get("google_meet_enabled") == "yes"
                ) {
                    $google_meet_enabled = true;
                }

                // Collect attendee emails if Google Meet is enabled
                $attendee_emails = [];
                if ($google_meet_enabled) {
                    $service_email = $service->get("email");
                    if (!empty($service_email)) {
                        $attendee_emails[] = $service_email;
                    }
                    $booking_email = $booking->get("email");
                    if (!empty($booking_email)) {
                        $attendee_emails[] = $booking_email;
                    }
                    $attendee_emails = array_unique($attendee_emails);
                }

                $event_result = $google->create_event_from_booking(
                    $booking->get_id(),
                    "gg_event_id",
                    $google_meet_enabled,
                    $attendee_emails,
                );

                // Extract event ID and meet link from result
                if (!is_wp_error($event_result)) {
                    $event_id = is_array($event_result) ? $event_result[0] : $event_result;
                    $event_meet_link =
                        is_array($event_result) && isset($event_result[1])
                            ? $event_result[1]
                            : null;
                    if ($event_id) {
                        $event_data_arr[] = [$calendar_id, $event_id];
                    }
                    if ($event_meet_link !== null) {
                        $meet_link = $event_meet_link;
                    }
                }
            }

            // Store event data array if multiple calendars
            if (count($event_data_arr) > 0) {
                $event_id_json = json_encode($event_data_arr);
                $booking->set("gg_event_id", $event_id_json);
                if ($meet_link !== null) {
                    $booking->set("google_meet_link", $meet_link);
                }
                $booking->save();
            }
        }
    }

    /**
     * Add unit-only booking (no service) to Google calendars. Skips group-service and Google Meet
     * options that depend on WBK_Service.
     *
     * @param WBK_Booking $booking        Booking.
     * @param array       $calendar_ids  Connected calendar row IDs.
     * @return void|WP_Error
     */
    public static function process_adding_for_unit_booking($booking, $calendar_ids)
    {
        $event_data_arr = [];
        $meet_link = null;

        foreach ($calendar_ids as $calendar_id) {
            $google = new WBK_Google_Calendar_Processor($calendar_id);
            if (!$google->is_google_calendar()) {
                continue;
            }
            $google_meet_enabled = false;
            $attendee_emails = [];

            $event_result = $google->create_event_from_booking(
                $booking->get_id(),
                "gg_event_id",
                $google_meet_enabled,
                $attendee_emails,
            );

            if (!is_wp_error($event_result)) {
                $event_id = is_array($event_result) ? $event_result[0] : $event_result;
                $event_meet_link =
                    is_array($event_result) && isset($event_result[1])
                        ? $event_result[1]
                        : null;
                if ($event_id) {
                    $event_data_arr[] = [$calendar_id, $event_id];
                }
                if ($event_meet_link !== null) {
                    $meet_link = $event_meet_link;
                }
            }
        }

        if (count($event_data_arr) > 0) {
            $event_id_json = json_encode($event_data_arr);
            $booking->set("gg_event_id", $event_id_json);
            if ($meet_link !== null) {
                $booking->set("google_meet_link", $meet_link);
            }
            $booking->save();
        }
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
    protected static function process_group_service_adding($booking_id, $service_id, $calendar_ids)
    {
        $booking = new WBK_Booking($booking_id);
        if (!$booking->is_loaded()) {
            return new WP_Error(
                "booking_not_found",
                "Booking not found with ID: " . $booking_id,
            );
        }

        // Get all booking IDs for the same service and time
        if (!class_exists("WBK_Model_Utils")) {
            return new WP_Error("model_utils_not_found", "WBK_Model_Utils class not found");
        }

        $booking_ids = WBK_Model_Utils::get_booking_ids_by_service_and_time(
            $service_id,
            $booking->get_start(),
        );

        if (empty($booking_ids)) {
            return new WP_Error(
                "no_bookings_found",
                "No bookings found for service and time",
            );
        }

        // Prepare aggregated event data from all bookings
        $event_data = self::prepare_group_event_data($booking_ids, $service_id);
        if (is_wp_error($event_data)) {
            return $event_data;
        }

        // Check if any booking already has an event ID
        $existing_event_ids = null;
        foreach ($booking_ids as $bid) {
            $b = new WBK_Booking($bid);
            if (!$b->is_loaded()) {
                continue;
            }
            $event_id_json = $b->get("gg_event_id");
            if (!empty($event_id_json)) {
                $existing_event_ids = json_decode($event_id_json, true);
                if (is_array($existing_event_ids) && !empty($existing_event_ids)) {
                    break;
                }
            }
        }

        $event_data_arr = [];
        $meet_link = null;

        // Get service to check Google Meet settings
        $service = new WBK_Service($service_id);
        if (!$service->is_loaded()) {
            return new WP_Error("service_not_loaded", "Service could not be loaded");
        }

        // Process each calendar
        foreach ($calendar_ids as $calendar_id) {
            $google = new WBK_Google_Calendar_Processor($calendar_id);

            // Check if Google Meet is enabled for this calendar
            $google_meet_enabled = false;
            if (
                class_exists("WBK_Feature_Gate") &&
                WBK_Feature_Gate::have_required_plan("premium") &&
                $service->get("google_meet_calendar") == $calendar_id &&
                $service->get("google_meet_enabled") == "yes"
            ) {
                $google_meet_enabled = true;
            }

            // Collect attendee emails from all bookings if Google Meet is enabled
            $attendee_emails = [];
            if ($google_meet_enabled) {
                $service_email = $service->get("email");
                if (!empty($service_email)) {
                    $attendee_emails[] = $service_email;
                }
                foreach ($booking_ids as $bid) {
                    $b = new WBK_Booking($bid);
                    if (!$b->is_loaded()) {
                        continue;
                    }
                    $booking_email = $b->get("email");
                    if (!empty($booking_email)) {
                        $attendee_emails[] = $booking_email;
                    }
                }
                $attendee_emails = array_unique($attendee_emails);
            }

            // Check if we have an existing event for this calendar
            $existing_event_id = null;
            if (is_array($existing_event_ids)) {
                foreach ($existing_event_ids as $event_pair) {
                    if (
                        is_array($event_pair) &&
                        isset($event_pair[0]) &&
                        $event_pair[0] == $calendar_id
                    ) {
                        $existing_event_id = isset($event_pair[1]) ? $event_pair[1] : null;
                        break;
                    }
                }
            }

            // Check if event exists in Google Calendar
            $event_exists = false;
            if (!empty($existing_event_id)) {
                $event_check = $google->get_calendar_event($existing_event_id);
                if (!is_wp_error($event_check)) {
                    $event_exists = true;
                }
            }

            if ($event_exists) {
                // Update existing event
                $update_result = $google->update_calendar_event(
                    $existing_event_id,
                    $event_data["start_timestamp"],
                    $event_data["title"],
                    $event_data["description"],
                    $event_data["duration"],
                    $google_meet_enabled,
                    $attendee_emails,
                );

                if (!is_wp_error($update_result)) {
                    $event_id = is_array($update_result)
                        ? $update_result[0]
                        : $update_result;
                    $event_meet_link =
                        is_array($update_result) && isset($update_result[1])
                            ? $update_result[1]
                            : null;
                    if ($event_id) {
                        $event_data_arr[] = [$calendar_id, $event_id];
                    }
                    if ($event_meet_link !== null) {
                        $meet_link = $event_meet_link;
                    }
                }
            } else {
                // Create new event
                $create_result = $google->create_calendar_event(
                    $event_data["start_timestamp"],
                    $event_data["title"],
                    $event_data["description"],
                    $event_data["duration"],
                    $google_meet_enabled,
                    $attendee_emails,
                );

                if (!is_wp_error($create_result)) {
                    $event_id = is_array($create_result)
                        ? $create_result[0]
                        : $create_result;
                    $event_meet_link =
                        is_array($create_result) && isset($create_result[1])
                            ? $create_result[1]
                            : null;
                    if ($event_id) {
                        $event_data_arr[] = [$calendar_id, $event_id];
                    }
                    if ($event_meet_link !== null) {
                        $meet_link = $event_meet_link;
                    }
                }
            }
        }

        // Store event IDs and meet link in all bookings
        if (!empty($event_data_arr)) {
            $event_id_json = json_encode($event_data_arr);
            foreach ($booking_ids as $bid) {
                $b = new WBK_Booking($bid);
                if ($b->is_loaded()) {
                    $b->set("gg_event_id", $event_id_json);
                    if ($meet_link !== null) {
                        $b->set("google_meet_link", $meet_link);
                    }
                    $b->save();
                }
            }
        }
    }

    /**
     * Get revoke URL for Google Calendar authentication
     * Checks if using easy auth (webba connect) or legacy method and returns appropriate revoke URL
     *
     * @return string|false|WP_Error Revoke URL on success, false on failure, WP_Error on error
     */
    public function get_revoke_url()
    {
        // Ensure connected calendar is initialized
        if ($this->connected_calendar === null) {
            if ($this->id === null) {
                return new WP_Error(
                    "no_calendar_id",
                    "Calendar ID is required to get revoke URL.",
                );
            }
            $this->connected_calendar = new WBK_Connected_Calendar($this->id);
        }

        if (!$this->connected_calendar->is_loaded()) {
            return new WP_Error(
                "connected_calendar_not_loaded",
                "Connected calendar not loaded.",
            );
        }

        // Check if using easy auth (webba connect) or legacy method
        if ($this->connected_calendar->get_easy_auth() === true) {
            // Use webba connect revoke URL
            if (!class_exists("WBK_Webba_Connect")) {
                return new WP_Error(
                    "webba_connect_not_available",
                    "WBK_Webba_Connect class not found.",
                );
            }

            $webba_connect = new WBK_Webba_Connect();
            $revoke_url = $webba_connect->get_google_revoke_url(
                $this->id !== null ? strval($this->id) : "",
            );

            return $revoke_url !== false ? $revoke_url : false;
        } else {
            // Use legacy revoke URL format
            if ($this->id === null) {
                return false;
            }

            $revoke_url = admin_url(
                "admin.php?page=wbk-connected-calendars&clid=" .
                    $this->id .
                    "&action=revoke",
            );

            return $revoke_url;
        }
    }

    public function get_auth_parameters()
    {
        // Ensure connected calendar is initialized
        if ($this->connected_calendar === null) {
            if ($this->id === null) {
                return new WP_Error(
                    "no_calendar_id",
                    "Calendar ID is required to get auth parameters.",
                );
            }
            $this->connected_calendar = new WBK_Connected_Calendar($this->id);
        }

        if (!$this->connected_calendar->is_loaded()) {
            return new WP_Error(
                "connected_calendar_not_loaded",
                "Connected calendar not loaded.",
            );
        }
        if (!$this->check_access_token()) {
            $webba_connect = new WBK_Webba_Connect();
            if ($webba_connect->check_backend_health() === false) {
                return [
                    "isAuthenticated" => false,
                    "internalError" => true,
                ];
            }
            $auth_url = $webba_connect->get_google_authorization_url(
                $this->id !== null ? strval($this->id) : "",
            );
            return [
                "isAuthenticated" => false,
                "internalError" => false,
                "authUrl" => $auth_url,
            ];
        }

        // Retrieve calendar list
        $calendars_list = $this->get_calendars();

        if (is_wp_error($calendars_list)) {
            return [
                "isAuthenticated" => false,
                "internalError" => true,
            ];
        }

        // Get revoke URL using the dedicated method
        $revoke_url = $this->get_revoke_url();

        // Return data in the specified format
        return [
            "isAuthenticated" => true,
            "calendars" => $calendars_list,
            "revokeUrl" =>
                $revoke_url !== false && !is_wp_error($revoke_url) ? $revoke_url : null,
        ];
        return [
            "isAuthenticated" => false,
            "internalError" => true,
        ];
    }

    /**
     * Clear access token for the calendar
     * Clears the access token from the connected calendar record
     *
     * @return bool|WP_Error True on success, WP_Error on failure
     */
    public function clear_access_token()
    {
        // Ensure connected calendar is initialized
        if ($this->connected_calendar === null) {
            if ($this->id === null) {
                return new WP_Error(
                    "no_calendar_id",
                    "Calendar ID is required to clear access token.",
                );
            }
            $this->connected_calendar = new WBK_Connected_Calendar($this->id);
        }

        if (!$this->connected_calendar->is_loaded()) {
            return new WP_Error(
                "connected_calendar_not_loaded",
                "Connected calendar not loaded.",
            );
        }

        // Send request to revoke URL to revoke token on provider side (only for easy auth - legacy URL points to same site)
        if ($this->connected_calendar->get_easy_auth() === true) {
            $revoke_url = $this->get_revoke_url();
            if ($revoke_url !== false && !is_wp_error($revoke_url) && !empty($revoke_url)) {
                wp_remote_get($revoke_url, [
                    "timeout" => 15,
                    "sslverify" => true,
                ]);
            }
        }

        // Clear the access token
        $this->connected_calendar->set_access_token("");
        $this->connected_calendar->save();

        return true;
    }

    public function is_google_calendar()
    {
        return $this->connected_calendar->is_google();
    }

    public function get_easy_authorization_status()
    {
        if ($this->connected_calendar->get_easy_auth() === true) {
            return "yes";
        } else {
            return "";
        }

        return "";
    }
}
