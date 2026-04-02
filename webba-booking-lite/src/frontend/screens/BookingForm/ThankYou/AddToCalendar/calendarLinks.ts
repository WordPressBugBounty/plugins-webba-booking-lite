import { formatInTimeZone } from 'date-fns-tz'
import type {
    BookingDataForCalendar,
    CalendarLinks,
    FirstEventFallback,
} from './types'

function toGoogleDate(seconds: number): string {
    const iso = new Date(seconds * 1000).toISOString()
    return iso.replace(/-/g, '').replace(/:/g, '').replace(/\.\d{3}Z/, 'Z')
}

function buildGoogleUrl(
    title: string,
    startSeconds: number,
    endSeconds: number,
    description: string
): string {
    const base = 'https://calendar.google.com/calendar/render'
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        dates: `${toGoogleDate(startSeconds)}/${toGoogleDate(endSeconds)}`,
    })
    if (description) {
        params.set('details', description)
    }
    return `${base}?${params.toString()}`
}

function buildOutlookUrl(
    title: string,
    startSeconds: number,
    endSeconds: number,
    description: string,
    userTimezone: string
): string {
    const startDate = new Date(startSeconds * 1000)
    const endDate = new Date(endSeconds * 1000)
    const startdt = formatInTimeZone(
        startDate,
        userTimezone,
        "yyyy-MM-dd'T'HH:mm:ssXXX"
    )
    const enddt = formatInTimeZone(
        endDate,
        userTimezone,
        "yyyy-MM-dd'T'HH:mm:ssXXX"
    )
    const base = 'https://outlook.live.com/owa/'
    const params = new URLSearchParams({
        path: '/calendar/action/compose',
        rru: 'addevent',
        startdt,
        enddt,
        subject: title,
    })
    if (description) {
        params.set('body', description)
    }
    return `${base}?${params.toString()}`
}

function buildYahooUrl(
    title: string,
    startSeconds: number,
    endSeconds: number,
    description: string
): string {
    const st = toGoogleDate(startSeconds)
    const et = toGoogleDate(endSeconds)
    const params = new URLSearchParams({
        v: '60',
        TITLE: title,
        ST: st,
        ET: et,
    })
    if (description) {
        params.set('DESC', description)
    }
    return `https://calendar.yahoo.com/?${params.toString()}`
}

function getFirstEventFromBookingData(
    bookingData: BookingDataForCalendar | null | undefined
): FirstEventFallback | null {
    if (!bookingData?.booking_data || typeof bookingData.booking_data !== 'object') {
        return null
    }
    const items = Object.values(bookingData.booking_data)
    const first = items[0]
    if (!first) return null
    const startSeconds = Number(first.time)
    const durationMinutes = Number(first.duration)
    if (!Number.isFinite(startSeconds) || !Number.isFinite(durationMinutes)) {
        return null
    }
    return {
        time: startSeconds,
        duration: durationMinutes,
        service: String(first.service || 'Appointment'),
    }
}

export function buildCalendarUrls(
    bookingData: BookingDataForCalendar | null | undefined,
    userTimezone: string,
    fallbackFirstEvent?: FirstEventFallback | null
): CalendarLinks {
    const empty: CalendarLinks = { google: '', outlook: '', yahoo: '' }
    const first =
        getFirstEventFromBookingData(bookingData) ?? fallbackFirstEvent ?? null
    if (!first || first.duration < 0) return empty

    const title = first.service
    const description =
        bookingData?.booking_instruction != null
            ? String(bookingData.booking_instruction)
                  .replace(/<[^>]*>/g, ' ')
                  .trim()
            : ''
    const startSeconds = first.time
    const endSeconds = startSeconds + first.duration * 60

    return {
        google: buildGoogleUrl(title, startSeconds, endSeconds, description),
        outlook: buildOutlookUrl(
            title,
            startSeconds,
            endSeconds,
            description,
            userTimezone
        ),
        yahoo: buildYahooUrl(title, startSeconds, endSeconds, description),
    }
}
