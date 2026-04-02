import { ReactElement, ReactNode } from 'react'
import { Model } from '../../types'
import { FormFromModel, FormValueFromModel } from './lib/types'

export interface FormFieldProps {
    name: string
    label: string
    misc?: FormFieldMisc
}

export interface ICondition {
    operator: string
    value: string
    field: string
}

export interface IEnableCondition {
    endpoint: string
    data: Record<string, string | number | boolean>
    conditions: ICondition[]
}

export interface IHideCondition {
    conditions: ICondition[]
}

export interface FormFieldMisc {
    tooltip?: string
    date_format?: string
    time_zone?: string
    type?: string
    min?: number
    max?: number
    sub_type?: string
    options?:
        | Record<string, string>
        | Record<string, { title: string; description?: string }>
        | string
        | { value: string; title: string; icon: string }[]
    null_value?: string[]
    multiple?: boolean
    pro_version?: boolean
    disabled?: boolean
    disable_condition?: Record<string, string>
    generate_random?: boolean
    generate_key?: string
    description?: string
    enable?: IEnableCondition
    hide?: ICondition[]
    disabled_options: string[]
    dependent_value?: any
    required_plan?: string
    checkboxValue?: string
    subsection?: string | null
    searchable?: boolean
    min_field?: string
    max_field?: string
    hidden?: boolean
    radio_type?: 'generic' | 'icon' | 'dots'
    source_filter?: [string, string, string][]
}

export interface ResolvedFormField {
    element: ReactElement
    name: string
    tab?: string
    label?: string
    subsection?: string | null
    required_plan?: string
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
    isDisabled?: boolean
}

export interface AccordionProps {
    title: string
    fields: ResolvedFormField[]
    defaultOpen?: boolean
}

export type TooltipMode = 'tooltip' | 'description'

export interface ITab {
    title: string
    required_plan?: string
}

export interface IFormProps<T extends Model> {
    id: string
    name: string
    form: FormFromModel<T>
    sections: FormSections
    defaultValue?: FormValueFromModel<T>
    onSubmit: (formValue: any) => void
    onDelete?: () => void
    onDuplicate?: () => void
    onReset?: () => void
    subsectionTitles?: Record<string, string>
    tabs?: Record<string, ITab>
    tooltipMode?: TooltipMode
    editorView?: 'tabular' | 'form' | null
    showTabularSearch?: boolean
    submitButtonText?: string
    submitButtonIcon?: ReactNode
}
