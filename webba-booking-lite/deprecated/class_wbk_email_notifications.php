<?php
// webba booking email notifications class and helper functions
if (!defined('ABSPATH')) {
    exit();
}
class WBK_Email_Notifications
{

    // service_id: int
    // appointment_id: int
    public function __construct(
        $service_id,
        $appointment_id,
        $current_category = 0
    ) {

    }
    public function set_email_content_type()
    {

    }
    public function send($event, $send_single = false)
    {
    }
    public function sendMultipleNotification(
        $appointment_ids,
        $message,
        $subject,
        $recipient,
        $generate_ical = ''
    ) {
    }
    public function sendMultipleCustomerNotification($appointment_ids)
    {

    }
    public function sendMultipleAdminNotification($appointment_ids)
    {

    }
    public function sendMultipleToSecondary($appointment_ids, $data)
    {



    }
    public function sendToSecondary($data)
    {


    }
    public function sendOnApprove()
    {

    }
    public function prepareOnCancel()
    {

    }
    public function sendOnCancel()
    {

    }
    public function prepareOnCancelCustomer($by_customer = false)
    {

    }

    public function sendOnCancelCustomer()
    {

    }

    protected function get_string_between($string, $start, $end)
    {

    }
    protected function subject_placeholder_processing(
        $message,
        $appointment,
        $service
    ) {

    }
    protected function message_placeholder_processing(
        $message,
        $appointment,
        $service,
        $total_amount = null,
        $multi_token = null,
        $app_price_total = null
    ) {

    }
    public function sendSingleInvoice()
    {

    }
    public function sendMultipleCustomerInvoice($appointment_ids)
    {

    }
    public function sendSinglePaymentReceived($to)
    {

    }

    public function send_single_notification($booking_id, $message, $subject)
    {

    }

    public function sendSingleBookedManually()
    {
    }
    public function sendMultiplePaymentReceived($to, $appointment_ids)
    {

    }
    function replaceRanges($message, $appointment_ids)
    {

    }
    public function send_gg_calendar_issue_alert_to_admin($error_message = '')
    {
        if (get_option('wbk_gg_send_alerts_to_admin', 'no') != 'yes') {
            return;
        }
        $service = new WBK_Service_deprecated();
        if (!$service->setId($this->service_id)) {
            return;
        }
        if (!$service->load()) {
            return;
        }
        $headers =
            'From: ' .
            $this->from_name .
            ' <' .
            $this->from_email .
            '>' .
            "\r\n";
        add_filter('wp_mail_content_type', [$this, 'set_email_content_type']);
        wp_mail(
            $service->getEmail(),
            'Issue with the Google calendar intgration.',
            'Webba Booking plugin was unable to connect with the Google Calendar, please check the settings. Details: ' .
            $error_message,
            $headers
        );
        remove_filter('wp_mail_content_type', [
            $this,
            'set_email_content_type',
        ]);
    }
}



?>