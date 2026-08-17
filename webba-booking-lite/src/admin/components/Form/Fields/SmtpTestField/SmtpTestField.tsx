import { useState } from 'react'
import apiFetch from '@wordpress/api-fetch'
import { useDispatch, useSelect } from '@wordpress/data'
import { __ } from '@wordpress/i18n'
import { FormComponentConstructor } from '../../lib/types'
import { FormFieldProps } from '../../types'
import { useForm } from '../../lib/FormProvider'
import { useField } from '../../lib/hooks/useField'
import { getFormState } from '../../lib/utils'
import { store } from '../../../../../store/backend'
import './SmtpTestField.scss'

export const createSmtpTestField: FormComponentConstructor<any> = () => {
    return ({ label }: FormFieldProps) => {
        const form = useForm()
        const { setOptions } = useDispatch(store)
        const { current_user_email } = useSelect(
            // @ts-ignore
            (select) => select(store).getPreset(),
            []
        )

        const mailerField = form.fields.wbk_mailer
        const { value: mailerValue } = mailerField
            ? useField(mailerField)
            : { value: 'smtp' }
        const mailer = String(mailerValue || 'smtp')
        const isGmail = mailer === 'gmail'
        const isSendGrid = mailer === 'sendgrid'

        const smtpHostField = form.fields.wbk_smtp_host
        const { value: smtpHostValue } = smtpHostField
            ? useField(smtpHostField)
            : { value: '' }
        const smtpHost = String(smtpHostValue || '').trim()

        const sendgridApiKeyField = form.fields.wbk_sendgrid_api_key
        const { value: sendgridApiKeyValue } = sendgridApiKeyField
            ? useField(sendgridApiKeyField)
            : { value: '' }
        const sendgridApiKey = String(sendgridApiKeyValue || '').trim()

        const [email, setEmail] = useState(current_user_email || '')
        const [isLoading, setIsLoading] = useState(false)
        const [status, setStatus] = useState<{
            type: 'success' | 'error'
            message: string
        } | null>(null)

        const handleSendTest = async () => {
            setStatus(null)

            if (!email.trim()) {
                setStatus({
                    type: 'error',
                    message: __(
                        'Please enter an email address.',
                        'webba-booking-lite'
                    ),
                })
                return
            }

            if (!isGmail && !isSendGrid && !smtpHost) {
                setStatus({
                    type: 'error',
                    message: __(
                        'SMTP host is required.',
                        'webba-booking-lite'
                    ),
                })
                return
            }

            if (isSendGrid && !sendgridApiKey) {
                setStatus({
                    type: 'error',
                    message: __(
                        'SendGrid API key is required.',
                        'webba-booking-lite'
                    ),
                })
                return
            }

            setIsLoading(true)

            try {
                await setOptions(
                    'wbk_notifications_settings_section',
                    getFormState(form).values
                )

                const result: any = await apiFetch({
                    path: 'wbk/v2/send-test-smtp/',
                    method: 'POST',
                    data: {
                        email: email.trim(),
                    },
                })

                if (result?.status === 'success') {
                    setStatus({
                        type: 'success',
                        message:
                            result?.message ||
                            __(
                                'Test email sent successfully.',
                                'webba-booking-lite'
                            ),
                    })
                } else {
                    setStatus({
                        type: 'error',
                        message:
                            result?.message ||
                            __(
                                'Failed to send test email.',
                                'webba-booking-lite'
                            ),
                    })
                }
            } catch (error: any) {
                setStatus({
                    type: 'error',
                    message:
                        error?.message ||
                        __(
                            'Failed to send test email.',
                            'webba-booking-lite'
                        ),
                })
            } finally {
                setIsLoading(false)
            }
        }

        return (
            <div className="wbk_smtpTestField">
                {label && (
                    <div className="wbk_smtpTestField__label">{label}</div>
                )}
                <div className="wbk_smtpTestField__row">
                    <input
                        type="email"
                        className="wbk_smtpTestField__input"
                        value={email}
                        placeholder={__(
                            'Recipient email address',
                            'webba-booking-lite'
                        )}
                        onChange={(event) => setEmail(event.target.value)}
                        disabled={isLoading}
                    />
                    <button
                        type="button"
                        className="wbk_smtpTestField__button"
                        onClick={handleSendTest}
                        disabled={isLoading}
                    >
                        {isLoading
                            ? __('Sending...', 'webba-booking-lite')
                            : __('Send test email', 'webba-booking-lite')}
                    </button>
                </div>
                {status && (
                    <p
                        className={`wbk_smtpTestField__status wbk_smtpTestField__status--${status.type}`}
                    >
                        {status.message}
                    </p>
                )}
            </div>
        )
    }
}
