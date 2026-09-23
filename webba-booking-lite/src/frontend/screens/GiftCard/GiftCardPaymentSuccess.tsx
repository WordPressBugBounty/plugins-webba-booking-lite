import { useEffect, useState } from 'react'
import { __ } from '@wordpress/i18n'
import apiFetch from '@wordpress/api-fetch'
import { GiftCardThankYou, IGiftCardResult } from './GiftCardThankYou'
import { Loading } from '../../components/Loading/Loading'
import '../BookingForm/ThankYou/ThankYou.scss'

interface IGiftCardPaymentSuccessProps {
    paymentId: string
}

export const GiftCardPaymentSuccess = ({
    paymentId,
}: IGiftCardPaymentSuccessProps) => {
    const [giftCard, setGiftCard] = useState<IGiftCardResult | null>(null)
    const [paymentMethod, setPaymentMethod] = useState('paypal')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!paymentId) {
            setError(
                __('Missing payment information.', 'webba-booking-lite')
            )
            setLoading(false)
            return
        }

        let cancelled = false
        let attempts = 0
        const maxAttempts = 8

        const load = async () => {
            try {
                const response = await apiFetch<{
                    success?: boolean
                    pending?: boolean
                    gift_card?: IGiftCardResult
                    payment_method?: string
                    message?: string
                }>({
                    path: `/wbk/v2/gift-card-payment-details/?payment_id=${encodeURIComponent(
                        paymentId
                    )}`,
                    method: 'GET',
                })

                if (cancelled) {
                    return
                }

                if (response?.success && response.gift_card) {
                    setGiftCard(response.gift_card)
                    setPaymentMethod(
                        response.payment_method ||
                            response.gift_card.payment_method ||
                            'paypal'
                    )
                    setLoading(false)
                    return
                }

                if (response?.pending && attempts < maxAttempts) {
                    attempts += 1
                    window.setTimeout(load, 1000)
                    return
                }

                setError(
                    response?.message ||
                        __(
                            'Unable to load gift card payment details.',
                            'webba-booking-lite'
                        )
                )
                setLoading(false)
            } catch (e: any) {
                if (cancelled) {
                    return
                }
                if (attempts < maxAttempts) {
                    attempts += 1
                    window.setTimeout(load, 1000)
                    return
                }
                setError(
                    e?.message ||
                        __(
                            'Unable to load gift card payment details.',
                            'webba-booking-lite'
                        )
                )
                setLoading(false)
            }
        }

        load()

        return () => {
            cancelled = true
        }
    }, [paymentId])

    if (loading) {
        return (
            <div
                className="wbk_thank_you__wrapper"
                style={{ textAlign: 'center', padding: '48px 0' }}
            >
                <Loading size="large" />
                <div className="wbk_thank_you__header">
                    <h3>
                        {__(
                            'Loading payment details...',
                            'webba-booking-lite'
                        )}
                    </h3>
                </div>
            </div>
        )
    }

    if (error || !giftCard) {
        return (
            <div className="wbk_thank_you__wrapper">
                <div className="wbk_thank_you__native-scroll">
                    <div className="wbk_thank_you__inner-wrapper">
                        <div className="wbk_thank_you__header wbk_thank_you__header--visible">
                            <div className="wbk_thank_you__header__content">
                                <h3>
                                    {__(
                                        'Payment details unavailable',
                                        'webba-booking-lite'
                                    )}
                                </h3>
                                <p>
                                    {error ||
                                        __(
                                            'Unable to load gift card payment details.',
                                            'webba-booking-lite'
                                        )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <GiftCardThankYou
            giftCard={giftCard}
            paymentMethod={paymentMethod}
        />
    )
}
