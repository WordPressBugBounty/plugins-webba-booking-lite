<?php
if (!defined('ABSPATH'))
    exit;

/**
 * Model class
 */
class WbkData_Model_Utils
{
    /**
     * clean up string for using in SQL statements
     * @var string
     * @param mixed $string
     */
    public static function clean_up_string($string)
    {
        $string = str_replace(' ', '_', $string);
        return preg_replace('/[^A-Za-z0-9\_]/', '', $string);
    }

}
