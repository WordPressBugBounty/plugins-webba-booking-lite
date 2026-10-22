<?php
if (!defined("ABSPATH")) {
    exit();
}

/**
 * Authenticated encryption for credentials stored outside plaintext DB values.
 * Uses AES-256-GCM with a key derived from WordPress salts (wp-config, not DB).
 */
class WBK_Credential_Crypto
{
    const CIPHER = "aes-256-gcm";
    const PREFIX = "wbkenc:v1:";

    /**
     * @return string 32-byte binary key
     */
    private static function get_key()
    {
        $material = "";
        if (defined("AUTH_KEY")) {
            $material .= AUTH_KEY;
        }
        if (defined("AUTH_SALT")) {
            $material .= AUTH_SALT;
        }
        if (defined("SECURE_AUTH_KEY")) {
            $material .= SECURE_AUTH_KEY;
        }
        if ($material === "") {
            $material = "wbk-fallback-key-" . (defined("ABSPATH") ? ABSPATH : "webba");
        }
        return hash("sha256", $material, true);
    }

    /**
     * Encrypt a string for storage.
     *
     * @param string $plaintext
     * @return string Encoded ciphertext or empty string on failure
     */
    public static function encrypt($plaintext)
    {
        if (!is_string($plaintext) || $plaintext === "") {
            return "";
        }
        if (!function_exists("openssl_encrypt")) {
            return "";
        }

        $iv_length = openssl_cipher_iv_length(self::CIPHER);
        if (!$iv_length) {
            return "";
        }
        $iv = random_bytes($iv_length);
        $tag = "";
        $ciphertext = openssl_encrypt(
            $plaintext,
            self::CIPHER,
            self::get_key(),
            OPENSSL_RAW_DATA,
            $iv,
            $tag,
            "",
            16
        );
        if ($ciphertext === false) {
            return "";
        }

        return self::PREFIX . base64_encode($iv . $tag . $ciphertext);
    }

    /**
     * Decrypt a previously encrypted string.
     *
     * @param string $payload
     * @return string|false Plaintext or false on failure
     */
    public static function decrypt($payload)
    {
        if (!is_string($payload) || $payload === "") {
            return false;
        }
        if (strpos($payload, self::PREFIX) !== 0) {
            return false;
        }
        if (!function_exists("openssl_decrypt")) {
            return false;
        }

        $raw = base64_decode(substr($payload, strlen(self::PREFIX)), true);
        if ($raw === false || strlen($raw) < 29) {
            return false;
        }

        $iv_length = openssl_cipher_iv_length(self::CIPHER);
        if (!$iv_length) {
            return false;
        }
        $iv = substr($raw, 0, $iv_length);
        $tag = substr($raw, $iv_length, 16);
        $ciphertext = substr($raw, $iv_length + 16);

        $plaintext = openssl_decrypt(
            $ciphertext,
            self::CIPHER,
            self::get_key(),
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );

        return $plaintext === false ? false : $plaintext;
    }

    /**
     * Whether a stored value looks like an encrypted payload.
     *
     * @param string $payload
     * @return bool
     */
    public static function is_encrypted($payload)
    {
        return is_string($payload) && strpos($payload, self::PREFIX) === 0;
    }
}
