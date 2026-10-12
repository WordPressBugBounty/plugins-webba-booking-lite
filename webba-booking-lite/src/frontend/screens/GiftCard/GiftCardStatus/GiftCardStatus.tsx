import { useEffect, useState } from 'react'
import { __ } from '@wordpress/i18n'
import apiFetch from '@wordpress/api-fetch'
import classNames from 'classnames'
import { Loading } from '../../../components/Loading/Loading'
import { GiftCardPublicStatus, GiftCardStatusProps } from './types'
import './GiftCardStatus.scss'

export const GiftCardStatus = ({ giftCardToken }: GiftCardStatusProps) => {
    const [status, setStatus] = useState<GiftCardPublicStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        const token = String(giftCardToken || '').trim()
        if (!token) {
            setLoading(false)
            setError(__('Gift card not found.', 'webba-booking-lite'))
            return
        }

        setLoading(true)
        setError(null)

        apiFetch<{
            success?: boolean
            gift_card?: GiftCardPublicStatus
            message?: string
        }>({
            path: `/wbk/v2/gift-card-status/?token=${encodeURIComponent(token)}`,
        })
            .then((result) => {
                if (cancelled) {
                    return
                }
                if (!result?.success || !result.gift_card) {
                    setError(
                        result?.message ||
                            __('Gift card not found.', 'webba-booking-lite')
                    )
                    setStatus(null)
                    return
                }
                setStatus(result.gift_card)
            })
            .catch(() => {
                if (!cancelled) {
                    setError(
                        __('Gift card not found.', 'webba-booking-lite')
                    )
                    setStatus(null)
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false)
                }
            })

        return () => {
            cancelled = true
        }
    }, [giftCardToken])

    return (
        <div className="wbk_booking_form__wrapper">
            <div className="wbk_gift_card_status">
                {loading && <Loading size="large" />}
                {!loading && error && (
                    <p className="wbk_gift_card_status__error">{error}</p>
                )}
                {!loading && status && (
                    <>
                        <div className="wbk_gift_card_status__header">
                            <h3 className="wbk_gift_card_status__title">
                                {__('Gift card', 'webba-booking-lite')}
                            </h3>
                            <span
                                className={classNames(
                                    'wbk_gift_card_status__badge',
                                    {
                                        'wbk_gift_card_status__badge--active':
                                            status.active,
                                        'wbk_gift_card_status__badge--expired':
                                            !status.active,
                                    }
                                )}
                            >
                                {status.active
                                    ? __('Active', 'webba-booking-lite')
                                    : __('Expired', 'webba-booking-lite')}
                            </span>
                        </div>
                        <div className="wbk_gift_card_status__balance">
                            <p className="wbk_gift_card_status__balance-label">
                                {__('Remaining balance', 'webba-booking-lite')}
                            </p>
                            <p className="wbk_gift_card_status__balance-value">
                                {status.remaining_formatted}
                            </p>
                        </div>
                        <dl className="wbk_gift_card_status__details">
                            <div className="wbk_gift_card_status__row">
                                <dt>{__('Code', 'webba-booking-lite')}</dt>
                                <dd>{status.code}</dd>
                            </div>
                            <div className="wbk_gift_card_status__row">
                                <dt>
                                    {__('Original amount', 'webba-booking-lite')}
                                </dt>
                                <dd>{status.amount_formatted}</dd>
                            </div>
                            {status.expiration_label !== '' && (
                                <div className="wbk_gift_card_status__row">
                                    <dt>
                                        {__('Valid until', 'webba-booking-lite')}
                                    </dt>
                                    <dd>{status.expiration_label}</dd>
                                </div>
                            )}
                        </dl>
                    </>
                )}
            </div>
        </div>
    )
}
