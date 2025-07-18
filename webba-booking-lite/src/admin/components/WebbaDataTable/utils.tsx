import { ColumnDef } from '@tanstack/react-table'
import { WebbaDataCell } from './Cell'

export const defaultColumnModel: Partial<ColumnDef<any>> = {
    cell: (info) => <WebbaDataCell cell={info.cell} />,
}

export const makeColumn = function <T>(columnDef: Partial<ColumnDef<T>> = {}) {
    return {
        ...defaultColumnModel,
        ...columnDef,
    }
}

const createColumnByField = (name: string, schema: any): ColumnDef<any> => {
    return {
        id: name,
        accessorKey: name,
        header: schema.title || name,
        meta: {
            field: {
                name,
                type: schema.type,
            },
        },
    }
}

type TExtraColumn<T extends 'id' | 'date' | 'time' | 'date_time'> = T

type TExtraColumnDef<TData> = Omit<ColumnDef<TData>, 'accessorKey'> & {
    accessorKey?: string
    index?: number
}

type TExtraColumns = Record<TExtraColumn<any>, TExtraColumnDef<any>> | null

export const generateColumnDefsFromModel = function <
    T extends { properties: any },
>(
    model: T,
    customDefs: Partial<
        Record<keyof T['properties'], Partial<ColumnDef<any, any>>>
    > = {},
    extraCols: TExtraColumns = null
) {
    const colDefs = Object.keys(model.properties)
        .filter((key) => !model.properties[key].hidden)
        .map((property): ColumnDef<any> => {
            const customDef = customDefs[property]

            if (customDef) {
                return {
                    id: property,
                    accessorKey: property,
                    header:
                        model.properties[property]?.title ||
                        model.properties[property]?.name,
                    ...customDef,
                }
            }

            return createColumnByField(property, model.properties[property])
        })

    for (let key in extraCols) {
        const colPosition = extraCols[key]?.index
        const mergedData = model.properties[key] || {}

        delete extraCols[key].index

        if (colDefs.find((colDef: any) => colDef.id == key)) {
            const existingColIndex = colDefs.findIndex(
                (colDef: any) => colDef.id == key
            )
            if (existingColIndex !== -1) {
                colDefs.splice(existingColIndex, 1)
            }
        }

        if (colPosition !== undefined) {
            colDefs.splice(colPosition, 0, {
                id: key,
                accessorKey: key,
                header: mergedData?.title || mergedData?.name,
                ...extraCols[key],
            })
            continue
        }

        colDefs.push({
            id: key,
            accessorKey: key,
            header: mergedData?.title || mergedData?.name,
            ...extraCols[key],
        })
    }

    return colDefs
}

export const getColumnVisibility = (
    columns: ColumnDef<any>[]
): Record<string, boolean> => {
    const visibility: Record<string, boolean> = {}

    for (const column of columns) {
        const meta = column.meta as any
        if (meta?.expandable) {
            visibility[column.id!] = false
        }
    }

    return visibility
}

function after(value: string, delimiter: string) {
    if (!value) return ''

    const substrings = value.split(delimiter)

    return substrings.length === 1
        ? value // delimiter is not part of the string
        : substrings.slice(1).join(delimiter)
}

type RemovePrefix<
    Value extends string,
    Prefix extends string,
> = Value extends `${Prefix}${infer Rest}` ? Rest : Value

export const removePrefixesFromModelFields = function <
    T extends { properties: any },
    Prefix extends string,
>(model: T, prefix: Prefix) {
    const result = {
        properties: {} as any,
    }

    for (const key of Object.keys(model.properties)) {
        const fieldName = after(key, prefix)
        result.properties[fieldName] = model.properties[key]
    }

    return result as {
        properties: {
            [K in keyof T['properties'] & string as RemovePrefix<
                K,
                Prefix
            >]: T['properties'][K]
        }
    }
}

export const mapServiceCategories = (service: number, categories: []) =>
    categories.filter((category: any) => category.services.includes(service))

export const minutesToText = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const minutesLeft = minutes % 60

    if (hours === 0) {
        return `${minutesLeft}min`
    }

    return `${hours}h ${minutesLeft > 0 ? minutesLeft + 'min' : ''}`
}

export const decodeHtmlEntities = (encoded: string): string => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(encoded, 'text/html')
    return doc.documentElement.textContent || ''
}
