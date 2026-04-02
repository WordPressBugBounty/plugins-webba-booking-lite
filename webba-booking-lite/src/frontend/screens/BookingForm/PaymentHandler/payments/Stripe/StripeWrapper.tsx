import { useEffect, useState } from 'react'
import { useBookingContext } from '../../../../../providers/BookingFormProvider/BookingFormProvider'
import { loadStripe, Stripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { IStripeWrapperProps } from './types'

export const StripeWrapper = ({
    children,
    clientSecret,
}: IStripeWrapperProps) => {
    const { preset } = useBookingContext()
    const [stripePromise, setStripePromise] = useState<Stripe | null>(null)

    useEffect(() => {
        if (preset?.settings?.stripe_publishable_key) {
            loadStripe(preset.settings.stripe_publishable_key).then(
                (stripe) => {
                    setStripePromise(stripe)
                }
            )
        }
    }, [preset?.settings?.stripe_publishable_key])

    if (clientSecret) {
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

    return children
}
