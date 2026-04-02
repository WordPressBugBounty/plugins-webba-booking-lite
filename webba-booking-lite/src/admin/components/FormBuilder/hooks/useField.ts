import { useSnapshot } from 'valtio'
import { Field } from '../utils/createField'

export const useField = <T>(field: Field<T>) => {
    const value = useSnapshot(field.value).value
    const errors = useSnapshot(field.errors).value

    return {
        ...field,
        value,
        errors,
    }
}

export type UseFieldResult<T> = ReturnType<typeof useField<T>>
