import classNames from 'classnames'
import { useField } from '../../Form/hooks/useField'
import { IFieldProps } from '../../Form/types'
import { Validators } from '../../Form/validation'

export const EmailInput = ({ fieldConstructor, anyTouched }: IFieldProps) => {
    fieldConstructor.addValidators([Validators.email])
    const {
        slug,
        placeholder,
        value,
        errors,
        setValue,
        touched,
        setTouched,
        width,
    } = useField(fieldConstructor)

    const showError = errors && errors.length > 0 && (anyTouched || touched)

    return (
        <div
            className={classNames('wbk_input', {
                'wbk_input--half-width': width === 'half-width',
            })}
        >
            <input
                name={slug}
                type="email"
                placeholder={placeholder}
                value={value as string}
                onChange={(e) => setValue(e.target.value)}
                className={classNames('wbk_input__main', {
                    'wbk_input__main--error': showError,
                })}
                onBlur={() => setTouched(true)}
            />
            {showError && <div className={'wbk_input__error'}>{errors[0]}</div>}
        </div>
    )
}
