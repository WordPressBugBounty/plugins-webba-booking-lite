import { ServiceItem } from './ServiceItem'
import { IServiceProps, IUnitProps } from './types'
import './Services.scss'
import { useMemo } from 'react'
import { __ } from '@wordpress/i18n'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'
import { useWording } from '../../hooks/useWording'
import { UnitItem } from './UnitItem'

const entityBelongsToLocation = (
    entity: { locations?: string[] },
    locationId: string | null
) => {
    if (!locationId) return true
    const locs = entity.locations
    if (!locs || !Array.isArray(locs) || locs.length === 0) return false
    return locs.some((lid: string) => String(lid) === locationId)
}

interface IServicesProps {
    emptyStateText?: string
}

export const Services = ({ emptyStateText }: IServicesProps) => {
    const wording = useWording()
    const {
        bookingMode,
        services,
        units,
        categories,
        attrCategory,
        preset,
        extractedAttrCats,
        formData,
    } = useBookingContext()
    const selectedCategory = useMemo(
        () =>
            categories.find(
                ({ selected, id }) => selected || id === Number(attrCategory)
            ),
        [categories]
    )

    const locationId =
        formData?.location != null ? String(formData.location) : null

    const servicesToView = useMemo(() => {
        let list = services

        if (locationId) {
            list = (list || []).filter((s) =>
                entityBelongsToLocation(s, locationId)
            )
        }

        if (extractedAttrCats.length === 0 && !selectedCategory) return list

        if (selectedCategory) {
            return (list || []).filter(({ id }) =>
                selectedCategory.services.includes(String(id))
            )
        }

        if (extractedAttrCats.length > 0 && !selectedCategory) {
            return (list || []).filter(({ id }) => {
                const definedCategoriesServices = categories
                    .filter((c) => extractedAttrCats.includes(Number(c.id)))
                    .map(({ services: catServices }) => catServices)
                return definedCategoriesServices.flat().includes(String(id))
            })
        }

        return list
    }, [selectedCategory, services, locationId, categories, extractedAttrCats])

    const unitsToView = useMemo(() => {
        if (!units) {
            return []
        }
        if (!locationId) {
            return units
        }
        return units.filter((unit: IUnitProps) =>
            entityBelongsToLocation(unit, locationId)
        )
    }, [units, locationId])

    if (
        !preset ||
        (bookingMode === 'services' && !preset.services) ||
        (bookingMode === 'units' && !preset.units)
    ) {
        return (
            <div className="wbk_services_wrapper">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="wbk_services_skeleton" />
                ))}
            </div>
        )
    }

    return (
        <div className="wbk_services_wrapper">
            {(bookingMode === 'services' ? servicesToView : unitsToView).map(
                (item: IServiceProps | IUnitProps, index: number) => (
                    <div
                        key={`${bookingMode}-${item.id}-${index}`}
                        className="wbk_services_item_appear"
                        style={{ animationDelay: `${index * 80}ms` }}
                    >
                        {bookingMode === 'services' ? (
                            <ServiceItem {...(item as IServiceProps)} />
                        ) : (
                            <UnitItem {...(item as IUnitProps)} />
                        )}
                    </div>
                )
            )}
            {(bookingMode === 'services'
                ? servicesToView.length === 0
                : unitsToView.length === 0) && (
                    <p>
                        {emptyStateText ||
                            wording.no_services_found ||
                            __('No services found!', 'webba-booking-lite')}
                    </p>
                )}
        </div>
    )
}
