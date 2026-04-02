import { Validators } from '../../Form/utils/validation'
import {
    CreateFieldGroupConfig,
    FieldConfig,
    FieldGroupConfig,
} from '../hooks/useGroup'
import { FieldType } from '../types'

export interface BuilderGroupConfig {
    type: FieldType
    required: boolean
    slug: string
    placeholder?: string
    checkboxText?: string
    defaultValue?: any
    width?: string
    options?: string[]
}

export interface BuilderGroupMeta {
    disabled?: boolean
    collapsed?: boolean
}

const getSharedFieldsConfig = (
    type: FieldType,
    slug?: string,
    required?: boolean
): CreateFieldGroupConfig => ({
    type: {
        defaultValue: type,
    },
    slug: {
        defaultValue: slug || '',
        validators: [Validators.required],
        validateOnInit: true,
    },
    required: {
        defaultValue: required || false,
    },
})

const textFieldsConifg = (
    placeholder = '',
    defaultValue = ''
): CreateFieldGroupConfig => ({
    placeholder: {
        defaultValue: placeholder,
    },
    defaultValue: {
        defaultValue,
    },
})

const getPlaceholderFieldConfig = (
    defaultValue = ''
): CreateFieldGroupConfig => ({
    placeholder: {
        defaultValue,
    },
})

const getWidthFieldConfig = (
    defaultValue = 'full-width'
): CreateFieldGroupConfig => ({
    width: {
        defaultValue,
    },
})

const getOptions = (options: any[] = []): FieldConfig[] =>
    options.map((option) => ({
        defaultValue: option,
    }))

export const getBuilderFieldsByType = ({
    type,
    required,
    slug,
    placeholder,
    checkboxText,
    defaultValue,
    width,
    options,
}: Partial<BuilderGroupConfig>): CreateFieldGroupConfig => {
    switch (type) {
        case FieldType.Checkbox:
            return {
                checkboxText: {
                    defaultValue: checkboxText || '',
                },
                ...getSharedFieldsConfig(type, slug, required),
                ...getWidthFieldConfig(width),
            }
        case FieldType.Radio:
            return {
                options: getOptions(options),
                ...getSharedFieldsConfig(type, slug, required),
                ...getWidthFieldConfig(width),
                ...getPlaceholderFieldConfig(placeholder),
            }
        case FieldType.Dropdown:
            return {
                options: getOptions(options),
                ...getSharedFieldsConfig(type, slug, required),
                ...getPlaceholderFieldConfig(placeholder),
                ...getWidthFieldConfig(width),
            }
        case FieldType.Email:
        case FieldType.Phone:
            return {
                ...getSharedFieldsConfig(type, slug, required),
                ...textFieldsConifg(placeholder, defaultValue),
                ...getWidthFieldConfig(width),
            }
        case FieldType.Text:
        case FieldType.Textarea:
            return {
                ...getSharedFieldsConfig(type, slug, required),
                ...textFieldsConifg(placeholder, defaultValue),
                ...getWidthFieldConfig(width),
            }
        case FieldType.Number:
            return {
                ...getSharedFieldsConfig(type, slug, required),
                ...textFieldsConifg(placeholder, defaultValue || '1'),
                ...getWidthFieldConfig(width),
            }
        case FieldType.File:
            return {
                ...getSharedFieldsConfig(type as FieldType, slug, required),
                ...getPlaceholderFieldConfig(placeholder),
                ...getWidthFieldConfig(width),
            }
        default:
            return {
                ...getSharedFieldsConfig(type as FieldType, slug, required),
                ...getWidthFieldConfig(width),
                type: {
                    defaultValue: type,
                },
                defaultValue: {
                    defaultValue: defaultValue,
                },
            }
    }
}

export const getBuilderGroup = (
    config: Partial<BuilderGroupConfig> = {
        type: FieldType.Text,
    },
    meta: BuilderGroupMeta = {}
): FieldGroupConfig => ({
    fields: getBuilderFieldsByType(config),
    meta,
})
