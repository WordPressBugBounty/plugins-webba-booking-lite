<?php
// check if accessed directly
if (!defined('ABSPATH')) {
    exit();
}

class WBK_Backend_Schedule
{
    public function __construct()
    {
        // add ajax actions
        add_action('wp_ajax_wbk_schedule_load', [$this, 'schedule_load']);
        add_action('wp_ajax_wbk_schedule_load_fullcalendar', [
            $this,
            'schedule_load_fullcalendar',
        ]);
        add_action('wp_ajax_wbk_lock_day', [$this, 'ajax_lock_day']);
        add_action('wp_ajax_wbk_unlock_day', [$this, 'ajax_unlock_day']);
        add_action('wp_ajax_wbk_lock_time', [$this, 'ajax_lock_time']);
        add_action('wp_ajax_wbk_unlock_time', [$this, 'ajax_unlock_time']);
        add_action('wp_ajax_wbk_prepare_appointment', [
            $this,
            'prepare_appointment',
        ]);
        add_action('wp_ajax_wbk_add_appointment_backend', [
            $this,
            'add_appointment_backend',
        ]);
        add_action('wp_ajax_wbk_view_appointment', [$this, 'view_appointment']);
        add_action('wp_ajax_wbk_create_multiple_bookings', [
            $this,
            'wbk_create_multiple_bookings',
        ]);
        add_action('wp_ajax_wbk_delete_appointment', [
            $this,
            'wbk_delete_appointment',
        ]);
    }

    public function wbk_create_multiple_bookings()
    {
        if (!wp_verify_nonce($_POST['nonce'], 'wbkb_nonce')) {
            wp_die();
            return;
        }

        global $wpdb;
        date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
        $html = '';
        $offset = 0;
        $service_id = $_POST['service_id'];
        $date = strtotime($_POST['date']);

        $name = $_POST['name'];
        $email = $_POST['email'];
        $phone = $_POST['phone'];
        $desc = $_POST['desc'];
        $quantity = $_POST['quantity'];
        $times = explode(',', $_POST['times']);
        $booking_status = $_POST['status'];

        $appointment_ids = [];
        foreach ($times as $time) {
            $bookin_data = [];
            if (
                !WBK_Validator::validateId(
                    $service_id,
                    'wbk_services' /* passed newdb */
                )
            ) {
                echo 'Error -1';
                date_default_timezone_set('UTC');
                die();
                return;
            }

            $day = strtotime(date('Y-m-d', $time) . ' 00:00:00');
            if (
                !WBK_Validator::validateId(
                    $service_id,
                    'wbk_services' /* passed newdb */
                )
            ) {
                echo 'Error -1';
                date_default_timezone_set('UTC');
                die();
                return;
            }
            $service = new WBK_Service_deprecated();
            if (!$service->setId($service_id)) {
                echo 'Error -6';
                date_default_timezone_set('UTC');
                die();
                return;
            }
            if (!$service->load()) {
                echo 'Error -6';
                date_default_timezone_set('UTC');
                die();
                return;
            }
            // to test
            $count = $wpdb->get_var(
                $wpdb->prepare(
                    'SELECT COUNT(*) FROM ' .
                    get_option('wbk_db_prefix', '') .
                    'wbk_appointments where service_id = %d and time = %d and ' . WBK_Model_Utils::get_not_canclled_sql(),
                    $service_id,
                    $time
                )
            );
            if ($count > 0 && $service->getQuantity() == 1) {
                echo __('Overbooking error', 'webba-booking-lite');
                date_default_timezone_set('UTC');
                die();
                return;
            }

            if (!array_key_exists($booking_status, WBK_Model_Utils::get_booking_status_list())) {
                echo 'Status error';
                date_default_timezone_set('UTC');
                wp_die();
                return;
            }
            $duration = $service->getDuration();

            $bookin_data['name'] = $name;
            $bookin_data['email'] = $email;
            $bookin_data['phone'] = $phone;
            $bookin_data['time'] = $time;
            $bookin_data['service_id'] = $service_id;
            $bookin_data['duration'] = $duration;
            $bookin_data['description'] = $desc;
            $bookin_data['quantity'] = $quantity;
            $bookin_data['service_category'] = 0;
            $bookin_data['time_offset'] = 0;

            $booking_factory = new WBK_Booking_Factory();
            $status = $booking_factory->build_from_array($bookin_data);


            if ($status[0] == true) {
                $appointment_ids[] = $status[1];
                $booking = new WBK_Booking($status[1]);
                $booking->set('status', $booking_status);
                $booking->save();

            }
        }
        $booking_factory = new WBK_Booking_Factory();
        $booking_factory->post_production($appointment_ids);

        $html =
            __('Appointments added:', 'webba-booking-lite') .
            ' ' .
            count($appointment_ids);
        date_default_timezone_set('UTC');
        echo $html;
        wp_die();
        return;
    }

    public function wbk_delete_appointment()
    {
        if (!wp_verify_nonce($_POST['nonce'], 'wbkb_nonce')) {
            wp_die();
            return;
        }
        global $wpdb;
        global $current_user;
        date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
        $service_id = $_POST['service_id'];
        if (!is_numeric($service_id)) {
            echo '-1';
            date_default_timezone_set('UTC');
            wp_die();
            return;
        }
        $booking_id = $_POST['appointment_id'];
        if (!is_numeric($booking_id)) {
            echo '-1';
            date_default_timezone_set('UTC');
            wp_die();
            return;
        }
        $booking = new WBK_Booking($booking_id);
        if (!$booking->is_loaded()) {
            echo '-1';
            date_default_timezone_set('UTC');
            wp_die();
            return;
        }
        $day = $booking->get_day();
        // check access
        if (!current_user_can('manage_options')) {
            if (!WBK_Validator::check_access_to_service($service_id)) {
                echo '-1';
                date_default_timezone_set('UTC');
                wp_die();
                return;
            }
        }

        $bf = new WBK_Booking_Factory();
        $bf->destroy($booking_id, 'administrator', false);

        date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
        $sp = new WBK_Schedule_Processor();
        $time_slots = $sp->get_time_slots_by_day($day, $service_id, [
            'ignore_preparation' => true,
            'calculate_availability' => true,
        ]);

        $html_schedule = WBK_Renderer::load_template(
            'backend/schedule_day_timeslots',
            [$time_slots, $service_id, $sp->get_locked_time_slots($service_id)],
            false
        );
        date_default_timezone_set('UTC');

        $resarray = ['day' => $html_schedule];
        date_default_timezone_set('UTC');
        echo json_encode($resarray);
        wp_die();
    }
    public function wbk_delete_appointment_fullcalendar()
    {
        if (!wp_verify_nonce($_POST['nonce'], 'wbkb_nonce')) {
            wp_die();
            return;
        }
        date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
        $service_id = $_POST['service_id'];
        if (!is_numeric($service_id)) {
            echo '-1';
            date_default_timezone_set('UTC');
            wp_die();
            return;
        }
        $booking_id = $_POST['appointment_id'];
        if (!is_numeric($booking_id)) {
            echo '-1';
            date_default_timezone_set('UTC');
            wp_die();
            return;
        }
        $booking = new WBK_Booking($booking_id);
        if (!$booking->is_loaded()) {
            echo '-1';
            date_default_timezone_set('UTC');
            wp_die();
            return;
        }
        $day = $booking->get_day();
        $time = $_POST['time'];
        if (!is_numeric($time)) {
            echo '-1';
            date_default_timezone_set('UTC');
            wp_die();
            return;
        }
        // check access
        if (!current_user_can('manage_options')) {
            if (!WBK_Validator::check_access_to_service($service_id)) {
                echo '-1';
                date_default_timezone_set('UTC');
                wp_die();
                return;
            }
        }

        $bf = new WBK_Booking_Factory();
        $bf->destroy($booking_id, 'administrator', false);

        date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
        $sp = new WBK_Schedule_Processor();
        $time_slots = $sp->get_time_slots_by_day($day, $service_id, [
            'ignore_preparation' => true,
            'calculate_availability' => true,
        ]);

        $html_schedule = '';
        foreach ($time_slots as $key => $time_slot) {
            if (!($time_slot->start == (int) $time)) {
                continue;
            }
            $html_schedule = WBK_Renderer::load_template(
                'backend/schedule_day_timeslot',
                [
                    $time_slot,
                    $service_id,
                    $sp->get_locked_time_slots($service_id),
                ],
                false
            );
        }

        date_default_timezone_set('UTC');

        $resarray = ['day' => $html_schedule];
        date_default_timezone_set('UTC');
        echo json_encode($resarray);
        wp_die();
    }

    public function view_appointment()
    {
        if (!wp_verify_nonce($_POST['nonce'], 'wbkb_nonce')) {
            wp_die();
            return;
        }
        global $wpdb;
        global $current_user;
        date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
        $service_id = $_POST['service_id'];
        $booking_id = $_POST['appointment_id'];
        // check access
        if (!current_user_can('manage_options')) {
            if (!WBK_Validator::check_access_to_service($service_id)) {
                echo '-1';
                date_default_timezone_set('UTC');
                die();
                return;
            }
        }
        $booking = new WBK_Booking($booking_id);
        if (!$booking->is_loaded()) {
            echo '-2';
            date_default_timezone_set('UTC');
            die();
            return;
        }

        $name = esc_html(
            WBK_Model_Utils::backend_customer_name_processing(
                $booking_id,
                $booking->get_name()
            )
        );
        $desc = esc_html($booking->get('description'));
        $email = esc_html($booking->get('email'));
        $phone = esc_html($booking->get('phone'));
        $time = esc_html($booking->get_start());
        $quantity = esc_html($booking->get_quantity());
        $extra = $booking->get('extra');

        $extra = json_decode($extra);
        $extra_data = '';

        $date_format = WBK_Date_Time_Utils::get_date_format();
        $time_format = WBK_Date_Time_Utils::get_time_format();
        $time_string =
            wp_date(
                $date_format,
                $time,
                new DateTimeZone(date_default_timezone_get())
            ) .
            ' ' .
            wp_date(
                $time_format,
                $time,
                new DateTimeZone(date_default_timezone_get())
            );
        $resarray = [
            'name' => $name,
            'desc' => $desc,
            'email' => $email,
            'phone' => $phone,
            'time' => $time_string,
            'extra' => $extra,
            'quantity' => $quantity,
        ];
        echo json_encode($resarray);
        date_default_timezone_set('UTC');
        die();
        return;
    }
    public function view_appointment_fullcalendar()
    {
        if (!wp_verify_nonce($_POST['nonce'], 'wbkb_nonce')) {
            wp_die();
            return;
        }
        global $wpdb;
        global $current_user;
        date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
        $service_id = $_POST['service_id'];
        $booking_id = $_POST['appointment_id'];
        // check access
        if (!current_user_can('manage_options')) {
            if (!WBK_Validator::check_access_to_service($service_id)) {
                echo '-1';
                date_default_timezone_set('UTC');
                die();
                return;
            }
        }
        $booking = new WBK_Booking($booking_id);
        if (!$booking->is_loaded()) {
            echo '-2';
            date_default_timezone_set('UTC');
            die();
            return;
        }

        $name = esc_html(
            WBK_Model_Utils::backend_customer_name_processing(
                $booking_id,
                $booking->get_name()
            )
        );
        $desc = esc_html($booking->get('description'));
        $email = esc_html($booking->get('email'));
        $phone = esc_html($booking->get('phone'));
        $time = esc_html($booking->get_start());
        $quantity = esc_html($booking->get_quantity());
        $extra = $booking->get('extra');

        $extra = json_decode($extra);
        $extra_data = '';

        $date_format = WBK_Date_Time_Utils::get_date_format();
        $time_format = WBK_Date_Time_Utils::get_time_format();
        $time_string =
            wp_date(
                $date_format,
                $time,
                new DateTimeZone(date_default_timezone_get())
            ) .
            ' ' .
            wp_date(
                $time_format,
                $time,
                new DateTimeZone(date_default_timezone_get())
            );
        $resarray = [
            'name' => $name,
            'desc' => $desc,
            'email' => $email,
            'phone' => $phone,
            'time' => $time_string,
            'timestamp' => $time,
            'extra' => $extra,
            'quantity' => $quantity,
        ];
        echo json_encode($resarray);
        date_default_timezone_set('UTC');
        die();
        return;
    }

    public function add_appointment_backend()
    {
        global $wpdb;
        if (!wp_verify_nonce($_POST['nonce'], 'wbkb_nonce')) {
            wp_die();
            return;
        }
        date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
        $name = $_POST['name'];
        $email = $_POST['email'];
        $phone = $_POST['phone'];
        $time = $_POST['time'];
        $desc = $_POST['desc'];
        $extra = stripcslashes($_POST['extra']);
        $quantity = $_POST['quantity'];
        $service_id = $_POST['service_id'];

        $day = strtotime(date('Y-m-d', $time) . ' 00:00:00');

        $service = new WBK_Service($service_id);
        if (!$service->is_loaded()) {
            wp_die();
            return;
        }

        $sp = new WBK_Schedule_Processor();
        $day = strtotime('today midnight', $time);
        $sp->get_time_slots_by_day($day, $service_id, [
            'skip_gg_calendar' => false,
            'ignore_preparation' => true,
            'calculate_availability' => true,
            'calculate_night_hours' => false,
        ]);
        $available = $sp->get_available_count($time);
        if ($available < $quantity) {
            wp_die();
            return;
        }
        $quantity = esc_html(sanitize_text_field($quantity));
        $booking_data['duration'] = $service->get_duration();
        $booking_data['name'] = esc_html(
            trim(
                apply_filters(
                    'wbk_field_before_book',
                    sanitize_text_field($name),
                    'name'
                )
            )
        );
        $booking_data['email'] = esc_html(
            strtolower(
                trim(
                    apply_filters(
                        'wbk_field_before_book',
                        sanitize_text_field($email),
                        'email'
                    )
                )
            )
        );
        $booking_data['phone'] = esc_html(trim(sanitize_text_field($phone)));
        $booking_data['extra'] = stripcslashes($_POST['extra']);
        $booking_data['description'] = esc_html(sanitize_text_field($desc));
        $booking_data['quantity'] = $quantity;
        $booking_data['time'] = $time;
        $booking_data['time_offset'] = WBK_Time_Math_Utils::get_offset_local(
            $time
        );
        $booking_data['service_id'] = $service_id;
        $booking_data['service_category'] = 0;

        $boking_factory = new WBK_Booking_Factory();
        $status = $boking_factory->build_from_array($booking_data);
        $boking_factory->post_production([$status[1]]);

        if ($status[0] == true) {
            $booking_ids[] = $status[1];
            do_action('wbk_table_after_add', [
                $status[1],
                get_option('wbk_db_prefix', '') . 'wbk_appointments',
            ]);
            $wbk_action_data = [
                'appointment_id' => $status[1],
                'customer' => $booking_data['name'],
                'email' => $booking_data['email'],
                'phone' => $booking_data['phone'],
                'time' => $booking_data['time'],
                'serice id' => $booking_data['service_id'],
                'duration' => $booking_data['duration'],
                'comment' => $booking_data['description'],
                'quantity' => $booking_data['quantity'],
            ];

            do_action('wbk_add_appointment', $wbk_action_data);
            $time_slots = $sp->get_time_slots_by_day($day, $service_id, [
                'ignore_preparation' => true,
                'calculate_availability' => true,
            ]);

            $html_schedule = WBK_Renderer::load_template(
                'backend/schedule_day_timeslots',
                [
                    $time_slots,
                    $service_id,
                    $sp->get_locked_time_slots($service_id),
                ],
                false
            );

            $resarray = ['day' => $html_schedule];
            date_default_timezone_set('UTC');
            echo json_encode($resarray);
            wp_die();
            return;
        }

        wp_die();
        return;
    }
    public function add_appointment_backend_fullcalendar()
    {
        global $wpdb;
        if (!wp_verify_nonce($_POST['nonce'], 'wbkb_nonce')) {
            wp_die();
            return;
        }
        date_default_timezone_set(get_option('wbk_timezone', 'UTC'));

        $response = [];
        $time = $_POST['time'];
        $edited_time = $_POST['edited_time'];
        $service_id = $_POST['service_id'];
        $is_new = $_POST['is_new'];

        $service = new WBK_Service($service_id);
        if (!$service->is_loaded()) {
            wp_die();
            return;
        }

        $sp = new WBK_Schedule_Processor();
        if ($time == $edited_time) {
            $response['day'] = $this->get_timeslot(
                $sp,
                $time,
                $service_id,
                $is_new
            );
        } else {
            $response['day'] = $this->get_timeslot(
                $sp,
                $time,
                $service_id,
                $is_new
            );
            $response['edited_day'] = $this->get_timeslot(
                $sp,
                $edited_time,
                $service_id
            );
        }

        date_default_timezone_set('UTC');
        echo json_encode($response);
        wp_die();
        return;
    }
    public function get_timeslot($sp, $time, $service_id, $is_new = false)
    {
        $day = strtotime('today midnight', $time);
        $sp->get_time_slots_by_day($day, $service_id, [
            'skip_gg_calendar' => false,
            'ignore_preparation' => true,
            'calculate_availability' => true,
            'calculate_night_hours' => false,
        ]);

        $time_slots = $sp->get_time_slots_by_day($day, $service_id, [
            'ignore_preparation' => true,
            'calculate_availability' => true,
        ]);

        $html_schedule = '';
        foreach ($time_slots as $key => $time_slot) {
            if (!($time_slot->start == (int) $time)) {
                continue;
            }
            $html_schedule = WBK_Renderer::load_template(
                'backend/schedule_day_timeslot',
                [
                    $time_slot,
                    $service_id,
                    $sp->get_locked_time_slots($service_id),
                    $is_new,
                ],
                false
            );
        }

        return $html_schedule;
    }

    public function prepare_appointment()
    {
        global $wpdb;
        global $current_user;
        if (!wp_verify_nonce($_POST['nonce'], 'wbkb_nonce')) {
            wp_die();
            return;
        }
        date_default_timezone_set(get_option('wbk_timezone', 'UTC'));

        $time = $_POST['time'];
        $service_id = $_POST['service_id'];

        if (!is_numeric($time) || !is_numeric($service_id)) {
            echo '-1';
            date_default_timezone_set('UTC');
            wp_die();
            return;
        }

        $service = new WBK_Service_deprecated();

        if (!$service->setId($service_id)) {
            echo '-1';
            date_default_timezone_set('UTC');
            die();
            return;
        }
        if (!$service->load()) {
            echo '-1';
            date_default_timezone_set('UTC');
            die();
            return;
        }
        $quantity = $service->getQuantity();
        // check access
        if (!current_user_can('manage_options')) {
            if (!WBK_Validator::check_access_to_service($service_id)) {
                echo '-1';
                date_default_timezone_set('UTC');
                die();
                return;
            }
        }
        $date_format = WBK_Date_Time_Utils::get_date_format();
        $time_format = WBK_Date_Time_Utils::get_time_format();
        $time_string =
            wp_date(
                $date_format,
                $time,
                new DateTimeZone(date_default_timezone_get())
            ) .
            ' ' .
            wp_date(
                $time_format,
                $time,
                new DateTimeZone(date_default_timezone_get())
            );

        $sp = new WBK_Schedule_Processor();
        $day = strtotime('today midnight', $time);
        $sp->get_time_slots_by_day($day, $service_id, [
            'skip_gg_calendar' => false,
            'ignore_preparation' => true,
            'calculate_availability' => true,
            'calculate_night_hours' => false,
        ]);
        $current_avail = $sp->get_available_count($time);

        $phone_mask = get_option('wbk_phone_mask', 'disabled');
        $phone_format = '';
        if ($phone_mask == 'enabled') {
            $phone_format = get_option('wbk_phone_format', '999-9999');
        }
        $resarray = [
            'time' => $time_string,
            'timestamp' => $time,
            'quantity' => $quantity,
            'available' => $current_avail,
            'phone_format' => $phone_format,
        ];
        echo json_encode($resarray);
        date_default_timezone_set('UTC');
        die();
        return;
    }
    public function prepare_appointment_fullcalendar()
    {
        global $wpdb;
        global $current_user;
        if (!wp_verify_nonce($_POST['nonce'], 'wbkb_nonce')) {
            wp_die();
            return;
        }
        date_default_timezone_set(get_option('wbk_timezone', 'UTC'));

        $time = $_POST['time'];
        $service_id = $_POST['service_id'];

        if (!is_numeric($time) || !is_numeric($service_id)) {
            echo '-1';
            date_default_timezone_set('UTC');
            wp_die();
            return;
        }

        $service = new WBK_Service_deprecated();

        if (!$service->setId($service_id)) {
            echo '-1';
            date_default_timezone_set('UTC');
            die();
            return;
        }
        if (!$service->load()) {
            echo '-1';
            date_default_timezone_set('UTC');
            die();
            return;
        }
        $quantity = $service->getQuantity();
        // check access
        if (!current_user_can('manage_options')) {
            if (!WBK_Validator::check_access_to_service($service_id)) {
                echo '-1';
                date_default_timezone_set('UTC');
                die();
                return;
            }
        }
        $date_format = WBK_Date_Time_Utils::get_date_format();
        $time_format = WBK_Date_Time_Utils::get_time_format();
        $time_string =
            wp_date(
                $date_format,
                $time,
                new DateTimeZone(date_default_timezone_get())
            ) .
            ' ' .
            wp_date(
                $time_format,
                $time,
                new DateTimeZone(date_default_timezone_get())
            );

        $sp = new WBK_Schedule_Processor();
        $day = strtotime('today midnight', $time);
        $sp->get_time_slots_by_day($day, $service_id, [
            'skip_gg_calendar' => false,
            'ignore_preparation' => true,
            'calculate_availability' => true,
            'calculate_night_hours' => false,
        ]);
        $current_avail = $sp->get_available_count($time);

        $phone_mask = get_option('wbk_phone_mask', 'disabled');
        $phone_format = '';
        if ($phone_mask == 'enabled') {
            $phone_format = get_option('wbk_phone_format', '999-9999');
        }
        $resarray = [
            'time' => $time_string,
            'timestamp' => $time,
            'quantity' => $quantity,
            'available' => $current_avail,
            'phone_format' => $phone_format,
        ];
        echo json_encode($resarray);
        date_default_timezone_set('UTC');
        die();
        return;
    }

    public function schedule_load()
    {
        if (!wp_verify_nonce($_POST['nonce'], 'wbkb_nonce')) {
            wp_die();
            return;
        }
        date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
        $service_id = $_POST['service_id'];
        global $current_user;
        // check access
        if (!current_user_can('manage_options')) {
            if (!WBK_Validator::check_access_to_service($service_id)) {
                echo '-1';
                date_default_timezone_set('UTC');
                die();
                return;
            }
        }
        $start = $_POST['start'];
        if (!WBK_Validator::check_integer($service_id, 1, 9999999)) {
            echo '-1';
            date_default_timezone_set('UTC');
            die();
            return;
        }
        if (!WBK_Validator::check_integer($start, 0, 9999999)) {
            echo '-2';
            date_default_timezone_set('UTC');
            die();
            return;
        }
        // check if service exists
        $service_test = new WBK_Service($service_id);
        if (!$service_test->is_loaded()) {
            echo -1;
            date_default_timezone_set('UTC');
            die();
            return;
        }

        // init service schedulle

        $sp = new WBK_Schedule_Processor();
        $sp->load_data();
        // output days
        if ($start == 0) {
            $day_to_render = WBK_Time_Math_Utils::get_start_of_current_week();
        } else {
            $next_week_day = WBK_Time_Math_Utils::adjust_times(
                strtotime('today'),
                86400 * 7 * $start,
                get_option('wbk_timezone', 'UTC')
            );
            $day_to_render = WBK_Time_Math_Utils::get_start_of_week_day(
                $next_week_day
            );
        }
        $date_format = WBK_Format_Utils::get_date_format();
        $html = '';

        $html = '<div class="wbk-schedule-row-simple">';
        for ($i = 1; $i <= 7; $i++) {
            date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
            $day_status = $sp->get_day_status($day_to_render, $service_id);
            $time_slots = $sp->get_time_slots_by_day(
                $day_to_render,
                $service_id,
                ['ignore_preparation' => true, 'calculate_availability' => true]
            );

            $html .= WBK_Renderer::load_template(
                'backend/schedule_day',
                [
                    $day_status,
                    $time_slots,
                    $day_to_render,
                    $service_id,
                    $sp->get_locked_time_slots($service_id),
                ],
                false
            );
            $day_to_render = strtotime('tomorrow', $day_to_render);
        }
        $html .= '</div>';

        date_default_timezone_set('UTC');
        echo $html;
        die();
    }
    public function schedule_load_fullcalendar()
    {
        if (!wp_verify_nonce($_POST['nonce'], 'wbkb_nonce')) {
            wp_die();
            return;
        }
        date_default_timezone_set(get_option('wbk_timezone', 'UTC'));

        $response = [];
        $response['locale'] = get_locale();
        $response['time_zone'] = get_option('wbk_timezone', 'UTC');

        $start = (int) $_POST['start'];
        $service_ids = isset($_POST['service_id']) ? $_POST['service_id'] : [];
        $service_ids = array_filter($service_ids);
        $initial_view = $_POST['initial_view'];
        $is_multiple_services = true; //count($service_ids) > 1;
        global $current_user;
        // check if service exists
        $colors = [];
        foreach ($service_ids as $service_id) {
            // check access
            if (!current_user_can('manage_options')) {
                if (!WBK_Validator::check_access_to_service($service_id)) {
                    echo '-1';
                    date_default_timezone_set('UTC');
                    die();
                    return;
                }
            }
            if (!WBK_Validator::check_integer($service_id, 1, 9999999)) {
                echo '-1';
                date_default_timezone_set('UTC');
                die();
                return;
            }

            $service_test = new WBK_Service($service_id);
            if (!$service_test->is_loaded()) {
                echo -1;
                date_default_timezone_set('UTC');
                die();
                return;
            }

            // Services Colors
            $color = rand(0, 255) . ',' . rand(0, 255) . ',' . rand(0, 255);
            $colors[$service_id] = $color;
        }

        // init service schedulle
        $sp = new WBK_Schedule_Processor();
        $sp->load_data();

        // output days
        $date = new DateTime(date('Y-m-01', strtotime('now')));
        $today = new DateTime('today');

        if ($start > 0) {
            $response['gotoDate'] = $start;
            $start_date = new DateTime();
            $start_date->setTimestamp($start);
            $start_date->setTimezone(new DateTimeZone($response['time_zone']));
            $response['offset'] = $start_date->getOffset();
            $timestamp = $start_date->getTimestamp() - $response['offset'];
            if ($response['offset'] < 0) {
                $timestamp =
                    $start_date->getTimestamp() + abs($response['offset']);
            }
            $date->setTimestamp($timestamp);
        } else {
            $date->setTimestamp($today->getTimestamp());
        }

        $day_to_render = $date->getTimestamp();
        $first_day = $date->format('j');
        $last_day = $date->format('t');
        if ($initial_view == 'timeGridWeek') {
            $last_day = (int) $first_day + 6;
        } elseif ($initial_view == 'timeGridDay') {
            $last_day = (int) $first_day;
        }

        $_last_day = new DateTime(date('Y-m-t H:i:s', $day_to_render));

        if ($initial_view == 'dayGridMonth') {
            $last_day = $last_day + 14;
            $date = new DateTime(date('Y-m-01 H:i:s', $day_to_render));
            $date->modify('-7 day');
            $_last_day = new DateTime(date('Y-m-t H:i:s', $day_to_render));
            $_last_day->modify('+7 day');

            $day_to_render = $date->getTimestamp();
        } elseif ($initial_view == 'timeGridWeek') {
            $_last_day->modify('+6 day');
        } else {
            $_last_day->modify('+1 day');
        }

        $response['first_day'] = $date->getTimestamp();
        $response['_first_day'] = $date->format('m/d/Y');
        $response['last_day'] = $_last_day->getTimestamp();
        $response['_last_day'] = $_last_day->format('m/d/Y');

        if ($is_multiple_services) {
            foreach ($service_ids as $service_id) {
                $service = new WBK_Service($service_id);
                $duration = $service->get_duration() * 60;
                $betw_interval = $service->get_interval_between() * 60;
                $total_duration = $duration + $betw_interval;

                $bookings_ids = WBK_Model_Utils::get_booking_ids_by_range_service(
                    $response['first_day'],
                    $response['last_day'],
                    $service_id
                );
                $time_processed = [];
                foreach ($bookings_ids as $booking_id) {
                    $booking = new WBK_Booking($booking_id);
                    if (!$booking->is_loaded()) {
                        continue;
                    }
                    if (in_array($booking->get_start(), $time_processed)) {
                        continue;
                    }
                    $time_processed[] = $booking->get_start();

                    $temp = WBK_Time_Math_Utils::adjust_times(
                        $booking->get_local_time(),
                        $total_duration,
                        get_option('wbk_timezone', 'UTC')
                    );

                    $time_slot = new WBK_Time_Slot(
                        $booking->get('time'),
                        $temp
                    );
                    $time_slot->end =
                        $time_slot->start + $booking->get('duration') * 60;
                    $time_slot->display = 'block';
                    $time_slot->set_free_places(0);
                    $time_slot->set_status($booking_id);

                    $html_schedule = WBK_Renderer::load_template(
                        'backend/schedule_day_timeslot',
                        [$time_slot, $service_id, []],
                        false
                    );

                    $color = "rgba( $colors[$service_id], 0.3)";
                    $background_color = "background-color: $color;";
                    $time_slot->backgroundColor = $color;

                    $html_schedule = str_replace(
                        'class="timeslot_container"',
                        'class="timeslot_container" style="' .
                        $background_color .
                        '"',
                        $html_schedule
                    );
                    $time_slot->html = $html_schedule;

                    $temp_start = $time_slot->start;
                    $time_slot->start = date('Y-m-d H:i:s', $time_slot->start);
                    $time_slot->end =
                        $temp_start + $booking->get('duration') * 60;
                    $time_slot->end = date('Y-m-d H:i:s', $time_slot->end);

                    $response['events'][$day_to_render][
                        'time_slots'
                    ][] = $time_slot;
                }
            }
        }

        date_default_timezone_set('UTC');
        echo json_encode($response);
        die();
    }
    // ajax lock day
    public function ajax_lock_day()
    {
        if (!wp_verify_nonce($_POST['nonce'], 'wbkb_nonce')) {
            wp_die();
            return;
        }
        date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
        global $wpdb;
        $service_id = $_POST['service_id'];

        // check access
        global $current_user;
        if (!current_user_can('manage_options')) {
            if (!WBK_Validator::check_access_to_service($service_id)) {
                echo '-1';
                date_default_timezone_set('UTC');
                die();
                return;
            }
        }
        if (!WBK_Validator::check_integer($service_id, 1, 9999999)) {
            echo -1;
            date_default_timezone_set('UTC');
            die();
            return;
        }
        $day = $_POST['day'];
        if (!WBK_Validator::check_integer($day, 1438426800, 2754046000)) {
            echo -1;
            date_default_timezone_set('UTC');
            die();
            return;
        }
        if (
            $wpdb->query(
                $wpdb->prepare(
                    'DELETE FROM ' .
                    get_option('wbk_db_prefix', '') .
                    'wbk_days_on_off WHERE day = %d and service_id = %d',
                    $day,
                    $service_id
                )
            ) === false
        ) {
            echo -1;
            date_default_timezone_set('UTC');
            die();
            return;
        }
        if (
            $wpdb->insert(
                get_option('wbk_db_prefix', '') . 'wbk_days_on_off',
                ['service_id' => $service_id, 'day' => $day, 'status' => 0],
                ['%d', '%d', '%d']
            ) === false
        ) {
            echo -1;
            date_default_timezone_set('UTC');
            die();
            return;
        }
        date_default_timezone_set('UTC');

        WBK_Renderer::load_template(
            'backend/schedule_day_unlock_link',
            [$service_id, $day],
            true
        );
        die();
        return;
    }
    // ajax unlock day
    public function ajax_unlock_day()
    {
        if (!wp_verify_nonce($_POST['nonce'], 'wbkb_nonce')) {
            wp_die();
            return;
        }
        global $wpdb;
        global $current_user;
        date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
        $service_id = $_POST['service_id'];
        if (
            !WBK_Validator::validateId(
                $service_id,
                'wbk_services' /* passed newdb */
            )
        ) {
            echo '-1';
            date_default_timezone_set('UTC');
            die();
            return;
        }
        // check access
        if (!current_user_can('manage_options')) {
            if (!WBK_Validator::check_access_to_service($service_id)) {
                echo '-1';
                date_default_timezone_set('UTC');
                die();
                return;
            }
        }
        if (!WBK_Validator::check_integer($service_id, 1, 9999999)) {
            echo -1;
            date_default_timezone_set('UTC');
            die();
            return;
        }
        $day = $_POST['day'];
        if (!WBK_Validator::check_integer($day, 1438426800, 2754046000)) {
            echo -1;
            date_default_timezone_set('UTC');
            die();
            return;
        }
        if (
            $wpdb->query(
                $wpdb->prepare(
                    'DELETE FROM ' .
                    get_option('wbk_db_prefix', '') .
                    'wbk_days_on_off WHERE day = %d and service_id = %d',
                    $day,
                    $service_id
                )
            ) === false
        ) {
            echo -1;
            date_default_timezone_set('UTC');
            die();
            return;
        }
        if (
            $wpdb->insert(
                get_option('wbk_db_prefix', '') . 'wbk_days_on_off',
                ['service_id' => $service_id, 'day' => $day, 'status' => 1],
                ['%d', '%d', '%d']
            ) === false
        ) {
            echo -1;
            date_default_timezone_set('UTC');
            die();
            return;
        }
        date_default_timezone_set('UTC');
        WBK_Renderer::load_template(
            'backend/schedule_day_lock_link',
            [$service_id, $day],
            true
        );
        die();
    }
    // ajax lock time
    public function ajax_lock_time()
    {
        if (!wp_verify_nonce($_POST['nonce'], 'wbkb_nonce')) {
            wp_die();
            return;
        }
        global $wpdb;
        global $current_user;
        date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
        $service_id = $_POST['service_id'];
        if (
            !WBK_Validator::validateId(
                $service_id,
                'wbk_services' /* passed newdb */
            )
        ) {
            echo '-1';
            date_default_timezone_set('UTC');
            die();
            return;
        }
        // check access
        if (!current_user_can('manage_options')) {
            if (!WBK_Validator::check_access_to_service($service_id)) {
                echo '-1';
                date_default_timezone_set('UTC');
                die();
                return;
            }
        }
        if (!WBK_Validator::check_integer($service_id, 1, 9999999)) {
            echo -1;
            date_default_timezone_set('UTC');
            die();
            return;
        }
        $time = $_POST['time'];
        if (!WBK_Validator::check_integer($time, 1438426800, 2754046000)) {
            echo -1;
            date_default_timezone_set('UTC');
            die();
            return;
        }
        if (
            $wpdb->query(
                $wpdb->prepare(
                    'DELETE FROM ' .
                    get_option('wbk_db_prefix', '') .
                    'wbk_locked_time_slots WHERE time = %d and service_id = %d',
                    $time,
                    $service_id
                )
            ) === false
        ) {
            echo -1;
            date_default_timezone_set('UTC');
            die();
            return;
        }
        if (
            $wpdb->insert(
                get_option('wbk_db_prefix', '') . 'wbk_locked_time_slots',
                ['service_id' => $service_id, 'time' => $time],
                ['%d', '%d']
            ) === false
        ) {
            echo -1;
            date_default_timezone_set('UTC');
            die();
            return;
        }
        WBK_Renderer::load_template('backend/schedule_time_unlock_link', [
            $service_id,
            $time,
        ]);
        date_default_timezone_set('UTC');
        die();
    }
    // ajax unlock time
    public function ajax_unlock_time()
    {
        if (!wp_verify_nonce($_POST['nonce'], 'wbkb_nonce')) {
            wp_die();
            return;
        }
        global $wpdb;
        global $current_user;
        $service_id = $_POST['service_id'];
        if (
            !WBK_Validator::validateId(
                $service_id,
                'wbk_services' /* passed newdb */
            )
        ) {
            echo '-1';
            date_default_timezone_set('UTC');
            die();
            return;
        }
        date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
        // check access
        if (!current_user_can('manage_options')) {
            if (!WBK_Validator::check_access_to_service($service_id)) {
                echo '-1';
                date_default_timezone_set('UTC');
                die();
                return;
            }
        }
        if (!WBK_Validator::check_integer($service_id, 1, 9999999)) {
            echo -1;
            date_default_timezone_set('UTC');
            die();
            return;
        }
        $time = $_POST['time'];
        if (!WBK_Validator::check_integer($time, 1438426800, 2754046000)) {
            echo -1;
            date_default_timezone_set('UTC');
            die();
            return;
        }
        if (
            $wpdb->query(
                $wpdb->prepare(
                    'DELETE FROM ' .
                    get_option('wbk_db_prefix', '') .
                    'wbk_locked_time_slots WHERE time = %d and service_id = %d',
                    $time,
                    $service_id
                )
            ) === false
        ) {
            echo -1;
            date_default_timezone_set('UTC');
            die();
            return;
        }
        date_default_timezone_set('UTC');

        echo '<a id="app_add_' .
            esc_attr($service_id . '_' . $time) .
            '"><span class="dashicons dashicons-welcome-add-page"></span></a>';
        WBK_Renderer::load_template('backend/schedule_time_lock_link', [
            $service_id,
            $time,
        ]);

        wp_die();
    }
}
