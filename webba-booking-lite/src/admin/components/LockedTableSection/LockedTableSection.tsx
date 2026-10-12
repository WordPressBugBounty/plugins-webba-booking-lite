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

    // Avoid locked-state flicker before preset/plan data is loaded.
    const showAsLocked = isLocked && isPresetLoaded
    const showLockedOverlay =
        showAsLocked &&
        !featureDisplayConfig.hide_tables &&
        featureDisplayConfig.table_message_type !== 'banner'

    let content: ReactNode = children

    if (showAsLocked) {
        if (featureDisplayConfig.hide_tables) {
            content = null
        } else if (featureDisplayConfig.table_message_type === 'banner') {
            content = (
                <ProFeatureBanner
                    featureKey={featureKey}
                    requiredPlans={requiredPlans}
                />
            )
        } else {
            content = (
                <>
                    <ProFeatuerWrapper requiredPlans={requiredPlans} />
                    {children}
                </>
            )
        }
    }

    // Keep a stable wrapper whenever a className is provided so plan/preset
    // transitions do not remount table children (breaks Playwright scroll/click).
    if (!className && !showLockedOverlay) {
        return <>{content}</>
    }

    return (
        <div
            className={classNames(
                {
                    wbk_lockedTableSection: showLockedOverlay,
                },
                className
            )}
        >
            {content}
        </div>
    )
}
