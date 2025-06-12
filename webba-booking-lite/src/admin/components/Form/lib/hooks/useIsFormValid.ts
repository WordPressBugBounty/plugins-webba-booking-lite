import { proxy, useSnapshot } from 'valtio'
import { FormFromModel, Primitive } from '../types'
import { useMemo } from 'react'

const getFormErrorProxies = ({ fields }: FormFromModel) => {
    const errors: Record<string, Primitive<string[]>> = {}

    for (const field of Object.keys(fields)) {
        errors[field] = fields[field].errors
    }

    return errors
}

export const useIsFormValid = (form: FormFromModel) => {
    const errors = useMemo(() => proxy(getFormErrorProxies(form)), [])
    const snapshot = useSnapshot(errors)

    return !Object.keys(snapshot).length
}
