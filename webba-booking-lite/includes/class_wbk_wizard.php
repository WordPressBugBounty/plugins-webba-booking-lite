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

        if (
            !isset($_POST['service_name']) ||
            !isset($_POST['duration']) ||
            !isset($_POST['range_start']) ||
            !isset($_POST['range_end']) ||
            !isset($_POST['allow_multiple_slots']) ||
            !isset($_POST['allow_multiple_services']) ||
            !isset($_POST['quantity']) ||
            !isset($_POST['dow'])
        ) {
            echo json_encode(['status' => 'fail', 'reason' => 'wrong input']);
            wp_die();
            return;
        }
        $more_services = false;
        if (isset($_POST['more_services'])) {
            $more_services = true;
        }

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
        $duration = esc_html(sanitize_text_field(trim($_POST['duration'])));
        if (!WBK_Validator::check_integer($duration, 5, 1440)) {
            echo json_encode(['status' => 'fail', 'reason' => 'duration']);
            wp_die();
            return;
        }
        $range_start = esc_html(
            sanitize_text_field(trim($_POST['range_start'] * 60))
        );
        if (!WBK_Validator::check_integer($duration, 0, 86100)) {
            echo json_encode([
                'status' => 'fail',
                'reason' => 'wrong start time',
            ]);
            wp_die();
            return;
        }
        $range_end = esc_html(
            sanitize_text_field(trim($_POST['range_end'] * 60))
        );
        if (!WBK_Validator::check_integer($range_end, 0, 86400)) {
            echo json_encode([
                'status' => 'fail',
                'reason' => 'wrong end time',
            ]);
            wp_die();
            return;
        }
        $allow_multiple_slots = esc_html(
            sanitize_text_field(trim($_POST['allow_multiple_slots']))
        );
        if ($allow_multiple_slots != 'yes' && $allow_multiple_slots != 'no') {
            echo json_encode([
                'status' => 'fail',
                'reason' => 'wrong multiple slots',
            ]);
            wp_die();
            return;
        }
        $allow_multiple_services = esc_html(
            sanitize_text_field(trim($_POST['allow_multiple_services']))
        );
        if (
            $allow_multiple_services != 'yes' &&
            $allow_multiple_services != 'no'
        ) {
            echo json_encode([
                'status' => 'fail',
                'reason' => 'wrong multiple services',
            ]);
            wp_die();
            return;
        }
        $quantity = esc_html(sanitize_text_field(trim($_POST['quantity'])));
        if (!WBK_Validator::check_integer($quantity, 1, 10000)) {
            echo json_encode([
                'status' => 'fail',
                'reason' => 'wrong quantity',
            ]);
            wp_die();
            return;
        }

        // $dows = esc_html( sanitize_text_field(  $_POST['dow'] ) );
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

        $service = new WBK_Service();

        $service->set('name', $service_name);
        $service->set('email', get_option('admin_email', ''));
        $service->set('priority', '0');
        $service->set('form', '0');
        $dow_availability = '[ ' . implode(',', $dows_result) . ']';

        $service->set('business_hours', $dow_availability);
        $service->set('min_quantity', '1');
        $service->set('quantity', $quantity);
        $service->set('prepare_time', '0');
        $service->set('duration', $duration);
        $service->set('interval_between', '0');
        $service->set('step', $duration);
        $service->set('notification_template', '0');
        $service->set('reminder_template', '0');
        $service->set('invoice_template', '0');
        $service->set('booking_changed_template', '0');
        $service->set('approval_template', '0');

        $service->set('price', '0');
        $service->set('service_fee', '0');

        $service_id = $service->save();

        if ($allow_multiple_slots == 'yes') {
            update_option('wbk_multi_booking', 'enabled');
        }

        $shortcode = '';
        if ($allow_multiple_services == 'yes') {
            $shortcode = '[webbabooking multiservice=yes]';
            update_option('wbk_multi_booking', 'enabled');
        } else {
            if ($more_services) {
                $shortcode = '[webbabooking]';
            } else {
                $shortcode = '[webbabooking service=' . $service_id . ']';
            }
        }
        echo json_encode(['status' => 'success', 'shortcode' => $shortcode]);
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
