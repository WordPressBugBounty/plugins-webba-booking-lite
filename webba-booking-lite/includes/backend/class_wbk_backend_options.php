<?php

// Webba Booking options page class
// check if accessed directly
if ( !defined( 'ABSPATH' ) ) {
    exit;
}
class WBK_Backend_Options {
    public function __construct() {
        //set component-specific properties
        // init settings
        add_action( 'admin_init', [$this, 'initSettings'] );
        // init scripts
        add_action( 'admin_enqueue_scripts', [$this, 'enqueueScripts'], 20 );
        // mce plugin
        add_filter( 'mce_buttons', [$this, 'wbk_mce_add_button'] );
        add_filter( 'mce_external_plugins', [$this, 'wbk_mce_add_javascript'] );
        add_filter( 'wp_default_editor', [$this, 'wbk_default_editor'] );
        add_filter( 'tiny_mce_before_init', [$this, 'customizeEditor'], 1000 );
        // save options
        add_action( 'wp_ajax_wbk_save_options', [$this, 'save_options'] );
    }

    public function save_options() {
        if ( !current_user_can( 'manage_options' ) ) {
            wp_send_json_error( 'No permissions' );
        }
        global $wp_settings_fields;
        parse_str( $_POST['form_data'], $options );
        $settings_fields = $wp_settings_fields['wbk-options'];
        foreach ( $settings_fields[$options['section']] as $field ) {
            if ( isset( $options[$field['id']] ) ) {
                update_option( $field['id'], $options[$field['id']] );
            } else {
                update_option( $field['id'], '' );
            }
            if ( $field['id'] == 'wbk_email_admin_daily_time' ) {
                date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
                $time_corr = intval( get_option( 'wbk_email_admin_daily_time', '68400' ) );
                $midnight = strtotime( 'today midnight' );
                $timestamp = strtotime( 'today midnight' ) + $time_corr;
                if ( $timestamp < time() ) {
                    $timestamp += 86400;
                }
                wp_clear_scheduled_hook( 'wbk_daily_event' );
                wp_schedule_event( $timestamp, 'daily', 'wbk_daily_event' );
                date_default_timezone_set( 'UTC' );
            }
        }
        do_action( 'wbk_options_saved' );
        WBK_Mixpanel::update_configuration( false );
        wp_send_json_success();
    }

    public function customizeEditor( $in ) {
        if ( $this->is_option_page() ) {
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

    public function wbk_mce_add_button( $buttons ) {
        if ( $this->is_option_page() ) {
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

    public function wbk_mce_add_javascript( $plugin_array ) {
        if ( $this->is_option_page() && !isset( $plugin_array['wbk_tinynce'] ) ) {
            $plugin_array['wbk_tinynce'] = WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/wbk-tinymce.js';
        }
        return $plugin_array;
    }

    // init wp settings api objects for options page
    public function initSettings() {
        // General settings section
        add_settings_section(
            'wbk_general_settings_section',
            __( 'General', 'webba-booking-lite' ),
            [$this, 'wbk_general_settings_section_callback'],
            'wbk-options',
            [
                'icon' => 'settings-general-icon',
            ]
        );
        // Booking rules (ex appointments) section
        add_settings_section(
            'wbk_appointments_settings_section',
            __( 'Booking rules', 'webba-booking-lite' ),
            [$this, 'wbk_appointments_settings_section_callback'],
            'wbk-options',
            [
                'icon' => 'bookins-rules-icon',
            ]
        );
        // User interface (ex. mode) section
        add_settings_section(
            'wbk_mode_settings_section',
            __( 'User interface', 'webba-booking-lite' ),
            [$this, 'wbk_mode_settings_section_callback'],
            'wbk-options',
            [
                'icon' => 'user-interface-icon',
            ]
        );
        // Email notifications section
        add_settings_section(
            'wbk_email_settings_section',
            __( 'Email notifications', 'webba-booking-lite' ),
            [$this, 'wbk_email_settings_section_callback'],
            'wbk-options',
            [
                'icon' => 'email-notification-icon',
            ]
        );
        // translation settings section
        add_settings_section(
            'wbk_translation_settings_section',
            __( 'Wording / Translation', 'webba-booking-lite' ),
            [$this, 'wbk_translation_settings_section_callback'],
            'wbk-options',
            [
                'icon' => 'wording-translation-icon',
            ]
        );
        if ( wbk_fs()->is__premium_only() && wbk_fs()->can_use_premium_code() ) {
            add_settings_section(
                'wbk_paypal_settings_section',
                __( 'PayPal', 'webba-booking-lite' ),
                [$this, 'wbk_paypal_settings_section_callback'],
                'wbk-options',
                [
                    'icon' => 'paypal-icon',
                    'pro'  => true,
                ]
            );
            add_settings_section(
                'wbk_stripe_settings_section',
                __( 'Stripe', 'webba-booking-lite' ),
                [$this, 'wbk_stripe_settings_section_callback'],
                'wbk-options',
                [
                    'icon' => 'stripe-icon',
                    'pro'  => true,
                ]
            );
            add_settings_section(
                'wbk_gg_calendar_settings_section',
                __( 'Google Calendar', 'webba-booking-lite' ),
                [$this, 'wbk_gg_calendar_settings_section_callback'],
                'wbk-options',
                [
                    'icon' => 'google-calendar-icon',
                    'pro'  => true,
                ]
            );
            add_settings_section(
                'wbk_sms_settings_section',
                __( 'SMS', 'webba-booking-lite' ),
                [$this, 'wbk_sms_settings_section_callback'],
                'wbk-options',
                [
                    'icon' => 'sms-icon',
                    'pro'  => true,
                ]
            );
            add_settings_section(
                'wbk_woo_settings_section',
                __( 'WooCommerce', 'webba-booking-lite' ),
                [$this, 'wbk_woo_settings_section_callback'],
                'wbk-options',
                [
                    'icon' => 'woocommerce-icon',
                    'pro'  => true,
                ]
            );
            add_settings_section(
                'wbk_zoom_settings_section',
                __( 'Zoom', 'webba-booking-lite' ),
                [$this, 'wbk_zoom_settings_section_callback'],
                'wbk-options',
                [
                    'icon' => 'zoom-icon',
                    'pro'  => true,
                ]
            );
        }
        add_settings_section(
            'wbk_interface_settings_section',
            __( 'Backend interface', 'webba-booking-lite' ),
            [$this, 'wbk_backend_interface_settings_section_callback'],
            'wbk-options',
            [
                'icon' => 'backend-interface-icon',
            ]
        );
        wbk_opt()->add_option(
            'wbk_timezone',
            'select',
            __( 'Timezone', 'webba-booking-lite' ),
            'wbk_general_settings_section',
            [
                'extra'                => array_combine( timezone_identifiers_list(), timezone_identifiers_list() ),
                'default'              => 'Europe/London',
                'not_translated_title' => 'Timezone',
                'popup'                => __( 'Select your local timezone for both the backend and booking form.', 'webba-booking-lite' ),
            ]
        );
        wbk_opt()->add_option(
            'wbk_form_layout',
            'select',
            __( 'Form layout', 'webba-booking-lite' ),
            'wbk_mode_settings_section',
            [
                'default'              => 'default',
                'extra'                => [
                    'default' => __( 'Default', 'webba-booking-lite' ),
                    'narrow'  => __( 'For themes with narrow columns', 'webba-booking-lite' ),
                ],
                'not_translated_title' => 'Form layout',
                'popup'                => __( 'Choose between the default layout or the layout optimized for themes with narrow columns.', 'webba-booking-lite' ),
            ]
        );
        wbk_opt()->add_option(
            'wbk_show_suitable_hours',
            'checkbox',
            __( 'Show suitable hours', 'webba-booking-lite' ),
            'wbk_mode_settings_section',
            [
                'not_translated_title' => 'Show suitable hours',
                'checkbox_value'       => 'yes',
                'dependency'           => [
                    'wbk_mode' => 'extended',
                ],
            ]
        );
        wbk_opt()->add_option(
            'wbk_multi_booking',
            'checkbox',
            __( 'Multiple bookings in one session', 'webba-booking-lite' ),
            'wbk_mode_settings_section',
            [
                'not_translated_title' => 'Multiple bookings in one session',
                'popup'                => __( 'Turn on to activate the multiple booking mode that allows booking multiple time slots in the same booking.', 'webba-booking-lite' ),
                'default'              => '',
                'checkbox_value'       => 'enabled',
            ]
        );
        wbk_opt()->add_option(
            'wbk_auto_next_on_timeslot_selection',
            'checkbox',
            __( 'Auto-advance to the next step in the booking form', 'webba-booking-lite' ),
            'wbk_mode_settings_section',
            [
                'not_translated_title' => 'Auto-advance to the next step in the booking form',
                'popup'                => __( 'Turn on to automatically go to the next step after selecting a time interval in the booking form\'s Date and time step.', 'webba-booking-lite' ),
                'default'              => '',
                'checkbox_value'       => 'enabled',
                'dependency'           => [
                    'wbk_multi_booking' => 'not_checked',
                ],
            ]
        );
        wbk_opt()->add_option(
            'wbk_phone_mask',
            'select',
            __( 'Phone number masked input', 'webba-booking-lite' ),
            'wbk_mode_settings_section',
            [
                'default'              => 'enabled',
                'not_translated_title' => 'Phone number masked input',
                'extra'                => [
                    'enabled'             => __( 'jQuery Masked Input Plugin', 'webba-booking-lite' ),
                    'enabled_mask_plugin' => __( 'jQuery Mask Plugin', 'webba-booking-lite' ),
                    'disabled'            => __( 'Disabled', 'webba-booking-lite' ),
                ],
                'dependency'           => [
                    'wbk_mode' => 'extended|simple',
                ],
            ]
        );
        wbk_opt()->add_option(
            'wbk_phone_format',
            'text',
            __( 'Phone format', 'webba-booking-lite' ),
            'wbk_mode_settings_section',
            [
                'default'              => '(000)000-0000',
                'not_translated_title' => 'Phone format',
                'popup'                => __( 'Customize phone number formats using "0" for mandatory digits and "9" for optional ones. E.g , (000) 000 00 00 requires 10 digits, while (000) 000 000 9 requires 9 digits with the 10th optional. Leave blank to disable formatting.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_phone_required',
            'checkbox',
            __( 'Phone field is mandatory', 'webba-booking-lite' ),
            'wbk_mode_settings_section',
            [
                'not_translated_title' => 'Phone field is mandatory',
                'popup'                => __( 'Turn on to make the phone field mandatory.', 'webba-booking-lite' ),
                'checkbox_value'       => '3',
                'default'              => '',
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_show_booked_slots',
            'checkbox',
            __( 'Show booked time slots', 'webba-booking-lite' ),
            'wbk_mode_settings_section',
            [
                'not_translated_title' => 'Show booked time slots',
                'popup'                => __( 'Turn on to show booked time slots as "Booked".', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_appointments_auto_lock',
            'checkbox',
            __( 'Autolock bookings', 'webba-booking-lite' ),
            'wbk_appointments_settings_section',
            [
                'not_translated_title' => 'Autolock bookings',
                'popup'                => __( 'When one service is booked, it will automatically lock another one, preventing conflicting bookings.', 'webba-booking-lite' ),
            ]
        );
        wbk_opt()->add_option(
            'wbk_appointments_auto_lock_mode',
            'select',
            __( 'Perform autolock on', 'webba-booking-lite' ),
            'wbk_appointments_settings_section',
            [
                'not_translated_title' => 'Perform autolock on',
                'popup'                => __( 'Choose whether the autolock feature applies to all services or only services within the same category.', 'webba-booking-lite' ),
                'default'              => 'all',
                'extra'                => [
                    'all'        => __( 'All services', 'webba-booking-lite' ),
                    'categories' => __( 'Services in the same category', 'webba-booking-lite' ),
                ],
                'dependency'           => [
                    'wbk_appointments_auto_lock' => ':checked',
                ],
            ]
        );
        wbk_opt()->add_option(
            'wbk_appointments_auto_lock_group',
            'select',
            __( 'Autolock for group booking services', 'webba-booking-lite' ),
            'wbk_appointments_settings_section',
            [
                'default'              => 'lock',
                'not_translated_title' => 'Autolock for group booking services',
                'popup'                => __( 'Choose to either "Lock time slot" or "Reduce count of available places" when a group booking is turned on.', 'webba-booking-lite' ),
                'extra'                => [
                    'lock'   => __( 'Lock time slot', 'webba-booking-lite' ),
                    'reduce' => __( 'Reduce count of available places', 'webba-booking-lite' ),
                ],
                'dependency'           => [
                    'wbk_appointments_auto_lock' => ':checked',
                ],
            ]
        );
        wbk_opt()->add_option(
            'wbk_appointments_default_status',
            'select',
            __( 'Default booking status', 'webba-booking-lite' ),
            'wbk_appointments_settings_section',
            [
                'not_translated_title' => 'Default booking status',
                'popup'                => __( 'Specify the default status assigned to newly created bookings.', 'webba-booking-lite' ),
                'default'              => 'approved',
                'extra'                => [
                    'approved' => __( 'Approved', 'webba-booking-lite' ),
                    'pending'  => __( 'Pending', 'webba-booking-lite' ),
                ],
            ]
        );
        wbk_opt()->add_option(
            'wbk_appointments_allow_payments',
            'checkbox',
            __( 'Allow payments only for approved bookings', 'webba-booking-lite' ),
            'wbk_appointments_settings_section',
            [
                'not_translated_title' => 'Allow payments only for approved bookings',
                'popup'                => __( 'Turn on to restrict payment functionality to approved bookings only.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_allow_coupons',
            'checkbox',
            __( 'Coupons', 'webba-booking-lite' ),
            'wbk_appointments_settings_section',
            [
                'not_translated_title' => 'Coupons',
                'popup'                => __( 'Turn on to activate the coupon feature in the booking system. Read more about <a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/set-up-frontend-booking-process/coupons/">Coupns setup</a>.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_appointments_delete_not_paid_mode',
            'select',
            __( 'Delete unpaid bookings', 'webba-booking-lite' ),
            'wbk_appointments_settings_section',
            [
                'default'              => 'on_booking',
                'extra'                => [
                    'disabled'   => __( 'Disabled', 'webba-booking-lite' ),
                    'on_booking' => __( 'Set expiration time on booking', 'webba-booking-lite' ),
                    'on_approve' => __( 'Set expiration time on approve', 'webba-booking-lite' ),
                ],
                'not_translated_title' => 'Delete unpaid bookings',
                'popup'                => __( 'Turn on to automatically delete unpaid bookings.', 'webba-booking-lite' ) . '<br />',
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_appointments_delete_payment_started',
            'select',
            __( 'Delete unpaid bookings with started payment', 'webba-booking-lite' ),
            'wbk_appointments_settings_section',
            [
                'default'              => 'delete',
                'extra'                => [
                    'skip'   => __( 'Do not delete bookings with started transaction', 'webba-booking-lite' ),
                    'delete' => __( 'Delete bookings with started transaction', 'webba-booking-lite' ),
                ],
                'not_translated_title' => 'Delete unpaid bookings with started payment',
                'popup'                => __( 'Choose whether to automatically remove unpaid bookings that have already initiated the payment process.', 'webba-booking-lite' ),
                'dependency'           => [
                    'wbk_appointments_delete_not_paid_mode' => 'on_booking|on_approve',
                ],
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_appointments_expiration_time',
            'text',
            __( 'Time to pay (in minutes)', 'webba-booking-lite' ),
            'wbk_appointments_settings_section',
            [
                'default'              => '10',
                'not_translated_title' => 'Time to pay (in minutes)',
                'popup'                => __( 'Specify the time given to the customer (in minutes) for completing the payment before the booking is automatically deleted.', 'webba-booking-lite' ),
                'dependency'           => [
                    'wbk_appointments_delete_not_paid_mode' => 'on_booking|on_approve',
                ],
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_cancellation_buffer',
            'text',
            __( 'Cancellation buffer (in minutes)', 'webba-booking-lite' ),
            'wbk_appointments_settings_section',
            [
                'not_translated_title' => 'Cancellation buffer (in minutes)',
                'popup'                => __( 'Set the cutoff time (in minutes) before the scheduled booking when customers cannot cancel or modify their bookings.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_appointments_allow_cancel_paid',
            'select',
            __( 'Allow cancellation of paid bookings', 'webba-booking-lite' ),
            'wbk_appointments_settings_section',
            [
                'default'              => 'disallow',
                'extra'                => [
                    'allow'    => __( 'Allow', 'webba-booking-lite' ),
                    'disallow' => __( 'Disallow', 'webba-booking-lite' ),
                ],
                'not_translated_title' => 'Allow cancellation of paid bookings',
                'popup'                => __( 'Turn on to allow customers to cancel their paid bookings.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_appointments_only_one_per_slot',
            'checkbox',
            __( 'Allow only one booking per time slot from an email', 'webba-booking-lite' ),
            'wbk_appointments_settings_section',
            [
                'not_translated_title' => 'Allow only one booking per time slot from an email',
                'popup'                => __( 'Turn on to restrict customers from making multiple bookings for the same time slot using the same email address.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_appointments_only_one_per_day',
            'checkbox',
            __( 'Allow only one booking per day from an email', 'webba-booking-lite' ),
            'wbk_appointments_settings_section',
            [
                'not_translated_title' => 'Allow only one booking per day from an email',
                'popup'                => __( 'Turn on to restrict customers from making multiple bookings for the same day using the same email address.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_appointments_only_one_per_service',
            'checkbox',
            __( 'Allow only one booking per service from an email', 'webba-booking-lite' ),
            'wbk_appointments_settings_section',
            [
                'not_translated_title' => 'Allow only one booking per service from an email',
                'popup'                => __( 'Turn on to restrict customers from making multiple bookings for the same service using the same email address.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_appointments_expiration_time_pending',
            'text',
            __( 'Delete pending bookings (in minutes)', 'webba-booking-lite' ),
            'wbk_appointments_settings_section',
            [
                'default'              => '0',
                'not_translated_title' => 'Delete pending bookings (in minutes)',
                'popup'                => __( 'Specify the minutes (X) after which "Pending" bookings will be automatically deleted. To disable automatic deletion, set the value to 0.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_appointments_autolock_avail_limit',
            'text',
            __( 'Maximum number of bookings at a specific time', 'webba-booking-lite' ),
            'wbk_appointments_settings_section',
            [
                'not_translated_title' => 'Maximum number of bookings at a specific time',
                'popup'                => __( 'Set the system-wide maximum number of bookings allowed at any given time for all services. Leave it empty for no restrictions.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_appointments_limit_by_day',
            'text',
            __( 'Maximum number of bookings on a specific day', 'webba-booking-lite' ),
            'wbk_appointments_settings_section',
            [
                'not_translated_title' => 'Maximum number of bookings on a specific day',
                'popup'                => __( 'Set the limit for the maximum number of bookings across all services in a day. Leave it empty for no restrictions.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_appointments_lock_timeslot_if_parital_booked',
            'select_multiple',
            __( 'Lock time slot if at least one place is booked', 'webba-booking-lite' ),
            'wbk_appointments_settings_section',
            [
                'extra'                => WBK_Model_Utils::get_services(),
                'not_translated_title' => 'Lock time slot if at least one place is booked',
                'popup'                => __( 'Select the services for which a time slot will be automatically locked once at least one place is booked. Note: With autolock turned on, connected service bookings are considered when locking time slots.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_appointments_lock_day_if_timeslot_booked',
            'select_multiple',
            __( 'Lock whole day if at least one time slot is booked', 'webba-booking-lite' ),
            'wbk_appointments_settings_section',
            [
                'extra'                => WBK_Model_Utils::get_services(),
                'not_translated_title' => 'Lock whole day if at least one time slot is booked',
                'popup'                => __( '"Select the services for which a whole day will be automatically locked once at least one time slot is booked. Note: With autolock turned on, connected service bookings are considered when locking a day."', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_appointments_lock_one_before_and_one_after',
            'select_multiple',
            __( 'Lock one time slot before and after booking', 'webba-booking-lite' ),
            'wbk_appointments_settings_section',
            [
                'extra'                => WBK_Model_Utils::get_services(),
                'not_translated_title' => 'Lock one time slot before and after booking',
                'popup'                => __( '"Select the services for which time slots before and after the booking will be automatically locked.
Note: With autolock turned on, connected service bookings are considered when locking time slots."', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_appointments_special_hours',
            'textarea',
            __( 'Special business hours', 'webba-booking-lite' ),
            'wbk_appointments_settings_section',
            [
                'not_translated_title' => 'Special business hours',
                'popup'                => __( 'Modify the business hours of specific services on particular dates.', 'webba-booking-lite' ) . '<br />' . __( 'Example 1: 1 01/15/2023 15:00-18:00', 'webba-booking-lite' ) . '<br />' . __( 'This indicates that the service with the ID 1 will be available on 01/15/2023 from 15:00 to 18:00.', 'webba-booking-lite' ) . '<br />' . __( 'Example 2: 01/15/2023 15:00-18:00', 'webba-booking-lite' ) . '<br />' . __( 'This means that all services will be available on 01/15/2023 from 15:00 to 18:00.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_check_short_code',
            'checkbox',
            __( 'Load CSS & JS only on the booking page', 'webba-booking-lite' ),
            'wbk_general_settings_section',
            [
                'not_translated_title' => 'Load CSS & JS only on the booking page',
                'popup'                => __( 'Turn on to load CSS and JS files only when the booking form shortcode is detected on the page, optimizing performance for non-booking pages.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_disable_day_on_all_booked',
            'select',
            __( 'Disable booked dates in calendar', 'webba-booking-lite' ),
            'wbk_mode_settings_section',
            [
                'default'              => 'foreach',
                'extra'                => [
                    'disabled'     => __( 'No', 'webba-booking-lite' ),
                    'enabled'      => __( 'Yes', 'webba-booking-lite' ),
                    'enabled_plus' => __( 'Yes (including bookings from neighboring services.)', 'webba-booking-lite' ),
                ],
                'not_translated_title' => 'Disable booked dates in calendar',
                'popup'                => __( 'Disable date in the calendar if no free time slots found.', 'webba-booking-lite' ),
            ]
        );
        wbk_opt()->add_option(
            'wbk_holydays',
            'text',
            __( 'Holidays', 'webba-booking-lite' ),
            'wbk_general_settings_section',
            [
                'not_translated_title' => 'Holidays',
                'popup'                => __( 'Set dates when your business is closed, and no new bookings will be accepted.', 'webba-booking-lite' ),
                'default'              => '',
            ]
        );
        wbk_opt()->add_option(
            'wbk_recurring_holidays',
            'checkbox',
            __( 'Recurring holidays', 'webba-booking-lite' ),
            'wbk_general_settings_section',
            [
                'checkbox_value'       => 'true',
                'not_translated_title' => 'Recurring holidays',
                'popup'                => __( 'Turn on to set holidays as recurring yearly.', 'webba-booking-lite' ),
                'default'              => 'true',
            ]
        );
        wbk_opt()->add_option(
            'wbk_email_customer_arrived_delay',
            'text',
            __( 'Set delay for "Arrived" email', 'webba-booking-lite' ),
            'wbk_email_settings_section',
            [
                'default'              => '',
                'not_translated_title' => 'Set delay for Arrived email',
                'popup'                => __( 'Specify the delay (in hours) for the "Arrived" email notification. Alternatively, leave this field empty to send the notification immediately after the status is changed', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_email_reminder_days',
            'text',
            __( 'Send reminders to customers in X days', 'webba-booking-lite' ),
            'wbk_email_settings_section',
            [
                'default'              => '1',
                'not_translated_title' => 'Send reminders to customers in X days',
                'popup'                => __( 'Select the timing for the reminder notification. For instance, set the value to 0 for the day of booking, 1 for one day before the booking, 2 for two days before, and so on.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        $format = WBK_Date_Time_Utils::get_time_format();
        date_default_timezone_set( 'UTC' );
        $data_time = [];
        $data_keys = [];
        for ($i = 0; $i < 86400; $i += 600) {
            $data_time[] = wp_date( $format, $i, new DateTimeZone(date_default_timezone_get()) );
            $data_keys[] = $i;
        }
        $data_time = array_combine( $data_keys, $data_time );
        wbk_opt()->add_option(
            'wbk_email_admin_daily_time',
            'select',
            __( 'Reminder sending time', 'webba-booking-lite' ),
            'wbk_general_settings_section',
            [
                'default'              => '43200',
                'extra'                => $data_time,
                'not_translated_title' => 'Reminder sending time',
                'popup'                => __( 'Set the preferred hour for email reminders sent to customers and admins, based on your local timezone.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_email_override_replyto',
            'checkbox',
            __( 'Override default reply-to headers with booking-related data', 'webba-booking-lite' ),
            'wbk_email_settings_section',
            [
                'checkbox_value'       => 'true',
                'not_translated_title' => 'Override default reply-to headers with booking-related data',
                'popup'                => __( 'When Enabled:Customer Notifications: The reply-to email address is set to the email specified in the service settings. Admin Notifications: The reply-to email address is set to the customer\'s email address. When Disabled: The \'From: email\' value is used as the reply-to address for notifications.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_from_name',
            'text',
            __( 'From: name', 'webba-booking-lite' ),
            'wbk_email_settings_section',
            [
                'not_translated_title' => 'From: name',
                'popup'                => __( 'Enter the name that will be displayed as the sender in the email notifications.', 'webba-booking-lite' ),
            ]
        );
        wbk_opt()->add_option(
            'wbk_from_email',
            'text',
            __( 'From: email', 'webba-booking-lite' ),
            'wbk_email_settings_section',
            [
                'not_translated_title' => 'From: email',
                'popup'                => __( 'Enter the email that will be displayed as the sender in the email notifications.', 'webba-booking-lite' ),
            ]
        );
        wbk_opt()->add_option(
            'wbk_super_admin_email',
            'text',
            __( 'Send copies of admin email notifications to addresses', 'webba-booking-lite' ),
            'wbk_email_settings_section',
            [
                'not_translated_title' => 'Send copies of admin email notifications to addresses',
                'popup'                => __( 'Enter the email addresses where you want to receive copies of admin notifications. Separate multiple email addresses with comma.', 'webba-booking-lite' ),
            ]
        );
        wbk_opt()->add_option(
            'wbk_email_landing',
            'text',
            __( 'Notifications landing page', 'webba-booking-lite' ),
            'wbk_email_settings_section',
            [
                'not_translated_title' => 'Notifications landing page',
                'popup'                => __( 'Specify the landing page URL for payment or cancelation. This page should include the [webbabooking] shortcode.', 'webba-booking-lite' ),
            ]
        );
        wbk_opt()->add_option(
            'wbk_date_input_dropdown_count',
            'text',
            __( 'Number of dates in the dropdown input', 'webba-booking-lite' ),
            'wbk_mode_settings_section',
            [
                'default'              => '30',
                'not_translated_title' => 'Number of dates in the dropdown input',
                'popup'                => __( 'Used only for dropdown date select', 'webba-booking-lite' ),
                'dependency'           => [
                    'wbk_date_input' => 'dropdown',
                ],
            ]
        );
        wbk_opt()->add_option(
            'wbk_avaiability_popup_calendar',
            'text',
            __( 'Number of dates in the calendar', 'webba-booking-lite' ),
            'wbk_mode_settings_section',
            [
                'default'              => '360',
                'not_translated_title' => 'Number of dates in the calendar',
                'popup'                => __( 'Specify the number of dates displayed in the calendar.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_timeslot_time_string',
            'select',
            __( 'Time slot format', 'webba-booking-lite' ),
            'wbk_mode_settings_section',
            [
                'not_translated_title' => 'Time slot format',
                'popup'                => __( 'Choose between displaying only the start time or both the start and end times in the time slots.', 'webba-booking-lite' ),
                'default'              => 'start',
                'extra'                => [
                    'start'     => __( 'Start', 'webba-booking-lite' ),
                    'start_end' => __( 'Start', 'webba-booking-lite' ) . ' - ' . __( 'end', 'webba-booking-lite' ),
                ],
            ]
        );
        wbk_opt()->add_option(
            'wbk_csv_delimiter',
            'select',
            __( 'CSV delimiter', 'webba-booking-lite' ),
            'wbk_general_settings_section',
            [
                'default'              => 'Semicolon',
                'not_translated_title' => 'CSV delimiter',
                'popup'                => __( 'If your date format includes a comma, use a semicolon. Otherwise, select the comma.', 'webba-booking-lite' ),
                'extra'                => [
                    'comma'     => __( 'Comma', 'webba-booking-lite' ),
                    'semicolon' => __( 'Semicolon', 'webba-booking-lite' ),
                ],
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_pickadate_load',
            'checkbox',
            __( 'Load Pickadate javascript', 'webba-booking-lite' ),
            'wbk_general_settings_section',
            [
                'checkbox_value'       => 'yes',
                'default'              => 'yes',
                'not_translated_title' => 'Load Pickadate javascript',
                'popup'                => __( 'Turn off if other plugins in your WordPress installation are using the pickadate date picker.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_general_tax',
            'text',
            __( 'Tax', 'webba-booking-lite' ),
            'wbk_general_settings_section',
            [
                'not_translated_title' => 'Tax',
                'popup'                => __( 'Tax used for online payments.', 'webba-booking-lite' ),
                'default'              => '0',
            ]
        );
        wbk_opt()->add_option(
            'wbk_payment_price_format',
            'text',
            __( 'Price format', 'webba-booking-lite' ),
            'wbk_general_settings_section',
            [
                'default'              => '$#price',
                'not_translated_title' => 'Price format',
                'popup'                => __( 'Price format on the booking form. Required placeholder: #price. E.g.: $#price.', 'webba-booking-lite' ),
            ]
        );
        wbk_opt()->add_option(
            'wbk_do_not_tax_deposit',
            'checkbox',
            __( 'Do not tax the deposit (service fee)', 'webba-booking-lite' ),
            'wbk_general_settings_section',
            [
                'checkbox_value'       => 'true',
                'not_translated_title' => 'Do not tax the deposit (service fee)',
                'popup'                => __( 'Turn on to avoid adding tax to the deposit. Important note: when this is turned on, do not use subtotal and tax placeholders.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_price_fractional',
            'text',
            __( 'Fractional digits in price', 'webba-booking-lite' ),
            'wbk_general_settings_section',
            [
                'default'              => '2',
                'not_translated_title' => 'Fractional digits in price',
                'popup'                => __( 'Write the number of decimal places to show for prices. E.g. Write 1 for prices to appear as 25.1 or 2 for prices to appear as 25.10.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_price_separator',
            'text',
            __( 'Fraction separator in prices', 'webba-booking-lite' ),
            'wbk_general_settings_section',
            [
                'default'              => '.',
                'not_translated_title' => 'Fraction separator in prices',
                'popup'                => __( 'Choose the symbol or character to separate decimals in prices. E.g. Use either a period (.) or a comma (,).', 'webba-booking-lite' ),
            ]
        );
        wbk_opt()->add_option(
            'wbk_general_dynamic_placeholders',
            'text',
            __( 'List of dynamic placeholders', 'webba-booking-lite' ),
            'wbk_general_settings_section',
            [
                'default'              => '',
                'not_translated_title' => 'List of dynamic placeholders',
                'popup'                => __( 'Enter a comma-separated list of placeholders to remove from the string if they are not replaced with values. This is useful if you are using different custom fields for services and as a result some custom field placeholders are not replaced.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_load_js_in_footer',
            'checkbox',
            __( 'Load javascript files in the footer', 'webba-booking-lite' ),
            'wbk_general_settings_section',
            [
                'checkbox_value'       => 'true',
                'not_translated_title' => 'Load javascript files in the footer',
                'popup'                => __( 'Enabling this option may increase page loading time in some cases.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'service-label-wbk',
            'text',
            __( 'Service label', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Select a service', 'webba-booking-lite' ),
                'not_translated_title' => 'Service label',
                'popup'                => __( 'Service label on the booking form.', 'webba-booking-lite' ),
            ]
        );
        wbk_opt()->add_option(
            'wbk_category_label',
            'text',
            __( 'Category label', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Select category', 'webba-booking-lite' ),
                'not_translated_title' => 'Category label',
                'popup'                => __( 'Category label on the booking form.', 'webba-booking-lite' ),
            ]
        );
        wbk_opt()->add_option(
            'wbk_date_basic_label',
            'text',
            __( 'Date label', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Book an appointment on', 'webba-booking-lite' ),
                'not_translated_title' => 'Date label',
                'popup'                => __( 'Date label on the booking form.', 'webba-booking-lite' ),
            ]
        );
        wbk_opt()->add_option(
            'wbk_date_input_placeholder',
            'text_alfa_numeric',
            __( 'Select date input placeholder', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'date', 'webba-booking-lite' ),
                'not_translated_title' => 'Select date input placeholder',
                'popup'                => __( 'Select date input placeholder on the booking form.', 'webba-booking-lite' ),
            ]
        );
        wbk_opt()->add_option(
            'wbk_readmore_text',
            'text',
            __( 'Service \'Read more\' label', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Read more' ),
                'not_translated_title' => 'Service Read more label',
                'popup'                => __( 'Text of the \'Read more\' link.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_form_label',
            'text',
            __( 'Booking form title', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => '',
                'not_translated_title' => 'Booking form title',
                'popup'                => __( 'Text above the booking form. List of available placeholders.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_booked_text',
            'text',
            __( 'Booked time slot text', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Booked', 'webba-booking-lite' ),
                'not_translated_title' => 'Booked time slot text',
                'popup'                => __( 'Text on a booked time slot.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_name_label',
            'text',
            __( 'Name label', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Name', 'webba-booking-lite' ),
                'not_translated_title' => 'Name label',
                'popup'                => __( 'Name label on the booking form.', 'webba-booking-lite' ),
            ]
        );
        wbk_opt()->add_option(
            'wbk_email_label',
            'text',
            __( 'Email label', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Email', 'webba-booking-lite' ),
                'not_translated_title' => 'Email label',
                'popup'                => __( 'Email label on the booking form.', 'webba-booking-lite' ),
            ]
        );
        wbk_opt()->add_option(
            'wbk_phone_label',
            'text',
            __( 'Phone label', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Phone', 'webba-booking-lite' ),
                'not_translated_title' => 'Phone label',
                'popup'                => __( 'Phone label on the booking form.', 'webba-booking-lite' ),
            ]
        );
        wbk_opt()->add_option(
            'wbk_comment_label',
            'text',
            __( 'Comment label', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Comment', 'webba-booking-lite' ),
                'not_translated_title' => 'Comment label',
                'popup'                => __( 'Comment label on the booking form.', 'webba-booking-lite' ),
            ]
        );
        wbk_opt()->add_option(
            'wbk_book_items_quantity_label',
            'text',
            __( 'Quantity label', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'How many people per time slot?', 'webba-booking-lite' ),
                'not_translated_title' => 'Quantity label',
                'popup'                => __( 'Quantity label on the booking form for group bookings. Available placeholders: #service', 'webba-booking-lite' ),
            ]
        );
        wbk_opt()->add_option(
            'wbk_book_thanks_message',
            'editor',
            __( 'Thank you message', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => '',
                'not_translated_title' => 'Thank you message',
                'popup'                => __( 'Customize the thank you message displayed after a booking is made. Leave it empty to use the default formatted thank you message.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_book_not_found_message',
            'text',
            __( 'Time slots not found message', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Unfortunately we were unable to meet your search criteria. Please change the criteria and try again.', 'webba-booking-lite' ),
                'not_translated_title' => 'Time slots not found message',
                'popup'                => __( 'Message displayed when no time slots are found for the selected service and date.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_payment_pay_with_paypal_btn_text',
            'text_alfa_numeric',
            __( 'PayPal option label', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Pay now with PayPal', 'webba-booking-lite' ),
                'not_translated_title' => 'PayPal option label',
                'popup'                => __( 'Label for PayPal payment method', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_stripe_button_text',
            'text_alfa_numeric',
            __( 'Credit card option label', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Pay with credit card', 'webba-booking-lite' ),
                'not_translated_title' => 'Credit card option label',
                'popup'                => __( 'Label for Stripe payment method', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_stripe_card_element_error_message',
            'text',
            __( 'Stripe card element error message', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'incorrect input', 'webba-booking-lite' ),
                'not_translated_title' => 'Stripe card element error message',
                'popup'                => __( 'Error message that appears if an issue occurs with the Stripe payment method. To show this message go to Stripe -> Advanced Settings and turn on "override Stripe card element error messages".', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_stripe_api_error_message',
            'text',
            __( 'Stripe API error message', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Payment failed: #response', 'webba-booking-lite' ),
                'not_translated_title' => 'Stripe API error message',
                'popup'                => __( 'Stripe API error message during payment processing. Placeholders: #response.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_pay_on_arrival_button_text',
            'text_alfa_numeric',
            __( 'Pay on arrival option label', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Pay on arrival', 'webba-booking-lite' ),
                'not_translated_title' => 'Pay on arrival option label',
                'popup'                => __( 'Label for Pay on arrival payment method.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_pay_on_arrival_message',
            'text',
            __( 'Message for Pay on arrival payment method', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Pay on arrival', 'webba-booking-lite' ),
                'not_translated_title' => 'Message for Pay on arrival payment method',
                'popup'                => __( 'Message for Pay on arrival payment method.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_bank_transfer_button_text',
            'text_alfa_numeric',
            __( 'Bank transfer option label', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Pay by bank transfer', 'webba-booking-lite' ),
                'not_translated_title' => 'Bank transfer option label',
                'popup'                => __( 'Label for Bank transfer payment method.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_bank_transfer_message',
            'text',
            __( 'Message for Bank transfer payment method', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Pay by the bank transfer.', 'webba-booking-lite' ),
                'not_translated_title' => 'Message for Bank transfer payment method',
                'popup'                => __( 'Message for Bank transfer payment method.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_product_meta_key',
            'text',
            __( 'Meta key for WooCommerce product', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Booking', 'webba-booking-lite' ),
                'not_translated_title' => 'Meta key for WooCommerce product',
                'popup'                => __( 'Label for services in WooCommerce.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_woo_button_text',
            'text_alfa_numeric',
            __( 'WooCommerce option label', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Add to cart', 'webba-booking-lite' ),
                'not_translated_title' => 'WooCommerce option label',
                'popup'                => __( 'User in the cart item', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_woo_error_add_to_cart',
            'text',
            __( 'Add to cart error message', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Booking not added to cart', 'webba-booking-lite' ),
                'not_translated_title' => 'Add to cart error message',
                'popup'                => __( 'Error message that appears if an issue occurs with adding a booking to WooCommerce cart.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_payment_details_title',
            'text_alfa_numeric',
            __( 'Payment details title', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Payment details', 'webba-booking-lite' ),
                'not_translated_title' => 'Payment details title',
                'popup'                => __( 'Message above the payment details.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_payment_item_name',
            'text',
            __( 'Payment item text', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => '#service_name on #appointment_day at #appointment_time',
                'not_translated_title' => 'Payment item text',
                'popup'                => '<a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/placeholders/">' . __( 'List of available placeholders', 'webba-booking-lite' ) . '</a>',
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_payment_subtotal_title',
            'text',
            __( 'Subtotal title', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Subtotal', 'webba-booking-lite' ),
                'not_translated_title' => 'Subtotal title',
                'popup'                => __( 'Label for the subtotal amount in payment details', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_tax_label',
            'text',
            __( 'Tax label', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Tax', 'webba-booking-lite' ),
                'not_translated_title' => 'Tax label',
                'popup'                => __( 'Label for the tax in payment details', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_service_fee_description',
            'text',
            __( 'Service fee label', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Service fee', 'webba-booking-lite' ),
                'not_translated_title' => 'Service fee label',
                'popup'                => __( 'Label for the service fee in payment details', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_payment_discount_item',
            'text',
            __( 'Discount label', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Discount', 'webba-booking-lite' ),
                'not_translated_title' => 'Discount label',
                'popup'                => __( 'Label for the discount', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_payment_total_title',
            'text',
            __( 'Total title', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Total', 'webba-booking-lite' ),
                'not_translated_title' => 'Total title',
                'popup'                => __( 'Label for the total amount in payment details', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_nothing_to_pay_message',
            'text',
            __( 'No bookings for payment message', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'There are no bookings available for payment.', 'webba-booking-lite' ),
                'not_translated_title' => 'No bookings for payment message',
                'popup'                => __( 'Message shown when there are no bookings available for payment', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        // continue here
        wbk_opt()->add_option(
            'wbk_show_locked_as_booked',
            'checkbox',
            __( 'Show locked time slots as booked', 'webba-booking-lite' ),
            'wbk_mode_settings_section',
            [
                'not_translated_title' => 'Show locked time slots as booked',
                'popup'                => __( 'Turn on to show locked time slots as "Booked".', 'webba-booking-lite' ),
                'checkbox_value'       => 'yes',
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_allow_attachemnt',
            'checkbox',
            __( 'Allow attachments', 'webba-booking-lite' ),
            'wbk_general_settings_section',
            [
                'checkbox_value'       => 'yes',
                'not_translated_title' => 'Allow attachments',
                'popup'                => __( 'Turn on to allow users to attach files in the booking form. Please include the file input field in the custom form. For more information, see <a href="https://webba-booking.com/documentation/set-up-frontend-booking-process/using-custom-fields-in-the-booking-form/" target="_blank" rel="noopener noreferrer">Custom fields</a>.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_delete_attachemnt',
            'checkbox',
            __( 'Automatically delete attachments', 'webba-booking-lite' ),
            'wbk_general_settings_section',
            [
                'checkbox_value'       => 'yes',
                'default'              => 'yes',
                'not_translated_title' => 'Automatically delete attachments',
                'popup'                => __( 'Highly Recommended: Turn this on to automatically delete the attachment as soon as the notification is sent.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_disable_security',
            'checkbox',
            __( 'Disable advanced security checks', 'webba-booking-lite' ),
            'wbk_general_settings_section',
            [
                'checkbox_value'       => 'true',
                'default'              => 'true',
                'not_translated_title' => 'Disable advanced security checks',
                'popup'                => __( 'IMPORTANT: if you disable this option, make sure to not cache pages with the booking form.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_order_service_by',
            'select',
            __( 'Order service by', 'webba-booking-lite' ),
            'wbk_mode_settings_section',
            [
                'not_translated_title' => 'Order service by',
                'popup'                => __( 'Choose between alphabetical order (A - Z) or order by priority for displaying services on the booking form.', 'webba-booking-lite' ),
                'default'              => 'a-z',
                'extra'                => [
                    'a-z'        => __( 'A-Z', 'webba-booking-lite' ),
                    'priority'   => __( 'Priority (descending)', 'webba-booking-lite' ),
                    'priority_a' => __( 'Priority (ascending)', 'webba-booking-lite' ),
                ],
            ]
        );
        wbk_opt()->add_option(
            'wbk_night_hours',
            'text',
            __( 'Show night hours time slots in previous day', 'webba-booking-lite' ),
            'wbk_mode_settings_section',
            [
                'default'              => '0',
                'not_translated_title' => 'Show night hours time slots in previous day',
                'popup'                => __( 'Specify the number of hours after midnight to display on the next day\'s calendar.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_allow_cross_midnight',
            'checkbox',
            __( 'Allow time slots to cross midnight', 'webba-booking-lite' ),
            'wbk_appointments_settings_section',
            [
                'checkbox_value'       => 'true',
                'not_translated_title' => 'Allow time slots to cross midnight',
                'popup'                => __( 'Turn on to allow time slots that extend beyond midnight.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_disallow_after',
            'text',
            __( 'Block time slots after X hours from the current time', 'webba-booking-lite' ),
            'wbk_appointments_settings_section',
            [
                'default'              => '0',
                'not_translated_title' => 'Block time slots after X hours from the current time',
                'popup'                => __( 'Set 0 to not disable time slots', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_gdrp',
            'checkbox',
            __( 'EU GDPR Compliance', 'webba-booking-lite' ),
            'wbk_appointments_settings_section',
            [
                'not_translated_title' => 'EU GDPR Compliance',
                'popup'                => __( 'Turn on to align the booking system with GDPR guidelines, providing enhanced data protection and privacy for customer information.', 'webba-booking-lite' ),
            ]
        );
        wbk_opt()->add_option(
            'wbk_allow_ongoing_time_slot',
            'checkbox',
            __( 'Disallow booking of the current time slot', 'webba-booking-lite' ),
            'wbk_appointments_settings_section',
            [
                'default'              => 'disallow',
                'checkbox_value'       => 'disallow',
                'not_translated_title' => 'Disallow booking of the current time slot',
                'popup'                => __( 'Turn on to prevent customers from making bookings for the current time slot.', 'webba-booking-lite' ),
            ]
        );
        wbk_opt()->add_option(
            'wbk_mode_overlapping_availabiliy',
            'checkbox',
            __( 'Consider the availability of overlapping time intervals', 'webba-booking-lite' ),
            'wbk_appointments_settings_section',
            [
                'default'              => 'true',
                'checkbox_value'       => 'true',
                'not_translated_title' => 'Consider the availability of overlapping time intervals',
                'popup'                => __( 'Turn on this option to control the availability of time slots for the same service when they overlap. When turned on, the system will automatically adjust the availability to avoid double booking.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_set_arrived_after',
            'text',
            __( 'Set the status to "Arrived" X minutes after the end of the booking', 'webba-booking-lite' ),
            'wbk_appointments_settings_section',
            [
                'not_translated_title' => 'Set the status to Arrived X minutes after the end of the booking',
                'popup'                => __( 'Specify the number of minutes after the end of the booking when the status should be automatically changed to "Arrived." Leave the field empty to keep the status unchanged.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_payment_cancel_message',
            'text',
            __( 'PayPal payment cancelation message', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Payment canceled.', 'webba-booking-lite' ),
                'not_translated_title' => 'PayPal payment cancelation message',
                'popup'                => __( 'Message shown when payment with PayPal is canceled', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_booking_cancel_email_label',
            'text_alfa_numeric',
            __( 'Cancellation form label', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Please, enter your email to confirm cancelation', 'webba-booking-lite' ),
                'not_translated_title' => 'Cancellation form label',
                'popup'                => __( 'Text of the cancelation form label', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_booking_cancel_form_title',
            'text_alfa_numeric',
            __( 'Cancellation form title', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Cancellation', 'webba-booking-lite' ),
                'not_translated_title' => 'Cancellation form title',
                'popup'                => __( 'Cancellation form title. Appears on the sidebar (on desktop) and top bar (on mobile)', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_cancel_button_text',
            'text_alfa_numeric',
            __( 'Cancellation button text', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Cancel booking', 'webba-booking-lite' ),
                'not_translated_title' => 'Cancellation button text',
                'popup'                => __( 'Text of the cancelation button', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_appointment_information',
            'text',
            __( 'Booking details', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Booking', 'webba-booking-lite' ),
                'not_translated_title' => 'Booking details',
                'popup'                => __( '"Message shown when customers pay for a booking or cancel their booking using the link sent in the email notification.
Available placeholders: #name (customer name), #id (appointment id), #service (service name), #date (appointment date), #time (appointment time), #dt (appointment date and time), #start_end (appointment time in start-end format)."', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_booking_cancel_error_message',
            'text',
            __( 'Cancellation error message', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Unable to cancel booking, please check the email you\'ve entered.', 'webba-booking-lite' ),
                'not_translated_title' => 'Cancellation error message',
                'popup'                => __( 'Message shown when an error occurs on cancelation', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_booking_couldnt_be_canceled',
            'text',
            __( 'Warning message on cancel booking (reason: paid booking)', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Paid booking can\'t be canceled.', 'webba-booking-lite' ),
                'not_translated_title' => 'Warning message on cancel booking (reason: paid booking)',
                'popup'                => __( 'Displayed when customer tries to cancel paid booking.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_booking_couldnt_be_canceled2',
            'text',
            __( 'Warning message on cancel booking (buffer)', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Sorry, you can not cancel because you have exceeded the time allowed to do so.', 'webba-booking-lite' ),
                'not_translated_title' => 'Warning message on cancel booking (buffer)',
                'popup'                => __( 'Message shown when a customer tries to cancel a booking within a time frame that does not allow cancellations. Buffer time is set in Booking rules -> Cancellation buffer (in minutes)', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_email_landing_text',
            'text',
            __( 'Text of the payment link sent to a customer', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Click here to pay for your booking.', 'webba-booking-lite' ),
                'not_translated_title' => 'Text of the payment link sent to a customer',
                'popup'                => __( 'Text of the payment link sent to a customer in the email notification.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_email_landing_text_cancel',
            'text',
            __( 'Text of the cancelation link sent to a customer', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Click here to cancel your booking.', 'webba-booking-lite' ),
                'not_translated_title' => 'Text of the cancelation link sent to a customer',
                'popup'                => __( 'Text of the booking cancelation link sent to a customer in the email notification.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_email_landing_text_cancel_admin',
            'text',
            __( 'Text of the cancellation link sent to an admin', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Click here to cancel this booking.', 'webba-booking-lite' ),
                'not_translated_title' => 'Text of the cancellation link sent to an admin',
                'popup'                => __( 'Text of the booking cancelation link sent to the admin in the email notification.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_booking_canceled_message',
            'text',
            __( 'Cancellation success message', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Your booking has been cancelled.', 'webba-booking-lite' ),
                'not_translated_title' => 'Cancellation success message',
                'popup'                => __( 'Text of the shown to a customer when booking is cancelled.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_email_landing_text_approve_admin',
            'text',
            __( 'Text of the approval link sent to an admin', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Click here to approve this booking.', 'webba-booking-lite' ),
                'not_translated_title' => 'Text of the approval link sent to an admin',
                'popup'                => __( 'Text of the booking approval link sent to the admin in the email notification.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_email_landing_text_gg_event_add',
            'text',
            __( 'Text of the link for adding event to customer\'s Google Calendar', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Click here to add this event to your Google Calendar.', 'webba-booking-lite' ),
                'not_translated_title' => 'Text of the link for adding event to customers Google Calendar',
                'popup'                => __( 'Text of the link to add a booking to Google Calendar. Sent to a customer in the email notification.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_add_gg_button_text',
            'text',
            __( 'Add to customer\'s Google Calendar button text', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Add to my Google Calendar', 'webba-booking-lite' ),
                'not_translated_title' => 'Add to customer Google Calendar button text',
                'popup'                => __( 'Text of the link included in the email notification', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_gg_calendar_add_event_success',
            'text',
            __( 'Google calendar event adding success message', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Booking data added to Google Calendar.', 'webba-booking-lite' ),
                'not_translated_title' => 'Google calendar event adding success message',
                'popup'                => __( 'Message shown when booking is added to the Google Calendar.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_gg_calendar_add_event_canceled',
            'text',
            __( 'Google calendar event adding error message', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Appointment data not added to Google Calendar.', 'webba-booking-lite' ),
                'not_translated_title' => 'Google calendar event adding error message',
                'popup'                => __( 'Message shown when there was an issue with adding a booking to the Google Calendar.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_email_landing_text_invalid_token',
            'text',
            __( 'Booking token error message', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Booking token error message', 'webba-booking-lite' ),
                'not_translated_title' => 'Booking token error message',
                'popup'                => __( 'Message shown when booking link (cancelation, approval, payment) is invalid in the email notification.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_gg_calendar_event_title',
            'text',
            __( 'Google calendar event / iCal summary (for admin)', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => '#customer_name',
                'not_translated_title' => 'Google calendar event / iCal summary (for admin)',
                'popup'                => __( 'Available placeholders:', 'webba-booking-lite' ) . ' #customer_name, #customer_phone, #customer_email, #customer_comment, #items_count, #appointment_id, #customer_custom, #total_amount, #service_name, #status' . '<br />' . __( 'Placeholder for custom field:', 'webba-booking-lite' ) . ' #field_ + custom field id. Example: #field_custom-field-1',
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_gg_calendar_event_description',
            'text',
            __( 'Google calendar event / iCal description (for admin)', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => '#customer_name #customer_phone',
                'not_translated_title' => 'Google calendar event / iCal description (for admin)',
                'popup'                => '<a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/placeholders/">' . __( 'List of available placeholders', 'webba-booking-lite' ) . '</a>',
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_gg_calendar_event_title_customer',
            'text',
            __( 'Google calendar event / iCal summary (for customer)', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => '#service_name',
                'not_translated_title' => 'Google calendar event / iCal summary (for customer)',
                'popup'                => '<a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/placeholders/">' . __( 'List of available placeholders', 'webba-booking-lite' ) . '</a>',
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_gg_calendar_event_description_customer',
            'text',
            __( 'Google calendar event / iCal description (for customer)', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Your appointment id is #appointment_id', 'webba-booking-lite' ),
                'not_translated_title' => 'Google calendar event / iCal description (for customer)',
                'popup'                => '<a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/placeholders/">' . __( 'List of available placeholders', 'webba-booking-lite' ) . '</a>',
            ],
            'advanced'
        );
        // cotinue here
        wbk_opt()->add_option(
            'wbk_daily_limit_reached_message',
            'text',
            __( 'Daily limit message', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Daily booking limit is reached, please select another date.', 'webba-booking-lite' ),
                'not_translated_title' => 'Daily limit message',
                'popup'                => __( 'Message shown when daily booking limit reached. Adjust the daily booking limits in the Settings -> Booking Rules.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_limit_by_email_reached_message',
            'text',
            __( 'User limit message', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'You have reached your booking limit.', 'webba-booking-lite' ),
                'not_translated_title' => 'User limit message',
                'popup'                => __( 'Message shown when user limit is reached. Adjust the user booking limits in the Settings -> Booking Rules.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        if ( wbk_fs()->is__premium_only() && wbk_fs()->can_use_premium_code() ) {
            wbk_opt()->add_option(
                'wbk_paypal_mode',
                'select',
                __( 'PayPal mode', 'webba-booking-lite' ),
                'wbk_paypal_settings_section',
                [
                    'default'              => 'live',
                    'not_translated_title' => 'PayPal mode',
                    'popup'                => __( 'Select "Sandbox" to test the integration, and "Live" for actual payment processing.', 'webba-booking-lite' ),
                    'extra'                => [
                        'sandbox' => __( 'Sandbox', 'webba-booking-lite' ),
                        'live'    => __( 'Live', 'webba-booking-lite' ),
                    ],
                ]
            );
            wbk_opt()->add_option(
                'wbk_paypal_sandbox_clientid',
                'text',
                __( 'PayPal Sandbox ClientID', 'webba-booking-lite' ),
                'wbk_paypal_settings_section',
                [
                    'not_translated_title' => 'PayPal Sandbox ClientID',
                    'popup'                => __( 'Enter the Client ID provided by PayPal for the Sandbox mode integration. <a href="https://www.paypal.com/us/cshelp/article/how-do-i-create-rest-api-credentials-ts1949" rel="noopener" target="_blank">Read more on how to set up PayPal integration.</a>', 'webba-booking-lite' ),
                ]
            );
            wbk_opt()->add_option(
                'wbk_paypal_sandbox_secret',
                'pass',
                __( 'PayPal Sandbox Secret', 'webba-booking-lite' ),
                'wbk_paypal_settings_section',
                [
                    'not_translated_title' => 'PayPal Sandbox Secret',
                    'popup'                => 'Enter the Client ID provided by PayPal for the Sandbox mode integration. <a href="https://www.paypal.com/us/cshelp/article/how-do-i-create-rest-api-credentials-ts1949" rel="noopener" target="_blank">Read more on how to set up PayPal integration.</a>',
                ]
            );
            wbk_opt()->add_option(
                'wbk_paypal_live_clientid',
                'text',
                __( 'PayPal Live ClientID', 'webba-booking-lite' ),
                'wbk_paypal_settings_section',
                [
                    'not_translated_title' => 'PayPal Live ClientID',
                    'popup'                => 'Enter the Client ID provided by PayPal for the Sandbox mode integration. <a href="https://www.paypal.com/us/cshelp/article/how-do-i-create-rest-api-credentials-ts1949" rel="noopener" target="_blank">Read more on how to set up PayPal integration.</a>',
                ]
            );
            wbk_opt()->add_option(
                'wbk_paypal_live_secret',
                'pass',
                __( 'PayPal Live Secret', 'webba-booking-lite' ),
                'wbk_paypal_settings_section',
                [
                    'not_translated_title' => 'PayPal Live Secret',
                    'popup'                => 'Enter the Client ID provided by PayPal for the Sandbox mode integration. <a href="https://www.paypal.com/us/cshelp/article/how-do-i-create-rest-api-credentials-ts1949" rel="noopener" target="_blank">Read more on how to set up PayPal integration.</a>',
                ]
            );
            wbk_opt()->add_option(
                'wbk_paypal_currency',
                'select',
                __( 'PayPal currency', 'webba-booking-lite' ),
                'wbk_paypal_settings_section',
                [
                    'not_translated_title' => 'PayPal currency',
                    'popup'                => __( 'Select the currency to use for PayPal payments.', 'webba-booking-lite' ),
                    'default'              => 'USD',
                    'extra'                => [
                        'AUD' => __( 'Australian Dollar', 'webba-booking-lite' ),
                        'BRL' => __( 'Brazilian Real', 'webba-booking-lite' ),
                        'CAD' => __( 'Canadian Dollar', 'webba-booking-lite' ),
                        'CZK' => __( 'Czech Koruna', 'webba-booking-lite' ),
                        'DKK' => __( 'Danish Krone', 'webba-booking-lite' ),
                        'EUR' => __( 'Euro', 'webba-booking-lite' ),
                        'HKD' => __( 'Hong Kong Dollar', 'webba-booking-lite' ),
                        'HUF' => __( 'Hungarian Forint', 'webba-booking-lite' ),
                        'ILS' => __( 'Israeli New Sheqel', 'webba-booking-lite' ),
                        'JPY' => __( 'Japanese Yen', 'webba-booking-lite' ),
                        'MYR' => __( 'Malaysian Ringgit', 'webba-booking-lite' ),
                        'MXN' => __( 'Mexican Peso', 'webba-booking-lite' ),
                        'NOK' => __( 'Norwegian Krone', 'webba-booking-lite' ),
                        'NZD' => __( 'New Zealand Dollar', 'webba-booking-lite' ),
                        'PHP' => __( 'Philippine Peso', 'webba-booking-lite' ),
                        'PLN' => __( 'Polish Zloty', 'webba-booking-lite' ),
                        'GBP' => __( 'Pound Sterling', 'webba-booking-lite' ),
                        'SGD' => __( 'Singapore Dollar', 'webba-booking-lite' ),
                        'SEK' => __( 'Swedish Krona', 'webba-booking-lite' ),
                        'CHF' => __( 'Swiss Franc', 'webba-booking-lite' ),
                        'TWD' => __( 'Taiwan New Dollar', 'webba-booking-lite' ),
                        'THB' => __( 'Thai Baht', 'webba-booking-lite' ),
                        'USD' => __( 'U.S. Dollar', 'webba-booking-lite' ),
                    ],
                ]
            );
            wbk_opt()->add_option(
                'wbk_paypal_hide_address',
                'checkbox',
                __( 'Hide address', 'webba-booking-lite' ),
                'wbk_paypal_settings_section',
                [
                    'not_translated_title' => 'Hide addres',
                    'popup'                => __( 'Turn on to hide address on PayPal checkout.', 'webba-booking-lite' ),
                    'checkbox_value'       => 'enabled',
                ],
                'advanced'
            );
            wbk_opt()->add_option(
                'wbk_paypal_redirect_url',
                'this_domain_url',
                __( 'Redirect to page when payment is successful', 'webba-booking-lite' ),
                'wbk_paypal_settings_section',
                [
                    'not_translated_title' => 'Redirect to page when payment is successful',
                    'popup'                => __( 'Enter the URL where customers should be redirected after a successful payment. If left empty, customers will stay on the booking form page after completing the payment.', 'webba-booking-lite' ),
                ],
                'advanced'
            );
            wbk_opt()->add_option(
                'wbk_paypal_multiplier',
                'text',
                __( 'Currency multiplier', 'webba-booking-lite' ),
                'wbk_paypal_settings_section',
                [
                    'not_translated_title' => 'Currency multiplier',
                    'popup'                => __( 'Add the currency multiplier to update the price before it is sent to PayPal. It is helpful when your service price is set in a currency not supported by PayPal, and you need to convert it to a PayPal-supported currency before checkout. If you do not require currency conversion, leave this field empty.', 'webba-booking-lite' ),
                ],
                'advanced'
            );
            wbk_opt()->add_option(
                'wbk_zoom_link_text',
                'text',
                __( 'Text of the Zoom meeting URL', 'webba-booking-lite' ),
                'wbk_translation_settings_section',
                [
                    'default'              => __( 'Click here to open your meeting in Zoom', 'webba-booking-lite' ),
                    'not_translated_title' => 'Text of the Zoom meeting URL',
                    'popup'                => __( 'Text displayed as the link to the Zoom meeting.', 'webba-booking-lite' ),
                ],
                'advanced'
            );
        }
        if ( wbk_fs()->is__premium_only() && wbk_fs()->can_use_premium_code() ) {
            wbk_opt()->add_option(
                'wbk_stripe_publishable_key',
                'text',
                __( 'Publishable key', 'webba-booking-lite' ),
                'wbk_stripe_settings_section',
                [
                    'not_translated_title' => 'Publishable key',
                    'popup'                => __( 'Enter the publishable API key provided by Stripe for your integration. <a href="https://stripe.com/docs/keys" rel="noopener" target="_blank">Read more on how to set up Stripe integration.</a>', 'webba-booking-lite' ),
                ]
            );
            wbk_opt()->add_option(
                'wbk_stripe_secret_key',
                'pass',
                __( 'Secret key', 'webba-booking-lite' ),
                'wbk_stripe_settings_section',
                [
                    'not_translated_title' => 'Secret key',
                    'popup'                => __( 'Enter the publishable API key provided by Stripe for your integration. <a href="https://stripe.com/docs/keys" rel="noopener" target="_blank">Read more on how to set up Stripe integration.</a>', 'webba-booking-lite' ),
                ]
            );
            wbk_opt()->add_option(
                'wbk_stripe_currency',
                'select',
                __( 'Stripe currency', 'webba-booking-lite' ),
                'wbk_stripe_settings_section',
                [
                    'default'              => 'USD',
                    'not_translated_title' => 'Stripe currency',
                    'popup'                => __( 'Select the currency to use for Stripe payments.', 'webba-booking-lite' ),
                    'extra'                => array_combine( WBK_Stripe::get_currencies(), WBK_Stripe::get_currencies() ),
                ]
            );
            wbk_opt()->add_option(
                'wbk_load_stripe_js',
                'select',
                __( 'Load Stripe javascript', 'webba-booking-lite' ),
                'wbk_stripe_settings_section',
                [
                    'default'              => 'yes',
                    'not_translated_title' => 'Load Stripe javascript',
                    'popup'                => __( 'Select how the Stripe Javascript needs to be loaded', 'webba-booking-lite' ),
                    'extra'                => [
                        'yes'       => __( 'Yes', 'webba-booking-lite' ),
                        'no'        => __( 'No', 'webba-booking-lite' ),
                        'shortcode' => __( 'Only on the booking page (not recommended)', 'webba-booking-lite' ),
                    ],
                ],
                'advanced'
            );
            wbk_opt()->add_option(
                'wbk_load_stripe_api',
                'select',
                __( 'Load Stripe API', 'webba-booking-lite' ),
                'wbk_stripe_settings_section',
                [
                    'default'              => 'yes',
                    'extra'                => [
                        'yes' => __( 'Yes, load version 7.26.0', 'webba-booking-lite' ),
                        'old' => __( 'Yes, load version 6.21.1 (not recommended)', 'webba-booking-lite' ),
                        'no'  => __( 'No', 'webba-booking-lite' ),
                    ],
                    'not_translated_title' => 'Load Stripe API',
                    'popup'                => __( 'Select how to load Stripe API. Set \'no\' or 6.21.1 only if there is a conflict with another plugin that uses Stripe.', 'webba-booking-lite' ),
                ],
                'advanced'
            );
            wbk_opt()->add_option(
                'wbk_stripe_hide_postal',
                'checkbox',
                __( 'Hide the postal code field', 'webba-booking-lite' ),
                'wbk_stripe_settings_section',
                [
                    'checkbox_value'       => 'true',
                    'not_translated_title' => 'Hide the postal code field',
                    'popup'                => __( 'Turn on to hide the postal code field in the Stripe checkout.', 'webba-booking-lite' ),
                ],
                'advanced'
            );
            wbk_opt()->add_option(
                'wbk_stripe_card_input_mode',
                'checkbox',
                __( 'Override Stripe card element error messages', 'webba-booking-lite' ),
                'wbk_stripe_settings_section',
                [
                    'checkbox_value'       => 'yes',
                    'not_translated_title' => 'Override Stripe card element error messages',
                    'popup'                => __( 'Turn on to override the default error message displayed for Stripe card elements. To customize the error message, navigate to Wording/Translation -> Advanced Settings and modify the "Stripe card element error message" according to your preferences.', 'webba-booking-lite' ),
                ],
                'advanced'
            );
            wbk_opt()->add_option(
                'wbk_stripe_additional_fields',
                'select_multiple',
                __( 'Additional payment information', 'webba-booking-lite' ),
                'wbk_stripe_settings_section',
                [
                    'default'              => '',
                    'extra'                => WBK_Model_Utils::get_payment_fields(),
                    'not_translated_title' => 'Additional payment information',
                    'popup'                => __( 'Select the additional fields that you wish to include in the Stripe payment process.', 'webba-booking-lite' ),
                ],
                'advanced'
            );
            wbk_opt()->add_option(
                'wbk_stripe_redirect_url',
                'text',
                __( 'Redirect to page when payment is successful', 'webba-booking-lite' ),
                'wbk_stripe_settings_section',
                [
                    'not_translated_title' => 'Redirect to page when payment is successful',
                    'popup'                => __( 'Enter the URL where customers should be redirected after successful payment. If left empty, customers will stay on the booking form page after completing the payment.', 'webba-booking-lite' ),
                ],
                'advanced'
            );
            wbk_opt()->add_option(
                'wbk_stripe_mob_font_size',
                'text',
                __( 'Font size for card element on mobile devices', 'webba-booking-lite' ),
                'wbk_stripe_settings_section',
                [
                    'not_translated_title' => 'Font size for card element on mobile devices',
                    'popup'                => __( 'Set the card element font size on mobile devices. Leave empty for the default input field font size.', 'webba-booking-lite' ),
                ],
                'advanced'
            );
        }
        if ( wbk_fs()->is__premium_only() && wbk_fs()->can_use_premium_code() ) {
            wbk_opt()->add_option(
                'wbk_gg_clientid',
                'text',
                __( 'Google API Client ID', 'webba-booking-lite' ),
                'wbk_gg_calendar_settings_section',
                [
                    'not_translated_title' => '',
                    'popup'                => __( 'Enter the Google API Client ID. <a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/google-calendar/">Read more on how to set up Google Calendar integration.</a>.', 'webba-booking-lite' ),
                ]
            );
            wbk_opt()->add_option(
                'wbk_gg_secret',
                'pass',
                __( 'Google API Client Secret', 'webba-booking-lite' ),
                'wbk_gg_calendar_settings_section',
                [
                    'not_translated_title' => '',
                    'popup'                => __( 'Enter the Google API Client Secret. <a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/google-calendar/">Read more on how to set up Google Calendar integration.</a>.', 'webba-booking-lite' ),
                ]
            );
            wbk_opt()->add_option(
                'wbk_gg_created_by',
                'text',
                __( '"Created by" property for the events', 'webba-booking-lite' ),
                'wbk_gg_calendar_settings_section',
                [
                    'default'              => 'webba_booking',
                    'not_translated_title' => 'Created by property for the events',
                    'popup'                => __( 'Do not change this option if you do not plan to use the same Google calendars on different websites with Webba Booking.', 'webba-booking-lite' ),
                ],
                'advanced'
            );
            wbk_opt()->add_option(
                'wbk_gg_customers_time_zone',
                'select',
                __( 'Customer\'s time zone', 'webba-booking-lite' ),
                'wbk_gg_calendar_settings_section',
                [
                    'default'              => 'webba',
                    'not_translated_title' => 'Customers time zone',
                    'popup'                => __( 'Choose the time zone to be used for events added to the customer\'s calendar.', 'webba-booking-lite' ),
                    'extra'                => [
                        'webba'    => __( 'Use Webba Booking time zone', 'webba-booking-lite' ),
                        'customer' => __( 'Use customer\'s calendar time zone', 'webba-booking-lite' ),
                    ],
                ],
                'advanced'
            );
            wbk_opt()->add_option(
                'wbk_gg_when_add',
                'select',
                __( 'Admin calendar event creation', 'webba-booking-lite' ),
                'wbk_gg_calendar_settings_section',
                [
                    'default'              => 'onbooking',
                    'not_translated_title' => 'Admin calendar event creation',
                    'popup'                => __( 'Specify when the event should be added to the admin\'s calendar when creating bookings. ', 'webba-booking-lite' ),
                    'extra'                => [
                        'onbooking'           => __( 'On booking', 'webba-booking-lite' ),
                        'onpaymentorapproval' => __( 'On payment or approval', 'webba-booking-lite' ),
                    ],
                ],
                'advanced'
            );
            wbk_opt()->add_option(
                'wbk_gg_2way_group',
                'select',
                __( 'Group services synchronization', 'webba-booking-lite' ),
                'wbk_gg_calendar_settings_section',
                [
                    'default'              => 'lock',
                    'not_translated_title' => 'Group services synchronization',
                    'popup'                => __( 'Choose how group services are integrated with the events in Google calendar.', 'webba-booking-lite' ),
                    'extra'                => [
                        'lock'   => __( 'Lock time slot', 'webba-booking-lite' ),
                        'reduce' => __( 'Reduce count of available places', 'webba-booking-lite' ),
                    ],
                ],
                'advanced'
            );
            wbk_opt()->add_option(
                'wbk_gg_ignore_free',
                'checkbox',
                __( 'Ignore free events', 'webba-booking-lite' ),
                'wbk_gg_calendar_settings_section',
                [
                    'checkbox_value'       => 'yes',
                    'not_translated_title' => 'Ignore free events',
                    'popup'                => __( 'Turn on if free Google Calendar events should not be considered in 2-ways synchronization.', 'webba-booking-lite' ),
                ],
                'advanced'
            );
            wbk_opt()->add_option(
                'wbk_ignore_webba_events',
                'checkbox',
                __( 'Ignore events added by Webba Booking', 'webba-booking-lite' ),
                'wbk_gg_calendar_settings_section',
                [
                    'checkbox_value'       => 'yes',
                    'not_translated_title' => 'Ignore events added by Webba Booking',
                    'popup'                => __( 'Turn on if Webba Booking events should not be considered in 2-ways synchronization.', 'webba-booking-lite' ),
                ],
                'advanced'
            );
            wbk_opt()->add_option(
                'wbk_gg_group_service_export',
                'select',
                __( 'Export for group services', 'webba-booking-lite' ),
                'wbk_gg_calendar_settings_section',
                [
                    'default'              => 'event_foreach_appointment',
                    'not_translated_title' => 'Export for group service',
                    'popup'                => __( 'Select the method of exporting group services.', 'webba-booking-lite' ),
                    'extra'                => [
                        'one_event'                 => __( 'Add one event', 'webba-booking-lite' ),
                        'event_foreach_appointment' => __( 'Add event for each appointment', 'webba-booking-lite' ),
                    ],
                ],
                'advanced'
            );
            wbk_opt()->add_option(
                'wbk_gg_send_alerts_to_admin',
                'checkbox',
                __( 'Send an alert email to administrator if any issue occurred with the integration', 'webba-booking-lite' ),
                'wbk_gg_calendar_settings_section',
                [
                    'checkbox_value'       => 'yes',
                    'not_translated_title' => 'Send an alert email to administrator if any issue occurred with the integration',
                    'popup'                => __( 'Turn on to alert admin about issues with integration. Notification is sent to the email set in the service settings.', 'webba-booking-lite' ),
                ],
                'advanced'
            );
            if ( version_compare( PHP_VERSION, '7.4.0' ) >= 0 ) {
                $version_list = [
                    '2.9.1' => '2.9.1',
                ];
            } else {
                $version_list = [
                    '2.5' => '2.5',
                ];
            }
            if ( version_compare( PHP_VERSION, '8.0.0' ) >= 0 ) {
                $version_list = [
                    '2.9.1'  => '2.9.1',
                    '2.13.0' => '2.13.0',
                ];
            }
            wbk_opt()->add_option(
                'wbk_gg_client_version',
                'select',
                __( 'Version of Google Client API', 'webba-booking-lite' ),
                'wbk_gg_calendar_settings_section',
                [
                    'default'              => '2.9.1',
                    'extra'                => $version_list,
                    'not_translated_title' => 'Version of Google Client API',
                    'popup'                => __( 'Modify this setting only if you have other plugins in your WordPress that utilize a different version of the Google API and conflicts have arisen.', 'webba-booking-lite' ),
                ],
                'advanced'
            );
        }
        wbk_opt()->add_option(
            'wbk_skip_on_arrival_payment_method',
            'checkbox',
            __( 'Skip payment method selection for "Pay on arrival"', 'webba-booking-lite' ),
            'wbk_mode_settings_section',
            [
                'default'              => 'true',
                'checkbox_value'       => 'true',
                'not_translated_title' => 'Skip payment method selection for Pay on arrival',
                'popup'                => __( 'Skip payment method selection for "Pay on arrival" method if there is only one method available', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        if ( wbk_fs()->is__premium_only() && wbk_fs()->can_use_premium_code() ) {
            wbk_opt()->add_option(
                'wbk_woo_check_coupons_inwebba',
                'checkbox',
                __( 'Validate WooCommerce coupons as Webba Coupons', 'webba-booking-lite' ),
                'wbk_woo_settings_section',
                [
                    'not_translated_title' => 'Validate WooCommerce coupons as Webba Coupons',
                    'popup'                => __( 'Enable this option if you need to validate wooCommerce coupons as Webba coupons.', 'webba-booking-lite' ),
                ],
                'advanced'
            );
            wbk_opt()->add_option(
                'wbk_woo_update_status',
                'select',
                __( 'Status of the booking paid with WooCommerce', 'webba-booking-lite' ),
                'wbk_woo_settings_section',
                [
                    'not_translated_title' => 'Status of the booking paid with WooCommerce',
                    'popup'                => __( 'Choose the desired status update after a booking has been paid through WooCommerce.', 'webba-booking-lite' ),
                    'default'              => 'disabled',
                    'extra'                => [
                        'disabled'      => __( 'Disabled (do not update status)', 'webba-booking-lite' ),
                        'approved'      => __( 'Approved', 'webba-booking-lite' ),
                        'paid'          => __( 'Paid (pending)', 'webba-booking-lite' ),
                        'paid_approved' => __( 'Paid (approved)', 'webba-booking-lite' ),
                    ],
                ]
            );
            wbk_opt()->add_option(
                'wbk_woo_prefil_fields',
                'checkbox',
                __( 'Prefill fields in WooCommerce checkout with the data used in the booking form', 'webba-booking-lite' ),
                'wbk_woo_settings_section',
                [
                    'default'              => 'true',
                    'checkbox_value'       => 'true',
                    'not_translated_title' => 'Prefill fields in WooCommerce checkout with the data used in the booking form',
                    'popup'                => __( 'Turn on to prefill fields in the WooCommerce checkout with the data entered in the Webba booking form.', 'webba-booking-lite' ),
                ],
                'advanced'
            );
            wbk_opt()->add_option(
                'wbk_woo_auto_add_to_cart',
                'checkbox',
                __( 'Automatically add to cart', 'webba-booking-lite' ),
                'wbk_woo_settings_section',
                [
                    'default'              => '',
                    'checkbox_value'       => 'true',
                    'not_translated_title' => 'Automatically add to cart',
                    'popup'                => __( 'If this option is enabled, the user will be redirected to the shopping cart page after submitting the booking form.', 'webba-booking-lite' ),
                ],
                'advanced'
            );
            // add settings
            wbk_opt()->add_option(
                'wbk_woo_complete_action',
                'select_multiple',
                __( 'Action for \'Paid\' booking status', 'webba-booking-lite' ),
                'wbk_woo_settings_section',
                [
                    'extra'                => array(
                        'complete_status'  => __( 'Complete status set', 'webba-booking-lite' ),
                        'thankyou_message' => __( 'Thank you message shown', 'webba-booking-lite' ),
                        'complete_payment' => __( 'Payment completed in WooCommerce', 'webba-booking-lite' ),
                    ),
                    'not_translated_title' => 'Action for Paid booking status',
                    'popup'                => __( 'Select which action will set the booking status as \'Paid\'', 'webba-booking-lite' ),
                ],
                'advanced'
            );
        }
        if ( wbk_fs()->is__premium_only() && wbk_fs()->can_use_premium_code() ) {
            wbk_opt()->add_option(
                'wbk_zoom_client_id',
                'text',
                __( 'Client ID', 'webba-booking-lite' ),
                'wbk_zoom_settings_section',
                [
                    'not_translated_title' => '',
                    'popup'                => 'Enter the Zoom Client ID. <a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/integrations/integration-with-zoom/">Read more on how to set up Zoom integration.</a>',
                ]
            );
            wbk_opt()->add_option(
                'wbk_zoom_client_secret',
                'pass',
                __( 'Client secret', 'webba-booking-lite' ),
                'wbk_zoom_settings_section',
                [
                    'not_translated_title' => '',
                    'popup'                => 'Enter the Zoom Client secret. <a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/integrations/integration-with-zoom/">Read more on how to set up Zoom integration.</a>',
                ]
            );
            wbk_opt()->add_option(
                'wbk_zoom_auth_stat',
                'zoom_auth',
                __( 'Authorization', 'webba-booking-lite' ),
                'wbk_zoom_settings_section'
            );
            wbk_opt()->add_option(
                'wbk_zoom_when_add',
                'select',
                __( 'Zoom meeting creation', 'webba-booking-lite' ),
                'wbk_zoom_settings_section',
                [
                    'not_translated_title' => 'Zoom meeting creation',
                    'popup'                => __( 'Select when to create the meeting in Zoom - on booking or on payment or booking approval.', 'webba-booking-lite' ),
                    'default'              => 'onbooking',
                    'extra'                => [
                        'onbooking'           => __( 'On booking', 'webba-booking-lite' ),
                        'onpaymentorapproval' => __( 'On payment or approval', 'webba-booking-lite' ),
                    ],
                ],
                'advanced'
            );
        }
        wbk_opt()->add_option(
            'wbk_customer_name_output',
            'text',
            __( 'Customer name in the backend', 'webba-booking-lite' ),
            'wbk_interface_settings_section',
            [
                'default'              => '#name',
                'not_translated_title' => 'Customer name in the backend',
                'popup'                => __( 'Use this option to display custom fields alongside the customer name in the appointments table and schedules. For instance, you can show the customer\'s name and last name by using the placeholder #name #field_lastname. In this example, the last name is stored in a custom field with the ID "lastname". Remember to include the #name placeholder in the value of this option for it to work correctly.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_date_format_backend',
            'select',
            __( 'Date format (backend)', 'webba-booking-lite' ),
            'wbk_interface_settings_section',
            [
                'default'              => 'M d, Y',
                'extra'                => [
                    'm/d/y'  => __( 'm/d/y', 'webba-booking-lite' ),
                    'y/m/d'  => __( 'y/m/d', 'webba-booking-lite' ),
                    'y-m-d'  => __( 'y-m-d', 'webba-booking-lite' ),
                    'M d, Y' => __( 'M d, Y', 'webba-booking-lite' ),
                    'd/m/y'  => __( 'd/m/y', 'webba-booking-lite' ),
                ],
                'not_translated_title' => 'Date format (backend)',
                'popup'                => __( 'Select how the date will be displayed on the Appointments page in the admin area.', 'webba-booking-lite' ),
            ]
        );
        wbk_opt()->add_option(
            'wbk_date_format_time_slot_schedule',
            'select',
            __( 'Time slots format on the schedule page', 'webba-booking-lite' ),
            'wbk_interface_settings_section',
            [
                'not_translated_title' => 'Time slots format on the schedule page',
                'popup'                => __( 'Select how to display time slots on the Schedule page.', 'webba-booking-lite' ),
                'default'              => 'start',
                'extra'                => [
                    'start'     => __( 'Start', 'webba-booking-lite' ),
                    'start-end' => __( 'Start - End', 'webba-booking-lite' ),
                ],
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_custom_fields_columns',
            'text',
            __( 'Custom field columns', 'webba-booking-lite' ),
            'wbk_interface_settings_section',
            [
                'not_translated_title' => 'Custom field columns',
                'popup'                => __( 'Enter a comma-separated list of custom field IDs. To set custom column headers, use square brackets with the desired titles. For example: custom-field1[Title 1],custom-field2[Title 2].', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_backend_calendar_booking_text',
            'text',
            __( 'Backend calendar booking texts', 'webba-booking-lite' ),
            'wbk_interface_settings_section',
            [
                'default'              => '#customer_name [#service_name]',
                'not_translated_title' => 'Backend calendar booking texts',
                'popup'                => __( __( 'Text shown in the backend calendar. <a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/placeholders/">', 'webba-booking-lite' ) . __( 'List of available placeholders', 'webba-booking-lite' ) . '</a>', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_filter_default_days_number',
            'text',
            __( 'Default number of days on Bookings page', 'webba-booking-lite' ),
            'wbk_interface_settings_section',
            [
                'default'              => '30',
                'not_translated_title' => 'Default number of days on Bookings page',
                'popup'                => __( 'Set the default number of days to be displayed on the appointment page. To improve performance, consider using a lower value.', 'webba-booking-lite' ),
            ]
        );
        if ( wbk_fs()->is__premium_only() && wbk_fs()->can_use_premium_code() ) {
            wbk_opt()->add_option(
                'wbk_twilio_account_sid',
                'text',
                __( 'Twilio ACCOUNT SID', 'webba-booking-lite' ),
                'wbk_sms_settings_section',
                [
                    'not_translated_title' => '',
                    'popup'                => 'Enter the Twilio ACCOUNT SID. <a rel="noopener" target="_blank" href="https://support.twilio.com/hc/en-us/articles/14726256820123-What-is-a-Twilio-Account-SID-and-where-can-I-find-it-">Read more.</a>',
                ]
            );
            wbk_opt()->add_option(
                'wbk_twilio_auth_token',
                'pass',
                __( 'Twilio AUTH TOKEN', 'webba-booking-lite' ),
                'wbk_sms_settings_section',
                [
                    'not_translated_title' => '',
                    'popup'                => 'Enter the Twilio AUTH TOKEN. <a rel="noopener" target="_blank" href="https://support.twilio.com/hc/en-us/articles/223136027-Auth-Tokens-and-How-to-Change-Them">Read more.</a>',
                ]
            );
            wbk_opt()->add_option(
                'wbk_twilio_phone_number',
                'text',
                __( 'Twilio phone number or Messaging Service SID', 'webba-booking-lite' ),
                'wbk_sms_settings_section',
                [
                    'not_translated_title' => 'Twilio phone number or Messaging Service SID',
                    'popup'                => __( 'The phone number must start with a + sign.', 'webba-booking-lite' ),
                ]
            );
            wbk_opt()->add_option(
                'wbk_sms_send_on_booking',
                'checkbox',
                __( 'Send SMS after customer makes a booking', 'webba-booking-lite' ),
                'wbk_sms_settings_section',
                [
                    'checkbox_value'       => 'true',
                    'not_translated_title' => 'Send SMS after customer makes a booking',
                    'popup'                => __( 'Turn on to send booking SMS notifications to customers when they make a booking.', 'webba-booking-lite' ),
                ]
            );
            wbk_opt()->add_option(
                'wbk_sms_send_on_manual_booking',
                'checkbox',
                __( 'Send SMS after admin adds a booking', 'webba-booking-lite' ),
                'wbk_sms_settings_section',
                [
                    'checkbox_value'       => 'true',
                    'dependency'           => [
                        'wbk_sms_send_on_booking' => ':checked',
                    ],
                    'not_translated_title' => 'Send SMS after admin adds a booking',
                    'popup'                => __( 'Turn on to send booking SMS notifications to customers when the booking was done by an admin.', 'webba-booking-lite' ),
                ]
            );
            wbk_opt()->add_option(
                'wbk_sms_message_on_booking',
                'textarea',
                __( 'Booking SMS', 'webba-booking-lite' ),
                'wbk_sms_settings_section',
                [
                    'dependency'           => [
                        'wbk_sms_send_on_booking' => ':checked',
                    ],
                    'default'              => __( 'Dear #customer_name, You have successfully booked #service_name on #appointment_day at #appointment_time.', 'webba-booking-lite' ),
                    'not_translated_title' => 'Booking SMS',
                    'popup'                => __( 'Customize the booking SMS message. <a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/placeholders/">', 'webba-booking-lite' ) . __( 'List of available placeholders', 'webba-booking-lite' ) . '</a>',
                ]
            );
            wbk_opt()->add_option(
                'wbk_sms_send_reminder',
                'checkbox',
                __( 'Send booking reminder SMS', 'webba-booking-lite' ),
                'wbk_sms_settings_section',
                [
                    'checkbox_value'       => 'true',
                    'not_translated_title' => 'Send booking reminder SMS',
                    'popup'                => __( 'Turn on to send booking reminder SMS notifications to customers.', 'webba-booking-lite' ),
                ],
                'advanced'
            );
            wbk_opt()->add_option(
                'wbk_sms_reminder_days',
                'text',
                __( 'Send reminder to customer X days before booking', 'webba-booking-lite' ),
                'wbk_sms_settings_section',
                [
                    'dependency'           => [
                        'wbk_sms_send_reminder' => ':checked',
                    ],
                    'default'              => '1',
                    'not_translated_title' => 'Send reminder to customer X days before booking',
                    'popup'                => __( 'Select the timing for the booking reminder SMS. For instance, set the value to 0 for the day of booking, 1 for one day before the booking, 2 for two days before, and so on.', 'webba-booking-lite' ),
                ],
                'advanced'
            );
            wbk_opt()->add_option(
                'wbk_sms_message_reminder',
                'textarea',
                __( 'Reminder message', 'webba-booking-lite' ),
                'wbk_sms_settings_section',
                [
                    'dependency'           => [
                        'wbk_sms_send_reminder' => ':checked',
                    ],
                    'default'              => __( 'Dea #customer_name, we would like to remind that you have booked the #service_name tomorrow at #appointment_time.', 'webba-booking-lite' ),
                    'not_translated_title' => 'Reminder message',
                    'popup'                => 'Customize the booking reminder SMS message. <a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/placeholders/">' . __( 'List of available placeholders', 'webba-booking-lite' ) . '</a>',
                ],
                'advanced'
            );
            // payment sms start
            wbk_opt()->add_option(
                'wbk_sms_send_on_payment',
                'checkbox',
                __( 'Send payment received SMS', 'webba-booking-lite' ),
                'wbk_sms_settings_section',
                [
                    'checkbox_value'       => 'true',
                    'default'              => 'true',
                    'not_translated_title' => 'Send payment received SMS',
                    'popup'                => __( 'Turn on to send payment received SMS notifications to customers once their booking has been paid.', 'webba-booking-lite' ),
                ],
                'advanced'
            );
            wbk_opt()->add_option(
                'wbk_sms_message_on_payment',
                'textarea',
                __( 'Payment received SMS', 'webba-booking-lite' ),
                'wbk_sms_settings_section',
                [
                    'dependency'           => [
                        'wbk_sms_send_on_payment' => ':checked',
                    ],
                    'default'              => __( 'Dear #customer_name, your booking on #appointment_day at #appointment_time has been paid.', 'webba-booking-lite' ),
                    'not_translated_title' => 'Payment received SMS',
                    'popup'                => __( 'Customize the booking payment SMS message. <a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/placeholders/">', 'webba-booking-lite' ) . __( 'List of available placeholders', 'webba-booking-lite' ) . '</a>',
                ],
                'advanced'
            );
            // payment sms end
            wbk_opt()->add_option(
                'wbk_sms_send_on_approval',
                'checkbox',
                __( 'Send booking approval SMS', 'webba-booking-lite' ),
                'wbk_sms_settings_section',
                [
                    'checkbox_value'       => 'true',
                    'not_translated_title' => 'Send booking approval SMS',
                    'popup'                => __( 'Turn on to send booking approval SMS notifications to customers once their booking has been approved.', 'webba-booking-lite' ),
                ]
            );
            wbk_opt()->add_option(
                'wbk_sms_message_on_approval',
                'textarea',
                __( 'Booking approval SMS', 'webba-booking-lite' ),
                'wbk_sms_settings_section',
                [
                    'dependency'           => [
                        'wbk_sms_send_on_approval' => ':checked',
                    ],
                    'default'              => __( 'Dear #customer_name, your booking on #appointment_day at #appointment_time has been approved.', 'webba-booking-lite' ),
                    'not_translated_title' => 'Booking approval SMS',
                    'popup'                => 'Customize the booking approval SMS message. <a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/placeholders/">' . __( 'List of available placeholders', 'webba-booking-lite' ) . '</a>',
                ]
            );
        }
        wbk_opt()->add_option(
            'wbk_service_step_title',
            'text',
            __( 'Services step title', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Services', 'webba-booking-lite' ),
                'not_translated_title' => 'Services step title',
                'popup'                => __( 'Services title in the booking form sidebar.', 'webba-booking-lite' ),
            ]
        );
        wbk_opt()->add_option(
            'wbk_date_time_step_title',
            'text',
            __( 'Date and time step title', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Date and time', 'webba-booking-lite' ),
                'not_translated_title' => 'Date and time step title',
                'popup'                => __( 'Date and time title in the booking form sidebar.', 'webba-booking-lite' ),
            ]
        );
        wbk_opt()->add_option(
            'wbk_details_step_title',
            'text',
            __( 'Details step title', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Details', 'webba-booking-lite' ),
                'not_translated_title' => 'Details step title',
                'popup'                => __( 'User details title in the booking form sidebar.', 'webba-booking-lite' ),
            ]
        );
        wbk_opt()->add_option(
            'wbk_payment_step_title',
            'text',
            __( 'Payment step title', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Payment', 'webba-booking-lite' ),
                'not_translated_title' => 'Payment step title',
                'popup'                => __( 'Payment title in the booking form sidebar.', 'webba-booking-lite' ),
            ]
        );
        // next and prev
        wbk_opt()->add_option(
            'wbk_next_button_text',
            'text',
            __( 'Next button text', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Next' ),
                'not_translated_title' => 'Next button text',
                'popup'                => __( 'Text on the Next button.', 'webba-booking-lite' ),
            ]
        );
        wbk_opt()->add_option(
            'wbk_back_button_text',
            'text',
            __( 'Back button text', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Back' ),
                'not_translated_title' => 'Back button text',
                'popup'                => __( 'Text on the Back button.', 'webba-booking-lite' ),
            ]
        );
        // next end prev end
        wbk_opt()->add_option(
            'wbk_step_separator',
            'text',
            __( 'Step separator on mobile', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'of', 'webba-booking-lite' ),
                'not_translated_title' => 'Step separator on mobile',
                'popup'                => __( 'On mobile, you\'ll find a step separator. For instance, \'1 of 3\' (steps). Translate the seperator "of."', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_minutes_label',
            'text',
            __( 'Minutes label', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'min', 'webba-booking-lite' ),
                'not_translated_title' => 'Minutes label',
                'popup'                => __( 'Minutes label in the services step.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_local_time_label',
            'text',
            __( 'Your local time checkbox', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Your local time', 'webba-booking-lite' ),
                'not_translated_title' => 'Your local time checkbox',
                'popup'                => __( 'Text for the "Your local time" checkbox.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_coupon_label',
            'text',
            __( 'Coupon label', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Coupon', 'webba-booking-lite' ),
                'not_translated_title' => 'Coupon label',
                'popup'                => __( 'Coupon field label', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_coupon_apply_text',
            'text',
            __( 'Apply coupon button text', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Apply', 'webba-booking-lite' ),
                'not_translated_title' => 'Apply coupon button text',
                'popup'                => __( 'Label for "Apply" coupon button', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_payment_methods_title',
            'text',
            __( 'Payment methods title', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Please tell us how you would like to pay', 'webba-booking-lite' ),
                'not_translated_title' => 'Payment methods title',
                'popup'                => __( 'Label shown above the payment methods', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_paypal_prompt',
            'text',
            __( 'PayPal payment redirect notice', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'You will be redirected to PayPal to approve the payment', 'webba-booking-lite' ),
                'not_translated_title' => 'PayPal payment redirect notice',
                'popup'                => __( 'Text shown when user selects PayPal payment method and will be redirected to PayPal to approve the payment.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_available_label',
            'text',
            __( 'Label for available spots', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Available', 'webba-booking-lite' ),
                'not_translated_title' => 'Label for available spots',
                'popup'                => __( 'Text shown on the group service time slots. For example "Available: 10".', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_approve_button_text',
            'text',
            __( 'Approve payment button text', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'approve payment', 'webba-booking-lite' ),
                'not_translated_title' => 'Approve payment button text',
                'popup'                => __( 'Label for payment approval button.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_multi_limits_label',
            'text',
            __( 'Label for multiple booking limits', 'webba-booking-lite' ),
            'wbk_translation_settings_section',
            [
                'default'              => __( 'Default value: #service_name: select from #min to #max time slots. Selected: #selected_count.', 'webba-booking-lite' ),
                'not_translated_title' => 'Label for multiple booking limits',
                'popup'                => __( 'Show this label if service has multiple booking limits. Available paceholders: #min, #max, #service_name, #selected_count', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_places_selection_mode',
            'select',
            __( 'Multiple seat selection mode', 'webba-booking-lite' ),
            'wbk_mode_settings_section',
            [
                'not_translated_title' => 'Multiple seat selection mode',
                'popup'                => __( 'Choose how many places customer can select in the group service booking.', 'webba-booking-lite' ),
                'default'              => 'normal',
                'extra'                => [
                    'normal'            => __( 'Let users select count', 'webba-booking-lite' ),
                    'normal_no_default' => __( 'Let users select count (no default value)', 'webba-booking-lite' ),
                    '1'                 => __( 'Allow select only one place', 'webba-booking-lite' ),
                    'max'               => __( 'Allow select only maximum places', 'webba-booking-lite' ),
                ],
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_show_details_of_previous_bookings',
            'checkbox',
            __( 'Show who booked the time slot', 'webba-booking-lite' ),
            'wbk_mode_settings_section',
            [
                'default'              => '',
                'checkbox_value'       => 'true',
                'not_translated_title' => 'Show who booked the time slot',
                'popup'                => __( 'If enabled, each time slot will display the names of users who have already booked that time slot. Applicable for group services.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_disable_scroll_on_details_step',
            'checkbox',
            __( 'Disable vertical scrolling in details step', 'webba-booking-lite' ),
            'wbk_mode_settings_section',
            [
                'default'              => '',
                'checkbox_value'       => 'true',
                'not_translated_title' => 'Disable vertical scrolling in details step',
                'popup'                => __( 'If enabled, the scroll bar in the details step will be removed, and the form height will dynamically adjust based on the selected fields.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_show_local_time_by_default',
            'checkbox',
            __( 'Show local time by default', 'webba-booking-lite' ),
            'wbk_mode_settings_section',
            [
                'default'              => '',
                'checkbox_value'       => 'true',
                'not_translated_title' => 'Show local time by default',
                'popup'                => __( 'If enabled, the booking form will automatically default to the local time of the customer.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        wbk_opt()->add_option(
            'wbk_automatically_select_today',
            'checkbox',
            __( 'Auto select nearest date', 'webba-booking-lite' ),
            'wbk_mode_settings_section',
            [
                'default'              => '',
                'checkbox_value'       => 'true',
                'not_translated_title' => 'Auto select nearest date',
                'popup'                => __( 'If enabled, today or the next available date will be chosen automatically.', 'webba-booking-lite' ),
            ],
            'advanced'
        );
        if ( get_option( 'wbk_price_separator' ) === false ) {
            wbk_opt()->reset_defaults();
        }
        do_action( 'wbk_options_after' );
    }

    public function wbk_default_editor() {
        return 'tinymce';
    }

    // init styles and scripts
    public function enqueueScripts() {
        if ( $this->is_option_page() ) {
        }
    }

    // general settings section callback
    public function wbk_general_settings_section_callback( $arg ) {
    }

    // schedule settings section callback
    public function wbk_schedule_settings_section_callback( $arg ) {
    }

    // email settings section callback
    public function wbk_email_settings_section_callback( $arg ) {
    }

    // appearance  settings section callback
    public function wbk_mode_settings_section_callback( $arg ) {
    }

    // appearance  settings section callback
    public function wbk_translation_settings_section_callback( $arg ) {
    }

    // backend interface settings section callback
    public function wbk_backend_interface_settings_section_callback( $arg ) {
    }

    // paypal settings section callback
    public function wbk_paypal_settings_section_callback( $arg ) {
    }

    // stripe settings section callback
    public function wbk_stripe_settings_section_callback( $arg ) {
    }

    // google calendar settings section callback
    public function wbk_gg_calendar_settings_section_callback( $arg ) {
    }

    // sms settings section callback
    public function wbk_sms_settings_section_callback( $arg ) {
    }

    // woo settings section callback
    public function wbk_woo_settings_section_callback( $arg ) {
    }

    // zoom setting section callback
    public function wbk_zoom_settings_section_callback( $arg ) {
    }

    // appointments settings section callback
    public function wbk_appointments_settings_section_callback( $arg ) {
    }

    public function is_option_page() {
        return isset( $_GET['page'] ) && $_GET['page'] == 'wbk-options';
    }

}
