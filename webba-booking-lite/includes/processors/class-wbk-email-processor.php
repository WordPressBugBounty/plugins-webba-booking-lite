<?php

if ( !defined( "ABSPATH" ) ) {
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
        $filter_service = null;
        $filter_unit = null;
        $notification_service = null;
        $notification_unit = null;
        if ( $booking->get_booking_target_type() === WBK_Booking::BOOKING_TARGET_UNIT ) {
            $notification_unit = new WBK_Unit($booking->get_unit_id());
            if ( !$notification_unit->is_loaded() ) {
                return;
            }
            $filter_unit = $booking->get_unit_id();
        } elseif ( $booking->get_booking_target_type() === WBK_Booking::BOOKING_TARGET_SERVICE ) {
            $notification_service = new WBK_Service($booking->get_service());
            if ( !$notification_service->is_loaded() ) {
                return;
            }
            $filter_service = $booking->get_service();
        } else {
            return;
        }
        $headers[] = "From: " . stripslashes( get_option( "wbk_from_name" ) ) . " <" . get_option( "wbk_from_email" ) . ">";
        $attachments = [];
        $queue = [];
        $email_templates = WBK_Model_Utils::get_email_templates(
            true,
            $trigger,
            $filter_service,
            $filter_unit
        );
        foreach ( $email_templates as $id => $name ) {
            $et = new WBK_Email_Template($id);
            if ( !$et->is_loaded() ) {
                continue;
            }
            $message = $et->get( "template" );
            $subject = $et->get( "subject" );
            $message = WBK_Translation_Processor::translate_string( "webba_email_template_message_" . $id, $message );
            $subject = WBK_Translation_Processor::translate_string( "webba_email_template_subject_" . $id, $subject );
            $message = WBK_Placeholder_Processor::process( $message, $bookings );
            $subject = WBK_Placeholder_Processor::process( $subject, $bookings );
            $reminders_available = WBK_Feature_Gate::have_required_plan( "start", "only_old_users" );
            if ( !$reminders_available && ($trigger == "admin_reminder" || $trigger == "customer_reminder") ) {
                continue;
            }
            if ( $trigger == "admin_reminder" ) {
                $message = WBK_Placeholder_Processor::process_agenda_placehoder( $message, $bookings );
            }
            $recipients = json_decode( $et->get( "recipients" ) );
            if ( is_string( $recipients ) ) {
                $recipients = json_decode( $recipients );
            }
            if ( !$recipients || !is_array( $recipients ) ) {
                continue;
            }
            $recipients = array_map( "strval", $recipients );
            $group_enabled = in_array( "group", $recipients, true );
            $customer_group_handled = false;
            $invoice_pdf = "";
            if ( $et->get( "attach_invoice" ) == "yes" && WBK_Feature_Gate::have_required_plan( "premium" ) ) {
                $invoice_pdf = self::generate_pdf_invoice( $bookings );
            }
            foreach ( $recipients as $recipient ) {
                $attachments = [];
                $item_header = [];
                $recipient_addresses = [];
                if ( $recipient == "admin" ) {
                    $attachment = $booking->get( "attachment" );
                    if ( $attachment == "" ) {
                        $attachment = [];
                    } else {
                        $attachment = json_decode( $attachment );
                    }
                    $attachments = array_merge( $attachments, $attachment );
                    if ( get_option( "wbk_email_override_replyto", "true" ) == "true" ) {
                        $item_header[] = "Reply-To: " . $booking->get( "name" ) . " <" . $booking->get( "email" ) . ">";
                    }
                    $recipient_addresses[] = ( $notification_service ? $notification_service->get_email() : get_option( "wbk_super_admin_email", get_option( "admin_email" ) ) );
                } elseif ( $recipient == "customer" || $recipient == "group" ) {
                    if ( $customer_group_handled ) {
                        continue;
                    }
                    $customer_group_handled = true;
                    if ( get_option( "wbk_email_override_replyto", "true" ) == "true" ) {
                        if ( $notification_service ) {
                            $item_header[] = "Reply-To: " . $notification_service->get( "name" ) . " <" . $notification_service->get( "email" ) . ">";
                        } else {
                            $item_header[] = "Reply-To: " . $notification_unit->get( "name" ) . " <" . get_option( "wbk_super_admin_email", get_option( "admin_email" ) ) . ">";
                        }
                    }
                    $recipient_addresses[] = $booking->get( "email" );
                    if ( $group_enabled ) {
                        $recipient_addresses = array_merge( $recipient_addresses, WBK_Form_Builder_Utils::get_additional_email_field_values( $booking ) );
                    }
                    $normalized_addresses = [];
                    foreach ( $recipient_addresses as $address ) {
                        $normalized = WBK_Form_Builder_Utils::normalize_email_address( (string) $address );
                        if ( $normalized !== "" ) {
                            $normalized_addresses[] = $normalized;
                        }
                    }
                    $recipient_addresses = array_values( array_unique( $normalized_addresses ) );
                } else {
                    continue;
                }
                $pdf_attachement = WBK_Gift_Card_Design::resolve_attachment_html( $et->get( "pdf_attachment" ) );
                if ( $pdf_attachement != "" && WBK_Feature_Gate::have_required_plan( "premium" ) ) {
                    $pdf_attachement = WBK_Translation_Processor::translate_string( "webba_email_template_pdf_" . $id, $pdf_attachement );
                    $pdf_file = WBK_Pdf_Processor::process( $pdf_attachement, $bookings );
                    if ( $pdf_file != false && $pdf_file != "" ) {
                        $attachments[] = $pdf_file;
                    }
                }
                if ( $invoice_pdf !== "" ) {
                    $attachments[] = $invoice_pdf;
                }
                foreach ( $recipient_addresses as $email ) {
                    $item_attachments = $attachments;
                    if ( ($recipient == "customer" || $recipient == "group") && $trigger == "booking_paid" ) {
                        $item_attachments = apply_filters(
                            "wbk_payment_notification_attachmets",
                            $item_attachments,
                            $bookings,
                            $email
                        );
                    }
                    $queue_item = [
                        "address" => $email,
                        "message" => $message,
                        "subject" => $subject,
                        "headers" => $item_header,
                    ];
                    if ( count( $item_attachments ) > 0 ) {
                        $queue_item["attachments"] = $item_attachments;
                    }
                    $queue[] = $queue_item;
                }
            }
        }
        foreach ( $queue as $notification ) {
            if ( WBK_Validator::check_string_size( $notification["message"], 1, 50000 ) && WBK_Validator::check_string_size( $notification["subject"], 1, 200 ) ) {
                add_filter( "wp_mail_content_type", "wbk_wp_mail_content_type" );
                if ( isset( $notification["attachments"] ) && count( $notification["attachments"] ) > 0 ) {
                    wp_mail(
                        $notification["address"],
                        $notification["subject"],
                        $notification["message"],
                        array_merge( $headers, $notification["headers"] ),
                        $notification["attachments"]
                    );
                } else {
                    wp_mail(
                        $notification["address"],
                        $notification["subject"],
                        $notification["message"],
                        array_merge( $headers, $notification["headers"] )
                    );
                }
                remove_filter( "wp_mail_content_type", "wbk_wp_mail_content_type" );
            }
        }
    }

    public static function arrival_email_send_or_schedule( $booking_id ) {
        $booking = new WBK_Booking($booking_id);
        if ( !$booking->is_loaded() ) {
            return;
        }
        $delay = trim( get_option( "wbk_email_customer_arrived_delay", "" ) );
        if ( $delay == "" || intval( $delay ) == 0 ) {
            self::send( [$booking_id], "booking_finished" );
        } else {
            $delay = time() + $delay * 60 * 60;
            $booking->set( "arrival_email_time", $delay );
            $booking->save();
        }
    }

    public static function send_late_notifications( $type = "arrival" ) {
        $booking_ids = WBK_Model_Utils::get_bookings_to_send_arrival_email();
        foreach ( $booking_ids as $booking_id ) {
            $booking = new WBK_Booking($booking_id);
            if ( !$booking->is_loaded() ) {
                return;
            }
            $booking->set( "arrival_email_time", "4863950676" );
            $booking->save();
            self::send( [$booking_id], "booking_finished" );
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
        $headers[] = "From: " . stripslashes( get_option( "wbk_from_name" ) ) . " <" . get_option( "wbk_from_email" ) . ">";
        $attachments = [];
        $queue = [];
        $message = $template->get( "template" );
        $subject = $template->get( "subject" );
        if ( function_exists( "pll__" ) ) {
            $subject = pll__( $subject );
            $message = pll__( $message );
        }
        $subject = apply_filters(
            "wpml_translate_single_string",
            $subject,
            "webba-booking-lite",
            "webba_email_template_subject_" . $template->get_id()
        );
        $message = apply_filters(
            "wpml_translate_single_string",
            $message,
            "webba-booking-lite",
            "webba_email_template_message_" . $template->get_id()
        );
        $message = WBK_Placeholder_Processor::process( $message, $bookings );
        $subject = WBK_Placeholder_Processor::process( $subject, $bookings );
        if ( $template->get( "type" ) == "admin_reminder" ) {
            $message = WBK_Placeholder_Processor::process_agenda_placehoder( $message, $bookings );
        }
        $recipients = json_decode( $template->get( "recipients" ) );
        $invoice_pdf = "";
        if ( $template->get( "attach_invoice" ) == "yes" && WBK_Feature_Gate::have_required_plan( "premium" ) ) {
            $invoice_pdf = self::generate_pdf_invoice( $bookings );
        }
        foreach ( $recipients as $recipient ) {
            $attachments = [];
            if ( $recipient == "admin" ) {
            } elseif ( $recipient == "customer" || $recipient == "group" ) {
            }
            $pdf_attachement = WBK_Gift_Card_Design::resolve_attachment_html( $template->get( "pdf_attachment" ) );
            if ( $pdf_attachement != "" ) {
                if ( function_exists( "pll__" ) ) {
                    $pdf_attachement = pll__( $pdf_attachement );
                }
                $pdf_attachement = apply_filters(
                    "wpml_translate_single_string",
                    $pdf_attachement,
                    "webba-booking-lite",
                    "webba_email_template_pdf_" . $template->get_id()
                );
                $pdf_file = WBK_Pdf_Processor::process( $pdf_attachement, $bookings );
                if ( $pdf_file != false && $pdf_file != "" ) {
                    $attachments[] = $pdf_file;
                }
            }
            if ( $invoice_pdf !== "" ) {
                $attachments[] = $invoice_pdf;
            }
            $queue_item = [
                "address" => $email,
                "message" => $message,
                "subject" => $subject,
            ];
            if ( count( $attachments ) > 0 ) {
                $queue_item["attachments"] = $attachments;
            }
            $queue[] = $queue_item;
        }
        foreach ( $queue as $notification ) {
            if ( WBK_Validator::check_string_size( $notification["message"], 1, 50000 ) && WBK_Validator::check_string_size( $notification["subject"], 1, 200 ) ) {
                add_filter( "wp_mail_content_type", "wbk_wp_mail_content_type" );
                if ( isset( $notification["attachments"] ) && count( $notification["attachments"] ) > 0 ) {
                    wp_mail(
                        $notification["address"],
                        $notification["subject"],
                        $notification["message"],
                        $headers,
                        $notification["attachments"]
                    );
                } else {
                    wp_mail(
                        $notification["address"],
                        $notification["subject"],
                        $notification["message"],
                        $headers
                    );
                }
                remove_filter( "wp_mail_content_type", "wbk_wp_mail_content_type" );
            }
        }
    }

    /**
        /**
    * Generate a PDF invoice for the given booking IDs.
    *
    * @param array $bookings_ids Booking IDs included on the invoice.
    * @return string Absolute path to the generated PDF, or an empty string on failure.
    */
    public static function generate_pdf_invoice( array $bookings_ids ) : string {
        $booking_objects = [];
        $normalized_ids = [];
        foreach ( $bookings_ids as $booking_id ) {
            $booking = new WBK_Booking($booking_id);
            if ( !$booking->is_loaded() ) {
                continue;
            }
            $booking_objects[] = $booking;
            $normalized_ids[] = (int) $booking->get_id();
        }
        if ( count( $booking_objects ) === 0 ) {
            return "";
        }
        $first_booking = $booking_objects[0];
        $company_name = trim( (string) get_option( "wbk_company_name", "" ) );
        if ( $company_name === "" ) {
            $company_name = get_bloginfo( "name" );
        }
        $company_email = trim( (string) get_option( "wbk_sidebar_help_email", "" ) );
        if ( $company_email === "" ) {
            $company_email = (string) get_option( "wbk_from_email", get_option( "admin_email" ) );
        }
        $company_information = [
            "name"    => $company_name,
            "address" => trim( (string) get_option( "wbk_company_address", "" ) ),
            "phone"   => trim( (string) get_option( "wbk_sidebar_help_phone", "" ) ),
            "email"   => $company_email,
            "logo"    => self::resolve_company_logo_src( get_option( "wbk_company_logo", "" ) ),
        ];
        $customer = [
            "name"  => (string) $first_booking->get_name(),
            "email" => (string) $first_booking->get( "email" ),
            "phone" => (string) $first_booking->get_phone(),
        ];
        $invoice_number = str_pad(
            (string) get_option( "wbk_email_current_invoice_number", "1" ),
            6,
            "0",
            STR_PAD_LEFT
        );
        $date_format = WBK_Format_Utils::get_date_format();
        $previous_timezone = date_default_timezone_get();
        date_default_timezone_set( get_option( "wbk_timezone", "UTC" ) );
        $timezone = new DateTimeZone(date_default_timezone_get());
        $invoice_date = wp_date( $date_format, time(), $timezone );
        $line_items = self::build_invoice_line_items( $booking_objects, $timezone );
        date_default_timezone_set( $previous_timezone );
        $payment_details = self::get_invoice_payment_details( $normalized_ids, $first_booking );
        $amount_paid = 0.0;
        foreach ( $booking_objects as $booking_object ) {
            $amount_paid += (float) $booking_object->get( "amount_paid" );
        }
        $subtotal = ( is_array( $payment_details ) ? (float) $payment_details["subtotal"] : 0.0 );
        $tax_amount = ( is_array( $payment_details ) ? (float) $payment_details["tax_to_pay"] : 0.0 );
        $discount_amount = ( is_array( $payment_details ) ? (float) $payment_details["discount"] : 0.0 );
        $service_fees = ( is_array( $payment_details ) ? (float) $payment_details["service_fees"] : 0.0 );
        $total = ( is_array( $payment_details ) ? (float) $payment_details["total"] : 0.0 );
        if ( !is_array( $payment_details ) ) {
            foreach ( $booking_objects as $booking_object ) {
                $subtotal += (float) $booking_object->get_price();
            }
            $total = $subtotal;
        }
        $items_subtotal = $subtotal - $service_fees + $discount_amount;
        if ( $items_subtotal < 0 ) {
            $items_subtotal = 0.0;
        }
        $balance_due = max( 0, $total - $amount_paid );
        $is_paid = $total <= 0 || $balance_due <= 0;
        $payment_method = (string) $first_booking->get( "payment_method" );
        if ( $payment_method === "" || $payment_method === "false" ) {
            $payment_method = "";
        }
        $totals = [
            "subtotal"         => WBK_Format_Utils::format_price( $items_subtotal ),
            "tax"              => WBK_Format_Utils::format_price( $tax_amount ),
            "tax_label"        => get_option( "wbk_tax_label", __( "Sales tax", "webba-booking-lite" ) ),
            "show_tax"         => $tax_amount > 0,
            "discount"         => WBK_Format_Utils::format_price( $discount_amount ),
            "discount_label"   => get_option( "wbk_payment_discount_item", __( "Discount (-)", "webba-booking-lite" ) ),
            "show_discount"    => $discount_amount > 0,
            "fees"             => WBK_Format_Utils::format_price( $service_fees ),
            "show_fees"        => $service_fees > 0,
            "total"            => WBK_Format_Utils::format_price( $total ),
            "amount_paid"      => WBK_Format_Utils::format_price( $amount_paid ),
            "show_amount_paid" => $amount_paid > 0,
            "balance_due"      => WBK_Format_Utils::format_price( $balance_due ),
            "show_balance_due" => $balance_due > 0,
        ];
        $invoice_meta = [
            "number"            => $invoice_number,
            "date"              => $invoice_date,
            "status"            => ( $is_paid ? __( "Paid", "webba-booking-lite" ) : __( "Unpaid", "webba-booking-lite" ) ),
            "is_paid"           => $is_paid,
            "payment_method"    => $payment_method,
            "booking_reference" => implode( ", ", $normalized_ids ),
        ];
        ob_start();
        include WP_WEBBA_BOOKING__PLUGIN_DIR . "/templates/emails/pdf-invoice.php";
        $content = ob_get_clean();
        if ( !is_string( $content ) || trim( $content ) === "" ) {
            return "";
        }
        return WBK_Pdf_Processor::process( $content, [] );
    }

    /**
     * Convert a stored company logo option into a data URI for DOMPDF.
     *
     * @param mixed $logo_option Attachment ID, URL, or filesystem path.
     * @return string
     */
    private static function resolve_company_logo_src( $logo_option ) : string {
        if ( $logo_option === null || $logo_option === false || $logo_option === "" ) {
            return "";
        }
        $path = "";
        $mime = "";
        if ( is_numeric( $logo_option ) && (int) $logo_option > 0 ) {
            $attachment_id = (int) $logo_option;
            $path = (string) get_attached_file( $attachment_id );
            $mime = (string) get_post_mime_type( $attachment_id );
        } elseif ( is_string( $logo_option ) && filter_var( $logo_option, FILTER_VALIDATE_URL ) ) {
            $uploads = wp_get_upload_dir();
            if ( !empty( $uploads["baseurl"] ) && strpos( $logo_option, $uploads["baseurl"] ) === 0 ) {
                $path = $uploads["basedir"] . substr( $logo_option, strlen( $uploads["baseurl"] ) );
            }
        } elseif ( is_string( $logo_option ) && file_exists( $logo_option ) ) {
            $path = $logo_option;
        }
        if ( $path === "" || !is_readable( $path ) ) {
            return "";
        }
        if ( $mime === "" ) {
            $file_type = wp_check_filetype( $path );
            $mime = ( isset( $file_type["type"] ) && $file_type["type"] !== false ? $file_type["type"] : "image/png" );
        }
        $binary = file_get_contents( $path );
        if ( $binary === false ) {
            return "";
        }
        return "data:" . $mime . ";base64," . base64_encode( $binary );
    }

    /**
     * Load payment totals for invoice bookings.
     *
     * @param int[] $booking_ids Booking IDs.
     * @param WBK_Booking $first_booking First booking in the set.
     * @return array|int
     */
    private static function get_invoice_payment_details( array $booking_ids, WBK_Booking $first_booking ) {
        if ( $first_booking->get_booking_target_type() === WBK_Booking::BOOKING_TARGET_UNIT ) {
            $payment_details = WBK_Price_Processor::get_unit_payment_items_post_booked( $booking_ids );
        } else {
            $payment_details = WBK_Price_Processor::get_payment_items_post_booked( $booking_ids );
        }
        if ( !is_array( $payment_details ) ) {
            return 0;
        }
        return $payment_details;
    }

    /**
     * Build invoice line items from loaded booking objects.
     *
     * @param WBK_Booking[] $booking_objects Loaded bookings.
     * @param DateTimeZone $timezone Business timezone.
     * @return array
     */
    private static function build_invoice_line_items( array $booking_objects, DateTimeZone $timezone ) : array {
        $date_format = WBK_Format_Utils::get_date_format();
        $time_format = WBK_Format_Utils::get_time_format();
        $line_items = [];
        foreach ( $booking_objects as $booking ) {
            $is_unit = $booking->get_booking_target_type() === WBK_Booking::BOOKING_TARGET_UNIT;
            $title = "";
            $staff_name = "";
            if ( $is_unit ) {
                $unit = new WBK_Unit($booking->get_unit_id());
                if ( $unit->is_loaded() ) {
                    $title = (string) $unit->get_name();
                }
            } else {
                $service = new WBK_Service($booking->get_service());
                if ( $service->is_loaded() ) {
                    $title = (string) $service->get_name();
                }
            }
            $staff_id = $booking->get_staff_member();
            if ( !empty( $staff_id ) ) {
                $staff_member = new WBK_Staff_Member($staff_id);
                if ( $staff_member->is_loaded() ) {
                    $staff_name = (string) $staff_member->get_name();
                }
            }
            $line_items[] = [
                "title"    => ( $title !== "" ? $title : __( "Booking", "webba-booking-lite" ) ),
                "schedule" => self::format_invoice_item_schedule(
                    $booking,
                    $is_unit,
                    $date_format,
                    $time_format,
                    $timezone
                ),
                "duration" => self::format_invoice_duration( (int) $booking->get( "duration" ), $is_unit ),
                "extras"   => self::format_invoice_item_extras( $booking ),
                "staff"    => $staff_name,
                "quantity" => max( 1, $booking->get_quantity() ),
                "amount"   => WBK_Format_Utils::format_price( (float) $booking->get_price() ),
            ];
        }
        return $line_items;
    }

    /**
     * Format the date and time shown for an invoice line.
     *
     * @param WBK_Booking $booking Booking.
     * @param bool $is_unit Whether the booking targets a unit.
     * @param string $date_format Date format.
     * @param string $time_format Time format.
     * @param DateTimeZone $timezone Business timezone.
     * @return string
     */
    private static function format_invoice_item_schedule(
        WBK_Booking $booking,
        bool $is_unit,
        string $date_format,
        string $time_format,
        DateTimeZone $timezone
    ) : string {
        $start = (int) $booking->get_start();
        if ( $is_unit ) {
            $duration_minutes = (int) $booking->get( "duration" );
            $end = $start + $duration_minutes * 60;
            $check_in = wp_date( $date_format, $start, $timezone );
            $check_out = wp_date( $date_format, $end, $timezone );
            if ( $check_in === $check_out ) {
                return $check_in;
            }
            return $check_in . " – " . $check_out;
        }
        $end = (int) $booking->get_end();
        return wp_date( $date_format, $start, $timezone ) . ", " . wp_date( $time_format, $start, $timezone ) . " – " . wp_date( $time_format, $end, $timezone );
    }

    /**
     * Format booking duration for the invoice.
     *
     * @param int $minutes Duration in minutes.
     * @param bool $is_unit Whether the booking targets a unit.
     * @return string
     */
    private static function format_invoice_duration( int $minutes, bool $is_unit ) : string {
        if ( $minutes < 1 ) {
            return "";
        }
        if ( $is_unit ) {
            $nights = max( 1, (int) intdiv( $minutes, 1440 ) );
            return sprintf( _n(
                "%d night",
                "%d nights",
                $nights,
                "webba-booking-lite"
            ), $nights );
        }
        $hours = (int) intdiv( $minutes, 60 );
        $remaining_minutes = $minutes % 60;
        $parts = [];
        if ( $hours > 0 ) {
            $parts[] = sprintf( _n(
                "%d hour",
                "%d hours",
                $hours,
                "webba-booking-lite"
            ), $hours );
        }
        if ( $remaining_minutes > 0 ) {
            $parts[] = sprintf( _n(
                "%d minute",
                "%d minutes",
                $remaining_minutes,
                "webba-booking-lite"
            ), $remaining_minutes );
        }
        return implode( " ", $parts );
    }

    /**
     * Format extras selected on a booking.
     *
     * @param WBK_Booking $booking Booking.
     * @return string
     */
    private static function format_invoice_item_extras( WBK_Booking $booking ) : string {
        $raw = $booking->get( "booking_extra" );
        if ( $raw === "" || $raw === null || $raw === false ) {
            return "";
        }
        $decoded = json_decode( (string) $raw, true );
        if ( !is_array( $decoded ) || count( $decoded ) === 0 ) {
            return "";
        }
        $parts = [];
        foreach ( $decoded as $extra_id_key => $quantity ) {
            $extra_id = (int) $extra_id_key;
            $extra_quantity = (int) $quantity;
            if ( $extra_id < 1 || $extra_quantity < 1 ) {
                continue;
            }
            $extra = new WBK_Extra($extra_id);
            $extra_name = ( $extra->is_loaded() ? (string) $extra->get_name() : sprintf( __( "Extra #%d", "webba-booking-lite" ), $extra_id ) );
            $parts[] = $extra_name . " × " . $extra_quantity;
        }
        return implode( ", ", $parts );
    }

    /**
     * Send the purchase receipt and, if Send card on is today, the delivery email.
     *
     * @param int $gift_card_id
     * @return void
     */
    public static function on_gift_card_purchased( $gift_card_id ) {
        $gift_card_id = intval( $gift_card_id );
        if ( $gift_card_id <= 0 ) {
            return;
        }
        self::send_gift_card( $gift_card_id, "gift_card_purchased" );
        self::maybe_send_gift_card_delivery( $gift_card_id );
    }

    /**
     * Send due gift card delivery emails (daily cron).
     *
     * @return void
     */
    public static function send_scheduled_gift_cards() {
        foreach ( WBK_Gift_Card::get_ids_due_for_delivery() as $gift_card_id ) {
            self::maybe_send_gift_card_delivery( $gift_card_id );
        }
    }

    /**
     * Send the recipient email when Send card on is due and it has not been sent yet.
     *
     * @param int $gift_card_id
     * @return void
     */
    public static function maybe_send_gift_card_delivery( $gift_card_id ) {
        $gift_card = new WBK_Gift_Card(intval( $gift_card_id ));
        if ( !$gift_card->is_loaded() || $gift_card->is_recipient_notified() ) {
            return;
        }
        if ( !$gift_card->is_delivery_due() ) {
            return;
        }
        if ( self::send_gift_card( intval( $gift_card_id ), "gift_card_sent" ) ) {
            $gift_card->mark_recipient_notified();
        }
    }

    /**
     * Send gift card email templates for a trigger.
     *
     * @param int    $gift_card_id
     * @param string $trigger gift_card_purchased|gift_card_sent
     * @return bool True when at least one email was dispatched.
     */
    public static function send_gift_card( $gift_card_id, $trigger ) {
        $gift_card = new WBK_Gift_Card(intval( $gift_card_id ));
        if ( !$gift_card->is_loaded() ) {
            return false;
        }
        $email_templates = WBK_Model_Utils::get_gift_card_email_templates( $trigger, $gift_card );
        if ( count( $email_templates ) === 0 ) {
            return false;
        }
        $headers = ["From: " . stripslashes( get_option( "wbk_from_name" ) ) . " <" . get_option( "wbk_from_email" ) . ">"];
        $queue = [];
        $sent_any = false;
        foreach ( $email_templates as $id => $name ) {
            $et = new WBK_Email_Template($id);
            if ( !$et->is_loaded() ) {
                continue;
            }
            $message = $et->get( "template" );
            $subject = $et->get( "subject" );
            $message = WBK_Translation_Processor::translate_string( "webba_email_template_message_" . $id, $message );
            $subject = WBK_Translation_Processor::translate_string( "webba_email_template_subject_" . $id, $subject );
            $raw_message = $gift_card->get( "message" );
            $personal_message = ( is_string( $raw_message ) ? trim( $raw_message ) : "" );
            if ( $trigger == "gift_card_sent" && $personal_message !== "" && strpos( $message, "#gift_card_message" ) === false ) {
                $message .= "#gift_card_message";
            }
            if ( $trigger == "gift_card_sent" && strpos( $message, "#gift_card_policy" ) === false && WBK_Gift_Card::get_policy_html() !== "" ) {
                $message .= "#gift_card_policy";
            }
            $message = WBK_Placeholder_Processor::process_gift_card_placeholders( $message, intval( $gift_card_id ) );
            $subject = WBK_Placeholder_Processor::process_gift_card_placeholders( $subject, intval( $gift_card_id ) );
            $recipients = json_decode( $et->get( "recipients" ) );
            if ( is_string( $recipients ) ) {
                $recipients = json_decode( $recipients );
            }
            if ( !$recipients || !is_array( $recipients ) ) {
                continue;
            }
            $recipients = array_map( "strval", $recipients );
            foreach ( $recipients as $recipient ) {
                $attachments = [];
                $item_header = [];
                $recipient_addresses = [];
                if ( $recipient == "admin" ) {
                    $recipient_addresses[] = get_option( "wbk_super_admin_email", get_option( "admin_email" ) );
                    if ( get_option( "wbk_email_override_replyto", "true" ) == "true" ) {
                        $item_header[] = "Reply-To: " . $gift_card->get( "buyer_name" ) . " <" . $gift_card->get( "buyer_email" ) . ">";
                    }
                } elseif ( $recipient == "customer" || $recipient == "group" ) {
                    if ( $trigger == "gift_card_sent" ) {
                        $recipient_addresses[] = $gift_card->get( "recipient_email" );
                    } else {
                        $recipient_addresses[] = $gift_card->get( "buyer_email" );
                    }
                    if ( get_option( "wbk_email_override_replyto", "true" ) == "true" ) {
                        if ( $trigger == "gift_card_sent" ) {
                            $item_header[] = "Reply-To: " . $gift_card->get( "buyer_name" ) . " <" . $gift_card->get( "buyer_email" ) . ">";
                        }
                    }
                } else {
                    continue;
                }
                $recipient_addresses = array_values( array_filter( array_map( "sanitize_email", $recipient_addresses ), function ( $email ) {
                    return $email !== "" && is_email( $email );
                } ) );
                if ( count( $recipient_addresses ) === 0 ) {
                    continue;
                }
                $buyer_design = $gift_card->get( "design" );
                $buyer_design = ( is_string( $buyer_design ) ? $buyer_design : "" );
                if ( $trigger == "gift_card_sent" ) {
                    $pdf_html = WBK_Gift_Card_Design::resolve_delivery_html( $et->get( "pdf_attachment" ), $buyer_design );
                } else {
                    $pdf_html = WBK_Gift_Card_Design::resolve_attachment_html( $et->get( "pdf_attachment" ) );
                }
                if ( $pdf_html != "" && WBK_Feature_Gate::have_required_plan( "premium" ) ) {
                    $pdf_html = WBK_Translation_Processor::translate_string( "webba_email_template_pdf_" . $id, $pdf_html );
                    $pdf_html = WBK_Placeholder_Processor::process_gift_card_placeholders( $pdf_html, intval( $gift_card_id ) );
                    $pdf_file = WBK_Pdf_Processor::process( $pdf_html, [] );
                    if ( $pdf_file != false && $pdf_file != "" ) {
                        $attachments[] = $pdf_file;
                    }
                }
                foreach ( $recipient_addresses as $email ) {
                    $queue_item = [
                        "address" => $email,
                        "message" => $message,
                        "subject" => $subject,
                        "headers" => $item_header,
                    ];
                    if ( count( $attachments ) > 0 ) {
                        $queue_item["attachments"] = $attachments;
                    }
                    $queue[] = $queue_item;
                }
            }
        }
        foreach ( $queue as $notification ) {
            if ( !WBK_Validator::check_string_size( $notification["message"], 1, 50000 ) || !WBK_Validator::check_string_size( $notification["subject"], 1, 200 ) ) {
                continue;
            }
            add_filter( "wp_mail_content_type", "wbk_wp_mail_content_type" );
            if ( isset( $notification["attachments"] ) && count( $notification["attachments"] ) > 0 ) {
                wp_mail(
                    $notification["address"],
                    $notification["subject"],
                    $notification["message"],
                    array_merge( $headers, $notification["headers"] ),
                    $notification["attachments"]
                );
            } else {
                wp_mail(
                    $notification["address"],
                    $notification["subject"],
                    $notification["message"],
                    array_merge( $headers, $notification["headers"] )
                );
            }
            remove_filter( "wp_mail_content_type", "wbk_wp_mail_content_type" );
            $sent_any = true;
        }
        return $sent_any;
    }

}

function wbk_wp_mail_content_type() {
    return "text/html";
}
