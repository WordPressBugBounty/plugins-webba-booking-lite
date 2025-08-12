<?php
namespace WbkData;
if (!defined('ABSPATH')) {
    exit();
}
/*
 * This file is part of Webba Booking plugin



 */

if (!defined('ABSPATH')) {
    exit();
}
class Validator
{
    // check string size
    public static function check_string_size($str, $min, $max)
    {
        if (strlen($str) > $max || strlen($str) < $min) {
            return false;
        } else {
            return true;
        }
    }
    // check integer
    public static function check_integer($int, $min, $max)
    {
        if (!is_numeric($int)) {
            return false;
        }
        if (intval($int) != $int) {
            return false;
        }
        if ($int > $max || $int < $min) {
            return false;
        }
        return true;
    }
    // check float
    public static function check_float($value, $min, $max)
    {
        if (!is_numeric($value)) {
            return false;
        }
        if ($value > $max || $value < $min) {
            return false;
        }
        return true;
    }
    // check if email
    public static function check_email($eml)
    {
        if (
            !preg_match(
                '/^([a-z0-9_\.-]+)@([a-z0-9_\.-]+)\.([a-z\.]{2,20})$/',
                $eml
            )
        ) {
            return false;
        } else {
            return true;
        }
    }
    // check if color
    public static function check_color($clr)
    {
        if (
            !preg_match(
                '/#([a-f]|[A-F]|[0-9]){3}(([a-f]|[A-F]|[0-9]){3})?\b/',
                $clr
            )
        ) {
            return false;
        } else {
            return true;
        }
    }
    // check if day of week
    public static function check_day_of_week($str)
    {
        if (
            $str != 'monday' &&
            $str != 'tuesday' &&
            $str != 'wednesday' &&
            $str != 'thursday' &&
            $str != 'friday' &&
            $str != 'saturday' &&
            $str != 'sunday'
        ) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * Check if hex color
     *
     * @param string $color
     * @return boolean
     */
    public static function check_hex_color(string $color): bool
    {
        return preg_match(
            '/#([a-f]|[A-F]|[0-9]){3}(([a-f]|[A-F]|[0-9]){3})?\b/',
            $color
        );
    }
}

?>
