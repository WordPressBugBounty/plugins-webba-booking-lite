import classNames from 'classnames'
import { useField } from '../../Form/hooks/useField'
import { IFieldProps } from '../../Form/types'

export const TextInput = ({ fieldConstructor, anyTouched }: IFieldProps) => {
    const {
        slug,
        placeholder,
        value,
        errors,
        setValue,
        width,
        touched,
        setTouched,
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
                type="text"
                placeholder={placeholder}
                onChange={(e) => setValue(e.target.value)}
                value={value as string}
                className={classNames('wbk_input__main', {
                    'wbk_input__main--error': showError,
                })}
                onBlur={() => setTouched(true)}
            />
            {showError && <div className={'wbk_input__error'}>{errors[0]}</div>}
        </div>
    )
}
