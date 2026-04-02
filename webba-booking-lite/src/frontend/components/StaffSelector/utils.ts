import { IStaffOption } from './types'

export const staffMatchesServiceAndLocation = (
    staff: IStaffOption,
    serviceId: number,
    locationId: string | null
) => {
    if (!staff.services || !staff.services.includes(String(serviceId)))
        return false
    if (!locationId) return true
    if (
        !staff.locations ||
        !Array.isArray(staff.locations) ||
        staff.locations.length === 0
    )
        return false
    return staff.locations.some((loc) => String(loc) === locationId)
}

export const getStaffOptionsForService = (
    staffMembers: IStaffOption[] | undefined,
    serviceId: number,
    locationId: string | null,
    extractedAttrStaff: string[]
): IStaffOption[] => {
    if (!staffMembers || !Array.isArray(staffMembers)) return []
    let filtered = staffMembers.filter((s) =>
        staffMatchesServiceAndLocation(s, serviceId, locationId)
    )
    if (extractedAttrStaff.length > 0) {
        filtered = filtered.filter((s) => extractedAttrStaff.includes(s.id))
    }
    return filtered
}
