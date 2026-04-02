export const ROUTES = [
    'dashboard',
    'bookings',
    'calendar',
    'cancelled-bookings',
    'connected-calendars',
    'services',
    'service-categories',
    'email-templates',
    'pricing-rules',
    'coupons',
    'settings',
    'form-builder',
    'appearance',
    'locations',
    'staff-members',
    'options'
] as const
export const PAGES = [
    'wbk-dashboard',
    'wbk-calendar',
    'wbk-services',
    'wbk-service-categories',
    'wbk-email-templates',
    'wbk-appointments',
    'wbk-canecelled-appointments',
    'wbk-coupons',
    'wbk-connected-calendars',
    'wbk-pricing-rules',
    'wbk-settings',
    'wbk-form-builder',
    'wbk-appearance',
    'wbk-locations',
    'wbk-staff-members',
    'wbk-options'
] as const

export type Routes = typeof ROUTES
export type Route = Routes[number]
export type Pages = typeof PAGES
export type Page = Pages[number]
