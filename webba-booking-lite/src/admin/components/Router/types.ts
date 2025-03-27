export const ROUTES = [
    'dashboard',
    'bookings',
    'cancelled-bookings',
    'calendar',
    'calendars',
    'services',
    'service-categories',
    'email-templates',
    'pricing-rules',
    'coupons',
    'settings'
] as const
export const PAGES = [
    'wbk-dashboard',
    'wbk-services',
    'wbk-service-categories',
    'wbk-email-templates',
    'wbk-appointments',
    'wbk-canecelled-appointments',
    'wbk-coupons',
    'wbk-gg-calendars',
    'wbk-calendar',
    'wbk-pricing-rules',
    'wbk-settings'
] as const

export type Routes = typeof ROUTES
export type Route = Routes[number]
export type Pages = typeof PAGES
export type Page = Pages[number]
