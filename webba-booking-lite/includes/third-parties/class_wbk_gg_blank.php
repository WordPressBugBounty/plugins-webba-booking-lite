<?php
if ( ! defined( 'ABSPATH' ) ) exit;
// webba booking Google integration class
class WBK_Google{
	protected
	$client;

	protected
	$calendar_id;

	protected
	$ggid;

	public function init( $calendar_id ){
		return FALSE;
	}
	public function get_auth_url(){
		return '';
	}
	public function connect(){
		return array( 2, 'not connected, premium feature not available' );

	}
	public function render_calendar_block(){
		return '';
	}
	public function process_auth_code( $authCode ){
		return 0;
	}
	protected function get_access_token(){
		return '';
	}
 	protected function get_gg_calendar_id(){
		return 0;
	}
	protected function saveAccessToken( $access_token ){
	}
	public function get_calendar_name(){
		return '';
	}
	public function clearToken(){
	}
	public function insert_event( $title, $description, $start, $end, $time_zone, $calendar_id = '' ){
		return FALSE;
	}
	public function update_event( $event_id, $title, $description, $start, $end, $time_zone ){
 		return FALSE;
	}
	public function delete_event( $event_id ){
		return FALSE;
	}
	public function init_calendar_by_authcode( $code ){
		return FALSE;
	}
	public function getEventsTimeRanges( $start, $end ){
		return FALSE;
	}
}
?>
