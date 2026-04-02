import { ICostSummaryProps } from './types'
import './CostSummary.scss'
import { __ } from '@wordpress/i18n'
import { useWording } from '../../hooks/useWording'

export const CostSummary = ({ items }: ICostSummaryProps) => {
    const wording = useWording()
    return (
        <div className={'wbk_cost_summary'}>
            <div className={'wbk_cost_summary__items'}>
                {items &&
                    items.map(({ title, price }) => (
                        <div className={'wbk_cost_summary__item'}>
                            <span>{title}</span>
                            <strong>{price}</strong>
                        </div>
                    ))}
            </div>
            <div className={'wbk_cost_summary__total'}>
                <p>
                    {wording.total_amount_paid ||
                        __('Total amount', 'webba-booking-lite')}
                </p>
                <p className={'wbk_cost_summary__price'}>
                    {items.reduce((acc, item) => acc + item.price, 0)}
                </p>
            </div>
        </div>
    )
}
