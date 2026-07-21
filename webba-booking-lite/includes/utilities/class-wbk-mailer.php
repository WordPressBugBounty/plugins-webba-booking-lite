<?php
if (!defined("ABSPATH")) {
    exit();
}

class WBK_Mailer
{
    /**
     * Temporary flag to deactivate mailer functionality.
     */
    private const TEMPORARILY_DISABLED = false;

    /**
     * Resource id passed to Webba Connect as calendar_id for site-level Gmail tokens.
     */
    private const GMAIL_RESOURCE_ID = "gmail";

    /**
     * Transient/option key for short-lived Gmail access token cache.
     */
    private const GMAIL_TOKEN_CACHE_OPTION = "wbk_gmail_token_cache";

    /**
     * Refresh token cache this many seconds before Connect expiry.
     */
    private const GMAIL_TOKEN_EXPIRY_BUFFER = 60;

    public static function init(): void
    {
        if (self::TEMPORARILY_DISABLED) {
            return;
        }

        add_action("phpmailer_init", [__CLASS__, "configure_phpmailer"]);
    }

    public static function is_smtp_enabled(): bool
    {
        return get_option("wbk_smtp_enabled", "") === "yes";
    }

    public static function is_gmail_enabled(): bool
    {
        return get_option("wbk_gmail_enabled", "") === "yes";
    }

    /**
     * Gmail OAuth takes precedence over classic SMTP when both are enabled.
     */
    public static function get_active_transport(): string
    {
        if (self::is_gmail_enabled()) {
            return "gmail";
        }

        if (self::is_smtp_enabled()) {
            return "smtp";
        }

        return "default";
    }

    /**
     * Email address of the authorized Gmail account (XOAUTH2 username).
     */
    public static function get_gmail_email(): string
    {
        $email = trim((string) get_option("wbk_gmail_email", ""));
        if ($email !== "" && WBK_Validator::check_email($email)) {
            return $email;
        }

        $from_email = trim((string) get_option("wbk_from_email", ""));
        if ($from_email !== "" && WBK_Validator::check_email($from_email)) {
            return $from_email;
        }

        return "";
    }

    /**
     * @return string|false
     */
    public static function get_gmail_authorization_url()
    {
        if (!class_exists("WBK_Webba_Connect")) {
            return false;
        }

        $webba_connect = new WBK_Webba_Connect();
        return $webba_connect->get_gmail_authorization_url(self::GMAIL_RESOURCE_ID);
    }

    /**
     * @return string|false
     */
    public static function get_gmail_revoke_url()
    {
        if (!class_exists("WBK_Webba_Connect")) {
            return false;
        }

        $webba_connect = new WBK_Webba_Connect();
        return $webba_connect->get_gmail_revoke_url(self::GMAIL_RESOURCE_ID);
    }

    /**
     * Auth status payload for admin UI / REST (mirrors calendar auth shape).
     *
     * @return array{
     *     isAuthenticated: bool,
     *     internalError: bool,
     *     authUrl?: string|false|null,
     *     revokeUrl?: string|false|null,
     *     email?: string
     * }
     */
    public static function get_gmail_auth_parameters(): array
    {
        if (!class_exists("WBK_Webba_Connect")) {
            return [
                "isAuthenticated" => false,
                "internalError" => true,
            ];
        }

        $webba_connect = new WBK_Webba_Connect();
        if ($webba_connect->check_backend_health() === false) {
            return [
                "isAuthenticated" => false,
                "internalError" => true,
            ];
        }

        if (!self::is_gmail_connected()) {
            return [
                "isAuthenticated" => false,
                "internalError" => false,
                "authUrl" => self::get_gmail_authorization_url(),
                "email" => self::get_gmail_email(),
            ];
        }

        return [
            "isAuthenticated" => true,
            "internalError" => false,
            "revokeUrl" => self::get_gmail_revoke_url(),
            "email" => self::get_gmail_email(),
        ];
    }

    public static function is_gmail_connected(): bool
    {
        $token = self::get_gmail_access_token();
        return is_string($token) && $token !== "";
    }

    /**
     * Returns a valid Gmail access token from cache or Webba Connect.
     *
     * @return string|false
     */
    public static function get_gmail_access_token()
    {
        $cached = self::get_cached_gmail_access_token();
        if ($cached !== false) {
            return $cached;
        }

        $token_data = self::fetch_gmail_access_token_from_connect();
        if ($token_data === false || empty($token_data["access_token"])) {
            self::clear_gmail_token_cache();
            return false;
        }

        self::cache_gmail_access_token($token_data);

        if (!empty($token_data["email"]) && is_string($token_data["email"])) {
            $email = sanitize_email($token_data["email"]);
            if ($email !== "") {
                update_option("wbk_gmail_email", $email);
            }
        }

        return (string) $token_data["access_token"];
    }

    /**
     * Fetch token payload from Webba Connect (tokens are stored remotely).
     *
     * @return array<string, mixed>|false
     */
    public static function fetch_gmail_access_token_from_connect()
    {
        if (!class_exists("WBK_Webba_Connect")) {
            return false;
        }

        $webba_connect = new WBK_Webba_Connect();
        return $webba_connect->get_gmail_access_token(self::GMAIL_RESOURCE_ID);
    }

    public static function clear_gmail_token_cache(): void
    {
        delete_option(self::GMAIL_TOKEN_CACHE_OPTION);
    }

    /**
     * Revoke Gmail authorization on Connect and clear local cache/state.
     *
     * @return bool
     */
    public static function revoke_gmail_authorization(): bool
    {
        $revoke_url = self::get_gmail_revoke_url();
        if (is_string($revoke_url) && $revoke_url !== "") {
            wp_remote_get($revoke_url, [
                "timeout" => 15,
                "sslverify" => true,
            ]);
        }

        self::clear_gmail_token_cache();
        update_option("wbk_gmail_email", "");

        return true;
    }

    public static function configure_phpmailer($phpmailer): void
    {
        if (self::TEMPORARILY_DISABLED) {
            return;
        }

        if (self::get_active_transport() === "gmail") {
            self::configure_gmail_phpmailer($phpmailer);
            return;
        }

        if (!self::is_smtp_enabled()) {
            return;
        }

        $host = trim((string) get_option("wbk_smtp_host", ""));
        if ($host === "") {
            return;
        }

        $phpmailer->isSMTP();
        $phpmailer->Host = $host;
        $phpmailer->Port = max(1, (int) get_option("wbk_smtp_port", 587));

        $encryption = sanitize_text_field(get_option("wbk_smtp_encryption", "tls"));
        if ($encryption === "ssl") {
            $phpmailer->SMTPSecure = "ssl";
        } elseif ($encryption === "tls") {
            $phpmailer->SMTPSecure = "tls";
        } else {
            $phpmailer->SMTPSecure = "";
            $phpmailer->SMTPAutoTLS = false;
        }

        $use_auth = get_option("wbk_smtp_auth", "") === "yes";
        $phpmailer->SMTPAuth = $use_auth;

        if ($use_auth) {
            $phpmailer->Username = (string) get_option("wbk_smtp_username", "");
            $phpmailer->Password = (string) get_option("wbk_smtp_password", "");
        }
    }

    /**
     * Configure PHPMailer for Gmail SMTP with XOAUTH2.
     *
     * @param mixed $phpmailer
     */
    private static function configure_gmail_phpmailer($phpmailer): void
    {
        $email = self::get_gmail_email();
        $access_token = self::get_gmail_access_token();

        if ($email === "" || $access_token === false || $access_token === "") {
            return;
        }

        if (!interface_exists(\PHPMailer\PHPMailer\OAuthTokenProvider::class)) {
            return;
        }

        $phpmailer->isSMTP();
        $phpmailer->Host = "smtp.gmail.com";
        $phpmailer->Port = 587;
        $phpmailer->SMTPSecure = "tls";
        $phpmailer->SMTPAuth = true;
        $phpmailer->AuthType = "XOAUTH2";
        $phpmailer->Username = $email;

        $oauth_email = $email;
        $oauth_token = (string) $access_token;

        $phpmailer->setOAuth(
            new class ($oauth_email, $oauth_token) implements
                \PHPMailer\PHPMailer\OAuthTokenProvider {
                /** @var string */
                private $email;

                /** @var string */
                private $access_token;

                public function __construct(string $email, string $access_token)
                {
                    $this->email = $email;
                    $this->access_token = $access_token;
                }

                public function getOauth64(): string
                {
                    return base64_encode(
                        "user=" .
                            $this->email .
                            "\001auth=Bearer " .
                            $this->access_token .
                            "\001\001",
                    );
                }
            },
        );
    }

    /**
     * @return array{success: bool, message: string}
     */
    public static function send_test_email(string $to): array
    {
        if (self::TEMPORARILY_DISABLED) {
            return [
                "success" => false,
                "message" => __(
                    "Mailer functionality is temporarily disabled.",
                    "webba-booking-lite",
                ),
            ];
        }

        $transport = self::get_active_transport();

        if ($transport === "default") {
            return [
                "success" => false,
                "message" => __(
                    "Enable Gmail or SMTP and save your settings before sending a test email.",
                    "webba-booking-lite",
                ),
            ];
        }

        if (!WBK_Validator::check_email($to)) {
            return [
                "success" => false,
                "message" => __("Please enter a valid email address.", "webba-booking-lite"),
            ];
        }

        if ($transport === "gmail") {
            $gmail_ready = self::validate_gmail_ready_for_send();
            if ($gmail_ready !== true) {
                return [
                    "success" => false,
                    "message" => $gmail_ready,
                ];
            }
        } elseif (trim((string) get_option("wbk_smtp_host", "")) === "") {
            return [
                "success" => false,
                "message" => __("SMTP host is required.", "webba-booking-lite"),
            ];
        }

        $error_message = "";
        $failed_callback = function ($wp_error) use (&$error_message) {
            if (is_wp_error($wp_error)) {
                $error_message = $wp_error->get_error_message();
            }
        };

        add_action("wp_mail_failed", $failed_callback, 10, 1);

        $from_name = stripslashes((string) get_option("wbk_from_name", ""));
        $from_email =
            $transport === "gmail"
                ? self::get_gmail_email()
                : (string) get_option("wbk_from_email", "");
        $headers = [];
        if ($from_email !== "") {
            $headers[] = "From: " . $from_name . " <" . $from_email . ">";
        }

        if ($transport === "gmail") {
            $subject = sprintf(
                /* translators: %s: site name */
                __("Gmail test from %s", "webba-booking-lite"),
                get_bloginfo("name"),
            );
            $message = sprintf(
                /* translators: %s: site name */
                __(
                    "This is a test email sent from the Webba Booking Gmail settings on %s. If you received it, your Gmail authorization is working.",
                    "webba-booking-lite",
                ),
                get_bloginfo("name"),
            );
        } else {
            $subject = sprintf(
                /* translators: %s: site name */
                __("SMTP test from %s", "webba-booking-lite"),
                get_bloginfo("name"),
            );
            $message = sprintf(
                /* translators: %s: site name */
                __(
                    "This is a test email sent from the Webba Booking SMTP settings on %s. If you received it, your SMTP configuration is working.",
                    "webba-booking-lite",
                ),
                get_bloginfo("name"),
            );
        }

        add_filter("wp_mail_content_type", "wbk_wp_mail_content_type");
        $sent = wp_mail($to, $subject, $message, $headers);
        remove_filter("wp_mail_content_type", "wbk_wp_mail_content_type");
        remove_action("wp_mail_failed", $failed_callback, 10);

        if (!$sent || $error_message !== "") {
            return [
                "success" => false,
                "message" =>
                    $error_message !== ""
                        ? $error_message
                        : __("Failed to send test email.", "webba-booking-lite"),
            ];
        }

        return [
            "success" => true,
            "message" => __("Test email sent successfully.", "webba-booking-lite"),
        ];
    }

    /**
     * @return true|string True when ready, otherwise an error message.
     */
    private static function validate_gmail_ready_for_send()
    {
        if (self::get_gmail_email() === "") {
            return __(
                "Gmail account email is required. Authorize Gmail or set From: email.",
                "webba-booking-lite",
            );
        }

        if (!self::is_gmail_connected()) {
            return __(
                "Gmail is not authorized. Connect your Google account first.",
                "webba-booking-lite",
            );
        }

        return true;
    }

    /**
     * @return string|false
     */
    private static function get_cached_gmail_access_token()
    {
        $cached = get_option(self::GMAIL_TOKEN_CACHE_OPTION, null);
        if (!is_array($cached) || empty($cached["access_token"])) {
            return false;
        }

        $expires_at = isset($cached["expires_at"]) ? (int) $cached["expires_at"] : 0;
        if ($expires_at > 0 && $expires_at <= time() + self::GMAIL_TOKEN_EXPIRY_BUFFER) {
            return false;
        }

        return (string) $cached["access_token"];
    }

    /**
     * @param array<string, mixed> $token_data
     */
    private static function cache_gmail_access_token(array $token_data): void
    {
        $expires_at = 0;

        if (!empty($token_data["expiry_date"])) {
            $expiry = $token_data["expiry_date"];
            // Connect may return ms (JS Date) or seconds.
            $expires_at = (int) $expiry;
            if ($expires_at > 9999999999) {
                $expires_at = (int) floor($expires_at / 1000);
            }
        } elseif (!empty($token_data["expires_in"])) {
            $expires_at = time() + (int) $token_data["expires_in"];
        } else {
            // Fallback short cache when Connect does not send expiry.
            $expires_at = time() + 300;
        }

        update_option(
            self::GMAIL_TOKEN_CACHE_OPTION,
            [
                "access_token" => (string) $token_data["access_token"],
                "expires_at" => $expires_at,
                "email" => isset($token_data["email"])
                    ? sanitize_email((string) $token_data["email"])
                    : "",
            ],
            false,
        );
    }
}
