import { PropsWithChildren } from 'react'
import { useField } from './lib/hooks/useField'
import { FormField } from './lib/types'
import { useHideLogic } from './lib/hooks/useHideLogic'
import { FormFieldMisc, IHideCondition } from './types'
import { useDependantValue } from './lib/hooks/useDependantValue'

interface DependencyValidatorProps {
    field: FormField<any>
    misc?: FormFieldMisc
}

export const DependencyValidator = ({
    field,
    misc,
    children,
}: PropsWithChildren<DependencyValidatorProps>) => {
    const formField = useField(field)
    const isHidden =
        useHideLogic({ conditions: misc?.hide } as IHideCondition) || false

    useDependantValue({
        value: misc?.dependent_value?.value || '',
        condition: misc?.dependent_value?.condition || [],
        defaultValue: formField.value || '',
        fieldName: formField.name || '',
    })

    if (formField.isIgnored || isHidden) {
        return null
    }

    return children
}
