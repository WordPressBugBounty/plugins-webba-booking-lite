import { IWebba5SelectProps } from './types'

export const Webba5Select = ({
    label,
    placeholder,
    options,
    value,
    onChange,
}: IWebba5SelectProps) => {
    return (
        <label className="wbk_webba5_form__field">
            <span className="wbk_webba5_form__field-label">{label}</span>
            <span className="wbk_webba5_form__field-control">
                <select
                    className="wbk_webba5_form__select"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                >
                    {placeholder && (
                        <option value="" disabled={value !== ''}>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.id} value={option.id}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <span className="wbk_webba5_form__field-chevron" aria-hidden="true" />
            </span>
        </label>
    )
}
