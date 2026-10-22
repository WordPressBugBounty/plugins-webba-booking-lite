import { CSSProperties } from 'react'
import { __, sprintf } from '@wordpress/i18n'
import './HoursAvailability.scss'
import { HoursAvailabilityData, HoursAvailabilityProps } from './types'
import {
    formatDashboardDate,
    formatDashboardMonthRange,
    useDashboardTimezone,
} from './dashboardTime'

const formatInsightText = (
    data: HoursAvailabilityData,
    timezone: string
) => {
    const daysWithTimestamps = data.days.filter((day) => day.timestamp)
    if (!daysWithTimestamps.length) {
        return data.insightText
    }

    const openDays = [...daysWithTimestamps]
        .filter((day) => !day.isClosed && day.remainingHours > 0)
        .sort((left, right) => right.remainingHours - left.remainingHours)
        .slice(0, 2)

    if (!openDays.length) {
        return __('No availability in the week ahead.', 'webba-booking-lite')
    }

    const weekdayNames = openDays.map((day) =>
        formatDashboardDate(day.timestamp as number, 'l', timezone)
    )

    if (weekdayNames.length === 1) {
        return sprintf(
            __('Most availability on %s.', 'webba-booking-lite'),
            weekdayNames[0]
        )
    }

    return sprintf(
        __('Most availability on %s and %s.', 'webba-booking-lite'),
        weekdayNames[0],
        weekdayNames[1]
    )
}

export const HoursAvailability = ({ data }: HoursAvailabilityProps) => {
    const { timezone } = useDashboardTimezone()

    if (!data || !data.days?.length) {
        return null
    }

    const firstTimestamp = data.days[0]?.timestamp
    const lastTimestamp = data.days[data.days.length - 1]?.timestamp
    const dateRangeLabel =
        firstTimestamp && lastTimestamp
            ? formatDashboardMonthRange(firstTimestamp, lastTimestamp, timezone)
            : data.dateRangeLabel
    const insightText = formatInsightText(data, timezone)

    return (
        <section className="wbk_hoursAvailability">
            <div className="wbk_hoursAvailability__body">
                <div className="wbk_hoursAvailability__summary">
                    <header className="wbk_hoursAvailability__header">
                        <h2 className="wbk_hoursAvailability__title">{data.title}</h2>
                        <p className="wbk_hoursAvailability__subtitle">
                            {dateRangeLabel}
                            <span className="wbk_hoursAvailability__subtitleDivider">
                                ·
                            </span>
                            {data.staffLabel}
                        </p>
                    </header>
                    <p className="wbk_hoursAvailability__percent">
                        {data.bookedPercent}%
                    </p>
                    <p className="wbk_hoursAvailability__percentLabel">
                        {__(
                            'of available hours booked',
                            'webba-booking-lite'
                        )}
                    </p>
                </div>
                <div className="wbk_hoursAvailability__chart" role="list">
                    {data.days.map((day) => {
                        const fillPercent = day.isClosed
                            ? 0
                            : Math.max(0, Math.min(100, day.bookedPercent ?? 0))

                        return (
                            <div
                                key={day.date}
                                className="wbk_hoursAvailability__day"
                                role="listitem"
                            >
                                <span className="wbk_hoursAvailability__dayLabel">
                                    {day.timestamp
                                        ? formatDashboardDate(
                                              day.timestamp,
                                              'D',
                                              timezone
                                          )
                                        : day.dayLabel}
                                </span>
                                <div
                                    className="wbk_hoursAvailability__barTrack"
                                    aria-hidden="true"
                                >
                                    <div
                                        className="wbk_hoursAvailability__barFill"
                                        style={
                                            {
                                                '--wbk-bar-fill': `${fillPercent}%`,
                                            } as CSSProperties
                                        }
                                    />
                                </div>
                                <span className="wbk_hoursAvailability__dayValue">
                                    {day.isClosed
                                        ? __(
                                            'Closed',
                                            'webba-booking-lite'
                                        )
                                        : `${day.bookedPercent}%`}
                                </span>
                            </div>
                        )
                    })}
                </div>
                <div className="wbk_hoursAvailability__insight">
                    <p className="wbk_hoursAvailability__remaining">
                        {data.remainingHoursLabel}
                    </p>
                    <p className="wbk_hoursAvailability__insightText">
                        {insightText}
                    </p>
                </div>
            </div>
        </section>
    )
}
