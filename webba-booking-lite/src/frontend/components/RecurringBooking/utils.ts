import { addDays, addMonths, addWeeks, fromUnixTime, getUnixTime } from 'date-fns'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'
import { IPlace } from '../Services/types'
import {
    IRecurringBookingParams,
    IRecurringSlotApiItem,
    IRecurringSlotListItem,
    IRecurringTimeslotPayload,
    RecurringRepeatInterval,
    RecurringSlotStatus,
} from './types'

export const DEFAULT_RECURRING_INTERVALS: RecurringRepeatInterval[] = [
    'day',
    'week',
    'month',
]

export function mapRecurringSlotsFromApi(
    timeSlots: IRecurringSlotApiItem[]
): IRecurringSlotListItem[] {
    return timeSlots.map((slot, index) => ({
        ...slot,
        index,
    }))
}

export function getExpectedStartTime(
    baseTimeSlot: number,
    index: number,
    intervalStep: number,
    repeatInterval: RecurringRepeatInterval
): number {
    const baseDate = fromUnixTime(baseTimeSlot)
    const stepIndex = index * intervalStep
    let targetDate = baseDate

    if (repeatInterval === 'day') {
        targetDate = addDays(baseDate, stepIndex)
    } else if (repeatInterval === 'week') {
        targetDate = addWeeks(baseDate, stepIndex)
    } else {
        targetDate = addMonths(baseDate, stepIndex)
    }

    return Math.floor(targetDate.getTime() / 1000)
}

export function getActiveRecurringListItems(
    items: IRecurringSlotListItem[]
): IRecurringSlotListItem[] {
    return items.filter((item) => !item.removed)
}

export function isRecurringListConfirmable(items: IRecurringSlotListItem[]): boolean {
    const activeItems = getActiveRecurringListItems(items)
    if (activeItems.length === 0) return false
    return activeItems.every(
        (item) =>
            item.status === 'available' ||
            item.status === 'adjusted' ||
            item.userOverride === true
    )
}

export function removeRecurringListItem(
    items: IRecurringSlotListItem[],
    index: number
): IRecurringSlotListItem[] {
    return items.map((item) =>
        item.index === index ? { ...item, removed: true } : item
    )
}

export function recurringSlotToPlace(
    item: IRecurringSlotListItem,
    timezone: string,
    defaultStaffId?: string
): IPlace {
    const startTime = Number(item.timeslot.start_time)
    const zoned = toZonedTime(fromUnixTime(startTime), timezone)
    const dateOnly = new Date(
        zoned.getFullYear(),
        zoned.getMonth(),
        zoned.getDate()
    )
    const staffFromSlot =
        item.timeslot.staff_member_ids &&
        item.timeslot.staff_member_ids.length > 0
            ? String(item.timeslot.staff_member_ids[0])
            : undefined
    const staff_member_id = staffFromSlot || defaultStaffId

    return {
        date: dateOnly,
        day: getUnixTime(fromZonedTime(dateOnly, timezone)),
        timeslot: startTime,
        ...(staff_member_id ? { staff_member_id } : {}),
    }
}

export function recurringSlotsToPlaces(
    items: IRecurringSlotListItem[],
    timezone: string,
    defaultStaffId?: string
): IPlace[] {
    return items.map((item) =>
        recurringSlotToPlace(item, timezone, defaultStaffId)
    )
}

export function getPlaceKey(place: IPlace): string {
    return `${place.timeslot}-${place.day}`
}

export function dedupePlaces(places: IPlace[]): IPlace[] {
    const seen = new Set<string>()
    return places.filter((place) => {
        const key = getPlaceKey(place)
        if (seen.has(key)) {
            return false
        }
        seen.add(key)
        return true
    })
}

/**
 * Merge recurring places: drop existing slots that match incoming, then append incoming.
 */
export function mergeRecurringPlaces(
    existingPlaces: IPlace[],
    incomingPlaces: IPlace[]
): IPlace[] {
    const incoming = dedupePlaces(incomingPlaces)
    const incomingKeys = new Set(incoming.map(getPlaceKey))
    const filteredExisting = existingPlaces.filter(
        (place) => !incomingKeys.has(getPlaceKey(place))
    )
    return [...filteredExisting, ...incoming]
}

export function applySlotOverride(
    items: IRecurringSlotListItem[],
    index: number,
    timeslot: IRecurringTimeslotPayload
): IRecurringSlotListItem[] {
    return items.map((item) =>
        item.index === index
            ? {
                  ...item,
                  timeslot,
                  status: 'available' as RecurringSlotStatus,
                  userOverride: true,
              }
            : item
    )
}

export function normalizeAllowedIntervals(
    intervals?: RecurringRepeatInterval[]
): RecurringRepeatInterval[] {
    if (!intervals || intervals.length === 0) {
        return DEFAULT_RECURRING_INTERVALS
    }
    return intervals.filter((i) =>
        DEFAULT_RECURRING_INTERVALS.includes(i)
    ) as RecurringRepeatInterval[]
}

export function clampRecurringCount(
    count: number,
    minCount: number,
    maxCount: number
): number {
    return Math.min(maxCount, Math.max(minCount, count))
}
