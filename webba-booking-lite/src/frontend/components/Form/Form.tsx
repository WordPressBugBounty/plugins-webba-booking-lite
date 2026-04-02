import { useMemo } from 'react'
import { useForm } from './FormProvider'
import { IFormContext } from './types'
import { createFormFields } from './utils'
import './Form.scss'
import '../Fields/Fields.scss'

export const Form = () => {
    const { fields, anyTouched } = useForm() as unknown as IFormContext
    const components = useMemo(
        () => createFormFields(fields, anyTouched),
        [fields, anyTouched]
    )

    return <form className={'wbk_form'}>{components}</form>
}
