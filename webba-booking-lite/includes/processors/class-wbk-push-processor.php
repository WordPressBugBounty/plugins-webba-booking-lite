<?php

if ( !defined( "ABSPATH" ) ) {
    exit;
}
use Brick\Math\BigInteger;
use Jose\Component\Core\Util\Ecc\NistCurve;
use Jose\Component\Core\Util\Ecc\PrivateKey;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\VAPID;
use Minishlink\WebPush\WebPush;
/**
 * Staff and administrator Web Push processor: VAPID keys, subscriptions, and sending.
 */
class WBK_Push_Processor {
    const OPTION_PUBLIC_KEY = "wbk_push_vapid_public";

    const OPTION_PRIVATE_KEY = "wbk_push_vapid_private";

    /**
     * Last dispatch error shown on failed test sends.
     *
     * @var string
     */
    private static $last_dispatch_error = "";

    /**
     * Register rewrite rules and service worker output.
     *
     * @return void
     */
    public static function init() : void {
        add_action( "init", [self::class, "maybe_serve_service_worker"], 0 );
        add_action( "init", [self::class, "register_rewrite"] );
        add_filter( "query_vars", [self::class, "register_query_vars"] );
        add_filter(
            "redirect_canonical",
            [self::class, "prevent_service_worker_redirect"],
            10,
            2
        );
        add_action( "wp_ajax_wbk_push_service_worker", [self::class, "output_service_worker"] );
        add_action( "wp_ajax_nopriv_wbk_push_service_worker", [self::class, "output_service_worker"] );
        add_action( "template_redirect", [self::class, "maybe_serve_service_worker"], 0 );
        add_action( "admin_init", [self::class, "ensure_vapid_keys"] );
    }

    /**
     * Register the service worker rewrite rule.
     *
     * @return void
     */
    public static function register_rewrite() : void {
        add_rewrite_rule( "^wbk-push-sw\\.js\$", "index.php?wbk_push_sw=1", "top" );
    }

    /**
     * Expose the service worker query var.
     *
     * @param array $vars Query vars.
     * @return array
     */
    public static function register_query_vars( array $vars ) : array {
        $vars[] = "wbk_push_sw";
        return $vars;
    }

    /**
     * Stop WordPress from issuing a canonical redirect for the service worker URL.
     * Service worker registration fails if the script response is a redirect.
     *
     * @param string|false $redirect Canonical redirect URL.
     * @param string       $request  Requested URL.
     * @return string|false
     */
    public static function prevent_service_worker_redirect( $redirect, $request ) {
        if ( self::is_service_worker_request() ) {
            return false;
        }
        return $redirect;
    }

    /**
     * Serve the service worker when requested via the pretty URL.
     *
     * @return void
     */
    public static function maybe_serve_service_worker() : void {
        if ( !self::is_service_worker_request() ) {
            return;
        }
        self::output_service_worker();
    }

    /**
     * Whether the current request is for the push service worker script.
     *
     * @return bool
     */
    public static function is_service_worker_request() : bool {
        $path = wp_parse_url( ( isset( $_SERVER["REQUEST_URI"] ) ? $_SERVER["REQUEST_URI"] : "" ), PHP_URL_PATH );
        if ( is_string( $path ) && substr( $path, -strlen( "/wbk-push-sw.js" ) ) === "/wbk-push-sw.js" ) {
            return true;
        }
        return isset( $_GET["wbk_push_sw"] ) || (string) get_query_var( "wbk_push_sw" ) === "1";
    }

    /**
     * Output the service worker JavaScript with a root scope header.
     *
     * @return void
     */
    public static function output_service_worker() : void {
        $file = WP_WEBBA_BOOKING__PLUGIN_DIR . "/public/js/wbk-push-sw.js";
        if ( !file_exists( $file ) ) {
            status_header( 404 );
            exit;
        }
        nocache_headers();
        status_header( 200 );
        header( "Content-Type: application/javascript; charset=UTF-8" );
        header( "Service-Worker-Allowed: /" );
        readfile( $file );
        exit;
    }

    /**
     * Whether push notifications are available on the current plan.
     *
     * @return bool
     */
    public static function is_available() : bool {
        return WBK_Feature_Gate::have_required_plan( "premium" );
    }

    /**
     * Whether push sending is turned on in settings.
     *
     * @return bool
     */
    public static function is_enabled() : bool {
        return self::is_available() && (get_option( "wbk_push_enabled", "" ) === "true" || self::has_any_subscription());
    }

    /**
     * Sanitize a Web Push p256dh or auth key.
     *
     * @param string $value Base64url key.
     * @return string
     */
    public static function sanitize_subscription_key( $value ) : string {
        $sanitized = preg_replace( "/[^A-Za-z0-9\\-_]/", "", (string) $value );
        return ( is_string( $sanitized ) ? $sanitized : "" );
    }

    /**
     * Create and store VAPID keys when they are missing.
     *
     * @return array{publicKey?: string, privateKey?: string, error?: string}
     */
    public static function ensure_vapid_keys() : array {
        $public_key = (string) get_option( self::OPTION_PUBLIC_KEY, "" );
        $private_key = (string) get_option( self::OPTION_PRIVATE_KEY, "" );
        if ( $public_key !== "" && $private_key !== "" ) {
            return [
                "publicKey"  => $public_key,
                "privateKey" => $private_key,
            ];
        }
        $keys = self::create_vapid_keys();
        if ( !isset( $keys["publicKey"], $keys["privateKey"] ) ) {
            return $keys;
        }
        update_option( self::OPTION_PUBLIC_KEY, $keys["publicKey"], false );
        update_option( self::OPTION_PRIVATE_KEY, $keys["privateKey"], false );
        return $keys;
    }

    /**
     * Generate a VAPID key pair using OpenSSL, then PHP ECC when OpenSSL cannot create EC keys.
     *
     * @return array{publicKey?: string, privateKey?: string, error?: string}
     */
    private static function create_vapid_keys() : array {
        $generators = [
            "OpenSSL" => [self::class, "create_vapid_keys_with_openssl"],
            "ECC"     => [self::class, "create_vapid_keys_with_ecc"],
            "WebPush" => static function () {
                if ( !class_exists( VAPID::class ) ) {
                    throw new Exception("Web Push VAPID generator is not available.");
                }
                return VAPID::createVapidKeys();
            },
        ];
        foreach ( $generators as $name => $generator ) {
            try {
                $keys = $generator();
                if ( isset( $keys["publicKey"], $keys["privateKey"] ) ) {
                    return $keys;
                }
            } catch ( Throwable $exception ) {
                error_log( "Webba Booking {$name} VAPID key generation failed: " . $exception->getMessage() );
            }
        }
        return [
            "error" => __( "Could not set up browser notifications. OpenSSL elliptic-curve support is missing on this server.", "webba-booking-lite" ),
        ];
    }

    /**
     * Generate VAPID keys with OpenSSL. Some local PHP builds need an explicit config file.
     *
     * @return array{publicKey: string, privateKey: string}
     */
    private static function create_vapid_keys_with_openssl() : array {
        if ( !function_exists( "openssl_pkey_new" ) ) {
            throw new Exception("OpenSSL is not available.");
        }
        self::drain_openssl_errors();
        $config_path = self::create_openssl_config_file();
        $attempts = [[]];
        if ( $config_path !== "" ) {
            $attempts[] = [
                "config" => $config_path,
            ];
        }
        $key = false;
        $last_error = "";
        foreach ( $attempts as $options ) {
            $key = openssl_pkey_new( array_merge( [
                "private_key_type" => OPENSSL_KEYTYPE_EC,
                "curve_name"       => "prime256v1",
            ], $options ) );
            if ( $key !== false ) {
                break;
            }
            $last_error = self::drain_openssl_errors();
        }
        if ( $config_path !== "" ) {
            self::delete_openssl_config_file( $config_path );
        }
        if ( $key === false ) {
            throw new Exception(( $last_error !== "" ? "OpenSSL could not create an EC key: " . $last_error : "OpenSSL could not create an EC key." ));
        }
        $details = openssl_pkey_get_details( $key );
        if ( PHP_VERSION_ID < 80000 && is_resource( $key ) ) {
            openssl_pkey_free( $key );
        }
        if ( $details === false || empty( $details["ec"]["x"] ) || empty( $details["ec"]["y"] ) || empty( $details["ec"]["d"] ) ) {
            throw new Exception("OpenSSL did not return EC key details.");
        }
        $public_key = chr( 4 ) . self::pad_key_bytes( $details["ec"]["x"], 32 ) . self::pad_key_bytes( $details["ec"]["y"], 32 );
        $private_key = self::pad_key_bytes( $details["ec"]["d"], 32 );
        return [
            "publicKey"  => self::base64url_encode( $public_key ),
            "privateKey" => self::base64url_encode( $private_key ),
        ];
    }

    /**
     * Generate VAPID keys with PHP ECC when openssl_pkey_new cannot create prime256v1 keys.
     *
     * @return array{publicKey: string, privateKey: string}
     */
    private static function create_vapid_keys_with_ecc() : array {
        if ( !class_exists( NistCurve::class ) ) {
            throw new Exception("ECC key generator is not available.");
        }
        $curve = NistCurve::curve256();
        $order = $curve->getGenerator()->getOrder();
        do {
            $secret = BigInteger::fromBytes( random_bytes( 32 ), false );
        } while ( $secret->compareTo( BigInteger::one() ) < 0 || $secret->compareTo( $order ) >= 0 );
        $private = PrivateKey::create( $secret );
        $public = $curve->createPublicKey( $private );
        $x = self::pad_key_bytes( $public->getPoint()->getX()->toBytes( false ), 32 );
        $y = self::pad_key_bytes( $public->getPoint()->getY()->toBytes( false ), 32 );
        $d = self::pad_key_bytes( $private->getSecret()->toBytes( false ), 32 );
        return [
            "publicKey"  => self::base64url_encode( chr( 4 ) . $x . $y ),
            "privateKey" => self::base64url_encode( $d ),
        ];
    }

    /**
     * Pad a binary coordinate or secret to a fixed length.
     *
     * @param string $value  Binary value.
     * @param int    $length Target length.
     * @return string
     */
    private static function pad_key_bytes( $value, $length ) : string {
        if ( strlen( $value ) > $length ) {
            $value = substr( $value, -$length );
        }
        return str_pad(
            $value,
            $length,
            "\x00",
            STR_PAD_LEFT
        );
    }

    /**
     * Collect and clear the OpenSSL error queue.
     *
     * @return string
     */
    private static function drain_openssl_errors() : string {
        $errors = [];
        if ( !function_exists( "openssl_error_string" ) ) {
            return "";
        }
        while ( ($message = openssl_error_string()) !== false ) {
            $errors[] = $message;
        }
        return implode( "; ", $errors );
    }

    /**
     * Write a temporary openssl.cnf used when the PHP build has no default config.
     *
     * @return string
     */
    private static function create_openssl_config_file() : string {
        $path = wp_tempnam( "wbk-openssl" );
        if ( $path === false ) {
            return "";
        }
        $written = file_put_contents( $path, "HOME = .\nRANDFILE = {$path}.rnd\n\n[req]\ndistinguished_name = dn\n[dn]\n" );
        if ( $written === false ) {
            self::delete_openssl_config_file( $path );
            return "";
        }
        return $path;
    }

    /**
     * Remove a temporary OpenSSL config file.
     *
     * @param string $path Config path.
     * @return void
     */
    private static function delete_openssl_config_file( $path ) : void {
        if ( $path === "" ) {
            return;
        }
        if ( is_file( $path ) ) {
            @unlink( $path );
        }
        if ( is_file( $path . ".rnd" ) ) {
            @unlink( $path . ".rnd" );
        }
    }

    /**
     * Encode binary data as URL-safe base64 without padding.
     *
     * @param string $value Binary string.
     * @return string
     */
    private static function base64url_encode( $value ) : string {
        return rtrim( strtr( base64_encode( $value ), "+/", "-_" ), "=" );
    }

    /**
     * Public configuration for the admin subscribe UI.
     *
     * @return array
     */
    public static function get_public_config() : array {
        $keys = self::ensure_vapid_keys();
        return [
            "enabled"          => self::is_enabled(),
            "available"        => self::is_available(),
            "publicKey"        => ( isset( $keys["publicKey"] ) ? $keys["publicKey"] : "" ),
            "serviceWorkerUrl" => add_query_arg( "ver", (string) filemtime( WP_WEBBA_BOOKING__PLUGIN_DIR . "/public/js/wbk-push-sw.js" ), plugins_url( "public/js/wbk-push-sw.js", WP_WEBBA_BOOKING__PLUGIN_DIR . "/webba-booking-lite.php" ) ),
            "keyError"         => ( isset( $keys["error"] ) ? $keys["error"] : "" ),
        ];
    }

    /**
     * Send a push notification for a booking event to administrators and staff.
     *
     * @param array|int $bookings Booking IDs.
     * @param string    $trigger  Event key.
     * @return void
     */
    public static function send( $bookings, $trigger ) : void {
    }

    /**
     * Send a test notification to the current user's subscriptions.
     *
     * @param int $user_id WordPress user ID.
     * @return array{success: bool, message: string}
     */
    public static function send_test( $user_id ) : array {
        if ( !self::is_available() ) {
            return [
                "success" => false,
                "message" => __( "Browser notifications are not available on your plan.", "webba-booking-lite" ),
            ];
        }
        $subscriptions = self::get_subscriptions_for_user( (int) $user_id );
        if ( count( $subscriptions ) === 0 ) {
            return [
                "success" => false,
                "message" => __( "No browser notification subscription found. Enable browser notifications first.", "webba-booking-lite" ),
            ];
        }
        $sent = self::dispatch( $subscriptions, [
            "title" => __( "Webba Booking", "webba-booking-lite" ),
            "body"  => __( "This is a test browser notification.", "webba-booking-lite" ),
            "icon"  => get_site_icon_url( 192 ),
            "url"   => admin_url( "admin.php?page=wbk-calendar" ),
        ] );
        if ( $sent < 1 ) {
            $detail = ( self::$last_dispatch_error !== "" ? " " . self::$last_dispatch_error : "" );
            return [
                "success" => false,
                "message" => __( "Failed to send the test browser notification.", "webba-booking-lite" ) . $detail,
            ];
        }
        return [
            "success" => true,
            "message" => __( "Test browser notification sent.", "webba-booking-lite" ),
        ];
    }

    /**
     * Store or update a push subscription for a user.
     *
     * @param string $endpoint Push endpoint URL.
     * @param string $p256dh   Client public key.
     * @param string $auth     Auth secret.
     * @param int    $user_id  WordPress user ID.
     * @return bool
     */
    public static function save_subscription(
        $endpoint,
        $p256dh,
        $auth,
        $user_id
    ) : bool {
        global $wpdb;
        $table = self::get_table_name();
        $endpoint = esc_url_raw( $endpoint );
        $p256dh = self::sanitize_subscription_key( $p256dh );
        $auth = self::sanitize_subscription_key( $auth );
        $user_id = (int) $user_id;
        if ( $endpoint === "" || $p256dh === "" || $auth === "" || $user_id < 1 ) {
            return false;
        }
        $existing_id = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE endpoint = %s", $endpoint ) );
        if ( $existing_id ) {
            $updated = $wpdb->update(
                $table,
                [
                    "p256dh"  => $p256dh,
                    "auth"    => $auth,
                    "user_id" => $user_id,
                ],
                [
                    "id" => (int) $existing_id,
                ],
                ["%s", "%s", "%d"],
                ["%d"]
            );
            if ( $updated === false ) {
                return false;
            }
        } else {
            $inserted = $wpdb->insert( $table, [
                "endpoint"   => $endpoint,
                "p256dh"     => $p256dh,
                "auth"       => $auth,
                "user_id"    => $user_id,
                "created_at" => current_time( "mysql" ),
            ], [
                "%s",
                "%s",
                "%s",
                "%d",
                "%s"
            ] );
            if ( $inserted === false ) {
                return false;
            }
        }
        update_option( "wbk_push_enabled", "true" );
        return true;
    }

    /**
     * Remove a subscription by endpoint.
     *
     * @param string $endpoint Push endpoint URL.
     * @return bool
     */
    public static function delete_subscription( $endpoint ) : bool {
        global $wpdb;
        $table = self::get_table_name();
        $endpoint = esc_url_raw( $endpoint );
        if ( $endpoint === "" ) {
            return false;
        }
        $deleted = $wpdb->delete( $table, [
            "endpoint" => $endpoint,
        ], ["%s"] );
        if ( $deleted !== false && !self::has_any_subscription() ) {
            update_option( "wbk_push_enabled", "" );
        }
        return $deleted !== false;
    }

    /**
     * Option keys and default copy for a booking trigger.
     *
     * @param string $trigger Event key.
     * @return array|null
     */
    private static function get_event_config( $trigger ) {
        $events = [
            "booking_created_by_customer"   => [
                "enabled_admin"  => "wbk_push_send_on_booking_admin",
                "enabled_staff"  => "wbk_push_send_on_booking_staff",
                "enabled_legacy" => "wbk_push_send_on_booking",
                "title"          => "wbk_push_title_on_booking",
                "body"           => "wbk_push_message_on_booking",
                "default_title"  => __( "New booking: #service_name", "webba-booking-lite" ),
                "default_body"   => __( "#customer_name, #appointment_day #appointment_time", "webba-booking-lite" ),
            ],
            "booking_cancelled_by_customer" => [
                "enabled_admin"  => "wbk_push_send_on_cancellation_admin",
                "enabled_staff"  => "wbk_push_send_on_cancellation_staff",
                "enabled_legacy" => "wbk_push_send_on_cancellation",
                "title"          => "wbk_push_title_on_cancellation",
                "body"           => "wbk_push_message_on_cancellation",
                "default_title"  => __( "Booking cancelled: #service_name", "webba-booking-lite" ),
                "default_body"   => __( "#customer_name cancelled #appointment_day #appointment_time", "webba-booking-lite" ),
            ],
            "booking_paid"                  => [
                "enabled_admin"  => "wbk_push_send_on_payment_admin",
                "enabled_staff"  => "wbk_push_send_on_payment_staff",
                "enabled_legacy" => "wbk_push_send_on_payment",
                "title"          => "wbk_push_title_on_payment",
                "body"           => "wbk_push_message_on_payment",
                "default_title"  => __( "Payment received: #service_name", "webba-booking-lite" ),
                "default_body"   => __( "#customer_name paid for #appointment_day #appointment_time", "webba-booking-lite" ),
            ],
            "admin_reminder"                => [
                "enabled_admin"  => "wbk_push_send_reminder_admin",
                "enabled_staff"  => "wbk_push_send_reminder_staff",
                "enabled_legacy" => "wbk_push_send_reminder",
                "title"          => "wbk_push_title_reminder",
                "body"           => "wbk_push_message_reminder",
                "default_title"  => __( "Reminder: #service_name", "webba-booking-lite" ),
                "default_body"   => __( "#customer_name, #appointment_day #appointment_time", "webba-booking-lite" ),
            ],
        ];
        return ( isset( $events[$trigger] ) ? $events[$trigger] : null );
    }

    /**
     * Whether a push event is enabled for administrators or staff.
     *
     * @param array  $event Event config.
     * @param string $role  admin or staff.
     * @return bool
     */
    private static function is_event_enabled_for_role( array $event, $role ) : bool {
        $option_key = ( isset( $event["enabled_" . $role] ) ? $event["enabled_" . $role] : "" );
        if ( $option_key === "" ) {
            return false;
        }
        $value = get_option( $option_key, false );
        if ( $value === false && isset( $event["enabled_legacy"] ) ) {
            $value = get_option( $event["enabled_legacy"], "true" );
        }
        if ( $value === false ) {
            $value = "true";
        }
        return $value === "true";
    }

    /**
     * WordPress user IDs with administrator access.
     *
     * @return array
     */
    private static function get_administrator_user_ids() : array {
        $user_ids = [];
        $users = get_users( [
            "fields" => ["ID"],
        ] );
        foreach ( $users as $user ) {
            $user_id = (int) $user->ID;
            if ( $user_id > 0 && user_can( $user_id, "manage_options" ) ) {
                $user_ids[] = $user_id;
            }
        }
        return array_values( array_unique( $user_ids ) );
    }

    /**
     * WordPress user IDs for staff connected to the booked services.
     *
     * @param array $booking_ids Booking IDs.
     * @return array
     */
    private static function get_staff_user_ids_for_bookings( array $booking_ids ) : array {
        $user_ids = [];
        $service_ids = [];
        foreach ( $booking_ids as $booking_id ) {
            $booking = new WBK_Booking($booking_id);
            if ( !$booking->is_loaded() ) {
                continue;
            }
            $service_id = (int) $booking->get_service();
            if ( $service_id > 0 ) {
                $service_ids[] = $service_id;
            }
            $assigned_staff_id = (int) $booking->get_staff_member();
            if ( $assigned_staff_id > 0 ) {
                $user_id = self::get_staff_wordpress_user_id( $assigned_staff_id );
                if ( $user_id > 0 ) {
                    $user_ids[] = $user_id;
                }
            }
        }
        $service_ids = array_values( array_unique( $service_ids ) );
        foreach ( $service_ids as $service_id ) {
            $staff_ids = WBK_Model_Utils::get_staff_member_ids_by_service( $service_id );
            foreach ( $staff_ids as $staff_id ) {
                $user_id = self::get_staff_wordpress_user_id( (int) $staff_id );
                if ( $user_id > 0 ) {
                    $user_ids[] = $user_id;
                }
            }
        }
        return array_values( array_unique( $user_ids ) );
    }

    /**
     * WordPress user linked to a staff member.
     *
     * @param int $staff_member_id Staff member ID.
     * @return int
     */
    private static function get_staff_wordpress_user_id( $staff_member_id ) : int {
        $staff_member = new WBK_Staff_Member($staff_member_id);
        if ( !$staff_member->is_loaded() ) {
            return 0;
        }
        $user_id = $staff_member->get( "wordpress_user" );
        if ( $user_id === false || $user_id === "" || $user_id === null ) {
            return 0;
        }
        return (int) $user_id;
    }

    /**
     * Subscriptions for a list of WordPress users.
     *
     * @param array $user_ids WordPress user IDs.
     * @return array
     */
    private static function get_subscriptions_for_users( array $user_ids ) : array {
        global $wpdb;
        $user_ids = array_values( array_unique( array_filter( array_map( "intval", $user_ids ) ) ) );
        if ( count( $user_ids ) === 0 ) {
            return [];
        }
        $table = self::get_table_name();
        $placeholders = implode( ",", array_fill( 0, count( $user_ids ), "%d" ) );
        $rows = $wpdb->get_results( $wpdb->prepare( "SELECT endpoint, p256dh, auth, user_id FROM {$table} WHERE user_id IN ({$placeholders})", ...$user_ids ), ARRAY_A );
        return ( is_array( $rows ) ? $rows : [] );
    }

    /**
     * Remove duplicate subscriptions by endpoint.
     *
     * @param array $subscriptions Subscription rows.
     * @return array
     */
    private static function unique_subscriptions( array $subscriptions ) : array {
        $unique = [];
        foreach ( $subscriptions as $row ) {
            if ( !isset( $row["endpoint"] ) || $row["endpoint"] === "" ) {
                continue;
            }
            $unique[$row["endpoint"]] = $row;
        }
        return array_values( $unique );
    }

    /**
     * Send a payload to a list of subscriptions and drop expired endpoints.
     *
     * @param array $subscriptions Subscription rows.
     * @param array $payload       Notification payload.
     * @return int Number of successful sends.
     */
    private static function dispatch( array $subscriptions, array $payload ) : int {
        self::$last_dispatch_error = "";
        if ( count( $subscriptions ) === 0 || !class_exists( WebPush::class ) ) {
            self::$last_dispatch_error = __( "No browser notification subscription is stored for this user.", "webba-booking-lite" );
            return 0;
        }
        $keys = self::ensure_vapid_keys();
        if ( !isset( $keys["publicKey"], $keys["privateKey"] ) ) {
            self::$last_dispatch_error = ( isset( $keys["error"] ) ? (string) $keys["error"] : __( "Browser notification keys are missing.", "webba-booking-lite" ) );
            return 0;
        }
        $encoded_payload = wp_json_encode( $payload );
        if ( !is_string( $encoded_payload ) ) {
            self::$last_dispatch_error = __( "The notification payload could not be encoded.", "webba-booking-lite" );
            return 0;
        }
        $sent = 0;
        $config_path = self::create_openssl_config_file();
        $previous_openssl_conf = getenv( "OPENSSL_CONF" );
        if ( $config_path !== "" ) {
            putenv( "OPENSSL_CONF=" . $config_path );
        }
        try {
            $web_push = self::create_web_push_client( $keys );
            $web_push->setAutomaticPadding( false );
            $sent = 0;
            foreach ( $subscriptions as $row ) {
                try {
                    $subscription = Subscription::create( [
                        "endpoint"        => $row["endpoint"],
                        "keys"            => [
                            "p256dh" => $row["p256dh"],
                            "auth"   => $row["auth"],
                        ],
                        "contentEncoding" => "aes128gcm",
                    ] );
                    $report = $web_push->sendOneNotification( $subscription, $encoded_payload, [
                        "urgency" => "high",
                    ] );
                } catch ( Throwable $exception ) {
                    self::$last_dispatch_error = $exception->getMessage();
                    error_log( "Webba Booking push send failed: " . $exception->getMessage() );
                    continue;
                }
                if ( $report->isSubscriptionExpired() ) {
                    self::$last_dispatch_error = __( "The browser subscription expired. Disable and enable browser notifications on this browser again.", "webba-booking-lite" );
                    self::delete_subscription( $row["endpoint"] );
                    continue;
                }
                if ( $report->isSuccess() ) {
                    $sent++;
                    continue;
                }
                $reason = trim( $report->getReason() );
                self::$last_dispatch_error = ( $reason !== "" ? $reason : __( "The notification service rejected the request.", "webba-booking-lite" ) );
                error_log( "Webba Booking push send failed: " . self::$last_dispatch_error );
            }
        } catch ( Throwable $exception ) {
            self::$last_dispatch_error = $exception->getMessage();
            error_log( "Webba Booking push client init failed: " . $exception->getMessage() );
            return 0;
        } finally {
            if ( $previous_openssl_conf === false ) {
                putenv( "OPENSSL_CONF" );
            } else {
                putenv( "OPENSSL_CONF=" . $previous_openssl_conf );
            }
            self::delete_openssl_config_file( $config_path );
        }
        return $sent;
    }

    /**
     * Create a Web Push client with VAPID auth and WordPress CA certificates.
     *
     * @param array $keys Public and private VAPID keys.
     * @return WebPush
     */
    private static function create_web_push_client( array $keys ) : WebPush {
        $client_options = [];
        $ca_bundle = ABSPATH . WPINC . "/certificates/ca-bundle.crt";
        if ( is_readable( $ca_bundle ) ) {
            $client_options["verify"] = $ca_bundle;
        }
        set_error_handler( static function ( $severity, $message ) {
            if ( strpos( (string) $message, "[WebPush]" ) !== false ) {
                return true;
            }
            return false;
        } );
        try {
            return new WebPush(
                [
                    "VAPID" => [
                        "subject"    => self::get_vapid_subject(),
                        "publicKey"  => $keys["publicKey"],
                        "privateKey" => $keys["privateKey"],
                    ],
                ],
                [
                    "TTL"     => 86400,
                    "urgency" => "high",
                ],
                30,
                $client_options
            );
        } finally {
            restore_error_handler();
        }
    }

    /**
     * VAPID subject: a public mailto address, or the site URL.
     *
     * @return string
     */
    private static function get_vapid_subject() : string {
        $admin_email = sanitize_email( get_option( "admin_email" ) );
        if ( $admin_email !== "" && self::is_usable_vapid_email( $admin_email ) ) {
            return "mailto:" . $admin_email;
        }
        $home = home_url( "/" );
        if ( strpos( $home, "https://" ) === 0 ) {
            return $home;
        }
        return "mailto:webba-booking@localhost";
    }

    /**
     * Whether an admin email is acceptable as a VAPID mailto subject.
     *
     * @param string $email Email address.
     * @return bool
     */
    private static function is_usable_vapid_email( $email ) : bool {
        if ( !is_email( $email ) ) {
            return false;
        }
        $host = strtolower( (string) substr( strrchr( $email, "@" ), 1 ) );
        if ( $host === "" ) {
            return false;
        }
        foreach ( [
            ".local",
            ".test",
            ".invalid",
            ".example"
        ] as $suffix ) {
            if ( substr( $host, -strlen( $suffix ) ) === $suffix ) {
                return false;
            }
        }
        return true;
    }

    /**
     * Whether any browser subscription is stored.
     *
     * @return bool
     */
    private static function has_any_subscription() : bool {
        global $wpdb;
        $table = self::get_table_name();
        $count = $wpdb->get_var( "SELECT COUNT(*) FROM {$table}" );
        return (int) $count > 0;
    }

    /**
     * All stored administrator subscriptions.
     *
     * @return array
     */
    private static function get_all_subscriptions() : array {
        global $wpdb;
        $table = self::get_table_name();
        $rows = $wpdb->get_results( "SELECT endpoint, p256dh, auth, user_id FROM {$table}", ARRAY_A );
        return ( is_array( $rows ) ? $rows : [] );
    }

    /**
     * Subscriptions for a WordPress user.
     *
     * @param int $user_id WordPress user ID.
     * @return array
     */
    private static function get_subscriptions_for_user( $user_id ) : array {
        global $wpdb;
        $table = self::get_table_name();
        $rows = $wpdb->get_results( $wpdb->prepare( "SELECT endpoint, p256dh, auth, user_id FROM {$table} WHERE user_id = %d", (int) $user_id ), ARRAY_A );
        return ( is_array( $rows ) ? $rows : [] );
    }

    /**
     * Push subscriptions table name.
     *
     * @return string
     */
    private static function get_table_name() : string {
        global $wpdb;
        return get_option( "wbk_db_prefix", $wpdb->prefix ) . "wbk_push_subscriptions";
    }

}
