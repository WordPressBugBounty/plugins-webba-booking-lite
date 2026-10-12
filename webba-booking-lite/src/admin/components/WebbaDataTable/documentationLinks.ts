import { __, sprintf } from '@wordpress/i18n'
import type { IDocumentationLink, TableDocumentationKey } from './types'

const documentationBaseUrl = 'https://webba-booking.com/documentation'

const getDocumentationPages = (): Record<
    TableDocumentationKey,
    { label: string; path: string }
> => ({
    services: {
        label: __('Services', 'webba-booking-lite'),
        path: 'what-are-services',
    },
    dailyServices: {
        label: __('Daily services', 'webba-booking-lite'),
        path: 'how-to-add-daily-service-or-rentals',
    },
    categories: {
        label: __('Categories', 'webba-booking-lite'),
        path: 'what-are-service-categories',
    },
    extras: {
        label: __('Extras', 'webba-booking-lite'),
        path: 'setting-up-extras-and-add-ons',
    },
    bookings: {
        label: __('Bookings', 'webba-booking-lite'),
        path: 'schedule-calendar-and-schedule-tools',
    },
    staffMembers: {
        label: __('Staff members', 'webba-booking-lite'),
        path: 'how-to-add-a-staff-member',
    },
    locations: {
        label: __('Locations', 'webba-booking-lite'),
        path: 'how-to-add-a-location',
    },
    giftCards: {
        label: __('Gift cards', 'webba-booking-lite'),
        path: '',
    },
    coupons: {
        label: __('Coupons', 'webba-booking-lite'),
        path: 'how-to-add-a-coupon',
    },
    pricingRules: {
        label: __('Pricing rules', 'webba-booking-lite'),
        path: 'price-for-date-range',
    },
    emailNotifications: {
        label: __('Email notifications', 'webba-booking-lite'),
        path: 'email-notifications',
    },
    bookingForms: {
        label: __('Booking forms', 'webba-booking-lite'),
        path: 'how-to-create-a-form',
    },
    connectedCalendars: {
        label: __('Connected calendars', 'webba-booking-lite'),
        path: 'google-calendar-integration',
    },
})

export const getTableDocumentationLink = (
    screen: TableDocumentationKey
): IDocumentationLink => {
    const page = getDocumentationPages()[screen]
    const href = page.path
        ? `${documentationBaseUrl}/${page.path}/`
        : `${documentationBaseUrl}/`

    return {
        label: sprintf(
            __('%s documentation', 'webba-booking-lite'),
            page.label
        ),
        href,
    }
}
