import { PropsWithChildren } from 'react'
import { useField } from './lib/hooks/useField'
import { FormField } from './lib/types'

interface DependencyValidatorProps {
    field: FormField<any>
}

export const DependencyValidator = ({
    field,
    children,
}: PropsWithChildren<DependencyValidatorProps>) => {
    const formField = useField(field)

    if (formField.isIgnored) {
        return null
    }

    return children
}
