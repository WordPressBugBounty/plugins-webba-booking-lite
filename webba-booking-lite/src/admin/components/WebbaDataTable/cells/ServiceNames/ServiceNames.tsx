import { useSelect } from '@wordpress/data'
import { store_name } from '../../../../../store'
import { CellContext } from '@tanstack/react-table'
import { useMemo } from 'react'

export const ServiceNames = ({ getValue }: CellContext<any, any>) => {
    const services = useSelect(
        // @ts-ignore
        (select) => select(store_name).getItems('services'),
        [getValue]
    )

    const names = useMemo(() => {
        const selectedServices =
            (typeof getValue() === 'string' &&
                getValue().length > 0 &&
                JSON.parse(getValue())) ||
            getValue()

        const names = services
            .filter(
                (service: any) =>
                    selectedServices &&
                    selectedServices.includes(service.id.toString())
            )
            .map((service: any) => service.name)
        return names.join(', ')
    }, [services, getValue])

    return <div>{names}</div>
}
