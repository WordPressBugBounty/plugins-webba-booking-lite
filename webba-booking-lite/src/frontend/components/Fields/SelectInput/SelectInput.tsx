import classNames from 'classnames'
import { useField } from '../../Form/hooks/useField'
import { IFieldProps, IOption } from '../../Form/types'
import './SelectInput.scss'
import Select from 'react-select'

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
    } = useField(fieldConstructor)

    const showError = errors && errors.length > 0 && (anyTouched || touched)

    return (
        <div
            className={classNames('wbk_input wbk_input__select', {
                'wbk_input--half-width': width === 'half-width',
            })}
        >
            <Select
                options={options?.map((option) => {
                    return {
                        value: option,
                        label: option,
                    }
                })}
                value={value}
                onChange={(selectedOptions: IOption[] | unknown) =>
                    setValue(selectedOptions as IOption[])
                }
                placeholder={placeholder}
                name={slug}
                onBlur={() => setTouched(true)}
                classNames={{
                    control: () => 'wbk_input__main wbk_input__select__input',
                    option: () => 'wbk_input__select__option',
                }}
            />
            {showError && <div className={'wbk_input__error'}>{errors[0]}</div>}
        </div>
    )
}
