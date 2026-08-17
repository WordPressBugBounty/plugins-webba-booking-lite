import { useEffect } from 'react'
import apiFetch from '@wordpress/api-fetch'
import { useField } from '../../lib/hooks/useField'
import { FormComponentConstructor } from '../../lib/types'
import { ValidatorFn, Validators } from '../../utils/validation'
import { GenericFormField } from '../GenericFormField/GenericFormField'
import { useForm } from '../../lib/FormProvider'
import { proxy, useSnapshot } from 'valtio'

const emptyMailerValue = proxy({ value: '' as string })

export const createTextField: FormComponentConstructor<string> = ({
    field,
    fieldConfig,
}) => {
    const subTypeValidators: ValidatorFn<string>[] = []

    switch (fieldConfig.misc?.sub_type) {
        case 'email':
            subTypeValidators.push(Validators.email)
            break
        case 'none_negative_float':
            subTypeValidators.push(Validators.noneNegativeFloat)
            break
        case 'none_negative_integer':
            subTypeValidators.push(Validators.noneNegativeInteger)
            break
        case 'positive_integer':
            subTypeValidators.push(Validators.positiveInteger)
            break
        default:
            break
    }

    field.setValidators([
        Validators.textCharCountBetween(
            fieldConfig.misc?.min,
            fieldConfig.misc?.max
        ),
        ...subTypeValidators,
    ])

    return ({ name, label }) => {
        const { value, setValue, errors } = useField(field)
        const form = useForm()
        const mailerSnap = useSnapshot(
            form.fields.wbk_mailer?.value ?? emptyMailerValue
        )
        const isGmailMailer =
            name === 'wbk_from_email' && String(mailerSnap.value) === 'gmail'

        useEffect(() => {
            if (!isGmailMailer) {
                return
            }

            let cancelled = false

            apiFetch({
                path: '/wbk/v2/get-gmail-auth-data/',
            })
                .then((result: any) => {
                    if (cancelled) {
                        return
                    }

                    const email = String(result?.email || '').trim()
                    if (email && result?.isAuthenticated) {
                        setValue(email)
                    }
                })
                .catch(() => {
                    // Prefill is best-effort; keep the current field value.
                })

            return () => {
                cancelled = true
            }
        }, [isGmailMailer, setValue])

        return (
            <GenericFormField
                value={value}
                onChange={setValue}
                errors={errors}
                id={name}
                type="text"
                label={label}
                misc={{
                    ...fieldConfig.misc,
                    disabled: Boolean(
                        fieldConfig.misc?.disabled || isGmailMailer
                    ),
                }}
            />
        )
    }
}
