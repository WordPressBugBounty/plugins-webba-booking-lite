import { useCallback, useMemo, useRef, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { IScenario, IUseScenario } from '../screens/BookingForm/types'
import { useBookingContext } from '../providers/BookingFormProvider/BookingFormProvider'
import { useWording } from './useWording'
import { useDispatch } from '@wordpress/data'
import { store_name } from '../../store/frontend'
import { stripeMethods } from '../screens/BookingForm/PaymentHandler/payments/Stripe/StripeMethods'

export const useScenario = (scenarios: IScenario[]) => {
    const {
        formData,
        services,
        paymentMethods,
        preset,
        stripeObj,
        amountData,
        loading,
    } = useBookingContext()
    const wording = useWording()
    const filteredScenarios = useMemo(
        () =>
            scenarios.filter(({ isVisible }: IScenario) => {
                if (isVisible === undefined) return true
                return isVisible()
            }),
        [scenarios, paymentMethods]
    )

    // Always keep the latest filteredScenarios in a ref
    const filteredScenariosRef = useRef(filteredScenarios)
    useEffect(() => {
        filteredScenariosRef.current = filteredScenarios
    }, [filteredScenarios])

    const [currentIndex, setCurrentIndex] = useState(0)
    const currentIndexRef = useRef(0)
    useEffect(() => {
        currentIndexRef.current = currentIndex
    }, [currentIndex])

    const currentScenario = filteredScenarios[currentIndex]
    const { placeBooking, setLoading, submitStripePayment, setBookingData } =
        useDispatch(store_name)

    const title =
        typeof currentScenario.title === 'string'
            ? wording?.[currentScenario.title] || currentScenario.title
            : currentScenario.title
    const description =
        typeof currentScenario.description === 'string'
            ? wording?.[currentScenario.description] ||
              currentScenario.description
            : currentScenario.description

    const { canGoNext, nextStepError } = useMemo(() => {
        const isCheckoutStep = currentScenario?.title === 'personal_details'
        if (isCheckoutStep && loading?.bookingFields) {
            return {
                canGoNext: false,
                nextStepError: wording?.loading || null,
            }
        }
        let firstError: string | null = null
        const allValid = Object.entries(currentScenario.validationRules).every(
            ([field, validator]) => {
                const value = formData[field]
                const result =
                    value !== undefined && value !== null
                        ? validator(value)
                        : validator(formData)
                if (result !== true && !firstError) {
                    firstError = typeof result === 'string' ? result : null
                }
                return result === true
            }
        )
        return {
            canGoNext: allValid,
            nextStepError:
                (typeof firstError === 'string' && wording?.[firstError]) ||
                firstError,
        }
    }, [formData, currentScenario, stripeObj?.isValidated, amountData, loading?.bookingFields])

    const canGoNextRef = useRef(canGoNext)
    const formDataRef = useRef(formData)

    useEffect(() => {
        canGoNextRef.current = canGoNext
    }, [canGoNext])

    useEffect(() => {
        formDataRef.current = formData
    }, [formData])

    const jumpToTop = useCallback(() => {
        setTimeout(() => {
            let targetForm: HTMLElement | null = null

            const forms = Array.from(
                document.querySelectorAll<HTMLElement>('.webba_booking_form_v6')
            )
            for (const form of forms) {
                const button = form.querySelector<HTMLButtonElement>(
                    '.wbk_navigation__button-next'
                )
                if (button && button.offsetParent !== null) {
                    targetForm = form
                    break
                }
            }

            if (!targetForm && forms.length > 0) {
                targetForm = forms[0]
            }

            if (targetForm) {
                targetForm.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                })
            } else {
                window.scrollTo({ top: 30, behavior: 'smooth' })
            }
        }, 50)
    }, [])

    const goBack = useCallback(() => {
        setCurrentIndex((prev) => Math.max(prev - 1, 0))
        jumpToTop()
    }, [jumpToTop])

    const processBooking = useCallback(async () => {
        let response: any
        try {
            response = await placeBooking(formDataRef.current)
        } catch (e: any) {
            const message =
                e?.message ??
                e?.data?.message ??
                (typeof e?.data === 'string' ? e.data : null) ??
                (e?.code ? String(e.code) : null) ??
                'Booking failed'
            toast.error(message)
            throw e
        }

        if (!stripeObj) return response

        const { stripe, elements } = stripeObj

        if (!stripe || !elements) return response

        if (
            stripeMethods
                .filter(
                    (method) => !['google_pay', 'apple_pay'].includes(method)
                )
                .includes(formDataRef.current?.payment_method)
        ) {
            setLoading('createBooking', true)

            const redirectUrl =
                preset?.settings?.stripe_redirect_url || window.location.href
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${redirectUrl}?paymentMethod=${formDataRef.current?.payment_method}&`,
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
                    formDataRef.current?.payment_method
                )

                if (paymentResponse.status === 'success') {
                    setBookingData({
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

        return response
    }, [stripeObj, placeBooking, stripeMethods, formDataRef])

    const goNext = useCallback(async () => {
        if (!canGoNextRef.current) return

        const index = currentIndexRef.current
        const scenarios = filteredScenariosRef.current

        if (index === scenarios.length - 1) {
            const response = await processBooking()

            jumpToTop()
            return
        }

        setCurrentIndex((prev) => Math.min(prev + 1, scenarios.length - 1))
        jumpToTop()
    }, [placeBooking, jumpToTop, processBooking])

    const stepInto = useCallback((index: number) => {
        setCurrentIndex(index)
    }, [])

    useEffect(() => {
        const selectedServices = services.filter((service) => service.selected)
        if (!selectedServices || selectedServices.length === 0) {
            setCurrentIndex(0)
        }
    }, [services])

    return {
        ...currentScenario,
        title,
        description,
        totalSteps: filteredScenarios.length,
        currentIndex,
        canGoNext,
        goBack,
        goNext,
        stepInto,
        nextStepError,
    } as IUseScenario
}
