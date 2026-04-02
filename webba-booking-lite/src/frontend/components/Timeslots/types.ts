import { IPlace } from '../Services/types'

export interface ITimeslot {
    start_time: number
    end_time: number
    formatted_time: string
    formatted_time_local: string
    free_places: number
    total_places: number
    staff_member_ids: string[] | null
}

export interface ITimeslotsProps {
    timeslots: ITimeslot[]
    selectedSlots: number[]
    setSlot: (time: number) => void
    onPlaceStaffSelect: (time: number, staffId: string) => void
    max_quantity: number
    quantity: number
    serviceId?: number
    min_slots?: number
    max_slots?: number
    consecutive_timeslots: boolean
    places: IPlace[]
    selectedDate?: Date | null
    group_booking: boolean
    limited_timeslot: boolean
    showStaffSelector: boolean
}
