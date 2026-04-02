import { LocationLike, ServiceLike } from './types'

const getLocationKey = (location: LocationLike): string | null => {
    const id = location?.id ?? location?.value
    if (id === undefined || id === null) return null
    const key = String(id)
    return key !== '' ? key : null
}

export const getServiceAssociatedLocations = <TLocation extends LocationLike>(
    locations: TLocation[],
    services: ServiceLike[]
): TLocation[] => {
    if (!Array.isArray(locations) || locations.length === 0) return []
    if (!Array.isArray(services) || services.length === 0) return []

    const associatedLocationIds = new Set<string>()
    services.forEach((service) => {
        ;(service?.locations || []).forEach((locationId) => {
            if (locationId === undefined || locationId === null) return
            const key = String(locationId)
            if (key !== '') associatedLocationIds.add(key)
        })
    })

    if (associatedLocationIds.size === 0) return []

    return locations.filter((loc) => {
        const idKey =
            loc?.id != null && String(loc.id) !== '' ? String(loc.id) : null
        const valueKey =
            loc?.value != null && String(loc.value) !== ''
                ? String(loc.value)
                : null
        return (
            (idKey != null && associatedLocationIds.has(idKey)) ||
            (valueKey != null && associatedLocationIds.has(valueKey)) ||
            (getLocationKey(loc) != null &&
                associatedLocationIds.has(getLocationKey(loc) as string))
        )
    })
}

