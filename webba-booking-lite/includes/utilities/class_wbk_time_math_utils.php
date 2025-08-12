<?php
// check if accessed directly
if (!defined('ABSPATH')) {
    exit();
}
class WBK_Time_Math_Utils
{
    public static function check_range_intersect(
        $start,
        $end,
        $start_compare,
        $end_compare
    ) {
        if ($start_compare == $start) {
            return true;
        }
        if ($start_compare > $start && $start_compare < $end) {
            return true;
        }
        if ($end_compare > $start && $end_compare <= $end) {
            return true;
        }
        if ($start >= $start_compare && $end <= $end_compare) {
            return true;
        }
        if ($start <= $start_compare && $end >= $end_compare) {
            return true;
        }
        return false;
    }
    public static function adjust_times(
        $time_1,
        $time_2,
        $time_zone,
        $ignore_rule = false
    ) {
        $dst_mode = date('I', strtotime('today midnight', $time_1));

        if ($dst_mode == '1') {
            $offset_1 = date('Z', $time_1);
            $offset_2 = date('Z', $time_1 + $time_2);
            $difference = $offset_1 - $offset_2;

            $result = $time_1 + $time_2 + $difference;
        } else {
            $result = $time_1 + $time_2;
            $offset_1 = date('Z', $time_1);
            $offset_2 = date('Z', $time_1 + $time_2);
            $difference = $offset_1 - $offset_2;

            if ($ignore_rule == true && $difference < 0) {
                $difference = 0;
            }

            $result = $time_1 + $time_2 + $difference;
        }

        return $result;
    }

    public static function get_offset_difference_with_midnight($time)
    {
        $prev_time_zone = date_default_timezone_get();
        date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
        $time_midnight = strtotime(date('Y-m-d 00:00:00', $time));
        date_default_timezone_set($prev_time_zone);

        $tz = self::get_utc_offset_by_time($time);
        // new DateTimeZone( get_option( 'wbk_timezone', 'UTC' ) );
        $transition = $tz->getTransitions($time_midnight, $time_midnight);
        $offset1 = $transition[0]['offset'];
        $transition = $tz->getTransitions($time, $time);
        $offset2 = $transition[0]['offset'];
        $difference = $offset1 - $offset2;
        return $difference;
    }
    public static function get_offset_local($time)
    {
        $offset = 0;
        $time_zone_client = isset($_POST['time_zone_client'])
            ? $_POST['time_zone_client']
            : (isset($_GET['time_zone_client'])
                ? $_GET['time_zone_client']
                : '');
        if ($time_zone_client != '') {
            $this_tz = new DateTimeZone($time_zone_client);
            $date_this = (new DateTime('@' . $time))->setTimezone(
                new DateTimeZone($time_zone_client)
            );
            $offset = $this_tz->getOffset($date_this);
            $offset = ($offset * -1) / 60;
        }
        return $offset;
    }
    public static function get_offset_differnce_with_local($time)
    {
        $offset = 0;
        $time_zone = get_option('wbk_timezone', 'UTC');
        if ($time_zone != '') {
            $this_tz = new DateTimeZone($time_zone);
            $date_this = (new DateTime('@' . $time))->setTimezone(
                new DateTimeZone($time_zone)
            );
            $offset = $this_tz->getOffset($date_this);
            $offset = ($offset * -1) / 60;
        }
        return $offset - self::get_offset_local($time);
    }
    public static function get_start_of_week()
    {
        $start_of_week = get_option('start_of_week', 0);
        if ($start_of_week == 0) {
            $start_of_week = 'sunday';
        } else {
            $start_of_week = 'monday';
        }
        return $start_of_week;
    }

    public static function get_start_of_current_week()
    {
        $start_of_week = self::get_start_of_week();
        if ($start_of_week == 'sunday') {
            return strtotime('last sunday', strtotime('tomorrow'));
        } else {
            return strtotime('last monday', strtotime('tomorrow'));
        }
    }
    public static function get_start_of_week_day($day)
    {
        $start_of_week = self::get_start_of_week();
        if ($start_of_week == 'sunday') {
            if (date('N', $day) == '7') {
                return $day;
            } else {
                return strtotime('last sunday', $day);
            }
        } else {
            if (date('N', $day) == '1') {
                return $day;
            } else {
                return strtotime('last monday', $day);
            }
        }
    }
    public static function get_utc_offset_by_time($time)
    {
        $prev_time_zone = date_default_timezone_get();
        date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
        $date = $time; // strtotime( date( 'Y-m-d 00:00:00', $time ) );
        date_default_timezone_set($prev_time_zone);
        $time_zone = get_option('wbk_timezone', 'UTC');
        $timezone_to_use = new DateTimeZone($time_zone);
        $this_tz = new DateTimeZone($time_zone);
        $date = (new DateTime('@' . $date))->setTimezone(
            new DateTimeZone($time_zone)
        );
        $now = new DateTime('now', $this_tz);
        $offset_sign = $this_tz->getOffset($date);
        if ($offset_sign > 0) {
            $sign = '+';
        } else {
            $sign = '-';
        }
        $offset_rounded = abs($offset_sign / 3600);
        $offset_int = floor($offset_rounded);
        if ($offset_rounded - $offset_int == 0.5) {
            $offset_fractional = ':30';
        } else {
            $offset_fractional = '';
        }
        $timezone_utc_string = $sign . $offset_int . $offset_fractional;
        return new DateTimeZone($timezone_utc_string);
    }
}
?>
