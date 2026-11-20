export type Status =
    | 'pending'
    | 'cancelled'
    | 'paid'
    | 'approved'
    | 'paid_approved'
    | 'arrived'
    | 'woocommerce'
    | 'added_by_admin_not_paid'
    | 'added_by_admin_paid'
    | 'noshow'
    | 'draft'
    | 'published'
    | 'archived'
    | string

export interface IOption {
    value: Status
    label: string
    icon: string
}

export interface StatusCellProps {
    collectionName?: string
    options?: Record<string, string>
}
