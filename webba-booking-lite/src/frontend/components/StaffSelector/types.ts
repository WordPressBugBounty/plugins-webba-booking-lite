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
