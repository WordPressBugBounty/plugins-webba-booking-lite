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
import { isSameDay, startOfMonth } from 'date-fns'

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
}: IBookingCalendarProps) => {
    const wording = useWording()
    const { locale } = useLocale()
    const { loading } = useBookingContext()

    const calendarType = getCalendarType(startOfWeek)
    const activeStartDate = startOfMonth(viewMonth)

    return (
        <div className={'wbk_booking_calendar'}>
            {loading &&
                loading?.serviceAvailability &&
                loading?.serviceAvailability[serviceId] && (
                    <div className="wbk_booking_calendar__loader">
                        <div className="wbk_booking_calendar__loader__spinner"></div>
                    </div>
                )}
            <div className={'wbk_booking_calendar__wrapper'}>
                <Calendar
                    activeStartDate={activeStartDate}
                    onChange={(value: Value) => setValue(value as Date)}
                    value={selectedDate}
                    tileDisabled={({ date, view }) =>
                        view === 'month'
                            ? availableDates.find((d) => isSameDay(d, date)) ===
                              undefined
                            : false
                    }
                    onActiveStartDateChange={({ activeStartDate }) =>
                        setMonth(activeStartDate as Date)
                    }
                    className={'wbk_booking_calendar__calendar-wrapper'}
                    locale={locale || 'en-US'}
                    calendarType={calendarType}
                />
            </div>
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
        </div>
    )
}
