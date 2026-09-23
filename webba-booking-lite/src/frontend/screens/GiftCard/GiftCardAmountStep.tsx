import { useMemo, useState } from 'react'
import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import { createFormFields } from '../../components/Form/utils'
import { useForm } from '../../components/Form/FormProvider'
import { IFormContext } from '../../components/Form/types'
import { wbkFormatPrice } from '../../providers/BookingFormProvider/utils'

interface GiftCardAmountStepProps {
    presetAmounts: number[]
    allowCustom: boolean
    priceFormat: string
}

export const GiftCardAmountStep = ({
    presetAmounts,
    allowCustom,
    priceFormat,
}: GiftCardAmountStepProps) => {
    const { fields, setFields, anyTouched } = useForm() as IFormContext
    const amountField = fields.find((field) => field.slug === 'amount')
    const amountValue = String(amountField?.value ?? '')
    const amountNumber = Number(amountValue.replace(',', '.')) || 0
    const matchesPreset = presetAmounts.some(
        (presetAmount) => presetAmount === amountNumber
    )
    const [isCustom, setIsCustom] = useState(
        allowCustom && amountValue !== '' && !matchesPreset
    )

    const setAmount = (nextAmount: string, custom: boolean) => {
        setIsCustom(custom)
        setFields(
            fields.map((field) =>
                field.slug === 'amount' ? { ...field, value: nextAmount } : field
            )
        )
    }

    const amountError = useMemo(() => {
        if (!anyTouched) {
            return ''
        }
        const amount = Number(amountValue.replace(',', '.'))
        if (!Number.isFinite(amount) || amount <= 0) {
            return __('Please enter a valid amount', 'webba-booking-lite')
        }
        return ''
    }, [anyTouched, amountValue])

    return (
        <div className="wbk_gift_card__section">
            <h3 className="wbk_gift_card__section-title">
                {__('Choose an amount', 'webba-booking-lite')}
            </h3>
            <div className="wbk_gift_card__amounts">
                {presetAmounts.map((presetAmount) => {
                    const selected = !isCustom && amountNumber === presetAmount
                    return (
                        <button
                            key={presetAmount}
                            type="button"
                            className={classNames('wbk_gift_card__amount', {
                                'wbk_gift_card__amount--selected': selected,
                            })}
                            onClick={() =>
                                setAmount(String(presetAmount), false)
                            }
                        >
                            {wbkFormatPrice(presetAmount, priceFormat)}
                        </button>
                    )
                })}
                {allowCustom && (
                    <button
                        type="button"
                        className={classNames('wbk_gift_card__amount', {
                            'wbk_gift_card__amount--selected': isCustom,
                        })}
                        onClick={() =>
                            setAmount(matchesPreset ? '' : amountValue, true)
                        }
                    >
                        {__('Custom', 'webba-booking-lite')}
                    </button>
                )}
            </div>
            {isCustom && (
                <div className="wbk_gift_card__custom-amount">
                    {createFormFields(
                        fields.filter((field) => field.slug === 'amount'),
                        anyTouched
                    )}
                </div>
            )}
            {!isCustom && amountError && (
                <div className="wbk_input__error">{amountError}</div>
            )}
        </div>
    )
}
