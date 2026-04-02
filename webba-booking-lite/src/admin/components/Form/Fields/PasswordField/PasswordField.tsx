import { useState } from 'react'
import { useField } from '../../lib/hooks/useField'
import { FormComponentConstructor } from '../../lib/types'
import { ValidatorFn, Validators } from '../../utils/validation'
import { Label } from '../Label/Label'
import './PasswordField.scss'
import { FormFieldProps } from '../../types'
import eyeIcon from '../../../../../../public/images/icon-eye.svg'
import eyeOffIcon from '../../../../../../public/images/icon-eye-off.svg'

export const createPasswordField: FormComponentConstructor<string> = ({
    field,
    fieldConfig,
}) => {
    field.setValidators([
        Validators.textCharCountBetween(
            fieldConfig.misc?.min,
            fieldConfig.misc?.max
        ),
    ])

    return ({ name, label, misc }: FormFieldProps) => {
        const { value, setValue, errors } = useField(field)
        const [showPassword, setShowPassword] = useState(false)
        const [touched, setTouched] = useState(false)
        const isValid = !errors.length
        const showErrors = !isValid && touched
        const [firstError] = errors

        const togglePasswordVisibility = () => {
            setShowPassword((prev) => !prev)
        }

        return (
            <div
                className={`wbk_passwordField__field ${showErrors ? 'wbk_passwordField__field--invalid' : ''}`}
            >
                <Label
                    title={label}
                    id={name}
                    tooltip={misc?.tooltip}
                />
                <div className="wbk_passwordField__inputWrapper">
                    <input
                        id={name}
                        className="wbk_passwordField__input"
                        type={showPassword ? 'text' : 'password'}
                        value={value || ''}
                        onChange={(e) => setValue(e.target.value)}
                        onBlur={() => setTouched(true)}
                        disabled={misc?.disabled}
                    />
                    <button
                        type="button"
                        className="wbk_passwordField__eyeButton"
                        onClick={togglePasswordVisibility}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        <img
                            src={showPassword ? eyeOffIcon : eyeIcon}
                            alt={showPassword ? 'Hide' : 'Show'}
                            className="wbk_passwordField__eyeIcon"
                        />
                    </button>
                </div>
                {showErrors && firstError && (
                    <div className="wbk_passwordField__errorContainer">{firstError}</div>
                )}
            </div>
        )
    }
}
