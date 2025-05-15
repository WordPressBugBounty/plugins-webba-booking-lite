import { CellContext } from '@tanstack/react-table'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styles from './Status.module.scss'
import classNames from 'classnames'
import { __ } from '@wordpress/i18n'
import { dispatch } from '@wordpress/data'
import { store_name } from '../../../../../store/backend'
import metadata from '../../../../../schemas/appointments.json'
import { formatStatusOptions } from './utils'
import { IOption, Status } from './types'

export const StatusCell = ({ getValue, row, table }: CellContext<any, any>) => {
    const options: IOption[] = formatStatusOptions(
        metadata.properties.appointment_status.misc.options
    )
    const value = getValue() as Status
    const [open, setOpen] = useState(false)
    const [current, setCurrent] = useState(
        options.filter((o) => o.value === value)[0]
    )
    const { label } = useMemo(() => current, [current, value])
    const totalRows = table.getRowModel().rows.length
    const isLastTwo = row.index >= totalRows - 2

    const handleClick = useCallback((option: IOption) => {
        // @ts-ignore
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

    useEffect(()=> {
        setCurrent(options.filter((o) => o.value === getValue())[0])
    }, [getValue])

    return (
        <div
            className={classNames(styles.statusWrapper, {
                [styles.isLastTwo]: isLastTwo,
            })}
        >
            <div
                className={classNames(styles.status, styles[current.value])}
                onClick={() => setOpen(!open)}
            >
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
