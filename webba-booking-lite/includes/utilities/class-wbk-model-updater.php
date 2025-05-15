<?php

if (!defined('ABSPATH'))
    exit;

class WBK_Model_Updater
{

    static function is_update_required($version)
    {
        if (isset($_GET[$version]) && current_user_can('manage_options')) {

            return true;
        }
        $update_status = get_option('wbk_update_status', '');
        if ($update_status == '') {
            return true;
        } else {
            if (!isset($update_status[$version])) {
                return true;
            }
        }
        return false;
    }
    static function set_update_as_complete($version)
    {
        $update_status = get_option('wbk_update_status', '');
        if ($update_status == '') {
            $update_status = array();
            $update_status[$version] = true;
        } else {
            $update_status[$version] = true;
        }
        update_option('wbk_update_status', $update_status);
    }
    public static function run_update()
    {
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

        self::update_booking_status_v_5_1_15();
        self::update_existing_email_templates_v_5_1_15();
        self::generate_template_from_options_v_5_1_15();
        self::generate_default_templates_v_5_1_15();
        self::update_service_colors_v_5_1_18();
        self::merge_existing_service_to_en_v_5_1_18();
        self::update_default_templates_v_5_1_18();
    }

    static function update_4_3_0_1()
    {
        global $wpdb;
        if (self::is_update_required('update_4_3_0_1')) {
            $wpdb->query('ALTER TABLE ' . get_option('wbk_db_prefix', '') . 'wbk_services' . ' ROW_FORMAT=DYNAMIC');
            $wpdb->query('ALTER TABLE ' . get_option('wbk_db_prefix', '') . 'wbk_appointments' . ' ROW_FORMAT=DYNAMIC');

            self::set_update_as_complete('update_4_3_0_1');
        }
    }
    static function update_4_5_1()
    {
        global $wpdb;
        if (self::is_update_required('update_4_5_1')) {
            update_option('wbk_payment_item_name', __('#service_name on #appointment_day at #appointment_time', 'webba-booking-lite'));
            update_option('wbk_appointment_information', 'Appointment on #appointment_day #appointment_time');
            self::set_update_as_complete('update_4_5_1');
        }
    }
    static function update_5_0_11()
    {
        if (self::is_update_required('update_5_0_11')) {
            update_option('wbk_disable_security', 'true');

        }
    }
    static function update_5_0_0_static()
    {
        update_option('wbk_mode', 'webba5');
        update_option('wbk_date_format', get_option('date_format'));
        update_option('wbk_time_format', get_option('time_format'));
        update_option('wbk_start_of_week', get_option('start_of_week'));
        update_option('wbk_appointments_auto_lock_allow_unlock', 'disallow');
        update_option('wbk_allow_manage_by_link', 'yes');
        update_option('wbk_email_customer_book_multiple_mode', 'one');
        update_option('wbk_email_admin_book_multiple_mode', 'one');
        update_option('wbk_email_admin_cancel_multiple_mode', 'one');
        update_option('wbk_email_customer_cancel_multiple_mode', 'one');
        update_option('wbk_email_admin_cancel_multiple_mode', 'one');
        update_option('wbk_email_admin_cancel_multiple_mode', 'one');
    }
    static function update_5_0_37()
    {
        global $wpdb;
        if (self::is_update_required('update_5_0_37')) {
            $previous_proudct_id = get_option('wbk_woo_product_id', '');
            if (is_numeric($previous_proudct_id)) {
                $services_ids = WBK_Model_Utils::get_service_ids();
                foreach ($services_ids as $service_id) {
                    $service = new WBK_Service($service_id);
                    if (!$service->is_loaded()) {
                        continue;
                    }
                    if ($service->get_payment_methods() == '') {
                        continue;
                    }
                    $payment_methods = json_decode($service->get_payment_methods(), true);
                    if (is_array($payment_methods) && in_array('woocommerce', $payment_methods)) {
                        $service->set('woo_product', $previous_proudct_id);
                        $service->save();
                    }
                }
            }
            self::set_update_as_complete('update_5_0_37');
        }
    }
    static function update_5_0_44()
    {
        global $wpdb;
        if (self::is_update_required('update_5_0_44_1')) {
            $wpdb->query('ALTER TABLE ' . get_option('wbk_db_prefix', '') . 'wbk_services CHANGE `multi_mode_limit` `multi_mode_limit` INT UNSIGNED NULL DEFAULT NULL');
            $wpdb->query('ALTER TABLE ' . get_option('wbk_db_prefix', '') . 'wbk_services CHANGE `multi_mode_low_limit` `multi_mode_low_limit` INT UNSIGNED NULL DEFAULT NULL');

            self::set_update_as_complete('update_5_0_44_1');
        }

    }

    static function update_5_0_46()
    {
        global $wpdb;
        if (self::is_update_required('update_5_0_46')) {
            $default_value = array('complete_status', 'thankyou_message', 'complete_payment');
            $value = get_option('wbk_woo_complete_action', $default_value);
            if (is_array($value) && !in_array('complete_payment', $value)) {
                $value[] = 'complete_payment';
                update_option('wbk_woo_complete_action', $value);
            }
            self::set_update_as_complete('update_5_0_46');
        }

    }

    /**
     * Initialize automatic user creation and create booking customer role
     *
     * @return void
     */
    static function update_5_0_55(): void
    {
        if (!self::is_update_required('update_5_0_55')) {
            return;
        }

        if (!wbk_fs()->is__premium_only() || !wbk_fs()->can_use_premium_code()) {
            return;
        }

        $services = WBK_Model_Utils::get_services();

        if (count($services) > 0) {
            return;
        }

        update_option('wbk_create_user_on_booking', true);

        self::set_update_as_complete('update_5_0_55');
    }
    static function update_5_1_0()
    {
        global $wpdb;
        if (self::is_update_required('update_5_1_0')) {
            // update business hours format
            $table_name = get_option('wbk_db_prefix', '') . 'wbk_services';
            $new_column = 'business_hours';
            $source_column = 'business_hours_v4';

            $source_column_exists = $wpdb->get_results(
                $wpdb->prepare(
                    "SHOW COLUMNS FROM `$table_name` LIKE %s",
                    $source_column
                )
            );
            if (!empty($source_column_exists)) {
                $wpdb->query("UPDATE `$table_name` SET `$new_column` = `$source_column` WHERE `$new_column` IS NULL OR `$new_column` = ''");
            }
            $wpdb->query(" ALTER TABLE `$table_name` CHANGE `business_hours` `business_hours` MEDIUMTEXT");

            foreach (WBK_Model_Utils::get_service_ids() as $service_id) {
                $service = new WBK_Service($service_id);
                if (!$service->is_loaded()) {
                    continue;
                }
                $service->set('business_hours', WBK_Model_Utils::extract_bh_availability_from_v4($service->get('business_hours')));
                $service->save();
            }

            $prefix = get_option('wbk_db_prefix', '');

            // Process Google calendars table
            $cal_table = $prefix . 'wbk_gg_calendars';
            $cal_old = 'calendar_id';
            $cal_new = 'ggid';

            if ($wpdb->get_var("SHOW TABLES LIKE '$cal_table'") == $cal_table) {
                $new_exists = $wpdb->get_results("SHOW COLUMNS FROM $cal_table LIKE '$cal_new'");
                if (empty($new_exists)) {
                    $wpdb->query("ALTER TABLE $cal_table ADD COLUMN `$cal_new` VARCHAR(256)");
                }
                $old_exists = $wpdb->get_results("SHOW COLUMNS FROM $cal_table LIKE '$cal_old'");
                if (!empty($old_exists)) {
                    $wpdb->query("UPDATE $cal_table SET `$cal_new` = `$cal_old` WHERE `$cal_old` IS NOT NULL");
                }
            }

            // Process service categories table
            $cat_table = $prefix . 'wbk_service_categories';
            $cat_old = 'category_list';
            $cat_new = 'list';

            if ($wpdb->get_var("SHOW TABLES LIKE '$cat_table'") == $cat_table) {
                $new_exists = $wpdb->get_results("SHOW COLUMNS FROM $cat_table LIKE '$cat_new'");
                if (empty($new_exists)) {
                    $wpdb->query("ALTER TABLE $cat_table ADD COLUMN `$cat_new` VARCHAR(1024) NULL DEFAULT NULL");
                }
                $old_exists = $wpdb->get_results("SHOW COLUMNS FROM $cat_table LIKE '$cat_old'");
                if (!empty($old_exists)) {
                    $wpdb->query("UPDATE $cat_table SET `$cat_new` = `$cat_old` WHERE `$cat_old` IS NOT NULL");
                }
            }
            self::set_update_as_complete('update_5_1_0');
        }
    }
    static function update_5_1_2()
    {
        global $wpdb;
        if (self::is_update_required('update_5_1_2')) {
            $table_name = get_option('wbk_db_prefix', '') . 'wbk_services';
            $wpdb->query(" ALTER TABLE `$table_name` CHANGE `business_hours` `business_hours` MEDIUMTEXT");
            foreach (WBK_Model_Utils::get_service_ids() as $service_id) {
                $service = new WBK_Service($service_id);
                if (!$service->is_loaded()) {
                    continue;
                }
                if (strpos($service->get('business_hours'), 'dow_availability') !== false) {
                    $v4_res = WBK_Model_Utils::extract_bh_availability_from_v4($service->get('business_hours_v4'));
                    if (!$v4_res) {
                        $v4_res = '[]';
                    }
                    $service->set('business_hours', $v4_res);
                    $service->save();
                }
            }

        }
        self::set_update_as_complete('update_5_1_2');
    }
    static function update_5_1_3()
    {
        global $wpdb;
        if (self::is_update_required('update_5_1_3')) {
            foreach (WBK_Model_Utils::get_service_ids() as $service_id) {
                $service = new WBK_Service($service_id);
                if (!$service->is_loaded()) {
                    continue;
                }
                $bh = json_decode($service->get('business_hours'));
                if ($bh == false || is_null($bh)) {
                    $v4_res = WBK_Model_Utils::extract_bh_availability_from_v4($service->get('business_hours_v4'));
                    if (!$v4_res) {
                        $v4_res = '[]';
                    }
                    $service->set('business_hours', $v4_res);
                    $service->save();
                }
            }

        }
        self::set_update_as_complete('update_5_1_3');
    }

    static function update_5_1_5()
    {
        global $wpdb;
        if (self::is_update_required('update_5_1_5')) {
            foreach (WBK_Model_Utils::get_pricing_rules() as $id => $name) {
                $pricing_rule = new WBK_Pricing_Rule($id);
                if (!$pricing_rule->is_loaded() || $pricing_rule->get_type() != 'day_of_week_and_time') {
                    continue;
                }
                if (strpos($pricing_rule->get('day_time'), 'dow_availability') !== false) {
                    $v4_res = WBK_Model_Utils::extract_bh_availability_from_v4($pricing_rule->get('day_time'));
                    if (!$v4_res) {
                        $v4_res = '[]';
                    }
                    $pricing_rule->set('day_time', $v4_res);
                    $pricing_rule->save();
                }
            }
        }
        self::set_update_as_complete('update_5_1_5');
    }


    static function update_existing_email_templates_v_5_1_15()
    {
        global $wpdb;
        if (self::is_update_required('update_existing_email_templates_v_5_1_15')) {
            $template_data = WBK_Model_Utils::get_email_template_type_usage('notification_template');
            foreach ($template_data['email_template_ids'] as $email_template_id) {
                self::supplement_template_from_options($email_template_id, get_option('wbk_email_customer_book_subject', ''), ['customer'], 'booking_created_by_customer', $template_data['service_ids']);
            }

            $template_data = WBK_Model_Utils::get_email_template_type_usage('arrived_template');
            foreach ($template_data['email_template_ids'] as $email_template_id) {
                self::supplement_template_from_options($email_template_id, get_option('wbk_email_customer_arrived_subject', ''), ['customer'], 'booking_finished', $template_data['service_ids']);
            }

            $template_data = WBK_Model_Utils::get_email_template_type_usage('reminder_template');
            foreach ($template_data['email_template_ids'] as $email_template_id) {
                self::supplement_template_from_options($email_template_id, get_option('wbk_email_customer_daily_subject', ''), ['customer'], 'customer_reminder', $template_data['service_ids']);
            }

            $template_data = WBK_Model_Utils::get_email_template_type_usage('invoice_template');
            foreach ($template_data['email_template_ids'] as $email_template_id) {
                self::supplement_template_from_options($email_template_id, get_option('wbk_email_customer_invoice_subject', ''), ['customer'], 'booking_paid', $template_data['service_ids']);
            }

            $template_data = WBK_Model_Utils::get_email_template_type_usage('booking_changed_template');
            foreach ($template_data['email_template_ids'] as $email_template_id) {
                self::supplement_template_from_options($email_template_id, get_option('wbk_email_on_update_booking_subject', ''), ['customer'], 'booking_updated_by_admin', $template_data['service_ids']);
            }
        }
        self::set_update_as_complete('update_existing_email_templates_v_5_1_15');
    }
    static function supplement_template_from_options($template_id, $subject, $recipients = [], $trigger = '', $services = [])
    {
        $template = new WBK_Email_Template($template_id);
        if (!$template->is_loaded()) {
            return false;
        }
        $template->set('subject', $subject);

        if (!empty($recipients)) {
            $template->set('recipients', json_encode($recipients));
        }

        if (!empty($trigger)) {
            $template->set('type', $trigger);
        }

        if (!empty($services)) {
            $template->set('services', json_encode($services));
        }

        $template->set('enabled', 'yes');

        return $template->save();
    }

    static function get_option_template(): array
    {
        return [
            [
                'name' => 'Send booking confirmation email (to customer)',
                'key_subject' => 'wbk_email_customer_book_subject',
                'key_template' => 'wbk_email_customer_book_message',
                'key_enabled' => 'wbk_email_customer_book_status',
                'trigger' => 'booking_created_by_customer',
                'recipients' => ['customer'],
            ],
            [
                'name' => 'Send booking confirmation email (to customer)',
                'key_subject' => 'wbk_email_customer_manual_book_subject',
                'key_template' => 'wbk_email_customer_manual_book_message',
                'key_enabled' => 'wbk_email_customer_book_status',
                'trigger' => 'booking_created_by_admin',
                'recipients' => ['customer'],
            ],
            [
                'name' => 'Send booking confirmation email (to admin)',
                'key_subject' => 'wbk_email_admin_book_subject',
                'key_template' => 'wbk_email_admin_book_message',
                'key_enabled' => 'wbk_email_admin_book_status',
                'recipients' => ['admin'],
                'trigger' => 'booking_created_by_admin,booking_created_by_customer',
            ],
            [
                'name' => 'Send booking confirmation email (to other customers in the group booking)',
                'key_subject' => 'wbk_email_secondary_book_subject',
                'key_template' => 'wbk_email_secondary_book_message',
                'key_enabled' => 'wbk_email_secondary_book_status',
                'recipients' => ['group'],
                'trigger' => 'booking_created_by_admin,booking_created_by_customer',
            ],
            [
                'name' => 'Welcome email body',
                'key_subject' => 'wbk_user_welcome_email_subject',
                'key_template' => 'wbk_user_welcome_email_body',
                'key_enabled' => 'wbk_user_welcome_email_body',
                'recipients' => ['customer'],
                'trigger' => 'user_registered',
            ],
            [
                'name' => 'Send booking approval email (to customer)',
                'key_subject' => 'wbk_email_customer_approve_subject',
                'key_template' => 'wbk_email_customer_approve_message',
                'key_enabled' => 'wbk_email_customer_approve_status',
                'recipients' => ['customer'],
                'trigger' => 'booking_approved',
            ],
            [
                'name' => 'Send booking cancelation email (to admin)',
                'key_subject' => 'wbk_email_adimn_appointment_cancel_subject',
                'key_template' => 'wbk_email_adimn_appointment_cancel_message',
                'key_enabled' => 'wbk_email_adimn_appointment_cancel_status',
                'recipients' => ['admin'],
                'trigger' => 'booking_cancelled_by_customer,booking_cancelled_auto',
            ],
            [
                'name' => 'Send booking cancelation email (to customer)',
                'key_subject' => 'wbk_email_customer_appointment_cancel_subject',
                'key_template' => 'wbk_email_customer_appointment_cancel_message',
                'key_enabled' => 'wbk_email_customer_appointment_cancel_status',
                'recipients' => ['customer'],
                'trigger' => 'booking_cancelled_by_admin,booking_cancelled_by_customer,booking_cancelled_auto',
            ],
            [
                'name' => 'Notification subject (when booking changes)',
                'key_subject' => 'wbk_email_on_update_booking_subject',
                'key_template' => '',
                'key_enabled' => 'wbk_email_on_update_booking_subject',
                'recipients' => ['customer', 'admin'],
                'trigger' => 'booking_updated_by_admin,booking_updated_by_customer',
            ],
            [
                'name' => 'Send payment received email (to admin)',
                'key_subject' => 'wbk_email_admin_paymentrcvd_subject',
                'key_template' => 'wbk_email_admin_paymentrcvd_message',
                'key_enabled' => 'wbk_email_admin_paymentrcvd_status',
                'recipients' => ['admin'],
                'trigger' => 'booking_paid',
            ],
            [
                'name' => 'Send payment received email (to customer)',
                'key_subject' => 'wbk_email_customer_paymentrcvd_subject',
                'key_template' => 'wbk_email_customer_paymentrcvd_message',
                'key_enabled' => 'wbk_email_customer_paymentrcvd_status',
                'recipients' => ['customer'],
                'trigger' => 'booking_paid',
            ],
            [
                'name' => 'Send status "Arrived" email (to customer)',
                'key_subject' => 'wbk_email_customer_arrived_subject',
                'key_template' => 'wbk_email_customer_arrived_message',
                'key_enabled' => 'wbk_email_customer_arrived_status',
                'recipients' => ['customer'],
                'trigger' => 'booking_finished',
            ],
            [
                'name' => 'Send reminder email (to admin)',
                'key_subject' => 'wbk_email_admin_daily_subject',
                'key_template' => 'wbk_email_admin_daily_message',
                'key_enabled' => 'wbk_email_admin_daily_status',
                'recipients' => ['admin'],
                'trigger' => 'admin_reminder',
            ],
        ];
    }

    static function generate_template_from_options_v_5_1_15()
    {

        if (!self::is_update_required('generate_template_from_options_v_5_1_15')) {
            return;
        }

        $templates = self::get_option_template();
        $templates = self::filter_service_related_email_templates($templates);

        self::generate_email_templates($templates);

        self::set_update_as_complete('generate_template_from_options_v_5_1_15');
    }
    static function generate_default_templates_v_5_1_15(): void
    {
        if (!self::is_update_required('generate_default_templates_v_5_1_15')) {
            return;
        }

        $templates = [
            [
                'name' => __('After Booking is made by admin (to ADMIN)', 'webba-booking-lite'),
                'trigger' => 'booking_created_by_admin',
                'recipients' => ['admin'],
                'enabled' => false,
                'subject' => __('New Booking created for #service_name', 'webba-booking-lite'),
                'template' => __('Hello Admin,<br><br>A new booking has been created for #service_name in Webba:<br>#booking_order<br><br><strong>Details:</strong><br>Name: #customer_name<br>Phone: #customer_phone<br>Email: #customer_email<br>Comment: #customer_comment<br>Custom details: #customer_custom<br>No. of timeslots booked: #items_count<br>No. of items/places booked: #selected_count:<br>Total payment amount: #total_amount<br><br>Current status: #status<br>To change status to "approved", go here: #admin_approve_link<br><br>Thank you!', 'webba-booking-lite'),
            ],
            [
                'name' => __('After Booking is made by admin (to CUSTOMER)', 'webba-booking-lite'),
                'trigger' => 'booking_created_by_admin',
                'recipients' => ['customer'],
                'enabled' => true,
                'subject' => __('New Booking created for #service_name', 'webba-booking-lite'),
                'template' => __('Hello #customer_name<br><br>A new booking has been created for #service_name in Webba:<br>#booking_order<br><br><strong>Details:</strong><br>Name: #customer_name<br>Phone: #customer_phone<br>Email: #customer_email<br>Comment: #customer_comment<br>Custom details: #customer_custom<br>No. of timeslots booked: #items_count<br>No. of items/places booked: #selected_count:<br>Total payment amount: #total_amount<br><br>Your booking may need to be first approved by the administrator.<br>Current status: #status<br><br>Thank you!', 'webba-booking-lite'),
            ],
            [
                'name' => __('After Booking is made by customer (to CUSTOMER)', 'webba-booking-lite'),
                'trigger' => 'booking_created_by_customer',
                'recipients' => ['customer'],
                'enabled' => true,
                'subject' => __('Booking Confirmation for #service_name on #appointment_day', 'webba-booking-lite'),
                'template' => __('Hello #customer_name,<br><br>Thank you for booking #service_name! Here are your booking details:<br><br>#booking_order<br>Duration: #duration<br>Total payment amount: #total_amount<br><br>Your booking may need to be first approved by the administrator.<br>Current status: #status<br><br>To manage, reschedule or cancel your booking, go to your dashboard: #dashboard_page<br><br>If you have any questions, please contact us.<br><br>Thank you!', 'webba-booking-lite'),
            ],
            [
                'name' => __('After Booking status is "Approved" (to CUSTOMER)', 'webba-booking-lite'),
                'trigger' => 'booking_approved',
                'recipients' => ['customer'],
                'enabled' => false,
                'subject' => __('APPROVED: Your Booking for #service_name', 'webba-booking-lite'),
                'template' => __('Hello #customer_name,<br><br>Great news! Your booking has been approved:<br>#booking_order<br>Current status: #status<br><br>To manage, reschedule or cancel your booking, go to your dashboard: #dashboard_page<br><br>If you have any questions, please contact us.<br><br>We look forward to serving you!', 'webba-booking-lite'),
            ],
            [
                'name' => __('After Booking cancelled by admin (to CUSTOMER)', 'webba-booking-lite'),
                'trigger' => 'booking_cancelled_by_admin',
                'recipients' => ['customer'],
                'enabled' => true,
                'subject' => __('CANCELLED: Booking for #service_name on #appointment_day', 'webba-booking-lite'),
                'template' => __('Hello #customer_name,<br><br>Admin has cancelled this booking:<br><strong>Booking:</strong> #booking_order<br><br>If you believe it\'s a mistake, please contact us.', 'webba-booking-lite'),
            ],
            [
                'name' => __('After Booking cancelled by customer (to CUSTOMER)', 'webba-booking-lite'),
                'trigger' => 'booking_cancelled_by_customer',
                'recipients' => ['customer'],
                'enabled' => true,
                'subject' => __('CANCELLED: Your Booking for #service_name', 'webba-booking-lite'),
                'template' => __('Hello #customer_name,<br><br>You have cancelled the following booking:<br>#booking_order<br>Current status: #status<br><br>If you did it by mistake, please contact us.', 'webba-booking-lite'),
            ],
            [
                'name' => __('After Booking cancelled by customer (to ADMIN)', 'webba-booking-lite'),
                'trigger' => 'booking_cancelled_by_customer',
                'recipients' => ['admin'],
                'enabled' => true,
                'subject' => __('CANCELLED: #customer_name booking for #service_name on #appointment_day', 'webba-booking-lite'),
                'template' => __('Hello Admin,<br><br>#customer_name has cancelled their booking:<br>#booking_order<br><br>If you believe it\'s a mistake, log into the Webba\'s dashboard and change booking status.', 'webba-booking-lite'),
            ],
            [
                'name' => __('After Booking cancelled automatically (to CUSTOMER)', 'webba-booking-lite'),
                'trigger' => 'booking_cancelled_auto',
                'recipients' => ['customer'],
                'enabled' => false,
                'subject' => __('Booking Cancelled for #service_name', 'webba-booking-lite'),
                'template' => __('Hello #customer_name,<br><br>The following booking has been cancelled automatically:<br>#booking_order<br>Current status: #status<br><br>If you believe it\'s a mistake, please contact us.', 'webba-booking-lite'),
            ],
            [
                'name' => __('After Booking is updated by admin (to CUSTOMER)', 'webba-booking-lite'),
                'trigger' => 'booking_updated_by_admin',
                'recipients' => ['customer'],
                'enabled' => false,
                'subject' => __('UPDATED: Your Booking for #service_name', 'webba-booking-lite'),
                'template' => __('Hello #customer_name,<br><br>Your booking has been updated:<br>#booking_order<br>Current status: #status<br><br>To manage, reschedule or cancel your booking, go to your dashboard: #dashboard_page<br><br>If you have any questions, please contact us.<br><br>We look forward to serving you!', 'webba-booking-lite'),
            ],
            [
                'name' => __('After Booking is updated by customer (to CUSTOMER)', 'webba-booking-lite'),
                'trigger' => 'booking_updated_by_customer',
                'recipients' => ['customer'],
                'enabled' => false,
                'subject' => __('UPDATED: Your Booking for #service_name', 'webba-booking-lite'),
                'template' => __('Hello #customer_name,<br><br>Your booking has been updated:<br>#booking_order<br>Current status: #status<br><br>To manage, reschedule or cancel your booking, go to your dashboard: #dashboard_page<br><br>If you have any questions, please contact us.<br><br>We look forward to serving you!', 'webba-booking-lite'),
            ],
            [
                'name' => __('After Booking is updated by customer (to ADMIN)', 'webba-booking-lite'),
                'trigger' => 'booking_updated_by_customer',
                'recipients' => ['admin'],
                'enabled' => true,
                'subject' => __('UPDATED: #customer_name updated booking for #service_name', 'webba-booking-lite'),
                'template' => __('Hello,<br><br>#customer_name has updated their booking:<br>#booking_order<br><br><strong>Details:</strong><br>Name: #customer_name<br>Phone: #customer_phone<br>Email: #customer_email<br>Comment: #customer_comment<br>Custom details: #customer_custom<br>No. of timeslots booked: #items_count<br>No. of items/places booked: #selected_count:<br>Total payment amount: #total_amount<br>Current status: #status<br><br>Please check the updated details.', 'webba-booking-lite'),
            ],
            [
                'name' => __('After Booking is paid email (to ADMIN)', 'webba-booking-lite'),
                'trigger' => 'booking_paid',
                'recipients' => ['admin'],
                'enabled' => true,
                'subject' => __('PAID: #customer_name paid for #service_name', 'webba-booking-lite'),
                'template' => __('Hello,<br><br>The payment of #total_amount for the booking below has been received:<br>#booking_order<br><br><strong>Details:</strong><br>Name: #customer_name<br>Phone: #customer_phone<br>Email: #customer_email<br>Comment: #customer_comment<br>Custom details: #customer_custom<br>No. of timeslots booked: #items_count<br>No. of items/places booked: #selected_count:<br>Total payment amount: #total_amount<br>Current status: #status<br><br>Thank you!', 'webba-booking-lite'),
            ],
            [
                'name' => __('After Booking is paid email (to CUSTOMER)', 'webba-booking-lite'),
                'trigger' => 'booking_paid',
                'recipients' => ['customer'],
                'enabled' => false,
                'subject' => __('PAID: Your payment for #service_name is successful', 'webba-booking-lite'),
                'template' => __('Hello #customer_name,<br><br>Your payment of #total_amount for the booking below has been received:<br>#booking_order<br><br>Thank you!', 'webba-booking-lite'),
            ],
            [
                'name' => __('Booking reminder email (to ADMIN)', 'webba-booking-lite'),
                'trigger' => 'admin_reminder',
                'recipients' => ['admin'],
                'enabled' => true,
                'subject' => __('REMINDER: Upcoming Booking for #service_name', 'webba-booking-lite'),
                'template' => __('Hello,<br><br>This is an automatic reminder about the upcoming booking:<br>#booking_order<br><br><strong>Details:</strong><br>Name: #customer_name<br>Phone: #customer_phone<br>Email: #customer_email<br>Comment: #customer_comment<br>Custom details: #customer_custom<br>No. of timeslots booked: #items_count<br>No. of items/places booked: #selected_count:<br>Total payment amount: #total_amount<br>Current status: #status<br><br>Please prepare accordingly.', 'webba-booking-lite'),
            ],
            [
                'name' => __('Booking reminder email (to CUSTOMER)', 'webba-booking-lite'),
                'trigger' => 'customer_reminder',
                'recipients' => ['customer'],
                'enabled' => true,
                'subject' => __('REMINDER: Your Upcoming Booking for #service_name', 'webba-booking-lite'),
                'template' => __('Hello #customer_name,<br><br>This is a reminder of your upcoming booking:<br>#booking_order<br><br><strong>Details:</strong><br>Name: #customer_name<br>Phone: #customer_phone<br>Email: #customer_email<br>Comment: #customer_comment<br>Custom details: #customer_custom<br>No. of timeslots booked: #items_count<br>No. of items/places booked: #selected_count:<br>Total payment amount: #total_amount<br>Current status: #status<br><br>We look forward to serving you!', 'webba-booking-lite'),
            ],
            [
                'name' => __('Your Account details email (to CUSTOMER)', 'webba-booking-lite'),
                'trigger' => 'user_registered',
                'recipients' => ['customer'],
                'enabled' => true,
                'subject' => __('Welcome, #customer_name! Here is how to manage your booking.', 'webba-booking-lite'),
                'template' => __('Hello #customer_name,<br><br>You can now manage your bookings and profile anytime by going here: #dashboard_page<br><br>#account_details<br><br>If you have any questions, please contact us.<br><br>Thank you!', 'webba-booking-lite'),
            ],
            [
                'name' => __('After booking is finished: Thank you email (to CUSTOMER)', 'webba-booking-lite'),
                'trigger' => 'booking_finished',
                'recipients' => ['customer'],
                'enabled' => false,
                'subject' => __('THANK YOU #customer_name!', 'webba-booking-lite'),
                'template' => __('Hello #customer_name,<br><br>Thank you for using our service #service_name!<br><br>We hope you enjoyed it and look forward to seeing you again.', 'webba-booking-lite'),
            ],
        ];

        $templates = array_map(function ($item) {
            $item['default'] = true;
            return $item;
        }, $templates);

        global $wpdb;

        $existing_templates = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT name FROM {$wpdb->prefix}wbk_email_templates WHERE is_default='yes'"
            ),
            ARRAY_N
        );

        $existing_templates = array_map(function ($template) {
            return $template[0];
        }, $existing_templates);

        $templates = array_filter($templates, function ($template) use ($existing_templates) {
            return !in_array($template['name'], $existing_templates);
        });

        self::generate_email_templates($templates);

        self::set_update_as_complete('generate_default_templates_v_5_1_15');
    }

    static function filter_service_related_email_templates(array $templates): array
    {
        // new trigger name => old trigger name
        $old_triggers = [
            'booking_created_by_admin' => 'notification_template',
            'booking_created_by_customer' => 'notification_template',
            'customer_reminder' => 'reminder_template',
            'booking_updated_by_admin' => 'booking_changed_template',
            'booking_finished' => 'arrived_template'
        ];

        // get all services
        $services = array_map(function ($id) {
            return new WBK_Service($id);
        }, WBK_Model_Utils::get_service_ids());

        // filter templates
        return array_map(function ($template) use ($services, $old_triggers) {
            $template['services'] = [];

            // filter services
            $allowed_services = array_filter($services, function ($service) use ($template, $old_triggers) {
                $triggers = explode(',', $template['trigger']);

                foreach ($triggers as $trigger) {
                    if (!isset($old_triggers[$trigger])) {
                        return true;
                    }

                    $service_trigger = $service->get($old_triggers[$trigger]);
                    if (empty($service_trigger) || $service_trigger === null || $service_trigger == false || $service_trigger == 0) {
                        return true;
                    }
                }

                return false;
            });

            foreach ($allowed_services as $service) {
                $template['services'][] = $service->get_id();
            }

            return $template;
        }, $templates);
    }

    static function generate_email_templates(array $templates): void
    {
        foreach ($templates as $template) {
            $triggers = explode(',', $template['trigger']);

            foreach ($triggers as $trigger) {
                $enabled = isset($template['key_enabled']) ? get_option($template['key_enabled'], null) : null;

                if (empty($enabled) || $enabled === null || $enabled == false) {
                    if (isset($template['key_enabled'])) {
                        continue;
                    }
                }

                $email = new WBK_Email_Template(null);
                $email->set('name', $template['name']);

                if (isset($template['key_subject'])) {
                    $email->set('subject', get_option($template['key_subject'], ''));
                } elseif (isset($template['subject'])) {
                    $email->set('subject', $template['subject']);
                }

                if (isset($template['key_template'])) {
                    $email->set('template', get_option($template['key_template'], ''));
                } elseif (isset($template['template'])) {
                    $email->set('template', $template['template']);
                }

                if (isset($template['default']) && $template['default'] === true) {
                    $email->set('is_default', 'yes');
                }

                if (isset($template['enabled'])) {
                    $email->set('enabled', $template['enabled'] === true ? 'yes' : '');
                }

                if (isset($template['services'])) {
                    $email->set('services', json_encode($template['services']));
                }

                if ($enabled) {
                    $email->set('enabled', 'yes');
                }

                if (isset($template['recipients'])) {
                    $email->set('recipients', json_encode($template['recipients']));
                }

                $email->set('type', $trigger);
                $email->save();
            }
        }
    }
    static function create_ht_file()
    {
        $path = WP_WEBBA_BOOKING__PLUGIN_DIR . DIRECTORY_SEPARATOR . 'export' . DIRECTORY_SEPARATOR . '.htaccess';
        $content = "RewriteEngine On" . "\r\n";
        $content .= "RewriteCond %{HTTP_REFERER} !^" . get_admin_url() . 'admin.php\?page\=wbk-appointments' . '.* [NC]' . "\r\n";
        $content .= "RewriteRule .* - [F]";
        if (!file_exists($path)) {
            file_put_contents($path, $content);
        }
    }
    static function update_booking_status_v_5_1_15()
    {
        if (!self::is_update_required('update_booking_status_v_5_1_15')) {
            return;
        }
        global $wpdb;
        $table_name = get_option('wbk_db_prefix', '') . 'wbk_appointments';
        $wpdb->query("
            UPDATE `$table_name`
            SET `status` = 'approved'
            WHERE `status` IN (
                'paid',
                'paid_approved',
                'woocommerce',
                'added_by_admin_not_paid',
                'added_by_admin_paid'
            )
        ");
        $wpdb->query(
            "UPDATE " . $table_name . " SET amount_paid = moment_price"
        );
        self::set_update_as_complete('update_booking_status_v_5_1_15');
    }

    /**
     * Update color for services which have empty values before `color` column exist
     *
     * @return void
     */
    public static function update_service_colors_v_5_1_18(): void
    {
        if (!self::is_update_required('update_service_colors_v_5_1_18')) {
            return;
        }

        global $wpdb;
        $colors = [];
        $services = $wpdb->get_results(
            $wpdb->prepare("SELECT id FROM " . get_option('wbk_db_prefix', '') . "wbk_services WHERE color IS NULL OR color=''"),
            ARRAY_N
        );

        if (empty($services)) {
            self::set_update_as_complete('update_service_colors_v_5_1_18');
            return;
        }

        foreach ($services as $service) {
            $color = WBK_Format_Utils::generate_random_color($colors);

            $wpdb->update(
                get_option('wbk_db_prefix', '') . 'wbk_services',
                ['color' => $color],
                ['id' => $service[0]]
            );
        }

        self::set_update_as_complete('update_service_colors_v_5_1_18');
    }

    /**
     * Assign services for the template created from options, which have missed the service assignment in v5.1.16
     *
     * @return void
     */
    public static function merge_existing_service_to_en_v_5_1_18(): void
    {
        if (!self::is_update_required('merge_existing_service_to_en_v_5_1_18')) {
            return;
        }

        global $wpdb;
        $templates = self::get_option_template();
        $templates = self::filter_service_related_email_templates($templates);

        $templates_obj = $wpdb->get_results(
            "SELECT * FROM " . get_option('wbk_db_prefix', '') . "wbk_email_templates
            WHERE (`name`, `type`, `recipients`) IN (
                " . implode(
                ',',
                array_map(
                    function ($template) {
                        return "('" . esc_sql($template['name']) . "', '" . esc_sql($template['trigger']) . "', '" . esc_sql(json_encode($template['recipients'])) . "')";
                    },
                    $templates
                )
            ) . "
            )",
            ARRAY_A
        );

        foreach ($templates_obj as $template_obj) {
            $existing_services = !empty($template_obj['services']) ? json_decode($template_obj['services']) : [];
            $template = array_filter($templates, function ($template) use ($template_obj) {
                return $template['name'] == $template_obj['name'] && $template['trigger'] == $template_obj['type'] && json_encode($template['recipients']) == $template_obj['recipients'];
            });


            if (!empty($template)) {
                $template = array_values($template)[0];
                $template['services'] = array_unique(array_merge($template['services'], $existing_services));

                $wpdb->update(
                    get_option('wbk_db_prefix', '') . "wbk_email_templates",
                    [
                        'services' => json_encode($template['services'])
                    ],
                    [
                        'id' => $template_obj['id'],
                    ]
                );
            }
        }

        self::set_update_as_complete('merge_existing_service_to_en_v_5_1_18');
    }
    /**
     * Improved internal names for default templates
     * Added new default template for admin
     *
     * @return void
     */
    public static function update_default_templates_v_5_1_18(): void
    {
        if (!self::is_update_required('update_default_templates_v_5_1_18')) {
            return;
        }

        // added new template
        $templates = [
            [
                'name' => 'Booking confirmation to admin (booking made by customer)',
                'trigger' => 'booking_created_by_customer',
                'recipients' => ['admin'],
                'enabled' => true,
                'subject' => 'New Booking for #service_name on #appointment_day',
                'template' => __('Hello Admin,<br><br>A new booking has been created for <strong>#service_name</strong> in Webba:<br>#booking_order<br><br><strong>Details:</strong><br>Name: #customer_name<br>Phone: #customer_phone<br>Email: #customer_email<br>Comment: #customer_comment<br>Custom details: #customer_custom<br>No. of timeslots booked: #items_count<br>No. of items/places booked: #selected_count:<br>Total payment amount: #total_amount<br><br>Current status: #status<br>To change status to "<strong>approved</strong>", go here: #admin_approve_link<br><br>Thank you!', 'webba-booking-lite'),
                'default' => true
            ]
        ];

        global $wpdb;
        $template_exists = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$wpdb->prefix}wbk_email_templates WHERE name = %s",
                $templates[0]['name']
            )
        );

        if (empty($template_exists)) {
            self::generate_email_templates($templates);
        }

        // name update for existing default templates
        $templates = [
            [
                'name' => __('Booking confirmation to admin (booking made by admin)', 'webba-booking-lite'),
                'old_name' => __('After Booking is made by admin (to ADMIN)', 'webba-booking-lite'),
                'trigger' => 'booking_created_by_admin',
            ],
            [
                'name' => __('Booking confirmation to customer (booking made by admin)', 'webba-booking-lite'),
                'old_name' => __('After Booking is made by admin (to CUSTOMER)', 'webba-booking-lite'),
                'trigger' => 'booking_created_by_admin',
            ],
            [
                'name' => __('Booking confirmation to customer (booking made by customer)', 'webba-booking-lite'),
                'old_name' => __('After Booking is made by customer (to CUSTOMER)', 'webba-booking-lite'),
                'trigger' => 'booking_created_by_customer',
            ],
            [
                'name' => __('"Booking is approved" (to customer)', 'webba-booking-lite'),
                'old_name' => __('After Booking status is "Approved" (to CUSTOMER)', 'webba-booking-lite'),
                'trigger' => 'booking_approved',
            ],
            [
                'name' => __('"Booking is cancelled" (by admin to customer)', 'webba-booking-lite'),
                'old_name' => __('After Booking cancelled by admin (to CUSTOMER)', 'webba-booking-lite'),
                'trigger' => 'booking_cancelled_by_admin',
            ],
            [
                'name' => __('"Booking is cancelled" (by customer to customer)', 'webba-booking-lite'),
                'old_name' => __('After Booking cancelled by customer (to CUSTOMER)', 'webba-booking-lite'),
                'trigger' => 'booking_cancelled_by_customer',
            ],
            [
                'name' => __('"Booking is cancelled" (by customer to admin)', 'webba-booking-lite'),
                'old_name' => __('After Booking cancelled by customer (to ADMIN)', 'webba-booking-lite'),
                'trigger' => 'booking_cancelled_by_customer',
            ],
            [
                'name' => __('"Booking is cancelled" automatically (to customer)', 'webba-booking-lite'),
                'old_name' => __('After Booking cancelled automatically (to CUSTOMER)', 'webba-booking-lite'),
                'trigger' => 'booking_cancelled_auto',
            ],
            [
                'name' => __('Booking updated by admin (to customer)', 'webba-booking-lite'),
                'old_name' => __('After Booking is updated by admin (to CUSTOMER)', 'webba-booking-lite'),
                'trigger' => 'booking_updated_by_admin',
            ],
            [
                'name' => __('Booking updated by customer (to customer)', 'webba-booking-lite'),
                'old_name' => __('After Booking is updated by customer (to CUSTOMER)', 'webba-booking-lite'),
                'trigger' => 'booking_updated_by_customer',
            ],
            [
                'name' => __('Booking updated by customer (to admin)', 'webba-booking-lite'),
                'old_name' => __('After Booking is updated by customer (to ADMIN)', 'webba-booking-lite'),
                'trigger' => 'booking_updated_by_customer',
            ],
            [
                'name' => __('Booking has been paid (to admin)', 'webba-booking-lite'),
                'old_name' => __('After Booking is paid email (to ADMIN)', 'webba-booking-lite'),
                'trigger' => 'booking_paid',
            ],
            [
                'name' => __('Booking has been paid (to customer)', 'webba-booking-lite'),
                'old_name' => __('After Booking is paid email (to CUSTOMER)', 'webba-booking-lite'),
                'trigger' => 'booking_paid',
            ],
            [
                'name' => __('Booking reminder email (to admin)', 'webba-booking-lite'),
                'old_name' => __('Booking reminder email (to ADMIN)', 'webba-booking-lite'),
                'trigger' => 'admin_reminder',
            ],
            [
                'name' => __('Booking reminder email (to customer)', 'webba-booking-lite'),
                'old_name' => __('Booking reminder email (to CUSTOMER)', 'webba-booking-lite'),
                'trigger' => 'customer_reminder',
            ],
            [
                'name' => __('Account details for managing booking (customer)', 'webba-booking-lite'),
                'old_name' => __('Your Account details email (to CUSTOMER)', 'webba-booking-lite'),
                'trigger' => 'user_registered',
            ],
            [
                'name' => __('Thank you email after booking is finished', 'webba-booking-lite'),
                'old_name' => __('After booking is finished: Thank you email (to CUSTOMER)', 'webba-booking-lite'),
                'trigger' => 'booking_finished',
            ],
        ];

        foreach ($templates as $template) {
            $wpdb->query(
                $wpdb->prepare(
                    "UPDATE {$wpdb->prefix}wbk_email_templates SET name = %s WHERE name = %s AND type = %s AND is_default='yes'",
                    $template['name'],
                    $template['old_name'],
                    $template['trigger']
                )
            );
        }

        self::set_update_as_complete('update_default_templates_v_5_1_18');
    }


}
?>