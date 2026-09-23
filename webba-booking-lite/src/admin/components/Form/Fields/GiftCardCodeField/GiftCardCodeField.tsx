import { useEffect, useRef } from 'react'
import apiFetch from '@wordpress/api-fetch'
import { __ } from '@wordpress/i18n'
import { proxy } from 'valtio'
import { useField } from '../../lib/hooks/useField'
import { FormComponentConstructor } from '../../lib/types'
import { Validators } from '../../utils/validation'
import { GenericFormField } from '../GenericFormField/GenericFormField'
import { useForm } from '../../lib/FormProvider'

type AvailabilityStatus = {
    forCode: string
    available: boolean | null
    checking: boolean
}

export const createGiftCardCodeField: FormComponentConstructor<string> = ({
    field,
    fieldConfig,
}) => {
    const status = proxy<AvailabilityStatus>({
        forCode: '',
        available: null,
        checking: false,
    })

    field.setValidators([
        Validators.textCharCountBetween(
            fieldConfig.misc?.min,
            fieldConfig.misc?.max
        ),
        (value, get) => {
            const current = String(value || '').trim()
            if (!current) {
                return null
            }

            const availability = get ? get(status) : status

            if (availability.forCode !== current || availability.checking) {
                return __(
                    'Checking code availability...',
                    'webba-booking-lite'
                )
            }

            if (availability.available === false) {
                return __(
                    'This gift card code is already used.',
                    'webba-booking-lite'
                )
            }

            return null
        },
    ])

    return ({ name, label }) => {
        const { value, setValue, errors } = useField(field)
        const form = useForm()
        const requestIdRef = useRef(0)
        const generatingRef = useRef(false)

        useEffect(() => {
            const current = String(value || '').trim()
            const isEdit = Boolean(form.defaultValue?.id)

            if (isEdit) {
                if (current) {
                    status.forCode = current
                    status.available = true
                    status.checking = false
                }
                return
            }

            if (current || generatingRef.current) {
                return
            }

            let cancelled = false
            generatingRef.current = true

            apiFetch({
                path: '/wbk/v2/generate-gift-card-code/',
            })
                .then((result: any) => {
                    if (cancelled) {
                        return
                    }
                    const code = String(result?.code || '').trim()
                    if (!code) {
                        generatingRef.current = false
                        return
                    }
                    setValue(code)
                    status.forCode = code
                    status.available = true
                    status.checking = false
                    generatingRef.current = false
                })
                .catch(() => {
                    if (!cancelled) {
                        generatingRef.current = false
                    }
                })

            return () => {
                cancelled = true
            }
        }, [form.defaultValue?.id, value, setValue])

        useEffect(() => {
            const current = String(value || '').trim()
            if (!current) {
                status.forCode = ''
                status.available = null
                status.checking = false
                return
            }

            if (
                status.forCode === current &&
                status.available !== null &&
                !status.checking
            ) {
                return
            }

            const excludeId =
                form.defaultValue?.id || form.fields?.id?.value?.value || 0
            const requestId = ++requestIdRef.current
            status.forCode = current
            status.checking = true
            status.available = null

            const timeoutId = window.setTimeout(() => {
                apiFetch({
                    path: '/wbk/v2/check-gift-card-code/',
                    method: 'POST',
                    data: {
                        code: current,
                        exclude_id: excludeId || undefined,
                    },
                })
                    .then((result: any) => {
                        if (requestId !== requestIdRef.current) {
                            return
                        }
                        status.forCode = current
                        status.checking = false
                        status.available = Boolean(result?.available)
                    })
                    .catch(() => {
                        if (requestId !== requestIdRef.current) {
                            return
                        }
                        status.forCode = current
                        status.checking = false
                        status.available = null
                    })
            }, 400)

            return () => {
                window.clearTimeout(timeoutId)
            }
        }, [value, form.defaultValue?.id, form.fields?.id?.value?.value])

        return (
            <GenericFormField
                value={value}
                onChange={setValue}
                errors={errors}
                id={name}
                type="text"
                label={label}
                misc={fieldConfig.misc}
            />
        )
    }
}
