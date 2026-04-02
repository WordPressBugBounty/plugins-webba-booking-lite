export interface BookingDataItem {
    time: number
    duration: number
    service: string
}

export interface BookingDataForCalendar {
    booking_data?: Record<string, BookingDataItem>
    ical_url?: string
    booking_instruction?: string
}

export interface CalendarLinks {
    google: string
    outlook: string
    yahoo: string
}

export interface FirstEventFallback {
    time: number
    duration: number
    service: string
}
