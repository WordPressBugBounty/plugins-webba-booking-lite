interface IEvent {
    id: number
    title: string
    start: Date
    end: Date
    allDay?: boolean
    resource?: any
}
