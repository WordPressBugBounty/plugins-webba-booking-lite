import { BusinessDayStatus } from '../BusinessHoursField/types'

export type DateTimeRangeSlot = {
    start: number
    end: number
    status: BusinessDayStatus
}

export type DateTimeRangeItem = {
    startDate: Date | null
    endDate: Date | null
    timeSlots: DateTimeRangeSlot[]
}

export type DateTimeRangeStoredRow = {
    start_date: string
    end_date: string
    time_slots: DateTimeRangeSlot[]
}

export type DateTimeRangesPayload = {
    date_time_ranges: DateTimeRangeStoredRow[]
}
