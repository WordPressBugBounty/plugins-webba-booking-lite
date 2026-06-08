import { IPlace } from '../Services/types'
import { ITimeslot } from '../Timeslots/types'

export type RecurringRepeatInterval = 'day' | 'week' | 'month'

export type RecurringSlotStatus = 'available' | 'adjusted' | 'unavailable'

export interface IRecurringTimeslotPayload {
    start_time: number
    end_time: number
    free_places: number
    formatted_time?: string
    formatted_time_local?: string
    staff_member_ids?: (string | number)[]
}

export interface IRecurringSlotApiItem {
    timeslot: IRecurringTimeslotPayload
    status: RecurringSlotStatus
}

export interface IRecurringBookingApiResponse {
    service_id: number
    repeat_interval: RecurringRepeatInterval
    repeats: number
    time_slots: IRecurringSlotApiItem[]
    error?: string
}

export interface IRecurringSlotListItem extends IRecurringSlotApiItem {
    index: number
    userOverride?: boolean
    removed?: boolean
}

export interface IRecurringBookingParams {
    count: number
    intervalStep: number
    repeatInterval: RecurringRepeatInterval
}

export interface IPendingRecurringSlot {
    time: number
    date: Date
    defaultStaffId?: string
}

export interface IRecurringBookingServiceConfig {
    recurring_booking_enabled?: boolean
    recurring_intervals?: RecurringRepeatInterval[]
    recurring_min_count?: number
    recurring_max_count?: number
    recurring_payment_mode?: 'all' | 'first'
}

export interface IRecurringBookingPopupProps {
    isOpen: boolean
    serviceId: number
    serviceLabel: string
    pendingSlot: IPendingRecurringSlot | null
    serviceConfig: IRecurringBookingServiceConfig
    staffMemberId: string | null
    locationId: string | null
    offset: number
    timezone: string
    dateFormat: string
    timeFormat: string
    userTimezone: string
    locale: string
    existingPlacesCount: number
    minSlots?: number
    maxSlots?: number
    onConfirm: (places: IPlace[]) => void
    onClose: () => void
}

export interface IRecurringBookingControlsProps {
    intervalStep: number
    repeatInterval: RecurringRepeatInterval
    count: number
    allowedIntervals: RecurringRepeatInterval[]
    minCount: number
    maxCount: number
    disabled?: boolean
    onIntervalStepChange: (value: number) => void
    onRepeatIntervalChange: (value: RecurringRepeatInterval) => void
    onCountChange: (value: number) => void
}

export interface IRecurringBookingListProps {
    items: IRecurringSlotListItem[]
    baseTimeSlot: number
    intervalStep: number
    repeatInterval: RecurringRepeatInterval
    dateFormat: string
    timeFormat: string
    userTimezone: string
    locale: string
    isLoading: boolean
    error: string | null
    serviceId: number
    staffMemberId: string | null
    locationId: string | null
    offset: number
    onItemOverride: (index: number, timeslot: IRecurringTimeslotPayload) => void
    onItemRemove: (index: number) => void
}

export interface IRecurringBookingListItemProps {
    item: IRecurringSlotListItem
    rowNumber: number
    baseTimeSlot: number
    intervalStep: number
    repeatInterval: RecurringRepeatInterval
    dateFormat: string
    timeFormat: string
    userTimezone: string
    locale: string
    serviceId: number
    staffMemberId: string | null
    locationId: string | null
    offset: number
    onOverride: (timeslot: IRecurringTimeslotPayload) => void
    onRemove: () => void
}

export interface ICounterInputProps {
    value: number
    min: number
    max?: number
    label: string
    layout?: 'stacked' | 'inline'
    disabled?: boolean
    onChange: (value: number) => void
}

export type DayTimeslotOption = ITimeslot
