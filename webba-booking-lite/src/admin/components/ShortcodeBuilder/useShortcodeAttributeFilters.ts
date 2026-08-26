import { useEffect, useMemo, useState } from 'react'
import { __ } from '@wordpress/i18n'
import { usePreset } from '../../hooks/usePreset'
import {
    IShortcodeAttributeFilters,
    IShortcodePresetCategory,
    IShortcodePresetLocation,
    IShortcodePresetService,
    IShortcodePresetStaff,
    IShortcodePresetUnit,
    TShortcodeOption,
    TShortcodeServiceType,
} from './types'
import {
    getAllowedLocationIdsForPicker,
    getVisibleServiceIds,
    pruneSelections,
    selectionsToBookingFormDataAttrs,
    staffMatchesShortcodeFilters,
} from './utils'

const sameIdSet = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false
    const sa = new Set(a)
    if (sa.size !== a.length) return false
    return b.every((id) => sa.has(id))
}

const serviceTypeOptions: TShortcodeOption[] = [
    {
        value: 'hourly',
        label: __('Hourly services', 'webba-booking-lite'),
    },
    {
        value: 'daily',
        label: __('Daily services', 'webba-booking-lite'),
    },
]

export const useShortcodeAttributeFilters = (): IShortcodeAttributeFilters => {
    const preset = usePreset()
    const services = (preset?.services || []) as IShortcodePresetService[]
    const units = (preset?.units || []) as IShortcodePresetUnit[]
    const categories = (preset?.categories || []) as IShortcodePresetCategory[]
    const locations = (preset?.locations || []) as IShortcodePresetLocation[]
    const staffMembers = (preset?.staff_members ||
        []) as IShortcodePresetStaff[]

    const [serviceType, setServiceType] =
        useState<TShortcodeServiceType>('hourly')
    const [serviceId, setServiceId] = useState<string | null>(null)
    const [categoryIds, setCategoryIds] = useState<string[]>([])
    const [locationIds, setLocationIds] = useState<string[]>([])
    const [staffIds, setStaffIds] = useState<string[]>([])

    const isDailyServiceType = serviceType === 'daily'
    const isPresetLoading = !preset || Object.keys(preset).length === 0

    const selections = useMemo(
        () => ({
            serviceType,
            serviceId,
            categoryIds,
            locationIds,
            staffIds,
        }),
        [serviceType, serviceId, categoryIds, locationIds, staffIds]
    )

    useEffect(() => {
        const pruned = pruneSelections(
            services,
            categories,
            locations,
            staffMembers,
            selections,
            units
        )
        if (pruned.serviceId !== serviceId) setServiceId(pruned.serviceId)
        if (!sameIdSet(pruned.categoryIds, categoryIds)) {
            setCategoryIds(pruned.categoryIds)
        }
        if (!sameIdSet(pruned.locationIds, locationIds)) {
            setLocationIds(pruned.locationIds)
        }
        if (!sameIdSet(pruned.staffIds, staffIds)) {
            setStaffIds(pruned.staffIds)
        }
    }, [
        selections,
        services,
        categories,
        locations,
        staffMembers,
        units,
        serviceId,
        categoryIds,
        locationIds,
        staffIds,
    ])

    const visibleForServiceDropdown = useMemo(
        () =>
            getVisibleServiceIds(
                services,
                categories,
                staffMembers,
                selections,
                'service',
                units
            ),
        [services, categories, staffMembers, selections, units]
    )

    const visibleForCategoryDropdown = useMemo(
        () =>
            getVisibleServiceIds(
                services,
                categories,
                staffMembers,
                selections,
                'category',
                units
            ),
        [services, categories, staffMembers, selections, units]
    )

    const visibleForLocationDropdown = useMemo(
        () =>
            getVisibleServiceIds(
                services,
                categories,
                staffMembers,
                selections,
                'location',
                units
            ),
        [services, categories, staffMembers, selections, units]
    )

    const visibleForStaffDropdown = useMemo(
        () =>
            getVisibleServiceIds(
                services,
                categories,
                staffMembers,
                selections,
                'staff',
                units
            ),
        [services, categories, staffMembers, selections, units]
    )

    const allowedLocationIds = useMemo(
        () =>
            getAllowedLocationIdsForPicker(
                locations,
                services,
                visibleForLocationDropdown,
                selections,
                staffMembers,
                units
            ),
        [
            locations,
            services,
            visibleForLocationDropdown,
            selections,
            staffMembers,
            units,
        ]
    )

    const bookableItems = isDailyServiceType ? units : services

    const serviceOptions: TShortcodeOption[] = useMemo(
        () =>
            bookableItems
                .filter((item) =>
                    visibleForServiceDropdown.has(String(item.id))
                )
                .map((item) => ({
                    value: String(item.id),
                    label: item.label,
                })),
        [bookableItems, visibleForServiceDropdown]
    )

    const categoryOptions: TShortcodeOption[] = useMemo(
        () =>
            categories
                .filter((c) =>
                    (isDailyServiceType
                        ? c.units || []
                        : c.services || []
                    ).some((bookableId) =>
                        visibleForCategoryDropdown.has(String(bookableId))
                    )
                )
                .map((c) => ({
                    value: String(c.id),
                    label: `${c.name} (ID: ${c.id})`,
                })),
        [categories, visibleForCategoryDropdown, isDailyServiceType]
    )

    const locationOptions: TShortcodeOption[] = useMemo(
        () =>
            locations
                .filter((l) => allowedLocationIds.has(String(l.id)))
                .map((l) => ({
                    value: String(l.id),
                    label: l.label,
                })),
        [locations, allowedLocationIds]
    )

    const staffOptions: TShortcodeOption[] = useMemo(
        () =>
            staffMembers
                .filter((m) =>
                    staffMatchesShortcodeFilters(
                        m,
                        visibleForStaffDropdown,
                        locationIds,
                        { serviceId, categoryIds }
                    )
                )
                .map((m) => ({
                    value: String(m.id),
                    label: m.label,
                })),
        [
            staffMembers,
            visibleForStaffDropdown,
            locationIds,
            serviceId,
            categoryIds,
        ]
    )

    const handleServiceTypeChange = (nextType: TShortcodeServiceType) => {
        setServiceType(nextType)
        setServiceId(null)
        setStaffIds([])
    }

    const dataAttrs = useMemo(
        () => selectionsToBookingFormDataAttrs(selections),
        [selections]
    )

    return {
        serviceType,
        serviceId,
        categoryIds,
        locationIds,
        staffIds,
        isDailyServiceType,
        isPresetLoading,
        serviceTypeOptions,
        serviceOptions,
        categoryOptions,
        locationOptions,
        staffOptions,
        setServiceId,
        setCategoryIds,
        setLocationIds,
        setStaffIds,
        handleServiceTypeChange,
        dataAttrs,
    }
}
