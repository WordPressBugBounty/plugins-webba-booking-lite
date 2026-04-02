import { CreateFieldParams, FormField } from './types'
import { validate, Validators } from '../utils/validation'
import { derive } from 'derive-valtio'
import { Primitive, primitive } from '../../../utils/primitive'

export const createField = <T>({
    name,
    defaultValue,
    validators,
    required,
    label,
}: CreateFieldParams<T>): FormField<T> => {
    const defaultValidators = required ? [Validators.required] : []
    const _value = primitive(defaultValue)
    const _validators = primitive([...defaultValidators, ...validators])

    return {
        name,
        label,
        value: _value,
        validators: _validators,
        required: !!required,
        isIgnored: primitive(false),
        errors: derive({
            value: (get) =>
                validate(get(_value).value, get(_validators).value, get),
        }) as Primitive<string[]>,
        setValue: (value) => {
            _value.value = value
        },
        setValidators: (validators) => {
            _validators.value = [...defaultValidators, ...validators]
        },
        addValidator: (validator) => {
            _validators.value = [..._validators.value, validator]
        },
        resetValidators: () => {
            _validators.value = []
        },
    }
}
