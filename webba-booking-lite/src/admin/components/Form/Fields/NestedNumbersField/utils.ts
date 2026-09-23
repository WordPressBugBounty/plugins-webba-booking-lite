import { NestedNumberItem } from './types'

const isNumericText = (value: string) => /^-?\d+(\.\d+)?$/.test(value.trim())

let itemId = 0

export const createNestedNumberItem = (value = ''): NestedNumberItem => {
    itemId += 1
    return {
        id: `nested-number-${itemId}`,
        value,
    }
}

const toNumberList = (raw: unknown): number[] => {
    if (Array.isArray(raw)) {
        return raw
            .map((item) => {
                if (typeof item === 'number' && Number.isFinite(item)) {
                    return item
                }
                if (typeof item === 'string' && isNumericText(item)) {
                    return Number(item)
                }
                return null
            })
            .filter((item): item is number => item !== null)
    }

    if (typeof raw === 'string') {
        const trimmed = raw.trim()
        if (!trimmed) {
            return []
        }
        try {
            return toNumberList(JSON.parse(trimmed))
        } catch {
            return trimmed
                .split(',')
                .map((item) => item.trim())
                .filter(isNumericText)
                .map((item) => Number(item))
        }
    }

    return []
}

export const readNestedNumbers = (value: unknown): number[] => toNumberList(value)

export const parseNestedNumbers = (value: unknown): NestedNumberItem[] =>
    readNestedNumbers(value).map((number) => createNestedNumberItem(String(number)))

export const serializeNestedNumbers = (items: NestedNumberItem[]): number[] =>
    items
        .map((item) => item.value.trim())
        .filter(isNumericText)
        .map((item) => Number(item))
