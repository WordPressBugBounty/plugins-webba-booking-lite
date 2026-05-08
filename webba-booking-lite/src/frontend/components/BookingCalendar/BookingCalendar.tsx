import './BookingCalendar.scss'
import { __ } from '@wordpress/i18n'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { IBookingCalendarProps } from './types'
import { Value } from 'react-calendar/dist/esm/shared/types.js'
import { Indication } from './Indication'
import { useWording } from '../../hooks/useWording'
import { useLocale } from '../../hooks/useLocale'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'
import type { CalendarType } from 'react-calendar/dist/esm/shared/types.js'
import { addDays, isSameDay, startOfDay, startOfMonth } from 'date-fns'
import classNames from 'classnames'

const getCalendarType = (startOfWeek?: number): CalendarType | undefined => {
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

export const BookingCalendar = ({
    availableDates,
    selectedDate,
    setValue,
    setMonth,
    viewMonth,
    serviceId,
    startOfWeek,
    selectionMode = 'single',
    minRangeDays,
    maxRangeDays,
    restrictToAvailableDates = false,
    hideIndications = false,
    showLoader = true,
}: IBookingCalendarProps) => {
    const wording = useWording()
    const { locale } = useLocale()
    const { loading } = useBookingContext()

    const calendarType = getCalendarType(startOfWeek)
    const activeStartDate = startOfMonth(viewMonth)
    const todayStart = startOfDay(new Date())
    const hasAvailableDatesFilter =
        selectionMode === 'single'
            ? availableDates.length > 0
            : restrictToAvailableDates
    const normalizedMinRangeDays =
        typeof minRangeDays === 'number' && Number.isFinite(minRangeDays)
            ? Math.max(0, Math.floor(minRangeDays))
            : 0
    const normalizedMaxRangeDays =
        typeof maxRangeDays === 'number' && Number.isFinite(maxRangeDays)
            ? Math.max(0, Math.floor(maxRangeDays))
            : 0
    const effectiveMaxRangeDays =
        normalizedMaxRangeDays > 0 && normalizedMinRangeDays > 0
            ? Math.max(normalizedMaxRangeDays, normalizedMinRangeDays)
            : normalizedMaxRangeDays

    const rangeStartDate = Array.isArray(selectedDate)
        ? selectedDate[0]
            ? startOfDay(selectedDate[0] as Date)
            : null
        : selectedDate instanceof Date
          ? startOfDay(selectedDate)
          : null
    const rangeEndDate = Array.isArray(selectedDate) ? selectedDate[1] : null
    const hasRangeLimits = normalizedMinRangeDays > 0 || normalizedMaxRangeDays > 0
    const isSelectingRangeEnd =
        selectionMode === 'range' &&
        hasRangeLimits &&
        !!rangeStartDate &&
        !rangeEndDate

    return (
        <div
            className={classNames('wbk_booking_calendar', {
                'wbk_booking_calendar--range': selectionMode === 'range',
            })}
        >
            {showLoader &&
                loading &&
                ((selectionMode === 'single' &&
                    loading?.serviceAvailability &&
                    loading?.serviceAvailability[serviceId]) ||
                    (selectionMode === 'range' &&
                        loading?.unitAvailability &&
                        loading?.unitAvailability[serviceId])) && (
                    <div className="wbk_booking_calendar__loader">
                        <div className="wbk_booking_calendar__loader__spinner"></div>
                    </div>
                )}
            <div className={'wbk_booking_calendar__wrapper'}>
                <Calendar
                    activeStartDate={activeStartDate}
                    onChange={(value: Value) => setValue(value)}
                    value={selectedDate}
                    selectRange={selectionMode === 'range'}
                    allowPartialRange={selectionMode === 'range'}
                    tileDisabled={({ date, view }) =>
                        view !== 'month'
                            ? false
                            : selectionMode === 'single'
                              ? availableDates.find((d) => isSameDay(d, date)) ===
                                undefined
                              : (() => {
                                    const currentDate = startOfDay(date)
                                    if (currentDate < todayStart) {
                                        return true
                                    }
                                    if (
                                        hasAvailableDatesFilter &&
                                        availableDates.find((d) => isSameDay(d, currentDate)) ===
                                            undefined
                                    ) {
                                        return true
                                    }
                                    if (!isSelectingRangeEnd || !rangeStartDate) {
                                        return false
                                    }
                                    if (currentDate < rangeStartDate) {
                                        return true
                                    }

                                    if (normalizedMinRangeDays > 0) {
                                        const minEndDate = addDays(
                                            rangeStartDate,
                                            normalizedMinRangeDays - 1
                                        )
                                        if (currentDate < minEndDate) {
                                            return true
                                        }
                                    }

                                    if (effectiveMaxRangeDays > 0) {
                                        const maxEndDate = addDays(
                                            rangeStartDate,
                                            effectiveMaxRangeDays - 1
                                        )
                                        if (currentDate > maxEndDate) {
                                            return true
                                        }
                                    }

                                    return false
                                })()
                    }
                    onActiveStartDateChange={({ activeStartDate }) =>
                        setMonth(activeStartDate as Date)
                    }
                    className={'wbk_booking_calendar__calendar-wrapper'}
                    locale={locale || 'en-US'}
                    calendarType={calendarType}
                />
            </div>
            {!hideIndications && (
                <div className={'wbk_booking_calendar__indications'}>
                    <Indication
                        label={
                            wording.available ||
                            __('Available', 'webba-booking-lite')
                        }
                        className={'wbk_booking_calendar__indication--available'}
                    />
                    <Indication
                        label={wording.booked || __('Booked', 'webba-booking-lite')}
                        color="#FFFFFF"
                        borderColor="#D4DDE2"
                    />
                    <Indication
                        label={wording.today || __('Today', 'webba-booking-lite')}
                        className={'wbk_booking_calendar__indication--today'}
                    />
                </div>
            )}
        </div>
    )
}
