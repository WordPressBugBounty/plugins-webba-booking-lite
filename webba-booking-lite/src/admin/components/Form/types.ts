import { ReactElement } from 'react'

export interface FormFieldProps {
    name: string
    label: string
    misc?: FormFieldMisc
}

export interface FormFieldMisc {
    tooltip?: string
    date_format?: string
    time_zone?: string
    type?: string
    min?: number
    max?: number
    sub_type?: string
    options?: Record<string, string> | string
    null_value?: string[]
    multiple?: boolean
    pro_version?: boolean
    disabled?: boolean
}

export interface ResolvedFormField {
    element: ReactElement
    name: string
    tab?: string
    label?: string
}

export type FormSections = {
    general: ResolvedFormField[]
    [key: string]: ResolvedFormField[]
}

export interface BusinessHoursFieldProps extends FormFieldProps {
    value?: Record<string, string | number>[]
    setValue: (value: any) => void
}

export interface BusinessDayProps {
    index: number
    value: Record<string, string | number>[]
    setValue: (value: any) => void
}

export interface IOption {
    label: string
    value: string
}
