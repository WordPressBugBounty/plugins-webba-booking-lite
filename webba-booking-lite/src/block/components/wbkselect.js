import Select from 'react-select'
import { __ } from '@wordpress/i18n'

export default function WbkSelect({ options, label }) {
    options = [{ value: 0, label: __('Select') }, ...options]

    return (
        <>
            <label className="input-label-wbk wbk_category_label">
                {label}
            </label>
            <Select
                className="basic-single"
                classNamePrefix="select"
                defaultValue={options[0]}
                isDisabled={false}
                isLoading={false}
                isClearable={false}
                isRtl={false}
                isSearchable={false}
                name="services"
                options={options}
                styles={{
                    control: (baseStyles, state) => ({
                        ...baseStyles,
                        borderColor: '#cdcfde',
                        borderRadius: '15px',
                        height: '50px',
                        outline: 'none',
                        boxShadow: 'none',
                        margin: '0 0 20px 0',
                    }),
                }}
            />
        </>
    )
}
