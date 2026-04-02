import { proxy } from 'valtio'

export interface Primitive<T> {
    value: T
}

export const primitive = <T>(value: T): Primitive<T> => proxy({ value })

export const unwrapValues = (fields: Record<string, Primitive<any>>) => {
    const result: Record<string, Primitive<any>> = {}

    for (const key of Object.keys(fields)) {
        result[key] = fields[key].value
    }

    return result
}
