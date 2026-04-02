import { useSelect } from '@wordpress/data'
import { CellContext } from '@tanstack/react-table'
import { useMemo } from 'react'
import { store } from '../../../../../store/backend'

export const ServiceNames = ({ getValue }: CellContext<any, any>) => {
    const services = useSelect(
        (select) => select(store).getItems('services'),
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
                    service.id &&
                    selectedServices &&
                    selectedServices.length > 0 &&
                    selectedServices.includes(service.id.toString())
            )
            .map((service: any) => service.name)
        return names.join(', ')
    }, [services, getValue])

    return <div>{names}</div>
}
