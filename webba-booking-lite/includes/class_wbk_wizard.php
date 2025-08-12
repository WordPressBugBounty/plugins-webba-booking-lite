<?php
if (!defined('ABSPATH')) {
    exit();
}

class WBK_Wizard
{
    public function __construct()
    {
        add_action(
            'admin_enqueue_scripts',
            [$this, 'admin_enqueue_scripts'],
            20
        );
        add_action('wp_ajax_wbk_wizard_initial_setup', [
            $this,
            'wbk_wizard_initial_setup',
        ]);
        add_action('wp_ajax_wbk_wizard_final_setup', [
            $this,
            'wbk_wizard_final_setup',
        ]);
    }
    public function wbk_wizard_initial_setup()
    {
        if (!wp_verify_nonce($_POST['nonce'], 'wbkb_nonce')) {
            echo json_encode([
                'status' => 'fail',
                'reason' => 'too many requests',
            ]);
            wp_die();
            return;
        }

        // Check required fields
        $required_fields = [
            'email',
            'timezone',
            'currency',
            'service_name',
            'service_description',
            'service_price',
            'service_duration',
            'service_interval',
            'service_buffer',
            'service_advance',
            'service_min_people',
            'service_max_people',
            'range_start',
            'range_end',
            'dow',
        ];

        foreach ($required_fields as $field) {
            if (!isset($_POST[$field])) {
                echo json_encode([
                    'status' => 'fail',
                    'reason' => 'missing field: ' . $field,
                ]);
                wp_die();
                return;
            }
        }

        // Validate and sanitize input
        $service_name = esc_html(
            sanitize_text_field(trim($_POST['service_name']))
        );
        if ($service_name == '') {
            echo json_encode([
                'status' => 'fail',
                'reason' => 'wrong service name',
            ]);
            wp_die();
            return;
        }

        $duration = intval($_POST['service_duration']);
        if (!WBK_Validator::check_integer($duration, 5, 1440)) {
            echo json_encode(['status' => 'fail', 'reason' => 'duration']);
            wp_die();
            return;
        }

        $range_start = intval($_POST['range_start']) * 60;
        if (!WBK_Validator::check_integer($range_start, 0, 86100)) {
            echo json_encode([
                'status' => 'fail',
                'reason' => 'wrong start time',
            ]);
            wp_die();
            return;
        }

        $range_end = intval($_POST['range_end']) * 60;
        if (!WBK_Validator::check_integer($range_end, 0, 86400)) {
            echo json_encode([
                'status' => 'fail',
                'reason' => 'wrong end time',
            ]);
            wp_die();
            return;
        }

        $min_people = intval($_POST['service_min_people']);
        $max_people = intval($_POST['service_max_people']);
        if (
            !WBK_Validator::check_integer($min_people, 1, 10000) ||
            !WBK_Validator::check_integer($max_people, 1, 10000)
        ) {
            echo json_encode([
                'status' => 'fail',
                'reason' => 'wrong quantity',
            ]);
            wp_die();
            return;
        }

        // Process business hours
        $dows_result = [];
        foreach ($_POST['dow'] as $dow) {
            if (!WBK_Validator::check_integer($dow, 1, 7)) {
                echo json_encode([
                    'status' => 'fail',
                    'reason' => 'wrong day of week',
                ]);
                wp_die();
                return;
            } else {
                $dows_result[] =
                    '{"start":"' .
                    $range_start .
                    '","end":"' .
                    $range_end .
                    '","day_of_week":"' .
                    $dow .
                    '","status":"active"}';
            }
        }

        // Create service
        $service = new WBK_Service();

        // Basic info
        $service->set('name', $service_name);
        $service->set(
            'description',
            sanitize_text_field($_POST['service_description'])
        );
        $service->set('email', sanitize_email($_POST['email']));
        $service->set('priority', '0');
        $service->set('form', '0');

        // Business hours
        $dow_availability = '[ ' . implode(',', $dows_result) . ']';
        $service->set('business_hours', $dow_availability);

        // Service settings
        $service->set('min_quantity', $min_people);
        $service->set('quantity', $max_people);

        $service->set('duration', $duration);
        $service->set('step', intval($_POST['service_interval']));
        $service->set('interval_between', intval($_POST['service_buffer']));

        $service->set('price', floatval($_POST['service_price']));
        $service->set('service_fee', '0');

        // Templates
        $service->set('notification_template', '0');
        $service->set('reminder_template', '0');
        $service->set('invoice_template', '0');
        $service->set('booking_changed_template', '0');
        $service->set('approval_template', '0');
        $service->set('prepare_time', intval($_POST['service_advance']));

        // Save service
        $service_id = $service->save();

        // Save global settings
        update_option('wbk_timezone', sanitize_text_field($_POST['timezone']));
        update_option(
            'wbk_payment_price_format',
            sanitize_text_field($_POST['currency_symbol'] . '#price')
        );

        // Process closed dates
        if (isset($_POST['closed_dates'])) {
            $closed_dates = json_decode(
                stripslashes($_POST['closed_dates']),
                true
            );
            $holiday_dates = [];

            foreach ($closed_dates as $range) {
                $start = DateTime::createFromFormat('m/d/Y', $range['start']);
                $end = DateTime::createFromFormat('m/d/Y', $range['end']);
                $interval = new DateInterval('P1D');
                $date_range = new DatePeriod(
                    $start,
                    $interval,
                    $end->modify('+1 day')
                );

                foreach ($date_range as $date) {
                    $holiday_dates[] = $date->format('Y-m-d');
                }
            }

            update_option('wbk_holydays', implode(',', $holiday_dates));
        }

        // Return shortcode
        echo json_encode([
            'status' => 'success',
            'shortcode' => '[webbabooking]',
        ]);
        WBK_Mixpanel::track_event('service created', []);
        WBK_Mixpanel::track_event('setup wizard basic setup complete', []);
        wp_die();
        return;
    }

    public function wbk_wizard_final_setup()
    {
        if (!wp_verify_nonce($_POST['nonce'], 'wbkb_nonce')) {
            echo json_encode([
                'status' => 'fail',
                'reason' => 'too many requests',
            ]);
            wp_die();
            return;
        }

        if (!isset($_POST['final_action'])) {
            echo json_encode([
                'status' => 'fail',
                'reason' => 'wrong finalize',
            ]);
            wp_die();
            return;
        }

        if (
            $_POST['final_action'] != 'setup_advanced' &&
            $_POST['final_action'] != 'finalize'
        ) {
            echo json_encode([
                'status' => 'fail',
                'reason' => 'wrong finalize',
            ]);
            wp_die();
            return;
        }

        if (isset($_POST['enable_emails'])) {
            update_option('wbk_email_customer_book_status', 'true');
            update_option('wbk_email_admin_book_status', 'true');
        } else {
            update_option('wbk_email_customer_book_status', '');
            update_option('wbk_email_admin_book_status', '');
        }

        if (isset($_POST['enable_sms'])) {
            update_option('wbk_sms_setup_required', 'true');
        } else {
            update_option('wbk_sms_setup_required', 'false');
        }

        if (isset($_POST['enable_payments'])) {
            update_option('wbk_payments_setup_required', 'true');
        } else {
            update_option('wbk_payments_setup_required', 'false');
        }

        if (isset($_POST['enable_google'])) {
            update_option('wbk_google_setup_required', 'true');
        } else {
            update_option('wbk_google_setup_required', 'false');
        }

        $finalize = sanitize_text_field($_POST['final_action']);

        $url = esc_url(get_admin_url() . 'admin.php?page=wbk-services');

        echo json_encode(['status' => 'success', 'url' => $url]);
        WBK_Mixpanel::track_event('setup wizard full setup complete', []);
        wp_die();
        return;
    }

    public function admin_enqueue_scripts()
    {
        wp_enqueue_script(
            'wbk-wizard',
            WP_WEBBA_BOOKING__PLUGIN_URL . '/public/js/wbk-wizard.js',
            [
                'jquery',
                'jquery-ui-slider',
                'jquery-touch-punch',
                'jquery-ui-draggable',
                'wbk-validator',
            ],
            WP_WEBBA_BOOKING__VERSION
        );
        $translation_array = [
            'nonce' => wp_create_nonce('wbkb_nonce'),
            'ajaxurl' => admin_url('admin-ajax.php'),
            'setup_advanced_options' => esc_html__(
                'Setup Advanced Options',
                'webba-booking-lite'
            ),
            'finish_setup_wizard' => esc_html__(
                'Finish the Setup Wizard',
                'webba-booking-lite'
            ),
            'settings_url' => esc_url(
                get_admin_url() . 'admin.php?page=wbk-options'
            ),
            'admin_url' => esc_url(get_admin_url()),
        ];
        wp_localize_script('wbk-wizard', 'wbk_wizardl10n', $translation_array);
    }
}
