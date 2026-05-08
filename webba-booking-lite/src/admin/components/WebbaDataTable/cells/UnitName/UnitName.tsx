import { useSelect } from '@wordpress/data'
import { store } from '../../../../../store/backend'
import { CellContext } from '@tanstack/react-table'
import { __ } from '@wordpress/i18n'
import './UnitName.scss'

export const UnitName = ({ getValue }: CellContext<any, any>) => {
    const { units } = useSelect(
        (select) => select(store).getPreset(),
        [getValue]
    )

    return (
        units &&
        units.find(
            (unit: any) => unit.id?.toString() === getValue()
        )?.label
    )
}
