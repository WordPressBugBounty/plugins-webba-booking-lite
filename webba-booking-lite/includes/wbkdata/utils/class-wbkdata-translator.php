<?php

if (!defined('ABSPATH'))
    exit;
/*
 * This file is part of Webba Booking plugin



 */

class WbkData_Translator
{

    private static $instance;

    private $strings;

    private function __construct()
    {
        $this->initialize_default();
    }

    public static function get_instance()
    {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public static function load_textdomain()
    {
        load_textdomain('wbkdata', __DIR__ . DIRECTORY_SEPARATOR . 'lang' . DIRECTORY_SEPARATOR . 'wbkdata-' . get_user_locale() . '.mo');
    }

    public function localize_script($slug)
    {
        $translation_array = [
            'rest_url' => esc_url_raw(parse_url(rest_url(), PHP_URL_PATH)),
            'nonce' => wp_create_nonce('wp_rest'),
            'properties_error_list_title' => $this->translate_string('The following fields are wrong:'),
            'loading' => $this->translate_string('Loading...'),
            'element_not_found' => $this->translate_string('Element not found'),
            'bad_request' => $this->translate_string('Bad request'),
            'failed' => $this->translate_string('Failed'),
            'forbidden' => $this->translate_string('Forbidden'),
            'no_filters_selected' => $this->translate_string('Please, set at least one filter'),
            'no_data_in_table' => $this->translate_string('No data available'),
            'showing_start_to_end' => $this->translate_string('Here _START_ to _END_ of _TOTAL_ entries'),
            'showing_0' => $this->translate_string('Showing 0 to 0 of 0 entries'),
            'filtered_from_total' => $this->translate_string('(filtered from _MAX_ total entries)'),
            'show_menu_entries' => $this->translate_string('Show _MENU_ entries'),
            'processing' => $this->translate_string('Processing...'),
            'search' => $this->translate_string('Search'),
            'no_matching_records' => $this->translate_string('No matching records found'),
            'first' => $this->translate_string('First'),
            'last' => $this->translate_string('Last'),
            'next' => $this->translate_string('Next'),
            'previous' => $this->translate_string('Previous'),
            'activate_ascending' => $this->translate_string(': activate to sort column ascending'),
            'activate_descending' => $this->translate_string(': activate to sort column descending'),
            'select_option' => __('Select option', 'webba-booking-lite'),
            'no_time' => __('No Time Slots available', 'webba-booking-lite'),
            'ajax_url' => admin_url('admin-ajax.php')
        ];

        wp_localize_script($slug, 'wbkdatal10n', $translation_array);
    }

    public function initialize_default()
    {
        $this->strings['%s is required'] = __('%s is required', 'wbkdata');
        $this->strings['%s must be a maximum of 256 characters'] = __('%s must be a maximum of 256 characters', 'wbkdata');
        $this->strings['Value of %s is not acceptable'] = __('Value of %s is not acceptable', 'wbkdata');
        $this->strings['%s must be a maximum of 65535 characters'] = __('%s must be a maximum of 65535 characters', 'wbkdata');
        $this->strings['Validation of %s failed'] = __('Validation of %s failed', 'wbkdata');
        $this->strings['Field %s is empty'] = __('Field %s is empty', 'wbkdata');
        $this->strings['The following fields are wrong:'] = 'The following fields are wrong:';
        $this->strings['Loading...'] = __('Loading...', 'wbkdata');
        $this->strings['Element not found'] = __('Element not found', 'wbkdata');
        $this->strings['Bad request'] = __('Bad request', 'wbkdata');
        $this->strings['Failed'] = __('Failed', 'wbkdata');
        $this->strings['Forbidden'] = __('Forbidden', 'wbkdata');
        $this->strings['Please, set at least one filter'] = __('Please, set at least one filter', 'wbkdata');
        $this->strings['No data available'] = __('No data available', 'wbkdata');
        $this->strings['Here _START_ to _END_ of _TOTAL_ entries'] = __('Here _START_ to _END_ of _TOTAL_ entries', 'wbkdata');
        $this->strings['Showing 0 to 0 of 0 entries'] = __('Showing 0 to 0 of 0 entries', 'wbkdata');
        $this->strings['(filtered from _MAX_ total entries)'] = __('(filtered from _MAX_ total entries)', 'wbkdata');
        $this->strings['Show _MENU_ entries'] = __('Show _MENU_ entries', 'wbkdata');
        $this->strings['Processing...'] = __('Processing...', 'wbkdata');
        $this->strings['Search'] = __('Search', 'wbkdata');
        $this->strings['No matching records found'] = __('No matching records found', 'wbkdata');
        $this->strings['First'] = __('First', 'wbkdata');
        $this->strings['Last'] = __('Last', 'wbkdata');
        $this->strings['Next'] = __('Next', 'wbkdata');
        $this->strings['Previous'] = __('Previous', 'wbkdata');
        $this->strings[': activate to sort column ascending'] = __(': activate to sort column ascending', 'wbkdata');
        $this->strings[': activate to sort column descending'] = __(': activate to sort column descending', 'wbkdata');
        $this->strings['Filters for'] = __('Filters for', 'wbkdata');
        $this->strings['Apply'] = __('Apply', 'wbkdata');
        $this->strings['Apply and close'] = __('Apply and close', 'wbkdata');
        $this->strings['Date'] = __('Date', 'wbkdata');
        $this->strings['Time'] = __('Time', 'wbkdata');
        $this->strings['Filters'] = __('Filters', 'wbkdata');
        $this->strings['Save and close'] = __('Save and close', 'wbkdata');
        $this->strings['New'] = __('New', 'wbkdata');
        $this->strings['Are you sure?'] = __('Are you sure?', 'wbkdata');
        $this->strings['Yes, delete it.'] = __('Yes, delete it.', 'wbkdata');
        $this->strings['select option'] = __('select option', 'wbkdata');
        $this->strings['select all'] = __('select all', 'wbkdata');
        $this->strings['deselect all'] = __('deselect all', 'wbkdata');

        $this->strings = apply_filters('wbkdata_strings', $this->strings);
    }
    public function translate_string($string)
    {
        if (isset($this->strings[$string])) {
            return $this->strings[$string];
        }
        return __($string);
    }

    public function set_string_translation($string, $value)
    {
        $this->strings[$string] = $value;
        return;

        if (isset($this->strings[$string])) {
            $this->strings[$string] = $string;
            return true;
        } else {

        }
        return false;
    }

}
function wbkdata_translate_string($string)
{
    return esc_html(WbkData_Translator::get_instance()->translate_string($string));
}
function wbkdata_set_strings_translations($strings)
{
    foreach ($strings as $key => $value) {
        WbkData_Translator::get_instance()->set_string_translation($key, $value);
    }
}
function wbkdata_restore_default_translation()
{
    WbkData_Translator::get_instance()->initialize_default();
}
function wbkdata_localize_script($slug = 'wbkdata')
{
    WbkData_Translator::get_instance()->localize_script($slug);
}



?>