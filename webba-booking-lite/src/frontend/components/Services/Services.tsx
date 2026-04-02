import { ServiceItem } from './ServiceItem'
import { IServiceProps } from './types'
import './Services.scss'
import { useMemo } from 'react'
import { __ } from '@wordpress/i18n'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'
import { useWording } from '../../hooks/useWording'

const serviceBelongsToLocation = (
    service: { locations?: string[] },
    locationId: string | null
) => {
    if (!locationId) return true
    const locs = service.locations
    if (!locs || !Array.isArray(locs) || locs.length === 0) return false
    return locs.some((lid: string) => String(lid) === locationId)
}

export const Services = () => {
    const wording = useWording()
    const {
        services,
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
                serviceBelongsToLocation(s, locationId)
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

    if (!preset || !preset.services) {
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
            {servicesToView &&
                servicesToView.map((service: IServiceProps, index: number) => (
                    <div
                        key={index}
                        className="wbk_services_item_appear"
                        style={{ animationDelay: `${index * 80}ms` }}
                    >
                        <ServiceItem {...service} />
                    </div>
                ))}
            {!servicesToView ||
                (servicesToView.length === 0 && (
                    <p>
                        {wording.no_services_found ||
                            __('No services found!', 'webba-booking-lite')}
                    </p>
                ))}
        </div>
    )
}
