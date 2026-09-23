import classNames from 'classnames'
import { useField } from '../../Form/hooks/useField'
import { IFieldProps, IOption } from '../../Form/types'
import '../Fields.scss'
import './SelectInput.scss'
import Select from 'react-select'

const normalizeOption = (option: string | IOption): IOption => {
    if (typeof option === 'string') {
        return { value: option, label: option }
    }
    return option
}

export const SelectInput = ({ fieldConstructor, anyTouched }: IFieldProps) => {
    const {
        slug,
        placeholder,
        options,
        value,
        errors,
        setValue,
        touched,
        setTouched,
        width,
        multiple,
    } = useField(fieldConstructor)

    const showError = errors && errors.length > 0 && (anyTouched || touched)
    const selectOptions = (options || []).map(normalizeOption)
    const isMulti = Boolean(multiple)

    return (
        <div
            className={classNames('wbk_input wbk_input__select', {
                'wbk_input--half-width': width === 'half-width',
                'wbk_input__select--error': showError,
            })}
        >
            <Select
                options={selectOptions}
                value={value as IOption | IOption[] | null}
                onChange={(selectedOptions) => {
                    if (isMulti) {
                        setValue((selectedOptions as IOption[]) || [])
                        return
                    }
                    setValue((selectedOptions as IOption) || null)
                }}
                placeholder={placeholder}
                name={slug}
                onBlur={() => setTouched(true)}
                className="wbk_input__select"
                classNamePrefix="wbk_input__select"
                isMulti={isMulti}
                closeMenuOnSelect={!isMulti}
                unstyled
            />
            {showError && <div className={'wbk_input__error'}>{errors[0]}</div>}
        </div>
    )
}
