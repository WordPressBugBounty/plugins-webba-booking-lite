<?php
if (!defined("ABSPATH")) {
    exit();
}

/**
 * Blank Zapier stub for Free / non-Pro plans.
 */
class WBK_Zapier
{
    public function __construct() {}

    public static function is_available(): bool
    {
        return false;
    }

    public static function is_enabled(): bool
    {
        return false;
    }

    public static function validate_webhook_url($url)
    {
        return new WP_Error(
            "wbk_zapier_unavailable",
            __("Zapier integration requires a Pro plan.", "webba-booking-lite"),
        );
    }

    public static function get_configured_webhook_url(): string
    {
        return "";
    }

    public static function remember_booking_state($booking_id): void {}

    public static function enqueue_event($event_type, $booking_id, $extra = [])
    {
        return false;
    }

    public static function build_payload($event_type, $booking_id, $extra = [])
    {
        return null;
    }

    public static function send_test_event()
    {
        return new WP_Error(
            "wbk_zapier_unavailable",
            __("Zapier integration requires a Pro plan.", "webba-booking-lite"),
        );
    }

    public static function process_queue($limit = 10)
    {
        return 0;
    }

    public static function cleanup_old_deliveries() {}

    public static function get_last_delivery_summary(): string
    {
        return __("Zapier integration requires a Pro plan.", "webba-booking-lite");
    }
}
