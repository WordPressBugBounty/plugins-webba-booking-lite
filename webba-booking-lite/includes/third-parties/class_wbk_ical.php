<?php
if (!defined('ABSPATH')) {
    exit;
}

use Eluceo\iCal\Domain\Entity\Calendar;
use Eluceo\iCal\Domain\Entity\Event;
use Eluceo\iCal\Domain\ValueObject\DateTime as DateTime;
use Eluceo\iCal\Domain\ValueObject\EmailAddress;
use Eluceo\iCal\Domain\ValueObject\Organizer;
use Eluceo\iCal\Domain\ValueObject\TimeSpan;
use Eluceo\iCal\Presentation\Factory\CalendarFactory;
use Eluceo\iCal\Domain\ValueObject\DateTime as ICalDateTime;

class WBK_Ical
{
    static public function generate_ical_file($booking_ids, $type = 'admin')
    {
        $events = [];
        foreach ($booking_ids as $booking_id) {
            $booking = new WBK_Booking($booking_id);
            if (!$booking->is_loaded()) {
                continue;
            }
            $service_id = $booking->get_service();
            $service = new WBK_Service($service_id);
            if (!$service->is_loaded()) {
                continue;
            }
            if ($type == 'admin') {
                $title = get_option('wbk_gg_calendar_event_title', '#customer_name');
                $description = get_option('wbk_gg_calendar_event_description', '#customer_name #customer_phone');
                $description = str_replace('{n}', "\n", $description);
            } elseif ($type == 'customer') {
                $title = get_option('wbk_gg_calendar_event_title_customer', '#service_name');
                $description = get_option('wbk_gg_calendar_event_description_customer', 'Your appointment id is #appointment_id');
                $description = str_replace('{n}', "\n", $description);
            }
            $title = WBK_Placeholder_Processor::process_placeholders($title, $booking_id);
            $description = WBK_Placeholder_Processor::process_placeholders($description, $booking_id);

            $event = new Event();

            $prev_time_zone = date_default_timezone_get();
            date_default_timezone_set(get_option('wbk_timezone', 'Europe/London'));

            $start_formated = wp_date('Y-m-d H:i:s', $booking->get_start(), new DateTimeZone(date_default_timezone_get()));
            $end_formated = wp_date('Y-m-d H:i:s', $booking->get_end(), new DateTimeZone(date_default_timezone_get()));

            $start_date = new ICalDateTime(new \DateTime($start_formated, new \DateTimeZone((get_option('wbk_timezone', 'Europe/London')))), true);
            $end_date = new ICalDateTime(new \DateTime($end_formated, new \DateTimeZone((get_option('wbk_timezone', 'Europe/London')))), true);

            date_default_timezone_set($prev_time_zone);

            $event
                ->setSummary($title)
                ->setDescription($description)
                ->setOrganizer(
                    new Organizer(
                        new EmailAddress($booking->get('email')),
                        $booking->get_name()
                    )
                )
                ->setOccurrence(
                    new TimeSpan(
                        $start_date,
                        $end_date
                    )
                );
            $events[] = $event;
        }

        $calendar = new Calendar($events);

        $componentFactory = new CalendarFactory();
        $calendarComponent = $componentFactory->createCalendar($calendar);

        $file_prefix = '';
        if ($type == 'customer') {
            $file_prefix = 'c_';
        }
        $filename = get_temp_dir() . 'calendar_' . $file_prefix . implode('_', array_values($booking_ids)) . '_' . time() . '.ics';
        file_put_contents($filename, $calendarComponent);
        return $filename;
    }

}
