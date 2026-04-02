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
import { store, store_name } from '../../../store/backend'

type CalendarProvider = 'google' | 'outlook'

interface AuthData {
    isAuthenticated?: boolean
    internalError?: boolean
    authUrl?: string
    revokeUrl?: string
}

export const AuthPopup = ({ data, setData }: IAuthPopupProps) => {
    const calendarId = data?.id
    const easyAuth = data?.easy_auth
    const provider: CalendarProvider = data?.provider === 'outlook' ? 'outlook' : 'google'

    const { setGgAuthData } = useDispatch(store)

    useEffect(() => {
        if (calendarId == null) return
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
        (select: any) =>
            select(store_name).getGgAuthData(calendarId),
        [calendarId, provider]
    ) as AuthData | null

    const isLoading =
        !authData ||
        (typeof authData === 'object' && Object.keys(authData).length === 0)
    const {
        isAuthenticated = false,
        internalError = false,
        authUrl,
        revokeUrl,
    } = authData || ({} as AuthData)

    const isOutlook = provider === 'outlook'
    const logo = isOutlook ? outlookLogo : ggLogo
    const logoAlt = isOutlook
        ? __('Outlook', 'webba-booking-lite')
        : __('Google Calendar', 'webba-booking-lite')
    const subtitleText = isOutlook
        ? __(
              'You’re one step away from completing the connection with Outlook. Please click the link below to finish the process.',
              'webba-booking-lite'
          )
        : __(
              'You’re one step away from completing the connection with Google Calendar. Please click the link below to finish the process.',
              'webba-booking-lite'
          )

    return (
        <div className="wbk_authPopup">
            <div className="wbk_authPopup__innerWrapper">
                <div className="wbk_authPopup__btnClose" onClick={() => setData(null)}>
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
                        {!isLoading && easyAuth === 'yes' && (
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
                                        ? __('Authorized', 'webba-booking-lite')
                                        : __(
                                              'Not authorized',
                                              'webba-booking-lite'
                                          )}
                                </div>
                            </div>
                        )}
                    </div>
                    <p className="wbk_authPopup__subtitle">
                        {subtitleText}
                    </p>
                </div>
                {!isAuthenticated && !internalError && authUrl && (
                    <TimedLink
                        href={authUrl}
                        className="wbk_authPopup__linkWrapper"
                    >
                        {__('Authorize', 'webba-booking-lite')}
                    </TimedLink>
                )}
                {!isAuthenticated && internalError && (
                    <div className="wbk_authPopup__linkWrapper">
                        {__(
                            'Internal error occurred. Please try again later.',
                            'webba-booking-lite'
                        )}
                    </div>
                )}
                {isAuthenticated && revokeUrl && (
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
