<?php

if ( !defined( 'ABSPATH' ) ) {
    exit;
}
class WBK_Model {
    public function __construct() {
        add_action( 'init', [$this, 'initalize_model'], 20 );
    }

    public function initalize_model() {
        global $wpdb;
        $db_prefix = $wpdb->prefix;
        update_option( 'wbk_db_prefix', $db_prefix );
        WBK_Model_Updater::update_table_names();
        // create tables if not created
        WBK_Db_Utils::createTables();
        $date_format = get_option( 'wbk_date_format_backend', 'M d, Y' );
        $db_prefix = get_option( 'wbk_db_prefix', '' );
        $table = new WbkData\Model($db_prefix . 'wbk_services');
        $table->set_single_item_name( __( 'Service', 'webba-booking-lite' ) );
        $table->set_multiple_item_name( __( 'Services', 'webba-booking-lite' ) );
        $table->sections['general'] = __( 'General', 'webba-booking-lite' );
        $table->sections['hours'] = __( 'Schedule', 'webba-booking-lite' );
        $table->sections['date_range'] = __( 'Date range', 'webba-booking-lite' );
        $table->sections['pricing'] = __( 'Pricing', 'webba-booking-lite' );
        $table->sections['gallery'] = __( 'Gallery', 'webba-booking-lite' );
        $table->sections['email'] = __( 'Email notifications', 'webba-booking-lite' );
        $table->add_field(
            'service_name',
            'name',
            __( 'Service name', 'webba-booking-lite' ),
            'text',
            'general',
            [
                'tooltip' => __( 'Enter service name.', 'webba-booking-lite' ),
            ]
        );
        $table->add_field(
            'service_description',
            'description',
            __( 'Description', 'webba-booking-lite' ),
            'editor',
            'general',
            [
                'tooltip' => __( 'Enter a description of the service.', 'webba-booking-lite' ),
            ],
            '',
            true,
            false,
            false
        );
        $tooltip = __( 'Specify a date range if the service is only valid for a specific period of time.', 'webba-booking-lite' );
        $table->add_field(
            'service_date_range',
            'date_range',
            __( 'Availability date range', 'webba-booking-lite' ),
            'date_range',
            'hours',
            [
                'tooltip'     => $tooltip,
                'date_format' => $date_format,
                'time_zone'   => get_option( 'wbk_timezone', 'UTC' ),
            ],
            '',
            true,
            false,
            false
        );
        $tooltip = __( 'Select the days and time intervals when this service is available for booking.', 'webba-booking-lite' );
        $business_hours_default = [
            [
                "start"       => 32400,
                "end"         => 46800,
                "day_of_week" => '1',
                "status"      => "active",
            ],
            [
                "start"       => 50400,
                "end"         => 64800,
                "day_of_week" => '1',
                "status"      => "active",
            ],
            [
                "start"       => 32400,
                "end"         => 46800,
                "day_of_week" => '2',
                "status"      => "active",
            ],
            [
                "start"       => 50400,
                "end"         => 64800,
                "day_of_week" => '2',
                "status"      => "active",
            ],
            [
                "start"       => 32400,
                "end"         => 46800,
                "day_of_week" => '3',
                "status"      => "active",
            ],
            [
                "start"       => 50400,
                "end"         => 64800,
                "day_of_week" => '3',
                "status"      => "active",
            ],
            [
                "start"       => 32400,
                "end"         => 46800,
                "day_of_week" => '4',
                "status"      => "active",
            ],
            [
                "start"       => 50400,
                "end"         => 64800,
                "day_of_week" => '4',
                "status"      => "active",
            ],
            [
                "start"       => 32400,
                "end"         => 46800,
                "day_of_week" => '5',
                "status"      => "active",
            ],
            [
                "start"       => 50400,
                "end"         => 64800,
                "day_of_week" => '5',
                "status"      => "active",
            ]
        ];
        $table->add_field(
            'service_business_hours',
            'business_hours',
            __( 'Business hours', 'webba-booking-lite' ),
            'wbk_business_hours',
            'hours',
            [
                'tooltip' => $tooltip,
            ],
            $business_hours_default,
            true,
            false,
            false
        );
        $tooltip = __( 'Set the service price. If you\'re not using online payments, keep it zero.', 'webba-booking-lite' );
        $table->add_field(
            'service_price',
            'price',
            __( 'Price', 'webba-booking-lite' ),
            'text',
            'pricing',
            [
                'tooltip'  => $tooltip,
                'sub_type' => 'none_negative_float',
            ],
            '0',
            true,
            true,
            false
        );
        $tooltip = __( 'Enter the email address of administrators who will receive notifications for bookings related to this service.', 'webba-booking-lite' );
        $table->add_field(
            'service_email',
            'email',
            __( 'Email', 'webba-booking-lite' ),
            'text',
            'email',
            [
                'tooltip'  => $tooltip,
                'sub_type' => 'email',
            ],
            ''
        );
        $table->add_field(
            'service_priority',
            'priority',
            __( 'Priority', 'webba-booking-lite' ),
            'text',
            'general',
            [
                'sub_type' => 'none_negative_integer',
                'tooltip'  => __( 'If you have multiple services in one form, set the display priority by entering a priority number. A lower number indicates a higher priority.', 'webba-booking-lite' ),
            ],
            '0',
            true,
            false
        );
        $tooltip = __( 'If you accept group reservations, you can specify the minimum number of bookings required per time slot.', 'webba-booking-lite' );
        $table->add_field(
            'service_min_quantity',
            'min_quantity',
            __( 'Minimum booking count per time slot', 'webba-booking-lite' ),
            'text',
            'general',
            [
                'tooltip'  => $tooltip,
                'sub_type' => 'positive_integer',
            ],
            '1',
            true,
            false
        );
        $tooltip = __( 'By default, one booking is allowed per time slot. If you accept group reservations, set the maximum number of bookings allowed per time slot.', 'webba-booking-lite' );
        $table->add_field(
            'service_quantity',
            'quantity',
            __( 'Maximum booking count per time slot', 'webba-booking-lite' ),
            'text',
            'general',
            [
                'tooltip'  => $tooltip,
                'sub_type' => 'positive_integer',
            ],
            '1',
            true,
            false
        );
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
        $tooltip = __( 'Choose your preferred booking form: either keep the default value or select a <a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/set-up-frontend-booking-process/using-custom-fields-in-the-booking-form/">CF7 form.</a>', 'webba-booking-lite' );
        $table->add_field(
            'service_form',
            'form',
            __( 'Booking form', 'webba-booking-lite' ),
            'select',
            'general',
            [
                'tooltip'    => $tooltip,
                'options'    => 'backend',
                'null_value' => [
                    '0' => __( 'Default form', 'webba-booking-lite' ),
                ],
            ],
            '0',
            true,
            false,
            false
        );
        $tooltip = __( 'If you\'ve integrated <a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/google-calendar/">Google Calendar</a>, choose the specific Google Calendar to synchronize with the service.', 'webba-booking-lite' );
        $table->add_field(
            'service_gg_calendars',
            'gg_calendars',
            __( 'Google calendar', 'webba-booking-lite' ),
            'select',
            'general',
            [
                'tooltip'  => $tooltip,
                'multiple' => true,
                'options'  => 'gg_calendars',
            ],
            null,
            true,
            false,
            false
        );
        $tooltip = __( 'Add users who need access to this service\'s schedule.', 'webba-booking-lite' );
        $table->add_field(
            'service_users',
            'users',
            __( 'Users', 'webba-booking-lite' ),
            'select',
            'general',
            [
                'items'    => [],
                'multiple' => true,
                'tooltip'  => $tooltip,
                'options'  => 'backend',
            ],
            0,
            true,
            false,
            false
        );
        $table->add_field(
            'service_users_allow_edit',
            'users_allow_edit',
            __( 'Allow users edit service parameters', 'webba-booking-lite' ),
            'checkbox',
            'general',
            [
                'yes'     => __( 'Yes', 'webba-booking-lite' ),
                'tooltip' => $tooltip,
            ],
            '',
            true,
            false,
            false
        );
        $tooltip = __( 'Enter the duration of each booking.', 'webba-booking-lite' );
        $table->add_field(
            'service_duration',
            'duration',
            __( 'Duration (minutes)', 'webba-booking-lite' ),
            'text',
            'hours',
            [
                'sub_type' => 'positive_integer',
                'tooltip'  => $tooltip,
            ],
            '30'
        );
        $tooltip = __( 'Specify the buffer period for new reservations. E.g., if it\'s 9 AM and you want to offer time slots starting 24 hours later, enter 1440 (24 hours * 60 minutes).', 'webba-booking-lite' );
        $table->add_field(
            'service_prepare_time',
            'prepare_time',
            __( 'Preparation time (minutes)', 'webba-booking-lite' ),
            'text',
            'general',
            [
                'sub_type' => 'none_negative_integer',
                'tooltip'  => $tooltip,
            ],
            '0',
            true,
            false
        );
        $tooltip = __( 'Enter the time needed between bookings. Default is zero for back-to-back scheduling.', 'webba-booking-lite' );
        $table->add_field(
            'service_interval_between',
            'interval_between',
            __( 'Gap (minutes)', 'webba-booking-lite' ),
            'text',
            'hours',
            [
                'tooltip'  => $tooltip,
                'sub_type' => 'none_negative_integer',
            ],
            '0',
            true,
            false
        );
        $tooltip = __( '  ', 'webba-booking-lite' );
        $table->add_field(
            'service_step',
            'step',
            __( 'Step (minutes)', 'webba-booking-lite' ),
            'text',
            'hours',
            [
                'tooltip'  => $tooltip,
                'sub_type' => 'positive_integer',
            ],
            '30',
            true,
            false
        );
        $payment_methods = [
            'arrival' => 'On arrival',
            'bank'    => 'Bank transfer',
        ];
        $tooltip = __( 'Select a template for booking confirmation notifications.', 'webba-booking-lite' );
        $table->add_field(
            'service_notification_template',
            'notification_template',
            __( '\'On Booking\' notification template (customer)', 'webba-booking-lite' ),
            'select',
            'email',
            [
                'tooltip'    => $tooltip,
                'options'    => 'email_templates',
                'null_value' => [
                    '0' => __( 'Default', 'webba-booking-lite' ),
                ],
            ],
            '0',
            true,
            false,
            false
        );
        $tooltip = __( 'Select a template for booking reminders.', 'webba-booking-lite' );
        $table->add_field(
            'service_reminder_template',
            'reminder_template',
            __( 'Reminder notification template', 'webba-booking-lite' ),
            'select',
            'email',
            [
                'tooltip'    => $tooltip,
                'items'      => WBK_Model_Utils::get_email_templates(),
                'null_value' => [
                    '0' => __( 'Default', 'webba-booking-lite' ),
                ],
                'options'    => 'email_templates',
            ],
            '0',
            true,
            false,
            false
        );
        $tooltip = __( 'Select a template for invoices.', 'webba-booking-lite' );
        $table->add_field(
            'service_invoice_template',
            'invoice_template',
            __( 'Invoice notification template', 'webba-booking-lite' ),
            'select',
            'email',
            [
                'tooltip'    => $tooltip,
                'items'      => WBK_Model_Utils::get_email_templates(),
                'null_value' => [
                    '0' => __( 'Default', 'webba-booking-lite' ),
                ],
                'options'    => 'email_templates',
            ],
            '0',
            true,
            false,
            false
        );
        $tooltip = __( 'Select a template for booking changes notifications.', 'webba-booking-lite' );
        $table->add_field(
            'service_booking_changed_template',
            'booking_changed_template',
            __( 'Booking changes template', 'webba-booking-lite' ),
            'select',
            'email',
            [
                'tooltip'    => $tooltip,
                'items'      => WBK_Model_Utils::get_email_templates(),
                'null_value' => [
                    '0' => __( 'Default', 'webba-booking-lite' ),
                ],
                'options'    => 'email_templates',
            ],
            '0',
            true,
            false,
            false
        );
        $tooltip = __( 'Select a template for status "Arrived" notification. ', 'webba-booking-lite' );
        $table->add_field(
            'service_arrived_template',
            'arrived_template',
            __( 'Status "arrived" template', 'webba-booking-lite' ),
            'select',
            'email',
            [
                'tooltip'    => $tooltip,
                'items'      => WBK_Model_Utils::get_email_templates(),
                'null_value' => [
                    '0' => __( 'Default', 'webba-booking-lite' ),
                ],
                'options'    => 'email_templates',
            ],
            '0',
            true,
            false,
            false
        );
        $tooltip = __( 'Select the preferred payment method(s) for this service.', 'webba-booking-lite' );
        $payment_methods = [
            'arrival' => 'On arrival',
            'bank'    => 'Bank transfer',
        ];
        $table->add_field(
            'service_payment_methods',
            'payment_methods',
            __( 'Payment methods', 'webba-booking-lite' ),
            'select',
            'pricing',
            [
                'tooltip'  => $tooltip,
                'multiple' => true,
                'options'  => 'backend',
                'items'    => $payment_methods,
            ],
            null,
            true,
            false,
            false
        );
        $tooltip = __( 'Specify the necessary deposit amount for booking. Leave it 0 for full upfront payment.', 'webba-booking-lite' );
        $table->add_field(
            'service_service_fee',
            'service_fee',
            __( 'Add amount to order (deposit)', 'webba-booking-lite' ),
            'text',
            'pricing',
            [
                'tooltip'  => $tooltip,
                'sub_type' => 'none_negative_float',
            ],
            '0',
            true,
            false,
            false
        );
        $tooltip = 'Select the <a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/payment/pricing-rules/">pricing rules</a> to be applied to this service.';
        $table->add_field(
            'service_pricing_rules',
            'pricing_rules',
            __( 'Pricing rules', 'webba-booking-lite' ),
            'select',
            'pricing',
            [
                'tooltip'  => $tooltip,
                'items'    => WBK_Model_Utils::get_pricing_rules(),
                'options'  => 'pricing_rules',
                'multiple' => true,
            ],
            null,
            true,
            false,
            false
        );
        $table->add_field(
            'service_woo_product',
            'woo_product',
            __( 'WooCommerce product ID', 'webba-booking-lite' ),
            'text',
            'pricing',
            [
                'tooltip'     => __( 'Set ID of the product associated with this service. Set only if WooCommerce is used as payment mehtod.', 'webba-booking-lite' ),
                'sub_type'    => 'none_negative_integer',
                'pro_version' => true,
            ],
            '0',
            true,
            false,
            false
        );
        $tooltip = __( 'Check this to automatically create <a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/integrations/integration-with-zoom/">Zoom events</a> for each booking of this service.', 'webba-booking-lite' );
        $table->add_field(
            'service_zoom',
            'zoom',
            __( 'Create Zoom events', 'webba-booking-lite' ),
            'checkbox',
            'general',
            [
                'yes'     => __( 'Yes', 'webba-booking-lite' ),
                'tooltip' => $tooltip,
            ],
            '',
            true,
            false,
            false
        );
        $table->add_field(
            'service_multi_mode_low_limit',
            'multi_mode_low_limit',
            __( 'Minimum time slots per booking', 'webba-booking-lite' ),
            'text',
            'general',
            array(
                'sub_type' => 'none_negative_integer',
                'tooltip'  => __( 'Minimum number of time slots required to make a booking. Applicable only if "Settings -> User Interface -> Multiple Bookings in One Session" is enabled.', 'webba-booking-lite' ),
            ),
            '',
            true,
            false,
            false
        );
        $table->add_field(
            'service_multi_mode_limit',
            'multi_mode_limit',
            __( 'Maximum time slots per booking', 'webba-booking-lite' ),
            'text',
            'general',
            array(
                'sub_type' => 'none_negative_integer',
                'tooltip'  => __( 'Maximum number of time slots allowed to make a booking. Applicable only if "Settings -> User Interface -> Multiple Bookings in One Session" is enabled.', 'webba-booking-lite' ),
            ),
            '',
            true,
            false,
            false
        );
        //
        $tooltip = __( 'When this option is enabled, the system allows customers to select only consecutive time slots.', 'webba-booking-lite' );
        $table->add_field(
            'service_consecutive_timeslots',
            'consecutive_timeslots',
            __( 'Consecutive time slots', 'webba-booking-lite' ),
            'checkbox',
            'general',
            [
                'yes'     => __( 'Yes', 'webba-booking-lite' ),
                'tooltip' => $tooltip,
            ],
            '',
            true,
            false,
            false
        );
        if ( $table->fields->get_element_at( 'service_extcalendar_group_mode' ) != false ) {
            $table->fields->get_element_at( 'service_extcalendar_group_mode' )->set_dependency( [['quantity', '>', '1'], ['extcalendar', '!=', '']] );
        }
        $table->sync_structure();
        WbkData()->models->add( $table, $db_prefix . 'wbk_services' );
        // Service categories
        $table = new WbkData\Model($db_prefix . 'wbk_service_categories');
        $table->set_single_item_name( __( 'Category', 'webba-booking-lite' ) );
        $table->set_multiple_item_name( __( 'Categories', 'webba-booking-lite' ) );
        $table->sections['name'] = __( 'Category name', 'webba-booking-lite' );
        $table->sections['category_list'] = __( 'Services', 'webba-booking-lite' );
        $tooltip = __( 'Enter category name.', 'webba-booking-lite' );
        $table->add_field(
            'category_name',
            'name',
            __( 'Category name', 'webba-booking-lite' ),
            'text',
            'general',
            [
                'tooltip' => $tooltip,
            ]
        );
        $tooltip = __( 'Select the services to be included in this category.', 'webba-booking-lite' );
        $table->add_field(
            'list',
            'list',
            __( 'Services', 'webba-booking-lite' ),
            'select',
            'general',
            [
                'tooltip'  => $tooltip,
                'items'    => WBK_Model_Utils::get_services(),
                'options'  => 'services',
                'multiple' => true,
            ],
            null,
            true,
            true,
            false
        );
        $table->sync_structure();
        WbkData()->models->add( $table, $db_prefix . 'wbk_service_categories' );
        // Email templates
        $table = new WbkData\Model($db_prefix . 'wbk_email_templates');
        $table->set_single_item_name( __( 'Email template', 'webba-booking-lite' ) );
        $table->set_multiple_item_name( __( 'Email templates', 'webba-booking-lite' ) );
        $tooltip = __( 'Enter a name to identify the email template.', 'webba-booking-lite' );
        $table->add_field(
            'name',
            'name',
            __( 'Name', 'webba-booking-lite' ),
            'text',
            '',
            [
                'tooltip' => $tooltip,
            ]
        );
        /*
        $tooltip = __('Subject of the email', 'webba-booking-lite');
        $table->add_field(
            'subject',
            'subject',
            __('Email subject line', 'webba-booking-lite'),
            'text',
            '',
            ['tooltip' => $tooltip]
        );
        */
        $tooltip = __( __( 'Use the text editor to prepare the email template.', 'webba-booking-lite' ) . __( 'List of available placeholders', 'webba-booking-lite' ) . '</a>', 'webba-booking-lite' );
        $table->add_field(
            'template',
            'template',
            __( 'Email Body', 'webba-booking-lite' ),
            'editor',
            '',
            [
                'tooltip'      => $tooltip,
                'placeholders' => true,
            ],
            '',
            true,
            false,
            true
        );
        /*
        $tooltip = __('A PDF attachment will be generated based on input text', 'webba-booking-lite');
        $table->add_field(
            'pdf_attachment',
            'pdf_attachment',
            __('PDF Attachment', 'webba-booking-lite'),
            'editor',
            '',
            [
                'tooltip' => $tooltip,
                'placeholders' => true
            ],
            '',
            true,
            true,
            false
        );
        
        $tooltip = __('Calendar Event from iCal', 'webba-booking-lite');
        $table->add_field(
            'calendar_event',
            'calendar_event',
            __('Calendar Event (iCal)', 'webba-booking-lite'),
            'textarea',
            '',
            ['tooltip' => $tooltip],
            '',
            true,
            false,
            false
        );
        */
        $table->sync_structure();
        WbkData()->models->add( $table, $db_prefix . 'wbk_email_templates' );
        // Bookings (ex Appointments)
        $time_format = get_option( 'wbk_time_format', '' );
        if ( $time_format == '' ) {
            $time_format = get_option( 'time_format' );
        }
        $allowed_fields = apply_filters( 'webba_booking_bookings_table_allowed_filters', [
            'id',
            'name',
            'duration',
            'moment_price',
            'status',
            'service_id',
            'phone'
        ] );
        $table = new WbkData\Model($db_prefix . 'wbk_appointments');
        $table->set_single_item_name( __( 'Booking', 'webba-booking-lite' ) );
        $table->set_multiple_item_name( __( 'Bookings', 'webba-booking-lite' ) );
        //  $table->set_duplicatable(false);
        $table->set_default_sort_column( 0 );
        $table->set_default_sort_direction( 'desc' );
        $tooltip = __( 'Enter the name of the customer.', 'webba-booking-lite' );
        $table->add_field(
            'appointment_name',
            'name',
            __( 'Customer', 'webba-booking-lite' ),
            'text',
            '',
            [
                'tooltip' => $tooltip,
            ],
            '',
            true,
            in_array( 'name', $allowed_fields )
        );
        $tooltip = __( 'Select the service for which the booking is being made.', 'webba-booking-lite' );
        $table->add_field(
            'appointment_service_id',
            'service_id',
            __( 'Service', 'webba-booking-lite' ),
            'select',
            '',
            [
                'tooltip'  => $tooltip,
                'items'    => WBK_Model_Utils::get_services( true ),
                'options'  => 'services',
                'sub_type' => 'positive_integer',
            ],
            null,
            true,
            in_array( 'service_id', $allowed_fields ),
            true
        );
        $tooltip = __( 'Select the booking date.', 'webba-booking-lite' );
        $table->add_field(
            'appointment_day',
            'day',
            __( 'Date', 'webba-booking-lite' ),
            'wbk_date',
            '',
            [
                'tooltip'     => $tooltip,
                'date_format' => $date_format,
                'time_zone'   => get_option( 'wbk_timezone', 'UTC' ),
            ],
            '',
            true,
            in_array( 'day', $allowed_fields )
        );
        $tooltip = __( 'Select the booking time.', 'webba-booking-lite' );
        $table->add_field(
            'appointment_time',
            'time',
            __( 'Time', 'webba-booking-lite' ),
            'select',
            '',
            [
                'tooltip'     => $tooltip,
                'time_format' => $time_format,
                'options'     => 'backend',
            ],
            '',
            true,
            in_array( 'time', $allowed_fields )
        );
        $table->add_field(
            'appointment_token',
            'token',
            'token',
            'text',
            '',
            null,
            '',
            false,
            false,
            false
        );
        $table->add_field(
            'appointment_canceled_by',
            'canceled_by',
            'canceled_by',
            'text',
            '',
            null,
            '',
            false,
            false,
            false
        );
        $tooltip = __( 'Specify the number of places being booked for this appointment.', 'webba-booking-lite' );
        $table->add_field(
            'appointment_quantity',
            'quantity',
            __( 'Places booked', 'webba-booking-lite' ),
            'select',
            '',
            [
                'tooltip'  => $tooltip,
                'sub_type' => 'positive_integer',
                'items'    => [],
                'options'  => 'backend',
            ],
            null,
            true,
            in_array( 'quantity', $allowed_fields ),
            true
        );
        $table->add_field(
            'appointment_duration',
            'duration',
            __( 'Duration', 'webba-booking-lite' ),
            'text',
            '',
            [
                'sub_type' => 'positive_integer',
            ],
            '',
            false,
            false,
            false
        );
        $table->add_field(
            'appointment_created_on',
            'created_on',
            __( 'Created on', 'webba-booking-lite' ),
            'text',
            '',
            [
                'sub_type' => 'positive_integer',
            ],
            '',
            false,
            in_array( 'created_on', $allowed_fields ),
            false
        );
        $tooltip = __( 'Enter the customer\'s email address.', 'webba-booking-lite' );
        $table->add_field(
            'appointment_email',
            'email',
            __( 'Email', 'webba-booking-lite' ),
            'text',
            '',
            [
                'tooltip'  => $tooltip,
                'sub_type' => 'email',
            ],
            '',
            true,
            in_array( 'email', $allowed_fields )
        );
        $tooltip = __( 'Enter the customer\'s phone number.', 'webba-booking-lite' );
        $table->add_field(
            'appointment_phone',
            'phone',
            __( 'Phone', 'webba-booking-lite' ),
            'text',
            '',
            [
                'tooltip' => $tooltip,
            ],
            '',
            true,
            in_array( 'phone', $allowed_fields ),
            false
        );
        $tooltip = __( 'Add any additional comments related to the booking.', 'webba-booking-lite' );
        $table->add_field(
            'appointment_description',
            'description',
            __( 'Comment', 'webba-booking-lite' ),
            'textarea',
            '',
            [
                'tooltip' => $tooltip,
            ],
            '',
            true,
            in_array( 'description', $allowed_fields ),
            false
        );
        $table->add_field(
            'appointment_extra',
            'extra',
            __( 'Custom fields', 'webba-booking-lite' ),
            'wbk_app_custom_data',
            '',
            null,
            '',
            true,
            in_array( 'extra', $allowed_fields ),
            false
        );
        $table->add_field(
            'appointment_coupon',
            'coupon',
            __( 'Coupon', 'webba-booking-lite' ),
            'text',
            '',
            [
                'sub_type' => 'positive_integer',
            ],
            '',
            false,
            in_array( 'coupon', $allowed_fields ),
            false
        );
        $table->add_field(
            'appointment_payment_method',
            'payment_method',
            __( 'Payment method', 'webba-booking-lite' ),
            'text',
            '',
            null,
            '',
            false,
            in_array( 'payment_method', $allowed_fields ),
            false
        );
        $tooltip = __( 'If the payment has already been made, enter the payment amount paid for 1 person.', 'webba-booking-lite' );
        $table->add_field(
            'appointment_moment_price',
            'moment_price',
            __( 'Payment', 'webba-booking-lite' ),
            'text',
            '',
            [
                'tooltip'  => $tooltip,
                'sub_type' => 'none_negative_float',
            ],
            '',
            true,
            false,
            //in_array('moment_price', $allowed_fields),
            false
        );
        $table->add_field(
            'appointment_user_ip',
            'user_ip',
            __( 'User IP', 'webba-booking-lite' ),
            'text',
            '',
            null,
            '',
            false,
            in_array( 'ip', $allowed_fields ),
            true
        );
        $tooltip = __( 'Choose the appropriate booking status from the options available.', 'webba-booking-lite' );
        $table->add_field(
            'appointment_status',
            'status',
            __( 'Status', 'webba-booking-lite' ),
            'select',
            '',
            [
                'tooltip' => $tooltip,
                'items'   => WBK_Model_Utils::get_booking_status_list(),
                'options' => WBK_Model_Utils::get_booking_status_list(),
            ],
            'pending',
            true,
            in_array( 'status', $allowed_fields ),
            true
        );
        $table->add_field(
            'appointment_creted_by',
            'created_by',
            __( 'Created by', 'webba-booking-lite' ),
            'select',
            '',
            [
                'items' => [
                    'na'       => __( 'N/A', 'webba-booking-lite' ),
                    'customer' => __( 'Customer', 'webba-booking-lite' ),
                    'admin'    => __( 'Administrator', 'webba-booking-lite' ),
                ],
            ],
            'na',
            false,
            false
        );
        $table->add_field(
            'appointment_service_category',
            'service_category',
            __( 'Service category', 'webba-booking-lite' ),
            'text',
            '',
            null,
            '',
            false,
            false,
            false
        );
        $table->add_field(
            'appointment_lang',
            'lang',
            'lang',
            'text',
            '',
            null,
            '',
            false,
            false,
            false
        );
        $table->add_field(
            'appointment_end',
            'end',
            'end',
            'text',
            '',
            [
                'sub_type' => 'positive_integer',
            ],
            '',
            false,
            false,
            false
        );
        $table->add_field(
            'appointment_attachment',
            'attachment',
            'attachment',
            'textarea',
            '',
            null,
            '',
            false,
            false,
            false
        );
        $table->add_field(
            'appointment_payment_id',
            'payment_id',
            'payment_id',
            'text',
            '',
            null,
            '',
            false,
            false,
            false
        );
        $table->add_field(
            'appointment_token',
            'token',
            'token',
            'text',
            '',
            null,
            '',
            false,
            false,
            false
        );
        $table->add_field(
            'appointment_admin_token',
            'admin_token',
            'admin_token',
            'text',
            '',
            null,
            '',
            false,
            false,
            false
        );
        $table->add_field(
            'appointment_payment_cancel_token',
            'payment_cancel_token',
            'payment_cancel_token',
            'text',
            '',
            null,
            '',
            false,
            false,
            false
        );
        $table->add_field(
            'appointment_expiration_time',
            'expiration_time',
            'expiration_time',
            'text',
            '',
            [
                'sub_type' => 'positive_integer',
            ],
            '',
            false,
            false,
            false
        );
        $table->add_field(
            'appointment_arrival_email_time',
            'arrival_email_time',
            'arrival_email_time',
            'text',
            '',
            [
                'sub_type' => 'positive_integer',
            ],
            '',
            false,
            false,
            false
        );
        $table->add_field(
            'appointment_time_offset',
            'time_offset',
            'time_offset',
            'text',
            '',
            [
                'sub_type' => 'integer',
            ],
            '',
            false,
            false,
            false
        );
        $table->add_field(
            'appointment_gg_event_id',
            'gg_event_id',
            'gg_event_id',
            'text',
            '',
            null,
            '',
            false,
            false,
            false
        );
        $table->add_field(
            'appointment_prev_status',
            'prev_status',
            'prev_status',
            'text',
            '',
            null,
            '',
            false,
            false,
            false
        );
        $table->add_field(
            'appointment_amount_details',
            'amount_details',
            'amount_details',
            'textarea',
            '',
            null,
            '',
            false,
            false,
            false
        );
        $table->add_field(
            'appointment_zoom_meeting_id',
            'zoom_meeting_id',
            'zoom_meeting_id',
            'text',
            '',
            null,
            '',
            false,
            false,
            false
        );
        $table->add_field(
            'appointment_zoom_meeting_url',
            'zoom_meeting_url',
            'zoom_meeting_url',
            'text',
            '',
            null,
            '',
            false,
            false,
            false
        );
        $table->add_field(
            'appointment_zoom_meeting_pwd',
            'zoom_meeting_pwd',
            'zoom_meeting_pwd',
            'text',
            '',
            null,
            '',
            false,
            false,
            false
        );
        $table->sync_structure();
        $table = WbkData()->models->add( $table, $db_prefix . 'wbk_appointments' );
        $services = WBK_Model_Utils::get_services( true );
        $table->fields->get_element_at( 'appointment_service_id' )->set_filter_data(
            'select',
            ['IN'],
            [],
            '',
            $services
        );
        $statuses = WBK_Model_Utils::get_booking_status_list();
        $table->fields->get_element_at( 'appointment_status' )->set_filter_data(
            'select',
            ['IN'],
            [],
            '',
            $statuses
        );
        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        $start = strtotime( 'today midnight' );
        $end = strtotime( '+ ' . get_option( 'wbk_filter_default_days_number', '30' ) . ' day', time() );
        $default_range = [$start, $end];
        if ( isset( $_REQUEST['filters']['appointment_day']['ignore'] ) && $_REQUEST['filters']['appointment_day']['ignore'] == true ) {
            $default_range = [null, null];
        }
        $table->fields->get_element_at( 'appointment_day' )->set_filter_data(
            'wbk_date_range',
            ['>=', '<='],
            $default_range,
            ' AND '
        );
        $table->fields->get_element_at( 'appointment_created_on' )->set_filter_data(
            'wbk_date_range',
            ['>=', '<='],
            [null, null],
            ' AND '
        );
        date_default_timezone_set( 'UTC' );
        $table = new WbkData\Model($db_prefix . 'wbk_cancelled_appointments');
        $table->set_single_item_name( __( 'Booking', 'webba-booking-lite' ) );
        $table->set_multiple_item_name( __( 'Bookings', 'webba-booking-lite' ) );
        $table->set_duplicatable( false );
        $table->add_field(
            'appointment_id_cancelled',
            'id_cancelled',
            __( 'ID of cancelled appointment', 'webba-booking-lite' ),
            'text',
            '',
            [
                'sub_type' => 'positive_integer',
            ],
            '',
            false,
            true,
            false
        );
        $table->add_field(
            'appointment_time',
            'time',
            __( 'Time', 'webba-booking-lite' ),
            'select',
            '',
            [
                'time_format' => $time_format,
                'time_zone'   => get_option( 'wbk_timezone', 'UTC' ),
                'options'     => 'backend',
            ],
            '',
            false,
            in_array( 'time', $allowed_fields )
        );
        $table->add_field(
            'appointment_cancelled_by',
            'cancelled_by',
            __( 'Cancelled by', 'webba-booking-lite' ),
            'textarea',
            '',
            null,
            '',
            false,
            true,
            false
        );
        $table->add_field(
            'appointment_service_id',
            'service_id',
            __( 'Service', 'webba-booking-lite' ),
            'select',
            '',
            [
                'items'    => WBK_Model_Utils::get_services(),
                'sub_type' => 'positive_integer',
            ],
            null,
            false,
            in_array( 'service_id', $allowed_fields ),
            false
        );
        $table->add_field(
            'appointment_created_on',
            'created_on',
            'created_on',
            'text',
            '',
            [
                'sub_type' => 'positive_integer',
            ],
            '',
            true,
            true,
            //in_array('created_on', $allowed_fields),
            true
        );
        $table->add_field(
            'appointment_day',
            'day',
            __( 'Date', 'webba-booking-lite' ),
            'wbk_date',
            '',
            [
                'date_format' => $date_format,
                'time_zone'   => get_option( 'wbk_timezone', 'UTC' ),
            ],
            '',
            false,
            in_array( 'day', $allowed_fields )
        );
        $table->add_field(
            'appointment_quantity',
            'quantity',
            __( 'Places booked', 'webba-booking-lite' ),
            'select',
            '',
            [
                'sub_type' => 'positive_integer',
                'items'    => [],
            ],
            null,
            false,
            in_array( 'quantity', $allowed_fields ),
            true
        );
        $table->add_field(
            'appointment_name',
            'name',
            __( 'Name', 'webba-booking-lite' ),
            'text',
            '',
            null,
            '',
            true,
            in_array( 'name', $allowed_fields )
        );
        $table->add_field(
            'appointment_email',
            'email',
            __( 'Email', 'webba-booking-lite' ),
            'text',
            '',
            [
                'sub_type' => 'email',
            ],
            '',
            false,
            in_array( 'email', $allowed_fields )
        );
        $table->add_field(
            'appointment_phone',
            'phone',
            __( 'Phone', 'webba-booking-lite' ),
            'text',
            '',
            null,
            '',
            false,
            in_array( 'phone', $allowed_fields ),
            false
        );
        $table->add_field(
            'appointment_description',
            'description',
            __( 'Comment', 'webba-booking-lite' ),
            'textarea',
            '',
            null,
            '',
            true,
            in_array( 'description', $allowed_fields ),
            false
        );
        $table->add_field(
            'appointment_extra',
            'extra',
            __( 'Custom fields', 'webba-booking-lite' ),
            'wbk_app_custom_data',
            '',
            null,
            '',
            false,
            in_array( 'extra', $allowed_fields ),
            false
        );
        $table->add_field(
            'appointment_coupon',
            'coupon',
            'coupon',
            'text',
            '',
            [
                'sub_type' => 'positive_integer',
            ],
            '',
            false,
            in_array( 'coupon', $allowed_fields ),
            false
        );
        $table->add_field(
            'appointment_payment_method',
            'payment_method',
            __( 'Payment method', 'webba-booking-lite' ),
            'text',
            '',
            null,
            '',
            false,
            in_array( 'payment_method', $allowed_fields ),
            false
        );
        $table->add_field(
            'appointment_moment_price',
            'moment_price',
            'Price',
            'text',
            '',
            null,
            '',
            false,
            in_array( 'moment_price', $allowed_fields ),
            true
        );
        $table->add_field(
            'appointment_user_ip',
            'user_ip',
            __( 'User IP', 'webba-booking-lite' ),
            'text',
            '',
            null,
            '',
            false,
            in_array( 'ip', $allowed_fields ),
            true
        );
        $table->add_field(
            'appointment_status',
            'status',
            __( 'Status', 'webba-booking-lite' ),
            'select',
            '',
            [
                'items'   => WBK_Model_Utils::get_booking_status_list(),
                'options' => WBK_Model_Utils::get_booking_status_list(),
            ],
            '',
            false,
            false
        );
        $table->add_field(
            'appointment_service_category',
            'service_category',
            'service_category',
            'text',
            '',
            null,
            '',
            false,
            false,
            false
        );
        $table->add_field(
            'appointment_lang',
            'lang',
            'lang',
            'text',
            '',
            null,
            '',
            false,
            false,
            false
        );
        $table->add_field(
            'appointment_duration',
            'duration',
            __( 'Duration', 'webba-booking-lite' ),
            'text',
            '',
            [
                'sub_type' => 'positive_integer',
            ],
            '',
            false,
            false,
            false
        );
        $table->add_field(
            'appointment_attachment',
            'attachment',
            'attachment',
            'textarea',
            '',
            null,
            '',
            false,
            false,
            false
        );
        $table->add_field(
            'appointment_payment_id',
            'payment_id',
            'payment_id',
            'text',
            '',
            null,
            '',
            false,
            false,
            false
        );
        $table->add_field(
            'appointment_token',
            'token',
            'token',
            'text',
            '',
            null,
            '',
            false,
            false,
            false
        );
        $table->add_field(
            'appointment_admin_token',
            'admin_token',
            'admin_token',
            'text',
            '',
            null,
            '',
            false,
            false,
            false
        );
        $table->add_field(
            'appointment_payment_cancel_token',
            'payment_cancel_token',
            'payment_cancel_token',
            'text',
            '',
            null,
            '',
            false,
            false,
            false
        );
        $table->add_field(
            'appointment_expiration_time',
            'expiration_time',
            'expiration_time',
            'text',
            '',
            [
                'sub_type' => 'positive_integer',
            ],
            '',
            false,
            false,
            false
        );
        $table->add_field(
            'appointment_time_offset',
            'time_offset',
            'time_offset',
            'text',
            '',
            [
                'sub_type' => 'positive_integer',
            ],
            '',
            false,
            false,
            false
        );
        $table->add_field(
            'appointment_gg_event_id',
            'gg_event_id',
            'gg_event_id',
            'text',
            '',
            null,
            '',
            false,
            false,
            false
        );
        $table->sync_structure();
        $table = WbkData()->models->add( $table, $db_prefix . 'wbk_cancelled_appointments' );
        date_default_timezone_set( get_option( 'wbk_timezone', 'UTC' ) );
        date_default_timezone_set( 'UTC' );
        $services = WBK_Model_Utils::get_services( true );
        // Google calendars
        $table = new WbkData\Model($db_prefix . 'wbk_gg_calendars');
        $table->set_duplicatable( false );
        $table->set_single_item_name( __( 'Google calendar', 'webba-booking-lite' ) );
        $table->set_multiple_item_name( __( 'Google calendars', 'webba-booking-lite' ) );
        $tooltip = __( 'Enter a name to identify the calendar.', 'webba-booking-lite' );
        $table->add_field(
            'calendar_name',
            'name',
            __( 'Name', 'webba-booking-lite' ),
            'text',
            '',
            [
                'tooltip' => $tooltip,
            ]
        );
        $tooltip = '';
        $table->add_field(
            'calendar_user_id',
            'user_id',
            __( 'User', 'webba-booking-lite' ),
            'select',
            '',
            [
                'tooltip'    => $tooltip,
                'items'      => [],
                'null_value' => [
                    '0' => __( 'select option', 'webba-booking-lite' ),
                ],
                'options'    => 'backend',
            ],
            0,
            true,
            true,
            false
        );
        $tooltip = __( 'Enter your Calendar ID.', 'webba-booking-lite' );
        $table->add_field(
            'calendar_ggid',
            'ggid',
            __( 'Calendar ID', 'webba-booking-lite' ),
            'text',
            '',
            [
                'tooltip' => $tooltip,
            ]
        );
        $tooltip = __( 'Choose the calendar connection mode', 'webba-booking-lite' );
        $table->add_field(
            'calendar_mode',
            'mode',
            __( 'Mode', 'webba-booking-lite' ),
            'select',
            '',
            [
                'tooltip' => $tooltip,
                'items'   => WBK_Model_Utils::get_gg_calendar_modes(),
                'options' => WBK_Model_Utils::get_gg_calendar_modes(),
            ],
            null,
            true,
            true,
            true
        );
        $table->add_field(
            'calendar_access_token',
            'access_token',
            __( 'Authorization', 'webba-booking-lite' ),
            'wbk_google_access_token',
            null,
            [],
            '',
            false,
            true,
            false
        );
        $table->sync_structure();
        WbkData()->models->add( $table, $db_prefix . 'wbk_gg_calendars' );
        // Coupons
        $table = new WbkData\Model($db_prefix . 'wbk_coupons');
        $table->set_single_item_name( __( 'Coupon', 'webba-booking-lite' ) );
        $table->set_multiple_item_name( __( 'Coupons', 'webba-booking-lite' ) );
        $tooltip = __( 'Enter a coupon code.', 'webba-booking-lite' );
        $table->add_field(
            'coupon_name',
            'name',
            __( 'Coupon', 'webba-booking-lite' ),
            'text',
            '',
            [
                'tooltip' => $tooltip,
            ]
        );
        $tooltip = __( 'Define the time period during which the coupon will be valid.', 'webba-booking-lite' );
        $table->add_field(
            'coupon_date_range',
            'date_range',
            __( 'Available on', 'webba-booking-lite' ),
            'date_range',
            '',
            [
                'tooltip'   => $tooltip,
                'time_zone' => get_option( 'wbk_timezone', 'UTC' ),
            ],
            '',
            true,
            true,
            false
        );
        $tooltip = __( 'Choose the service(-s) for which the coupon will be applicable.', 'webba-booking-lite' );
        $table->add_field(
            'coupon_services',
            'services',
            __( 'Services', 'webba-booking-lite' ),
            'select',
            '',
            [
                'tooltip'  => $tooltip,
                'items'    => WBK_Model_Utils::get_services(),
                'multiple' => true,
                'options'  => 'services',
            ],
            null,
            true,
            false,
            false
        );
        $tooltip = __( 'Specify the Usage limit for the coupon - the maximum number of times it can be applied. Leaving it blank means unlimited use.', 'webba-booking-lite' );
        $table->add_field(
            'coupon_maximum',
            'maximum',
            __( 'Usage limit', 'webba-booking-lite' ),
            'text',
            '',
            [
                'tooltip'  => $tooltip,
                'sub_type' => 'none_negative_integer',
            ],
            '',
            true,
            true,
            false
        );
        $table->add_field(
            'coupon_used',
            'used',
            __( 'Used', 'webba-booking-lite' ),
            'text',
            '',
            [
                'sub_type' => 'positive_integer',
            ],
            '',
            false,
            true,
            false
        );
        $tooltip = __( 'Speficy the fixed amount that will be applied as the discount.', 'webba-booking-lite' );
        $table->add_field(
            'coupon_amount_fixed',
            'amount_fixed',
            __( 'Discount (fixed)', 'webba-booking-lite' ),
            'text',
            '',
            [
                'tooltip'  => $tooltip,
                'sub_type' => 'none_negative_float',
            ],
            '0',
            true,
            true,
            true
        );
        $tooltip = __( 'Speficy the percentage that will be applied as the discount.', 'webba-booking-lite' );
        $table->add_field(
            'coupon_amount_percentage',
            'amount_percentage',
            __( 'Discount (percentage)', 'webba-booking-lite' ),
            'text',
            '',
            [
                'tooltip'  => $tooltip,
                'sub_type' => 'none_negative_float',
            ],
            '100',
            true,
            true,
            true
        );
        $table->sync_structure();
        WbkData()->models->add( $table, $db_prefix . 'wbk_coupons' );
        // Pricing rules
        $table = new WbkData\Model($db_prefix . 'wbk_pricing_rules');
        $table->set_single_item_name( __( 'Pricing rule', 'webba-booking-lite' ) );
        $table->set_multiple_item_name( __( 'Pricing rules', 'webba-booking-lite' ) );
        $tooltip = __( 'Enter a name to identify the pricing rule.', 'webba-booking-lite' );
        $table->add_field(
            'pricing_rule_name',
            'name',
            __( 'Name', 'webba-booking-lite' ),
            'text',
            '',
            [
                'tooltip' => $tooltip,
            ]
        );
        $tooltip = __( 'Specify the order for applying pricing rules to a service. This matters when you apply multiple rules for the same service.', 'webba-booking-lite' );
        $table->add_field(
            'pricing_rule_priority',
            'priority',
            __( 'Priority', 'webba-booking-lite' ),
            'select',
            '',
            [
                'tooltip' => $tooltip,
                'options' => [
                    '1'  => __( 'low', 'webba-booking-lite' ),
                    '10' => __( 'medium', 'webba-booking-lite' ),
                    '20' => __( 'high', 'webba-booking-lite' ),
                ],
            ],
            1,
            true,
            true,
            true
        );
        $tooltip = 'Select the <a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/payment/pricing-rules/">type of pricing rule</a>.';
        $table->add_field(
            'pricing_rule_type',
            'type',
            __( 'Type', 'webba-booking-lite' ),
            'select',
            '',
            [
                'tooltip' => $tooltip,
                'options' => [
                    'date_range'           => __( 'Price for date range', 'webba-booking-lite' ),
                    'early_booking'        => __( 'Price for early booking', 'webba-booking-lite' ),
                    'custom_field'         => __( 'Price based on custom field value', 'webba-booking-lite' ),
                    'day_of_week_and_time' => __( 'Price for day of week and time range', 'webba-booking-lite' ),
                    'number_of_seats'      => __( 'Price based on number of seats booked', 'webba-booking-lite' ),
                    'number_of_timeslots'  => __( 'Price based on number of timeslots booked', 'webba-booking-lite' ),
                ],
            ],
            null,
            true,
            true,
            true
        );
        $table->add_field(
            'pricing_rule_date_range',
            'date_range',
            __( 'Date range', 'webba-booking-lite' ),
            'date_range',
            '',
            [
                'time_zone' => get_option( 'wbk_timezone', 'UTC' ),
            ],
            '',
            true,
            false
        );
        $table->add_field(
            'pricing_rule_days_number',
            'days_number',
            __( 'Minimum number of days before the booked date', 'webba-booking-lite' ),
            'text',
            '',
            [
                'sub_type' => 'positive_integer',
            ],
            '',
            true,
            false
        );
        $table->add_field(
            'pricing_rule_custom_field_id',
            'custom_field_id',
            __( 'Custom field ID', 'webba-booking-lite' ),
            'text',
            '',
            null,
            '',
            true,
            false
        );
        $table->add_field(
            'pricing_rule_custom_field_operator',
            'custom_field_operator',
            __( 'Operator', 'webba-booking-lite' ),
            'radio',
            '',
            [
                'options' => [
                    'equals'    => __( 'equals', 'webba-booking-lite' ),
                    'more_than' => __( 'more than', 'webba-booking-lite' ),
                    'less_than' => __( 'less than', 'webba-booking-lite' ),
                ],
            ],
            'equals',
            true,
            false
        );
        $table->add_field(
            'pricing_rule_custom_field_value',
            'custom_field_value',
            __( 'Custom field value', 'webba-booking-lite' ),
            'text',
            '',
            null,
            '',
            true,
            false
        );
        $table->add_field(
            'pricing_rule_number_of_seats_operator',
            'number_of_seats_operator',
            __( 'Operator', 'webba-booking-lite' ),
            'radio',
            '',
            [
                'options' => [
                    'equals'    => __( 'equals', 'webba-booking-lite' ),
                    'more_than' => __( 'more than', 'webba-booking-lite' ),
                    'less_than' => __( 'less than', 'webba-booking-lite' ),
                ],
            ],
            'equals',
            true,
            false
        );
        $table->add_field(
            'pricing_rule_number_of_seats_value',
            'number_of_seats_value',
            __( 'Number of seats', 'webba-booking-lite' ),
            'text',
            '',
            null,
            '',
            true,
            false
        );
        $table->add_field(
            'pricing_rule_number_of_timeslots_operator',
            'number_of_timeslots_operator',
            __( 'Operator', 'webba-booking-lite' ),
            'radio',
            '',
            [
                'options' => [
                    'equals'    => __( 'equals', 'webba-booking-lite' ),
                    'more_than' => __( 'more than', 'webba-booking-lite' ),
                    'less_than' => __( 'less than', 'webba-booking-lite' ),
                ],
            ],
            'equals',
            true,
            false
        );
        $table->add_field(
            'pricing_rule_number_of_timeslots_value',
            'number_of_timeslots_value',
            __( 'Number of timeslots', 'webba-booking-lite' ),
            'text',
            '',
            null,
            '',
            true,
            false
        );
        $table->add_field(
            'pricing_rule_only_same_service',
            'only_same_service',
            __( 'Only timeslots in the same service', 'webba-booking-lite' ),
            'checkbox',
            '',
            [
                'yes'     => __( 'Yes', 'webba-booking-lite' ),
                'tooltip' => $tooltip,
            ],
            '',
            true,
            false,
            false
        );
        $day_time_default = [];
        $table->add_field(
            'pricing_rule_day_time',
            'day_time',
            __( 'Day of week and time range', 'webba-booking-lite' ),
            'wbk_business_hours',
            '',
            null,
            $day_time_default,
            true,
            false,
            false
        );
        $table->add_field(
            'pricing_rule_action',
            'action',
            __( 'Action', 'webba-booking-lite' ),
            'radio',
            '',
            [
                'options' => [
                    'increase' => __( 'increase', 'webba-booking-lite' ),
                    'reduce'   => __( 'reduce', 'webba-booking-lite' ),
                    'replace'  => __( 'replace', 'webba-booking-lite' ),
                ],
            ],
            'increase'
        );
        $tooltip = __( 'Set the value by which the price will be increased, decreased, or replaced.', 'webba-booking-lite' );
        $table->add_field(
            'pricing_rule_amount',
            'amount',
            __( 'Amount', 'webba-booking-lite' ),
            'text',
            '',
            [
                'tooltip'  => $tooltip,
                'sub_type' => 'none_negative_float',
            ],
            '0',
            true,
            true,
            false
        );
        $table->add_field(
            'pricing_rule_fixed_percent',
            'fixed_percent',
            __( 'Fixed / percent', 'webba-booking-lite' ),
            'radio',
            '',
            [
                'options' => [
                    'fixed'   => __( 'fixed', 'webba-booking-lite' ),
                    'percent' => __( 'percent', 'webba-booking-lite' ),
                ],
            ],
            'fixed'
        );
        $table->add_field(
            'pricing_rule_multiply_amount',
            'multiply_amount',
            __( 'Multiply amount by the field value', 'webba-booking-lite' ),
            'checkbox',
            '',
            [
                'yes' => __( 'Yes', 'webba-booking-lite' ),
            ],
            '',
            true,
            false,
            false
        );
        $table->add_field(
            'pricing_rule_related_to_seats_number',
            'related_to_seats_number',
            __( 'The field is related to the number of seats booked', 'webba-booking-lite' ),
            'checkbox',
            '',
            [
                'yes' => __( 'Yes', 'webba-booking-lite' ),
            ],
            '',
            true,
            false,
            false
        );
        $table->add_field(
            'pricing_rule_is_for_entire_order',
            'is_for_entire_order',
            __( 'Apply the pricing rule to the entire order instead of individual time slots.', 'webba-booking-lite' ),
            'checkbox',
            '',
            [
                'yes' => __( 'Yes', 'webba-booking-lite' ),
            ],
            '',
            true,
            false,
            false
        );
        $table = WbkData()->models->add( $table, $db_prefix . 'wbk_pricing_rules' );
        $table->fields->get_element_at( 'pricing_rule_date_range' )->set_dependency( [['type', '=', 'date_range']] );
        $table->fields->get_element_at( 'pricing_rule_days_number' )->set_dependency( [['type', '=', 'early_booking']] );
        $table->fields->get_element_at( 'pricing_rule_custom_field_id' )->set_dependency( [['type', '=', 'custom_field']] );
        $table->fields->get_element_at( 'pricing_rule_custom_field_operator' )->set_dependency( [['type', '=', 'custom_field']] );
        $table->fields->get_element_at( 'pricing_rule_custom_field_value' )->set_dependency( [['type', '=', 'custom_field']] );
        $table->fields->get_element_at( 'pricing_rule_number_of_seats_operator' )->set_dependency( [['type', '=', 'number_of_seats']] );
        $table->fields->get_element_at( 'pricing_rule_number_of_seats_value' )->set_dependency( [['type', '=', 'number_of_seats']] );
        $table->fields->get_element_at( 'pricing_rule_number_of_timeslots_operator' )->set_dependency( [['type', '=', 'number_of_timeslots']] );
        $table->fields->get_element_at( 'pricing_rule_number_of_timeslots_value' )->set_dependency( [['type', '=', 'number_of_timeslots']] );
        $table->fields->get_element_at( 'pricing_rule_only_same_service' )->set_dependency( [['type', '=', 'number_of_timeslots']] );
        $table->fields->get_element_at( 'pricing_rule_multiply_amount' )->set_dependency( [['type', '=', 'custom_field']] );
        $table->fields->get_element_at( 'pricing_rule_related_to_seats_number' )->set_dependency( [['type', '=', 'custom_field']] );
        $table->fields->get_element_at( 'pricing_rule_day_time' )->set_dependency( [['type', '=', 'day_of_week_and_time']] );
        $table->fields->get_element_at( 'pricing_rule_fixed_percent' )->set_dependency( [['action', '!=', 'replace'], ['action', '!=', 'multiply']] );
        $table->sync_structure();
    }

}
