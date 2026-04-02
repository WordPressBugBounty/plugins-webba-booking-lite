import { useMemo, useState } from 'react'
import { useForm } from '../FormProvider'
import {
    IField,
    IFormContext,
    TAcceptedInputValues,
    TError,
    ValidatorFn,
    IFieldConstructor,
} from '../types'
import { validateField, Validators } from '../validation'
import { useBookingContext } from '../../../providers/BookingFormProvider/BookingFormProvider'
import { useWording } from '../../../hooks/useWording'

export const useField = (fieldConfig: IFieldConstructor): IField => {
    const { fields, setFields, setAnyTouched }: IFormContext =
        useForm() as unknown as IFormContext
    const { formData } = useBookingContext()
    const wording = useWording()

    const field = useMemo(() => {
        const field = fields.find((f) => f.slug === fieldConfig.slug)

        return {
            ...field,
            value: field?.value,
        }
    }, [fields])

    const errors: TError[] = validateField({
        value: field?.value,
        validators: [
            ...(field?.validators || []),
            ...(fieldConfig.validators || []),
        ],
    } as IField)
    const [touched, _setTouched] = useState(false)
    const setTouched = (val: boolean) => {
        if (val) setAnyTouched(true)
        _setTouched(val)
    }

    if (!field) {
        throw new Error('Field not found')
    }

    const resetValue = () => {
        setFields(
            fields.map((field) => {
                if (field.slug === fieldConfig.slug) {
                    return {
                        ...field,
                        value: field.defaultValue || null,
                    }
                }

                return field
            })
        )
    }

    const setValue = (value: TAcceptedInputValues) => {
        setFields(
            fields.map((field) => {
                if (field.slug === fieldConfig.slug) {
                    return {
                        ...field,
                        value,
                    }
                }

                return field
            })
        )
    }

    const addValidators = (validators: ValidatorFn<TAcceptedInputValues>[]) => {
        setFields(
            fields.map((field) => {
                if (field.slug === fieldConfig.slug) {
                    return {
                        ...field,
                        validators: [
                            ...(field.validators || []),
                            ...validators,
                        ],
                    }
                }

                return field
            })
        )
    }

    return {
        ...field,
        name: field.slug,
        setValue,
        resetValue,
        addValidators,
        errors: errors.map((error) => wording[error as string] || error),
        touched,
        setTouched,
        validators: [
            ...(field.validators || []),
            ...(field.required ? [Validators.required] : []),
        ],
    }
}
