import { type Table } from '@tanstack/react-table'

export interface IBulkActionsProps {
    onDeleteSelected?: () => void
    collectionName?: string
}

export interface ITableMobileProps {
    table: Table<any>
}

export type TableDocumentationKey =
    | 'services'
    | 'dailyServices'
    | 'categories'
    | 'extras'
    | 'bookings'
    | 'staffMembers'
    | 'locations'
    | 'giftCards'
    | 'coupons'
    | 'pricingRules'
    | 'emailNotifications'
    | 'bookingForms'
    | 'connectedCalendars'

export interface IDocumentationLink {
    label: string
    href: string
}
