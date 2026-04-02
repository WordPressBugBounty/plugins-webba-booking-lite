import { ITimeslot } from '../Timeslots/types'

export interface IPlace {
    date: Date
    day: number
    timeslot: number
    staff_member_id?: string | null
}

export interface IFormPlace {
    date: Date
    time: number
    quantity: number
    staff_id?: string | null
}

export interface IServiceProps {
    id: number
    label: string
    duration: string
    locations?: string[]
    payable: boolean
    price: string
    description?: string
    image?: string
    quantity: number
    min_quantity?: number
    max_quantity?: number
    min_slots?: number
    max_slots?: number
    consecutive_timeslots: boolean
    onUpdate: (serviceProps: Partial<IServiceProps>) => void
    selected?: boolean
    timeslots?: ITimeslot[]
    places?: IPlace[]
    selectedDate: Date
    selectedMonth: Date
    expanded: boolean
    selectedAt?: number | null
    staffId?: string | null
    group_booking: boolean
    limited_timeslot: boolean
    first_available: string | null
    hide_price: boolean
}
