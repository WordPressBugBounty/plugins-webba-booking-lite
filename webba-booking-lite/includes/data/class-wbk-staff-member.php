<?php
if (!defined("ABSPATH")) {
    exit();
}
class WBK_Staff_Member extends WBK_Model_Object
{
    public function __construct($id = null)
    {
        $this->table_name = get_option("wbk_db_prefix", "") . "wbk_staff_members";
        parent::__construct($id);
    }

    /**
     * get staff member name
     * @return string staff member name
     */
    public function get_name()
    {
        if (!isset($this->fields["name"])) {
            return "";
        }
        return $this->fields["name"];
    }

    /**
     * get staff member photo
     * @return string photo URL or ID
     */
    public function get_photo()
    {
        if (!isset($this->fields["photo"])) {
            return "";
        }
        return $this->fields["photo"];
    }

    /**
     * get attached services
     * @return array IDs of the services
     */
    public function get_services()
    {
        if (!is_null($this->fields["services"])) {
            $services = json_decode($this->fields["services"]);
            if (is_numeric($services)) {
                $services = [$services];
            }
            if (is_array($services)) {
                return $services;
            }
        }
        return [];
    }

    /**
     * get location IDs
     * @return array location IDs
     */
    public function get_locations()
    {
        if (!isset($this->fields["locations"])) {
            return [];
        }

        $location_value = $this->fields["locations"];

        if (is_array($location_value)) {
            $normalized = array_map("intval", $location_value);
            $normalized = array_filter($normalized, fn($item) => $item > 0);
            return array_values(array_unique($normalized));
        }

        if (is_numeric($location_value)) {
            $location = intval($location_value);
            return $location > 0 ? [$location] : [];
        }

        if (!is_string($location_value)) {
            return [];
        }

        $location_value = trim($location_value);
        if ($location_value === "") {
            return [];
        }

        $decoded = json_decode($location_value, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            if (is_array($decoded)) {
                $normalized = array_map("intval", $decoded);
                $normalized = array_filter($normalized, fn($item) => $item > 0);
                return array_values(array_unique($normalized));
            }
            if (is_numeric($decoded)) {
                $location = intval($decoded);
                return $location > 0 ? [$location] : [];
            }
        }

        if (strpos($location_value, ",") !== false) {
            $parts = array_map("trim", explode(",", $location_value));
            $normalized = array_map("intval", $parts);
            $normalized = array_filter($normalized, fn($item) => $item > 0);
            return array_values(array_unique($normalized));
        }

        return is_numeric($location_value) && intval($location_value) > 0
            ? [intval($location_value)]
            : [];
    }

    /**
     * get business hours
     * @return array|string|null business hours
     */
    public function get_business_hours()
    {
        if (!isset($this->fields["business_hours"])) {
            return null;
        }
        $hours = $this->fields["business_hours"];
        if (is_string($hours)) {
            return $hours;
        }
        return $hours;
    }

    /**
     * Get all connected calendar IDs for availability import.
     *
     * @return array IDs of connected calendars.
     */
    public function get_connected_calendars_for_import()
    {
        if (!isset($this->fields["connected_calendars"])) {
            return [];
        }

        $value = $this->fields["connected_calendars"];
        if (is_numeric($value)) {
            return [(int) $value];
        }

        if (is_string($value)) {
            $value = trim($value);
            if ($value === "") {
                return [];
            }
            $decoded = json_decode($value, true);
            if (is_numeric($decoded)) {
                return [(int) $decoded];
            }
            if (is_array($decoded)) {
                $value = $decoded;
            } else {
                return [];
            }
        }

        if (!is_array($value)) {
            return [];
        }

        $result = [];
        foreach ($value as $item) {
            if (is_numeric($item) && (int) $item > 0) {
                $result[] = (int) $item;
            }
        }
        return array_values(array_unique($result));
    }

    public function get_associated_user()
    {
        if (!isset($this->fields["associated_user"])) {
            return null;
        }
        return $this->fields["associated_user"];
    }

    public function set_associated_user($user_id)
    {
        $this->fields["associated_user"] = $user_id;
    }
}
