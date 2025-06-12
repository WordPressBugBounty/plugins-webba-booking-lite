import * as dateFns from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { format } from 'date-fns'

export const daysOfWeek: { [key: string]: string } = {
    '1': 'Monday',
    '2': 'Tuesday',
    '3': 'Wednesday',
    '4': 'Thursday',
    '5': 'Friday',
    '6': 'Saturday',
    '7': 'Sunday',
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

    const jsTimeFormat = format.replace(
        /[gGiaAFMmdjYlDynhHs]/g,
        (match) => formatMap[match] || match
    )

    return jsTimeFormat
}

export const wbkFormat = (
    timestamp: number,
    timeFormat: string,
    timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
) => {
    const dateTime = dateFns.fromUnixTime(timestamp)
    const zonedDate = toZonedTime(dateTime, timezone)
    const jsFormat = convertToJSFormat(timeFormat || 'dd/mm/yyyy HH:mm')

    return format(zonedDate, jsFormat)
}

export const formatWbkDate = (date: Date) => format(date, 'M/d/y')
