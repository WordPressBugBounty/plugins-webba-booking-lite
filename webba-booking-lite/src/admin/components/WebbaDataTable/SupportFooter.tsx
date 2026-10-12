import { __ } from '@wordpress/i18n'
import { ReactComponent as QuestionIcon } from '../../../../public/images/icon-question-circle.svg'
import { ReactComponent as ExternalLinkIcon } from '../../../../public/images/icon-external.svg'
import './SupportFooter.scss'

const supportEmail = 'support@webba-booking.com'

export const SupportFooter = () => {
    return (
        <div className="wbk_supportFooter">
            <QuestionIcon
                className="wbk_supportFooter__icon"
                aria-hidden="true"
            />
            <p className="wbk_supportFooter__text">
                {__(
                    'Need support or have questions and suggestions? Email us at',
                    'webba-booking-lite'
                )}{' '}
                <a
                    className="wbk_supportFooter__link"
                    href={`mailto:${supportEmail}`}
                >
                    {supportEmail}
                    <ExternalLinkIcon aria-hidden="true" />
                </a>
            </p>
        </div>
    )
}
