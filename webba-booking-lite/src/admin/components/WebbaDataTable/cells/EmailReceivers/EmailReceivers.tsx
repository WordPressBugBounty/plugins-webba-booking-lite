import { CellContext } from '@tanstack/react-table'
import { useMemo } from 'react'
import metadata from '../../../../../schemas/email_templates.json'

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

    const formattedOptions: string[] = useMemo(
        () =>
            value && value.map((receiver: string) =>
                options[receiver] ? options[receiver] : receiver
            ),
        [value]
    )

    return <div>{formattedOptions && formattedOptions.join(', ')}</div>
}
