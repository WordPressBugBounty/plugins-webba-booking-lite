import { useField } from '../../lib/hooks/useField'
import { FormComponentConstructor } from '../../lib/types'
import { ValidatorFn, Validators } from '../../utils/validation'
import { GenericFormField } from '../GenericFormField/GenericFormField'

export const createTextField: FormComponentConstructor<string> = ({
    field,
    fieldConfig,
}) => {
    const subTypeValidators: ValidatorFn<string>[] = []

    switch (fieldConfig.misc?.sub_type) {
        case 'email':
            subTypeValidators.push(Validators.email)
            break
        case 'none_negative_float':
            subTypeValidators.push(Validators.noneNegativeFloat)
            break
        case 'none_negative_integer':
            subTypeValidators.push(Validators.noneNegativeInteger)
            break
        case 'positive_integer':
            subTypeValidators.push(Validators.positiveInteger)
            break
        default:
            break
    }

    field.setValidators([
        Validators.textCharCountBetween(
            fieldConfig.misc?.min,
            fieldConfig.misc?.max
        ),
        ...subTypeValidators,
    ])

    return ({ name, label }) => {
        const { value, setValue, errors } = useField(field)

        return (
            <GenericFormField
                value={value}
                onChange={setValue}
                errors={errors}
                id={name}
                type="text"
                label={label}
                misc={fieldConfig.misc}
            />
        )
    }
}
