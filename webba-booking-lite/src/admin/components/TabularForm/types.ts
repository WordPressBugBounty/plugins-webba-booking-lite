import { FormSections, ITab, ResolvedFormField } from '../Form/types'
import { FormField } from '../Form/lib/types'

export interface ITabularFormProps {
    sections: FormSections
    tabs?: Record<string, ITab>
    subsectionTitles?: Record<string, string>
    showSearch?: boolean
}

export interface ITabularFormRowProps {
    field: ResolvedFormField
    formField: FormField<any>
}
