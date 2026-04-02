import classNames from 'classnames'
import { useField } from '../../Form/hooks/useField'
import { IFieldProps } from '../../Form/types'
import styles from './TextArea.module.scss'
import fieldStyles from '../Fields.module.scss'

export const TextArea = ({ fieldConstructor, anyTouched }: IFieldProps) => {
    const {
        slug,
        placeholder,
        value,
        errors,
        setValue,
        touched,
        setTouched,
        width,
        defaultValue,
    } = useField(fieldConstructor)
    const showError = errors && errors.length > 0 && (anyTouched || touched)
    return (
        <div
            className={classNames('wbk_input wbk_input__textarea', {
                'wbk_input--half-width': width === 'half-width',
            })}
        >
            <textarea
                placeholder={placeholder}
                name={slug}
                onChange={(e) => setValue(e.target.value)}
                className={classNames(
                    'wbk_input__main wbk_input__textarea__input',
                    {
                        'wbk_input__main--error': showError,
                    }
                )}
                onBlur={() => setTouched(true)}
            >
                {(value as string) || (defaultValue as string)}
            </textarea>
            {showError && <div className={'wbk_input__error'}>{errors[0]}</div>}
        </div>
    )
}
