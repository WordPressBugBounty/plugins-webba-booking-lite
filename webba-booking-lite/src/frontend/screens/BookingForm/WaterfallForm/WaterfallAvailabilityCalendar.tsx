import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelect } from '@wordpress/data'
import {
    endOfMonth,
    endOfWeek,
    getUnixTime,
    isSameDay,
    startOfMonth,
    startOfWeek,
    subDays,
} from 'date-fns'
import { fromZonedTime } from 'date-fns-tz'
import { Value } from 'react-calendar/dist/esm/shared/types.js'
import { store_name } from '../../../../store/frontend'
import { BookingCalendar } from '../../../components/BookingCalendar/BookingCalendar'
import { Timeslots } from '../../../components/Timeslots/Timeslots'
import { IPlace, IServiceProps } from '../../../components/Services/types'
import { weekDaysSlugs, wbkGetTimezoneOffset } from '../../../../admin/components/Form/utils/dateTime'
import { useBookingContext } from '../../../providers/BookingFormProvider/BookingFormProvider'
import {
    wbkBackendDate,
    wbkExtractBackendDate,
} from '../../../providers/BookingFormProvider/utils'

interface WaterfallAvailabilityCalendarProps {
    service: IServiceProps
    locationId?: string
    staffId?: string | null
    weekStart?: number | string
}

export const WaterfallAvailabilityCalendar = ({
    service,
    locationId,
    staffId = null,
    weekStart,
}: WaterfallAvailabilityCalendarProps) => {
    const { userTimezone, timezone, preset, loading } = useBookingContext()
    const timeslotsRef = useRef<HTMLDivElement>(null)
    const { fetchServiceAvailability, fetchServiceTimeslots } =
        useDispatch(store_name)

    const weekStartsOn =
        typeof weekStart === 'number'
            ? weekStart
            : (weekDaysSlugs[String(weekStart || 'monday').toLowerCase()] ?? 1)

    const currentRange = useMemo(() => {
        const monthToSelect = service.selectedMonth || new Date()
        const firstOfMonth = startOfMonth(monthToSelect)
        const lastOfMonth = endOfMonth(monthToSelect)
        return [
            startOfWeek(firstOfMonth, { weekStartsOn }),
            endOfWeek(lastOfMonth, { weekStartsOn }),
        ]
    }, [service.selectedMonth, weekStartsOn])

    const availabilityStart = useMemo(
        () => subDays(currentRange[0], 1),
        [currentRange]
    )

    const parsedLocationId =
        locationId != null && locationId !== '' ? Number(locationId) : NaN
    const locationIdForApi = Number.isFinite(parsedLocationId)
        ? parsedLocationId
        : null
    const locationIdForTimeslots =
        locationId != null && locationId !== '' ? locationId : null
    const staffIdForApi =
        staffId != null && String(staffId) !== '' ? String(staffId) : null
    const showTimeslotStaffSelector = staffIdForApi === '0'

    const startDate = wbkBackendDate(availabilityStart)
    const endDate = wbkBackendDate(currentRange[1])

    const [hasAvailabilityResponse, setHasAvailabilityResponse] =
        useState(false)
    const [clickedDate, setClickedDate] = useState<Date | null>(null)

    useEffect(() => {
        setClickedDate(null)
        setHasAvailabilityResponse(false)
    }, [service.id, staffIdForApi])

    useEffect(() => {
        let cancelled = false
        setHasAvailabilityResponse(false)

        Promise.resolve(
            fetchServiceAvailability(
                service.id,
                startDate,
                endDate,
                locationIdForApi,
                staffIdForApi
            )
        ).finally(() => {
            if (!cancelled) {
                setHasAvailabilityResponse(true)
            }
        })

        return () => {
            cancelled = true
        }
    }, [
        fetchServiceAvailability,
        service.id,
        startDate,
        endDate,
        locationIdForApi,
        staffIdForApi,
    ])

    const availableDates = useSelect(
        (select: any) =>
            select(store_name).getServiceAvailability(
                service.id,
                startDate,
                endDate,
                locationIdForApi,
                staffIdForApi
            ),
        [service.id, startDate, endDate, locationIdForApi, staffIdForApi]
    )

    const formattedAvailableDates = useMemo(
        () =>
            (availableDates || []).map((date: string) =>
                wbkExtractBackendDate(date)
            ),
        [availableDates]
    )

    const selectedDate = useMemo(() => {
        if (!clickedDate || !formattedAvailableDates.length) {
            return null
        }

        return (
            formattedAvailableDates.find((date: Date) =>
                isSameDay(date, clickedDate)
            ) || null
        )
    }, [clickedDate, formattedAvailableDates])

    const backendDate = selectedDate ? wbkBackendDate(selectedDate) : ''

    const apiTimeSlots = useSelect(
        (select: any) =>
            backendDate
                ? select(store_name).getServiceTimeslots(service.id, backendDate)
                : [],
        [service.id, backendDate]
    )

    useEffect(() => {
        service.onUpdate({ timeslots: apiTimeSlots })
    }, [apiTimeSlots])

    useEffect(() => {
        if (!selectedDate) {
            return
        }

        fetchServiceTimeslots(
            wbkBackendDate(selectedDate),
            service.id,
            wbkGetTimezoneOffset(userTimezone),
            locationIdForTimeslots,
            staffIdForApi
        )
    }, [
        selectedDate,
        service.id,
        userTimezone,
        locationIdForTimeslots,
        staffIdForApi,
        fetchServiceTimeslots,
    ])

    const places = (service.places || []) as IPlace[]
    const timeslots = service.timeslots || []
    const currentFreeSlots = useMemo(
        () => timeslots.filter(({ free_places }) => free_places > 0),
        [timeslots]
    )
    const visibleTimeslots =
        timeslots &&
        !(
            preset?.settings?.show_booked_slots === false &&
            currentFreeSlots.length === 0
        )
            ? timeslots
            : []

    const handleSetDate = useCallback(
        (value: Value) => {
            if (!(value instanceof Date)) {
                return
            }
            setClickedDate(value)
            service.onUpdate({ selectedDate: value, places: [] })
        },
        [service]
    )

    const handleSetMonth = useCallback(
        (value: Date) => {
            service.onUpdate({ selectedMonth: value })
        },
        [service]
    )

    const addPlacesFromSelection = useCallback(
        (time: number, singleSlotMode: boolean) => {
            if (!selectedDate) {
                return
            }

            const selectedSlot = timeslots.find(
                (slot) => Number(slot.start_time) === time
            )
            const defaultStaffId =
                staffIdForApi && staffIdForApi !== '0'
                    ? staffIdForApi
                    : selectedSlot?.staff_member_ids &&
                        selectedSlot.staff_member_ids.length > 0
                      ? String(selectedSlot.staff_member_ids[0])
                      : undefined
            const nextPlace: IPlace = {
                date: selectedDate,
                day: getUnixTime(fromZonedTime(selectedDate, timezone)),
                timeslot: time,
                ...(defaultStaffId ? { staff_member_id: defaultStaffId } : {}),
            }

            service.onUpdate({
                places: singleSlotMode ? [nextPlace] : [...places, nextPlace],
            })
        },
        [places, selectedDate, service, staffIdForApi, timeslots, timezone]
    )

    const handleSetTime = useCallback(
        (time: number) => {
            if (!selectedDate) {
                return
            }

            const minSlotsLimit =
                service.min_slots && service.min_slots > 0
                    ? service.min_slots
                    : 1
            const maxSlotsLimit =
                service.max_slots && service.max_slots > 0
                    ? service.max_slots
                    : Infinity
            const singleSlotMode = minSlotsLimit === 1 && maxSlotsLimit === 1
            const exists = places.find(
                ({ timeslot, date }) =>
                    date.getDate() === selectedDate.getDate() &&
                    date.getMonth() === selectedDate.getMonth() &&
                    date.getFullYear() === selectedDate.getFullYear() &&
                    timeslot === time
            )

            if (exists) {
                service.onUpdate({
                    places: places.filter(({ timeslot }) => timeslot !== time),
                })
                return
            }

            addPlacesFromSelection(time, singleSlotMode)
        },
        [
            addPlacesFromSelection,
            places,
            selectedDate,
            service,
        ]
    )

    const handleSetPlaceStaff = useCallback(
        (time: number, staffId: string) => {
            if (!selectedDate) {
                return
            }
            service.onUpdate({
                places: places.map((place) =>
                    place.timeslot === time &&
                    place.date.getDate() === selectedDate.getDate() &&
                    place.date.getMonth() === selectedDate.getMonth() &&
                    place.date.getFullYear() === selectedDate.getFullYear()
                        ? { ...place, staff_member_id: staffId }
                        : place
                ),
            })
        },
        [places, selectedDate, service]
    )

    const isTimeslotsLoading = Boolean(loading?.serviceTimeslots?.[service.id])

    useEffect(() => {
        if (!selectedDate || isTimeslotsLoading || visibleTimeslots.length === 0) {
            return
        }

        const timeoutId = window.setTimeout(() => {
            timeslotsRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest',
            })
        }, 50)

        return () => window.clearTimeout(timeoutId)
    }, [selectedDate, isTimeslotsLoading, visibleTimeslots.length])

    if (!hasAvailabilityResponse) {
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
        <div className="wbk_waterfall_form__calendar">
            <BookingCalendar
                startOfWeek={weekStartsOn}
                viewMonth={service.selectedMonth || new Date()}
                availableDates={formattedAvailableDates}
                selectedDate={selectedDate}
                setValue={handleSetDate}
                setMonth={handleSetMonth}
                serviceId={service.id}
                showLoader={false}
            />
            {selectedDate && (
                <div
                    className="wbk_waterfall_form__timeslots"
                    ref={timeslotsRef}
                >
                    <Timeslots
                        timeslots={visibleTimeslots}
                        selectedSlots={
                            places
                                .filter(({ date }) => isSameDay(date, selectedDate))
                                .map(({ timeslot }) => timeslot)
                        }
                        setSlot={handleSetTime}
                        onPlaceStaffSelect={handleSetPlaceStaff}
                        max_quantity={Number(service.max_quantity)}
                        quantity={service.quantity}
                        serviceId={service.id}
                        min_slots={service.min_slots}
                        max_slots={service.max_slots}
                        consecutive_timeslots={service.consecutive_timeslots}
                        places={places}
                        selectedDate={selectedDate}
                        group_booking={service.group_booking}
                        limited_timeslot={service.limited_timeslot}
                        showStaffSelector={showTimeslotStaffSelector}
                    />
                </div>
            )}
        </div>
    )
}
