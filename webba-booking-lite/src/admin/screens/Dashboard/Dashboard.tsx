import { FilterForm } from '../../components/Filter/FilterForm'
import { filterFields } from './FilterConfigs'
import styles from './Dashboard.module.scss'
import { Chart } from './Chart'
import iconApprovedBookings from '../../../../public/images/data-approved-bookings-icon.png'
import iconPendingBookings from '../../../../public/images/data-pending-bookings-icon.png'
import iconRevenue from '../../../../public/images/data-money-icon.png'
import { Stat } from './Stat/Stat'
import { __ } from '@wordpress/i18n'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../store/backend'
import { useMemo } from 'react'
import { RecentBookings } from './RecentBookings'

export const Dashboard = () => {
    const data = useSelect(
        // @ts-ignore
        (select) => select(store_name).getDashboardStats(),
        []
    )
    const filterForm = <FilterForm fields={filterFields} model="dashboard" />
    const balanceDetail = useMemo(() => {
        return (
            <div className={styles.balanceDetail}>
                <span className={styles.balancePositive}>
                    {data?.balance_approved || 0}
                </span>
                <span>|</span>
                <span className={styles.balanceNegative}>
                    {data?.balance_pending || 0}
                </span>
            </div>
        )
    }, [data])

    return (
        <div className={styles.wrapper}>
            <RecentBookings />
            <div className={styles.bottomContent}>
                {filterForm}
                {data && (
                    <div className={styles.blocks}>
                        <Stat
                            icon={iconRevenue}
                            title={data?.balance}
                            value={balanceDetail}
                        />
                        <Stat
                            icon={iconApprovedBookings}
                            title={data?.approved}
                            value={__(
                                'Approved Bookings',
                                'webba-booking-lite'
                            )}
                        />
                        <Stat
                            icon={iconPendingBookings}
                            title={data?.pending}
                            value={__('Pending Bookings', 'webba-booking-lite')}
                        />
                    </div>
                )}
                {data?.chart && (
                    <Chart data={data?.chart} priceFormat={data?.priceFormat} />
                )}
            </div>
        </div>
    )
}
