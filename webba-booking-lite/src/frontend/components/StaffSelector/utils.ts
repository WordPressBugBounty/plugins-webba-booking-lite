import { ISelectedStaffLabelParams, IStaffOption } from './types'

const ANY_AVAILABLE_STAFF_ID = '0'

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

const isAnyAvailableStaffId = (staffId: string | null | undefined) =>
    staffId === undefined ||
    staffId === null ||
    String(staffId) === '' ||
    String(staffId) === ANY_AVAILABLE_STAFF_ID

export const getSelectedStaffLabel = ({
    staffMembers,
    serviceId,
    places,
    staffId,
    formStaff,
    anyAvailableLabel,
}: ISelectedStaffLabelParams): string | null => {
    if (!staffMembers || staffMembers.length === 0) {
        return null
    }

    const labelForStaffId = (id: string | null | undefined) => {
        if (isAnyAvailableStaffId(id)) {
            return null
        }
        const staff = staffMembers.find(
            (member) => String(member.id) === String(id)
        )
        return staff?.label ?? null
    }

    const placeStaffIds = (places ?? [])
        .map((place) => place.staff_member_id)
        .filter(
            (id): id is string =>
                id != null &&
                String(id) !== '' &&
                String(id) !== ANY_AVAILABLE_STAFF_ID
        )

    if (placeStaffIds.length > 0) {
        const labels = [...new Set(placeStaffIds.map(String))]
            .map((id) => labelForStaffId(id))
            .filter((label): label is string => Boolean(label))
        if (labels.length === 1) {
            return labels[0]
        }
        if (labels.length > 1) {
            return labels.join(', ')
        }
    }

    const selectedStaffId =
        staffId ?? formStaff?.[String(serviceId)] ?? null
    if (selectedStaffId == null || String(selectedStaffId) === '') {
        return null
    }
    if (String(selectedStaffId) === ANY_AVAILABLE_STAFF_ID) {
        return anyAvailableLabel
    }

    return labelForStaffId(selectedStaffId)
}

