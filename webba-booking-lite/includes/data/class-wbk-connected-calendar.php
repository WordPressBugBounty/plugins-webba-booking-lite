<?php
if (!defined("ABSPATH")) {
    exit();
}

class WBK_Connected_Calendar extends WBK_Model_Object
{
    public function __construct($id = null)
    {
        $this->table_name = get_option("wbk_db_prefix", "") . "wbk_connected_calendars";
        parent::__construct($id);
    }

    /**
     * Get calendar name
     * @return string calendar name
     */
    public function get_name()
    {
        if (!isset($this->fields["name"])) {
            return "";
        }
        return $this->fields["name"];
    }

    /**
     * Set calendar name
     * @param string $name calendar name
     * @return bool true if set successfully
     */
    public function set_name($name)
    {
        if (!is_string($name)) {
            return false;
        }
        $this->fields["name"] = sanitize_text_field($name);
        return true;
    }

    /**
     * Get calendar provider
     * @return string calendar provider (google or outlook)
     */
    public function get_provider()
    {
        if (!isset($this->fields["provider"])) {
            return "google";
        }
        return $this->fields["provider"];
    }

    /**
     * Set calendar provider
     * @param string $provider calendar provider (google or outlook)
     * @return bool true if set successfully
     */
    public function set_provider($provider)
    {
        if (!is_string($provider) || !in_array($provider, ["google", "outlook"], true)) {
            return false;
        }
        $this->fields["provider"] = $provider;
        return true;
    }

    /**
     * Check if easy auth is enabled
     * @return bool true if easy auth is enabled
     */
    public function get_easy_auth()
    {
        if (!isset($this->fields["easy_auth"])) {
            return false;
        }
        return $this->fields["easy_auth"] === "yes" || $this->fields["easy_auth"] === true;
    }

    /**
     * Set easy auth
     * @param bool|string $enabled true/false or 'yes'/'no'
     * @return bool true if set successfully
     */
    public function set_easy_auth($enabled)
    {
        if (is_bool($enabled)) {
            $this->fields["easy_auth"] = $enabled ? "yes" : "";
        } elseif (is_string($enabled) && in_array($enabled, ["yes", ""], true)) {
            $this->fields["easy_auth"] = $enabled;
        } else {
            return false;
        }
        return true;
    }

    /**
     * Get user ID
     * @return int user ID
     */
    public function get_user_id()
    {
        if (!isset($this->fields["user_id"])) {
            return 0;
        }
        return (int) $this->fields["user_id"];
    }

    /**
     * Set user ID
     * @param int $user_id user ID
     * @return bool true if set successfully
     */
    public function set_user_id($user_id)
    {
        if (!is_numeric($user_id)) {
            return false;
        }
        $this->fields["user_id"] = (int) $user_id;
        return true;
    }

    /**
     * Get Google calendar ID (ggid)
     * @return string Google calendar ID
     */
    public function get_in_provider_id()
    {
        if (!isset($this->fields["in_provider_id"])) {
            return "";
        }
        return $this->fields["in_provider_id"];
    }

    /**
     * Set Google calendar ID (ggid)
     * @param string $ggid Google calendar ID
     * @return bool true if set successfully
     */
    public function set_in_provider_id($in_provider_id)
    {
        if (!is_string($in_provider_id)) {
            return false;
        }
        $this->fields["in_provider_id"] = sanitize_text_field($in_provider_id);
        return true;
    }

    /**
     * Get calendar mode
     * @return string calendar mode
     */
    public function get_mode()
    {
        if (!isset($this->fields["mode"])) {
            return "One-way";
        }
        return $this->fields["mode"];
    }

    /**
     * Set calendar mode
     * @param string $mode calendar mode
     * @return bool true if set successfully
     */
    public function set_mode($mode)
    {
        if (!is_string($mode)) {
            return false;
        }
        $this->fields["mode"] = sanitize_text_field($mode);
        return true;
    }

    /**
     * Get access token
     * @return string access token
     */
    public function get_access_token()
    {
        if (!isset($this->fields["access_token"])) {
            return "";
        }
        return $this->fields["access_token"];
    }

    /**
     * Set access token
     * @param string $access_token access token
     * @return bool true if set successfully
     */
    public function set_access_token($access_token)
    {
        if (!is_string($access_token)) {
            return false;
        }
        $this->fields["access_token"] = $access_token;
        return true;
    }

    /**
     * Check if calendar is for Google provider
     * @return bool true if provider is google
     */
    public function is_google()
    {
        return $this->get_provider() === "google";
    }

    /**
     * Check if calendar is for Outlook provider
     * @return bool true if provider is outlook
     */
    public function is_outlook()
    {
        return $this->get_provider() === "outlook";
    }
}
