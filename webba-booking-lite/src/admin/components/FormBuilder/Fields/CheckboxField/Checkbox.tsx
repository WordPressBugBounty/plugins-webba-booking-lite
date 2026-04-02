import { __ } from '@wordpress/i18n'

import { Textarea } from '../../../Textarea/Textarea'
import { useGroupField } from '../../hooks/useGroup'
import { BuilderFieldProps } from '../types'

export const CheckboxField = ({ group }: BuilderFieldProps) => {
    const field = useGroupField(group.id, 'checkboxText')

    return (
        <Textarea
            name="checkbox-text"
            label={__('Text next to checkbox', 'webba-booking-lite')}
            placeholder={__(
                'I accept terms and conditions',
                'webba-booking-lite'
            )}
            value={field.value.value}
            onChange={field.setValue}
        />
    )
}
