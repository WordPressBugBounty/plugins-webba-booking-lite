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

export interface IOption {
    value: Status
    label: string
    icon: string
}
