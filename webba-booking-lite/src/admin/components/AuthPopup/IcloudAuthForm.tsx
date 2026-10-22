import { __ } from '@wordpress/i18n'
import { useCallback, useEffect, useState } from 'react'
import apiFetch from '@wordpress/api-fetch'
import { addQueryArgs } from '@wordpress/url'
import { useDispatch, useSelect } from '@wordpress/data'
import classNames from 'classnames'
import { store, store_name } from '../../../store/backend'
import { Button } from '../Button/Button'
import './IcloudAuthForm.scss'

type FormMessage = {
    text: string
    type: 'success' | 'error'
}

type CalendarDetail = {
    id: string
    name: string
    writable?: boolean
    readonly?: boolean
}

type AuthData = {
    isAuthenticated?: boolean
    email?: string
    lastError?: string
    needsReconnect?: boolean
    calendarDetails?: CalendarDetail[]
    selectedCalendarId?: string
    helpUrl?: string
    helpText?: string
}

type IcloudAuthFormProps = {
    calendarId: number | string
    selectedCalendarId?: string
    onConnected?: () => void
    onCalendarSaved?: (providerCalendarId: string) => void
}

export const IcloudAuthForm = ({
    calendarId,
    selectedCalendarId = '',
    onConnected,
    onCalendarSaved,
}: IcloudAuthFormProps) => {
    const { setGgAuthData, setItems } = useDispatch(store)
    const [email, setEmail] = useState('')
    const [appPassword, setAppPassword] = useState('')
    const [busy, setBusy] = useState(false)
    const [message, setMessage] = useState<FormMessage | null>(null)
    const [calendarHref, setCalendarHref] = useState(selectedCalendarId)

    const connectedCalendars = useSelect(
        (select: any) => select(store).getItems('connected_calendars') || [],
        []
    ) as Array<Record<string, unknown>>

    const refreshAuth = useCallback(() => {
        if (calendarId == null) return
        apiFetch({
            path: addQueryArgs('/wbk/v2/get-calendar-auth-data/', {
                calendar_id: calendarId,
            }),
        })
            .then((result: any) => setGgAuthData(calendarId, result))
            .catch(() => setGgAuthData(calendarId, {}))
    }, [calendarId, setGgAuthData])

    useEffect(() => {
        refreshAuth()
    }, [refreshAuth])

    const authData = useSelect(
        (select: any) => select(store_name).getGgAuthData(calendarId),
        [calendarId]
    ) as AuthData | null

    useEffect(() => {
        if (authData?.email) {
            setEmail(authData.email)
        }
        const savedId =
            authData?.selectedCalendarId || selectedCalendarId || ''
        if (savedId) {
            setCalendarHref(savedId)
        }
    }, [authData, selectedCalendarId])

    const syncSavedCalendar = useCallback(
        (providerCalendarId: string) => {
            const next = (connectedCalendars || []).map((item) =>
                String(item?.id) === String(calendarId)
                    ? { ...item, in_provider_id: providerCalendarId }
                    : item
            )
            setItems('connected_calendars', next)
            onCalendarSaved?.(providerCalendarId)
        },
        [
            calendarId,
            connectedCalendars,
            onCalendarSaved,
            setItems,
        ]
    )

    const postAction = async (
        path: string,
        body: Record<string, unknown> = {}
    ) => {
        setBusy(true)
        setMessage(null)
        try {
            const result: any = await apiFetch({
                path,
                method: 'POST',
                data: { calendar_id: calendarId, ...body },
            })
            if (result?.ok === false) {
                setMessage({
                    type: 'error',
                    text:
                        result.message ||
                        __('Action failed.', 'webba-booking-lite'),
                })
            } else {
                setMessage({
                    type: 'success',
                    text:
                        result?.data?.message ||
                        __('Done.', 'webba-booking-lite'),
                })
                setAppPassword('')
                if (path.includes('/calendars/')) {
                    const savedId =
                        (result?.data?.in_provider_id as string) ||
                        (body.provider_calendar_id as string) ||
                        calendarHref
                    if (savedId) {
                        setCalendarHref(savedId)
                        syncSavedCalendar(savedId)
                    }
                }
                refreshAuth()
                if (path.includes('/connect/') && onConnected) {
                    onConnected()
                }
            }
        } catch (e: any) {
            setMessage({
                type: 'error',
                text:
                    e?.message ||
                    __('Action failed. Please try again.', 'webba-booking-lite'),
            })
        } finally {
            setBusy(false)
        }
    }

    const testConnection = async () => {
        // Snapshot so a busy/disabled cycle cannot lose the typed password on success.
        const passwordSnapshot = appPassword
        setBusy(true)
        setMessage(null)
        try {
            const result: any = await apiFetch({
                path: '/wbk/v2/icloud-calendar/test/',
                method: 'POST',
                data: {
                    calendar_id: calendarId,
                    email: email || undefined,
                    app_password: passwordSnapshot || undefined,
                },
            })
            if (result?.ok === false) {
                setAppPassword('')
                setMessage({
                    type: 'error',
                    text:
                        result.message ||
                        __('Action failed.', 'webba-booking-lite'),
                })
                return
            }
            // Success: restore snapshot (do not clear).
            setAppPassword(passwordSnapshot)
            setMessage({
                type: 'success',
                text:
                    result?.data?.message ||
                    __('Connection successful.', 'webba-booking-lite'),
            })
        } catch (e: any) {
            setAppPassword('')
            setMessage({
                type: 'error',
                text:
                    e?.message ||
                    __('Action failed. Please try again.', 'webba-booking-lite'),
            })
        } finally {
            setBusy(false)
        }
    }

    if (!authData || Object.keys(authData).length === 0) {
        return (
            <div className="wbk_icloudAuthForm__loading">
                {__('Loading...', 'webba-booking-lite')}
            </div>
        )
    }

    const isAuthenticated = !!authData.isAuthenticated
    const writableCalendars = (authData.calendarDetails || []).filter(
        (c) => !c.readonly
    )

    return (
        <div className="wbk_icloudAuthForm">
            {authData.needsReconnect && (
                <p className="wbk_icloudAuthForm__error">
                    {__(
                        'Credentials invalid. Please reconnect.',
                        'webba-booking-lite'
                    )}
                </p>
            )}
            {authData.lastError && (
                <p className="wbk_icloudAuthForm__error">{authData.lastError}</p>
            )}

            <label className="wbk_icloudAuthForm__field">
                <span>{__('Apple Account email', 'webba-booking-lite')}</span>
                <input
                    type="email"
                    className="wbk_icloudAuthForm__input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    // readOnly (not disabled): some browsers clear password/email
                    // values when inputs are disabled during the request.
                    readOnly={busy}
                />
            </label>

            <label className="wbk_icloudAuthForm__field">
                <span>{__('App-specific password', 'webba-booking-lite')}</span>
                <input
                    type="password"
                    className="wbk_icloudAuthForm__input"
                    value={appPassword}
                    onChange={(e) => setAppPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder={
                        isAuthenticated
                            ? __('•••••••• (unchanged)', 'webba-booking-lite')
                            : ''
                    }
                    readOnly={busy}
                />
            </label>

            <p className="wbk_icloudAuthForm__help">
                <a
                    href={authData.helpUrl || 'https://account.apple.com/'}
                    target="_blank"
                    rel="noreferrer"
                >
                    https://account.apple.com/
                </a>
                {' — '}
                {authData.helpText ||
                    __(
                        'Sign-In and Security → App-Specific Passwords. Never use your regular Apple Account password.',
                        'webba-booking-lite'
                    )}
            </p>

            <div className="wbk_icloudAuthForm__actions">
                <Button
                    type="primary"
                    disabled={
                        busy || !email || (!appPassword && !isAuthenticated)
                    }
                    onClick={() =>
                        postAction('/wbk/v2/icloud-calendar/connect/', {
                            email,
                            app_password: appPassword,
                        })
                    }
                >
                    {isAuthenticated
                        ? __('Reconnect', 'webba-booking-lite')
                        : __('Connect', 'webba-booking-lite')}
                </Button>
                <Button
                    type="secondary"
                    disabled={busy}
                    onClick={testConnection}
                >
                    {__('Test connection', 'webba-booking-lite')}
                </Button>
                {isAuthenticated && (
                    <Button
                        type="secondary"
                        disabled={busy}
                        onClick={() =>
                            postAction('/wbk/v2/icloud-calendar/disconnect/')
                        }
                    >
                        {__('Disconnect', 'webba-booking-lite')}
                    </Button>
                )}
            </div>

            {isAuthenticated && writableCalendars.length > 0 && (
                <div className="wbk_icloudAuthForm__mapping">
                    <label className="wbk_icloudAuthForm__field">
                        <span>
                            {__(
                                'Calendar (export & availability)',
                                'webba-booking-lite'
                            )}
                        </span>
                        <select
                            className="wbk_icloudAuthForm__input"
                            value={calendarHref}
                            onChange={(e) => setCalendarHref(e.target.value)}
                            disabled={busy}
                        >
                            <option value="">
                                {__('Select calendar…', 'webba-booking-lite')}
                            </option>
                            {writableCalendars.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <Button
                        type="primary"
                        disabled={busy || !calendarHref}
                        onClick={() =>
                            postAction('/wbk/v2/icloud-calendar/calendars/', {
                                provider_calendar_id: calendarHref,
                            })
                        }
                    >
                        {__('Save calendar', 'webba-booking-lite')}
                    </Button>
                </div>
            )}

            {message && (
                <p
                    className={classNames('wbk_icloudAuthForm__message', {
                        'wbk_icloudAuthForm__message--success':
                            message.type === 'success',
                        'wbk_icloudAuthForm__message--error':
                            message.type === 'error',
                    })}
                >
                    {message.text}
                </p>
            )}
        </div>
    )
}
