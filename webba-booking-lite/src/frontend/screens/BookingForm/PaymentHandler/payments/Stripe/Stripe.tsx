import { useEffect, useState } from 'react'
import {
    PaymentElement,
    ExpressCheckoutElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js'
import { IStripeProps } from './types'
import { useBookingContext } from '../../../../../providers/BookingFormProvider/BookingFormProvider'
import { useDispatch, useSelect } from '@wordpress/data'
import { store } from '../../../../../../store/frontend'

export const Stripe = ({ selectedMethod, onLoadingChange }: IStripeProps) => {
    const stripe = useStripe()
    const elements = useElements()
    const { setFormObj, preset, formData } = useBookingContext()
    const { placeBooking, submitStripePayment } = useDispatch(store)
    const bookingData = useSelect(
        // @ts-ignore
        (select) => select(store).getBookingData(),
        []
    )
    const [deviceWidth, setDeviceWidth] = useState(window.innerWidth)
    const [walletReady, setWalletReady] = useState(false)
    const [isValidated, setIsValidated] = useState(false)
    const [paymentElementReady, setPaymentElementReady] = useState(false)

    useEffect(() => {
        if (stripe && elements) {
            setFormObj('stripeObj', {
                stripe,
                elements,
                isValidated,
            })
        }
    }, [stripe, elements, isValidated])

    useEffect(() => {
        const handleResize = () => {
            setDeviceWidth(window.innerWidth)
        }
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    useEffect(() => {
        setPaymentElementReady(false)
        onLoadingChange?.(true)
    }, [selectedMethod, onLoadingChange])

    // For wallet-only payments, use ExpressCheckoutElement
    if (selectedMethod === 'google_pay' || selectedMethod === 'apple_pay') {
        const walletName =
            selectedMethod === 'google_pay' ? 'Google Pay' : 'Apple Pay'

        return (
            <div>
                <ExpressCheckoutElement
                    onReady={() => {
                        setWalletReady(true)
                        setIsValidated(false)
                        onLoadingChange?.(false)
                    }}
                    options={{
                        paymentMethods: {
                            googlePay:
                                selectedMethod === 'google_pay'
                                    ? 'auto'
                                    : 'never',
                            applePay:
                                selectedMethod === 'apple_pay'
                                    ? 'auto'
                                    : 'never',
                        },
                        buttonType: {
                            googlePay: 'book',
                        },
                    }}
                    onConfirm={async (event) => {
                        if (!stripe || !elements) return false

                        const response = await placeBooking(formData)

                        if (response?.payment_required !== true) {
                            return false
                        }

                        const redirectUrl =
                            preset?.settings?.stripe_redirect_url ||
                            window.location.href

                        const { error, paymentIntent } =
                            await stripe.confirmPayment({
                                elements,
                                confirmParams: {
                                    return_url: `${redirectUrl}?paymentMethod=${selectedMethod}&`,
                                },
                                redirect: 'if_required',
                            })

                        if (paymentIntent?.status === 'succeeded') {
                            const paymentResponse = await submitStripePayment(
                                paymentIntent.id,
                                selectedMethod
                            )

                            return response
                        }
                    }}
                />
                {!walletReady && (
                    <div
                        style={{
                            padding: '16px',
                            marginTop: '8px',
                            backgroundColor: '#f6f9fc',
                            borderRadius: '4px',
                            fontSize: '14px',
                            color: '#697386',
                        }}
                    >
                        <strong>Loading {walletName}</strong>
                        <br />
                        <small>
                            Make sure your device supports {walletName}
                        </small>
                    </div>
                )}
            </div>
        )
    }

    // Determine wallet settings for other payment methods
    const getWalletOptions = (): {
        googlePay: 'auto' | 'never'
        applePay: 'auto' | 'never'
    } => {
        // For stripe_others or regular card, hide both wallets
        return {
            googlePay: 'never',
            applePay: 'never',
        }
    }

    const getBillingDetailsFields = () => {
        const stripeFields = preset?.settings?.stripe_fields || []
        const billingDetails: {
            address?: Record<string, 'auto'>
            [key: string]: 'auto' | Record<string, 'auto'> | undefined
        } = {}
        const addressFields: string[] = [
            'line1',
            'line2',
            'city',
            'state',
            'country',
            'postal_code',
        ]

        billingDetails.address = {}
        stripeFields.forEach((field: string) => {
            if (addressFields.includes(field)) {
                billingDetails.address![
                    field === 'postal_code' ? 'postalCode' : field
                ] = 'auto'
            } else {
                billingDetails[field] = 'auto'
            }
        })

        return billingDetails
    }

    return (
        <div
            style={{
                opacity: paymentElementReady ? 1 : 0,
                transition: 'opacity 0.2s',
            }}
        >
            <PaymentElement
                id={`wbk-stripe-${selectedMethod}`}
                options={{
                    layout: deviceWidth < 768 ? 'accordion' : 'tabs',
                    wallets: getWalletOptions(),
                    fields: {
                        billingDetails: getBillingDetailsFields(),
                    },
                }}
                onChange={(event: any) => setIsValidated(event.complete)}
                onReady={() => {
                    setPaymentElementReady(true)
                    onLoadingChange?.(false)
                }}
            />
        </div>
    )
}
