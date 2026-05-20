import { CellContext, flexRender } from '@tanstack/react-table'
import './BookingDetail.scss'
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
import { useWording } from '../../../../../frontend/hooks/useWording'
import { fromUnixTime } from 'date-fns'
import { formatPrice } from '../../../../utils/currency'

function formatCreatedAt(
    createdOn: unknown,
    dateFormat?: string,
    timezone?: string
): string {
    if (createdOn == null) return ''
    const num = Number(createdOn)
    if (!Number.isFinite(num)) return ''
    const date = fromUnixTime(num)
    if (Number.isNaN(date.getTime())) return ''
    try {
        return wbkFormat(date, dateFormat ?? '', timezone ?? '')
    } catch {
        return ''
    }
}

function parseBookingExtras(
    bookingExtraRaw: unknown
): Array<{ extraId: string; quantity: string }> {
    if (!bookingExtraRaw) return []
    let parsed: unknown = bookingExtraRaw
    if (typeof bookingExtraRaw === 'string') {
        const trimmed = bookingExtraRaw.trim()
        if (!trimmed) return []
        try {
            parsed = JSON.parse(trimmed)
        } catch {
            return []
        }
    }

    if (Array.isArray(parsed)) {
        return parsed
            .map((row: Record<string, unknown>) => ({
                extraId: String(row?.extra_id ?? row?.id ?? ''),
                quantity: String(row?.quantity ?? ''),
            }))
            .filter((row) => row.extraId !== '' && row.quantity !== '')
    }

    if (parsed && typeof parsed === 'object') {
        return Object.entries(parsed as Record<string, unknown>)
            .map(([extraId, quantity]) => ({
                extraId: String(extraId),
                quantity: String(quantity ?? ''),
            }))
            .filter((row) => row.extraId !== '' && row.quantity !== '')
    }

    return []
}

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
        created_on,
        booking_extra,
    } = cell.row.original

    const wording = useWording()
    const [emailType, setEmailType] = useState<string>(
        'booking_created_by_customer'
    )
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
    const { settings, categories, extras } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )
    const associatedCategories = mapServiceCategories(service_id, categories)
    const visibleCells = row.getVisibleCells()
    const parsedBookingExtras = useMemo(
        () => parseBookingExtras(booking_extra),
        [booking_extra]
    )
    const extraNameById = useMemo(() => {
        const map = new Map<string, string>()
        if (!Array.isArray(extras)) {
            return map
        }
        extras.forEach((extra: Record<string, unknown>) => {
            const id = String(extra.id ?? extra.value ?? '')
            if (!id) return
            const label = String(extra.label ?? extra.name ?? '')
            map.set(id, label || id)
        })
        return map
    }, [extras])

    return (
        <div className="wbk_bookingDetail__wrapper">
            <table className="wbk_bookingDetail__table">
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
                            <div className="wbk_bookingDetail__column">
                                {associatedCategories.length > 0 && (
                                    <div
                                        className={classNames(
                                            'wbk_bookingDetail__columnItem',
                                            'wbk_bookingDetail__columnItem--wrapMobile'
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
                                        'wbk_bookingDetail__columnItem',
                                        'wbk_bookingDetail__columnItem--wrapMobile'
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
                                            'wbk_bookingDetail__columnItem',
                                            'wbk_bookingDetail__columnItem--wrapMobile'
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
                            <div className={'wbk_bookingDetail__column'}>
                                <div
                                    className={classNames(
                                        'wbk_bookingDetail__columnItem',
                                        'wbk_bookingDetail__columnItem--wrapMobile'
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
                                <div
                                    className={classNames(
                                        'wbk_bookingDetail__columnItem',
                                        'wbk_bookingDetail__columnItem--wrapMobile'
                                    )}
                                >
                                    <span>
                                        {__('Created at', 'webba-booking-lite')}
                                    </span>
                                    <p>
                                        {formatCreatedAt(
                                            created_on,
                                            settings?.date_format,
                                            settings?.timezone
                                        ) || '—'}
                                    </p>
                                </div>
                                {payment_method && (
                                    <div
                                        className={classNames(
                                            'wbk_bookingDetail__columnItem',
                                            'wbk_bookingDetail__columnItem--wrapMobile'
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
                                        'wbk_bookingDetail__columnItem',
                                        'wbk_bookingDetail__columnItem--wrapMobile'
                                    )}
                                >
                                    <span>
                                        {__('Price', 'webba-booking-lite')}
                                    </span>
                                    <p>
                                        {moment_price && moment_price > 0
                                            ? formatPrice(
                                                moment_price,
                                                settings?.price_format,
                                                settings?.price_separator,
                                                settings?.price_fractional
                                            )
                                            : wording.free ||
                                            __('Free', 'webba-booking-lite')}
                                    </p>
                                </div>
                                <div
                                    className={classNames(
                                        'wbk_bookingDetail__columnItem',
                                        'wbk_bookingDetail__columnItem--wrapMobile'
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
                                            ? formatPrice(
                                                amount_paid || 0,
                                                settings?.price_format,
                                                settings?.price_separator,
                                                settings?.price_fractional
                                            )
                                            : wording.free ||
                                            __('Free', 'webba-booking-lite')}
                                    </p>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div className="wbk_bookingDetail__mobileDivider"></div>
                            <div className="wbk_bookingDetail__emailSender">
                                <div className="wbk_bookingDetail__column">
                                    <div className="wbk_bookingDetail__columnItem">
                                        <span>
                                            {__(
                                                'Notification status',
                                                'webba-booking-lite'
                                            )}
                                        </span>
                                        {message && (
                                            <p className="wbk_bookingDetail__emailMessage">
                                                {message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="wbk_bookingDetail__emailSelectWrapper">
                                        <select
                                            value={emailType}
                                            onChange={(e) =>
                                                setEmailType(e.target.value)
                                            }
                                            className="wbk_bookingDetail__emailSelect"
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
                                            className="wbk_bookingDetail__emailButton"
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
                            <td className="wbk_bookingDetail__customDetailWrapper">
                                <div className="wbk_bookingDetail__column">
                                    <div className="wbk_bookingDetail__columnItem">
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
                        {parsedBookingExtras.length > 0 && (
                            <td className="wbk_bookingDetail__customDetailWrapper">
                                <div className="wbk_bookingDetail__column">
                                    <div className="wbk_bookingDetail__columnItem">
                                        <span>
                                            {__(
                                                'Additional items',
                                                'webba-booking-lite'
                                            )}
                                        </span>
                                        {parsedBookingExtras.map(
                                            ({ extraId, quantity }) => (
                                                <p key={`${extraId}-${quantity}`}>
                                                    {decodeHtmlEntities(
                                                        extraNameById.get(extraId) ||
                                                        extraId
                                                    )}
                                                    {': '}
                                                    {decodeHtmlEntities(quantity)}
                                                </p>
                                            )
                                        )}
                                    </div>
                                </div>
                            </td>
                        )}
                        <td>
                            <div className="wbk_bookingDetail__column">
                                <div className="wbk_bookingDetail__columnItem">
                                    <span>
                                        {__(
                                            'Internal note',
                                            'webba-booking-lite'
                                        )}
                                    </span>
                                    <p>
                                        <textarea
                                            className="wbk_bookingDetail__inputNote"
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
