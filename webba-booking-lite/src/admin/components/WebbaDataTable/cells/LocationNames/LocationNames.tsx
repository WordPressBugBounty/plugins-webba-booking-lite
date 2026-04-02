import { useSelect } from '@wordpress/data'
import { store } from '../../../../../store/backend'
import { CellContext } from '@tanstack/react-table'
import { useMemo } from 'react'

export const LocationNames = ({ getValue }: CellContext<any, any>) => {
    const locations = useSelect(
        (select) => select(store).getItems('locations'),
        [getValue]
    )

    const names = useMemo(() => {
        const raw = getValue()
        const selectedIds =
            typeof raw === 'string' && raw.length > 0
                ? (() => {
                    try {
                        const parsed = JSON.parse(raw)
                        return Array.isArray(parsed) ? parsed : [raw]
                    } catch {
                        return [raw]
                    }
                })()
                : Array.isArray(raw)
                    ? raw
                    : raw != null && raw !== ''
                        ? [raw]
                        : []

        if (!locations?.length || !selectedIds.length) return ''

        return locations
            .filter(
                (location: any) =>
                    location.id != null &&
                    selectedIds.some(
                        (id: any) => String(location.id) === String(id)
                    )
            )
            .map((location: any) => location.name)
            .join(', ')


    }, [locations, getValue])

    return <div>{names}</div>
}
