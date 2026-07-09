import { __ } from '@wordpress/i18n'

export const PLAN_DISPLAY_NAMES: Record<string, string> = {
    free: 'Free',
    old_free: 'Free',
    start: 'Start',
    standard: 'Plus',
    pro: 'Pro',
    premium: 'Pro',
    'proextended': 'Pro Extended',
}

const getPlanBadgeLabel = (plan: string): string | null => {
    if (plan === 'proextended') {
        return PLAN_DISPLAY_NAMES.pro
    }

    return PLAN_DISPLAY_NAMES[plan] ?? null
}

export const getUniquePlanBadges = (
    requiredPlans: string[]
): { plan: string; label: string }[] => {
    const planOrder = Object.keys(PLAN_DISPLAY_NAMES)
    const sortedPlans = planOrder.filter((plan) =>
        requiredPlans.includes(plan)
    )

    if (sortedPlans.length === 0) {
        return []
    }

    const minimumRequiredPlan = sortedPlans[0]
    const label = getPlanBadgeLabel(minimumRequiredPlan)

    if (!label) {
        return []
    }

    return [{ plan: 'minimum', label }]
}

export const isFieldLockedForUser = (
    requiredPlan: string | undefined,
    planMap: Record<string, boolean> | undefined,
    availableInOldFree?: boolean
): boolean => {
    if (!requiredPlan || !planMap) {
        return false
    }

    if (availableInOldFree && planMap.old_free === true) {
        return false
    }

    if (!(requiredPlan in planMap)) {
        return false
    }

    return planMap[requiredPlan] !== true
}

export const processUpgradeMessage = (
    requiredPlans: string[],
    planMap: Record<string, boolean>,
    placeholder: string
) => {
    const planNames = PLAN_DISPLAY_NAMES
    let upgradeMessage = ''

    if (!planMap || !requiredPlans) return upgradeMessage

    const planOrder = Object.keys(planNames)
    const filteredRequiredPlans = planOrder.filter(plan => requiredPlans.includes(plan))

    filteredRequiredPlans.sort((a, b) => {
        const indexA = planOrder.indexOf(a)
        const indexB = planOrder.indexOf(b)
        return indexA - indexB
    })

    if (Array.isArray(filteredRequiredPlans) && filteredRequiredPlans.length > 0) {
        const minimumRequiredPlan = filteredRequiredPlans[0]

        upgradeMessage = placeholder.replace(
            '#plan',
            planNames[minimumRequiredPlan as keyof typeof planNames].toUpperCase()
        )

    }

    return upgradeMessage
}
