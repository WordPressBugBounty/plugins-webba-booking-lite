import { CellContext } from '@tanstack/react-table'
import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './Status.scss'
import classNames from 'classnames'
import { dispatch } from '@wordpress/data'
import { store_name } from '../../../../../store/backend'
import metadata from '../../../../../schemas/appointments.json'
import { formatStatusOptions } from './utils'
import { IOption, Status, StatusCellProps } from './types'

type Props = CellContext<any, any> & StatusCellProps

export const StatusCell = ({
    getValue,
    row,
    collectionName = 'appointments',
    options: optionsMap,
}: Props) => {
    const options: IOption[] = useMemo(
        () =>
            formatStatusOptions(
                optionsMap ||
                    metadata.properties.appointment_status.misc.options
            ),
        [optionsMap]
    )
    const value = getValue() as Status
    const [open, setOpen] = useState(false)
    const [current, setCurrent] = useState<IOption | undefined>(() =>
        options.find((o) => o.value === value) ?? options[0]
    )
    const label = useMemo(() => current?.label ?? '', [current])
    const wrapperRef = useRef<HTMLDivElement>(null)
    const [menuStyle, setMenuStyle] = useState<CSSProperties>({})

    const updateMenuPosition = useCallback(() => {
        const wrapper = wrapperRef.current
        if (!wrapper) {
            return
        }

        const rect = wrapper.getBoundingClientRect()
        const menuHeight = 240
        const menuWidth = Math.max(rect.width, 160)
        const spaceBelow = window.innerHeight - rect.bottom
        const openUpward = spaceBelow < menuHeight && rect.top > spaceBelow
        const left = Math.min(
            Math.max(8, rect.left),
            Math.max(8, window.innerWidth - menuWidth - 8)
        )

        setMenuStyle({
            top: openUpward ? 'auto' : rect.bottom + 4,
            bottom: openUpward ? window.innerHeight - rect.top + 4 : 'auto',
            left,
            width: menuWidth,
        })
    }, [])

    const handleClick = useCallback(
        (option: IOption) => {
            // @ts-ignore
            dispatch(store_name).setItem(
                collectionName,
                { ...row.original, status: option.value },
                row.index
            )

            setCurrent(option)
            setOpen(false)
        },
        [collectionName, row.index, row.original]
    )

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
    }, [getValue, options])

    useEffect(() => {
        if (!open) {
            return
        }

        updateMenuPosition()
        window.addEventListener('resize', updateMenuPosition)
        window.addEventListener('scroll', updateMenuPosition, true)

        return () => {
            window.removeEventListener('resize', updateMenuPosition)
            window.removeEventListener('scroll', updateMenuPosition, true)
        }
    }, [open, updateMenuPosition])

    return (
        <div className="wbk_status__statusWrapper" ref={wrapperRef}>
            <div
                className={classNames(
                    'wbk_status__status',
                    current?.value && `wbk_status__status--${current.value}`
                )}
                onClick={() => {
                    if (!open) {
                        updateMenuPosition()
                    }
                    setOpen(!open)
                }}
            >
                <p className="wbk_status__statusText">{label}</p>
            </div>
            <div
                className={classNames('wbk_status__optionsWrapper', {
                    'wbk_status__optionsWrapper--open': open,
                })}
                style={menuStyle}
            >
                {options &&
                    options.map((option) => (
                        <div
                            className={classNames(
                                'wbk_status__optionItem',
                                `wbk_status__optionItem--${option.value}`
                            )}
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
