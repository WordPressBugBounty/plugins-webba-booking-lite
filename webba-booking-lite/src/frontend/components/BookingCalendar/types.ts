import { Value } from 'react-calendar/dist/esm/shared/types.js'

export interface IBookingCalendarProps {
    availableDates: Date[]
    selectedDate: Value
    setValue: (value: Value) => void
    setMonth: (month: Date) => void
    /** Keeps the month grid on this month even when `selectedDate` is in another month (e.g. May 1 on April view). */
    viewMonth: Date
    serviceId: number
    startOfWeek?: number
    selectionMode?: 'single' | 'range'
    minRangeDays?: number
    maxRangeDays?: number
    restrictToAvailableDates?: boolean
    hideIndications?: boolean
    showLoader?: boolean
}

export interface IIndicationProps {
    label: string
    color?: string
    borderColor?: string
    className?: string
}
