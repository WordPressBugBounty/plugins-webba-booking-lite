import { __, sprintf } from '@wordpress/i18n'
import { useSelect } from '@wordpress/data'
import classNames from 'classnames'
import { store } from '../../../store/backend'
import { getUniquePlanBadges } from '../../../utilities/planHelper'
import { buildFormTabBannerContent } from './proFeatureFormTabBannerContent'
import { ResolvedFormField } from '../Form/types'
import './ProFeatureBanner.scss'

interface ProFeatureFormTabBannerProps {
    tabTitle: string
    requiredPlans: string[]
    lockedFields: ResolvedFormField[]
}

export const ProFeatureFormTabBanner = ({
    tabTitle,
    requiredPlans,
    lockedFields,
}: ProFeatureFormTabBannerProps) => {
    const { plugin_url, admin_url } = useSelect(
        (select) => select(store).getPreset(),
        []
    )
    const content = buildFormTabBannerContent(tabTitle, lockedFields)
    const upgradeUrl = sprintf('%sadmin.php?page=wbk-main-pricing', admin_url)
    const planBadges = getUniquePlanBadges(requiredPlans)

    return (
        <div className="wbk_proFeatureBanner wbk_proFeatureBanner--compact">
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
                    {planBadges.length > 0 && (
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
                    )}
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
        </div>
    )
}
