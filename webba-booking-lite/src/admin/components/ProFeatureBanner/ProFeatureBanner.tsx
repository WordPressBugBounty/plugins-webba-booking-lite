import { __, sprintf } from '@wordpress/i18n'
import { useSelect } from '@wordpress/data'
import classNames from 'classnames'
import { store } from '../../../store/backend'
import { ProFeatureBannerKey } from '../../types/featureDisplay'
import { PRO_FEATURE_BANNER_CONTENT } from './proFeatureBannerContent'
import { ProFeatureBannerPreview } from './ProFeatureBannerPreview'
import { getUniquePlanBadges } from '../../../utilities/planHelper'
import './ProFeatureBanner.scss'

interface ProFeatureBannerProps {
    featureKey: ProFeatureBannerKey
    requiredPlans: string[]
}

export const ProFeatureBanner = ({
    featureKey,
    requiredPlans,
}: ProFeatureBannerProps) => {
    const { plugin_url, admin_url } = useSelect(
        (select) => select(store).getPreset(),
        []
    )
    const content = PRO_FEATURE_BANNER_CONTENT[featureKey]
    const upgradeUrl = sprintf('%sadmin.php?page=wbk-main-pricing', admin_url)
    const planBadges = getUniquePlanBadges(requiredPlans)

    return (
        <div className="wbk_proFeatureBanner">
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
                        {planBadges.map(({ plan, label }) => (
                            <span
                                key={plan}
                                className={classNames(
                                    'wbk_proFeatureBanner__badge',
                                    `wbk_proFeatureBanner__badge--${plan}`
                                )}
                            >
                                {label}
                            </span>
                        ))}
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
