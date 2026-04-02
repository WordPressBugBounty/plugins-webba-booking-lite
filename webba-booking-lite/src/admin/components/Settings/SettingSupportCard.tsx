import './Settings.scss'
import { __ } from '@wordpress/i18n'
import helpIcon from '../../../../public/images/icon-help.svg'
import helpDocumentationIcon from '../../../../public/images/icon-help-documentation.svg'
import helpEmailIcon from '../../../../public/images/icon-help-email.svg'
import classNames from 'classnames'
import { usePreset } from '../../hooks/usePreset'

export const SettingSupportCard = () => {
    const { admin_url } = usePreset()
    const supportUrl = `${admin_url}admin.php?page=wbk-main-contact`
    return (
        <div className={classNames('wbk_settings__section', 'wbk_settings__section--supportCard')}>
            <div className="wbk_settings__icon">
                <img src={helpIcon} alt="" />
            </div>
            <h2 className="wbk_settings__title">
                {__('Need Support?', 'webba-booking-lite')}
            </h2>
            <p className="wbk_settings__description">
                {__(
                    'Check our documentation or contact support',
                    'webba-booking-lite'
                )}
            </p>
            <div className="wbk_settings__actions">
                <a
                    className="wbk_settings__button"
                    href="https://webba-booking.com/documentation"
                    target="_blank"
                >
                    <img src={helpDocumentationIcon} alt="" />
                    {__('Documentation', 'webba-booking-lite')}
                </a>
                <a
                    className="wbk_settings__button"
                    href={supportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <img src={helpEmailIcon} alt="" />
                    {__('Support', 'webba-booking-lite')}
                </a>
            </div>
        </div>
    )
}
