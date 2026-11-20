import { CellContext } from '@tanstack/react-table'
import { useSelect } from '@wordpress/data'
import { __ } from '@wordpress/i18n'
import { useMemo } from 'react'
import { store, store_name } from '../../../../../store/backend'
import { wbkFormat } from '../../../Form/utils/dateTime'
import './CustomerPackageDetail.scss'

const formatDateTime = (
    value: unknown,
    dateFormat?: string,
    timeFormat?: string,
    timezone?: string
) => {
    const numeric = Number(value)
    if (!value || !Number.isFinite(numeric) || numeric <= 0) {
        return '—'
    }

    try {
        const date = wbkFormat(
            numeric,
            dateFormat || 'dd/mm/yyyy',
            timezone || 'UTC'
        )
        const time = wbkFormat(
            numeric,
            timeFormat || 'HH:mm',
            timezone || 'UTC'
        )
        return `${date} ${time}`
    } catch {
        return String(value)
    }
}

export const CustomerPackageDetail = ({ cell }: CellContext<any, any>) => {
    const {
        product_id,
        total_credits,
        held_credits,
        purchased_at,
        activated_at,
        payment_method,
    } = cell.row.original

    const { settings } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )
    const products = useSelect(
        (select) => select(store).getItems('package_products') || [],
        []
    )

    const productLabel = useMemo(() => {
        const match = (products as any[]).find(
            (product) => Number(product.id) === Number(product_id)
        )
        return match?.name || (product_id ? `#${product_id}` : '—')
    }, [product_id, products])

    const fields = [
        {
            label: __('Package product', 'webba-booking-lite'),
            value: productLabel,
        },
        {
            label: __('Total visits', 'webba-booking-lite'),
            value: String(total_credits ?? '—'),
        },
        {
            label: __('Held visits', 'webba-booking-lite'),
            value: String(held_credits ?? '0'),
        },
        {
            label: __('Purchased at', 'webba-booking-lite'),
            value: formatDateTime(
                purchased_at,
                settings?.date_format,
                settings?.time_format,
                settings?.timezone
            ),
        },
        {
            label: __('Activated at', 'webba-booking-lite'),
            value: formatDateTime(
                activated_at,
                settings?.date_format,
                settings?.time_format,
                settings?.timezone
            ),
        },
        {
            label: __('Payment method', 'webba-booking-lite'),
            value: payment_method
                ? String(payment_method).charAt(0).toUpperCase() +
                  String(payment_method).slice(1)
                : '—',
        },
    ]

    return (
        <div className="wbk_customerPackageDetail__grid">
            {fields.map(({ label, value }) => (
                <div
                    key={label}
                    className="wbk_customerPackageDetail__gridItem"
                >
                    <span className="wbk_customerPackageDetail__label">
                        {label}
                    </span>
                    <strong className="wbk_customerPackageDetail__value">
                        {value}
                    </strong>
                </div>
            ))}
        </div>
    )
}
