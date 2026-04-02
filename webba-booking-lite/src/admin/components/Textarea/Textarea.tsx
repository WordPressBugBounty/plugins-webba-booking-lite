import { useState } from 'react'
import { Label } from '../Label/Label'
import './Textarea.scss'

export interface TextareaProps {
    value: string
    label?: string
    name: string
    tooltip?: string
    onChange: (value: string) => void
    errors?: string[]
    placeholder?: string
}

export const Textarea = ({
    value,
    onChange,
    label,
    name,
    tooltip,
    errors = [],
    placeholder = '',
}: TextareaProps) => {
    const [touched, setTouched] = useState(false)

    return (
        <div className="wbk_textarea">
            <Label for={name} tooltip={tooltip}>
                {label}
            </Label>
            <textarea
                className="wbk_textarea__textarea"
                value={value}
                onChange={(e) => {
                    onChange(e.target.value)
                }}
                onBlur={() => setTouched(true)}
                placeholder={placeholder}
            ></textarea>
            {touched && !!errors.length && (
                <p className="wbk_textarea__error">{errors[0]}</p>
            )}
        </div>
    )
}
