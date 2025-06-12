<?php
namespace WbkData;

use WBK_Placeholder_Processor;
use WBK_User_Utils;

if (!defined('ABSPATH')) {
    exit();
}
/*
 * This file is part of Webba Booking plugin
 */

if (!defined('ABSPATH')) {
    exit();
}
class Controller
{
    /**
     * constructor
     */
    public function __construct()
    {
        // add or update item
        add_action('rest_api_init', function () {
            register_rest_route('wbkdata/v1', '/save-item/', [
                'methods' => 'POST',
                'callback' => [$this, 'save_item'],
                'permission_callback' => [$this, 'save_item_permission'],
            ]);
        });
        // duplicate item
        add_action('rest_api_init', function () {
            register_rest_route('wbkdata/v1', '/duplicate-item/', [
                'methods' => 'POST',
                'callback' => [$this, 'duplicate_item'],
                'permission_callback' => [
                    $this,
                    'duplicate_properties_permission',
                ],
            ]);
        });
        // get items applying filters (if set)
        add_action('rest_api_init', function () {
            register_rest_route('wbkdata/v1', '/get-items/', [
                'methods' => 'GET',
                'callback' => [$this, 'get_items'],
                'permission_callback' => [$this, 'get_items_permission'],
            ]);
        });
        // delete items
        add_action('rest_api_init', function () {
            register_rest_route('wbkdata/v1', '/delete-items/', [
                'methods' => 'POST',
                'callback' => [$this, 'delete_items'],
                'permission_callback' => [$this, 'delete_items_permission'],
            ]);
        });
    }
    /**
     * save properties
     * @param  \WP_REST_Request $request rest request object
     * @return \WP_REST_Response rest response object
     */
    public function save_item($request)
    {
        $model = get_option('wbk_db_prefix', '') . 'wbk_' . trim(sanitize_text_field($request['model']));
        $fields = $request['data'];
        $id = null;
        if (isset($fields['id'])) {
            $id = $fields['id'];
        }
        $data = null;
        if (false === WbkData()->models->get_element_at($model)) {
            return new \WP_REST_Response(['status' => 'fail'], 404);
        }
        if (!is_numeric($id)) {
            $action_result = WbkData()
                ->models->get_element_at($model)
                ->add_item($fields);
            if ($action_result[0] == true) {
                unset($action_result[0]);
                $model = trim(sanitize_text_field($request['model']));
                if ($model === 'appointments') {
                    $action_result['extra_data']['dynamic_title'] = WBK_Placeholder_Processor::process_placeholders(get_option('wbk_backend_calendar_booking_text', '#customer_name [#service_name]'), $action_result['id']);
                }

                if ($model === 'services') {
                    $action_result['can_edit'] = \WBK_User_Utils::check_access_to_particular_service($action_result['id'], true);
                    $action_result['can_delete'] = \WBK_User_Utils::check_access_to_particular_service($action_result['id'], false);
                } elseif($model === 'appointments') {
                    $action_result['can_edit'] = \WBK_User_Utils::check_access_to_particular_service($fields['service_id'], false);
                    $action_result['can_delete'] = \WBK_User_Utils::check_access_to_particular_service($fields['service_id'], false);
                } else {
                    $action_result['can_edit'] = true;
                    $action_result['can_delete'] = true;
                }

                return new \WP_REST_Response(['status' => 'succces', 'details' => $action_result], 200);
            } else {
                return new \WP_REST_Response(['status' => 'fail', 'invalid_fields' => $action_result[1]], 400);
            }
        } else {
            $action_result = WbkData()
                ->models->get_element_at($model)
                ->update_item($fields, $id);
            if ($action_result[0] == true) {
                return new \WP_REST_Response(['status' => 'succces', 'id' => $id], 200);
            } else {
                return new \WP_REST_Response(['status' => 'fail', 'invalid_fields' => $action_result['invalid_fields']], 400);
            }
        }
    }


    /**
     * Summary of send_response
     * @param int $code
     * @param mixed $data
     * @return \WP_REST_Response
     */
    public function send_response($code, $data): \WP_REST_Response
    {
        $response = new \WP_REST_Response($data);
        $response->set_status($code);
        return $response;
    }

    /**
     * get_items
     * @param  /WP_REST_Request $request rest request object
     * @return /WP_REST_Response rest response object
     */
    public function get_items($request)
    {
        global $wpdb;

        $params = $request->get_params();
        $model = $wpdb->prefix . 'wbk_' . trim(sanitize_text_field($params['model']));

        $filters = !empty($params['filters']) ? $params['filters'] : [];
        $data = null;
        if (false === WbkData()->models->get_element_at($model)) {
            return $this->send_response(400, $data);
        }
        $result = WbkData()
            ->models->get_element_at($model)
            ->get_items($filters);

        if (false === $result) {
            return $this->send_response(404, $data);
        }
        date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
        foreach ($result as $item) {
            if (trim(sanitize_text_field($params['model'])) === 'services') {
                $item->can_edit = \WBK_User_Utils::check_access_to_particular_service($item->id, true);
                $item->can_delete = current_user_can('manage_options');
            } elseif (trim(sanitize_text_field($params['model'])) === 'appointments'){
                $item->can_edit = true;
                $item->can_delete = WBK_User_Utils::is_user_associated_with_service(get_current_user_id(), $item->service_id);
            } else if (trim(sanitize_text_field($params['model'])) === 'email_templates'){
                $item->can_edit = true;
                $item->can_delete = $item->is_default === 'yes' ? false : true;
            } else {
                $item->can_delete = true;
                $item->can_edit = true;
            }
            
            if (trim(sanitize_text_field($params['model'])) === 'appointments') {
                $item->extra_data = [
                    'dynamic_title' => WBK_Placeholder_Processor::process_placeholders(get_option('wbk_backend_calendar_booking_text', '#customer_name [#service_name]'), $item->id)
                ];
            }
        }

        $response = new \WP_REST_Response($result);
        $response->set_status(200);
        return $response;
    }
    /**
     * delete_items
     * @param  \WP_REST_Request $request rest request object
     * @return \WP_REST_Response rest response object
     */
    public function delete_items($request)
    {
        $model = get_option('wbk_db_prefix', '') . 'wbk_' . trim(sanitize_text_field($request['model']));
        $data = null;
        if (false === WbkData()->models->get_element_at($model)) {
            return new \WP_REST_Response(['status' => 'fail'], 400);
        }
        $removed = [];
        if (is_array($request['ids'])) {
            foreach ($request['ids'] as $id) {
                if (is_numeric($id)) {
                    if (
                        WbkData()
                            ->models->get_element_at($model)
                            ->delete_item($id) > 0
                    ) {
                        $removed[] = $id;
                    }
                }
            }
        }
        $removed = ['id' => $removed];
        return new \WP_REST_Response(['details' => $removed], 200);
    }

    /**
     * check if current user add or edit the rows
     * @param  /WP_REST_Request $request rest request object
     * @return bool allow or not rest request
     */
    public function save_item_permission($request)
    {
        if (current_user_can('manage_options') || current_user_can('manage_sites')) {
            return true;
        }

        $row_id = (int) $request['data']['id'];

        if ($request['model'] == 'services') {
            if (is_numeric($row_id)) {
                return \WBK_User_Utils::check_access_to_particular_service($row_id, true);
            }
        }

        if ($request['model'] == 'appointments') {
            if (is_numeric($row_id) && $row_id !== 0) {
                $booking = new \WBK_Booking($row_id);
                if (!$booking->is_loaded()) {
                    return false;
                }
                return \WBK_User_Utils::check_access_to_particular_service($booking->get_service(), false);
            } elseif (isset($request['data']['service_id'])) {
                return \WBK_User_Utils::check_access_to_particular_service((int)@$request['data']['service_id'], false);
            }
        }

        return false;
    }

    /**
     * check if current user can get rows
     * @param  /WP_REST_Request $request rest request object
     * @return bool allow or not rest request
     */
    public function get_items_permission($request)
    {
        $model = get_option('wbk_db_prefix', '') . 'wbk_' . sanitize_text_field($request['model']);
        if (false === WbkData()->models->get_element_at($model)) {
            return false;
        }


        $result = WbkData()
            ->models->get_element_at($model)
            ->сurrent_user_can_view();
        return $result;
    }
    /**
     * check if current user can delete items
     * @param  /WP_REST_Request $request rest request object
     * @return bool allow or not rest request
     */
    public function delete_items_permission($request)
    {
        $model = get_option('wbk_db_prefix', '') . 'wbk_' . sanitize_text_field($request['model']);
        if (false === WbkData()->models->get_element_at($model)) {
            return false;
        }
        if (current_user_can('manage_options') || current_user_can('manage_sites')) {
            return true;
        }

        if(trim(sanitize_text_field($request['model'])) === 'appointments' && is_array($request['ids']) && count($request['ids']) > 0){
            foreach ($request['ids'] as $id) {
                if (is_numeric($id)) {
                    $booking = new \WBK_Booking($id);
                    if (!$booking->is_loaded()) {
                        return false;
                    }
                    
                    if (WBK_User_Utils::check_access_to_particular_service($booking->service_id)) {
                        return false;
                    }
                }
            }
            return true;
        }

        return false;
    }

    /**
     * check if current user duplicate the rows
     * @param WP_REST_Request $request rest request object
     * @return bool allow or not rest request
     */
    public function duplicate_properties_permission($request)
    {
        $table = sanitize_text_field($request['table']);
        if (false === WbkData()->tables->get_element_at($table)) {
            return false;
        }
        if (current_user_can('manage_options') || current_user_can('manage_sites')) {
            return true;
        }
        return false;

    }

    /**
     * duplicate_row
     * @param  WP_REST_Request $request rest request object
     * @return WP_REST_Response rest response object
     */
    public function duplicate_row($request)
    {
        $table = trim(sanitize_text_field($request['table']));
        $data = null;

        if (false === WbkData()->tables->get_element_at($table)) {
            $response = new \WP_REST_Response($data);
            $response->set_status(400);

            return $response;
        }
        if (!is_numeric($request['row_id'])) {
            $response = new \WP_REST_Response(null);
            $response->set_status(400);

            return $response;
        } else {
            $row_id = (int) $request['row_id'];
            $row = WbkData()
                ->tables->get_element_at($table)
                ->get_row($row_id, ARRAY_A);
            unset($row['id']);
            $row['name'] = 'Duplicate of ' . $row['name'];
            $duration = $row['duration'];
            $fields = WbkData()
                ->tables->get_element_at($table)
                ->fields->get_elements();
            $field_types = [];
            foreach ($fields as $key => $field) {
                $ed = $field->get_extra_data();
                if (isset($ed['multiple']) && $field->get_type() == 'select') {
                    $field_types[$field->get_name()] = 'select_multiple';
                } else {
                    $field_types[$field->get_name()] = $field->get_type();
                }
            }
            $fields_to_add = [];
            foreach ($row as $key => $value) {
                if ($field_types[$key] == 'select_multiple') {
                    $fields_to_add[] = [
                        'name' => $key,
                        'value' => json_decode($value),
                    ];
                } else {
                    $fields_to_add[] = ['name' => $key, 'value' => $value];
                }
            }
            $action_result = WbkData()
                ->tables->get_element_at($table)
                ->add_row($fields_to_add);
            $row = $action_result[0];
        }
        $filtered_fields = $action_result[1];
        if (is_null($row)) {
            $response = new \WP_REST_Response(null);
            $response->set_status(400);

            return $response;
        }
        if (false === $row) {
            $response = new \WP_REST_Response($action_result[1]);
            $response->set_status(422);

            return $response;
        }
        if (!is_null($row)) {
            $formated_row_values = [
                [
                    'display' =>
                        '<input type="checkbox" class="custom-checkbox-wb" checkbox-select-row>',
                    '@data-order' => $row['id'],
                ],
            ];
            if (
                get_option('wbk_db_prefix', '') . 'wbk_appointments' ==
                $table
            ) {
                $formated_row_values[] = $row['id'];
                date_default_timezone_set(get_option('wbk_timezone', 'UTC'));



                $formated_row_values[] = [
                    'display' =>
                        date(get_option('wbk_date_format_backend', 'm/d/y'), $row['time']) .
                        '<br />' .
                        date(get_option('time_format', 'g:i a'), $row['time']),
                    '@data-order' => $row['time'],
                ];
                $row['duration'] = $duration;
            }
            foreach (WbkData()->tables->get_element_at($table)->get_data('fields_to_view') as $field_slug => $field) {
                if (!$field->get_in_row()) {
                    continue;
                }
                if (!in_array($field, $filtered_fields, true)) {
                    $formated_row_values[] = '';
                    continue;
                }
                ob_start();
                $value = $row[$field->get_name()];
                if (!has_action('wbkdata_table_cell_' . $field->get_type())) {
                    echo '<p>No action found for the <strong>' .
                        'wbkdata_property_field_' .
                        $field->get_type() .
                        '</strong></p>';
                }
                do_action('wbkdata_table_cell_' . $field->get_type(), [
                    $field,
                    $field_slug,
                    $value,
                    $row,
                ]);
                $field_value = ob_get_clean();
                $formated_row_values[] = apply_filters(
                    'wbkdata_formated_row_value',
                    $field_value,
                    [$field, $field_slug, $value, $row]
                );
            }
            $row_options['canedit'] = WbkData()
                ->tables->get_element_at($table)
                ->current_user_can_add();

            $row_to_filter = (object) $row;
            $formated_row_values = apply_filters(
                'wbkdata_formated_row_values',
                $formated_row_values,
                $row_to_filter,
                $table
            );

            $response = new \WP_REST_Response([
                'row_data' => $formated_row_values,
                'row_options' => $row_options,
                'db_row_data' => $row,
            ]);
            $response->set_status(200);

            return $response;
        }
        $response = new \WP_REST_Response(null);
        $response->set_status(400);

        return $response;
    }
}

?>