<?php
if (!defined("ABSPATH")) {
    exit();
}
class WBK_Location extends WBK_Model_Object
{
    public function __construct($id = null)
    {
        $this->table_name = get_option("wbk_db_prefix", "") . "wbk_locations";
        parent::__construct($id);
    }

    /**
     * get location name
     * @return string location name
     */
    public function get_name()
    {
        if (!isset($this->fields["name"])) {
            return "";
        }
        return $this->fields["name"];
    }

    /**
     * get location description
     * @return string location description
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
        if ($value != "") {
            if (function_exists("pll__")) {
                $value = pll__(stripcslashes($value));
            }
            $value = apply_filters(
                "wpml_translate_single_string",
                stripcslashes($value),
                "webba-booking-lite",
                "webba_location_description_" . $this->get_id(),
            );
        }
        return $value;
    }
}
