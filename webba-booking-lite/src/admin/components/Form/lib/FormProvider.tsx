import { createContext, PropsWithChildren, useContext } from 'react'
import { FormFromModel } from './types'
import { Model } from '../../../types'

interface FormContextValue {
    form: FormFromModel<any>
}

const FormContext = createContext<FormContextValue | null>(null)

export const useForm = <T extends Model = any>() => {
    const ctx = useContext(FormContext)

    if (!ctx) {
        throw new Error('No form context')
    }

    return ctx.form as FormFromModel<T>
}

export const FormProvider = ({
    form,
    children,
}: PropsWithChildren<FormContextValue>) => (
    <FormContext.Provider value={{ form }}>{children}</FormContext.Provider>
)
