<?php
if (!defined('ABSPATH')) {
    exit();
}

// text field
add_filter(
    'wbkdata_property_field_validation_text',
    'wbkdata_property_field_text_validator',
    10,
    4
);
function wbkdata_property_field_text_validator($input, $value, $slug, $field)
{
    if ($field->get_required() && $value == '') {
        return [
            false,
            sprintf(
                wbkdata_translate_string('%s is required'),
                $field->get_title()
            ),
        ];
    }
    $value = trim(sanitize_text_field($value));
    $ed = $field->get_extra_data();
    if (isset($ed['type'])) {
        switch ($ed['type']) {
            case 'positive_integer':
                if (!wbkdata\Validator::check_integer($value, 1, 2147483647)) {
                    return [
                        false,
                        sprintf(
                            wbkdata_translate_string(
                                '%s must be a positive integer'
                            ),
                            $field->get_title()
                        ),
                    ];
                }
                break;
            case 'none_negative_integer':
                if ($value == '' && !$field->get_required()) {
                    return [true, null];
                }
                if (!wbkdata\Validator::check_integer($value, 0, 2147483647)) {
                    return [
                        false,
                        sprintf(
                            wbkdata_translate_string(
                                '%s must be a positive integer or zero'
                            ),
                            $field->get_title()
                        ),
                    ];
                }
                break;
            case 'integer':
                if (
                    !wbkdata\Validator::check_integer(
                        $value,
                        -2147483647,
                        2147483647
                    )
                ) {
                    return [
                        false,
                        sprintf(
                            wbkdata_translate_string('%s must be an integer'),
                            $field->get_title()
                        ),
                    ];
                }
                break;
            case 'none_negative_float':
                if (!wbkdata\Validator::check_float($value, 0, 21474836470)) {
                    return [
                        false,
                        sprintf(
                            wbkdata_translate_string(
                                '%s must be a positive number or zero'
                            ),
                            $field->get_title()
                        ),
                    ];
                }
                break;
            default:
                if (strlen($value) > 255) {
                    return [
                        false,
                        sprintf(
                            wbkdata_translate_string(
                                '%s must be a maximum of 256 characters'
                            ),
                            $field->get_title()
                        ),
                    ];
                }
                break;
        }
    } else {
        if (strlen($value) > 255) {
            return [
                false,
                sprintf(
                    wbkdata_translate_string(
                        '%s must be a maximum of 256 characters'
                    ),
                    $field->get_title()
                ),
            ];
        }
    }

    return [true, $value];
}

// redio field
add_filter(
    'wbkdata_property_field_validation_radio',
    'wbkdata_property_field_radio_validator',
    10,
    4
);
function wbkdata_property_field_radio_validator($input, $value, $slug, $field)
{
    $value = trim(sanitize_text_field($value));
    $valid = false;
    $options = isset($field->get_extra_data()['options'])
        ? $field->get_extra_data()['options']
        : [];

    foreach ($options as $key => $option_value) {
        if ($value == $key) {
            $valid = true;
        }
    }
    if (!$valid) {
        return [
            false,
            sprintf(
                wbkdata_translate_string('Value of %s is not acceptable'),
                $field->get_title()
            ),
        ];
    }

    return [true, $value];
}

// checkbox field
add_filter(
    'wbkdata_property_field_validation_checkbox',
    'wbkdata_property_field_checkbox_validator',
    10,
    4
);
function wbkdata_property_field_checkbox_validator(
    $input,
    $value,
    $slug,
    $field
) {
    $value = trim(sanitize_text_field($value));
    $valid = false;
    $default_value = $field->get_extra_data();
    $keys = array_keys($default_value);
    if ($value === $keys[0] || '' === $value) {
        return [true, $value];
    }

    return [
        false,
        sprintf(
            wbkdata_translate_string('Value of %s is not acceptable'),
            $field->get_title()
        ),
    ];
}

// multicheckbox field
add_filter(
    'wbkdata_property_field_validation_multicheckbox',
    'wbkdata_property_field_multicheckbox_validator',
    10,
    4
);
function wbkdata_property_field_multicheckbox_validator(
    $input,
    $value,
    $slug,
    $field
) {
    $valid = true;
    $options = isset($field->get_extra_data()['options'])
        ? $field->get_extra_data()['options']
        : [];
    $value = !empty($value) ? $value : [];

    if (!$field->get_required() && is_array($value)) {
        return [true, json_encode($value)];
    } elseif (!$field->get_required() && !is_array($value) && !empty($value)) {
        return [true, stripslashes($value)];
    }

    try {
        if (!is_array($value) && !empty($value)) {
            $value = json_decode($value);
        }
    } catch (Exception $e) {
    }

    if (!is_array($value)) {
        return [
            false,
            sprintf(
                wbkdata_translate_string('Value of %s is not acceptable'),
                $field->get_title()
            ),
        ];
    }

    foreach ($value as $key) {
        if (!in_array($key, array_keys($options))) {
            $valid = false;
            break;
        }
    }

    if (!$valid) {
        return [
            false,
            sprintf(
                wbkdata_translate_string('Value of %s is not acceptable'),
                $field->get_title()
            ),
        ];
    }

    return [true, json_encode($value)];
}

// select field
add_filter(
    'wbkdata_property_field_validation_select',
    'wbkdata_property_field_select_validator',
    10,
    4
);
function wbkdata_property_field_select_validator($input, $value, $slug, $field)
{
    $ed = $field->get_extra_data();
    if (isset($ed['multiple'])) {
        if ($ed['multiple'] == true) {
            $multiple = true;
        } else {
            $multiple = false;
        }
    } else {
        $multiple = false;
    }
    return [true, $multiple ? json_encode($value) : $value];
}
// datetime field
add_filter(
    'wbkdata_property_field_validation_datetime',
    'wbkdata_property_field_datetime_validator',
    10,
    4
);
function wbkdata_property_field_datetime_validator(
    $input,
    $value,
    $slug,
    $field
) {
    if (DateTime::createFromFormat('Y-m-d H:i:s', $value) == false) {
        return [
            false,
            sprintf(
                wbkdata_translate_string('Value of %s is not acceptable'),
                $field->get_title()
            ),
        ];
    }
    return [true, $value];
}
// date field
add_filter(
    'wbkdata_property_field_validation_date',
    'wbkdata_property_field_date_validator',
    10,
    4
);
function wbkdata_property_field_date_validator($input, $value, $slug, $field)
{
    if (DateTime::createFromFormat('Y-m-d', $value) == false) {
        return [
            false,
            sprintf(
                wbkdata_translate_string('Value of %s is not acceptable'),
                $field->get_title()
            ),
        ];
    }
    return [true, $value];
}

// textarea field
add_filter(
    'wbkdata_property_field_validation_textarea',
    'wbkdata_property_field_textarea_validator',
    10,
    4
);
function wbkdata_property_field_textarea_validator(
    $input,
    $value,
    $slug,
    $field
) {
    if ($field->get_required() && $value == '') {
        return [
            false,
            sprintf(
                wbkdata_translate_string('%s is required'),
                $field->get_title()
            ),
        ];
    }
    $value = trim(sanitize_text_field($value));
    if (strlen($value) > 65535) {
        return [
            false,
            sprintf(
                wbkdata_translate_string(
                    '%s must be a maximum of 65535 characters'
                ),
                $field->get_title()
            ),
        ];
    }
    return [true, $value];
}
// editor field
add_filter(
    'wbkdata_property_field_validation_editor',
    'wbkdata_property_field_editor_validator',
    10,
    4
);
function wbkdata_property_field_editor_validator($input, $value, $slug, $field)
{
    $value = WBK_Validator::wbk_kses(trim($value));
    if ($field->get_required() && $value == '') {
        return [
            false,
            sprintf(
                wbkdata_translate_string('%s is required'),
                $field->get_title()
            ),
        ];
    }
    if (strlen($value) > 65535) {
        return [
            false,
            sprintf(
                wbkdata_translate_string(
                    '%s must be a maximum of 65535 characters'
                ),
                $field->get_title()
            ),
        ];
    }
    return [true, $value];
}
// date_range field
add_filter(
    'wbkdata_property_field_validation_date_range',
    'wbkdata_property_field_date_range_validator',
    10,
    4
);
function wbkdata_property_field_date_range_validator(
    $input,
    $value,
    $slug,
    $field
) {
    if ($field->get_required() && $value == '') {
        $parts = explode(' - ', $value);
        if (
            DateTime::createFromFormat('m/d/Y', $parts[0]) == false ||
            DateTime::createFromFormat('m/d/Y', $parts[0]) == false
        ) {
            return [
                false,
                sprintf(
                    wbkdata_translate_string('Value of %s is not acceptable'),
                    $field->get_title()
                ),
            ];
        }
    }
    return [true, $value];
}
// google access token
add_filter(
    'wbkdata_property_field_validation_wbk_google_access_token',
    'validate_wbk_google_access_token',
    10,
    4
);
function validate_wbk_google_access_token($input, $value, $slug, $field)
{
    return [true, $value];
}

// custom fields
add_filter(
    'wbkdata_property_field_validation_wbk_app_custom_data',
    'validate_wbk_app_custom_data',
    10,
    4
);
function validate_wbk_app_custom_data($input, $value, $slug, $field)
{
    $value = trim(sanitize_text_field($value));
    return [true, $value];
}

// wbk_date
add_filter(
    'wbkdata_property_field_validation_wbk_date',
    'validate_wbk_date',
    10,
    4
);
function validate_wbk_date($input, $value, $slug, $field)
{
    if (is_numeric($value)) {
        return [true, $value];
    }
    date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
    $value = DateTime::createFromFormat('Y-m-d H:i:s', $value . ' 0:00:00');
    if ($value == false) {
        return [
            false,
            sprintf(
                wbkdata_translate_string('%s must be a date'),
                $field->get_title()
            ),
        ];
    }
    $value = $value->getTimestamp();
    date_default_timezone_set('UTC');
    return [true, $value];
}

// wbk_time
add_filter(
    'wbkdata_property_field_validation_wbk_time',
    'validate_wbk_time',
    10,
    4
);
function validate_wbk_time($input, $value, $slug, $field)
{
    if (!WbkData\Validator::check_integer($value, 0, 2147483647)) {
        return [
            false,
            __('Time entered incorrectly', 'webba-booking-lite'),
            $field->get_title(),
        ];
    }
    return [true, $value];
}

// business hours
add_filter(
    'wbkdata_property_field_validation_wbk_business_hours',
    'validate_wbk_business_hours',
    10,
    4
);
function validate_wbk_business_hours($input, $value, $slug, $field)
{
    // to do: make additional validation here
    return [true, json_encode($value)];
}

// color
add_filter(
    'wbkdata_property_field_validation_color',
    'validate_wbk_color',
    10,
    4
);
function validate_wbk_color($input, $value, $slug, $field)
{
    $value = trim(sanitize_text_field($value));

    if (!WbkData\Validator::check_hex_color($value)) {
        return [
            false,
            __('Color entered incorrectly', 'webba-booking-lite'),
            $field->get_title(),
        ];
    }

    if ($field->get_required() && $value == '') {
        return [
            false,
            sprintf(
                wbkdata_translate_string('%s is required'),
                $field->get_title()
            ),
        ];
    }

    return [true, $value];
}

// file
add_filter(
    'wbkdata_property_field_validation_file',
    'validate_wbk_file',
    10,
    4
);
function validate_wbk_file($input, $value, $slug, $field)
{
    if ($field->get_required() && $value == '') {
        return [
            false,
            sprintf(
                wbkdata_translate_string('%s is required'),
                $field->get_title()
            ),
        ];
    }

    return [true, $value];
}
// wbk_form_fields
add_filter(
    'wbkdata_property_field_validation_wbk_form_fields',
    'validate_wbk_form_fields',
    10,
    4
);
function validate_wbk_form_fields($input, $value, $slug, $field)
{
    if ($field->get_required() && empty($value)) {
        return [false, __('This field is required', 'webba-booking-lite')];
    }

    return [true, $value];
}

?>
