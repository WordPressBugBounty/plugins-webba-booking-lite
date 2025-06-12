import { derive } from 'derive-valtio'
import { Model } from '../../../types'
import { createField } from './createField'
import {
    Dependency,
    FormField,
    FormFromModel,
    FormStateFromModel,
    FormValueFromModel,
    Primitive,
} from './types'
import { valueComparator } from './utils'
import { validate } from '../utils/validation'
import { __ } from '@wordpress/i18n'

export const createFormFromModel = <T extends Model>({
    properties,
}: T): FormFromModel<T> => {
    const fields: Record<string, FormField<any>> = {}
    const dependencyMap: Record<string, Dependency[]> = {}
    const defaultValue: Record<string, any> = {}

    for (const key of Object.keys(properties)) {
        const field = properties[key]

        fields[key] = createField({
            name: key,
            defaultValue: defaultValue?.[key] || field.default_value || '',
            validators: field.validators || [],
            required: field.required,
            label: __(field.title, 'webba-booking-lite'),
        })

        defaultValue[key] = field.default_value

        if (field.dependency.length) {
            dependencyMap[key] = field.dependency
        }
    }

    for (const key of Object.keys(dependencyMap)) {
        const isIgnored = derive({
            value: (get) =>
                dependencyMap[key]
                    .map(([fieldName, operator, validateValue]) =>
                        valueComparator({
                            operator,
                            actualValue: get(fields[fieldName].value).value,
                            toMatch: validateValue,
                        })
                    )
                    .some((value) => !value),
        }) as Primitive<boolean>

        fields[key] = {
            ...fields[key],
            isIgnored,
            errors: derive({
                value: (get) =>
                    !get(isIgnored).value
                        ? validate(
                              get(fields[key].value).value,
                              get(fields[key].validators).value
                          )
                        : [],
            }),
        }
    }

    const patchValue = (value: FormValueFromModel<T>) => {
        Object.keys(value).forEach((key) => {
            if (key in fields) {
                fields[key].setValue(value[key])
            }
        })
    }

    const clear = () => {
        Object.keys(fields).forEach((key) => {
            fields[key].setValue(null)
        })
    }

    const reset = () => {
        Object.keys(fields).forEach((key) => {
            fields[key].setValue(defaultValue[key])
        })
    }

    return {
        fields: fields as FormStateFromModel<T>,
        defaultValue: defaultValue as FormValueFromModel<T>,
        dependencyMap,
        patchValue,
        reset,
        clear,
    }
}
