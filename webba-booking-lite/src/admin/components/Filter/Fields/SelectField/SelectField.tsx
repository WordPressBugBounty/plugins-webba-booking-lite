import { useEffect, useMemo, useState } from 'react'
import './SelectField.scss'
import Select, { components, MultiValueProps } from 'react-select'
import classNames from 'classnames'
import { IOption } from '../../../Form/types'
import { isModelOptions, useOptions } from './utils'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../../../store/backend'
import { useFilterField } from '../../hooks/useFilterField'
import { IFilterFieldProps, TFilterSelectOptions } from '../../types'
import { Label } from '../../../Form/Fields/Label/Label'
import { getAdminSelectStyles } from '../../../../utils/adminSelectStyles'

const MAX_DISPLAYED_OPTIONS = 4

const CustomMultiValue = (props: MultiValueProps<IOption>) => {
    const { index, getValue } = props
    const selectedValues = getValue()

    if (index < MAX_DISPLAYED_OPTIONS) {
        return <components.MultiValue {...props} />
    }

    if (index === MAX_DISPLAYED_OPTIONS) {
        const remaining = selectedValues.length - MAX_DISPLAYED_OPTIONS
        return (
            <div className="wbk_selectField__multiValueMore">+{remaining}</div>
        )
    }

    return null
}

const selectStyles = getAdminSelectStyles({
    valueContainer: (
        base: Record<string, unknown>,
        state: { isMulti?: boolean }
    ) => ({
        ...base,
        flexWrap: 'nowrap',
        overflow: 'hidden',
        ...(state?.isMulti
            ? {}
            : {
                  paddingTop: 0,
                  paddingBottom: 0,
                  height: '100%',
                  alignItems: 'center',
              }),
    }),
    input: (base: Record<string, unknown>) => ({
        ...base,
        margin: 0,
        padding: 0,
    }),
    singleValue: (base: Record<string, unknown>) => ({
        ...base,
        margin: 0,
        lineHeight: 1.2,
    }),
    indicatorsContainer: (base: Record<string, unknown>) => ({
        ...base,
        height: '100%',
        alignItems: 'center',
    }),
    control: (base: Record<string, unknown>) => ({
        ...base,
        backgroundColor: 'var(--wbk-admin-bg-white)',
        borderColor: 'var(--wbk-admin-input-border)',
        minHeight: 'inherit',
        alignItems: 'center',
        boxShadow: 'none',
        '&:hover': {
            borderColor: 'var(--wbk-admin-border-dark)',
        },
    }),
})

export const SelectField = ({
    name,
    label,
    placeholder,
    misc,
}: IFilterFieldProps) => {
    const { value, setFilter, model, field, setInitialValue } =
        useFilterField(name)
    const multiple = misc?.multiple
    const [isInitiated, setIsInitiated] = useState(false)

    const options: IOption[] = useOptions({
        options: field?.options as TFilterSelectOptions,
        nullValue: field.null_value,
    })

    const selectedValues = useMemo(() => {
        if (value == null || value === '') {
            return [] as string[]
        }

        return (Array.isArray(value) ? value : [value])
            .map(String)
            .filter(Boolean)
    }, [value])

    const valueObject = useMemo(() => {
        if (isInitiated || !multiple || selectedValues.length > 0) {
            return options.filter((option: IOption) =>
                selectedValues.includes(String(option.value))
            ) as IOption[]
        }

        if (
            !isInitiated &&
            multiple &&
            model === 'appointments' &&
            name === 'appointment_status'
        ) {
            return options.filter((status) => status.value === 'approved')
        }

        return options as IOption[]
    }, [selectedValues, options, isInitiated, multiple, model, name])

    useEffect(() => {
        if (field?.initialValue) {
            return
        }

        valueObject &&
            setInitialValue(valueObject.map((option) => option.value))
    }, [valueObject])

    const handleChange = (selectedOptions: any) => {
        setIsInitiated(true)

        if (multiple && selectedOptions && selectedOptions[0]?.value) {
            setFilter(selectedOptions.map((option: IOption) => option.value))
        } else if (!multiple && selectedOptions?.value) {
            setFilter(selectedOptions.value as string)
        } else {
            setFilter([])
        }
    }

    const isLoading = useSelect((select) => {
        if (isModelOptions(field.options as any)) {
            // @ts-ignore
            return select(store_name).getModelFieldLoading(field.options)
        } else {
            // @ts-ignore
            return select(store_name).getFieldLoading(model as string, name)
        }
    }, [])

    return (
        <div className={classNames('wbk_selectField')}>
            {label && <Label title={label} id={name} />}
            <div>
                <Select
                    value={multiple ? valueObject : valueObject[0] || null}
                    options={options}
                    onChange={(selectedOptions: IOption[] | unknown) =>
                        handleChange(selectedOptions as IOption[])
                    }
                    classNames={{
                        control: () =>
                            classNames('wbk_selectField__selectInput', {
                                'wbk_selectField__selectInput--preventOverlap':
                                    misc?.preventOverlap,
                            }),
                    }}
                    id={name}
                    isMulti={multiple}
                    isSearchable={Boolean(misc?.searchable)}
                    isDisabled={isLoading}
                    isLoading={isLoading}
                    placeholder={placeholder}
                    hideSelectedOptions={false}
                    components={
                        multiple ? { MultiValue: CustomMultiValue } : undefined
                    }
                    styles={selectStyles}
                />
            </div>
        </div>
    )
}
