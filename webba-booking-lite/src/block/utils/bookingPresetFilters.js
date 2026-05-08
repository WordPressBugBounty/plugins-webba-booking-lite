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

const serviceBelongsToLocation = (service, locationId) => {
    const locations = ensureArray(service.locations)
    return locations.some((lid) => toId(lid) === toId(locationId))
}

const staffMatchesSelectedLocations = (staff, locationIds) => {
    const locations = ensureArray(staff.location)
    return locationIds.some((locationId) =>
        locations.some((staffLocation) => toId(staffLocation) === toId(locationId))
    )
}

export const getVisibleServiceIds = (preset, selection, ignore) => {
    let ids = new Set(preset.services.map((service) => toId(service.id)))

    if (selection.serviceId && ignore !== 'service') {
        ids = ids.has(selection.serviceId) ? new Set([selection.serviceId]) : new Set()
    }

    if (selection.categoryIds.length > 0 && ignore !== 'category') {
        const fromCategories = new Set()
        preset.categories
            .filter((category) => selection.categoryIds.includes(toId(category.id)))
            .forEach((category) => {
                ensureArray(category.services).forEach((serviceId) =>
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
                    serviceBelongsToLocation(service, locationId)
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

const getUnionLocationIdsForServices = (services, serviceIds) => {
    const output = new Set()
    services.forEach((service) => {
        if (!serviceIds.has(toId(service.id))) {
            return
        }
        ensureArray(service.locations).forEach((locationId) =>
            output.add(toId(locationId))
        )
    })
    return output
}

const getAllowedLocationIdsForPicker = (preset, visibleServiceIds, selection) => {
    const allLocationIds = new Set(preset.locations.map((location) => toId(location.id)))
    const noNarrowing =
        !selection.serviceId &&
        selection.categoryIds.length === 0 &&
        selection.staffIds.length === 0

    if (noNarrowing) {
        return allLocationIds
    }

    const fromServices = getUnionLocationIdsForServices(
        preset.services,
        visibleServiceIds
    )

    if (selection.staffIds.length > 0) {
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

        const serviceLocationsOrPreset =
            fromServices.size > 0 ? fromServices : allLocationIds
        return intersectSets(serviceLocationsOrPreset, staffLocationIntersect)
    }

    if (fromServices.size === 0) {
        return allLocationIds
    }
    return fromServices
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
    let current = {
        serviceId: inputSelection.serviceId,
        categoryIds: [...inputSelection.categoryIds],
        locationIds: [...inputSelection.locationIds],
        staffIds: [...inputSelection.staffIds],
    }

    for (let i = 0; i < 6; i++) {
        const { serviceId, categoryIds, locationIds, staffIds } = current

        const visibleAll = getVisibleServiceIds(preset, {
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
            { serviceId: nextServiceId, categoryIds, locationIds, staffIds },
            'category'
        )
        const nextCategoryIds = categoryIds.filter((categoryId) =>
            preset.categories.some(
                (category) =>
                    toId(category.id) === categoryId &&
                    ensureArray(category.services).some((sid) =>
                        visibleNoCategory.has(toId(sid))
                    )
            )
        )

        const visibleNoLocation = getVisibleServiceIds(
            preset,
            {
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
                serviceId: nextServiceId,
                categoryIds: nextCategoryIds,
                staffIds,
            }
        )
        const nextLocationIds = locationIds.filter((locationId) =>
            allowedLocationIds.has(locationId)
        )

        const visibleNoStaff = getVisibleServiceIds(
            preset,
            {
                serviceId: nextServiceId,
                categoryIds: nextCategoryIds,
                locationIds: nextLocationIds,
                staffIds,
            },
            'staff'
        )
        const nextStaffIds = staffIds.filter((staffId) => {
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

        const next = {
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
            locations: ensureArray(service.locations).map(toId),
        })),
        categories: ensureArray(presetData.categories).map((category) => ({
            id: category.id,
            services: ensureArray(category.services).map(toId),
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
    serviceId:
        attributes.service && String(attributes.service) !== '0'
            ? toId(attributes.service)
            : null,
    categoryIds: uniqueIds(attributes.category || []),
    locationIds: uniqueIds(attributes.location || []),
    staffIds: uniqueIds(attributes.staff || []),
})

export const selectionToBlockAttributes = (selection) => ({
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
    const allowedLocationIds = getAllowedLocationIdsForPicker(
        preset,
        visibleForLocation,
        {
            serviceId: pruned.serviceId,
            categoryIds: pruned.categoryIds,
            staffIds: pruned.staffIds,
        }
    )

    const allowedCategoryIds = []
    preset.categories.forEach((category) => {
        const hasVisibleService = ensureArray(category.services).some((serviceId) =>
            visibleForCategory.has(toId(serviceId))
        )
        if (hasVisibleService) {
            allowedCategoryIds.push(toId(category.id))
        }
    })

    const allowedStaffIds = []
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

    return {
        selection: pruned,
        allowedServiceIds: Array.from(visibleForService),
        allowedCategoryIds,
        allowedLocationIds: Array.from(allowedLocationIds),
        allowedStaffIds,
    }
}
