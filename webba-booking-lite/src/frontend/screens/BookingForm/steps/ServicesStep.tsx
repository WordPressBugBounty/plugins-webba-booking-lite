import { Services } from '../../../components/Services/Services'
import { Categories } from '../../../components/Categories/Categories'
import { LocationDropdown } from '../../../components/LocationDropdown/LocationDropdown'
import { useBookingContext } from '../../../providers/BookingFormProvider/BookingFormProvider'
import { CustomScroll } from 'react-custom-scroll'
import './Steps.scss'
import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import { ReactComponent as InfoIcon } from '../../../../../public/images/icon-info-circle.svg'
import { useEffect, useMemo } from 'react'
import { ILocationOption } from '../../../components/LocationDropdown/types'
import { getServiceAssociatedLocations } from '../../../lib/locationFilter/getServiceAssociatedLocations'

export const ServicesStep = () => {
    const {
        categories,
        extractedAttrCats,
        extractedAttrLocations,
        extractedAttrStaff,
        preset,
        formData,
        attrService,
        onLocationSelect,
    } =
        useBookingContext()
    const wording = preset?.wording ?? {}
    const presetServices = preset?.services ?? []
    const locations = useMemo(
        () =>
            getServiceAssociatedLocations(
                (preset?.locations ?? []) as ILocationOption[],
                presetServices as Array<{ locations?: any[] }>
            ),
        [preset?.locations, presetServices]
    )
    const presetCategories = preset?.categories ?? []
    const presetStaffMembers = preset?.staff_members ?? []
    const shouldAllowLocationStep =
        Array.isArray(locations) &&
        locations.length > 0 &&
        (extractedAttrLocations.length > 1 || extractedAttrLocations.length === 0)

    const isLocationSelected = formData?.location != null && String(formData.location) !== ''

    const filteredLocationsForPredefinedFilters = useMemo(() => {
        const hasPredefinedCategory = extractedAttrCats.length > 0
        const hasPredefinedService =
            attrService !== undefined &&
            attrService !== null &&
            String(attrService) !== '' &&
            String(attrService) !== '0'

        let filtered = locations as ILocationOption[]

        if (hasPredefinedCategory && !hasPredefinedService) {
            const categoryServiceIds = new Set<string>()
            ;(
                presetCategories as Array<{
                    id: string | number
                    services?: Array<string | number>
                }>
            )
                .filter((category) =>
                    extractedAttrCats.includes(Number(category.id))
                )
                .forEach((category) => {
                    ;(category.services || []).forEach((serviceId) =>
                        categoryServiceIds.add(String(serviceId))
                    )
                })

            const locationIds = new Set<string>()
            ;(
                presetServices as Array<{
                    id: string | number
                    locations?: Array<string | number>
                }>
            )
                .filter((service) => categoryServiceIds.has(String(service.id)))
                .forEach((service) => {
                    ;(service.locations || []).forEach((locationId) =>
                        locationIds.add(String(locationId))
                    )
                })

            filtered = filtered.filter(
                (location) =>
                    locationIds.has(String(location.id)) ||
                    (location.value != null &&
                        locationIds.has(String(location.value)))
            )
        }

        if (extractedAttrStaff.length > 0) {
            const staffLocationIds = new Set<string>()
            ;(
                presetStaffMembers as Array<{
                    id: string | number
                    location?: Array<string | number>
                }>
            )
                .filter((staff) =>
                    extractedAttrStaff.includes(String(staff.id))
                )
                .forEach((staff) => {
                    ;(staff.location || []).forEach((locationId) =>
                        staffLocationIds.add(String(locationId))
                    )
                })

            filtered = filtered.filter(
                (location) =>
                    staffLocationIds.has(String(location.id)) ||
                    (location.value != null &&
                        staffLocationIds.has(String(location.value)))
            )
        }

        const hasAnyFilter =
            (hasPredefinedCategory && !hasPredefinedService) ||
            extractedAttrStaff.length > 0

        return hasAnyFilter ? filtered : null
    }, [
        extractedAttrCats,
        extractedAttrStaff,
        attrService,
        presetCategories,
        presetServices,
        presetStaffMembers,
        locations,
    ])

    const effectiveLocations = useMemo(
        () => filteredLocationsForPredefinedFilters ?? (locations as ILocationOption[]),
        [filteredLocationsForPredefinedFilters, locations]
    )

    const showLocationDropdown =
        shouldAllowLocationStep && effectiveLocations.length > 1

    const lockServicesUntilLocation =
        showLocationDropdown && !isLocationSelected

    useEffect(() => {
        if (!shouldAllowLocationStep) return
        if (effectiveLocations.length !== 1) return
        const single = effectiveLocations[0]
        const singleId =
            single?.id != null ? String(single.id) : String(single?.value ?? '')
        const currentId =
            formData?.location != null ? String(formData.location) : ''
        if (!singleId || currentId === singleId) return
        onLocationSelect(single.id ?? single.value)
    }, [
        shouldAllowLocationStep,
        filteredLocationsForPredefinedFilters,
        locations,
        effectiveLocations,
        formData?.location,
        onLocationSelect,
    ])

    return (
        <>
            {showLocationDropdown && (
                <LocationDropdown
                    locations={filteredLocationsForPredefinedFilters}
                />
            )}
            {lockServicesUntilLocation && (
                <div className="wbk_step__location_required_notice">
                    <span className="wbk_step__location_required_notice_icon">
                        <InfoIcon aria-hidden="true" />
                    </span>
                    <span>
                        {wording.please_select_location ?? __(
                            'Please select a location first to choose services.',
                            'webba-booking-lite'
                        )}
                    </span>
                </div>
            )}
            <div
                className={classNames('wbk_step__services_area', {
                    'wbk_step__services_area--locked': lockServicesUntilLocation,
                })}
            >
                {categories &&
                    categories?.length > 0 &&
                    (extractedAttrCats.length > 1 ||
                        extractedAttrCats.length === 0) && <Categories />}
                <CustomScroll
                    flex="1"
                    className={'wbk_step__scroll-wrapper'}
                    allowOuterScroll={true}
                >
                    <Services />
                </CustomScroll>
            </div>
        </>
    )
}
