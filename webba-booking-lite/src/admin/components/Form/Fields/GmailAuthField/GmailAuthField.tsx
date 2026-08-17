import { useEffect, useState } from 'react'
import apiFetch from '@wordpress/api-fetch'
import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import { FormComponentConstructor } from '../../lib/types'
import { FormFieldProps } from '../../types'
import { useForm } from '../../lib/FormProvider'
import TimedLink from '../../../common/TimedLink/TimedLink'
import warningIcon from '../../../../../../public/images/warning-icon.png'
import successIcon from '../../../../../../public/images/succesessful-icon.png'
import './GmailAuthField.scss'

interface GmailAuthData {
    isAuthenticated?: boolean
    internalError?: boolean
    authUrl?: string | null
    revokeUrl?: string | null
    email?: string
}

export const createGmailAuthField: FormComponentConstructor<any> = () => {
    return ({ label, misc }: FormFieldProps) => {
        const form = useForm()
        const [authData, setAuthData] = useState<GmailAuthData | null>(null)
        const [isLoading, setIsLoading] = useState(true)

        useEffect(() => {
            let cancelled = false

            setIsLoading(true)
            apiFetch({
                path: '/wbk/v2/get-gmail-auth-data/',
            })
                .then((result: any) => {
                    if (!cancelled) {
                        setAuthData(result || {})
                    }
                })
                .catch(() => {
                    if (!cancelled) {
                        setAuthData({
                            isAuthenticated: false,
                            internalError: true,
                        })
                    }
                })
                .finally(() => {
                    if (!cancelled) {
                        setIsLoading(false)
                    }
                })

            return () => {
                cancelled = true
            }
        }, [])

        useEffect(() => {
            const email = String(authData?.email || '').trim()
            if (!email || !authData?.isAuthenticated) {
                return
            }

            const fromEmailField = form.fields.wbk_from_email
            if (fromEmailField && fromEmailField.value.value !== email) {
                fromEmailField.setValue(email)
            }
        }, [authData, form.fields.wbk_from_email])

        const isAuthenticated = Boolean(authData?.isAuthenticated)
        const internalError = Boolean(authData?.internalError)
        const authUrl = authData?.authUrl || ''
        const revokeUrl = authData?.revokeUrl || ''

        return (
            <div className="wbk_gmailAuthField">
                {label && (
                    <div className="wbk_gmailAuthField__label">{label}</div>
                )}
                <div className="wbk_gmailAuthField__wrapper">
                    {isLoading || authData === null ? (
                        <div
                            className={classNames(
                                'wbk_gmailAuthField__message',
                                'wbk_gmailAuthField__message--loading'
                            )}
                        >
                            <div className="wbk_gmailAuthField__title">
                                <div className="wbk_gmailAuthField__loader" />
                                {__('Loading...', 'webba-booking-lite')}
                            </div>
                        </div>
                    ) : (
                        <div
                            className={classNames(
                                'wbk_gmailAuthField__message',
                                isAuthenticated
                                    ? 'wbk_gmailAuthField__message--success'
                                    : 'wbk_gmailAuthField__message--failed'
                            )}
                        >
                            <div className="wbk_gmailAuthField__title">
                                <img
                                    src={
                                        isAuthenticated
                                            ? successIcon
                                            : warningIcon
                                    }
                                    alt={
                                        isAuthenticated
                                            ? __(
                                                  'Success',
                                                  'webba-booking-lite'
                                              )
                                            : __(
                                                  'Warning',
                                                  'webba-booking-lite'
                                              )
                                    }
                                    className="wbk_gmailAuthField__icon"
                                />
                                {isAuthenticated
                                    ? __(
                                          'Authorized',
                                          'webba-booking-lite'
                                      )
                                    : internalError
                                      ? __(
                                            'Internal error',
                                            'webba-booking-lite'
                                        )
                                      : __(
                                            'Not authorized',
                                            'webba-booking-lite'
                                        )}
                            </div>
                            {!isAuthenticated && !internalError && authUrl && (
                                <TimedLink
                                    href={authUrl}
                                    className="wbk_gmailAuthField__subtitle"
                                >
                                    {__('Authorize', 'webba-booking-lite')}
                                </TimedLink>
                            )}
                            {!isAuthenticated && internalError && (
                                <div className="wbk_gmailAuthField__subtitle">
                                    {__(
                                        'Internal error occurred. Please try again later.',
                                        'webba-booking-lite'
                                    )}
                                </div>
                            )}
                            {isAuthenticated && revokeUrl && (
                                <TimedLink
                                    href={revokeUrl}
                                    className="wbk_gmailAuthField__subtitle"
                                >
                                    {__(
                                        'Remove authorization',
                                        'webba-booking-lite'
                                    )}
                                </TimedLink>
                            )}
                        </div>
                    )}
                </div>
                {misc?.description && (
                    <p className="wbk_gmailAuthField__description">
                        {misc.description}
                    </p>
                )}
            </div>
        )
    }
}
