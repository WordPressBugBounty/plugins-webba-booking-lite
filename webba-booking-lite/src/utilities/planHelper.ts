import { __ } from '@wordpress/i18n'

export const processUpgradeMessage = (
    requiredPlans: string[],
    planMap: Record<string, boolean>,
    placeholder: string
) => {
    const planNames = {
        free: 'Free',
        old_free: 'Free',
        start: 'Start',
        standard: 'Plus',
        pro: 'Pro',
        premium: 'Pro',
    }
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
