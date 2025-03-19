import { useSnapshot } from 'valtio'
import { FormField, UnwrappedField } from '../types'

export const useField = <T>(field: FormField<T>): UnwrappedField<T> => {
    const value = useSnapshot(field.value)
    const errors = useSnapshot(field.errors)
    const isIgnored = useSnapshot(field.isIgnored)
    const validators = useSnapshot(field.validators)

    return {
        ...field,
        value: value.value,
        errors: errors.value,
        isIgnored: isIgnored.value,
        validators: validators.value,
    } as UnwrappedField<T>
}
