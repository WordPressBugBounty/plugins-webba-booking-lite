import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { __ } from '@wordpress/i18n'
import { useDispatch, useSelect } from '@wordpress/data'
import { store_name } from '../../../../store/frontend'
import { Form } from '../../../components/Form/Form'
import { IField, IFieldConfig, IOption } from '../../../components/Form/types'
import { constructField } from '../../../components/Form/utils'
import {
    createQuantityAllocationValidator,
    validateField,
} from '../../../components/Form/validation'
import { Loading } from '../../../components/Loading/Loading'
import {
    allocateQuantityDefaults,
    getDefaultQuantityFields,
    normalizeQuantityFields,
} from '../../../components/Fields/QuantityFieldsInput/types'
import { useBookingContext } from '../../../providers/BookingFormProvider/BookingFormProvider'
import { extractFormValue } from '../../../providers/BookingFormProvider/utils'
import { useWording } from '../../../hooks/useWording'

export const useWaterfallCheckoutValidation = () => {
    const {
        bookingMode,
        fields,
        services = [],
        units = [],
        loading,
    } = useBookingContext()
    const wording = useWording()

    return useMemo(() => {
        if (loading?.bookingFields) {
            return {
                canSubmit: false,
                submitError: wording?.loading || wording?.please_fill_out_all_fields || null,
            }
        }

        if (!fields || fields.length === 0) {
            return { canSubmit: true, submitError: null as string | null }
        }

        const selectedQuantity =
            bookingMode === 'units'
                ? Math.max(
                      1,
                      Number(
                          (units || []).find((unit) => unit.selected)?.quantity
                      ) || 1
                  )
                : Math.max(
                      1,
                      (services || [])
                          .filter((service) => service.selected)
                          .reduce(
                              (sum, service) =>
                                  sum +
                                  Math.max(1, Number(service.quantity) || 1),
                              0
                          )
                  )

        for (const field of fields) {
            const validators =
                field.type === 'quantity_fields'
                    ? [
                          ...(field.validators || []),
                          createQuantityAllocationValidator(selectedQuantity),
                      ]
                    : field.validators

            const errors = validateField({
                ...field,
                validators,
            } as IField)

            if (errors && errors.length > 0) {
                return {
                    canSubmit: false,
                    submitError:
                        wording?.please_fill_out_all_fields ||
                        __('Please fill out all fields', 'webba-booking-lite'),
                }
            }
        }

        return { canSubmit: true, submitError: null as string | null }
    }, [fields, loading?.bookingFields, bookingMode, services, units, wording])
}

export const WaterfallCheckoutFields = () => {
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
    const { fetchBookingAmounts, fetchPaymentMethods } = useDispatch(store_name)

    const bookingFields = useSelect(
        (select: any) => select(store_name).getBookingFields(),
        []
    )
    const selectedItemIdsKey = useMemo(
        () =>
            (bookingMode === 'units' ? units : services)
                .filter((item) => item.selected)
                .map((item) => item.id)
                .sort((a, b) => a - b)
                .join(','),
        [services, units, bookingMode]
    )

    useLayoutEffect(() => {
        const enhancedFields =
            bookingFields.length === 0 ? [] : bookingFields.map(constructField)
        const prefillableFields = ['first_name', 'last_name', 'email', 'phone']
        const selectedQuantity =
            bookingMode === 'units'
                ? Math.max(
                      1,
                      Number(
                          (units || []).find((unit) => unit.selected)?.quantity
                      ) || 1
                  )
                : Math.max(
                      1,
                      (services || [])
                          .filter((service) => service.selected)
                          .reduce(
                              (sum, service) =>
                                  sum +
                                  Math.max(1, Number(service.quantity) || 1),
                              0
                          )
                  )

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

                if (field.type === 'quantity_fields') {
                    const quantityOptions = normalizeQuantityFields(
                        field.quantityFields
                    )
                    const options = quantityOptions.length
                        ? quantityOptions
                        : getDefaultQuantityFields()
                    const existingPeople =
                        formData?.number_of_people &&
                        typeof formData.number_of_people === 'object' &&
                        !Array.isArray(formData.number_of_people)
                            ? (formData.number_of_people as Record<
                                  string,
                                  number
                              >)
                            : null

                    return {
                        ...field,
                        quantityFields: options,
                        value:
                            existingPeople ||
                            field.defaultValue ||
                            allocateQuantityDefaults(
                                options,
                                selectedQuantity
                            ),
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

        const changed = fields.find(
            (field) =>
                !excluded.includes(field.slug) &&
                prevFieldValues.current[field.slug] !== field.value
        )

        fields.forEach((field) => {
            prevFieldValues.current[field.slug] = field.value
        })

        if (changed) {
            let updatedFormData = { ...formData }

            if (!excluded.includes(changed.slug)) {
                const extraFields = fields.filter(
                    (field) =>
                        !excluded.includes(field.slug) && field.type !== 'file'
                )

                const extraArray = extraFields.map((field) => {
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
                    extra: JSON.stringify(extraArray) as unknown as Record<
                        string,
                        unknown
                    >,
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
            <div className="wbk_waterfall_form__fields wbk_waterfall_form__fields--loading">
                <Loading size="large" />
            </div>
        )
    }

    if (!fields || fields.length === 0) {
        return null
    }

    return (
        <div className="wbk_waterfall_form__fields">
            <Form />
        </div>
    )
}
