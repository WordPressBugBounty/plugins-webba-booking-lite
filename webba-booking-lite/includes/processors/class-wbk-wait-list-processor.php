<?php
if (!defined("ABSPATH")) {
    exit();
}

/**
 * Slot wait-list subscriptions and availability notifications.
 */
class WBK_Wait_List_Processor
{
    const STATUS_PENDING = "pending";
    const STATUS_NOTIFIED = "notified";
    const STATUS_EXPIRED = "expired";
    const STATUS_CANCELLED = "cancelled";

    /**
     * @return string
     */
    public static function table_name(): string
    {
        global $wpdb;
        return get_option("wbk_db_prefix", $wpdb->prefix) . "wbk_slot_wait_list";
    }

    /**
     * Global + per-service gate.
     *
     * @param int $service_id
     * @return bool
     */
    public static function is_enabled_for_service(int $service_id): bool
    {
        $service = new WBK_Service($service_id);
        if (!$service->is_loaded()) {
            return false;
        }

        if ($service->get("override_wait_list") === "yes") {
            return $service->get("wait_list_enabled") === "yes";
        }

        return get_option("wbk_wait_list_enabled", "") === "yes";
    }

    /**
     * Subscribe a customer to a busy slot.
     *
     * @param array $data
     * @return array|WP_Error
     */
    public static function subscribe(array $data)
    {
        global $wpdb;
        if (wbk_fs()->is__premium_only() && wbk_fs()->can_use_premium_code()) {
            $service_id = isset($data["service_id"]) ? absint($data["service_id"]) : 0;
            $time = isset($data["time"]) ? absint($data["time"]) : 0;
            $email = isset($data["email"]) ? sanitize_email($data["email"]) : "";
            $name = isset($data["name"]) ? sanitize_text_field($data["name"]) : "";
            $quantity = isset($data["quantity"]) ? max(1, absint($data["quantity"])) : 1;
            $staff_member_id = 0;
            if (
                isset($data["staff_member_id"]) &&
                $data["staff_member_id"] !== "" &&
                $data["staff_member_id"] !== null
            ) {
                $staff_member_id = absint($data["staff_member_id"]);
            }

            if ($service_id <= 0 || $time <= 0) {
                return new WP_Error("invalid_slot", __("Invalid time slot.", "webba-booking-lite"), [
                    "status" => 400,
                ]);
            }
            if ($email === "" || !is_email($email)) {
                return new WP_Error("invalid_email", __("Please enter a valid email address.", "webba-booking-lite"), [
                    "status" => 400,
                ]);
            }
            if (!self::is_enabled_for_service($service_id)) {
                return new WP_Error(
                    "wait_list_disabled",
                    __("Wait list is not available for this service.", "webba-booking-lite"),
                    ["status" => 403],
                );
            }
            if ($time <= time()) {
                return new WP_Error(
                    "slot_in_past",
                    __("This time slot is in the past.", "webba-booking-lite"),
                    ["status" => 400],
                );
            }

            $service = new WBK_Service($service_id);
            $max_quantity = max(1, absint($service->get_max_quantity()));
            if ($quantity > $max_quantity) {
                $quantity = $max_quantity;
            }

            if ($staff_member_id > 0) {
                $staff_member = new WBK_Staff_Member($staff_member_id);
                if (!$staff_member->is_loaded()) {
                    return new WP_Error(
                        "invalid_staff",
                        __("Staff member not found.", "webba-booking-lite"),
                        ["status" => 400],
                    );
                }
                $staff_services = array_map("intval", (array) $staff_member->get_services());
                if (!in_array($service_id, $staff_services, true)) {
                    return new WP_Error(
                        "invalid_staff",
                        __("Staff member does not provide this service.", "webba-booking-lite"),
                        ["status" => 400],
                    );
                }
            }

            date_default_timezone_set(get_option("wbk_timezone", "UTC"));
            $day = strtotime("today", $time);
            date_default_timezone_set("UTC");

            $table = self::table_name();
            self::expire_past_entries();

            $existing = self::find_pending_duplicate($service_id, $time, $email, $staff_member_id);
            if ($existing) {
                return [
                    "id" => (int) $existing->id,
                    "token" => $existing->token,
                    "status" => $existing->status,
                    "already_subscribed" => true,
                ];
            }

            $max_per_slot = max(1, absint($service->get_wait_list_max_per_slot()));
            $slot_count = self::count_pending_for_slot($service_id, $time, $staff_member_id);
            if ($slot_count >= $max_per_slot) {
                return new WP_Error(
                    "wait_list_full",
                    __("The wait list for this time slot is full.", "webba-booking-lite"),
                    ["status" => 400],
                );
            }

            $max_per_email = max(1, absint($service->get_wait_list_max_per_email()));
            $email_count = (int) $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT COUNT(*) FROM {$table} WHERE email = %s AND status = %s",
                    $email,
                    self::STATUS_PENDING,
                ),
            );
            if ($email_count >= $max_per_email) {
                return new WP_Error(
                    "wait_list_email_limit",
                    __("You have reached the maximum number of wait-list subscriptions.", "webba-booking-lite"),
                    ["status" => 400],
                );
            }

            $token = wp_generate_password(32, false, false);
            $inserted = $wpdb->insert(
                $table,
                [
                    "service_id" => $service_id,
                    "day" => $day,
                    "time" => $time,
                    "staff_member_id" => $staff_member_id,
                    "email" => $email,
                    "name" => $name,
                    "quantity" => $quantity,
                    "token" => $token,
                    "status" => self::STATUS_PENDING,
                    "created_at" => current_time("mysql", true),
                ],
                ["%d", "%d", "%d", "%d", "%s", "%s", "%d", "%s", "%s", "%s"],
            );

            if ($inserted === false) {
                return new WP_Error(
                    "wait_list_save_failed",
                    __("Could not join the wait list. Please try again.", "webba-booking-lite"),
                    ["status" => 500],
                );
            }

            return [
                "id" => (int) $wpdb->insert_id,
                "token" => $token,
                "status" => self::STATUS_PENDING,
                "already_subscribed" => false,
            ];
        }
        
        return new WP_Error(
            "wait_list_disabled",
            __("Wait list is not available.", "webba-booking-lite"),
            ["status" => 403],
        );
    }

    /**
     * Cancel a subscription by token.
     *
     * @param string $token
     * @return bool
     */
    public static function unsubscribe(string $token): bool
    {
        global $wpdb;
        if (wbk_fs()->is__premium_only() && wbk_fs()->can_use_premium_code()) {
            $token = sanitize_text_field($token);
            if ($token === "") {
                return false;
            }
            $updated = $wpdb->update(
                self::table_name(),
                [
                    "status" => self::STATUS_CANCELLED,
                ],
                [
                    "token" => $token,
                    "status" => self::STATUS_PENDING,
                ],
                ["%s"],
                ["%s", "%s"],
            );
            return $updated !== false && $updated > 0;
        }

        return false;
    }

    /**
     * Build the public leave-wait-list URL for email templates.
     *
     * @param string $token
     * @return string
     */
    public static function get_leave_url(string $token): string
    {
        if (wbk_fs()->is__premium_only() && wbk_fs()->can_use_premium_code()) {
            $token = sanitize_text_field($token);
            $landing = \WebbaBooking\Utilities\WBK_Options_Utils::get_email_landing_page_link();
            if ($landing === "") {
                $landing = home_url("/");
            }

            return add_query_arg(
                [
                    "wait_list_leave" => rawurlencode($token),
                ],
                $landing,
            );
        }

        return "";
    }

    /**
     * Public details for a pending wait-list entry (token-gated).
     *
     * @param string $token
     * @return array|WP_Error
     */
    public static function get_pending_by_token(string $token)
    {
        global $wpdb;

        if (wbk_fs()->is__premium_only() && wbk_fs()->can_use_premium_code()) {
            $token = sanitize_text_field($token);
            if ($token === "") {
                return new WP_Error(
                    "invalid_token",
                    __("Wait list subscription not found.", "webba-booking-lite"),
                    ["status" => 404],
                );
            }
    
            $entry = $wpdb->get_row(
                $wpdb->prepare(
                    "SELECT * FROM " .
                        self::table_name() .
                        " WHERE token = %s AND status = %s LIMIT 1",
                    $token,
                    self::STATUS_PENDING,
                ),
            );
    
            if (!$entry) {
                return new WP_Error(
                    "invalid_token",
                    __("Wait list subscription not found.", "webba-booking-lite"),
                    ["status" => 404],
                );
            }
    
            $service = new WBK_Service((int) $entry->service_id);
            $service_name = $service->is_loaded() ? $service->get_name() : "";
    
            date_default_timezone_set(get_option("wbk_timezone", "UTC"));
            $date_format = WBK_Date_Time_Utils::get_date_format();
            $time_format = WBK_Date_Time_Utils::get_time_format();
            $formatted_date = wp_date($date_format, (int) $entry->time);
            $formatted_time = wp_date($time_format, (int) $entry->time);
            date_default_timezone_set("UTC");
    
            return [
                "service_name" => $service_name,
                "appointment_day" => $formatted_date,
                "appointment_time" => $formatted_time,
                "name" => is_string($entry->name) ? $entry->name : "",
            ];
        }

        return new WP_Error(
            "wait_list_disabled",
            __("Wait list is not available.", "webba-booking-lite"),
            ["status" => 403],
        );
    }

    /**
     * After a booking frees capacity for a slot, notify wait-list subscribers.
     *
     * @param int      $service_id
     * @param int      $time
     * @param int|null $staff_member_id
     * @return void
     */
    public static function notify_slot_available(
        int $service_id,
        int $time,
        $staff_member_id = null
    ): void {
        if (wbk_fs()->is__premium_only() && wbk_fs()->can_use_premium_code()) {
            if ($service_id <= 0 || $time <= 0) {
                return;
            }
            if (!self::is_enabled_for_service($service_id)) {
                return;
            }
            if ($time <= time()) {
                self::expire_past_entries();
                return;
            }
    
            self::expire_past_entries();
    
            $staff_member_id =
                $staff_member_id !== null && $staff_member_id !== ""
                    ? absint($staff_member_id)
                    : 0;
    
            $free_places = self::get_free_places(
                $service_id,
                $time,
                $staff_member_id > 0 ? $staff_member_id : null,
            );
            if ($free_places < 1) {
                return;
            }
    
            $entries = self::get_pending_for_slot($service_id, $time, $staff_member_id);
            if (count($entries) === 0) {
                return;
            }
    
            foreach ($entries as $entry) {
                if (self::send_available_email($entry)) {
                    self::mark_notified((int) $entry->id);
                }
            }
        }
       
        return;
    }

    /**
     * Hook helper after booking cancel/delete.
     *
     * @param int $booking_id
     * @return void
     */
    public static function on_booking_freed(int $booking_id): void
    {
        if (wbk_fs()->is__premium_only() && wbk_fs()->can_use_premium_code()) {
            $booking = new WBK_Booking($booking_id);
            if (!$booking->is_loaded()) {
                return;
            }
            $service_id = absint($booking->get("service_id"));
            $time = absint($booking->get("time"));
            $staff_raw = $booking->get("staff_member_id");
            $staff_member_id =
                $staff_raw !== null && $staff_raw !== "" && absint($staff_raw) > 0
                    ? absint($staff_raw)
                    : 0;
            if ($service_id <= 0 || $time <= 0) {
                return;
            }
            self::notify_slot_available($service_id, $time, $staff_member_id);
        }   

        return;
    }

    /**
     * @param int      $service_id
     * @param int      $time
     * @param int|null $staff_member_id
     * @return int
     */
    public static function get_free_places(int $service_id, int $time, $staff_member_id = null): int
    {
        if (wbk_fs()->is__premium_only() && wbk_fs()->can_use_premium_code()) {
            date_default_timezone_set(get_option("wbk_timezone", "UTC"));
            $day = strtotime("today", $time);
            $sp = new WBK_Schedule_Processor();
            $sp->load_data();
            $timeslots = $sp->get_time_slots_by_day(
                $day,
                $service_id,
                [
                    "skip_gg_calendar" => false,
                    "ignore_preparation" => true,
                    "calculate_availability" => true,
                    "filter_availability" => false,
                    "offset" => 0,
                ],
                null,
                true,
                $staff_member_id,
            );
            date_default_timezone_set("UTC");
    
            if (!is_array($timeslots)) {
                return 0;
            }
            foreach ($timeslots as $slot) {
                if ((int) $slot->get_start() === (int) $time) {
                    return max(0, (int) $slot->get_free_places());
                }
            }
            return 0;
        }

        return 0;
    }

    /**
     * @return void
     */
    public static function expire_past_entries(): void
    {
        global $wpdb;
        if (wbk_fs()->is__premium_only() && wbk_fs()->can_use_premium_code()) {
            $wpdb->query(
                $wpdb->prepare(
                    "UPDATE " .
                        self::table_name() .
                        " SET status = %s WHERE status = %s AND time < %d",
                    self::STATUS_EXPIRED,
                    self::STATUS_PENDING,
                    time(),
                ),
            );
        }
    }

    /**
     * @param int      $service_id
     * @param int      $time
     * @param string   $email
     * @param int|null $staff_member_id
     * @return object|null
     */
    private static function find_pending_duplicate(
        int $service_id,
        int $time,
        string $email,
        int $staff_member_id
    ) {
        global $wpdb;
        if (wbk_fs()->is__premium_only() && wbk_fs()->can_use_premium_code()) {
            $table = self::table_name();
            return $wpdb->get_row(
                $wpdb->prepare(
                    "SELECT * FROM {$table}
                    WHERE service_id = %d AND time = %d AND email = %s
                    AND status = %s AND staff_member_id = %d
                    LIMIT 1",
                    $service_id,
                    $time,
                    $email,
                    self::STATUS_PENDING,
                    $staff_member_id,
                ),
            );   
        }

        return null;
    }

    /**
     * @param int $service_id
     * @param int $time
     * @param int $staff_member_id
     * @return int
     */
    private static function count_pending_for_slot(
        int $service_id,
        int $time,
        int $staff_member_id
    ): int {
        if (wbk_fs()->is__premium_only() && wbk_fs()->can_use_premium_code()) {
            global $wpdb;
            $table = self::table_name();
            if ($staff_member_id > 0) {
                return (int) $wpdb->get_var(
                    $wpdb->prepare(
                        "SELECT COUNT(*) FROM {$table}
                        WHERE service_id = %d AND time = %d AND status = %s
                        AND (staff_member_id = %d OR staff_member_id = 0)",
                        $service_id,
                        $time,
                        self::STATUS_PENDING,
                        $staff_member_id,
                    ),
                );
            }
            return (int) $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT COUNT(*) FROM {$table}
                    WHERE service_id = %d AND time = %d AND status = %s
                    AND staff_member_id = 0",
                    $service_id,
                    $time,
                    self::STATUS_PENDING,
                ),
            );
        }

        return 0;
    }

    /**
     * Pending entries for a freed booking slot.
     * Includes service-only subscribers (staff 0) and matching staff subscribers.
     *
     * @param int $service_id
     * @param int $time
     * @param int $staff_member_id
     * @return array<int, object>
     */
    private static function get_pending_for_slot(
        int $service_id,
        int $time,
        int $staff_member_id
    ): array {

        if (wbk_fs()->is__premium_only() && wbk_fs()->can_use_premium_code()) {
            global $wpdb;
            $table = self::table_name();
            if ($staff_member_id > 0) {
                $rows = $wpdb->get_results(
                    $wpdb->prepare(
                        "SELECT * FROM {$table}
                        WHERE service_id = %d AND time = %d AND status = %s
                        AND (staff_member_id = %d OR staff_member_id = 0)
                        ORDER BY created_at ASC, id ASC",
                        $service_id,
                        $time,
                        self::STATUS_PENDING,
                        $staff_member_id,
                    ),
                );
            } else {
                $rows = $wpdb->get_results(
                    $wpdb->prepare(
                        "SELECT * FROM {$table}
                        WHERE service_id = %d AND time = %d AND status = %s
                        AND staff_member_id = 0
                        ORDER BY created_at ASC, id ASC",
                        $service_id,
                        $time,
                        self::STATUS_PENDING,
                    ),
                );
            }
            return is_array($rows) ? $rows : [];
        }
       
        return [];
    }

    /**
     * @param int $id
     * @return void
     */
    private static function mark_notified(int $id): void
    {
        if (wbk_fs()->is__premium_only() && wbk_fs()->can_use_premium_code()) {
            global $wpdb;
            $wpdb->update(
                self::table_name(),
                [
                    "status" => self::STATUS_NOTIFIED,
                    "notified_at" => current_time("mysql", true),
                ],
                ["id" => $id],
                ["%s", "%s"],
                ["%d"],
            );
        }
    }

    /**
     * @param object $entry
     * @return bool
     */
    private static function send_available_email($entry): bool
    {
        if (wbk_fs()->is__premium_only() && wbk_fs()->can_use_premium_code()) {
            $email = sanitize_email($entry->email);
            if ($email === "" || !is_email($email)) {
                return false;
            }
    
            $service = new WBK_Service((int) $entry->service_id);
            if (!$service->is_loaded()) {
                return false;
            }
    
            date_default_timezone_set(get_option("wbk_timezone", "UTC"));
            $date_format = WBK_Date_Time_Utils::get_date_format();
            $time_format = WBK_Date_Time_Utils::get_time_format();
            $formatted_date = wp_date($date_format, (int) $entry->time);
            $formatted_time = wp_date($time_format, (int) $entry->time);
            date_default_timezone_set("UTC");
    
            $customer_name = is_string($entry->name) && $entry->name !== "" ? $entry->name : "";
            $service_name = $service->get_name();
            $site_name = wp_specialchars_decode(get_bloginfo("name"), ENT_QUOTES);
            $unsubscribe_url = self::get_leave_url((string) $entry->token);
    
            $replacements = [
                "#customer_name" => esc_html($customer_name),
                "#service_name" => esc_html($service_name),
                "#appointment_date" => esc_html($formatted_date),
                "#appointment_day" => esc_html($formatted_date),
                "#appointment_time" => esc_html($formatted_time),
                "#site_name" => esc_html($site_name),
                "#unsubscribe_link" => esc_url($unsubscribe_url),
            ];
    
            $subject = "";
            $message = "";
            $templates = WBK_Model_Utils::get_email_templates(
                true,
                "slot_wait_list_available",
                (int) $entry->service_id,
                null,
            );
    
            if (count($templates) > 0) {
                $template_id = (int) array_key_first($templates);
                $et = new WBK_Email_Template($template_id);
                if ($et->is_loaded()) {
                    $subject = (string) $et->get("subject");
                    $message = (string) $et->get("template");
                    $subject = WBK_Translation_Processor::translate_string(
                        "webba_email_template_subject_" . $template_id,
                        $subject,
                    );
                    $message = WBK_Translation_Processor::translate_string(
                        "webba_email_template_message_" . $template_id,
                        $message,
                    );
                }
            }
    
            if ($subject === "") {
                $subject = sprintf(
                    /* translators: 1: service name, 2: date, 3: time */
                    __("%1$s is available on %2$s at %3$s", "webba-booking-lite"),
                    $service_name,
                    $formatted_date,
                    $formatted_time,
                );
            }
            if ($message === "") {
                $greeting =
                    $customer_name !== ""
                        ? sprintf(
                            /* translators: %s: customer name */
                            __("Hi %s,", "webba-booking-lite"),
                            esc_html($customer_name),
                        )
                        : __("Hi,", "webba-booking-lite");
                $message =
                    "<p>" .
                    $greeting .
                    "</p><p>" .
                    sprintf(
                        /* translators: 1: service name, 2: date, 3: time */
                        __(
                            "A time slot you joined the wait list for is now available: <strong>%1$s</strong> on <strong>%2$s</strong> at <strong>%3$s</strong>.",
                            "webba-booking-lite",
                        ),
                        esc_html($service_name),
                        esc_html($formatted_date),
                        esc_html($formatted_time),
                    ) .
                    "</p><p>" .
                    __("Book soon - availability is not reserved.", "webba-booking-lite") .
                    "</p><p><a href=\"" .
                    esc_url($unsubscribe_url) .
                    "\">" .
                    __("Leave wait list", "webba-booking-lite") .
                    "</a></p>";
            }
    
            foreach ($replacements as $placeholder => $value) {
                $subject = str_replace($placeholder, wp_strip_all_tags($value), $subject);
                $message = str_replace($placeholder, $value, $message);
            }
    
            $headers = [
                "From: " .
                stripslashes(get_option("wbk_from_name")) .
                " <" .
                get_option("wbk_from_email") .
                ">",
            ];
    
            add_filter("wp_mail_content_type", "wbk_wp_mail_content_type");
            $sent = wp_mail($email, $subject, $message, $headers);
            remove_filter("wp_mail_content_type", "wbk_wp_mail_content_type");
    
            return (bool) $sent;
        }

        return false;
    }
}
