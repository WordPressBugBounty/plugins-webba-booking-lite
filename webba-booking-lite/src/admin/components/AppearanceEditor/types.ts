import { IOption } from '../Form/types'

type TValue = string | number | null
type TAllowedTypes = 'color' | 'select' | 'shadow'

export interface IAppearanceField {
    id: string
    label: string
    options?: IOption[]
    default?: TValue
    value?: TValue
    type: TAllowedTypes
    setValue: (value: TValue) => void
    warning?: string
}

export interface IAppearanceSubsection {
    id: string
    title?: string
    fields: IAppearanceField[]
}

export interface IAppearanceSection {
    id: string
    title: string
    fields?: IAppearanceField[]
    requiredPlans?: string[]
    subsections?: IAppearanceSubsection[]
}

export interface IAppearanceSectionConstructorProps {
    sections: IAppearanceSection[]
}

export interface IConstructAppearanceFieldProps {
    fields: IAppearanceField[]
}

export interface IConstructAppearanceSubsectionProps {
    subsections: IAppearanceSubsection[]
}

export interface IApperanceOptionConfig {
    fieldConfig: IAppearanceField
}
