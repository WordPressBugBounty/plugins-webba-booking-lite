import classNames from 'classnames'
import { __ } from '@wordpress/i18n'
import cartReduceIcon from '../../../../public/images/icon-cart-reduce.svg'
import cartIncreaseIcon from '../../../../public/images/icon-cart-increase.svg'
import { useWording } from '../../hooks/useWording'
import { ICounterInputProps } from './types'
import './CounterInput.scss'

export const CounterInput = ({
    value,
    min,
    max,
    label,
    layout = 'stacked',
    disabled = false,
    onChange,
}: ICounterInputProps) => {
    const wording = useWording()
    const canDecrease = !disabled && value > min
    const canIncrease = !disabled && (max === undefined || value < max)

    const handleDecrease = () => {
        if (canDecrease) onChange(value - 1)
    }

    const handleIncrease = () => {
        if (canIncrease) onChange(value + 1)
    }

    return (
        <div
            className={classNames('wbk_recurring_counter', {
                'wbk_recurring_counter--inline': layout === 'inline',
                'wbk_recurring_counter--disabled': disabled,
            })}
        >
            <span className="wbk_recurring_counter__label">{label}</span>
            <div className="wbk_service_item__counter-input-wrapper">
                <div
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    className={classNames(
                        'wbk_service_item__counter-button',
                        'wbk_service_item__counter-button--reduce',
                        { 'wbk_recurring_counter__button--disabled': !canDecrease }
                    )}
                    onClick={handleDecrease}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            handleDecrease()
                        }
                    }}
                >
                    <img
                        src={cartReduceIcon}
                        alt={
                            wording.reduce_item ||
                            __('Reduce item', 'webba-booking-lite')
                        }
                    />
                </div>
                <input
                    className="wbk_service_item__counter-input"
                    value={value}
                    readOnly
                    aria-label={label}
                    aria-disabled={disabled}
                />
                <div
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    className={classNames(
                        'wbk_service_item__counter-button',
                        'wbk_service_item__counter-button--increase',
                        { 'wbk_recurring_counter__button--disabled': !canIncrease }
                    )}
                    onClick={handleIncrease}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            handleIncrease()
                        }
                    }}
                >
                    <img
                        src={cartIncreaseIcon}
                        alt={
                            wording.increase_item ||
                            __('Increase item', 'webba-booking-lite')
                        }
                    />
                </div>
            </div>
        </div>
    )
}
