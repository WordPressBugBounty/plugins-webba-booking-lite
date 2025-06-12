import { CellContext } from '@tanstack/react-table'
import metadata from '../../../../../schemas/email_templates.json'
import { useMemo } from 'react'
import { TEmailTypes } from './types'

export const EmailType = ({ getValue }: CellContext<any, any>) => {
    const types: TEmailTypes = metadata?.properties.type.misc.options
    const selectedType = useMemo(() => {
        for (let type in types) {
            if (type === getValue()) {
                return types[type]
            }
        }

        return getValue()
    }, [getValue])

    return <div>{selectedType}</div>
}
