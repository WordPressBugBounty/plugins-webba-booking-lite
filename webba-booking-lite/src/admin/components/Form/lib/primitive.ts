import { proxy } from 'valtio'
import { Primitive } from './types'

export const primitive = <T>(value: T): Primitive<T> => proxy({ value })
