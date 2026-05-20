<?php

if (!defined('ABSPATH')) {
    exit();
}

class WBK_Extra extends WBK_Model_Object
{
    public function __construct($id = null)
    {
        $this->table_name = get_option('wbk_db_prefix', '') . 'wbk_extras';
        parent::__construct($id);
    }

    /**
     * @return string
     */
    public function get_image()
    {
        if (!isset($this->fields['image'])) {
            return '';
        }
        return $this->fields['image'];
    }

    /**
     * @return mixed|null
     */
    public function get_price()
    {
        if (!isset($this->fields['price'])) {
            return null;
        }
        return $this->fields['price'];
    }

    /**
     * @return int
     */
    public function get_min_quantity()
    {
        if (
            !isset($this->fields['min_quantity']) ||
            $this->fields['min_quantity'] === '' ||
            $this->fields['min_quantity'] === null
        ) {
            return 1;
        }
        return (int) $this->fields['min_quantity'];
    }

    /**
     * @return int
     */
    public function get_max_quantity()
    {
        if (
            !isset($this->fields['max_quantity']) ||
            $this->fields['max_quantity'] === '' ||
            $this->fields['max_quantity'] === null
        ) {
            return 1;
        }
        return (int) $this->fields['max_quantity'];
    }

    /**
     * @param bool $unescaped
     * @return string
     */
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
            $extra_id = $this->get_id();
            $value = apply_filters(
                'wpml_translate_single_string',
                stripcslashes($value),
                'webba-booking-lite',
                'webba_extra_description_' . ($extra_id !== null ? $extra_id : '')
            );
        }
        return $value;
    }
}
