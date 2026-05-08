import classNames from 'classnames'
import './PaymentSelector.scss'
import { IPaymentSelectorProps, TAllowedMethods } from './types'
import { __ } from '@wordpress/i18n'
import { useEffect, useMemo, useState } from 'react'
import { useSelect } from '@wordpress/data'
import { store } from '../../../store/frontend'

const STRIPE_WALLET_METHOD_IDS: TAllowedMethods[] = [
    'google_pay',
    'apple_pay',
]

export const PaymentSelector = ({
    methods,
    selectedMethod,
    setSelectedMethod,
    paymentElementLoading = false,
}: IPaymentSelectorProps) => {
    // @ts-ignore
    const preset = useSelect((select) => select(store).getPreset(), [])

    const needsStripeWalletProbe = useMemo(
        () =>
            methods.some((method) =>
                STRIPE_WALLET_METHOD_IDS.includes(method.id as TAllowedMethods)
            ),
        [methods]
    )

    const [availableWallets, setAvailableWallets] = useState<{
        googlePay: boolean
        applePay: boolean
    }>({
        googlePay: false,
        applePay: false,
    })
    const [walletsChecked, setWalletsChecked] = useState(!needsStripeWalletProbe)

    useEffect(() => {
        if (!needsStripeWalletProbe) {
            setWalletsChecked(true)
        }
    }, [needsStripeWalletProbe])

    useEffect(() => {
        if (!needsStripeWalletProbe) {
            return
        }

        let cancelled = false
        setWalletsChecked(false)

        const checkWalletAvailability = async () => {
            const publishableKey = preset?.settings?.stripe_publishable_key

            if (!publishableKey) {
                if (!cancelled) {
                    setWalletsChecked(true)
                }
                return
            }

            try {
                const { loadStripe } = await import(
                    /* webpackMode: "eager" */ '@stripe/stripe-js'
                )
                const stripe = await loadStripe(publishableKey)

                if (!stripe) {
                    if (!cancelled) {
                        setWalletsChecked(true)
                    }
                    return
                }

                const currency = preset?.settings?.stripe_currency || 'usd'
                const country = preset?.settings?.stripe_country || 'US'

                const paymentRequest = stripe.paymentRequest({
                    country: country,
                    currency: currency.toLowerCase(),
                    total: {
                        label: 'Availability Check',
                        amount: 100,
                    },
                    requestPayerName: false,
                    requestPayerEmail: false,
                })

                const canMakePayment = await paymentRequest.canMakePayment()

                if (cancelled) {
                    return
                }

                if (canMakePayment) {
                    setAvailableWallets({
                        googlePay: canMakePayment.googlePay || false,
                        applePay: canMakePayment.applePay || false,
                    })
                }

                setWalletsChecked(true)
            } catch (error) {
                console.error('Error checking wallet availability:', error)
                if (!cancelled) {
                    setWalletsChecked(true)
                }
            }
        }

        checkWalletAvailability()

        return () => {
            cancelled = true
        }
    }, [
        needsStripeWalletProbe,
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
