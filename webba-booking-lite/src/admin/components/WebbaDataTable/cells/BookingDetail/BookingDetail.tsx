import { CellContext } from '@tanstack/react-table'
import styles from './BookingDetail.module.scss'
import { __ } from '@wordpress/i18n'
import { Button } from '../../../Button/Button'
import { useCallback, useLayoutEffect } from 'react'
import { useState } from 'react'
import apiFetch from '@wordpress/api-fetch'
import { formatDate } from 'date-fns'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../../../store/backend'
import { wbkFormat } from '../../../Form/utils/dateTime'

export const BookingDetail = ({ cell }: CellContext<any, any>) => {
    const {
        id,
        quantity,
        duration,
        created_on,
        email,
        user_ip,
        created_by,
        extra,
        description
    } = cell.row.original
    const [emailType, setEmailType] = useState<string>('confirmation')
    const [message, setMessage] = useState<string | null>(null)

    const sendEmail = useCallback(async () => {
        await apiFetch({
            method: 'POST',
            path: 'wbk/v1/resend-email/',
            data: {
                id,
                notification_type: emailType,
            },
        }).then((res: any) => setMessage(res.message))
    }, [emailType])

    // @ts-ignore
    const { settings } = useSelect(
        (select) => select(store_name).getPreset(),
        []
    )

    return (
        <div>
            <table className={styles.table}>
                <tbody>
                    <tr>
                        <td>
                            {__('ID:', 'webba-booking-lite')}
                            <strong>{id}</strong>
                        </td>
                        <td>
                            {__('Places booked:', 'webba-booking-lite')}{' '}
                            <strong>{quantity}</strong>
                        </td>
                        <td>
                            {__('Duration:', 'webba-booking-lite')}{' '}
                            <strong>{duration}</strong>
                        </td>
                        <td>
                            {__('Created on:', 'webba-booking-lite')}{' '}
                            <strong>
                                {created_on &&
                                    wbkFormat(
                                        created_on,
                                        `${
                                            settings
                                                ? settings.date_format
                                                : 'dd/mm/yyyy'
                                        } ${
                                            settings
                                                ? settings.time_format
                                                : 'HH:mm'
                                        }`,
                                        settings ? settings.timezone : 'UTC'
                                    )}
                            </strong>
                        </td>
                        <td>
                            {__('Email:', 'webba-booking-lite')}{' '}
                            <strong>{email}</strong>
                            <div className={styles.emailSender}>
                                <strong>
                                    {__(
                                        '(Re)send Email notifications:',
                                        'webba-booking-lite'
                                    )}
                                </strong>
                                <select
                                    value={emailType}
                                    onChange={(e) =>
                                        setEmailType(e.target.value)
                                    }
                                    className={styles.emailSelect}
                                >
                                    <option value="confirmation">
                                        {__('On booking', 'webba-booking-lite')}
                                    </option>
                                    <option value="payment">
                                        {__('On payment', 'webba-booking-lite')}
                                    </option>
                                    <option value="approval">
                                        {__(
                                            'On approval',
                                            'webba-booking-lite'
                                        )}
                                    </option>
                                    <option value="arrival">
                                        {__('On arrival', 'webba-booking-lite')}
                                    </option>
                                </select>
                                <Button onClick={sendEmail}>
                                    {__('Send', 'webba-booking-lite')}
                                </Button>
                                {message && (
                                    <div className={styles.emailMessage}>
                                        {message}
                                    </div>
                                )}
                            </div>
                        </td>
                        {extra && (
                            <td>
                                {__('Custom fields:', 'webba-booking-lite')}{' '}
                                {JSON.parse(extra).map(
                                    (field: any, i: number) => (
                                        <div key={i}>
                                            <strong>{field[1]}:</strong>{' '}
                                            {field[2]}
                                        </div>
                                    )
                                )}
                            </td>
                        )}
                        <td>
                            {__('User IP:', 'webba-booking-lite')}{' '}
                            <strong>{user_ip}</strong>
                        </td>
                        <td>
                            {__('Created by:', 'webba-booking-lite')}{' '}
                            <strong>
                                {created_by === 'admin'
                                    ? __('Administrator', 'webba-booking-lite')
                                    : __('Customer', 'webba-booking-lite')}
                            </strong>
                        </td>
                    </tr>
                </tbody>
            </table>
            {description && (
                <div className={styles.description}>
                    <strong>{__('Comment: ', 'webba-booking-lite')}</strong>
                    {description}
                </div>
            )}
        </div>
    )
}
