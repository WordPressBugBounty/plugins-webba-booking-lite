<?php
// check if accessed directly
if (!defined('ABSPATH'))
    exit;
class WBK_User_Utils
{
    /**
     * get all wordpress users
     * @return array id-name pair
     */
    public static function get_wp_users()
    {
        global $wpdb;
        $result = get_users();
        $result_converted = array();
        foreach ($result as $item) {
            $result_converted[$item->ID] = $item->display_name;
        }
        return $result_converted;
    }

    /**
     * get users with the not admin role
     * @return array id-name pair
     */
    public static function get_none_admin_wp_users()
    {
        global $wpdb;
        $result = get_users(array('role__not_in' => array('administrator')));
        $result_converted = array();
        foreach ($result as $item) {
            $result_converted[$item->ID] = $item->display_name;
        }
        return $result_converted;
    }

    /**
     * check if current user has access google calendar
     * @param int $calendar_id calendar id
     * @return bool true if has access
     */
    public static function check_access_to_gg_calendar($calendar_id)
    {
        global $current_user;
        global $wpdb;
        $user_id = get_current_user_id();
        if ($user_id == 0) {
            return false;
        }
        $user_count = $wpdb->get_var($wpdb->prepare('SELECT count(*) as cnt FROM ' . get_option('wbk_db_prefix', '') . 'wbk_gg_calendars where user_id = %d AND id = %d', $user_id, $calendar_id));
        if ($user_count > 0) {
            return true;
        }
        return false;
    }

    /**
     * check if current user has access to at least one sevice schedule
     * @return bool true if has access
     */
    public static function check_access_to_service($allow_service_update = false)
    {
        $user_id = get_current_user_id();
        if (current_user_can('manage_options')) {
            return true;
        }
        if ($user_id == 0) {
            return false;
        }
        global $wpdb;

        if ($allow_service_update) {
            $users = $wpdb->get_col('SELECT users FROM ' . get_option('wbk_db_prefix', '') . 'wbk_services WHERE users_allow_edit="yes"');
        } else {
            $users = $wpdb->get_col('SELECT users FROM ' . get_option('wbk_db_prefix', '') . 'wbk_services');
        }

        foreach ($users as $user) {
            if (is_null($user)) {
                continue;
            }
            $user_arr = json_decode($user);
            if ($user_arr == '') {
                continue;
            }
            if (is_numeric($user_arr)) {
                $user_arr = array($user_arr);
            }
            if (in_array($user_id, $user_arr)) {
                return true;
            }
        }
        return false;
    }

    /**
     * check if current user has access to particular service
     * @return bool true if has access
     */
    public static function check_access_to_particular_service($service_id, $allow_service_update = false)
    {
        $user_id = get_current_user_id();
        if (current_user_can('manage_options')) {
            return true;
        }
        if ($user_id == 0) {
            return false;
        }
        if (!is_numeric($service_id)) {
            return false;
        }
        global $wpdb;

        if ($allow_service_update) {
            $users = $wpdb->get_col('SELECT users FROM ' . get_option('wbk_db_prefix', '') . 'wbk_services WHERE users_allow_edit="yes" and id=' . $service_id);
        } else {
            $users = $wpdb->get_col('SELECT users FROM ' . get_option('wbk_db_prefix', '') . 'wbk_services WHERE id=' . $service_id);
        }

        foreach ($users as $user) {
            if (is_null($user)) {
                continue;
            }
            $user_arr = json_decode($user);
            if ($user_arr == '') {
                continue;
            }
            if (is_numeric($user_arr)) {
                $user_arr = array($user_arr);
            }
            if (in_array($user_id, $user_arr)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if user is associated with service
     *
     * @param string|number|null $user_id
     * @param string|number|null $service_id
     * @return boolean
     */
    public static function is_user_associated_with_service($user_id, $service_id): bool
    {
        if (!is_numeric($service_id)) {
            return false;
        }

        if (user_can($user_id, 'manage_options')) {
            return true;
        }

        global $wpdb;
        $users = $wpdb->get_col('SELECT users FROM ' . get_option('wbk_db_prefix', '') . 'wbk_services WHERE id=' . $service_id);
        
        foreach ($users as $user) {
            if (is_null($user)) {
                continue;
            }

            $user_arr = json_decode($user);
            if ($user_arr == '') {
                continue;
            }

            if (is_numeric($user_arr)) {
                $user_arr = array($user_arr);
            }

            if (in_array($user_id, $user_arr)) {
                return true;
            }
        }

        return false;
    }
}
?>