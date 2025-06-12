<?php
if (!defined('ABSPATH'))
    exit;
if (!class_exists('WbkData\WbkData')) {
    include __DIR__ . DIRECTORY_SEPARATOR . 'wbkdata.php';
} else {
    return;
}

/**
 * return instance of WbkData object
 */
if (!function_exists('WbkData')) {
    function WbkData()
    {
        return WbkData\WbkData::instance();
    }
}
