import { __, sprintf } from '@wordpress/i18n'
import { useSelect } from '@wordpress/data'
import classNames from 'classnames'
import { store } from '../../../store/backend'
import { ProFeatureBannerKey } from '../../types/featureDisplay'
import { PRO_FEATURE_BANNER_CONTENT } from './proFeatureBannerContent'
import { ProFeatureBannerPreview } from './ProFeatureBannerPreview'
import { getUniquePlanBadges } from '../../../utilities/planHelper'
import closeIcon2 from '../../../../public/images/close-icon2.png'
import './ProFeatureBanner.scss'

interface ProFeatureBannerProps {
    featureKey: ProFeatureBannerKey
    requiredPlans: string[]
    onClose?: () => void
}

export const ProFeatureBanner = ({
    featureKey,
    requiredPlans,
    onClose,
}: ProFeatureBannerProps) => {
    const { plugin_url, admin_url } = useSelect(
        (select) => select(store).getPreset(),
        []
    )
    const content = PRO_FEATURE_BANNER_CONTENT[featureKey]
    const upgradeUrl = sprintf('%sadmin.php?page=wbk-main-pricing', admin_url)
    const planBadges = getUniquePlanBadges(requiredPlans)

    return (
        <div
            className={classNames('wbk_proFeatureBanner', {
                'wbk_proFeatureBanner--dismissible': !!onClose,
            })}
        >
            {onClose && (
                <button
                    type="button"
                    className="wbk_proFeatureBanner__closeBtn"
                    onClick={onClose}
                    aria-label={__('Close', 'webba-booking-lite')}
                >
                    <img src={closeIcon2} alt="" />
                </button>
            )}
            <div className="wbk_proFeatureBanner__content">
                <div className="wbk_proFeatureBanner__header">
                    <div className="wbk_proFeatureBanner__titleGroup">
                        {plugin_url && (
                            <span className="wbk_proFeatureBanner__iconWrap">
                                <img
                                    src={`${plugin_url}/public/images/${content.icon}`}
                                    alt=""
                                />
                            </span>
                        )}
                        <h2 className="wbk_proFeatureBanner__title">
                            {content.title}
                        </h2>
                    </div>
                    <div className="wbk_proFeatureBanner__badges">
                        <span
                            className={classNames(
                                'wbk_proFeatureBanner__badge',
                                `wbk_proFeatureBanner__badge--minimum`
                            )}
                        >
                            {__('Available in Pro', 'webba-booking-lite')}
                        </span>
                        {/* {planBadges.map(({ plan, label }) => (
                            <span
                                key={plan}
                                className={classNames(
                                    'wbk_proFeatureBanner__badge',
                                    `wbk_proFeatureBanner__badge--${plan}`
                                )}
                            >
                                {label}
                            </span>
                        ))} */}
                    </div>
                </div>

                <h3 className="wbk_proFeatureBanner__headline">
                    {content.headline}
                </h3>
                <p className="wbk_proFeatureBanner__description">
                    {content.description}
                </p>

                <ul className="wbk_proFeatureBanner__features">
                    {content.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                    ))}
                </ul>

                <div className="wbk_proFeatureBanner__actions">
                    <a
                        className="wbk_proFeatureBanner__upgradeButton"
                        href={upgradeUrl}
                    >
                        {__('Upgrade', 'webba-booking-lite')}
                    </a>
                    <a
                        className="wbk_proFeatureBanner__learnMoreButton"
                        href="https://webba-booking.com/features/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {__('Learn more', 'webba-booking-lite')}
                    </a>
                </div>
            </div>

            <div className="wbk_proFeatureBanner__preview">
                <ProFeatureBannerPreview previewType={content.previewType} />
            </div>
        </div>
    )
}
