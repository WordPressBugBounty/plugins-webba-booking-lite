import { useField } from '../../Form/hooks/useField'
import { IFieldProps } from '../../Form/types'
import './RadioInput.scss'
import '../Fields.scss'
import classNames from 'classnames'

export const RadioInput = ({ fieldConstructor, anyTouched }: IFieldProps) => {
    const {
        placeholder,
        slug,
        value,
        setValue,
        options,
        errors,
        touched,
        setTouched,
        width,
    } = useField(fieldConstructor)

    const showError = errors && errors.length > 0 && (anyTouched || touched)

    return (
        <div
            className={classNames('wbk_input wbk_input__radio', {
                'wbk_input--half-width': width === 'half-width',
                'wbk_input__radio--half-width': width === 'half-width',
            })}
        >
            <div className={'wbk_input__radio__inner-wrapper'}>
                <label htmlFor={slug} className={'wbk_input__label'}>
                    {placeholder}
                </label>
                <div className={'wbk_input__radio__buttons'}>
                    {options?.map((option: string, index) => (
                        <label
                            htmlFor={slug + index}
                            key={index}
                            className={'wbk_input__radio__item-wrapper'}
                        >
                            <input
                                id={slug + index}
                                type="radio"
                                name={slug}
                                value={option}
                                checked={option === value}
                                onChange={() => {
                                    setValue(option)
                                    setTouched(true)
                                }}
                            />
                            <span>{option}</span>
                        </label>
                    ))}
                </div>
            </div>
            {showError && <div className={'wbk_input__error'}>{errors[0]}</div>}
        </div>
    )
}
