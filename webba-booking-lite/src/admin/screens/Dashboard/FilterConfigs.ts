import { IFilterField } from '../../components/Filter/types'
import { __ } from '@wordpress/i18n'
import { formatWbkDate } from '../../components/Filter/utils'

export const filterFields: IFilterField[] = [
    {
        name: 'appointment_day',
        type: 'date_range',
        value:
            formatWbkDate(
                new Date(new Date().setDate(new Date().getDate() - 30))
            ) +
            ' - ' +
            formatWbkDate(new Date()),
    },
    {
        name: 'appointment_range',
        type: 'select',
        options: {
            today: __('Today', 'webba-booking-lite'),
            l_7: __('Last 7 days', 'webba-booking-lite'),
            u_7: __('Upcoming 7 days', 'webba-booking-lite'),
            l_30: __('Last 30 days', 'webba-booking-lite'),
            u_30: __('Upcoming 30 days', 'webba-booking-lite'),
            custom: __('Custom', 'webba-booking-lite'),
        },
        value: 'l_30',
        triggerDateRange: true,
    },
]
