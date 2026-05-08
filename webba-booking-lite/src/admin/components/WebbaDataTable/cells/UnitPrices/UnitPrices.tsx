import { CellContext } from '@tanstack/react-table'
import { useSelect } from '@wordpress/data'
import { __ } from '@wordpress/i18n'
import { formatPrice } from '../../../../utils/currency'
import { store_name } from '../../../../../store/backend'
import './UnitPrices.scss'

type Bucket = {
    adult: number
    child: number
    infant: number
}

const toNumber = (value: unknown): number => {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

const parsePriceValue = (value: unknown): unknown => {
    if (typeof value !== 'string') {
        return value
    }
    const trimmed = value.trim()
    if (!trimmed) return null
    try {
        return JSON.parse(trimmed)
    } catch {
        return toNumber(trimmed)
    }
}

const normalizeBucket = (value: unknown): Bucket => {
    if (typeof value === 'number' || typeof value === 'string') {
        const num = toNumber(value)
        return {
            adult: num,
            child: num,
            infant: num,
        }
    }
    if (!value || typeof value !== 'object') {
        return { adult: 0, child: 0, infant: 0 }
    }
    const bucket = value as Record<string, unknown>
    const fallback = toNumber(bucket.adult ?? 0)
    return {
        adult: toNumber(bucket.adult ?? fallback),
        child: toNumber(bucket.child ?? fallback),
        infant: toNumber(bucket.infant ?? fallback),
    }
}

const bucketAllSame = (bucket: Bucket): boolean =>
    bucket.adult === bucket.child && bucket.child === bucket.infant

const formatBucket = (
    bucket: Bucket,
    priceFormat?: string,
    priceSeparator?: string,
    priceFraction?: number
): string => {
    const values = [bucket.adult, bucket.child, bucket.infant].filter(
        (value) => value > 0
    )
    if (values.length === 0) {
        return formatPrice(0, priceFormat, priceSeparator, priceFraction)
    }

    const minPrice = Math.min(...values)
    const maxPrice = Math.max(...values)
    if (minPrice === maxPrice || bucketAllSame(bucket)) {
        return formatPrice(minPrice, priceFormat, priceSeparator, priceFraction)
    }

    return `${formatPrice(
        minPrice,
        priceFormat,
        priceSeparator,
        priceFraction
    )} - ${formatPrice(maxPrice, priceFormat, priceSeparator, priceFraction)}`
}

export const UnitPrices = ({ getValue }: CellContext<any, any>) => {
    const { settings } = useSelect(
        (select: any) => select(store_name).getPreset(),
        []
    )
    const parsed = parsePriceValue(getValue())

    const pricing =
        typeof parsed === 'number'
            ? {
                  weekday: parsed,
                  weekend_holiday: parsed,
              }
            : parsed && typeof parsed === 'object' && 'pricing' in (parsed as object)
              ? (parsed as any).pricing
              : parsed
    const weekday = normalizeBucket((pricing as any)?.weekday)
    const weekend = normalizeBucket((pricing as any)?.weekend_holiday)

    const hasAnyPrice =
        weekday.adult > 0 ||
        weekday.child > 0 ||
        weekday.infant > 0 ||
        weekend.adult > 0 ||
        weekend.child > 0 ||
        weekend.infant > 0

    if (!hasAnyPrice) {
        return <div className="wbk_unit_prices">{__('Free', 'webba-booking-lite')}</div>
    }

    return (
        <div className="wbk_unit_prices">
            <div>
                {__('Weekday', 'webba-booking-lite')}:&nbsp;
                {formatBucket(
                    weekday,
                    settings?.price_format,
                    settings?.price_separator,
                    settings?.price_fractional
                )}
            </div>
            <div>
                {__('Weekend / Holiday', 'webba-booking-lite')}:&nbsp;
                {formatBucket(
                    weekend,
                    settings?.price_format,
                    settings?.price_separator,
                    settings?.price_fractional
                )}
            </div>
        </div>
    )
}
