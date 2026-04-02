import { useBookingContext } from '../../../providers/BookingFormProvider/BookingFormProvider'
import { PaymentSelector } from '../../../components/PaymentSelector/PaymentSelector'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FormNotice } from '../../../components/FormNotice/FormNotice'
import { __ } from '@wordpress/i18n'
import './Steps.scss'
import { Button } from '../../../components/Button/Button'
import { useDispatch, useSelect } from '@wordpress/data'
import { store, store_name } from '../../../../store/frontend'
import sslPaymentLogo from '../../../../../public/images/logos/ssl-encryption.svg'
import protectedPrivacyLogo from '../../../../../public/images/logos/privacy-protected.svg'
import { CustomScroll } from 'react-custom-scroll'
import classNames from 'classnames'
import { useWording } from '../../../hooks/useWording'
import { Stripe } from '../PaymentHandler/payments/Stripe/Stripe'
import { stripeMethods } from '../PaymentHandler/payments/Stripe/StripeMethods'
import { StripeWrapper } from '../PaymentHandler/payments/Stripe/StripeWrapper'
import { StripeBillingFields } from '../PaymentHandler/payments/Stripe/StripeBillingFields'

const scrollToElementInContainer = (element: HTMLElement | null) => {
    if (!element) return

    let container = element.parentElement
    while (container) {
        const style = window.getComputedStyle(container)
        if (
            style.overflowY === 'auto' ||
            style.overflowY === 'scroll' ||
            container.classList.contains('wbk_step__scroll-wrapper')
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

export const PaymentStep = () => {
    const { fetchBookingAmounts, setLoading, setBookingAmounts } =
        useDispatch(store_name)
    const { formData, setFormData, paymentMethods, amountData, preset } =
        useBookingContext()

    const couponInputRef = useRef<HTMLInputElement>(null)
    const stripeWrapperRef = useRef<HTMLDivElement>(null)
    const [applied, setApplied] = useState(false)
    const [showFeedback, setShowFeedback] = useState(false)
    const [paymentElementLoading, setPaymentElementLoading] = useState(false)
    const [showStripeError, setShowStripeError] = useState(false)

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
            setFormData('payment_method', method)
            setShowStripeError(false)
            setPaymentElementLoading(false)
        },
        [setFormData]
    )

    const isCouponLoading = useSelect(
        // @ts-ignore
        (select) => select(store).getLoading().applyingCoupon,
        []
    )

    const isBookingAmountsLoading = useSelect(
        // @ts-ignore
        (select) => select(store).getLoading().bookingAmounts,
        []
    )

    const applyCoupon = useCallback(async () => {
        const coupon = couponInputRef.current?.value || ''
        setLoading('applyingCoupon', true)
        const updatedFormData = {
            ...formData,
            coupon,
        }

        if (
            !coupon ||
            !updatedFormData.places ||
            Object.keys(updatedFormData.places).length === 0
        ) {
            setLoading('applyingCoupon', false)
            return
        }

        await fetchBookingAmounts(updatedFormData)
        setApplied(true)
        setShowFeedback(true)
        setLoading('applyingCoupon', false)
    }, [formData, fetchBookingAmounts])

    // fetch amount data on stripe payment selection
    useEffect(() => {
        if (stripeMethods.includes(formData.payment_method)) {
            fetchBookingAmounts(formData)
        }
    }, [formData.payment_method, fetchBookingAmounts])

    // Reset feedback when coupon changes
    useEffect(() => {
        setApplied(false)
        setShowFeedback(false)
    }, [formData.coupon])

    useEffect(() => {
        setShowStripeError(false)

        if (
            stripeMethods.includes(formData.payment_method) &&
            amountData?.stripe_details?.error
        ) {
            setShowStripeError(true)
            setPaymentElementLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [amountData?.stripe_details?.error])

    const couponApplied = applied && amountData.discount > 0
    const couponFailed = applied && showFeedback && amountData.discount === 0
    const wording = useWording()

    const paymentMessage = useMemo(() => {
        switch (formData.payment_method) {
            case 'bank':
                return wording?.bank_transfer_message || ''
            case 'arrival':
                return wording?.pay_on_arrival_message || ''
            case 'paypal':
                return wording?.paypal_message || ''
            case 'woocommerce':
                return wording?.woocommerce_message || ''
            default:
                return ''
        }
    }, [wording, formData.payment_method])

    return (
        <CustomScroll
            flex="1"
            className={'wbk_step__scroll-wrapper'}
            allowOuterScroll={true}
        >
            <div className={'wbk_step__payment-step'}>
                {paymentMethods.length > 1 && amountData?.to_pay_total > 0 && (
                    <PaymentSelector
                        selectedMethod={formData.payment_method as string}
                        setSelectedMethod={handleSelectMethod}
                        methods={paymentMethods}
                        paymentElementLoading={
                            stripeMethods.includes(
                                formData.payment_method as string
                            ) &&
                            (paymentElementLoading || isBookingAmountsLoading)
                        }
                    />
                )}

                {['bank', 'arrival', 'woocommerce', 'paypal'].includes(
                    formData.payment_method
                ) &&
                    paymentMessage.length > 0 && (
                        <FormNotice notice={paymentMessage} />
                    )}

                {(Number(amountData?.left_to_pay) > 0 || !!formData.pay_full_amount) && (
                    <label className={'wbk_step__pay-full-amount'}>
                        <input
                            type="checkbox"
                            checked={!!formData.pay_full_amount}
                            onChange={(e) => {
                                const checked = e.target.checked
                                setFormData('pay_full_amount', checked)
                                fetchBookingAmounts({
                                    ...formData,
                                    pay_full_amount: checked,
                                })
                            }}
                        />
                        <span>
                            {wording?.pay_full_amount ||
                                __('I want to pay full amount', 'webba-booking-lite')}
                        </span>
                    </label>
                )}

                <div className={'wbk_step__separator'}></div>

                {preset?.settings.coupons_enabled && (
                    <>
                        <div className={'wbk_coupon__wrapper'}>
                            <input
                                type="text"
                                placeholder={
                                    wording?.enter_coupon_code ||
                                    __(
                                        'Enter coupon code',
                                        'webba-booking-lite'
                                    )
                                }
                                name="coupon"
                                id="coupon"
                                ref={couponInputRef}
                                value={formData.coupon || ''}
                                onChange={(e) => {
                                    setFormData('coupon', e.target.value)
                                }}
                            />
                            <Button
                                onClick={applyCoupon}
                                type="secondary"
                                disabled={applied && amountData.discount > 0}
                                showLoading={isCouponLoading}
                            >
                                {applied && amountData.discount > 0
                                    ? wording?.applied ||
                                      __('Applied', 'webba-booking-lite')
                                    : wording?.apply ||
                                      __('Apply', 'webba-booking-lite')}
                            </Button>
                        </div>
                        {couponApplied && !isCouponLoading && (
                            <div
                                className={classNames(
                                    'wbk_coupon__feedback',
                                    'wbk_coupon__feedback--success'
                                )}
                            >
                                {wording?.coupon_applied_success ||
                                    __(
                                        'Coupon applied successfully!',
                                        'webba-booking-lite'
                                    )}
                            </div>
                        )}
                        {couponFailed && !isCouponLoading && (
                            <div
                                className={classNames(
                                    'wbk_coupon__feedback',
                                    'wbk_coupon__feedback--failed'
                                )}
                            >
                                {wording?.coupon_failed ||
                                    __(
                                        'Coupon did not apply. Please check your code.',
                                        'webba-booking-lite'
                                    )}
                            </div>
                        )}
                    </>
                )}

                {showStripeError && amountData?.stripe_details?.error && (
                    <div
                        className={classNames(
                            'wbk_coupon__feedback',
                            'wbk_coupon__feedback--failed'
                        )}
                    >
                        {amountData.stripe_details.error}
                    </div>
                )}

                {stripeMethods.includes(formData?.payment_method) &&
                    amountData?.stripe_details?.client_secret &&
                    amountData?.to_pay_total > 0 && (
                        <div
                            className="wbk_step__stripe-wrapper"
                            key={amountData?.stripe_details?.client_secret}
                            ref={stripeWrapperRef}
                        >
                            <StripeWrapper
                                clientSecret={
                                    amountData?.stripe_details?.client_secret
                                }
                            >
                                <Stripe
                                    selectedMethod={formData?.payment_method}
                                    onLoadingChange={handleLoadingChange}
                                />
                                {formData?.payment_method === 'stripe' &&
                                    preset?.settings?.stripe_fields?.length >
                                        0 && (
                                        <StripeBillingFields
                                            stripeFields={
                                                preset?.settings?.stripe_fields
                                            }
                                            formData={formData}
                                            setFormData={setFormData}
                                        />
                                    )}
                            </StripeWrapper>
                        </div>
                    )}

                <div className={'wbk_step__certificates'}>
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
        </CustomScroll>
    )
}
