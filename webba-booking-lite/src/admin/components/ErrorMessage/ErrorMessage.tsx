import { IErrorMessageProps } from './types'
import warningIcon from '../../../../public/images/table-warning.png'
import { __ } from '@wordpress/i18n'
import styles from './ErrorMessage.module.scss'

export const ErrorMessage = ({ message, data, code }: IErrorMessageProps) => {
    return (
        <div className={styles.wrapper}>
            {code === 'rest_forbidden' && (
                <div className={styles.error}>
                    <img
                        src={warningIcon}
                        alt={__('Forbidden items!', 'webba-booking-lite')}
                    />
                    <p>{message}</p>
                </div>
            )}
        </div>
    )
}
