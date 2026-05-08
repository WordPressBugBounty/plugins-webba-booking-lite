import { useState } from '@wordpress/element'
import { store_name } from '../../store/frontend'
import { select } from '@wordpress/data'
import styles from './ItemBlock.module.scss'
import bookingsSchema from '../../schemas/appointments.json'
import { useMemo } from 'react'
import classNames from 'classnames'
import iconCalendar from '../../../public/images/icon-ud-calendar.svg'
import iconTime from '../../../public/images/icon-ud-time.svg'
import iconCurrency from '../../../public/images/icon-ud-currency.svg'
import { wbkFormatPrice } from '../../frontend/providers/BookingFormProvider/utils'
import { __ } from '@wordpress/i18n'

export default function ItemBlock({
    data,
    selected,
    onChange,
    type,
    handleAction,
}) {
    const [actionState, setActionState] = useState('')

    const handleCancelAction = (event, action, id) => {
        event.preventDefault()
        setActionState('confirmCancel')
    }

    const handleCancelConfirmAction = async (event, action, id) => {
        event.preventDefault()
        setActionState('loading')

        try {
            const result = await handleAction(event, 'cancel', data.id)
            
            if (result?.status !== 'success') {
                setActionState('')
            }
        } catch (error) {
            setActionState('')
        }
    }

    const {
        wording,
        settings: { timezone, price_format, price_separator, price_fractional },
    } = select(store_name).getPreset()
    const allStatus = useMemo(
        () => bookingsSchema.properties.appointment_status.misc.options,
        []
    )
    const { status, price, date, time_formated, amount_paid } = data

    let fieldName = ''
    let title = '-'
    let showActions = true

    switch (type) {
        case 'booking':
            fieldName = 'wbk_booking'
            title = data.service_name
            break
        case 'past-booking':
            fieldName = 'wbk_booking'
            title = data.service_name
            showActions = false
            break
        case 'service':
            fieldName = 'wbk_service_id'
            break
        case 'extras':
            fieldName = 'wbk_extras'
            break
    }

    return (
        <li className={styles.wrapper}>
            <label>
                <div className={styles.heading}>
                    <span className={styles.title}>{title}</span>
                    <span className={styles.status}>
                        {allStatus[status] || status}
                    </span>
                    {price && <span className={styles.price}>{price}</span>}
                </div>
                <div className={styles.itemContent}>
                    <div className={styles.itemInfoWrapper}>
                        <div className={styles.itemInfo}>
                            <img src={iconCalendar} />
                            {date}
                        </div>
                        <div className={styles.itemInfo}>
                            <img src={iconTime} />
                            {time_formated}
                        </div>
                        {amount_paid && (
                            <div className={styles.itemInfo}>
                                <strong>{__('Amount paid: ', 'webba-booking-lite')}</strong>
                                {wbkFormatPrice(amount_paid, price_format, price_separator, price_fractional)}
                            </div>
                        )}
                    </div>
                    {showActions && (
                        <div className={styles.actionsWrapper}>
                            {price && (
                                <span className={styles.mobilePrice}>
                                    {price}
                                </span>
                            )}
                            <div
                                onClick={(event) =>
                                    handleAction(
                                        event,
                                        'reschedule',
                                        data.id,
                                        data.service_id
                                    )
                                }
                                className={classNames(
                                    styles.itemButton,
                                    styles.primary
                                )}
                            >
                                {wording.reschedule}
                            </div>
                            {actionState === 'confirmCancel' ? (
                                <div
                                    className={classNames(
                                        styles.itemButton,
                                        styles.secondary
                                    )}
                                    onClick={(event) =>
                                        handleCancelConfirmAction(
                                            event,
                                            data.id
                                        )
                                    }
                                >
                                    {wording.confirm_cancel}
                                </div>
                            ) : actionState === 'loading' ? (
                                <span className="loading-small-horizontal-wbk"></span>
                            ) : (
                                <div
                                    className={classNames(
                                        styles.itemButton,
                                        styles.secondary
                                    )}
                                    onClick={(event) =>
                                        handleCancelAction(event)
                                    }
                                >
                                    {wording.cancel}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </label>
        </li>
    )
}
