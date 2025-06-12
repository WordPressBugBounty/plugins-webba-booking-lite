import pendingIcon from '../../../../../../public/images/status-pending-icon.png'
import approvedIcon from '../../../../../../public/images/status-approved-icon.png'
import rejectedIcon from '../../../../../../public/images/status-rejected-icon.png'
import cancelledIcon from '../../../../../../public/images/status-canceled-icon.png'
import { __ } from '@wordpress/i18n'
import { IOption, Status } from './types'

export const getStatusIcon = (status: string) => {
    switch (status) {
        case 'pending':
            return pendingIcon
        case 'approved':
        case 'arrived':
            return approvedIcon
        case 'rejected':
        case 'noshow':
            return rejectedIcon
        case 'cancelled':
            return cancelledIcon
        default:
            return pendingIcon
    }
}

export const formatStatusOptions = (
    options: Record<string, string>
): IOption[] => {
    return Object.keys(options).map((key) => ({
        value: key as Status,
        label: __(options[key], 'webba-booking-lite'),
        icon: getStatusIcon(key),
    }))
}
