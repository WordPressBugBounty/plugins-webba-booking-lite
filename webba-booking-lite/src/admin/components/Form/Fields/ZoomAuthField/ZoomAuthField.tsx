import { useEffect, useRef, useState } from 'react'
import { FormComponentConstructor } from '../../lib/types'
import { FormFieldProps } from '../../types'
import { useField } from '../../lib/hooks/useField'
import { useForm } from '../../lib/FormProvider'
import { usePreset } from '../../../../hooks/usePreset'
import { __ } from '@wordpress/i18n'
import './ZoomAuthField.scss'
import { useDispatch } from '@wordpress/data'
import { store } from '../../../../../store/backend'
import { getFormState } from '../../lib/utils'

export const createZoomAuthField: FormComponentConstructor<any> = ({
    field,
    fieldConfig,
}) => {
    return ({ name, label, misc }: FormFieldProps) => {
        const { value, setValue } = useField(field)
        const form = useForm()
        const { site_url } = usePreset()

        const clientIdField = form.fields.wbk_zoom_client_id
        const clientSecretField = form.fields.wbk_zoom_client_secret

        const clientIdData = clientIdField
            ? useField(clientIdField)
            : { value: '' }
        const clientSecretData = clientSecretField
            ? useField(clientSecretField)
            : { value: '' }

        const clientIdStr = String(clientIdData.value || '')
        const clientSecretStr = String(clientSecretData.value || '')

        // Track previous values to detect changes when authorized
        const prevClientIdRef = useRef<string>(clientIdStr)
        const prevClientSecretRef = useRef<string>(clientSecretStr)
        const prevValueRef = useRef<string>(String(value || ''))
        const [hasCredentialsChanged, setHasCredentialsChanged] =
            useState<boolean>(false)

        // Detect if credentials changed while authorized
        useEffect(() => {
            const isAuthorized = value != ''
            const wasAuthorized = prevValueRef.current != ''
            const valueChanged = prevValueRef.current !== String(value || '')

            if (isAuthorized) {
                const clientIdChanged =
                    prevClientIdRef.current !== clientIdStr &&
                    prevClientIdRef.current !== ''
                const clientSecretChanged =
                    prevClientSecretRef.current !== clientSecretStr &&
                    prevClientSecretRef.current !== ''

                if (clientIdChanged || clientSecretChanged) {
                    setHasCredentialsChanged(true)
                }

                // Reset flag if authorization was just completed (value changed from empty to non-empty)
                if (!wasAuthorized && isAuthorized && valueChanged) {
                    setHasCredentialsChanged(false)
                }
            } else {
                // Reset when not authorized
                setHasCredentialsChanged(false)
            }

            // Update previous values
            prevClientIdRef.current = clientIdStr
            prevClientSecretRef.current = clientSecretStr
            prevValueRef.current = String(value || '')
        }, [clientIdStr, clientSecretStr, value])

        const normalizedSiteUrl = site_url ? site_url.replace(/\/+$/, '') : ''
        const redirect_url = `${normalizedSiteUrl}/?wbk_zoom_auth=true`
        const { removeZoomAuth, setOptions } = useDispatch(store)
        const [isLoading, setIsLoading] = useState(false)

        const handleRemoveAuth = async (
            e: React.MouseEvent<HTMLAnchorElement>
        ) => {
            e.preventDefault()
            setIsLoading(true)
            try {
                await removeZoomAuth()
                setValue('')
            } finally {
                setIsLoading(false)
            }
        }

        const handleAuthorize = async (
            e: React.MouseEvent<HTMLAnchorElement>
        ) => {
            e.preventDefault()
            setIsLoading(true)
            try {
                await setOptions(
                    'wbk_integrations_settings_section',
                    getFormState(form).values
                )
                window.location.href = getAuthorizeUrl()
            } catch (error) {
                setIsLoading(false)
            }
        }

        const isAuthorized = value != ''
        const effectiveIsAuthorized = isAuthorized && !hasCredentialsChanged
        const shouldShowSetupMessage = !clientIdStr || !clientSecretStr

        const getAuthorizeUrl = () => {
            return `https://zoom.us//oauth/authorize?response_type=code&client_id=${clientIdStr}&redirect_uri=${redirect_url}`
        }

        return (
            <div className="wbk_zoomAuthField__fieldWrapper">
                <div className="wbk_zoomAuthField__messageHolder">
                    {isLoading ? (
                        <div className="wbk_zoomAuthField__loading">
                            <div className="wbk_zoomAuthField__spinner"></div>
                        </div>
                    ) : shouldShowSetupMessage ? (
                        <span className="wbk_zoomAuthField__setupMessage">
                            {__(
                                'Please, set up Client ID and Client secret',
                                'webba-booking-lite'
                            )}
                        </span>
                    ) : (
                        <>
                            {!effectiveIsAuthorized ? (
                                <a
                                    className="wbk_zoomAuthField__authorizeLink"
                                    href={getAuthorizeUrl()}
                                    rel="noopener"
                                    onClick={handleAuthorize}
                                >
                                    {__('Authorize', 'webba-booking-lite')}
                                </a>
                            ) : (
                                <>
                                    <span className="wbk_zoomAuthField__authorizedLabel">
                                        {__('Authorized', 'webba-booking-lite')}
                                    </span>
                                    <br />
                                    <a
                                        className="wbk_zoomAuthField__removeAuthLink"
                                        href="#"
                                        onClick={handleRemoveAuth}
                                    >
                                        {__(
                                            'Remove authorization',
                                            'webba-booking-lite'
                                        )}
                                    </a>
                                </>
                            )}
                        </>
                    )}
                </div>
                {misc?.description && (
                    <p className="wbk_zoomAuthField__description">{misc.description}</p>
                )}
            </div>
        )
    }
}
