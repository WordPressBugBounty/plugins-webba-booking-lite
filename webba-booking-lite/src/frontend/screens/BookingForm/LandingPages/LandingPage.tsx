import { __ } from '@wordpress/i18n'
import { useDispatch, useSelect } from '@wordpress/data'
import { store_name } from '../../../../store/frontend'
import { useEffect, useMemo, useState } from 'react'
import '../ThankYou/ThankYou.scss'
import './LandingPage.scss'
import iconCheck from '../../../../../public/images/icon-check.svg'
import iconCancel from '../../../../../public/images/icon-cancel-red.svg'
import { BookingBlock } from '../../../components/BookingBlock/BookingBlock'
import {
    BookingFormProvider,
    useBookingContext,
} from '../../../providers/BookingFormProvider/BookingFormProvider'
import { wbkFormatPrice } from '../../../providers/BookingFormProvider/utils'
import { Button } from '../../../components/Button/Button'
import classNames from 'classnames'
import { FormNotice } from '../../../components/FormNotice/FormNotice'
import { CustomScroll } from 'react-custom-scroll'
import { ILandingPageProps } from './types'
import { useWording } from '../../../hooks/useWording'
import { toZonedTime } from 'date-fns-tz'
import { fromUnixTime } from 'date-fns'
import { getNamedTimezoneFromOffset } from '../../../../admin/components/Form/utils/dateTime'
const LandingPageInner = ({ token, token_type, action }: ILandingPageProps) => {
    const dispatch = useDispatch(store_name)
    const wording = useWording()
    const bookingDetails = useSelect(
        (select: any) =>
            select(store_name).getBookingDetails(token, token_type),
        [token, token_type]
    )
    useEffect(() => {
        if (token && token_type) {
            dispatch.fetchBookingDetails(token, token_type)
        }
    }, [dispatch, token, token_type])

    const [showHeader, setShowHeader] = useState(false)
    const [buttonLoading, setButtonLoading] = useState(false)
    const [buttonError, setButtonError] = useState<string | null>(null)
    const { preset, timezone, userTimezone, priceFormat } = useBookingContext()
    const settings = preset?.settings
    const iCalRequiredPlans = ['pro', 'premium']
    const isIcalAvailable = useMemo(() => {
        if (!preset?.plan_map) return false

        return iCalRequiredPlans.some((plan) => preset.plan_map[plan] === true)
    }, [preset?.plan_map, iCalRequiredPlans])

    // Extract booking and payment details
    const bookingData = bookingDetails?.booking_data || {}
    const paymentDetails = bookingDetails?.payment_details || {}

    // Build booking items for BookingBlock
    const bookingItems = useMemo(() => {
        return Object.values(bookingData).map(
            (item: any): { time: number; serviceName: string } => {
                return {
                    time:
                        Number(
                            toZonedTime(
                                fromUnixTime(Number(item.time) * 1000),
                                token_type === 'customer_token'
                                    ? String(
                                          getNamedTimezoneFromOffset(
                                              Number(item.offset)
                                          )
                                      )
                                    : timezone
                            )
                        ) / 1000,
                    serviceName: item.service,
                }
            }
        )
    }, [bookingData, timezone])

    // Build cost breakdown
    const costItems = useMemo(() => {
        const names: string[] = paymentDetails.item_names || []
        const prices: (string | number)[] = paymentDetails.prices || []
        const quantities: (string | number)[] = paymentDetails.quantities || []
        return names.map((name: string, idx: number) => {
            const price = Number(prices[idx] || 0)
            const quantity = Number(quantities[idx] || 1)
            return {
                name,
                price: price * quantity,
            }
        })
    }, [paymentDetails])

    const tax =
        paymentDetails.tax_to_pay != null
            ? paymentDetails.tax_to_pay
            : paymentDetails.tax || 0
    const totalAmount = paymentDetails.total || 0

    // Button click handler
    const handleAction = async () => {
        setButtonLoading(true)
        setButtonError(null)
        try {
            const apiType =
                action === 'cancelation' ? 'customer_cancel' : action
            const response = await fetch(
                '/wp-json/webba-booking/v1/booking-action',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        token,
                        token_type,
                        type: apiType,
                    }),
                }
            )
            const data = await response.json()
            if (data?.status === 'success') {
                setShowHeader(true)
            } else {
                setButtonError(data?.message || 'Unknown error')
            }
        } catch (e: any) {
            setButtonError(e?.message || 'Unknown error')
        } finally {
            setButtonLoading(false)
        }
    }

    return (
        <div className={'wbk_thank_you__wrapper'}>
            <CustomScroll
                heightRelativeToParent="calc(750px - 64px)"
                className={'wbk_thank_you__custom-scroll'}
                allowOuterScroll={true}
            >
                <div className={'wbk_thank_you__inner-wrapper'}>
                    {bookingData && Object.keys(bookingData).length > 0 && (
                        <>
                            <div
                                className={classNames('wbk_thank_you__header', {
                                    'wbk_thank_you__header--visible':
                                        showHeader,
                                    'wbk_thank_you__header--hidden':
                                        !showHeader,
                                })}
                            >
                                {action === 'admin_approve' && (
                                    <img
                                        src={iconCheck}
                                        alt={
                                            wording?.booking_approved ||
                                            __(
                                                'Booking approved',
                                                'webba-booking-lite'
                                            )
                                        }
                                    />
                                )}
                                {(action === 'cancelation' ||
                                    action === 'admin_cancel') && (
                                    <div className={'wbk_cancel_icon_bg'}>
                                        <img
                                            src={iconCancel}
                                            alt={
                                                wording?.booking_cancelled ||
                                                __(
                                                    'Booking cancelled',
                                                    'webba-booking-lite'
                                                )
                                            }
                                        />
                                    </div>
                                )}
                                <div
                                    className={'wbk_thank_you__header__content'}
                                >
                                    {action === 'admin_approve' && (
                                        <>
                                            <h3>
                                                {wording?.appointment_approved ||
                                                    __(
                                                        'Appointment Approved',
                                                        'webba-booking-lite'
                                                    )}
                                            </h3>
                                            <p>
                                                {wording?.appointment_approved_message ||
                                                    __(
                                                        'You have approved this appointment. The customer has been notified.',
                                                        'webba-booking-lite'
                                                    )}
                                            </p>
                                        </>
                                    )}
                                    {action === 'admin_cancel' && (
                                        <>
                                            <h3>
                                                {wording?.appointment_cancelled ||
                                                    __(
                                                        'Appointment Cancelled',
                                                        'webba-booking-lite'
                                                    )}
                                            </h3>
                                            <p>
                                                {wording?.appointment_cancelled_admin_message ||
                                                    __(
                                                        'You have cancelled this appointment. The customer has been notified of the cancellation.',
                                                        'webba-booking-lite'
                                                    )}
                                            </p>
                                        </>
                                    )}
                                    {action === 'cancelation' && (
                                        <>
                                            <h3>
                                                {wording?.appointment_cancelled ||
                                                    __(
                                                        'Appointment Cancelled',
                                                        'webba-booking-lite'
                                                    )}
                                            </h3>
                                            <p>
                                                {wording?.appointment_cancelled_customer_message ||
                                                    __(
                                                        'You have cancelled your appointment. We hope to see you again soon.',
                                                        'webba-booking-lite'
                                                    )}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className={'wbk_thank_you__booking_items'}>
                                {bookingItems.map(
                                    ({ time, serviceName }, idx) =>
                                        costItems[idx]?.price > 0 && (
                                            <BookingBlock
                                                key={idx}
                                                time={time}
                                                serviceName={serviceName}
                                            />
                                        )
                                )}
                            </div>
                            {action === 'admin_approve' &&
                                showHeader &&
                                bookingDetails?.ical_url && (
                                    <div
                                        className={
                                            'wbk_thank_you_calendar--visible'
                                        }
                                    >
                                        {isIcalAvailable && (
                                            <Button
                                                title={
                                                    wording?.add_to_calendar ||
                                                    __(
                                                        '+ Add to Calendar',
                                                        'webba-booking-lite'
                                                    )
                                                }
                                                href={bookingDetails.ical_url}
                                                target="_blank"
                                            />
                                        )}
                                    </div>
                                )}
                            <div className={'wbk_thank_you__panel-wrapper'}>
                                <h4>
                                    {wording?.cost_breakdown ||
                                        __(
                                            'Cost Breakdown',
                                            'webba-booking-lite'
                                        )}
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
                                                    __(
                                                        'Tax',
                                                        'webba-booking-lite'
                                                    )}
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
                                            {wording?.total_amount_paid ||
                                                __(
                                                    'Total amount',
                                                    'webba-booking-lite'
                                                )}
                                        </h4>
                                        <strong>
                                            {wbkFormatPrice(
                                                totalAmount,
                                                priceFormat
                                            )}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                            {/* Action button after cost breakdown */}
                            {!showHeader && (
                                <div
                                    className={
                                        'wbk_landing_page__action-button-container'
                                    }
                                >
                                    {action === 'admin_approve' && (
                                        <Button
                                            type="primary"
                                            title={
                                                wording?.approve_appointment ||
                                                __(
                                                    'Approve Appointment',
                                                    'webba-booking-lite'
                                                )
                                            }
                                            showLoading={buttonLoading}
                                            onClick={handleAction}
                                            disabled={buttonLoading}
                                        />
                                    )}
                                    {(action === 'cancelation' ||
                                        action === 'admin_cancel') && (
                                        <Button
                                            type="error"
                                            title={
                                                wording?.cancel_appointment ||
                                                __(
                                                    'Cancel Appointment',
                                                    'webba-booking-lite'
                                                )
                                            }
                                            showLoading={buttonLoading}
                                            onClick={handleAction}
                                            disabled={buttonLoading}
                                        />
                                    )}
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
                            {action !== 'cancelation' &&
                                action !== 'admin_cancel' &&
                                settings?.show_post_booking_instructions &&
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
                        </>
                    )}
                    {Object.keys(bookingData).length === 0 && (
                        <div>
                            <h1>
                                {wording?.no_bookings_found ||
                                    __(
                                        'No bookings found for the provided token!',
                                        'webba-booking-lite'
                                    )}
                            </h1>
                        </div>
                    )}
                </div>
            </CustomScroll>
        </div>
    )
}

export const LandingPage = (props: ILandingPageProps) => (
    <BookingFormProvider attrService={undefined} attrCategory={undefined}>
        <LandingPageInner {...props} />
    </BookingFormProvider>
)
