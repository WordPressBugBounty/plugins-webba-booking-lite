import { ReactNode } from 'react'
import { IPlace, IUnitAttendees } from '../../../components/Services/types'
import { HidePriceValue } from '../../../lib/hidePrice/types'

export type Webba5StepId = 'service' | 'schedule' | 'details' | 'review'

export interface IWebba5FormProps {
    onBookingComplete?: (response?: unknown) => void
}

export interface IWebba5BookableItem {
    id: number
    label: string
    selected?: boolean
    locations?: string[]
    description?: string
    price?: string | number
    duration?: string
    hide_price?: HidePriceValue
    quantity?: number
    min_quantity?: number
    max_quantity?: number
    capacity?: number
    attendees?: IUnitAttendees
    attendee_type_adult?: string
    attendee_type_child?: string
    attendee_type_infant?: string
    places?: IPlace[]
    extra_ids?: number[]
    limited_timeslot?: boolean
    min_slots?: number
    max_slots?: number
    onUpdate: (props: Record<string, unknown>) => void
}

export interface IWebba5ServiceCardProps {
    label: string
    meta?: string
    priceLabel?: string
    description?: string
    selected: boolean
    onSelect: () => void
    children?: ReactNode
}

export interface IWebba5CounterProps {
    label: string
    value: number
    onDecrease: () => void
    onIncrease: () => void
}

export interface IWebba5ServiceChoiceProps {
    item: IWebba5BookableItem
    bookingMode: string
    priceLabel: string
    durationLabel: string
    onSelect: () => void
}

export interface IWebba5StepHeaderProps {
    currentStep: Webba5StepId
    serviceStepLocked: boolean
    canOpenSchedule: boolean
    canOpenDetails: boolean
    canOpenReview: boolean
    onStep: (step: Webba5StepId) => void
}

export interface IWebba5SelectOption {
    id: string
    label: string
}

export interface IWebba5SelectProps {
    label: string
    placeholder?: string
    options: IWebba5SelectOption[]
    value: string
    onChange: (id: string) => void
}

export interface IWebba5ActionButtonProps {
    label: string
    disabled?: boolean
    loading?: boolean
    tooltip?: string
    onClick: () => void
}

export interface IWebba5BackButtonProps {
    label: string
    onClick: () => void
}

export type Webba5SidebarItemState = 'complete' | 'current' | 'upcoming'

export interface IWebba5SidebarProps {
    currentStep: Webba5StepId
    serviceStepLocked: boolean
    onStep: (step: Webba5StepId) => void
}
