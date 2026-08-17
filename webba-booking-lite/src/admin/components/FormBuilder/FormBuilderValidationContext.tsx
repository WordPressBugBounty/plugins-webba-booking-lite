import { createContext, useContext } from 'react'

interface FormBuilderValidationContextValue {
    showValidation: boolean
}

const FormBuilderValidationContext =
    createContext<FormBuilderValidationContextValue>({
        showValidation: false,
    })

export const FormBuilderValidationProvider =
    FormBuilderValidationContext.Provider

export const useFormBuilderValidation = () =>
    useContext(FormBuilderValidationContext)
