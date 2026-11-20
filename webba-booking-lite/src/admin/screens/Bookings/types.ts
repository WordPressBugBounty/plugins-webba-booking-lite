import type { ReactNode } from 'react'

export const BOOKING_SCREEN_TAB_IDS = [
    'bookings',
    'customer-packages',
] as const

export type BookingScreenTabId = (typeof BOOKING_SCREEN_TAB_IDS)[number]

export interface BookingScreenTab {
    id: BookingScreenTabId
    label: string
    icon: ReactNode
}
