// Old structure - flat array of time slots
export type BusinessDayStatus = 'active' | 'inactive'

export interface BusinessDaySlot {
    start: number
    end: number
    day_of_week: string
    status: BusinessDayStatus
}

export interface TimeSlotProps {
    start: number
    end: number
    status: BusinessDayStatus
    onStartChange: (start: number) => void
    onEndChange: (end: number) => void
    onStatusChange: (status: BusinessDayStatus) => void
    onRemove: () => void
}
