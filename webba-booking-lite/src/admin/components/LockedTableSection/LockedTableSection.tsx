import { ReactNode } from 'react'
import classNames from 'classnames'
import { ProFeatuerWrapper } from '../ProFeatuerWrapper/ProFeatuerWrapper'
import { ProFeatureBanner } from '../ProFeatureBanner/ProFeatureBanner'
import { useFeatureDisplayConfig } from '../../hooks/useFeatureDisplayConfig'
import { usePreset } from '../../hooks/usePreset'
import { ProFeatureBannerKey } from '../../types/featureDisplay'
import './LockedTableSection.scss'

interface LockedTableSectionProps {
    isLocked: boolean
    requiredPlans: string[]
    featureKey: ProFeatureBannerKey
    className?: string
    children: ReactNode
}

export const LockedTableSection = ({
    isLocked,
    requiredPlans,
    featureKey,
    className,
    children,
}: LockedTableSectionProps) => {
    const featureDisplayConfig = useFeatureDisplayConfig()
    const { plan_map } = usePreset()
    const isPresetLoaded =
        Boolean(plan_map) && typeof plan_map === 'object'

    if (!isLocked) {
        return <>{children}</>
    }

    // Avoid locked-state flicker before preset/plan data is loaded.
    if (!isPresetLoaded) {
        return <>{children}</>
    }

    if (featureDisplayConfig.hide_tables) {
        return null
    }

    if (featureDisplayConfig.table_message_type === 'banner') {
        return (
            <div className={className}>
                <ProFeatureBanner
                    featureKey={featureKey}
                    requiredPlans={requiredPlans}
                />
            </div>
        )
    }

    return (
        <div
            className={classNames(
                'wbk_lockedTableSection',
                className
            )}
        >
            <ProFeatuerWrapper requiredPlans={requiredPlans} />
            {children}
        </div>
    )
}
