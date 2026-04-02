import { useForm } from '../FormProvider'
import { useField } from './useField'

type TValue = string | number | boolean
type TConditions = '==' | '!=' | '<' | '<=' | '>' | '>=' | 'not in' | 'in'

interface IDependantValueProps {
    value: TValue
    condition: [string, TConditions, TValue]
    defaultValue: TValue
    fieldName: string
}

export const useDependantValue = ({
    value,
    condition,
    defaultValue,
    fieldName,
}: IDependantValueProps) => {
    if (!fieldName || !condition.length) return

    const { reset, fields, defaultValue: formDefaultValue } = useForm()
    const field = fields[fieldName] || null

    if (!field) return

    const { setValue } = useField(field)

    if (condition.length !== 3) {
        setValue(defaultValue)
        return
    }

    const [fieldNameToCompare, operator, valueToCompare] = condition
    const fieldToCompare = fields[fieldNameToCompare] || null

    if (!fieldToCompare) return

    if (operator === '==') {
        if (String(valueToCompare) === String(fieldToCompare.value.value)) {
            setValue(value)
            formDefaultValue[fieldName] = value
        } else {
            setValue(defaultValue)
        }
    } else if (operator === '!=') {
        if (String(valueToCompare) !== String(fieldToCompare.value.value)) {
            setValue(value)
            formDefaultValue[fieldName] = value
        } else {
            setValue(defaultValue)
        }
    } else if (operator === 'not in') {
        if (!Array.isArray(valueToCompare) || !valueToCompare.includes(fieldToCompare.value.value)) {
            setValue(value)
            formDefaultValue[fieldName] = value
        } else {
            setValue(defaultValue)
        }
    } else if (operator === 'in') {
        if (Array.isArray(valueToCompare) && valueToCompare.includes(fieldToCompare.value.value)) {
            setValue(value)
            formDefaultValue[fieldName] = value
        } else {
            setValue(defaultValue)
        }
    }
    
    return
}
