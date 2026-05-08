<?php
if (!defined("ABSPATH")) {
    exit();
}
class WBK_Booking extends WBK_Model_Object
{
    const BOOKING_TARGET_UNIT = "unit";
    const BOOKING_TARGET_SERVICE = "service";
    const BOOKING_TARGET_UNKNOWN = "unknown";

    public function __construct($id)
    {
        $this->table_name = get_option("wbk_db_prefix", "") . "wbk_appointments";
        parent::__construct($id);
    }

    /**
     * get start time of the bookings
     * @return int timestamp
     */
    public function get_start()
    {
        if (isset($this->fields["time"])) {
            return $this->fields["time"];
        }
        return 0;
    }

    /**
     * get end time of the bookings
     * based on start time and duration
     * @return int timestamp
     */
    public function get_end()
    {
        if (!isset($this->fields["time"])) {
            return null;
        }
        if (isset($this->fields["unit_id"])) {
            return $this->fields["day"] + $this->fields["duration"] * 60;
        } else {
            return $this->fields["time"] + $this->fields["duration"] * 60;
        }
    }

    public function set_parameters(
        $date,
        $time,
        $service_id,
        $quantity = 1,
        $name = "",
        $phone = "",
        $description = "",
        $custom_data = null
    ) {
        $this->set("day", $date);
        $this->set("time", $time);
        $this->set("service_id", $service_id);
        $this->set("quantity", $quantity);
        $this->set("name", $name);
        $this->set("phone", $phone);
        $this->set("description", $description);
        $this->set("extra", $custom_data);
    }
    /**
     * get day of the bookings
     * @return int timestamp
     */
    public function get_day()
    {
        if (isset($this->fields["day"])) {
            return $this->fields["day"];
        }
        return 0;
    }

    /**
     * get end time of the bookings
     * including interval between
     * based on start time and duration
     * @return int timestamp
     */
    public function get_full_end()
    {
        if (!isset($this->fields["service_id"])) {
            return null;
        }
        $service = new WBK_Service($this->fields["service_id"]);
        return $this->fields["time"] +
            $this->fields["duration"] * 60 +
            $service->get_interval_between() * 60;
    }

    /**
     * get number of booked places
     * @return int number of booked places
     */
    public function get_quantity()
    {
        if (!isset($this->fields["quantity"])) {
            return 0;
        }
        return $this->fields["quantity"];
    }

    /**
     * get service id
     * @return int service id
     */
    public function get_service()
    {
        if (!isset($this->fields["service_id"])) {
            return 0;
        }
        return $this->fields["service_id"];
    }

    /**
     * get unit id
     * @return int unit id, or 0 when not a unit booking
     */
    public function get_unit_id()
    {
        if (!isset($this->fields["unit_id"])) {
            return 0;
        }
        return (int) $this->fields["unit_id"];
    }

    /**
     * Whether the booking targets a unit (daily / range) or a regular service appointment.
     * Unit takes precedence when unit_id > 0, consistent with pricing and woo product resolution.
     *
     * @return string self::BOOKING_TARGET_UNIT, self::BOOKING_TARGET_SERVICE, or self::BOOKING_TARGET_UNKNOWN
     */
    public function get_booking_target_type()
    {
        if ($this->get_unit_id() > 0) {
            return self::BOOKING_TARGET_UNIT;
        }
        if ($this->get_service() > 0) {
            return self::BOOKING_TARGET_SERVICE;
        }
        return self::BOOKING_TARGET_UNKNOWN;
    }

    /**
     * get price
     * @return float booking price
     */
    public function get_price()
    {
        if (!isset($this->fields["moment_price"]) || $this->fields["moment_price"] == "") {
            return 0;
        }
        return $this->fields["moment_price"];
    }

    /**
     * get phone
     * @return string phone
     */
    public function get_phone()
    {
        if (!isset($this->fields["phone"]) || $this->fields["phone"] == "") {
            return "";
        }
        return $this->fields["phone"];
    }

    /**
     * get custom fields falue
     * @return mixed value of the custom field or null if the field doesn't exists
     */
    public function get_custom_field_value($field_id)
    {
        if (isset($this->fields["extra"]) && $this->fields["extra"] != "[]") {
            $this->fields["extra"];
            $custom_fields = json_decode($this->fields["extra"]);
            if ($custom_fields != null) {
                foreach ($custom_fields as $custom_field) {
                    if (is_array($custom_field) && count($custom_field) == 3) {
                        if ($custom_field[0] == $field_id) {
                            return $custom_field[2];
                        }
                    }
                }
            }
        }
        return null;
    }

    /**
     * get amount_details
     * @return string amount_details
     */
    public function get_amount_details()
    {
        if (!isset($this->fields["amount_details"]) || $this->fields["amount_details"] == "") {
            return "";
        }
        return $this->fields["amount_details"];
    }

    public function get_local_time()
    {
        $timezone = new DateTimeZone(get_option("wbk_timezone", "UTC"));
        $date = (new DateTime("@" . $this->get_day()))->setTimezone($timezone);
        $current_offset = $this->get("time_offset") * -60 - $timezone->getOffset($date);
        $local_time = absint($this->get("time")) + $current_offset;
        return $local_time;
    }

    public function get_formated_extra()
    {
        $extra = json_decode($this->get("extra"));
        $html = "";
        if (!is_array($extra)) {
            return "";
        }
        foreach ($extra as $item) {
            $html .= $item[1] . ": " . $item[2] . "<br/>";
        }
        return $html;
    }

    public function get_status()
    {
        if (!isset($this->fields["status"])) {
            return "pending";
        }
        return $this->fields["status"];
    }

    public function get_woo_product()
    {
        if($this->fields["unit_id"] > 0){
            $unit = new WBK_Unit($this->fields["unit_id"]);
            if (!$unit->is_loaded()) {
                return 0;
            }
            return $unit->get('woo_product');
        }

        $service = new WBK_Service($this->fields["service_id"]);
        if (!$service->is_loaded()) {
            return 0;
        }
        return $service->get_woo_product();
    }

    public function get_datetime_start()
    {
        $prev_time_zone = date_default_timezone_get();
        date_default_timezone_set(get_option("wbk_timezone", "Europe/London"));
        $start_formated = wp_date(
            "Y-m-d H:i:s",
            $this->get_start(),
            new DateTimeZone(date_default_timezone_get()),
        );
        $datetime = new DateTime(
            $start_formated,
            new DateTimeZone(get_option("wbk_timezone", "Europe/London")),
        );
        date_default_timezone_set($prev_time_zone);
        return $datetime;
    }

    public function get_datetime_end()
    {
        $prev_time_zone = date_default_timezone_get();
        date_default_timezone_set(get_option("wbk_timezone", "Europe/London"));
        $start_formated = wp_date(
            "Y-m-d H:i:s",
            $this->get_end(),
            new DateTimeZone(date_default_timezone_get()),
        );
        $datetime = new DateTime(
            $start_formated,
            new DateTimeZone(get_option("wbk_timezone", "Europe/London")),
        );
        date_default_timezone_set($prev_time_zone);
        return $datetime;
    }
    public function get_google_meet_link()
    {
        if (!isset($this->fields["google_meet_link"]) || $this->fields["google_meet_link"] == "") {
            return "";
        }
        return $this->fields["google_meet_link"];
    }

    public function get_staff_member()
    {
        if (!isset($this->fields["staff_member_id"])) {
            return null;
        }
        return $this->fields["staff_member_id"];
    }

    public function set_staff_member($staff_member_id)
    {
        $this->fields["staff_member_id"] = $staff_member_id;
    }
}
