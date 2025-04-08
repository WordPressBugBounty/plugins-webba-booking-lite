<?php

if ( !defined( 'ABSPATH' ) ) {
    exit;
}
class WBK_Model_Updater {
    static function is_update_required( $version ) {
        $update_status = get_option( 'wbk_update_status', '' );
        if ( $update_status == '' ) {
            return true;
        } else {
            if ( !isset( $update_status[$version] ) ) {
                return true;
            }
        }
        return false;
    }

    static function set_update_as_complete( $version ) {
        $update_status = get_option( 'wbk_update_status', '' );
        if ( $update_status == '' ) {
            $update_status = array();
            $update_status[$version] = true;
        } else {
            $update_status[$version] = true;
        }
        update_option( 'wbk_update_status', $update_status );
    }

    public static function run_update() {
        self::update_4_3_0_1();
        self::update_4_5_1();
        self::update_5_0_0_static();
        self::update_5_0_11();
        self::update_5_0_37();
        self::update_5_0_44();
        self::update_5_0_46();
        self::update_5_0_55();
        self::update_5_1_0();
        self::update_5_1_2();
        self::update_5_1_3();
        self::update_5_1_5();
        // self::update_5_1_11();
    }

    public static function run_previous_update() {
        $update_status = get_option( 'wbk_update_status', '' );
        $run_previous_update = false;
        if ( $update_status == '' ) {
            $run_previous_update = true;
            $update_status = array();
        } else {
            if ( !isset( $update_status['run_prev'] ) ) {
                $run_previous_update = true;
            }
        }
        if ( $run_previous_update ) {
            self::update_1_2_0();
            self::update_1_3_0();
            self::update_3_0_0();
            self::update_3_0_3();
            self::update_3_0_15();
            self::update_3_1_0();
            self::update_3_1_6();
            self::update_3_1_21();
            self::update_3_1_27();
            self::update_3_1_31();
            self::update_3_2_0();
            self::update_3_2_2();
            self::update_3_2_3();
            self::update_3_2_16();
            self::update_3_2_18();
            self::update_3_2_21();
            self::update_3_3_7();
            self::update_3_3_7_1();
            self::update_3_3_9();
            self::update_3_3_12();
            self::update_3_3_14();
            self::update_3_3_14_1();
            self::update_3_3_14_2();
            self::update_3_3_18();
            self::update_3_3_31();
            self::update_3_3_37();
            self::update_3_3_41();
            self::update_3_3_42();
            self::update_3_3_61();
            self::update_3_3_68();
            self::update_3_3_73();
            self::update_3_3_102();
            self::update_3_4_8();
            self::update_3_4_21();
            self::update_3_4_25();
            $update_status['run_prev'] = true;
            update_option( 'wbk_update_status', $update_status );
        }
    }

    static function update_1_2_0() {
        global $wpdb;
        $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_services';
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'form' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_services ADD `form` int unsigned NOT NULL default 0" );
        }
    }

    // add fields used since 1.3.0
    static function update_1_3_0() {
        global $wpdb;
        $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_services';
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'quantity' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_services ADD `quantity` int unsigned NOT NULL default 1" );
        }
        $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments';
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'quantity' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments ADD `quantity` int unsigned NOT NULL default 1" );
        }
    }

    // add fields used since 3.0.0
    static function update_3_0_0() {
        global $wpdb;
        $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_services';
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'price' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_services ADD `price` FLOAT NOT NULL DEFAULT '0'" );
        }
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'payment_methods' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_services ADD `payment_methods` varchar(255) NOT NULL DEFAULT ''" );
        }
        $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments';
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'status' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments ADD `status`  varchar(255) NOT NULL DEFAULT 'pending'" );
        }
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'payment_id' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments ADD `payment_id` varchar(255) NOT NULL DEFAULT ''" );
        }
    }

    // add tables and fields used since 3.0.3
    static function update_3_0_3() {
        global $wpdb;
        // email templates table
        $wpdb->query( "CREATE TABLE IF NOT EXISTS " . get_option( 'wbk_db_prefix', '' ) . "wbk_email_templates (\r\n                id int unsigned NOT NULL auto_increment PRIMARY KEY,\r\n                name varchar(128) default '',\r\n                template varchar(2000) default '',\r\n                UNIQUE KEY id (id)\r\n            )\r\n            DEFAULT CHARACTER SET = utf8\r\n            COLLATE = utf8_general_ci" );
        $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_services';
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'notification_template' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_services ADD `notification_template` int unsigned NOT NULL default 0" );
        }
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'reminder_template' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_services ADD `reminder_template` int unsigned NOT NULL default 0" );
        }
    }

    // add fields used since 3.0.15
    static function update_3_0_15() {
        global $wpdb;
        $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_services';
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'prepare_time' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_services ADD `prepare_time` int unsigned NOT NULL default 0" );
        }
        self::create_ht_file();
    }

    // add tables and fields used since 3.1.0
    static function update_3_1_0() {
        return;
    }

    // add fields used since 3.1.21
    static function update_3_1_21() {
        global $wpdb;
        if ( get_option( 'wbk_3_1_21_upd', '' ) == 'done' ) {
            return;
        }
        $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_services';
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'date_range' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_services ADD `date_range` varchar(128) NOT NULL DEFAULT ''" );
        }
        add_option( 'wbk_3_1_21_upd', 'done' );
        update_option( 'wbk_3_1_21_upd', 'done' );
    }

    // update db structure according to 3.1.6
    static function update_3_1_6() {
        global $wpdb;
        if ( get_option( 'wbk_3_1_6_upd', '' ) == 'done' ) {
            return;
        }
        // extends email templates field
        $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_email_templates CHANGE `template` `template` VARCHAR(20000) NOT NULL DEFAULT ''" );
        add_option( 'wbk_3_1_6_upd', 'done' );
        update_option( 'wbk_3_1_6_upd', 'done' );
    }

    static function update_3_1_27() {
        global $wpdb;
        if ( get_option( 'wbk_3_1_27_upd', '' ) == 'done' ) {
            return;
        }
        $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_services';
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'gg_calendars' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_services ADD `gg_calendars` varchar(512) NOT NULL DEFAULT ''" );
        }
        add_option( 'wbk_3_1_27_upd', 'done' );
        update_option( 'wbk_3_1_27_upd', 'done' );
    }

    static function update_3_1_31() {
        global $wpdb;
        if ( get_option( 'wbk_3_1_31_upd', '' ) == 'done' ) {
            return;
        }
        $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_services';
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'invoice_template' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_services ADD `invoice_template` int unsigned NOT NULL default 0" );
        }
        add_option( 'wbk_3_1_31_upd', 'done' );
        update_option( 'wbk_3_1_31_upd', 'done' );
    }

    //update db structure to version 3.2.0
    static function update_3_2_0() {
        global $wpdb;
        if ( get_option( 'wbk_3_2_0_upd', '' ) == 'done' ) {
            return;
        }
        // google calendar
        $wpdb->query( "CREATE TABLE IF NOT EXISTS " . get_option( 'wbk_db_prefix', '' ) . "wbk_gg_calendars (\r\n                id int unsigned NOT NULL auto_increment PRIMARY KEY,\r\n                name varchar(128) default '',\r\n                access_token varchar(512) default '',\r\n                calendar_id  varchar(512) default '',\r\n                user_id int unsigned NOT NULL,\r\n                UNIQUE KEY id (id)\r\n            )\r\n            DEFAULT CHARACTER SET = utf8\r\n            COLLATE = utf8_general_ci" );
        $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_services';
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'gg_calendars' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_services ADD `gg_calendars` varchar(512) NOT NULL DEFAULT ''" );
        }
        $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments';
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'gg_event_id' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments ADD `gg_event_id` varchar(512) NOT NULL DEFAULT ''" );
        }
        add_option( 'wbk_3_2_0_upd', 'done' );
        update_option( 'wbk_3_2_0_upd', 'done' );
    }

    //update db structure to version 3.2.2
    static function update_3_2_2() {
        global $wpdb;
        if ( get_option( 'wbk_3_2_2_upd', '' ) == 'done' ) {
            return;
        }
        $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_locked_time_slots';
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'connected_id' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_locked_time_slots ADD `connected_id` int unsigned NOT NULL default 0" );
        }
        add_option( 'wbk_3_2_2_upd', 'done' );
        update_option( 'wbk_3_2_2_upd', 'done' );
    }

    //update db structure to version 3.2.3
    static function update_3_2_3() {
        global $wpdb;
        if ( get_option( 'wbk_3_2_3_upd', '' ) == 'done' ) {
            return;
        }
        $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments';
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'admin_token' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments ADD `admin_token` varchar(255) NOT NULL DEFAULT ''" );
        }
        add_option( 'wbk_3_2_3_upd', 'done' );
        update_option( 'wbk_3_2_3_upd', 'done' );
    }

    // update db structure to version 3.2.16
    static function update_3_2_16() {
        global $wpdb;
        if ( get_option( 'wbk_3_2_16_upd', '' ) == 'done' ) {
            return;
        }
        $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_services CHANGE `description` `description` varchar(1024) default ''" );
        add_option( 'wbk_install_cn', time() );
        add_option( 'wbk_3_2_16_upd', 'done' );
        update_option( 'wbk_3_2_16_upd', 'done' );
    }

    // update db structure to version 3.2.18
    static function update_3_2_18() {
        global $wpdb;
        if ( get_option( 'wbk_3_2_18_upd', '' ) == 'done' ) {
            return;
        }
        $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments';
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'time_offset' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments ADD  time_offset int  NOT NULL default 0" );
        }
        add_option( 'wbk_3_2_18_upd', 'done' );
        update_option( 'wbk_3_2_18_upd', 'done' );
    }

    // update db structure to version 3.2.21
    static function update_3_2_21() {
        global $wpdb;
        if ( get_option( 'wbk_3_2_21_upd', '' ) == 'done' ) {
            return;
        }
        $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments CHANGE `attachment` `attachment` VARCHAR(1024) NOT NULL DEFAULT ''" );
        add_option( 'wbk_3_2_21_upd', 'done' );
        update_option( 'wbk_3_2_21_upd', 'done' );
    }

    // update db structure to version 3.3.7
    static function update_3_3_7() {
        global $wpdb;
        if ( get_option( 'wbk_3_3_7_upd', '' ) == 'done' ) {
            return;
        }
        $wpdb->query( "CREATE TABLE IF NOT EXISTS " . get_option( 'wbk_db_prefix', '' ) . "wbk_coupons (\r\n                id int unsigned NOT NULL auto_increment PRIMARY KEY,\r\n                name varchar(128) default '',\r\n                services varchar(512) default '',\r\n                date_range varchar(256) default '',\r\n                used int unsigned NOT NULL default 0,\r\n                amount_fixed int unsigned NOT NULL default 0,\r\n                amount_percentage int unsigned NOT NULL default 0,\r\n                maximum int unsigned default NULL,\r\n                UNIQUE KEY id (id)\r\n            )\r\n            DEFAULT CHARACTER SET = utf8\r\n            COLLATE = utf8_general_ci" );
        $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments';
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'coupon' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments ADD coupon int NOT NULL default 0" );
        }
        add_option( 'wbk_3_3_7_upd', 'done' );
        update_option( 'wbk_3_3_7_upd', 'done' );
    }

    // update db structure to version 3.3.7.1
    static function update_3_3_7_1() {
        global $wpdb;
        if ( get_option( 'wbk_3_3_7_1_upd', '' ) == 'done' ) {
            return;
        }
        $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_services';
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'multi_mode_limit' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_services ADD multi_mode_limit varchar(128) NOT NULL default ''" );
        }
        add_option( 'wbk_3_3_7_1_upd', 'done' );
        update_option( 'wbk_3_3_7_1_upd', 'done' );
    }

    // update db structure to version 3.3.9
    static function update_3_3_9() {
        global $wpdb;
        if ( get_option( 'wbk_3_3_9_upd', '' ) == 'done' ) {
            return;
        }
        $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_gg_calendars';
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'mode' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_gg_calendars ADD mode varchar(128) default 'One-way'" );
        }
        add_option( 'wbk_3_3_9_upd', 'done' );
        update_option( 'wbk_3_3_9_upd', 'done' );
    }

    // update db structure to version 3.2.12+
    static function update_3_3_12() {
        global $wpdb;
        if ( get_option( 'wbk_3_3_12_upd', '' ) == 'done' ) {
            return;
        }
        $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments CHANGE `extra` `extra` VARCHAR(2048) NOT NULL DEFAULT ''" );
        add_option( 'wbk_3_3_12_upd', 'done' );
        update_option( 'wbk_3_3_12_upd', 'done' );
    }

    // update db structure to version 3.2.14
    static function update_3_3_14() {
        global $wpdb;
        if ( get_option( 'wbk_3_3_14_upd', '' ) == 'done' ) {
            return;
        }
        $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments';
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'payment_method' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments ADD payment_method varchar(255) default ''" );
        }
        add_option( 'wbk_3_3_14_upd', 'done' );
        update_option( 'wbk_3_3_14_upd', 'done' );
    }

    // update db structure to version 3.2.14(1)
    static function update_3_3_14_1() {
        global $wpdb;
        if ( get_option( 'wbk_3_3_14_1_upd', '' ) == 'done' ) {
            return;
        }
        $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_gg_calendars';
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'cache_content' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_gg_calendars ADD cache_content longtext NOT NULL default ''" );
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_gg_calendars ADD cache_time int unsigned NOT NULL default 0" );
        }
        add_option( 'wbk_3_3_14_1_upd', 'done' );
        update_option( 'wbk_3_3_14_1_upd', 'done' );
    }

    static function update_3_4_8() {
        global $wpdb;
        if ( get_option( 'update_3_4_8', '' ) == 'done' ) {
            return;
        }
        //	$arr_service = self::
        $service_ids = WBK_Model_Utils::get_services();
        foreach ( $service_ids as $service_id ) {
            $service = WBK_Db_Utils::initServiceById( $service_id );
            if ( $service == FALSE ) {
                continue;
            }
            $prepare_time = $service->getPrepareTime();
            if ( $prepare_time != 0 ) {
                $service->setPrepareTime( $prepare_time * 60 );
                $service->update();
            }
        }
        add_option( 'update_3_4_8', 'done' );
        update_option( 'update_3_4_8', 'done' );
    }

    // update db structure to version 3.3.14.2
    static function update_3_3_14_2() {
        global $wpdb;
        if ( get_option( 'wbk_3_3_14_2_upd', '' ) == 'done' ) {
            return;
        }
        $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_services';
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'multi_mode_low_limit' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_services ADD multi_mode_low_limit varchar(128) NOT NULL default ''" );
        }
        add_option( 'wbk_3_3_14_2_upd', 'done' );
        update_option( 'wbk_3_3_14_2_upd', 'done' );
    }

    // update db structure to version 3.3.18
    static function update_3_3_18() {
        global $wpdb;
        if ( get_option( 'wbk_3_3_18_upd', '' ) == 'done' ) {
            return;
        }
        $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments CHANGE `extra` `extra` LONGTEXT NOT NULL DEFAULT ''" );
        add_option( 'wbk_3_3_18_upd', 'done' );
        update_option( 'wbk_3_3_18_upd', 'done' );
    }

    // update db structure to version 3.4.0
    static function update_3_3_31() {
        global $wpdb;
        if ( get_option( 'wbk_3_3_31_upd', '' ) == 'done' ) {
            return;
        }
        $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments';
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'created_on' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments ADD created_on int unsigned NOT NULL default 0" );
        }
        add_option( 'wbk_3_3_31_upd', 'done' );
        update_option( 'wbk_3_3_31_upd', 'done' );
    }

    // update db structure to version 3.3.37
    static function update_3_3_37() {
        global $wpdb;
        if ( get_option( 'wbk_3_3_37_upd', '' ) == 'done' ) {
            return;
        }
        $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_services';
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'priority' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_services ADD priority int NOT NULL default 0" );
        }
        add_option( 'wbk_3_3_37_upd', 'done' );
        update_option( 'wbk_3_3_37_upd', 'done' );
    }

    // update db structure to version 3.3.41
    static function update_3_3_41() {
        global $wpdb;
        if ( get_option( 'wbk_3_3_41_upd', '' ) == 'done' ) {
            return;
        }
        $app_ids = $wpdb->get_col( 'SELECT id from ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments' );
        foreach ( $app_ids as $app_id ) {
            $extra_data = $wpdb->get_var( $wpdb->prepare( " SELECT extra FROM " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments WHERE id = %d ", $app_id ) );
            if ( $extra_data == '' ) {
                continue;
            }
            $extra_data_ids = explode( '###', $extra_data );
            $extras = array();
            foreach ( $extra_data_ids as $extra_id ) {
                if ( trim( $extra_id ) == '' ) {
                    continue;
                }
                $value_pair = explode( ':', $extra_id );
                if ( count( $value_pair ) != 2 ) {
                    continue;
                }
                $field_id = trim( $value_pair[0] );
                $field_id_label = $field_id;
                $field_id_label = explode( ']', $field_id_label );
                if ( count( $field_id_label ) != 2 ) {
                    continue;
                }
                $field_id_label = $field_id_label[1];
                $matches = array();
                preg_match( "/\\[[^\\]]*\\]/", $field_id, $matches );
                $field_id = trim( $matches[0], '[]' );
                $custom_field_value = $value_pair[1];
                $custom_field_value = str_replace( '{colon}', ':', $custom_field_value );
                $extra = array();
                $extra[] = trim( $field_id );
                $extra[] = trim( $field_id_label );
                $extra[] = trim( $custom_field_value );
                $extras[] = $extra;
            }
            $extras = json_encode( $extras );
            $result = $wpdb->update(
                get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments',
                array(
                    'extra' => $extras,
                ),
                array(
                    'id' => $app_id,
                ),
                array('%s'),
                array('%d')
            );
        }
        $found = false;
        add_option( 'wbk_3_3_41_upd', 'done' );
        update_option( 'wbk_3_3_41_upd', 'done' );
    }

    // update db structure to version 3.3.42
    static function update_3_3_42() {
        global $wpdb;
        if ( get_option( 'wbk_3_3_42_upd', '' ) == 'done' ) {
            return;
        }
        $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments';
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'lang' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments ADD lang varchar(255) default ''" );
        }
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'moment_price' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments ADD moment_price varchar(255) default ''" );
        }
        add_option( 'wbk_3_3_42_upd', 'done' );
        update_option( 'wbk_3_3_42_upd', 'done' );
    }

    // update db structure to version 3.3.42
    static function update_3_3_61() {
        global $wpdb;
        if ( get_option( 'wbk_3_3_61_upd', '' ) == 'done' ) {
            return;
        }
        $wpdb->query( "CREATE TABLE IF NOT EXISTS " . get_option( 'wbk_db_prefix', '' ) . "wbk_cancelled_appointments (\r\n                    id int unsigned NOT NULL auto_increment PRIMARY KEY,\r\n                    id_cancelled int unsigned NOT NULL default 0,\r\n                    cancelled_by varchar(128) default '',\r\n                    name varchar(128) default '',\r\n                    email varchar(128) default '',\r\n                    phone varchar(128) default '',\r\n                    description varchar(1024) default '',\r\n                    extra varchar(2048) default '',\r\n                    attachment varchar(1024) default '',\r\n                    service_id int unsigned NOT NULL,\r\n                    time int unsigned NOT NULL,\r\n                    day int unsigned NOT NULL,\r\n                    duration int unsigned NOT NULL,\r\n                    created_on int unsigned NOT NULL default 0,\r\n                    quantity int unsigned NOT NULL default 1,\r\n                    status varchar(255) default 'pending',\r\n                    payment_id varchar(255) default '',\r\n                    token varchar(255) NOT NULL DEFAULT '',\r\n                    payment_cancel_token varchar(255) NOT NULL DEFAULT '',\r\n                    admin_token varchar(255) NOT NULL DEFAULT '',\r\n                    expiration_time int unsigned NOT NULL default 0,\r\n                    time_offset int NOT NULL default 0,\r\n                    gg_event_id varchar(255) default '',\r\n                    coupon int NOT NULL default 0,\r\n                    payment_method varchar(255) default '',\r\n\r\n                    lang varchar(255) default '',\r\n                    moment_price varchar(255) default '',\r\n                    UNIQUE KEY id (id)\r\n                )\r\n                    DEFAULT CHARACTER SET = utf8\r\n                    COLLATE = utf8_general_ci" );
        add_option( 'wbk_3_3_61_upd', 'done' );
        update_option( 'wbk_3_3_61_upd', 'done' );
    }

    static function update_3_3_68() {
        global $wpdb;
        if ( get_option( 'wbk_3_3_68_upd', '' ) == 'done' ) {
            return;
        }
        $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_services';
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'min_quantity' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_services ADD min_quantity int unsigned NOT NULL default 1" );
        }
        add_option( 'wbk_3_3_68_upd', 'done' );
        update_option( 'wbk_3_3_68_upd', 'done' );
    }

    static function update_3_3_73() {
        global $wpdb;
        if ( get_option( 'wbk_3_3_73_upd', '' ) == 'done' ) {
            return;
        }
        //	$arr_service = self::
        $service_ids = WBK_Model_Utils::get_services();
        foreach ( $service_ids as $service_id ) {
            $service = WBK_Db_Utils::initServiceById( $service_id );
            if ( $service == FALSE ) {
                continue;
            }
            $prepare_time = $service->getPrepareTime();
            if ( $prepare_time != 0 ) {
                $service->setPrepareTime( $prepare_time * 24 );
                $service->update();
            }
        }
        add_option( 'wbk_3_3_73_upd', 'done' );
        update_option( 'wbk_3_3_73_upd', 'done' );
    }

    static function update_3_3_102() {
        global $wpdb;
        if ( get_option( 'wbk_3_3_102_upd', '' ) == 'done' ) {
            return;
        }
        $value = get_option( 'wbk_email_customer_appointment_cancel_message', '' );
        add_option( 'wbk_email_customer_bycustomer_appointment_cancel_message', $value );
        update_option( 'wbk_email_customer_bycustomer_appointment_cancel_message', $value );
        add_option( 'wbk_3_3_102_upd', 'done' );
        update_option( 'wbk_3_3_102_upd', 'done' );
    }

    // update db structure to version 3.4.21
    static function update_3_4_21() {
        global $wpdb;
        if ( get_option( 'wbk_3_4_21_upd', '' ) == 'done' ) {
            return;
        }
        $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments';
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'service_category' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments ADD service_category int unsigned NOT NULL default 0" );
        }
        add_option( 'wbk_3_4_21_upd', 'done' );
        update_option( 'wbk_3_4_21_upd', 'done' );
    }

    // update db structure to version 3.4.25
    static function update_3_4_25() {
        global $wpdb;
        if ( get_option( 'wbk_3_4_25_upd', '' ) == 'done' ) {
            return;
        }
        $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments';
        $found = false;
        foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
            if ( $column_name == 'user_ip' ) {
                $found = true;
            }
        }
        if ( !$found ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments ADD user_ip varchar(255) default ''" );
        }
        add_option( 'wbk_3_4_25_upd', 'done' );
        update_option( 'wbk_3_4_25_upd', 'done' );
    }

    // create export file
    static function create_ht_file() {
        $path = WP_WEBBA_BOOKING__PLUGIN_DIR . DIRECTORY_SEPARATOR . 'export' . DIRECTORY_SEPARATOR . '.htaccess';
        $content = "RewriteEngine On" . "\r\n";
        $content .= "RewriteCond %{HTTP_REFERER} !^" . get_admin_url() . 'admin.php\\?page\\=wbk-appointments' . '.* [NC]' . "\r\n";
        $content .= "RewriteRule .* - [F]";
        if ( !file_exists( $path ) ) {
            file_put_contents( $path, $content );
        }
    }

    static function update_4_0_0() {
        return;
    }

    static function update_4_0_49() {
        global $wpdb;
        if ( self::is_update_required( '4.0.49' ) ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_coupons CHANGE `amount_fixed` `amount_fixed` float unsigned NULL default NULL" );
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_coupons CHANGE `amount_percentage` `amount_percentage` float unsigned NULL default NULL" );
            self::set_update_as_complete( '4.0.49' );
        }
    }

    static function update_4_0_62() {
        global $wpdb;
        if ( self::is_update_required( 'update_4_0_62' ) ) {
            $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments';
            $found = false;
            foreach ( $wpdb->get_col( "DESC " . $table_name, 0 ) as $column_name ) {
                if ( $column_name == 'end' ) {
                    $found = true;
                }
            }
            if ( !$found ) {
                $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments ADD `end` int unsigned DEFAULT null" );
            }
            $ids = $wpdb->get_col( 'SELECT id from ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments' );
            foreach ( $ids as $id ) {
                WBK_Model_Utils::set_booking_end( $id );
            }
            self::set_update_as_complete( 'update_4_0_62' );
        }
    }

    static function update_4_0_73() {
        global $wpdb;
        if ( self::is_update_required( 'update_4_0_73' ) ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_services CHANGE `description` `description` MEDIUMTEXT NOT NULL" );
            self::set_update_as_complete( 'update_4_0_73' );
        }
    }

    static function update_table_names() {
        global $wpdb;
        if ( self::is_update_required( 'update_4_1_0' ) || current_user_can( 'manage_options' ) && isset( $_GET['wbkforceupdate410'] ) ) {
            $prefix = $wpdb->prefix;
            $query = $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( 'wbk_appointments' ) );
            if ( $wpdb->get_var( $query ) == 'wbk_appointments' ) {
                $wpdb->query( "RENAME TABLE `wbk_appointments` TO " . $prefix . "wbk_appointments" );
            }
            $query = $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( 'wbk_cancelled_appointments' ) );
            if ( $wpdb->get_var( $query ) == 'wbk_cancelled_appointments' ) {
                $wpdb->query( "RENAME TABLE `wbk_cancelled_appointments` TO " . $prefix . "wbk_cancelled_appointments" );
            }
            $query = $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( 'wbk_coupons' ) );
            if ( $wpdb->get_var( $query ) == 'wbk_coupons' ) {
                $wpdb->query( "RENAME TABLE `wbk_coupons` TO " . $prefix . "wbk_coupons" );
            }
            $query = $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( 'wbk_days_on_off' ) );
            if ( $wpdb->get_var( $query ) == 'wbk_days_on_off' ) {
                $wpdb->query( "RENAME TABLE `wbk_days_on_off` TO " . $prefix . "wbk_days_on_off" );
            }
            $query = $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( 'wbk_email_templates' ) );
            if ( $wpdb->get_var( $query ) == 'wbk_email_templates' ) {
                $wpdb->query( "RENAME TABLE `wbk_email_templates` TO " . $prefix . "wbk_email_templates" );
            }
            $query = $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( 'wbk_gg_calendars' ) );
            if ( $wpdb->get_var( $query ) == 'wbk_gg_calendars' ) {
                $wpdb->query( "RENAME TABLE `wbk_gg_calendars` TO " . $prefix . "wbk_gg_calendars" );
            }
            $query = $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( 'wbk_locked_time_slots' ) );
            if ( $wpdb->get_var( $query ) == 'wbk_locked_time_slots' ) {
                $wpdb->query( "RENAME TABLE `wbk_locked_time_slots` TO " . $prefix . "wbk_locked_time_slots" );
            }
            $query = $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( 'wbk_pricing_rules' ) );
            if ( $wpdb->get_var( $query ) == 'wbk_pricing_rules' ) {
                $wpdb->query( "RENAME TABLE `wbk_pricing_rules` TO " . $prefix . "wbk_pricing_rules" );
            }
            $query = $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( 'wbk_services' ) );
            if ( $wpdb->get_var( $query ) == 'wbk_services' ) {
                $wpdb->query( "RENAME TABLE `wbk_services` TO " . $prefix . "wbk_services" );
            }
            $query = $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( 'wbk_service_categories' ) );
            if ( $wpdb->get_var( $query ) == 'wbk_service_categories' ) {
                $wpdb->query( "RENAME TABLE `wbk_service_categories` TO " . $prefix . "wbk_service_categories" );
            }
            update_option( 'wbk_db_prefix', $prefix );
            self::set_update_as_complete( 'update_4_1_0' );
        }
    }

    static function update_4_1_3() {
        global $wpdb;
    }

    static function update_4_1_4() {
        if ( self::is_update_required( 'update_4_1_4' ) ) {
            $value = get_option( 'wbk_payment_item_name', '' );
            $value = str_replace( '#service ', '#service_name ', $value );
            update_option( 'wbk_payment_item_name', $value );
            self::set_update_as_complete( 'update_4_1_4' );
        }
    }

    static function update_4_1_8() {
        global $wpdb;
        if ( self::is_update_required( 'update_4_1_8' ) ) {
            $wpdb->query( "ALTER TABLE " . get_option( 'wbk_db_prefix', '' ) . "wbk_appointments CHANGE `time_offset` `time_offset` INT(11) NULL DEFAULT NULL" );
            self::set_update_as_complete( 'update_4_1_8' );
        }
    }

    static function update_4_2_8() {
        global $wpdb;
        if ( self::is_update_required( 'update_4_2_8' ) ) {
            if ( get_option( 'wbk_paypal_mode' ) == 'Live' ) {
                update_option( 'wbk_paypal_mode', 'live' );
            }
            if ( get_option( 'wbk_paypal_mode' ) == 'Sandbox' ) {
                update_option( 'wbk_paypal_mode', 'sandbox' );
            }
            self::set_update_as_complete( 'update_4_2_8' );
        }
    }

    static function update_4_3_0_1() {
        global $wpdb;
        if ( self::is_update_required( 'update_4_3_0_1' ) ) {
            $wpdb->query( 'ALTER TABLE ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_services' . ' ROW_FORMAT=DYNAMIC' );
            $wpdb->query( 'ALTER TABLE ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_appointments' . ' ROW_FORMAT=DYNAMIC' );
            self::set_update_as_complete( 'update_4_3_0_1' );
        }
    }

    static function update_4_5_1() {
        global $wpdb;
        if ( self::is_update_required( 'update_4_5_1' ) ) {
            update_option( 'wbk_payment_item_name', __( '#service_name on #appointment_day at #appointment_time', 'webba-booking-lite' ) );
            update_option( 'wbk_appointment_information', 'Appointment on #appointment_day #appointment_time' );
            self::set_update_as_complete( 'update_4_5_1' );
        }
    }

    static function update_5_0_11() {
        if ( self::is_update_required( 'update_5_0_11' ) ) {
            update_option( 'wbk_disable_security', 'true' );
        }
    }

    static function update_5_0_0_static() {
        update_option( 'wbk_mode', 'webba5' );
        update_option( 'wbk_date_format', get_option( 'date_format' ) );
        update_option( 'wbk_time_format', get_option( 'time_format' ) );
        update_option( 'wbk_start_of_week', get_option( 'start_of_week' ) );
        update_option( 'wbk_appointments_auto_lock_allow_unlock', 'disallow' );
        update_option( 'wbk_allow_manage_by_link', 'yes' );
        update_option( 'wbk_email_customer_book_multiple_mode', 'one' );
        update_option( 'wbk_email_admin_book_multiple_mode', 'one' );
        update_option( 'wbk_email_admin_cancel_multiple_mode', 'one' );
        update_option( 'wbk_email_customer_cancel_multiple_mode', 'one' );
        update_option( 'wbk_email_admin_cancel_multiple_mode', 'one' );
        update_option( 'wbk_email_admin_cancel_multiple_mode', 'one' );
    }

    static function update_5_0_37() {
        global $wpdb;
        if ( self::is_update_required( 'update_5_0_37' ) ) {
            $previous_proudct_id = get_option( 'wbk_woo_product_id', '' );
            if ( is_numeric( $previous_proudct_id ) ) {
                $services_ids = WBK_Model_Utils::get_service_ids();
                foreach ( $services_ids as $service_id ) {
                    $service = new WBK_Service($service_id);
                    if ( !$service->is_loaded() ) {
                        continue;
                    }
                    if ( $service->get_payment_methods() == '' ) {
                        continue;
                    }
                    $payment_methods = json_decode( $service->get_payment_methods(), true );
                    if ( is_array( $payment_methods ) && in_array( 'woocommerce', $payment_methods ) ) {
                        $service->set( 'woo_product', $previous_proudct_id );
                        $service->save();
                    }
                }
            }
            self::set_update_as_complete( 'update_5_0_37' );
        }
    }

    static function update_5_0_44() {
        global $wpdb;
        if ( self::is_update_required( 'update_5_0_44_1' ) ) {
            $wpdb->query( 'ALTER TABLE ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_services CHANGE `multi_mode_limit` `multi_mode_limit` INT UNSIGNED NULL DEFAULT NULL' );
            $wpdb->query( 'ALTER TABLE ' . get_option( 'wbk_db_prefix', '' ) . 'wbk_services CHANGE `multi_mode_low_limit` `multi_mode_low_limit` INT UNSIGNED NULL DEFAULT NULL' );
            self::set_update_as_complete( 'update_5_0_44_1' );
        }
    }

    static function update_5_0_46() {
        global $wpdb;
        if ( self::is_update_required( 'update_5_0_46' ) ) {
            $default_value = array('complete_status', 'thankyou_message', 'complete_payment');
            $value = get_option( 'wbk_woo_complete_action', $default_value );
            if ( is_array( $value ) && !in_array( 'complete_payment', $value ) ) {
                $value[] = 'complete_payment';
                update_option( 'wbk_woo_complete_action', $value );
            }
            self::set_update_as_complete( 'update_5_0_46' );
        }
    }

    /**
     * Initialize automatic user creation and create booking customer role
     *
     * @return void
     */
    static function update_5_0_55() : void {
        if ( !self::is_update_required( 'update_5_0_55' ) ) {
            return;
        }
        if ( !wbk_fs()->is__premium_only() || !wbk_fs()->can_use_premium_code() ) {
            return;
        }
        $services = WBK_Model_Utils::get_services();
        if ( count( $services ) > 0 ) {
            return;
        }
        update_option( 'wbk_create_user_on_booking', true );
        self::set_update_as_complete( 'update_5_0_55' );
    }

    static function update_5_1_0() {
        global $wpdb;
        if ( self::is_update_required( 'update_5_1_0' ) ) {
            // update business hours format
            $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_services';
            $new_column = 'business_hours';
            $source_column = 'business_hours_v4';
            $source_column_exists = $wpdb->get_results( $wpdb->prepare( "SHOW COLUMNS FROM `{$table_name}` LIKE %s", $source_column ) );
            if ( !empty( $source_column_exists ) ) {
                $wpdb->query( "UPDATE `{$table_name}` SET `{$new_column}` = `{$source_column}` WHERE `{$new_column}` IS NULL OR `{$new_column}` = ''" );
            }
            $wpdb->query( " ALTER TABLE `{$table_name}` CHANGE `business_hours` `business_hours` MEDIUMTEXT" );
            foreach ( WBK_Model_Utils::get_service_ids() as $service_id ) {
                $service = new WBK_Service($service_id);
                if ( !$service->is_loaded() ) {
                    continue;
                }
                $service->set( 'business_hours', WBK_Model_Utils::extract_bh_availability_from_v4( $service->get( 'business_hours' ) ) );
                $service->save();
            }
            $prefix = get_option( 'wbk_db_prefix', '' );
            // Process Google calendars table
            $cal_table = $prefix . 'wbk_gg_calendars';
            $cal_old = 'calendar_id';
            $cal_new = 'ggid';
            if ( $wpdb->get_var( "SHOW TABLES LIKE '{$cal_table}'" ) == $cal_table ) {
                $new_exists = $wpdb->get_results( "SHOW COLUMNS FROM {$cal_table} LIKE '{$cal_new}'" );
                if ( empty( $new_exists ) ) {
                    $wpdb->query( "ALTER TABLE {$cal_table} ADD COLUMN `{$cal_new}` VARCHAR(256)" );
                }
                $old_exists = $wpdb->get_results( "SHOW COLUMNS FROM {$cal_table} LIKE '{$cal_old}'" );
                if ( !empty( $old_exists ) ) {
                    $wpdb->query( "UPDATE {$cal_table} SET `{$cal_new}` = `{$cal_old}` WHERE `{$cal_old}` IS NOT NULL" );
                }
            }
            // Process service categories table
            $cat_table = $prefix . 'wbk_service_categories';
            $cat_old = 'category_list';
            $cat_new = 'list';
            if ( $wpdb->get_var( "SHOW TABLES LIKE '{$cat_table}'" ) == $cat_table ) {
                $new_exists = $wpdb->get_results( "SHOW COLUMNS FROM {$cat_table} LIKE '{$cat_new}'" );
                if ( empty( $new_exists ) ) {
                    $wpdb->query( "ALTER TABLE {$cat_table} ADD COLUMN `{$cat_new}` VARCHAR(1024) NULL DEFAULT NULL" );
                }
                $old_exists = $wpdb->get_results( "SHOW COLUMNS FROM {$cat_table} LIKE '{$cat_old}'" );
                if ( !empty( $old_exists ) ) {
                    $wpdb->query( "UPDATE {$cat_table} SET `{$cat_new}` = `{$cat_old}` WHERE `{$cat_old}` IS NOT NULL" );
                }
            }
            self::set_update_as_complete( 'update_5_1_0' );
        }
    }

    static function update_5_1_2() {
        global $wpdb;
        if ( self::is_update_required( 'update_5_1_2' ) ) {
            $table_name = get_option( 'wbk_db_prefix', '' ) . 'wbk_services';
            $wpdb->query( " ALTER TABLE `{$table_name}` CHANGE `business_hours` `business_hours` MEDIUMTEXT" );
            foreach ( WBK_Model_Utils::get_service_ids() as $service_id ) {
                $service = new WBK_Service($service_id);
                if ( !$service->is_loaded() ) {
                    continue;
                }
                if ( strpos( $service->get( 'business_hours' ), 'dow_availability' ) !== false ) {
                    $v4_res = WBK_Model_Utils::extract_bh_availability_from_v4( $service->get( 'business_hours_v4' ) );
                    if ( !$v4_res ) {
                        $v4_res = '[]';
                    }
                    $service->set( 'business_hours', $v4_res );
                    $service->save();
                }
            }
        }
        self::set_update_as_complete( 'update_5_1_2' );
    }

    static function update_5_1_3() {
        global $wpdb;
        if ( self::is_update_required( 'update_5_1_3' ) ) {
            foreach ( WBK_Model_Utils::get_service_ids() as $service_id ) {
                $service = new WBK_Service($service_id);
                if ( !$service->is_loaded() ) {
                    continue;
                }
                $bh = json_decode( $service->get( 'business_hours' ) );
                if ( $bh == false || is_null( $bh ) ) {
                    $v4_res = WBK_Model_Utils::extract_bh_availability_from_v4( $service->get( 'business_hours_v4' ) );
                    if ( !$v4_res ) {
                        $v4_res = '[]';
                    }
                    $service->set( 'business_hours', $v4_res );
                    $service->save();
                }
            }
        }
        self::set_update_as_complete( 'update_5_1_3' );
    }

    static function update_5_1_5() {
        global $wpdb;
        if ( self::is_update_required( 'update_5_1_5' ) ) {
            foreach ( WBK_Model_Utils::get_pricing_rules() as $id => $name ) {
                $pricing_rule = new WBK_Pricing_Rule($id);
                if ( !$pricing_rule->is_loaded() || $pricing_rule->get_type() != 'day_of_week_and_time' ) {
                    continue;
                }
                if ( strpos( $pricing_rule->get( 'day_time' ), 'dow_availability' ) !== false ) {
                    $v4_res = WBK_Model_Utils::extract_bh_availability_from_v4( $pricing_rule->get( 'day_time' ) );
                    if ( !$v4_res ) {
                        $v4_res = '[]';
                    }
                    $pricing_rule->set( 'day_time', $v4_res );
                    $pricing_rule->save();
                }
            }
        }
        self::set_update_as_complete( 'update_5_1_5' );
    }

    static function update_5_1_11() {
        global $wpdb;
        if ( 1 == 1 ) {
            $template_data = WBK_Model_Utils::get_email_template_type_usage( 'notification_template' );
            foreach ( $template_data['email_template_ids'] as $email_template_id ) {
                self::supplement_template_from_options( $email_template_id, get_option( 'wbk_email_customer_book_subject', '' ) );
            }
        }
        // self::set_update_as_complete('wbk_email_customer_book_status');
        if ( 1 == 1 ) {
            $template_data = WBK_Model_Utils::get_email_template_type_usage( 'arrived_template' );
            foreach ( $template_data['email_template_ids'] as $email_template_id ) {
                self::supplement_template_from_options( $email_template_id, get_option( 'wbk_email_customer_arrived_subject', '' ) );
            }
        }
        // self::set_update_as_complete('wbk_email_customer_daily_status');
        if ( 1 == 1 ) {
            $template_data = WBK_Model_Utils::get_email_template_type_usage( 'reminder_template' );
            foreach ( $template_data['email_template_ids'] as $email_template_id ) {
                self::supplement_template_from_options( $email_template_id, get_option( 'wbk_email_customer_daily_subject', '' ) );
            }
        }
        // self::set_update_as_complete('wbk_email_customer_daily_status');
        if ( 1 == 1 ) {
            $template_data = WBK_Model_Utils::get_email_template_type_usage( 'invoice_template' );
            foreach ( $template_data['email_template_ids'] as $email_template_id ) {
                self::supplement_template_from_options( $email_template_id, get_option( 'wbk_email_customer_invoice_subject', '' ) );
            }
        }
        // self::set_update_as_complete('wbk_email_customer_send_invoice');
        if ( 1 == 1 ) {
            $template_data = WBK_Model_Utils::get_email_template_type_usage( 'booking_changed_template' );
            foreach ( $template_data['email_template_ids'] as $email_template_id ) {
                self::supplement_template_from_options( $email_template_id, get_option( 'wbk_email_on_update_booking_subject', '' ) );
            }
        }
        // self::set_update_as_complete('wbk_email_on_update_booking_subject');
    }

    static function supplement_template_from_options( $template_id, $subject ) {
        $template = new WBK_Email_Template($template_id);
        if ( !$template->is_loaded() ) {
            return false;
        }
        $template->set( 'subject', $subject );
        return $template->save();
    }

    static function generate_template_from_options() {
    }

}
