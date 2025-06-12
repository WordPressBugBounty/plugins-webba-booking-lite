import { IFilterField } from '../../components/Filter/types'
import { __ } from '@wordpress/i18n'
import { formatWbkDate } from '../../components/Filter/utils'
import metadata from '../../../schemas/appointments.json'

export const filterFields: IFilterField[] = [
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
        placeholder: __('Filter by Status...', 'webba-booking-lite'),
        null_value: [__('All status', 'webba-booking-lite')],
        options: metadata.properties.appointment_status?.misc?.options,
    },
    {
        name: 'appointment_service_id',
        placeholder: __('Filter by Service...', 'webba-booking-lite'),
        type: 'select',
        options: 'services',
        null_value: [__('All services', 'webba-booking-lite')],
        value: 0,
    },
    {
        name: 'appointment_service_categories',
        placeholder: __('Filter by Category...', 'webba-booking-lite'),
        type: 'select',
        options: 'service_categories',
        multiple: true,
        null_value: [__('All categories', 'webba-booking-lite')],
        value: 0,
    },
]
