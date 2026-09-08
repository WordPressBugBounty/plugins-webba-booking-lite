export interface IStaffOption {
    id: string
    value: string
    label: string
    photo: string | false
    services: string[]
    locations: (string | number)[]
}

export interface IStaffSelectorProps {
    staffOptions: IStaffOption[]
    selectedStaffId: string | null
    onSelect: (staffId: string | null) => void
    treatNullAsAnyAvailable?: boolean
}

export interface ISelectedStaffLabelParams {
    staffMembers: Array<{ id: string | number; label: string }> | undefined
    serviceId: string | number
    places?: Array<{ staff_member_id?: string | null }>
    staffId?: string | null
    formStaff?: Record<string, string | null>
    anyAvailableLabel: string
}
