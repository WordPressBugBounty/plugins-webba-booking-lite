<?php

defined('ABSPATH') or exit;

/**
 * Class WBK_Form_Builder_Utils
 *
 * Utility class for form builder
 *
 * @package WebbaBooking
 */
class WBK_Form_Builder_Utils
{
    /**
     * Get default form fields
     * @return array default form fields
     */
    public static function get_default_fields(): array
    {
        $fields = [];

        $fields = json_decode(
            '[{
                "type": "text",
                "slug": "first_name",
                "required": true,
                "placeholder": "First Name",
                "defaultValue": "",
                "width": "half-width"
            },
            {
                "type": "text",
                "slug": "last_name",
                "required": false,
                "placeholder": "Last Name",
                "defaultValue": "",
                "width": "half-width"
            },
            {
                "type": "email",
                "slug": "email",
                "required": true,
                "placeholder": "Email address",
                "defaultValue": "",
                "width": "half-width"
            },
            {
                "type": "phone",
                "slug": "phone",
                "required": false,
                "placeholder": "Phone number",
                "defaultValue": "",
                "width": "half-width"
            }
        ]',
            true
        );

        return $fields;
    }
}
