import { CellContext, flexRender } from '@tanstack/react-table'
import styles from './BookingDetail.module.scss'
import { __ } from '@wordpress/i18n'
import { Button } from '../../../Button/Button'
import { useCallback, useLayoutEffect, useMemo } from 'react'
import { useState } from 'react'
import apiFetch from '@wordpress/api-fetch'
import { useDispatch, useSelect } from '@wordpress/data'
import { store_name } from '../../../../../store/backend'
import { wbkFormat } from '../../../Form/utils/dateTime'
import { decodeHtmlEntities, mapServiceCategories } from '../../utils'
import classNames from 'classnames'
import { CellProvider } from '../../context/CellProvider'
import { customActionCells, ignoreMappingCells } from '../../TableMobile'

export const BookingDetail = ({ cell, row }: CellContext<any, any>) => {
    const {
        id,
        service_id,
        amount_paid,
        phone,
        payment_method,
        moment_price,
        quantity,
        created_by,
        extra,
        description,
    } = cell.row.original
    const [emailType, setEmailType] = useState<string>('booking_created_by_customer')
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

    const paymentMethods = useSelect(
        (select) =>
            // @ts-ignore
            select(store_name).getFieldOptions(
                'appointments',
                'payment_method'
            ),
        []
    )

    const { setItem } = useDispatch(store_name)
    const { settings, categories } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )
    const associatedCategories = mapServiceCategories(service_id, categories)
    const visibleCells = row.getVisibleCells()

    return (
        <div className={styles.wrapper}>
            <table className={styles.table}>
                <tbody>
                    <tr>
                        {window.innerWidth < 768 &&
                            visibleCells
                                .filter(
                                    (cell: any) =>
                                        !ignoreMappingCells.includes(
                                            cell.column.id
                                        ) &&
                                        !customActionCells.includes(
                                            cell.column.id
                                        )
                                )
                                .slice(4, visibleCells.length)
                                .map((cell: any) => (
                                    <CellProvider cell={cell}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </CellProvider>
                                ))}
                        <td>
                            <div className={styles.column}>
                                {associatedCategories.length > 0 && (
                                    <div
                                        className={classNames(
                                            styles.columnItem,
                                            styles.wrapMobile
                                        )}
                                    >
                                        <span>
                                            {__(
                                                'Category',
                                                'webba-booking-lite'
                                            )}
                                        </span>
                                        <p>
                                            {associatedCategories
                                                .map(
                                                    (category: any) =>
                                                        category.label
                                                )
                                                .join(', ')}
                                        </p>
                                    </div>
                                )}
                                <div
                                    className={classNames(
                                        styles.columnItem,
                                        styles.wrapMobile
                                    )}
                                >
                                    <span>
                                        {__(
                                            'Places booked',
                                            'webba-booking-lite'
                                        )}
                                    </span>
                                    <p>{quantity}</p>
                                </div>
                                {phone && (
                                    <div
                                        className={classNames(
                                            styles.columnItem,
                                            styles.wrapMobile
                                        )}
                                    >
                                        <span>
                                            {__('Phone', 'webba-booking-lite')}
                                        </span>
                                        <p>{phone}</p>
                                    </div>
                                )}
                            </div>
                        </td>
                        <td>
                            <div className={styles.column}>
                                <div
                                    className={classNames(
                                        styles.columnItem,
                                        styles.wrapMobile
                                    )}
                                >
                                    <span>
                                        {__('Created by', 'webba-booking-lite')}
                                    </span>
                                    <p>
                                        {created_by === 'admin'
                                            ? __(
                                                  'Administrator',
                                                  'webba-booking-lite'
                                              )
                                            : __(
                                                  'Customer',
                                                  'webba-booking-lite'
                                              )}
                                    </p>
                                </div>
                                {payment_method && (
                                    <div
                                        className={classNames(
                                            styles.columnItem,
                                            styles.wrapMobile
                                        )}
                                    >
                                        <span>
                                            {__(
                                                'Payment method',
                                                'webba-booking-lite'
                                            )}
                                        </span>
                                        <p>
                                            {paymentMethods[payment_method] ||
                                                payment_method}
                                        </p>
                                    </div>
                                )}
                                <div
                                    className={classNames(
                                        styles.columnItem,
                                        styles.wrapMobile
                                    )}
                                >
                                    <span>
                                        {__('Price', 'webba-booking-lite')}
                                    </span>
                                    <p>
                                        {moment_price && moment_price > 0
                                            ? settings?.price_format.replace(
                                                  '#price',
                                                  moment_price
                                              )
                                            : __('Free', 'webba-booking-lite')}
                                    </p>
                                </div>
                                <div
                                    className={classNames(
                                        styles.columnItem,
                                        styles.wrapMobile
                                    )}
                                >
                                    <span>
                                        {__(
                                            'Amount paid',
                                            'webba-booking-lite'
                                        )}
                                    </span>
                                    <p>
                                        {(amount_paid && amount_paid > 0) ||
                                        moment_price > 0
                                            ? settings?.price_format.replace(
                                                  '#price',
                                                  amount_paid || 0
                                              )
                                            : __('Free', 'webba-booking-lite')}
                                    </p>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div className={styles.mobileDivider}></div>
                            <div className={styles.emailSender}>
                                <div className={styles.column}>
                                    <div className={styles.columnItem}>
                                        <span>
                                            {__(
                                                'Notification status',
                                                'webba-booking-lite'
                                            )}
                                        </span>
                                        {message && (
                                            <p className={styles.emailMessage}>
                                                {message}
                                            </p>
                                        )}
                                    </div>
                                    <div className={styles.emailSelectWrapper}>
                                        <select
                                            value={emailType}
                                            onChange={(e) =>
                                                setEmailType(e.target.value)
                                            }
                                            className={styles.emailSelect}
                                        >
                                            <option value="booking_created_by_customer">
                                                {__(
                                                    'On booking',
                                                    'webba-booking-lite'
                                                )}
                                            </option>
                                            <option value="booking_paid">
                                                {__(
                                                    'On payment',
                                                    'webba-booking-lite'
                                                )}
                                            </option>
                                            <option value="booking_approved">
                                                {__(
                                                    'On approval',
                                                    'webba-booking-lite'
                                                )}
                                            </option>
                                            <option value="booking_finished">
                                                {__(
                                                    'On arrival',
                                                    'webba-booking-lite'
                                                )}
                                            </option>
                                        </select>
                                        <Button
                                            onClick={sendEmail}
                                            className={styles.emailButton}
                                        >
                                            {(message &&
                                                __(
                                                    'Resend',
                                                    'webba-booking-lite'
                                                )) ||
                                                __(
                                                    'Send',
                                                    'webba-booking-lite'
                                                )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </td>
                        {extra && JSON.parse(extra).length > 0 && (
                            <td className={styles.customDetailWrapper}>
                                <div className={styles.column}>
                                    <div className={styles.columnItem}>
                                        <span>
                                            {__(
                                                'Custom details',
                                                'webba-booking-lite'
                                            )}
                                        </span>
                                        {JSON.parse(extra).map(
                                            (field: any, i: number) => (
                                                <p>
                                                    {decodeHtmlEntities(
                                                        field[1]
                                                    )}
                                                    :{' '}
                                                    {decodeHtmlEntities(
                                                        field[2]
                                                    )}
                                                </p>
                                            )
                                        )}
                                    </div>
                                </div>
                            </td>
                        )}
                        <td>
                            <div className={styles.column}>
                                <div className={styles.columnItem}>
                                    <span>
                                        {__(
                                            'Internal note',
                                            'webba-booking-lite'
                                        )}
                                    </span>
                                    <p>
                                        <textarea
                                            className={styles.inputNote}
                                            onBlur={(e) =>
                                                setItem('appointments', {
                                                    ...cell.row.original,
                                                    description: e.target.value,
                                                })
                                            }
                                        >
                                            {description}
                                        </textarea>
                                    </p>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
