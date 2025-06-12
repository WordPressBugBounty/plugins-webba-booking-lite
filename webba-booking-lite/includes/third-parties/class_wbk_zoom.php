<?php

if ( !defined( 'ABSPATH' ) ) {
    exit;
}
class WBK_Zoom {
    protected $redirect_url;

    public function __construct() {
        $this->redirect_url = get_site_url() . '/?wbk_zoom_auth=true';
    }

    public function generate_access_token( $code ) {
    }

    public function add_meeting( $booking_id, $duration = null ) {
    }

    public function refresh_token( $token_data ) {
    }

    public function update_meeting( $booking_id ) {
    }

    public function delete_meeting( $booking_id ) {
    }

}
