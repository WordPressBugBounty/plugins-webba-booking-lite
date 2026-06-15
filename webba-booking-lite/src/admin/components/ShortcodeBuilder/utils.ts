import {
    IShortcodePresetCategory,
    IShortcodePresetLocation,
    IShortcodePresetService,
    IShortcodePresetStaff,
    IShortcodePresetUnit,
    IShortcodeSelections,
    TShortcodeFilterIgnore,
    TShortcodeId,
} from './types'

const toId = (v: string | number) => String(v)

const ensureArray = <T>(value: T[] | null | undefined): T[] =>
    Array.isArray(value) ? value : []

const isUnitsMode = (sel: Pick<IShortcodeSelections, 'serviceType'>) =>
    sel.serviceType === 'daily'

const getCategoryBookableIds = (
    category: IShortcodePresetCategory,
    sel: Pick<IShortcodeSelections, 'serviceType'>
) =>
    isUnitsMode(sel)
        ? ensureArray(category.units)
        : ensureArray(category.services)

const getBookableItems = (
    services: IShortcodePresetService[],
    units: IShortcodePresetUnit[],
    sel: Pick<IShortcodeSelections, 'serviceType'>
) => (isUnitsMode(sel) ? units : services)

const bookableBelongsToLocation = (
    bookable: { locations?: string[] },
    locationId: string
) => {
    const locs = bookable.locations
    if (!locs || !Array.isArray(locs) || locs.length === 0) return false
    return locs.some((lid) => String(lid) === locationId)
}

const staffMatchesSelectedLocations = (
    staff: IShortcodePresetStaff,
    locationIds: string[]
): boolean => {
    const locs = staff.location
    if (!locs || !Array.isArray(locs) || locs.length === 0) return false
    return locationIds.some((lid) =>
        locs.some((l) => String(l) === String(lid))
    )
}

const intersectSets = (a: Set<string>, b: Set<string>): Set<string> => {
    const out = new Set<string>()
    for (const x of a) {
        if (b.has(x)) out.add(x)
    }
    return out
}

const getVisibleUnitIds = (
    units: IShortcodePresetUnit[],
    categories: IShortcodePresetCategory[],
    sel: IShortcodeSelections,
    ignore?: TShortcodeFilterIgnore
): Set<string> => {
    let ids = new Set(units.map((unit) => toId(unit.id)))

    if (sel.serviceId && ignore !== 'service') {
        ids = ids.has(sel.serviceId) ? new Set([sel.serviceId]) : new Set()
    }

    if (sel.categoryIds.length > 0 && ignore !== 'category') {
        const fromCats = new Set<string>()
        categories
            .filter((c) => sel.categoryIds.includes(toId(c.id)))
            .forEach((c) => {
                getCategoryBookableIds(c, sel).forEach((uid) =>
                    fromCats.add(String(uid))
                )
            })
        ids = intersectSets(ids, fromCats)
    }

    if (sel.locationIds.length > 0 && ignore !== 'location') {
        const fromLocations = new Set<string>()
        for (const unit of units) {
            if (
                sel.locationIds.some((lid) =>
                    bookableBelongsToLocation(unit, lid)
                )
            ) {
                fromLocations.add(toId(unit.id))
            }
        }
        ids = intersectSets(ids, fromLocations)
    }

    return ids
}

export const getVisibleServiceIds = (
    services: IShortcodePresetService[],
    categories: IShortcodePresetCategory[],
    staffMembers: IShortcodePresetStaff[],
    sel: IShortcodeSelections,
    ignore?: TShortcodeFilterIgnore,
    units: IShortcodePresetUnit[] = []
): Set<string> => {
    if (isUnitsMode(sel)) {
        return getVisibleUnitIds(units, categories, sel, ignore)
    }

    let ids = new Set(services.map((s) => toId(s.id)))

    if (sel.serviceId && ignore !== 'service') {
        ids = ids.has(sel.serviceId) ? new Set([sel.serviceId]) : new Set()
    }

    if (sel.categoryIds.length > 0 && ignore !== 'category') {
        const fromCats = new Set<string>()
        categories
            .filter((c) => sel.categoryIds.includes(toId(c.id)))
            .forEach((c) => {
                getCategoryBookableIds(c, sel).forEach((sid) =>
                    fromCats.add(String(sid))
                )
            })
        ids = intersectSets(ids, fromCats)
    }

    if (sel.locationIds.length > 0 && ignore !== 'location') {
        const fromServiceLocations = new Set<string>()
        for (const s of services) {
            if (
                sel.locationIds.some((lid) =>
                    bookableBelongsToLocation(s, lid)
                )
            ) {
                fromServiceLocations.add(toId(s.id))
            }
        }
        ids = intersectSets(ids, fromServiceLocations)
    }

    if (sel.staffIds.length > 0 && ignore !== 'staff') {
        const fromStaff = new Set<string>()
        staffMembers
            .filter((st) => sel.staffIds.includes(toId(st.id)))
            .forEach((st) => {
                ;(st.services || []).forEach((sid) => fromStaff.add(String(sid)))
            })
        ids = intersectSets(ids, fromStaff)
    }

    return ids
}

export const getUnionLocationIdsForBookables = (
    bookables: Array<{ id: TShortcodeId; locations?: string[] }>,
    bookableIds: Set<string>
): Set<string> => {
    const out = new Set<string>()
    for (const bookable of bookables) {
        if (!bookableIds.has(toId(bookable.id))) continue
        const locs = bookable.locations
        if (!locs?.length) continue
        locs.forEach((lid) => out.add(String(lid)))
    }
    return out
}

export const getAllowedLocationIdsForPicker = (
    presetLocations: IShortcodePresetLocation[],
    services: IShortcodePresetService[],
    visibleBookableIds: Set<string>,
    sel: Pick<IShortcodeSelections, 'serviceType' | 'serviceId' | 'categoryIds' | 'staffIds'>,
    staffMembers: IShortcodePresetStaff[],
    units: IShortcodePresetUnit[] = []
): Set<string> => {
    const allPresetIds = new Set(presetLocations.map((l) => toId(l.id)))

    const noNarrowing =
        !sel.serviceId &&
        sel.categoryIds.length === 0 &&
        (!isUnitsMode(sel) ? sel.staffIds.length === 0 : true)

    if (noNarrowing) {
        return allPresetIds
    }

    const bookables = getBookableItems(services, units, sel)
    const fromBookables = getUnionLocationIdsForBookables(
        bookables,
        visibleBookableIds
    )

    if (!isUnitsMode(sel) && sel.staffIds.length > 0) {
        const selectedStaff = staffMembers.filter((st) =>
            sel.staffIds.includes(toId(st.id))
        )
        let staffLocationIntersect = allPresetIds
        for (const st of selectedStaff) {
            const locs = st.location
            const forStaff =
                !locs || locs.length === 0
                    ? allPresetIds
                    : new Set(locs.map((l) => String(l)))
            staffLocationIntersect = intersectSets(
                staffLocationIntersect,
                forStaff
            )
        }

        const bookableLocationsOrPreset =
            fromBookables.size > 0 ? fromBookables : allPresetIds

        return intersectSets(bookableLocationsOrPreset, staffLocationIntersect)
    }

    if (fromBookables.size === 0) {
        return allPresetIds
    }
    return fromBookables
}

export const staffMatchesShortcodeFilters = (
    staff: IShortcodePresetStaff,
    visibleServiceIds: Set<string>,
    locationIds: string[],
    sel: Pick<IShortcodeSelections, 'serviceId' | 'categoryIds'>
): boolean => {
    const locationOnlyNarrowing =
        locationIds.length > 0 && !sel.serviceId && sel.categoryIds.length === 0

    if (locationOnlyNarrowing) {
        return staffMatchesSelectedLocations(staff, locationIds)
    }

    const serves = (staff.services || []).some((sid) =>
        visibleServiceIds.has(String(sid))
    )
    if (!serves) return false
    if (locationIds.length === 0) return true
    return staffMatchesSelectedLocations(staff, locationIds)
}

const selectionTuplesEqual = (a: IShortcodeSelections, b: IShortcodeSelections) =>
    a.serviceType === b.serviceType &&
    a.serviceId === b.serviceId &&
    a.categoryIds.length === b.categoryIds.length &&
    a.locationIds.length === b.locationIds.length &&
    a.staffIds.length === b.staffIds.length &&
    a.categoryIds.every((id) => b.categoryIds.includes(id)) &&
    a.locationIds.every((id) => b.locationIds.includes(id)) &&
    a.staffIds.every((id) => b.staffIds.includes(id))

export const pruneSelections = (
    services: IShortcodePresetService[],
    categories: IShortcodePresetCategory[],
    presetLocations: IShortcodePresetLocation[],
    staffMembers: IShortcodePresetStaff[],
    sel: IShortcodeSelections,
    units: IShortcodePresetUnit[] = []
): IShortcodeSelections => {
    let current: IShortcodeSelections = {
        ...sel,
        staffIds: isUnitsMode(sel) ? [] : [...sel.staffIds],
    }

    for (let i = 0; i < 6; i++) {
        let { serviceType, serviceId, categoryIds, locationIds, staffIds } = current

        const visibleAll = getVisibleServiceIds(
            services,
            categories,
            staffMembers,
            { serviceType, serviceId, categoryIds, locationIds, staffIds },
            undefined,
            units
        )
        if (serviceId && !visibleAll.has(serviceId)) {
            serviceId = null
        }

        const visNoCat = getVisibleServiceIds(
            services,
            categories,
            staffMembers,
            { serviceType, serviceId, categoryIds, locationIds, staffIds },
            'category',
            units
        )
        categoryIds = categoryIds.filter((cid) =>
            categories.some(
                (c) =>
                    toId(c.id) === cid &&
                    getCategoryBookableIds(c, { serviceType }).some((bookableId) =>
                        visNoCat.has(String(bookableId))
                    )
            )
        )

        const visNoLoc = getVisibleServiceIds(
            services,
            categories,
            staffMembers,
            { serviceType, serviceId, categoryIds, locationIds, staffIds },
            'location',
            units
        )
        const allowedLocIds = getAllowedLocationIdsForPicker(
            presetLocations,
            services,
            visNoLoc,
            { serviceType, serviceId, categoryIds, staffIds },
            staffMembers,
            units
        )
        locationIds = locationIds.filter((lid) => allowedLocIds.has(lid))

        if (!isUnitsMode({ serviceType })) {
            const visNoStaff = getVisibleServiceIds(
                services,
                categories,
                staffMembers,
                { serviceType, serviceId, categoryIds, locationIds, staffIds },
                'staff',
                units
            )
            staffIds = staffIds.filter((stid) => {
                const st = staffMembers.find((s) => toId(s.id) === stid)
                if (!st) return false
                return staffMatchesShortcodeFilters(
                    st,
                    visNoStaff,
                    locationIds,
                    { serviceId, categoryIds }
                )
            })
        } else {
            staffIds = []
        }

        const next = {
            serviceType,
            serviceId,
            categoryIds,
            locationIds,
            staffIds,
        }
        if (selectionTuplesEqual(next, current)) {
            return next
        }
        current = next
    }

    return current
}
