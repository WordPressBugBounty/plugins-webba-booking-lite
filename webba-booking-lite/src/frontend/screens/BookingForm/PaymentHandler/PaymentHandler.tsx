import React, { useMemo, useState } from 'react'
import { __ } from '@wordpress/i18n'
import { Button } from '../../../components/Button/Button'
import './PaymentHandler.scss'
import { BookingBlock } from '../../../components/BookingBlock/BookingBlock'
import { wbkFormatPrice } from '../../../providers/BookingFormProvider/utils'
import { FormNotice } from '../../../components/FormNotice/FormNotice'
import classNames from 'classnames'
import iconCheck from '../../../../../public/images/icon-check.svg'
import { useBookingContext } from '../../../providers/BookingFormProvider/BookingFormProvider'
import { useWording } from '../../../hooks/useWording'
import { CustomScroll } from 'react-custom-scroll'
import { fromUnixTime } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
export const PaymentHandler: React.FC<{
    bookingData: any
    paymentMethods?: any[]
    onPaid?: () => void
}> = ({ bookingData, paymentMethods: propPaymentMethods, onPaid }) => {
    const [paymentSuccess, setPaymentSuccess] = useState(false)
    const [buttonLoading, setButtonLoading] = useState(false)
    const [buttonError, setButtonError] = useState<string>('')
    const wording = useWording()
    const {
        paymentMethods: contextPaymentMethods,
        priceFormat,
        services,
        amountData,
        preset,
        timezone,
    } = useBookingContext()
    const settings = preset?.settings
    if (!bookingData) return null

    const paymentMethod = bookingData.payment_method
    const paymentUrl = bookingData.payment_url
    const paymentDetails = bookingData.payment_details
    const paymentRequired = bookingData.payment_required
    const bookingTimes = bookingData.times

    const paymentMethods = propPaymentMethods || contextPaymentMethods
    const iCalRequiredPlans = ['pro', 'premium']
    const isIcalAvailable = useMemo(() => {
        if (!preset?.plan_map) return false

        return iCalRequiredPlans.some((plan) => preset.plan_map[plan] === true)
    }, [preset?.plan_map, iCalRequiredPlans])

    const paymentMethodObj = paymentMethods.find(
        (pm: { name: string; id: string }) =>
            pm.name === paymentMethod || pm.id === paymentMethod
    )
    const paymentIcon = paymentMethodObj?.icon || ''
    const paymentTitle = paymentMethodObj
        ? (wording?.pay_with || __('Pay with', 'webba-booking-lite')) +
          ' ' +
          (paymentMethodObj.name.charAt(0).toUpperCase() +
              paymentMethodObj.name.slice(1))
        : wording?.payment || __('Payment', 'webba-booking-lite')

    // Booking items for BookingBlock
    const bookingItems = useMemo<{ time: Date; serviceName: string }[]>(() => {
        if (!paymentDetails?.item_names) return []
        // If you have time/serviceName info, map it here. Otherwise, just show names.
        return paymentDetails.item_names.map((name: string, idx: number) => ({
            // time: new Date(), // fallback to now if no time info
            time: toZonedTime(fromUnixTime(bookingTimes[idx] || 0), timezone),
            serviceName: name,
        }))
    }, [paymentDetails])

    // Cost breakdown (dual logic)
    let costItems: {
        name: string
        price: number
        priceFromAmountData: number
        priceFallback: number
    }[] = []
    let totalAmount = 0
    let tax = 0
    if (paymentDetails && paymentDetails.item_names && paymentDetails.prices) {
        // Use paymentDetails if present (legacy/confirmed bookings)
        const names: string[] = paymentDetails.item_names || []
        const prices: (string | number)[] = paymentDetails.prices || []
        const quantities: (string | number)[] = paymentDetails.quantities || []
        costItems = names.map((name: string, idx: number) => {
            const price = Number(prices[idx] || 0)
            const quantity = Number(quantities[idx] || 1)
            const totalPrice = price * quantity
            return {
                name,
                price: totalPrice,
                priceFromAmountData: totalPrice,
                priceFallback: totalPrice,
            }
        })
        totalAmount = paymentDetails.to_pay_total || 0
        tax =
            paymentDetails.tax_to_pay != null
                ? paymentDetails.tax_to_pay
                : paymentDetails?.tax || 0
    } else {
        // Use dual calculation logic for selected services
        const selectedServices = services.filter((s: any) => s.selected)
        costItems = selectedServices.map((service: any) => {
            const matchedAmountItems = amountData.items.filter(
                (item: any) => item.id === service.id
            )
            const amountDataPrice = matchedAmountItems.reduce(
                (sum: number, item: any) => sum + Number(item.price || 0),
                0
            )
            const servicePrice = Number(service.price) || 0
            const quantity = Number(service.quantity) || 1
            const numPlaces = Array.isArray(service.places)
                ? service.places.length
                : 1
            const fallbackPrice = servicePrice * quantity * numPlaces
            return {
                name: service.label,
                price: amountDataPrice > 0 ? amountDataPrice : fallbackPrice,
                priceFromAmountData: amountDataPrice,
                priceFallback: fallbackPrice,
            }
        })
        totalAmount =
            amountData.to_pay_total && Number(amountData.to_pay_total) > 0
                ? Number(amountData.to_pay_total)
                : costItems.reduce((sum, item) => sum + item.priceFallback, 0)
        tax = amountData.tax_to_pay || 0
    }

    // Handle payment
    const handlePay = async () => {
        setButtonLoading(true)
        setButtonError('')
        try {
            if (paymentMethod === 'paypal' && paymentUrl) {
                window.open(paymentUrl, '_blank')
                setButtonLoading(false)
                return
            }
            if (paymentMethod === 'woocommerce' && paymentUrl) {
                window.location.href = paymentUrl
                setButtonLoading(false)
                return
            }
            // For pay_on_arrival or bank, simulate success
            if (
                paymentMethod === 'pay_on_arrival' ||
                paymentMethod === 'bank'
            ) {
                setTimeout(() => {
                    setPaymentSuccess(true)
                    onPaid && onPaid()
                }, 1000)
                return
            }
            // For other methods, simulate success
            setTimeout(() => {
                setPaymentSuccess(true)
                onPaid && onPaid()
            }, 1000)
        } catch (e: any) {
            setButtonError(e?.message || 'Unknown error')
        } finally {
            setButtonLoading(false)
        }
    }

    return (
        <div className={'wbk_thank_you__wrapper'}>
            <CustomScroll
                heightRelativeToParent="Calc(750px - 64px)"
                allowOuterScroll={true}
            >
                <div className={'wbk_thank_you__inner-wrapper'}>
                    {/* Header always visible, animate only the success state */}
                    <div className={'wbk_thank_you__header'}>
                        {!paymentSuccess && (
                            <>
                                <img
                                    src={paymentIcon}
                                    alt={paymentMethod}
                                    style={{ width: 56, height: 56 }}
                                />
                                <div
                                    className={'wbk_thank_you__header__content'}
                                >
                                    <h3>{paymentTitle}</h3>
                                    <p>
                                        {wording?.please_complete_payment_confirm_booking ||
                                            __(
                                                'Please complete your payment to confirm your booking.',
                                                'webba-booking-lite'
                                            )}
                                    </p>
                                </div>
                            </>
                        )}
                        {paymentSuccess && (
                            <div className={'wbk_thank_you__header--visible'}>
                                <img
                                    src={iconCheck}
                                    alt={
                                        wording?.payment_successful ||
                                        __(
                                            'Payment successful',
                                            'webba-booking-lite'
                                        )
                                    }
                                />
                                <div
                                    className={'wbk_thank_you__header__content'}
                                >
                                    <h3>
                                        {wording?.payment_successful ||
                                            __(
                                                'Payment Successful',
                                                'webba-booking-lite'
                                            )}
                                    </h3>
                                    <p>
                                        {wording?.thank_you_payment ||
                                            __(
                                                'Thank you for your payment.',
                                                'webba-booking-lite'
                                            )}
                                    </p>
                                </div>
                                {paymentSuccess &&
                                    bookingData?.ical_url &&
                                    isIcalAvailable && (
                                        <Button
                                            title={
                                                wording?.add_to_calendar ||
                                                __(
                                                    '+ Add to Calendar',
                                                    'webba-booking-lite'
                                                )
                                            }
                                            href={bookingData.ical_url}
                                            target="_blank"
                                        />
                                    )}
                            </div>
                        )}
                    </div>
                    {/* Booking Items */}
                    <div className={'wbk_thank_you__booking_items'}>
                        {bookingItems.map(
                            (
                                {
                                    time,
                                    serviceName,
                                }: { time: Date; serviceName: string },
                                idx: number
                            ) =>
                                costItems[idx]?.price > 0 && (
                                    <BookingBlock
                                        key={idx}
                                        time={Number(
                                            Math.floor(time.getTime() / 1000)
                                        )}
                                        serviceName={serviceName}
                                    />
                                )
                        )}
                    </div>
                    {/* Cost Breakdown */}
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
                                        {item.priceFromAmountData > 0
                                            ? wbkFormatPrice(
                                                  item.priceFromAmountData,
                                                  priceFormat
                                              )
                                            : wbkFormatPrice(
                                                  item.priceFallback,
                                                  priceFormat
                                              )}
                                    </strong>
                                </div>
                            ))}
                            {typeof amountData.tax_to_pay === 'number' &&
                                amountData.tax_to_pay > 0 && (
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
                                                amountData.tax_to_pay,
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
                                    {wording?.total_amount_paid ||
                                        __(
                                            'Total amount',
                                            'webba-booking-lite'
                                        )}
                                </h4>
                                <strong>
                                    {wbkFormatPrice(totalAmount, priceFormat)}
                                </strong>
                            </div>
                            {Number(amountData?.left_to_pay) > 0 && (
                                <div className="wbk_thank_you__cart-items__item">
                                    <h4>
                                        {wording?.left_to_pay ||
                                            __(
                                                'Left to pay',
                                                'webba-booking-lite'
                                            )}
                                    </h4>
                                    <strong>
                                        {wbkFormatPrice(
                                            amountData.left_to_pay,
                                            priceFormat
                                        )}
                                    </strong>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Render form if PayPal or Woocommerce */}
                    {!paymentSuccess && (
                        <div
                            className={
                                'wbk_landing_page__action-button-container'
                            }
                        >
                            {(() => {
                                if (
                                    paymentMethod === 'woocommerce' &&
                                    paymentUrl
                                ) {
                                    // Redirect to WooCommerce payment URL
                                    window.location.href = paymentUrl
                                    return null
                                } else {
                                    return (
                                        <Button
                                            type="primary"
                                            title={
                                                wording?.pay ||
                                                __('Pay', 'webba-booking-lite')
                                            }
                                            showLoading={buttonLoading}
                                            onClick={handlePay}
                                            disabled={buttonLoading}
                                        />
                                    )
                                }
                            })()}
                            {buttonError && (
                                <span
                                    className={
                                        'wbk_landing_page__action-button-error'
                                    }
                                >
                                    {buttonError}
                                </span>
                            )}
                        </div>
                    )}
                    {settings?.show_post_booking_instructions &&
                        bookingData?.booking_instruction && (
                            <FormNotice
                                className={'wbk_thank_you__information'}
                            >
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: bookingData?.booking_instruction,
                                    }}
                                />
                            </FormNotice>
                        )}
                </div>
            </CustomScroll>
        </div>
    )
}
