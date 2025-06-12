<?php
// Webba Booking time slot class
if (!defined('ABSPATH'))
    exit;

class WBK_Time_Slot
{
    public $start;
    public $end;
    public $status;
    public $formated_time;
    public $formated_time_local;
    public $formated_date;
    public $formated_date_local;
    public $formated_time_backend;
    public $free_places;
    public $min_quantity;
    public $offset;
    public $display;
    public $is_duplicated;
    public $title;
    public $backgroundColor;
    public $html;

    public function __construct($start, $end)
    {
        $this->start = absint($start);
        $this->end = absint($end);
    }
    public function get_start()
    {
        return $this->start;
    }
    public function get_end()
    {
        return $this->end;
    }
    public function setStatus($value)
    {
        $this->set_status($value);
    }
    public function set_status($value)
    {
        if (is_array($value)) {
            $this->status = array();
            foreach ($value as $item) {
                array_push($this->status, $item);
            }
        } else {
            $this->status = $value;
        }
    }
    public function get_status()
    {
        return $this->status;
    }

    // Deprecated functrions
    public function getStart()
    {
        return $this->get_start();
    }
    public function getEnd()
    {
        return $this->get_end();
    }
    public function getStatus()
    {
        return $this->get_status();
    }
    // End of Deprecated functions

    public function isTimeIn($time)
    {
        if ($time > $this->start && $time < $this->end) {
            return TRUE;
        }
        return FALSE;
    }

    public function set($start, $end)
    {
        $this->start = $start;
        $this->end = $end;
    }

    public function get_formated_time()
    {
        return $this->formated_time;
    }

    public function set_formated_time($input)
    {
        $this->formated_time = $input;
    }

    public function set_formated_date($input)
    {
        $this->formated_date = $input;
    }

    public function get_formated_date()
    {
        return $this->formated_date;
    }

    public function set_formated_date_local($input)
    {
        $this->formated_date_local = $input;
    }

    public function get_formated_date_local()
    {
        return $this->formated_date_local;
    }

    public function get_formated_time_local()
    {
        return $this->formated_time_local;
    }
    public function set_formated_time_local($input)
    {
        $this->formated_time_local = $input;
    }
    public function get_formated_time_backend()
    {
        return $this->formated_time_backend;
    }
    public function set_formated_time_backend($input)
    {
        $this->formated_time_backend = $input;
    }
    public function get_free_places()
    {
        return $this->free_places;
    }
    public function set_free_places($input)
    {
        $this->free_places = $input;
    }
    public function set_min_quantity($input)
    {
        $this->min_quantity = $input;
    }
    public function set_offset($input)
    {
        $this->offset = $input;
    }
    public function get_offset()
    {
        return $this->offset;
    }
    public function get_min_quantity()
    {
        return $this->min_quantity;
    }

}
?>