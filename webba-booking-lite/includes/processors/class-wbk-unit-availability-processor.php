<?php

if ( !defined( "ABSPATH" ) ) {
    exit;
}
class WBK_Unit_Availability_Processor {
    /**
     * Load connected calendar blockers for a unit and range.
     * Only calendars in "Two-ways" mode are used for availability checks.
     *
     * @param WBK_Unit $unit Unit model.
     * @param int      $start Range start timestamp.
     * @param int      $end Range end timestamp.
     * @return array
     */
    private static function load_connected_events_in_range( $unit, $start, $end ) {
        return [];
    }

    /**
     * Count connected calendar events intersecting a day.
     *
     * @param array $connected_breakers Array of WBK_Time_Slot.
     * @param int   $day_start Day start timestamp.
     * @return int
     */
    private static function get_connected_busy_count_for_day( $connected_breakers, $day_start ) {
        $connected_count = 0;
        $day_end = $day_start + DAY_IN_SECONDS;
        foreach ( $connected_breakers as $breaker ) {
            if ( WBK_Time_Math_Utils::check_range_intersect(
                $day_start,
                $day_end,
                $breaker->getStart(),
                $breaker->getEnd()
            ) ) {
                $connected_count++;
            }
        }
        return $connected_count;
    }

    /**
     * Get number of free units for a given date and unit.
     *
     * If `$location_id` is set, bookings are limited to that location (and must be one of the
     * unit’s locations when the unit has a location list). Otherwise all overlapping bookings
     * for the unit are counted, regardless of `location_id`.
     *
     * @param int|string $date        Date timestamp or parsable date string.
     * @param int        $unit_id     Unit ID.
     * @param int|null   $location_id Optional; when set, only bookings at this location.
     * @return int
     */
    public static function get_free_units_by_date( $date, $unit_id, $location_id = null ) {
        $unit = new WBK_Unit($unit_id);
        if ( !$unit->is_loaded() ) {
            return 0;
        }
        $unit_quantity = (int) $unit->get_quantity();
        if ( $unit_quantity <= 0 ) {
            return 0;
        }
        $buffer_before = (int) ($unit->get_buffer_before() ?? 0);
        $buffer_after = (int) ($unit->get_buffer_after() ?? 0);
        $loc = null;
        if ( $location_id !== null && $location_id !== "" && (int) $location_id > 0 ) {
            $loc = (int) $location_id;
            $unit_locations = $unit->get_locations();
            if ( is_array( $unit_locations ) && !empty( $unit_locations ) ) {
                $ids = array_map( "intval", $unit_locations );
                if ( !in_array( $loc, $ids, true ) ) {
                    return 0;
                }
            }
        }
        $bookings = WBK_Model_Utils::get_bookings_by_date_unit(
            $date,
            $unit_id,
            $buffer_before,
            $buffer_after,
            $loc
        );
        $booked_units = ( is_array( $bookings ) ? count( $bookings ) : 0 );
        return max( 0, $unit_quantity - $booked_units );
    }

    /**
     * @param int   $unit_id
     * @param mixed $range
     * @param array|int $number_of_people
     * @param int|null  $location_id Optional; when the unit has locations, limits the pool to that location.
     * @return mixed
     */
    public static function get_availability_for_range(
        $unit_id,
        $range,
        $number_of_people,
        $location_id = null
    ) {
        $unit = new WBK_Unit($unit_id);
        if ( !$unit->is_loaded() ) {
            return false;
        }
        $start = null;
        $end = null;
        if ( isset( $range["start"] ) && isset( $range["end"] ) ) {
            $start = ( is_int( $range["start"] ) ? $range["start"] : strtotime( (string) $range["start"] ) );
            $end = ( is_int( $range["end"] ) ? $range["end"] : strtotime( (string) $range["end"] ) );
        } else {
            return false;
        }
        if ( !is_int( $start ) || !is_int( $end ) || $start === false || $end === false || $end < $start ) {
            return false;
        }
        $subtotal = 0.0;
        $breakdown = [
            "weekday" => [
                "days"     => 0,
                "subtotal" => 0.0,
            ],
            "weekend" => [
                "days"     => 0,
                "subtotal" => 0.0,
            ],
        ];
        $start_day = strtotime( date( "Y-m-d", $start ) );
        $end_day = strtotime( date( "Y-m-d", $end ) );
        $connected_breakers = self::load_connected_events_in_range( $unit, $start_day, $end_day + DAY_IN_SECONDS );
        for ($day = $start_day; $day <= $end_day; $day += DAY_IN_SECONDS) {
            $free_units = self::get_free_units_by_date( $day, $unit_id, $location_id );
            if ( !empty( $connected_breakers ) ) {
                $free_units -= self::get_connected_busy_count_for_day( $connected_breakers, $day );
            }
            if ( $free_units <= 0 ) {
                return false;
            }
            $pricing_key = ( in_array( (int) date( "N", $day ), [6, 7], true ) ? "weekend_holiday" : "weekday" );
            $day_type = ( $pricing_key === "weekend_holiday" ? "weekend" : "weekday" );
            $unit_price = $unit->get_price();
            $day_total = 0.0;
            $breakdown[$day_type]["days"]++;
            if ( $unit->get_charge_per_person() && is_array( $number_of_people ) ) {
                $pricing_data = [];
                if ( is_array( $unit_price ) && isset( $unit_price["pricing"] ) && is_array( $unit_price["pricing"] ) && isset( $unit_price["pricing"][$pricing_key] ) && is_array( $unit_price["pricing"][$pricing_key] ) ) {
                    $pricing_data = $unit_price["pricing"][$pricing_key];
                }
                $adult_count = max( 0, (int) ($number_of_people["adult"] ?? 0) );
                $child_count = max( 0, (int) ($number_of_people["child"] ?? 0) );
                $infant_count = max( 0, (int) ($number_of_people["infant"] ?? 0) );
                $adult_price = (float) ($pricing_data["adult"] ?? 0);
                $child_price = (float) ($pricing_data["child"] ?? 0);
                $infant_price = (float) ($pricing_data["infant"] ?? 0);
                $adult_total = $adult_price * $adult_count;
                $child_total = $child_price * $child_count;
                $infant_total = $infant_price * $infant_count;
                $day_total = $adult_total + $child_total + $infant_total;
                if ( !isset( $breakdown[$day_type]["adult"] ) ) {
                    $breakdown[$day_type]["adult"] = [
                        "count_per_day" => $adult_count,
                        "unit_price"    => $adult_price,
                        "total"         => 0.0,
                    ];
                }
                if ( !isset( $breakdown[$day_type]["child"] ) ) {
                    $breakdown[$day_type]["child"] = [
                        "count_per_day" => $child_count,
                        "unit_price"    => $child_price,
                        "total"         => 0.0,
                    ];
                }
                if ( !isset( $breakdown[$day_type]["infant"] ) ) {
                    $breakdown[$day_type]["infant"] = [
                        "count_per_day" => $infant_count,
                        "unit_price"    => $infant_price,
                        "total"         => 0.0,
                    ];
                }
                $breakdown[$day_type]["adult"]["total"] += $adult_total;
                $breakdown[$day_type]["child"]["total"] += $child_total;
                $breakdown[$day_type]["infant"]["total"] += $infant_total;
            } else {
                $day_price = 0;
                if ( isset( $unit_price["pricing"] ) && is_array( $unit_price["pricing"] ) && isset( $unit_price["pricing"][$pricing_key] ) ) {
                    $bucket = $unit_price["pricing"][$pricing_key];
                    if ( is_numeric( $bucket ) ) {
                        $day_price = (float) $bucket;
                    } elseif ( is_array( $bucket ) ) {
                        $day_price = (float) ($bucket["price"] ?? 0);
                    }
                }
                $day_total = $day_price;
                if ( !isset( $breakdown[$day_type]["unit"] ) ) {
                    $breakdown[$day_type]["unit"] = [
                        "count_per_day" => 1,
                        "unit_price"    => $day_price,
                        "total"         => 0.0,
                    ];
                }
                $breakdown[$day_type]["unit"]["total"] += $day_price;
            }
            $breakdown[$day_type]["subtotal"] += $day_total;
            $subtotal += $day_total;
        }
        $tax_rate = WBK_Price_Processor::get_tax_for_messages();
        $tax_amount = WBK_Price_Processor::get_tax_amount( $subtotal, $tax_rate );
        $total = WBK_Price_Processor::get_total_amount( $subtotal, $tax_rate );
        $unit_name = (string) $unit->get( "name" );
        $response = [
            "unit_id"            => (int) $unit_id,
            "unit_name"          => $unit_name,
            "start"              => date( "Y-m-d", $start_day ),
            "end"                => date( "Y-m-d", $end_day ),
            "breakdown"          => $breakdown,
            "subtotal"           => $subtotal,
            "tax_rate"           => $tax_rate,
            "tax"                => $tax_amount,
            "total"              => $total,
            "subtotal_formatted" => WBK_Format_Utils::format_price( $subtotal ),
            "tax_formatted"      => WBK_Format_Utils::format_price( $tax_amount ),
            "total_formatted"    => WBK_Format_Utils::format_price( $total ),
        ];
        return wp_json_encode( $response );
    }

    /**
     * Closest bookable intervals to the requested range, shifted by the given number of days.
     *
     * @param int   $unit_id
     * @param mixed $range
     * @param int   $number_of_people
     * @param int   $days_to_shift Number of days to shift when resolving closest intervals.
     * @param int|null $location_id Optional; when the unit has locations, limits the pool to that location.
     * @return mixed
     */
    public static function get_closest_intervals_for_range(
        $unit_id,
        $range,
        $number_of_people,
        $days_to_shift,
        $location_id = null
    ) {
        if ( !is_array( $range ) || !isset( $range["start"] ) || !isset( $range["end"] ) ) {
            return [];
        }
        $start = ( is_int( $range["start"] ) ? $range["start"] : strtotime( (string) $range["start"] ) );
        $end = ( is_int( $range["end"] ) ? $range["end"] : strtotime( (string) $range["end"] ) );
        $days_to_shift = (int) $days_to_shift;
        if ( !is_int( $start ) || !is_int( $end ) || $start === false || $end === false || $end < $start || $days_to_shift <= 0 ) {
            return [];
        }
        $intervals = [];
        $start_day = strtotime( date( "Y-m-d", $start ) );
        $end_day = strtotime( date( "Y-m-d", $end ) );
        $original_range = [
            "start" => date( "Y-m-d", $start_day ),
            "end"   => date( "Y-m-d", $end_day ),
        ];
        $original_availability = self::get_availability_for_range(
            $unit_id,
            $original_range,
            $number_of_people,
            $location_id
        );
        if ( $original_availability !== false ) {
            $intervals[] = [
                "shift_days"   => 0,
                "range"        => $original_range,
                "availability" => $original_availability,
            ];
        }
        for ($shift = 1; $shift <= $days_to_shift; $shift++) {
            foreach ( [-$shift, $shift] as $direction_shift ) {
                $shift_seconds = $direction_shift * DAY_IN_SECONDS;
                $shifted_start = $start_day + $shift_seconds;
                $shifted_end = $end_day + $shift_seconds;
                $shifted_range = [
                    "start" => date( "Y-m-d", $shifted_start ),
                    "end"   => date( "Y-m-d", $shifted_end ),
                ];
                $availability = self::get_availability_for_range(
                    $unit_id,
                    $shifted_range,
                    $number_of_people,
                    $location_id
                );
                if ( $availability !== false ) {
                    $intervals[] = [
                        "shift_days"   => $direction_shift,
                        "range"        => $shifted_range,
                        "availability" => $availability,
                    ];
                }
            }
        }
        return $intervals;
    }

}
