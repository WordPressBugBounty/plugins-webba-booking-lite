import { CellContext } from '@tanstack/react-table'
import { useCallback, useEffect, useMemo, useState } from 'react'
import './Status.scss'
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
    const [current, setCurrent] = useState<IOption | undefined>(() =>
        options.find((o) => o.value === value) ?? options[0]
    )
    const label = useMemo(
        () => current?.label ?? '',
        [current, value]
    )
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
            if (open && !target.closest('.wbk_status__statusWrapper')) {
                setOpen(false)
            }
        }

        document.addEventListener('click', handleClickOutside)

        return () => {
            document.removeEventListener('click', handleClickOutside)
        }
    }, [open])

    useEffect(() => {
        const match = options.find((o) => o.value === getValue())
        setCurrent(match ?? options[0])
    }, [getValue])

    return (
        <div
            className={classNames('wbk_status__statusWrapper', {
                'wbk_status__statusWrapper--isLastTwo': isLastTwo,
            })}
        >
            <div
                className={classNames(
                    'wbk_status__status',
                    current?.value && `wbk_status__status--${current.value}`
                )}
                onClick={() => setOpen(!open)}
            >
                <p className="wbk_status__statusText">{label}</p>
            </div>
            <div
                className={classNames('wbk_status__optionsWrapper', {
                    'wbk_status__optionsWrapper--open': open,
                })}
            >
                {options &&
                    options.map((option) => (
                        <div
                            className="wbk_status__optionItem"
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
