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

        $fields = array_map(function($field) {
            if($field['type'] === 'checkbox') {
                $field['checkboxText'] = get_option('webba_form_field_' . $field['slug'], $field['checkboxText']);
            }else{
                $field['placeholder'] = get_option('webba_form_field_' . $field['slug'], $field['placeholder']);
            }
            
            return $field;
        }, $fields);

        return $fields;
    }

    /**
     * Get all fields merged from all forms
     *
     * @return array
     */
    public static function get_all_fields_merged(): array
    {
        $forms = WBK_Model_Utils::get_forms();
        $fields = [];
        
        foreach ($forms as $id => $name) {
            $form = new WBK_Form($id);
            $fields_temp = $form->get_fields();
            
            if (is_array($fields_temp)) {
                $fields_temp = array_map(function($field) use ($id) {
                    $field['form_id'] = $id;
                    return $field;
                }, $fields_temp);
                
                $fields = array_merge($fields, $fields_temp);
            }
        }

        $fields = array_merge($fields, self::get_default_fields());

        $fields_result = [];

        foreach ($fields as $field) {
            $slug = isset($field['slug']) ? $field['slug'] : '';
            if ($slug !== '' && !isset($fields_result[$slug])) {
                $fields_result[$slug] = $field;
            }
        }

        return array_values($fields_result);
    }
}
