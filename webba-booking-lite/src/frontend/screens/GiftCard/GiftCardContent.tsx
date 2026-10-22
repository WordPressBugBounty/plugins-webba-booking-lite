import { useCallback, useMemo } from 'react'
import { __ } from '@wordpress/i18n'
import apiFetch from '@wordpress/api-fetch'
import classNames from 'classnames'
import { useForm } from '../../components/Form/FormProvider'
import { IFormContext } from '../../components/Form/types'
import { Validators, validateField } from '../../components/Form/validation'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'
import { stripeMethods } from '../BookingForm/PaymentHandler/payments/Stripe/StripeMethods'
import { tokenizeSquareCard } from '../../lib/chargeSquarePayment'
import {
    GiftCardPaymentSection,
} from './GiftCardPaymentSection'
import { GiftCardPaymentHandler } from './GiftCardPaymentHandler'
import { GiftCardThankYou, IGiftCardResult } from './GiftCardThankYou'
import { GiftCardPaymentSuccess } from './GiftCardPaymentSuccess'
import { PaymentCancelled } from '../BookingForm/LandingPages/PaymentCancelled/PaymentCancelled'
import { GiftCardAmountStep } from './GiftCardAmountStep'
import { GiftCardDesignStep } from './GiftCardDesignStep'
import { GiftCardRecipientStep } from './GiftCardRecipientStep'
import { GiftCardSendTimeStep } from './GiftCardSendTimeStep'
import { GiftCardBuyerStep } from './GiftCardBuyerStep'
import { GiftCardCheckoutBar } from './GiftCardCheckoutBar'
import { GiftCardContentProps } from './types'
import {
    formatGiftCardSendDateTime,
    getGiftCardPresetAmounts,
    getGiftCardPolicyHtml,
    giftCardSendOnPayload,
    isGiftCardCustomAmountAllowed,
} from './utils'

export const GiftCardContent = ({
    fields,
    sendOn,
    setSendOn,
    sendOnError,
    setSendOnError,
    sendOnTouched,
    setSendOnTouched,
    selectedMethod,
    setSelectedMethod,
    paymentMethods,
    formattedAmount,
    amountValue,
    buyerEmail,
    isNarrowForm,
    validateSendOn,
    sendTime,
    setSendTime,
    sendTimezone,
    setSendTimezone,
    stripeDetails,
    setStripeDetails,
    purchasePhase,
    setPurchasePhase,
    purchaseResult,
    setPurchaseResult,
    paymentUrl,
    setPaymentUrl,
    purchaseError,
    setPurchaseError,
    purchasing,
    setPurchasing,
    paypalReturnPaymentId,
}: GiftCardContentProps) => {
    const { anyTouched, setAnyTouched } = useForm() as IFormContext
    const { stripeObj, squareObj, preset, priceFormat } = useBookingContext()
    const presetAmounts = useMemo(
        () => getGiftCardPresetAmounts(preset),
        [preset]
    )
    const allowCustom = isGiftCardCustomAmountAllowed(preset)
    const policyHtml = getGiftCardPolicyHtml(preset)
    const sendTiming = String(
        fields.find((field) => field.slug === 'send_timing')?.value ?? 'now'
    )

    const recipientName = useMemo(() => {
        const field = fields.find((field) => field.slug === 'recipient_name')
        return String(field?.value ?? '')
    }, [fields])

    const isFormValid = useMemo(() => {
        const fieldErrors = fields.some((field) => {
            const validators = [
                ...(field.required ? [Validators.required] : []),
                ...(field.type === 'email' ? [Validators.email] : []),
                ...(field.validators || []),
            ]

            return validateField({ ...field, validators } as any).length > 0
        })

        const nextSendOnError =
            sendTiming === 'later'
                ? validateSendOn(sendOn, sendTime, sendTimezone)
                : null

        return !fieldErrors && !nextSendOnError && !!selectedMethod
    }, [
        fields,
        sendTiming,
        sendOn,
        sendTime,
        sendTimezone,
        selectedMethod,
        validateSendOn,
    ])

    const isStripeMethod = stripeMethods.includes(selectedMethod)
    const isWalletMethod = ['google_pay', 'apple_pay'].includes(selectedMethod)

    const isStripeReady = useMemo(() => {
        if (!isStripeMethod) {
            return true
        }
        if (!stripeDetails?.client_secret || stripeDetails?.error) {
            return false
        }
        if (isWalletMethod) {
            return true
        }
        return !!stripeObj?.isValidated
    }, [isStripeMethod, isWalletMethod, stripeDetails, stripeObj?.isValidated])

    const isSquareMethod = selectedMethod === 'square'
    const isSquareReady = !isSquareMethod || !!squareObj?.isValidated

    const canPurchase =
        isFormValid && isStripeReady && isSquareReady && !!selectedMethod

    const buildPayload = useCallback(() => {
        const getValue = (slug: string) =>
            fields.find((field) => field.slug === slug)?.value

        return {
            buyer_name: String(getValue('buyer_name') ?? ''),
            buyer_email: String(getValue('buyer_email') ?? ''),
            recipient_name: String(getValue('recipient_name') ?? ''),
            recipient_email: String(getValue('recipient_email') ?? ''),
            message: String(getValue('message') ?? ''),
            design: String(getValue('design') ?? ''),
            amount: amountValue,
            send_on: giftCardSendOnPayload(sendTiming, sendOn, sendTime),
            send_timezone: sendTiming === 'later' ? sendTimezone : '',
            expiration_date: '',
            applicable_for_all_services: 'yes',
            services: [],
            payment_method: selectedMethod,
            stripe_details: stripeDetails
                ? {
                      intent_id: stripeDetails.intent_id,
                      client_secret: stripeDetails.client_secret,
                  }
                : undefined,
        }
    }, [
        fields,
        amountValue,
        sendTiming,
        sendOn,
        sendTime,
        sendTimezone,
        selectedMethod,
        stripeDetails,
    ])

    const completeStripePurchase = useCallback(async () => {
        const { stripe, elements } = stripeObj || {}
        if (!stripe || !elements) {
            setPurchaseError(
                __(
                    'Stripe is not ready. Please try again.',
                    'webba-booking-lite'
                )
            )
            return false
        }

        const redirectUrl =
            preset?.settings?.stripe_redirect_url || window.location.href

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${redirectUrl}?wbk_gift_card=1&paymentMethod=${selectedMethod}&`,
                payment_method_data: {
                    billing_details: {
                        email: buyerEmail || undefined,
                    },
                },
            },
            redirect: 'if_required',
        })

        if (error) {
            setPurchaseError(
                error.message ||
                    __('Payment failed. Please try again.', 'webba-booking-lite')
            )
            return false
        }

        if (paymentIntent?.status !== 'succeeded') {
            setPurchaseError(
                __('Payment was not completed.', 'webba-booking-lite')
            )
            return false
        }

        const payload = {
            ...buildPayload(),
            payment_intent_id: paymentIntent.id,
            stripe_details: {
                intent_id: paymentIntent.id,
            },
        }

        const response = await apiFetch<{
            success?: boolean
            message?: string
            gift_card?: IGiftCardResult
            payment_method?: string
        }>({
            path: '/wbk/v2/purchase-gift-card/',
            method: 'POST',
            data: payload,
        })

        if (!response?.success || !response.gift_card) {
            setPurchaseError(
                response?.message ||
                    __(
                        'Unable to complete gift card purchase.',
                        'webba-booking-lite'
                    )
            )
            return false
        }

        setPurchaseResult(response.gift_card)
        setPurchasePhase('success')
        return true
    }, [
        stripeObj,
        preset,
        selectedMethod,
        buyerEmail,
        buildPayload,
        setPurchaseError,
        setPurchaseResult,
        setPurchasePhase,
    ])

    const handlePurchase = useCallback(async () => {
        setAnyTouched(true)
        setPurchaseError(null)
        const nextSendOnError =
            sendTiming === 'later'
                ? validateSendOn(sendOn, sendTime, sendTimezone)
                : null
        setSendOnError(nextSendOnError)

        if (!isFormValid || nextSendOnError) {
            return
        }

        if (['google_pay', 'apple_pay'].includes(selectedMethod)) {
            return
        }

        setPurchasing(true)
        try {
            if (stripeMethods.includes(selectedMethod)) {
                if (!stripeDetails?.client_secret || stripeDetails?.error) {
                    setPurchaseError(
                        stripeDetails?.error ||
                            __(
                                'Unable to initialize Stripe payment.',
                                'webba-booking-lite'
                            )
                    )
                    return
                }
                await completeStripePurchase()
                return
            }

            const squarePayload: Record<string, string> = {}
            if (isSquareMethod) {
                const payload = buildPayload()
                const tokenResult = await tokenizeSquareCard({
                    squareObj,
                    amount: amountValue,
                    currency:
                        squareObj?.currency ||
                        preset?.settings?.square_currency ||
                        'USD',
                    email: payload.buyer_email,
                    givenName: payload.buyer_name,
                })
                if (tokenResult.error || !tokenResult.token) {
                    setPurchaseError(
                        tokenResult.error ||
                            __(
                                'Card tokenization failed',
                                'webba-booking-lite'
                            )
                    )
                    return
                }
                squarePayload.square_source_id = tokenResult.token
                squarePayload.square_verification_token =
                    tokenResult.verificationToken || ''
            }

            const response = await apiFetch<{
                success?: boolean
                message?: string
                payment_required?: boolean
                payment_method?: string
                payment_url?: string
                gift_card?: IGiftCardResult
            }>({
                path: '/wbk/v2/purchase-gift-card/',
                method: 'POST',
                data: { ...buildPayload(), ...squarePayload },
            })

            if (!response?.success) {
                setPurchaseError(
                    response?.message ||
                        __(
                            'Unable to start gift card purchase.',
                            'webba-booking-lite'
                        )
                )
                return
            }

            if (response.payment_required && response.payment_url) {
                setPaymentUrl(response.payment_url)
                setPurchasePhase('redirect_payment')
                return
            }

            if (response.gift_card) {
                setPurchaseResult(response.gift_card)
                setPurchasePhase('success')
            }
        } catch (e: any) {
            setPurchaseError(
                e?.message ||
                    __(
                        'Unable to complete gift card purchase.',
                        'webba-booking-lite'
                    )
            )
        } finally {
            setPurchasing(false)
        }
    }, [
        setAnyTouched,
        sendTiming,
        validateSendOn,
        sendOn,
        sendTime,
        sendTimezone,
        setSendOnError,
        isFormValid,
        selectedMethod,
        setPurchasing,
        stripeDetails,
        completeStripePurchase,
        isSquareMethod,
        squareObj,
        amountValue,
        preset,
        buildPayload,
        setPurchaseError,
        setPaymentUrl,
        setPurchasePhase,
        setPurchaseResult,
    ])

    const handleWalletConfirm = useCallback(async () => {
        setAnyTouched(true)
        if (!isFormValid) {
            return false
        }
        setPurchasing(true)
        try {
            return await completeStripePurchase()
        } catch (e: any) {
            setPurchaseError(
                e?.message ||
                    __(
                        'Unable to complete gift card purchase.',
                        'webba-booking-lite'
                    )
            )
            return false
        } finally {
            setPurchasing(false)
        }
    }, [
        setAnyTouched,
        isFormValid,
        setPurchasing,
        completeStripePurchase,
        setPurchaseError,
    ])

    if (purchasePhase === 'cancelled') {
        return <PaymentCancelled />
    }

    if (purchasePhase === 'paypal_return' && paypalReturnPaymentId) {
        return <GiftCardPaymentSuccess paymentId={paypalReturnPaymentId} />
    }

    if (purchasePhase === 'success' && purchaseResult) {
        return (
            <GiftCardThankYou
                giftCard={purchaseResult}
                paymentMethod={
                    purchaseResult.payment_method || selectedMethod
                }
            />
        )
    }

    if (purchasePhase === 'redirect_payment' && paymentUrl) {
        return (
            <GiftCardPaymentHandler
                paymentMethod={selectedMethod}
                paymentUrl={paymentUrl}
                amount={amountValue}
                paymentMethods={paymentMethods}
                recipientName={recipientName}
            />
        )
    }

    return (
        <div
            className={classNames(
                'wbk_booking_form__wrapper',
                'wbk_booking_form__wrapper--gift-card',
                {
                    'wbk_booking_form__wrapper--narrow-form': isNarrowForm,
                }
            )}
        >
            <div className="wbk_booking_form__body__wrapper">
                <div className="wbk_booking_form__body__inner-wrapper">
                    <div className="wbk_booking_form__left-panel">
                        <div className="wbk_booking_form__content">
                            <div className="wbk_gift_card__header">
                                <h3 className="wbk_gift_card__title">
                                    {__('Buy a gift card', 'webba-booking-lite')}
                                </h3>
                                <p className="wbk_gift_card__description">
                                    {__(
                                        'Choose an amount and design, then add who it is for. After payment, you will receive a receipt and the recipient will get their gift card by email.',
                                        'webba-booking-lite'
                                    )}
                                </p>
                            </div>

                            <GiftCardAmountStep
                                presetAmounts={presetAmounts}
                                allowCustom={allowCustom}
                                priceFormat={priceFormat}
                            />
                            <GiftCardDesignStep />
                            <GiftCardRecipientStep />
                            <GiftCardSendTimeStep
                                sendOn={sendOn}
                                setSendOn={setSendOn}
                                sendOnError={sendOnError}
                                setSendOnError={setSendOnError}
                                sendOnTouched={sendOnTouched}
                                setSendOnTouched={setSendOnTouched}
                                validateSendOn={validateSendOn}
                                sendTime={sendTime}
                                setSendTime={setSendTime}
                                sendTimezone={sendTimezone}
                                setSendTimezone={setSendTimezone}
                            />
                            <GiftCardBuyerStep />

                            <GiftCardPaymentSection
                                amount={amountValue}
                                formattedAmount={formattedAmount}
                                buyerEmail={buyerEmail}
                                paymentMethods={paymentMethods}
                                selectedMethod={selectedMethod}
                                setSelectedMethod={setSelectedMethod}
                                stripeDetails={stripeDetails}
                                setStripeDetails={setStripeDetails}
                                onWalletConfirm={handleWalletConfirm}
                                hideAmountSummary
                            />

                            {purchaseError && (
                                <div
                                    className={classNames(
                                        'wbk_coupon__feedback',
                                        'wbk_coupon__feedback--failed'
                                    )}
                                >
                                    {purchaseError}
                                </div>
                            )}
                        </div>

                        {!isWalletMethod || policyHtml ? (
                            <GiftCardCheckoutBar
                                formattedAmount={formattedAmount}
                                recipientName={recipientName}
                                sendTiming={sendTiming}
                                sendOnLabel={formatGiftCardSendDateTime(
                                    sendOn,
                                    sendTime,
                                    sendTimezone
                                )}
                                canPurchase={canPurchase}
                                purchasing={purchasing}
                                onPurchase={handlePurchase}
                                policyHtml={policyHtml}
                                showPurchaseButton={!isWalletMethod}
                            />
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    )
}
