import { __ } from '@wordpress/i18n'
import { createFormFields } from '../../components/Form/utils'
import { useForm } from '../../components/Form/FormProvider'
import { IFormContext } from '../../components/Form/types'

export const GiftCardBuyerStep = () => {
    const { fields, anyTouched } = useForm() as IFormContext
    const buyerFields = fields.filter((field) =>
        ['buyer_name', 'buyer_email'].includes(field.slug)
    )

    return (
        <div className="wbk_gift_card__section">
            <h3 className="wbk_gift_card__section-title">
                {__('Your details', 'webba-booking-lite')}
            </h3>
            <div className="wbk_gift_card__form wbk_form">
                {createFormFields(buyerFields, anyTouched)}
            </div>
        </div>
    )
}
