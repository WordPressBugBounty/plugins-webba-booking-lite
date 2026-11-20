import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import apiFetch from '@wordpress/api-fetch'
import { useDispatch } from '@wordpress/data'
import { __ } from '@wordpress/i18n'
import { store_name } from '../../../store/frontend'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'
import { useWording } from '../../hooks/useWording'
import { stripeMethods } from '../BookingForm/PaymentHandler/payments/Stripe/StripeMethods'
import { tokenizeSquareCard } from '../../lib/chargeSquarePayment'
import { packageScenarios } from './packageScenarios'
import { usePackagePurchase } from './PackagePurchaseContext'

export const usePackageScenario = () => {
    const wording = useWording()
    const { setLoading } = useDispatch(store_name)
    const { stripeObj, squareObj, preset } = useBookingContext()
    const {
        selectedProductId,
        selectedProduct,
        paymentMethod,
        paymentMethods,
        setPaymentMethod,
        stripeDetails,
        setPurchasing,
        setPurchaseError,
        setPurchaseResult,
        setPurchaseHandler,
    } = usePackagePurchase()

    const filteredScenarios = useMemo(
        () =>
            packageScenarios.filter((scenario) => {
                if (!scenario.isVisible) {
                    return true
                }
                return scenario.isVisible({ paymentMethods })
            }),
        [paymentMethods]
    )

    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        if (currentIndex > filteredScenarios.length - 1) {
            setCurrentIndex(Math.max(0, filteredScenarios.length - 1))
        }
    }, [filteredScenarios.length, currentIndex])

    useEffect(() => {
        if (paymentMethods.length === 1 && !paymentMethod) {
            setPaymentMethod(paymentMethods[0].id)
        }
    }, [paymentMethods, paymentMethod, setPaymentMethod])

    const currentScenario = filteredScenarios[currentIndex] || filteredScenarios[0]
    const Screen = currentScenario.Screen

    const title =
        wording?.[currentScenario.title] || currentScenario.title
    const description =
        wording?.[currentScenario.description] ||
        currentScenario.description

    const validationResult = currentScenario.validate({
        selectedProductId,
        paymentMethod,
        paymentMethods,
    })
    const isWalletMethod =
        paymentMethod === 'google_pay' || paymentMethod === 'apple_pay'
    const isPaymentStep = currentIndex >= filteredScenarios.length - 1
    const canGoNext =
        validationResult === true && !(isPaymentStep && isWalletMethod)
    const nextStepError =
        validationResult === true
            ? null
            : wording?.[validationResult] || validationResult

    const jumpToTop = useCallback(() => {
        setTimeout(() => {
            const form = document.querySelector<HTMLElement>(
                '.wbk_booking_form__wrapper--packages, .webba_booking_form_v6'
            )
            if (form) {
                form.scrollIntoView({ behavior: 'smooth', block: 'start' })
            } else {
                window.scrollTo({ top: 30, behavior: 'smooth' })
            }
        }, 50)
    }, [])

    const goBack = useCallback(() => {
        setCurrentIndex((prev) => Math.max(prev - 1, 0))
        jumpToTop()
    }, [jumpToTop])

    const purchasePackage = useCallback(async () => {
        if (!selectedProductId) {
            return
        }

        const method =
            paymentMethod ||
            (paymentMethods.length === 1 ? paymentMethods[0].id : 'arrival')
        const amount = Number(selectedProduct?.price || 0)
        const isStripeMethod = stripeMethods.includes(method)
        const buyerEmail =
            preset?.user_data?.email ||
            preset?.current_user_email ||
            preset?.user?.user_email ||
            preset?.user?.email ||
            undefined

        setPurchasing(true)
        setPurchaseError(null)
        setLoading('createBooking', true)

        try {
            let paymentRef = ''
            let stripePayload:
                | { intent_id?: string; client_secret?: string }
                | undefined

            if (isStripeMethod && amount > 0) {
                const { stripe, elements } = stripeObj || {}
                if (!stripe || !elements || !stripeDetails?.intent_id) {
                    throw new Error(
                        __(
                            'Stripe is not ready. Please try again.',
                            'webba-booking-lite'
                        )
                    )
                }

                const redirectUrl =
                    preset?.settings?.stripe_redirect_url ||
                    window.location.href

                const { error, paymentIntent } = await stripe.confirmPayment({
                    elements,
                    confirmParams: {
                        return_url: `${redirectUrl}?wbk_package=1&paymentMethod=${method}&`,
                        payment_method_data: {
                            billing_details: {
                                email: buyerEmail,
                            },
                        },
                    },
                    redirect: 'if_required',
                })

                if (error) {
                    throw new Error(
                        error.message ||
                            __(
                                'Payment failed. Please try again.',
                                'webba-booking-lite'
                            )
                    )
                }

                if (paymentIntent?.status !== 'succeeded') {
                    throw new Error(
                        __('Payment was not completed.', 'webba-booking-lite')
                    )
                }

                paymentRef = paymentIntent.id
                stripePayload = {
                    intent_id: paymentIntent.id,
                    client_secret: stripeDetails.client_secret,
                }
            }

            const squarePayload: Record<string, string> = {}
            if (method === 'square' && amount > 0) {
                const tokenResult = await tokenizeSquareCard({
                    squareObj,
                    amount,
                    currency:
                        squareObj?.currency ||
                        preset?.settings?.square_currency ||
                        'USD',
                    email: buyerEmail,
                })
                if (tokenResult.error || !tokenResult.token) {
                    throw new Error(
                        tokenResult.error ||
                            __(
                                'Card tokenization failed',
                                'webba-booking-lite'
                            )
                    )
                }
                squarePayload.square_source_id = tokenResult.token
                squarePayload.square_verification_token =
                    tokenResult.verificationToken || ''
            }

            const response: any = await apiFetch({
                path: '/wbk/v2/purchase-package/',
                method: 'POST',
                data: {
                    product_id: selectedProductId,
                    payment_method: method,
                    payment_ref: paymentRef,
                    payment_intent_id: paymentRef || undefined,
                    stripe_details: stripePayload,
                    return_url: window.location.origin + window.location.pathname,
                    ...squarePayload,
                },
            })

            if (response?.payment_required && response?.payment_url) {
                window.location.assign(response.payment_url)
                return
            }

            if (response?.success === false) {
                throw new Error(
                    response?.message ||
                        __(
                            'Unable to start the payment.',
                            'webba-booking-lite'
                        )
                )
            }

            setPurchaseResult(response?.package || response)
        } catch (e: any) {
            const message =
                e?.message ||
                wording?.something_went_wrong ||
                'Purchase failed'
            setPurchaseError(message)
            toast.error(message)
            throw e
        } finally {
            setPurchasing(false)
            setLoading('createBooking', false)
        }
    }, [
        selectedProductId,
        selectedProduct,
        paymentMethod,
        paymentMethods,
        stripeDetails,
        stripeObj,
        squareObj,
        preset,
        setPurchasing,
        setPurchaseError,
        setPurchaseResult,
        setLoading,
        wording,
    ])

    useEffect(() => {
        setPurchaseHandler(purchasePackage)
        return () => setPurchaseHandler(null)
    }, [purchasePackage, setPurchaseHandler])

    const goNext = useCallback(async () => {
        if (!canGoNext) {
            return
        }

        const isLast = currentIndex >= filteredScenarios.length - 1
        if (!isLast) {
            setCurrentIndex((prev) => prev + 1)
            jumpToTop()
            return
        }

        try {
            await purchasePackage()
        } catch {
            // Error is already toasted/set in purchasePackage.
        }
    }, [
        canGoNext,
        currentIndex,
        filteredScenarios.length,
        jumpToTop,
        purchasePackage,
    ])

    return {
        Screen,
        title,
        description,
        currentIndex,
        totalSteps: filteredScenarios.length,
        goBack,
        goNext,
        canGoNext,
        nextStepError,
    }
}
