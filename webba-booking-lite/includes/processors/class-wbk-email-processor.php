<?php

if ( !defined( 'ABSPATH' ) ) {
    exit;
}
class WBK_Email_Processor {
    public static function send( $bookings, $action, $ignore_off_state = false ) {
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
        switch ( $action ) {
            case 'confirmation':
                if ( get_option( 'wbk_email_customer_book_status', '' ) == 'true' || $ignore_off_state ) {
                    $message = get_option( 'wbk_email_customer_book_message' );
                    $template_id = $service->get_on_booking_template();
                    if ( $template_id != false ) {
                        $template_obj = new WBK_Email_Template($template_id);
                        $message = $template_obj->get_template();
                    }
                    $message = WBK_Placeholder_Processor::process( $message, $bookings );
                    $subject = WBK_Placeholder_Processor::process( get_option( 'wbk_email_customer_book_subject' ), $bookings );
                    $queue[] = array(
                        'address' => $booking->get( 'email' ),
                        'message' => $message,
                        'subject' => $subject,
                    );
                }
                break;
            case 'approval':
                if ( get_option( 'wbk_email_customer_approve_status', '' ) == 'true' || $ignore_off_state ) {
                    $message = get_option( 'wbk_email_customer_approve_message' );
                    $template_id = $service->get_on_approval_template();
                    if ( $template_id != false ) {
                        $template_obj = new WBK_Email_Template($template_id);
                        $message = $template_obj->get_template();
                    }
                    $message = WBK_Placeholder_Processor::process( $message, $bookings );
                    $subject = WBK_Placeholder_Processor::process( get_option( 'wbk_email_customer_approve_subject' ), $bookings );
                    $queue[] = array(
                        'address' => $booking->get( 'email' ),
                        'message' => $message,
                        'subject' => $subject,
                    );
                    if ( get_option( 'wbk_email_customer_approve_copy_status' ) == 'true' ) {
                        if ( $service->is_loaded() ) {
                            $queue[] = array(
                                'address' => $service->get( 'email' ),
                                'message' => $message,
                                'subject' => $subject,
                            );
                        }
                    }
                }
                break;
            case 'arrival':
                if ( get_option( 'wbk_email_customer_arrived_status', '' ) == 'true' ) {
                    $message = get_option( 'wbk_email_customer_arrived_message', '' );
                    $template_id = $service->get_arrived_template();
                    if ( $template_id != false ) {
                        $template_obj = new WBK_Email_Template($template_id);
                        $message = $template_obj->get_template();
                    }
                    $subject = get_option( 'wbk_email_customer_arrived_subject', '' );
                    $message = WBK_Placeholder_Processor::process( $message, $bookings );
                    $subject = WBK_Placeholder_Processor::process( $subject, $bookings );
                    $queue[] = array(
                        'address' => $booking->get( 'email' ),
                        'message' => $message,
                        'subject' => $subject,
                    );
                }
                break;
            case 'payment':
                if ( get_option( 'wbk_email_admin_paymentrcvd_status', '' ) == 'true' ) {
                    $message = get_option( 'wbk_email_admin_paymentrcvd_message' );
                    $subject = get_option( 'wbk_email_admin_paymentrcvd_subject', '' );
                    $message = WBK_Placeholder_Processor::process( $message, $bookings );
                    $subject = WBK_Placeholder_Processor::process( $subject, $bookings );
                    $queue[] = array(
                        'address' => $service->get( 'email' ),
                        'message' => $message,
                        'subject' => $subject,
                    );
                }
                if ( get_option( 'wbk_email_customer_paymentrcvd_status', '' ) == 'true' || $ignore_off_state ) {
                    $message = get_option( 'wbk_email_customer_paymentrcvd_message' );
                    $subject = get_option( 'wbk_email_customer_paymentrcvd_subject', '' );
                    $attachments = apply_filters(
                        'wbk_payment_notification_attachmets',
                        $attachments,
                        $bookings,
                        $booking->get( 'email' )
                    );
                    $message = WBK_Placeholder_Processor::process( $message, $bookings );
                    $subject = WBK_Placeholder_Processor::process( $subject, $bookings );
                    $queue[] = array(
                        'address'     => $booking->get( 'email' ),
                        'message'     => $message,
                        'subject'     => $subject,
                        'attachments' => $attachments,
                    );
                }
                break;
            case 'confirmation_members':
                if ( get_option( 'wbk_email_secondary_book_status', '' ) == 'true' || $ignore_off_state ) {
                    $member_emails = [];
                    for ($i = 1; $i <= 10; $i++) {
                        $member_email = $booking->get_custom_field_value( 'wbk-email' . $i );
                        if ( !is_null( $member_email ) ) {
                            $member_emails[] = $member_email;
                        }
                    }
                    if ( count( $member_emails ) > 0 ) {
                        $subject = WBK_Placeholder_Processor::process( get_option( 'wbk_email_secondary_book_subject' ), $bookings );
                        $message = WBK_Placeholder_Processor::process( get_option( 'wbk_email_secondary_book_message' ), $bookings );
                    }
                    foreach ( $member_emails as $member_email ) {
                        $queue[] = array(
                            'address' => $member_email,
                            'message' => $message,
                            'subject' => $subject,
                        );
                    }
                }
                break;
            case 'user_created':
                $subject = WBK_Placeholder_Processor::process( get_option( 'wbk_user_welcome_email_subject' ), $bookings );
                $message = WBK_Placeholder_Processor::process( get_option( 'wbk_user_welcome_email_body' ), $bookings );
                $queue[] = array(
                    'address' => $booking->get( 'email' ),
                    'message' => $message,
                    'subject' => $subject,
                );
                break;
            default:
                break;
        }
        foreach ( $queue as $notification ) {
            if ( WBK_Validator::check_string_size( $notification['message'], 1, 50000 ) && WBK_Validator::check_string_size( $notification['subject'], 1, 200 ) ) {
                add_filter( 'wp_mail_content_type', 'wbk_wp_mail_content_type' );
                if ( count( $attachments ) > 0 ) {
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

    public static function get_message_by_service( $service_id ) {
    }

    public static function arrival_email_send_or_schedule( $booking_id ) {
        $booking = new WBK_Booking($booking_id);
        if ( !$booking->is_loaded() ) {
            return;
        }
        $delay = trim( get_option( 'wbk_email_customer_arrived_delay', '' ) );
        if ( $delay == '' || intval( $delay ) == 0 ) {
            self::send( [$booking_id], 'arrival' );
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
            self::send( [$booking_id], 'arrival' );
        }
    }

}

function wbk_wp_mail_content_type() {
    return 'text/html';
}
