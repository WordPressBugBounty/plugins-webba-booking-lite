import { CellContext } from '@tanstack/react-table'
import { useMemo } from 'react'
import metadata from '../../../../../schemas/email_templates.json'
import './EmailReceivers.scss'

export const EmailReceivers = ({ getValue }: CellContext<any, any>) => {
    const value: string[] = useMemo(() => {
        try {
            return JSON.parse(getValue()) || []
        } catch (e) {
            return getValue()
        }
    }, [getValue])

    const options: Record<string, string> =
        metadata.properties?.recipients.misc.options

    const getBadgeClass = (receiver: string) => {
        if (receiver === 'customer') return 'wbk_emailReceivers__badge--customer'
        if (receiver === 'admin') return 'wbk_emailReceivers__badge--admin'
        return 'wbk_emailReceivers__badge--default'
    }

    return (
        <div className="wbk_emailReceivers__badges">
            {value?.map((receiver: string) => (
                <span
                    key={receiver}
                    className={`wbk_emailReceivers__badge ${getBadgeClass(receiver)}`}
                >
                    {options[receiver] ? options[receiver] : receiver}
                </span>
            ))}
        </div>
    )
}
