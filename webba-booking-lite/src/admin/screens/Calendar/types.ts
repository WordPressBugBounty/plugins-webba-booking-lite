export interface IConnectedCalendarAttendee {
    email: string
    displayName?: string
    responseStatus?: string
}

export interface IEvent {
    id: number | string
    title: string
    start: Date
    end: Date
    allDay?: boolean
    resource?: any
    status?: string
    color?: string
    isLockedSlot?: boolean
    lockedTime?: number
    isConnectedEvent?: boolean
    description?: string
    attendees?: IConnectedCalendarAttendee[]
    provider?: string
    calendarName?: string
}

export type TCalendarServiceFilterValue = string | string[]

export type TCalendarRememberedServiceSelection = {
    singleServiceId: string | null
    multiServiceIds: string[] | null
}

export type TBulkScheduleLockSuccessHandler = (
    affectedServiceIds: string[]
) => Promise<void> | void