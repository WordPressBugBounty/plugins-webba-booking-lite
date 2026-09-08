const METHODS_WITHOUT_BOOKING_REDIRECT = [
    'stripe',
    'stripe_others',
    'google_pay',
    'apple_pay',
    'paypal',
    'woocommerce',
]

type BookingRedirectSettings = {
    booking_redirect_enabled?: unknown
    booking_redirect_page?: unknown
}

const isRedirectEnabled = (enabled: unknown) =>
    enabled === 'yes' || enabled === true || enabled === 1 || enabled === '1'

const getRedirectPage = (page: unknown) => {
    if (typeof page !== 'string') {
        return ''
    }
    const trimmed = page.trim()
    if (trimmed === '' || trimmed === 'false') {
        return ''
    }
    return trimmed
}

export const shouldRedirectAfterBooking = (
    settings: BookingRedirectSettings | undefined,
    paymentMethod?: string
) => {
    const redirectPage = getRedirectPage(settings?.booking_redirect_page)
    if (!isRedirectEnabled(settings?.booking_redirect_enabled) || !redirectPage) {
        return false
    }

    return !METHODS_WITHOUT_BOOKING_REDIRECT.includes(paymentMethod || '')
}

export const redirectAfterBooking = (
    settings: BookingRedirectSettings | undefined,
    paymentMethod?: string
) => {
    if (!shouldRedirectAfterBooking(settings, paymentMethod)) {
        return false
    }

    window.location.assign(getRedirectPage(settings?.booking_redirect_page))
    return true
}
