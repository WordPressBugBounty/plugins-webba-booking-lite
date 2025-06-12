import { Cell } from '@tanstack/react-table'
import { createContext, PropsWithChildren, useContext } from 'react'

interface CellProviderProps {
    cell: Cell<any, unknown>
}

const CellContext = createContext<Cell<any, unknown> | null>(null)

export const useCell = () => {
    const ctx = useContext(CellContext)

    if (ctx === null) {
        throw new Error(`'useCell' must be used within 'CellProvider'`)
    }

    return ctx
}

export const CellProvider = ({
    cell,
    children,
}: PropsWithChildren<CellProviderProps>) => (
    <CellContext.Provider value={cell}>{children}</CellContext.Provider>
)
