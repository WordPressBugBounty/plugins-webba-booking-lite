import { useField } from '../../lib/hooks/useField'
import { FormComponentConstructor } from '../../lib/types'
import { Toggle } from '../Toggle/Toggle'

export const createCheckboxField: FormComponentConstructor<any> = ({
    field,
}) => {
    return ({ name, label, misc }) => {
        const { value, setValue, errors } = useField(field)

        return (
            <Toggle
                name={name}
                label={label}
                onChange={setValue}
                initialValue={value}
                valueOn={'yes'}
                valueOff={''}
            />
        )
    }
}
