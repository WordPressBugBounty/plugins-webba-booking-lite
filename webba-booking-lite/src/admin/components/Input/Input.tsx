import classNames from 'classnames'
import { InputHTMLAttributes, useState } from 'react'
import './Input.scss'
import { Label } from '../Label/Label'

type VanillaProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'>

export interface InputProps extends VanillaProps {
    label?: string
    errors?: string[] | readonly string[]
    tooltip?: string
    onChange: (value: string) => void
}

export const Input = ({
    errors = [],
    label,
    id,
    onChange,
    ...otherProps
}: InputProps) => {
    const [touched, setTouched] = useState(false)
    const isValid = !errors.length
    const [firstError] = errors
    const showErrors = !isValid && touched && firstError

    return (
        <div
            className={classNames('wbk_input', {
                'wbk_input--invalid': showErrors,
            })}
        >
            {label && (
                <div className="wbk_input__inputContainer">
                    <Label for={id}>{label}</Label>
                </div>
            )}
            <div className="wbk_input__inputContainer">
                <input
                    {...otherProps}
                    id={id}
                    className="wbk_input__input"
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={() => setTouched(true)}
                />
            </div>
            {showErrors && firstError && (
                <div className="wbk_input__errorContainer">{firstError}</div>
            )}
        </div>
    )
}
