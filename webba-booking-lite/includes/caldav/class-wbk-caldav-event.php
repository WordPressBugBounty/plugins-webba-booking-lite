<?php
if (!defined("ABSPATH")) {
    exit();
}

use Eluceo\iCal\Domain\Entity\Calendar as EluceoCalendar;
use Eluceo\iCal\Domain\Entity\Event as EluceoEvent;
use Eluceo\iCal\Domain\ValueObject\DateTime as EluceoDateTime;
use Eluceo\iCal\Domain\ValueObject\Location;
use Eluceo\iCal\Domain\ValueObject\TimeSpan;
use Eluceo\iCal\Domain\ValueObject\UniqueIdentifier;
use Eluceo\iCal\Presentation\Factory\CalendarFactory;
use ICal\ICal;

/**
 * iCalendar serialization/parsing helpers for CalDAV events.
 */
class WBK_Caldav_Event
{
    /**
     * Build a stable globally unique UID for a Webba booking + connection.
     *
     * @param int $booking_id
     * @param int $connection_id Connected calendar WP row ID
     * @return string
     */
    public static function build_uid($booking_id, $connection_id)
    {
        $host = wp_parse_url(home_url(), PHP_URL_HOST);
        if (!is_string($host) || $host === "") {
            $host = "webba-booking.local";
        }
        return sprintf(
            "webba-booking-%d-%d@%s",
            (int) $connection_id,
            (int) $booking_id,
            $host
        );
    }

    /**
     * Deterministic event object filename for PUT.
     *
     * @param string $uid
     * @return string
     */
    public static function object_filename($uid)
    {
        $safe = preg_replace("/[^A-Za-z0-9@._-]/", "-", $uid);
        return $safe . ".ics";
    }

    /**
     * Serialize a timed event to iCalendar text (no attendees / invitations).
     *
     * @param string      $uid
     * @param int         $start_ts
     * @param int         $duration_minutes
     * @param string      $title
     * @param string      $description
     * @param string      $location
     * @param string|null $timezone
     * @return string|WP_Error
     */
    public static function serialize_event(
        $uid,
        $start_ts,
        $duration_minutes,
        $title,
        $description = "",
        $location = "",
        $timezone = null
    ) {
        try {
            if ($timezone === null || $timezone === "") {
                $timezone = wp_timezone_string();
            }
            $tz = new DateTimeZone($timezone ?: "UTC");
            $start = (new DateTimeImmutable("@{$start_ts}"))->setTimezone($tz);
            $end = $start->modify("+" . max(1, (int) $duration_minutes) . " minutes");

            $event = new EluceoEvent(new UniqueIdentifier($uid));
            $event->setSummary((string) $title);
            if ($description !== "") {
                $event->setDescription((string) $description);
            }
            if ($location !== "") {
                $event->setLocation(new Location((string) $location));
            }
            $event->setOccurrence(
                new TimeSpan(
                    new EluceoDateTime($start, false),
                    new EluceoDateTime($end, false)
                )
            );

            $calendar = new EluceoCalendar([$event]);
            $component = (new CalendarFactory())->createCalendar($calendar);
            return (string) $component;
        } catch (Exception $e) {
            return new WP_Error("ical_serialize_failed", $e->getMessage());
        }
    }

    /**
     * Expand calendar-data into busy intervals within [range_start, range_end].
     * Handles recurrence, exceptions, all-day, TZ/DST via ics-parser.
     *
     * @param string $calendar_data
     * @param int    $range_start Unix timestamp
     * @param int    $range_end   Unix timestamp
     * @param string[] $exclude_uids Webba-owned UIDs to skip
     * @return array<int, array{uid:string,start:int,end:int,title:string,description:string,href?:string}>
     */
    public static function extract_busy_intervals(
        $calendar_data,
        $range_start,
        $range_end,
        $exclude_uids = []
    ) {
        $intervals = [];
        if (!is_string($calendar_data) || trim($calendar_data) === "") {
            return $intervals;
        }

        $exclude_map = [];
        foreach ($exclude_uids as $uid) {
            $exclude_map[strtolower((string) $uid)] = true;
        }

        try {
            $ical = new ICal();
            $ical->initString($calendar_data);
            $events = $ical->eventsFromRange(
                gmdate("Y-m-d H:i:s", $range_start - DAY_IN_SECONDS),
                gmdate("Y-m-d H:i:s", $range_end + DAY_IN_SECONDS)
            );
        } catch (Exception $e) {
            return $intervals;
        }

        if (!is_array($events)) {
            return $intervals;
        }

        foreach ($events as $event) {
            $uid = isset($event->uid) ? (string) $event->uid : "";
            if ($uid !== "" && isset($exclude_map[strtolower($uid)])) {
                continue;
            }

            $status = isset($event->status) ? strtoupper((string) $event->status) : "";
            if ($status === "CANCELLED") {
                continue;
            }

            $transp = isset($event->transp) ? strtoupper((string) $event->transp) : "";
            if ($transp === "TRANSPARENT") {
                continue;
            }

            try {
                $start_dt = $ical->iCalDateToDateTime($event->dtstart_array[3]);
                $end_raw = isset($event->dtend_array[3]) ? $event->dtend_array[3] : null;
                if ($end_raw) {
                    $end_dt = $ical->iCalDateToDateTime($end_raw);
                } else {
                    $end_dt = clone $start_dt;
                    $end_dt->modify("+1 hour");
                }
            } catch (Exception $e) {
                continue;
            }

            $start = (int) $start_dt->getTimestamp();
            $end = (int) $end_dt->getTimestamp();
            if ($end <= $start) {
                continue;
            }
            // Overlap with requested window (inclusive boundaries).
            if ($end <= $range_start || $start >= $range_end) {
                continue;
            }

            $intervals[] = [
                "uid" => $uid,
                "start" => $start,
                "end" => $end,
                "title" => isset($event->summary) ? (string) $event->summary : "",
                "description" => isset($event->description)
                    ? (string) $event->description
                    : "",
            ];
        }

        return $intervals;
    }

    /**
     * Build a calendar-query REPORT body for VEVENT in a time range.
     *
     * @param int $start_ts
     * @param int $end_ts
     * @return string
     */
    public static function build_calendar_query_xml($start_ts, $end_ts)
    {
        $start = gmdate("Ymd\THis\Z", (int) $start_ts);
        $end = gmdate("Ymd\THis\Z", (int) $end_ts);

        return '<?xml version="1.0" encoding="UTF-8"?>' .
            '<c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">' .
            "<d:prop>" .
            "<d:getetag/>" .
            "<c:calendar-data/>" .
            "</d:prop>" .
            "<c:filter>" .
            '<c:comp-filter name="VCALENDAR">' .
            '<c:comp-filter name="VEVENT">' .
            '<c:time-range start="' .
            $start .
            '" end="' .
            $end .
            '"/>' .
            "</c:comp-filter>" .
            "</c:comp-filter>" .
            "</c:filter>" .
            "</c:calendar-query>";
    }
}
