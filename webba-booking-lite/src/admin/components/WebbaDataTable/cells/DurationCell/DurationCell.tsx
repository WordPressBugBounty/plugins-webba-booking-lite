import { CellContext } from '@tanstack/react-table'
import { useSelect } from '@wordpress/data'
import React from 'react'
import { store_name } from '../../../../../store/backend'
import { minutesToText } from '../../utils'

export const DurationCell = ({ cell }: CellContext<any, any>) => {
    const services = useSelect(
        (select) => select(store_name).getItems('services'),
        []
    )

    return minutesToText(
        cell.row.original?.duration ||
            services.find(
                (service: any) => service.id == cell.row.original.service_id
            )?.duration
    )
}
