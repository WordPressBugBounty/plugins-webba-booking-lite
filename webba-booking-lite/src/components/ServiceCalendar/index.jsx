import { useCallback, useMemo, useState } from 'react'
import Calendar from 'react-calendar'
import { useSelect } from '@wordpress/data'
import {
    endOfMonth,
    endOfWeek,
    isSameDay,
    startOfMonth,
    startOfWeek,
    subDays,
} from 'date-fns'
import { store_name } from '../../store/frontend'
import {
    wbkBackendDate,
    wbkExtractBackendDate,
} from '../../frontend/providers/BookingFormProvider/utils'
import { weekDaysSlugs } from '../../admin/components/Form/utils/dateTime'
import 'react-calendar/dist/Calendar.css'
import '../../frontend/components/BookingCalendar/BookingCalendar.scss'

const getCalendarType = (startOfWeek) => {
    if (startOfWeek === undefined) {
        return undefined
    }

    switch (startOfWeek) {
        case 0:
            return 'gregory'
        case 1:
            return 'iso8601'
        case 6:
            return 'islamic'
        default:
            return undefined
    }
}

const ServiceCalendar = ({ onChange, serviceId: serviceIdProp }) => {
    const formData = useSelect((select) => select(store_name).getFormData())
    const preset = useSelect((select) => select(store_name).getPreset())
    const loading = useSelect((select) => select(store_name).getLoading())

    const { settings } = preset || {}
    const serviceId = Number(serviceIdProp ?? formData?.services?.[0])
    const weekStartsOn =
        typeof settings?.week_start === 'number'
            ? settings.week_start
            : (weekDaysSlugs[
                  String(settings?.week_start || 'monday').toLowerCase()
              ] ?? 1)
    const calendarType = getCalendarType(weekStartsOn)

    const [selectedMonth, setSelectedMonth] = useState(() => {
        const initial = formData?.date ? new Date(formData.date) : new Date()
        return startOfMonth(initial)
    })

    const currentRange = useMemo(() => {
        const firstOfMonth = startOfMonth(selectedMonth)
        const lastOfMonth = endOfMonth(selectedMonth)
        return [
            startOfWeek(firstOfMonth, { weekStartsOn }),
            endOfWeek(lastOfMonth, { weekStartsOn }),
        ]
    }, [selectedMonth, weekStartsOn])

    const availabilityStart = useMemo(
        () => subDays(currentRange[0], 1),
        [currentRange]
    )

    const serviceHasStaff = useMemo(() => {
        const list = preset?.staff_members
        return (
            Array.isArray(list) &&
            list.some((member) =>
                member.services?.includes(String(serviceId))
            )
        )
    }, [preset?.staff_members, serviceId])

    const staffIdForApi = serviceHasStaff ? '0' : null

    const availableDates = useSelect(
        (select) =>
            serviceId
                ? select(store_name).getServiceAvailability(
                      serviceId,
                      wbkBackendDate(availabilityStart),
                      wbkBackendDate(currentRange[1]),
                      formData?.location ?? null,
                      staffIdForApi
                  )
                : [],
        [
            serviceId,
            availabilityStart,
            currentRange,
            formData?.location,
            staffIdForApi,
        ]
    )

    const formattedAvailableDates = useMemo(
        () =>
            (availableDates || []).map((date) => wbkExtractBackendDate(date)),
        [availableDates]
    )

    const hasAvailableDatesFilter = formattedAvailableDates.length > 0

    const isAvailabilityLoading =
        loading?.serviceAvailability?.[serviceId] === true

    const tileDisabled = useCallback(
        ({ date, view }) => {
            if (view !== 'month') {
                return false
            }

            if (!hasAvailableDatesFilter) {
                return false
            }

            return (
                formattedAvailableDates.find((availableDate) =>
                    isSameDay(availableDate, date)
                ) === undefined
            )
        },
        [formattedAvailableDates, hasAvailableDatesFilter]
    )

    const handleActiveStartDateChange = useCallback(({ activeStartDate }) => {
        if (activeStartDate) {
            setSelectedMonth(startOfMonth(activeStartDate))
        }
    }, [])

    if (!serviceId || !formData) {
        return null
    }

    return (
        <div className="wbk_booking_calendar">
            {isAvailabilityLoading && (
                <div className="wbk_booking_calendar__loader">
                    <div className="wbk_booking_calendar__loader__spinner" />
                </div>
            )}
            <Calendar
                calendarType={calendarType}
                activeStartDate={startOfMonth(selectedMonth)}
                onChange={onChange}
                value={formData.date}
                tileDisabled={tileDisabled}
                onActiveStartDateChange={handleActiveStartDateChange}
            />
        </div>
    )
}

export default ServiceCalendar
