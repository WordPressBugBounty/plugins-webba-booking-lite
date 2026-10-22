import { useState } from 'react'
import apiFetch from '@wordpress/api-fetch'
import { __ } from '@wordpress/i18n'
import { FormComponentConstructor } from '../../lib/types'
import { FormFieldProps } from '../../types'
import { useForm } from '../../lib/FormProvider'
import { useField } from '../../lib/hooks/useField'
import { getFormState } from '../../lib/utils'
import { useDispatch } from '@wordpress/data'
import { store } from '../../../../../store/backend'
import './ZapierTestField.scss'

export const createZapierTestField: FormComponentConstructor<any> = () => {
    return ({ label }: FormFieldProps) => {
        const form = useForm()
        const { setOptions } = useDispatch(store)

        const enabledField = form.fields.wbk_zapier_enabled
        const { value: enabledValue } = enabledField
            ? useField(enabledField)
            : { value: '' }

        const urlField = form.fields.wbk_zapier_webhook_url
        const { value: urlValue } = urlField ? useField(urlField) : { value: '' }

        const [isLoading, setIsLoading] = useState(false)
        const [status, setStatus] = useState<{
            type: 'success' | 'error'
            message: string
        } | null>(null)

        const handleSendTest = async () => {
            setStatus(null)

            const url = String(urlValue || '').trim()
            if (!url) {
                setStatus({
                    type: 'error',
                    message: __(
                        'Please enter a Catch Hook URL first.',
                        'webba-booking-lite'
                    ),
                })
                return
            }

            if (String(enabledValue || '') !== 'yes') {
                setStatus({
                    type: 'error',
                    message: __(
                        'Enable Zapier webhooks before sending a test.',
                        'webba-booking-lite'
                    ),
                })
                return
            }

            setIsLoading(true)

            try {
                await setOptions(
                    'wbk_integrations_settings_section',
                    getFormState(form).values
                )

                const result: any = await apiFetch({
                    path: 'wbk/v2/send-test-zapier/',
                    method: 'POST',
                    data: {},
                })

                if (result?.status === 'success') {
                    setStatus({
                        type: 'success',
                        message:
                            result?.message ||
                            __(
                                'Test event was accepted by Zapier.',
                                'webba-booking-lite'
                            ),
                    })
                } else {
                    setStatus({
                        type: 'error',
                        message:
                            result?.message ||
                            __(
                                'Failed to send test event.',
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
                            'Failed to send test event.',
                            'webba-booking-lite'
                        ),
                })
            } finally {
                setIsLoading(false)
            }
        }

        return (
            <div className="wbk_zapierTestField">
                {label && (
                    <div className="wbk_zapierTestField__label">{label}</div>
                )}
                <button
                    type="button"
                    className="wbk_zapierTestField__button"
                    onClick={handleSendTest}
                    disabled={isLoading}
                >
                    {isLoading
                        ? __('Sending...', 'webba-booking-lite')
                        : __('Send test event', 'webba-booking-lite')}
                </button>
                {status && (
                    <p
                        className={`wbk_zapierTestField__status wbk_zapierTestField__status--${status.type}`}
                    >
                        {status.message}
                    </p>
                )}
            </div>
        )
    }
}
