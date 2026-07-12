import { __, sprintf } from '@wordpress/i18n'
import { ResolvedFormField } from '../Form/types'

export interface ProFeatureFormTabBannerContent {
    icon: string
    title: string
    headline: string
    description: string
    features: string[]
}

const containsHtml = (value: string): boolean => /<[a-z][\s\S]*>/i.test(value)

const getBannerDescription = (
    lockedFields: ResolvedFormField[],
    tabTitle: string
): string => {
    const plainDescription = lockedFields.find(
        (field) => field.description && !containsHtml(field.description)
    )?.description

    if (plainDescription) {
        return plainDescription
    }

    return sprintf(
        __(
            'Upgrade your plan to access %s settings and get more control over your booking experience.',
            'webba-booking-lite'
        ),
        tabTitle.toLowerCase()
    )
}

export const buildFormTabBannerContent = (
    tabTitle: string,
    lockedFields: ResolvedFormField[]
): ProFeatureFormTabBannerContent => {
    const fieldLabels = lockedFields
        .map((field) => field.label)
        .filter((label): label is string => Boolean(label))
    const uniqueFieldLabels = Array.from(new Set(fieldLabels))

    const features =
        uniqueFieldLabels.length >= 2
            ? uniqueFieldLabels.slice(0, 3)
            : [
                  sprintf(
                      __('Unlock all %s settings', 'webba-booking-lite'),
                      tabTitle
                  ),
                  __(
                      'Configure advanced options for your business',
                      'webba-booking-lite'
                  ),
                  __(
                      'Upgrade anytime to enable these features',
                      'webba-booking-lite'
                  ),
              ]

    return {
        icon: 'icon-pro-locked.svg',
        title: tabTitle,
        headline: sprintf(
            __('Unlock %s features', 'webba-booking-lite'),
            tabTitle
        ),
        description: getBannerDescription(lockedFields, tabTitle),
        features,
    }
}
