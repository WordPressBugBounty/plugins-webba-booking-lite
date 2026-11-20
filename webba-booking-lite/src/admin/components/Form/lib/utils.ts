import { Model } from '../../../types'
import { ValidatorFn } from '../utils/validation'
import { FormFromModel, Operator } from './types'

export const getErrors = <T>(value: T, validators: ValidatorFn<T>[]) => {
    const errors: string[] = []

    for (const validator of validators) {
        const error = validator(value)

        if (error) {
            errors.push(error)
        }
    }

    return errors
}

export const getFormState = <T extends Model>({ fields }: FormFromModel<T>) => {
    const errors: Record<string, string[]> = {}
    const values: Record<string, any> = {}

    for (const key of Object.keys(fields)) {
        const copy = [...fields[key].errors.value]

        if (copy.length) {
            errors[key] = copy
        }

        values[key] = fields[key].value.value
    }

    const isValid = !Object.keys(errors).length

    return {
        errors,
        values,
        isValid,
    }
}

const valuesFromField = (actualValue: unknown): string[] => {
    if (Array.isArray(actualValue)) {
        return actualValue.map((item) => String(item))
    }

    if (typeof actualValue === 'string') {
        const trimmed = actualValue.trim()
        if (!trimmed) {
            return []
        }

        if (trimmed.startsWith('[')) {
            try {
                const parsed = JSON.parse(trimmed)
                if (Array.isArray(parsed)) {
                    return parsed.map((item) => String(item))
                }
            } catch (error) {
                return [trimmed]
            }
        }

        if (trimmed.includes(',')) {
            return trimmed.split(',').map((item) => item.trim())
        }

        return [trimmed]
    }

    if (actualValue === null || typeof actualValue === 'undefined') {
        return []
    }

    return [String(actualValue)]
}

export const valueComparator = ({
    operator,
    actualValue,
    toMatch,
}: {
    operator: Operator
    actualValue: unknown
    toMatch: string
}) => {
    switch (operator) {
        case '=':
            return actualValue === toMatch
        case '==':
            return actualValue == toMatch
        case '!=':
            return actualValue != toMatch
        case '>':
            return Number(actualValue) > Number(toMatch)
        case '<':
            return Number(actualValue) < Number(toMatch)
        case '>=':
            return Number(actualValue) >= Number(toMatch)
        case '<=':
            return Number(actualValue) <= Number(toMatch)
        case 'contains':
            return valuesFromField(actualValue).includes(String(toMatch))
        default:
            throw new Error(`Unknown operation: ${operator}`)
    }
}
