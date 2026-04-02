import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
    Colors,
} from 'chart.js'
import { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import './Dashboard.scss'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../store/backend'
import { __ } from '@wordpress/i18n'
import { ProFeatuerWrapper } from '../../components/ProFeatuerWrapper/ProFeatuerWrapper'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Colors
)

export const Chart = ({ data, priceFormat }: any) => {
    const { plan_map } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )
    const requiredPlans = ['standard', 'premium', 'pro']
    const isChartAvailable = useMemo(() => {
        return plan_map && requiredPlans.some((plan) => plan_map[plan] === true)
    }, [requiredPlans, plan_map])

    const options: ChartOptions<'line'> = useMemo(() => {
        return {
            responsive: true,
            stacked: false,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    beginAtZero: true,
                    ticks: {
                        display: true,
                        stepSize: 1,
                    },
                },
                yRevenu: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    ticks: {
                        display: true,
                        callback: (tickValue, index, ticks) => {
                            return priceFormat.replace('#price', tickValue)
                        },
                    },
                },
            },
            colors: [
                'rgb(125, 198, 119)',
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
            ],
        }
    }, [])

    const dummyData = {
        labels: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ],
        datasets: [
            {
                label: 'No. of bookings',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                borderWidth: 1,
                yAxisID: 'y',
            },
            {
                label: 'Revenue (approved)',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                borderWidth: 1,
                yAxisID: 'yRevenu',
            },
            {
                label: 'Revenue (pending)',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                borderWidth: 1,
                yAxisID: 'yRevenu',
            },
        ],
    }

    return (
        <div className="wbk_dashboard__chart">
            {!isChartAvailable && (
                <ProFeatuerWrapper requiredPlans={requiredPlans} />
            )}
            <Line
                data={isChartAvailable ? data : dummyData}
                options={options}
            />
        </div>
    )
}
