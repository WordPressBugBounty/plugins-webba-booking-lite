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
import { createPaymentSelectField } from '../Fields/PaymentSelectField/PaymentSelectField'
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
import { createCheckboxField } from '../Fields/CheckboxField/CheckboxField'
import { CreateCustomFields } from '../Fields/CustomField/CustomField'
import { InputWrapper } from '../Fields/InputWrapper/InputWrapper'
import { createMultiCheckbox } from '../Fields/MultiCheckbox/MultiCheckbox'
import { createColorField } from '../Fields/ColorField/ColorField'

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

    if (name === 'email') {
        return createEmailField(constructorConfig)
    }

    if (inputType === 'select') {
        return createGenericSelectField(constructorConfig)
    }

    if (inputType === 'text') {
        return createTextField(constructorConfig)
    }

    if (inputType === 'number') {
        return createNumericField(constructorConfig)
    }

    if (inputType === 'textarea') {
        return createTextareaField(constructorConfig)
    }

    if (inputType === 'editor') {
        return createEditorField(constructorConfig)
    }

    if (inputType === 'business_hours') {
        return createBusinessHoursField(constructorConfig)
    }

    if (inputType === 'date_range') {
        return createDateRangeField(constructorConfig)
    }

    if (inputType === 'radio') {
        return createRadioButton(constructorConfig)
    }

    if (inputType === 'date') {
        return createDateField(constructorConfig)
    }

    if (inputType === 'time') {
        return createGenericSelectField(constructorConfig)
    }

    if (inputType === 'checkbox') {
        return createCheckboxField(constructorConfig)
    }

    if (inputType === 'multicheckbox') {
        return createMultiCheckbox(constructorConfig)
    }

    if (inputType === 'webba_custom_data') {
        return CreateCustomFields(constructorConfig)
    }

    if (inputType === 'color') {
        return createColorField(constructorConfig)
    }

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
            !config[property]?.hidden && !!model.properties[property].editable
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

        const dependencies = model.properties[fieldName].dependency

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
            element: dependencies.length ? (
                <DependencyValidator field={formField}>
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

export const capitalize = (word: string) => {
    return word.charAt(0).toUpperCase() + word.slice(1)
}

export const safeParse = function <T = any>(
    maybeJsonString: string,
    defaultValue?: T
): { value: T; error: null } | { value: null; error: Error } {
    try {
        const getValue = () => {
            if (maybeJsonString) {
                return JSON.parse(maybeJsonString)
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
        return {
            value: null,
            error: e as Error,
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
