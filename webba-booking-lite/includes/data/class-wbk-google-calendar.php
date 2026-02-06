<?php
if (!defined('ABSPATH')) {
    exit();
}
class WBK_Google_Calendar extends WBK_Model_Object
{
    public function __construct($id)
    {
        $this->table_name =
            get_option('wbk_db_prefix', '') . 'wbk_gg_calendars';
        parent::__construct($id);
    }
    public function get_access_token()
    {
        return json_decode($this->get('access_token'), true);
    }
    public function set_access_token($access_token)
    {
        $this->set('access_token', json_encode($access_token));
    }
    public function clear_access_token()
    {
        $this->set('access_token', '');
    }
    public function get_easy_authorization_status()
    {
        return $this->get('easy_auth');
    }
    public function set_easy_authorization_status($easy_authorization_status)
    {
        $this->set('easy_auth', $easy_authorization_status);
    }
}
