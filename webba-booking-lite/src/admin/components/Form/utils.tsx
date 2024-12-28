import { JSONType } from 'ajv'
import { FormField, FormFieldType } from './types'

interface CustomFieldConfig {
    label?: string
    hidden?: boolean
}

interface CreateFielsFromModelParams<T extends { properties: any }> {
    model: T
    config?: Partial<Record<keyof T['properties'], CustomFieldConfig>>
}

const getFieldType = (field: {
    type: JSONType
    format?: string
    enum?: string[]
}): FormFieldType | null => {
    if (field.type === 'string' && field.format === 'date') {
        return 'date'
    }

    if (field.enum?.length) {
        return 'select'
    }

    return 'text'
}

export const createFieldsFromSchema = function <T extends { properties: any }>({
    model,
    config = {},
}: CreateFielsFromModelParams<T>) {
    return Object.keys(model.properties)
        .filter((key) => !model.properties[key].hidden && !config[key]?.hidden)
        .map((key): FormField => {
            const modelField = model.properties[key]
            return {
                name: key,
                label: config[key]?.label || key,
                type: getFieldType(modelField) as FormFieldType,
            }
        })
}
