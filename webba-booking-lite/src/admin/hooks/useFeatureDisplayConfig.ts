import { useMemo } from 'react'
import {
    DEFAULT_FEATURE_DISPLAY_CONFIG,
    FeatureDisplayConfig,
} from '../types/featureDisplay'
import { usePreset } from './usePreset'

export const useFeatureDisplayConfig = (): FeatureDisplayConfig => {
    const { feature_display_config } = usePreset()

    return useMemo(
        () => ({
            ...DEFAULT_FEATURE_DISPLAY_CONFIG,
            ...(feature_display_config || {}),
        }),
        [feature_display_config]
    )
}

export const shouldHideLockedFields = (
    config: FeatureDisplayConfig
): boolean => config.hide_fields

export const shouldHideLockedTables = (
    config: FeatureDisplayConfig
): boolean => config.hide_tables
