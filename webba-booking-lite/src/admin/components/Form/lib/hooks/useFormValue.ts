import { useMemo } from 'react'
import { proxy, useSnapshot } from 'valtio'
import { FormFromModel, FormValueFromModel, Primitive } from '../types'
import { Model } from '../../../../types'

const getFormValueProxies = ({ fields }: FormFromModel) => {
    const result: Record<string, Primitive<any>> = {}

    for (const key of Object.keys(fields)) {
        result[key] = fields[key].value
    }

    return result
}

const unwrapValues = (fields: Record<string, Primitive<any>>) => {
    const result: Record<string, Primitive<any>> = {}

    for (const key of Object.keys(fields)) {
        result[key] = fields[key].value
    }

    return result
}

export const useFormValue = <T extends Model>(form: FormFromModel<T>) => {
    const fields = useMemo(() => proxy(getFormValueProxies(form)), [])
    const snap = useSnapshot(fields)

    return unwrapValues(snap) as FormValueFromModel<T>
}
