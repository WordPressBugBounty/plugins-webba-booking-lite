import { CellContext } from '@tanstack/react-table'
import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import { useCallback, useEffect } from 'react'
import apiFetch from '@wordpress/api-fetch'
import { addQueryArgs } from '@wordpress/url'
import { useDispatch, useSelect } from '@wordpress/data'
import warningIcon from '../../../../../../public/images/warning-icon.png'
import successIcon from '../../../../../../public/images/succesessful-icon.png'
import { store, store_name } from '../../../../../store/backend'
import '../GoogleAuth/GoogleAuth.scss'
import './IcloudAuth.scss'

type AuthData = {
    isAuthenticated?: boolean
    needsReconnect?: boolean
    lastError?: string
}

type IcloudAuthCellProps = CellContext<any, any> & {
    onOpenAuth?: (row: any) => void
}

export const IcloudAuthCell = ({
    cell,
    onOpenAuth,
}: IcloudAuthCellProps) => {
    const calendarId = cell.row.original?.id
    const { setGgAuthData } = useDispatch(store)

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

    if (!authData || Object.keys(authData).length === 0) {
        return (
            <div className="wbk_googleAuth__wrapper">
                <div className="wbk_googleAuth__message wbk_googleAuth__message--loading">
                    <div className="wbk_googleAuth__title">
                        <div className="wbk_googleAuth__loader" />
                    </div>
                </div>
            </div>
        )
    }

    const isAuthenticated = !!authData.isAuthenticated

    return (
        <div className="wbk_googleAuth__wrapper">
            <div
                className={classNames(
                    'wbk_googleAuth__message',
                    isAuthenticated
                        ? 'wbk_googleAuth__message--success'
                        : 'wbk_googleAuth__message--failed'
                )}
            >
                <div className="wbk_googleAuth__title">
                    <img
                        src={isAuthenticated ? successIcon : warningIcon}
                        alt=""
                        className="wbk_googleAuth__icon"
                    />
                    {isAuthenticated
                        ? __('Connected', 'webba-booking-lite')
                        : __('Not connected', 'webba-booking-lite')}
                </div>
                {authData.needsReconnect && (
                    <div className="wbk_googleAuth__subtitle">
                        {__(
                            'Credentials invalid. Please reconnect.',
                            'webba-booking-lite'
                        )}
                    </div>
                )}
                {onOpenAuth && (
                    <button
                        type="button"
                        className="wbk_icloudAuthCell__action"
                        onClick={() => onOpenAuth(cell.row.original)}
                    >
                        {isAuthenticated
                            ? __('Manage', 'webba-booking-lite')
                            : __('Connect', 'webba-booking-lite')}
                    </button>
                )}
            </div>
        </div>
    )
}
