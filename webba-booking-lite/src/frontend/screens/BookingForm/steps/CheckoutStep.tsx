import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelect } from '@wordpress/data'
import { store_name } from '../../../../store/frontend'
import { Form } from '../../../components/Form/Form'
import { useBookingContext } from '../../../providers/BookingFormProvider/BookingFormProvider'
import './Steps.scss'
import { IOption } from '../../../components/Form/types'
import { constructField } from '../../../components/Form/utils'
import { IFieldConfig } from '../../../components/Form/types'
import { extractFormValue } from '../../../providers/BookingFormProvider/utils'
import { Loading } from '../../../components/Loading/Loading'

export const CheckoutStep = () => {
    const {
        bookingMode,
        fields,
        formData,
        services = [],
        units = [],
        setFormObj,
        setFormData,
        preset,
        loading,
    } = useBookingContext()
    const selectedItemIdsKey = useMemo(
        () =>
            (bookingMode === 'units' ? units : services)
                .filter((item) => item.selected)
                .map((item) => item.id)
                .sort((a, b) => a - b)
                .join(','),
        [services, units, bookingMode]
    )
    const { fetchBookingAmounts, fetchPaymentMethods, fetchBookingFields } =
        useDispatch(store_name)
    const fieldsFetchedForRef = useRef<string | null>(null)
    const bookingFields = useSelect(
        (select: any) => select(store_name).getBookingFields(),
        []
    )

    useLayoutEffect(() => {
        if (!selectedItemIdsKey) return
        if (fieldsFetchedForRef.current === selectedItemIdsKey) return
        const ids = selectedItemIdsKey.split(',').map(Number)
        fetchBookingFields(ids)
        fieldsFetchedForRef.current = selectedItemIdsKey
    }, [selectedItemIdsKey, fetchBookingFields])

    useLayoutEffect(() => {
        const enhancedFields =
            bookingFields.length === 0 ? [] : bookingFields.map(constructField)
        const prefillableFields = ['first_name', 'last_name', 'email', 'phone']
        setFormObj(
            'fields',
            enhancedFields.map((field: IFieldConfig) => {
                if (prefillableFields.includes(field.slug)) {
                    return {
                        ...field,
                        value:
                            extractFormValue({
                                fieldName: field.slug,
                                formData,
                            }) ||
                            field.defaultValue ||
                            preset?.user_data?.[field.slug],
                    }
                }
                return {
                    ...field,
                    value:
                        extractFormValue({
                            fieldName: field.slug,
                            formData,
                        }) || field.defaultValue,
                }
            })
        )
    }, [bookingFields])

    const paymentsFetchedRef = useRef(false)
    const paymentMethods =
        useSelect(
            (select: any) => select(store_name).getPaymentMethods(),
            []
        ) ?? []

    useLayoutEffect(() => {
        if (paymentsFetchedRef.current || !selectedItemIdsKey) return
        const ids = selectedItemIdsKey.split(',').map(Number)
        if (bookingMode === 'units') {
            const selectedUnitId = ids[0]
            if (selectedUnitId != null && Number.isFinite(selectedUnitId)) {
                fetchPaymentMethods({ unit_id: selectedUnitId })
            }
        } else {
            fetchPaymentMethods(ids)
        }
        paymentsFetchedRef.current = true
    }, [selectedItemIdsKey, fetchPaymentMethods, bookingMode])

    const lastPaymentMethodsRef = useRef<unknown>(undefined)
    useLayoutEffect(() => {
        const list = Array.isArray(paymentMethods) ? paymentMethods : []
        if (
            lastPaymentMethodsRef.current === list ||
            (Array.isArray(lastPaymentMethodsRef.current) &&
                lastPaymentMethodsRef.current.length === list.length &&
                list.every(
                    (pm: any, i: number) =>
                        (lastPaymentMethodsRef.current as any[])?.[i]?.id ===
                        pm?.id
                ))
        ) {
            return
        }
        lastPaymentMethodsRef.current = list
        if (list.length === 1 && list[0]?.id != null) {
            setFormData('payment_method', list[0].id)
        }
        setFormObj('paymentMethods', list)
    }, [paymentMethods])
    const prevFieldValues = useRef<{ [slug: string]: any }>({})

    useEffect(() => {
        if (!fields || fields.length === 0) return
        const excluded = [
            'first_name',
            'last_name',
            'phone',
            'email',
            'description',
        ]

        // Find if any relevant field has changed
        const changed = fields.find(
            (field) =>
                !excluded.includes(field.slug) &&
                prevFieldValues.current[field.slug] !== field.value
        )

        // Always update prevFieldValues before fetchBookingAmounts
        fields.forEach((field) => {
            prevFieldValues.current[field.slug] = field.value
        })

        if (changed) {
            // For extra fields, we need to reconstruct the 'extra' property in formData
            let updatedFormData = { ...formData }

            // Check if the changed field is an "extra" field (not in excluded/default fields)
            if (!excluded.includes(changed.slug)) {
                // Reconstruct the 'extra' field using the same logic as constructFormData
                // Find all extra fields
                const extraFields = fields.filter(
                    (field) =>
                        !excluded.includes(field.slug) && field.type !== 'file'
                )

                // Rebuild the extra array as in constructFormData
                const extraArray = extraFields.map((field) => {
                    // Use the same logic as wbkCreateExtraFieldValue
                    let value = field.value
                    if (
                        field.type === 'dropdown' &&
                        Array.isArray(field.value)
                    ) {
                        value = field.value
                            .map((item: any) => item.value)
                            .join(',')
                    } else if (
                        field.type === 'dropdown' &&
                        !Array.isArray(field.value)
                    ) {
                        value = (field.value as IOption)?.value
                    }
                    return [field.slug, field.placeholder || '', value]
                })

                updatedFormData = {
                    ...updatedFormData,
                    extra: JSON.stringify(extraArray) as unknown as Record<string, unknown>,
                }
            }

            fetchBookingAmounts({
                ...updatedFormData,
                generate_stripe_intent: false,
            })
        }
    }, [fields, formData, fetchBookingAmounts])

    if (loading?.bookingFields) {
        return (
            <div className={'wbk_step__native-scroll-wrapper'}>
                <div className={'wbk_step__form-wrapper wbk_step__form-wrapper--loading'}>
                    <Loading size="large" />
                </div>
            </div>
        )
    }

    return (
        <div className={'wbk_step__native-scroll-wrapper'}>
            <div className={'wbk_step__form-wrapper'}>
                <Form />
            </div>
        </div>
    )
}
