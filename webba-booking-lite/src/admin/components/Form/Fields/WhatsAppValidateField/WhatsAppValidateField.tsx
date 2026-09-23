import { useState } from 'react'
import { useDispatch } from '@wordpress/data'
import { __ } from '@wordpress/i18n'
import { FormComponentConstructor } from '../../lib/types'
import { FormFieldProps } from '../../types'
import { useField } from '../../lib/hooks/useField'
import { useForm } from '../../lib/FormProvider'
import { getFormState } from '../../lib/utils'
import { store } from '../../../../../store/backend'
import { Label } from '../Label/Label'
import { applyWhatsAppTokenValidation } from './applyTokenValidation'
import './WhatsAppValidateField.scss'

export const createWhatsAppValidateField: FormComponentConstructor<string> = ({
    field,
}) => {
    return ({ name, label, misc }: FormFieldProps) => {
        const form = useForm()
        const { setFieldOptions, setToastNotification } = useDispatch(store)
        useField(field)
        const [isLoading, setIsLoading] = useState(false)
        const [statusMessage, setStatusMessage] = useState<{
            type: 'success' | 'error'
            message: string
        } | null>(null)

        const handleValidate = async () => {
            setStatusMessage(null)

            const formValues = getFormState(form).values as Record<string, string>
            const accessToken = String(
                formValues.wbk_whatsapp_access_token || ''
            ).trim()

            setIsLoading(true)

            try {
                const result = await applyWhatsAppTokenValidation({
                    accessToken,
                    form,
                    setFieldOptions,
                })

                setStatusMessage({
                    type: result.success ? 'success' : 'error',
                    message: result.message,
                })

                if (result.success) {
                    setToastNotification({
                        type: 'success',
                        message: result.message,
                    })
                }
            } catch (error: any) {
                setStatusMessage({
                    type: 'error',
                    message:
                        error?.message ||
                        __(
                            'Failed to validate WhatsApp access token.',
                            'webba-booking-lite'
                        ),
                })
            } finally {
                setIsLoading(false)
            }
        }

        return (
            <div className="wbk_whatsappValidateField">
                {label && <Label title={label} id={name} tooltip={misc?.tooltip} />}
                <div className="wbk_whatsappValidateField__row">
                    <button
                        type="button"
                        className="wbk_whatsappValidateField__button"
                        onClick={handleValidate}
                        disabled={isLoading}
                    >
                        {isLoading
                            ? __('Validating...', 'webba-booking-lite')
                            : __('Validate', 'webba-booking-lite')}
                    </button>
                </div>
                {statusMessage && (
                    <p
                        className={`wbk_whatsappValidateField__message wbk_whatsappValidateField__message--${statusMessage.type}`}
                    >
                        {statusMessage.message}
                    </p>
                )}
            </div>
        )
    }
}
