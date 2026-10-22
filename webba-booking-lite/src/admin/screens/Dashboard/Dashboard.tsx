import './Dashboard.scss'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../store/backend'
import { RecentBookings } from './RecentBookings'
import { HoursAvailability } from './DashboardBreakdown/HoursAvailability'
import { BusinessOverview } from './DashboardBreakdown/BusinessOverview'
import { WelcomeMessage } from './DashboardBreakdown/WelcomeMessage'

export const Dashboard = () => {
    const data = useSelect(
        // @ts-ignore
        (select) => select(store_name).getDashboardStats(),
        []
    )

    return (
        <div className="wbk_dashboard__wrapper">
            <WelcomeMessage data={data?.welcomeMessage} />
            <RecentBookings />
            <div className="wbk_dashboard__bottomContent">
                <HoursAvailability data={data?.hoursAvailability} />
                <BusinessOverview data={data?.businessOverview} />
            </div>
        </div>
    )
}
