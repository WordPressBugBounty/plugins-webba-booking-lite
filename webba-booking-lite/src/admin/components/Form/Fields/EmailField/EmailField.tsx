import { useField } from '../../lib/hooks/useField'
import { FormComponentConstructor } from '../../lib/types'
import { Validators } from '../../utils/validation'
import { GenericFormField } from '../GenericFormField/GenericFormField'
import { __ } from '@wordpress/i18n'

export const createEmailField: FormComponentConstructor<string> = ({
    field,
}) => {
    field.setValidators([Validators.email])

    return ({ name, misc }) => {
        const { value, errors, setValue } = useField(field)

        return (
            <GenericFormField
                value={value}
                onChange={setValue}
                errors={errors}
                id={name}
                type="text"
                label={field.label || __('Email', 'webba-booking-lite')}
                misc={misc}
            />
        )
    }
}
