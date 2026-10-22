<?php

if ( !defined( "ABSPATH" ) ) {
    exit;
}
/**
 * iCloud Calendar (CalDAV) provider for Connected Calendars.
 * Webba remains source of truth; iCloud changes never modify Webba bookings.
 */
class WBK_Icloud_Calendar_Processor extends WBK_Connected_Calendar_Processor {
    /**
     * Credentials stored encrypted in access_token JSON:
     * {status, email, password_enc, principal_url, calendar_home_set, calendars_cache, discovered_at}
     *
     * @return array|WP_Error Decrypted credential payload (password never returned to callers needing UI)
     */
    public function get_access_token() {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * @return bool|WP_Error
     */
    public function clear_access_token() {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Store Apple Account email + app-specific password (encrypted).
     *
     * @param string $email
     * @param string $app_password
     * @return array|WP_Error Discovery result without password
     */
    public function connect_with_credentials( $email, $app_password ) {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Test connection using stored credentials (or provided ones).
     *
     * @param string|null $email
     * @param string|null $app_password
     * @return array|WP_Error
     */
    public function test_connection( $email = null, $app_password = null ) {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Auth parameters for admin UI (never includes password).
     *
     * @return array
     */
    public function get_auth_parameters() {
        return [
            "isAuthenticated" => false,
            "internalError"   => true,
            "provider"        => "icloud",
        ];
    }

    /**
     * @return array|WP_Error id => name (writable and readonly included)
     */
    public function get_calendars() {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * @param string $calendar_id
     * @return array|WP_Error
     */
    public function get_calendar_by_id( $calendar_id ) {
        $calendars = $this->get_calendars();
        if ( is_wp_error( $calendars ) ) {
            return $calendars;
        }
        if ( !isset( $calendars[$calendar_id] ) ) {
            return new WP_Error("calendar_not_found", "Calendar not found.");
        }
        return [
            "id"   => $calendar_id,
            "name" => $calendars[$calendar_id],
        ];
    }

    /**
     * Create event on the destination calendar (export).
     *
     * @param int    $timestamp
     * @param string $title
     * @param string $description
     * @param int    $duration_minutes
     * @return string|WP_Error UID
     */
    public function create_calendar_event(
        $timestamp,
        $title = "",
        $description = "",
        $duration_minutes = 60
    ) {
        return new WP_Error("use_booking_export", "Use booking-aware export methods for iCloud (UID mapping required).");
    }

    /**
     * @param string $event_id UID
     * @param int    $timestamp
     * @param string $title
     * @param string $description
     * @param int    $duration_minutes
     * @return string|WP_Error
     */
    public function update_calendar_event(
        $event_id,
        $timestamp,
        $title = "",
        $description = "",
        $duration_minutes = 60
    ) {
        return new WP_Error("use_booking_export", "Use booking-aware export methods for iCloud (UID mapping required).");
    }

    /**
     * @param string $event_id UID
     * @return bool|WP_Error
     */
    public function delete_calendar_event( $event_id ) {
        return true;
    }

    /**
     * Fetch busy intervals live from iCloud for the requested range (same pattern as Google).
     *
     * @param string $start ISO8601
     * @param string $end ISO8601
     * @return array|WP_Error
     */
    public function fetch_events_in_range( $start, $end ) {
        return [];
    }

    /**
     * Manual busy sync: fetch horizon and store cache (does not use cron).
     *
     * @return true|WP_Error
     */
    public function sync_busy_intervals() {
        return new WP_Error("premium_required", "Premium features are required.");
    }

    /**
     * Fetch busy intervals from selected iCloud calendars for a timestamp range.
     *
     * @param int $range_start
     * @param int $range_end
     * @return array|WP_Error
     */
    private function fetch_busy_intervals( $range_start, $range_end ) {
        $creds = $this->get_access_token();
        if ( is_wp_error( $creds ) ) {
            return $creds;
        }
        $calendar_hrefs = $this->get_import_calendar_hrefs( $creds );
        if ( empty( $calendar_hrefs ) ) {
            $href = $this->get_calendar_id();
            if ( $href ) {
                $calendar_hrefs = [$href];
            }
        }
        if ( empty( $calendar_hrefs ) ) {
            return [];
        }
        $client = new WBK_Caldav_Client($creds["email"], $creds["password"]);
        $exclude_uids = WBK_Icloud_Sync_Orchestrator::get_webba_uids_for_connection( (int) $this->get_id() );
        if ( get_option( "wbk_ignore_webba_events", "yes" ) !== "yes" ) {
            $exclude_uids = [];
        }
        $all_intervals = [];
        $query_xml = WBK_Caldav_Event::build_calendar_query_xml( $range_start, $range_end );
        foreach ( $calendar_hrefs as $cal_href ) {
            $response = $client->report( $cal_href, $query_xml, "1" );
            if ( is_wp_error( $response ) ) {
                return $response;
            }
            if ( (int) $response["code"] === 401 ) {
                return new WP_Error("icloud_auth_failed", "Invalid Apple Account email or app-specific password. Reconnect required.");
            }
            if ( (int) $response["code"] === 429 ) {
                $retry_after = (int) $client->get_header_value( $response["headers"], "retry-after" );
                return new WP_Error("rate_limited", "iCloud rate limited.", [
                    "retry_after" => max( 60, $retry_after ),
                ]);
            }
            if ( (int) $response["code"] !== 207 && (int) $response["code"] !== 200 ) {
                return new WP_Error("busy_sync_failed", "Failed to fetch iCloud events.", [
                    "status" => $response["code"],
                ]);
            }
            $entries = $client->parse_multistatus( $response["body"] );
            if ( is_wp_error( $entries ) ) {
                return $entries;
            }
            foreach ( $entries as $entry ) {
                $calendar_data = $entry["props"]["calendar-data"] ?? "";
                $intervals = WBK_Caldav_Event::extract_busy_intervals(
                    $calendar_data,
                    $range_start,
                    $range_end,
                    $exclude_uids
                );
                foreach ( $intervals as $interval ) {
                    $interval["calendar_href"] = $cal_href;
                    $interval["href"] = $entry["href"] ?? "";
                    $all_intervals[] = $interval;
                }
            }
        }
        return $all_intervals;
    }

    /**
     * Create/update/delete helpers used by the orchestrator (latest booking state).
     *
     * @param WBK_Booking $booking
     * @return true|WP_Error
     */
    public static function create_event_from_connected_booking( $booking ) {
        return self::export_booking_to_calendars( $booking, "create" );
    }

    /**
     * @param WBK_Booking $booking
     * @return true|WP_Error
     */
    public static function update_event_from_connected_booking( $booking ) {
        return self::export_booking_to_calendars( $booking, "update" );
    }

    /**
     * @param WBK_Booking $booking
     * @return true|WP_Error
     */
    public static function delete_event_from_connected_booking( $booking ) {
        return self::export_booking_to_calendars( $booking, "delete" );
    }

    /**
     * @param WBK_Booking $booking
     * @param string      $operation
     * @return true|WP_Error
     */
    private static function export_booking_to_calendars( $booking, $operation ) {
        if ( !wbk_fs()->is__premium_only() || !wbk_fs()->can_use_premium_code() ) {
            return true;
        }
        list( $service, $unit, $calendar_ids ) = self::get_connected_calendar_ids_for_booking( $booking );
        if ( empty( $calendar_ids ) ) {
            return true;
        }
        $pairs = [];
        $errors = [];
        foreach ( $calendar_ids as $calendar_id ) {
            $connected = new WBK_Connected_Calendar((int) $calendar_id);
            if ( !$connected->is_loaded() || $connected->get_provider() !== "icloud" ) {
                continue;
            }
            $mode = $connected->get_mode();
            if ( !in_array( $mode, ["One-way", "Two-ways"], true ) ) {
                continue;
            }
            $processor = new self((int) $calendar_id);
            if ( $operation === "delete" ) {
                $result = $processor->export_delete( $booking );
            } elseif ( $operation === "update" ) {
                $result = $processor->export_upsert( $booking, true );
            } else {
                $result = $processor->export_upsert( $booking, false );
            }
            if ( is_wp_error( $result ) ) {
                $errors[] = $result;
                continue;
            }
            if ( is_array( $result ) && !empty( $result["uid"] ) ) {
                $pairs[] = [(int) $calendar_id, $result["uid"]];
            }
        }
        if ( $operation === "delete" ) {
            $booking->set( "icloud_event_id", "" );
            $booking->save();
            return ( empty( $errors ) ? true : $errors[0] );
        }
        if ( !empty( $pairs ) ) {
            $booking->set( "icloud_event_id", wp_json_encode( $pairs ) );
            $booking->save();
        }
        if ( !empty( $errors ) && empty( $pairs ) ) {
            return $errors[0];
        }
        unset($service, $unit);
        return true;
    }

    /**
     * @param WBK_Booking $booking
     * @param bool        $is_update
     * @return array|WP_Error {uid,href,etag}
     */
    public function export_upsert( $booking, $is_update = false ) {
        $creds = $this->get_access_token();
        if ( is_wp_error( $creds ) ) {
            return $creds;
        }
        $calendar_href = $this->get_export_calendar_href( $creds );
        if ( !$calendar_href ) {
            return new WP_Error("no_export_calendar", "Select a writable iCloud calendar for export.");
        }
        // Reject read-only destinations.
        foreach ( $creds["calendars_cache"] ?? [] as $cal ) {
            if ( ($cal["id"] ?? "") === $calendar_href && !empty( $cal["readonly"] ) ) {
                return new WP_Error("readonly_export_calendar", "The selected export calendar is read-only. Choose a writable calendar.");
            }
        }
        $event_data = $this->prepare_event_data_from_booking( $booking->get_id() );
        if ( is_wp_error( $event_data ) ) {
            return $event_data;
        }
        $connection_id = (int) $this->get_id();
        $booking_id = (int) $booking->get_id();
        $uid = WBK_Caldav_Event::build_uid( $booking_id, $connection_id );
        $mapping = WBK_Icloud_Sync_Orchestrator::get_mapping( $connection_id, $booking_id );
        $etag = $mapping["etag"] ?? null;
        $href = $mapping["href"] ?? "";
        if ( $href === "" ) {
            $filename = WBK_Caldav_Event::object_filename( $uid );
            $href_result = WBK_Caldav_Url_Validator::resolve_and_validate( rtrim( $calendar_href, "/" ) . "/" . $filename, $calendar_href );
            if ( is_wp_error( $href_result ) ) {
                return $href_result;
            }
            $href = $href_result;
            $etag = null;
            // If-None-Match: * for create
        }
        $location = "";
        if ( !empty( $event_data["service"] ) && $event_data["service"] instanceof WBK_Service ) {
            $location = (string) $event_data["service"]->get( "address" );
        }
        $ical = WBK_Caldav_Event::serialize_event(
            $uid,
            (int) $event_data["start_timestamp"],
            (int) $event_data["duration"],
            (string) $event_data["title"],
            (string) $event_data["description"],
            $location
        );
        if ( is_wp_error( $ical ) ) {
            return $ical;
        }
        $client = new WBK_Caldav_Client($creds["email"], $creds["password"]);
        $response = $client->put_event( $href, $ical, ( $is_update ? $etag : null ) );
        if ( is_wp_error( $response ) ) {
            return $response;
        }
        if ( (int) $response["code"] === 401 ) {
            return new WP_Error("icloud_auth_failed", "Invalid Apple Account email or app-specific password. Reconnect required.");
        }
        // Conflict / precondition: Webba is source of truth — retry overwrite with latest data.
        if ( in_array( (int) $response["code"], [412, 409], true ) ) {
            $response = $client->put_event( $href, $ical, null );
            if ( is_wp_error( $response ) ) {
                return $response;
            }
        }
        // Missing remote event during update → recreate.
        if ( $is_update && in_array( (int) $response["code"], [404, 410], true ) ) {
            $response = $client->put_event( $href, $ical, null );
            if ( is_wp_error( $response ) ) {
                return $response;
            }
        }
        if ( !in_array( (int) $response["code"], [200, 201, 204], true ) ) {
            // Create with If-None-Match failed because object exists → overwrite (Webba source of truth).
            if ( (int) $response["code"] === 412 && !$is_update ) {
                $response = $client->request( "PUT", $href, [
                    "headers" => [
                        "Content-Type" => "text/calendar; charset=utf-8",
                    ],
                    "body"    => $ical,
                ] );
            }
        }
        if ( !in_array( (int) $response["code"], [200, 201, 204], true ) ) {
            return new WP_Error("icloud_put_failed", "Failed to write iCloud calendar event.", [
                "status" => $response["code"],
            ]);
        }
        $new_etag = $client->get_header_value( $response["headers"], "etag" );
        WBK_Icloud_Sync_Orchestrator::upsert_mapping( $connection_id, $booking_id, [
            "uid"           => $uid,
            "href"          => $href,
            "etag"          => $new_etag,
            "calendar_href" => $calendar_href,
            "state"         => "synced",
        ] );
        return [
            "uid"  => $uid,
            "href" => $href,
            "etag" => $new_etag,
        ];
    }

    /**
     * @param WBK_Booking $booking
     * @return true|WP_Error
     */
    public function export_delete( $booking ) {
        $connection_id = (int) $this->get_id();
        $booking_id = (int) $booking->get_id();
        $mapping = WBK_Icloud_Sync_Orchestrator::get_mapping( $connection_id, $booking_id );
        if ( !$mapping || empty( $mapping["href"] ) ) {
            // Treat as success for deletion when remote mapping missing.
            WBK_Icloud_Sync_Orchestrator::delete_mapping( $connection_id, $booking_id );
            return true;
        }
        $result = $this->delete_mapped_event( $mapping );
        WBK_Icloud_Sync_Orchestrator::delete_mapping( $connection_id, $booking_id );
        return $result;
    }

    /**
     * @param array $mapping
     * @return true|WP_Error
     */
    private function delete_mapped_event( $mapping ) {
        $creds = $this->get_access_token();
        if ( is_wp_error( $creds ) ) {
            // Auth failure should surface; missing event is success.
            if ( $creds->get_error_code() === "icloud_not_connected" ) {
                return true;
            }
            return $creds;
        }
        $client = new WBK_Caldav_Client($creds["email"], $creds["password"]);
        $response = $client->delete( $mapping["href"], $mapping["etag"] ?? null );
        if ( is_wp_error( $response ) ) {
            return $response;
        }
        if ( (int) $response["code"] === 401 ) {
            return new WP_Error("icloud_auth_failed", "Invalid Apple Account email or app-specific password. Reconnect required.");
        }
        // Missing remote event → success for deletion.
        if ( in_array( (int) $response["code"], [
            200,
            204,
            404,
            410
        ], true ) ) {
            return true;
        }
        // ETag conflict: Webba source of truth — force delete without If-Match.
        if ( (int) $response["code"] === 412 ) {
            $response = $client->delete( $mapping["href"], null );
            if ( is_wp_error( $response ) ) {
                return $response;
            }
            if ( in_array( (int) $response["code"], [
                200,
                204,
                404,
                410
            ], true ) ) {
                return true;
            }
        }
        return new WP_Error("icloud_delete_failed", "Failed to delete iCloud calendar event.", [
            "status" => $response["code"],
        ]);
    }

    /**
     * Export booking to iCloud synchronously (same timing as Google/Outlook).
     *
     * @param WBK_Booking $booking
     * @param WBK_Service $service
     * @param array       $calendar_ids
     * @return void|WP_Error
     */
    public static function process_adding_for_calendars( $booking, $service, $calendar_ids ) {
    }

    /**
     * @param WBK_Booking $booking
     * @param array       $calendar_ids
     * @return void|WP_Error
     */
    public static function process_adding_for_unit_booking( $booking, $calendar_ids ) {
        return self::process_adding_for_calendars( $booking, new WBK_Service(0), $calendar_ids );
    }

    /**
     * @param WBK_Booking $booking
     * @param array       $calendar_ids
     * @return bool|WP_Error
     */
    public static function delete_event_from_booking_for_calendars( $booking, $calendar_ids ) {
        return true;
    }

    /**
     * @param WBK_Booking $booking
     * @param WBK_Service $service
     * @param array       $calendar_ids
     * @return bool|WP_Error
     */
    public static function update_event_from_booking_for_calendars( $booking, $service, $calendar_ids ) {
        return true;
    }

    /**
     * @param array $calendars
     * @return array
     */
    private function format_calendars_for_ui( $calendars ) {
        $out = [];
        if ( !is_array( $calendars ) ) {
            return $out;
        }
        foreach ( $calendars as $cal ) {
            $out[] = [
                "id"       => $cal["id"],
                "name"     => $cal["name"],
                "writable" => !empty( $cal["writable"] ),
                "readonly" => !empty( $cal["readonly"] ),
            ];
        }
        return $out;
    }

    /**
     * Single selected calendar (in_provider_id) used for export and availability.
     *
     * @param array $creds
     * @return string
     */
    private function get_export_calendar_href( $creds ) {
        $href = $this->get_calendar_id();
        if ( $href ) {
            return $href;
        }
        foreach ( $creds["calendars_cache"] ?? [] as $cal ) {
            if ( empty( $cal["readonly"] ) && !empty( $cal["id"] ) ) {
                return $cal["id"];
            }
        }
        return "";
    }

    /**
     * Same calendar as export, used for busy/availability import.
     *
     * @param array $creds
     * @return string[]
     */
    private function get_import_calendar_hrefs( $creds ) {
        $primary = $this->get_export_calendar_href( $creds );
        return ( $primary ? [$primary] : [] );
    }

}
