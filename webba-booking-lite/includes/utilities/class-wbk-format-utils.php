<?php
// check if accessed directly
if (!defined('ABSPATH'))
    exit;
class WBK_Format_Utils
{
    public static function get_date_format()
    {
        $date_format = trim(get_option('wbk_date_format'));
        if (empty($date_format)) {
            $date_format = trim(get_option('date_format'));
            if (empty($date_format)) {
                $date_format = 'l, F j';
            }
        }
        return $date_format;
    }
    // get time format option
    public static function get_time_format()
    {
        $time_format = trim(get_option('wbk_time_format'));
        if (empty($time_format)) {
            $time_format = trim(get_option('time_format'));
            if (empty($time_format)) {
                $time_format = 'H:i';
            }
        }
        return $time_format;
    }

    static function price_to_float($s)
    {
        $s = str_replace(',', '.', $s);
        $s = preg_replace("/[^0-9\.]/", "", $s);
        $s = str_replace('.', '', substr($s, 0, -3)) . substr($s, -3);
        return (float) $s;
    }

    static function format_price($value)
    {
        $price_format = get_option('wbk_payment_price_format', '$#price');
        $value = str_replace('#price', number_format($value, get_option('wbk_price_fractional', '2'), get_option('wbk_price_separator', '.'), ''), $price_format);
        return esc_html($value);
    }

    static function format_booking_time($booking, $format_type = 'time')
    {
        if ($format_type == 'time') {
            $format = WBK_Date_Time_Utils::get_time_format();
        } else {
            $format = WBK_Date_Time_Utils::get_date_format();
        }

        $prev_time_zone = date_default_timezone_get();
        date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
        $timezone_to_use = new DateTimeZone(
            date_default_timezone_get()
        );

        if (
            get_option(
                'wbk_timeslot_time_string',
                'start'
            ) == 'start' || $format_type != 'time'
        ) {
            $time = wp_date(
                $format,
                $booking->get_start(),
                $timezone_to_use
            );
        }
        if ($format_type == 'time') {
            $time =
                $time = wp_date(
                    $format,
                    $booking->get_start(),
                    $timezone_to_use
                ) . ' - ' . $time = wp_date(
                    $format,
                    $booking->get_end(),
                    $timezone_to_use
                );
        }
        date_default_timezone_set($prev_time_zone);
        return $time;
    }
}
