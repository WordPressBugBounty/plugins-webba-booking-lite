import classNames from 'classnames'
import './PaymentSelector.scss'
import { IPaymentSelectorProps, TAllowedMethods } from './types'
import { __ } from '@wordpress/i18n'
import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { useSelect } from '@wordpress/data'
import { store } from '../../../store/frontend'

export const PaymentSelector = ({
    methods,
    selectedMethod,
    setSelectedMethod,
    paymentElementLoading = false,
}: IPaymentSelectorProps) => {
    // @ts-ignore
    const preset = useSelect((select) => select(store).getPreset(), [])

    const [availableWallets, setAvailableWallets] = useState<{
        googlePay: boolean
        applePay: boolean
    }>({
        googlePay: false,
        applePay: false,
    })
    const [walletsChecked, setWalletsChecked] = useState(false)

    useEffect(() => {
        const checkWalletAvailability = async () => {
            const publishableKey = preset?.settings?.stripe_publishable_key

            if (!publishableKey) {
                setWalletsChecked(true)
                return
            }

            try {
                // Load Stripe directly
                const stripe = await loadStripe(publishableKey)

                if (!stripe) {
                    setWalletsChecked(true)
                    return
                }

                // Get currency and country from preset
                const currency = preset?.settings?.stripe_currency || 'usd'
                const country = preset?.settings?.stripe_country || 'US'

                // Check if payment request (for Google Pay/Apple Pay) is available
                const paymentRequest = stripe.paymentRequest({
                    country: country,
                    currency: currency.toLowerCase(),
                    total: {
                        label: 'Availability Check',
                        amount: 100, // Dummy amount for checking
                    },
                    requestPayerName: false,
                    requestPayerEmail: false,
                })

                // Check if browser supports Payment Request API
                const canMakePayment = await paymentRequest.canMakePayment()

                if (canMakePayment) {
                    setAvailableWallets({
                        googlePay: canMakePayment.googlePay || false,
                        applePay: canMakePayment.applePay || false,
                    })
                }

                setWalletsChecked(true)
            } catch (error) {
                console.error('Error checking wallet availability:', error)
                setWalletsChecked(true)
            }
        }

        checkWalletAvailability()
    }, [
        preset?.settings?.stripe_publishable_key,
        preset?.settings?.stripe_currency,
        preset?.settings?.stripe_country,
    ])

    const paymentsOrder: TAllowedMethods[] = [
        'stripe',
        'google_pay',
        'apple_pay',
        'paypal',
        'woocommerce',
        'arrival',
        'bank',
        'stripe_others',
    ]
    // Filter methods based on wallet availability
    const filteredMethods = methods
        .filter((method) => {
            if (!walletsChecked) {
                return true
            }

            if (method.id === 'google_pay') {
                return availableWallets.googlePay
            }

            if (method.id === 'apple_pay') {
                return availableWallets.applePay
            }

            return true
        })
        .sort((a, b) => {
            const indexA = paymentsOrder.indexOf(a.id as TAllowedMethods)
            const indexB = paymentsOrder.indexOf(b.id as TAllowedMethods)
            return indexA - indexB
        })

    return (
        <div className={'wbk_payment-selector__wrapper'}>
            {(filteredMethods &&
                filteredMethods.length > 0 &&
                filteredMethods.map(({ name, id, icon }, index) => (
                    <div
                        key={id}
                        className={classNames(
                            'wbk_payment-selector__method',
                            'wbk_payment-selector__method--appear',
                            {
                                'wbk_payment-selector__method--selected':
                                    selectedMethod === id,
                                'wbk_payment-selector__method--checking':
                                    !walletsChecked &&
                                    (id === 'google_pay' || id === 'apple_pay'),
                            }
                        )}
                        style={{ animationDelay: `${index * 80}ms` }}
                        onClick={() => setSelectedMethod(id)}
                    >
                        {paymentElementLoading && selectedMethod === id ? (
                            <span className="wbk_payment-selector__loading-spinner"></span>
                        ) : (
                            <>
                                {icon && <img src={icon} alt={name} />}
                                <span>{name}</span>
                                {!walletsChecked &&
                                    (id === 'google_pay' ||
                                        id === 'apple_pay') && (
                                        <span className="wbk_payment-selector__checking-indicator">
                                            ...
                                        </span>
                                    )}
                            </>
                        )}
                    </div>
                ))) || (
                <div className={'wbk_payment-selector__no-methods'}>
                    {__(
                        'No payment methods found, contact administrator!',
                        'webba-booking-lite'
                    )}
                </div>
            )}
        </div>
    )
}
