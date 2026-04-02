// Old structure - flat array of time slots
export type BusinessDayStatus = 'active' | 'inactive'

export interface BusinessDaySlot {
    start: number
    end: number
    day_of_week: string
    status: BusinessDayStatus
}
