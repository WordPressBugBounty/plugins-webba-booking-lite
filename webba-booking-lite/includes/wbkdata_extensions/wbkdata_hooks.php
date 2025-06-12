<?php
if (!defined('ABSPATH')) {
    exit();
}

add_action('wbkdata_on_after_item_added', 'wbk_wbkdata_on_after_item_added', 10, 3);
function wbk_wbkdata_on_after_item_added(
    $model_name,
    $table_name_not_filtered,
    $item
) {
    if ($model_name == get_option('wbk_db_prefix', '') . 'wbk_appointments') {
        $bf = new WBK_Booking_Factory();
        $bf->post_production([$item->id], 'on_manual_booking');
    }

    if ($model_name == get_option('wbk_db_prefix', '') . 'wbk_services') {
        $default_templates = WbkData()->models->get_element_at(get_option('wbk_db_prefix') . 'wbk_email_templates')->get_items([['name' => 'is_default', 'value' => 'yes']]);

        foreach ($default_templates as $template) {
            $assigned_services = isset($template->services) && !empty($template->services) && !is_null($template->services) ? json_decode($template->services) : [];
            $assigned_services[] = $item->id;

            WbkData()->models->get_element_at(get_option('wbk_db_prefix') . 'wbk_email_templates')->update_item(['services' => $assigned_services], $template->id);
        }
    }
}

add_action(
    'wbkdata_on_before_item_deleted',
    'wbk_wbkdata_on_before_item_deleted',
    10,
    3
);
function wbk_wbkdata_on_before_item_deleted(
    $model_name,
    $model_name_not_filtered,
    $row
) {
    global $wpdb;
    if ($model_name == get_option('wbk_db_prefix', '') . 'wbk_appointments') {
        $bf = new WBK_Booking_Factory();
        $bf->destroy($row->id, 'administrator', true);
    }
    if ($model_name == get_option('wbk_db_prefix', '') . 'wbk_services') {
        $wpdb->query(
            $wpdb->prepare(
                'DELETE from ' .
                get_option('wbk_db_prefix', '') .
                'wbk_appointments where service_id = %d',
                $row->id
            )
        );
    }
}

add_action(
    'wbkdata_on_after_item_updated',
    'wbk_wbkdata_on_after_item_updated',
    10,
    3
);
function wbk_wbkdata_on_after_item_updated(
    $model_name,
    $model_name_not_filtered,
    $item
) {
    if ($model_name == get_option('wbk_db_prefix', '') . 'wbk_appointments') {
        $bf = new WBK_Booking_Factory();
        $bf->update($item);

    }
}

add_filter('wbkdata_field_can_view', 'wbk_wbkdata_field_can_view', 10, 3);
function wbk_wbkdata_field_can_view($input, $field_name, $model_name)
{
    if (
        $model_name == get_option('wbk_db_prefix', '') . 'wbk_appointments' ||
        $model_name ==
        get_option('wbk_db_prefix', '') . 'wbk_cancelled_appointments'
    ) {
        if (WBK_User_Utils::check_access_to_service()) {
            $user = wp_get_current_user();
            $roles = (array) $user->roles;
            $input = array_unique(array_merge($input, $roles));
        }
    }

    return $input;
}

add_filter('wbkdata_field_can_update', 'wbk_wbkdata_field_can_update', 10, 3);
function wbk_wbkdata_field_can_update($input, $field_name, $table_name)
{
    if (
        $table_name == get_option('wbk_db_prefix', '') . 'wbk_appointments' ||
        $table_name ==
        get_option('wbk_db_prefix', '') . 'wbk_cancelled_appointments'
    ) {
        if (WBK_User_Utils::check_access_to_service()) {
            $user = wp_get_current_user();
            $roles = (array) $user->roles;
            $input = array_unique(array_merge($input, $roles));
        }
    }
    if ($table_name == get_option('wbk_db_prefix', '') . 'wbk_services') {
        if (WBK_User_Utils::check_access_to_service(true)) {
            $user = wp_get_current_user();
            $roles = (array) $user->roles;
            $input = array_unique(array_merge($input, $roles));
        }
    }
    return $input;
}

add_filter('wbkdata_field_can_add', 'wbk_wbkdata_field_can_add', 10, 3);
function wbk_wbkdata_field_can_add($input, $field_name, $table_name)
{
    return $input;
}

add_filter('wbkdata_row_can_delete', 'wbk_wbkdata_row_can_delete', 10, 3);
function wbk_wbkdata_row_can_delete($input, $row, $table_name)
{
    if ($table_name == get_option('wbk_db_prefix', '') . 'wbk_appointments') {
        $user = wp_get_current_user();
        if (current_user_can('manage_options')) {
            return true;
        } else {
            if (is_null($row)) {
                if (WBK_User_Utils::check_access_to_service()) {
                    return true;
                }
            } else {
                $services = WBK_Model_Utils::get_service_ids(true);
                if (in_array($row->service_id, $services)) {
                    return true;
                } else {
                    return false;
                }
            }
        }
        return false;
    }
    return $input;
}



?>