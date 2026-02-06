<?php

use WebbaBooking\Utilities\WBK_Options_Utils;

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

    public function get_override_step()
    {
        if (!isset($this->fields['override_step'])) {
            return false;
        }
        return $this->fields['override_step'] === 'yes';
    }

    /**
     * get step
     * @return int step
     */
    public function get_step()
    {
        $is_override = $this->get_override_step();

        if($is_override){
            $supported_step_formats = array_keys(WBK_Date_Time_Utils::get_supported_step_formats());
            if(isset($this->fields['step']) && $this->fields['step'] === 'duration' && in_array($this->fields['step'], $supported_step_formats)){
                $duration = $this->get_duration();
                return WBK_Options_Utils::get_service_global_step($duration);
            } else {
                return intval($this->fields['step']);
            } 
        } else {
            $duration = $this->get_duration();
            return WBK_Options_Utils::get_service_global_step($duration);
        }
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
     * Get if the email is overridden
     *
     * @return boolean
     */
    public function get_override_email(): bool
    {
        if (!isset($this->fields['override_email'])) {
            return false;
        }

        return $this->fields['override_email'] === 'yes';
    }

    /**
     * Get the service email
     *
     * @return string|null email
     */
    public function get_email()
    {
        $is_override = $this->get_override_email();
        $global_email = get_option('wbk_super_admin_email', get_option('admin_email'));
        
        if ($is_override === true && isset($this->fields['email'])) {
            return $this->fields['email'];
        } else if($is_override === true && !isset($this->fields['email'])) {
            return null;
        } else if($is_override === false && !empty($global_email) && is_string($global_email)) {
            return $global_email;
        }

        return null;
    }

    /**
     * Get if the availability is overridden
     *
     * @return boolean
     */
    public function get_override_availability(): bool
    {
        if (!isset($this->fields['override_availability'])) {
            return false;
        }
        return $this->fields['override_availability'] === 'yes';
    }

    /**
     * get business hours
     * @return array|string|null business hours
     */
    public function get_business_hours()
    {
        $is_override = $this->get_override_availability();

        if ($is_override === true && isset($this->fields['business_hours']) && is_string($this->fields['business_hours'])) {
            return $this->fields['business_hours'];
        }else if($is_override === true && !isset($this->fields['business_hours']) || !is_string($this->fields['business_hours'])) {
            return '[]';
        }

        $global_hours = WBK_Options_Utils::get_service_global_business_hours();
        if($is_override === false && is_string($global_hours) && !empty($global_hours)) {
            return $global_hours;
        }

        return '[]';
    }

    /**
     * get maximum quantity
     * @return int quantity
     */
    public function get_quantity($time = null)
    {
        if (
            !WBK_Feature_Gate::have_required_plan('standard', 'only_old_users')
        ) {
            return 1;
        }
        if (
            !isset($this->fields['quantity']) ||
            empty($this->fields['quantity'])
        ) {
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
        if (
            !isset($this->fields['min_quantity']) ||
            empty($this->fields['min_quantity'])
        ) {
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
        if (
            !isset($this->fields['quantity']) ||
            empty($this->fields['quantity'])
        ) {
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
     * Get if the price is hidden
     *
     * @return boolean
     */
    public function get_hide_price(): bool
    {
        if (!isset($this->fields['hide_price'])) {
            return false;
        }
        return $this->fields['hide_price'] === 'yes';
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
    public function is_deposit_enabled()
    {
        if (!WBK_Feature_Gate::have_required_plan('premium', false)) {
            return false;
        }
        if (
            !is_null($this->fields['enable_deposit']) &&
            $this->fields['enable_deposit'] == 'yes'
        ) {
            return true;
        }
        return false;
    }
    public function get_deposit_amount()
    {
        if (!is_null($this->fields['deposit_amount'])) {
            return $this->fields['deposit_amount'];
        }
        return 0;
    }
}
