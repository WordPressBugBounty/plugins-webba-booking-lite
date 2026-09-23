import { useEffect, useState } from 'react'
import {
    PaymentElement,
    ExpressCheckoutElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'

interface IGiftCardStripeProps {
    selectedMethod: string
    onLoadingChange?: (loading: boolean) => void
    onWalletConfirm?: () => Promise<boolean>
}

/**
 * Gift-card Stripe element. Sets stripeObj on the booking context so the
 * purchase button can confirmPayment. Wallets call onWalletConfirm instead
 * of placeBooking.
 */
export const GiftCardStripe = ({
    selectedMethod,
    onLoadingChange,
    onWalletConfirm,
}: IGiftCardStripeProps) => {
    const stripe = useStripe()
    const elements = useElements()
    const { setFormObj, preset } = useBookingContext()
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
    }, [stripe, elements, isValidated, setFormObj])

    useEffect(() => {
        const handleResize = () => {
            setDeviceWidth(window.innerWidth)
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        setPaymentElementReady(false)
        onLoadingChange?.(true)
    }, [selectedMethod, onLoadingChange])

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
                            googlePay: 'pay',
                        },
                    }}
                    onConfirm={async () => {
                        if (!stripe || !elements || !onWalletConfirm) {
                            return
                        }
                        await onWalletConfirm()
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
                id={`wbk-gift-card-stripe-${selectedMethod}`}
                options={{
                    layout: deviceWidth < 768 ? 'accordion' : 'tabs',
                    wallets: {
                        googlePay: 'never',
                        applePay: 'never',
                    },
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
