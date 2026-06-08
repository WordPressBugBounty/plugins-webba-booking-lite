import { __ } from '@wordpress/i18n'
import {
    formatCalendarDateString,
    parseCalendarDateString,
    toLocalCalendarDate,
} from '../../utils/dateTime'
import {
    DateTimeRangeItem,
    DateTimeRangeSlot,
    DateTimeRangesPayload,
} from './types'

export const createDefaultTimeSlot = (): DateTimeRangeSlot => ({
    start: 32400,
    end: 64800,
    status: 'active',
})

const parseDateValue = (raw: unknown): Date | null => {
    if (!raw || typeof raw !== 'string') {
        return null
    }
    const fromCalendar = parseCalendarDateString(raw)
    if (fromCalendar) {
        return fromCalendar
    }
    const parsed = toLocalCalendarDate(new Date(raw))
    return parsed
}

export const parseRangesFromValue = (value: unknown): DateTimeRangeItem[] => {
    if (!value) {
        return []
    }

    let parsed: unknown = value
    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed) {
            return []
        }
        try {
            parsed = JSON.parse(trimmed)
            if (typeof parsed === 'string') {
                parsed = JSON.parse(parsed)
            }
        } catch {
            return []
        }
    }

    const rows = Array.isArray((parsed as DateTimeRangesPayload)?.date_time_ranges)
        ? (parsed as DateTimeRangesPayload).date_time_ranges
        : Array.isArray(parsed)
          ? (parsed as DateTimeRangesPayload['date_time_ranges'])
          : []

    return rows.map((row) => ({
        startDate: parseDateValue(row?.start_date),
        endDate: parseDateValue(row?.end_date),
        timeSlots: Array.isArray(row?.time_slots)
            ? row.time_slots
                  .filter(
                      (slot) =>
                          slot &&
                          typeof slot === 'object' &&
                          typeof slot.start === 'number' &&
                          typeof slot.end === 'number'
                  )
                  .map((slot) => ({
                      start: slot.start,
                      end: slot.end,
                      status:
                          slot.status === 'inactive' ? 'inactive' : 'active',
                  }))
            : [],
    }))
}

export const serializeRanges = (ranges: DateTimeRangeItem[]): string => {
    const payload: DateTimeRangesPayload = {
        date_time_ranges: ranges
            .filter((item) => item.startDate && item.endDate)
            .map((item) => ({
                start_date: formatCalendarDateString(item.startDate as Date),
                end_date: formatCalendarDateString(item.endDate as Date),
                time_slots: item.timeSlots
                    .filter(
                        (slot) =>
                            slot.status === 'active' ||
                            (slot.start > 0 && slot.end > 0)
                    )
                    .map((slot) => ({
                        start: slot.start,
                        end: slot.end,
                        status: slot.status || 'active',
                    })),
            })),
    }

    return JSON.stringify(payload)
}

export const hasOverlappingTimeSlots = (slots: DateTimeRangeSlot[]): boolean => {
    const activeSlots = slots.filter((slot) => slot.status === 'active')

    for (let i = 0; i < activeSlots.length; i++) {
        for (let j = i + 1; j < activeSlots.length; j++) {
            const slot1 = activeSlots[i]
            const slot2 = activeSlots[j]
            if (
                (slot1.start < slot2.end && slot1.end > slot2.start) ||
                (slot2.start < slot1.end && slot2.end > slot1.start)
            ) {
                return true
            }
        }
    }

    return false
}

export const validateDateTimeRangesValue = (value: unknown): string | null => {
    if (!value) {
        return null
    }

    const ranges = parseRangesFromValue(value)
    if (ranges.length === 0) {
        return null
    }

    const completeRanges: { startDate: Date; endDate: Date }[] = []

    for (const item of ranges) {
        if (!item.startDate || !item.endDate) {
            continue
        }
        if (item.startDate.getTime() > item.endDate.getTime()) {
            return __(
                'Each date range must have a start date on or before the end date.',
                'webba-booking-lite'
            )
        }
        if (hasOverlappingTimeSlots(item.timeSlots)) {
            return __(
                'Time slots cannot overlap within the same date range.',
                'webba-booking-lite'
            )
        }
        completeRanges.push({
            startDate: item.startDate,
            endDate: item.endDate,
        })
    }

    if (completeRanges.length <= 1) {
        return null
    }

    const sorted = [...completeRanges].sort(
        (a, b) => a.startDate.getTime() - b.startDate.getTime()
    )

    for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1]
        const current = sorted[i]
        if (current.startDate.getTime() <= prev.endDate.getTime()) {
            return __(
                'Date ranges cannot overlap each other.',
                'webba-booking-lite'
            )
        }
    }

    return null
}
