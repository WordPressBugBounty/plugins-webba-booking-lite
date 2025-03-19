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
import styles from './Dashboard.module.scss'
import interestIcon from '../../../../public/images/interests-empty.png'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../store/backend'
import { __ } from '@wordpress/i18n'

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
    const { is_pro } = useSelect((select) => select(store_name).getPreset(), [])

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

    return (
        <div className={styles.chart}>
            {!is_pro && (
                <div className={styles.promotionWrapper}>
                    <img
                        src={interestIcon}
                        alt={__('Upgrade logo', 'webba-booking-lite')}
                    />
                    <p>
                        {__(
                            'Booking statistics graph is available for Webba Booking Pro users only',
                            'webba-booking-lite'
                        )}
                    </p>
                </div>
            )}
            {is_pro && <Line data={data} options={options} />}
        </div>
    )
}
