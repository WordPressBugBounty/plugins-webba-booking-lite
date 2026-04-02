import { useMemo } from 'react'
import { proxy, useSnapshot } from 'valtio'
import { FormFromModel, FormValueFromModel } from '../types'
import { Model } from '../../../../types'
import { Primitive, unwrapValues } from '../../../../utils/primitive'

const getFormValueProxies = ({ fields }: FormFromModel) => {
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
