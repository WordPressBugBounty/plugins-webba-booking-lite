import { createContext, PropsWithChildren, useContext } from 'react'
import { IFilterContext } from './types'

const FilterContext = createContext<IFilterContext | null>(null)

export const useFilter = () => {
    const ctx = useContext(FilterContext)

    if (!ctx) {
        throw new Error('No filter context')
    }

    return { ...ctx } as IFilterContext
}

export const FilterProvider = ({
    fields,
    setFields,
    model,
    children,
}: PropsWithChildren<IFilterContext>) => {
    return (
        <FilterContext.Provider value={{ fields, setFields, model }}>
            {children}
        </FilterContext.Provider>
    )
}
