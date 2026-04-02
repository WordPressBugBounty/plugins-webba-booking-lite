export interface IBookingCalendarProps {
    availableDates: Date[]
    selectedDate: Date | null
    setValue: (value: Date) => void
    setMonth: (month: Date) => void
    /** Keeps the month grid on this month even when `selectedDate` is in another month (e.g. May 1 on April view). */
    viewMonth: Date
    serviceId: number
    startOfWeek?: number
}

export interface IIndicationProps {
    label: string
    color?: string
    borderColor?: string
    className?: string
}
