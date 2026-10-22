import { useSelect } from '@wordpress/data'
import { store_name } from '../../../../store/backend'
import { wbkFormat } from '../../../components/Form/utils/dateTime'

export const useDashboardTimezone = () => {
    const settings = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset()?.settings,
        []
    )

    return {
        timezone: settings?.timezone || 'UTC',
        timeFormat: settings?.time_format || 'g:i A',
    }
}

export const formatDashboardDate = (
    timestamp: number,
    pattern: string,
    timezone: string
) => wbkFormat(Number(timestamp), pattern, timezone || 'UTC')

export const formatDashboardDayRange = (
    startTimestamp: number,
    endTimestamp: number,
    timezone: string,
    includeYear = false
) => {
    const startMonth = formatDashboardDate(startTimestamp, 'M', timezone)
    const endMonth = formatDashboardDate(endTimestamp, 'M', timezone)
    const startDay = formatDashboardDate(startTimestamp, 'j', timezone)
    const endDay = formatDashboardDate(endTimestamp, 'j', timezone)
    const yearSuffix = includeYear
        ? `, ${formatDashboardDate(endTimestamp, 'Y', timezone)}`
        : ''

    if (startMonth === endMonth) {
        return `${startDay} ${startMonth}–${endDay}${yearSuffix}`
    }

    return `${startDay} ${startMonth}–${endDay} ${endMonth}${yearSuffix}`
}

export const formatDashboardMonthRange = (
    startTimestamp: number,
    endTimestamp: number,
    timezone: string
) => {
    const startMonth = formatDashboardDate(startTimestamp, 'M', timezone)
    const endMonth = formatDashboardDate(endTimestamp, 'M', timezone)
    const startDay = formatDashboardDate(startTimestamp, 'j', timezone)
    const endDay = formatDashboardDate(endTimestamp, 'j', timezone)

    if (startMonth === endMonth) {
        return `${startMonth} ${startDay}–${endDay}`
    }

    return `${startMonth} ${startDay}–${endMonth} ${endDay}`
}
