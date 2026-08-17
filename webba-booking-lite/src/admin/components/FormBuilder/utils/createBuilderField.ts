import { Validators } from '../../Form/utils/validation'
import {
    CreateFieldGroupConfig,
    FieldConfig,
    FieldGroupConfig,
} from '../hooks/useGroup'
import { FieldType } from '../types'
import { __ } from '@wordpress/i18n'

export interface QuantityFieldOption {
    label: string
    slug: string
}

export interface BuilderGroupConfig {
    type: FieldType
    required: boolean
    slug: string
    placeholder?: string
    checkboxText?: string
    defaultValue?: any
    width?: string
    options?: string[]
    quantityFields?: Array<string | QuantityFieldOption>
}

const getDefaultQuantityFields = (): QuantityFieldOption[] => [
    {
        label: __('Adult', 'webba-booking-lite'),
        slug: 'adult',
    },
    {
        label: __('Child', 'webba-booking-lite'),
        slug: 'child',
    },
    {
        label: __('Infant', 'webba-booking-lite'),
        slug: 'infant',
    },
]

const slugifyQuantityLabel = (label: string): string =>
    String(label || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')

const normalizeQuantityFieldOption = (
    field: string | QuantityFieldOption
): QuantityFieldOption => {
    if (typeof field === 'string') {
        const label = field.trim()
        return {
            label,
            slug: slugifyQuantityLabel(label),
        }
    }

    const label = String(field?.label || '').trim()
    const slug =
        String(field?.slug || '').trim() || slugifyQuantityLabel(label)

    return { label, slug }
}

const quantityFieldOptionValidator = (value: QuantityFieldOption) => {
    if (
        !value ||
        !String(value.label || '').trim() ||
        !String(value.slug || '').trim()
    ) {
        return __('Required field', 'webba-booking-lite')
    }

    return null
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
        validators: [Validators.required],
        validateOnInit: true,
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
    quantityFields,
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
        case FieldType.QuantityFields:
            return {
                quantityFields: (
                    quantityFields?.length
                        ? quantityFields
                        : getDefaultQuantityFields()
                ).map((field) => ({
                    defaultValue: normalizeQuantityFieldOption(field),
                    validators: [quantityFieldOptionValidator],
                    validateOnInit: true,
                })),
                ...getSharedFieldsConfig(type, slug, required),
                ...getPlaceholderFieldConfig(
                    placeholder || __('Quantity', 'webba-booking-lite')
                ),
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
