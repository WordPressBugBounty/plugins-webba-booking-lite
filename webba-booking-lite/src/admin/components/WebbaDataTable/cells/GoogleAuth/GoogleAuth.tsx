import { CellContext } from '@tanstack/react-table'
import styles from './GoogleAuth.module.scss'
import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import warningIcon from '../../../../../../public/images/warning-icon.png'
import successIcon from '../../../../../../public/images/succesessful-icon.png'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../../../store/backend'
import { addQueryArgs } from '@wordpress/url'

export const GoogleAuthCell = ({ cell }: CellContext<any, any>) => {
    const calendarId = cell.row.original?.id
    const authData = useSelect(
        // @ts-ignore
        (select) => select(store_name).getGgAuthData(calendarId),
        [cell.row.original]
    )
    const { isAuthenticated, connectionStatus } = authData[calendarId] || {}

    const controlButton = (
        <a
            href={addQueryArgs('admin.php', {
                page: 'wbk-gg-calendars',
                clid: calendarId,
            })}
            target="_blank"
        >
            {__('Manage authorization', 'webba-booking-lite')}
        </a>
    )

    return (
        <div className={styles.wrapper}>
            {!isAuthenticated && (
                <div className={classNames(styles.message, styles.failed)}>
                    <div className={styles.title}>
                        <img
                            src={warningIcon}
                            alt={__('Warning', 'webba-booking-lite')}
                            className={styles.icon}
                        />
                        {__('Authorization failed', 'webba-booking-lite')}
                    </div>
                    <div className={styles.subtitle}>
                        {__(
                            'Google API credentials not set',
                            'webba-booking-lite'
                        )}
                    </div>
                </div>
            )}
            {isAuthenticated && connectionStatus[0] === 0 && (
                <div className={classNames(styles.message, styles.failed)}>
                    <div className={styles.title}>
                        <img
                            src={warningIcon}
                            alt={__('Warning', 'webba-booking-lite')}
                            className={styles.icon}
                        />
                        {__('Authorization required', 'webba-booking-lite')}
                    </div>
                    <div className={styles.subtitle}>
                        {__(
                            'Click on the link below to start the authorization process',
                            'webba-booking-lite'
                        )}
                        . {controlButton}
                    </div>
                    <div className={styles.subtitle}>
                        {__('Details: ', 'webba-booking-lite')}{' '}
                        {connectionStatus[1]}
                    </div>
                </div>
            )}
            {isAuthenticated && connectionStatus[0] === 1 && (
                <div className={classNames(styles.message, styles.success)}>
                    <div className={styles.title}>
                        <img
                            src={successIcon}
                            alt={__('Success', 'webba-booking-lite')}
                            className={styles.icon}
                        />
                        {__('Authorized', 'webba-booking-lite')}
                    </div>
                    <div className={styles.subtitle}>
                        {__('Calendar name on Google:', 'webba-booking-lite')}{' '}
                        {connectionStatus[1]}. {controlButton}
                    </div>
                </div>
            )}
            {isAuthenticated && connectionStatus[0] === 2 && (
                <div className={classNames(styles.message, styles.failed)}>
                    <div className={styles.title}>
                        <img
                            src={warningIcon}
                            alt={__('Warning', 'webba-booking-lite')}
                            className={styles.icon}
                        />
                        {__('Authorization failed', 'webba-booking-lite')}
                    </div>
                    <div className={styles.subtitle}>
                        {__(
                            'Check Google API credentials, calendar ID and try to re-authorize this calendar',
                            'webba-booking-lite'
                        )}
                        . {controlButton}
                    </div>
                    <div className={styles.subtitle}>
                        {__('Details: ', 'webba-booking-lite')}{' '}
                        {connectionStatus[1]}
                    </div>
                </div>
            )}
        </div>
    )
}
