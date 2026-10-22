import { IAuthPopupProps } from './types'
import './AuthPopup.scss'
import { __ } from '@wordpress/i18n'
import { useDispatch, useSelect } from '@wordpress/data'
import { addQueryArgs } from '@wordpress/url'
import classNames from 'classnames'
import { useEffect } from 'react'
import apiFetch from '@wordpress/api-fetch'
import TimedLink from '../common/TimedLink/TimedLink'
import warningIcon from '../../../../public/images/warning-icon.png'
import successIcon from '../../../../public/images/succesessful-icon.png'
import closeIcon from '../../../../public/images/icon-close.svg'
import ggLogo from '../../../../public/images/gg-calendar.png'
import outlookLogo from '../../../../public/images/icon-microsoft.svg'
import appleLogo from '../../../../public/images/icon-brand-apple.svg'
import { store, store_name } from '../../../store/backend'
import { IcloudAuthForm } from './IcloudAuthForm'

type CalendarProvider = 'google' | 'outlook' | 'icloud'

interface AuthData {
    isAuthenticated?: boolean
    internalError?: boolean
    authUrl?: string
    revokeUrl?: string
}

export const AuthPopup = ({ data, setData }: IAuthPopupProps) => {
    const calendarId = data?.id
    const easyAuth = data?.easy_auth
    const provider: CalendarProvider =
        data?.provider === 'outlook'
            ? 'outlook'
            : data?.provider === 'icloud'
              ? 'icloud'
              : 'google'

    const { setGgAuthData } = useDispatch(store)

    useEffect(() => {
        if (calendarId == null || provider === 'icloud') return
        let cancelled = false
        apiFetch({
            path: addQueryArgs('/wbk/v2/get-calendar-auth-data/', {
                calendar_id: calendarId,
            }),
        })
            .then((result: any) => {
                if (!cancelled) setGgAuthData(calendarId, result)
            })
            .catch(() => {
                if (!cancelled) setGgAuthData(calendarId, {})
            })
        return () => {
            cancelled = true
        }
    }, [calendarId, provider, setGgAuthData])

    const authData = useSelect(
        (select: any) => select(store_name).getGgAuthData(calendarId),
        [calendarId, provider]
    ) as AuthData | null

    const isLoading =
        provider !== 'icloud' &&
        (!authData ||
            (typeof authData === 'object' && Object.keys(authData).length === 0))
    const {
        isAuthenticated = false,
        internalError = false,
        authUrl,
        revokeUrl,
    } = authData || ({} as AuthData)

    const logo =
        provider === 'outlook'
            ? outlookLogo
            : provider === 'icloud'
              ? appleLogo
              : ggLogo
    const logoAlt =
        provider === 'outlook'
            ? __('Outlook', 'webba-booking-lite')
            : provider === 'icloud'
              ? __('iCloud Calendar', 'webba-booking-lite')
              : __('Google Calendar', 'webba-booking-lite')
    const subtitleText =
        provider === 'outlook'
            ? __(
                  'You’re one step away from completing the connection with Outlook. Please click the link below to finish the process.',
                  'webba-booking-lite'
              )
            : provider === 'icloud'
              ? __(
                    'Connect iCloud Calendar with your Apple Account email and an app-specific password.',
                    'webba-booking-lite'
                )
              : __(
                    'You’re one step away from completing the connection with Google Calendar. Please click the link below to finish the process.',
                    'webba-booking-lite'
                )

    return (
        <div className="wbk_authPopup">
            <div
                className={classNames('wbk_authPopup__innerWrapper', {
                    'wbk_authPopup__innerWrapper--icloud': provider === 'icloud',
                })}
            >
                <div
                    className="wbk_authPopup__btnClose"
                    onClick={() => setData(null)}
                >
                    <img src={closeIcon} />
                </div>
                <div className="wbk_authPopup__heading">
                    <img
                        src={logo}
                        alt={logoAlt}
                        className="wbk_authPopup__ggLogo"
                    />
                    <div className="wbk_authPopup__bodyWrapper">
                        {isLoading && (
                            <div className="wbk_authPopup__message">
                                <div className="wbk_authPopup__title">
                                    <div className="wbk_authPopup__loader" />
                                    {__('Loading...', 'webba-booking-lite')}
                                </div>
                            </div>
                        )}
                        {!isLoading &&
                            provider !== 'icloud' &&
                            easyAuth === 'yes' && (
                                <div
                                    className={classNames(
                                        'wbk_authPopup__message',
                                        isAuthenticated
                                            ? 'wbk_authPopup__message--success'
                                            : 'wbk_authPopup__message--failed'
                                    )}
                                >
                                    <div className="wbk_authPopup__title">
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
                                            className="wbk_authPopup__icon"
                                        />
                                        {isAuthenticated
                                            ? __(
                                                  'Authorized',
                                                  'webba-booking-lite'
                                              )
                                            : __(
                                                  'Not authorized',
                                                  'webba-booking-lite'
                                              )}
                                    </div>
                                </div>
                            )}
                        {provider === 'icloud' && (
                            <div className="wbk_authPopup__message">
                                <div className="wbk_authPopup__title">
                                    {__(
                                        'iCloud Calendar',
                                        'webba-booking-lite'
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <p className="wbk_authPopup__subtitle">{subtitleText}</p>
                </div>

                {provider === 'icloud' && calendarId != null && (
                    <IcloudAuthForm
                        calendarId={calendarId}
                        selectedCalendarId={data?.in_provider_id || ''}
                        onCalendarSaved={() => setData(null)}
                    />
                )}

                {provider !== 'icloud' &&
                    !isAuthenticated &&
                    !internalError &&
                    authUrl && (
                        <TimedLink
                            href={authUrl}
                            className="wbk_authPopup__linkWrapper"
                        >
                            {__('Authorize', 'webba-booking-lite')}
                        </TimedLink>
                    )}
                {provider !== 'icloud' && !isAuthenticated && internalError && (
                    <div className="wbk_authPopup__linkWrapper">
                        {__(
                            'Internal error occurred. Please try again later.',
                            'webba-booking-lite'
                        )}
                    </div>
                )}
                {provider !== 'icloud' && isAuthenticated && revokeUrl && (
                    <TimedLink
                        href={revokeUrl}
                        className="wbk_authPopup__linkWrapper"
                    >
                        {__('Revoke', 'webba-booking-lite')}
                    </TimedLink>
                )}
            </div>
        </div>
    )
}
