<?php
// Webba Booking options page class
// check if accessed directly

use WebbaBooking\Utilities\WBK_Options_Utils;

if (!defined('ABSPATH')) {
    exit();
}
class WBK_Backend_Options
{
    public function __construct()
    {
        //set component-specific properties
        // init settings
        add_action('admin_init', [$this, 'initSettings']);
        // init scripts
        add_action('admin_enqueue_scripts', [$this, 'enqueueScripts'], 20);
        // mce plugin
        add_filter('mce_buttons', [$this, 'wbk_mce_add_button']);
        add_filter('mce_external_plugins', [$this, 'wbk_mce_add_javascript']);
        add_filter('wp_default_editor', [$this, 'wbk_default_editor']);
        add_filter('tiny_mce_before_init', [$this, 'customizeEditor'], 1000);
        // save options
        add_action('wp_ajax_wbk_save_options', [$this, 'save_options']);
    }

    public function save_options()
    {
        if (
            !current_user_can('manage_options') ||
            !wp_verify_nonce($_POST['nonce'], 'wbkb_nonce')
        ) {
            wp_send_json_error('No permissions');
        }
        global $wp_settings_fields;
        parse_str($_POST['form_data'], $options);
        $settings_fields = $wp_settings_fields['wbk-options'];
        foreach ($settings_fields[$options['section']] as $field) {
            if (isset($options[$field['id']])) {
                update_option($field['id'], $options[$field['id']]);
            } else {
                update_option($field['id'], '');
            }
            if ($field['id'] == 'wbk_email_admin_daily_time') {
                date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
                $time_corr = intval(
                    get_option('wbk_email_admin_daily_time', '68400')
                );
                $midnight = strtotime('today midnight');
                $timestamp = strtotime('today midnight') + $time_corr;
                if ($timestamp < time()) {
                    $timestamp += 86400;
                }
                wp_clear_scheduled_hook('wbk_daily_event');
                wp_schedule_event($timestamp, 'daily', 'wbk_daily_event');
                date_default_timezone_set('UTC');
            }
        }
        do_action('wbk_options_saved');
        WBK_Mixpanel::update_configuration(false);
        wp_send_json_success();
    }

    public function customizeEditor($in)
    {
        if ($this->is_option_page()) {
            $in['forced_root_block'] = false;
            $in['remove_linebreaks'] = false;
            $in['remove_redundant_brs'] = false;
            $in['wpautop'] = false;
            $opts = '*[*]';
            $in['valid_elements'] = $opts;
            $in['extended_valid_elements'] = $opts;
        }
        return $in;
    }
    public function wbk_mce_add_button($buttons)
    {
        if ($this->is_option_page()) {
            $buttons[] = 'wbk_service_name_button';
            $buttons[] = 'wbk_category_names_button';
            $buttons[] = 'wbk_customer_name_button';
            $buttons[] = 'wbk_appointment_day_button';
            $buttons[] = 'wbk_appointment_time_button';
            $buttons[] = 'wbk_appointment_local_day_button';
            $buttons[] = 'wbk_appointment_local_time_button';
            $buttons[] = 'wbk_appointment_id_button';
            $buttons[] = 'wbk_customer_phone_button';
            $buttons[] = 'wbk_customer_email_button';
            $buttons[] = 'wbk_customer_comment_button';
            $buttons[] = 'wbk_customer_custom_button';
            $buttons[] = 'wbk_items_count';
            $buttons[] = 'wbk_total_amount';
            $buttons[] = 'wbk_payment_link';
            $buttons[] = 'wbk_cancel_link';
            $buttons[] = 'wbk_tomorrow_agenda';
            $buttons[] = 'wbk_group_customer';
            $buttons[] = 'wbk_multiple_loop';
            $buttons[] = 'wbk_admin_cancel_link';
            $buttons[] = 'wbk_admin_approve_link';
            $buttons[] = 'wbk_customer_ggcl_link';
            $buttons[] = 'wbk_time_range';
            $buttons[] = 'wbk_user_dashboard_link';
        }
        return $buttons;
    }
    public function wbk_mce_add_javascript($plugin_array)
    {
        if ($this->is_option_page() && !isset($plugin_array['wbk_tinynce'])) {
            $plugin_array['wbk_tinynce'] =
                WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/wbk-tinymce.js';
        }
        return $plugin_array;
    }
    // init wp settings api objects for options page
    public function initSettings()
    {
        // General settings section
        add_settings_section(
            'wbk_general_settings_section',
            __('General Settings', 'webba-booking-lite'),
            [$this, 'wbk_general_settings_section_callback'],
            'wbk-options',
            [
                'icon' => 'general',
                'description' => __(
                    'Configure basic plugin settings, time zones, date formats, and admin interface preferences.',
                    'webba-booking-lite'
                ),
            ]
        );
        add_settings_section(
            'wbk_global_availability_settings_section',
            __('Global Availability & Holidays', 'webba-booking-lite'),
            [$this, 'wbk_appointments_settings_section_callback'],
            'wbk-options',
            [
                'icon' => 'global-availability',
                'description' => __(
                    'Set global working hours and manage holidays/days-off.',
                    'webba-booking-lite'
                ),
            ]
        );
        add_settings_section(
            'wbk_advanced_booking_rules_section',
            __('Advanced Booking Rules', 'webba-booking-lite'),
            [$this, 'wbk_mode_settings_section_callback'],
            'wbk-options',
            [
                'icon' => 'booking-rules',
                'description' => __(
                    'Configure booking rules, restrictions, booking form behavior, and advanced options.',
                    'webba-booking-lite'
                ),
            ]
        );

        add_settings_section(
            'wbk_notifications_settings_section',
            __('Notifications', 'webba-booking-lite'),
            [$this, 'wbk_email_settings_section_callback'],
            'wbk-options',
            [
                'icon' => 'notifications',
                'description' => __(
                    'Configure email and SMS notification settings.',
                    'webba-booking-lite'
                ),
            ]
        );

        add_settings_section(
            'wbk_translation_settings_section',
            __('Wording / Translation', 'webba-booking-lite'),
            [$this, 'wbk_translation_settings_section_callback'],
            'wbk-options',
            [
                'icon' => 'wording-translations',
                'description' => __(
                    'Customize labels, messages, and translate the plugin text.',
                    'webba-booking-lite'
                ),
                'editor_view' => 'tabular',
            ]
        );

        add_settings_section(
            'wbk_payment_settings_section',
            __('Payments', 'webba-booking-lite'),
            [$this, 'wbk_paypal_settings_section_callback'],
            'wbk-options',
            [
                'icon' => 'payments',
                'pro' => true,
                'minimal_plan' => 'standard',
                'description' => __(
                    'Configure payment settings, currency, tax, and payment gateway integrations (PayPal, Stripe, WooCommerce).',
                    'webba-booking-lite'
                ),
            ]
        );
        add_settings_section(
            'wbk_integrations_settings_section',
            __('Integrations', 'webba-booking-lite'),
            [$this, 'wbk_gg_calendar_settings_section_callback'],
            'wbk-options',
            [
                'icon' => 'integrations',
                'pro' => true,
                'minimal_plan' => 'start',
                'description' => __(
                    'Configure integrations with Google Calendar and Zoom.',
                    'webba-booking-lite'
                ),
            ]
        );

        // ========== GENERAL SETTINGS - General Tab ==========
        wbk_opt()->add_option(
            'wbk_timezone',
            'select',
            __('Default Time Zone', 'webba-booking-lite'),
            'wbk_general_settings_section',
            [
                'extra' => array_combine(
                    timezone_identifiers_list(),
                    timezone_identifiers_list()
                ),
                'default' => 'Europe/London',
                'not_translated_title' => 'Default Time Zone',
                'popup' => __(
                    'Select the time zone your business operates in. All booking times will follow this time zone. Your customer will be able to see timeslots in the timezone they select during booking.',
                    'webba-booking-lite'
                ),
                'tab' => 'general',
                'searchable' => true,
            ]
        );

        wbk_opt()->add_option(
            'wbk_date_format_new',
            'select',
            __('Date Format', 'webba-booking-lite'),
            'wbk_general_settings_section',
            [
                'default' => 'inherit',
                'not_translated_title' => 'Date Format',
                'popup' => __(
                    'Choose how dates are displayed to customers in your booking form and notifications.',
                    'webba-booking-lite'
                ),
                'extra' => WBK_Date_Time_Utils::get_supported_date_formats(),
                'tab' => 'general',
            ]
        );

        wbk_opt()->add_option(
            'wbk_time_format_new',
            'select',
            __('Time Format', 'webba-booking-lite'),
            'wbk_general_settings_section',
            [
                'default' => 'inherit',
                'not_translated_title' => 'Time Format',
                'popup' => __(
                    'Choose the time format for displaying times.',
                    'webba-booking-lite'
                ),
                'extra' => WBK_Date_Time_Utils::get_supported_time_formats(),
                'tab' => 'general',
            ]
        );

        wbk_opt()->add_option(
            'wbk_start_of_week_new',
            'select',
            __('Week starts on', 'webba-booking-lite'),
            'wbk_general_settings_section',
            [
                'default' => 'inherit',
                'not_translated_title' => 'Week starts on',
                'popup' => __(
                    'Choose which day the week starts on.',
                    'webba-booking-lite'
                ),
                'extra' => [
                    'inherit' => __(
                        'Inherit from WP Settings',
                        'webba-booking-lite'
                    ),
                    '6' => __('Saturday', 'webba-booking-lite'),
                    '0' => __('Sunday', 'webba-booking-lite'),
                    '1' => __('Monday', 'webba-booking-lite'),
                ],
                'tab' => 'general',
            ]
        );

        wbk_opt()->add_option(
            'wbk_sidebar_help_email',
            'text',
            __('Public Support Email', 'webba-booking-lite'),
            'wbk_general_settings_section',
            [
                'not_translated_title' => 'Public Support Email',
                'popup' => __(
                    'This email will be shown on the booking form sidebar so customers know how to contact you for help.',
                    'webba-booking-lite'
                ),
                'default' => '',
                'tab' => 'general',
            ]
        );

        wbk_opt()->add_option(
            'wbk_sidebar_help_phone',
            'text',
            __('Public Support Phone Number', 'webba-booking-lite'),
            'wbk_general_settings_section',
            [
                'not_translated_title' => 'Public Support Phone Number',
                'popup' => __(
                    'This phone number will be shown on the booking form sidebar as your public support contact.',
                    'webba-booking-lite'
                ),
                'default' => '',
                'tab' => 'general',
            ]
        );

        // ========== GENERAL SETTINGS - Technical Tab ==========
        wbk_opt()->add_option(
            'wbk_check_short_code',
            'checkbox',
            __('Load Webba assets only on Booking pages', 'webba-booking-lite'),
            'wbk_general_settings_section',
            [
                'not_translated_title' =>
                    'Load Webba assets only on Booking pages',
                'popup' => __(
                    'Load Webba scripts and styles only on pages containing the booking form. Improves site performance.',
                    'webba-booking-lite'
                ),
                'checkbox_value' => 'yes',
                'default' => 'yes',
                'tab' => 'technical',
            ]
        );

        wbk_opt()->add_option(
            'wbk_load_js_in_footer',
            'checkbox',
            __('Load javascript files in the footer', 'webba-booking-lite'),
            'wbk_general_settings_section',
            [
                'checkbox_value' => 'true',
                'not_translated_title' => 'Load javascript files in the footer',
                'popup' => __(
                    'Move Webba JavaScript files to the page footer. Can improve speed, but may affect older themes.',
                    'webba-booking-lite'
                ),
                'default' => 'true',
                'tab' => 'technical',
            ]
        );

        // ========== GENERAL SETTINGS - Admin Interface Tab ==========
        wbk_opt()->add_option(
            'wbk_date_format_backend',
            'select',
            __('Date format (backend)', 'webba-booking-lite'),
            'wbk_general_settings_section',
            [
                'default' => 'inherit',
                'extra' => WBK_Date_Time_Utils::get_supported_date_formats(),
                'not_translated_title' => 'Date format (backend)',
                'popup' => __(
                    'Choose how dates are displayed in your admin bookings list and calendar.',
                    'webba-booking-lite'
                ),
                'tab' => 'admin-interface',
            ]
        );

        wbk_opt()->add_option(
            'wbk_customer_name_output',
            'text',
            __('Customer name format (backend)', 'webba-booking-lite'),
            'wbk_general_settings_section',
            [
                'default' => '#name',
                'not_translated_title' => 'Customer name format (backend)',
                'popup' => __(
                    'Choose how the customer\'s name appears in your appointment list. Use placeholders like #name or custom field IDs.',
                    'webba-booking-lite'
                ),
                'tab' => 'admin-interface',
            ]
        );

        wbk_opt()->add_option(
            'wbk_backend_calendar_booking_text',
            'text',
            __('Text details in Schedule calendar', 'webba-booking-lite'),
            'wbk_general_settings_section',
            [
                'default' => '#customer_name [#service_name]',
                'not_translated_title' => 'Text details in Schedule calendar',
                'popup' => __(
                    'Text shown inside each booking block in the Schedule page. You can use any placeholders you would like',
                    'webba-booking-lite'
                ),
                'tab' => 'admin-interface',
            ]
        );

        wbk_opt()->add_option(
            'wbk_date_format_time_slot_schedule',
            'select',
            __('Time Slot display format', 'webba-booking-lite'),
            'wbk_general_settings_section',
            [
                'not_translated_title' => 'Time Slot display format',
                'popup' => __(
                    'Choose how time slots appear in the admin calendar (e.g., "10:00–11:00").',
                    'webba-booking-lite'
                ),
                'default' => 'start-end',
                'extra' => [
                    'start' => __('Start', 'webba-booking-lite'),
                    'start-end' => __('Start - End', 'webba-booking-lite'),
                ],
                'tab' => 'admin-interface',
            ]
        );

        wbk_opt()->add_option(
            'wbk_custom_fields_columns',
            'text',
            __('Custom fields in Bookings table', 'webba-booking-lite'),
            'wbk_general_settings_section',
            [
                'not_translated_title' => 'Custom fields in Bookings table',
                'popup' => __(
                    'Choose which custom fields to display in the Custom Fields column in Bookings table. Enter custom field IDs to display as columns in the admin appointment table. Use square brackets to set custom labels.

Example:
custom-field1[Title 1], custom-field2[Phone Number]',
                    'webba-booking-lite'
                ),
                'default' => '',
                'tab' => 'admin-interface',
            ]
        );

        // ========== ADVANCED BOOKING RULES - General Tab ==========
        wbk_opt()->add_option(
            'wbk_allow_coupons',
            'checkbox',
            __('Enable Coupons', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'not_translated_title' => 'Enable Coupons',
                'popup' => __(
                    'Turn on to activate the coupon feature in the booking system. Read more about Coupons setup.',
                    'webba-booking-lite'
                ),
                'checkbox_value' => 'yes',
                'default' => 'yes',
                'required_plan' => 'premium',
                'tab' => 'general',
            ]
        );

        wbk_opt()->add_option(
            'wbk_create_user_on_booking',
            'checkbox',
            __('Create user account on booking', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'default' => false,
                'checkbox_value' => 'yes',
                'not_translated_title' =>
                    'Create user account on booking',
                'popup' => __(
                    'Turn on to automatically create a user account for the customer when they book an appointment. User account allows them to manage their booking from the user interface.',
                    'webba-booking-lite'
                ),
                'tab' => 'general',
            ]
        );

        wbk_opt()->add_option(
            'wbk_user_dashboard_page_link_new',
            'select',
            __('User account login page', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'not_translated_title' => 'User account login page',
                'popup' => __(
                    'Specify the user dashboard page URL to manage bookings. This page should include the [webba_user_dashboard] shortcode.',
                    'webba-booking-lite'
                ),
                'tab' => 'general',
                'extra' => 'backend',
            ]
        );

        wbk_opt()->add_option(
            'wbk_appointments_default_status',
            'select',
            __('Set default booking status', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'not_translated_title' => 'Set default booking status',
                'popup' => __(
                    'Specify the default status assigned to newly created bookings.',
                    'webba-booking-lite'
                ),
                'default' => 'pending',
                'extra' => [
                    'pending' => __('Pending', 'webba-booking-lite'),
                    'approved' => __('Approved', 'webba-booking-lite'),
                ],
                'tab' => 'general',
            ]
        );

        wbk_opt()->add_option(
            'wbk_set_arrived_after',
            'number',
            __(
                'Set the status to "Arrived" X minutes after the end of the booking',
                'webba-booking-lite'
            ),
            'wbk_advanced_booking_rules_section',
            [
                'not_translated_title' =>
                    'Set the status to "Arrived" X minutes after the end of the booking',
                'popup' => __(
                    'This is useful if you are sending thank-you/feedback emails after the appointment.',
                    'webba-booking-lite'
                ),
                'default' => '30',
                'tab' => 'general',
            ]
        );

        wbk_opt()->add_option(
            'wbk_appointments_delete_not_paid_mode',
            'select',
            __('Delete unpaid bookings', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'default' => 'disabled',
                'extra' => [
                    'disabled' => __('Disabled', 'webba-booking-lite'),
                    'on_booking' => __(
                        'Set expiration time on booking',
                        'webba-booking-lite'
                    ),
                    'on_approve' => __(
                        'Set expiration time on approve',
                        'webba-booking-lite'
                    ),
                ],
                'not_translated_title' => 'Delete unpaid bookings',
                'popup' => __(
                    'Turn on to automatically delete unpaid bookings.',
                    'webba-booking-lite'
                ),
                'tab' => 'general',
            ]
        );

        wbk_opt()->add_option(
            'wbk_appointments_expiration_time',
            'duration',
            __('Delete pending bookings', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'default' => '0',
                'not_translated_title' => 'Delete pending bookings',
                'popup' => __(
                    'Specify the minutes (X) after which "Pending" bookings will be automatically deleted. To disable automatic deletion, set the value to 0.',
                    'webba-booking-lite'
                ),
                'dependency' => [['wbk_appointments_delete_not_paid_mode', '!=', 'disabled']],
                'dependent_value' => [
                    'condition' => ['wbk_appointments_delete_not_paid_mode', '=', 'disabled'],
                    'value' => '0',
                ],
                'tab' => 'general',
            ]
        );

        wbk_opt()->add_option(
            'wbk_cancellation_buffer',
            'duration',
            __('Cancellation buffer', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'not_translated_title' => 'Cancellation buffer',
                'popup' => __(
                    'Set the cutoff time (in minutes) before the scheduled booking when customers cannot cancel or modify their bookings.',
                    'webba-booking-lite'
                ),
                'default' => '120',
                'tab' => 'general',
            ]
        );

        wbk_opt()->add_option(
            'wbk_appointments_allow_cancel_paid_new',
            'checkbox',
            __('Allow cancellation of paid bookings', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'default' => '',
                'checkbox_value' => 'yes',
                'not_translated_title' => 'Allow cancellation of paid bookings',
                'popup' => __(
                    'Turn on to allow customers to cancel their paid bookings.',
                    'webba-booking-lite'
                ),
                'tab' => 'general',
            ]
        );

        wbk_opt()->add_option(
            'wbk_allow_multiple_services',
            'checkbox',
            __('Allow multiple service selection', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'not_translated_title' => 'Allow multiple service selection',
                'popup' => __(
                    'Turn on to allow customers to select multiple services.',
                    'webba-booking-lite'
                ),
                'default' => 'yes',
                'checkbox_value' => 'yes',
                'required_plan' => 'start',
                'available_in_old_free' => true,
                'tab' => 'general',
            ]
        );

        wbk_opt()->add_option(
            'wbk_allow_book_days_in_advance',
            'number',
            __(
                'Allow to book only these many days in advance',
                'webba-booking-lite'
            ),
            'wbk_advanced_booking_rules_section',
            [
                'default' => '0',
                'not_translated_title' =>
                    'Allow to book only these many days in advance',
                'popup' => __(
                    'Set how many days in advance people can book your services',
                    'webba-booking-lite'
                ),
                'tab' => 'general',
            ]
        );

        wbk_opt()->add_option(
            'wbk_gdrp',
            'checkbox',
            __('Make Webba EU GDPR Compliant', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'not_translated_title' => 'Make Webba EU GDPR Compliant',
                'popup' => __(
                    'Turn on to align the booking system with GDPR guidelines, providing enhanced data protection and privacy for customer information. It erases all personal booking information after the appointment is finished and prevents IP address of the user to be stored.',
                    'webba-booking-lite'
                ),
                'checkbox_value' => 'yes',
                'default' => '',
                'tab' => 'general',
            ]
        );

        // ========== ADVANCED BOOKING RULES - Restrictions Tab ==========
        wbk_opt()->add_option(
            'wbk_appointments_auto_lock',
            'checkbox',
            __('Autolock bookings', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'not_translated_title' => 'Autolock bookings',
                'popup' => __(
                    'NEW: Enable autolock settings that will automatically lock services/slots/whole day if certain booking is made.

OLD: When one service is booked, it will automatically lock another one on the same time in the same category, preventing conflicting bookings.',
                    'webba-booking-lite'
                ),
                'checkbox_value' => 'enabled',
                'default' => 'enabled',
                'required_plan' => 'standard',
                'available_in_old_free' => true,
                'tab' => 'restrictions',
            ]
        );

        wbk_opt()->add_option(
            'wbk_appointments_auto_lock_mode',
            'select',
            __('Perform autolock on', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'not_translated_title' => 'Perform autolock on',
                'popup' => __(
                    'Choose whether the autolock feature applies to all services or only services within the same category.',
                    'webba-booking-lite'
                ),
                'default' => 'categories',
                'extra' => [
                    'all' => __('All Services', 'webba-booking-lite'),
                    'categories' => __(
                        'Services in the same category',
                        'webba-booking-lite'
                    ),
                ],
                'dependency' => [['wbk_appointments_auto_lock', '=', 'enabled']],
                'dependent_value' => [
                    'condition' => ['wbk_appointments_auto_lock', '!=', 'enabled'],
                    'value' => 'categories',
                ],
                'tab' => 'restrictions',
            ]
        );

        wbk_opt()->add_option(
            'wbk_appointments_auto_lock_group',
            'select',
            __('Autolock for group booking services', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'default' => 'lock',
                'not_translated_title' => 'Autolock for group booking services',
                'popup' => __(
                    'Choose to either "Lock time slot" or "Reduce count of available places" when a group booking is turned on.',
                    'webba-booking-lite'
                ),
                'extra' => [
                    'lock' => __('Lock time slot', 'webba-booking-lite'),
                    'reduce' => __(
                        'Reduce count of available spaces',
                        'webba-booking-lite'
                    ),
                ],
                'dependency' => [['wbk_appointments_auto_lock', '=', 'enabled']],
                'dependent_value' => [
                    'condition' => ['wbk_appointments_auto_lock', '!=', 'enabled'],
                    'value' => 'lock',
                ],
                'tab' => 'restrictions',
            ]
        );

        wbk_opt()->add_option(
            'wbk_appointments_lock_timeslot_if_parital_booked',
            'select_multiple',
            __(
                'Lock time slot if at least one place is booked',
                'webba-booking-lite'
            ),
            'wbk_advanced_booking_rules_section',
            [
                'extra' => WBK_Model_Utils::get_services(),
                'not_translated_title' =>
                    'Lock time slot if at least one place is booked',
                'popup' => __(
                    'Select the services for which a time slot will be automatically locked once at least one place is booked. Note: With autolock turned on, connected service bookings are considered when locking time slots.',
                    'webba-booking-lite'
                ),
                'tab' => 'restrictions',
            ]
        );

        wbk_opt()->add_option(
            'wbk_appointments_lock_day_if_timeslot_booked',
            'select_multiple',
            __(
                'Lock whole day if at least one time slot is booked',
                'webba-booking-lite'
            ),
            'wbk_advanced_booking_rules_section',
            [
                'extra' => WBK_Model_Utils::get_services(),
                'not_translated_title' =>
                    'Lock whole day if at least one time slot is booked',
                'popup' => __(
                    'Select the services for which a whole day will be automatically locked once at least one time slot is booked. Note: With autolock turned on, connected service bookings are considered when locking a day.',
                    'webba-booking-lite'
                ),
                'tab' => 'restrictions',
            ]
        );

        wbk_opt()->add_option(
            'wbk_appointments_lock_one_before_and_one_after',
            'select_multiple',
            __(
                'Lock one time slot before and after booking',
                'webba-booking-lite'
            ),
            'wbk_advanced_booking_rules_section',
            [
                'extra' => WBK_Model_Utils::get_services(),
                'not_translated_title' =>
                    'Lock one time slot before and after booking',
                'popup' => __(
                    'Select the services for which time slots before and after the booking will be automatically locked. Note: With autolock turned on, connected service bookings are considered when locking time slots.',
                    'webba-booking-lite'
                ),
                'tab' => 'restrictions',
            ]
        );

        wbk_opt()->add_option(
            'wbk_enable_global_limits',
            'checkbox',
            __('Enable Global Limits', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'not_translated_title' => 'Enable Global Limits',
                'checkbox_value' => 'yes',
                'default' => '',
                'tab' => 'restrictions',
            ]
        );

        wbk_opt()->add_option(
            'wbk_appointments_autolock_avail_limit',
            'number',
            __('For the same time slot', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'not_translated_title' => 'For the same time slot',
                'popup' => __(
                    'Set the system-wide maximum number of bookings allowed at any given time for all services. Leave it empty for no restrictions. E.g. if you have 10 services, but just 5 workers, put 5.',
                    'webba-booking-lite'
                ),
                'default' => '',
                'dependency' => [['wbk_enable_global_limits', '=', 'yes']],
                'dependent_value' => [
                    'condition' => ['wbk_enable_global_limits', '!=', 'yes'],
                    'value' => '',
                ],
                'tab' => 'restrictions',
                'sub_type' => 'positive_integer',
            ]
        );

        wbk_opt()->add_option(
            'wbk_appointments_limit_by_day',
            'number',
            __('For the same day', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'not_translated_title' => 'For the same day',
                'popup' => __(
                    'Set the limit for the maximum number of bookings across all services in a day. Leave it empty for no restrictions.',
                    'webba-booking-lite'
                ),
                'default' => '',
                'dependency' => [['wbk_enable_global_limits', '=', 'yes']],
                'dependent_value' => [
                    'condition' => ['wbk_enable_global_limits', '!=', 'yes'],
                    'value' => '',
                ],
                'tab' => 'restrictions',
                'sub_type' => 'positive_integer',
            ]
        );

        wbk_opt()->add_option(
            'wbk_enable_customer_limits',
            'checkbox',
            __('Enable Customer Limits', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'not_translated_title' => 'Enable Customer Limits',
                'checkbox_value' => 'yes',
                'default' => '',
                'tab' => 'restrictions',
            ]
        );

        wbk_opt()->add_option(
            'wbk_appointments_only_one_per_slot',
            'checkbox',
            __('Per time slot', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'not_translated_title' => 'Per time slot',
                'popup' => __(
                    'Turn on to restrict same customer from making multiple bookings for the same time slot using the same email address.',
                    'webba-booking-lite'
                ),
                'checkbox_value' => 'enabled',
                'default' => '',
                'dependency' => [['wbk_enable_customer_limits', '=', 'yes']],
                'dependent_value' => [
                    'condition' => ['wbk_enable_customer_limits', '!=', 'yes'],
                    'value' => '',
                ],
                'tab' => 'restrictions',
            ]
        );

        wbk_opt()->add_option(
            'wbk_appointments_only_one_per_day',
            'checkbox',
            __('Per day', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'not_translated_title' => 'Per day',
                'popup' => __(
                    'Turn on to restrict same customer from making multiple bookings for the same day using the same email address.',
                    'webba-booking-lite'
                ),
                'checkbox_value' => 'enabled',
                'default' => '',
                'dependency' => [['wbk_enable_customer_limits', '=', 'yes']],
                'dependent_value' => [
                    'condition' => ['wbk_enable_customer_limits', '!=', 'yes'],
                    'value' => '',
                ],
                'tab' => 'restrictions',
            ]
        );

        wbk_opt()->add_option(
            'wbk_appointments_only_one_per_service',
            'checkbox',
            __('Per service', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'not_translated_title' => 'Per service',
                'popup' => __(
                    'Turn on to restrict same customers from making multiple bookings for the same service using the same email address.',
                    'webba-booking-lite'
                ),
                'checkbox_value' => 'enabled',
                'default' => '',
                'dependency' => [['wbk_enable_customer_limits', '=', 'yes']],
                'dependent_value' => [
                    'condition' => ['wbk_enable_customer_limits', '!=', 'yes'],
                    'value' => '',
                ],
                'tab' => 'restrictions',
            ]
        );

        // ========== ADVANCED BOOKING RULES - Booking Form Tab ==========
        wbk_opt()->add_option(
            'wbk_form_layout',
            'checkbox',
            __('Show summary sidebar by default', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'default' => 'yes',
                'checkbox_value' => 'yes',
                'not_translated_title' => 'Show summary sidebar by default',
                'popup' => __(
                    'Turn on to show the summary sidebar in the booking form by default.',
                    'webba-booking-lite'
                ),
                'tab' => 'booking-form',
            ]
        );

        wbk_opt()->add_option(
            'wbk_global_timeslot_interval',
            'select',
            __('Global timeslot interval (step)', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'default' => 'duration',
                'not_translated_title' => 'Global timeslot interval (step)',
                'popup' => __(
                    'In what time intervals time slots should appear on the booking form. For example: "30 minutes" creates slots at 9:00, 9:30, 10:00, etc.',
                    'webba-booking-lite'
                ),
                'extra' => [
                    'duration' => __(
                        'duration of service',
                        'webba-booking-lite'
                    ),
                    '15' => __('15 min', 'webba-booking-lite'),
                    '30' => __('30 min', 'webba-booking-lite'),
                    '60' => __('60 min', 'webba-booking-lite'),
                    '90' => __('90 min', 'webba-booking-lite'),
                ],
                'tab' => 'booking-form',
            ]
        );

        wbk_opt()->add_option(
            'wbk_show_booked_slots',
            'checkbox',
            __('Show unavailable time slots', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'not_translated_title' => 'Show unavailable time slots',
                'popup' => __(
                    'Turn on to show booked time slots. If enabled, unavailable time slots will be greyed out.',
                    'webba-booking-lite'
                ),
                'checkbox_value' => 'yes',
                'default' => 'yes',
                'tab' => 'booking-form',
            ]
        );

        wbk_opt()->add_option(
            'wbk_enable_timezone_picker',
            'checkbox',
            __(
                'Enable Timezone picker in the booking form',
                'webba-booking-lite'
            ),
            'wbk_advanced_booking_rules_section',
            [
                'not_translated_title' =>
                    'Enable Timezone picker in the booking form',
                'popup' => __(
                    'Enable timezone picker in the booking form.',
                    'webba-booking-lite'
                ),
                'checkbox_value' => 'yes',
                'default' => 'yes',
                'tab' => 'booking-form',
            ]
        );

        wbk_opt()->add_option(
            'wbk_enable_booking_instructions',
            'checkbox',
            __(
                'Enable Booking Instructions in confirmation step',
                'webba-booking-lite'
            ),
            'wbk_advanced_booking_rules_section',
            [
                'not_translated_title' =>
                    'Enable Booking Instructions in confirmation step',
                'popup' => __(
                    'Enable booking instructions shown at the bottom of the confirmation step',
                    'webba-booking-lite'
                ),
                'checkbox_value' => 'yes',
                'default' => '',
                'tab' => 'booking-form',
            ]
        );

        wbk_opt()->add_option(
            'wbk_after_booking_instructions',
            'editor',
            __('Booking Instructions text', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'not_translated_title' => 'Booking Instructions text',
                'popup' => __(
                    'A message to show on the Thank-You step after booking is placed.',
                    'webba-booking-lite'
                ),
                'default' =>
                    '<h4>Important Information</h4><ul><li>Please arrive 10 minutes before your scheduled appointment time</li><li>Cancellations must be made at least 24 hours in advance</li><li>Bring valid ID for verification at check-in</li></ul>',
                'dependency' => [
                    ['wbk_enable_booking_instructions', '=', 'yes'],
                ],
                'tab' => 'booking-form',
            ]
        );

        wbk_opt()->add_option(
            'wbk_order_service_by',
            'select',
            __('Order services by', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'not_translated_title' => 'Order services by',
                'popup' => __(
                    'Choose between alphabetical order (A–Z) or order by priority for displaying services on the booking form.',
                    'webba-booking-lite'
                ),
                'default' => 'priority_a',
                'extra' => [
                    'a-z' => __('A–Z', 'webba-booking-lite'),
                    'priority_a' => __(
                        'Priority ascending',
                        'webba-booking-lite'
                    ),
                    'priority' => __(
                        'Priority descending',
                        'webba-booking-lite'
                    ),
                ],
                'tab' => 'booking-form',
            ]
        );

        // ========== ADVANCED BOOKING RULES - Advanced Tab ==========
        wbk_opt()->add_option(
            'wbk_allow_cross_midnight',
            'checkbox',
            __('Allow time slots to cross midnight', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'checkbox_value' => 'true',
                'not_translated_title' => 'Allow time slots to cross midnight',
                'popup' => __(
                    'Turn on to allow time slots that extend beyond midnight.',
                    'webba-booking-lite'
                ),
                'default' => '',
                'tab' => 'advanced',
            ]
        );

        wbk_opt()->add_option(
            'wbk_night_hours',
            'text',
            __(
                'Show night hours time slots in previous day',
                'webba-booking-lite'
            ),
            'wbk_advanced_booking_rules_section',
            [
                'default' => '0',
                'not_translated_title' =>
                    'Show night hours time slots in previous day',
                'popup' => __(
                    'Specify the number of hours after midnight to display on the next day\'s calendar.',
                    'webba-booking-lite'
                ),
                'tab' => 'advanced',
                'sub_type' => 'none_negative_integer',
            ]
        );

        wbk_opt()->add_option(
            'wbk_mode_overlapping_availabiliy',
            'checkbox',
            __(
                'Consider the availability of overlapping time intervals',
                'webba-booking-lite'
            ),
            'wbk_advanced_booking_rules_section',
            [
                'default' => 'true',
                'checkbox_value' => 'true',
                'not_translated_title' =>
                    'Consider the availability of overlapping time intervals',
                'popup' => __(
                    'Turn on this option to control the availability of time slots for the same service when they overlap. When turned on, the system will automatically adjust the availability to avoid double booking.',
                    'webba-booking-lite'
                ),
                'tab' => 'advanced',
            ]
        );

        wbk_opt()->add_option(
            'wbk_allow_ongoing_time_slot',
            'checkbox',
            __('Allow booking of the current time slot', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'checkbox_value' => 'yes',
                'default' => '',
                'not_translated_title' =>
                    'Allow booking of the current time slot',
                'popup' => __(
                    'Turn on to prevent customers from making bookings for the current time slot.',
                    'webba-booking-lite'
                ),
                'tab' => 'advanced',
            ]
        );

        /* 
        wbk_opt()->add_option(
            'wbk_show_locked_as_booked',
            'checkbox',
            __('Show locked time slots as booked', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'not_translated_title' => 'Show locked time slots as booked',
                'popup' => __(
                    'Turn on to show locked time slots as "Booked".',
                    'webba-booking-lite'
                ),
                'checkbox_value' => 'yes',
                'dependency' => ['wbk_show_booked_slots' => ':checked'],
            ],
            'advanced'
        );
        */

        // ========== GLOBAL AVAILABILITY & HOLIDAYS - Global Availability Tab ==========
        wbk_opt()->add_option(
            'wbk_global_working_hours',
            'business_hours',
            __('Set global working hours', 'webba-booking-lite'),
            'wbk_global_availability_settings_section',
            [
                'not_translated_title' => 'Set global working hours',
                'popup' => __(
                    'Set global working hours that will be used for all services. You can override it in the specific service.',
                    'webba-booking-lite'
                ),
                'default' => json_encode(
                    WBK_Options_Utils::get_default_business_hours()
                ),
                'tab' => 'global-availability',
            ]
        );

        // ========== GLOBAL AVAILABILITY & HOLIDAYS - Holidays Tab ==========
        wbk_opt()->add_option(
            'wbk_holydays',
            'date_multiple',
            __('Holidays/Days-Off', 'webba-booking-lite'),
            'wbk_global_availability_settings_section',
            [
                'not_translated_title' => 'Holidays/Days-Off',
                'popup' => __(
                    'Set dates when your business is closed, and no new bookings will be accepted.',
                    'webba-booking-lite'
                ),
                'default' => '',
                'tab' => 'holidays',
            ]
        );
        wbk_opt()->add_option(
            'wbk_recurring_holidays',
            'checkbox',
            __('Make it recurring yearly', 'webba-booking-lite'),
            'wbk_global_availability_settings_section',
            [
                'checkbox_value' => 'true',
                'not_translated_title' => 'Make it recurring yearly',
                'popup' => __(
                    'Turn on to set holidays as recurring yearly.',
                    'webba-booking-lite'
                ),
                'default' => '',
                'tab' => 'holidays',
            ]
        );

        $format = WBK_Date_Time_Utils::get_time_format();
        date_default_timezone_set('UTC');
        $data_time = [];
        $data_keys = [];
        for ($i = 0; $i < 86400; $i += 600) {
            $data_time[] = wp_date(
                $format,
                $i,
                new DateTimeZone(date_default_timezone_get())
            );
            $data_keys[] = $i;
        }
        $data_time = array_combine($data_keys, $data_time);

        // ========== NOTIFICATIONS - General Tab ==========
        wbk_opt()->add_option(
            'wbk_email_admin_daily_time',
            'select',
            __(
                'Reminder sending time (for both Email and SMS)',
                'webba-booking-lite'
            ),
            'wbk_notifications_settings_section',
            [
                'default' => '43200',
                'extra' => $data_time,
                'not_translated_title' =>
                    'Reminder sending time (for both Email and SMS)',
                'popup' => __(
                    'Set the preferred hour for email reminders sent to customers and admins, based on your local timezone.',
                    'webba-booking-lite'
                ),
                'required_plan' => 'start',
                'available_in_old_free' => true,
                'tab' => 'general',
            ]
        );

        // ========== NOTIFICATIONS - Email Tab ==========
        wbk_opt()->add_option(
            'wbk_email_notice',
            'notice',
            __('Read more on Email Notifications', 'webba-booking-lite'),
            'wbk_notifications_settings_section',
            [
                'not_translated_title' => 'Read more on Email Notifications',
                'popup' => __(
                    '<a href="https://webba-booking.com/documentation/email-notifications/" target="_blank">Read more on Email Notifications</a>',
                    'webba-booking-lite'
                ),
                'tab' => 'email',
            ]
        );

        wbk_opt()->add_option(
            'wbk_super_admin_email',
            'text',
            __('Global Admin Notifications Email(s)', 'webba-booking-lite'),
            'wbk_notifications_settings_section',
            [
                'not_translated_title' => 'Global Admin Notifications Email(s)',
                'popup' => __(
                    'Set the main admin notification email address(es) of staff who needs to receive bookings related notifications. Use comma to add multiple. (It can be overriden at service level)',
                    'webba-booking-lite'
                ),
                'default' => get_option('admin_email'),
                'tab' => 'email',
                'sub_type' => 'email',
            ]
        );

        wbk_opt()->add_option(
            'wbk_from_name',
            'text',
            __('From: name', 'webba-booking-lite'),
            'wbk_notifications_settings_section',
            [
                'not_translated_title' => 'From: name',
                'popup' => __(
                    'Enter the name that will be displayed as the sender in the email notifications.',
                    'webba-booking-lite'
                ),
                'default' => __('Webba Booking Demo', 'webba-booking-lite'),
                'tab' => 'email',
            ]
        );
        wbk_opt()->add_option(
            'wbk_from_email',
            'text',
            __('From: email', 'webba-booking-lite'),
            'wbk_notifications_settings_section',
            [
                'not_translated_title' => 'From: email',
                'popup' => __(
                    'Enter the email that will be displayed as the sender in the email notifications.',
                    'webba-booking-lite'
                ),
                'default' => 'demo@webba-booking.com',
                'tab' => 'email',
                'sub_type' => 'email',
            ]
        );

        wbk_opt()->add_option(
            'wbk_email_override_replyto',
            'checkbox',
            __(
                'Override default reply-to headers with booking-related data',
                'webba-booking-lite'
            ),
            'wbk_notifications_settings_section',
            [
                'checkbox_value' => 'yes',
                'not_translated_title' =>
                    'Override default reply-to headers with booking-related data',
                'popup' => __(
                    'When Enabled:
Customer Notifications: The reply-to email address is set to the email specified in the service settings.
Admin Notifications: The reply-to email address is set to the customer\'s email address.
When Disabled: The \'From email\' value is used as the reply-to address for notifications.',
                    'webba-booking-lite'
                ),
                'default' => '',
                'tab' => 'email',
            ]
        );

        wbk_opt()->add_option(
            'wbk_email_reminder_days',
            'select',
            __(
                'How many days in advance to send email booking reminder',
                'webba-booking-lite'
            ),
            'wbk_notifications_settings_section',
            [
                'default' => '1',
                'not_translated_title' =>
                    'How many days in advance to send email booking reminder',
                'popup' => __(
                    'Select the timing for the reminder notification. For instance, set the value to 0 for the day of booking, 1 for one day before the booking, 2 for two days before, and so on.',
                    'webba-booking-lite'
                ),
                'required_plan' => 'start',
                'tab' => 'email',
                'extra' => [
                    '0' => __( 'On the day of booking', 'webba-booking-lite' ),
                    '1' => __( 'One day before booking', 'webba-booking-lite' ),
                    '2' => __( 'Two days before booking', 'webba-booking-lite' ),
                    '3' => __( 'Three days before booking', 'webba-booking-lite' ),
                    '4' => __( 'Four days before booking', 'webba-booking-lite' ),
                    '5' => __( 'Five days before booking', 'webba-booking-lite' ),
                    '6' => __( 'Six days before booking', 'webba-booking-lite' ),
                    '7' => __( 'Seven days before booking', 'webba-booking-lite' ),
                ],
            ]
        );

        wbk_opt()->add_option(
            'wbk_email_customer_arrived_delay',
            'number',
            __(
                'Set email delay for booking status "Arrived"',
                'webba-booking-lite'
            ),
            'wbk_notifications_settings_section',
            [
                'default' => '',
                'not_translated_title' =>
                    'Set email delay for booking status "Arrived"',
                'popup' => __(
                    'Specify the delay (in hours) for the "Arrived" email notification. Alternatively, leave this field empty to send the notification immediately after the status is changed to "Arrived". Useful for asking reviews on services.',
                    'webba-booking-lite'
                ),
                'tab' => 'email',
                'sub_type' => 'positive_integer',
            ]
        );

        wbk_opt()->add_option(
            'wbk_email_landing_new',
            'select',
            __(
                'Page used for Payment, Cancelation and Approval links',
                'webba-booking-lite'
            ),
            'wbk_notifications_settings_section',
            [
                'not_translated_title' =>
                    'Page used for Payment, Cancelation and Approval links',
                'popup' => __(
                    'Specify the landing page URL for payment or cancelation. This page should include the [webbabooking] shortcode.',
                    'webba-booking-lite'
                ),
                'default' =>
                    'https://webba-booking.com/booking-form-landing-page',
                'tab' => 'email',
                'extra' => 'backend',
            ]
        );

        // ========== PAYMENTS - General Tab ==========
        wbk_opt()->add_option(
            'wbk_payment_price_format_new',
            'text',
            __('Currency Symbol', 'webba-booking-lite'),
            'wbk_payment_settings_section',
            [
                'not_translated_title' => 'Currency Symbol',
                'popup' => __(
                    'Enter a symbol or text for your main currency (e.g. $ or USD)',
                    'webba-booking-lite'
                ),
                'default' => '$',
                'tab' => 'general',
            ]
        );

        wbk_opt()->add_option(
            'wbk_currency_symbol_position',
            'select',
            __('Show currency symbol before/after', 'webba-booking-lite'),
            'wbk_payment_settings_section',
            [
                'not_translated_title' => 'Show currency symbol before/after',
                'popup' => __(
                    'Choose to show currency symbol/text before or after the price',
                    'webba-booking-lite'
                ),
                'default' => 'before',
                'extra' => [
                    'before' => __('Before the price', 'webba-booking-lite'),
                    'after' => __('After the price', 'webba-booking-lite'),
                ],
                'tab' => 'general',
            ]
        );

        wbk_opt()->add_option(
            'wbk_price_separator',
            'text',
            __('Fraction separator in prices', 'webba-booking-lite'),
            'wbk_payment_settings_section',
            [
                'default' => '.',
                'not_translated_title' => 'Fraction separator in prices',
                'popup' => __(
                    'Choose the symbol or character to separate decimals in prices. E.g. Use either a period (.) or a comma (,).',
                    'webba-booking-lite'
                ),
                'tab' => 'general',
            ]
        );

        wbk_opt()->add_option(
            'wbk_price_fractional',
            'text',
            __('Number of digits after separator', 'webba-booking-lite'),
            'wbk_payment_settings_section',
            [
                'default' => '2',
                'not_translated_title' => 'Number of digits after separator',
                'popup' => __(
                    'Write the number of decimal places to show for prices. E.g. Write 1 for prices to appear as 25.1 or 2 for prices to appear as 25.10.',
                    'webba-booking-lite'
                ),
                'tab' => 'general',
                'sub_type' => 'positive_integer',
            ]
        );

        wbk_opt()->add_option(
            'wbk_bank_transfer_details',
            'textarea',
            __('Bank transfer details', 'webba-booking-lite'),
            'wbk_payment_settings_section',
            [
                'not_translated_title' => 'Bank transfer details',
                'popup' => __(
                    'if you offer manual bank transfer, enter your Bank Transfer details here',
                    'webba-booking-lite'
                ),
                'default' => '',
                'tab' => 'general',
            ]
        );

        wbk_opt()->add_option(
            'wbk_add_tax_on_top',
            'checkbox',
            __('Add Tax on top of the service price', 'webba-booking-lite'),
            'wbk_payment_settings_section',
            [
                'not_translated_title' => 'Add Tax on top of the service price',
                'popup' => __(
                    'If tax is not included in the service price, enable adding it on top. If disabled, it will show "Tax included" under the payment summary.',
                    'webba-booking-lite'
                ),
                'checkbox_value' => 'yes',
                'default' => '',
                'tab' => 'general',
            ]
        );

        wbk_opt()->add_option(
            'wbk_general_tax',
            'number',
            __('Tax amount in %', 'webba-booking-lite'),
            'wbk_payment_settings_section',
            [
                'not_translated_title' => 'Tax amount in %',
                'popup' => __(
                    'Tax used for online payments.',
                    'webba-booking-lite'
                ),
                'default' => '0',
                'dependency' => [['wbk_add_tax_on_top', '=', 'yes']],
                'dependent_value' => [
                    'condition' => ['wbk_add_tax_on_top', '!=', 'yes'],
                    'value' => '0',
                ],
                'tab' => 'general',
            ]
        );

        wbk_opt()->add_option(
            'wbk_do_not_tax_deposit',
            'checkbox',
            __('Do not tax the service fee', 'webba-booking-lite'),
            'wbk_payment_settings_section',
            [
                'checkbox_value' => 'yes',
                'not_translated_title' => 'Do not tax the service fee',
                'popup' => __(
                    'Turn on to avoid adding tax to the service fees. Important: when this is turned on, do not use subtotal and tax placeholders.',
                    'webba-booking-lite'
                ),
                'default' => '',
                'dependency' => [['wbk_add_tax_on_top', '=', 'yes']],
                'dependent_value' => [
                    'condition' => ['wbk_add_tax_on_top', '!=', 'yes'],
                    'value' => '',
                ],
                'tab' => 'general',
            ]
        );

        wbk_opt()->add_option(
            'wbk_appointments_allow_payments',
            'checkbox',
            __(
                'Allow payments only for approved bookings',
                'webba-booking-lite'
            ),
            'wbk_payment_settings_section',
            [
                'not_translated_title' =>
                    'Allow payments only for approved bookings',
                'popup' => __(
                    'Turn on to restrict payment functionality to approved bookings only.',
                    'webba-booking-lite'
                ),
                'checkbox_value' => 'yes',
                'default' => '',
                'tab' => 'general',
            ]
        );

        // ========== WORDING/TRANSLATIONS - FORM FIELDS Subsection ==========
        wbk_opt()->add_option(
            'wbk_category_label',
            'text',
            __('Category label', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Select category', 'webba-booking-lite'),
                'not_translated_title' => 'Category label',
                'popup' => __(
                    'Category label on the booking form.',
                    'webba-booking-lite'
                ),
                'tab' => 'form-fields',
            ]
        );
        wbk_opt()->add_option(
            'wbk_date_basic_label',
            'text',
            __('Date label', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Book an appointment on', 'webba-booking-lite'),
                'not_translated_title' => 'Date label',
                'popup' => __(
                    'Date label on the booking form.',
                    'webba-booking-lite'
                ),
                'tab' => 'form-fields',
            ]
        );

        wbk_opt()->add_option(
            'wbk_date_input_placeholder',
            'text_alfa_numeric',
            __('Select date input placeholder', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('date', 'webba-booking-lite'),
                'not_translated_title' => 'Select date input placeholder',
                'popup' => __(
                    'Select date input placeholder on the booking form.',
                    'webba-booking-lite'
                ),
                'tab' => 'form-fields',
            ]
        );

        wbk_opt()->add_option(
            'wbk_email_label',
            'text',
            __('Email label', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Email', 'webba-booking-lite'),
                'not_translated_title' => 'Email label',
                'popup' => __(
                    'Email label on the booking form.',
                    'webba-booking-lite'
                ),
                'tab' => 'form-fields',
            ]
        );
        wbk_opt()->add_option(
            'wbk_phone_label',
            'text',
            __('Phone label', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Phone', 'webba-booking-lite'),
                'not_translated_title' => 'Phone label',
                'popup' => __(
                    'Phone label on the booking form.',
                    'webba-booking-lite'
                ),
                'tab' => 'form-fields',
            ]
        );

        wbk_opt()->add_option(
            'wbk_payment_pay_with_paypal_btn_text',
            'text_alfa_numeric',
            __('PayPal option label', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('PayPal', 'webba-booking-lite'),
                'not_translated_title' => 'PayPal option label',
                'popup' => __(
                    'Label for PayPal payment method',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );

        wbk_opt()->add_option(
            'wbk_paypal_message',
            'text',
            __('PayPal message', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'You will be redirected to PayPal in the next screen.',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'PayPal message',
                'popup' => __(
                    'Message that appears when the user selects PayPal as the payment method.',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );

        wbk_opt()->add_option(
            'wbk_stripe_button_text',
            'text_alfa_numeric',
            __('Credit Card option label', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Credit Card', 'webba-booking-lite'),
                'not_translated_title' => 'Credit card option label',
                'popup' => __(
                    'Label for Stripe payment method',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );

        wbk_opt()->add_option(
            'wbk_stripe_api_error_message',
            'text',
            __('Stripe API error message', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Payment failed: #response',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'Stripe API error message',
                'popup' => __(
                    'Stripe API error message during payment processing. Placeholders: #response.',
                    'webba-booking-lite'
                ),
                'tab' => 'validation',
            ]
        );
        wbk_opt()->add_option(
            'wbk_pay_on_arrival_button_text',
            'text_alfa_numeric',
            __('Pay on arrival option label', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('On Arrival', 'webba-booking-lite'),
                'not_translated_title' => 'Pay on arrival option label',
                'popup' => __(
                    'Label for Pay on arrival payment method.',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );

        wbk_opt()->add_option(
            'wbk_pay_on_arrival_message',
            'text',
            __(
                'Message for Pay on arrival payment method',
                'webba-booking-lite'
            ),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'You will be able to pay by cash or credit card once you arrive.',
                    'webba-booking-lite'
                ),
                'not_translated_title' =>
                    'Message for Pay on arrival payment method',
                'popup' => __(
                    'Message for Pay on arrival payment method.',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );
        wbk_opt()->add_option(
            'wbk_bank_transfer_button_text',
            'text_alfa_numeric',
            __('Bank transfer option label', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Bank Transfer', 'webba-booking-lite'),
                'not_translated_title' => 'Bank transfer option label',
                'popup' => __(
                    'Label for Bank transfer payment method.',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );

        wbk_opt()->add_option(
            'wbk_bank_transfer_message',
            'text',
            __(
                'Message for Bank transfer payment method',
                'webba-booking-lite'
            ),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Pay by the bank transfer.',
                    'webba-booking-lite'
                ),
                'not_translated_title' =>
                    'Message for Bank transfer payment method',
                'popup' => __(
                    'Message for Bank transfer payment method.',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );

        wbk_opt()->add_option(
            'wbk_google_pay_button_text',
            'text',
            __('Google Pay button text', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Google Pay', 'webba-booking-lite'),
                'not_translated_title' => 'Google Pay button text',
                'popup' => __('Google Pay button text.', 'webba-booking-lite'),
                'tab' => 'payments',
            ]
        );

        wbk_opt()->add_option(
            'wbk_apple_pay_button_text',
            'text',
            __('Apple Pay button text', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Apple Pay', 'webba-booking-lite'),
                'not_translated_title' => 'Apple Pay button text',
                'popup' => __('Apple Pay button text.', 'webba-booking-lite'),
                'tab' => 'payments',
            ]
        );

        wbk_opt()->add_option(
            'wbk_stripe_other_button_text',
            'text',
            __('Stripe Other button text', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Other payment methods', 'webba-booking-lite'),
                'not_translated_title' => 'Stripe Other button text',
                'popup' => __(
                    'Stripe Other button text.',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );

        wbk_opt()->add_option(
            'wbk_product_meta_key',
            'text',
            __('Meta key for WooCommerce product', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Booking', 'webba-booking-lite'),
                'not_translated_title' => 'Meta key for WooCommerce product',
                'popup' => __(
                    'Label for services in WooCommerce.',
                    'webba-booking-lite'
                ),
                'tab' => 'form-fields',
            ]
        );
        wbk_opt()->add_option(
            'wbk_woo_button_text',
            'text_alfa_numeric',
            __('WooCommerce option label', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('WooCommerce', 'webba-booking-lite'),
                'not_translated_title' => 'WooCommerce option label',
                'popup' => __('User in the cart item', 'webba-booking-lite'),
                'tab' => 'form-fields',
            ]
        );
        wbk_opt()->add_option(
            'wbk_woo_message',
            'text',
            __('WooCommerce message', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'You will be able to checkout in the next screen.',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'WooCommerce message',
                'popup' => __(
                    'Message that appears when the user selects WooCommerce as the payment method.',
                    'webba-booking-lite'
                ),
                'tab' => 'form-fields',
            ]
        );

        wbk_opt()->add_option(
            'wbk_payment_item_name',
            'text',
            __('Payment item text', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' =>
                    '#service_name on #appointment_day at #appointment_time',
                'not_translated_title' => 'Payment item text',
                'popup' =>
                    '<a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/placeholders/">' .
                    __('List of available placeholders', 'webba-booking-lite') .
                    '</a>',
                'tab' => 'payments',
            ]
        );

        wbk_opt()->add_option(
            'wbk_tax_label',
            'text',
            __('Tax label', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Tax', 'webba-booking-lite'),
                'not_translated_title' => 'Tax label',
                'popup' => __(
                    'Label for the tax in payment details',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );

        wbk_opt()->add_option(
            'wbk_payment_discount_item',
            'text',
            __('Discount label', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Discount (-)', 'webba-booking-lite'),
                'not_translated_title' => 'Discount label',
                'popup' => __('Label for the discount', 'webba-booking-lite'),
                'tab' => 'payments',
            ]
        );
        wbk_opt()->add_option(
            'wbk_payment_total_title',
            'text',
            __('Total title', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Total', 'webba-booking-lite'),
                'not_translated_title' => 'Total title',
                'popup' => __(
                    'Label for the total amount in payment details',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );
        wbk_opt()->add_option(
            'wbk_nothing_to_pay_message',
            'text',
            __('No bookings for payment message', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'There are no bookings available for payment.',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'No bookings for payment message',
                'popup' => __(
                    'Message shown when there are no bookings available for payment',
                    'webba-booking-lite'
                ),
                'tab' => 'validation',
            ]
        );

        wbk_opt()->add_option(
            'wbk_booking_cancel_error_message',
            'text',
            __('Cancellation error message', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Unable to cancel booking, please check the email you\'ve entered.',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'Cancellation error message',
                'popup' => __(
                    'Message shown when an error occurs on cancelation',
                    'webba-booking-lite'
                ),
                'tab' => 'validation',
            ]
        );

        wbk_opt()->add_option(
            'wbk_email_landing_text',
            'text',
            __(
                'Text of the payment link sent to a customer',
                'webba-booking-lite'
            ),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Click here to pay for your booking.',
                    'webba-booking-lite'
                ),
                'not_translated_title' =>
                    'Text of the payment link sent to a customer',
                'popup' => __(
                    'Text of the payment link sent to a customer in the email notification.',
                    'webba-booking-lite'
                ),
                'extra' => 'backend',
                'tab' => 'integrations',
            ]
        );

        $form_fields = WBK_Form_Builder_Utils::get_all_fields_merged();        
        foreach ($form_fields as $field) {
            wbk_opt()->add_option(
                'webba_form_field_' . $field['slug'],
                'text',
                __(
                    $field['placeholder'] ?? $field['checkboxText'] ?? '',
                    'webba-booking-lite'
                ),
                'wbk_translation_settings_section',
                [
                    'default' => $field['placeholder'] ?? $field['checkboxText'] ?? '',
                    'not_translated_title' => 'Text of the form field ' . $field['slug'],
                    'popup' => __(
                        'Text of the form field ' . $field['slug'],
                        'webba-booking-lite'
                    ),
                    'tab' => 'form-fields',
                ]
            );
        }
        // ========== WORDING/TRANSLATIONS - INTEGRATIONS Subsection ==========
        wbk_opt()->add_option(
            'wbk_email_landing_text_cancel',
            'text',
            __(
                'Text of the cancelation link sent to a customer',
                'webba-booking-lite'
            ),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Click here to cancel your booking.',
                    'webba-booking-lite'
                ),
                'not_translated_title' =>
                    'Text of the cancelation link sent to a customer',
                'popup' => __(
                    'Text of the booking cancelation link sent to a customer in the email notification.',
                    'webba-booking-lite'
                ),
                'tab' => 'integrations',
            ]
        );
        wbk_opt()->add_option(
            'wbk_email_landing_text_cancel_admin',
            'text',
            __(
                'Text of the cancellation link sent to an admin',
                'webba-booking-lite'
            ),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Click here to cancel this booking.',
                    'webba-booking-lite'
                ),
                'not_translated_title' =>
                    'Text of the cancellation link sent to an admin',
                'popup' => __(
                    'Text of the booking cancelation link sent to the admin in the email notification.',
                    'webba-booking-lite'
                ),
                'tab' => 'integrations',
            ]
        );

        wbk_opt()->add_option(
            'wbk_email_landing_text_approve_admin',
            'text',
            __(
                'Text of the approval link sent to an admin',
                'webba-booking-lite'
            ),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Click here to approve this booking.',
                    'webba-booking-lite'
                ),
                'not_translated_title' =>
                    'Text of the approval link sent to an admin',
                'popup' => __(
                    'Text of the booking approval link sent to the admin in the email notification.',
                    'webba-booking-lite'
                ),
                'tab' => 'integrations',
            ]
        );
        wbk_opt()->add_option(
            'wbk_email_landing_text_gg_event_add',
            'text',
            __(
                'Text of the link for adding event to customer\'s Google Calendar',
                'webba-booking-lite'
            ),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Click here to add this event to your Google Calendar.',
                    'webba-booking-lite'
                ),
                'not_translated_title' =>
                    'Text of the link for adding event to customers Google Calendar',
                'popup' => __(
                    'Text of the link to add a booking to Google Calendar. Sent to a customer in the email notification.',
                    'webba-booking-lite'
                ),
                'tab' => 'integrations',
            ]
        );

        wbk_opt()->add_option(
            'wbk_gg_calendar_event_title',
            'text',
            __(
                'Google calendar event / iCal summary (for admin)',
                'webba-booking-lite'
            ),
            'wbk_translation_settings_section',
            [
                'default' => '#customer_name',
                'not_translated_title' =>
                    'Google calendar event / iCal summary (for admin)',
                'popup' =>
                    __('Available placeholders:', 'webba-booking-lite') .
                    ' #customer_name, #customer_phone, #customer_email, #customer_comment, #items_count, #appointment_id, #customer_custom, #total_amount, #service_name, #status' .
                    '<br />' .
                    __('Placeholder for custom field:', 'webba-booking-lite') .
                    ' #field_ + custom field id. Example: #field_custom-field-1',
                'tab' => 'integrations',
            ]
        );
        wbk_opt()->add_option(
            'wbk_gg_calendar_event_description',
            'text',
            __(
                'Google calendar event / iCal description (for admin)',
                'webba-booking-lite'
            ),
            'wbk_translation_settings_section',
            [
                'default' => '#customer_name #customer_phone',
                'not_translated_title' =>
                    'Google calendar event / iCal description (for admin)',
                'popup' =>
                    '<a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/placeholders/">' .
                    __('List of available placeholders', 'webba-booking-lite') .
                    '</a>',
                'tab' => 'integrations',
            ]
        );
        wbk_opt()->add_option(
            'wbk_gg_calendar_event_title_customer',
            'text',
            __(
                'Google calendar event / iCal summary (for customer)',
                'webba-booking-lite'
            ),
            'wbk_translation_settings_section',
            [
                'default' => '#service_name',
                'not_translated_title' =>
                    'Google calendar event / iCal summary (for customer)',
                'popup' =>
                    '<a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/placeholders/">' .
                    __('List of available placeholders', 'webba-booking-lite') .
                    '</a>',
                'tab' => 'integrations',
            ]
        );
        wbk_opt()->add_option(
            'wbk_gg_calendar_event_description_customer',
            'text',
            __(
                'Google calendar event / iCal description (for customer)',
                'webba-booking-lite'
            ),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Your appointment id is #appointment_id',
                    'webba-booking-lite'
                ),
                'not_translated_title' =>
                    'Google calendar event / iCal description (for customer)',
                'popup' =>
                    '<a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/placeholders/">' .
                    __('List of available placeholders', 'webba-booking-lite') .
                    '</a>',
                'tab' => 'integrations',
            ]
        );
        wbk_opt()->add_option(
            'wbk_product_meta_key',
            'text',
            __('Meta key for WooCommerce product', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Booking', 'webba-booking-lite'),
                'not_translated_title' => 'Meta key for WooCommerce product',
                'popup' => __(
                    'Label for services in WooCommerce.',
                    'webba-booking-lite'
                ),
                'tab' => 'integrations',
            ]
        );
        wbk_opt()->add_option(
            'wbk_woo_button_text',
            'text_alfa_numeric',
            __('WooCommerce option label', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('WooCommerce', 'webba-booking-lite'),
                'not_translated_title' => 'WooCommerce option label',
                'popup' => __('User in the cart item', 'webba-booking-lite'),
                'tab' => 'integrations',
            ]
        );
        wbk_opt()->add_option(
            'wbk_woo_message',
            'text',
            __('WooCommerce message', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'You will be able to checkout in the next screen.',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'WooCommerce message',
                'popup' => __(
                    'Message that appears when the user selects WooCommerce as the payment method.',
                    'webba-booking-lite'
                ),
                'tab' => 'integrations',
            ]
        );
        wbk_opt()->add_option(
            'wbk_daily_limit_reached_message',
            'text',
            __('Daily limit message', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Daily booking limit is reached, please select another date.',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'Daily limit message',
                'popup' => __(
                    'Message shown when daily booking limit reached. Adjust the daily booking limits in the Settings -> Booking Rules.',
                    'webba-booking-lite'
                ),
                'tab' => 'validation',
            ]
        );

        // ========== PAYMENTS - PayPal Tab ==========
            wbk_opt()->add_option(
                'wbk_paypal_notice',
                'notice',
                __('PayPal Integration Documentation ->', 'webba-booking-lite'),
                'wbk_payment_settings_section',
                [
                    'not_translated_title' =>
                        'PayPal Integration Documentation ->',
                    'popup' => __(
                        '<a href="https://webba-booking.com/documentation/paypal-integration/" target="_blank">PayPal Integration Documentation -></a>',
                        'webba-booking-lite'
                    ),
                    'required_plan' => 'standard',
                    'tab' => 'paypal',
                ]
            );

            wbk_opt()->add_option(
                'wbk_paypal_test_mode',
                'checkbox',
                __('TEST Mode', 'webba-booking-lite'),
                'wbk_payment_settings_section',
                [
                    'default' => '',
                    'not_translated_title' => 'TEST Mode',
                    'checkbox_value' => 'yes',
                    'popup' => __(
                        'Select "Sandbox" to test the integration, and "Live" for actual payment processing.',
                        'webba-booking-lite'
                    ),
                    'required_plan' => 'standard',
                    'tab' => 'paypal',
                ]
            );
            wbk_opt()->add_option(
                'wbk_paypal_sandbox_clientid',
                'text',
                __('PayPal Sandbox ClientID', 'webba-booking-lite'),
                'wbk_payment_settings_section',
                [
                    'not_translated_title' => 'PayPal Sandbox ClientID',
                    'popup' => __(
                        'Enter the Client ID provided by PayPal for the Sandbox mode integration. <a href="https://www.paypal.com/us/cshelp/article/how-do-i-create-rest-api-credentials-ts1949" rel="noopener" target="_blank">Read more on how to set up PayPal integration.</a>',
                        'webba-booking-lite'
                    ),
                    'default' => '',
                    'required_plan' => 'standard',
                    'tab' => 'paypal',
                ]
            );
            wbk_opt()->add_option(
                'wbk_paypal_sandbox_secret',
                'password',
                __('PayPal Sandbox Secret', 'webba-booking-lite'),
                'wbk_payment_settings_section',
                [
                    'not_translated_title' => 'PayPal Sandbox Secret',
                    'popup' =>
                        'Enter the Client ID provided by PayPal for the Sandbox mode integration. <a href="https://www.paypal.com/us/cshelp/article/how-do-i-create-rest-api-credentials-ts1949" rel="noopener" target="_blank">Read more on how to set up PayPal integration.</a>',
                    'default' => '',
                    'required_plan' => 'standard',
                    'tab' => 'paypal',
                ]
            );
            wbk_opt()->add_option(
                'wbk_paypal_live_clientid',
                'text',
                __('PayPal Live ClientID', 'webba-booking-lite'),
                'wbk_payment_settings_section',
                [
                    'not_translated_title' => 'PayPal Live ClientID',
                    'popup' =>
                        'Enter the Client ID provided by PayPal for the Sandbox mode integration. <a href="https://www.paypal.com/us/cshelp/article/how-do-i-create-rest-api-credentials-ts1949" rel="noopener" target="_blank">Read more on how to set up PayPal integration.</a>',
                    'default' => '',
                    'required_plan' => 'standard',
                    'tab' => 'paypal',
                ]
            );
            wbk_opt()->add_option(
                'wbk_paypal_live_secret',
                'password',
                __('PayPal Live Secret', 'webba-booking-lite'),
                'wbk_payment_settings_section',
                [
                    'not_translated_title' => 'PayPal Live Secret',
                    'popup' =>
                        'Enter the Client ID provided by PayPal for the Sandbox mode integration. <a href="https://www.paypal.com/us/cshelp/article/how-do-i-create-rest-api-credentials-ts1949" rel="noopener" target="_blank">Read more on how to set up PayPal integration.</a>',
                    'default' => '',
                    'required_plan' => 'standard',
                    'tab' => 'paypal',
                ]
            );
            wbk_opt()->add_option(
                'wbk_paypal_currency',
                'select',
                __('PayPal currency', 'webba-booking-lite'),
                'wbk_payment_settings_section',
                [
                    'not_translated_title' => 'PayPal currency',
                    'popup' => __(
                        'Select the currency to use for PayPal payments.',
                        'webba-booking-lite'
                    ),
                    'default' => 'USD',
                    'extra' => [
                        'AUD' => __('Australian Dollar', 'webba-booking-lite'),
                        'BRL' => __('Brazilian Real', 'webba-booking-lite'),
                        'CAD' => __('Canadian Dollar', 'webba-booking-lite'),
                        'CZK' => __('Czech Koruna', 'webba-booking-lite'),
                        'DKK' => __('Danish Krone', 'webba-booking-lite'),
                        'EUR' => __('Euro', 'webba-booking-lite'),
                        'HKD' => __('Hong Kong Dollar', 'webba-booking-lite'),
                        'HUF' => __('Hungarian Forint', 'webba-booking-lite'),
                        'ILS' => __('Israeli New Sheqel', 'webba-booking-lite'),
                        'JPY' => __('Japanese Yen', 'webba-booking-lite'),
                        'MYR' => __('Malaysian Ringgit', 'webba-booking-lite'),
                        'MXN' => __('Mexican Peso', 'webba-booking-lite'),
                        'NOK' => __('Norwegian Krone', 'webba-booking-lite'),
                        'NZD' => __('New Zealand Dollar', 'webba-booking-lite'),
                        'PHP' => __('Philippine Peso', 'webba-booking-lite'),
                        'PLN' => __('Polish Zloty', 'webba-booking-lite'),
                        'GBP' => __('Pound Sterling', 'webba-booking-lite'),
                        'SGD' => __('Singapore Dollar', 'webba-booking-lite'),
                        'SEK' => __('Swedish Krona', 'webba-booking-lite'),
                        'CHF' => __('Swiss Franc', 'webba-booking-lite'),
                        'TWD' => __('Taiwan New Dollar', 'webba-booking-lite'),
                        'THB' => __('Thai Baht', 'webba-booking-lite'),
                        'USD' => __('U.S. Dollar', 'webba-booking-lite'),
                    ],
                    'required_plan' => 'standard',
                    'tab' => 'paypal',
                ]
            );

            wbk_opt()->add_option(
                'wbk_paypal_redirect_url_new',
                'select',
                __(
                    'Redirect to page when payment is successful',
                    'webba-booking-lite'
                ),
                'wbk_payment_settings_section',
                [
                    'not_translated_title' =>
                        'Redirect to page when payment is successful',
                    'popup' => __(
                        'Enter the URL where customers should be redirected after a successful payment. If left empty, customers will stay on the booking form page after completing the payment.',
                        'webba-booking-lite'
                    ),
                    'default' => '',
                    'required_plan' => 'standard',
                    'tab' => 'paypal',
                    'extra' => 'backend',
                ]
            );
            wbk_opt()->add_option(
                'wbk_paypal_hide_address',
                'checkbox',
                __('Hide address', 'webba-booking-lite'),
                'wbk_payment_settings_section',
                [
                    'not_translated_title' => 'Hide address',
                    'popup' => __(
                        'Turn on to hide address on PayPal checkout.',
                        'webba-booking-lite'
                    ),
                    'checkbox_value' => 'enabled',
                    'default' => 'enabled',
                    'required_plan' => 'standard',
                    'tab' => 'paypal',
                ]
            );
            wbk_opt()->add_option(
                'wbk_paypal_multiplier',
                'text',
                __('Currency multiplier', 'webba-booking-lite'),
                'wbk_payment_settings_section',
                [
                    'not_translated_title' => 'Currency multiplier',
                    'popup' => __(
                        'Add the currency multiplier to update the price before it is sent to PayPal. It is helpful when your service price is set in a currency not supported by PayPal, and you need to convert it to a PayPal-supported currency before checkout. If you do not require currency conversion, leave this field empty.',
                        'webba-booking-lite'
                    ),
                    'default' => '',
                    'required_plan' => 'standard',
                    'tab' => 'paypal',
                    'sub_type' => 'none_negative_float',
                ]
            );
            wbk_opt()->add_option(
                'wbk_zoom_link_text',
                'text',
                __('Text of the Zoom meeting URL', 'webba-booking-lite'),
                'wbk_translation_settings_section',
                [
                    'default' => __(
                        'Click here to open your meeting in Zoom',
                        'webba-booking-lite'
                    ),
                    'not_translated_title' => 'Text of the Zoom meeting URL',
                    'popup' => __(
                        'Text displayed as the link to the Zoom meeting.',
                        'webba-booking-lite'
                    ),
                    'tab' => 'integrations',
                ]
            );
        

        // ========== PAYMENTS - Stripe Tab ==========
        wbk_opt()->add_option(
            'wbk_stripe_notice',
            'notice',
            __('Stripe Integration Documentation ->', 'webba-booking-lite'),
            'wbk_payment_settings_section',
            [
                'not_translated_title' =>
                    'Stripe Integration Documentation ->',
                'popup' => __(
                    '<a href="https://webba-booking.com/documentation/stripe-integration/" target="_blank">Stripe Integration Documentation -></a>',
                    'webba-booking-lite'
                ),
                'required_plan' => 'standard',
                'tab' => 'stripe',
            ]
        );

        wbk_opt()->add_option(
            'wbk_stripe_test_mode',
            'checkbox',
            __('TEST Mode', 'webba-booking-lite'),
            'wbk_payment_settings_section',
            [
                'not_translated_title' => 'TEST Mode',
                'popup' => __(
                    'Select "Sandbox" to test the integration, and "Live" for actual payment processing.',
                    'webba-booking-lite'
                ),
                'checkbox_value' => 'yes',
                'default' => '',
                'required_plan' => 'standard',
                'tab' => 'stripe',
            ]
        );
        wbk_opt()->add_option(
            'wbk_stripe_sandbox_publishable_key',
            'text',
            __('Stripe Sandbox Publishable Key', 'webba-booking-lite'),
            'wbk_payment_settings_section',
            [
                'not_translated_title' => 'Stripe Sandbox Publishable Key',
                'popup' => __(
                    'Enter the SANDBOX publishable API key provided by Stripe for your integration. Read more on how to set up Stripe integration.',
                    'webba-booking-lite'
                ),
                'default' => '',
                'required_plan' => 'standard',
                'tab' => 'stripe',
            ]
        );
        wbk_opt()->add_option(
            'wbk_stripe_sandbox_secret_key',
            'password',
            __('Stripe Sandbox Secret Key', 'webba-booking-lite'),
            'wbk_payment_settings_section',
            [
                'not_translated_title' => 'Stripe Sandbox Secret Key',
                'popup' => __(
                    'Enter the SANDBOX Secret API key provided by Stripe for your integration. Read more on how to set up Stripe integration.',
                    'webba-booking-lite'
                ),
                'default' => '',
                'required_plan' => 'standard',
                'tab' => 'stripe',
            ]
        );
        wbk_opt()->add_option(
            'wbk_stripe_publishable_key',
            'text',
            __('Stripe Live Publishable key', 'webba-booking-lite'),
            'wbk_payment_settings_section',
            [
                'not_translated_title' => 'Stripe Live Publishable key',
                'popup' => __(
                    'Enter the publishable API key provided by Stripe for your integration. Read more on how to set up Stripe integration.',
                    'webba-booking-lite'
                ),
                'default' => '',
                'required_plan' => 'standard',
                'tab' => 'stripe',
            ]
        );
        wbk_opt()->add_option(
            'wbk_stripe_secret_key',
            'password',
            __('Secret key', 'webba-booking-lite'),
            'wbk_payment_settings_section',
            [
                'not_translated_title' => 'Secret key',
                'popup' => __(
                    'Enter the Secret API key provided by Stripe for your integration. Read more on how to set up Stripe integration.',
                    'webba-booking-lite'
                ),
                'default' => '',
                'required_plan' => 'standard',
                'tab' => 'stripe',
            ]
        );
        wbk_opt()->add_option(
            'wbk_stripe_currency',
            'select',
            __('Stripe currency', 'webba-booking-lite'),
            'wbk_payment_settings_section',
            [
                'default' => 'USD',
                'not_translated_title' => 'Stripe currency',
                'popup' => __(
                    'Select the currency to use for Stripe payments.',
                    'webba-booking-lite'
                ),
                'extra' => array_combine(
                    WBK_Stripe::get_currencies(),
                    WBK_Stripe::get_currencies()
                ),
                'required_plan' => 'standard',
                'tab' => 'stripe',
            ]
        );

        wbk_opt()->add_option(
            'wbk_stripe_additional_fields',
            'select_multiple',
            __('Select payment fields to show', 'webba-booking-lite'),
            'wbk_payment_settings_section',
            [
                'default' => '',
                'extra' => WBK_Model_Utils::get_payment_fields(),
                'not_translated_title' => 'Select payment fields to show',
                'popup' => __(
                    'Select the additional fields that you wish to include in the Stripe payment process.',
                    'webba-booking-lite'
                ),
                'required_plan' => 'standard',
                'tab' => 'stripe',
            ]
        );
        wbk_opt()->add_option(
            'wbk_stripe_redirect_url_new',
            'select',
            __(
                'Redirect to page when payment is successful',
                'webba-booking-lite'
            ),
            'wbk_payment_settings_section',
            [
                'not_translated_title' =>
                    'Redirect to page when payment is successful',
                'popup' => __(
                    'Enter the URL where customers should be redirected after successful payment. If left empty, customers will stay on the booking form page after completing the payment.',
                    'webba-booking-lite'
                ),
                'default' => '',
                'required_plan' => 'standard',
                'tab' => 'stripe',
                'extra' => 'backend',
            ]
        );
        wbk_opt()->add_option(
            'wbk_stripe_hide_postal_code',
            'checkbox',
            __('Hide the postal code field', 'webba-booking-lite'),
            'wbk_payment_settings_section',
            [
                'not_translated_title' => 'Hide the postal code field',
                'popup' => __(
                    'Turn on to hide the postal code field in the Stripe checkout.',
                    'webba-booking-lite'
                ),
                'checkbox_value' => 'yes',
                'default' => '',
                'required_plan' => 'standard',
                'tab' => 'stripe',
            ]
        );
        wbk_opt()->add_option(
            'wbk_stripe_card_font_size_mobile',
            'text',
            __(
                'Font size for card element on mobile devices',
                'webba-booking-lite'
            ),
            'wbk_payment_settings_section',
            [
                'not_translated_title' =>
                    'Font size for card element on mobile devices',
                'popup' => __(
                    'Set the card element font size on mobile devices. Leave empty for the default input field font size.',
                    'webba-booking-lite'
                ),
                'default' => '',
                'required_plan' => 'standard',
                'tab' => 'stripe',
            ]
        );
        wbk_opt()->add_option(
            'wbk_stripe_override_error_messages',
            'checkbox',
            __(
                'Override Stripe card element error messages',
                'webba-booking-lite'
            ),
            'wbk_payment_settings_section',
            [
                'not_translated_title' =>
                    'Override Stripe card element error messages',
                'popup' => __(
                    'Turn on to override the default error message displayed for Stripe card elements. To customize the error message, navigate to Wording/Translation → Advanced Settings and modify the "Stripe card element error message" according to your preferences.',
                    'webba-booking-lite'
                ),
                'checkbox_value' => 'yes',
                'default' => '',
                'required_plan' => 'standard',
                'tab' => 'stripe',
            ]
        );
        wbk_opt()->add_option(
            'wbk_stripe_load_js',
            'select',
            __('Load Stripe javascript', 'webba-booking-lite'),
            'wbk_payment_settings_section',
            [
                'not_translated_title' => 'Load Stripe javascript',
                'popup' => __(
                    'Select how the Stripe Javascript needs to be loaded.',
                    'webba-booking-lite'
                ),
                'default' => 'yes',
                'extra' => [
                    'yes' => __('Yes', 'webba-booking-lite'),
                    'no' => __('No', 'webba-booking-lite'),
                ],
                'required_plan' => 'standard',
                'tab' => 'stripe',
            ]
        );
        wbk_opt()->add_option(
            'wbk_stripe_api_version',
            'select',
            __('Load Stripe API', 'webba-booking-lite'),
            'wbk_payment_settings_section',
            [
                'not_translated_title' => 'Load Stripe API',
                'popup' => __(
                    'Select how to load Stripe API. Set \'no\' or 6.21.1 only if there is a conflict with another plugin that uses Stripe.',
                    'webba-booking-lite'
                ),
                'default' => '7.26.0',
                'extra' => [
                    '7.26.0' => __(
                        'Yes, load version 7.26.0',
                        'webba-booking-lite'
                    ),
                    '6.21.1' => __(
                        'Load version 6.21.1',
                        'webba-booking-lite'
                    ),
                    'no' => __('No', 'webba-booking-lite'),
                ],
                'required_plan' => 'standard',
                'tab' => 'stripe',
            ]
        );

        // ========== INTEGRATIONS - Google Calendar ==========
        wbk_opt()->add_option(
            'wbk_gg_notice',
            'notice',
            __(
                'Google Calendar Integration Documentation ->',
                'webba-booking-lite'
            ),
            'wbk_integrations_settings_section',
            [
                'not_translated_title' =>
                    'Google Calendar Integration Documentation ->',
                'popup' => __(
                    '<a href="https://webba-booking.com/documentation/google-calendar-integration/" target="_blank">Google Calendar Integration Documentation -></a>',
                    'webba-booking-lite'
                ),
                'required_plan' => 'start',
                'tab' => 'google-calendar',
            ]
        );

        wbk_opt()->add_option(
            'wbk_gg_when_add',
            'select',
            __('Admin calendar event creation', 'webba-booking-lite'),
            'wbk_integrations_settings_section',
            [
                'default' => 'onbooking',
                'not_translated_title' => 'Admin calendar event creation',
                'popup' => __(
                    'Specify when the event should be added to the admin\'s calendar when creating bookings. ',
                    'webba-booking-lite'
                ),
                'extra' => [
                    'onbooking' => __('On booking', 'webba-booking-lite'),
                    'onpaymentorapproval' => __(
                        'On payment or approval',
                        'webba-booking-lite'
                    ),
                ],
                'required_plan' => 'start',
                'tab' => 'google-calendar',
            ]
        );

        wbk_opt()->add_option(
            'wbk_gg_created_by',
            'text',
            __(
                '"Created by" property for the events',
                'webba-booking-lite'
            ),
            'wbk_integrations_settings_section',
            [
                'default' => 'webba_booking',
                'not_translated_title' =>
                    'Created by property for the events',
                'popup' => __(
                    'Do not change this option if you do not plan to use the same Google calendars on different websites with Webba Booking.',
                    'webba-booking-lite'
                ),
                'required_plan' => 'start',
                'tab' => 'google-calendar',
            ]
        );
            /*            wbk_opt()->add_option(
                'wbk_gg_customers_time_zone',
                'select',
                __('Customer\'s time zone', 'webba-booking-lite'),
                'wbk_integrations_settings_section',
                [
                    'default' => 'webba',
                    'not_translated_title' => 'Customers time zone',
                    'popup' => __(
                        'Choose the time zone to be used for events added to the customer\'s calendar.',
                        'webba-booking-lite'
                    ),
                    'extra' => [
                        'webba' => __(
                            'Use Webba Booking time zone',
                            'webba-booking-lite'
                        ),
                        'customer' => __(
                            'Use customer\'s calendar time zone',
                            'webba-booking-lite'
                        ),
                    ],
                ],
                'advanced'
            );*/

        wbk_opt()->add_option(
            'wbk_gg_2way_group',
            'select',
            __('Group services synchronization', 'webba-booking-lite'),
            'wbk_integrations_settings_section',
            [
                'default' => 'lock',
                'not_translated_title' => 'Group services synchronization',
                'popup' => __(
                    'Choose how group services are integrated with the events in Google calendar.',
                    'webba-booking-lite'
                ),
                'extra' => [
                    'lock' => __('Lock time slot', 'webba-booking-lite'),
                    'reduce' => __(
                        'Reduce count of available slots',
                        'webba-booking-lite'
                    ),
                ],
                'required_plan' => 'start',
                'tab' => 'google-calendar',
            ]
        );
        wbk_opt()->add_option(
            'wbk_gg_ignore_free',
            'checkbox',
            __('Ignore free events', 'webba-booking-lite'),
            'wbk_integrations_settings_section',
            [
                'checkbox_value' => 'yes',
                'not_translated_title' => 'Ignore free events',
                'popup' => __(
                    'Turn on if free Google Calendar events should not be considered in 2-ways synchronization.',
                    'webba-booking-lite'
                ),
                'default' => '',
                'required_plan' => 'start',
                'tab' => 'google-calendar',
            ]
        );
        wbk_opt()->add_option(
            'wbk_ignore_webba_events',
            'checkbox',
            __(
                'Ignore events added by Webba Booking',
                'webba-booking-lite'
            ),
            'wbk_integrations_settings_section',
            [
                'checkbox_value' => 'yes',
                'not_translated_title' =>
                    'Ignore events added by Webba Booking',
                'popup' => __(
                    'Turn on if Webba Booking events should not be considered in 2-ways synchronization.',
                    'webba-booking-lite'
                ),
                'default' => 'yes',
                'required_plan' => 'start',
                'tab' => 'google-calendar',
            ]
        );
        wbk_opt()->add_option(
            'wbk_gg_group_service_export',
            'select',
            __('Export for group services', 'webba-booking-lite'),
            'wbk_integrations_settings_section',
            [
                'default' => 'event_foreach_appointment',
                'not_translated_title' => 'Export for group services',
                'popup' => __(
                    'Select the method of exporting group services.',
                    'webba-booking-lite'
                ),
                'extra' => [
                    'event_foreach_appointment' => __(
                        'Add event for each appointment',
                        'webba-booking-lite'
                    ),
                    'one_event' => __(
                        'Add one event',
                        'webba-booking-lite'
                    ),
                ],
                'required_plan' => 'start',
                'tab' => 'google-calendar',
            ]
        );
        wbk_opt()->add_option(
            'wbk_gg_send_alerts_to_admin',
            'checkbox',
            __(
                'Send an alert email to administrator if any issue occurred with the integration',
                'webba-booking-lite'
            ),
            'wbk_integrations_settings_section',
            [
                'checkbox_value' => 'yes',
                'not_translated_title' =>
                    'Send an alert email to administrator if any issue occurred with the integration',
                'popup' => __(
                    'Turn on to alert admin about issues with integration. Notification is sent to the email set in the service settings.',
                    'webba-booking-lite'
                ),
                'default' => '',
                'required_plan' => 'start',
                'tab' => 'google-calendar',
            ]
        );
        if (version_compare(PHP_VERSION, '7.4.0') >= 0) {
            $version_list = ['2.9.1' => '2.9.1'];
        } else {
            $version_list = ['2.5' => '2.5'];
        }
        if (version_compare(PHP_VERSION, '8.0.0') >= 0) {
            $version_list = ['2.9.1' => '2.9.1', '2.13.0' => '2.13.0'];
        }
        wbk_opt()->add_option(
            'wbk_gg_client_version',
            'select',
            __('Version of Google Client API', 'webba-booking-lite'),
            'wbk_integrations_settings_section',
            [
                'default' => '2.9.1',
                'extra' => $version_list,
                'not_translated_title' => 'Version of Google Client API',
                'popup' => __(
                    'Modify this setting only if you have other plugins in your WordPress that utilize a different version of the Google API and conflicts have arisen.',
                    'webba-booking-lite'
                ),
                'required_plan' => 'start',
                'tab' => 'google-calendar',
            ]
        );
        wbk_opt()->add_option(
            'wbk_gg_show_legacy_keys',
            'checkbox',
            __(
                'Show legacy Google Calendar API keys',
                'webba-booking-lite'
            ),
            'wbk_integrations_settings_section',
            [
                'not_translated_title' =>
                    'Show legacy Google Calendar API keys',
                'popup' => __(
                    'It\'s for Webba Versions below 6.x.x',
                    'webba-booking-lite'
                ),
                'checkbox_value' => 'yes',
                'default' => '',
                'required_plan' => 'start',
                'tab' => 'google-calendar',
            ]
        );
        wbk_opt()->add_option(
            'wbk_gg_clientid',
            'text',
            __('Google API Client ID (deprecated)', 'webba-booking-lite'),
            'wbk_integrations_settings_section',
            [
                'not_translated_title' =>
                    'Google API Client ID (deprecated)',
                'popup' => __(
                    'Enter the Google API Client ID. <a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/google-calendar/">Read more on how to set up Google Calendar integration.</a>.',
                    'webba-booking-lite'
                ),
                'default' => '',
                'dependency' => [['wbk_gg_show_legacy_keys', '=', 'yes']],
                'required_plan' => 'start',
                'tab' => 'google-calendar',
            ]
        );
        wbk_opt()->add_option(
            'wbk_gg_secret',
            'password',
            __(
                'Google API Client Secret (deprecated)',
                'webba-booking-lite'
            ),
            'wbk_integrations_settings_section',
            [
                'not_translated_title' =>
                    'Google API Client Secret (deprecated)',
                'popup' => __(
                    'Enter the Google API Client Secret. <a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/google-calendar/">Read more on how to set up Google Calendar integration.</a>.',
                    'webba-booking-lite'
                ),
                'default' => '',
                'dependency' => [['wbk_gg_show_legacy_keys', '=', 'yes']],
                'required_plan' => 'start',
                'tab' => 'google-calendar',
            ]
        );
        /*
        wbk_opt()->add_option(
            'wbk_skip_on_arrival_payment_method',
            'checkbox',
            __(
                'Skip payment method selection for "Pay on arrival"',
                'webba-booking-lite'
            ),
            'wbk_advanced_booking_rules_section',
            [
                'default' => 'true',
                'checkbox_value' => 'true',
                'not_translated_title' =>
                    'Skip payment method selection for Pay on arrival',
                'popup' => __(
                    'Skip payment method selection for "Pay on arrival" method if there is only one method available',
                    'webba-booking-lite'
                ),
            ],
            'advanced'
        );
        */
        // ========== PAYMENTS - WooCommerce Tab ==========
        wbk_opt()->add_option(
            'wbk_woo_notice',
            'notice',
            __(
                'WooCommerce Integration Documentation ->',
                'webba-booking-lite'
            ),
            'wbk_payment_settings_section',
            [
                'not_translated_title' =>
                    'WooCommerce Integration Documentation ->',
                'popup' => __(
                    '<a href="https://webba-booking.com/documentation/woocommerce-integration/" target="_blank">WooCommerce Integration Documentation -></a>',
                    'webba-booking-lite'
                ),
                'required_plan' => 'standard',
                'tab' => 'woocommerce',
            ]
        );

        wbk_opt()->add_option(
            'wbk_woo_update_status',
            'select',
            __(
                'Status of the booking paid with WooCommerce',
                'webba-booking-lite'
            ),
            'wbk_payment_settings_section',
            [
                'not_translated_title' =>
                    'Status of the booking paid with WooCommerce',
                'popup' => __(
                    'Choose the desired status update after a booking has been paid through WooCommerce.',
                    'webba-booking-lite'
                ),
                'default' => 'disabled',
                'extra' => [
                    'pending' => __('Pending', 'webba-booking-lite'),
                    'approved' => __('Approved', 'webba-booking-lite'),
                    'disabled' => __(
                        'Disabled (do not update status)',
                        'webba-booking-lite'
                    ),
                ],
                'required_plan' => 'standard',
                'tab' => 'woocommerce',
            ]
        );

        wbk_opt()->add_option(
            'wbk_woo_check_coupons_inwebba',
            'checkbox',
            __(
                'Validate WooCommerce coupons as Webba Coupons',
                'webba-booking-lite'
            ),
            'wbk_payment_settings_section',
            [
                'not_translated_title' =>
                    'Validate WooCommerce coupons as Webba Coupons',
                'popup' => __(
                    'Enable this option if you need to validate wooCommerce coupons as Webba coupons.',
                    'webba-booking-lite'
                ),
                'checkbox_value' => 'yes',
                'default' => '',
                'required_plan' => 'standard',
                'tab' => 'woocommerce',
            ]
        );
        wbk_opt()->add_option(
            'wbk_woo_prefil_fields',
            'checkbox',
            __(
                'Prefill fields in WooCommerce checkout with data used in the booking form',
                'webba-booking-lite'
            ),
            'wbk_payment_settings_section',
            [
                'default' => 'true',
                'checkbox_value' => 'true',
                'not_translated_title' =>
                    'Prefill fields in WooCommerce checkout with data used in the booking form',
                'popup' => __(
                    'Turn on to prefill fields in the WooCommerce checkout with the data entered in the Webba booking form.',
                    'webba-booking-lite'
                ),
                'required_plan' => 'standard',
                'tab' => 'woocommerce',
            ]
        );

        wbk_opt()->add_option(
            'wbk_woo_auto_add_to_cart',
            'checkbox',
            __('Automatically add to cart', 'webba-booking-lite'),
            'wbk_payment_settings_section',
            [
                'default' => '',
                'checkbox_value' => 'true',
                'not_translated_title' => 'Automatically add to cart',
                'popup' => __(
                    'If this option is enabled, the user will be redirected to the shopping cart page after submitting the booking form.',
                    'webba-booking-lite'
                ),
                'required_plan' => 'standard',
                'tab' => 'woocommerce',
            ]
        );
        wbk_opt()->add_option(
            'wbk_woo_complete_action',
            'select_multiple',
            __('Action for \'Paid\' booking status', 'webba-booking-lite'),
            'wbk_payment_settings_section',
            [
                'extra' => [
                    'complete_status' => __(
                        'Complete status set',
                        'webba-booking-lite'
                    ),
                    'thankyou_message' => __(
                        'Thank you message shown',
                        'webba-booking-lite'
                    ),
                    'complete_payment' => __(
                        'Payment completed in WooCommerce',
                        'webba-booking-lite'
                    ),
                ],
                'not_translated_title' => 'Action for Paid booking status',
                'popup' => __(
                    'Select which action will set the booking status as \'Paid\'',
                    'webba-booking-lite'
                ),
                'default' => '',
                'required_plan' => 'standard',
                'tab' => 'woocommerce',
            ]
        );

        // ========== INTEGRATIONS - Zoom ==========
        wbk_opt()->add_option(
            'wbk_zoom_notice',
            'notice',
            __('Zoom Integration Documentation ->', 'webba-booking-lite'),
            'wbk_integrations_settings_section',
            [
                'not_translated_title' =>
                    'Zoom Integration Documentation ->',
                'popup' => __(
                    '<a href="https://webba-booking.com/documentation/zoom-integration/" target="_blank">Zoom Integration Documentation -></a>',
                    'webba-booking-lite'
                ),
                'required_plan' => 'premium',
                'tab' => 'zoom',
            ]
        );

        wbk_opt()->add_option(
            'wbk_zoom_client_id',
            'text',
            __('Client ID', 'webba-booking-lite'),
            'wbk_integrations_settings_section',
            [
                'not_translated_title' => 'Client ID',
                'popup' =>
                    'Enter the Zoom Client ID. <a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/zoom-integration/">Read more on how to set up Zoom integration.</a>',
                'default' => '',
                'required_plan' => 'premium',
                'tab' => 'zoom',
            ]
        );
        wbk_opt()->add_option(
            'wbk_zoom_client_secret',
            'password',
            __('Client secret', 'webba-booking-lite'),
            'wbk_integrations_settings_section',
            [
                'not_translated_title' => 'Client secret',
                'popup' =>
                    'Enter the Zoom Client secret. <a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/zoom-integration/">Read more on how to set up Zoom integration.</a>',
                'default' => '',
                'required_plan' => 'premium',
                'tab' => 'zoom',
            ]
        );
        wbk_opt()->add_option(
            'wbk_zoom_auth_stat',
            'zoom_auth',
            __('Authorization', 'webba-booking-lite'),
            'wbk_integrations_settings_section',
            [
                'not_translated_title' => 'Authorization',
                'required_plan' => 'premium',
                'tab' => 'zoom',
            ]
        );
        wbk_opt()->add_option(
            'wbk_zoom_when_add',
            'select',
            __('Zoom meeting creation', 'webba-booking-lite'),
            'wbk_integrations_settings_section',
            [
                'not_translated_title' => 'Zoom meeting creation',
                'popup' => __(
                    'Select when to create the meeting in Zoom - on booking or on payment or booking approval.',
                    'webba-booking-lite'
                ),
                'default' => 'onbooking',
                'extra' => [
                    'onbooking' => __('On booking', 'webba-booking-lite'),
                    'onpaymentorapproval' => __(
                        'On payment or approval',
                        'webba-booking-lite'
                    ),
                ],
                'required_plan' => 'premium',
                'tab' => 'zoom',
            ]
        );

        // ========== NOTIFICATIONS - SMS Tab ==========
        wbk_opt()->add_option(
            'wbk_sms_notice',
            'notice',
            __('Read more on Twilio integration', 'webba-booking-lite'),
            'wbk_notifications_settings_section',
            [
                'not_translated_title' => 'Read more on Twilio integration',
                'popup' => __(
                    '<a href="https://webba-booking.com/documentation/sms-notifications/" target="_blank">Read more on Twilio integration</a>',
                    'webba-booking-lite'
                ),
                'required_plan' => 'premium',
                'tab' => 'SMS',
            ]
        );

        wbk_opt()->add_option(
            'wbk_twilio_account_sid',
            'text',
            __('Twilio ACCOUNT SID', 'webba-booking-lite'),
            'wbk_notifications_settings_section',
            [
                'not_translated_title' => 'Twilio ACCOUNT SID',
                'popup' =>
                    'Enter the Twilio ACCOUNT SID. <a rel="noopener" target="_blank" href="https://support.twilio.com/hc/en-us/articles/14726256820123-What-is-a-Twilio-Account-SID-and-where-can-I-find-it-">Read more.</a>',
                'default' => '',
                'required_plan' => 'premium',
                'tab' => 'SMS',
            ]
        );

        wbk_opt()->add_option(
            'wbk_twilio_auth_token',
            'password',
            __('Twilio AUTH TOKEN', 'webba-booking-lite'),
            'wbk_notifications_settings_section',
            [
                'not_translated_title' => 'Twilio AUTH TOKEN',
                'popup' =>
                    'Enter the Twilio AUTH TOKEN. <a rel="noopener" target="_blank" href="https://support.twilio.com/hc/en-us/articles/223136027-Auth-Tokens-and-How-to-Change-Them">Read more.</a>',
                'default' => '',
                'required_plan' => 'premium',
                'tab' => 'SMS',
            ]
        );

        wbk_opt()->add_option(
            'wbk_twilio_phone_number',
            'text',
            __(
                'Twilio phone number or Messaging Service SID',
                'webba-booking-lite'
            ),
            'wbk_notifications_settings_section',
            [
                'not_translated_title' =>
                    'Twilio phone number or Messaging Service SID',
                'popup' => __(
                    'The phone number must start with a + sign.',
                    'webba-booking-lite'
                ),
                'default' => '',
                'required_plan' => 'premium',
                'tab' => 'SMS',
            ]
        );
        wbk_opt()->add_option(
            'wbk_sms_send_on_booking',
            'checkbox',
            __(
                'Send SMS after customer makes a booking',
                'webba-booking-lite'
            ),
            'wbk_notifications_settings_section',
            [
                'checkbox_value' => 'true',
                'not_translated_title' =>
                    'Send SMS after customer makes a booking',
                'popup' => __(
                    'Turn on to send booking SMS notifications to customers when they make a booking.',
                    'webba-booking-lite'
                ),
                'default' => 'true',
                'required_plan' => 'premium',
                'tab' => 'SMS',
            ]
        );
        wbk_opt()->add_option(
            'wbk_sms_send_on_manual_booking',
            'checkbox',
            __(
                'Send SMS after admin adds a booking manually',
                'webba-booking-lite'
            ),
            'wbk_notifications_settings_section',
            [
                'checkbox_value' => 'true',
                'dependency' => [['wbk_sms_send_on_booking', '=', 'true']],
                'dependent_value' => [
                    'condition' => [
                        'wbk_sms_send_on_booking',
                        '!=',
                        'true',
                    ],
                    'value' => '',
                ],
                'not_translated_title' =>
                    'Send SMS after admin adds a booking manually',
                'popup' => __(
                    'Turn on to send booking SMS notifications to customers when the booking was done by an admin.',
                    'webba-booking-lite'
                ),
                'default' => '',
                'required_plan' => 'premium',
                'tab' => 'SMS',
            ]
        );
        wbk_opt()->add_option(
            'wbk_sms_message_on_booking',
            'textarea',
            __('Booking SMS Template', 'webba-booking-lite'),
            'wbk_notifications_settings_section',
            [
                'dependency' => [['wbk_sms_send_on_booking', '=', 'true']],
                'default' => __(
                    'Dear #customer_name, You have successfully booked #service_name on #appointment_day at #appointment_time.',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'Booking SMS Template',
                'popup' =>
                    __(
                        'Customize the booking SMS message. <a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/placeholders/">',
                        'webba-booking-lite'
                    ) .
                    __(
                        'List of available placeholders',
                        'webba-booking-lite'
                    ) .
                    '</a>',
                'required_plan' => 'premium',
                'tab' => 'SMS',
            ]
        );
        wbk_opt()->add_option(
            'wbk_sms_send_reminder',
            'checkbox',
            __('Send booking reminder SMS', 'webba-booking-lite'),
            'wbk_notifications_settings_section',
            [
                'checkbox_value' => 'true',
                'not_translated_title' => 'Send booking reminder SMS',
                'popup' => __(
                    'Turn on to send booking reminder SMS notifications to customers.',
                    'webba-booking-lite'
                ),
                'default' => 'true',
                'required_plan' => 'premium',
                'tab' => 'SMS',
            ]
        );
        wbk_opt()->add_option(
            'wbk_sms_reminder_days',
            'select',
            __(
                'Send reminder to customer X days before booking',
                'webba-booking-lite'
            ),
            'wbk_notifications_settings_section',
            [
                'dependency' => [['wbk_sms_send_reminder', '=', 'yes']],
                'dependent_value' => [
                    'condition' => ['wbk_sms_send_reminder', '!=', 'yes'],
                    'value' => '1',
                ],
                'default' => '1',
                'not_translated_title' =>
                    'Send reminder to customer X days before booking',
                'popup' => __(
                    'Select the timing for the booking reminder SMS. For instance, set the value to 0 for the day of booking, 1 for one day before the booking, 2 for two days before, and so on.',
                    'webba-booking-lite'
                ),
                'extra' => array_combine(range(0, 30), range(0, 30)),
                'required_plan' => 'premium',
                'tab' => 'SMS',
            ]
        );
        wbk_opt()->add_option(
            'wbk_sms_message_reminder',
            'textarea',
            __('Reminder message Template', 'webba-booking-lite'),
            'wbk_notifications_settings_section',
            [
                'dependency' => [['wbk_sms_send_reminder', '=', 'true']],
                'default' => __(
                    'Dear #customer_name, we would like to remind that you have booked the #service_name tomorrow at #appointment_time.',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'Reminder message Template',
                'popup' =>
                    'Customize the booking reminder SMS message. <a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/placeholders/">' .
                    __(
                        'List of available placeholders',
                        'webba-booking-lite'
                    ) .
                    '</a>',
                'required_plan' => 'premium',
                'tab' => 'SMS',
            ]
        );
        wbk_opt()->add_option(
            'wbk_sms_send_on_payment',
            'checkbox',
            __('Send payment received SMS', 'webba-booking-lite'),
            'wbk_notifications_settings_section',
            [
                'checkbox_value' => 'true',
                'default' => 'true',
                'not_translated_title' => 'Send payment received SMS',
                'popup' => __(
                    'Turn on to send payment received SMS notifications to customers once their booking has been paid.',
                    'webba-booking-lite'
                ),
                'required_plan' => 'premium',
                'tab' => 'SMS',
            ]
        );

        wbk_opt()->add_option(
            'wbk_sms_message_on_payment',
            'textarea',
            __('Payment received SMS Template', 'webba-booking-lite'),
            'wbk_notifications_settings_section',
            [
                'dependency' => [['wbk_sms_send_on_payment', '=', 'true']],
                'default' => __(
                    'Dear #customer_name, your booking on #appointment_day at #appointment_time has been paid.',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'Payment received SMS Template',
                'popup' =>
                    __(
                        'Customize the booking payment SMS message. <a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/placeholders/">',
                        'webba-booking-lite'
                    ) .
                    __(
                        'List of available placeholders',
                        'webba-booking-lite'
                    ) .
                    '</a>',
                'required_plan' => 'premium',
                'tab' => 'SMS',
            ]
        );
        wbk_opt()->add_option(
            'wbk_sms_send_on_approval',
            'checkbox',
            __('Send booking approval SMS', 'webba-booking-lite'),
            'wbk_notifications_settings_section',
            [
                'checkbox_value' => 'true',
                'not_translated_title' => 'Send booking approval SMS',
                'popup' => __(
                    'Turn on to send booking approval SMS notifications to customers once their booking has been approved.',
                    'webba-booking-lite'
                ),
                'default' => 'true',
                'required_plan' => 'premium',
                'tab' => 'SMS',
            ]
        );

        wbk_opt()->add_option(
            'wbk_sms_message_on_approval',
            'textarea',
            __('Booking approval SMS Template', 'webba-booking-lite'),
            'wbk_notifications_settings_section',
            [
                'dependency' => [['wbk_sms_send_on_approval', '=', 'true']],
                'default' => __(
                    'Dear #customer_name, your booking on #appointment_day at #appointment_time has been approved.',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'Booking approval SMS Template',
                'popup' =>
                    'Customize the booking approval SMS message. <a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/placeholders/">' .
                    __(
                        'List of available placeholders',
                        'webba-booking-lite'
                    ) .
                    '</a>',
                'required_plan' => 'premium',
                'tab' => 'SMS',
            ]
        );

        // ========== WORDING/TRANSLATIONS - PAYMENTS Subsection ==========
        wbk_opt()->add_option(
            'wbk_payment_step_title',
            'text',
            __('Payment step title', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Payment', 'webba-booking-lite'),
                'not_translated_title' => 'Payment step title',
                'popup' => __(
                    'Payment title in the booking form sidebar.',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );
        // ========== WORDING/TRANSLATIONS - BUTTONS & UI Subsection ==========
        wbk_opt()->add_option(
            'wbk_next_button_text',
            'text',
            __('Continue button text', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Next', 'webba-booking-lite'),
                'not_translated_title' => 'Continue button text',
                'popup' => __(
                    'Text on the Continue button.',
                    'webba-booking-lite'
                ),
                'tab' => 'buttons-ui',
            ]
        );
        wbk_opt()->add_option(
            'wbk_back_button_text',
            'text',
            __('Back button text', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Back', 'webba-booking-lite'),
                'not_translated_title' => 'Back button text',
                'popup' => __('Text on the Back button.', 'webba-booking-lite'),
                'tab' => 'buttons-ui',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_label_login_button',
            'text',
            __('Login', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Login', 'webba-booking-lite'),
                'not_translated_title' => 'Login',
                'popup' => __(
                    'Label for the login button in the login form.',
                    'webba-booking-lite'
                ),
                'tab' => 'buttons-ui',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_submit',
            'text',
            __('Submit', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Submit', 'webba-booking-lite'),
                'not_translated_title' => 'Submit',
                'popup' => __(
                    'Label for the submit button.',
                    'webba-booking-lite'
                ),
                'tab' => 'buttons-ui',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_pay',
            'text',
            __('Pay', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Pay', 'webba-booking-lite'),
                'not_translated_title' => 'Pay',
                'popup' => __('Label for pay button.', 'webba-booking-lite'),
                'tab' => 'buttons-ui',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_pay_with',
            'text',
            __('Pay with', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Pay with', 'webba-booking-lite'),
                'not_translated_title' => 'Pay with',
                'popup' => __(
                    'Label for pay with message.',
                    'webba-booking-lite'
                ),
                'tab' => 'buttons-ui',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_approve_appointment',
            'text',
            __('Approve Appointment', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Approve Appointment', 'webba-booking-lite'),
                'not_translated_title' => 'Approve Appointment',
                'popup' => __(
                    'Label for approve appointment button.',
                    'webba-booking-lite'
                ),
                'tab' => 'buttons-ui',
            ]
        );
        wbk_opt()->add_option(
            'wbk_cancel_button_text',
            'text_alfa_numeric',
            __('Cancellation button text', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Cancel booking', 'webba-booking-lite'),
                'not_translated_title' => 'Cancellation button text',
                'popup' => __(
                    'Text of the cancelation button',
                    'webba-booking-lite'
                ),
                'tab' => 'buttons-ui',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_apply',
            'text',
            __('Apply', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Apply', 'webba-booking-lite'),
                'not_translated_title' => 'Apply',
                'popup' => __('Apply button text', 'webba-booking-lite'),
                'tab' => 'buttons-ui',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_show_more',
            'text',
            __('Show more', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Show more', 'webba-booking-lite'),
                'not_translated_title' => 'Show more',
                'popup' => __(
                    'Label for show more button.',
                    'webba-booking-lite'
                ),
                'tab' => 'buttons-ui',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_show_less',
            'text',
            __('Show less', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Show less', 'webba-booking-lite'),
                'not_translated_title' => 'Show less',
                'popup' => __(
                    'Label for show less button.',
                    'webba-booking-lite'
                ),
                'tab' => 'buttons-ui',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_toggle_description',
            'text',
            __('Toggle description', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Toggle description', 'webba-booking-lite'),
                'not_translated_title' => 'Toggle description',
                'popup' => __(
                    'Label for toggle description button.',
                    'webba-booking-lite'
                ),
                'tab' => 'buttons-ui',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_select',
            'text',
            __('"+ Select"', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('+ Select', 'webba-booking-lite'),
                'not_translated_title' => '"+ Select"',
                'popup' => __(
                    'Label for + Select button.',
                    'webba-booking-lite'
                ),
                'tab' => 'buttons-ui',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_add_more',
            'text',
            __('"+ Add more"', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('+ Add more', 'webba-booking-lite'),
                'not_translated_title' => '"+ Add more"',
                'popup' => __('Label + Add more button.', 'webba-booking-lite'),
                'tab' => 'buttons-ui',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_add_to_calendar',
            'text',
            __('"+ Add to Calendar"', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('+ Add to Calendar', 'webba-booking-lite'),
                'not_translated_title' => '"+ Add to Calendar"',
                'popup' => __(
                    'Label for add to calendar button.',
                    'webba-booking-lite'
                ),
                'tab' => 'buttons-ui',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_selected',
            'text',
            __('Selected', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Selected', 'webba-booking-lite'),
                'not_translated_title' => 'Selected',
                'popup' => __('Label for Selected.', 'webba-booking-lite'),
                'tab' => 'buttons-ui',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_reduce_item',
            'text',
            __('Reduce item', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Reduce item', 'webba-booking-lite'),
                'not_translated_title' => 'Reduce item',
                'popup' => __(
                    'Label for reduce item button.',
                    'webba-booking-lite'
                ),
                'tab' => 'buttons-ui',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_increase_item',
            'text',
            __('Increase item', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Increase item', 'webba-booking-lite'),
                'not_translated_title' => 'Increase item',
                'popup' => __(
                    'Label for increase item button.',
                    'webba-booking-lite'
                ),
                'tab' => 'buttons-ui',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_remove_item',
            'text',
            __('Remove item', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Remove item', 'webba-booking-lite'),
                'not_translated_title' => 'Remove item',
                'popup' => __(
                    'Label for remove item button.',
                    'webba-booking-lite'
                ),
                'tab' => 'buttons-ui',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_empty_summary',
            'text',
            __(
                'Please select a service and slot to see a summary here.',
                'webba-booking-lite'
            ),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Please select a service and slot to see a summary here.',
                    'webba-booking-lite'
                ),
                'not_translated_title' =>
                    'Please select a service and slot to see a summary here.',
                'popup' => __(
                    'Label for empty summary message.',
                    'webba-booking-lite'
                ),
                'tab' => 'buttons-ui',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_show_summary',
            'text',
            __('Show summary', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Show summary', 'webba-booking-lite'),
                'not_translated_title' => 'Show summary',
                'popup' => __(
                    'Label for show summary button.',
                    'webba-booking-lite'
                ),
                'tab' => 'buttons-ui',
            ]
        );
        wbk_opt()->add_option(
            'wbk_sidebar_help_title',
            'text',
            __('Booking form sidebar support title', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'not_translated_title' => 'Booking form sidebar support title',
                'popup' => __(
                    'Type the title to be displayed above the support links.',
                    'webba-booking-lite'
                ),
                'default' => __('Need help?', 'webba-booking-lite'),
                'tab' => 'buttons-ui',
            ]
        );
        wbk_opt()->add_option(
            'wbk_user_dashboard_please_wait_state',
            'text',
            __('Button text in loading state', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Please wait…', 'webba-booking-lite'),
                'not_translated_title' => 'Button text in loading state',
                'popup' => __(
                    'Set the text to display on the button while loading.',
                    'webba-booking-lite'
                ),
                'tab' => 'buttons-ui',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_for_group_bookings_only',
            'text',
            __('For group bookings only:', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Make multiple bookings:',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'For group bookings only:',
                'popup' => __(
                    'Label for for group bookings only message.',
                    'webba-booking-lite'
                ),
                'tab' => 'buttons-ui',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_number_of_people',
            'text',
            __('Number of people:', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Number of people:', 'webba-booking-lite'),
                'not_translated_title' => 'Number of people:',
                'popup' => __(
                    'Label for number of people message.',
                    'webba-booking-lite'
                ),
                'tab' => 'buttons-ui',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_choosing_timeslot_for',
            'text',
            __('Choosing time slot for', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Choosing time slot for', 'webba-booking-lite'),
                'not_translated_title' => 'Choosing time slot for',
                'popup' => __(
                    'Label in Choosing time slot for.',
                    'webba-booking-lite'
                ),
                'tab' => 'buttons-ui',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_available',
            'text',
            __('Available', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Available', 'webba-booking-lite'),
                'not_translated_title' => 'Available',
                'popup' => __(
                    'Label in Calendar - Available',
                    'webba-booking-lite'
                ),
                'tab' => 'buttons-ui',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_booked',
            'text',
            __('Booked', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Booked', 'webba-booking-lite'),
                'not_translated_title' => 'Booked',
                'popup' => __(
                    'Label in Calendar - Booked',
                    'webba-booking-lite'
                ),
                'tab' => 'buttons-ui',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_today',
            'text',
            __('Today', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Today', 'webba-booking-lite'),
                'not_translated_title' => 'Today',
                'popup' => __(
                    'Label in Calendar - Today',
                    'webba-booking-lite'
                ),
                'tab' => 'buttons-ui',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_slots',
            'text',
            __('Slots', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('slots', 'webba-booking-lite'),
                'not_translated_title' => 'Slots',
                'popup' => __('Label in timeslots', 'webba-booking-lite'),
                'tab' => 'buttons-ui',
            ]
        );

        wbk_opt()->add_option(
            'wbk_payment_methods_title',
            'text',
            __('Payment methods title', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Payment method', 'webba-booking-lite'),
                'not_translated_title' => 'Payment methods title',
                'popup' => __(
                    'Label shown above the payment methods',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );

        wbk_opt()->add_option(
            'wbk_wording_enter_coupon_code',
            'text',
            __('Enter coupon code', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Enter coupon code', 'webba-booking-lite'),
                'not_translated_title' => 'Enter coupon code',
                'popup' => __(
                    'Placeholder Enter coupon code',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );

        wbk_opt()->add_option(
            'wbk_wording_apply',
            'text',
            __('Apply', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Apply', 'webba-booking-lite'),
                'not_translated_title' => 'Apply',
                'popup' => __('Apply button text', 'webba-booking-lite'),
                'tab' => 'buttons-ui',
            ]
        );

        // ========== WORDING/TRANSLATIONS - USER DASHBOARD Subsection ==========
        wbk_opt()->add_option(
            'wbk_user_dashboard_link_label',
            'text',
            __('User dashboard link text', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('User Dashboard', 'webba-booking-lite'),
                'not_translated_title' => 'User dashboard link text',
                'popup' => __(
                    'Label for the user dashboard link.',
                    'webba-booking-lite'
                ),
                'tab' => 'user-dashboard',
            ]
        );
        wbk_opt()->add_option(
            'wbk_user_dashboard_section_bookings_label',
            'text',
            __(
                'Title for bookings section of the User dashboard',
                'webba-booking-lite'
            ),
            'wbk_translation_settings_section',
            [
                'default' => __('My Bookings', 'webba-booking-lite'),
                'not_translated_title' =>
                    'Title for bookings section of the User dashboard',
                'popup' => __(
                    'A title for bookings section of the user dashboard, it\'ll be used in navigation and other places inside user dashboard.',
                    'webba-booking-lite'
                ),
                'tab' => 'user-dashboard',
            ]
        );
        wbk_opt()->add_option(
            'wbk_user_dashboard_section_past_bookings_label',
            'text',
            __(
                'Title for previous bookings section of the user dashboard',
                'webba-booking-lite'
            ),
            'wbk_translation_settings_section',
            [
                'default' => __('History', 'webba-booking-lite'),
                'not_translated_title' =>
                    'Title for previous bookings section of the user dashboard',
                'popup' => __(
                    'A title for previous bookings section of the user dashboard, it\'ll be used in navigation and other places inside user dashboard.',
                    'webba-booking-lite'
                ),
                'tab' => 'user-dashboard',
            ]
        );
        wbk_opt()->add_option(
            'wbk_user_dashboard_link_text_reschedule',
            'text',
            __(
                'Title for the reschedule link text in user dashboard',
                'webba-booking-lite'
            ),
            'wbk_translation_settings_section',
            [
                'default' => __('Reschedule', 'webba-booking-lite'),
                'not_translated_title' =>
                    'Title for the reschedule link text in user dashboard',
                'popup' => __(
                    'This title will be used to display the reschedule link in user dashboard.',
                    'webba-booking-lite'
                ),
                'tab' => 'user-dashboard',
            ]
        );
        wbk_opt()->add_option(
            'wbk_user_dashboard_link_text_cancel',
            'text',
            __(
                'Title for the cancel link text in user dashboard',
                'webba-booking-lite'
            ),
            'wbk_translation_settings_section',
            [
                'default' => __('Cancel booking', 'webba-booking-lite'),
                'not_translated_title' =>
                    'Title for the cancel link text in user dashboard',
                'popup' => __(
                    'This title will be used to display the cancel link in user dashboard.',
                    'webba-booking-lite'
                ),
                'tab' => 'user-dashboard',
            ]
        );
        wbk_opt()->add_option(
            'wbk_user_dashboard_link_text_confirm_cancellation',
            'text',
            __(
                'Title for the confirm cancellation link text in user dashboard',
                'webba-booking-lite'
            ),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Confirm cancellation',
                    'webba-booking-lite'
                ),
                'not_translated_title' =>
                    'Title for the confirm cancellation link text in user dashboard',
                'popup' => __(
                    'This title will be used to display the confirm cancellation link in user dashboard.',
                    'webba-booking-lite'
                ),
                'tab' => 'user-dashboard',
            ]
        );
        wbk_opt()->add_option(
            'wbk_user_dashboard_no_bookings_available',
            'text',
            __('No bookings message', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'No bookings available',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'No bookings message',
                'popup' => __(
                    'Specify the message to display when no bookings are available in the Users dashboard.',
                    'webba-booking-lite'
                ),
                'tab' => 'user-dashboard',
            ]
        );
        wbk_opt()->add_option(
            'wbk_user_dashboard_login_title',
            'text',
            __('User login form title', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Login to your booking manager',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'User login form title',
                'popup' => __(
                    'Specify the message to display at the top of the user login form',
                    'webba-booking-lite'
                ),
                'tab' => 'user-dashboard',
            ]
        );
        /*
        wbk_opt()->add_option(
            'wbk_places_selection_mode',
            'select',
            __('Multiple seat selection mode', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'not_translated_title' => 'Multiple seat selection mode',
                'popup' => __(
                    'Choose how many places customer can select in the group service booking.',
                    'webba-booking-lite'
                ),
                'default' => 'normal',
                'extra' => [
                    'normal' => __(
                        'Let users select count',
                        'webba-booking-lite'
                    ),
                    'normal_no_default' => __(
                        'Let users select count (no default value)',
                        'webba-booking-lite'
                    ),
                    '1' => __(
                        'Allow select only one place',
                        'webba-booking-lite'
                    ),
                    'max' => __(
                        'Allow select only maximum places',
                        'webba-booking-lite'
                    ),
                ],
            ],
            'user-dashboard',
            'advanced'
        );
        */
        /*
        wbk_opt()->add_option(
            'wbk_show_details_of_previous_bookings',
            'checkbox',
            __('Show who booked the time slot', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'default' => '',
                'checkbox_value' => 'true',
                'not_translated_title' => 'Show who booked the time slot',
                'popup' => __(
                    'If enabled, each time slot will display the names of users who have already booked that time slot. Applicable for group services.',
                    'webba-booking-lite'
                ),
            ],
            'user-dashboard',
            'advanced'
        );
        */
        /*
        wbk_opt()->add_option(
            'wbk_show_local_time_by_default',
            'checkbox',
            __('Show local time by default', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'default' => '',
                'checkbox_value' => 'true',
                'not_translated_title' => 'Show local time by default',
                'popup' => __(
                    'If enabled, the booking form will automatically default to the local time of the customer.',
                    'webba-booking-lite'
                ),
            ],
            'user-dashboard',
            'advanced'
        );
        */
        /*  
        wbk_opt()->add_option(
            'wbk_automatically_select_today',
            'checkbox',
            __('Auto select nearest date', 'webba-booking-lite'),
            'wbk_advanced_booking_rules_section',
            [
                'default' => '',
                'checkbox_value' => 'true',
                'not_translated_title' => 'Auto select nearest date',
                'popup' => __(
                    'If enabled, today or the next available date will be chosen automatically.',
                    'webba-booking-lite'
                ),
            ],
            'user-dashboard',
            'advanced'
        );
        */
        if (get_option('wbk_price_separator') === false) {
            wbk_opt()->reset_defaults();
        }

        // --- BEGIN: Added for frontend wording translations ---
        wbk_opt()->add_option(
            'wbk_wording_label_login_user',
            'text',
            __('Username or Email Address', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Username or Email Address',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'Login form username/email label',
                'popup' => __(
                    'Label for the username/email field in the login form.',
                    'webba-booking-lite'
                ),
                'tab' => 'form-fields',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_label_login_password',
            'text',
            __('Password', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Password', 'webba-booking-lite'),
                'not_translated_title' => 'Login form password label',
                'popup' => __(
                    'Label for the password field in the login form.',
                    'webba-booking-lite'
                ),
                'tab' => 'form-fields',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_summary',
            'text',
            __('Summary', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Summary', 'webba-booking-lite'),
                'not_translated_title' => 'Summary label',
                'popup' => __(
                    'Label for the summary section.',
                    'webba-booking-lite'
                ),
                'tab' => 'form-fields',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_select_services',
            'text',
            __('Select service(s)', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Select service(s)', 'webba-booking-lite'),
                'not_translated_title' => 'Select services label',
                'popup' => __(
                    'Label for selecting services.',
                    'webba-booking-lite'
                ),
                'tab' => 'form-fields',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_choose_service_proceed',
            'text',
            __('Choose a service to proceed', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Choose a service to proceed',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'Choose service to proceed label',
                'popup' => __(
                    'Label for prompting to choose a service to proceed.',
                    'webba-booking-lite'
                ),
                'tab' => 'form-fields',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_select_date_time_services',
            'text',
            __('Select date & time for services', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Select date & time for services',
                    'webba-booking-lite'
                ),
                'not_translated_title' =>
                    'Select date & time for services label',
                'popup' => __(
                    'Label for selecting date and time for services.',
                    'webba-booking-lite'
                ),
                'tab' => 'form-fields',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_choose_preferred_appointment_slot',
            'text',
            __('Choose your preferred appointment slot', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Choose your preferred appointment slot',
                    'webba-booking-lite'
                ),
                'not_translated_title' =>
                    'Choose preferred appointment slot label',
                'popup' => __(
                    'Label for choosing preferred appointment slot.',
                    'webba-booking-lite'
                ),
                'tab' => 'form-fields',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_personal_details',
            'text',
            __('Personal details', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Personal details', 'webba-booking-lite'),
                'not_translated_title' => 'Personal details label',
                'popup' => __(
                    'Label for personal details section.',
                    'webba-booking-lite'
                ),
                'tab' => 'form-fields',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_fill_contact_information',
            'text',
            __('Please fill in your contact information', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Please fill in your contact information',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'Fill contact information label',
                'popup' => __(
                    'Prompt to fill in contact information.',
                    'webba-booking-lite'
                ),
                'tab' => 'form-fields',
            ]
        );

        // ========== WORDING/TRANSLATIONS - VALIDATION Subsection ==========
        wbk_opt()->add_option(
            'wbk_wording_this_field_is_required',
            'text',
            __('This field is required', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('This field is required', 'webba-booking-lite'),
                'not_translated_title' => 'This field is required label',
                'popup' => __(
                    'This field is required in error message',
                    'webba-booking-lite'
                ),
                'tab' => 'validation',
            ]
        );

        wbk_opt()->add_option(
            'wbk_wording_the_entered_email_is_invalid',
            'text',
            __('The entered email is invalid', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'The entered email is invalid',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'The entered email is invalid',
                'popup' => __(
                    'The entered email is invalid in error message',
                    'webba-booking-lite'
                ),
                'tab' => 'validation',
            ]
        );

        wbk_opt()->add_option(
            'wbk_wording_please_enter_a_valid_phone_number',
            'text',
            __('Please enter a valid phone number', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Please enter a valid phone number',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'Please enter a valid phone number',
                'popup' => __(
                    'Please enter a valid phone number in error message',
                    'webba-booking-lite'
                ),
                'tab' => 'validation',
            ]
        );

        wbk_opt()->add_option(
            'wbk_wording_the_entered_number_is_invalid',
            'text',
            __('The entered number is invalid', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'The entered number is invalid',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'The entered number is invalid',
                'popup' => __(
                    'The entered number is invalid in error message',
                    'webba-booking-lite'
                ),
                'tab' => 'validation',
            ]
        );

        wbk_opt()->add_option(
            'wbk_wording_select_preferred_payment_method',
            'text',
            __('Select your preferred payment method', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Select your preferred payment method',
                    'webba-booking-lite'
                ),
                'not_translated_title' =>
                    'Select preferred payment method label',
                'popup' => __(
                    'Prompt to select preferred payment method.',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );

        wbk_opt()->add_option(
            'wbk_wording_select_date_time',
            'text',
            __('Select date & time', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Select date & time', 'webba-booking-lite'),
                'not_translated_title' => 'Select date & time',
                'popup' => __(
                    'Label above calendar when date and time isn\'t selected.',
                    'webba-booking-lite'
                ),
                'tab' => 'validation',
            ]
        );

        wbk_opt()->add_option(
            'wbk_wording_choosing_timeslot_for',
            'text',
            __('Choosing time slot for', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Choosing time slot for', 'webba-booking-lite'),
                'not_translated_title' => 'Choosing time slot for',
                'popup' => __(
                    'Label in Choosing time slot for.',
                    'webba-booking-lite'
                ),
                'tab' => 'validation',
            ]
        );

        wbk_opt()->add_option(
            'wbk_wording_no_available_timeslots',
            'text',
            __('No available time slots', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'No available time slots',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'No available time slots',
                'popup' => __(
                    'Label in No available time slots.',
                    'webba-booking-lite'
                ),
                'tab' => 'validation',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_no_time_selected',
            'text',
            __('No time selected', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('No time selected', 'webba-booking-lite'),
                'not_translated_title' => 'No time selected',
                'popup' => __(
                    'Error message when no time slot is selected.',
                    'webba-booking-lite'
                ),
                'tab' => 'validation',
            ]
        );

        wbk_opt()->add_option(
            'wbk_wording_available',
            'text',
            __('Available', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Available', 'webba-booking-lite'),
                'not_translated_title' => 'Available',
                'popup' => __(
                    'Label in Calendar - Available',
                    'webba-booking-lite'
                ),
                'tab' => 'buttons-ui',
            ]
        );

        wbk_opt()->add_option(
            'wbk_wording_booked',
            'text',
            __('Booked', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Booked', 'webba-booking-lite'),
                'not_translated_title' => 'Booked',
                'popup' => __(
                    'Label in Calendar - Booked',
                    'webba-booking-lite'
                ),
                'tab' => 'buttons-ui',
            ]
        );

        // ========== WORDING/TRANSLATIONS - BOOKING STATUS Subsection ==========
        wbk_opt()->add_option(
            'wbk_wording_appointment_confirmed',
            'text',
            __('Thank you for your booking!', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Thank you for your booking!',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'Thank you for your booking!',
                'popup' => __(
                    'Thank you message shown after successful booking.',
                    'webba-booking-lite'
                ),
                'tab' => 'booking-status',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_look_forward_seeing_you',
            'text',
            __('We look forward to seeing you.', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'We look forward to seeing you.',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'We look forward to seeing you.',
                'popup' => __(
                    'Follow-up message shown after booking.',
                    'webba-booking-lite'
                ),
                'tab' => 'booking-status',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_booking_success',
            'text',
            __('Booking success', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Booking success', 'webba-booking-lite'),
                'not_translated_title' => 'Booking success',
                'popup' => __(
                    'Label for booking success message.',
                    'webba-booking-lite'
                ),
                'tab' => 'booking-status',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_booking_approved',
            'text',
            __('Booking approved', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Booking approved', 'webba-booking-lite'),
                'not_translated_title' => 'Booking approved',
                'popup' => __(
                    'Label for booking approved message.',
                    'webba-booking-lite'
                ),
                'tab' => 'booking-status',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_booking_cancelled',
            'text',
            __('Booking cancelled', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Booking cancelled', 'webba-booking-lite'),
                'not_translated_title' => 'Booking cancelled',
                'popup' => __(
                    'Label for booking cancelled message.',
                    'webba-booking-lite'
                ),
                'tab' => 'booking-status',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_loading_booking_details',
            'text',
            __('Loading booking details…', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Loading booking details...',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'Loading booking details…',
                'popup' => __(
                    'Label for loading booking details message.',
                    'webba-booking-lite'
                ),
                'tab' => 'booking-status',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_appointment_approved',
            'text',
            __('Appointment Approved', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Appointment Approved', 'webba-booking-lite'),
                'not_translated_title' => 'Appointment Approved',
                'popup' => __(
                    'Label for appointment approved message.',
                    'webba-booking-lite'
                ),
                'tab' => 'booking-status',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_appointment_approved_message',
            'text',
            __(
                'You have approved this appointment. The customer has been notified.',
                'webba-booking-lite'
            ),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'You have approved this appointment. The customer has been notified.',
                    'webba-booking-lite'
                ),
                'not_translated_title' =>
                    'You have approved this appointment. The customer has been notified.',
                'popup' => __(
                    'Label for appointment approved message.',
                    'webba-booking-lite'
                ),
                'tab' => 'booking-status',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_appointment_cancelled',
            'text',
            __('Appointment Cancelled', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Appointment Cancelled', 'webba-booking-lite'),
                'not_translated_title' => 'Appointment Cancelled',
                'popup' => __(
                    'Label for appointment cancelled message.',
                    'webba-booking-lite'
                ),
                'tab' => 'booking-status',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_appointment_cancelled_admin_message',
            'text',
            __(
                'You have cancelled this appointment. The customer has been notified of the cancellation.',
                'webba-booking-lite'
            ),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'You have cancelled this appointment. The customer has been notified of the cancellation.',
                    'webba-booking-lite'
                ),
                'not_translated_title' =>
                    'You have cancelled this appointment. The customer has been notified of the cancellation.',
                'popup' => __(
                    'Label for appointment cancelled admin message.',
                    'webba-booking-lite'
                ),
                'tab' => 'booking-status',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_appointment_cancelled_customer_message',
            'text',
            __(
                'You have cancelled your appointment. We hope to see you again soon.',
                'webba-booking-lite'
            ),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'You have cancelled your appointment. We hope to see you again soon.',
                    'webba-booking-lite'
                ),
                'not_translated_title' =>
                    'You have cancelled your appointment. We hope to see you again soon.',
                'popup' => __(
                    'Label for appointment cancelled customer message.',
                    'webba-booking-lite'
                ),
                'tab' => 'booking-status',
            ]
        );
        wbk_opt()->add_option(
            'wbk_booking_canceled_message',
            'text',
            __('Cancellation success message', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Your appointment booking has been canceled.',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'Cancellation success message',
                'popup' => __(
                    'Text shown to a customer when booking is cancelled.',
                    'webba-booking-lite'
                ),
                'tab' => 'booking-status',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_payment_step_title',
            'text',
            __('Payment step title', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Payment', 'webba-booking-lite'),
                'not_translated_title' => 'Payment step title',
                'popup' => __(
                    'Title for the payment step in the booking form.',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_payment_information',
            'text',
            __('Payment Information', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Payment Information', 'webba-booking-lite'),
                'not_translated_title' => 'Payment Information',
                'popup' => __(
                    'Label for payment information section.',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_cost_breakdown',
            'text',
            __('Cost Breakdown', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Cost Breakdown', 'webba-booking-lite'),
                'not_translated_title' => 'Cost Breakdown',
                'popup' => __(
                    'Label for cost breakdown section.',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_free',
            'text',
            __('Free', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Free', 'webba-booking-lite'),
                'not_translated_title' => 'Free',
                'popup' => __('Label for free service.', 'webba-booking-lite'),
                'tab' => 'payments',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_total_amount',
            'text',
            __('Total amount', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Total amount paid', 'webba-booking-lite'),
                'not_translated_title' => 'Total amount',
                'popup' => __(
                    'Label for total amount in payment summary.',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_loading_payment_form',
            'text',
            __('Loading payment form…', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Loading payment form…', 'webba-booking-lite'),
                'not_translated_title' => 'Loading payment form label',
                'popup' => __(
                    'Label for loading payment form message.',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_processing',
            'text',
            __('Processing…', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Processing…', 'webba-booking-lite'),
                'not_translated_title' => 'Processing label',
                'popup' => __(
                    'Label for processing message.',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_please_complete_payment_confirm_booking',
            'text',
            __(
                'Please complete your payment to confirm your booking.',
                'webba-booking-lite'
            ),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Please complete your payment to confirm your booking.',
                    'webba-booking-lite'
                ),
                'not_translated_title' =>
                    'Please complete payment to confirm booking label',
                'popup' => __(
                    'Label for please complete payment to confirm booking message.',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_payment_successful',
            'text',
            __('Payment successful', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Payment successful', 'webba-booking-lite'),
                'not_translated_title' => 'Payment successful label',
                'popup' => __(
                    'Label for payment successful message.',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_thank_you_payment',
            'text',
            __('Thank you for your payment.', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Thank you for your payment.',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'Thank you for your payment label',
                'popup' => __(
                    'Label for thank you for your payment message.',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_total_amount_due',
            'text',
            __('Total amount due', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Total amount due', 'webba-booking-lite'),
                'not_translated_title' => 'Total amount due label',
                'popup' => __(
                    'Label for total amount due.',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );

        wbk_opt()->add_option(
            'wbk_wording_complete_your_payment',
            'text',
            __('Complete Your Payment', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Complete Your Payment', 'webba-booking-lite'),
                'not_translated_title' => 'Complete your payment label',
                'popup' => __(
                    'Label for complete your payment message.',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_select_payment_method_complete_payment',
            'text',
            __(
                'Please select a payment method and complete your payment to confirm your booking.',
                'webba-booking-lite'
            ),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Please select a payment method and complete your payment to confirm your booking.',
                    'webba-booking-lite'
                ),
                'not_translated_title' =>
                    'Select payment method and complete payment label',
                'popup' => __(
                    'Label for select payment method and complete payment message.',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_tax_incl',
            'text',
            __('Tax incl.', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Tax incl.', 'webba-booking-lite'),
                'not_translated_title' => 'Tax incl.',
                'popup' => __(
                    'Label indicating tax is included in the price.',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_payment_item_name',
            'text',
            __('Payment item text', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    '#service_name on #appointment_day at #appointment_time',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'Payment item text',
                'popup' => __(
                    'Text displayed for payment items. Available placeholders: #service_name, #appointment_day, #appointment_time.',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_tax_label',
            'text',
            __('Tax label', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Tax', 'webba-booking-lite'),
                'not_translated_title' => 'Tax label',
                'popup' => __(
                    'Label for tax in payment summary.',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_discount_label',
            'text',
            __('Discount label', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Discount', 'webba-booking-lite'),
                'not_translated_title' => 'Discount label',
                'popup' => __(
                    'Label for discount in payment summary.',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_total_title',
            'text',
            __('Total title', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Total', 'webba-booking-lite'),
                'not_translated_title' => 'Total title',
                'popup' => __(
                    'Label for total amount in payment summary.',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );

        wbk_opt()->add_option(
            'wbk_wording_no_services_found',
            'text',
            __('No services found!', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('No services found!', 'webba-booking-lite'),
                'not_translated_title' => 'No services found label',
                'popup' => __(
                    'Error message when no services are found.',
                    'webba-booking-lite'
                ),
                'tab' => 'validation',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_tax_included',
            'text',
            __('Tax incl.', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Tax incl.', 'webba-booking-lite'),
                'not_translated_title' => 'Tax incl.',
                'popup' => __(
                    'Label for Tax incl. in sidebar.',
                    'webba-booking-lite'
                ),
                'tab' => 'booking-status',
            ]
        );

        wbk_opt()->add_option(
            'wbk_wording_show_summary',
            'text',
            __('Show summary', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Show summary', 'webba-booking-lite'),
                'not_translated_title' => 'Show summary label',
                'popup' => __(
                    'Label for show summary button.',
                    'webba-booking-lite'
                ),
                'tab' => 'booking-status',
            ]
        );

        wbk_opt()->add_option(
            'wbk_wording_duration',
            'text',
            __('Duration', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Duration', 'webba-booking-lite'),
                'not_translated_title' => 'Duration',
                'popup' => __('Label for Duration.', 'webba-booking-lite'),
                'tab' => 'booking-status',
            ]
        );

        wbk_opt()->add_option(
            'wbk_wording_full_price',
            'text',
            __('Full price', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Full price', 'webba-booking-lite'),
                'not_translated_title' => 'Full price',
                'popup' => __(
                    'Label for Full price in booking form sidebar.',
                    'webba-booking-lite'
                ),
                'tab' => 'booking-status',
            ]
        );

        wbk_opt()->add_option(
            'wbk_wording_pay_now',
            'text',
            __('Pay now', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Pay now', 'webba-booking-lite'),
                'not_translated_title' => 'Pay now',
                'popup' => __(
                    'Label for Pay now in booking form sidebar.',
                    'webba-booking-lite'
                ),
                'tab' => 'booking-status',
            ]
        );

        wbk_opt()->add_option(
            'wbk_wording_left_to_pay',
            'text',
            __('Left to pay', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Left to pay', 'webba-booking-lite'),
                'not_translated_title' => 'Left to pay',
                'popup' => __(
                    'Label for Left to pay in booking form sidebar.',
                    'webba-booking-lite'
                ),
                'tab' => 'booking-status',
            ]
        );

        wbk_opt()->add_option(
            'wbk_wording_show_details',
            'text',
            __('Show details', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Show details', 'webba-booking-lite'),
                'not_translated_title' => 'Show details',
                'popup' => __(
                    'Label for Show details in booking form sidebar.',
                    'webba-booking-lite'
                ),
                'tab' => 'booking-status',
            ]
        );

        wbk_opt()->add_option(
            'wbk_wording_hide_details',
            'text',
            __('Hide details', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Hide details', 'webba-booking-lite'),
                'not_translated_title' => 'Hide details',
                'popup' => __(
                    'Label for Hide details in booking form sidebar.',
                    'webba-booking-lite'
                ),
                'tab' => 'booking-status',
            ]
        );

        wbk_opt()->add_option(
            'wbk_wording_minute',
            'text',
            __('Minutes', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('min', 'webba-booking-lite'),
                'not_translated_title' => 'Minutes',
                'popup' => __('Label for Minutes.', 'webba-booking-lite'),
                'tab' => 'booking-status',
            ]
        );

        wbk_opt()->add_option(
            'wbk_wording_hour',
            'text',
            __('Hours', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('h', 'webba-booking-lite'),
                'not_translated_title' => 'Hours',
                'popup' => __('Label for Hours.', 'webba-booking-lite'),
                'tab' => 'form-fields',
            ]
        );

        wbk_opt()->add_option(
            'wbk_wording_minute',
            'text',
            __('Minutes', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('min', 'webba-booking-lite'),
                'not_translated_title' => 'Minutes',
                'popup' => __('Label for Minutes.', 'webba-booking-lite'),
                'tab' => 'form-fields',
            ]
        );

        wbk_opt()->add_option(
            'wbk_wording_please_select_service',
            'text',
            __('Please select at least one service.', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Please select at least one service.',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'Please select at least one service.',
                'popup' => __(
                    'Label for "Please select at least one service" tooltip in the navigation button.',
                    'webba-booking-lite'
                ),
                'tab' => 'validation',
            ]
        );

        wbk_opt()->add_option(
            'wbk_wording_please_select_timeslot',
            'text',
            __(
                'Please select a time slot for each selected service.',
                'webba-booking-lite'
            ),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Please select a time slot for each selected service.',
                    'webba-booking-lite'
                ),
                'not_translated_title' =>
                    'Please select a time slot for each selected service.',
                'popup' => __(
                    'Label for "please select a time slot for each selected service" tooltip in the navigation button.',
                    'webba-booking-lite'
                ),
                'tab' => 'validation',
            ]
        );

        wbk_opt()->add_option(
            'wbk_wording_please_fill_out_all_fields',
            'text',
            __('Please fill out all required fields.', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Please fill out all required fields.',
                    'webba-booking-lite'
                ),
                'not_translated_title' =>
                    'Please fill out all required fields.',
                'popup' => __(
                    'Label for "Please fill out all required fields" tooltip in the navigation button.',
                    'webba-booking-lite'
                ),
                'tab' => 'validation',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_daily_limit_reached_message',
            'text',
            __('Daily limit message', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Daily booking limit is reached, please select another date.',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'Daily limit message',
                'popup' => __(
                    'Error message shown when daily booking limit is reached.',
                    'webba-booking-lite'
                ),
                'tab' => 'validation',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_no_bookings_for_payment_message',
            'text',
            __('No bookings for payment message', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'There are no bookings available for payment.',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'No bookings for payment message',
                'popup' => __(
                    'Error message when no bookings are available for payment.',
                    'webba-booking-lite'
                ),
                'tab' => 'validation',
            ]
        );

        wbk_opt()->add_option(
            'wbk_wording_please_select_payment_method',
            'text',
            __('Please select a payment method.', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Please select a payment method.',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'Please select a payment method.',
                'popup' => __(
                    'Error message when no payment method is selected.',
                    'webba-booking-lite'
                ),
                'tab' => 'validation',
            ]
        );

        wbk_opt()->add_option(
            'wbk_wording_please_fill_out_payment_form',
            'text',
            __('Please fill out payment form.', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Please fill out payment form.',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'Please fill out payment form.',
                'popup' => __(
                    'Error message when payment form is not filled out.',
                    'webba-booking-lite'
                ),
                'tab' => 'validation',
            ]
        );
        wbk_opt()->add_option(
            'wbk_wording_no_bookings_found',
            'text',
            __(
                'No bookings found for the provided token',
                'webba-booking-lite'
            ),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'No bookings found for the provided token',
                    'webba-booking-lite'
                ),
                'not_translated_title' =>
                    'No bookings found for the provided token',
                'popup' => __(
                    'Error message when no bookings are found for the provided token.',
                    'webba-booking-lite'
                ),
                'tab' => 'validation',
            ]
        );

        wbk_opt()->add_option(
            'wbk_total_amount_label',
            'text',
            __('Total amount label', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __('Total amount', 'webba-booking-lite'),
                'not_translated_title' => 'Total amount label',
                'popup' => __(
                    'Label for the total amount in payment details',
                    'webba-booking-lite'
                ),
                'tab' => 'payments',
            ]
        );
        wbk_opt()->add_option(
            'wbk_google_meet_link_text',
            'text',
            __('Google Meet link text', 'webba-booking-lite'),
            'wbk_translation_settings_section',
            [
                'default' => __(
                    'Click here to open your meeting in Google Meet',
                    'webba-booking-lite'
                ),
                'not_translated_title' => 'Google Meet link text',
                'popup' => __(
                    'Text of the Google Meet link in the email notification.',
                    'webba-booking-lite'
                ),
                'tab' => 'integrations',
            ]
        );

        do_action('wbk_options_after');
    }

    public function wbk_default_editor()
    {
        return 'tinymce';
    }

    // init styles and scripts
    public function enqueueScripts()
    {
        if ($this->is_option_page()) {
        }
    }

    // general settings section callback
    public function wbk_general_settings_section_callback($arg) {}
    // schedule settings section callback
    public function wbk_schedule_settings_section_callback($arg) {}
    // email settings section callback (covers Email and SMS notifications)
    public function wbk_email_settings_section_callback($arg) {}
    // appearance  settings section callback
    public function wbk_mode_settings_section_callback($arg) {}
    // appearance  settings section callback
    public function wbk_translation_settings_section_callback($arg) {}
    // paypal settings section callback (covers PayPal, Stripe, WooCommerce)
    public function wbk_paypal_settings_section_callback($arg) {}
    // google calendar settings section callback (covers Google Calendar, Zoom)
    public function wbk_gg_calendar_settings_section_callback($arg) {}
    // sms settings section callback
    public function wbk_sms_settings_section_callback($arg) {}
    // woo settings section callback
    public function wbk_woo_settings_section_callback($arg) {}
    // zoom setting section callback
    public function wbk_zoom_settings_section_callback($arg) {}
    // appointments settings section callback
    public function wbk_appointments_settings_section_callback($arg) {}

    public function is_option_page()
    {
        return isset($_GET['page']) && $_GET['page'] == 'wbk-options';
    }
}
?>
