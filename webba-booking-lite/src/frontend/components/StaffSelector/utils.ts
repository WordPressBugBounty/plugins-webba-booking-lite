import { ISelectedStaffLabelParams, IStaffOption } from './types'

const ANY_AVAILABLE_STAFF_ID = '0'

const toIdList = (values: Array<string | number> | undefined) =>
    (values || []).map((value) => String(value))

export const staffMatchesServiceAndLocation = (
    staff: IStaffOption,
    serviceId: number,
    locationId: string | null
) => {
    const serviceIds = toIdList(staff.services)
    if (!serviceIds.includes(String(serviceId))) {
        return false
    }
    if (!locationId) {
        return true
    }
    const locationIds = toIdList(staff.locations)
    if (locationIds.length === 0) {
        return false
    }
    return locationIds.includes(String(locationId))
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
        const allowedStaffIds = extractedAttrStaff.map((staffId) =>
            String(staffId)
        )
        filtered = filtered.filter((staff) =>
            allowedStaffIds.includes(String(staff.id))
        )
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

