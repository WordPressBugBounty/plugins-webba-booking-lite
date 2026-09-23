import classNames from 'classnames'
import { useField } from '../../lib/hooks/useField'
import { FormComponentConstructor } from '../../lib/types'
import { FormFieldProps } from '../../types'
import { Label } from '../Label/Label'
import { usePreset } from '../../../../hooks/usePreset'
import { GIFT_CARD_DESIGN_VARIANTS } from '../GiftCardDesignField/giftCardDesigns'
import { GiftCardDesignPickerValue } from './types'
import './GiftCardDesignPickerField.scss'

const DEFAULT_DESIGN: GiftCardDesignPickerValue = 'botanical_green'

const resolveSelectedDesign = (value: unknown): GiftCardDesignPickerValue => {
    const raw = String(value ?? '').trim()
    const match = GIFT_CARD_DESIGN_VARIANTS.find((variant) => variant.id === raw)
    return match ? match.id : DEFAULT_DESIGN
}

export const createGiftCardDesignPickerField: FormComponentConstructor<
    string
> = ({ field }) => {
    return ({ name, label, misc }: FormFieldProps) => {
        const { value, setValue } = useField(field)
        const { plugin_url } = usePreset() as { plugin_url?: string }
        const selectedDesign = resolveSelectedDesign(value)

        return (
            <div className="wbk_giftCardDesignPickerField">
                <Label title={label} id={name} tooltip={misc?.tooltip} />
                <div
                    className="wbk_giftCardDesignPickerField__variants"
                    role="radiogroup"
                    aria-label={label}
                >
                    {GIFT_CARD_DESIGN_VARIANTS.map((option) => {
                        const selected = selectedDesign === option.id
                        return (
                            <button
                                key={option.id}
                                type="button"
                                role="radio"
                                className={classNames(
                                    'wbk_giftCardDesignPickerField__variant',
                                    {
                                        'wbk_giftCardDesignPickerField__variant--selected':
                                            selected,
                                    }
                                )}
                                onClick={() => setValue(option.id)}
                                aria-checked={selected}
                            >
                                <img
                                    className="wbk_giftCardDesignPickerField__image"
                                    src={`${plugin_url || ''}/${option.background}`}
                                    alt={option.label}
                                />
                                <span className="wbk_giftCardDesignPickerField__label">
                                    {option.label}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>
        )
    }
}
