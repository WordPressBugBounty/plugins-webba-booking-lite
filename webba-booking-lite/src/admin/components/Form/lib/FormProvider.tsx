import { createContext, PropsWithChildren, useContext } from 'react'
import { FormFromModel } from './types'
import { Model } from '../../../types'
import { TooltipMode } from '../types'

interface FormContextValue {
    form: FormFromModel<any>
    tooltipMode?: TooltipMode
    lockFieldsOnly?: boolean
}

export const FormContext = createContext<FormContextValue | null>(null)

export const useForm = <T extends Model = any>() => {
    const ctx = useContext(FormContext)

    if (!ctx) {
        throw new Error('No form context')
    }

    return ctx.form as FormFromModel<T>
}

export const useFormContext = () => {
    const ctx = useContext(FormContext)

    if (!ctx) {
        throw new Error('No form context')
    }

    return ctx
}

export const FormProvider = ({
    form,
    tooltipMode = 'tooltip',
    lockFieldsOnly = false,
    children,
}: PropsWithChildren<FormContextValue>) => (
    <FormContext.Provider value={{ form, tooltipMode, lockFieldsOnly }}>
        {children}
    </FormContext.Provider>
)
