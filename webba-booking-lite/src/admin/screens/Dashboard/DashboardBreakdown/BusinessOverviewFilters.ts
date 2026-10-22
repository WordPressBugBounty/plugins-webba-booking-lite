import { __ } from '@wordpress/i18n'
import { IFilterField } from '../../../components/Filter/types'
import { formatWbkDate } from '../../../components/Filter/utils'

export const getDefaultBusinessDateRangeValue = () =>
    formatWbkDate(
        new Date(new Date().setDate(new Date().getDate() - 29))
    ) +
    ' - ' +
    formatWbkDate(new Date())

export const businessPeriodField: IFilterField = {
    name: 'business_period',
    label: __('Period', 'webba-booking-lite'),
    type: 'select',
    options: {
        l_7: __('Last 7 days', 'webba-booking-lite'),
        l_30: __('Last 30 days', 'webba-booking-lite'),
        l_90: __('Last 90 days', 'webba-booking-lite'),
        custom: __('Custom', 'webba-booking-lite'),
    },
    value: 'l_30',
    triggerDateRange: true,
}

export const businessDateRangeField: IFilterField = {
    name: 'business_day',
    label: __('Date range', 'webba-booking-lite'),
    type: 'date_range',
    value: getDefaultBusinessDateRangeValue(),
}

export const businessStaffField: IFilterField = {
    name: 'appointment_staff_member_id',
    label: __('Staff member', 'webba-booking-lite'),
    placeholder: __('All staff members', 'webba-booking-lite'),
    type: 'select',
    options: 'staff_members',
    null_value: [__('All staff members', 'webba-booking-lite')],
    value: 0,
}

export const businessLocationField: IFilterField = {
    name: 'appointment_location_id',
    label: __('Location', 'webba-booking-lite'),
    placeholder: __('All locations', 'webba-booking-lite'),
    type: 'select',
    options: 'locations',
    null_value: [__('All locations', 'webba-booking-lite')],
    value: 0,
}
