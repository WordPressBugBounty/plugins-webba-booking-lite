<?php

if ( !defined( 'ABSPATH' ) ) {
    exit;
}
class WBK_Email_Processor {
    public static function send( $bookings, $trigger, $ignore_off_state = false ) {
        if ( !is_array( $bookings ) || count( $bookings ) == 0 ) {
            return;
        }
        $booking = new WBK_Booking($bookings[0]);
        if ( !$booking->is_loaded() ) {
            return;
        }
        WBK_Model_Utils::switch_locale_by_booking_id( $bookings[0] );
        $service = new WBK_Service($booking->get_service());
        if ( !$service->is_loaded() ) {
            return;
        }
        $headers[] = 'From: ' . stripslashes( get_option( 'wbk_from_name' ) ) . ' <' . get_option( 'wbk_from_email' ) . '>';
        $attachments = [];
        $queue = array();
        $email_templates = WBK_Model_Utils::get_email_templates( true, $trigger, $booking->get_service() );
        foreach ( $email_templates as $id => $name ) {
            $et = new WBK_Email_Template($id);
            if ( !$et->is_loaded() ) {
                continue;
            }
            $message = $et->get( 'template' );
            $subject = $et->get( 'subject' );
            if ( function_exists( 'pll__' ) ) {
                $subject = pll__( $subject );
                $message = pll__( $message );
            }
            $subject = apply_filters(
                'wpml_translate_single_string',
                $subject,
                'webba-booking-lite',
                'Email template subject ' . $id
            );
            $message = apply_filters(
                'wpml_translate_single_string',
                $message,
                'webba-booking-lite',
                'Email template message body ' . $id
            );
            $message = WBK_Placeholder_Processor::process( $message, $bookings );
            $subject = WBK_Placeholder_Processor::process( $subject, $bookings );
            if ( $trigger == 'admin_reminder' ) {
                $message = WBK_Placeholder_Processor::process_agenda_placehoder( $message, $bookings );
            }
            $recipients = json_decode( $et->get( 'recipients' ) );
            if ( !$recipients || !is_array( $recipients ) ) {
                continue;
            }
            foreach ( $recipients as $recipient ) {
                $attachments = [];
                if ( get_option( 'wbk_allow_attachemnt', 'no' ) == 'yes' && $recipient == 'admin' ) {
                    $attachment = $booking->get( 'attachment' );
                    if ( $attachment == '' ) {
                        $attachment = [];
                    } else {
                        $attachment = json_decode( $attachment );
                    }
                    $attachments = array_merge( $attachments, $attachment );
                }
                if ( $recipient == 'admin' ) {
                    $email = $service->get( 'email' );
                } elseif ( $recipient == 'customer' || $recipient == 'group' ) {
                    $email = $booking->get( 'email' );
                }
                $queue_item = array(
                    'address' => $email,
                    'message' => $message,
                    'subject' => $subject,
                );
                if ( count( $attachments ) > 0 ) {
                    $queue_item['attachments'] = $attachments;
                }
                $queue[] = $queue_item;
            }
        }
        foreach ( $queue as $notification ) {
            if ( WBK_Validator::check_string_size( $notification['message'], 1, 50000 ) && WBK_Validator::check_string_size( $notification['subject'], 1, 200 ) ) {
                add_filter( 'wp_mail_content_type', 'wbk_wp_mail_content_type' );
                if ( isset( $notification['attachments'] ) && count( $attachments ) > 0 ) {
                    wp_mail(
                        $notification['address'],
                        $notification['subject'],
                        $notification['message'],
                        $headers,
                        $attachments
                    );
                } else {
                    wp_mail(
                        $notification['address'],
                        $notification['subject'],
                        $notification['message'],
                        $headers
                    );
                }
                remove_filter( 'wp_mail_content_type', 'wbk_wp_mail_content_type' );
            }
        }
    }

    public static function arrival_email_send_or_schedule( $booking_id ) {
        $booking = new WBK_Booking($booking_id);
        if ( !$booking->is_loaded() ) {
            return;
        }
        $delay = trim( get_option( 'wbk_email_customer_arrived_delay', '' ) );
        if ( $delay == '' || intval( $delay ) == 0 ) {
            self::send( [$booking_id], 'booking_finished' );
        } else {
            $delay = time() + $delay * 60 * 60;
            $booking->set( 'arrival_email_time', $delay );
            $booking->save();
        }
    }

    public static function send_late_notifications( $type = 'arrival' ) {
        $booking_ids = WBK_Model_Utils::get_bookings_to_send_arrival_email();
        foreach ( $booking_ids as $booking_id ) {
            $booking = new WBK_Booking($booking_id);
            if ( !$booking->is_loaded() ) {
                return;
            }
            $booking->set( 'arrival_email_time', '4863950676' );
            $booking->save();
            self::send( [$booking_id], 'booking_finished' );
        }
    }

    /**
     * Send test emails
     *
     * @param array $bookings
     * @param integer $template_id
     * @param string $email
     * @return void
     */
    public static function send_test( array $bookings, int $template_id, string $email ) : void {
        if ( !is_array( $bookings ) || count( $bookings ) == 0 ) {
            return;
        }
        $booking = new WBK_Booking($bookings[0]);
        if ( !$booking->is_loaded() ) {
            return;
        }
        $template = new WBK_Email_Template($template_id);
        if ( !$template->is_loaded() ) {
            return;
        }
        $headers[] = 'From: ' . stripslashes( get_option( 'wbk_from_name' ) ) . ' <' . get_option( 'wbk_from_email' ) . '>';
        $attachments = [];
        $queue = [];
        $message = $template->get( 'template' );
        $subject = $template->get( 'subject' );
        if ( function_exists( 'pll__' ) ) {
            $subject = pll__( $subject );
            $message = pll__( $message );
        }
        $subject = apply_filters(
            'wpml_translate_single_string',
            $subject,
            'webba-booking-lite',
            'Email template subject ' . $template->get_id()
        );
        $message = apply_filters(
            'wpml_translate_single_string',
            $message,
            'webba-booking-lite',
            'Email template message body ' . $template->get_id()
        );
        $message = WBK_Placeholder_Processor::process( $message, $bookings );
        $subject = WBK_Placeholder_Processor::process( $subject, $bookings );
        if ( $template->get( 'trigger' ) == 'admin_reminder' ) {
            $message = WBK_Placeholder_Processor::process_agenda_placehoder( $message, $bookings );
        }
        $recipients = json_decode( $template->get( 'recipients' ) );
        foreach ( $recipients as $recipient ) {
            $attachments = [];
            if ( $recipient == 'admin' ) {
            } elseif ( $recipient == 'customer' || $recipient == 'group' ) {
            }
            $pdf_attachement = strip_tags( $template->get( 'pdf_attachment' ) );
            if ( $pdf_attachement != '' ) {
                if ( function_exists( 'pll__' ) ) {
                    $pdf_attachement = pll__( $pdf_attachement );
                }
                $pdf_attachement = apply_filters(
                    'wpml_translate_single_string',
                    $pdf_attachement,
                    'webba-booking-lite',
                    'Email template pdf attachment ' . $template->get_id()
                );
                $pdf_file = WBK_Pdf_Processor::process( $pdf_attachement, $bookings );
                if ( $pdf_file != false ) {
                    $attachments[] = $pdf_file;
                }
            }
            $queue_item = array(
                'address' => $email,
                'message' => $message,
                'subject' => $subject,
            );
            if ( count( $attachments ) > 0 ) {
                $queue_item['attachments'] = $attachments;
            }
            $queue[] = $queue_item;
        }
        foreach ( $queue as $notification ) {
            if ( WBK_Validator::check_string_size( $notification['message'], 1, 50000 ) && WBK_Validator::check_string_size( $notification['subject'], 1, 200 ) ) {
                add_filter( 'wp_mail_content_type', 'wbk_wp_mail_content_type' );
                if ( isset( $notification['attachments'] ) && count( $attachments ) > 0 ) {
                    wp_mail(
                        $notification['address'],
                        $notification['subject'],
                        $notification['message'],
                        $headers,
                        $attachments
                    );
                } else {
                    wp_mail(
                        $notification['address'],
                        $notification['subject'],
                        $notification['message'],
                        $headers
                    );
                }
                remove_filter( 'wp_mail_content_type', 'wbk_wp_mail_content_type' );
            }
        }
    }

}

function wbk_wp_mail_content_type() {
    return 'text/html';
}
