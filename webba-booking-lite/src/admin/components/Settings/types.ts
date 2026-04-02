import { ITab } from '../Form/types'

export interface ISettingsSection {
    id: string
    title: string
    icon: string
    isPro: boolean
    description: string
    fields: ISettingsField[]
    sections: Record<string, string>
    tabs: Record<string, ITab>
    required_plan?: string
    editor_view?: 'tabular' | 'form' | null
}

interface IDependentValue {
    condition: [string, string, string][]
    value: string
}

export interface ISettingsField {
    id: string
    title: string
    type: string
    placeholder: string
    default: string | number
    value: string
    extra?: Record<string, string>
    required?: boolean
    tab: string
    subsection?: string
    dependency?: [string, string, string][]
    checkbox_value?: string
    tooltip: string
    mulitple?: boolean
    required_plan?: string
    sub_type?: string
    dependent_value?: IDependentValue
    searchable?: boolean
}

export interface ISettingsSectionProps {
    sections: ISettingsSection[]
}

export interface ISettingsModelProps {
    fields: ISettingsField[]
}
