import { __ } from '@wordpress/i18n'
import { useBookingContext } from '../../../providers/BookingFormProvider/BookingFormProvider'
import { useMemo } from 'react'
import './ThankYou.scss'
import { ReactComponent as IconCheck } from '../../../../../public/images/icon-check.svg'
import { BookingBlock } from '../../../components/BookingBlock/BookingBlock'
import { wbkFormatPrice } from '../../../providers/BookingFormProvider/utils'
import classNames from 'classnames'
import { FormNotice } from '../../../components/FormNotice/FormNotice'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../../store/frontend'
import { CustomScroll } from 'react-custom-scroll'
import { useWording } from '../../../hooks/useWording'
import { fromUnixTime } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { IAmountItem } from '../types'
import { AddToCalendar } from './AddToCalendar/AddToCalendar'
import type { FirstEventFallback } from './AddToCalendar/types'
import { ReactComponent as PersonIcon } from '../../../../../public/images/icon-person.svg'
import { ReactComponent as MapPinIcon } from '../../../../../public/images/icon-map-pin.svg'

interface ThankYouProps {
    bookingDetails?: any
}

export const ThankYou = ({
    bookingDetails: propBookingDetails,
}: ThankYouProps = {}) => {
    const {
        services,
        priceFormat,
        amountData: contextAmountData,
        preset,
        userTimezone,
        formData,
    } = useBookingContext()
    const wording = useWording()
    const settings = preset?.settings
    const selectedServices = useMemo(
        () => services.filter(({ selected }) => selected),
        [services]
    )

    const iCalRequiredPlans = ['pro', 'premium']
    const isIcalAvailable = useMemo(() => {
        if (!preset?.plan_map) return false

        return iCalRequiredPlans.some((plan) => preset.plan_map[plan] === true)
    }, [preset?.plan_map, iCalRequiredPlans])

    const cartItems = useMemo(
        () =>
            selectedServices.flatMap(
                ({ places, label }) =>
                    places?.map(({ timeslot }) => {
                        return {
                            time:
                                Number(
                                    toZonedTime(
                                        fromUnixTime(Number(timeslot)),
                                        userTimezone
                                    )
                                ) / 1000,
                            serviceName: String(label),
                        }
                    }) || []
            ),
        [selectedServices]
    )
    // Get bookingData from store
    const bookingDataFromStore = useSelect(
        (select: any) => select(store_name).getBookingData(),
        []
    )

    const bookingData = useMemo(() => {
        if (
            bookingDataFromStore &&
            Object.keys(bookingDataFromStore).length > 0 &&
            Array.isArray(bookingDataFromStore.payment_details?.items) &&
            bookingDataFromStore.payment_details?.items.length > 0
        ) {
            return bookingDataFromStore
        }

        return propBookingDetails
    }, [propBookingDetails, bookingDataFromStore])

    const fallbackFirstEvent = useMemo((): FirstEventFallback | null => {
        const hasBookingDataFirst =
            bookingData?.booking_data &&
            typeof bookingData.booking_data === 'object' &&
            Object.keys(bookingData.booking_data).length > 0
        if (hasBookingDataFirst) return null
        const firstCart = cartItems[0]
        const firstService = selectedServices[0]
        if (
            !firstCart ||
            !firstService ||
            typeof firstCart.time !== 'number' ||
            !Number.isFinite(firstCart.time)
        ) {
            return null
        }
        const durationMinutes = Number(firstService.duration) || 60
        return {
            time: firstCart.time,
            duration: durationMinutes,
            service: String(firstCart.serviceName || 'Appointment'),
        }
    }, [bookingData?.booking_data, cartItems, selectedServices])

    const message = bookingData?.message
    const amountData = useMemo(() => {
        if (
            bookingData?.payment_details?.items &&
            Array.isArray(bookingData?.payment_details?.items) &&
            bookingData?.payment_details?.items.length > 0
        ) {
            return bookingData?.payment_details
        }

        if (contextAmountData && Array.isArray(contextAmountData?.items)) {
            return contextAmountData
        }

        return bookingData?.payment_details
    }, [contextAmountData, bookingData, bookingDataFromStore])

    const depositTotal = useMemo(() => {
        if (!amountData?.items || !Array.isArray(amountData.items)) return 0
        return amountData.items.reduce(
            (sum: number, item: IAmountItem) =>
                item.have_deposit && typeof item.item_to_pay === 'number'
                    ? sum + item.item_to_pay
                    : sum,
            0
        )
    }, [amountData?.items])

    const isTaxIncluded = Number(amountData?.tax_to_pay) > 0

    const getStaffNameById = (staffId: string | number | null | undefined) => {
        if (staffId === null || staffId === undefined) return null
        const list = Array.isArray(preset?.staff_members)
            ? preset.staff_members
            : []
        const staff = list.find(
            (item: any) => String(item.id) === String(staffId)
        )
        return staff?.label || null
    }

    const getLocationNameById = (
        locationId: string | number | null | undefined
    ) => {
        if (locationId === null || locationId === undefined) return null
        const list = Array.isArray(preset?.locations) ? preset.locations : []
        const location = list.find(
            (item: any) =>
                String(item.id) === String(locationId) ||
                String(item.value) === String(locationId)
        )
        return location?.label || null
    }

    // Booking items and cost breakdown
    let bookingItems = cartItems

    // --- Dual Calculation for Cost Breakdown ---
    // 1. Use amountData.items if available
    // 2. Fallback: service price * quantity * number of selected places
    let costItems = selectedServices.map((service) => {
        // Find all amountData items for this service
        const matchedAmountItems = amountData.items.filter(
            (item: IAmountItem) =>
                item.id === service.id && String(item.id) !== 'Service fee'
        )
        // Sum up the price from amountData for this service
        const amountDataPrice = matchedAmountItems.reduce(
            (sum: number, item: IAmountItem) => sum + Number(item.price || 0),
            0
        )
        // Fallback calculation: service price * quantity * number of selected places
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
            staffMemberName: getStaffNameById(service.staffId),
            locationName: getLocationNameById(
                (service as any).locationId ??
                    (service as any).location_id ??
                    formData?.location
            ),
        }
    })
    // Total amount: use amountData.total if available, else sum fallback
    let totalAmount =
        Number(amountData.to_pay_total) >= 0
            ? Number(amountData.to_pay_total)
            : costItems.reduce((sum, item) => sum + item.priceFallback, 0)

    if (
        bookingData &&
        bookingData.booking_data &&
        bookingData.payment_details
    ) {
        const bookingItems = Object.values(bookingData.booking_data).map(
            (item: any) => ({
                time: new Date(Number(item.time) * 1000),
                serviceName: String(item.service),
            })
        )
        const names: string[] = bookingData.payment_details.item_names || []
        const prices: (string | number)[] =
            bookingData.payment_details.prices || []
        const quantities = bookingData.payment_details.quantities || []
        const paymentItems = bookingData.payment_details.items || []
        costItems = names.map((name: string, idx: number) => {
            const price =
                Number(prices[idx] || 0) * Number(quantities[idx] || 1)
            const staffMemberId = paymentItems[idx]?.staff_member
            const locationId =
                paymentItems[idx]?.location_id ??
                paymentItems[idx]?.location ??
                formData?.location
            return {
                name,
                price,
                priceFromAmountData: price,
                priceFallback: price, // fallback is not meaningful here, but keep shape
                staffMemberName:
                    staffMemberId !== null && staffMemberId !== undefined
                        ? getStaffNameById(staffMemberId)
                        : null,
                locationName:
                    locationId !== null && locationId !== undefined
                        ? getLocationNameById(locationId)
                        : null,
            }
        })
        totalAmount = Number(bookingData.payment_details.to_pay_total)
    }

    return (
        <div className={'wbk_thank_you__wrapper'}>
            <CustomScroll
                heightRelativeToParent="calc(750px - 64px)"
                className={'wbk_thank_you__custom-scroll'}
                allowOuterScroll={true}
            >
                <div className={'wbk_thank_you__inner-wrapper'}>
                    <div className={'wbk_thank_you__header'}>
                        <IconCheck />
                        <div className={'wbk_thank_you__header__content'}>
                            <h1>
                                {wording?.appointment_confirmed ||
                                    __(
                                        'Thank you for your booking!',
                                        'webba-booking-lite'
                                    )}
                            </h1>
                            <p>
                                {wording?.look_forward_seeing_you ||
                                    __(
                                        'We look forward to seeing you.',
                                        'webba-booking-lite'
                                    )}
                            </p>
                        </div>
                    </div>
                    {message && (
                        <FormNotice className={'wbk_thank_you__information'}>
                            <h4>
                                {wording?.payment_information ||
                                    __(
                                        'Payment Information',
                                        'webba-booking-lite'
                                    )}
                            </h4>
                            <p>{message}</p>
                        </FormNotice>
                    )}
                    <div className={'wbk_thank_you__booking_items'}>
                        {bookingItems.map(
                            ({ time, serviceName }: any, idx: number) => (
                                // costItems[idx]?.price > 0 && (
                                <BookingBlock
                                    key={idx}
                                    time={Number(time)}
                                    serviceName={serviceName}
                                />
                            )
                            // )
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
                                    <p>
                                        {item.name}
                                        {item.staffMemberName && (
                                            <span className="wbk_thank_you__staff_name">
                                                <PersonIcon aria-hidden="true" />
                                                <small>
                                                    {item.staffMemberName}
                                                </small>
                                            </span>
                                        )}
                                        {item.locationName && (
                                            <span className="wbk_thank_you__staff_name">
                                                <MapPinIcon aria-hidden="true" />
                                                <small>
                                                    {item.locationName}
                                                </small>
                                            </span>
                                        )}
                                    </p>
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
                            {/* discount */}
                            {Number(amountData.discount) > 0 && (
                                <div
                                    className={classNames(
                                        'wbk_thank_you__cart-items__item',
                                        'wbk_thank_you__cart-items__item--tax'
                                    )}
                                >
                                    <h4>
                                        {wording.discount ||
                                            __(
                                                'Discount (-)',
                                                'webba-booking-lite'
                                            )}
                                    </h4>
                                    <strong>
                                        {wbkFormatPrice(
                                            amountData.discount,
                                            priceFormat
                                        )}
                                    </strong>
                                </div>
                            )}
                            {/* discount end */}
                            {/* service fees */}
                            {Number(amountData.service_fees) > 0 && (
                                <div
                                    className={classNames(
                                        'wbk_thank_you__cart-items__item',
                                        'wbk_thank_you__cart-items__item--tax'
                                    )}
                                >
                                    <h4>
                                        {wording.service_fees ||
                                            __(
                                                'Service fees',
                                                'webba-booking-lite'
                                            )}
                                    </h4>
                                    <strong>
                                        {wbkFormatPrice(
                                            amountData.service_fees,
                                            priceFormat
                                        )}
                                    </strong>
                                </div>
                            )}
                            {/* service fees end */}
                            {/* deposits */}
                            {depositTotal > 0 && (
                                <div
                                    className={classNames(
                                        'wbk_thank_you__cart-items__item',
                                        'wbk_thank_you__cart-items__item--tax'
                                    )}
                                >
                                    <h4>
                                        {wording?.deposits ||
                                            __('Deposits', 'webba-booking-lite')}
                                    </h4>
                                    <strong>
                                        {wbkFormatPrice(
                                            depositTotal,
                                            priceFormat
                                        )}
                                    </strong>
                                </div>
                            )}
                            {/* deposits end */}
                            {/* tax */}
                            {Number(amountData.tax_to_pay) > 0 && (
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
                            {/* tax end */}
                            {/* total */}
                            <div
                                className={classNames(
                                    'wbk_thank_you__cart-items__item',
                                    'wbk_thank_you__cart-items__item--total'
                                )}
                            >
                                <h4>
                                    {isTaxIncluded
                                        ? (wording?.total_amount_tax_incl ||
                                              __(
                                                  'Total Amount (tax incl.)',
                                                  'webba-booking-lite'
                                              ))
                                        : (wording?.total_amount_paid ||
                                              __(
                                                  'Paying now',
                                                  'webba-booking-lite'
                                              ))}
                                </h4>
                                <div className={'wbk_thank_you__cart-items__total-right'}>
                                    <strong>
                                        {wbkFormatPrice(totalAmount, priceFormat)}
                                    </strong>
                                    {/* {isTaxIncluded && (
                                        <p className={'wbk_thank_you__cart-items__tax-included'}>
                                            {wording?.tax_included ||
                                                __('Tax included', 'webba-booking-lite')}
                                        </p>
                                    )} */}
                                </div>
                            </div>
                            {/* total end */}
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
                                            amountData?.left_to_pay,
                                            priceFormat
                                        )}
                                    </strong>
                                </div>
                            )}
                        </div>
                    </div>
                    <AddToCalendar
                        bookingData={bookingData}
                        userTimezone={userTimezone}
                        sectionTitle={
                            wording?.add_to_calendar ||
                            undefined
                        }
                        isIcalAvailable={!!(bookingData?.ical_url && isIcalAvailable)}
                        fallbackFirstEvent={fallbackFirstEvent}
                    />
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
