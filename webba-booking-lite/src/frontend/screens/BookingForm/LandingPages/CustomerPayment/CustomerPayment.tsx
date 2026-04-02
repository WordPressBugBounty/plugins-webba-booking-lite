import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { __ } from '@wordpress/i18n'
import { useDispatch, useSelect } from '@wordpress/data'
import { store_name } from '../../../../../store/frontend'
import { FormNotice } from '../../../../components/FormNotice/FormNotice'
import '../../ThankYou/ThankYou.scss'
import { Button } from '../../../../components/Button/Button'
import { PaymentSelector } from '../../../../components/PaymentSelector/PaymentSelector'
import { CustomScroll } from 'react-custom-scroll'
import classNames from 'classnames'
import { BookingBlock } from '../../../../components/BookingBlock/BookingBlock'
import { wbkFormatPrice } from '../../../../providers/BookingFormProvider/utils'
import { PaymentHandler } from '../../PaymentHandler/PaymentHandler'
import { ThankYou } from '../../ThankYou/ThankYou'
import './CustomerPayment.scss'
import { ICustomerPaymentProps } from './types'
import { useWording } from '../../../../hooks/useWording'
import { toZonedTime } from 'date-fns-tz'
import { fromUnixTime } from 'date-fns'
import { getNamedTimezoneFromOffset } from '../../../../../admin/components/Form/utils/dateTime'
import { stripeMethods } from '../../PaymentHandler/payments/Stripe/StripeMethods'
import { Stripe } from '../../PaymentHandler/payments/Stripe/Stripe'
import { StripeWrapper } from '../../PaymentHandler/payments/Stripe/StripeWrapper'
import { useBookingContext } from '../../../../providers/BookingFormProvider/BookingFormProvider'

export const CustomerPayment = ({
    token,
    token_type,
}: ICustomerPaymentProps) => {
    const {
        fetchBookingDetails,
        fetchPaymentMethods,
        submitStripePayment,
        initializePaymentMethod,
    } = useDispatch(store_name)
    const wording = useWording()
    const preset = useSelect((select: any) => {
        return select(store_name).getPreset()
    }, [])
    const settings = preset?.settings
    useEffect(() => {
        if (token && token_type) {
            fetchBookingDetails(token, token_type)
        }
    }, [fetchBookingDetails, token, token_type])

    const bookingDetails = useSelect(
        (select: any) =>
            select(store_name).getBookingDetails(token, token_type),
        [token, token_type]
    )
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [servicesFetched, setServicesFetched] = useState(false)
    const [showThankYou, setShowThankYou] = useState(false)
    const [initializedPayment, setInitializedPayment] = useState<any>(null)

    // Extract service IDs from booking_data
    const serviceIds = useMemo(() => {
        if (!bookingDetails?.booking_data) return []
        const ids = Object.values(bookingDetails.booking_data)
            .map((item: any) => Number(item.service_id))
            .filter((id: number) => Number.isFinite(id) && id > 0)
        // Remove duplicates
        return Array.from(new Set(ids))
    }, [bookingDetails])

    // Fetch payment methods after booking details are loaded
    useEffect(() => {
        if (bookingDetails && serviceIds.length > 0 && !servicesFetched) {
            fetchPaymentMethods(serviceIds)
            setServicesFetched(true)
        }
    }, [bookingDetails, serviceIds, fetchPaymentMethods, servicesFetched])

    // Get payment methods from store
    const paymentMethods = useSelect(
        (select: any) => select(store_name).getPaymentMethods(serviceIds),
        [serviceIds]
    )

    // Payment details
    const paymentDetails = bookingDetails?.payment_details || {}
    const [selectedMethod, setSelectedMethod] = useState(
        paymentDetails?.payment_method || ''
    )
    const priceFormat = '$#price' // fallback
    const totalAmount = paymentDetails?.total || 0

    // Refs to always have latest values
    const selectedMethodRef = useRef(selectedMethod)
    const paymentMethodsRef = useRef(paymentMethods)

    useEffect(() => {
        selectedMethodRef.current = selectedMethod
    }, [selectedMethod])
    useEffect(() => {
        paymentMethodsRef.current = paymentMethods
    }, [paymentMethods])

    // Ensure selectedMethod is set when paymentMethods are loaded
    useEffect(() => {
        if (paymentMethods && paymentMethods.length > 0 && !selectedMethod) {
            setSelectedMethod(paymentMethods[0].id)
        }
    }, [paymentMethods, selectedMethod])

    // Booking items for BookingBlock
    const bookingItems = useMemo(() => {
        if (!bookingDetails?.booking_data) return []
        return Object.values(bookingDetails.booking_data).map((item: any) => {
            return {
                time: toZonedTime(
                    fromUnixTime(Number(item.time) || 0),
                    getNamedTimezoneFromOffset(item.offset) || ''
                ),
                serviceName: item.service,
            }
        })
    }, [bookingDetails, preset])

    // Helper to calculate item price
    const getItemPrice = (
        prices: (string | number)[],
        quantities: (string | number)[],
        idx: number
    ) => {
        const price = Number(prices[idx] || 0)
        const quantity = Number(quantities[idx] || 1)
        return price * quantity
    }
    // Cost breakdown
    const costItems = useMemo(() => {
        const names: string[] = paymentDetails?.item_names || []
        const prices: (string | number)[] = paymentDetails?.prices || []
        const quantities: (string | number)[] = paymentDetails?.quantities || []
        return names.map((name: string, idx: number) => ({
            name,
            price: getItemPrice(prices, quantities, idx),
        }))
    }, [paymentDetails])
    const tax =
        paymentDetails?.tax_to_pay != null
            ? paymentDetails.tax_to_pay
            : paymentDetails?.tax || 0

    // Handler for pay_on_arrival and bank
    const handlePay = async () => {
        setLoading(true)
        setError(null)

        if (
            stripeMethods.includes(selectedMethod) &&
            initializedPayment?.payment_result?.client_secret
        ) {
            return await handleStripePayment()
        }

        try {
            // @ts-ignore
            const response = await initializePaymentMethod(
                token,
                selectedMethodRef.current
            )
            setInitializedPayment(response)
        } catch (e: any) {
            setError(e?.message || 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    const { stripeObj } = useBookingContext()
    const handleStripePayment = useCallback(async () => {
        if (!stripeMethods.includes(selectedMethod) || !stripeObj) {
            return false
        }
        const { stripe, elements } = stripeObj
        const redirectUrl =
            preset?.settings?.stripe_redirect_url || window.location.href
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${redirectUrl}?paymentMethod=${selectedMethod}&`,
            },
            redirect: 'if_required',
        })

        if (paymentIntent?.status === 'succeeded') {
            const paymentResponse = await submitStripePayment(
                paymentIntent?.id,
                selectedMethod
            )

            if (paymentResponse.status === 'success') {
                setLoading(false)
                setError(null)
                setShowThankYou(true)
            } else {
                setError(paymentResponse.message)
            }

            return true
        } else {
            setError(error?.message || 'Unknown error')
            return false
        }
    }, [
        initializedPayment,
        selectedMethod,
        stripeObj,
        submitStripePayment,
        preset,
    ])

    useEffect(() => {
        if (selectedMethod && stripeMethods.includes(selectedMethod)) {
            handlePay()
        }
    }, [selectedMethod])

    if (!bookingDetails) {
        return (
            <div>
                {wording?.loading_booking_details ||
                    __('Loading booking details...', 'webba-booking-lite')}
            </div>
        )
    }

    // After initialization, show PaymentHandler or ThankYou based on response
    if (initializedPayment) {
        const method =
            initializedPayment?.payment_method ||
            initializedPayment?.payment_details?.payment_method ||
            initializedPayment?.payment_result?.payment_method
        const bookingData =
            initializedPayment?.payment_result || initializedPayment
        if (method === 'paypal' || method === 'woocommerce') {
            return (
                <PaymentHandler
                    bookingData={{ ...bookingDetails, ...bookingData }}
                    paymentMethods={paymentMethods}
                    onPaid={() => setShowThankYou(true)}
                />
            )
        } else if (!stripeMethods.includes(selectedMethod)) {
            return <ThankYou bookingDetails={bookingDetails} />
        }
    }

    if (showThankYou) {
        return <ThankYou bookingDetails={bookingDetails} />
    }

    // Only show the selector, breakdown, and Pay button if NOT initialized
    return (
        <div className={'wbk_thank_you__wrapper'}>
            <CustomScroll
                heightRelativeToParent="calc(750px - 64px)"
                className={'wbk_thank_you__custom-scroll'}
                allowOuterScroll={true}
            >
                <div className={'wbk_thank_you__inner-wrapper'}>
                    <div className={'wbk_thank_you__header'}>
                        <div className={'wbk_thank_you__header__content'}>
                            <h3>
                                {wording?.complete_your_payment ||
                                    __(
                                        'Complete Your Payment',
                                        'webba-booking-lite'
                                    )}
                            </h3>
                            <p>
                                {wording?.select_payment_method_complete_payment ||
                                    __(
                                        'Please select a payment method and complete your payment to confirm your booking.',
                                        'webba-booking-lite'
                                    )}
                            </p>
                        </div>
                    </div>
                    <div className={'wbk_thank_you__booking_items'}>
                        {bookingItems.map(
                            ({ time, serviceName }, idx) =>
                                costItems[idx]?.price > 0 && (
                                    <BookingBlock
                                        key={idx}
                                        time={Number(time)}
                                        serviceName={serviceName}
                                    />
                                )
                        )}
                    </div>
                    <div className={'wbk_thank_you__panel-wrapper'}>
                        <h4>
                            {wording?.cost_breakdown ||
                                __('Cost Breakdown', 'webba-booking-lite')}
                        </h4>
                        <div className={'wbk_thank_you__cart-items'}>
                            {costItems.map((item, idx) => (
                                <div
                                    className={
                                        'wbk_thank_you__cart-items__item'
                                    }
                                    key={idx}
                                >
                                    <p>{item.name}</p>
                                    <strong>
                                        {wbkFormatPrice(
                                            item.price,
                                            priceFormat
                                        )}
                                    </strong>
                                </div>
                            ))}
                            {/* Show tax if greater than 0 */}
                            {tax && Number(tax) > 0 && (
                                <div
                                    className={classNames(
                                        'wbk_thank_you__cart-items__item',
                                        'wbk_thank_you__cart-items__item--tax'
                                    )}
                                >
                                    <h4>
                                        {wording?.tax ||
                                            __('Tax', 'webba-booking-lite')}
                                    </h4>
                                    <strong>
                                        {wbkFormatPrice(
                                            Number(tax),
                                            priceFormat
                                        )}
                                    </strong>
                                </div>
                            )}
                            <div
                                className={classNames(
                                    'wbk_thank_you__cart-items__item',
                                    'wbk_thank_you__cart-items__item--total'
                                )}
                            >
                                <h4>
                                    {wording?.total_amount_due ||
                                        __(
                                            'Total amount due',
                                            'webba-booking-lite'
                                        )}
                                </h4>
                                <strong>
                                    {wbkFormatPrice(totalAmount, priceFormat)}
                                </strong>
                            </div>
                        </div>
                    </div>
                    <div
                        className={classNames(
                            'wbk_thank_you__panel-wrapper',
                            'wbk_customer_panel'
                        )}
                    >
                        <PaymentSelector
                            selectedMethod={selectedMethod}
                            setSelectedMethod={setSelectedMethod}
                            methods={paymentMethods}
                        />
                        {stripeMethods.includes(selectedMethod) &&
                            initializedPayment &&
                            initializedPayment?.payment_result
                                ?.client_secret && (
                                <div className={'wbk_customer_panel__stripe'}>
                                    <StripeWrapper
                                        clientSecret={
                                            initializedPayment.payment_result
                                                .client_secret
                                        }
                                    >
                                        <Stripe
                                            selectedMethod={selectedMethod}
                                        />
                                    </StripeWrapper>
                                </div>
                            )}
                        <Button
                            onClick={handlePay}
                            type="primary"
                            showLoading={loading}
                            disabled={
                                loading ||
                                (stripeMethods.includes(selectedMethod) &&
                                    (!initializedPayment?.payment_result
                                        ?.client_secret ||
                                        !stripeObj?.isValidated))
                            }
                        >
                            {wording?.pay || __('Pay', 'webba-booking-lite')}
                        </Button>
                        {error && (
                            <div
                                className={'wbk_thank_you__action-button-error'}
                            >
                                {error}
                            </div>
                        )}
                    </div>
                    {settings?.show_post_booking_instructions &&
                        bookingDetails?.booking_instruction && (
                            <FormNotice
                                className={'wbk_thank_you__information'}
                            >
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: bookingDetails?.booking_instruction,
                                    }}
                                />
                            </FormNotice>
                        )}
                </div>
            </CustomScroll>
        </div>
    )
}
