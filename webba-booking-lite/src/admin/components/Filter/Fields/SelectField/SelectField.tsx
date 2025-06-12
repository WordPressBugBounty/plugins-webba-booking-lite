import { useEffect, useMemo, useState } from 'react'
import styles from './SelectField.module.scss'
import Select, { components, MultiValueProps } from 'react-select'
import classNames from 'classnames'
import { IOption } from '../../../Form/types'
import { isModelOptions, useOptions } from './utils'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../../../store/backend'
import { useFilterField } from '../../hooks/useFilterField'
import { IFilterFieldProps, TFilterSelectOptions } from '../../types'
import { Label } from '../../../Form/Fields/Label/Label'

const MAX_DISPLAYED_OPTIONS = 4

const CustomMultiValue = (props: MultiValueProps<IOption>) => {
    const { index, getValue } = props
    const selectedValues = getValue()

    if (index < MAX_DISPLAYED_OPTIONS) {
        return <components.MultiValue {...props} />
    }

    if (index === MAX_DISPLAYED_OPTIONS) {
        const remaining = selectedValues.length - MAX_DISPLAYED_OPTIONS
        return <div className={styles.multiValueMore}>+{remaining}</div>
    }

    return null
}

const customStyles = {
    valueContainer: (base: any) => ({
        ...base,
        flexWrap: 'nowrap',
        overflow: 'hidden',
    }),
    multiValue: (base: any) => ({
        ...base,
        maxWidth: '100px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    }),
}

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

    const valueObject = useMemo(() => {
        if (isInitiated || !multiple) {
            return options.filter((option: IOption) => {
                if (multiple && value) {
                    return value.includes(option.value)
                } else if (!multiple && value) {
                    return value.toString() === option.value
                }
            }) as IOption[]
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
    }, [value, options])

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
        } else if (!multiple && selectedOptions.value) {
            setFilter(selectedOptions?.value as string)
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
        <div className={classNames(styles.selectField)}>
            {label && <Label title={label} id={name} />}
            <div>
                <Select
                    value={valueObject}
                    options={options}
                    onChange={(selectedOptions: IOption[] | unknown) =>
                        handleChange(selectedOptions as IOption[])
                    }
                    classNames={{
                        control: (state) =>
                            classNames(styles.selectInput, {
                                [styles.preventOverlap]: misc?.preventOverlap,
                            }),
                    }}
                    id={name}
                    isMulti={multiple}
                    isSearchable={false}
                    isDisabled={isLoading}
                    isLoading={isLoading}
                    placeholder={placeholder}
                    hideSelectedOptions={false}
                    components={
                        multiple ? { MultiValue: CustomMultiValue } : undefined
                    }
                    styles={multiple ? customStyles : undefined}
                />
            </div>
        </div>
    )
}
