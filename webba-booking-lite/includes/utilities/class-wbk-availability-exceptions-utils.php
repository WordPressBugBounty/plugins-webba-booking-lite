<?php

if (!defined('ABSPATH')) {
    exit();
}

class WBK_Availability_Exceptions_Utils
{
    /**
     * Parse stored availability exceptions JSON.
     *
     * @param mixed $raw_value
     * @return array<int, array{start_date: string, end_date: string, time_slots: array<int, array{start: int, end: int, status: string}>}>
     */
    public static function parse($raw_value): array
    {
        if (!is_string($raw_value) || trim($raw_value) === '') {
            return [];
        }

        $decoded = json_decode(trim($raw_value), true);
        if (!is_array($decoded)) {
            return [];
        }

        if (isset($decoded['date_time_ranges']) && is_array($decoded['date_time_ranges'])) {
            $rows = $decoded['date_time_ranges'];
        } elseif (self::is_sequential_array($decoded)) {
            $rows = $decoded;
        } else {
            return [];
        }

        $ranges = [];
        foreach ($rows as $row) {
            if (!is_array($row)) {
                continue;
            }

            $start_date = isset($row['start_date']) ? trim((string) $row['start_date']) : '';
            $end_date = isset($row['end_date']) ? trim((string) $row['end_date']) : '';
            if ($start_date === '' || $end_date === '') {
                continue;
            }

            $time_slots = [];
            if (isset($row['time_slots']) && is_array($row['time_slots'])) {
                foreach ($row['time_slots'] as $slot) {
                    if (!is_array($slot)) {
                        continue;
                    }
                    if (!isset($slot['start'], $slot['end'])) {
                        continue;
                    }
                    if (!is_numeric($slot['start']) || !is_numeric($slot['end'])) {
                        continue;
                    }

                    $status = isset($slot['status']) ? (string) $slot['status'] : 'active';
                    $time_slots[] = [
                        'start' => (int) $slot['start'],
                        'end' => (int) $slot['end'],
                        'status' => $status === 'inactive' ? 'inactive' : 'active',
                    ];
                }
            }

            $ranges[] = [
                'start_date' => $start_date,
                'end_date' => $end_date,
                'time_slots' => $time_slots,
            ];
        }

        return $ranges;
    }

    /**
     * Normalize a day timestamp to midnight in the plugin timezone.
     *
     * @param int $day
     * @return int
     */
    public static function normalize_day_timestamp($day): int
    {
        $timezone = get_option('wbk_timezone', 'UTC');
        $previous_timezone = date_default_timezone_get();
        date_default_timezone_set($timezone);
        $normalized = strtotime(date('Y-m-d', (int) $day) . ' 00:00:00');
        date_default_timezone_set($previous_timezone);

        return (int) $normalized;
    }

    /**
     * Parse a YYYY-MM-DD calendar date to midnight in the plugin timezone.
     *
     * @param string $date_string
     * @return int|false
     */
    public static function parse_calendar_date($date_string)
    {
        $date_string = trim($date_string);
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date_string)) {
            return false;
        }

        $timezone = get_option('wbk_timezone', 'UTC');
        $previous_timezone = date_default_timezone_get();
        date_default_timezone_set($timezone);
        $timestamp = strtotime($date_string . ' 00:00:00');
        date_default_timezone_set($previous_timezone);

        if ($timestamp === false) {
            return false;
        }

        return (int) $timestamp;
    }

    /**
     * Find the exception range that applies to the given day.
     *
     * @param array<int, array{start_date: string, end_date: string, time_slots: array<int, array{start: int, end: int, status: string}>}> $ranges
     * @param int $day
     * @return array|null
     */
    public static function find_matching_range(array $ranges, $day): ?array
    {
        $day_timestamp = self::normalize_day_timestamp($day);

        foreach ($ranges as $range) {
            $range_start = self::parse_calendar_date($range['start_date']);
            $range_end = self::parse_calendar_date($range['end_date']);
            if ($range_start === false || $range_end === false) {
                continue;
            }

            if ($day_timestamp >= $range_start && $day_timestamp <= $range_end) {
                return $range;
            }
        }

        return null;
    }

    /**
     * Resolve business-hour intervals for a day when a service exception applies.
     *
     * @param WBK_Service $service
     * @param int $day
     * @param int|null $staff_member_id
     * @return array|null Null when no exception applies, otherwise active intervals (possibly empty).
     */
    public static function resolve_day_exception(
        WBK_Service $service,
        $day,
        $staff_member_id = null
    ): ?array {
        if (!is_null($staff_member_id) && is_numeric($staff_member_id)) {
            return null;
        }

        if (!WBK_Feature_Gate::have_required_plan('standard', 'only_old_users')) {
            return null;
        }

        $ranges = self::parse($service->get_availability_exceptions());
        if (empty($ranges)) {
            return null;
        }

        $matching_range = self::find_matching_range($ranges, $day);
        if ($matching_range === null) {
            return null;
        }

        $day_timestamp = self::normalize_day_timestamp($day);
        $day_of_week = date('N', $day_timestamp);
        $intervals = [];

        foreach ($matching_range['time_slots'] as $slot) {
            if (($slot['status'] ?? 'active') !== 'active') {
                continue;
            }

            $interval = new stdClass();
            $interval->start = (int) $slot['start'];
            $interval->end = (int) $slot['end'];
            $interval->day_of_week = $day_of_week;
            $interval->status = 'active';
            $intervals[] = $interval;
        }

        return $intervals;
    }

    /**
     * Check whether an array uses sequential numeric keys starting at zero.
     *
     * @param mixed $value
     * @return bool
     */
    private static function is_sequential_array($value): bool
    {
        if (!is_array($value)) {
            return false;
        }

        return array_keys($value) === range(0, count($value) - 1);
    }
}
