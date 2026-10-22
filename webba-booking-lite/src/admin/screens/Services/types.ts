import type { ReactNode } from 'react'

export const SERVICE_SCREEN_TAB_IDS = [
    'hourly',
    'daily',
    'categories',
    'extras',
] as const

export type ServiceScreenTabId = (typeof SERVICE_SCREEN_TAB_IDS)[number]

export interface ServiceScreenTab {
    id: ServiceScreenTabId
    label: string
    icon: ReactNode
}
