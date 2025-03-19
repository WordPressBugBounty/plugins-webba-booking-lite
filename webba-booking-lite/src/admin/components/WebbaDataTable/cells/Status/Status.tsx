import { CellContext } from '@tanstack/react-table'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styles from './Status.module.scss'
import classNames from 'classnames'
import { __ } from '@wordpress/i18n'
import pendingIcon from '../../../../../../public/images/status-pending-icon.png'
import approvedIcon from '../../../../../../public/images/status-approved-icon.png'
import rejectedIcon from '../../../../../../public/images/status-rejected-icon.png'
import cancelledIcon from '../../../../../../public/images/status-canceled-icon.png'
import { dispatch } from '@wordpress/data'
import { store_name } from '../../../../../store/backend'

type Status =
    | 'pending'
    | 'cancelled'
    | 'paid'
    | 'approved'
    | 'paid_approved'
    | 'arrived'
    | 'woocommerce'
    | 'added_by_admin_not_paid'
    | 'added_by_admin_paid'

interface IOption {
    value: Status
    label: string
    icon: string
}

const options: IOption[] = [
    {
        value: 'pending',
        label: __('Awaiting approval', 'webba-booking-lite'),
        icon: pendingIcon,
    },
    {
        value: 'approved',
        label: __('Approved', 'webba-booking-lite'),
        icon: approvedIcon,
    },
    {
        value: 'paid',
        label: __('Paid (awaiting approval)', 'webba-booking-lite'),
        icon: pendingIcon,
    },
    {
        value: 'paid_approved',
        label: __('Paid (approved)', 'webba-booking-lite'),
        icon: approvedIcon,
    },
    {
        value: 'arrived',
        label: __('Arrived', 'webba-booking-lite'),
        icon: approvedIcon,
    },
    {
        value: 'woocommerce',
        label: __('Managed by WooCommerce', 'webba-booking-lite'),
        icon: pendingIcon,
    },
    {
        value: 'added_by_admin_not_paid',
        label: __(
            'Added by the administrator (not paid)',
            'webba-booking-lite'
        ),
        icon: pendingIcon,
    },
    {
        value: 'added_by_admin_paid',
        label: __('Added by the administrator (paid)', 'webba-booking-lite'),
        icon: approvedIcon,
    },
]

export const StatusCell = ({ getValue, row }: CellContext<any, any>) => {
    const value = getValue() as Status
    const [open, setOpen] = useState(false)
    const [current, setCurrent] = useState(
        options.filter((o) => o.value === value)[0]
    )
    const { icon, label } = useMemo(() => current, [current])

    const handleClick = useCallback((option: IOption) => {
        dispatch(store_name).setItem(
            'appointments',
            { ...row.original, status: option.value },
            row.index
        )

        setCurrent(option)
        setOpen(false)
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element
            if (open && !target.closest(`.${styles.statusWrapper}`)) {
                setOpen(false)
            }
        }

        document.addEventListener('click', handleClickOutside)

        return () => {
            document.removeEventListener('click', handleClickOutside)
        }
    }, [open])

    return (
        <div className={styles.statusWrapper}>
            <div
                className={classNames(styles.status, styles[current.value])}
                onClick={() => setOpen(!open)}
            >
                <img src={icon} alt="Status icon" />
                <p className={styles.statusText}>{label}</p>
            </div>
            <div
                className={classNames(styles.optionsWrapper, {
                    [styles.open]: open,
                })}
            >
                {options &&
                    options.map((option) => (
                        <div
                            className={styles.optionItem}
                            key={option.value}
                            onClick={() => handleClick(option)}
                        >
                            {option.label}
                        </div>
                    ))}
            </div>
        </div>
    )
}
