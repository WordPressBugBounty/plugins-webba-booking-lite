import { useSelect } from '@wordpress/data'
import { CellContext } from '@tanstack/react-table'
import { useMemo } from 'react'
import { store } from '../../../../../store/backend'

export const UnitNames = ({ getValue }: CellContext<any, any>) => {
    const units = useSelect(
        (select) => select(store).getItems('units'),
        [getValue]
    )

    const names = useMemo(() => {
        const selectedUnits =
            (typeof getValue() === 'string' &&
                getValue().length > 0 &&
                JSON.parse(getValue())) ||
            getValue()

        const names = units
            .filter(
                (unit: any) =>
                    unit.id &&
                    selectedUnits &&
                    selectedUnits.length > 0 &&
                    selectedUnits.includes(unit.id.toString())
            )
            .map((unit: any) => unit.name)
        return names.join(', ')
    }, [units, getValue])

    return <div>{names}</div>
}
