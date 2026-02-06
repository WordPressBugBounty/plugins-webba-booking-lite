<?php
// check if accessed directly
if (!defined('ABSPATH')) {
    exit();
}
class WBK_Format_Utils
{
    /**
     * Get the date format
     *
     * @return string
     */
    public static function get_date_format(): string
    {
        return WBK_Date_Time_Utils::get_date_format();
    }

    /**
     * Get the time format
     *
     * @return string
     */
    public static function get_time_format(): string
    {
        return WBK_Date_Time_Utils::get_time_format();
    }

    static function price_to_float($s)
    {
        $s = str_replace(',', '.', $s);
        $s = preg_replace('/[^0-9\.]/', '', $s);
        $s = str_replace('.', '', substr($s, 0, -3)) . substr($s, -3);
        return (float) $s;
    }

    /**
     * Get the price format
     *
     * @return string
     */
    static function get_price_format(): string
    {
        $price_format = get_option('wbk_payment_price_format_new', '$');
        $position = get_option('wbk_currency_symbol_position', 'before');
        
        if ($position == 'before') {
            return $price_format . '#price';
        } else {
            return '#price' . $price_format;
        }
    }

    static function format_price($value)
    {
        $price_format = self::get_price_format();
        $value = str_replace(
            '#price',
            number_format(
                $value,
                get_option('wbk_price_fractional', '2'),
                get_option('wbk_price_separator', '.'),
                ''
            ),
            $price_format
        );
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
        $timezone_to_use = new DateTimeZone(date_default_timezone_get());

        $time = wp_date($format, $booking->get_start(), $timezone_to_use);

        date_default_timezone_set($prev_time_zone);
        return $time;
    }

    /**
     * Generate random color
     *
     * @param array $ignore_list
     * @return string
     */
    public static function generate_random_color(
        array $ignore_list = []
    ): string {
        $color = '#';
        $color .= str_pad(dechex(mt_rand(0, 255)), 2, '0', STR_PAD_LEFT);
        $color .= str_pad(dechex(mt_rand(0, 255)), 2, '0', STR_PAD_LEFT);
        $color .= str_pad(dechex(mt_rand(0, 255)), 2, '0', STR_PAD_LEFT);
        if (in_array($color, $ignore_list)) {
            return self::generate_random_color($ignore_list);
        }
        return $color;
    }

    /**
     * Fix malformed JSON with unescaped quotes in HTML attributes
     * @param string $json_string JSON string to fix
     * @return string Fixed JSON string
     */
    public static function fix_malformed_json_quotes($json_string)
    {
        $fixed = $json_string;
        
        // Direct string replacements for common problematic patterns
        // Fix href="#" where quote before # is not escaped
        $fixed = str_replace('href=\\"#\\"', 'href=\\"#\\"', $fixed);
        $fixed = str_replace('href="#"', 'href=\\"#\\"', $fixed);
        
        // More general: find HTML tags and process them
        // Use a simpler approach - find all HTML tags and fix attributes
        $fixed = preg_replace_callback(
            '/<([a-zA-Z][^>]*)>/',
            function ($matches) {
                $tag_attrs = $matches[1];
                
                // Fix attributes with unescaped quotes in values
                // Pattern: attr="value" where value contains unescaped quotes
                $fixed_attrs = preg_replace_callback(
                    '/([a-zA-Z-]+)=(")([^"]*)(")/',
                    function ($attr_matches) {
                        $attr_name = $attr_matches[1];
                        $value = $attr_matches[3];
                        
                        // If value contains unescaped quotes, escape them
                        if (strpos($value, '"') !== false) {
                            $escaped_value = str_replace('"', '\\"', $value);
                            return $attr_name . '=\\"' . $escaped_value . '\\"';
                        }
                        return $attr_matches[0];
                    },
                    $tag_attrs
                );
                
                // Also handle already-escaped patterns that might be wrong
                $fixed_attrs = preg_replace_callback(
                    '/([a-zA-Z-]+)=(\\\\)?"([^"]*)(\\\\)?"/',
                    function ($attr_matches) {
                        $attr_name = $attr_matches[1];
                        $value = $attr_matches[3];
                        
                        // Check if value has unescaped quotes
                        if (preg_match('/(?<!\\\\)"/', $value)) {
                            $escaped_value = preg_replace('/(?<!\\\\)"/', '\\"', $value);
                            return $attr_name . '=\\"' . $escaped_value . '\\"';
                        }
                        return $attr_matches[0];
                    },
                    $fixed_attrs
                );
                
                return '<' . $fixed_attrs . '>';
            },
            $fixed
        );
        
        return $fixed;
    }
}
