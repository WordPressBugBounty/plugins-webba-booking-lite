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
    /** Checkout date (yyyy-MM-dd) for unit stay bookings; ignored for time-slot services. */
    unit_range_end?: string
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
    extra_ids?: number[]
}

export interface IUnitAttendees {
    adult: number
    child: number
    infant: number
}

export interface IUnitProps {
    id: number
    value: number
    label: string
    description?: string
    has_description?: boolean
    image?: string | false
    locations?: string[]
    quantity?: number
    capacity?: number
    min_booking_days?: number | string
    max_booking_days?: number | string
    form_id?: string
    similar_units?: number[]
    price?: number | string
    attendee_type_adult?: string
    attendee_type_child?: string
    attendee_type_infant?: string
    selected?: boolean
    selectedAt?: number | null
    expanded?: boolean
    onUpdate: (unitProps: Partial<IUnitProps>) => void
    selectedDate?: Date
    selectedMonth?: Date
    attendees?: IUnitAttendees
    extra_ids?: number[]
}
