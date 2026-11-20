import {
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { __ } from '@wordpress/i18n'
import apiFetch from '@wordpress/api-fetch'
import classNames from 'classnames'
import { CustomScroll } from 'react-custom-scroll'
import { PaymentSelector } from '../../../components/PaymentSelector/PaymentSelector'
import { FormNotice } from '../../../components/FormNotice/FormNotice'
import { useBookingContext } from '../../../providers/BookingFormProvider/BookingFormProvider'
import { useWording } from '../../../hooks/useWording'
import { stripeMethods } from '../../BookingForm/PaymentHandler/payments/Stripe/StripeMethods'
import { StripeWrapper } from '../../BookingForm/PaymentHandler/payments/Stripe/StripeWrapper'
import { StripeBillingFields } from '../../BookingForm/PaymentHandler/payments/Stripe/StripeBillingFields'
import { GiftCardStripe } from '../../GiftCard/GiftCardStripe'
import { PaymentStepSquareSection } from '../../BookingForm/steps/PaymentStepSquareSection/PaymentStepSquareSection'
import type { IFormData } from '../../BookingForm/types'
import { usePackagePurchase } from '../PackagePurchaseContext'
import sslPaymentLogo from '../../../../../public/images/logos/ssl-encryption.svg'
import protectedPrivacyLogo from '../../../../../public/images/logos/privacy-protected.svg'
import '../../BookingForm/steps/Steps.scss'

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

export const PackagePaymentStep = () => {
    const {
        paymentMethods,
        paymentMethod,
        setPaymentMethod,
        selectedProduct,
        stripeDetails,
        setStripeDetails,
        purchaseError,
        runPurchase,
    } = usePackagePurchase()
    const { disableCustomScroll, preset } = useBookingContext()
    const wording = useWording()
    const stripeWrapperRef = useRef<HTMLDivElement>(null)
    const squareWrapperRef = useRef<HTMLDivElement>(null)
    const [paymentElementLoading, setPaymentElementLoading] = useState(false)
    const [intentLoading, setIntentLoading] = useState(false)
    const [showStripeError, setShowStripeError] = useState(false)
    const [stripeFormData, setStripeFormData] = useState<Partial<IFormData>>({})

    const amount = Number(selectedProduct?.price || 0)
    const isStripeMethod = stripeMethods.includes(paymentMethod)
    const isSquareMethod = paymentMethod === 'square'

    const handleLoadingChange = useCallback((loading: boolean) => {
        setPaymentElementLoading(loading)
        if (!loading) {
            setTimeout(() => {
                scrollToElementInContainer(stripeWrapperRef.current)
            }, 100)
        }
    }, [])

    const handleSelectMethod = useCallback(
        (method: string) => {
            setPaymentMethod(method)
            setShowStripeError(false)
            setPaymentElementLoading(false)
        },
        [setPaymentMethod]
    )

    const setStripeFormField = useCallback((slug: string, value: unknown) => {
        setStripeFormData((prev) => ({
            ...prev,
            [slug]: value,
        }))
    }, [])

    const paymentMessage = useMemo(() => {
        switch (paymentMethod) {
            case 'bank':
                return wording?.bank_transfer_message || ''
            case 'arrival':
                return wording?.pay_on_arrival_message || ''
            case 'paypal':
                return wording?.paypal_message || ''
            case 'mollie':
                return wording?.mollie_message || ''
            case 'woocommerce':
                return wording?.woocommerce_message || ''
            default:
                return ''
        }
    }, [wording, paymentMethod])

    useEffect(() => {
        if (!isStripeMethod || amount <= 0 || !selectedProduct?.id) {
            setStripeDetails(null)
            setIntentLoading(false)
            return
        }

        let cancelled = false
        setIntentLoading(true)
        setShowStripeError(false)

        apiFetch<{
            success?: boolean
            message?: string
            data?: { stripe_details?: typeof stripeDetails }
            stripe_details?: typeof stripeDetails
        }>({
            path: '/wbk/v2/package-stripe-intent/',
            method: 'POST',
            data: {
                product_id: selectedProduct.id,
                payment_method: paymentMethod,
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
        amount,
        paymentMethod,
        selectedProduct?.id,
        setStripeDetails,
    ])

    useEffect(() => {
        setShowStripeError(false)
        if (isStripeMethod && stripeDetails?.error) {
            setShowStripeError(true)
            setPaymentElementLoading(false)
        }
    }, [isStripeMethod, stripeDetails?.error])

    const content = (
        <div className="wbk_step__payment-step">
            {selectedProduct && (
                <div className="wbk_step__payment-summary">
                    <strong>{selectedProduct.name}</strong>
                    <div>
                        {selectedProduct.visit_count}{' '}
                        {__('visits', 'webba-booking-lite')} -{' '}
                        {selectedProduct.price_formatted}
                    </div>
                </div>
            )}

            {paymentMethods.length > 1 && (
                <PaymentSelector
                    selectedMethod={paymentMethod}
                    setSelectedMethod={handleSelectMethod}
                    methods={paymentMethods as any}
                    paymentElementLoading={
                        (isStripeMethod &&
                            (paymentElementLoading || intentLoading)) ||
                        (isSquareMethod && paymentElementLoading)
                    }
                />
            )}

            {['bank', 'arrival', 'woocommerce', 'paypal', 'mollie'].includes(
                paymentMethod
            ) &&
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

            {isStripeMethod && intentLoading && !stripeDetails?.client_secret && (
                <p className="wbk_step__payment-summary">
                    {__('Loading payment form...', 'webba-booking-lite')}
                </p>
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
                                    selectedMethod={paymentMethod}
                                    onLoadingChange={handleLoadingChange}
                                    onWalletConfirm={async () => {
                                        try {
                                            await runPurchase()
                                            return true
                                        } catch {
                                            return false
                                        }
                                    }}
                                />
                                {paymentMethod === 'stripe' &&
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

            {purchaseError && (
                <div
                    className="wbk_coupon__feedback wbk_coupon__feedback--failed"
                    style={{ marginTop: 12 }}
                >
                    {purchaseError}
                </div>
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

    return disableCustomScroll ? (
        <div className="wbk_step__native-scroll-wrapper">{content}</div>
    ) : (
        <CustomScroll
            flex="1"
            className="wbk_step__scroll-wrapper"
            allowOuterScroll={true}
        >
            {content}
        </CustomScroll>
    )
}
