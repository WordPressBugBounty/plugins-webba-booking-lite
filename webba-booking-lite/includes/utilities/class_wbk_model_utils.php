<?php

// check if accessed directly
if ( !defined( 'ABSPATH' ) ) {
    exit;
}
class WBK_Model_Utils {
    /**
     * get ids of all services
     * @return array ids of services
     */
    public static function get_service_ids( $restricted = false, $restricted_update = false ) {
        global $wpdb;
        $query = $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( get_option( 'wbk_db_prefix', '' ) . 'wbk_services' ) );
        if ( !$wpdb->get_var( $query ) == get_option( 'wbk_db_prefix', '' ) . 'wbk_services' ) {
            return [];
        }
        $sql = 'SELECT id,users,users_allow_edit FROM ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_services ';
        $sql = apply_filters( 'wbk_get_service_ids', $sql );
        $order_type = get_option( 'wbk_order_service_by', 'a-z' );
        if ( $order_type == 'a-z' ) {
            $sql .= ' order by name asc ';
        }
        if ( $order_type == 'priority' ) {
            $sql .= ' order by priority desc';
        }
        if ( $order_type == 'priority_a' ) {
            $sql .= ' order by priority asc';
        }
        $rows = $wpdb->get_results( $sql, ARRAY_A );
        $result = [];
        foreach ( $rows as $item ) {
            if ( $restricted ) {
                $user = wp_get_current_user();
                if ( in_array( 'administrator', $user->roles, true ) || is_multisite() && !is_super_admin() ) {
                    $result[] = $item['id'];
                } else {
                    $users = json_decode( $item['users'] );
                    if ( is_array( $users ) ) {
                        if ( in_array( get_current_user_id(), $users ) ) {
                            if ( $restricted_update ) {
                                if ( isset( $item['users_allow_edit'] ) && $item['users_allow_edit'] == 'yes' ) {
                                    $result[] = $item['id'];
                                }
                            } else {
                                $result[] = $item['id'];
                            }
                        }
                    }
                }
            } else {
                $result[] = $item['id'];
            }
        }
        return $result;
    }

    /**
     * get pairs of service id - names
     * @return array array of id-name pair
     */
    public static function get_services( $restricted = false ) {
        global $wpdb;
        $query = $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( get_option( 'wbk_db_prefix', '' ) . 'wbk_services' ) );
        if ( !$wpdb->get_var( $query ) == get_option( 'wbk_db_prefix', '' ) . 'wbk_services' ) {
            return [];
        }
        $sql = 'SELECT id,name,users FROM ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_services ';
        $sql = apply_filters( 'wbk_get_services', $sql );
        $order_type = get_option( 'wbk_order_service_by', 'a-z' );
        if ( $order_type == 'a-z' ) {
            $sql .= ' order by name asc ';
        }
        if ( $order_type == 'priority' ) {
            $sql .= ' order by priority desc';
        }
        if ( $order_type == 'priority_a' ) {
            $sql .= ' order by priority asc';
        }
        $rows = $wpdb->get_results( $sql, ARRAY_A );
        $result = [];
        foreach ( $rows as $item ) {
            if ( $restricted ) {
                $user = wp_get_current_user();
                if ( in_array( 'administrator', $user->roles, true ) || is_multisite() && !is_super_admin() ) {
                    $result[$item['id']] = $item['name'];
                } else {
                    if ( isset( $item['users'] ) ) {
                        $users = json_decode( $item['users'] );
                    } else {
                        $users = [];
                    }
                    if ( is_array( $users ) ) {
                        if ( in_array( get_current_user_id(), $users ) ) {
                            $result[$item['id']] = $item['name'];
                        }
                    }
                }
            } else {
                $result[$item['id']] = $item['name'];
            }
        }
        return $result;
    }

    public static function get_email_templates( $only_active = false, $trigger = null, $service = null ) {
        global $wpdb;
        $query = $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( get_option( 'wbk_db_prefix', '' ) . 'wbk_email_templates' ) );
        if ( !$wpdb->get_var( $query ) == get_option( 'wbk_db_prefix', '' ) . 'wbk_email_templates' ) {
            return [];
        }
        $condition = '';
        if ( $only_active ) {
            $condition = " WHERE enabled='yes' ";
        }
        if ( $trigger != null ) {
            if ( $condition == '' ) {
                $condition = $wpdb->prepare( ' WHERE type=%s', [$trigger] );
            } else {
                $condition .= $wpdb->prepare( ' AND type=%s', [$trigger] );
            }
        }
        $sql = 'SELECT * FROM ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_email_templates' . $condition;
        $rows = $wpdb->get_results( $sql, ARRAY_A );
        $result_converted = [];
        foreach ( $rows as $item ) {
            if ( isset( $item['use_for_all_services'] ) && $item['use_for_all_services'] == 'yes' ) {
                $result_converted[$item['id']] = $item['name'];
            } else {
                $services = json_decode( ( isset( $item['services'] ) ? $item['services'] : '[]' ) );
                if ( is_array( $services ) && in_array( $service, $services ) ) {
                    $result_converted[$item['id']] = $item['name'];
                }
            }
        }
        return $result_converted;
    }

    /**
     * get pairs of google calendars id - name
     * @return array  of id-name pair
     */
    public static function get_google_calendars() {
        global $wpdb;
        $query = $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( get_option( 'wbk_db_prefix', '' ) . 'wbk_gg_calendars' ) );
        if ( !$wpdb->get_var( $query ) == get_option( 'wbk_db_prefix', '' ) . 'wbk_gg_calendars' ) {
            return [];
        }
        $sql = 'SELECT id,name FROM  ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_gg_calendars ';
        $result = $wpdb->get_results( $sql, ARRAY_A );
        $result_converted = [];
        foreach ( $result as $item ) {
            $result_converted[$item['id']] = $item['name'];
        }
        return $result_converted;
    }

    /**
     * list of available modes of google calendars
     * @return array key -title pair array
     */
    public static function get_gg_calendar_modes() {
        $result = [
            'One-way'        => __( 'One-way (export)', 'webba-booking-lite' ),
            'One-way-import' => __( 'One-way (import)', 'webba-booking-lite' ),
            'Two-ways'       => __( 'Two-ways', 'webba-booking-lite' ),
        ];
        return $result;
    }

    /**
     * extract custom fields value from extr-data json_decode
     * @param  string $data extra-data
     * @param  int $id custom fiekd id
     * @return string value of the custom field or null if not set
     */
    public static function extract_custom_field_value( $data, $id ) {
        if ( $data == '' ) {
            return null;
        }
        $data = json_decode( $data );
        if ( $data === null ) {
            return null;
        }
        foreach ( $data as $item ) {
            if ( !is_array( $item ) ) {
                continue;
            }
            if ( count( $item ) != 3 ) {
                continue;
            }
            if ( trim( $item[0] ) == trim( $id ) ) {
                return $item[2];
            }
        }
        return null;
    }

    /**
     * get array of available columns on the
     * Appoointments page
     * @param boolean $keys_only return only keys
     * @return array
     */
    public static function get_appointment_columns( $keys_only = false ) {
        if ( $keys_only ) {
            return [
                'service_id',
                'day',
                'time',
                'quantity',
                'name',
                'email',
                'description',
                'extra',
                'status',
                'payment_method',
                'moment_price',
                'coupon'
            ];
        }
        return [
            'service_id'     => __( 'Service', 'webba-booking-lite' ),
            'created_on'     => __( 'Created on', 'webba-booking-lite' ),
            'day'            => __( 'Date', 'webba-booking-lite' ),
            'time'           => __( 'Time', 'webba-booking-lite' ),
            'quantity'       => __( 'Places booked', 'webba-booking-lite' ),
            'name'           => __( 'Customer name', 'webba-booking-lite' ),
            'email'          => __( 'Customer email', 'webba-booking-lite' ),
            'phone'          => __( 'Phone', 'webba-booking-lite' ),
            'description'    => __( 'Customer comment', 'webba-booking-lite' ),
            'extra'          => __( 'Custom fields', 'webba-booking-lite' ),
            'status'         => __( 'Status', 'webba-booking-lite' ),
            'payment_method' => __( 'Payment method', 'webba-booking-lite' ),
            'moment_price'   => __( 'Price', 'webba-booking-lite' ),
            'coupon'         => __( 'Coupon', 'webba-booking-lite' ),
            'ip'             => __( 'User IP', 'webba-booking-lite' ),
        ];
    }

    /**
     * get available appointment statuses
     * @return array array
     */
    static function get_booking_status_list() {
        $result = [
            'pending'   => __( 'Pending', 'webba-booking-lite' ),
            'approved'  => __( 'Approved', 'webba-booking-lite' ),
            'rejected'  => __( 'Rejected', 'webba-booking-lite' ),
            'cancelled' => __( 'Cancelled', 'webba-booking-lite' ),
            'arrived'   => __( 'Arrived', 'webba-booking-lite' ),
            'noshow'    => __( 'No-Show', 'webba-booking-lite' ),
        ];
        return $result;
    }

    /**
     * get services in category
     * @param  int $category_id id of the category
     * @return array ids of the services
     */
    static function get_services_in_category( $category_id, $pair = false ) {
        global $wpdb;
        $list = $wpdb->get_var( $wpdb->prepare( 'SELECT list FROM ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_service_categories WHERE id = %d', $category_id ) );
        if ( $list == '' ) {
            return false;
        }
        if ( !$pair ) {
            $service_ids_temp = json_decode( $list );
            $service_ids = [];
            foreach ( $service_ids_temp as $id ) {
                $service = new WBK_Service($id);
                if ( !$service->is_loaded() ) {
                    continue;
                }
                $service_ids[] = $id;
            }
            $order_type = get_option( 'wbk_order_service_by', 'a-z' );
            if ( $order_type == 'priority_a' || $order_type == 'priority' ) {
                if ( $order_type == 'priority_a' ) {
                    usort( $service_ids, function ( $k1, $k2 ) {
                        $service1 = new WBK_Service($k1);
                        $service2 = new WBK_Service($k2);
                        $priority1 = $service1->get( 'priority' );
                        $priority2 = $service2->get( 'priority' );
                        if ( $priority1 === $priority2 ) {
                            return 0;
                        }
                        return ( $priority1 < $priority2 ? -1 : 1 );
                    } );
                } else {
                    usort( $service_ids, function ( $k1, $k2 ) {
                        $service1 = new WBK_Service($k1);
                        $service2 = new WBK_Service($k2);
                        $priority1 = $service1->get( 'priority' );
                        $priority2 = $service2->get( 'priority' );
                        if ( $priority1 === $priority2 ) {
                            return 0;
                        }
                        return ( $priority1 > $priority2 ? -1 : 1 );
                    } );
                }
            }
            return $service_ids;
        } else {
            $ids = json_decode( $list );
            $result = [];
            $priorities = [];
            foreach ( $ids as $id ) {
                $service = new WBK_Service($id);
                if ( !$service->is_loaded() ) {
                    continue;
                }
                $result[$id] = $service->get_name();
            }
            return $result;
        }
    }

    /**
     * get services with the same category
     * as given service
     * @param  int $service_id service id
     * @return array ids of services
     */
    public static function get_services_with_same_category( $service_id ) {
        global $wpdb;
        $result = [];
        $categories = self::get_service_categories();
        foreach ( $categories as $key => $value ) {
            $services = self::get_services_in_category( $key );
            if ( is_array( $services ) && in_array( $service_id, $services ) ) {
                foreach ( $services as $current_service ) {
                    if ( $current_service != $service_id ) {
                        $result[] = $current_service;
                    }
                }
            }
        }
        $result = array_unique( $result );
        return $result;
    }

    /**
     * get list of service categories
     * @return array ids of categories
     */
    public static function get_service_categories() {
        global $wpdb;
        $query = $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( get_option( 'wbk_db_prefix', '' ) . 'wbk_service_categories' ) );
        if ( !$wpdb->get_var( $query ) == get_option( 'wbk_db_prefix', '' ) . 'wbk_service_categories' ) {
            return [];
        }
        $sql = 'SELECT id FROM ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_service_categories';
        $sql = apply_filters( 'wbk_get_categories', $sql );
        $categories = $wpdb->get_col( $sql );
        $result = [];
        foreach ( $categories as $category_id ) {
            $name = $wpdb->get_var( $wpdb->prepare( ' SELECT name FROM ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_service_categories WHERE id = %d', $category_id ) );
            $result[$category_id] = $name;
        }
        return $result;
    }

    /**
     * get IDds of service catgegories
     * @return array array of the service categories
     */
    public static function get_service_category_ids() {
        global $wpdb;
        $query = $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( get_option( 'wbk_db_prefix', '' ) . 'wbk_service_categories' ) );
        if ( !$wpdb->get_var( $query ) == get_option( 'wbk_db_prefix', '' ) . 'wbk_service_categories' ) {
            return [];
        }
        $sql = 'SELECT id FROM ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_service_categories ';
        $rows = $wpdb->get_results( $sql, ARRAY_A );
        $result = [];
        foreach ( $rows as $item ) {
            $result[] = $item['id'];
        }
        return $result;
    }

    /**
     * get booking ids by day and array of services
     * @param  int $day timestamp of the day
     * @param  array $service_ids array of service ids
     * @return array id of the bookings
     */
    public static function get_booking_ids_by_day_service( $day, $service_id ) {
        global $wpdb;
        $result = $wpdb->get_col( $wpdb->prepare( 'SELECT id FROM ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments where day=%d and service_id=%d and ' . self::get_not_canclled_sql(), $day, $service_id ) );
        return $result;
    }

    public static function get_booking_ids_by_day( $day ) {
        global $wpdb;
        $result = $wpdb->get_col( $wpdb->prepare( 'SELECT id FROM ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments where day=%d and ' . self::get_not_canclled_sql(), $day ) );
        return $result;
    }

    public static function get_booking_ids_by_day_service_email( $day, $service_id, $email ) {
        global $wpdb;
        $result = $wpdb->get_col( $wpdb->prepare(
            'SELECT id FROM ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments where day=%d and service_id=%d and email=%s and ' . self::get_not_canclled_sql() . ' order by time ASC',
            $day,
            $service_id,
            $email
        ) );
        return $result;
    }

    public static function get_booking_ids_by_time_service_email( $time, $service_id, $email ) {
        global $wpdb;
        $result = $wpdb->get_col( $wpdb->prepare(
            'SELECT id FROM ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments where time=%d and service_id=%d and email=%s and ' . self::get_not_canclled_sql() . ' order by time ASC',
            $time,
            $service_id,
            $email
        ) );
        return $result;
    }

    public static function get_booking_ids_by_service_email( $service_id, $email ) {
        global $wpdb;
        $result = $wpdb->get_col( $wpdb->prepare( 'SELECT id FROM ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments where service_id=%d and email=%s ' . self::get_not_canclled_sql() . '  order by time ASC', $service_id, $email ) );
        return $result;
    }

    public static function get_all_quantity_intersecting_range( $start, $end ) {
        $service_ids = self::get_service_ids();
        $day = strtotime( date( 'Y-m-d', $start ) . ' 00:00:00' );
        $total_quantity = 0;
        foreach ( $service_ids as $service_id ) {
            $booking_ids = self::get_booking_ids_by_day_service( $day, $service_id );
            foreach ( $booking_ids as $booking_id ) {
                $booking = new WBK_Booking($booking_id);
                if ( WBK_Time_Math_Utils::check_range_intersect(
                    $start,
                    $end,
                    $booking->get_start(),
                    $booking->get_end()
                ) ) {
                    $total_quantity += $booking->get_quantity();
                }
            }
        }
        return $total_quantity;
    }

    public static function get_booking_ids_by_range_service( $start, $end, $service_id ) {
        global $wpdb;
        $result = $wpdb->get_col( $wpdb->prepare(
            'SELECT id FROM ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments where time >= %d AND time < %d AND service_id=%d and ' . self::get_not_canclled_sql(),
            $start,
            $end,
            $service_id
        ) );
        return $result;
    }

    /**
     * Get the IDs of bookings created at a specific date range
     * @param int $start An unix timestamp integer indica5tng the earliest second (inclusive)
     * @param int $end   An unix timestamp integer indica5tng the latest second (not inclusive)
     * 
     * @return array The booking IDs reletaed to the specific bookings, sorted by creation time from
     *               from earliest to latest. empty if no matching results.
     */
    public static function get_booking_by_date_range( $start, $end ) {
        global $wpdb;
        $result = $wpdb->get_col( $wpdb->prepare( 'SELECT id FROM ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments where created_on >= %d AND created_on < %d ORDER BY created_on AND ' . self::get_not_canclled_sql(), $start, $end ) );
        return $result;
    }

    public static function get_booking_ids_by_email( $email ) {
        global $wpdb;
        $result = $wpdb->get_col( $wpdb->prepare( 'SELECT id FROM ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments where email = %s AND ' . self::get_not_canclled_sql() . ' order by time desc', $email ) );
        return $result;
    }

    public static function get_booking_ids_for_today_by_service( $service_id ) {
        global $wpdb;
        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        $today = strtotime( 'today midnight' );
        $result = $wpdb->get_col( $wpdb->prepare( ' SELECT id FROM ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments WHERE service_id=%d AND day=%d AND ' . self::get_not_canclled_sql() . ' ORDER BY time ', $service_id, $today ) );
        date_default_timezone_set( 'UTC' );
        return $result;
    }

    public static function get_booking_ids_for_today_not_arrived() {
        global $wpdb;
        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        $today = strtotime( 'today midnight' );
        $result = $wpdb->get_col( $wpdb->prepare( ' SELECT id FROM ' . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments WHERE status <> 'arrived' AND day=%d AND " . self::get_not_canclled_sql() . "  ORDER BY time ", $today ) );
        date_default_timezone_set( 'UTC' );
        return $result;
    }

    public static function get_booking_ids_for_last_week_not_arrived() {
        global $wpdb;
        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        $time_in_past = time() - 86400 * 7;
        $result = $wpdb->get_col( $wpdb->prepare( ' SELECT id FROM ' . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments WHERE status <> 'arrived' AND time > %d AND " . self::get_not_canclled_sql() . " ORDER BY time ", $time_in_past ) );
        date_default_timezone_set( 'UTC' );
        return $result;
    }

    public static function auto_set_arrived_satus() {
        if ( !is_numeric( get_option( 'wbk_set_arrived_after', '' ) ) ) {
            return;
        }
        $ids = self::get_booking_ids_for_last_week_not_arrived();
        foreach ( $ids as $id ) {
            $booking = new WBK_Booking($id);
            if ( !$booking->is_loaded() ) {
                continue;
            }
            $update_interval = get_option( 'wbk_set_arrived_after', '' ) * 60;
            if ( time() > $booking->get_end() + $update_interval ) {
                self::set_booking_status( $booking->get_id(), 'arrived' );
                $ids = self::get_booking_ids_by_day_service_email( $booking->get_day(), $booking->get_service(), $booking->get( 'email' ) );
                if ( count( $ids ) > 0 && $booking->get_id() == end( $ids ) ) {
                    WBK_Email_Processor::arrival_email_send_or_schedule( $booking->get_id() );
                }
            }
        }
    }

    public static function get_coupons() {
        global $wpdb;
        $query = $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( get_option( 'wbk_db_prefix', '' ) . 'wbk_coupons' ) );
        if ( !$wpdb->get_var( $query ) == get_option( 'wbk_db_prefix', '' ) . 'wbk_coupons' ) {
            return [];
        }
        $sql = 'SELECT id,name FROM  ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_coupons ';
        $result = $wpdb->get_results( $sql, ARRAY_A );
        $result_converted = [];
        foreach ( $result as $item ) {
            $result_converted[$item['id']] = $item['name'];
        }
        return $result_converted;
    }

    public static function get_pricing_rules() {
        global $wpdb;
        $query = $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( get_option( 'wbk_db_prefix', '' ) . 'wbk_pricing_rules' ) );
        if ( !$wpdb->get_var( $query ) == get_option( 'wbk_db_prefix', '' ) . 'wbk_pricing_rules' ) {
            return;
        }
        $sql = 'SELECT id,name FROM ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_pricing_rules';
        $result = $wpdb->get_results( $sql, ARRAY_A );
        $result_converted = [];
        foreach ( $result as $item ) {
            $result_converted[$item['id']] = $item['name'];
        }
        return $result_converted;
    }

    public static function set_amount_for_booking( $booking_id, $amount, $details = '' ) {
        global $wpdb;
        $result = $wpdb->update(
            get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments',
            [
                'moment_price'   => $amount,
                'amount_details' => $details,
            ],
            [
                'id' => $booking_id,
            ],
            ['%s', '%s'],
            ['%d']
        );
    }

    public static function set_booking_canceled_by( $booking_id, $value ) {
        global $wpdb;
        $wpdb->update(
            get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments',
            [
                'canceled_by' => $value,
            ],
            [
                'id' => $booking_id,
            ],
            ['%s'],
            ['%d']
        );
    }

    public static function set_booking_status( $booking_id, $status ) {
        global $wpdb;
        $booking = new WBK_Booking($booking_id);
        $prev_status = $booking->get( 'status' );
        $wpdb->update(
            get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments',
            [
                'status' => $status,
            ],
            [
                'id' => $booking_id,
            ],
            ['%s'],
            ['%d']
        );
        $wpdb->update(
            get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments',
            [
                'prev_status' => $prev_status,
            ],
            [
                'id' => $booking_id,
            ],
            ['%s'],
            ['%d']
        );
    }

    public static function set_booking_end( $booking_id ) {
        global $wpdb;
        $booking = new WBK_Booking($booking_id);
        if ( $booking->get_name() == '' ) {
            return;
        }
        $result = $wpdb->update(
            get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments',
            [
                'end' => $booking->get_end(),
            ],
            [
                'id' => $booking_id,
            ],
            ['%d'],
            ['%d']
        );
    }

    static function get_booking_ids_by_service_and_time( $service_id, $time ) {
        global $wpdb;
        $booking_ids = $wpdb->get_col( $wpdb->prepare( "\r\n\t\t\tSELECT      id\r\n\t\t\tFROM        " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments\r\n \t\t\tWHERE       service_id = %d\r\n\t\t\tAND \t\ttime  = %d AND " . self::get_not_canclled_sql() . "            \r\n\t\t\t", $service_id, $time ) );
        return $booking_ids;
    }

    static function get_bookings_page_columns( $keys_only = false ) {
        if ( $keys_only ) {
            return [
                'service_id',
                'day',
                'time',
                'quantity',
                'name',
                'email',
                'description',
                'extra',
                'status',
                'payment_method',
                'moment_price',
                'coupon'
            ];
        }
        return [
            'service_id'     => __( 'Service', 'webba-booking-lite' ),
            'created_on'     => __( 'Created on', 'webba-booking-lite' ),
            'day'            => __( 'Date', 'webba-booking-lite' ),
            'time'           => __( 'Time', 'webba-booking-lite' ),
            'quantity'       => __( 'Places booked', 'webba-booking-lite' ),
            'name'           => __( 'Customer name', 'webba-booking-lite' ),
            'email'          => __( 'Customer email', 'webba-booking-lite' ),
            'phone'          => __( 'Phone', 'webba-booking-lite' ),
            'description'    => __( 'Customer comment', 'webba-booking-lite' ),
            'extra'          => __( 'Custom fields', 'webba-booking-lite' ),
            'status'         => __( 'Status', 'webba-booking-lite' ),
            'payment_method' => __( 'Payment method', 'webba-booking-lite' ),
            'moment_price'   => __( 'Price', 'webba-booking-lite' ),
            'coupon'         => __( 'Coupon', 'webba-booking-lite' ),
            'ip'             => __( 'User IP', 'webba-booking-lite' ),
        ];
    }

    static function get_custom_fields_list() {
        $ids = get_option( 'wbk_custom_fields_columns', '' );
        $result = [];
        if ( $ids != '' ) {
            $ids = explode( ',', $ids );
            $html = '';
            foreach ( $ids as $id ) {
                $col_title = '';
                preg_match( '/\\[[^\\]]*\\]/', $id, $matches );
                if ( is_array( $matches ) && count( $matches ) > 0 ) {
                    $col_title = rtrim( ltrim( $matches[0], '[' ), ']' );
                }
                $id = explode( '[', $id );
                $id = $id[0];
                if ( $col_title == '' ) {
                    $col_title = $id;
                }
                $result[$id] = stripslashes( $col_title );
            }
        }
        return $result;
    }

    static function get_service_availability_in_range( $service_id, $number_of_days, $mode = 'classic' ) {
        // analog of getServiceAbiliy
        $service = new WBK_Service($service_id);
        if ( !$service->is_loaded() ) {
            return [];
        }
        // init service schedulle
        $sp = new WBK_Schedule_Processor();
        $sp->load_data();
        $date_format = WBK_Format_Utils::get_date_format();
        $prepare_time = round( $service->get_prepare_time() / 1440 );
        $arr_disabled = [];
        $arr_enabled = [];
        $day_to_render = strtotime( 'today midnight' );
        $last_day = $day_to_render + 86400 * $number_of_days;
        $google_events = [];
        if ( !is_null( $service->get_availability_range() ) && is_array( $service->get_availability_range() ) && count( $service->get_availability_range() ) == 2 ) {
            $availability_range = $service->get_availability_range();
            $limit_start = strtotime( trim( $availability_range[0] ) );
            $limit_end = strtotime( trim( $availability_range[1] ) );
        }
        if ( $mode == 'dropdown' ) {
            $added_dates = 0;
            $added_dates_limit = $number_of_days;
            $number_of_days = 1000000;
        }
        for ($i = 1; $i <= $number_of_days; $i++) {
            if ( $mode == 'dropdown' && $added_dates >= $added_dates_limit ) {
                $number_of_days = 1000001;
                continue;
            }
            // check if current day is inside the limit
            if ( !is_null( $service->get_availability_range() ) && is_array( $service->get_availability_range() ) && count( $service->get_availability_range() ) == 2 ) {
                if ( $day_to_render < $limit_start || $day_to_render > $limit_end ) {
                    $day_to_render = strtotime( 'tomorrow', $day_to_render );
                    continue;
                }
            }
            $wbk_disallow_after = get_option( 'wbk_disallow_after', '0' );
            if ( trim( $wbk_disallow_after ) == '' ) {
                $wbk_disallow_after = '0';
            }
            if ( $wbk_disallow_after != '0' ) {
                $limit2 = time() + $wbk_disallow_after * 60 * 60;
                if ( $day_to_render > $limit2 ) {
                    $day_to_render = strtotime( 'tomorrow', $day_to_render );
                    continue;
                }
            }
            if ( $i <= $prepare_time ) {
                $day_to_render = strtotime( 'tomorrow', $day_to_render );
                continue;
            }
            $day_status = $sp->get_day_status( $day_to_render, $service_id );
            if ( $day_status == 0 || $day_status == 2 ) {
                if ( $mode == 'dropdown' && $day_status == 2 ) {
                    $added_dates++;
                    $arr_enabled[] = $day_to_render . '-HM-' . wp_date( $date_format, $day_to_render, new DateTimeZone(date_default_timezone_get()) ) . ' ' . get_option( 'wbk_daily_limit_reached_message', __( 'Daily booking limit is reached, please select another date', 'webba-booking-lite' ) ) . '-HM-wbk_dropdown_limit_reached';
                }
                $day_to_render = strtotime( 'tomorrow', $day_to_render );
                continue;
            } else {
                if ( get_option( 'wbk_disable_day_on_all_booked', 'disabled' ) == 'enabled' || get_option( 'wbk_disable_day_on_all_booked', 'disabled' ) == 'enabled_plus' ) {
                    if ( get_option( 'wbk_disable_day_on_all_booked', 'disabled' ) == 'enabled' ) {
                        $calculate_availability = false;
                    } elseif ( get_option( 'wbk_disable_day_on_all_booked', 'disabled' ) == 'enabled_plus' ) {
                        $calculate_availability = true;
                    }
                    $sp->get_time_slots_by_day(
                        $day_to_render,
                        $service_id,
                        [
                            'calculate_availability' => $calculate_availability,
                            'calculate_night_hours'  => false,
                            'skip_gg_calendar'       => true,
                            null,
                            null,
                        ],
                        null,
                        false
                    );
                    if ( !$sp->has_free_time_slots() ) {
                        if ( $mode == 'dropdown' ) {
                            $added_dates++;
                            $arr_enabled[] = $day_to_render . '-HM-' . wp_date( $date_format, $day_to_render, new DateTimeZone(date_default_timezone_get()) ) . ' ' . get_option( 'wbk_daily_limit_reached_message', __( 'Daily booking limit is reached, please select another date', 'webba-booking-lite' ) ) . '-HM-wbk_dropdown_limit_reached';
                        }
                        $day_to_render = strtotime( 'tomorrow', $day_to_render );
                        continue;
                    }
                }
            }
            $valid = apply_filters(
                'wbk_check_date_availability',
                true,
                $day_to_render,
                $service_id
            );
            if ( !$valid ) {
                $day_to_render = strtotime( 'tomorrow', $day_to_render );
                continue;
            }
            if ( $mode == 'dropdown' ) {
                $added_dates++;
                $arr_enabled[] = $day_to_render . '-HM-' . wp_date( $date_format, $day_to_render, new DateTimeZone(date_default_timezone_get()) ) . '-HM-wbk_dropdown_regular_item';
            } else {
                $arr_disabled[] = date( 'Y', $day_to_render ) . ',' . intval( date( 'n', $day_to_render ) - 1 ) . ',' . date( 'j', $day_to_render );
            }
            $day_to_render = strtotime( 'tomorrow', $day_to_render );
        }
        if ( $mode == 'dropdown' ) {
            return $arr_enabled;
        } else {
            return $arr_disabled;
        }
    }

    static function get_quantity_by_range_sevices( $start, $end, $services ) {
        global $wpdb;
        $quantity = $wpdb->get_var( $wpdb->prepare( 'SELECT SUM(quantity) FROM ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments' . ' WHERE ' . self::get_not_canclled_sql() . ' AND ' . 'service_id IN (' . implode( ',', $services ) . ') AND ' . '( ( time = %d ) OR ' . '( time > %d AND time < %d ) OR ' . '( time > %d AND time <= %d ) OR ' . '( time >= %d AND time <= %d ) ) ', [
            $start,
            $start,
            $end,
            $start,
            $end,
            $start,
            $end
        ] ) );
        return $quantity;
    }

    static function get_service_limits( $service_id ) {
        $service = new WBK_Service($service_id);
        $result = '';
        $range = $service->get_availability_range();
        if ( !is_array( $range ) ) {
            $limit_value = '';
        } else {
            if ( count( $range ) == 1 ) {
                $limit_value = '';
            } else {
                if ( $range[0] == $range[1] ) {
                    $limit_value = date( 'Y,n,j', strtotime( trim( $range[0] ) ) ) . '-' . date( 'Y,n,j', strtotime( trim( $range[1] ) ) );
                } else {
                    $limit_value = date( 'Y,n,j', strtotime( trim( $range[0] ) ) ) . '-' . date( 'Y,n,j', strtotime( trim( $range[1] ) ) );
                }
            }
        }
        $result .= $limit_value;
        return $result;
    }

    public static function get_service_weekly_availability( $service_id ) {
        $sp = new WBK_Schedule_Processor();
        $sp->load_unlocked_days();
        $result = [];
        for ($i = 1; $i <= 7; $i++) {
            if ( !$sp->is_working_day( $i, $service_id ) && !$sp->is_unlockced_has_dow( $i, $service_id ) ) {
                if ( get_option( 'wbk_start_of_week', 'monday' ) == 'monday' ) {
                    $result[] = $i;
                } else {
                    $term = $i + 1;
                    if ( $term == 8 ) {
                        $term = 1;
                    }
                    $result[] = $term;
                }
            }
        }
        return $result;
    }

    static function get_category_names_by_service( $service_id ) {
        $categories = self::get_service_categories();
        $result = [];
        foreach ( $categories as $key => $value ) {
            $category = new WBK_Service_Category($key);
            $services = json_decode( $category->get( 'list' ) );
            if ( is_array( $services ) && in_array( $service_id, $services ) ) {
                $result[] = $value;
            }
        }
        if ( count( $result ) > 0 ) {
            return implode( ', ', $result );
        }
        return '';
    }

    /*
    static function copy_booking_to_cancelled($booking_id, $cancelled_by)
    {
        global $wpdb;
        if (isset($_SERVER['REMOTE_ADDR'])) {
            $cancelled_by .= ' (' . $_SERVER['REMOTE_ADDR'] . ')';
        }
        $booking_data = $wpdb->get_row(
            $wpdb->prepare(
                'SELECT * FROM ' .
                get_option('wbk_db_prefix', '') .
                'wbk_appointments  WHERE id = %d',
                $booking_id
            ),
            ARRAY_A
        );
        $wpdb->insert(
            get_option('wbk_db_prefix', '') . 'wbk_cancelled_appointments',
            [
                'id_cancelled' => $booking_id,
                'cancelled_by' => $cancelled_by,
                'name' => $booking_data['name'],
                'email' => $booking_data['email'],
                'phone' => $booking_data['phone'],
                'description' => $booking_data['description'],
                'extra' => $booking_data['extra'],
                'attachment' => $booking_data['attachment'],
                'service_id' => $booking_data['service_id'],
                'time' => $booking_data['time'],
                'day' => $booking_data['day'],
                'duration' => $booking_data['duration'],
                'created_on' => $booking_data['created_on'],
                'quantity' => $booking_data['quantity'],
                'status' => $booking_data['status'],
                'payment_id' => $booking_data['payment_id'],
                'token' => 'not_used', //$appointment_data['token'],
                'payment_cancel_token' => 'not_used', //$appointment_data['payment_cancel_token'],
                'admin_token' => 'not_used', //$appointment_data['admin_token'],
                'expiration_time' => '0', // $appointment_data['expiration_time'],
                'time_offset' => '0', // $appointment_data['time_offset'],
                'gg_event_id' => $booking_data['gg_event_id'],
                'coupon' => '0', //$appointment_data['coupon'],
                'payment_method' => $booking_data['payment_method'],
                'lang' => $booking_data['lang'],
                'moment_price' => $booking_data['moment_price'],
            ],
            [
                '%d',
                '%s',
                '%s',
                '%s',
                '%s',
                '%s',
                '%s',
                '%s',
                '%d',
                '%d',
                '%d',
                '%d',
                '%d',
                '%d',
                '%d',
                '%s',
                '%s',
                '%s',
                '%s',
                '%s',
                '%s',
                '%d',
                '%d',
                '%s',
                '%d',
                '%s',
                '%s',
                '%s',
                '%s',
            ]
        );
        do_action('wbk_table_after_add', [
            $wpdb->insert_id,
            get_option('wbk_db_prefix', '') . 'wbk_cancelled_appointments',
        ]);
    }
    */
    static function get_booking_ids_by_group_token( $token ) {
        global $wpdb;
        $arr_tokens = explode( '-', $token );
        $result = [];
        if ( count( $arr_tokens ) > 60 ) {
            return $result;
        }
        foreach ( $arr_tokens as $token ) {
            $booking_id = $wpdb->get_var( $wpdb->prepare( ' SELECT id FROM ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments WHERE token = %s AND ' . self::get_not_canclled_sql(), $token ) );
            if ( $booking_id == null ) {
                continue;
            } else {
                $result[] = $booking_id;
            }
        }
        return $result;
    }

    static function get_booking_ids_by_group_admin_token( $token ) {
        global $wpdb;
        $arr_tokens = explode( '-', $token );
        $result = [];
        if ( count( $arr_tokens ) > 60 ) {
            return $result;
        }
        foreach ( $arr_tokens as $token ) {
            $booking_id = $wpdb->get_var( $wpdb->prepare( ' SELECT id FROM ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments WHERE admin_token = %s AND ' . self::get_not_canclled_sql(), $token ) );
            if ( $booking_id == null ) {
                continue;
            } else {
                $result[] = $booking_id;
            }
        }
        return $result;
    }

    static function get_payment_methods_for_bookings_intersected( $booking_ids ) {
        $services_ids = [];
        foreach ( $booking_ids as $booking_id ) {
            $booking = new WBK_Booking($booking_id);
            if ( !$booking->is_loaded() ) {
                continue;
            }
            $services_ids[] = $booking->get_service();
        }
        $db_prefix = get_option( 'wbk_db_prefix', '' );
        $payment_methods_result = [];
        foreach ( $services_ids as $service_id ) {
            $service = new WBK_Service($service_id);
            $payment_methods_service = json_decode( $service->get( 'payment_methods' ) );
            if ( !is_null( $payment_methods_service ) && is_array( $payment_methods_service ) ) {
                if ( count( $payment_methods_result ) == 0 ) {
                    $payment_methods_result = $payment_methods_service;
                } else {
                    $payment_methods_result = array_intersect( $payment_methods_result, $payment_methods_service );
                }
            }
        }
        return $payment_methods_result;
    }

    static function get_payment_methods_for_bookings( $booking_ids ) {
        $services_ids = [];
        foreach ( $booking_ids as $booking_id ) {
            $booking = new WBK_Booking($booking_id);
            if ( !$booking->is_loaded() ) {
                continue;
            }
            $services_ids[] = $booking->get_service();
        }
        $db_prefix = get_option( 'wbk_db_prefix', '' );
        $payment_methods_all = WbkData()->tables->get_element_at( $db_prefix . 'wbk_services' )->fields->get_element_at( 'service_payment_methods' )->get_extra_data()['items'];
        $payment_methods_allowed = [];
        foreach ( $payment_methods_all as $payment_method => $payment_method_name ) {
            $allowed = true;
            foreach ( $services_ids as $service_id ) {
                $service = new WBK_Service($service_id);
                $payment_method_service = json_decode( $service->get( 'payment_methods' ) );
                if ( !is_null( $payment_method_service ) && is_array( $payment_method_service ) ) {
                    if ( in_array( $payment_method, $payment_method_service ) ) {
                        continue;
                    }
                }
                $allowed = false;
            }
            if ( $allowed ) {
                $payment_methods_allowed[] = $payment_method;
            }
        }
        return $payment_methods_allowed;
    }

    static function get_booking_ids_by_payment_id( $payment_id ) {
        global $wpdb;
        $ids = $wpdb->get_col( $wpdb->prepare( 'select id from ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments where payment_id = %s AND ' . self::get_not_canclled_sql(), $payment_id ) );
        return $ids;
    }

    public static function get_payment_fields() {
        return [
            'name'        => __( 'Cardholder name', 'webba-booking-lite' ),
            'city'        => __( 'City', 'webba-booking-lite' ),
            'country'     => __( 'Country', 'webba-booking-lite' ),
            'line1'       => __( 'Address line 1', 'webba-booking-lite' ),
            'line2'       => __( 'Address line 1', 'webba-booking-lite' ),
            'postal_code' => __( 'Postal code', 'webba-booking-lite' ),
            'state'       => __( 'State', 'webba-booking-lite' ),
        ];
    }

    public static function delete_booking( $booking_id ) {
        global $wpdb;
        $db_prefix = get_option( 'wbk_db_prefix', '' );
        $wpdb->delete( $db_prefix . 'wbk_appointments', [
            'id' => $booking_id,
        ], ['%d'] );
    }

    public static function get_bookings_by_customer_email( $email, $future = true ) {
        global $wpdb;
        if ( $future ) {
            $time_sql = " AND time >" . time();
        } else {
            $time_sql = " AND time <" . time();
        }
        $booking_ids = $wpdb->get_col( $wpdb->prepare( "SELECT id FROM " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments WHERE email = %s AND " . self::get_not_canclled_sql() . $time_sql, $email ) );
        return $booking_ids;
    }

    public static function get_bookings_by_service_and_time( $service_id, $time ) {
        global $wpdb;
        $booking_ids = $wpdb->get_col( $wpdb->prepare( "\r\n\t\t\tSELECT      id\r\n\t\t\tFROM        " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments\r\n \t\t\tWHERE       service_id = %d\r\n\t\t\tAND \t\ttime  = %d\r\n            AND " . self::get_not_canclled_sql() . "\r\n\t\t\t", $service_id, $time ) );
        return $booking_ids;
    }

    static function get_total_count_of_bookings_by_day( $day ) {
        global $wpdb;
        $count = $wpdb->get_var( $wpdb->prepare( ' SELECT COUNT(*) FROM ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments WHERE  day = %d AND ' . self::get_not_canclled_sql(), $day ) );
        return $count;
    }

    static function get_booking_payment_methods( $booking_id ) {
        $booking = new WBK_Booking($booking_id);
        if ( !$booking->is_loaded() ) {
            return false;
        }
        if ( $booking->get_status() == 'paid' || $booking->get_status() == 'woocommerce' || $booking->get_status() == 'paid_approved' ) {
            return false;
        }
        $service = new WBK_Service($booking->get_service());
        if ( !$service->is_loaded() ) {
            return false;
        }
        if ( $service->get_payment_methods() == '' ) {
            return false;
        }
        if ( $service->get_payment_methods() != '' ) {
            if ( get_option( 'wbk_appointments_allow_payments', '' ) == '' ) {
                return json_decode( $service->get_payment_methods() );
            } else {
                if ( $booking->get_status() == 'approved' ) {
                    return json_decode( $service->get_payment_methods() );
                } else {
                    return false;
                }
            }
        }
    }

    public static function get_booking_by_date_revenue( $start, $end, $type = '' ) {
        global $wpdb;
        $type_condition = '1 = 1';
        if ( $type ) {
            $types = explode( ',', $type );
            $type_conditions = [];
            foreach ( $types as $type ) {
                $type_conditions[] = "status='" . esc_sql( trim( $type ) ) . "'";
            }
            $type_condition = ' ( ' . implode( ' OR ', $type_conditions ) . ' ) ';
        }
        $sql = $wpdb->prepare( "SELECT GROUP_CONCAT(id SEPARATOR ',') as ids, {{date}} FROM " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments where time >= %d AND time < %d AND {$type_condition} AND " . self::get_not_canclled_sql() . "  GROUP BY created_date ", $start, $end );
        $result = $wpdb->get_results( str_replace( '{{date}}', "from_unixtime(time, '%Y-%m-%d') as created_date", $sql ) );
        if ( !empty( $result ) ) {
            $sorted = [];
            foreach ( $result as $res ) {
                $sorted[$res->created_date] = (int) $res->ids;
            }
            return $sorted;
        }
        return [];
    }

    public static function get_booking_by_date_range_type(
        $start,
        $end,
        $type = '',
        $return = 'fields'
    ) {
        global $wpdb;
        $type_condition = '1 = 1';
        if ( $type ) {
            $types = explode( ',', $type );
            $type_conditions = [];
            foreach ( $types as $type ) {
                $type_conditions[] = "status='" . esc_sql( trim( $type ) ) . "'";
            }
            $type_condition = ' ( ' . implode( ' OR ', $type_conditions ) . ' ) ';
        }
        if ( $return == 'fields' ) {
            $sql = $wpdb->prepare( 'SELECT COUNT(id) as count, {{date}} FROM ' . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments where time >= %d AND time < %d AND {$type_condition} AND " . self::get_not_canclled_sql() . " GROUP BY created_date ", $start, $end );
            $result = $wpdb->get_results( str_replace( '{{date}}', "from_unixtime(time, '%Y-%m-%d') as created_date", $sql ) );
            if ( !empty( $result ) ) {
                $sorted = [];
                foreach ( $result as $res ) {
                    $sorted[$res->created_date] = (int) $res->count;
                }
                return $sorted;
            }
        } else {
            $sql = $wpdb->prepare( 'SELECT id FROM ' . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments where time >= %d AND time < %d AND {$type_condition} AND " . self::get_not_canclled_sql(), $start, $end );
            return $wpdb->get_col( $sql );
        }
        return [];
    }

    public static function get_bookings_to_send_arrival_email() {
        global $wpdb;
        $booking_ids = $wpdb->get_col( $wpdb->prepare( "\r\n\t\t\tSELECT id\r\n\t\t\tFROM " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments WHERE arrival_email_time < %d", time() ) );
        return $booking_ids;
    }

    public static function get_appearance_data() {
        $appearance_data = get_option( 'wbk_apperance_data' );
        if ( isset( $appearance_data['wbk_appearance_field_1'] ) ) {
            $field_value_1 = esc_html( $appearance_data['wbk_appearance_field_1'] );
        } else {
            $field_value_1 = '#213f5b';
        }
        if ( isset( $appearance_data['wbk_appearance_field_2'] ) ) {
            $field_value_2 = esc_html( $appearance_data['wbk_appearance_field_2'] );
        } else {
            $field_value_2 = '#1f6763';
        }
        return [$field_value_1, $field_value_2];
    }

    public static function switch_locale_by_booking_id( $booking_id ) {
        $booking = new WBK_Booking($booking_id);
        if ( !$booking->is_loaded() ) {
            return;
        }
        if ( $booking->get( 'lang' ) != false && $booking->get( 'lang' ) != '' ) {
            $locale = str_replace( '-', '_', $booking->get( 'lang' ) );
            switch_to_locale( trim( $locale ) );
        }
    }

    public static function get_booking_data( $booking_id ) {
        $booking = new WBK_Booking($booking_id);
        if ( !$booking->is_loaded() ) {
            return false;
        }
        $service = new WBK_Service($booking->get_service());
        if ( !$service->is_loaded() ) {
            return false;
        }
        if ( $booking->get_price() > 0 ) {
            $price = WBK_Format_Utils::format_price( $booking->get_price() );
        }
        return [
            'id'            => $booking_id,
            'service_id'    => $service->get_id(),
            'service_name'  => $service->get_name(),
            'quantity'      => $booking->get_quantity(),
            'date'          => WBK_Format_Utils::format_booking_time( $booking, 'date' ),
            'time_formated' => WBK_Format_Utils::format_booking_time( $booking ),
            'time'          => $booking->get_start(),
            'price'         => $price,
        ];
    }

    static function get_total_count_of_bookings() {
        global $wpdb;
        $count_bookings = $wpdb->get_var( $wpdb->prepare( ' SELECT COUNT(*) FROM ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments WHERE ' . self::get_not_canclled_sql() ) );
        $count_bookings += $wpdb->get_var( $wpdb->prepare( ' SELECT COUNT(*) FROM ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_cancelled_appointments ' ) );
        return $count_bookings;
    }

    public static function get_cf7_forms() : array {
        $args = [
            'post_type'      => 'wpcf7_contact_form',
            'posts_per_page' => -1,
        ];
        $forms = [];
        if ( $cf7_forms = get_posts( $args ) ) {
            foreach ( $cf7_forms as $cf7_form ) {
                $form = new stdClass();
                $form->name = $cf7_form->post_title;
                $form->id = $cf7_form->ID;
                $forms[$cf7_form->ID] = $cf7_form->post_title;
            }
        }
        return $forms;
    }

    static function extract_bh_availability_from_v4( $json_string ) {
        $data = json_decode( $json_string, true );
        if ( isset( $data['dow_availability'] ) ) {
            return json_encode( $data['dow_availability'] );
        }
        return $json_string;
    }

    static function get_email_template_type_usage( $template_field ) {
        $service_ids = [];
        $email_template_ids = [];
        foreach ( self::get_service_ids() as $service_id ) {
            $service = new WBK_Service($service_id);
            if ( !$service->is_loaded() ) {
                continue;
            }
            if ( $service->get( $template_field ) != false && is_numeric( $service->get( $template_field ) ) && $service->get( $template_field ) != 0 ) {
                $service_ids[] = $service_id;
                $email_template_ids[] = $service->get( $template_field );
            }
        }
        return [
            'service_ids'        => array_unique( $service_ids ),
            'email_template_ids' => array_unique( $email_template_ids ),
        ];
    }

    public static function cleanup_attachements() {
        if ( get_option( 'wbk_delete_attachemnt', 'no' ) == 'no' || get_option( 'wbk_delete_attachemnt', 'no' ) == '' ) {
            return;
        }
        global $wpdb;
        $prefix = $wpdb->prefix;
        $query = $wpdb->prepare( 'SHOW TABLES LIKE %s', $prefix . $wpdb->esc_like( 'wbk_appointments' ) );
        if ( $wpdb->get_var( $query ) != $prefix . 'wbk_appointments' ) {
            return;
        }
        $result = $wpdb->get_results( 'Select * from ' . $prefix . "wbk_appointments where attachment  <> '' LIMIT 10 ", ARRAY_A );
        foreach ( $result as $item ) {
            $file = json_decode( $item['attachment'] );
            if ( is_array( $file ) ) {
                $file = $file[0];
                try {
                    if ( file_exists( $file ) ) {
                        unlink( $file );
                    }
                } catch ( \Exception $e ) {
                }
                $wpdb->update(
                    get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments',
                    [
                        'attachment' => '',
                    ],
                    [
                        'id' => $item['id'],
                    ],
                    ['%s'],
                    ['%d']
                );
            }
        }
    }

    static function get_lang_by_booking_id( $id ) {
        global $wpdb;
        $lang = $wpdb->get_var( $wpdb->prepare( 'select lang from ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments where id = %d', $id ) );
        return $lang;
    }

    static function switch_language_by_booking_id( $id ) {
        if ( !defined( 'ICL_LANGUAGE_CODE' ) ) {
            return;
        }
        $lang = self::get_lang_by_booking_id( $id );
        if ( $lang == '' || $lang === FALSE ) {
            return;
        }
        global $sitepress;
        if ( !is_null( $sitepress ) && method_exists( $sitepress, 'switch_lang' ) ) {
            $sitepress->switch_lang( $lang, true );
        }
    }

    static function get_future_bookings_for_service( $service_id, $days ) {
        global $wpdb;
        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        $tomorrow = strtotime( 'today + ' . $days . ' days' );
        $result = $wpdb->get_col( $wpdb->prepare( " SELECT id FROM " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments WHERE service_id=%d AND day=%d AND " . self::get_not_canclled_sql() . " ORDER BY time ", $service_id, $tomorrow ) );
        date_default_timezone_set( 'UTC' );
        return $result;
    }

    static function get_not_canclled_sql() {
        return "status NOT IN ('cancelled')";
    }

    static function get_service_id_by_booking_id( $booking_id ) {
        global $wpdb;
        $service_id = $wpdb->get_var( $wpdb->prepare( " SELECT service_id FROM " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments WHERE id = %d ", $booking_id ) );
        if ( $service_id == null ) {
            return false;
        } else {
            return $service_id;
        }
    }

    static function is_event_added_to_google( $booking_id ) {
        global $wpdb;
        $event_id_json = $wpdb->get_var( $wpdb->prepare( "SELECT gg_event_id FROM " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments WHERE id = %d", $booking_id ) );
        if ( $event_id_json == '' ) {
            return false;
        }
        return true;
    }

    public static function get_booking_status( $booking_id ) {
        global $wpdb;
        $sql = $wpdb->prepare( "SELECT status FROM " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments WHERE id = %d", $booking_id );
        $status = $wpdb->get_var( $sql );
        return $status;
    }

    static function delete_booking_data_at_gg_calendar( $booking_id, $by_time = true ) {
    }

    static function set_gg_event_data( $booking_id, $event_data ) {
        global $wpdb;
        $result = $wpdb->update(
            get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments',
            array(
                'gg_event_id' => $event_data,
            ),
            array(
                'id' => $booking_id,
            ),
            array('%s'),
            array('%d')
        );
        if ( $result == false || $result == 0 ) {
            return false;
        } else {
            return true;
        }
    }

    static function add_booking_data_to_gg_calendar( $booking_id ) {
    }

    static function update_booking_data_at_gg_calendar( $booking_id ) {
        global $wpdb;
        $booking = new WBK_Booking($booking_id);
        if ( !$booking->is_loaded() ) {
            return false;
        }
        $service_id = $booking->get_service();
        $service = new WBK_Service($service_id);
        if ( !$service->is_loaded() ) {
            return false;
        }
        $event_id_json = $wpdb->get_var( $wpdb->prepare( "SELECT gg_event_id FROM " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments WHERE id = %d", $booking_id ) );
        if ( $event_id_json == '' ) {
            return;
        }
        if ( $service->get_quantity() > 1 && get_option( 'wbk_gg_group_service_export', 'event_foreach_appointment' ) == 'one_event' ) {
            return;
        }
        $event_id_arr = json_decode( $event_id_json );
        $title = get_option( 'wbk_gg_calendar_event_title', '#customer_name' );
        $title = apply_filters( 'wbk_gg_calendar_event_title', $title, $service_id );
        $description = get_option( 'wbk_gg_calendar_event_description', '#customer_name #customer_phone' );
        $description = apply_filters( 'wbk_gg_calendar_event_description', $description, $service_id );
        $description = str_replace( '{n}', "\n", $description );
        $title = WBK_Placeholder_Processor::process( $title, [$booking_id] );
        $description = WBK_Placeholder_Processor::process( $description, [$booking_id] );
        $time_zone = get_option( 'wbk_timezone', 'UTC' );
        $start = date( 'Y-m-d', $booking->get_start() ) . 'T' . date( 'H:i:00', $booking->get_start() );
        $end = date( 'Y-m-d', $booking->get_start() + $service->get_duration() * 60 + $service->get_interval_between() * 60 ) . 'T' . date( 'H:i:00', $booking->get_start() + $service->get_duration() * 60 + $service->get_interval_between() * 60 );
        foreach ( $event_id_arr as $event ) {
            $google = new WBK_Google();
            $google->init( $event[0] );
            $connect_status = $google->connect();
            if ( $connect_status[0] == 1 ) {
                $google->update_event(
                    $event[1],
                    $title,
                    $description,
                    $start,
                    $end,
                    $time_zone
                );
            } else {
                $noifications = new WBK_Email_Notifications($service_id, null);
                $noifications->send_gg_calendar_issue_alert_to_admin();
            }
        }
    }

    static function get_gg_calendars_by_user( $user_id ) {
        global $wpdb;
        $result = $wpdb->get_results( $wpdb->prepare( "SELECT id, name from " . get_option( 'wbk_db_prefix', '' ) . "wbk_gg_calendars WHERE user_id = %d ", $user_id ) );
        return $result;
    }

    static function clear_payment_id_by_token( $token ) {
        global $wpdb;
        $wpdb->update(
            get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments',
            array(
                'payment_id' => '',
            ),
            array(
                'payment_cancel_token' => $token,
            ),
            array('%s'),
            array('%s')
        );
    }

    static function set_booking_expiration( $booking_id ) {
        global $wpdb;
        $expiration_time = get_option( 'wbk_appointments_expiration_time', '60' );
        if ( !is_numeric( $expiration_time ) ) {
            return;
        }
        if ( intval( $expiration_time ) < 1 ) {
            return;
        }
        $booking = new WBK_Booking($booking_id);
        if ( !$booking->is_loaded() ) {
            return;
        }
        $expiration_value = time() + $expiration_time * 60;
        $service = new WBK_Service($booking->get_service());
        if ( $service != FALSE ) {
            if ( $service->get_price() == 0 || $booking->get_price() == 0 ) {
                $expiration_value = 0;
            }
        }
        return $wpdb->update(
            get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments',
            array(
                'expiration_time' => $expiration_value,
            ),
            array(
                'id' => $booking_id,
            ),
            array('%d'),
            array('%d')
        );
    }

    static function auto_cancel_bookings() {
        global $wpdb;
        $time = time();
        if ( get_option( 'wbk_appointments_delete_not_paid_mode', 'disabled' ) != 'disabled' ) {
            $delete_rule = get_option( 'wbk_appointments_delete_payment_started', 'skip' );
            $sql = $wpdb->prepare( "SELECT id FROM " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments where (status <> 'cancelled') and (amount_paid=0 OR amount_paid IS NULL) and ( created_on > 1745840192) and ( ( payment_method <> 'Pay on arrival' and payment_method <> 'Bank transfer' ) or payment_method IS NULL ) and expiration_time <> 0 and expiration_time < %d", $time );
            $ids = $wpdb->get_col( $sql );
            foreach ( $ids as $booking_id ) {
                $booking = new WBK_Booking($booking_id);
                $booking->set( 'status', 'cancelled' );
                $booking->set( 'canceled_by', 'auto' );
                $booking->save();
                $bf = new WBK_Booking_Factory();
                $bf->destroy( $booking_id, 'auto', false );
            }
        }
        $pending_expiration = get_option( 'wbk_appointments_expiration_time_pending', 0 );
        if ( WBK_Validator::check_integer( $pending_expiration, 1, 500000 ) ) {
            $old_point = time() - $pending_expiration * 60;
            $ids = $wpdb->get_col( $wpdb->prepare( "SELECT id FROM " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments where ( status='pending' ) and created_on  < %d", $old_point ) );
            foreach ( $ids as $booking_id ) {
                $booking = new WBK_Booking($booking_id);
                $booking->set( 'status', 'cancelled' );
                $booking->set( 'canceled_by', 'auto' );
                $booking->save();
                $bf = new WBK_Booking_Factory();
                $bf->destroy( $booking_id, 'auto', false );
            }
        }
        if ( get_option( 'wbk_gdrp', 'disabled' ) == 'enabled' ) {
            $domain = parse_url( home_url(), PHP_URL_HOST );
            $table_name = get_option( 'wbk_db_prefix', '' ) . "wbk_appointments";
            // Prepare the SQL
            $sql = "UPDATE {$table_name}\r\n                    SET name = %s,\r\n                        email = %s,\r\n                        phone = %s\r\n                    WHERE end < %d";
            // Prepare the values
            $name = 'n/a';
            $email = 'gdpr-compliant@' . $domain;
            $phone = '000-000-000';
            // Execute the query safely
            global $wpdb;
            $wpdb->query( $wpdb->prepare(
                $sql,
                $name,
                $email,
                $phone,
                time()
            ) );
            $sql = "DELETE FROM " . get_option( 'wbk_db_prefix', '' ) . "wbk_cancelled_appointments WHERE time < %d";
            $wpdb->query( $wpdb->prepare( $sql, $time ) );
        }
    }

    static function backend_customer_name_processing( $booking_id, $customer_name ) {
        $booking = new WBK_Booking($booking_id);
        if ( !$booking->is_loaded() ) {
            return $customer_name;
        }
        $service = new WBK_Service($booking->get_service());
        if ( !$service->is_loaded() ) {
            return $customer_name;
        }
        if ( !$service->load() ) {
            return $customer_name;
        }
        $template = get_option( 'wbk_customer_name_output', '#name' );
        $result = str_replace( '#name', $customer_name, $template );
        $result = WBK_Placeholder_Processor::process( $result, [$booking_id] );
        $field_parts = explode( '#field_', $result );
        foreach ( $field_parts as $part ) {
            $to_replace = '#field_' . $part;
            $result = str_replace( $to_replace, '', $result );
        }
        return $result;
    }

    static function convert_date_format_for_picker() {
        $format = WBK_Format_Utils::get_date_format();
        $format = str_replace( 'd', 'dd', $format );
        $format = str_replace( 'j', 'd', $format );
        $format = str_replace( 'l', 'dddd', $format );
        $format = str_replace( 'D', 'ddd', $format );
        $format = str_replace( 'm', 'mm', $format );
        $format = str_replace( 'n', 'm', $format );
        $format = str_replace( 'F', 'mmmm', $format );
        $format = str_replace( 'M', 'mmm', $format );
        $format = str_replace( 'y', 'yy', $format );
        $format = str_replace( 'Y', 'yyyy', $format );
        $format = str_replace( 'S', '', $format );
        $format = str_replace( 's', '', $format );
        return $format;
    }

    public static function group_bookings_by_email( $booking_ids ) {
        $result = [];
        foreach ( $booking_ids as $booking_id ) {
            $booking = new WBK_Booking($booking_id);
            if ( !$booking->is_loaded() ) {
                return;
            }
            $result[$booking->get( 'email' )][] = $booking_id;
        }
        return $result;
    }

}
