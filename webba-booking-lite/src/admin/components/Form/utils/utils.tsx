import { ComponentType, useMemo } from 'react'
import { Model } from '../../../types'
import { DependencyValidator } from '../DependencyValidator'
import { createBusinessHoursField } from '../Fields/BusinessHoursField/BusinessHoursField'
import { createDateRangeField } from '../Fields/DateRangeField/DateRangeField'
import { createEditorField } from '../Fields/EditorField/EditorField'
import { createEmailField } from '../Fields/EmailField/EmailField'
import { GenericFormField } from '../Fields/GenericFormField/GenericFormField'
import { createGenericSelectField } from '../Fields/GenericSelectField/GenericSelectField'
import { createNumericField } from '../Fields/NumericField/NumericField'
import { createTextField } from '../Fields/TextField/TextField'
import { useField } from '../lib/hooks/useField'
import {
    FormComponentContstructorConfig,
    FormField,
    FormFromModel,
} from '../lib/types'
import { FormSections, ResolvedFormField } from '../types'
import { createRadioButton } from '../Fields/RadioButton/RadioButton'
import { createTextareaField } from '../Fields/TextareaField/TextareaField'
import { createDateField } from '../Fields/DateField/DateField'
import { createDateMultipleField } from '../Fields/DateMultipleField/DateMultipleField'
import { createCheckboxField } from '../Fields/CheckboxField/CheckboxField'
import { CreateCustomFields } from '../Fields/CustomField/CustomField'
import { InputWrapper } from '../Fields/InputWrapper/InputWrapper'
import { createMultiCheckbox } from '../Fields/MultiCheckbox/MultiCheckbox'
import { createColorField } from '../Fields/ColorField/ColorField'
import { createFileUploadField } from '../Fields/FileUploadField/FileUploadField'
import { createDurationField } from '../Fields/DurationField/DurationField'
import { createZoomAuthField } from '../Fields/ZoomAuthField/ZoomAuthField'
import { createPasswordField } from '../Fields/PasswordField/PasswordField'
import { createLimitationField } from '../Fields/LimitationField/LimitationField'
import { createNoticeField } from '../Fields/NoticeField/NoticeField'
import { createSelectCustomField } from '../Fields/SelectCustomField/SelectCustomField'
import { createPriceVariantField } from '../Fields/PriceVariantField/PriceVariantField'
import { createAvailabilityRangesField } from '../Fields/AvailabilityRangesField/AvailabilityRangesField'
import { createUnitPeopleField } from '../Fields/UnitPeopleField/UnitPeopleField'

interface CustomFieldConfig {
    title?: string
    hidden?: boolean
    formField: FormField<any>
}

interface CreateFieldsFromModelParams<T extends Model> {
    model: T
    form: FormFromModel<T>
    config?: Partial<Record<keyof T['properties'], CustomFieldConfig>>
    modelName: string
    prefix?: string
}

export const getFieldComponentFromType = ({
    name,
    fieldConfig,
    field,
}: {
    name: string
} & FormComponentContstructorConfig<any>): ComponentType<any> => {
    const { input_type: inputType } = fieldConfig

    const constructorConfig: FormComponentContstructorConfig<any> = {
        field,
        fieldConfig,
    }

    switch (true) {
        case name === 'email':
            return createEmailField(constructorConfig)
        case inputType === 'select':
        case inputType === 'select_multiple':
            return createGenericSelectField(constructorConfig)
        case inputType === 'text':
            return createTextField(constructorConfig)
        case inputType === 'number':
            return createNumericField(constructorConfig)
        case inputType === 'textarea':
            return createTextareaField(constructorConfig)
        case inputType === 'editor':
            return createEditorField(constructorConfig)
        case inputType === 'business_hours':
            return createBusinessHoursField(constructorConfig)
        case inputType === 'date_range':
            return createDateRangeField(constructorConfig)
        case inputType === 'radio':
            return createRadioButton(constructorConfig)
        case inputType === 'date':
            return createDateField(constructorConfig)
        case inputType === 'date_multiple':
            return createDateMultipleField(constructorConfig)
        case inputType === 'time':
            return createGenericSelectField(constructorConfig)
        case inputType === 'checkbox':
            return createCheckboxField(constructorConfig)
        case inputType === 'multicheckbox':
            return createMultiCheckbox(constructorConfig)
        case inputType === 'webba_custom_data':
            return CreateCustomFields(constructorConfig)
        case inputType === 'color':
            return createColorField(constructorConfig)
        case inputType === 'file':
            return createFileUploadField(constructorConfig)
        case inputType === 'duration':
            return createDurationField(constructorConfig)
        case inputType === 'zoom_auth':
            return createZoomAuthField(constructorConfig)
        case inputType === 'password':
            return createPasswordField(constructorConfig)
        case inputType === 'limitation':
            return createLimitationField(constructorConfig)
        case inputType === 'notice':
            return createNoticeField(constructorConfig)
        case inputType === 'select_custom':
            return createSelectCustomField(constructorConfig)
        case inputType === 'price_variant':
            return createPriceVariantField(constructorConfig)
        case inputType === 'availability_ranges':
            return createAvailabilityRangesField(constructorConfig)
        case inputType === 'number_of_people':
            return createUnitPeopleField(constructorConfig)
        default:
            return ({ name, label }) => {
                const { value, setValue } = useField(field)
                return (
                    <GenericFormField
                        value={value}
                        onChange={setValue}
                        type="text"
                        label={label}
                        id={name}
                    />
                )
            }
    }
}

export const createFormMenuSectionsFromModel = function <T extends Model>({
    model,
    config = {},
    form,
    modelName,
    prefix,
}: CreateFieldsFromModelParams<T>) {
    const tabs: Record<string, ResolvedFormField[]> = {
        general: [],
    }

    const shownFields = Object.keys(model.properties).filter(
        (property) =>
            !config[property]?.hidden &&
            !model.properties[property].misc?.hidden &&
            !!model.properties[property].editable
    )

    for (const fieldName of shownFields) {
        const modelField = {
            ...model.properties[fieldName],
            modelName,
            prefix,
        }
        const formField = form.fields[fieldName]

        const Component = getFieldComponentFromType({
            name: fieldName,
            fieldConfig: modelField,
            field: formField,
        })

        const label = config[fieldName]?.title || modelField.title || fieldName

        const dependencies = model.properties[fieldName]?.dependency?.length
            ? model.properties[fieldName].dependency
            : model.properties[fieldName]?.misc?.hide?.length
              ? model.properties[fieldName].misc.hide
              : []
        const component = (
            <InputWrapper field={formField} fieldConfig={modelField}>
                <Component
                    name={fieldName}
                    label={label}
                    misc={modelField?.misc}
                />
            </InputWrapper>
        )

        const field: ResolvedFormField = {
            tab: modelField.tab,
            name: fieldName,
            label,
            subsection: modelField.misc?.subsection || null,
            required_plan: modelField.misc?.required_plan,
            element: dependencies?.length ? (
                <DependencyValidator field={formField} misc={modelField.misc}>
                    {component}
                </DependencyValidator>
            ) : (
                component
            ),
        }

        if (field.tab) {
            tabs[field.tab] = tabs[field.tab]
                ? [...tabs[field.tab], field]
                : [field]
        } else {
            tabs.general = [...tabs.general, field]
        }
    }

    return tabs as FormSections
}

const getValueFromPropertyType = (type: any) => {
    switch (type) {
        case 'string':
        default:
            return ''
    }
}

export const createEmptyObjectFromSchema = function <
    T extends { properties: any },
>(schema: T) {
    const object = {} as any
    const modelKeys = Object.keys(schema.properties)

    for (const key of modelKeys) {
        object[key] = getValueFromPropertyType(schema.properties[key].type)
    }

    return object as Record<keyof T['properties'], any>
}

const fixMalformedJsonQuotes = (jsonString: string): string => {
    let result = jsonString
    
    result = result.replace(/(<[^>]*?[a-zA-Z-]+=)(\\?")([^"]*?)(\\?")([^>]*>)/g, (match, before, q1, value, q2, after) => {
        if (value && value.includes('"') && !value.match(/\\"/)) {
            const escapedValue = value.replace(/"/g, '\\"')
            return before + '\\"' + escapedValue + '\\"' + after
        }
        return match
    })
    
    result = result.replace(/(<[^>]*?[a-zA-Z-]+=)"([^"]*)"([^>]*>)/g, (match, before, value, after) => {
        if (value && value.includes('"') && !value.match(/\\"/)) {
            const escapedValue = value.replace(/"/g, '\\"')
            return before + '\\"' + escapedValue + '\\"' + after
        }
        return match
    })
    
    return result
}

export const safeParse = function <T = any>(
    maybeJsonString: string,
    defaultValue?: T
): { value: T; error: null } | { value: null; error: Error } {
    try {
        const getValue = () => {
            if (maybeJsonString) {
                if (typeof maybeJsonString !== 'string') {
                    return maybeJsonString
                }
                const trimmed = maybeJsonString.trim()
                if (!trimmed || trimmed === '') {
                    return defaultValue || null
                }

                try {
                    const parsed = JSON.parse(trimmed)
                    if (typeof parsed === 'string') {
                        try {
                            return JSON.parse(parsed)
                        } catch {
                            return parsed
                        }
                    }
                    return parsed
                } catch (firstError) {
                    let toTry = trimmed
                    
                    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
                        try {
                            const firstParse = JSON.parse(trimmed)
                            if (typeof firstParse === 'string') {
                                toTry = firstParse
                            } else {
                                return firstParse
                            }
                        } catch {
                        }
                    }
                    
                    try {
                        return JSON.parse(toTry)
                    } catch (secondError) {
                        try {
                            let fixed = toTry
                            
                            fixed = fixed.replace(/(<[^>]*?href=)(\\?")([^"]*?)(\\?")([^>]*>)/g, (match, before, q1, value, q2, after) => {
                                if (value.includes('#') && !value.includes('\\"')) {
                                    return before + '\\"#' + '\\"' + after
                                }
                                return match
                            })
                            
                            fixed = fixed.replace(/(<[^>]*?href=)"([^"]*)"([^>]*>)/g, (match, before, value, after) => {
                                if (value.includes('#') && !value.includes('\\"')) {
                                    return before + '\\"#' + '\\"' + after
                                }
                                return match
                            })
                            
                            const parsed = JSON.parse(fixed)
                            console.log('Successfully fixed and parsed malformed JSON')
                            return parsed
                        } catch (thirdError) {
                            try {
                                const fixed = fixMalformedJsonQuotes(toTry)
                                const parsed = JSON.parse(fixed)
                                console.log('Successfully fixed with fixMalformedJsonQuotes')
                                return parsed
                            } catch (fourthError) {
                                console.log('Failed to fix JSON, trying alternative methods')
                                let unescaped = toTry
                                
                                const hasExtraEscaping = 
                                    unescaped.includes('\\\\') || 
                                    (unescaped.match(/\\"/g) && unescaped.match(/"/g) && 
                                     unescaped.match(/\\"/g)!.length > unescaped.match(/"/g)!.length)
                                
                                if (hasExtraEscaping) {
                                    unescaped = unescaped.replace(/\\\\/g, '\\')
                                    unescaped = unescaped.replace(/\\"/g, '"')
                                    try {
                                        const parsed = JSON.parse(unescaped)
                                        if (typeof parsed === 'string') {
                                            try {
                                                return JSON.parse(parsed)
                                            } catch {
                                                return parsed
                                            }
                                        }
                                        return parsed
                                    } catch {
                                    }
                                }
                                
                                throw firstError
                            }
                        }
                    }
                }
            }

            if (defaultValue) {
                return defaultValue
            }

            return null
        }

        return {
            value: getValue(),
            error: null,
        }
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e)
        const errorStack = e instanceof Error ? e.stack : undefined
        console.error('JSON parse error:', {
            error: errorMessage,
            stack: errorStack,
            errorObject: e,
            input: maybeJsonString?.substring(0, 200),
            inputLength: maybeJsonString?.length,
        })
        return {
            value: null,
            error: e instanceof Error ? e : new Error(String(e)),
        }
    }
}

export const checkForConditionalDisable = (
    form: FormFromModel<any>,
    conditions: Record<string, string>
): boolean => {
    if (!form || !form.defaultValue) return false

    return Object.keys(conditions).every((fieldName) => {
        const formValue = form.defaultValue[fieldName]

        if (formValue === undefined) return false

        return formValue === conditions[fieldName]
    })
}
