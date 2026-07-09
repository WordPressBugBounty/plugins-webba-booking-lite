import { ResolvedFormField } from '../components/Form/types'
import { isFieldLockedForUser } from '../../utilities/planHelper'

export interface LockedFormTabInfo {
    isFullyLocked: boolean
    requiredPlans: string[]
    lockedPlanFields: ResolvedFormField[]
}

const getFieldDependencyNames = (field: ResolvedFormField): string[] => {
    const names = new Set<string>()

    field.dependency?.forEach((condition) => {
        if (condition[0]) {
            names.add(String(condition[0]))
        }
    })

    field.hide?.forEach((condition) => {
        if (condition[0]) {
            names.add(String(condition[0]))
        }
    })

    return Array.from(names)
}

const isFieldHiddenByPlan = (
    field: ResolvedFormField,
    planMap: Record<string, boolean> | undefined
): boolean => {
    return isFieldLockedForUser(
        field.required_plan,
        planMap,
        field.available_in_old_free
    )
}

export const getLockedFormTabInfo = (
    fields: ResolvedFormField[],
    planMap: Record<string, boolean> | undefined,
    tabRequiredPlan?: string
): LockedFormTabInfo => {
    const emptyResult: LockedFormTabInfo = {
        isFullyLocked: false,
        requiredPlans: [],
        lockedPlanFields: [],
    }

    if (!planMap || fields.length === 0) {
        return emptyResult
    }

    if (tabRequiredPlan && isFieldLockedForUser(tabRequiredPlan, planMap)) {
        return {
            isFullyLocked: true,
            requiredPlans: [tabRequiredPlan],
            lockedPlanFields: fields.filter((field) =>
                isFieldHiddenByPlan(field, planMap)
            ),
        }
    }

    const lockedPlanFields = fields.filter((field) =>
        isFieldHiddenByPlan(field, planMap)
    )
    const hiddenByPlanNames = new Set(
        lockedPlanFields.map((field) => field.name)
    )
    const requiredPlans = new Set<string>()

    lockedPlanFields.forEach((field) => {
        if (field.required_plan) {
            requiredPlans.add(field.required_plan)
        }
    })

    const hasUnlockedPlanField = fields.some(
        (field) =>
            field.required_plan &&
            !isFieldHiddenByPlan(field, planMap)
    )

    if (hasUnlockedPlanField || lockedPlanFields.length === 0) {
        return emptyResult
    }

    const hasVisibleFieldWithoutPlanGate = fields.some((field) => {
        if (isFieldHiddenByPlan(field, planMap)) {
            return false
        }

        if (field.required_plan) {
            return true
        }

        const dependencyNames = getFieldDependencyNames(field)

        if (dependencyNames.length === 0) {
            return true
        }

        return !dependencyNames.every((name) => hiddenByPlanNames.has(name))
    })

    return {
        isFullyLocked: !hasVisibleFieldWithoutPlanGate,
        requiredPlans: Array.from(requiredPlans),
        lockedPlanFields,
    }
}
