import { isValidPhoneNumber } from 'react-phone-number-input'
import { IField, TAcceptedInputValues, ValidatorFn } from './types'
import { __ } from '@wordpress/i18n'

export const Validators: Record<string, ValidatorFn<TAcceptedInputValues>> = {
    required: (value: TAcceptedInputValues) => {
        if (!!value) {
            return true
        }

        return 'this_field_is_required'
    },
    email: (value: TAcceptedInputValues) => {
        const emailRegex =
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        const emailStr = String(value)
        if (emailStr !== emailStr.toLowerCase()) {
            return 'the_entered_email_is_invalid'
        }
        if (emailRegex.test(emailStr)) {
            return true
        }

        return 'the_entered_email_is_invalid'
    },
    phone: (value: TAcceptedInputValues) => {
        if (!value || !isValidPhoneNumber(value as string)) {
            return 'please_enter_a_valid_phone_number'
        }

        return true
    },
    number: (value: TAcceptedInputValues) => {
        const numberRegex = /^[0-9]+$/

        if (numberRegex.test(String(value))) {
            return true
        }

        return 'the_entered_number_is_invalid'
    },
}

export const validateField = ({ validators, value }: IField) => {
    if (
        validators &&
        !validators.includes(Validators.required) &&
        (value === undefined || value === null || value === '')
    ) {
        return []
    }
    return (
        (!!validators &&
            validators
                .map((validator: ValidatorFn<TAcceptedInputValues>) =>
                    validator(value)
                )
                .filter((error) => error !== true)) ||
        []
    )
}
