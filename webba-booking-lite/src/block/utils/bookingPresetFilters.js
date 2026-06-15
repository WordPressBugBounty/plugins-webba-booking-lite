const toId = (value) => String(value)

const ensureArray = (value) => {
    if (Array.isArray(value)) {
        return value
    }
    if (value === null || typeof value === 'undefined' || value === '') {
        return []
    }
    return [value]
}

const uniqueIds = (values) => {
    const ids = []
    ensureArray(values).forEach((item) => {
        const id = toId(item)
        if (id === '' || id === '0') {
            return
        }
        if (!ids.includes(id)) {
            ids.push(id)
        }
    })
    return ids
}

const intersectSets = (a, b) => {
    const out = new Set()
    a.forEach((x) => {
        if (b.has(x)) {
            out.add(x)
        }
    })
    return out
}

const isUnitsMode = (selection) => selection.serviceType === 'daily'

const getCategoryBookableIds = (category, selection) =>
    isUnitsMode(selection)
        ? ensureArray(category.units)
        : ensureArray(category.services)

const getBookableItems = (preset, selection) =>
    isUnitsMode(selection) ? preset.units : preset.services

const bookableBelongsToLocation = (bookable, locationId) => {
    const locations = ensureArray(bookable.locations)
    return locations.some((lid) => toId(lid) === toId(locationId))
}

const staffMatchesSelectedLocations = (staff, locationIds) => {
    const locations = ensureArray(staff.location)
    return locationIds.some((locationId) =>
        locations.some((staffLocation) => toId(staffLocation) === toId(locationId))
    )
}

const getVisibleUnitIds = (preset, selection, ignore) => {
    let ids = new Set(preset.units.map((unit) => toId(unit.id)))

    if (selection.serviceId && ignore !== 'service') {
        ids = ids.has(selection.serviceId) ? new Set([selection.serviceId]) : new Set()
    }

    if (selection.categoryIds.length > 0 && ignore !== 'category') {
        const fromCategories = new Set()
        preset.categories
            .filter((category) => selection.categoryIds.includes(toId(category.id)))
            .forEach((category) => {
                getCategoryBookableIds(category, selection).forEach((unitId) =>
                    fromCategories.add(toId(unitId))
                )
            })
        ids = intersectSets(ids, fromCategories)
    }

    if (selection.locationIds.length > 0 && ignore !== 'location') {
        const fromLocations = new Set()
        preset.units.forEach((unit) => {
            if (
                selection.locationIds.some((locationId) =>
                    bookableBelongsToLocation(unit, locationId)
                )
            ) {
                fromLocations.add(toId(unit.id))
            }
        })
        ids = intersectSets(ids, fromLocations)
    }

    return ids
}

export const getVisibleServiceIds = (preset, selection, ignore) => {
    if (isUnitsMode(selection)) {
        return getVisibleUnitIds(preset, selection, ignore)
    }

    let ids = new Set(preset.services.map((service) => toId(service.id)))

    if (selection.serviceId && ignore !== 'service') {
        ids = ids.has(selection.serviceId) ? new Set([selection.serviceId]) : new Set()
    }

    if (selection.categoryIds.length > 0 && ignore !== 'category') {
        const fromCategories = new Set()
        preset.categories
            .filter((category) => selection.categoryIds.includes(toId(category.id)))
            .forEach((category) => {
                getCategoryBookableIds(category, selection).forEach((serviceId) =>
                    fromCategories.add(toId(serviceId))
                )
            })
        ids = intersectSets(ids, fromCategories)
    }

    if (selection.locationIds.length > 0 && ignore !== 'location') {
        const fromLocations = new Set()
        preset.services.forEach((service) => {
            if (
                selection.locationIds.some((locationId) =>
                    bookableBelongsToLocation(service, locationId)
                )
            ) {
                fromLocations.add(toId(service.id))
            }
        })
        ids = intersectSets(ids, fromLocations)
    }

    if (selection.staffIds.length > 0 && ignore !== 'staff') {
        const fromStaff = new Set()
        preset.staffMembers
            .filter((staffMember) => selection.staffIds.includes(toId(staffMember.id)))
            .forEach((staffMember) => {
                ensureArray(staffMember.services).forEach((serviceId) =>
                    fromStaff.add(toId(serviceId))
                )
            })
        ids = intersectSets(ids, fromStaff)
    }

    return ids
}

const getUnionLocationIdsForBookables = (bookables, bookableIds) => {
    const output = new Set()
    bookables.forEach((bookable) => {
        if (!bookableIds.has(toId(bookable.id))) {
            return
        }
        ensureArray(bookable.locations).forEach((locationId) =>
            output.add(toId(locationId))
        )
    })
    return output
}

const getAllowedLocationIdsForPicker = (preset, visibleBookableIds, selection) => {
    const allLocationIds = new Set(preset.locations.map((location) => toId(location.id)))
    const noNarrowing =
        !selection.serviceId &&
        selection.categoryIds.length === 0 &&
        (!isUnitsMode(selection) ? selection.staffIds.length === 0 : true)

    if (noNarrowing) {
        return allLocationIds
    }

    const bookables = getBookableItems(preset, selection)
    const fromBookables = getUnionLocationIdsForBookables(bookables, visibleBookableIds)

    if (!isUnitsMode(selection) && selection.staffIds.length > 0) {
        const selectedStaff = preset.staffMembers.filter((staffMember) =>
            selection.staffIds.includes(toId(staffMember.id))
        )
        let staffLocationIntersect = new Set(allLocationIds)
        selectedStaff.forEach((staffMember) => {
            const locations = ensureArray(staffMember.location)
            const forStaff =
                locations.length === 0
                    ? new Set(allLocationIds)
                    : new Set(locations.map((locationId) => toId(locationId)))
            staffLocationIntersect = intersectSets(staffLocationIntersect, forStaff)
        })

        const bookableLocationsOrPreset =
            fromBookables.size > 0 ? fromBookables : allLocationIds
        return intersectSets(bookableLocationsOrPreset, staffLocationIntersect)
    }

    if (fromBookables.size === 0) {
        return allLocationIds
    }
    return fromBookables
}

const staffMatchesFilters = (staffMember, visibleServiceIds, locationIds, selection) => {
    const locationOnlyNarrowing =
        locationIds.length > 0 && !selection.serviceId && selection.categoryIds.length === 0

    if (locationOnlyNarrowing) {
        return staffMatchesSelectedLocations(staffMember, locationIds)
    }

    const servesVisible = ensureArray(staffMember.services).some((serviceId) =>
        visibleServiceIds.has(toId(serviceId))
    )
    if (!servesVisible) {
        return false
    }
    if (locationIds.length === 0) {
        return true
    }
    return staffMatchesSelectedLocations(staffMember, locationIds)
}

const equalSelections = (a, b) => {
    if (a.serviceType !== b.serviceType) {
        return false
    }
    if (a.serviceId !== b.serviceId) {
        return false
    }
    const keys = ['categoryIds', 'locationIds', 'staffIds']
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        if (a[key].length !== b[key].length) {
            return false
        }
        for (let j = 0; j < a[key].length; j++) {
            if (!b[key].includes(a[key][j])) {
                return false
            }
        }
    }
    return true
}

export const pruneSelections = (preset, inputSelection) => {
    const serviceType = inputSelection.serviceType || 'hourly'
    let current = {
        serviceType,
        serviceId: inputSelection.serviceId,
        categoryIds: [...inputSelection.categoryIds],
        locationIds: [...inputSelection.locationIds],
        staffIds: isUnitsMode({ serviceType }) ? [] : [...inputSelection.staffIds],
    }

    for (let i = 0; i < 6; i++) {
        let { serviceId, categoryIds, locationIds, staffIds } = current

        const visibleAll = getVisibleServiceIds(preset, {
            serviceType,
            serviceId,
            categoryIds,
            locationIds,
            staffIds,
        })
        let nextServiceId = serviceId
        if (serviceId && !visibleAll.has(serviceId)) {
            nextServiceId = null
        }

        const visibleNoCategory = getVisibleServiceIds(
            preset,
            { serviceType, serviceId: nextServiceId, categoryIds, locationIds, staffIds },
            'category'
        )
        const nextCategoryIds = categoryIds.filter((categoryId) =>
            preset.categories.some(
                (category) =>
                    toId(category.id) === categoryId &&
                    getCategoryBookableIds(category, { serviceType }).some((bookableId) =>
                        visibleNoCategory.has(toId(bookableId))
                    )
            )
        )

        const visibleNoLocation = getVisibleServiceIds(
            preset,
            {
                serviceType,
                serviceId: nextServiceId,
                categoryIds: nextCategoryIds,
                locationIds,
                staffIds,
            },
            'location'
        )
        const allowedLocationIds = getAllowedLocationIdsForPicker(
            preset,
            visibleNoLocation,
            {
                serviceType,
                serviceId: nextServiceId,
                categoryIds: nextCategoryIds,
                staffIds,
            }
        )
        const nextLocationIds = locationIds.filter((locationId) =>
            allowedLocationIds.has(locationId)
        )

        let nextStaffIds = []
        if (!isUnitsMode({ serviceType })) {
            const visibleNoStaff = getVisibleServiceIds(
                preset,
                {
                    serviceType,
                    serviceId: nextServiceId,
                    categoryIds: nextCategoryIds,
                    locationIds: nextLocationIds,
                    staffIds,
                },
                'staff'
            )
            nextStaffIds = staffIds.filter((staffId) => {
                const staffMember = preset.staffMembers.find(
                    (staff) => toId(staff.id) === staffId
                )
                if (!staffMember) {
                    return false
                }
                return staffMatchesFilters(
                    staffMember,
                    visibleNoStaff,
                    nextLocationIds,
                    { serviceId: nextServiceId, categoryIds: nextCategoryIds }
                )
            })
        }

        const next = {
            serviceType,
            serviceId: nextServiceId,
            categoryIds: nextCategoryIds,
            locationIds: nextLocationIds,
            staffIds: nextStaffIds,
        }
        if (equalSelections(next, current)) {
            return next
        }
        current = next
    }

    return current
}

export const normalizePresetForFilters = (presetData) => {
    return {
        services: ensureArray(presetData.services).map((service) => ({
            id: service.id,
            label: service.label,
            locations: ensureArray(service.locations).map(toId),
        })),
        units: ensureArray(presetData.units).map((unit) => ({
            id: unit.id,
            label: unit.label,
            locations: ensureArray(unit.locations).map(toId),
        })),
        categories: ensureArray(presetData.categories).map((category) => ({
            id: category.id,
            services: ensureArray(category.services).map(toId),
            units: ensureArray(category.units).map(toId),
        })),
        locations: ensureArray(presetData.locations).map((location) => ({
            id: location.id,
        })),
        staffMembers: ensureArray(
            presetData.staff_members || presetData.staffMembers
        ).map((staffMember) => ({
            id: staffMember.id,
            services: ensureArray(staffMember.services).map(toId),
            location: ensureArray(
                staffMember.location || staffMember.locations
            ).map(toId),
        })),
    }
}

export const blockAttributesToSelection = (attributes) => ({
    serviceType:
        attributes.serviceType === 'daily' ? 'daily' : 'hourly',
    serviceId:
        attributes.service && String(attributes.service) !== '0'
            ? toId(attributes.service)
            : null,
    categoryIds: uniqueIds(attributes.category || []),
    locationIds: uniqueIds(attributes.location || []),
    staffIds: uniqueIds(attributes.staff || []),
})

export const selectionToBlockAttributes = (selection) => ({
    serviceType: selection.serviceType || 'hourly',
    service: selection.serviceId ? selection.serviceId : '',
    category: selection.categoryIds,
    location: selection.locationIds,
    staff: selection.staffIds,
})

export const getPickerAllowedSets = (preset, selection) => {
    const pruned = pruneSelections(preset, selection)
    const visibleForService = getVisibleServiceIds(preset, pruned, 'service')
    const visibleForCategory = getVisibleServiceIds(preset, pruned, 'category')
    const visibleForLocation = getVisibleServiceIds(preset, pruned, 'location')
    const visibleForStaff = getVisibleServiceIds(preset, pruned, 'staff')

    const allowedCategoryIds = []
    preset.categories.forEach((category) => {
        const hasVisibleBookable = getCategoryBookableIds(category, pruned).some(
            (bookableId) => visibleForCategory.has(toId(bookableId))
        )
        if (hasVisibleBookable) {
            allowedCategoryIds.push(toId(category.id))
        }
    })

    const allowedLocationIds = getAllowedLocationIdsForPicker(
        preset,
        visibleForLocation,
        {
            serviceType: pruned.serviceType,
            serviceId: pruned.serviceId,
            categoryIds: pruned.categoryIds,
            staffIds: pruned.staffIds,
        }
    )

    const allowedStaffIds = []
    if (!isUnitsMode(pruned)) {
        preset.staffMembers.forEach((staffMember) => {
            if (
                staffMatchesFilters(
                    staffMember,
                    visibleForStaff,
                    pruned.locationIds,
                    {
                        serviceId: pruned.serviceId,
                        categoryIds: pruned.categoryIds,
                    }
                )
            ) {
                allowedStaffIds.push(toId(staffMember.id))
            }
        })
    }

    return {
        selection: pruned,
        allowedServiceIds: Array.from(visibleForService),
        allowedCategoryIds,
        allowedLocationIds: Array.from(allowedLocationIds),
        allowedStaffIds,
    }
}
