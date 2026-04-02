import {
    useEffect,
    useLayoutEffect,
    useMemo,
    useState,
    useRef,
    useCallback,
} from 'react'
import './GenericSelectField.scss'
import Select, { components, MultiValueProps } from 'react-select'
import classNames from 'classnames'
import { Label } from '../Label/Label'
import {
    FormFieldMisc,
    FormFieldProps,
    IEnableCondition,
    IOption,
} from '../../types'
import { FormComponentConstructor } from '../../lib/types'
import { useField } from '../../lib/hooks/useField'
import {
    fetchConnectedOptions,
    getSourceField,
    isConnectedField,
    isDependentField,
    isFieldBelongsSource,
    isModelOptions,
    useOptions,
} from './utils'
import { useForm } from '../../lib/FormProvider'
import { string } from 'zod'
import { getFormState } from '../../lib/utils'
import { checkForConditionalDisable } from '../../utils/utils'
import { useEnableLogic } from '../../lib/hooks/useEnableLogic'
import { useDispatch, useSelect } from '@wordpress/data'
import { store, store_name } from '../../../../../store/backend'
import { FieldDescription } from '../FieldDescription/FieldDescription'

const MAX_DISPLAYED_OPTIONS = 4

const CustomMultiValue = (props: MultiValueProps<IOption>) => {
    const { index, getValue } = props
    const selectedValues = getValue()

    if (index < MAX_DISPLAYED_OPTIONS) {
        return <components.MultiValue {...props} />
    }

    if (index === MAX_DISPLAYED_OPTIONS) {
        const remaining = selectedValues.length - MAX_DISPLAYED_OPTIONS
        return <div className="wbk_genericSelectField__multiValueMore">+{remaining}</div>
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

// Hook to calculate max menu height and placement based on viewport
const useMenuPosition = (selectRef: React.RefObject<any>) => {
    const [maxHeight, setMaxHeight] = useState(300) // Default height
    const [placement, setPlacement] = useState<'top' | 'bottom' | 'auto'>(
        'auto'
    )

    const calculatePosition = useCallback(() => {
        if (!selectRef.current) return

        const selectElement = selectRef.current.controlRef
        if (!selectElement) return

        const rect = selectElement.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const spaceBelow = viewportHeight - rect.bottom
        const spaceAbove = rect.top

        // Reserve some space for padding/margins (e.g., 20px)
        const buffer = 20

        // Determine placement based on available space
        // If there's more space above and less than 200px below, place at top
        const minRequiredSpace = 200
        if (spaceBelow < minRequiredSpace && spaceAbove > spaceBelow) {
            setPlacement('top')
        } else {
            setPlacement('bottom')
        }

        // Use the larger space available (above or below)
        const availableSpace = Math.max(spaceBelow, spaceAbove) - buffer

        // Set a reasonable max (between 150px and available space)
        const calculatedHeight = Math.max(150, Math.min(availableSpace, 400))

        setMaxHeight(calculatedHeight)
    }, [selectRef])

    useEffect(() => {
        calculatePosition()

        // Recalculate on window resize or scroll
        window.addEventListener('resize', calculatePosition)
        window.addEventListener('scroll', calculatePosition, true)

        return () => {
            window.removeEventListener('resize', calculatePosition)
            window.removeEventListener('scroll', calculatePosition, true)
        }
    }, [calculatePosition])

    return { maxHeight, placement, recalculate: calculatePosition }
}

export const createGenericSelectField: FormComponentConstructor<any> = ({
    field,
    fieldConfig,
}) => {
    return ({ name, label, misc }: FormFieldProps) => {
        const { value, setValue, errors } = useField(field)
        const [touched, setTouched] = useState(false)
        const isValid = !errors?.length
        const showErrors = !isValid && touched
        const [firstError] = errors ?? []
        const multiple = misc?.multiple || false
        const form = useForm()
        const { setSourcedOptions } = useDispatch(store)
        const selectRef = useRef<any>(null)
        const {
            maxHeight: maxMenuHeight,
            placement: menuPlacement,
            recalculate: recalculatePosition,
        } = useMenuPosition(selectRef)
        const [isFocused, setIsFocused] = useState(false)
        const options: IOption[] = useOptions({
            options:
                ((fieldConfig.misc as FormFieldMisc).options as Record<
                    string,
                    string
                >) || string,
            model: fieldConfig?.modelName as string,
            field: name,
            formData: { ...form.defaultValue, ...getFormState(form).values },
            nullValue: fieldConfig.misc?.null_value,
            misc: fieldConfig?.misc as FormFieldMisc,
        })

        // enable dependency
        const isEnabled = useEnableLogic(
            (misc?.enable as IEnableCondition) || {}
        )
        // enable dependency end

        const fieldNames = Object.keys(form.fields)
        const isLastField = fieldNames[fieldNames.length - 1] === name
        const hasSingleOption = options.length === 1

        const valueObject = useMemo(
            () =>
                options.filter((option: IOption) => {
                    let parsedValue = value

                    try {
                        parsedValue = JSON.parse(value)
                    } catch (e) {}

                    if (multiple && parsedValue && Array.isArray(parsedValue)) {
                        return parsedValue.includes(option.value)
                    }

                    return parsedValue == option.value
                }) as IOption[],
            [value, options]
        )

        const handleChange = (selectedOptions: any) => {
            if (multiple && selectedOptions && selectedOptions[0]?.value) {
                setValue(selectedOptions.map((option: IOption) => option.value))
            } else if (!multiple && selectedOptions.value) {
                setValue(selectedOptions?.value as string)
            } else {
                setValue([])
            }

            if (isConnectedField(fieldConfig?.modelName as string, name)) {
                fetchConnectedOptions(fieldConfig?.modelName as string, name, {
                    ...getFormState(form).values,
                    id: form.defaultValue?.id,
                })
            }
        }

        const isLoading = useSelect((select) => {
            if (
                isModelOptions(
                    (fieldConfig.misc as FormFieldMisc).options as any
                )
            ) {
                // @ts-ignore
                return select(store_name).getModelFieldLoading(
                    (fieldConfig.misc as FormFieldMisc).options
                )
            } else {
                // @ts-ignore
                return select(store_name).getFieldLoading(
                    fieldConfig?.modelName as string,
                    name
                )
            }
        }, [])

        useLayoutEffect(() => {
            if (
                isConnectedField(fieldConfig?.modelName as string, name) &&
                !isDependentField(fieldConfig?.modelName as string, name) &&
                form.defaultValue.id &&
                form.defaultValue[name]
            ) {
                fetchConnectedOptions(fieldConfig?.modelName as string, name, {
                    ...getFormState(form).values,
                    id: form.defaultValue.id,
                })
            }
        }, [options, form.fields[name].value])

        // update sourced options if there is any connection
        useLayoutEffect(() => {
            if (isFieldBelongsSource(fieldConfig?.modelName as string, name)) {
                const sourceField = getSourceField(
                    fieldConfig?.modelName as string,
                    name
                )

                setSourcedOptions(fieldConfig?.modelName, sourceField, value)
            }
        }, [options, value])

        const [conditionallyDisabled, setConditionallyDisabled] =
            useState(false)
        const [hasEvaluated, setHasEvaluated] = useState(false)

        useEffect(() => {
            if (!misc?.disable_condition || !form.defaultValue) return

            setHasEvaluated(false)
            setConditionallyDisabled(false)
        }, [form.defaultValue])

        useEffect(() => {
            if (hasEvaluated || !misc?.disable_condition || !form.defaultValue)
                return

            const result = checkForConditionalDisable(
                form,
                misc.disable_condition
            )
            setConditionallyDisabled(result)
            setHasEvaluated(true)
        }, [form.defaultValue, misc?.disable_condition, hasEvaluated])

        // Dynamic styles with calculated max height
        const dynamicStyles = useMemo(
            () => ({
                ...customStyles,
                menu: (base: any) => ({
                    ...base,
                    maxHeight: `${maxMenuHeight}px`,
                }),
                menuList: (base: any) => ({
                    ...base,
                    maxHeight: `${maxMenuHeight}px`,
                }),
            }),
            [maxMenuHeight]
        )

        return (
            <div
                className={classNames('wbk_genericSelectField', {
                    'wbk_genericSelectField--invalid': showErrors,
                })}
            >
                <Label id={name} title={label} tooltip={misc?.tooltip} />
                <div>
                    <Select
                        ref={selectRef}
                        value={valueObject}
                        options={options}
                        onChange={(selectedOptions: IOption[] | unknown) =>
                            handleChange(selectedOptions as IOption[])
                        }
                        classNames={{
                            control: () => classNames('wbk_genericSelectField__selectInput', {
                                'wbk_genericSelectField__selectInput--focused': isFocused,
                            }),
                        }}
                        id={name}
                        isMulti={multiple}
                        onBlur={() => {
                            setTouched(true)
                            setIsFocused(false)
                        }}
                        onFocus={() => {
                            recalculatePosition()
                            setIsFocused(true)
                        }}
                        onMenuOpen={recalculatePosition}
                        isSearchable={multiple || misc?.searchable || false}
                        isDisabled={
                            isLoading || conditionallyDisabled || !isEnabled
                        }
                        isLoading={isLoading}
                        hideSelectedOptions={false}
                        components={
                            multiple
                                ? { MultiValue: CustomMultiValue }
                                : undefined
                        }
                        styles={
                            multiple
                                ? dynamicStyles
                                : {
                                      menu: (base: any) => ({
                                          ...base,
                                          maxHeight: `${maxMenuHeight}px`,
                                      }),
                                      menuList: (base: any) => ({
                                          ...base,
                                          maxHeight: `${maxMenuHeight}px`,
                                      }),
                                  }
                        }
                        menuPlacement={
                            isLastField && hasSingleOption
                                ? 'top'
                                : menuPlacement
                        }
                        isOptionDisabled={(option: IOption) => {
                            if (option.isDisabled === true) return true
                            if (!misc?.disabled_options) return false
                            return misc?.disabled_options.includes(option.value)
                        }}
                        maxMenuHeight={maxMenuHeight}
                    />
                    {misc?.description && (
                        <FieldDescription description={misc.description} />
                    )}
                    {showErrors && firstError && (
                        <div className="wbk_genericSelectField__errorContainer">
                            {firstError}
                        </div>
                    )}
                </div>
            </div>
        )
    }
}
