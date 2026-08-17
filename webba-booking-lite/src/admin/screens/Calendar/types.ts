export interface IEvent {
    id: number
    title: string
    start: Date
    end: Date
    allDay?: boolean
    resource?: any
}

export type TCalendarServiceFilterValue = string | string[]

export type TCalendarRememberedServiceSelection = {
    singleServiceId: string | null
    multiServiceIds: string[] | null
}