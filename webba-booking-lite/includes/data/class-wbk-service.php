<?php
if (!defined('ABSPATH')) {
    exit();
}
class WBK_Service extends WBK_Model_Object
{
    public function __construct($id = null)
    {
        $this->table_name = get_option('wbk_db_prefix', '') . 'wbk_services';
        parent::__construct($id);
    }
    /**
     * get attached google calendars
     * @return array IDs of the google calendars
     */
    public function get_gg_calendars()
    {
        if (!is_null($this->fields['gg_calendars'])) {
            $gg_calendars = json_decode($this->fields['gg_calendars']);
            if (is_numeric($gg_calendars)) {
                $gg_calendars = [$gg_calendars];
            }
            if (is_array($gg_calendars)) {
                return $gg_calendars;
            }
        }
        return [];
    }

    /**
     * get interval between $booking_ids
     * @return int interval between bookings
     */
    public function get_interval_between()
    {
        if (!isset($this->fields['interval_between'])) {
            return 0;
        }
        return $this->fields['interval_between'];
    }

    /**
     * get duration
     * @return int get duration
     */
    public function get_duration()
    {
        if (!isset($this->fields['duration'])) {
            return null;
        }
        return $this->fields['duration'];
    }

    /**
     * get step
     * @return int step
     */
    public function get_step()
    {
        if (!isset($this->fields['step'])) {
            return null;
        }
        return $this->fields['step'];
    }

    /**
     * get preparation time
     * @return int preparation time
     */
    public function get_prepare_time()
    {
        if (!isset($this->fields['prepare_time'])) {
            return null;
        }
        return $this->fields['prepare_time'];
    }

    /**
     * get business hours
     * @return array|string|null business hours
     */
    public function get_business_hours()
    {
        if (!isset($this->fields['business_hours'])) {
            return null;
        }
        $hours = $this->fields['business_hours'];
        if (is_string($hours)) {
            return $hours;
        }
        return $hours;
    }

    /**
     * get maximum quantity
     * @return int quantity
     */
    public function get_quantity($time = null)
    {
        if (!isset($this->fields['quantity']) || empty($this->fields['quantity'])) {
            return 1;
        }
        return apply_filters(
            'wbk_service_quantity',
            $this->fields['quantity'],
            $this->get_id(),
            $time
        );
    }

    /**
     * get minimum quantity
     * @return int quantity
     */
    public function get_min_quantity($time = null)
    {
        if (!isset($this->fields['min_quantity']) || empty($this->fields['min_quantity'])) {
            return 1;
        }
        return apply_filters(
            'wbk_service_quantity',
            $this->fields['min_quantity'],
            $this->get_id(),
            $time
        );
    }

    /**
     * get maximum quantity
     * @return int quantity
     */
    public function get_max_quantity($time = null)
    {
        if (!isset($this->fields['quantity']) || empty($this->fields['quantity'])) {
            return 1;
        }
        return apply_filters(
            'wbk_service_quantity',
            $this->fields['quantity'],
            $this->get_id(),
            $time
        );
    }

    /**
     * get date_range
     * @return array date_range
     */
    public function get_availability_range()
    {
        if (!isset($this->fields['date_range'])) {
            return null;
        }
        $date_range = explode('-', $this->fields['date_range']);
        $result = [];
        foreach ($date_range as $item) {
            $result[] = trim($item);
        }
        return $result;
    }

    /*
     * get price of the service
     * @return float price
     */
    public function get_price()
    {
        if (!isset($this->fields['price'])) {
            return null;
        }
        return $this->fields['price'];
    }

    /**
     * get pricing rules
     * @return array IDs of the pricing rules
     */
    public function get_pricing_rules()
    {
        if (!is_null($this->fields['pricing_rules'])) {
            $items = json_decode($this->fields['pricing_rules']);
            if (is_numeric($items)) {
                $items = [$items];
            }
            if (is_array($items)) {
                return $items;
            }
        }
        return [];
    }
    /**
     * get on confirmation (On booking) template
     * @return int id of the on changed template or false
     */
    public function get_on_booking_template()
    {
        if (!is_null($this->fields['notification_template'])) {
            return $this->fields['notification_template'];
        }
        return false;
    }

    /**
     * get on changes template
     * @return int id of the on changed template
     */
    public function get_on_changes_template()
    {
        if (!is_null($this->fields['booking_changed_template'])) {
            return $this->fields['booking_changed_template'];
        }
        return false;
    }
    /**
     * get on approval template
     * @return int id of the on changed template
     */
    public function get_on_approval_template()
    {
        if (isset($this->fields['approval_template'])) {
            return $this->fields['approval_template'];
        }
        return false;
    }
    /**
     * get on approval template
     * @return int id of the on changed template
     */
    public function get_arrived_template()
    {
        if (!is_null($this->fields['arrived_template'])) {
            return $this->fields['arrived_template'];
        }
        return false;
    }
    /**
     * get the service fee
     * @return float service fee
     */
    public function get_fee()
    {
        if (!isset($this->fields['service_fee'])) {
            return 0;
        }
        return $this->fields['service_fee'];
    }

    public function get_description($unescaped = false)
    {
        $value = '';
        if (isset($this->fields['description'])) {
            $value = $this->fields['description'];
            if ($unescaped) {
                $value = stripcslashes($value);
            }
        }
        if ($value != '') {
            if (function_exists('pll__')) {
                $value = pll__(stripcslashes($value));
            }
            $value = apply_filters(
                'wpml_translate_single_string',
                stripcslashes($value),
                'webba-booking-lite',
                'webba_service_description_' . $this->get_id()
            );
        }
        return $value;
    }

    public function get_multi_mode_low_limit()
    {
        if (!is_null($this->fields['multi_mode_low_limit'])) {
            return $this->fields['multi_mode_low_limit'];
        }
        return '';
    }

    public function get_multi_mode_limit()
    {
        if (!is_null($this->fields['multi_mode_limit'])) {
            return $this->fields['multi_mode_limit'];
        }
        return '';
    }

    public function get_form()
    {
        if (!is_null($this->fields['form'])) {
            return $this->fields['form'];
        }
        return '';
    }

    public function get_payment_methods()
    {
        if (!is_null($this->fields['payment_methods'])) {
            return $this->fields['payment_methods'];
        }
        return '';
    }

    public function get_woo_product()
    {
        if (!is_null($this->fields['woo_product'])) {
            return $this->fields['woo_product'];
        }
        return 0;
    }
    public function has_only_arrival_payment_method()
    {
        if ($this->get_payment_methods() == '') {
            return false;
        }
        if (
            get_option('wbk_skip_on_arrival_payment_method', 'true') != 'true'
        ) {
            return false;
        }
        $payment_methods = json_decode($this->get_payment_methods(), true);
        if (is_array($payment_methods)) {
            if (count($payment_methods) > 1) {
                return false;
            } elseif (
                count($payment_methods) == 1 &&
                $payment_methods[0] == 'arrival'
            ) {
                return true;
            }
        }
        return false;
    }
    public function is_payable()
    {
        if ($this->get_payment_methods() == '') {
            return false;
        }
        $payment_methods = json_decode($this->get_payment_methods(), true);
        if (!is_array($payment_methods)) {
            return false;
        }
        if (
            count($payment_methods) == 1 &&
            $payment_methods[0] == 'arrival' &&
            get_option('wbk_skip_on_arrival_payment_method', 'true') == 'true'
        ) {
            return false;
        }
        return true;
    }
}
