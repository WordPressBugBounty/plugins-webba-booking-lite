import { Primitive } from 'zod'
import { IHideCondition } from '../../types'
import { useForm } from '../FormProvider'
import { useEffect, useMemo, useState } from 'react'

export const useHideLogic = ({ conditions }: IHideCondition) => {
    if (!conditions) return false
    const [result, setResult] = useState(false)

    const form = useForm()

    useEffect(() => {
        setTimeout(() => {
            conditions.forEach((condition) => {
                const formValue =
                    form.fields[condition.field]?.value ||
                    form.defaultValue[condition.field] ||
                    ''
                const conditionValue = condition.value || ('' as Primitive<any>)
                if (condition.operator === '=' && formValue == conditionValue) {
                    setResult(true)
                } else if (
                    condition.operator === '==' &&
                    formValue === conditionValue
                ) {
                    setResult(true)
                } else if (
                    condition.operator === '!=' &&
                    formValue != conditionValue
                ) {
                    setResult(true)
                } else if (
                    condition.operator === '!==' &&
                    formValue !== conditionValue
                ) {
                    setResult(true)
                } else if (
                    condition.operator === '>' &&
                    Number(formValue) > Number(conditionValue)
                ) {
                    setResult(true)
                } else if (
                    condition.operator === '<' &&
                    Number(formValue) < Number(conditionValue)
                ) {
                    setResult(true)
                }
            })
        }, 10)

        // return result
    }, [form.fields, form.defaultValue, conditions, form.patchValue])

    return result
}
