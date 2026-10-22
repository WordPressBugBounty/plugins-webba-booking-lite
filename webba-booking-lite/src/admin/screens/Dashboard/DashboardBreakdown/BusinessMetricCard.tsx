import { BusinessMetricCard as BusinessMetricCardData } from './types'
import './BusinessOverview.scss'

interface BusinessMetricCardProps {
    metric: BusinessMetricCardData
}

export const BusinessMetricCard = ({ metric }: BusinessMetricCardProps) => {
    return (
        <article className="wbk_businessOverview__metricCard">
            <p className="wbk_businessOverview__metricLabel">{metric.label}</p>
            <div className="wbk_businessOverview__metricValueRow">
                <p className="wbk_businessOverview__metricValue">
                    {metric.valueFormatted}
                </p>
                {metric.hasAction && (
                    <span
                        className="wbk_businessOverview__metricAction"
                        aria-hidden="true"
                    >
                        →
                    </span>
                )}
            </div>
            <p
                className={`wbk_businessOverview__metricComparison wbk_businessOverview__metricComparison--${metric.comparisonTone}`}
            >
                {metric.comparison}
            </p>
        </article>
    )
}
