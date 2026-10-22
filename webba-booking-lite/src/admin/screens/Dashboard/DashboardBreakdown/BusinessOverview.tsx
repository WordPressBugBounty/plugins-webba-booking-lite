import { CSSProperties, useMemo, useState } from 'react'
import { __, sprintf } from '@wordpress/i18n'
import { useSelect } from '@wordpress/data'
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    ChartOptions,
    Legend,
    LinearScale,
    Tooltip,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { store } from '../../../../store/backend'
import { FilterForm } from '../../../components/Filter/FilterForm'
import { IFilterField } from '../../../components/Filter/types'
import { BusinessMetricCard } from './BusinessMetricCard'
import {
    businessDateRangeField,
    businessLocationField,
    businessPeriodField,
    businessStaffField,
    getDefaultBusinessDateRangeValue,
} from './BusinessOverviewFilters'
import { BusinessTopServiceRow } from './BusinessTopServiceRow'
import { BusinessOverviewData, BusinessOverviewProps } from './types'
import {
    formatDashboardDate,
    formatDashboardDayRange,
    useDashboardTimezone,
} from './dashboardTime'
import './BusinessOverview.scss'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

type TrendMode = 'bookings' | 'payments'

const STAFF_LOCATION_PLANS = ['premium', 'pro', 'proextended']

const readThemeColor = (variableName: string, fallback: string) => {
    if (typeof window === 'undefined') {
        return fallback
    }
    const root = document.getElementById('wbk_spa_dashboard')
    if (!root) {
        return fallback
    }
    const value = getComputedStyle(root).getPropertyValue(variableName).trim()
    return value || fallback
}

const formatComparisonSummary = (
    overview: BusinessOverviewData,
    timezone: string
) => {
    if (
        !overview.selectedStart ||
        !overview.selectedEnd ||
        !overview.previousStart ||
        !overview.previousEnd ||
        !overview.periodDays
    ) {
        return overview.comparisonSummary
    }

    return sprintf(
        __(
            '%1$s · Compared with %2$s · %3$d days each · %4$s · %5$s',
            'webba-booking-lite'
        ),
        formatDashboardDayRange(
            overview.selectedStart,
            overview.selectedEnd,
            timezone
        ),
        formatDashboardDayRange(
            overview.previousStart,
            overview.previousEnd,
            timezone
        ),
        overview.periodDays,
        overview.staffLabel,
        overview.locationLabel
    )
}

const formatUpcomingSubtitle = (
    overview: BusinessOverviewData,
    timezone: string
) => {
    if (
        !overview.upcomingStart ||
        !overview.upcomingEnd ||
        !overview.periodDays
    ) {
        return overview.upcomingValue.subtitle
    }

    return sprintf(
        __('Next %1$d days · %2$s', 'webba-booking-lite'),
        overview.periodDays,
        formatDashboardDayRange(
            overview.upcomingStart,
            overview.upcomingEnd,
            timezone,
            true
        )
    )
}

export const BusinessOverview = ({ data }: BusinessOverviewProps) => {
    const { timezone } = useDashboardTimezone()
    const [trendMode, setTrendMode] = useState<TrendMode>('bookings')
    const [selectedPeriod, setSelectedPeriod] = useState<string>(
        String(businessPeriodField.value || 'l_30')
    )
    const [customDateRange, setCustomDateRange] = useState(
        getDefaultBusinessDateRangeValue()
    )
    const [selectedStaffId, setSelectedStaffId] = useState<string | number>(0)
    const [selectedLocationId, setSelectedLocationId] = useState<
        string | number
    >(0)

    const { plan_map, staffMembers, locations } = useSelect(
        // @ts-ignore
        (select) => ({
            plan_map: select(store).getPreset()?.plan_map,
            staffMembers: select(store).getItems('staff_members') || [],
            locations: select(store).getItems('locations') || [],
        }),
        []
    )

    const isPaidPlan = useMemo(
        () =>
            Boolean(
                plan_map &&
                STAFF_LOCATION_PLANS.some((plan) => plan_map[plan] === true)
            ),
        [plan_map]
    )

    const showStaffFilter = isPaidPlan && staffMembers.length > 0
    const showLocationFilter = isPaidPlan && locations.length > 0

    const filterFields = useMemo(() => {
        const fields: IFilterField[] = [
            {
                ...businessPeriodField,
                value: selectedPeriod,
            },
        ]

        if (selectedPeriod === 'custom') {
            fields.push({
                ...businessDateRangeField,
                value: customDateRange,
            })
        }

        if (showStaffFilter) {
            fields.push({
                ...businessStaffField,
                value: selectedStaffId,
            })
        }

        if (showLocationFilter) {
            fields.push({
                ...businessLocationField,
                value: selectedLocationId,
            })
        }

        return fields
    }, [
        selectedPeriod,
        customDateRange,
        selectedStaffId,
        selectedLocationId,
        showStaffFilter,
        showLocationFilter,
    ])

    const filterColumnCount = useMemo(() => {
        let count = 1
        if (selectedPeriod === 'custom') {
            count += 1
        }
        if (showStaffFilter) {
            count += 1
        }
        if (showLocationFilter) {
            count += 1
        }
        return count
    }, [selectedPeriod, showStaffFilter, showLocationFilter])

    const trendChartData = useMemo(() => {
        if (!data?.trend) {
            return null
        }

        const series =
            trendMode === 'bookings' ? data.trend.bookings : data.trend.payments
        const selectedColor = readThemeColor('--wbk-admin-green', '#0f766e')
        const previousColor = readThemeColor(
            '--wbk-admin-field-border',
            '#8a9393'
        )

        const labels =
            data.trend.labelTimestamps?.length === data.trend.labels.length
                ? data.trend.labelTimestamps.map((timestamp) =>
                      formatDashboardDate(timestamp, 'j M', timezone)
                  )
                : data.trend.labels

        return {
            labels,
            datasets: [
                {
                    label: data.trend.selectedLabel,
                    data: series.selected,
                    backgroundColor: selectedColor,
                    borderRadius: 4,
                    barPercentage: 0.7,
                    categoryPercentage: 0.65,
                },
                {
                    label: data.trend.previousLabel,
                    data: series.previous,
                    backgroundColor: previousColor,
                    borderRadius: 4,
                    barPercentage: 0.7,
                    categoryPercentage: 0.65,
                },
            ],
        }
    }, [data, trendMode, timezone])

    const trendOptions: ChartOptions<'bar'> = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        boxWidth: 10,
                        boxHeight: 10,
                        usePointStyle: false,
                        color: readThemeColor('--wbk-admin-text-grey', '#4b5563'),
                    },
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                },
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                    },
                    ticks: {
                        color: readThemeColor(
                            '--wbk-admin-text-grey',
                            '#4b5563'
                        ),
                    },
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: readThemeColor(
                            '--wbk-admin-row-border',
                            '#f3f4f6'
                        ),
                    },
                    ticks: {
                        color: readThemeColor(
                            '--wbk-admin-text-grey',
                            '#4b5563'
                        ),
                        precision: 0,
                    },
                },
            },
        }),
        []
    )

    if (!data) {
        return null
    }

    const metrics = [
        data.metrics.confirmedBookings,
        data.metrics.paymentsCollected,
        data.metrics.outstanding,
        data.metrics.cancellationRate,
    ]

    return (
        <section className="wbk_businessOverview">
            <div className="wbk_businessOverview__header">
                <h2 className="wbk_businessOverview__title">{data.title}</h2>
            </div>
            <FilterForm
                fields={filterFields}
                model="dashboard"
                columnCount={filterColumnCount}
                classes="wbk_businessOverview__filters"
                onFiltersChange={(query) => {
                    const filters = query as Array<{
                        name?: string
                        value?: unknown
                    }>

                    const periodFilter = filters.find(
                        (item) => item?.name === 'business_period'
                    )
                    const nextPeriod = periodFilter?.value
                        ? String(periodFilter.value)
                        : 'l_30'
                    setSelectedPeriod(nextPeriod)

                    const dayValues = filters
                        .filter(
                            (item) =>
                                item?.name === 'business_day' &&
                                item?.value !== undefined &&
                                item?.value !== ''
                        )
                        .map((item) => String(item.value))

                    if (dayValues.length >= 2) {
                        setCustomDateRange(`${dayValues[0]} - ${dayValues[1]}`)
                    }

                    const staffFilter = filters.find(
                        (item) => item?.name === 'appointment_staff_member_id'
                    )
                    setSelectedStaffId(
                        staffFilter?.value !== undefined &&
                            staffFilter?.value !== ''
                            ? (staffFilter.value as string | number)
                            : 0
                    )

                    const locationFilter = filters.find(
                        (item) => item?.name === 'appointment_location_id'
                    )
                    setSelectedLocationId(
                        locationFilter?.value !== undefined &&
                            locationFilter?.value !== ''
                            ? (locationFilter.value as string | number)
                            : 0
                    )
                }}
            />
            <p className="wbk_businessOverview__summary">
                {formatComparisonSummary(data, timezone)}
            </p>

            <article className="wbk_businessOverview__upcoming">
                <div className="wbk_businessOverview__upcomingMain">
                    <p className="wbk_businessOverview__cardEyebrow">
                        {data.upcomingValue.title}
                    </p>
                    <p className="wbk_businessOverview__cardSubtitle">
                        {formatUpcomingSubtitle(data, timezone)}
                    </p>
                    <p className="wbk_businessOverview__upcomingTotal">
                        {data.upcomingValue.totalFormatted}
                    </p>
                    <p className="wbk_businessOverview__cardMeta">
                        {data.upcomingValue.bookingsLabel}
                    </p>
                </div>
                <div className="wbk_businessOverview__upcomingSide">
                    <div className="wbk_businessOverview__paidRow">
                        <span>{__('Already paid', 'webba-booking-lite')}</span>
                        <strong>
                            {data.upcomingValue.alreadyPaidFormatted}
                        </strong>
                    </div>
                    <div className="wbk_businessOverview__paidRow">
                        <span>
                            {__('Remaining to collect', 'webba-booking-lite')}
                        </span>
                        <strong>
                            {data.upcomingValue.remainingFormatted}
                        </strong>
                    </div>
                    <div className="wbk_businessOverview__progressTrack">
                        <div
                            className="wbk_businessOverview__progressFill"
                            style={
                                {
                                    '--wbk-paid-percent': `${data.upcomingValue.paidPercent}%`,
                                } as CSSProperties
                            }
                        />
                    </div>
                    <p className="wbk_businessOverview__cardNote">
                        {data.upcomingValue.note}
                    </p>
                </div>
            </article>

            <div className="wbk_businessOverview__metrics">
                {metrics.map((metric) => (
                    <BusinessMetricCard key={metric.label} metric={metric} />
                ))}
            </div>

            <div className="wbk_businessOverview__bottom">
                <article className="wbk_businessOverview__trend">
                    <div className="wbk_businessOverview__trendHeader">
                        <div>
                            <h3 className="wbk_businessOverview__sectionTitle">
                                {data.trend.title}
                            </h3>
                            <p className="wbk_businessOverview__cardSubtitle">
                                {data.trend.subtitle}
                            </p>
                        </div>
                        <div
                            className="wbk_businessOverview__trendToggle"
                            role="group"
                            aria-label={__(
                                'Trend metric',
                                'webba-booking-lite'
                            )}
                        >
                            <button
                                type="button"
                                className={
                                    trendMode === 'bookings'
                                        ? 'is-active'
                                        : undefined
                                }
                                onClick={() => setTrendMode('bookings')}
                            >
                                {__('Bookings', 'webba-booking-lite')}
                            </button>
                            <button
                                type="button"
                                className={
                                    trendMode === 'payments'
                                        ? 'is-active'
                                        : undefined
                                }
                                onClick={() => setTrendMode('payments')}
                            >
                                {__('Payments', 'webba-booking-lite')}
                            </button>
                        </div>
                    </div>
                    <div className="wbk_businessOverview__trendChart">
                        {trendChartData && (
                            <Bar data={trendChartData} options={trendOptions} />
                        )}
                    </div>
                </article>

                <article className="wbk_businessOverview__topServices">
                    <div className="wbk_businessOverview__topServicesHeader">
                        <h3 className="wbk_businessOverview__sectionTitle">
                            {data.topServices.title}
                        </h3>
                        <span className="wbk_businessOverview__cardSubtitle">
                            {data.topServices.metricLabel}
                        </span>
                    </div>
                    <ul className="wbk_businessOverview__serviceList">
                        {data.topServices.items.map((item) => (
                            <BusinessTopServiceRow key={item.id} item={item} />
                        ))}
                        {data.topServices.items.length === 0 && (
                            <li className="wbk_businessOverview__serviceEmpty">
                                {__(
                                    'No confirmed bookings in this period.',
                                    'webba-booking-lite'
                                )}
                            </li>
                        )}
                    </ul>
                </article>
            </div>
        </section>
    )
}
