import { useSelect } from '@wordpress/data'
import { store_name } from '../../../../../store'
import { CellContext } from '@tanstack/react-table'
import { __ } from '@wordpress/i18n'
import styles from './ServiceName.module.scss'

export const ServiceName = ({ getValue }: CellContext<any, any>) => {
    const { services } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        [getValue]
    )

    return (
        (services &&
            services.find(
                (service: any) => service.id?.toString() === getValue()
            )?.label) || (
            <div className={styles.nullService}>
                {__('NULL', 'webba-booking-lite')}
            </div>
        )
    )
}
