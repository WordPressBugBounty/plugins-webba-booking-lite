import { __ } from '@wordpress/i18n'

const emailRegex =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export type ValidatorFn<T> = (value: T) => string | null
export type GetFn = (proxy: any) => any
/** Validator that can read other state via get(proxy) for cross-field validation */
export type CrossFieldValidatorFn<T> = (value: T, get?: GetFn) => string | null

export const validate = function <T>(
    value: T,
    validators: (ValidatorFn<T> | CrossFieldValidatorFn<T>)[],
    get?: GetFn
) {
    return validators
        .map((validatorFn) =>
            get
                ? (validatorFn as CrossFieldValidatorFn<T>)(value, get)
                : (validatorFn as ValidatorFn<T>)(value)
        )
        .filter((error): error is string => !!error)
}

export const Validators = {
    email: (value: string) => {
        if (!value) return null
    
        const emails = value.split(',').map(email => email.trim()).filter(Boolean)
    
        const invalidEmail = emails.find(email => !emailRegex.test(email))
    
        if (invalidEmail) {
            return __(`The entered email "${invalidEmail}" is invalid`, 'webba-booking-lite')
        }
    
        return null
    },
    required: (value: any) => {
        // Treat 0 and '0' as valid so numeric fields (e.g. duration, limitation min/max) can have 0 and pass required
        const isEmpty = value === undefined || value === null || value === ''
        const isZero = value === 0 || value === '0'
        const isValid = !isEmpty || isZero

        if (!isValid) {
            return __('Required field', 'webba-booking-lite')
        }

        return null
    },
    numberBetween: (min?: number, max?: number) => (value: number) => {
        if (min === undefined || max === undefined) {
            return null
        }

        if (value > max || value < min) {
            return __(`Value must be between ${min} and ${max}`, 'webba-booking-lite')
        }

        return null
    },
    textCharCountBetween: (min?: number, max?: number) => (value: string) => {
        if (!value || !min || !max) {
            return null
        }

        if (value.length > max || value.length < min) {
            return __(`Value must be between ${min} and ${max} characters`, 'webba-booking-lite')
        }

        return null
    },
    dateRange: (range: string) => {
        if (!range || range.indexOf(' - ') === -1) {
            return null
        }

        const formattedRange = range.split(' - ')
        const [from, to] = [
            new Date(formattedRange[0]),
            new Date(formattedRange[1]),
        ]
        const isValid = from <= to

        if (!isValid) {
            return __('Invalid date range', 'webba-booking-lite')
        }

        return null
    },
    noneNegativeFloat: (value: string) => {
        if (!value) return null

        if (isNaN(parseFloat(value))) {
            return __('Value must be a number', 'webba-booking-lite')
        }

        if (parseFloat(value) < 0) {
            return __('Value must be a positive number or zero', 'webba-booking-lite')
        }

        if (value.replace(/[0-9.]/g, '').length) {
            return __('Value must be a valid number', 'webba-booking-lite')
        }

        return null
    },
    optionIncluded:
        (selected: any, options: Record<string, string>[]) => (value) => {
            const values = options.map(
                (option: Record<string, string>) => option?.value
            )

            if (!values?.length) {
                return null
            }

            if (Array.isArray(selected) && selected.length) {
                for (let i = 0; i < selected.length; i++) {
                    if (!options?.includes(selected[i])) {
                        return __('Required field', 'webba-booking-lite')
                    }
                }

                return null
            }

            if (!options?.includes(selected)) {
                return __('Required field', 'webba-booking-lite')
            }

            return null
        },
    noneNegativeInteger: (value: any) => {
        if (!value) return null

        if (!Number.isInteger(parseInt(value))) {
            return __('Value must be a number', 'webba-booking-lite')
        }

        if (parseInt(value) < 0) {
            return __('Value must be a positive number or zero', 'webba-booking-lite')
        }

        if (value.toString().includes('.')) {
            return __('Value must be an integer number', 'webba-booking-lite')
        }

        if (value.replace(/[0-9]/g, '').length) {
            return __('Value must be a valid number', 'webba-booking-lite')
        }

        return null
    },
    positiveInteger: (value: any) => {
        if (!value) return null

        if (!Number.isInteger(parseInt(value))) {
            return __('Value must be a number', 'webba-booking-lite')
        }

        if (value.toString().includes('.')) {
            return __('Value must be an integer number', 'webba-booking-lite')
        }

        if (parseInt(value) <= 0) {
            return __('Value must be a positive number', 'webba-booking-lite')
        }

        if (value.replace(/[0-9]/g, '').length) {
            return __('Value must be a valid number', 'webba-booking-lite')
        }

        return null
    },
    fileSize: (maxSizeInMB: number) => (value: File) => {
        if (!value) return null

        const maxSizeInBytes = maxSizeInMB * 1024 * 1024
        if (value.size > maxSizeInBytes) {
            return __(`File size must be less than ${maxSizeInMB}MB`, 'webba-booking-lite')
        }

        return null
    },
    fileType: (acceptedTypes: string) => (value: File) => {
        if (!value) return null

        const acceptedTypesArray = acceptedTypes.split(',').map(type => type.trim())
        const fileExtension = value.name.split('.').pop()?.toLowerCase()
        const fileType = value.type

        const isAccepted = acceptedTypesArray.some(type => {
            if (type.startsWith('.')) {
                return fileExtension === type.substring(1)
            }
            if (type.includes('/')) {
                return fileType === type
            }
            return fileExtension === type
        })

        if (!isAccepted) {
            return __(`File type not allowed. Accepted types: ${acceptedTypes}`, 'webba-booking-lite')
        }

        return null
    },
    /** Returns a validator that ensures min value is not greater than max (for limitation field). Pass maxValuePrimitive so get(maxValuePrimitive) triggers re-validation when max changes. */
    minNotGreaterThanMax: (maxValuePrimitive: { value: any }) => (minValue: any, get?: GetFn) => {
        const maxValue = get ? get(maxValuePrimitive).value : maxValuePrimitive.value
        const minNum = Number(minValue) ?? 0
        const maxNum = Number(maxValue) ?? 0
        if (minNum > maxNum) {
            return __('Min cannot be greater than max', 'webba-booking-lite')
        }
        return null
    },
} as const satisfies Record<
    string,
    ValidatorFn<any> | ((...args: any) => ValidatorFn<any>)
>

export const validateIntersection = (
    days: Record<string, number | string>[]
) => {
    for (let i = 0; i < days.length; i++) {
        for (let j = i + 1; j < days.length; j++) {
            if (
                days[i].day_of_week?.toString() !==
                days[j].day_of_week?.toString()
            ) {
                continue
            }

            if (days[i].start > days[j].end || days[j].start > days[i].end) {
                continue
            }

            return false
        }
    }

    return true
}
