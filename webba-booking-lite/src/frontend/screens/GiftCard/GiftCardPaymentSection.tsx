import {
    lazy,
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { __ } from '@wordpress/i18n'
import apiFetch from '@wordpress/api-fetch'
import { PaymentSelector } from '../../components/PaymentSelector/PaymentSelector'
import { FormNotice } from '../../components/FormNotice/FormNotice'
import { useWording } from '../../hooks/useWording'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'
import { stripeMethods } from '../BookingForm/PaymentHandler/payments/Stripe/StripeMethods'
import { StripeWrapper } from '../BookingForm/PaymentHandler/payments/Stripe/StripeWrapper'
import { StripeBillingFields } from '../BookingForm/PaymentHandler/payments/Stripe/StripeBillingFields'
import { GiftCardStripe } from './GiftCardStripe'
import { PaymentStepSquareSection } from '../BookingForm/steps/PaymentStepSquareSection/PaymentStepSquareSection'
import type { IFormData } from '../BookingForm/types'
import type { IPaymentMethod } from '../../components/PaymentSelector/types'
import sslPaymentLogo from '../../../../public/images/logos/ssl-encryption.svg'
import protectedPrivacyLogo from '../../../../public/images/logos/privacy-protected.svg'
import classNames from 'classnames'
import '../BookingForm/steps/Steps.scss'

const scrollToElementInContainer = (element: HTMLElement | null) => {
    if (!element) return

    let container = element.parentElement
    while (container) {
        const style = window.getComputedStyle(container)
        if (
            style.overflowY === 'auto' ||
            style.overflowY === 'scroll' ||
            container.classList.contains('wbk_booking_form__content')
        ) {
            const containerRect = container.getBoundingClientRect()
            const elementRect = element.getBoundingClientRect()
            const relativeTop = elementRect.top - containerRect.top

            container.scrollTo({
                top: container.scrollTop + relativeTop,
                behavior: 'smooth',
            })
            return
        }
        container = container.parentElement
    }
}

export interface IGiftCardStripeDetails {
    client_secret?: string
    intent_id?: string
    amount?: number
    payment_method?: string
    error?: string
}

interface IGiftCardPaymentSectionProps {
    amount: number
    formattedAmount: string | null
    buyerEmail: string
    paymentMethods: IPaymentMethod[]
    selectedMethod: string
    setSelectedMethod: (method: string) => void
    stripeDetails: IGiftCardStripeDetails | null
    setStripeDetails: (details: IGiftCardStripeDetails | null) => void
    onWalletConfirm?: () => Promise<boolean>
    hideAmountSummary?: boolean
}

export const GiftCardPaymentSection = ({
    amount,
    formattedAmount,
    buyerEmail,
    paymentMethods,
    selectedMethod,
    setSelectedMethod,
    stripeDetails,
    setStripeDetails,
    onWalletConfirm,
    hideAmountSummary = false,
}: IGiftCardPaymentSectionProps) => {
    const wording = useWording()
    const { preset } = useBookingContext()
    const stripeWrapperRef = useRef<HTMLDivElement>(null)
    const squareWrapperRef = useRef<HTMLDivElement>(null)
    const [paymentElementLoading, setPaymentElementLoading] = useState(false)
    const [intentLoading, setIntentLoading] = useState(false)
    const [showStripeError, setShowStripeError] = useState(false)
    const [stripeFormData, setStripeFormData] = useState<Partial<IFormData>>({})

    const handleLoadingChange = useCallback((loading: boolean) => {
        setPaymentElementLoading(loading)
        if (!loading) {
            setTimeout(() => {
                scrollToElementInContainer(
                    stripeWrapperRef.current || squareWrapperRef.current
                )
            }, 100)
        }
    }, [])

    const handleSelectMethod = useCallback(
        (method: string) => {
            setSelectedMethod(method)
            setShowStripeError(false)
            setPaymentElementLoading(false)
        },
        [setSelectedMethod]
    )

    const setStripeFormField = useCallback((slug: string, value: unknown) => {
        setStripeFormData((prev) => ({
            ...prev,
            [slug]: value,
        }))
    }, [])

    const paymentMessage = useMemo(() => {
        switch (selectedMethod) {
            case 'paypal':
                return wording?.paypal_message || ''
            case 'mollie':
                return wording?.mollie_message || ''
            case 'woocommerce':
                return wording?.woocommerce_message || ''
            default:
                return ''
        }
    }, [wording, selectedMethod])

    const isStripeMethod = stripeMethods.includes(selectedMethod)
    const isSquareMethod = selectedMethod === 'square'
    const isWalletMethod = ['google_pay', 'apple_pay'].includes(selectedMethod)
    const canShowPayments = amount > 0 && paymentMethods.length > 0
    const [debouncedAmount, setDebouncedAmount] = useState(amount)
    const [debouncedEmail, setDebouncedEmail] = useState(buyerEmail)

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedAmount(amount)
            setDebouncedEmail(buyerEmail)
        }, 400)
        return () => window.clearTimeout(timer)
    }, [amount, buyerEmail])

    useEffect(() => {
        if (!isStripeMethod || debouncedAmount <= 0) {
            setStripeDetails(null)
            setIntentLoading(false)
            return
        }

        const email = String(debouncedEmail || '').trim()
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setStripeDetails({
                error: __(
                    'Please enter a valid email address',
                    'webba-booking-lite'
                ),
            })
            setShowStripeError(true)
            setIntentLoading(false)
            return
        }

        let cancelled = false
        setIntentLoading(true)
        setShowStripeError(false)

        apiFetch<{
            success?: boolean
            message?: string
            data?: { stripe_details?: IGiftCardStripeDetails }
            stripe_details?: IGiftCardStripeDetails
        }>({
            path: '/wbk/v2/gift-card-stripe-intent/',
            method: 'POST',
            data: {
                amount: debouncedAmount,
                email,
                payment_method: selectedMethod,
            },
        })
            .then((response) => {
                if (cancelled) {
                    return
                }
                const details =
                    response?.data?.stripe_details ||
                    response?.stripe_details ||
                    null
                if (response?.success && details?.client_secret) {
                    setStripeDetails(details)
                    setShowStripeError(false)
                } else {
                    setStripeDetails({
                        error:
                            details?.error ||
                            response?.message ||
                            __(
                                'Unable to initialize Stripe payment.',
                                'webba-booking-lite'
                            ),
                    })
                    setShowStripeError(true)
                }
            })
            .catch((error: { message?: string }) => {
                if (cancelled) {
                    return
                }
                setStripeDetails({
                    error:
                        error?.message ||
                        __(
                            'Unable to initialize Stripe payment.',
                            'webba-booking-lite'
                        ),
                })
                setShowStripeError(true)
            })
            .finally(() => {
                if (!cancelled) {
                    setIntentLoading(false)
                }
            })

        return () => {
            cancelled = true
        }
    }, [
        isStripeMethod,
        debouncedAmount,
        debouncedEmail,
        selectedMethod,
        setStripeDetails,
    ])

    useEffect(() => {
        setShowStripeError(false)
        if (isStripeMethod && stripeDetails?.error) {
            setShowStripeError(true)
            setPaymentElementLoading(false)
        }
    }, [isStripeMethod, stripeDetails?.error])

    if (!canShowPayments) {
        return null
    }

    return (
        <div className="wbk_gift_card__payment wbk_step__payment-step">
            <h3 className="wbk_gift_card__section-title">
                {wording?.payment || __('Payment', 'webba-booking-lite')}
            </h3>
            {!hideAmountSummary && formattedAmount && (
                <div className="wbk_gift_card__amount-summary">
                    {__('Total', 'webba-booking-lite')}{' '}
                    <strong>{formattedAmount}</strong>
                </div>
            )}

            {paymentMethods.length > 1 && (
                <PaymentSelector
                    selectedMethod={selectedMethod}
                    setSelectedMethod={handleSelectMethod}
                    methods={paymentMethods}
                    paymentElementLoading={
                        (isStripeMethod &&
                            (paymentElementLoading || intentLoading)) ||
                        (isSquareMethod && paymentElementLoading)
                    }
                />
            )}

            {['paypal', 'mollie', 'woocommerce'].includes(selectedMethod) &&
                paymentMessage.length > 0 && (
                    <FormNotice notice={paymentMessage} />
                )}

            {showStripeError && stripeDetails?.error && (
                <div
                    className={classNames(
                        'wbk_coupon__feedback',
                        'wbk_coupon__feedback--failed'
                    )}
                >
                    {stripeDetails.error}
                </div>
            )}

            {isStripeMethod &&
                stripeDetails?.client_secret &&
                amount > 0 && (
                    <div
                        className="wbk_step__stripe-wrapper"
                        key={stripeDetails.client_secret}
                        ref={stripeWrapperRef}
                    >
                        <Suspense fallback={null}>
                            <StripeWrapper
                                clientSecret={stripeDetails.client_secret}
                            >
                                <GiftCardStripe
                                    selectedMethod={selectedMethod}
                                    onLoadingChange={handleLoadingChange}
                                    onWalletConfirm={onWalletConfirm}
                                />
                                {selectedMethod === 'stripe' &&
                                    preset?.settings?.stripe_fields &&
                                    preset.settings.stripe_fields.length >
                                        0 && (
                                        <StripeBillingFields
                                            stripeFields={
                                                preset.settings.stripe_fields
                                            }
                                            formData={
                                                stripeFormData as IFormData
                                            }
                                            setFormData={setStripeFormField}
                                        />
                                    )}
                            </StripeWrapper>
                        </Suspense>
                    </div>
                )}

            {isSquareMethod && !preset?.settings?.square_application_id && (
                <div
                    className={classNames(
                        'wbk_coupon__feedback',
                        'wbk_coupon__feedback--failed'
                    )}
                >
                    {__('Square is not configured', 'webba-booking-lite')}
                </div>
            )}

            {isSquareMethod &&
                preset?.settings?.square_application_id &&
                amount > 0 && (
                    <PaymentStepSquareSection
                        onLoadingChange={handleLoadingChange}
                        squareWrapperRef={squareWrapperRef}
                    />
                )}

            {isWalletMethod && (
                <p className="wbk_gift_card__wallet-hint">
                    {__(
                        'Use the wallet button above to complete your purchase.',
                        'webba-booking-lite'
                    )}
                </p>
            )}

            <div className="wbk_step__certificates">
                <img
                    src={sslPaymentLogo}
                    alt={wording?.ssl || __('SSL', 'webba-booking-lite')}
                />
                <img
                    src={protectedPrivacyLogo}
                    alt={
                        wording?.privacy ||
                        __('Privacy', 'webba-booking-lite')
                    }
                />
            </div>
        </div>
    )
}
