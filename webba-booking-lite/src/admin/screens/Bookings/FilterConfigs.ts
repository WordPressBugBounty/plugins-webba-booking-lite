import { IFilterField } from '../../components/Filter/types'
import { __ } from '@wordpress/i18n'
import { formatWbkDate } from '../../components/Filter/utils'

export const filterFields: IFilterField[] = [
    {
        name: 'appointment_service_categories',
        type: 'select',
        options: 'service_categories',
        multiple: true,
        null_value: [__('All categories', 'webba-booking-lite')],
        value: 0,
    },
    {
        name: 'appointment_service_id',
        type: 'select',
        options: 'services',
        null_value: [__('All services', 'webba-booking-lite')],
        value: 0,
    },
    {
        name: 'appointment_day',
        type: 'date_range',
        value:
            formatWbkDate(new Date()) +
            ' - ' +
            formatWbkDate(
                new Date(new Date().setDate(new Date().getDate() + 30))
            ),
    },
    {
        name: 'appointment_status',
        type: 'select',
        options: {
            pending: __('Awaiting approval', 'webba-booking-lite'),
            approved: __('Approved', 'webba-booking-lite'),
            paid: __('Paid (awaiting approval)', 'webba-booking-lite'),
            paid_approved: __('Paid (approved)', 'webba-booking-lite'),
            arrived: __('Arrived', 'webba-booking-lite'),
            woocommerce: __('Managed by WooCommerce', 'webba-booking-lite'),
            added_by_admin_not_paid: __(
                'Added by the administrator (not paid)',
                'webba-booking-lite'
            ),
            added_by_admin_paid: __(
                'Added by the administrator (paid)',
                'webba-booking-lite'
            ),
        },
        null_value: [__('Any status', 'webba-booking-lite')],
        value: 0,
    },
]
