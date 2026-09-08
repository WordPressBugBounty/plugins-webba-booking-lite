import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelect } from '@wordpress/data'
import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import { differenceInCalendarDays, format } from 'date-fns'
import { Value } from 'react-calendar/dist/esm/shared/types.js'
import { store_name } from '../../../../store/frontend'
import { BookingCalendar } from '../../../components/BookingCalendar/BookingCalendar'
import { IFormPlace, IUnitProps } from '../../../components/Services/types'
import { useBookingContext } from '../../../providers/BookingFormProvider/BookingFormProvider'
import { weekDaysSlugs } from '../../../../admin/components/Form/utils/dateTime'
import { IUnitDateOffer } from '../types'
import calendarIcon from '../../../../../public/images/icon-calendar.svg'
import '../steps/Steps.scss'

const parseYmdLocal = (ymd: string): Date => {
    const parts = ymd.split('-').map(Number)
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
        return new Date(ymd)
    }
    const [y, m, d] = parts
    return new Date(y, m - 1, d)
}

const isInUnitAvailabilityRanges = (
    date: Date,
    ranges: any[],
    recurringAnnually: boolean
): boolean => {
    const normalizedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    )
    const monthDay = (normalizedDate.getMonth() + 1) * 100 + normalizedDate.getDate()

    return ranges.some((range: any) => {
        const startRaw = range?.start_date
        const endRaw = range?.end_date
        if (typeof startRaw !== 'string' || typeof endRaw !== 'string') {
            return false
        }
        const start = parseYmdLocal(startRaw.slice(0, 10))
        const end = parseYmdLocal(endRaw.slice(0, 10))
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return false
        }

        if (!recurringAnnually) {
            const rangeStart = new Date(
                start.getFullYear(),
                start.getMonth(),
                start.getDate()
            )
            const rangeEnd = new Date(
                end.getFullYear(),
                end.getMonth(),
                end.getDate()
            )
            return normalizedDate >= rangeStart && normalizedDate <= rangeEnd
        }

        const startMonthDay = (start.getMonth() + 1) * 100 + start.getDate()
        const endMonthDay = (end.getMonth() + 1) * 100 + end.getDate()
        if (startMonthDay <= endMonthDay) {
            return monthDay >= startMonthDay && monthDay <= endMonthDay
        }
        return monthDay >= startMonthDay || monthDay <= endMonthDay
    })
}

interface WaterfallUnitAvailabilityCalendarProps {
    unit: IUnitProps
    locationId?: string
    weekStart?: number | string
}

export const WaterfallUnitAvailabilityCalendar = ({
    unit,
    locationId,
    weekStart,
}: WaterfallUnitAvailabilityCalendarProps) => {
    const {
        formData,
        preset,
        loading,
        setFormData,
        mergeFormData,
    } = useBookingContext()
    const wording = preset?.wording ?? {}
    const {
        fetchUnitAvailabilityDateRanges,
        fetchUnitAvailabilityForRange,
        fetchClosestIntervalsForRange,
        fetchBookingAmounts,
    } = useDispatch(store_name)

    const weekStartsOn =
        typeof weekStart === 'number'
            ? weekStart
            : (weekDaysSlugs[String(weekStart || 'monday').toLowerCase()] ?? 1)

    const unitRange = (formData as Record<string, any>)?.range || {
        start: '',
        end: '',
    }
    const dateFlexibility = Number(
        (formData as Record<string, any>)?.days_to_shift || 0
    )
    const [unitViewMonth, setUnitViewMonth] = useState<Date>(new Date())
    const [unitOffers, setUnitOffers] = useState<IUnitDateOffer[]>([])
    const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null)
    const [hasDateRangesResponse, setHasDateRangesResponse] = useState(false)
    const prevDateFlexRef = useRef<number | null>(null)

    const unitAvailabilityDateRanges = useSelect(
        (select: any) => select(store_name).getUnitAvailabilityDateRanges(unit.id),
        [unit.id]
    )

    const getUnitPeoplePayload = useMemo(() => {
        const attendees = unit.attendees
        const hasAttendees =
            attendees &&
            Number(attendees.adult || 0) +
                Number(attendees.child || 0) +
                Number(attendees.infant || 0) >
                0
        if (hasAttendees) {
            return attendees
        }
        return Math.max(1, Number(unit.quantity) || 1)
    }, [unit.attendees, unit.quantity])

    const isUnitRangeLoading = Boolean(loading?.unitAvailability?.[unit.id])
    const minUnitBookingDays = Math.max(
        0,
        Number(unit.min_booking_days || 0) || 0
    )
    const maxUnitBookingDays = Math.max(
        0,
        Number(unit.max_booking_days || 0) || 0
    )
    const hasSelectedUnitRange = !!unitRange?.start && !!unitRange?.end
    const showNoUnitOffersMessage =
        hasSelectedUnitRange && !isUnitRangeLoading && unitOffers.length === 0
    const unitHasAvailabilityRanges = useMemo(
        () =>
            Array.isArray(unitAvailabilityDateRanges?.date_ranges) &&
            unitAvailabilityDateRanges.date_ranges.length > 0,
        [unitAvailabilityDateRanges]
    )

    const unitRangeValue = useMemo<Value>(() => {
        if (!unitRange?.start) return null
        const startDate = parseYmdLocal(unitRange.start)
        if (!unitRange?.end) {
            return [startDate, null] as [Date, null]
        }
        return [startDate, parseYmdLocal(unitRange.end)] as [Date, Date]
    }, [unitRange?.start, unitRange?.end])

    const unitCalendarAvailableDates = useMemo(() => {
        const ranges = Array.isArray(unitAvailabilityDateRanges?.date_ranges)
            ? unitAvailabilityDateRanges.date_ranges
            : []
        if (ranges.length === 0) {
            return []
        }
        const recurringAnnually =
            unitAvailabilityDateRanges?.availability_recurring_annually === true ||
            Number(unitAvailabilityDateRanges?.availability_recurring_annually) ===
                1 ||
            String(
                unitAvailabilityDateRanges?.availability_recurring_annually
            ).toLowerCase() === 'yes'

        const monthStart = new Date(
            unitViewMonth.getFullYear(),
            unitViewMonth.getMonth(),
            1
        )
        const monthEnd = new Date(
            unitViewMonth.getFullYear(),
            unitViewMonth.getMonth() + 1,
            0
        )
        const dates: Date[] = []
        for (
            let cursor = new Date(monthStart);
            cursor <= monthEnd;
            cursor.setDate(cursor.getDate() + 1)
        ) {
            const day = new Date(
                cursor.getFullYear(),
                cursor.getMonth(),
                cursor.getDate()
            )
            if (isInUnitAvailabilityRanges(day, ranges, recurringAnnually)) {
                dates.push(day)
            }
        }
        return dates
    }, [unitAvailabilityDateRanges, unitViewMonth])

    useEffect(() => {
        let cancelled = false
        setHasDateRangesResponse(false)

        Promise.resolve(fetchUnitAvailabilityDateRanges(unit.id)).finally(() => {
            if (!cancelled) {
                setHasDateRangesResponse(true)
            }
        })

        return () => {
            cancelled = true
        }
    }, [unit.id, fetchUnitAvailabilityDateRanges])

    useEffect(() => {
        if (!unitRange?.start) return
        setUnitViewMonth(parseYmdLocal(unitRange.start))
    }, [unitRange?.start])

    useEffect(() => {
        setUnitOffers([])
        setSelectedOfferId(null)
        mergeFormData({ places: {}, range: { start: '', end: '' } })
    }, [unit.id, mergeFormData])

    const buildOffersFromClosestResponse = useCallback(
        (response: unknown): IUnitDateOffer[] => {
            const parsed = Array.isArray(response) ? response : []
            const toLocalDay = (raw: unknown) => {
                if (raw == null) return new Date()
                if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}/.test(raw)) {
                    return parseYmdLocal(raw.slice(0, 10))
                }
                return parseYmdLocal(
                    format(new Date(raw as string | number | Date), 'yyyy-MM-dd')
                )
            }
            return parsed
                .map((item: any, index: number) => {
                    const availability =
                        typeof item?.availability === 'string'
                            ? JSON.parse(item.availability)
                            : item?.availability
                    if (!availability || availability?.available === false) {
                        return null
                    }
                    const startD = toLocalDay(item.range?.start)
                    const endD = toLocalDay(item.range?.end)
                    const dayCount = differenceInCalendarDays(endD, startD) + 1
                    return {
                        id: `${item.shift_days}-${index}`,
                        start: startD,
                        end: endD,
                        days: dayCount,
                        total:
                            availability.total_formatted ||
                            availability.total ||
                            '',
                    } as IUnitDateOffer
                })
                .filter(Boolean) as IUnitDateOffer[]
        },
        []
    )

    const fetchOffersForUnitRange = useCallback(
        (nextRange: { start: string; end: string }) => {
            if (!nextRange.start || !nextRange.end) {
                return Promise.resolve()
            }
            const selectedLocationId =
                locationId != null && String(locationId) !== ''
                    ? locationId
                    : null
            setSelectedOfferId(null)
            mergeFormData({ places: {} })
            if (dateFlexibility > 0) {
                return fetchClosestIntervalsForRange(
                    unit.id,
                    nextRange,
                    getUnitPeoplePayload,
                    dateFlexibility,
                    selectedLocationId
                ).then((response: unknown) => {
                    setUnitOffers(buildOffersFromClosestResponse(response))
                })
            }
            return fetchUnitAvailabilityForRange(
                unit.id,
                nextRange,
                getUnitPeoplePayload,
                selectedLocationId
            ).then((response: any) => {
                if (!response || response.available === false) {
                    setUnitOffers([])
                    return
                }
                const startDate = parseYmdLocal(nextRange.start)
                const endDate = parseYmdLocal(nextRange.end)
                const dayCount =
                    differenceInCalendarDays(endDate, startDate) + 1
                setUnitOffers([
                    {
                        id: `${nextRange.start}-${nextRange.end}`,
                        start: startDate,
                        end: endDate,
                        days: dayCount,
                        total: response.total_formatted || response.total || '',
                    },
                ])
            })
        },
        [
            unit.id,
            dateFlexibility,
            getUnitPeoplePayload,
            fetchClosestIntervalsForRange,
            fetchUnitAvailabilityForRange,
            locationId,
            mergeFormData,
            buildOffersFromClosestResponse,
        ]
    )

    useEffect(() => {
        if (prevDateFlexRef.current === null) {
            prevDateFlexRef.current = dateFlexibility
            return
        }
        if (prevDateFlexRef.current === dateFlexibility) return
        prevDateFlexRef.current = dateFlexibility
        if (!unitRange?.start || !unitRange?.end) return
        fetchOffersForUnitRange({
            start: unitRange.start,
            end: unitRange.end,
        })
    }, [dateFlexibility, unitRange?.start, unitRange?.end, fetchOffersForUnitRange])

    const handleUnitOfferSelect = (offer: IUnitDateOffer) => {
        if (selectedOfferId === offer.id) {
            setSelectedOfferId(null)
            mergeFormData({ places: {} })
            return
        }
        const startStr = format(offer.start, 'yyyy-MM-dd')
        const endStr = format(offer.end, 'yyyy-MM-dd')
        const qty = Math.max(1, Number(unit.quantity) || 1)
        const attendees = unit.attendees || {
            adult: 0,
            child: 0,
            infant: 0,
        }
        const totalAttendees =
            Number(attendees.adult || 0) +
            Number(attendees.child || 0) +
            Number(attendees.infant || 0)
        const normalizedPeoplePayload =
            totalAttendees > 0
                ? {
                      adult: Number(attendees.adult || 0),
                      child: Number(attendees.child || 0),
                      infant: Number(attendees.infant || 0),
                  }
                : {
                      adult: qty,
                      child: 0,
                      infant: 0,
                  }
        const place: IFormPlace = {
            date: offer.start,
            time: 0,
            quantity: qty,
            unit_range_end: endStr,
        }
        setSelectedOfferId(offer.id)
        mergeFormData({
            range: { start: startStr, end: endStr },
            places: { [unit.id]: [place] },
        })
        fetchBookingAmounts({
            ...(formData as Record<string, any>),
            booking_mode: 'units',
            unit_id: unit.id,
            range: { start: startStr, end: endStr },
            places: { [unit.id]: [place] },
            number_of_people: normalizedPeoplePayload,
            unit_quantity: {
                ...(((formData as Record<string, any>).unit_quantity as
                    | Record<number, number>
                    | undefined) || {}),
                [unit.id]: qty,
            },
            unit_attendees: {
                ...(((formData as Record<string, any>).unit_attendees as
                    | Record<
                          number,
                          { adult: number; child: number; infant: number }
                      >
                    | undefined) || {}),
                [unit.id]: normalizedPeoplePayload,
            },
        } as any)
    }

    const handleUnitRangeSelect = (value: Value) => {
        if (!value) {
            mergeFormData({ range: { start: '', end: '' }, places: {} })
            setUnitOffers([])
            setSelectedOfferId(null)
            return
        }
        if (Array.isArray(value)) {
            const [startDate, endDate] = value
            const nextRange = {
                start: startDate ? format(startDate, 'yyyy-MM-dd') : '',
                end: endDate ? format(endDate, 'yyyy-MM-dd') : '',
            }
            if (!nextRange.end) {
                mergeFormData({ range: nextRange, places: {} })
                setUnitOffers([])
                setSelectedOfferId(null)
                return
            }
            mergeFormData({ range: nextRange, places: {} })
            setSelectedOfferId(null)
            setUnitOffers([])
            if (nextRange.start && nextRange.end) {
                fetchOffersForUnitRange(nextRange)
            }
            return
        }
        const start = format(value as Date, 'yyyy-MM-dd')
        mergeFormData({ range: { start, end: '' }, places: {} })
        setUnitOffers([])
        setSelectedOfferId(null)
    }

    const flexibilityOptions = [
        {
            label:
                wording.unit_exact_match ||
                __('Exact match', 'webba-booking-lite'),
            days: 0,
        },
        {
            label:
                wording.unit_plus_minus_1_day ||
                __('+/- 1 day', 'webba-booking-lite'),
            days: 1,
        },
        {
            label:
                wording.unit_plus_minus_2_day ||
                __('+/- 2 days', 'webba-booking-lite'),
            days: 2,
        },
        {
            label:
                wording.unit_plus_minus_3_day ||
                __('+/- 3 days', 'webba-booking-lite'),
            days: 3,
        },
    ]

    if (!hasDateRangesResponse) {
        return (
            <div className="wbk_waterfall_form__calendar wbk_waterfall_form__calendar--loading">
                <div className="wbk_booking_calendar">
                    <div className="wbk_booking_calendar__loader">
                        <div className="wbk_booking_calendar__loader__spinner" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="wbk_waterfall_form__calendar wbk_step">
            <div className="wbk_step__unit_range_calendar">
                <BookingCalendar
                    availableDates={unitCalendarAvailableDates}
                    selectedDate={unitRangeValue}
                    setValue={handleUnitRangeSelect}
                    setMonth={setUnitViewMonth}
                    viewMonth={unitViewMonth}
                    serviceId={unit.id}
                    startOfWeek={weekStartsOn}
                    selectionMode="range"
                    minRangeDays={minUnitBookingDays}
                    maxRangeDays={maxUnitBookingDays}
                    restrictToAvailableDates={unitHasAvailabilityRanges}
                    showLoader={false}
                />
            </div>
            <div className="wbk_step__unit_flexibility">
                <h4>
                    {wording.unit_date_flexibility ||
                        __('Date Flexibility', 'webba-booking-lite')}
                </h4>
                <div className="wbk_step__unit_flexibility_buttons">
                    {flexibilityOptions.map((option) => (
                        <div
                            key={option.days}
                            role="button"
                            tabIndex={0}
                            className={classNames(
                                'wbk_step__unit_flexibility_button',
                                {
                                    'wbk_step__unit_flexibility_button--active':
                                        dateFlexibility === option.days,
                                }
                            )}
                            onClick={() =>
                                setFormData('days_to_shift', option.days)
                            }
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault()
                                    setFormData('days_to_shift', option.days)
                                }
                            }}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
                {isUnitRangeLoading && (
                    <div className="wbk_step__unit_range_loader">
                        <div className="wbk_step__unit_range_loader_spinner" />
                    </div>
                )}
                {showNoUnitOffersMessage && (
                    <p className="wbk_step__unit_offers_empty">
                        {wording.unit_no_available_offers ||
                            __(
                                'No available offers found for the selected range.',
                                'webba-booking-lite'
                            )}
                    </p>
                )}
            </div>
            {!isUnitRangeLoading && unitOffers.length > 0 && (
                <div className="wbk_step__unit_offers">
                    <h3 className="wbk_step__unit_offers_title">
                        {wording.unit_available_date_ranges ||
                            __('Available Date Ranges', 'webba-booking-lite')}
                    </h3>
                    <div className="wbk_step__unit_offers_list">
                        {unitOffers.map((offer) => (
                            <div
                                key={offer.id}
                                role="button"
                                tabIndex={0}
                                className={classNames(
                                    'wbk_step__unit_offers_item',
                                    {
                                        'wbk_step__unit_offers_item--selected':
                                            selectedOfferId === offer.id,
                                    }
                                )}
                                onClick={() => handleUnitOfferSelect(offer)}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === 'Enter' ||
                                        event.key === ' '
                                    ) {
                                        event.preventDefault()
                                        handleUnitOfferSelect(offer)
                                    }
                                }}
                            >
                                <div className="wbk_step__unit_offers_item_left">
                                    <div className="wbk_step__unit_offers_item_icon">
                                        <img
                                            src={calendarIcon}
                                            alt={__(
                                                'Calendar',
                                                'webba-booking-lite'
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <p className="wbk_step__unit_offers_item_title">
                                            {format(offer.start, 'MMMM d')} -{' '}
                                            {format(offer.end, 'MMMM d, yyyy')}
                                        </p>
                                        <p className="wbk_step__unit_offers_item_days">
                                            {offer.days}{' '}
                                            {offer.days > 1
                                                ? wording.unit_days ||
                                                  __(
                                                      'days',
                                                      'webba-booking-lite'
                                                  )
                                                : __(
                                                      'day',
                                                      'webba-booking-lite'
                                                  )}
                                        </p>
                                    </div>
                                </div>
                                <div className="wbk_step__unit_offers_item_right">
                                    <p className="wbk_step__unit_offers_item_price">
                                        {String(offer.total)}
                                    </p>
                                    <p className="wbk_step__unit_offers_item_status">
                                        {wording.unit_available ||
                                            wording.available ||
                                            __(
                                                'Available',
                                                'webba-booking-lite'
                                            )}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
