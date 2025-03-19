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

export const valueComparator = ({
    operator,
    actualValue,
    toMatch,
}: {
    operator: Operator
    actualValue: string
    toMatch: string
}) => {
    switch (operator) {
        case '=':
            return actualValue === toMatch
        case '!=':
            return actualValue !== toMatch
        case '>':
            return Number(actualValue) > Number(toMatch)
        case '<':
            return Number(actualValue) < Number(toMatch)
        default:
            throw new Error(`Unknown operation: ${operator}`)
    }
}
