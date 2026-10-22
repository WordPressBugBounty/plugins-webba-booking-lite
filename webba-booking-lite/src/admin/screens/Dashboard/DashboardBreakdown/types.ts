export interface HoursAvailabilityDay {
    date: string
    timestamp?: number
    dayLabel: string
    bookedPercent: number | null
    isClosed: boolean
    remainingHours: number
}

export interface HoursAvailabilityData {
    title: string
    dateRangeLabel: string
    staffLabel: string
    bookedPercent: number
    remainingHours: number
    remainingHoursLabel: string
    insightText: string
    days: HoursAvailabilityDay[]
}

export interface HoursAvailabilityProps {
    data?: HoursAvailabilityData | null
}

export type BusinessMetricTone = 'positive' | 'negative' | 'neutral'

export interface BusinessMetricCard {
    label: string
    value: number
    valueFormatted: string
    comparison: string
    comparisonTone: BusinessMetricTone
    hasAction?: boolean
}

export interface BusinessUpcomingValue {
    title: string
    subtitle: string
    total: number
    totalFormatted: string
    alreadyPaid: number
    alreadyPaidFormatted: string
    remaining: number
    remainingFormatted: string
    paidPercent: number
    bookingsLabel: string
    note: string
}

export interface BusinessTrendSeries {
    selected: number[]
    previous: number[]
}

export interface BusinessTrendData {
    title: string
    subtitle: string
    labels: string[]
    labelTimestamps?: number[]
    selectedLabel: string
    previousLabel: string
    bookings: BusinessTrendSeries
    payments: BusinessTrendSeries
}

export interface BusinessTopServiceItem {
    id: number
    name: string
    count: number
    percent: number
}

export interface BusinessTopServicesData {
    title: string
    metricLabel: string
    items: BusinessTopServiceItem[]
}

export interface BusinessOverviewData {
    title: string
    period: string
    periodLabel: string
    comparisonSummary: string
    selectedStart?: number
    selectedEnd?: number
    previousStart?: number
    previousEnd?: number
    upcomingStart?: number
    upcomingEnd?: number
    periodDays?: number
    staffLabel: string
    locationLabel: string
    upcomingValue: BusinessUpcomingValue
    metrics: {
        confirmedBookings: BusinessMetricCard
        paymentsCollected: BusinessMetricCard
        outstanding: BusinessMetricCard
        cancellationRate: BusinessMetricCard
    }
    trend: BusinessTrendData
    topServices: BusinessTopServicesData
}

export interface BusinessOverviewProps {
    data?: BusinessOverviewData | null
}

export interface WelcomeMessageData {
    title: string
    dateLabel: string
    dateTimestamp?: number
    pendingCount: number
    pendingTitle: string
    nextAppointmentLabel: string
    nextAppointmentTime?: number | null
    nextAppointmentRelation?: 'today' | 'tomorrow' | 'later' | ''
    hasPending: boolean
}

export interface WelcomeMessageProps {
    data?: WelcomeMessageData | null
}
