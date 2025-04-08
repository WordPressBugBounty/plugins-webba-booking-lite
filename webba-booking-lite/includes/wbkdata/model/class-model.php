<?php
namespace WbkData;

use WBK_User_Utils;

if (!defined('ABSPATH'))
    exit;
/*
 * This file is part of Webba Booking plugin
 */


if (!defined('ABSPATH')) {
    exit;
}
/**
 * Database table class
 */
class Model
{
    /**
     * sections of fields
     *  @var array
     */
    public $sections;

    /**
     * collection of fields
     * @var Collection
     */
    public $fields;

    /**
     * the name of table in the database
     * @var string
     */
    protected $model_name;

    /**
     * cachced data
     * @var array
     */
    protected $storage;

    /**
     * Name of the single item in the table
     * i.e. Staff member
     * @var string
     */
    protected $single_item_name;

    /**
     * Name of the multiple items in the table
     * i.e. Staff members
     * @var string
     */
    protected $multiple_item_name;

    /**
     * Defind the roles of wp users that can delete get_items
     * @var array
     */
    protected $can_delete;

    /**
     * Determines the ability of records in the table to be duplicated
     * @var bool
     */
    protected $duplicatable;

    /**
     * Determines if confirmation is requried when duplicating
     * @var bool
     */
    protected $confirm_duplicate;

    /**
     * column to sort by defaul
     * @var [type]
     */
    protected $default_sort_column;

    /**
     * direction of sort
     * @var [type]
     */
    protected $default_sort_direction;

    /**
     * Table constructor
     * @param string $model_name name of table in the database
     */


    public function __construct($model_name)
    {
        $this->fields = new Collection('Field');
        $this->sections = [];
        $this->model_name = $model_name;
        $this->storage = [];
        $this->can_delete = [];
        $this->duplicatable = true;
        $this->default_sort_column = 0;
        $this->default_sort_direction = 'desc';
    }

    public function get_model_name()
    {
        return apply_filters('wbkdata_get_model_name', $this->model_name);
    }

    /**
     * create new Field and add to fields collection
     * @param string $slug slug
     * @param string $name name of the field in database
     * @param string $title UI name
     * @param string $type type of the field
     * @param string $section section to wich the field belongs (or empty)
     * @param array $extra_data additional information
     * @param mixed $default_value
     * @param mixed $editable
     * @param mixed $in_row
     * @param mixed $required
     */
    public function add_field($slug, $name, $title, $type, $section = '', $extra_data = null, $default_value = '', $editable = true, $in_row = true, $required = true)
    {
        $field = new Field($name, $title, $type, $section, $extra_data, $default_value, $editable, $in_row, $required);
        $field->set_model_name($this->model_name);
        $this->fields->add($field, $slug);
    }

    public function prepare_fields_to_view()
    {
        $this->storage['fields_to_view_db']['id'] = 'id';

        // get fields and filter by role
        $fields = $this->filter_fields_by_role('view', $this->fields->get_elements());

        foreach ($fields as $slug => $field) {
            $this->storage['fields_to_view'][$slug] = $field;
            $this->storage['fields_to_view_db'][$slug] = \WbkData_Model_Utils::clean_up_string($field->get_name());
        }
        if (1 === count($this->storage['fields_to_view_db'])) {
            $this->storage['fields_to_view_db'] = [];
            $this->storage['fields_to_view'] = [];
        }
    }



    public function get_items($filters = [])
    {
        global $wpdb;
        $this->prepare_fields_to_view();
        if (0 === count($this->storage['fields_to_view'])) {
            $this->storage['rows'] = [];
            return false;
        }
        // check for filters with default values
        if (count($filters) == 0) {
            foreach ($this->storage['fields_to_view'] as $slug => $field) {
                if (is_array($field->get_filter_value()) && count($field->get_filter_value()) > 0) {
                    $filter['name'] = $slug;
                    $filter['value'] = $field->get_filter_value();
                    $filters[] = $filter;
                } else {
                    $filter['name'] = $slug;
                    switch ($filter['name']) {
                        case 'appointment_day':
                            break;
                        default:
                            $filter['value'] = '';
                            break;
                    }

                    $filters[] = $filter;
                }
            }
        } else {
            $appointment_day = [];
            foreach ($filters as $key => $filter) {
                if ('appointment_day' == $filter['name']) {
                    $prev_time_zone = date_default_timezone_get();
                    date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
                    $appointment_day[] = strtotime($filter['value']);
                    date_default_timezone_set($prev_time_zone);
                    unset($filters[$key]);
                }
            }
            if ($appointment_day) {
                $filters[] = array(
                    'name' => 'appointment_day',
                    'value' => $appointment_day
                );
            }
        }
        if (count($filters) > 0) {
            foreach ($filters as $filter) {

                $filter_name = $filter['name'];

                if (is_array($filter['value'])) {
                    $filter_value = $filter['value'];
                } else {
                    $filter_value = array($filter['value']);
                }

                if ('appointment_service_categories' == $filter_name) {
                    $filter_name = 'appointment_service_id';

                    $service_categories = $wpdb->get_var($wpdb->prepare("SELECT list FROM " . get_option('wbk_db_prefix', '') . "wbk_service_categories WHERE id = %d", $filter_value));
                    $service_categories_ids = json_decode($service_categories);

                    $filter_value = $service_categories_ids;
                }

                $filter_value = apply_filters('wbkdata_filter_value', $filter_value, $filter_name);

                if (!empty($filter_value)) {
                    $this->fields->get_element_at($filter_name)->set_filter_value($filter_value);
                }
            }
        }
        $conditions_by_fields = [];
        foreach ($this->fields->get_elements() as $slug => $field) {

            $filter_sql = $field->filter_to_sql();

            if ('' !== $filter_sql) {

                $conditions_by_fields[] = '(' . $filter_sql . ')';
            }
        }
        if (count($conditions_by_fields) > 0) {
            $conditions = implode(' AND ', $conditions_by_fields);
        } else {
            $conditions = '';
        }
        // update conditions
        $user = wp_get_current_user();
        if (
            $this->model_name == get_option('wbk_db_prefix', '') . 'wbk_appointments'
        ) {
            if (
                in_array('administrator', $user->roles, true) ||
                (is_multisite() && !is_super_admin())
            ) {
            } else {
                $services = \WBK_Model_Utils::get_service_ids(true);
                $condition_this = ' AND service_id in (' . implode(',', $services) . ')';
                $conditions .= $condition_this;
            }
        }
        if (
            $this->model_name == get_option('wbk_db_prefix', '') . 'wbk_services'
        ) {

            if (
                in_array('administrator', $user->roles, true) ||
                (is_multisite() && !is_super_admin())
            ) {
            } else {
                $services = \WBK_Model_Utils::get_service_ids(true, false);
                $condition_this = ' id in (' . implode(',', $services) . ')';
                $conditions .= $condition_this;
            }
        }

        if ('' !== $conditions) {
            $conditions = ' WHERE ' . $conditions;
        }
        $sql = 'SELECT ' . implode(', ', $this->storage['fields_to_view_db']) . ' from ' . \WbkData_Model_Utils::clean_up_string($this->get_model_name()) . $conditions;

        $result = apply_filters('wbkdata_rows_value', $wpdb->get_results($sql), $this->model_name);
        //  $result = $this->remove_slashes_from_properties($result);

        $this->storage['rows'] = $result;

        if (is_null($this->storage['rows'])) {
            $this->storage['rows'] = [];
            return false;
        }

        return $result;
    }
    public function remove_slashes_from_properties($array)
    {
        foreach ($array as $key => $obj) {
            foreach ($obj as $prop => $value) {
                if (is_string($value)) {
                    $array[$key]->$prop = wp_unslash($value);
                }
            }
        }
        return $array;
    }
    /**
     * prepare the form for filtering data in the table
     * @return null
     */

    public function prepare_filter_form()
    {
        $this->storage['filters'] = [];
        $fields = $this->fields->get_elements();
        $fields = $this->filter_fields_by_role('view', $fields);
        // filter fields list by role
        $fields = $this->filter_fields_by_role('view', $fields);
        foreach ($fields as $slug => $field) {
            if ('' !== $field->get_filter_type()) {
                $this->storage['filters'][$slug] = $field;
            }
        }
    }
    /**
     * prepare the form for adding or updating new element in the table
     * based on current user role and 3d party hooks
     * @param  string $action 'add' or 'update'ó
     * @return null
     */
    public function prepare_properties_form($action)
    {
        // filter fields by ediable flag
        $fields = $this->filter_fields_by_ediable($this->fields->get_elements());

        // filter fields list by role
        $fields = $this->filter_fields_by_role($action, $fields);

        $this->storage['property_sections_' . $action] = [];
        $this->storage['property_fields_' . $action] = [];

        foreach ($fields as $slug => $field) {
            $this->storage['property_sections_' . $action][] = $field->get_section();
            $this->storage['property_fields_' . $action][$slug] = $field;
        }
    }
    /**
     * @param mixed $key
     * @return string
     */
    public function get_data($key)
    {
        if (isset($this->storage[$key])) {
            return $this->storage[$key];
        }

        return '';
    }

    /**
     * check if structure of table in database is the same as declared in model
     * and update structure if differences found
     * @var bool
     */
    public function sync_structure()
    {
        global $wpdb;
        $model_name = \WbkData_Model_Utils::clean_up_string($this->get_model_name());
        // check if table exitsts and create if does not
        $wpdb->query("CREATE TABLE IF NOT EXISTS " . $model_name . " ( id int unsigned NOT NULL auto_increment PRIMARY KEY )");
        // iterate over fields
        $fields = $this->fields->get_elements();
        $model_updated = false;

        foreach ($fields as $slug => $field) {
            // check if field exists
            $field_name = \WbkData_Model_Utils::clean_up_string($field->get_name());
            $args = [$field_name];
            if (0 === $wpdb->query($wpdb->prepare('SHOW COLUMNS FROM ' . $model_name . ' LIKE %s ', $args))) {
                $model_updated = true;
                $sql_type = $field->field_type_to_sql_type();
                if (false !== $sql_type) {
                    $wpdb->query('ALTER TABLE `' . $model_name . '`  ADD `' . $field_name . '`' . $sql_type);
                }
            }
        }
        if (!$model_updated) {
            $this->generate_frontend_model();
        }

    }
    /**
     * Generate json schema for using in react app
     * @return void
     */
    public function generate_frontend_model()
    {

        global $wpdb;
        $data = ['$schema' => 'http://json-schema.org/draft-07/schema#', 'type' => 'object'];
        $fields = $this->fields->get_elements();
        $properties = [];
        foreach ($fields as $slug => $field) {
            if (!$field->get_editable() && !$field->get_in_row()) {
                continue;
            }
            switch ($field->get_type()) {
                case 'text':
                    $type = 'string';
                    $input_type = 'text';
                    break;
                case 'editor':
                    $type = 'string';
                    $input_type = 'editor';
                    break;
                case 'date_range':
                    $type = 'string';
                    $input_type = 'date_range';
                    break;
                case 'wbk_business_hours':
                    $type = 'json';
                    $input_type = 'business_hours';
                    break;
                case 'select':
                    $type = 'string';
                    $input_type = 'select';
                    break;
                case 'textarea':
                    $type = 'string';
                    $input_type = 'textarea';
                    break;
                case 'checkbox':
                    $type = 'string';
                    $input_type = 'checkbox';
                    break;
                case 'wbk_date':
                    $type = 'string';
                    $input_type = 'date';
                    break;
                case 'wbk_time':
                    $type = 'string';
                    $input_type = 'time';
                    break;
                case 'wbk_app_custom_data':
                    $type = 'string';
                    $input_type = 'webba_custom_data';
                    break;
                case 'wbk_google_access_token':
                    $type = 'string';
                    $input_type = 'webba_google_access_token';
                    break;
                case 'radio':
                    $type = 'string';
                    $input_type = 'radio';
                    break;

                default:
                    $type = 'not_defined';
                    $input_type = 'not_defined';
                    break;
            }
            $misc = $field->get_extra_data();
            if (isset($misc['items'])) {
                unset($misc['items']);
            }
            $properties[$slug] = [
                'type' => $type,
                'input_type' => $input_type,
                'hidden' => !$field->get_in_row(),
                'title' => $field->get_title(),
                'tab' => $field->get_section(),
                'misc' => $misc,
                'required' => $field->get_required(),
                'dependency' => $field->get_dependency(),
                'default_value' => $field->get_default_value(),
                'editable' => $field->get_editable()
            ];
        }
        $data['properties'] = $properties;
        $json_output = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        $model_name = str_replace([$wpdb->prefix, 'wbk_'], [''], $this->model_name);

        $path = WP_WEBBA_BOOKING__PLUGIN_DIR . DIRECTORY_SEPARATOR . 'src' . DIRECTORY_SEPARATOR . 'schemas' . DIRECTORY_SEPARATOR . $model_name . '.json';
        file_put_contents(
            $path,
            $json_output
        );

    }
    /**
     * @return string
     */
    public function get_single_item_name()
    {
        return $this->single_item_name;
    }

    /**
     * @param string $single_item_name
     *
     * @return static
     */
    public function set_single_item_name($single_item_name)
    {
        $this->single_item_name = $single_item_name;

        return $this;
    }

    /**
     * update row
     * @param $strin $data new data
     * @param mixed $data
     */
    public function add_item($data)
    {
        global $wpdb;
        $sanitized_data = [];
        foreach ($data as $key => $value) {
            $sanitized_data[$key] = $value;
        }

        // filter fields list by role
        $fields = $this->filter_fields_by_role('add', $this->fields->get_elements());
        // filter fields by dependency
        $fields = $this->filter_fields_by_dependency($fields, $sanitized_data);
        $fields_before_editable_check = $fields;
        // filter fields list by editable
        $fields = $this->filter_fields_by_ediable($fields);

        // validation
        $validation = $this->validate_fields($fields, $sanitized_data);
        $invalid_fields = $validation['invalid_fields'];
        if (count($invalid_fields) > 0) {
            return [false, $invalid_fields];
        }

        $values_and_format = [$validation['valid_fields'], $validation['field_formats']];

        // filter by 3dparty (add values)
        $values_and_format = apply_filters('wbkdata_add_item_values', $values_and_format, $this->get_model_name());
        $model_name = \WbkData_Model_Utils::clean_up_string($this->get_model_name());
        $wpdb->insert($model_name, $values_and_format[0], $values_and_format[1]);
        $id = $wpdb->insert_id;
        $item = $this->get_item($id);
        $item = json_decode(json_encode($item), true);
        $row_for_action = (object) $item;
        do_action('wbkdata_on_after_item_added', $model_name, $this->model_name, $row_for_action);
        return [true, 'id' => $id];
    }

    public function update_item($data, $id)
    {
        global $wpdb;
        $sanitized_data = [];
        // sanitization
        foreach ($data as $key => $value) {
            $sanitized_data[$key] = $value;
        }

        // filter fields list by role
        $fields = $this->filter_fields_by_role('update', $this->fields->get_elements());
        // filter fields by dependency
        $fields = $this->filter_fields_by_dependency($fields, $sanitized_data);
        $fields_before_editable_check = $fields;
        // filter fields list by editable
        $fields = $this->filter_fields_by_ediable($fields);

        // validation
        $validation = $this->validate_fields($fields, $sanitized_data);
        if (count($validation['valid_fields']) == 0) {
            return [false, null];
        }
        // filter by 3dparty
        $conditions = [['id' => $id], ['%d']];
        $conditions = apply_filters('wbkdata_update_item_conditions', $conditions, $this->get_model_name());

        $model_name = \WbkData_Model_Utils::clean_up_string($this->get_model_name());

        if (false === $wpdb->update($model_name, $validation['valid_fields'], $conditions[0], $validation['field_formats'], $conditions[1])) {
            return [false, null];
        }
        do_action('wbkdata_on_after_item_updated', $model_name, $this->model_name, $id);
        return [true, null];
    }
    public function get_item($id, $output = OBJECT)
    {
        global $wpdb;
        $args = [$id];
        $model_name = \WbkData_Model_Utils::clean_up_string($this->get_model_name());
        $this->prepare_fields_to_view();
        if (0 === count($this->storage['fields_to_view_db'])) {
            return null;
        }
        $fields = implode(',', $this->storage['fields_to_view_db']);
        $conditions = ' where id = %d ';
        $conditions = apply_filters('wbkdata_get_item_conditions', $conditions, $this->get_model_name());

        $value = $wpdb->get_row($wpdb->prepare('SELECT ' . $fields . ' FROM ' . $model_name . $conditions, $args), $output);
        $value = array($value);
        apply_filters('wbkdata_rows_value', $value, $this->model_name);
        return $value[0];

    }
    public function delete_item($id)
    {
        global $wpdb;
        $args = [$id];
        $model_name = \WbkData_Model_Utils::clean_up_string($this->get_model_name());
        $item = $this->get_item($id);

        if (!$this->current_user_can_delete($item)) {
            return false;
        }
        do_action('wbkdata_on_before_item_deleted', $model_name, $this->model_name, $item);
        $result = $wpdb->delete($model_name, ['id' => $id], '%d');

        if ($result) {
            do_action('wbkdata_on_after_item_deleted', $model_name, $this->model_name, $item);
        }

        return $result;
    }
    public function сurrent_user_can_view()
    {
        $user = wp_get_current_user();
        if (current_user_can('manage_options') || current_user_can('manage_sites')) {
            return true;
        }
        $this->prepare_fields_to_view();
        if (0 === count($this->storage['fields_to_view_db'])) {
            return false;
        }

        return true;
    }
    public function current_user_can_delete($row = null)
    {
        $user = wp_get_current_user();
        if (current_user_can('manage_options') || current_user_can('manage_sites')) {
            return apply_filters('wbkdata_row_can_delete', true, $row, $this->get_model_name());
        }

        foreach ($user->roles as $role) {
            if (in_array($role, $this->can_delete, true)) {
                return apply_filters('wbkdata_row_can_delete', true, $row, $this->get_model_name());
            }
        }

        return apply_filters('wbkdata_row_can_delete', false, $row, $this->get_model_name());
    }
    public function current_user_can_add()
    {
        // filter fields list by editable
        $fields = $this->filter_fields_by_ediable($this->fields->get_elements());

        // filter fields list by role
        $fields = $this->filter_fields_by_role('add', $fields);

        if (0 === count($fields)) {
            return false;
        }

        return true;
    }
    public function current_user_can_update()
    {
        // filter fields list by editable
        $fields = $this->filter_fields_by_ediable($this->fields->get_elements());

        // filter fields list by role
        $fields = $this->filter_fields_by_role('update', $fields);

        if (0 === count($fields)) {
            return false;
        }

        return true;
    }
    /**
     * Check role current user for duplicate row
     * @return bool
     */
    public function current_user_can_duplicate()
    {
        // filter fields list by editable
        $fields = $this->filter_fields_by_ediable($this->fields->get_elements());

        // filter fields list by role
        $fields = $this->filter_fields_by_role('add', $fields);

        if (0 === count($fields)) {
            return false;
        }
        return true;
    }

    /**
     * Get the value of Name of the multiple items in the table
     *
     * @return string
     */
    public function get_multiple_item_name()
    {
        return $this->multiple_item_name;
    }

    /**
     * Set the value of Name of the multiple items in the table
     *
     * @param string multiple_item_name
     * @param mixed $multiple_item_name
     *
     * @return self
     */
    public function set_multiple_item_name($multiple_item_name)
    {
        $this->multiple_item_name = $multiple_item_name;

        return $this;
    }
    /**
     * filter fields based on dependncies betwenn fields
     * @param  array $fields array of fields to filter
     * @param  array $post_data sanitized post data
     * @return array array of filtered fields
     */
    public static function filter_fields_by_dependency($fields, $post_data)
    {
        $fields_filtered = [];
        foreach ($fields as $slug => $field) {
            // check if dependency set
            if (count($field->get_dependency()) > 0) {
                $arr_dependency = $field->get_dependency();
                // check if dependency set for roles
                if (isset($arr_dependency['administrator'])) {
                    $user = wp_get_current_user();
                    $role = $user->roles[0];
                    if (isset($arr_dependency[$role])) {
                        $arr_dependency = $arr_dependency[$role];
                    }
                }
                $rules_passed = true;
                foreach ($arr_dependency as $dependency_rule) {
                    if (3 !== count($dependency_rule)) {
                        continue;
                    }
                    switch ($dependency_rule[1]) {
                        case '=':
                            if (isset($post_data[$dependency_rule[0]])) {
                                if ($post_data[$dependency_rule[0]] != $dependency_rule[2]) {
                                    $rules_passed = false;
                                }
                            }

                            break;
                        case '<':
                            if (isset($post_data[$dependency_rule[0]])) {
                                if ($post_data[$dependency_rule[0]] >= $dependency_rule[2]) {
                                    $rules_passed = false;
                                }
                            }

                            break;
                        case '>':
                            if (isset($post_data[$dependency_rule[0]])) {
                                if ($post_data[$dependency_rule[0]] <= $dependency_rule[2]) {
                                    $rules_passed = false;
                                }
                            }

                            break;
                        case '!=':
                            if (isset($post_data[$dependency_rule[0]])) {
                                if ($post_data[$dependency_rule[0]] == $dependency_rule[2]) {
                                    $rules_passed = false;
                                }
                            }

                            break;
                        default:

                            break;
                    }
                }

                if ($rules_passed) {
                    $fields_filtered[$slug] = $field;
                }
            } else {
                $fields_filtered[$slug] = $field;
            }
        }

        return $fields_filtered;
    }
    /**
     * grant full access to all fields of tables
     * @param array $roles wp user roles that obtain full access
     * @return null
     */
    public function grant_full_access($roles)
    {
        foreach ($this->fields->get_elements() as $slug => $field) {
            $field->set_can_add($roles);
            $field->set_can_update($roles);
            $field->set_can_view($roles);
        }
        $this->can_delete = $roles;
    }

    /**
     * Get the value of roles of wp users that can delete  
     *
     * @return array
     */
    public function get_can_delete()
    {
        return $this->can_delete;
    }

    /**
     * Set the value of Defind the roles of wp users that can delete get_items
     *
     * @param array can_delete
     * @param mixed $can_delete
     *
     * @return self
     */
    public function set_can_delete($can_delete)
    {
        $this->can_delete = $can_delete;

        return $this;
    }

    public function clean_up_value($value)
    {
        $value = trim(stripslashes($value), '"');
        return $value;
    }
    public function validate_fields($fields, $data)
    {
        $invalid_fields = [];
        $valid_fields = [];
        $field_formats = [];

        foreach ($fields as $slug => $field) {
            if (isset($data[$field->get_name()])) {
                $validation_result = apply_filters('wbkdata_property_field_validation_' . $field->get_type(), [false, ''], $data[$field->get_name()], $slug, $field);
                if (!array($validation_result)) {
                    $invalid_fields[] = [$slug, sprintf(wbkdata_translate_string('Validation of %s failed'), $field->get_title())];
                } else {
                    if (true === $validation_result[0]) {
                        $format = $field->field_type_to_sql_type(true);
                        if (false === $format) {
                            continue;
                        }
                        $valid_fields[$field->get_name()] = $this->clean_up_value($validation_result[1]);
                        $field_formats[] = $format;
                    } else {
                        $invalid_fields[] = [$slug, $validation_result[1]];
                    }
                }

            } else {
                if ($field->get_required()) {
                    $invalid_fields[] = [$slug, sprintf(wbkdata_translate_string('Field %s is empty'), $field->get_title())];
                }
            }
        }

        return ['invalid_fields' => $invalid_fields, 'valid_fields' => $valid_fields, 'field_formats' => $field_formats];
    }

    /**
     * Summary of filter_fields_by_role
     * @param string $action
     * @param array $fields
     * @return array
     */
    protected function filter_fields_by_role($action, $fields)
    {
        $fields_filtered = [];
        foreach ($fields as $slug => $field) {
            // check if current user can add the field
            if (is_user_logged_in()) {
                $user = wp_get_current_user();

                $have_permission = current_user_can('manage_options') && current_user_can('manage_sites');

                if (isset($_REQUEST['model']) && $_REQUEST['model'] == 'appointments' && isset($_REQUEST['service_id'])) {
                    $have_permission = WBK_User_Utils::check_access_to_particular_service(get_current_user_id(), $_REQUEST['service_id']);
                }

                if ($have_permission) {
                    $role_found = false;
                    foreach ($user->roles as $role) {
                        switch ($action) {
                            case 'add':
                                $compare_arr = $field->get_can_add();
                                break;
                            case 'view':
                                $compare_arr = $field->get_can_view();
                                break;
                            case 'update':
                                $compare_arr = $field->get_can_update();
                                break;
                        }
                        if (in_array($role, $compare_arr, true)) {
                            $role_found = true;
                        }
                    }
                    if (!$role_found) {
                        continue;
                    }
                } else {
                    $admin_passed = apply_filters('wbkdata_admin_filter_by_role', true, $action, $field);
                    if (!$admin_passed) {
                        continue;
                    }
                }
            } else {
                continue;
            }
            $fields_filtered[$slug] = $field;
        }

        return $fields_filtered;
    }

    protected function filter_fields_by_ediable($fields)
    {
        $fields_filtered = [];
        foreach ($fields as $slug => $field) {
            // check if this field can be edited
            if (!$field->get_editable()) {
                continue;
            }
            $fields_filtered[$slug] = $field;
        }

        return $fields_filtered;
    }

    /**
     * function to get value var duplicatable
     * @return bool
     */
    public function get_duplicatable()
    {
        return $this->duplicatable;
    }

    public function set_duplicatable($duplicatable)
    {
        $this->duplicatable = $duplicatable;
    }

    public function get_confirm_duplicate()
    {
        return $this->confirm_duplicate;
    }

    public function set_confirm_duplicate($confirm_duplicate)
    {
        $this->confirm_duplicate = $confirm_duplicate;
    }

    /**
     * Get the value of column to sort by defaul
     *
     * @return int
     */
    public function get_default_sort_column()
    {
        return $this->default_sort_column;
    }

    /**
     * Set the value of column to sort by defaul
     *
     * @param int $default_sort_column
     *
     * @return self
     */
    public function set_default_sort_column($default_sort_column)
    {
        $this->default_sort_column = $default_sort_column;

        return $this;
    }

    /**
     * Get the value of direction of sort
     *
     * @return string
     */
    public function get_default_sort_direction()
    {
        return $this->default_sort_direction;
    }

    /**
     * Set the value of direction of sort
     *
     * @param string $default_sort_direction
     *
     * @return self
     */
    public function set_default_sort_direction($default_sort_direction)
    {
        $this->default_sort_direction = $default_sort_direction;

        return $this;
    }

    public function get_dependency_by_field($field)
    {
        if (is_array($field->get_dependency())) {
            $arr_dependency = $field->get_dependency();
            if (isset($arr_dependency['administrator'])) {
                $user = wp_get_current_user();
                $role = $user->roles[0];
                if (isset($arr_dependency[$role])) {
                    $arr_dependency = $arr_dependency[$role];
                    $dependency = '[';
                    foreach ($arr_dependency as $value) {
                        $dependency .= '["' . implode('","', $value) . '"]';
                    }
                    $dependency .= ']';
                    return str_replace('][', '],[', $dependency);
                }
            } else {
                $dependency = '[';
                foreach ($arr_dependency as $value) {
                    $dependency .= '["' . implode('","', $value) . '"]';
                }
                $dependency .= ']';
                return str_replace('][', '],[', $dependency);
            }
        }

        return '';
    }

}
