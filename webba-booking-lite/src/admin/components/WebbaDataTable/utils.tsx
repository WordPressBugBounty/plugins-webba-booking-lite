import { ColumnDef } from '@tanstack/react-table'
import { JSONSchemaType, JSONType } from 'ajv'
import { WebbaDataCell } from './Cell'
import { SomeJSONSchema } from 'ajv/dist/types/json-schema'

export const defaultColumnModel: Partial<ColumnDef<any>> = {
    cell: (info) => <WebbaDataCell cell={info.cell} />,
}

export const makeColumn = function <T>(columnDef: Partial<ColumnDef<T>> = {}) {
    return {
        ...defaultColumnModel,
        ...columnDef,
    }
}

const createColumnByField = (
    name: string,
    schema: SomeJSONSchema
): ColumnDef<any> => {
    const defaultColumn: ColumnDef<any> = {
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

    return defaultColumn
}

export const generateColumns = function <T extends { properties: any }>(
    model: T,
    customDefs: Partial<
        Record<keyof T['properties'], Partial<ColumnDef<any>>>
    > = {}
) {
    return Object.keys(model.properties)
        .filter((key) => !model.properties[key].hidden)
        .map((property): ColumnDef<any> => {
            const customDef = customDefs[property]

            if (customDef) {
                return {
                    id: property,
                    accessorKey: property,
                    ...customDef,
                }
            }

            return createColumnByField(property, model.properties[property])
        })
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
