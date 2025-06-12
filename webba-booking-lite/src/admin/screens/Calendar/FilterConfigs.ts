import { IFilterField } from '../../components/Filter/types'
import { __ } from '@wordpress/i18n'
import metadata from '../../../schemas/appointments.json'

export const filterFields: IFilterField[] = [
    {
        name: 'appointment_service_id',
        type: 'select',
        options: 'services',
        label: __('Filter by service', 'webba-booking-lite'),
        misc: {
            multiple: true,
        },
    },
    {
        name: 'appointment_status',
        type: 'select',
        label: __('Filter by status', 'webba-booking-lite'),
        options: metadata.properties.appointment_status?.misc?.options,
        misc: {
            multiple: true,
        },
    },
]
