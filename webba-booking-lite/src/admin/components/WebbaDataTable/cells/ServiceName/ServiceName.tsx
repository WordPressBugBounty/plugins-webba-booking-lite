import { useSelect } from '@wordpress/data'
import { store } from '../../../../../store/backend'
import { CellContext } from '@tanstack/react-table'
import { __ } from '@wordpress/i18n'
import './ServiceName.scss'

export const ServiceName = ({ getValue }: CellContext<any, any>) => {
    const { services } = useSelect(
        (select) => select(store).getPreset(),
        [getValue]
    )

    return (
        (services &&
            services.find(
                (service: any) => service.id?.toString() === getValue()
            )?.label) || (
            <div className="wbk_serviceName__nullService">
                {__('NULL', 'webba-booking-lite')}
            </div>
        )
    )
}
