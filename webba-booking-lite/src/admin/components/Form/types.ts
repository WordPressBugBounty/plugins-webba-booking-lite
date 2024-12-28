export type FormFieldType = 'text' | 'select' | 'date'

export interface FormField {
    type: FormFieldType
    name: string
    label?: string
}
