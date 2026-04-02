import classNames from 'classnames'
import { useField } from '../../Form/hooks/useField'
import { IFieldProps } from '../../Form/types'
import './NumberInput.scss'
import { Validators } from '../../Form/validation'
import { __ } from '@wordpress/i18n'
import cartReduceIcon from '../../../../../public/images/icon-cart-reduce.svg'
import cartIncreaseIcon from '../../../../../public/images/icon-cart-increase.svg'
import { useWording } from '../../../hooks/useWording'

export const NumberInput = ({ fieldConstructor, anyTouched }: IFieldProps) => {
    fieldConstructor.addValidators([Validators.number])

    const wording = useWording()
    const {
        slug,
        placeholder,
        value,
        errors,
        setValue,
        touched,
        setTouched,
        width,
    } = useField(fieldConstructor)

    const showError = errors && errors.length > 0 && (anyTouched || touched)

    // Default to 0 if value is undefined or null
    const currentValue = typeof value === 'number' ? value : Number(value) || 0

    return (
        <div
            className={classNames('wbk_input wbk_input__number', {
                'wbk_input--half-width': width === 'half-width',
            })}
        >
            <div className={'wbk_input__number__inner-wrapper'}>
                <label htmlFor={slug} className={'wbk_input__label'}>
                    {placeholder}
                </label>
                <div className={'wbk_input__number__input-wrapper'}>
                    <div
                        className={classNames(
                            'wbk_input__number__quantity-button',
                            'wbk_input__number__quantity-button--reduce'
                        )}
                        onClick={() =>
                            setValue(currentValue > 0 ? currentValue - 1 : 0)
                        }
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
                        name={slug}
                        type="text"
                        value={currentValue}
                        className={classNames('wbk_input__number__input', {
                            'wbk_input__number__input--error': showError,
                        })}
                        onBlur={() => setTouched(true)}
                        onChange={(e) => setValue(Number(e.target.value))}
                    />
                    <div
                        className={classNames(
                            'wbk_input__number__quantity-button',
                            'wbk_input__number__quantity-button--increase'
                        )}
                        onClick={() => setValue(currentValue + 1)}
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
            {showError && <div className={'wbk_input__error'}>{errors[0]}</div>}
        </div>
    )
}
