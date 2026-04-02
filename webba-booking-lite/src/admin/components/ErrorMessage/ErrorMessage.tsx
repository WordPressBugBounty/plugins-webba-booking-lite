import { IErrorMessageProps } from './types'
import warningIcon from '../../../../public/images/table-warning.png'
import { __ } from '@wordpress/i18n'
import './ErrorMessage.scss'

export const ErrorMessage = ({ message, data, code }: IErrorMessageProps) => {
    return (
        <div className="wbk_errorMessage">
            {code === 'rest_forbidden' && (
                <div className="wbk_errorMessage__error">
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
