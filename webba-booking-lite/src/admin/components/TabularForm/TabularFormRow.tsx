import { useEffect, useRef } from 'react'
import { useSnapshot } from 'valtio'
import { capitalize } from '../../utils/capitalize'
import { ITabularFormRowProps } from './types'
import './TabularForm.scss'

export const TabularFormRow = ({ field, formField }: ITabularFormRowProps) => {
    const inputRef = useRef<HTMLTextAreaElement | null>(null)
    const cursorPositionRef = useRef<number | null>(null)
    const valueSnap = useSnapshot(formField.value)

    const displayValue =
        valueSnap.value != null ? String(valueSnap.value) : ''

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const input = e.target
        cursorPositionRef.current = input.selectionStart ?? null
        formField.setValue(e.target.value)
    }

    useEffect(() => {
        if (cursorPositionRef.current !== null && inputRef.current) {
            const input = inputRef.current
            const position = cursorPositionRef.current
            input.setSelectionRange(position, position)
            cursorPositionRef.current = null
        }
    }, [displayValue])

    return (
        <div className="wbk_tabularForm__row">
            <label
                className="wbk_tabularForm__label"
                htmlFor={`tabular-${field.name}`}
            >
                {field.label ?? capitalize(field.name)}
            </label>
            <div className="wbk_tabularForm__inputWrapper">
                <textarea
                    ref={inputRef}
                    id={`tabular-${field.name}`}
                    className="wbk_tabularForm__input"
                    value={displayValue}
                    onChange={handleChange}
                />
            </div>
        </div>
    )
}

