import './UserCalendars.scss'
import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import warningIcon from '../../../../../public/images/warning-icon.png'
import successIcon from '../../../../../public/images/succesessful-icon.png'
import iconGoogle from '../../../../../public/images/icon-google.svg'
import iconMicrosoft from '../../../../../public/images/icon-microsoft.svg'
import { useDispatch, useSelect } from '@wordpress/data'
import { addQueryArgs } from '@wordpress/url'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { store } from '../../../../store/backend'

const urlCreationTimes = new Map<string, number>()

const useCountdownTimer = (url: string, initialMinutes: number = 5) => {
    const getCreationTime = useCallback(() => {
        if (!urlCreationTimes.has(url)) {
            urlCreationTimes.set(url, Date.now())
        }
        return urlCreationTimes.get(url)!
    }, [url])

    const [currentTime, setCurrentTime] = useState(Date.now())
    const creationTime = getCreationTime()
    const expirationTime = creationTime + initialMinutes * 60 * 1000
    const timeLeft = Math.max(
        0,
        Math.floor((expirationTime - currentTime) / 1000)
    )
    const isExpired = timeLeft <= 0

    useEffect(() => {
        if (isExpired) {
            return
        }
        const timer = setInterval(() => {
            setCurrentTime(Date.now())
        }, 1000)
        return () => clearInterval(timer)
    }, [isExpired])

    const formatTime = useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }, [])

    return {
        timeLeft,
        isExpired,
        formattedTime: formatTime(timeLeft),
    }
}

interface TimedLinkProps {
    href: string
    children: React.ReactNode
    className?: string
    target?: string
    rel?: string
}

const TimedLink: React.FC<TimedLinkProps> = ({
    href,
    children,
    className,
    target = '_blank',
    rel = 'noopener noreferrer',
}) => {
    const { isExpired, formattedTime } = useCountdownTimer(href, 5)

    if (isExpired) {
        return (
            <div className={className}>
                <span style={{ color: '#999', fontStyle: 'italic' }}>
                    {__(
                        'Link expired. Please reload the page to get a new link.',
                        'webba-booking-lite'
                    )}
                </span>
            </div>
        )
    }

    return (
        <div className={className}>
            <a href={href} target={target} rel={rel}>
                {children}
            </a>
            <div style={{ fontSize: '0.8em', color: '#666', marginTop: '4px' }}>
                {__('Link expires in:', 'webba-booking-lite')} {formattedTime}
            </div>
        </div>
    )
}

export const CalendarItem = ({ calendar }: any) => {
    const calendarId = calendar?.id
    const easyAuth = calendar?.easy_auth
    const provider = calendar?.provider || 'google'
    const { updateUserCalendar } = useDispatch(store)

    const authData = useSelect(
        (select: any) => select(store).getGgAuthData(calendarId),
        [calendarId]
    )
    const isLoading =
        !authData ||
        (typeof authData === 'object' && Object.keys(authData).length === 0)
    const { isAuthenticated, internalError, authUrl, revokeUrl } = authData || {}

    const manageAuthLink = (
        <a
            href={addQueryArgs('admin.php', {
                page: 'wbk-connected-calendars',
                clid: calendarId,
            })}
            target="_blank"
        >
            {__('Manage authorization', 'webba-booking-lite')}
        </a>
    )

    const controlButton =
        provider === 'outlook' && isAuthenticated && revokeUrl ? (
            <TimedLink href={revokeUrl}>
                {__('Revoke', 'webba-booking-lite')}
            </TimedLink>
        ) : (
            manageAuthLink
        )

    const isOutlook = provider === 'outlook'
    const providerIcon = isOutlook ? iconMicrosoft : iconGoogle
    const providerLabel = isOutlook
        ? __('Outlook', 'webba-booking-lite')
        : provider === 'google'
          ? __('Google', 'webba-booking-lite')
          : provider

    const calendarOptions = useMemo(() => {
        const raw = authData?.calendars
        if (!raw) return []
        if (Array.isArray(raw)) {
            return raw.map((item: any) => ({
                value: item?.id ?? item,
                label: item?.name ?? item?.id ?? item,
            }))
        }
        if (typeof raw === 'object' && Object.keys(raw).length > 0) {
            return Object.entries(raw).map(([id, name]) => ({
                value: id,
                label: String(name),
            }))
        }
        return []
    }, [authData?.calendars])

    const handleCalendarInProviderChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const newId = e.target.value
            updateUserCalendar({
                ...calendar,
                in_provider_id: newId,
            })
        },
        [calendar, updateUserCalendar]
    )

    return (
        <div className="wbk_userCalendars__calendarItem">
            <div className="wbk_userCalendars__headingRow">
                <h3 className="wbk_userCalendars__heading">{calendar?.name}</h3>
                <div
                    className={classNames(
                        'wbk_userCalendars__providerBadge',
                        isOutlook ? 'wbk_userCalendars__providerBadge--outlook' : 'wbk_userCalendars__providerBadge--google'
                    )}
                >
                    <img
                        src={providerIcon}
                        alt={providerLabel}
                        className="wbk_userCalendars__providerBadgeIcon"
                    />
                    <span className="wbk_userCalendars__providerBadgeLabel">{providerLabel}</span>
                </div>
            </div>
            <div className="wbk_userCalendars__divider"></div>
            <div className="wbk_userCalendars__info">
                <strong>{__('Mode: ', 'webba-booking-lite')}</strong>
                {calendar?.mode}
            </div>
            {isAuthenticated && (
                <div className="wbk_userCalendars__info">
                    <strong>{__('Calendar in Provider Account: ', 'webba-booking-lite')}</strong>
                    {calendarOptions.length > 0 ? (
                        <select
                            className="wbk_userCalendars__calendarSelect"
                            value={calendar?.in_provider_id ?? ''}
                            onChange={handleCalendarInProviderChange}
                        >
                            {calendarOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <span>{calendar?.in_provider_id}</span>
                    )}
                </div>
            )}
            <div className="wbk_userCalendars__divider"></div>

            {isLoading ? (
                <div className={classNames('wbk_userCalendars__message', 'wbk_userCalendars__authLoading')}>
                    <div className="wbk_userCalendars__title">
                        <div className="wbk_userCalendars__spinner" />
                        {__('Loading...', 'webba-booking-lite')}
                    </div>
                </div>
            ) : easyAuth === 'yes' ? (
                <div
                    className={classNames(
                        'wbk_userCalendars__message',
                        isAuthenticated ? 'wbk_userCalendars__message--success' : 'wbk_userCalendars__message--failed'
                    )}
                >
                    <div className="wbk_userCalendars__title">
                        <img
                            src={isAuthenticated ? successIcon : warningIcon}
                            alt={
                                isAuthenticated
                                    ? __('Success', 'webba-booking-lite')
                                    : __('Warning', 'webba-booking-lite')
                            }
                            className="wbk_userCalendars__icon"
                        />
                        {isAuthenticated
                            ? __('Authorized', 'webba-booking-lite')
                            : __('Not authorized', 'webba-booking-lite')}
                    </div>
                    {!isAuthenticated && !internalError && authUrl && (
                        <TimedLink
                            href={authUrl}
                            className="wbk_userCalendars__subtitle"
                        >
                            {__('Authorize', 'webba-booking-lite')}
                        </TimedLink>
                    )}
                    {!isAuthenticated && internalError && (
                        <div className="wbk_userCalendars__subtitle">
                            {__(
                                'Internal error occurred. Please try again later.',
                                'webba-booking-lite'
                            )}
                        </div>
                    )}
                    {isAuthenticated && revokeUrl && (
                        <TimedLink
                            href={revokeUrl}
                            className="wbk_userCalendars__subtitle"
                        >
                            {__('Revoke', 'webba-booking-lite')}
                        </TimedLink>
                    )}
                </div>
            ) : (
                <>
                    {isAuthenticated ? (
                        <div
                            className={classNames(
                                'wbk_userCalendars__message',
                                'wbk_userCalendars__message--success'
                            )}
                        >
                            <div className="wbk_userCalendars__title">
                                <img
                                    src={successIcon}
                                    alt={__('Success', 'webba-booking-lite')}
                                    className="wbk_userCalendars__icon"
                                />
                                {__('Authorized', 'webba-booking-lite')}
                            </div>
                            <div className="wbk_userCalendars__subtitle">
                                {controlButton}
                            </div>
                        </div>
                    ) : (
                        <div
                            className={classNames(
                                'wbk_userCalendars__message',
                                'wbk_userCalendars__message--failed'
                            )}
                        >
                            <div className="wbk_userCalendars__title">
                                <img
                                    src={warningIcon}
                                    alt={__('Warning', 'webba-booking-lite')}
                                    className="wbk_userCalendars__icon"
                                />
                                {internalError
                                    ? __('Internal error', 'webba-booking-lite')
                                    : __('Not authorized', 'webba-booking-lite')}
                            </div>
                            {internalError ? (
                                <div className="wbk_userCalendars__subtitle">
                                    {__(
                                        'An internal error occurred. Please check API credentials and calendar ID.',
                                        'webba-booking-lite'
                                    )}
                                    . {controlButton}
                                </div>
                            ) : (
                                <>
                                    {authUrl ? (
                                        <TimedLink
                                            href={authUrl}
                                            className="wbk_userCalendars__subtitle"
                                        >
                                            {__('Authorize', 'webba-booking-lite')}
                                        </TimedLink>
                                    ) : (
                                        <div className="wbk_userCalendars__subtitle">
                                            {__(
                                                'Click on the link below to start the authorization process',
                                                'webba-booking-lite'
                                            )}
                                            . {controlButton}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
