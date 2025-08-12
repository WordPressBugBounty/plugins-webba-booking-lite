<?php
if (!defined('ABSPATH')) {
    exit();
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
    public static function generate_ical_file(
        $booking_ids,
        $type = 'admin',
        $downloadable = false
    ) {
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
                $title = get_option(
                    'wbk_gg_calendar_event_title',
                    '#customer_name'
                );
                $description = get_option(
                    'wbk_gg_calendar_event_description',
                    '#customer_name #customer_phone'
                );
                $description = str_replace('{n}', "\n", $description);
            } elseif ($type == 'customer') {
                $title = get_option(
                    'wbk_gg_calendar_event_title_customer',
                    '#service_name'
                );
                $description = get_option(
                    'wbk_gg_calendar_event_description_customer',
                    'Your appointment id is #appointment_id'
                );
                $description = str_replace('{n}', "\n", $description);
            }
            $title = WBK_Placeholder_Processor::process_placeholders(
                $title,
                $booking_id
            );
            $description = WBK_Placeholder_Processor::process_placeholders(
                $description,
                $booking_id
            );

            $event = new Event();

            $prev_time_zone = date_default_timezone_get();
            date_default_timezone_set(
                get_option('wbk_timezone', 'Europe/London')
            );

            $start_formated = wp_date(
                'Y-m-d H:i:s',
                $booking->get_start(),
                new DateTimeZone(date_default_timezone_get())
            );
            $end_formated = wp_date(
                'Y-m-d H:i:s',
                $booking->get_end(),
                new DateTimeZone(date_default_timezone_get())
            );

            $start_date = new ICalDateTime(
                new \DateTime(
                    $start_formated,
                    new \DateTimeZone(
                        get_option('wbk_timezone', 'Europe/London')
                    )
                ),
                true
            );
            $end_date = new ICalDateTime(
                new \DateTime(
                    $end_formated,
                    new \DateTimeZone(
                        get_option('wbk_timezone', 'Europe/London')
                    )
                ),
                true
            );

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
                ->setOccurrence(new TimeSpan($start_date, $end_date));
            $events[] = $event;
        }

        $calendar = new Calendar($events);

        $componentFactory = new CalendarFactory();
        $calendarComponent = $componentFactory->createCalendar($calendar);

        $file_prefix = '';
        if ($type == 'customer') {
            $file_prefix = 'c_';
        }

        if ($downloadable) {
            $upload_dir = wp_upload_dir();
            $ical_dir = $upload_dir['basedir'] . '/ical-files/';
            $ical_url = $upload_dir['baseurl'] . '/ical-files';
            if (is_ssl()) {
                $ical_url = str_replace('http://', 'https://', $ical_url);
            }

            if (!file_exists($ical_dir)) {
                wp_mkdir_p($ical_dir);
            }
            $path = $ical_dir;
            $filename =
                'calendar_' .
                $file_prefix .
                implode('_', array_values($booking_ids)) .
                '_' .
                wp_generate_password(16, false) .
                '.ics';
        } else {
            $path = get_temp_dir();
            $filename =
                $path .
                'calendar_' .
                $file_prefix .
                implode('_', array_values($booking_ids)) .
                '_' .
                time() .
                '.ics';
        }

        file_put_contents($path . $filename, $calendarComponent);

        if ($downloadable) {
            return $ical_url . '/' . basename($filename);
        }
        return $filename;
    }
}
