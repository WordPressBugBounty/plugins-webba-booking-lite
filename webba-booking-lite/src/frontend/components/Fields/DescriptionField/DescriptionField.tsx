import classNames from 'classnames'
import { useField } from '../../Form/hooks/useField'
import { IFieldProps } from '../../Form/types'
import fieldStyles from '../Fields.module.scss'
import { FormNotice } from '../../FormNotice/FormNotice'

export const DescriptionField = ({
    fieldConstructor,
    anyTouched,
}: IFieldProps) => {
    const { width, defaultValue } = useField(fieldConstructor)

    return (
        <div
            className={classNames('wbk_input', {
                'wbk_input--half-width': width === 'half-width',
            })}
        >
            <FormNotice notice={defaultValue as string} />
        </div>
    )
}
