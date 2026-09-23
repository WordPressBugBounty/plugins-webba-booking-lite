import { CellContext } from '@tanstack/react-table'
import { useSelect } from '@wordpress/data'
import { __ } from '@wordpress/i18n'
import { store_name } from '../../../../../store/backend'
import { wbkFormat } from '../../../Form/utils/dateTime'
import { formatPrice } from '../../../../utils/currency'
import { parseGiftCardHistory } from '../../../../screens/GiftCardsScreen/giftCardHistory'
import './GiftCardHistory.scss'

const formatHistoryDateTime = (
    time: number,
    settings?: Record<string, any>
): string => {
    if (!time) {
        return '—'
    }

    const dateFormat = settings?.date_format || 'M j, Y'
    const timeFormat = settings?.time_format || 'g:i a'
    const timezone = settings?.timezone || ''

    try {
        return `${wbkFormat(time, dateFormat, timezone)} ${wbkFormat(
            time,
            timeFormat,
            timezone
        )}`
    } catch {
        return String(time)
    }
}

export const GiftCardHistory = ({ cell }: CellContext<any, any>) => {
    const { settings } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )
    const history = parseGiftCardHistory(cell.row.original?.history)

    if (!history.length) {
        return (
            <div className="wbk_giftCardHistory">
                <p className="wbk_giftCardHistory__empty">
                    {__(
                        'This gift card has not been used yet.',
                        'webba-booking-lite'
                    )}
                </p>
            </div>
        )
    }

    return (
        <div className="wbk_giftCardHistory">
            <p className="wbk_giftCardHistory__title">
                {__('History', 'webba-booking-lite')}
            </p>
            <table className="wbk_giftCardHistory__table">
                <thead>
                    <tr>
                        <th>{__('Date and time', 'webba-booking-lite')}</th>
                        <th>{__('Amount used', 'webba-booking-lite')}</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map((entry, index) => (
                        <tr key={`${entry.time}-${index}`}>
                            <td>
                                {formatHistoryDateTime(entry.time, settings)}
                            </td>
                            <td>
                                {formatPrice(
                                    entry.amount,
                                    settings?.price_format,
                                    settings?.price_separator,
                                    settings?.price_fractional
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
