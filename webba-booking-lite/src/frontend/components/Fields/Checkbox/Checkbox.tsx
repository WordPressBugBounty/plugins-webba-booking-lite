import classNames from 'classnames'
import { useField } from '../../Form/hooks/useField'
import { IFieldProps } from '../../Form/types'
import './Checkbox.scss'

export const Checkbox = ({ fieldConstructor, anyTouched }: IFieldProps) => {
    const {
        slug,
        checkboxText,
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
            <label className={'wbk_input_checkbox__label'}>
                <input
                    name={slug}
                    type="checkbox"
                    checked={value === 'yes'}
                    onChange={(e) => {
                        setValue(e.target.checked ? 'yes' : '')
                        setTouched(true)
                    }}
                    className={classNames({
                        'wbk_input__main--error': showError,
                    })}
                />
                <span
                    dangerouslySetInnerHTML={{ __html: String(checkboxText) }}
                />
            </label>
            {showError && <div className={'wbk_input__error'}>{errors[0]}</div>}
        </div>
    )
}
