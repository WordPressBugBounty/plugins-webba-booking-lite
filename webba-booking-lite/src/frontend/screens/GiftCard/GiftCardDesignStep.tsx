import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import { useForm } from '../../components/Form/FormProvider'
import { IFormContext } from '../../components/Form/types'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'
import { GIFT_CARD_DESIGN_OPTIONS } from './giftCardDesigns'

export const GiftCardDesignStep = () => {
    const { fields, setFields, anyTouched } = useForm() as IFormContext
    const { preset } = useBookingContext()
    const selectedDesign = String(
        fields.find((field) => field.slug === 'design')?.value ?? ''
    )
    const pluginUrl = String(preset?.plugin_url ?? '')
    const showError = anyTouched && selectedDesign === ''

    const setDesign = (design: string) => {
        setFields(
            fields.map((field) =>
                field.slug === 'design' ? { ...field, value: design } : field
            )
        )
    }

    return (
        <div className="wbk_gift_card__section">
            <h3 className="wbk_gift_card__section-title">
                {__('Choose Gift Card design', 'webba-booking-lite')}
            </h3>
            <div className="wbk_gift_card__designs">
                {GIFT_CARD_DESIGN_OPTIONS.map((option) => {
                    const selected = selectedDesign === option.id
                    return (
                        <button
                            key={option.id}
                            type="button"
                            className={classNames('wbk_gift_card__design', {
                                'wbk_gift_card__design--selected': selected,
                            })}
                            onClick={() => setDesign(option.id)}
                            aria-pressed={selected}
                        >
                            <img
                                className={classNames(
                                    'wbk_gift_card__design-image',
                                    `wbk_gift_card__design-image--${option.id}`
                                )}
                                src={`${pluginUrl}/${option.background}`}
                                alt={option.label}
                            />
                            <span className="wbk_gift_card__design-label">
                                {option.label}
                            </span>
                        </button>
                    )
                })}
            </div>
            {showError && (
                <div className="wbk_input__error">
                    {__('Please choose a gift card design', 'webba-booking-lite')}
                </div>
            )}
        </div>
    )
}
