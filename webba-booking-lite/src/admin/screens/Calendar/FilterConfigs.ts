import { IFilterField } from '../../components/Filter/types'
import { __ } from '@wordpress/i18n'

export const filterFields: IFilterField[] = [
    {
        name: 'appointment_service_id',
        type: 'select',
        options: 'services',
        label: __('Select services', 'webba-booking-lite'),
        misc: {
            multiple: true,
            preventOverlap: true,
        },
    },
]
