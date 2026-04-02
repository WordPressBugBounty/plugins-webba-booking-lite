import { FileWithPath } from 'react-dropzone'

export type TAcceptedInputValues =
    | string
    | number
    | boolean
    | IOption
    | IOption[]
    | null
    | FileWithPath[]

export type TAcceptedInputTypes =
    | 'text'
    | 'email'
    | 'phone'
    | 'number'
    | 'file'
    | 'textarea'
    | 'checkbox'
    | 'select'
    | 'dropdown'
    | 'radio'
    | 'description'

export type ValidatorFn<T> = (value: T) => boolean | string

export type TError = boolean | string | null

export interface IFieldConfig {
    slug: string
    placeholder: string
    required: boolean
    value: TAcceptedInputValues
    type: TAcceptedInputTypes
    width: 'full-width' | 'half-width'
    checkboxText?: string
    defaultValue?: TAcceptedInputValues
    options?: string[]
    validators?: ValidatorFn<TAcceptedInputValues>[]
}

export interface IFieldConstructor
    extends IFieldConfig,
        Omit<IFieldConfig, 'slug'> {
    name: string
    addValidators: (validator: ValidatorFn<TAcceptedInputValues>[]) => void
}

export interface IField extends IFieldConstructor {
    errors?: TError[]
    setValue: (value: TAcceptedInputValues) => void
    resetValue: () => void
    touched: boolean
    setTouched: (touched: boolean) => void
}

export interface IFieldProps {
    fieldConstructor: IFieldConstructor
    anyTouched?: boolean
}

export type TFieldConstructor = () => JSX.Element

export interface IFormContextProps {
    fields: IFieldConfig[]
    setFields: (fields: IFieldConfig[]) => void
}

export interface IFormContext extends IFormContextProps {
    anyTouched: boolean
    setAnyTouched: (touched: boolean) => void
}

export interface IOption {
    label: string
    value: string
}

export interface IForm {
    fields: IFieldConfig[]
    name: string
}
