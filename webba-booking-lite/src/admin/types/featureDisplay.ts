export type TableMessageType = 'banner' | 'locked'

export interface FeatureDisplayConfig {
    hide_fields: boolean
    hide_tables: boolean
    table_message_type: TableMessageType
}

export const DEFAULT_FEATURE_DISPLAY_CONFIG: FeatureDisplayConfig = {
    hide_fields: true,
    hide_tables: false,
    table_message_type: 'banner',
}

export type ProFeatureBannerKey =
    | 'locations'
    | 'staff_members'
    | 'extras'
    | 'coupons'
    | 'forms'
    | 'connected_calendars'
    | 'daily_services'

export interface ProFeatureBannerContent {
    icon: string
    title: string
    headline: string
    description: string
    features: string[]
    previewType: ProFeatureBannerKey
}
