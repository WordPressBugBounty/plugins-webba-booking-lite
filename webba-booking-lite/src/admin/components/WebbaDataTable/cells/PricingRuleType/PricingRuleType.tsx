import { CellContext } from '@tanstack/react-table'
import { __ } from '@wordpress/i18n'

const typeTitles: Record<string, string> = {
    date_range: __('Price for date range', 'webba-booking-lite'),
    early_booking: __('Price for early booking', 'webba-booking-lite'),
    custom_field: __('Price based on custom field value', 'webba-booking-lite'),
    day_of_week_and_time: __('Price for day of week and time range', 'webba-booking-lite'),
    number_of_seats: __('Price based on number of seats booked', 'webba-booking-lite'),
    number_of_timeslots: __('Price based on number of timeslots booked', 'webba-booking-lite'),
}

export const PricingRuleType = ({ getValue }: CellContext<any, any>) => {
    const ruleType = getValue() as string
    
    return <div>{typeTitles[ruleType]}</div>
}
