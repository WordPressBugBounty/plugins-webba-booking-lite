<?php

if ( !defined( "ABSPATH" ) ) {
    exit;
}
class WBK_Mailer {
    /**
     * Temporary flag to deactivate mailer functionality.
     */
    private const TEMPORARILY_DISABLED = false;

    private const GMAIL_TOKEN_TRANSIENT = "wbk_gmail_access_token";

    public static function init() : void {
        if ( self::TEMPORARILY_DISABLED ) {
            return;
        }
        add_action( "phpmailer_init", [__CLASS__, "configure_phpmailer"] );
        add_filter(
            "pre_wp_mail",
            [__CLASS__, "maybe_send_via_api_mailer"],
            10,
            2
        );
    }

    public static function is_smtp_enabled() : bool {
        return self::get_active_transport() === "smtp";
    }

    public static function is_gmail_enabled() : bool {
        return self::get_active_transport() === "gmail";
    }

    public static function is_sendgrid_enabled() : bool {
        return self::get_active_transport() === "sendgrid";
    }

    /**
     * Active mail transport from the mailer switcher.
     *
     * Values: default | smtp | gmail | sendgrid
     */
    public static function get_active_transport() : string {
        $mailer = sanitize_text_field( (string) get_option( "wbk_mailer", "" ) );
        if ( in_array( $mailer, [
            "default",
            "smtp",
            "gmail",
            "sendgrid"
        ], true ) ) {
            return $mailer;
        }
        // Legacy fallback for installs that still have the old toggles.
        if ( get_option( "wbk_gmail_enabled", "" ) === "yes" ) {
            return "gmail";
        }
        if ( get_option( "wbk_smtp_enabled", "" ) === "yes" ) {
            return "smtp";
        }
        return "default";
    }

    public static function clear_gmail_token_cache() : void {
        delete_transient( self::GMAIL_TOKEN_TRANSIENT );
    }

    public static function configure_phpmailer( $phpmailer ) : void {
        if ( self::TEMPORARILY_DISABLED ) {
            return;
        }
        if ( self::get_active_transport() !== "smtp" ) {
            return;
        }
        $host = trim( (string) get_option( "wbk_smtp_host", "" ) );
        if ( $host === "" ) {
            return;
        }
        $phpmailer->isSMTP();
        $phpmailer->Host = $host;
        $phpmailer->Port = max( 1, (int) get_option( "wbk_smtp_port", 587 ) );
        $encryption = sanitize_text_field( get_option( "wbk_smtp_encryption", "tls" ) );
        if ( $encryption === "ssl" ) {
            $phpmailer->SMTPSecure = "ssl";
        } elseif ( $encryption === "tls" ) {
            $phpmailer->SMTPSecure = "tls";
        } else {
            $phpmailer->SMTPSecure = "";
            $phpmailer->SMTPAutoTLS = false;
        }
        $use_auth = get_option( "wbk_smtp_auth", "" ) === "yes";
        $phpmailer->SMTPAuth = $use_auth;
        if ( $use_auth ) {
            $phpmailer->Username = (string) get_option( "wbk_smtp_username", "" );
            $phpmailer->Password = (string) get_option( "wbk_smtp_password", "" );
        }
    }

    /**
     * Send via Gmail or SendGrid when the corresponding mailer is selected.
     *
     * @param null|bool $return Short-circuit value for wp_mail.
     * @param array     $atts   wp_mail attributes.
     * @return null|bool
     */
    public static function maybe_send_via_api_mailer( $return, $atts ) {
        if ( self::TEMPORARILY_DISABLED ) {
            return $return;
        }
        $transport = self::get_active_transport();
        if ( !in_array( $transport, ["gmail", "sendgrid"], true ) ) {
            return $return;
        }
        if ( !is_array( $atts ) ) {
            return false;
        }
        if ( $transport === "gmail" ) {
            $result = self::send_via_gmail_api( $atts );
        } else {
            $result = self::send_via_sendgrid_api( $atts );
        }
        return $result["success"];
    }

    /**
     * @param array $atts wp_mail attributes.
     * @return array{success: bool, message: string}
     */
    public static function send_via_gmail_api( array $atts ) : array {
    }

    /**
     * @param array $atts wp_mail attributes.
     * @return array{success: bool, message: string}
     */
    public static function send_via_sendgrid_api( array $atts ) : array {
        return [
            'success' => false,
            'message' => __( 'SendGrid is not available. Please upgrade to a premium plan to use SendGrid.', 'webba-booking-lite' ),
        ];
    }

    /**
     * @return array{success: bool, message: string}
     */
    public static function send_test_email( string $to ) : array {
        if ( self::TEMPORARILY_DISABLED ) {
            return [
                "success" => false,
                "message" => __( "Mailer functionality is temporarily disabled.", "webba-booking-lite" ),
            ];
        }
        $transport = self::get_active_transport();
        if ( !in_array( $transport, ["smtp", "gmail", "sendgrid"], true ) ) {
            return [
                "success" => false,
                "message" => __( "Enable SMTP, Gmail, or SendGrid and save your settings before sending a test email.", "webba-booking-lite" ),
            ];
        }
        if ( !WBK_Validator::check_email( $to ) ) {
            return [
                "success" => false,
                "message" => __( "Please enter a valid email address.", "webba-booking-lite" ),
            ];
        }
        if ( $transport === "smtp" && trim( (string) get_option( "wbk_smtp_host", "" ) ) === "" ) {
            return [
                "success" => false,
                "message" => __( "SMTP host is required.", "webba-booking-lite" ),
            ];
        }
        if ( $transport === "gmail" ) {
            $credentials = self::get_gmail_credentials();
            if ( $credentials === null || empty( $credentials["access_token"] ) ) {
                return [
                    "success" => false,
                    "message" => __( "Gmail is not authorized. Please authorize Gmail before sending a test email.", "webba-booking-lite" ),
                ];
            }
        }
        if ( $transport === "sendgrid" && self::get_sendgrid_api_key() === "" ) {
            return [
                "success" => false,
                "message" => __( "SendGrid API key is required.", "webba-booking-lite" ),
            ];
        }
        $error_message = "";
        $failed_callback = function ( $wp_error ) use(&$error_message) {
            if ( is_wp_error( $wp_error ) ) {
                $error_message = $wp_error->get_error_message();
            }
        };
        add_action(
            "wp_mail_failed",
            $failed_callback,
            10,
            1
        );
        $from_name = stripslashes( (string) get_option( "wbk_from_name", "" ) );
        $from_email = ( $transport === "gmail" ? self::resolve_gmail_from_email( ( self::get_gmail_credentials() ?: [] ) ) : (string) get_option( "wbk_from_email", "" ) );
        $headers = [];
        if ( $from_email !== "" ) {
            $headers[] = "From: " . $from_name . " <" . $from_email . ">";
        }
        if ( $transport === "gmail" ) {
            $subject = sprintf( 
                /* translators: %s: site name */
                __( "Gmail test from %s", "webba-booking-lite" ),
                get_bloginfo( "name" )
             );
            $message = sprintf( 
                /* translators: %s: site name */
                __( "This is a test email sent from the Webba Booking Gmail settings on %s. If you received it, your Gmail authorization is working.", "webba-booking-lite" ),
                get_bloginfo( "name" )
             );
        } elseif ( $transport === "sendgrid" ) {
            $subject = sprintf( 
                /* translators: %s: site name */
                __( "SendGrid test from %s", "webba-booking-lite" ),
                get_bloginfo( "name" )
             );
            $message = sprintf( 
                /* translators: %s: site name */
                __( "This is a test email sent from the Webba Booking SendGrid settings on %s. If you received it, your SendGrid configuration is working.", "webba-booking-lite" ),
                get_bloginfo( "name" )
             );
        } else {
            $subject = sprintf( 
                /* translators: %s: site name */
                __( "SMTP test from %s", "webba-booking-lite" ),
                get_bloginfo( "name" )
             );
            $message = sprintf( 
                /* translators: %s: site name */
                __( "This is a test email sent from the Webba Booking SMTP settings on %s. If you received it, your SMTP configuration is working.", "webba-booking-lite" ),
                get_bloginfo( "name" )
             );
        }
        add_filter( "wp_mail_content_type", "wbk_wp_mail_content_type" );
        $sent = wp_mail(
            $to,
            $subject,
            $message,
            $headers
        );
        remove_filter( "wp_mail_content_type", "wbk_wp_mail_content_type" );
        remove_action( "wp_mail_failed", $failed_callback, 10 );
        if ( !$sent || $error_message !== "" ) {
            return [
                "success" => false,
                "message" => ( $error_message !== "" ? $error_message : __( "Failed to send test email.", "webba-booking-lite" ) ),
            ];
        }
        return [
            "success" => true,
            "message" => __( "Test email sent successfully.", "webba-booking-lite" ),
        ];
    }

    /**
     * @return array{access_token: string, email?: string}|null
     */
    private static function get_gmail_credentials() : ?array {
        return [
            'access_token' => '',
            'email'        => '',
        ];
    }

    /**
     * @param array{access_token?: string, email?: string} $credentials
     */
    private static function resolve_gmail_from_email( array $credentials ) : string {
        if ( !empty( $credentials["email"] ) ) {
            $email = sanitize_email( (string) $credentials["email"] );
            if ( $email !== "" ) {
                return $email;
            }
        }
        $stored = sanitize_email( (string) get_option( "wbk_gmail_email", "" ) );
        if ( $stored !== "" ) {
            return $stored;
        }
        return sanitize_email( (string) get_option( "wbk_from_email", "" ) );
    }

    private static function get_sendgrid_api_key() : string {
        return trim( (string) get_option( "wbk_sendgrid_api_key", "" ) );
    }

    /**
     * @param array $atts wp_mail attributes.
     * @throws Exception
     */
    private static function build_sendgrid_mail( array $atts, string $from_email, string $from_name ) : SendGrid\Mail\Mail {
        return new SendGrid\Mail\Mail();
    }

    /**
     * @param SendGrid\Mail\Mail $mail
     * @param string|array       $addresses
     * @param string             $type to|cc|bcc
     */
    private static function add_sendgrid_addresses( $mail, $addresses, string $type ) : bool {
        return false;
    }

    private static function parse_sendgrid_error_message( string $body, int $code ) : string {
        return sprintf( 
            /* translators: %d: HTTP status code */
            __( "SendGrid is not available. Please upgrade to a premium plan to use SendGrid.", "webba-booking-lite" ),
            $code
         );
    }

    /**
     * Build an RFC 2822 message using PHPMailer (compose only, no send).
     *
     * @param array $atts wp_mail attributes.
     * @throws Exception
     */
    private static function build_raw_mime_message( array $atts, string $from_email, string $from_name ) : string {
        if ( !class_exists( "PHPMailer\\PHPMailer\\PHPMailer" ) ) {
            require_once ABSPATH . WPINC . "/PHPMailer/PHPMailer.php";
            require_once ABSPATH . WPINC . "/PHPMailer/Exception.php";
        }
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        $mail->CharSet = "UTF-8";
        $mail->Encoding = "base64";
        $mail->setFrom( $from_email, $from_name, false );
        $mail->Sender = $from_email;
        $to = ( isset( $atts["to"] ) ? $atts["to"] : "" );
        self::add_addresses_to_mailer( $mail, $to, "to" );
        $headers = ( isset( $atts["headers"] ) ? $atts["headers"] : [] );
        if ( !is_array( $headers ) ) {
            $headers = explode( "\n", str_replace( "\r\n", "\n", (string) $headers ) );
        }
        $content_type = "";
        $cc = [];
        $bcc = [];
        $reply_to = [];
        foreach ( $headers as $header ) {
            if ( !is_string( $header ) || strpos( $header, ":" ) === false ) {
                continue;
            }
            list( $name, $content ) = explode( ":", trim( $header ), 2 );
            $name = strtolower( trim( $name ) );
            $content = trim( $content );
            switch ( $name ) {
                case "from":
                    // Always use the authorized Gmail address as From.
                    break;
                case "content-type":
                    $content_type = $content;
                    break;
                case "cc":
                    $cc[] = $content;
                    break;
                case "bcc":
                    $bcc[] = $content;
                    break;
                case "reply-to":
                    $reply_to[] = $content;
                    break;
                default:
                    $mail->addCustomHeader( $name, $content );
                    break;
            }
        }
        foreach ( $cc as $cc_address ) {
            self::add_addresses_to_mailer( $mail, $cc_address, "cc" );
        }
        foreach ( $bcc as $bcc_address ) {
            self::add_addresses_to_mailer( $mail, $bcc_address, "bcc" );
        }
        foreach ( $reply_to as $reply_address ) {
            self::add_addresses_to_mailer( $mail, $reply_address, "reply_to" );
        }
        $mail->Subject = ( isset( $atts["subject"] ) ? (string) $atts["subject"] : "" );
        $body = ( isset( $atts["message"] ) ? (string) $atts["message"] : "" );
        if ( $content_type !== "" && stripos( $content_type, "text/html" ) !== false ) {
            $mail->isHTML( true );
            $mail->Body = $body;
            $mail->AltBody = wp_strip_all_tags( $body );
        } elseif ( has_filter( "wp_mail_content_type" ) && strtolower( (string) apply_filters( "wp_mail_content_type", "text/plain" ) ) === "text/html" ) {
            $mail->isHTML( true );
            $mail->Body = $body;
            $mail->AltBody = wp_strip_all_tags( $body );
        } else {
            $mail->isHTML( false );
            $mail->Body = $body;
        }
        $attachments = ( isset( $atts["attachments"] ) ? $atts["attachments"] : [] );
        if ( !is_array( $attachments ) ) {
            $attachments = explode( "\n", str_replace( "\r\n", "\n", (string) $attachments ) );
        }
        foreach ( $attachments as $attachment ) {
            $attachment = trim( (string) $attachment );
            if ( $attachment === "" || !file_exists( $attachment ) ) {
                continue;
            }
            $mail->addAttachment( $attachment );
        }
        if ( !$mail->preSend() ) {
            throw new Exception(( $mail->ErrorInfo !== "" ? $mail->ErrorInfo : __( "Failed to compose email message.", "webba-booking-lite" ) ));
        }
        return $mail->getSentMIMEMessage();
    }

    /**
     * @param PHPMailer\PHPMailer\PHPMailer $mail
     * @param string|array                  $addresses
     * @param string                        $type to|cc|bcc|reply_to
     */
    private static function add_addresses_to_mailer( $mail, $addresses, string $type ) : void {
        if ( !is_array( $addresses ) ) {
            $addresses = explode( ",", (string) $addresses );
        }
        foreach ( $addresses as $address ) {
            $address = trim( (string) $address );
            if ( $address === "" ) {
                continue;
            }
            $recipient = self::parse_email_address( $address );
            if ( $recipient["email"] === "" || !is_email( $recipient["email"] ) ) {
                continue;
            }
            switch ( $type ) {
                case "cc":
                    $mail->addCC( $recipient["email"], $recipient["name"] );
                    break;
                case "bcc":
                    $mail->addBCC( $recipient["email"], $recipient["name"] );
                    break;
                case "reply_to":
                    $mail->addReplyTo( $recipient["email"], $recipient["name"] );
                    break;
                default:
                    $mail->addAddress( $recipient["email"], $recipient["name"] );
                    break;
            }
        }
    }

    /**
     * @return array{email: string, name: string}
     */
    private static function parse_email_address( string $address ) : array {
        if ( preg_match( '/^(.*)<(.+)>$/', $address, $matches ) ) {
            return [
                "name"  => trim( $matches[1], " \"'" ),
                "email" => sanitize_email( trim( $matches[2] ) ),
            ];
        }
        return [
            "name"  => "",
            "email" => sanitize_email( $address ),
        ];
    }

    private static function base64url_encode( string $data ) : string {
        return rtrim( strtr( base64_encode( $data ), "+/", "-_" ), "=" );
    }

}
