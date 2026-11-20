import { useMemo } from 'react'
import { useBookingContext } from '../../../../../providers/BookingFormProvider/BookingFormProvider'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { IStripeWrapperProps } from './types'

export const StripeWrapper = ({
    children,
    clientSecret,
}: IStripeWrapperProps) => {
    const { preset } = useBookingContext()
    const publishableKey = preset?.settings?.stripe_publishable_key || ''

    const stripePromise = useMemo(() => {
        if (!publishableKey) {
            return null
        }
        return loadStripe(publishableKey)
    }, [publishableKey])

    if (!clientSecret) {
        return children
    }

    if (!stripePromise) {
        return null
    }

    return (
        <Elements
            stripe={stripePromise}
            options={{
                clientSecret,
            }}
        >
            {children}
        </Elements>
    )
}
