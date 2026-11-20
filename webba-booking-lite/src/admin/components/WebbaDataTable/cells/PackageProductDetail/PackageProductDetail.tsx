import { CellContext } from '@tanstack/react-table'
import { useSelect } from '@wordpress/data'
import { __ } from '@wordpress/i18n'
import { useMemo } from 'react'
import { store } from '../../../../../store/backend'
import './PackageProductDetail.scss'

const unlimitedLabel = __('Unlimited', 'webba-booking-lite')
const noneLabel = __('None', 'webba-booking-lite')

const formatLimit = (value: unknown, emptyLabel = unlimitedLabel) => {
    const numeric = Number(value)
    if (value === '' || value === null || value === undefined) {
        return emptyLabel
    }
    if (Number.isNaN(numeric) || numeric <= 0) {
        return emptyLabel
    }
    return String(numeric)
}

const expiryTypeLabels: Record<string, string> = {
    none: __('No expiry', 'webba-booking-lite'),
    fixed: __('Fixed end date', 'webba-booking-lite'),
    relative: __('Relative from start', 'webba-booking-lite'),
}

const validityStartsLabels: Record<string, string> = {
    purchase: __('On purchase', 'webba-booking-lite'),
    first_use: __('On first use', 'webba-booking-lite'),
}

export const PackageProductDetail = ({ cell }: CellContext<any, any>) => {
    const {
        description,
        expiry_type,
        expiry_fixed_date,
        expiry_relative_days,
        validity_starts,
        applicable_for_all_services,
        services,
        payment_methods,
        min_interval_days,
        max_visits_per_day,
        max_visits_per_week,
        max_visits_per_month,
        cancel_restore_credits,
        max_active_per_customer,
    } = cell.row.original

    const serviceItems = useSelect(
        (select) => select(store).getItems('services') || [],
        []
    )

    const servicesLabel = useMemo(() => {
        if (applicable_for_all_services === 'yes') {
            return __('All services', 'webba-booking-lite')
        }

        const selectedIds = Array.isArray(services)
            ? services.map((id: unknown) => Number(id))
            : typeof services === 'string' && services
              ? services
                    .split(',')
                    .map((id) => Number(id.trim()))
                    .filter((id) => !Number.isNaN(id))
              : []

        if (!selectedIds.length) {
            return __('No services selected', 'webba-booking-lite')
        }

        const names = serviceItems
            .filter((service: any) =>
                selectedIds.includes(Number(service.id))
            )
            .map((service: any) => service.name)
            .filter(Boolean)

        return names.length
            ? names.join(', ')
            : selectedIds.join(', ')
    }, [applicable_for_all_services, serviceItems, services])

    const expiryLabel = useMemo(() => {
        const type = String(expiry_type || 'none')
        const base = expiryTypeLabels[type] || type

        if (type === 'fixed' && expiry_fixed_date) {
            const date = new Date(Number(expiry_fixed_date) * 1000)
            if (!Number.isNaN(date.getTime())) {
                return `${base} (${date.toLocaleDateString()})`
            }
        }

        if (type === 'relative') {
            const days = Number(expiry_relative_days) || 0
            const starts =
                validityStartsLabels[String(validity_starts)] ||
                String(validity_starts || '')
            return `${base} (${days} ${__(
                'days',
                'webba-booking-lite'
            )}, ${starts})`
        }

        return base
    }, [
        expiry_fixed_date,
        expiry_relative_days,
        expiry_type,
        validity_starts,
    ])

    const paymentMethodsLabel = useMemo(() => {
        const selected = Array.isArray(payment_methods)
            ? payment_methods.map(String)
            : typeof payment_methods === 'string' && payment_methods
              ? (() => {
                    try {
                        const decoded = JSON.parse(payment_methods)
                        return Array.isArray(decoded)
                            ? decoded.map(String)
                            : payment_methods
                                  .split(',')
                                  .map((method) => method.trim())
                                  .filter(Boolean)
                    } catch {
                        return payment_methods
                            .split(',')
                            .map((method) => method.trim())
                            .filter(Boolean)
                    }
                })()
              : []

        if (!selected.length) {
            return __('On arrival', 'webba-booking-lite')
        }

        return selected
            .map((method) =>
                method
                    .split('_')
                    .map(
                        (part) =>
                            part.charAt(0).toUpperCase() + part.slice(1)
                    )
                    .join(' ')
            )
            .join(', ')
    }, [payment_methods])

    const fields = [
        {
            label: __('Description', 'webba-booking-lite'),
            value: description || '—',
        },
        {
            label: __('Expiry', 'webba-booking-lite'),
            value: expiryLabel,
        },
        {
            label: __('Services', 'webba-booking-lite'),
            value: servicesLabel,
        },
        {
            label: __('Payment methods', 'webba-booking-lite'),
            value: paymentMethodsLabel,
        },
        {
            label: __('Minimum days between visits', 'webba-booking-lite'),
            value: formatLimit(min_interval_days, noneLabel),
        },
        {
            label: __('Max visits per day', 'webba-booking-lite'),
            value: formatLimit(max_visits_per_day),
        },
        {
            label: __('Max visits per week', 'webba-booking-lite'),
            value: formatLimit(max_visits_per_week),
        },
        {
            label: __('Max visits per month', 'webba-booking-lite'),
            value: formatLimit(max_visits_per_month),
        },
        {
            label: __('Restore visits on customer cancel', 'webba-booking-lite'),
            value:
                cancel_restore_credits === 'yes'
                    ? __('Yes', 'webba-booking-lite')
                    : __('No', 'webba-booking-lite'),
        },
        {
            label: __('Max active packages per customer', 'webba-booking-lite'),
            value: formatLimit(max_active_per_customer),
        },
    ]

    return (
        <div className="wbk_packageProductDetail__grid">
            {fields.map(({ label, value }) => (
                <div key={label} className="wbk_packageProductDetail__gridItem">
                    <span className="wbk_packageProductDetail__label">
                        {label}
                    </span>
                    <strong className="wbk_packageProductDetail__value">
                        {value}
                    </strong>
                </div>
            ))}
        </div>
    )
}
