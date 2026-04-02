import * as dateFns from 'date-fns'
import { toZonedTime, getTimezoneOffset } from 'date-fns-tz'
import { format } from 'date-fns'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

export const daysOfWeek: { [key: string]: string } = {
    '0': 'Sunday',
    '1': 'Monday',
    '2': 'Tuesday',
    '3': 'Wednesday',
    '4': 'Thursday',
    '5': 'Friday',
    '6': 'Saturday',
    '7': 'Sunday',
}

export const weekDaysSlugs: { [key: string]: number } = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
}

export const getReadableTime = (timeInSeconds: number, format: string) => {
    const utcDate = toZonedTime(new Date(timeInSeconds * 1000), 'UTC') // Treat input as UTC

    const jsTimeFormat = convertToJSFormat(format)

    return dateFns.format(utcDate, jsTimeFormat)
}

export const convertToJSFormat = (format: string) => {
    const formatMap: Record<string, string> = {
        g: 'h', // Hour, 12-hour format
        h: 'hh', // Hour, 12-hour format, zero-padded
        G: 'H', // Hour, 24-hour format
        H: 'HH', // Hour, 24-hour format, zero-padded
        i: 'mm', // Minutes
        a: 'aaa', // am/pm lowercase
        A: 'a', // AM/PM uppercase
        F: 'MMMM', // Full month name
        M: 'MMM', // Short month name
        j: 'd', // Day of the month
        Y: 'y', // Four digit year
        y: 'yy', // Two digit year
        m: 'MM', // Month number, with 0
        d: 'dd', // Day number
        l: 'EEEE', // Day name
        D: 'E', // Day name, short
        n: 'M', // Month number, without 0
        s: 'ss', // Seconds
    }

    // Process the format string character by character, handling escapes
    let result = ''
    let escaping = false
    for (let i = 0; i < format.length; i++) {
        const char = format[i]
        if (escaping) {
            result += `'${char}'`
            escaping = false
        } else if (char === '\\') {
            escaping = true
        } else if (formatMap[char]) {
            result += formatMap[char]
        } else {
            result += char
        }
    }
    return result
}

export const wbkFormat = (
    timestamp: number | Date,
    timeFormat: string = 'dd/mm/yyyy HH:mm',
    timezone: string = '',
    options?: any
) => {
    const dateTime = Number(
        typeof timestamp === 'number'
            ? dateFns.fromUnixTime(timestamp)
            : timestamp === undefined
              ? new Date()
              : timestamp
    )

    if (timezone.length === 0) {
        timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    }

    const zonedDate = toZonedTime(dateTime, timezone)
    const jsFormat = convertToJSFormat(timeFormat || 'dd/mm/yyyy HH:mm')

    return format(zonedDate, jsFormat, options)
}

export const formatWbkDate = (date: Date) => format(date, 'M/d/y')

export const getCalendarMonthRange = (date: Date) => [
    startOfWeek(startOfMonth(date), { weekStartsOn: 0 }),
    endOfWeek(endOfMonth(date), { weekStartsOn: 0 }),
]

export const wbkGetTimezoneOffset = (timezone: string) => {
    const rawOffset = getTimezoneOffset(timezone)
    const minutes = rawOffset / (1000 * 60)

    return minutes * -1
}

export const getNamedTimezoneFromOffset = (
    offsetSeconds: number,
    date: Date = new Date()
): string | undefined => {
    if (
        typeof Intl === 'undefined' ||
        typeof Intl.supportedValuesOf === 'undefined'
    ) {
        console.warn(
            'Intl.supportedValuesOf is not supported in this environment.'
        )
        return undefined
    }

    const allTimezones = Intl.supportedValuesOf('timeZone')

    for (const tz of allTimezones) {
        try {
            const currentTzOffset = wbkGetTimezoneOffset(tz)
            if (currentTzOffset === offsetSeconds) {
                return tz
            }
        } catch (e) {
            console.warn(`Error calculating offset for timezone ${tz}:`, e)
        }
    }
    return undefined
}
