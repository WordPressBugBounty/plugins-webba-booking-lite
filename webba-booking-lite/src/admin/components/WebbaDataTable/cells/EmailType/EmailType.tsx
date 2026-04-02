import { CellContext } from '@tanstack/react-table'
import metadata from '../../../../../schemas/email_templates.json'
import { useMemo } from 'react'
import { TEmailTypes } from './types'
import { useSelect } from '@wordpress/data'
import { store } from '../../../../../store/backend'

export const EmailType = ({ getValue }: CellContext<any, any>) => {
    const types: TEmailTypes = useSelect(
        (select) =>
            select(store).getFieldOptions('email_templates', 'type', []),
        []
    )

    const selectedType = useMemo(() => {
        for (let type in types) {
            if (type === getValue()) {
                return types[type]
            }
        }

        return getValue()
    }, [getValue, types])

    return <div>{selectedType}</div>
}
