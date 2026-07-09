import { trackEvent } from '../../utils/analytics'

export type BookingFormSubmittedProperties = {
    success: boolean
    booking_mode?: 'services' | 'units'
    items_count?: number
    payment_method?: string
    payment_required?: boolean
    has_coupon?: boolean
    total_amount?: number
    error_message?: string
}

export const trackBookingFormSubmitted = (
    properties: BookingFormSubmittedProperties
) => {
    trackEvent('Booking Form Submitted', properties)
}
