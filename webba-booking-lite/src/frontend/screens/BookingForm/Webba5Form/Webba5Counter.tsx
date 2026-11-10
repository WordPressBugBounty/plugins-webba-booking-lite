import { __ } from '@wordpress/i18n'
import { useWording } from '../../../hooks/useWording'
import cartReduceIcon from '../../../../../public/images/icon-cart-reduce.svg'
import cartIncreaseIcon from '../../../../../public/images/icon-cart-increase.svg'
import { IWebba5CounterProps } from './types'

export const Webba5Counter = ({
    label,
    value,
    onDecrease,
    onIncrease,
}: IWebba5CounterProps) => {
    const wording = useWording()

    return (
        <div className="wbk_webba5_form__counter">
            <span className="wbk_webba5_form__counter-label">{label}</span>
            <div className="wbk_webba5_form__counter-controls">
                <button
                    type="button"
                    className="wbk_webba5_form__counter-button"
                    onClick={onDecrease}
                    aria-label={
                        wording.reduce_item ||
                        __('Reduce item', 'webba-booking-lite')
                    }
                >
                    <img
                        src={cartReduceIcon}
                        alt=""
                    />
                </button>
                <span className="wbk_webba5_form__counter-value">{value}</span>
                <button
                    type="button"
                    className="wbk_webba5_form__counter-button"
                    onClick={onIncrease}
                    aria-label={
                        wording.increase_item ||
                        __('Increase item', 'webba-booking-lite')
                    }
                >
                    <img
                        src={cartIncreaseIcon}
                        alt=""
                    />
                </button>
            </div>
        </div>
    )
}
