import { useField } from '../../lib/hooks/useField'
import { FormComponentConstructor } from '../../lib/types'
import { Validators } from '../../utils/validation'
import { GenericFormField } from '../GenericFormField/GenericFormField'

export const createNumericField: FormComponentConstructor<number> = ({
    field,
    fieldConfig,
}) => {
    field.setValidators([
        Validators.numberBetween(fieldConfig.misc?.min, fieldConfig.misc?.max),
    ])

    return ({ label, misc }) => {
        const { value, setValue, errors } = useField(field)

        return (
            <GenericFormField
                value={value}
                onChange={setValue}
                errors={errors}
                id={field.name}
                type="number"
                label={label}
                misc={misc}
            />
        )
    }
}
