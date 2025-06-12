<?php

defined( 'ABSPATH' ) or exit;
/**
 * Class Wbk_Booking_User
 * Handles booking customer user functionality
 * 
 * @package WBK
 */
class Wbk_Booking_User {
    public function __construct() {
        add_action( 'wbk_booking_added', [$this, 'create_booking_user'] );
        add_action( 'init', [$this, 'create_booking_user_role'] );
    }

    /**
     * Create booking customer role
     *
     * @return void
     */
    public function create_booking_user_role() : void {
        return;
        if ( !wbk_fs()->can_use_premium_code() ) {
            return;
        }
        if ( !get_option( 'wbk_create_user_on_booking' ) ) {
            return;
        }
        $roles = wp_roles()->roles;
        if ( isset( $roles['roles']['booking_customer'] ) ) {
            return;
        }
        add_role( 'booking_customer', 'Booking Customer', [
            'read' => true,
        ] );
    }

    /**
     * Create user for booking customer
     *
     * @param array $booking_data
     * @return void
     */
    public function create_booking_user( $booking_data ) : void {
        return;
        if ( !wbk_fs()->can_use_premium_code() ) {
            return;
        }
        if ( !get_option( 'wbk_create_user_on_booking' ) ) {
            return;
        }
        $user = get_user_by( 'email', $booking_data['email'] );
        if ( $user ) {
            return;
        }
        remove_action( 'register_new_user', 'wp_send_new_user_notifications' );
        $userdata = [
            'user_login' => $this->generate_unique_username_from_full_name( $booking_data['name'] ),
            'user_email' => $booking_data['email'],
            'user_pass'  => wp_generate_password(),
            'role'       => 'booking_customer',
        ];
        $user_id = wp_insert_user( $userdata );
        if ( is_wp_error( $user_id ) ) {
            return;
        }
        set_query_var( 'wbk_user_data', $userdata );
        WBK_Email_Processor::send( [$booking_data['id']], 'user_registered' );
    }

    /**
     * Generate unique user name for customer
     *
     * @param string $full_name
     * @return string
     */
    public function generate_unique_username_from_full_name( string $full_name ) : string {
        return '';
        if ( !wbk_fs()->can_use_premium_code() ) {
            return '';
        }
        $username = sanitize_user( strtolower( str_replace( ' ', '.', $full_name ) ), __return_true() );
        $username = substr( $username, 0, 60 );
        $original_username = $username;
        $counter = 1;
        while ( username_exists( $username ) ) {
            $username = $original_username . $counter;
            $counter++;
        }
        return $username;
    }

}
