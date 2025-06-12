import { createContext, PropsWithChildren, useContext } from 'react'
import { DynamicTable } from '../hooks/useWbkTable'

interface TableProviderProps<T> {
    table: DynamicTable<T>
}

const TableContext = createContext<DynamicTable<any> | null>(null)

export const useTable = function () {
    const ctx = useContext(TableContext)

    if (ctx === null) {
        throw new Error(`'useTable' must be used within a 'TableProvider'`)
    }

    return ctx
}

export const TableProvider = function <T>({
    table,
    children,
}: PropsWithChildren<TableProviderProps<T>>) {
    return (
        <TableContext.Provider value={table}>{children}</TableContext.Provider>
    )
}
