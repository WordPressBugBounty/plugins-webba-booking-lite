import {
    useEffect,
    useLayoutEffect,
    useMemo,
    useState,
    useRef,
    useCallback,
} from 'react'
import './SelectCustomField.scss'
import Select from 'react-select'
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
} from '../GenericSelectField/utils'
import { useForm } from '../../lib/FormProvider'
import { getFormState } from '../../lib/utils'
import { checkForConditionalDisable } from '../../utils/utils'
import { useEnableLogic } from '../../lib/hooks/useEnableLogic'
import { useDispatch, useSelect } from '@wordpress/data'
import { store, store_name } from '../../../../../store/backend'
import { FieldDescription } from '../FieldDescription/FieldDescription'
import { __ } from '@wordpress/i18n'

const CUSTOM_OPTION_VALUE = 'custom'

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

export const createSelectCustomField: FormComponentConstructor<any> = ({
    field,
    fieldConfig,
}) => {
    return ({ name, label, misc }: FormFieldProps) => {
        const { value, setValue, errors } = useField(field)
        const [touched, setTouched] = useState(false)
        const isValid = !errors?.length
        const showErrors = !isValid && touched
        const [firstError] = errors ?? []
        const form = useForm()
        const { setSourcedOptions } = useDispatch(store)
        const selectRef = useRef<any>(null)
        const customInputRef = useRef<HTMLInputElement>(null)
        const cursorPositionRef = useRef<number | null>(null)
        const {
            maxHeight: maxMenuHeight,
            placement: menuPlacement,
            recalculate: recalculatePosition,
        } = useMenuPosition(selectRef)

        const baseOptions: IOption[] = useOptions({
            options:
                ((fieldConfig.misc as FormFieldMisc).options as Record<
                    string,
                    string
                >) || {},
            model: fieldConfig?.modelName as string,
            field: name,
            formData: { ...form.defaultValue, ...getFormState(form).values },
            nullValue: fieldConfig.misc?.null_value,
        })

        // Add 'custom' option to the list
        // Ensure 'custom' is always included and not duplicated
        const options: IOption[] = useMemo(() => {
            // Filter out any existing 'custom' option from baseOptions to avoid duplicates
            const filteredBaseOptions = baseOptions.filter(
                (opt) => opt.value !== CUSTOM_OPTION_VALUE
            )
            const customOption: IOption = {
                value: CUSTOM_OPTION_VALUE,
                label: __('Custom', 'webba-booking-lite'),
            }
            return [...filteredBaseOptions, customOption]
        }, [baseOptions])

        // Check if current value is in preset options
        const isCustomValue = useMemo(() => {
            if (!value) return false
            const valueStr = String(value)
            return !baseOptions.some((option) => option.value === valueStr)
        }, [value, baseOptions])

        // Track if user explicitly selected 'Custom' from dropdown
        // Initialize based on whether initial value is custom
        const [isCustomMode, setIsCustomMode] = useState(() => {
            if (!value) return false
            const valueStr = String(value)
            return !baseOptions.some((option) => option.value === valueStr)
        })

        // Track user's explicit selection to prevent useEffect from interfering
        const userSelectedCustomRef = useRef(false)
        const userSelectedPresetRef = useRef(false)
        // Track if custom input is focused/being edited
        const isCustomInputFocusedRef = useRef(false)
        // Track the previous value to detect external changes
        const previousValueRef = useRef(value)

        // Update isCustomMode when value changes externally (e.g., from form reset)
        // But don't override if user explicitly selected 'Custom' or is editing
        useEffect(() => {
            // If user just selected 'Custom', don't interfere - stay in custom mode
            if (userSelectedCustomRef.current) {
                userSelectedCustomRef.current = false
                previousValueRef.current = value
                return
            }

            // If user just selected a preset option, don't interfere
            if (userSelectedPresetRef.current) {
                userSelectedPresetRef.current = false
                previousValueRef.current = value
                return
            }

            // If user is currently editing the custom input, don't interfere
            if (isCustomInputFocusedRef.current) {
                previousValueRef.current = value
                return
            }

            // Only update isCustomMode if value was set externally (e.g., form reset)
            // We only exit custom mode if:
            // 1. Value changed from a custom value (not in preset) to a preset value
            // 2. This indicates an external change, not user interaction
            if (value && previousValueRef.current !== value && isCustomMode) {
                const valueStr = String(value)
                const previousValueStr = String(previousValueRef.current || '')
                const matchingPresetOption = baseOptions.find(
                    (option) => option.value === valueStr
                )
                const previousWasCustom = previousValueStr && 
                    !baseOptions.some((option) => option.value === previousValueStr)
                
                // Only exit custom mode if value changed from custom to preset (external change)
                if (matchingPresetOption && previousWasCustom) {
                    setIsCustomMode(false)
                }
                // If value is still a preset but we're in custom mode (user selected Custom),
                // stay in custom mode - don't exit
            }
            
            previousValueRef.current = value
        }, [value, baseOptions, isCustomMode])

        // Determine selected option in dropdown
        const selectedOption = useMemo(() => {
            if (isCustomMode || isCustomValue) {
                return options.find((opt) => opt.value === CUSTOM_OPTION_VALUE)
            }
            if (value) {
                return options.find((opt) => opt.value === String(value))
            }
            return null
        }, [value, options, isCustomValue, isCustomMode])

        // Show custom input if 'custom' is selected or value is not in preset list
        const showCustomInput = useMemo(() => {
            return isCustomMode || isCustomValue
        }, [isCustomMode, isCustomValue])

        // enable dependency
        const isEnabled = useEnableLogic(
            (misc?.enable as IEnableCondition) || {}
        )
        // enable dependency end

        const fieldNames = Object.keys(form.fields)
        const isLastField = fieldNames[fieldNames.length - 1] === name
        const hasSingleOption = options.length === 1

        const handleSelectChange = (selectedOption: IOption | null) => {
            if (!selectedOption) {
                setValue('')
                setIsCustomMode(false)
                userSelectedPresetRef.current = false
                userSelectedCustomRef.current = false
                return
            }

            if (selectedOption.value === CUSTOM_OPTION_VALUE) {
                // User selected 'Custom' - enter custom mode
                userSelectedCustomRef.current = true
                setIsCustomMode(true)
                // Clear the value so user can enter a custom value
                setValue('')
            } else {
                // User selected a preset option - exit custom mode
                userSelectedPresetRef.current = true
                userSelectedCustomRef.current = false
                setIsCustomMode(false)
                // Set value to selected preset option
                setValue(selectedOption.value)
            }

            if (isConnectedField(fieldConfig?.modelName as string, name)) {
                fetchConnectedOptions(fieldConfig?.modelName as string, name, {
                    ...getFormState(form).values,
                    id: form.defaultValue?.id,
                })
            }
        }

        const handleCustomInputChange = (
            e: React.ChangeEvent<HTMLInputElement>
        ) => {
            const input = e.target
            cursorPositionRef.current = input.selectionStart
            setValue(input.value)
        }

        const handleCustomInputFocus = () => {
            isCustomInputFocusedRef.current = true
        }

        const handleCustomInputBlur = () => {
            // Delay resetting the ref to allow useEffect to check it
            setTimeout(() => {
                isCustomInputFocusedRef.current = false
            }, 100)
        }

        useEffect(() => {
            if (cursorPositionRef.current !== null && customInputRef.current) {
                const input = customInputRef.current
                const position = cursorPositionRef.current
                input.setSelectionRange(position, position)
                cursorPositionRef.current = null
            }
        }, [value])

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

        return (
            <div
                className={classNames('wbk_selectCustomField', {
                    'wbk_selectCustomField--invalid': showErrors,
                })}
            >
                <Label id={name} title={label} tooltip={misc?.tooltip} />
                <div>
                    <Select
                        ref={selectRef}
                        value={selectedOption}
                        options={options}
                        onChange={(selectedOption: IOption | null) =>
                            handleSelectChange(selectedOption)
                        }
                        getOptionValue={(option) => option.value}
                        getOptionLabel={(option) => option.label}
                        classNames={{
                            control: () => 'wbk_selectCustomField__selectInput',
                        }}
                        id={name}
                        onBlur={() => setTouched(true)}
                        onFocus={recalculatePosition}
                        onMenuOpen={recalculatePosition}
                        isSearchable={misc?.searchable || false}
                        isDisabled={
                            isLoading || conditionallyDisabled || !isEnabled
                        }
                        isLoading={isLoading}
                        hideSelectedOptions={false}
                        styles={{
                            menu: (base: any) => ({
                                ...base,
                                maxHeight: `${maxMenuHeight}px`,
                            }),
                            menuList: (base: any) => ({
                                ...base,
                                maxHeight: `${maxMenuHeight}px`,
                            }),
                        }}
                        menuPlacement={
                            isLastField && hasSingleOption
                                ? 'top'
                                : menuPlacement
                        }
                        isOptionDisabled={(option: IOption) => {
                            // Always allow 'custom' option to be selected
                            if (option.value === CUSTOM_OPTION_VALUE) return false
                            
                            if (!misc?.disabled_options) return false

                            return misc?.disabled_options.includes(option.value)
                        }}
                        maxMenuHeight={maxMenuHeight}
                    />
                    {showCustomInput && (
                        <div className="wbk_selectCustomField__customInputContainer">
                            <input
                                ref={customInputRef}
                                type="text"
                                className="wbk_selectCustomField__customInput"
                                value={value || ''}
                                onChange={handleCustomInputChange}
                                onFocus={handleCustomInputFocus}
                                onBlur={(e) => {
                                    setTouched(true)
                                    handleCustomInputBlur()
                                }}
                                disabled={
                                    isLoading ||
                                    conditionallyDisabled ||
                                    !isEnabled
                                }
                                placeholder={__(
                                    'Enter custom value',
                                    'webba-booking-lite'
                                )}
                            />
                        </div>
                    )}
                    {misc?.description && (
                        <FieldDescription description={misc.description} />
                    )}
                    {showErrors && firstError && (
                        <div className="wbk_selectCustomField__errorContainer">
                            {firstError}
                        </div>
                    )}
                </div>
            </div>
        )
    }
}
