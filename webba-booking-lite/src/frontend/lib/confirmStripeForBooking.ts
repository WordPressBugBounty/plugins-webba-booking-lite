/**
 * Confirm Stripe payment or delayed-charge card setup after create-booking.
 */
export async function confirmStripeForBooking({
    stripe,
    elements,
    paymentMethod,
    stripeMode,
    billingDetails,
    redirectUrl,
    submitStripePayment,
    submitStripeSetup,
}: {
    stripe: any
    elements: any
    paymentMethod: string
    stripeMode?: string
    billingDetails?: {
        name?: string
        address?: Record<string, string | undefined>
    }
    redirectUrl: string
    submitStripePayment: (
        paymentIntentId: string,
        method: string
    ) => Promise<any>
    submitStripeSetup: (setupIntentId: string, method: string) => Promise<any>
}): Promise<{ confirmed: boolean; errorMessage?: string }> {
    const confirmParams: Record<string, any> = {
        return_url: `${redirectUrl}?paymentMethod=${paymentMethod}&`,
    }
    if (billingDetails) {
        confirmParams.payment_method_data = {
            billing_details: billingDetails,
        }
    }

    if (stripeMode === 'setup') {
        const { error, setupIntent } = await stripe.confirmSetup({
            elements,
            confirmParams,
            redirect: 'if_required',
        })

        if (setupIntent?.status === 'succeeded') {
            const response = await submitStripeSetup(
                setupIntent.id,
                paymentMethod
            )
            if (response?.status === 'success') {
                return { confirmed: true }
            }
            return {
                confirmed: false,
                errorMessage: response?.message || 'Something went wrong',
            }
        }

        if (error) {
            return { confirmed: false, errorMessage: error.message }
        }
        return { confirmed: false, errorMessage: 'Something went wrong' }
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams,
        redirect: 'if_required',
    })

    if (paymentIntent?.status === 'succeeded') {
        const response = await submitStripePayment(
            paymentIntent.id,
            paymentMethod
        )
        if (response?.status === 'success') {
            return { confirmed: true }
        }
        return {
            confirmed: false,
            errorMessage: response?.message || 'Something went wrong',
        }
    }

    if (error) {
        return { confirmed: false, errorMessage: error.message }
    }
    return { confirmed: false, errorMessage: 'Something went wrong' }
}
