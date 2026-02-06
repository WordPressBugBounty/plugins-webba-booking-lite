<?php

use WbkData\Model;

if (!defined('ABSPATH')) {
    exit();
}

class WBK_Model
{
    public function __construct()
    {
        add_action('init', [$this, 'initalize_model'], 20);
    }
    static function create_tables()
    {
        global $wpdb;
        $prefix = $wpdb->prefix;
        update_option('wbk_db_prefix', $prefix);
        // custom on/off days
        $wpdb->query(
            'CREATE TABLE IF NOT EXISTS ' .
                get_option('wbk_db_prefix', '') .
                "wbk_days_on_off (
	            id int unsigned NOT NULL auto_increment PRIMARY KEY,
	            service_id int unsigned NOT NULL,
	            day int unsigned NOT NULL,
	            status int unsigned NOT NULL,
	            UNIQUE KEY id (id)
	        )
	        DEFAULT CHARACTER SET = utf8
	        COLLATE = utf8_general_ci"
        );
        // custom locked timeslots
        $wpdb->query(
            'CREATE TABLE IF NOT EXISTS ' .
                get_option('wbk_db_prefix', '') .
                "wbk_locked_time_slots (
	            id int unsigned NOT NULL auto_increment PRIMARY KEY,
	            service_id int unsigned NOT NULL,
	            time int unsigned NOT NULL,
	            connected_id int unsigned NOT NULL default 0,
	            UNIQUE KEY id (id)
	        )
	        DEFAULT CHARACTER SET = utf8
	        COLLATE = utf8_general_ci"
        );
    }
    public function initalize_model()
    {
        global $wpdb;
        $db_prefix = $wpdb->prefix;
        update_option('wbk_db_prefix', $db_prefix);

        // create tables if not created
        self::create_tables();

        $date_format = WBK_Date_Time_Utils::get_date_format_backend();

        // form table definition
        $table = new WbkData\Model($db_prefix . 'wbk_forms');
        $table->set_single_item_name(__('Form', 'webba-booking-lite'));
        $table->set_multiple_item_name(__('Forms', 'webba-booking-lite'));
        $table->sections['general'] = __('General', 'webba-booking-lite');
        $table->add_field(
            'form_name',
            'name',
            __('Form name', 'webba-booking-lite'),
            'text',
            'general',
            ['tooltip' => __('Enter form name.', 'webba-booking-lite')]
        );
        $table->add_field(
            'form_fields',
            'fields',
            __('Fields', 'webba-booking-lite'),
            'wbk_form_fields',
            'general',
            ['tooltip' => __('', '')],
            [],
            true,
            false,
            false
        );
        $table->sync_structure();
        WbkData()->models->add($table, $db_prefix . 'wbk_forms');
        // end form table definition

        $table = new WbkData\Model($db_prefix . 'wbk_services');
        $table->set_single_item_name(__('Service', 'webba-booking-lite'));
        $table->set_multiple_item_name(__('Services', 'webba-booking-lite'));

        // Sections mapped to CSV tabs
        $table->sections['details'] = __('Details', 'webba-booking-lite');
        $table->sections['availability'] = __('Availability', 'webba-booking-lite');
        $table->sections['pricing'] = __('Pricing', 'webba-booking-lite');
        $table->sections['integrations'] = __('Integrations', 'webba-booking-lite');
        $table->sections['settings'] = __('Settings', 'webba-booking-lite');

        // ========== DETAILS TAB ==========
        // Service image (first in CSV order)
        $table->add_field(
            'service_image',
            'image',
            __('Service image', 'webba-booking-lite'),
            'file',
            'details',
            [
                'tooltip' => __(
                    'Upload main service image which will show up in the booking form. Leave empty if you don\'t want to show any image.',
                    'webba-booking-lite'
                ),
                'required_plan' => 'start', // TIER 1
            ],
            '',
            true,
            true,
            false
        );
        // Service name
        $table->add_field(
            'service_name',
            'name',
            __('Service name', 'webba-booking-lite'),
            'text',
            'details',
        );
        // Category (optional) - NEW FIELD
        $table->add_field(
            'service_categories',
            'categories',
            __('Categories (optional)', 'webba-booking-lite'),
            'select',
            'details',
            [
                'tooltip' => __('Assign categories', 'webba-booking-lite'),
                'options' => 'service_categories',
                'multiple' => true,
            ],
            '0',
            true,
            false,
            false
        );
        // Description
        $table->add_field(
            'service_description',
            'description',
            __('Description', 'webba-booking-lite'),
            'editor',
            'details',
            [
                'tooltip' => __(
                    'Enter a description of the service.',
                    'webba-booking-lite'
                ),
            ],
            '',
            true,
            false,
            false
        );
        // Override main notifications email(s) - NEW FIELD
        $table->add_field(
            'service_override_email',
            'override_email',
            __('Override main notifications email(s)', 'webba-booking-lite'),
            'checkbox',
            'details',
            [
                'yes' => __('Yes', 'webba-booking-lite'),
                'tooltip' => __(
                    'Override if you want to use different notification email addresses for this service compared to global setting, set in Notifications Settings.',
                    'webba-booking-lite'
                ),
            ],
            '',
            true,
            false,
            false
        );
        // Email address(es) (if Override enabled) - NEW FIELD
        $table->add_field(
            'service_email',
            'email',
            __('Email address(es)', 'webba-booking-lite'),
            'text',
            'details',
            [
                'tooltip' => __(
                    'Enter the email address, use comma to add multiple.',
                    'webba-booking-lite'
                ),
                'sub_type' => 'email',
                'hide' => [['override_email', '=', 'yes']],
                'dependent_value' => [
                    'condition' => ['override_email', '!=', 'yes'],
                    'value' => '',
                ],
            ],
            '',
            true,
            true,
            false
        );
        // Booking form
        $table->add_field(
            'service_form_builder',
            'form_builder',
            __('Booking form', 'webba-booking-lite'),
            'select',
            'details',
            [
                'tooltip' => __(
                    'Choose which form customers will see when booking this service. Keep the default Webba Form, or create one in \'Form Builder\' and select it here.',
                    'webba-booking-lite'
                ),
                'options' => 'forms',
                'required_plan' => 'standard', // TIER 2
                'null_value' => [
                    '0' => __('Default Form', 'webba-booking-lite'),
                ]
            ],
            '0',
            true,
            false,
            false
        );
        // ========== AVAILABILITY TAB - GENERAL Subsection ==========
        // Duration (hours and minutes) - stored as minutes in database, default: 0 hours, 30 mins
        $table->add_field(
            'service_duration',
            'duration',
            __('Duration', 'webba-booking-lite'),
            'duration',
            'availability',
            [
                'tooltip' => __(
                    'Enter the duration of each booking.',
                    'webba-booking-lite'
                ),
                'sub_type' => 'duration',
            ],
            '30'
        );
        // Buffer time (renamed from Gap) - stored as minutes in database, default: 0 hours, 0 minutes
        $table->add_field(
            'service_interval_between',
            'interval_between',
            __('Buffer time', 'webba-booking-lite'),
            'duration',
            'availability',
            [
                'tooltip' => __(
                    'Time automatically added between bookings to avoid back-to-back sessions. Use it in case you need time for preparation, cleaning etc. Note: old setting name "Gap".',
                    'webba-booking-lite'
                ),
                'sub_type' => 'duration',
            ],
            '0',
            true,
            false
        );
        // Notice time before booking (renamed from Preparation time) - stored as minutes in database, default: 0 hours, 0 minutes
        $table->add_field(
            'service_prepare_time',
            'prepare_time',
            __('Notice time before booking', 'webba-booking-lite'),
            'duration',
            'availability',
            [
                'tooltip' => __(
                    'Minimum time before the start of a slot that a customer must book (e.g., "must book at least 3 hours in advance"). Used to be called Preparation time.',
                    'webba-booking-lite'
                ),
                'sub_type' => 'duration',
            ],
            '0',
            true,
            false
        );
        // Number of people limitation for same slot
        $table->add_field(
            'service_min_quantity',
            'min_quantity',
            __('Number of people limitation for same slot', 'webba-booking-lite'),
            'limitation',
            'availability',
            [
                'tooltip' => __(
                    'Set the maximum and minimum number of people/unit for the same time slot.',
                    'webba-booking-lite'
                ),
                'min_field' => 'min_quantity',
                'max_field' => 'quantity',
                'required_plan' => 'standard', // TIER 2
            ],
            '1',
            true,
            false
        );
        // Maximum Capacity Per Slot (hidden, handled by limitation field)
        $table->add_field(
            'service_quantity',
            'quantity',
            __('Maximum Capacity Per Slot', 'webba-booking-lite'),
            'text',
            'availability',
            [
                'tooltip' => __(
                    'Maximum number of participants allowed in the same slot. Set to 1 for individual appointments.',
                    'webba-booking-lite'
                ),
                'sub_type' => 'positive_integer',
                'hidden' => true,
                'required_plan' => 'standard', // TIER 2
            ],
            '1',
            true,
            false
        );

        // ========== AVAILABILITY TAB - RULES & LIMITATIONS Subsection ==========
        // Override global availability
        $tooltip = __(
            'Select the days and time intervals when this service is available for booking.',
            'webba-booking-lite'
        );
        $business_hours_default = [
            [
                'start' => 32400,
                'end' => 46800,
                'day_of_week' => '1',
                'status' => 'active',
            ],
            [
                'start' => 50400,
                'end' => 64800,
                'day_of_week' => '1',
                'status' => 'active',
            ],
            [
                'start' => 32400,
                'end' => 46800,
                'day_of_week' => '2',
                'status' => 'active',
            ],
            [
                'start' => 50400,
                'end' => 64800,
                'day_of_week' => '2',
                'status' => 'active',
            ],
            [
                'start' => 32400,
                'end' => 46800,
                'day_of_week' => '3',
                'status' => 'active',
            ],
            [
                'start' => 50400,
                'end' => 64800,
                'day_of_week' => '3',
                'status' => 'active',
            ],
            [
                'start' => 32400,
                'end' => 46800,
                'day_of_week' => '4',
                'status' => 'active',
            ],
            [
                'start' => 50400,
                'end' => 64800,
                'day_of_week' => '4',
                'status' => 'active',
            ],
            [
                'start' => 32400,
                'end' => 46800,
                'day_of_week' => '5',
                'status' => 'active',
            ],
            [
                'start' => 50400,
                'end' => 64800,
                'day_of_week' => '5',
                'status' => 'active',
            ],
        ];
        $table->add_field(
            'service_override_availability',
            'override_availability',
            __('Override global availability', 'webba-booking-lite'),
            'checkbox',
            'availability',
            [
                'yes' => __('Yes', 'webba-booking-lite'),
                'tooltip' => __(
                    'Enable this only if the service needs its own working hours. Otherwise, it will use your global working hours set in Global Availability settings.',
                    'webba-booking-lite'
                ),
            ],
            '',
            true,
            false,
            false
        );
        // Set custom availability
        $table->add_field(
            'service_business_hours',
            'business_hours',
            __('Set custom availability', 'webba-booking-lite'),
            'wbk_business_hours',
            'availability',
            [
                'tooltip' => $tooltip,
                'hide' => [['override_availability', '=', 'yes']],
            ],
            $business_hours_default,
            true,
            false,
            false
        );
        // Override global availability for specific days only
        $table->add_field(
            'service_override_specific_days',
            'override_specific_days',
            __('Override global availability for specific days only', 'webba-booking-lite'),
            'checkbox',
            'availability',
            [
                'checkbox_value' => 'yes',
                'yes' => __('Yes', 'webba-booking-lite'),
                'tooltip' => __(
                    'Choose dates where this service should follow a different schedule than normal. Perfect for holidays, special events, or temporary changes.',
                    'webba-booking-lite'
                ),
                'required_plan' => 'standard', // TIER 2
            ],
            '',
            true,
            false,
            false
        );
        // Set availability exceptions
        // Note: CSV specifies "Date Picker + Time slot slider" - NEW COMPONENT FOR DATE + TIME RANGE
        // Using date_range for now, may need custom component implementation
        $table->add_field(
            'service_availability_exceptions',
            'availability_exceptions',
            __('Set availability exceptions', 'webba-booking-lite'),
            'date_range',
            'availability',
            [
                'tooltip' => __(
                    'Choose dates where this service should follow a different schedule than normal. Perfect for holidays, special events, or temporary changes. Moved from Booking Rules, used to be "Special Hours".',
                    'webba-booking-lite'
                ),
                'hide' => [['override_specific_days', '=', 'yes']],
                'date_format' => $date_format,
                'time_zone' => get_option('wbk_timezone', 'UTC'),
                'required_plan' => 'standard', // TIER 2
            ],
            '',
            true,
            false,
            false
        );
        // Limit availability to specific date range
        $tooltip = __(
            'Specify a date range if the service is only valid for a specific period of time.',
            'webba-booking-lite'
        );
        $table->add_field(
            'service_date_range',
            'date_range',
            __('Limit availability to specific date range', 'webba-booking-lite'),
            'date_range',
            'availability',
            [
                'tooltip' => $tooltip,
                'date_format' => $date_format,
                'time_zone' => get_option('wbk_timezone', 'UTC'),
                'required_plan' => 'start', // TIER 1
                'available_in_old_free' => true,
            ],
            '',
            true,
            false,
            false
        );
        // Override global timeslot intervals (step)
        $table->add_field(
            'service_override_step',
            'override_step',
            __('Override global timeslot intervals (step)', 'webba-booking-lite'),
            'checkbox',
            'availability',
            [
                'yes' => __('Yes', 'webba-booking-lite'),
                'tooltip' => __(
                    'Enable this to override the global time slot interval setting for this service.',
                    'webba-booking-lite'
                ),
            ],
            '',
            true,
            false,
            false
        );
        // Time slot interval (step)
        $tooltip = __(
            'Enter the default time interval for time slots, which helps organize business hours and appointment durations.',
            'webba-booking-lite'
        );
        $table->add_field(
            'service_step',
            'step',
            __('Time slot interval (step)', 'webba-booking-lite'),
            'select_custom',
            'availability',
            [
                'tooltip' => $tooltip,
                'options' => WBK_Date_Time_Utils::get_supported_step_formats(),
                'hide' => [['override_step', '=', 'yes']],
            ],
            'duration',
            true,
            false,
            false
        );

        // Require customers to book several time slots
        $table->add_field(
            'service_limited_timeslot',
            'limited_timeslot',
            __('Require customers to book several time slots', 'webba-booking-lite'),
            'checkbox',
            'availability',
            [
                'yes' => __('Yes', 'webba-booking-lite'),
                'tooltip' => __(
                    'When enabled, customers will be required to book more than 1 time slot',
                    'webba-booking-lite'
                ),
                'required_plan' => 'standard', // TIER 2
                'available_in_old_free' => true,
            ],
            '',
            true,
            false,
            false
        );
        // Minimum Slots Per Booking
        $table->add_field(
            'service_multi_mode_low_limit',
            'multi_mode_low_limit',
            __('Minimum Slots Per Booking', 'webba-booking-lite'),
            'limitation',
            'availability',
            [
                'sub_type' => 'none_negative_integer',
                'tooltip' => __(
                    'Minimum number of time slots required to make a booking.',
                    'webba-booking-lite'
                ),
                'hide' => [['limited_timeslot', '=', 'yes']],
                'min_field' => 'multi_mode_low_limit',
                'max_field' => 'multi_mode_limit',
                'required_plan' => 'standard', // TIER 2
            ],
            '',
            true,
            false,
            false
        );
        // Maximum Slots Per Booking
        $table->add_field(
            'service_multi_mode_limit',
            'multi_mode_limit',
            __('Maximum Slots Per Booking', 'webba-booking-lite'),
            'text',
            'availability',
            [
                'sub_type' => 'none_negative_integer',
                'tooltip' => __(
                    'Maximum number of time slots allowed to make a booking.',
                    'webba-booking-lite'
                ),
                'hide' => [['limited_timeslot', '=', 'yes']],
                'hidden' => true,
                'required_plan' => 'standard', // TIER 2
            ],
            '',
            true,
            false,
            false
        );
        // Require consecutive time slots
        $tooltip = __(
            'When this option is enabled, the system allows customers to select only consecutive time slots.',
            'webba-booking-lite'
        );
        $table->add_field(
            'service_consecutive_timeslots',
            'consecutive_timeslots',
            __('Require consecutive time slots', 'webba-booking-lite'),
            'checkbox',
            'availability',
            [
                'yes' => __('Yes', 'webba-booking-lite'),
                'tooltip' => __(
                    'Customers must book continuous back-to-back time slots for longer sessions.',
                    'webba-booking-lite'
                ),
                'hide' => [['limited_timeslot', '=', 'yes']],
                'required_plan' => 'standard', // TIER 2
            ],
            '',
            true,
            false,
            false
        );

        // ========== PRICING TAB ==========
        // Price
        $tooltip = __(
            'Set the service price. Leaving it as 0, will show price as "Free" in the booking form.',
            'webba-booking-lite'
        );
        $table->add_field(
            'service_price',
            'price',
            __('Price', 'webba-booking-lite'),
            'text',
            'pricing',
            ['tooltip' => $tooltip, 'sub_type' => 'none_negative_float'],
            '0',
            true,
            true,
            false
        );
        // Do not show price - NEW FIELD
        $table->add_field(
            'service_hide_price',
            'hide_price',
            __('Do not show price', 'webba-booking-lite'),
            'checkbox',
            'pricing',
            [
                'yes' => __('Yes', 'webba-booking-lite'),
                'tooltip' => __(
                    'If you don\'t want to show price, turn this on.',
                    'webba-booking-lite'
                ),
                'hide' => [
                    ['price', '<=', '0']
                ],
                'required_plan' => 'start', // TIER 1
            ],
            '',
            true,
            false,
            false
        );
        // Take deposit instead of full payment (renamed from Enable deposit)
        $table->add_field(
            'service_enable_deposit',
            'enable_deposit',
            __('Take deposit instead of full payment', 'webba-booking-lite'),
            'checkbox',
            'pricing',
            [
                'yes' => __('Yes', 'webba-booking-lite'),
                'tooltip' => __(
                    'Let customers pay only part of the price now and the rest later.',
                    'webba-booking-lite'
                ),
                'required_plan' => 'premium', // TIER 3
                'available_in_old_free' => false,
            ],
            '',
            true,
            false,
            false
        );
        // Deposit amount
        $table->add_field(
            'service_deposit_amount',
            'deposit_amount',
            __('Deposit amount', 'webba-booking-lite'),
            'text',
            'pricing',
            [
                'tooltip' => __(
                    'How much the customer pays now when booking. You\'ll collect the remaining amount manually.',
                    'webba-booking-lite'
                ),
                'sub_type' => 'none_negative_float',
                'hide' => [['enable_deposit', '=', 'yes']],
                'dependent_value' => [
                    'condition' => ['enable_deposit', '!=', 'yes'],
                    'value' => '0',
                ],
                'required_plan' => 'premium', // TIER 3
                'available_in_old_free' => false,
            ],
            '0',
            true,
            false
        );

        // Payment methods
        $tooltip = __(
            'Select the preferred payment method(s) for this service.',
            'webba-booking-lite'
        );
        $payment_methods = WBK_Model_Utils::get_all_payment_methods();
        $table->add_field(
            'service_payment_methods',
            'payment_methods',
            __('Payment methods', 'webba-booking-lite'),
            'select',
            'pricing',
            [
                'tooltip' => $tooltip,
                'multiple' => true,
                'options' => 'backend',
                'items' => $payment_methods,
                'description' => __('IMPORTANT! For Google Pay/Apple pay and Other Payment Methods to work you have to activate them in your Stripe account', 'webba-booking-lite'),
            ],
            null,
            true,
            false,
            false
        );
        // Show "from" label next to the price - NEW FIELD
        $table->add_field(
            'service_show_from_label',
            'show_from_label',
            __('Show "from" label next to the price', 'webba-booking-lite'),
            'checkbox',
            'pricing',
            [
                'yes' => __('Yes', 'webba-booking-lite'),
                'tooltip' => __(
                    'Add label "from" if the final price depends on different pricing rules and choices in the later steps.',
                    'webba-booking-lite'
                ),
                'required_plan' => 'premium', // TIER 3
            ],
            '',
            true,
            false,
            false
        );
        // Enable service fee
        $tooltip = __(
            'Add an extra one-time fee on top of the booking (for example: booking fee or cleaning fee).',
            'webba-booking-lite'
        );
        $table->add_field(
            'service_enable_service_fee',
            'enable_service_fee',
            __('Enable service fee', 'webba-booking-lite'),
            'checkbox',
            'pricing',
            [
                'yes' => __('Yes', 'webba-booking-lite'),
                'tooltip' => $tooltip,
                'required_plan' => 'premium', // TIER 3
            ],
            '',
            true,
            false,
            false
        );
        // Service fee amount
        $table->add_field(
            'service_service_fee',
            'service_fee',
            __('Service fee amount', 'webba-booking-lite'),
            'text',
            'pricing',
            [
                'tooltip' => __(
                    'The extra fee that will be added to every booking for this service.',
                    'webba-booking-lite'
                ),
                'sub_type' => 'none_negative_float',
                'hide' => [['enable_service_fee', '=', 'yes']],
                'dependent_value' => [
                    'condition' => ['enable_service_fee', '!=', 'yes'],
                    'value' => '0',
                ],
                'required_plan' => 'premium', // TIER 3
            ],
            '0',
            true,
            false,
            false
        );

        // Apply pricing rules (advanced)
        $tooltip =
            'Select the <a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/pricing-rules/">pricing rules</a> to be applied to this service.';
        $table->add_field(
            'service_pricing_rules',
            'pricing_rules',
            __('Apply pricing rules (advanced)', 'webba-booking-lite'),
            'select',
            'pricing',
            [
                'tooltip' => $tooltip,
                'items' => WBK_Model_Utils::get_pricing_rules(),
                'options' => 'pricing_rules',
                'multiple' => true,
                'required_plan' => 'premium', // TIER 3
                'available_in_old_free' => true,
            ],
            null,
            true,
            false,
            false
        );
        // WooCommerce product ID
        $table->add_field(
            'service_woo_product',
            'woo_product',
            __('WooCommerce product ID', 'webba-booking-lite'),
            'select',
            'pricing',
            [
                'tooltip' => __(
                    'Set ID of the product associated with this service. Set only if WooCommerce is used as payment method.',
                    'webba-booking-lite'
                ),
                'sub_type' => 'none_negative_integer',
                'pro_version' => true,
                'required_plan' => 'standard', // TIER 2
                'options' => 'backend',
            ],
            '0',
            true,
            false,
            false
        );

        // ========== INTEGRATIONS TAB ==========
        // Connect Google calendar
        $tooltip = __(
            'Select the Google Calendar(s) that should sync with this service\'s bookings. (Available after connecting your Google account.)',
            'webba-booking-lite'
        );
        $table->add_field(
            'service_gg_calendars',
            'gg_calendars',
            __('Connect Google calendar', 'webba-booking-lite'),
            'select',
            'integrations',
            [
                'tooltip' => $tooltip,
                'multiple' => true,
                'options' => 'gg_calendars',
                'required_plan' => 'start', // TIER 1
            ],
            null,
            true,
            false,
            false
        );
        // External Calendar (ICS)
        $tooltip = __(
            'Add one or more iCal (.ics) URLs to block availability when you\'re busy in other calendars. It works one-way only - it doesn\'t import Webba Appointments to this calendar.',
            'webba-booking-lite'
        );
        $table->add_field(
            'service_extcalendar',
            'extcalendar',
            __('External Calendar (ICS)', 'webba-booking-lite'),
            'textarea',
            'integrations',
            [
                'tooltip' => $tooltip,
                'pro_version' => true,
                'required_plan' => 'premium', // TIER 3
            ],
            '',
            true,
            false,
            false
        );
        // External calendar for group services
        $table->add_field(
            'service_extcalendar_group_mode',
            'extcalendar_group_mode',
            __('External calendar for group services', 'webba-booking-lite'),
            'select',
            'integrations',
            [
                'items' => [
                    'reduce' => __('Reduce availability', 'webba-booking-lite'),
                    'lock' => __('Lock time slot', 'webba-booking-lite'),
                ],
                'pro_version' => true,
                'required_plan' => 'premium', // TIER 3
                'hide' => [
                    ['quantity', '>', '1'],
                    ['extcalendar', '=', ''],
                ],
            ],
            '',
            true,
            false,
            true
        );
        // Create Zoom meetings
        $tooltip = __(
            'Automatically generate Zoom meeting links for bookings of this service. (Requires connecting your Zoom account.)',
            'webba-booking-lite'
        );
        $table->add_field(
            'service_zoom',
            'zoom',
            __('Create Zoom meetings', 'webba-booking-lite'),
            'checkbox',
            'integrations',
            [
                'yes' => __('Yes', 'webba-booking-lite'),
                'tooltip' => $tooltip,
                'pro_version' => true,
                'required_plan' => 'premium', // TIER 3
            ],
            '',
            true,
            false,
            false
        );
        // Create Google Meet meetings
        $tooltip = __(
            'Automatically generate Google Meet links for bookings of this service. (Requires connecting your Google account.)',
            'webba-booking-lite'
        );
        $table->add_field(
            'service_google_meet_enabled',
            'google_meet_enabled',
            __('Create Google Meet meetings', 'webba-booking-lite'),
            'checkbox',
            'integrations',
            [
                'yes' => __('Yes', 'webba-booking-lite'),
                'tooltip' => $tooltip,
                'pro_version' => true,
                'required_plan' => 'premium', // TIER 3
            ],
            '',
            true,
            false,
            false
        );
        // Select calendar for Google Meet events
        $tooltip = __(
            'Select which Google Calendar to add Google Meet events to. The calendar must be configured in Google Calendar settings.',
            'webba-booking-lite'
        );
        $table->add_field(
            'service_google_meet_calendar',
            'google_meet_calendar',
            __('Select calendar for Google Meet events', 'webba-booking-lite'),
            'select',
            'integrations',
            [
                'tooltip' => $tooltip,
                'options' => 'source:gg_calendars:gg_calendars',
                'hide' => [['google_meet_enabled', '=', 'yes']],
                'pro_version' => true,
                'required_plan' => 'premium', // TIER 3
            ],
            '',
            true,
            false,
            false
        );

        // ========== SETTINGS TAB ==========
        // Calendar color
        $table->add_field(
            'service_color',
            'color',
            __('Calendar color', 'webba-booking-lite'),
            'color',
            'settings',
            [
                'tooltip' => __(
                    'Pick a color to represent this service on Webba Calendar.',
                    'webba-booking-lite'
                ),
                'generate_random' => true,
                'generate_key' => ['services', 'color'],
            ],
            '',
            true,
            false,
            false
        );
        // Service priority
        $table->add_field(
            'service_priority',
            'priority',
            __('Service priority', 'webba-booking-lite'),
            'text',
            'settings',
            [
                'sub_type' => 'none_negative_integer',
                'tooltip' => __(
                    'Control the order in which this service appears in your booking form. Lower numbers appear first.',
                    'webba-booking-lite'
                ),
            ],
            '0',
            true,
            false
        );
        // Allow Staff to view and manage bookings (renamed from Users)
        $tooltip = __(
            'Select the staff members who see this service and manage its schedule.',
            'webba-booking-lite'
        );
        $table->add_field(
            'service_users',
            'users',
            __('Allow Staff to view and manage bookings', 'webba-booking-lite'),
            'select',
            'settings',
            [
                'items' => [],
                'multiple' => true,
                'tooltip' => $tooltip,
                'options' => 'backend',
                'required_plan' => 'premium', // TIER 3
            ],
            0,
            true,
            false,
            false
        );
        // Allow Staff to edit service settings
        $table->add_field(
            'service_users_allow_edit',
            'users_allow_edit',
            __('Allow Staff to edit service settings', 'webba-booking-lite'),
            'checkbox',
            'settings',
            [
                'yes' => __('Yes', 'webba-booking-lite'),
                'tooltip' => __(
                    'When enabled, assigned users can edit this service\'s settings. If turned off, only admins can make changes.',
                    'webba-booking-lite'
                ),
                'hide' => [['users', '>', '0']],
                'required_plan' => 'premium', // TIER 3
            ],
            '',
            true,
            false,
            false
        );


        // Set dependencies for conditional fields
        if (
            $table->fields->get_element_at('service_extcalendar_group_mode') !=
            false
        ) {
            $table->fields
                ->get_element_at('service_extcalendar_group_mode')
                ->set_dependency([
                    ['quantity', '>', '1'],
                    ['extcalendar', '!=', ''],
                ]);
        }

        $table->sync_structure();
        WbkData()->models->add($table, $db_prefix . 'wbk_services');

        // Service categories
        $table = new WbkData\Model($db_prefix . 'wbk_service_categories');
        $table->set_single_item_name(__('Category', 'webba-booking-lite'));
        $table->set_multiple_item_name(__('Categories', 'webba-booking-lite'));
        $table->sections['name'] = __('Category name', 'webba-booking-lite');
        $table->sections['category_list'] = __(
            'Services',
            'webba-booking-lite'
        );
        $tooltip = __('Enter category name.', 'webba-booking-lite');
        $table->add_field(
            'category_name',
            'name',
            __('Category name', 'webba-booking-lite'),
            'text',
            'general',
            ['tooltip' => $tooltip]
        );

        $tooltip = __(
            'Select the services to be included in this category.',
            'webba-booking-lite'
        );
        $table->add_field(
            'list',
            'list',
            __('Services', 'webba-booking-lite'),
            'select',
            'general',
            [
                'tooltip' => $tooltip,
                'items' => WBK_Model_Utils::get_services(),
                'options' => 'services',
                'multiple' => true,
            ],
            null,
            true,
            true,
            false
        );
        $table->sync_structure();
        WbkData()->models->add($table, $db_prefix . 'wbk_service_categories');

        // Email templates
        $table = new WbkData\Model($db_prefix . 'wbk_email_templates');
        $table->set_single_item_name(
            __('Email notification', 'webba-booking-lite')
        );
        $table->set_multiple_item_name(
            __('Email notifications', 'webba-booking-lite')
        );

        $tooltip = __(
            'Enter a name to identify the email template.',
            'webba-booking-lite'
        );
        $table->add_field(
            'name',
            'name',
            __('Name (internal use)', 'webba-booking-lite'),
            'text',
            '',
            [
                'tooltip' => $tooltip,
                'disable_condition' => ['is_default' => 'yes'],
            ]
        );
        $table->add_field(
            'enabled',
            'enabled',
            __('Enabled', 'webba-booking-lite'),
            'checkbox',
            '',
            ['yes' => __('Yes', 'webba-booking-lite'), 'tooltip' => $tooltip],
            'yes',
            true,
            true,
            false
        );

        $table->add_field(
            'is_default',
            'is_default',
            __('Default', 'webba-booking-lite'),
            'checkbox',
            '',
            ['yes' => __('Yes', 'webba-booking-lite'), 'tooltip' => $tooltip],
            '',
            false,
            false,
            false
        );

        $tooltip = __(
            'Choose a trigger when email template is sent.',
            'webba-booking-lite'
        );
        $table->add_field(
            'type',
            'type',
            __('Trigger', 'webba-booking-lite'),
            'select',
            '',
            [
                'tooltip' => $tooltip,
                'multiple' => false,
                'options' => 'backend',
                'items' => WBK_Model_Utils::get_notification_types(),
                'disable_condition' => ['is_default' => 'yes'],
            ],
            null,
            true,
            true,
            true
        );
        $table->add_field(
            'recipients',
            'recipients',
            __('Recipients', 'webba-booking-lite'),
            'multicheckbox',
            '',
            [
                'yes' => __('Yes', 'webba-booking-lite'),
                'tooltip' => __(
                    'Set who receive this email',
                    'webba-booking-lite'
                ),
                'options' => [
                    'admin' => __('Administrator(s)', 'webba-booking-lite'),
                    'customer' => __('Customer', 'webba-booking-lite'),
                    'group' => __('Group Users', 'webba-booking-lite'),
                ],
            ],
            '',
            true,
            true,
            false
        );
        $tooltip = __('Subject of the email', 'webba-booking-lite');
        $table->add_field(
            'subject',
            'subject',
            __('Email subject line', 'webba-booking-lite'),
            'text',
            '',
            ['tooltip' => $tooltip],
            '',
            true,
            false,
            true
        );

        $tooltip = __(
            __(
                'Use the text editor to prepare the email template.',
                'webba-booking-lite'
            ) .
                __('List of available placeholders', 'webba-booking-lite') .
                '</a>',
            'webba-booking-lite'
        );
        $table->add_field(
            'template',
            'template',
            __('Email Body', 'webba-booking-lite'),
            'editor',
            '',
            [
                'tooltip' => $tooltip,
                'placeholders' => true,
            ],
            '',
            true,
            false,
            true
        );

        $tooltip = __(
            'A PDF attachment will be generated based on input text',
            'webba-booking-lite'
        );
        $table->add_field(
            'pdf_attachment',
            'pdf_attachment',
            __('PDF Attachment', 'webba-booking-lite'),
            'editor',
            '',
            [
                'tooltip' => $tooltip,
                'placeholders' => true,
                'pro_version' => true,
                'required_plan' => 'premium', // TIER 3
            ],
            '',
            true,
            false,
            false
        );

        $tooltip = __(
            'Generate and attach the iCal file for each booking',
            'webba-booking-lite'
        );
        $table->add_field(
            'calendar_event',
            'calendar_event',
            __('Attach iCal file', 'webba-booking-lite'),
            'checkbox',
            '',
            [
                'yes' => __('Yes', 'webba-booking-lite'),
                'tooltip' => $tooltip,
                'pro_version' => true,
                'required_plan' => 'premium', // TIER 3
            ],
            'yes',
            true,
            false,
            false
        );
        $tooltip = __(
            'Select the services for which this notification is used.',
            'webba-booking-lite'
        );
        $table->add_field(
            'use_for_all_services',
            'use_for_all_services',
            __('Use this template for all services', 'webba-booking-lite'),
            'checkbox',
            '',
            ['yes' => __('Yes', 'webba-booking-lite'), 'tooltip' => $tooltip],
            '',
            true,
            false,
            false
        );

        $table->add_field(
            'services',
            'services',
            __('Services', 'webba-booking-lite'),
            'select',
            'general',
            [
                'tooltip' => $tooltip,
                'items' => WBK_Model_Utils::get_services(),
                'options' => 'services',
                'multiple' => true,
            ],
            null,
            true,
            false,
            false
        );

        $table->fields
            ->get_element_at('services')
            ->set_dependency([['use_for_all_services', '!=', 'yes']]);

        $table->sync_structure();

        $table->fields
            ->get_element_at('is_default')
            ->set_filter_data('select', ['IN'], [], '', ['yes', 'no']);

        WbkData()->models->add($table, $db_prefix . 'wbk_email_templates');

        // Bookings (ex Appointments)
        $time_format = WBK_Date_Time_Utils::get_time_format();

        $allowed_fields = apply_filters(
            'webba_booking_bookings_table_allowed_filters',
            [
                'id',
                'name',
                'duration',
                'moment_price',
                'status',
                'service_id',
                'phone',
            ]
        );

        $table = new WbkData\Model($db_prefix . 'wbk_appointments');

        $table->set_single_item_name(__('Booking', 'webba-booking-lite'));
        $table->set_multiple_item_name(__('Bookings', 'webba-booking-lite'));
        //  $table->set_duplicatable(false);
        $table->set_default_sort_column(0);
        $table->set_default_sort_direction('desc');

        $tooltip = __('Enter the name of the customer.', 'webba-booking-lite');
        $table->add_field(
            'appointment_name',
            'name',
            __('Customer', 'webba-booking-lite'),
            'text',
            '',
            ['tooltip' => $tooltip],
            '',
            true,
            in_array('name', $allowed_fields)
        );

        $tooltip = __(
            'Select the service for which the booking is being made.',
            'webba-booking-lite'
        );
        $table->add_field(
            'appointment_service_id',
            'service_id',
            __('Service', 'webba-booking-lite'),
            'select',
            '',
            [
                'tooltip' => $tooltip,
                'items' => WBK_Model_Utils::get_services(true),
                'options' => 'services',
                'sub_type' => 'positive_integer',
            ],
            null,
            true,
            in_array('service_id', $allowed_fields),
            true
        );

        $tooltip = __('Select the booking date.', 'webba-booking-lite');
        $table->add_field(
            'appointment_day',
            'day',
            __('Date', 'webba-booking-lite'),
            'wbk_date',
            '',
            [
                'tooltip' => $tooltip,
                'date_format' => $date_format,
                'time_zone' => get_option('wbk_timezone', 'UTC'),
            ],
            '',
            true,
            in_array('day', $allowed_fields)
        );

        $tooltip = __('Select the booking time.', 'webba-booking-lite');
        $table->add_field(
            'appointment_time',
            'time',
            __('Time', 'webba-booking-lite'),
            'select',
            '',
            [
                'tooltip' => $tooltip,
                'time_format' => $time_format,
                'options' => 'backend',
            ],
            '',
            true,
            in_array('time', $allowed_fields)
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

        $tooltip = __(
            'Specify the number of places being booked for this appointment.',
            'webba-booking-lite'
        );
        $table->add_field(
            'appointment_quantity',
            'quantity',
            __('Places booked', 'webba-booking-lite'),
            'select',
            '',
            [
                'tooltip' => $tooltip,
                'sub_type' => 'positive_integer',
                'items' => [],
                'options' => 'backend',
            ],
            null,
            true,
            in_array('quantity', $allowed_fields),
            true
        );

        $table->add_field(
            'appointment_duration',
            'duration',
            __('Duration', 'webba-booking-lite'),
            'text',
            '',
            ['sub_type' => 'positive_integer'],
            '',
            false,
            true,
            false
        );
        $table->add_field(
            'appointment_created_on',
            'created_on',
            __('Created on', 'webba-booking-lite'),
            'text',
            '',
            ['sub_type' => 'positive_integer'],
            '',
            false,
            in_array('created_on', $allowed_fields),
            false
        );

        $tooltip = __(
            'Enter the customer\'s email address.',
            'webba-booking-lite'
        );
        $table->add_field(
            'appointment_email',
            'email',
            __('Email', 'webba-booking-lite'),
            'text',
            '',
            ['tooltip' => $tooltip, 'sub_type' => 'email'],
            '',
            true,
            in_array('email', $allowed_fields)
        );

        $tooltip = __(
            'Enter the customer\'s phone number.',
            'webba-booking-lite'
        );
        $table->add_field(
            'appointment_phone',
            'phone',
            __('Phone', 'webba-booking-lite'),
            'text',
            '',
            ['tooltip' => $tooltip],
            '',
            true,
            false, //in_array('phone', $allowed_fields),
            false
        );

        $tooltip = __(
            'Add any additional comments related to the booking.',
            'webba-booking-lite'
        );
        $table->add_field(
            'appointment_description',
            'description',
            __('Comment', 'webba-booking-lite'),
            'textarea',
            '',
            ['tooltip' => $tooltip],
            '',
            true,
            in_array('description', $allowed_fields),
            false
        );

        $table->add_field(
            'appointment_extra',
            'extra',
            __('Custom fields', 'webba-booking-lite'),
            'wbk_app_custom_data',
            '',
            null,
            '',
            true,
            in_array('extra', $allowed_fields),
            false
        );
        $table->add_field(
            'appointment_coupon',
            'coupon',
            __('Coupon', 'webba-booking-lite'),
            'text',
            '',
            ['sub_type' => 'positive_integer'],
            '',
            false,
            in_array('coupon', $allowed_fields),
            false
        );
        $table->add_field(
            'appointment_payment_method',
            'payment_method',
            __('Payment method', 'webba-booking-lite'),
            'text',
            '',
            null,
            '',
            false,
            in_array('payment_method', $allowed_fields),
            false
        );

        $tooltip = __(
            'If the payment has already been made, enter the payment amount paid for 1 person.',
            'webba-booking-lite'
        );
        $table->add_field(
            'appointment_moment_price',
            'moment_price',
            __('Price', 'webba-booking-lite'),
            'text',
            '',
            ['tooltip' => $tooltip, 'sub_type' => 'none_negative_float'],
            '',
            true,
            false,
            false
        );

        $table->add_field(
            'appointment_amount_paid',
            'amount_paid',
            __('Amount paid', 'webba-booking-lite'),
            'text',
            '',
            [
                'tooltip' => __(
                    'Enter the exact amount of money that was actually paid',
                    'webba-booking-lite'
                ),
                'sub_type' => 'none_negative_float',
            ],
            '0',
            true,
            true,
            false
        );

        $table->add_field(
            'appointment_user_ip',
            'user_ip',
            __('User IP', 'webba-booking-lite'),
            'text',
            '',
            null,
            '',
            false,
            in_array('ip', $allowed_fields),
            true
        );

        $tooltip = __(
            'Choose the appropriate booking status from the options available.',
            'webba-booking-lite'
        );
        $table->add_field(
            'appointment_status',
            'status',
            __('Status', 'webba-booking-lite'),
            'select',
            '',
            [
                'tooltip' => $tooltip,
                'items' => WBK_Model_Utils::get_booking_status_list(),
                'options' => WBK_Model_Utils::get_booking_status_list(),
            ],
            'pending',
            true,
            in_array('status', $allowed_fields),
            true
        );
        $table->add_field(
            'appointment_creted_by',
            'created_by',
            __('Created by', 'webba-booking-lite'),
            'select',
            '',
            [
                'items' => [
                    'na' => __('N/A', 'webba-booking-lite'),
                    'customer' => __('Customer', 'webba-booking-lite'),
                    'admin' => __('Administrator', 'webba-booking-lite'),
                ],
            ],
            'na',
            false,
            false
        );
        $table->add_field(
            'appointment_service_category',
            'service_category',
            __('Service category', 'webba-booking-lite'),
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
            ['sub_type' => 'positive_integer'],
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
            ['sub_type' => 'positive_integer'],
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
            ['sub_type' => 'positive_integer'],
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
            ['sub_type' => 'integer'],
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

        $table->add_field(
            'appointment_google_meet_link',
            'google_meet_link',
            'google_meet_link',
            'text',
            '',
            null,
            '',
            false,
            false,
            false
        );
        $table->add_field(
            'appointment_paid_with_coupon',
            'paid_with_coupon',
            'paid_with_coupon',
            'text',
            '',
            null,
            '',
            false,
            false,
            false
        );

        $table->sync_structure();

        $table = WbkData()->models->add(
            $table,
            $db_prefix . 'wbk_appointments'
        );

        $services = WBK_Model_Utils::get_services(true);
        $table->fields
            ->get_element_at('appointment_service_id')
            ->set_filter_data('select', ['IN'], [], '', $services);

        $statuses = WBK_Model_Utils::get_booking_status_list();
        $table->fields
            ->get_element_at('appointment_status')
            ->set_filter_data('select', ['IN'], [], '', $statuses);

        date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
        $start = strtotime('today midnight');
        $end = strtotime(
            '+ ' . get_option('wbk_filter_default_days_number', '30') . ' day',
            time()
        );
        $default_range = [$start, $end];

        if (
            isset($_REQUEST['filters']['appointment_day']['ignore']) &&
            $_REQUEST['filters']['appointment_day']['ignore'] == true
        ) {
            $default_range = [null, null];
        }

        $table->fields
            ->get_element_at('appointment_day')
            ->set_filter_data(
                'wbk_date_range',
                ['>=', '<='],
                $default_range,
                ' AND '
            );
        $table->fields
            ->get_element_at('appointment_created_on')
            ->set_filter_data(
                'wbk_date_range',
                ['>=', '<='],
                [null, null],
                ' AND '
            );
        date_default_timezone_set('UTC');

        $table = new WbkData\Model($db_prefix . 'wbk_cancelled_appointments');
        $table->set_single_item_name(__('Booking', 'webba-booking-lite'));
        $table->set_multiple_item_name(__('Bookings', 'webba-booking-lite'));
        $table->set_duplicatable(false);
        $table->add_field(
            'appointment_id_cancelled',
            'id_cancelled',
            __('ID of cancelled appointment', 'webba-booking-lite'),
            'text',
            '',
            ['sub_type' => 'positive_integer'],
            '',
            false,
            true,
            false
        );
        $table->add_field(
            'appointment_time',
            'time',
            __('Time', 'webba-booking-lite'),
            'select',
            '',
            [
                'time_format' => $time_format,
                'time_zone' => get_option('wbk_timezone', 'UTC'),
                'options' => 'backend',
            ],
            '',
            false,
            in_array('time', $allowed_fields)
        );
        $table->add_field(
            'appointment_cancelled_by',
            'cancelled_by',
            __('Cancelled by', 'webba-booking-lite'),
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
            __('Service', 'webba-booking-lite'),
            'select',
            '',
            [
                'items' => WBK_Model_Utils::get_services(),
                'sub_type' => 'positive_integer',
            ],
            null,
            false,
            in_array('service_id', $allowed_fields),
            false
        );
        $table->add_field(
            'appointment_created_on',
            'created_on',
            'created_on',
            'text',
            '',
            ['sub_type' => 'positive_integer'],
            '',
            true,
            true, //in_array('created_on', $allowed_fields),
            true //false
        );
        $table->add_field(
            'appointment_day',
            'day',
            __('Date', 'webba-booking-lite'),
            'wbk_date',
            '',
            [
                'date_format' => $date_format,
                'time_zone' => get_option('wbk_timezone', 'UTC'),
            ],
            '',
            false,
            in_array('day', $allowed_fields)
        );
        $table->add_field(
            'appointment_quantity',
            'quantity',
            __('Places booked', 'webba-booking-lite'),
            'select',
            '',
            ['sub_type' => 'positive_integer', 'items' => []],
            null,
            false,
            in_array('quantity', $allowed_fields),
            true
        );
        $table->add_field(
            'appointment_name',
            'name',
            __('Name', 'webba-booking-lite'),
            'text',
            '',
            null,
            '',
            true,
            in_array('name', $allowed_fields)
        );
        $table->add_field(
            'appointment_email',
            'email',
            __('Email', 'webba-booking-lite'),
            'text',
            '',
            ['sub_type' => 'email'],
            '',
            false,
            in_array('email', $allowed_fields)
        );
        $table->add_field(
            'appointment_phone',
            'phone',
            __('Phone', 'webba-booking-lite'),
            'text',
            '',
            null,
            '',
            false,
            in_array('phone', $allowed_fields),
            false
        );
        $table->add_field(
            'appointment_description',
            'description',
            __('Comment', 'webba-booking-lite'),
            'textarea',
            '',
            null,
            '',
            true,
            in_array('description', $allowed_fields),
            false
        );
        $table->add_field(
            'appointment_extra',
            'extra',
            __('Custom fields', 'webba-booking-lite'),
            'wbk_app_custom_data',
            '',
            null,
            '',
            false,
            in_array('extra', $allowed_fields),
            false
        );
        $table->add_field(
            'appointment_coupon',
            'coupon',
            'coupon',
            'text',
            '',
            ['sub_type' => 'positive_integer'],
            '',
            false,
            in_array('coupon', $allowed_fields),
            false
        );
        $table->add_field(
            'appointment_payment_method',
            'payment_method',
            __('Payment method', 'webba-booking-lite'),
            'text',
            '',
            null,
            '',
            false,
            in_array('payment_method', $allowed_fields),
            false
        );
        $table->add_field(
            'appointment_moment_price',
            'moment_price',
            __('Price', 'webba-booking-lite'),
            'text',
            '',
            null,
            '',
            false,
            in_array('moment_price', $allowed_fields),
            true
        );

        $table->add_field(
            'appointment_user_ip',
            'user_ip',
            __('User IP', 'webba-booking-lite'),
            'text',
            '',
            true,
            null,
            '',
            false,
            in_array('ip', $allowed_fields)
        );
        $table->add_field(
            'appointment_status',
            'status',
            __('Status', 'webba-booking-lite'),
            'select',
            '',
            [
                'items' => WBK_Model_Utils::get_booking_status_list(),
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
            __('Duration', 'webba-booking-lite'),
            'text',
            '',
            ['sub_type' => 'positive_integer'],
            '',
            false,
            true,
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
            ['sub_type' => 'positive_integer'],
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
            ['sub_type' => 'positive_integer'],
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

        $table = WbkData()->models->add(
            $table,
            $db_prefix . 'wbk_cancelled_appointments'
        );

        date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
        date_default_timezone_set('UTC');

        $services = WBK_Model_Utils::get_services(true);

        // Google calendars
        $table = new WbkData\Model($db_prefix . 'wbk_gg_calendars');
        $table->set_duplicatable(false);
        $table->set_single_item_name(
            __('Google calendar', 'webba-booking-lite')
        );
        $table->set_multiple_item_name(
            __('Google calendars', 'webba-booking-lite')
        );
        $table->sections['general'] = __('General', 'webba-booking-lite');
        $table->sections['advanced'] = __('Advanced', 'webba-booking-lite');

        $tooltip = __(
            'Enter a name to identify the calendar.',
            'webba-booking-lite'
        );
        $table->add_field(
            'calendar_name',
            'name',
            __('Calendar name (internal use only)', 'webba-booking-lite'),
            'text',
            'general',
            ['tooltip' => $tooltip]
        );

        $tooltip = '';
        $table->add_field(
            'calendar_easy_auth',
            'easy_auth',
            __('Automatic authorization (recommended)', 'webba-booking-lite'),
            'checkbox',
            'advanced',
            [
                'yes' => __('Enabled', 'webba-booking-lite'),
                'tooltip' => __(
                    'Enable easy authorization for this calendar (recommended)',
                    'webba-booking-lite'
                ),
            ],
            'yes',
            true,
            false,
            false
        );

        $table->add_field(
            'calendar_user_id',
            'user_id',
            __('User', 'webba-booking-lite'),
            'select',
            'advanced',
            [
                'tooltip' => $tooltip,
                'items' => [],
                'options' => 'backend',
            ],
            0,
            true,
            true,
            false
        );

        $tooltip = __(
            'Select calendar from the auhtorized account.',
            'webba-booking-lite'
        );
        $table->add_field(
            'calendar_ggid',
            'ggid',
            __('Calendar in Google Account', 'webba-booking-lite'),
            'select',
            'general',
            [
                'tooltip' => $tooltip,
                'enable' => [
                    'endpoint' => 'get-gg-auth-data',
                    'data' => [
                        'calendar_id' => 'id',
                    ],
                    'conditions' => [
                        [
                            'operator' => '=',
                            'value' => true,
                            'field' => 'isAuthenticated',
                        ],
                    ],
                ],
                'hide' => [['id', '>', '0']],
                'options' => 'backend',
            ],
            '',
            true,
            true,
            false
        );

        $tooltip = __(
            'Choose the calendar connection mode',
            'webba-booking-lite'
        );
        $table->add_field(
            'calendar_mode',
            'mode',
            __('Mode', 'webba-booking-lite'),
            'select',
            'general',
            [
                'tooltip' => $tooltip,
                'items' => WBK_Model_Utils::get_gg_calendar_modes(),
                'options' => WBK_Model_Utils::get_gg_calendar_modes(),
                'default_value' => 'One-way',
                'description' => __(
                    '<strong>One-way (import):</strong> This mode will import all unavailable times from your Google Calendar to Webba Calendar. No meeting data is imported, only the time slots.<br><br>
                    <strong>One-way (export):</strong> This mode will automatically add Webba bookings to your Google Calendar, but will not check availability of your Google calendar (risk of double-booking).<br><br>
                    <strong>Two-ways (recommended):</strong> This mode will both import unavailable times from Google Calendar to Webba Calendar and add Webba bookings to your Google Calendar.<br><br>',
                    'webba-booking-lite'
                ),
            ],
            null,
            true,
            true,
            true
        );

        $table->add_field(
            'calendar_access_token',
            'access_token',
            __('Authorization', 'webba-booking-lite'),
            'wbk_google_access_token',
            null,
            [],
            'general',
            false,
            true,
            false
        );

        $tooltip = __(
            'Enable this option to automatically add Google Meet video conferencing to calendar events.',
            'webba-booking-lite'
        );

        $table->sync_structure();
        WbkData()->models->add($table, $db_prefix . 'wbk_gg_calendars');

        // Coupons
        $table = new WbkData\Model($db_prefix . 'wbk_coupons');
        $table->set_single_item_name(__('Coupon', 'webba-booking-lite'));
        $table->set_multiple_item_name(__('Coupons', 'webba-booking-lite'));

        $tooltip = __('Enter a coupon code.', 'webba-booking-lite');
        $table->add_field(
            'coupon_name',
            'name',
            __('Coupon', 'webba-booking-lite'),
            'text',
            '',
            ['tooltip' => $tooltip]
        );

        $tooltip = __(
            'Define the time period during which the coupon will be valid.',
            'webba-booking-lite'
        );
        $table->add_field(
            'coupon_date_range',
            'date_range',
            __('Available on', 'webba-booking-lite'),
            'date_range',
            '',
            [
                'tooltip' => $tooltip,
                'time_zone' => get_option('wbk_timezone', 'UTC'),
            ],
            '',
            true,
            true,
            false
        );

        $tooltip = __(
            'Choose the service(-s) for which the coupon will be applicable.',
            'webba-booking-lite'
        );
        $table->add_field(
            'coupon_services',
            'services',
            __('Services', 'webba-booking-lite'),
            'select',
            '',
            [
                'tooltip' => $tooltip,
                'items' => WBK_Model_Utils::get_services(),
                'multiple' => true,
                'options' => 'services',
            ],
            null,
            true,
            false,
            false
        );

        $tooltip = __(
            'Specify the Usage limit for the coupon - the maximum number of times it can be applied. Leaving it blank means unlimited use.',
            'webba-booking-lite'
        );
        $table->add_field(
            'coupon_maximum',
            'maximum',
            __('Usage limit', 'webba-booking-lite'),
            'text',
            '',
            [
                'tooltip' => $tooltip,
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
            __('Used', 'webba-booking-lite'),
            'text',
            '',
            ['sub_type' => 'positive_integer'],
            '',
            false,
            true,
            false
        );

        $tooltip = __(
            'Speficy the fixed amount that will be applied as the discount.',
            'webba-booking-lite'
        );
        $table->add_field(
            'coupon_amount_fixed',
            'amount_fixed',
            __('Discount (fixed)', 'webba-booking-lite'),
            'text',
            '',
            [
                'tooltip' => $tooltip,

                'sub_type' => 'none_negative_float',
            ],
            '0',
            true,
            true,
            true
        );

        $tooltip = __(
            'Speficy the percentage that will be applied as the discount.',
            'webba-booking-lite'
        );
        $table->add_field(
            'coupon_amount_percentage',
            'amount_percentage',
            __('Discount (percentage)', 'webba-booking-lite'),
            'text',
            '',
            [
                'tooltip' => $tooltip,
                'sub_type' => 'none_negative_float',
            ],
            '100',
            true,
            true,
            true
        );
        $table->sync_structure();
        WbkData()->models->add($table, $db_prefix . 'wbk_coupons');

        // Pricing rules
        $table = new WbkData\Model($db_prefix . 'wbk_pricing_rules');
        $table->set_single_item_name(__('Pricing rule', 'webba-booking-lite'));
        $table->set_multiple_item_name(
            __('Pricing rules', 'webba-booking-lite')
        );
        $tooltip = __(
            'Enter a name to identify the pricing rule.',
            'webba-booking-lite'
        );
        $table->add_field(
            'pricing_rule_name',
            'name',
            __('Name', 'webba-booking-lite'),
            'text',
            '',
            ['tooltip' => $tooltip]
        );

        $tooltip = __(
            'Specify the order for applying pricing rules to a service. This matters when you apply multiple rules for the same service.',
            'webba-booking-lite'
        );
        $table->add_field(
            'pricing_rule_priority',
            'priority',
            __('Priority', 'webba-booking-lite'),
            'select',
            '',
            [
                'tooltip' => $tooltip,
                'options' => [
                    '1' => __('low', 'webba-booking-lite'),
                    '10' => __('medium', 'webba-booking-lite'),
                    '20' => __('high', 'webba-booking-lite'),
                ],
            ],
            1,
            true,
            true,
            true
        );

        $tooltip =
            'Select the <a rel="noopener" target="_blank" href="https://webba-booking.com/documentation/payment/pricing-rules/">type of pricing rule</a>.';

        $table->add_field(
            'pricing_rule_type',
            'type',
            __('Type', 'webba-booking-lite'),
            'select',
            '',
            [
                'tooltip' => $tooltip,
                'options' => [
                    'date_range' => __(
                        'Price for date range',
                        'webba-booking-lite'
                    ),
                    'early_booking' => __(
                        'Price for early booking',
                        'webba-booking-lite'
                    ),
                    'custom_field' => __(
                        'Price based on custom field value',
                        'webba-booking-lite'
                    ),
                    'day_of_week_and_time' => __(
                        'Price for day of week and time range',
                        'webba-booking-lite'
                    ),
                    'number_of_seats' => __(
                        'Price based on number of seats booked',
                        'webba-booking-lite'
                    ),
                    'number_of_timeslots' => __(
                        'Price based on number of timeslots booked',
                        'webba-booking-lite'
                    ),
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
            __('Date range', 'webba-booking-lite'),
            'date_range',
            '',
            ['time_zone' => get_option('wbk_timezone', 'UTC')],
            '',
            true,
            false
        );
        $table->add_field(
            'pricing_rule_days_number',
            'days_number',
            __(
                'Minimum number of days before the booked date',
                'webba-booking-lite'
            ),
            'text',
            '',
            ['sub_type' => 'positive_integer'],
            '',
            true,
            false
        );
        $table->add_field(
            'pricing_rule_custom_field_id',
            'custom_field_id',
            __('Custom field ID', 'webba-booking-lite'),
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
            __('Operator', 'webba-booking-lite'),
            'radio',
            '',
            [
                'options' => [
                    'equals' => __('equals', 'webba-booking-lite'),
                    'more_than' => __('more than', 'webba-booking-lite'),
                    'less_than' => __('less than', 'webba-booking-lite'),
                ],
            ],
            'equals',
            true,
            false
        );
        $table->add_field(
            'pricing_rule_custom_field_value',
            'custom_field_value',
            __('Custom field value', 'webba-booking-lite'),
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
            __('Operator', 'webba-booking-lite'),
            'radio',
            '',
            [
                'options' => [
                    'equals' => __('equals', 'webba-booking-lite'),
                    'more_than' => __('more than', 'webba-booking-lite'),
                    'less_than' => __('less than', 'webba-booking-lite'),
                ],
            ],
            'equals',
            true,
            false
        );
        $table->add_field(
            'pricing_rule_number_of_seats_value',
            'number_of_seats_value',
            __('Number of seats', 'webba-booking-lite'),
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
            __('Operator', 'webba-booking-lite'),
            'radio',
            '',
            [
                'options' => [
                    'equals' => __('equals', 'webba-booking-lite'),
                    'more_than' => __('more than', 'webba-booking-lite'),
                    'less_than' => __('less than', 'webba-booking-lite'),
                ],
            ],
            'equals',
            true,
            false
        );
        $table->add_field(
            'pricing_rule_number_of_timeslots_value',
            'number_of_timeslots_value',
            __('Number of timeslots', 'webba-booking-lite'),
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
            __('Only timeslots in the same service', 'webba-booking-lite'),
            'checkbox',
            '',
            ['yes' => __('Yes', 'webba-booking-lite'), 'tooltip' => $tooltip],
            '',
            true,
            false,
            false
        );

        $day_time_default = [];

        $table->add_field(
            'pricing_rule_day_time',
            'day_time',
            __('Day of week and time range', 'webba-booking-lite'),
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
            __('Action', 'webba-booking-lite'),
            'radio',
            '',
            [
                'options' => [
                    'increase' => __('increase', 'webba-booking-lite'),
                    'reduce' => __('reduce', 'webba-booking-lite'),
                    'replace' => __('replace', 'webba-booking-lite'),
                ],
            ],
            'increase'
        );

        $tooltip = __(
            'Set the value by which the price will be increased, decreased, or replaced.',
            'webba-booking-lite'
        );
        $table->add_field(
            'pricing_rule_amount',
            'amount',
            __('Amount', 'webba-booking-lite'),
            'text',
            '',
            [
                'tooltip' => $tooltip,
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
            __('Fixed / percent', 'webba-booking-lite'),
            'radio',
            '',
            [
                'options' => [
                    'fixed' => __('fixed', 'webba-booking-lite'),
                    'percent' => __('percent', 'webba-booking-lite'),
                ],
            ],
            'fixed'
        );
        $table->add_field(
            'pricing_rule_multiply_amount',
            'multiply_amount',
            __('Multiply amount by the field value', 'webba-booking-lite'),
            'checkbox',
            '',
            ['yes' => __('Yes', 'webba-booking-lite')],
            '',
            true,
            false,
            false
        );

        $table->add_field(
            'pricing_rule_related_to_seats_number',
            'related_to_seats_number',
            __(
                'The field is related to the number of seats booked',
                'webba-booking-lite'
            ),
            'checkbox',
            '',
            ['yes' => __('Yes', 'webba-booking-lite')],
            '',
            true,
            false,
            false
        );

        $table->add_field(
            'pricing_rule_is_for_entire_order',
            'is_for_entire_order',
            __(
                'Apply the pricing rule to the entire order instead of individual time slots.',
                'webba-booking-lite'
            ),
            'checkbox',
            '',
            ['yes' => __('Yes', 'webba-booking-lite')],
            '',
            true,
            false,
            false
        );

        $table = WbkData()->models->add(
            $table,
            $db_prefix . 'wbk_pricing_rules'
        );

        $table->fields
            ->get_element_at('pricing_rule_date_range')
            ->set_dependency([['type', '=', 'date_range']]);
        $table->fields
            ->get_element_at('pricing_rule_days_number')
            ->set_dependency([['type', '=', 'early_booking']]);
        $table->fields
            ->get_element_at('pricing_rule_custom_field_id')
            ->set_dependency([['type', '=', 'custom_field']]);
        $table->fields
            ->get_element_at('pricing_rule_custom_field_operator')
            ->set_dependency([['type', '=', 'custom_field']]);
        $table->fields
            ->get_element_at('pricing_rule_custom_field_value')
            ->set_dependency([['type', '=', 'custom_field']]);
        $table->fields
            ->get_element_at('pricing_rule_number_of_seats_operator')
            ->set_dependency([['type', '=', 'number_of_seats']]);
        $table->fields
            ->get_element_at('pricing_rule_number_of_seats_value')
            ->set_dependency([['type', '=', 'number_of_seats']]);
        $table->fields
            ->get_element_at('pricing_rule_number_of_timeslots_operator')
            ->set_dependency([['type', '=', 'number_of_timeslots']]);
        $table->fields
            ->get_element_at('pricing_rule_number_of_timeslots_value')
            ->set_dependency([['type', '=', 'number_of_timeslots']]);
        $table->fields
            ->get_element_at('pricing_rule_only_same_service')
            ->set_dependency([['type', '=', 'number_of_timeslots']]);
        $table->fields
            ->get_element_at('pricing_rule_multiply_amount')
            ->set_dependency([['type', '=', 'custom_field']]);
        $table->fields
            ->get_element_at('pricing_rule_related_to_seats_number')
            ->set_dependency([['type', '=', 'custom_field']]);
        $table->fields
            ->get_element_at('pricing_rule_day_time')
            ->set_dependency([['type', '=', 'day_of_week_and_time']]);
        $table->fields
            ->get_element_at('pricing_rule_fixed_percent')
            ->set_dependency([
                ['action', '!=', 'replace'],
                ['action', '!=', 'multiply'],
            ]);

        $table->sync_structure();

        // Forms
        $table = new Model($db_prefix . 'wbk_forms');
        $table->set_single_item_name(__('Form', 'webba-booking-lite'));
        $table->set_multiple_item_name(__('Forms', 'webba-booking-lite'));
        $table->add_field(
            'name',
            'name',
            __('Name', 'webba-booking-lite'),
            'text',
            '',
            [],
            '',
            true,
            true,
            false
        );
        $table->add_field(
            'fields',
            'fields',
            __('Fields', 'webba-booking-lite'),
            'text',
            '',
            [],
            '',
            true,
            false,
            false
        );

        $table->sync_structure();
        $table = WbkData()->models->add($table, $db_prefix . 'wbk_forms');
    }
}
?>
