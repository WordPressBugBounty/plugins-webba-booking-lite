import {
    IShortcodePresetCategory,
    IShortcodePresetLocation,
    IShortcodePresetService,
    IShortcodePresetStaff,
    IShortcodeSelections,
    TShortcodeFilterIgnore,
} from './types'

const toId = (v: string | number) => String(v)

const serviceBelongsToLocation = (
    service: { locations?: string[] },
    locationId: string
) => {
    const locs = service.locations
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

export const getVisibleServiceIds = (
    services: IShortcodePresetService[],
    categories: IShortcodePresetCategory[],
    staffMembers: IShortcodePresetStaff[],
    sel: IShortcodeSelections,
    ignore?: TShortcodeFilterIgnore
): Set<string> => {
    let ids = new Set(services.map((s) => toId(s.id)))

    if (sel.serviceId && ignore !== 'service') {
        ids = ids.has(sel.serviceId) ? new Set([sel.serviceId]) : new Set()
    }

    if (sel.categoryIds.length > 0 && ignore !== 'category') {
        const fromCats = new Set<string>()
        categories
            .filter((c) => sel.categoryIds.includes(toId(c.id)))
            .forEach((c) => {
                ;(c.services || []).forEach((sid) => fromCats.add(String(sid)))
            })
        ids = intersectSets(ids, fromCats)
    }

    if (sel.locationIds.length > 0 && ignore !== 'location') {
        const fromServiceLocations = new Set<string>()
        for (const s of services) {
            if (
                sel.locationIds.some((lid) => serviceBelongsToLocation(s, lid))
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

export const getUnionLocationIdsForServices = (
    services: IShortcodePresetService[],
    serviceIds: Set<string>
): Set<string> => {
    const out = new Set<string>()
    for (const s of services) {
        if (!serviceIds.has(toId(s.id))) continue
        const locs = s.locations
        if (!locs?.length) continue
        locs.forEach((lid) => out.add(String(lid)))
    }
    return out
}

export const getAllowedLocationIdsForPicker = (
    presetLocations: IShortcodePresetLocation[],
    services: IShortcodePresetService[],
    visibleServiceIds: Set<string>,
    sel: Pick<IShortcodeSelections, 'serviceId' | 'categoryIds' | 'staffIds'>,
    staffMembers: IShortcodePresetStaff[]
): Set<string> => {
    const allPresetIds = new Set(presetLocations.map((l) => toId(l.id)))

    const noNarrowing =
        !sel.serviceId &&
        sel.categoryIds.length === 0 &&
        sel.staffIds.length === 0

    if (noNarrowing) {
        return allPresetIds
    }

    const fromServices = getUnionLocationIdsForServices(
        services,
        visibleServiceIds
    )

    if (sel.staffIds.length > 0) {
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

        const serviceLocationsOrPreset =
            fromServices.size > 0 ? fromServices : allPresetIds

        return intersectSets(serviceLocationsOrPreset, staffLocationIntersect)
    }

    if (fromServices.size === 0) {
        return allPresetIds
    }
    return fromServices
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
    sel: IShortcodeSelections
): IShortcodeSelections => {
    let current = { ...sel }

    for (let i = 0; i < 6; i++) {
        let { serviceId, categoryIds, locationIds, staffIds } = current

        const visibleAll = getVisibleServiceIds(
            services,
            categories,
            staffMembers,
            { serviceId, categoryIds, locationIds, staffIds }
        )
        if (serviceId && !visibleAll.has(serviceId)) {
            serviceId = null
        }

        const visNoCat = getVisibleServiceIds(
            services,
            categories,
            staffMembers,
            { serviceId, categoryIds, locationIds, staffIds },
            'category'
        )
        categoryIds = categoryIds.filter((cid) =>
            categories.some(
                (c) =>
                    toId(c.id) === cid &&
                    (c.services || []).some((sid) => visNoCat.has(String(sid)))
            )
        )

        const visNoLoc = getVisibleServiceIds(
            services,
            categories,
            staffMembers,
            { serviceId, categoryIds, locationIds, staffIds },
            'location'
        )
        const allowedLocIds = getAllowedLocationIdsForPicker(
            presetLocations,
            services,
            visNoLoc,
            { serviceId, categoryIds, staffIds },
            staffMembers
        )
        locationIds = locationIds.filter((lid) => allowedLocIds.has(lid))

        const visNoStaff = getVisibleServiceIds(
            services,
            categories,
            staffMembers,
            { serviceId, categoryIds, locationIds, staffIds },
            'staff'
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

        const next = { serviceId, categoryIds, locationIds, staffIds }
        if (selectionTuplesEqual(next, current)) {
            return next
        }
        current = next
    }

    return current
}
