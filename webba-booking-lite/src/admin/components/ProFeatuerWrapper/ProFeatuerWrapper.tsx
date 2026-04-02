import { useSelect } from '@wordpress/data'
import './ProFeatuerWrapper.scss'
import '../Form/Fields/InputWrapper/InputWrapper.scss'
import { store } from '../../../store/backend'
import { __, sprintf } from '@wordpress/i18n'
import lockedIcon from '../../../../public/images/icon-lock.png'
import unlockIcon from '../../../../public/images/icon-lock-open.png'
import classNames from 'classnames'
import { processUpgradeMessage } from '../../../utilities/planHelper'

export const ProFeatuerWrapper = ({
    requiredPlans,
    additionalClasses,
    additionalButtonClasses,
}: {
    requiredPlans: string[]
    additionalClasses?: string
    additionalButtonClasses?: string
}) => {
    const { wording, admin_url, plan_map } = useSelect(
        (select) => select(store).getPreset(),
        []
    )

    if (!plan_map) {
        return null
    }

    return (
        <div className={classNames('wbk_proFeatuerWrapper__wrapper', additionalClasses)}>
            <a
                className={classNames(
                    'wbk_inputWrapper__upgradeLink',
                    'wbk_proFeatuerWrapper__upgradeLink',
                    additionalButtonClasses
                )}
                href={sprintf('%sadmin.php?page=wbk-main-pricing', admin_url)}
            >
                <img
                    className="wbk_inputWrapper__locked"
                    src={lockedIcon}
                    alt={__('Locked Icon', 'webba-booking-lite')}
                />
                <img
                    className="wbk_inputWrapper__unlock"
                    src={unlockIcon}
                    alt={__('Unlock Icon', 'webba-booking-lite')}
                />
                {
                    processUpgradeMessage(requiredPlans, plan_map, String(
                        wording?.plan_required_message ||
                        __(
                            'Available in #plan',
                            'webba-booking-lite'
                        )
                    ))
                }
            </a>
        </div>
    )
}
