import { useCallback, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import apiFetch from '@wordpress/api-fetch'
import { useDispatch } from '@wordpress/data'
import { store_name } from '../../store/frontend'
import { useBookingContext } from '../providers/BookingFormProvider/BookingFormProvider'
import { serializePlacesForApi } from '../providers/BookingFormProvider/utils'
import { stripeMethods } from '../screens/BookingForm/PaymentHandler/payments/Stripe/StripeMethods'
import { trackBookingFormSubmitted } from '../utils/frontendAnalytics'
import { redirectAfterBooking } from '../lib/bookingRedirect'
import { IFormData } from '../screens/BookingForm/types'

const buildBookingFormData = (formData: IFormData) => {
    const formDataModified = new FormData()

    const collectFiles = (val: unknown): File[] => {
        if (val instanceof File) return [val]
        if (Array.isArray(val)) {
            return val.filter((item): item is File => item instanceof File)
        }
        if (val && typeof val === 'object') {
            const obj = val as Record<string, unknown>
            if (Array.isArray(obj.file)) {
                return obj.file.filter(
                    (item): item is File => item instanceof File
                )
            }
            return Object.keys(obj).flatMap((k) => collectFiles(obj[k]))
        }
        return []
    }

    Object.keys(formData).forEach((key) => {
        if (key === 'extras') {
            return
        }
        const value = formData[key]

        if (key === 'attachments' && value != null) {
            const files = collectFiles(value)
            files.forEach((file) => {
                formDataModified.append('attachments[]', file)
            })
            return
        }

        if (key === 'places' && value && typeof value === 'object') {
            const placesOrder =
                formData?.booking_mode === 'units'
                    ? Object.keys(value as Record<string, unknown>).map(Number)
                    : Array.isArray(formData.services)
                      ? (formData.services as number[])
                      : []
            formDataModified.append(
                key,
                serializePlacesForApi(
                    value as Record<number, unknown[]>,
                    placesOrder
                )
            )
        } else if (typeof value === 'object') {
            formDataModified.append(key, JSON.stringify(value))
        } else {
            formDataModified.append(key, value as any)
        }
    })

    return formDataModified
}

export const useProcessBooking = () => {
    const { formData, bookingMode, preset, stripeObj, amountData } =
        useBookingContext()
    const formDataRef = useRef(formData)
    const { setLoading, submitStripePayment, setBookingData } =
        useDispatch(store_name)

    useEffect(() => {
        formDataRef.current = formData
    }, [formData])

    return useCallback(async () => {
        const submittedFormData = formDataRef.current
        const itemsCount =
            bookingMode === 'units'
                ? submittedFormData.units?.length ?? 0
                : submittedFormData.services?.length ?? 0
        const baseTrackingProperties = {
            booking_mode: bookingMode,
            items_count: itemsCount,
            payment_method: submittedFormData.payment_method,
            has_coupon: Boolean(submittedFormData.coupon?.trim()),
            total_amount: amountData?.to_pay_total,
        }

        let response: any
        setLoading('createBooking', true)
        try {
            response = await apiFetch({
                path: `/webba-booking/v1/create-booking`,
                method: 'POST',
                body: buildBookingFormData(submittedFormData),
            })
        } catch (e: any) {
            setLoading('createBooking', false)
            const message =
                e?.message ??
                e?.data?.message ??
                (typeof e?.data === 'string' ? e.data : null) ??
                (e?.code ? String(e.code) : null) ??
                'Booking failed'

            trackBookingFormSubmitted({
                ...baseTrackingProperties,
                success: false,
                error_message: message,
            })

            toast.error(message)
            throw e
        }

        const bookingResult =
            response && typeof response === 'object'
                ? {
                      ...response,
                      payment_required:
                          response.payment_required === true ? true : false,
                  }
                : { success: true, payment_required: false }

        setBookingData(bookingResult)
        setLoading('createBooking', false)

        trackBookingFormSubmitted({
            ...baseTrackingProperties,
            success: true,
            payment_required: bookingResult?.payment_required,
        })

        const paymentMethod = formDataRef.current?.payment_method
        let paymentConfirmed = true
        const isCreditCard = stripeMethods
            .filter(
                (method) => !['google_pay', 'apple_pay'].includes(method)
            )
            .includes(paymentMethod)
        const needsStripeConfirmation =
            isCreditCard &&
            bookingResult?.payment_required === true &&
            Number(amountData?.to_pay_total) > 0

        if (needsStripeConfirmation && stripeObj) {
            const { stripe, elements } = stripeObj

            if (stripe && elements) {
                paymentConfirmed = false
                setLoading('createBooking', true)

                const redirectUrl =
                    preset?.settings?.stripe_redirect_url || window.location.href
                const { error, paymentIntent } = await stripe.confirmPayment({
                    elements,
                    confirmParams: {
                        return_url: `${redirectUrl}?paymentMethod=${paymentMethod}&`,
                        payment_method_data: {
                            billing_details: {
                                name: formDataRef.current?.stripe_details
                                    ?.billing_details?.name,
                                address: {
                                    line1: formDataRef.current?.stripe_details
                                        ?.billing_details?.line1,
                                    line2: formDataRef.current?.stripe_details
                                        ?.billing_details?.line2,
                                    city: formDataRef.current?.stripe_details
                                        ?.billing_details?.city,
                                    state: formDataRef.current?.stripe_details
                                        ?.billing_details?.state,
                                    postal_code:
                                        formDataRef.current?.stripe_details
                                            ?.billing_details?.postal_code,
                                    country:
                                        formDataRef.current?.stripe_details
                                            ?.billing_details?.country,
                                },
                            },
                        },
                    },
                    redirect: 'if_required',
                })

                if (paymentIntent?.status === 'succeeded') {
                    const paymentResponse = await submitStripePayment(
                        paymentIntent.id,
                        paymentMethod
                    )

                    if (paymentResponse.status === 'success') {
                        paymentConfirmed = true
                        setBookingData({
                            ...bookingResult,
                            payment_required: false,
                        })
                    } else {
                        alert(paymentResponse?.message || 'Something went wrong')
                    }
                } else if (error) {
                    alert(error.message)
                } else {
                    alert('Something went wrong')
                }

                setLoading('createBooking', false)
            }
        }

        if (paymentConfirmed) {
            redirectAfterBooking(preset?.settings, paymentMethod)
        }

        return bookingResult
    }, [
        stripeObj,
        bookingMode,
        amountData,
        preset,
        setLoading,
        submitStripePayment,
        setBookingData,
    ])
}
