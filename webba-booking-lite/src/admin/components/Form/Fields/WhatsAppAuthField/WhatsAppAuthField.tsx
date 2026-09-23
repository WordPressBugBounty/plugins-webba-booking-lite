import { useEffect, useRef, useState } from 'react'
import apiFetch from '@wordpress/api-fetch'
import { useDispatch } from '@wordpress/data'
import { __ } from '@wordpress/i18n'
import { FormComponentConstructor } from '../../lib/types'
import { FormFieldProps } from '../../types'
import { useField } from '../../lib/hooks/useField'
import { useForm } from '../../lib/FormProvider'
import { store } from '../../../../../store/backend'
import { applyWhatsAppTokenValidation } from '../WhatsAppValidateField/applyTokenValidation'
import { WHATSAPP_CREDENTIALS_UPDATED_EVENT } from '../WhatsAppValidateField/types'
import { WhatsAppAuthData } from './types'
import './WhatsAppAuthField.scss'

const BUSINESS_ACCOUNT_FIELD = 'wbk_whatsapp_business_account_id'
const PHONE_NUMBER_FIELD = 'wbk_whatsapp_phone_number_id'

export const createWhatsAppAuthField: FormComponentConstructor<any> = ({
    field,
}) => {
    return ({ misc }: FormFieldProps) => {
        const form = useForm()
        const { value, setValue } = useField(field)
        const { removeWhatsAppAuth, setFieldOptions, setToastNotification } =
            useDispatch(store)
        const [isLoading, setIsLoading] = useState(false)
        const [internalError, setInternalError] = useState(false)
        const [statusMessage, setStatusMessage] = useState<string | null>(null)
        const validatedTokenRef = useRef('')

        useEffect(() => {
            let cancelled = false

            const loadAuthData = async () => {
                try {
                    const data = (await apiFetch({
                        path: '/wbk/v2/whatsapp-auth-data/',
                    })) as WhatsAppAuthData

                    if (cancelled) {
                        return
                    }

                    setInternalError(Boolean(data?.internalError))
                    if (data?.isAuthenticated && data.access_token) {
                        setValue(data.access_token)
                    }
                } catch (error) {
                    if (!cancelled) {
                        setInternalError(true)
                    }
                }
            }

            loadAuthData()

            return () => {
                cancelled = true
            }
        }, [setValue])

        useEffect(() => {
            const accessToken = String(value || '').trim()
            if (
                accessToken === '' ||
                validatedTokenRef.current === accessToken
            ) {
                return
            }

            validatedTokenRef.current = accessToken
            setStatusMessage(null)

            const validateConnectedAccount = async () => {
                try {
                    const result = await applyWhatsAppTokenValidation({
                        accessToken,
                        form,
                        setFieldOptions,
                    })

                    if (!result.success) {
                        setStatusMessage(result.message)
                    }
                } catch (error: any) {
                    setStatusMessage(
                        error?.message ||
                            __(
                                'Failed to load WhatsApp business accounts.',
                                'webba-booking-lite'
                            )
                    )
                }
            }

            validateConnectedAccount()
        }, [form, setFieldOptions, value])

        const handleConnect = async () => {
            setIsLoading(true)
            setStatusMessage(null)
            try {
                const data = (await apiFetch({
                    path: '/wbk/v2/whatsapp-auth-data/',
                })) as WhatsAppAuthData

                if (data?.authUrl) {
                    window.location.href = data.authUrl
                    return
                }

                setInternalError(true)
            } catch (error) {
                setInternalError(true)
            } finally {
                setIsLoading(false)
            }
        }

        const handleDisconnect = async () => {
            setIsLoading(true)
            setStatusMessage(null)
            try {
                await removeWhatsAppAuth()
                setValue('')
                validatedTokenRef.current = ''
                setInternalError(false)

                if (form.fields[BUSINESS_ACCOUNT_FIELD]) {
                    form.fields[BUSINESS_ACCOUNT_FIELD].setValue('')
                }
                if (form.fields[PHONE_NUMBER_FIELD]) {
                    form.fields[PHONE_NUMBER_FIELD].setValue('')
                }

                if (typeof window !== 'undefined') {
                    window.dispatchEvent(
                        new CustomEvent(WHATSAPP_CREDENTIALS_UPDATED_EVENT, {
                            detail: {
                                businessAccountId: '',
                                phoneNumberId: '',
                            },
                        })
                    )
                }

                setToastNotification({
                    type: 'success',
                    message: __(
                        'WhatsApp disconnected.',
                        'webba-booking-lite'
                    ),
                })
            } finally {
                setIsLoading(false)
            }
        }

        const isAuthorized = String(value || '') !== ''

        return (
            <div className="wbk_whatsappAuthField__fieldWrapper">
                <div className="wbk_whatsappAuthField__messageHolder">
                    {internalError && !isAuthorized ? (
                        <span className="wbk_whatsappAuthField__error">
                            {__(
                                'Unable to reach Webba Connect. Please try again later.',
                                'webba-booking-lite'
                            )}
                        </span>
                    ) : (
                        <button
                            type="button"
                            className={`wbk_whatsappAuthField__button ${
                                isAuthorized
                                    ? 'wbk_whatsappAuthField__button--disconnect'
                                    : 'wbk_whatsappAuthField__button--connect'
                            }`}
                            onClick={
                                isAuthorized ? handleDisconnect : handleConnect
                            }
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="wbk_whatsappAuthField__spinner" />
                            ) : isAuthorized ? (
                                <svg
                                    className="wbk_whatsappAuthField__icon"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        fill="currentColor"
                                        d="M17 7h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.43-.98 2.63-2.31 2.98l1.46 1.46C20.88 15.61 22 13.95 22 12c0-2.76-2.24-5-5-5zm-1 4h-2.19l2 2H16v-2zM2 4.27l3.11 3.11C3.29 8.12 2 9.91 2 12c0 2.76 2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1 0-1.52 1.13-2.78 2.6-3.02l1.57 1.57H8v2h2.73L13 15.27V17h1.73l4.01 4L20 19.73 3.27 3 2 4.27z"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="wbk_whatsappAuthField__icon"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        fill="currentColor"
                                        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                                    />
                                </svg>
                            )}
                            <span>
                                {isAuthorized
                                    ? __(
                                          'Disconnect Whatsapp',
                                          'webba-booking-lite'
                                      )
                                    : __(
                                          'Connect Whatsapp',
                                          'webba-booking-lite'
                                      )}
                            </span>
                        </button>
                    )}
                </div>
                {statusMessage && (
                    <p className="wbk_whatsappAuthField__error">{statusMessage}</p>
                )}
                {misc?.description && (
                    <p className="wbk_whatsappAuthField__description">
                        {misc.description}
                    </p>
                )}
            </div>
        )
    }
}
