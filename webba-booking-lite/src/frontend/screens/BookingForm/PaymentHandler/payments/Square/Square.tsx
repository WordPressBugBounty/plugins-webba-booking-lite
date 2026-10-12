import { useEffect, useRef } from 'react'
import { useBookingContext } from '../../../../../providers/BookingFormProvider/BookingFormProvider'
import { loadSquareSdk } from './loadSquareSdk'
import { ISquareCardProps, ISquareTokenizeDetails } from './types'
import './Square.scss'

type SquareCardInstance = {
    attach: (selector: string | HTMLElement) => Promise<void>
    tokenize: () => Promise<{
        status: string
        token?: string
        errors?: Array<{ message?: string }>
    }>
    destroy: () => Promise<void>
}

export const SquareCard = ({ onLoadingChange }: ISquareCardProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const cardRef = useRef<SquareCardInstance | null>(null)
    const paymentsRef = useRef<ReturnType<
        NonNullable<typeof window.Square>['payments']
    > | null>(null)
    const tokenizeInFlightRef = useRef(false)
    const { preset, setFormObj } = useBookingContext()
    const applicationId = preset?.settings?.square_application_id
    const locationId = preset?.settings?.square_location_id
    const environment = preset?.settings?.square_environment || 'production'
    const currency = preset?.settings?.square_currency || 'USD'

    useEffect(() => {
        let cancelled = false

        const init = async () => {
            if (!applicationId || !locationId || !containerRef.current) {
                onLoadingChange?.(false)
                return
            }

            onLoadingChange?.(true)

            try {
                const Square = await loadSquareSdk(environment)
                if (!Square || cancelled || !containerRef.current) {
                    return
                }

                const payments = Square.payments(applicationId, locationId)
                const card = await payments.card()
                if (cancelled) {
                    await card.destroy()
                    return
                }

                await card.attach(containerRef.current)
                if (cancelled) {
                    await card.destroy()
                    return
                }

                cardRef.current = card
                paymentsRef.current = payments

                setFormObj('squareObj', {
                    isValidated: true,
                    currency,
                    tokenize: async (details: ISquareTokenizeDetails) => {
                        const attachedCard = cardRef.current
                        const attachedPayments = paymentsRef.current
                        if (!attachedCard) {
                            return {
                                error: 'Square card is not ready',
                            }
                        }

                        tokenizeInFlightRef.current = true
                        try {
                            const result = await attachedCard.tokenize()
                            if (result.status !== 'OK' || !result.token) {
                                return {
                                    error:
                                        result.errors?.[0]?.message ||
                                        'Card tokenization failed',
                                }
                            }

                            let verificationToken = ''
                            if (attachedPayments) {
                                try {
                                    const verification =
                                        await attachedPayments.verifyBuyer(
                                            result.token,
                                            {
                                                amount: details.amount,
                                                currencyCode:
                                                    details.currencyCode,
                                                intent: 'CHARGE',
                                                billingContact: {
                                                    givenName:
                                                        details.givenName || '',
                                                    email: details.email || '',
                                                },
                                            }
                                        )
                                    verificationToken =
                                        verification?.token || ''
                                } catch {
                                    verificationToken = ''
                                }
                            }

                            return {
                                token: result.token,
                                verificationToken,
                            }
                        } finally {
                            tokenizeInFlightRef.current = false
                        }
                    },
                })
            } catch (error) {
                setFormObj('squareObj', {
                    isValidated: false,
                    tokenize: async () => ({
                        error:
                            error instanceof Error
                                ? error.message
                                : 'Unable to load Square',
                    }),
                })
            } finally {
                if (!cancelled) {
                    onLoadingChange?.(false)
                }
            }
        }

        init()

        return () => {
            cancelled = true
            const card = cardRef.current
            cardRef.current = null
            paymentsRef.current = null
            if (card && !tokenizeInFlightRef.current) {
                card.destroy()
            }
            setFormObj('squareObj', {})
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applicationId, locationId, environment, currency])

    return <div ref={containerRef} className="wbk_step__square-card" />
}
