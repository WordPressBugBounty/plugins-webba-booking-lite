import { FormFieldMisc } from '../../types'

export interface IColorValueProps {
    value: string | null
    misc: FormFieldMisc
    setValue: (value: string) => void
}
