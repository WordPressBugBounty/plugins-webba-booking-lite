<?php
if (!defined("ABSPATH")) {
    exit();
}

class WBK_Unit extends WBK_Model_Object
{
    public function __construct($id = null)
    {
        $this->table_name = get_option("wbk_db_prefix", "") . "wbk_units";
        parent::__construct($id);
    }

    /**
     * Get unit description.
     *
     * @param bool $unescaped Whether to strip slashes before filters.
     * @return string
     */
    public function get_description($unescaped = false)
    {
        $value = "";
        if (isset($this->fields["description"])) {
            $value = $this->fields["description"];
            if ($unescaped) {
                $value = stripcslashes($value);
            }
        }
        if ($value !== "") {
            if (function_exists("pll__")) {
                $value = pll__(stripcslashes($value));
            }
            $value = apply_filters(
                "wpml_translate_single_string",
                stripcslashes($value),
                "webba-booking-lite",
                "webba_unit_description_" . $this->get_id(),
            );
        }
        return $value;
    }

    /**
     * Get image value as stored (attachment id or URL).
     *
     * @return string
     */
    public function get_image()
    {
        if (!isset($this->fields["image"]) || $this->fields["image"] === "") {
            return "";
        }
        return $this->fields["image"];
    }

    /**
     * Get location IDs where this unit is available.
     *
     * @return int[]
     */
    public function get_locations()
    {
        return $this->decode_json_id_list("locations");
    }

    /**
     * Get booking form id (0 = default).
     *
     * @return int|string
     */
    public function get_form_id()
    {
        if (!isset($this->fields["form_id"]) || $this->fields["form_id"] === "") {
            return "0";
        }
        return $this->fields["form_id"];
    }

    /**
     * Get IDs of similar / alternative units.
     *
     * @return int[]
     */
    public function get_similar_units()
    {
        return $this->decode_json_id_list("similar_units");
    }

    /**
     * How many units of this type are available at the selected locations.
     *
     * @return int
     */
    public function get_quantity()
    {
        if (!isset($this->fields["quantity"]) || $this->fields["quantity"] === "") {
            return 1;
        }
        return (int) $this->fields["quantity"];
    }

    /**
     * Maximum number of people allowed per unit.
     *
     * @return int
     */
    public function get_capacity()
    {
        if (!isset($this->fields["capacity"]) || $this->fields["capacity"] === "") {
            return 1;
        }
        return (int) $this->fields["capacity"];
    }

    /**
     * Raw availability date ranges field.
     *
     * @return string
     */
    public function get_availability_date_ranges()
    {
        if (!isset($this->fields["availability_date_ranges"])) {
            return "";
        }
        return $this->fields["availability_date_ranges"];
    }

    /**
     * Whether availability rules repeat each calendar year.
     *
     * @return bool
     */
    public function get_availability_recurring_annually()
    {
        if (!isset($this->fields["availability_recurring_annually"])) {
            return false;
        }
        return $this->fields["availability_recurring_annually"] === "yes";
    }

    /**
     * Buffer before stay (days).
     *
     * @return int|null
     */
    public function get_buffer_before()
    {
        if (!isset($this->fields["buffer_before"]) || $this->fields["buffer_before"] === "") {
            return null;
        }
        return (int) $this->fields["buffer_before"];
    }

    /**
     * Buffer after stay (days).
     *
     * @return int|null
     */
    public function get_buffer_after()
    {
        if (!isset($this->fields["buffer_after"]) || $this->fields["buffer_after"] === "") {
            return null;
        }
        return (int) $this->fields["buffer_after"];
    }

    /**
     * Minimum booking length in days.
     *
     * @return int|null
     */
    public function get_min_booking_days()
    {
        if (!isset($this->fields["min_booking_days"]) || $this->fields["min_booking_days"] === "") {
            return null;
        }
        return (int) $this->fields["min_booking_days"];
    }

    /**
     * Maximum booking length in days.
     *
     * @return int|null
     */
    public function get_max_booking_days()
    {
        if (!isset($this->fields["max_booking_days"]) || $this->fields["max_booking_days"] === "") {
            return null;
        }
        return (int) $this->fields["max_booking_days"];
    }

    /**
     * Unit price.
     *
     * @return array|float
     */
    public function get_price()
    {
        if (!isset($this->fields["price"]) || $this->fields["price"] === "") {
            return 0.0;
        }

        $price_raw = $this->fields["price"];
        if (is_numeric($price_raw)) {
            return (float) $price_raw;
        }

        $decoded = json_decode((string) $price_raw, true);
        if (!is_array($decoded) || !isset($decoded["pricing"]) || !is_array($decoded["pricing"])) {
            return 0.0;
        }

        $pricing = $decoded["pricing"];

        if ($this->get_charge_per_person()) {
            $person_bucket = function ($bucket) {
                if (!is_array($bucket)) {
                    return [
                        "adult" => 0.0,
                        "child" => 0.0,
                        "infant" => 0.0,
                    ];
                }
                return [
                    "adult" => (float) ($bucket["adult"] ?? 0),
                    "child" => (float) ($bucket["child"] ?? 0),
                    "infant" => (float) ($bucket["infant"] ?? 0),
                ];
            };

            return [
                "pricing" => [
                    "weekday" => $person_bucket($pricing["weekday"] ?? []),
                    "weekend_holiday" => $person_bucket($pricing["weekend_holiday"] ?? []),
                ],
            ];
        }

        $flat_bucket = function ($bucket) {
            if (is_numeric($bucket)) {
                return (float) $bucket;
            }
            if (is_array($bucket)) {
                return (float) ($bucket["price"] ?? 0);
            }
            return 0.0;
        };

        return [
            "pricing" => [
                "weekday" => $flat_bucket($pricing["weekday"] ?? 0),
                "weekend_holiday" => $flat_bucket($pricing["weekend_holiday"] ?? 0),
            ],
        ];
    }

    /**
     * Whether the unit should be charged per person.
     *
     * @return bool
     */
    public function get_charge_per_person()
    {
        if (!isset($this->fields["charge_per_person"])) {
            return false;
        }
        return $this->fields["charge_per_person"] === "yes";
    }

    /**
     * Connected calendar IDs for sync.
     *
     * @return int[]
     */
    public function get_connected_calendars()
    {
        return $this->decode_json_id_list("connected_calendars");
    }

    /**
     * @param string $field_key WbkData field name (editable key).
     * @return int[]
     */
    private function decode_json_id_list($field_key)
    {
        if (
            !is_array($this->fields) ||
            !isset($this->fields[$field_key]) ||
            $this->fields[$field_key] === null ||
            $this->fields[$field_key] === ""
        ) {
            return [];
        }
        $decoded = json_decode($this->fields[$field_key]);
        if (is_numeric($decoded)) {
            $decoded = [$decoded];
        }
        if (is_array($decoded)) {
            return array_map("intval", $decoded);
        }
        return [];
    }
}
