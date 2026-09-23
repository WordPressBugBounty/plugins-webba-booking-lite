import { __ } from '@wordpress/i18n'
import { createFormFields } from '../../components/Form/utils'
import { useForm } from '../../components/Form/FormProvider'
import { IFormContext } from '../../components/Form/types'

export const GiftCardRecipientStep = () => {
    const { fields, anyTouched } = useForm() as IFormContext
    const recipientFields = fields.filter((field) =>
        ['recipient_name', 'recipient_email', 'message'].includes(field.slug)
    )

    return (
        <div className="wbk_gift_card__section">
            <h3 className="wbk_gift_card__section-title">
                {__('Who is it for?', 'webba-booking-lite')}
            </h3>
            <div className="wbk_gift_card__form wbk_form">
                {createFormFields(recipientFields, anyTouched)}
            </div>
        </div>
    )
}
