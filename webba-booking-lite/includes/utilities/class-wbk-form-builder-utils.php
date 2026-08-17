<?php

defined('ABSPATH') or exit;

/**
 * Class WBK_Form_Builder_Utils
 *
 * Utility class for form builder
 *
 * @package WebbaBooking
 */
class WBK_Form_Builder_Utils
{
    /**
     * Get seed fields used to create the default booking form.
     *
     * @return array
     */
    public static function get_seed_default_fields(): array
    {
        $fields = json_decode(
            '[{
                "type": "text",
                "slug": "first_name",
                "required": true,
                "placeholder": "First Name",
                "defaultValue": "",
                "width": "half-width"
            },
            {
                "type": "text",
                "slug": "last_name",
                "required": false,
                "placeholder": "Last Name",
                "defaultValue": "",
                "width": "half-width"
            },
            {
                "type": "email",
                "slug": "email",
                "required": true,
                "placeholder": "Email address",
                "defaultValue": "",
                "width": "half-width"
            },
            {
                "type": "phone",
                "slug": "phone",
                "required": false,
                "placeholder": "Phone number",
                "defaultValue": "",
                "width": "half-width"
            }
        ]',
            true
        );

        return is_array($fields) ? $fields : [];
    }

    /**
     * Apply option-based placeholder overrides to form fields.
     *
     * @param array $fields Form fields.
     * @return array
     */
    public static function apply_field_option_overrides(array $fields): array
    {
        return array_map(function ($field) {
            if (!is_array($field) || !isset($field['slug'])) {
                return $field;
            }

            if (($field['type'] ?? '') === 'checkbox') {
                $field['checkboxText__not_translated'] = $field['checkboxText'] ?? '';
                $field['checkboxText'] = get_option(
                    'webba_form_field_' . $field['slug'],
                    $field['checkboxText'] ?? ''
                );
            } else {
                $field['placeholder__not_translated'] = $field['placeholder'] ?? '';
                $field['placeholder'] = get_option(
                    'webba_form_field_' . $field['slug'],
                    $field['placeholder'] ?? ''
                );
            }

            return $field;
        }, $fields);
    }

    /**
     * Get the default booking form from the database.
     *
     * @return WBK_Form|null
     */
    public static function get_default_form(): ?WBK_Form
    {
        global $wpdb;

        $table = get_option('wbk_db_prefix', '') . 'wbk_forms';
        $query = $wpdb->prepare('SHOW TABLES LIKE %s', $wpdb->esc_like($table));

        if ($wpdb->get_var($query) !== $table) {
            return null;
        }

        $column = $wpdb->get_results(
            $wpdb->prepare("SHOW COLUMNS FROM `{$table}` LIKE %s", 'is_default')
        );

        if (empty($column)) {
            return null;
        }

        $form_id = $wpdb->get_var(
            "SELECT id FROM `{$table}` WHERE is_default = 'yes' ORDER BY id ASC LIMIT 1"
        );

        if (!$form_id) {
            return null;
        }

        $form = new WBK_Form((int) $form_id);

        return $form->is_loaded() ? $form : null;
    }

    /**
     * Get the default booking form ID.
     *
     * @return int|null
     */
    public static function get_default_form_id(): ?int
    {
        $form = self::get_default_form();

        if (!$form) {
            return null;
        }

        $form_id = $form->get_id();

        return $form_id ? (int) $form_id : null;
    }

    /**
     * Get default form fields
     * @return array default form fields
     */
    public static function get_default_fields(): array
    {
        $form = self::get_default_form();

        if ($form) {
            $fields = $form->get_fields();

            if (is_array($fields) && count($fields) > 0) {
                return self::apply_field_option_overrides($fields);
            }
        }

        return self::apply_field_option_overrides(self::get_seed_default_fields());
    }

    /**
     * Get all fields merged from all forms
     *
     * @return array
     */
    public static function get_all_fields_merged(): array
    {
        $forms  = WBK_Model_Utils::get_forms();
        $fields = [];

        foreach ($forms as $id => $name) {
            $form        = new WBK_Form($id);
            $fields_temp = $form->get_fields();

            if (is_array($fields_temp)) {
                $fields_temp = array_map(function ($field) use ($id) {
                    $field['form_id'] = $id;

                    return $field;
                }, $fields_temp);

                $fields = array_merge($fields, $fields_temp);
            }
        }

        if (count($fields) === 0) {
            $fields = self::get_default_fields();
        }

        $fields_result = [];

        foreach ($fields as $field) {
            $slug = isset($field['slug']) ? $field['slug'] : '';
            if ($slug !== '' && !isset($fields_result[$slug])) {
                $fields_result[$slug] = $field;
            }
        }

        return array_values($fields_result);
    }

    /**
     * Get form fields connected to a booking via its service or unit.
     *
     * @param WBK_Booking $booking Booking instance.
     * @return array
     */
    public static function get_fields_for_booking(WBK_Booking $booking): array
    {
        $form_id = "0";

        if ($booking->get_booking_target_type() === WBK_Booking::BOOKING_TARGET_UNIT) {
            $unit = new WBK_Unit($booking->get_unit_id());
            if ($unit->is_loaded()) {
                $form_id = $unit->get_form_id();
            }
        } elseif ($booking->get_booking_target_type() === WBK_Booking::BOOKING_TARGET_SERVICE) {
            $service = new WBK_Service($booking->get_service());
            if ($service->is_loaded()) {
                $form_id = $service->get("form_builder");
            }
        }

        if (!$form_id || $form_id === "0" || $form_id === 0) {
            return self::get_default_fields();
        }

        $form = new WBK_Form($form_id);
        if (!$form->is_loaded()) {
            return self::get_default_fields();
        }

        $fields = $form->get_fields();
        if (!is_array($fields)) {
            return self::get_default_fields();
        }

        return $fields;
    }

    /**
     * Get values from additional email-type form fields (everything except slug "email").
     *
     * @param WBK_Booking $booking Booking instance.
     * @return string[] Normalized unique email addresses.
     */
    public static function get_additional_email_field_values(WBK_Booking $booking): array
    {
        $fields = self::get_fields_for_booking($booking);
        $extra_values = self::get_booking_extra_values_map($booking);
        $emails = [];

        foreach ($fields as $field) {
            $field = (array) $field;
            $type = isset($field["type"]) ? (string) $field["type"] : "";
            $slug = isset($field["slug"]) ? (string) $field["slug"] : "";

            if ($type !== "email" || $slug === "" || $slug === "email") {
                continue;
            }

            $value = null;
            if (array_key_exists($slug, $extra_values)) {
                $value = $extra_values[$slug];
            }

            if (!is_string($value) && !is_numeric($value)) {
                continue;
            }

            $normalized = self::normalize_email_address((string) $value);
            if ($normalized !== "") {
                $emails[] = $normalized;
            }
        }

        return array_values(array_unique($emails));
    }

    /**
     * Build a slug => value map from the booking extra JSON.
     *
     * @param WBK_Booking $booking Booking instance.
     * @return array<string, mixed>
     */
    public static function get_booking_extra_values_map(WBK_Booking $booking): array
    {
        $extra_raw = $booking->get("extra");
        if (!is_string($extra_raw) || trim($extra_raw) === "" || trim($extra_raw) === "[]") {
            return [];
        }

        $decoded = json_decode($extra_raw);
        if (!is_array($decoded)) {
            $decoded = json_decode(stripslashes($extra_raw));
        }
        if (!is_array($decoded)) {
            return [];
        }

        $map = [];
        foreach ($decoded as $item) {
            if (is_object($item)) {
                $item = (array) $item;
            }
            if (!is_array($item)) {
                continue;
            }

            $values = array_values($item);
            if (count($values) < 3) {
                continue;
            }

            $slug = trim((string) $values[0]);
            if ($slug === "") {
                continue;
            }

            $map[$slug] = $values[2];
        }

        return $map;
    }

    /**
     * Trim, sanitize and validate an email address.
     *
     * @param string $email Raw email value.
     * @return string Normalized email or empty string when invalid.
     */
    public static function normalize_email_address(string $email): string
    {
        $email = strtolower(trim($email));
        $email = sanitize_email($email);

        if ($email === "" || !is_email($email)) {
            return "";
        }

        return $email;
    }
}
