import { createContext, PropsWithChildren, useContext } from 'react'
import { IFormContext, IFormContextProps } from './types'
import { useState } from 'react'

export const FormContext = createContext<IFormContext | unknown>(null)

export const useForm = () => {
    const ctx = useContext(FormContext)

    if (!ctx) {
        throw new Error('No form context')
    }

    return ctx as IFormContext
}

export const FormProvider = ({
    fields,
    setFields,
    children,
}: PropsWithChildren<IFormContextProps>) => {
    const [anyTouched, setAnyTouched] = useState(false)
    return (
        <FormContext.Provider
            value={{ fields, setFields, anyTouched, setAnyTouched }}
        >
            {children}
        </FormContext.Provider>
    )
}
