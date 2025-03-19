import { useField } from '../../lib/hooks/useField'
import { FormComponentConstructor } from '../../lib/types'
import { FormFieldProps } from '../../types'
import { GenericSelectField } from '../GenericSelectField/GenericSelectField'
import { getSelectFieldOptions } from '../GenericSelectField/utils'

interface PaymentSelectFieldProps extends FormFieldProps {
    value: string[]
    onChange: (value: string) => void
}

const options = getSelectFieldOptions('payment_method')

export const createPaymentSelectField: FormComponentConstructor<
    any,
    PaymentSelectFieldProps
> = ({ field }) => {
    return ({ label, value, onChange }) => {
        const { errors } = useField(field)

        return (
            <GenericSelectField
                label={label}
                multiple
                onChange={(value) => {
                    onChange(JSON.stringify(value))
                }}
                id="payment-field"
                options={options}
                value={value}
                errors={errors}
            />
        )
    }
}
