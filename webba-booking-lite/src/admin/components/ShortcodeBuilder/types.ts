export type TShortcodeId = string | number

export type TShortcodeServiceType = 'hourly' | 'daily'

export interface IShortcodePresetService {
    id: TShortcodeId
    label: string
    locations?: string[]
}

export interface IShortcodePresetUnit {
    id: TShortcodeId
    label: string
    locations?: string[]
}

export interface IShortcodePresetCategory {
    id: TShortcodeId
    name: string
    services: string[]
    units?: string[]
}

export interface IShortcodePresetLocation {
    id: TShortcodeId
    label: string
    description?: string
}

export interface IShortcodePresetStaff {
    id: TShortcodeId
    label: string
    services: string[]
    locations: (string | number)[]
}

export type TShortcodeFilterIgnore =
    | 'service'
    | 'category'
    | 'location'
    | 'staff'

export interface IShortcodeSelections {
    serviceType: TShortcodeServiceType
    serviceId: string | null
    categoryIds: string[]
    locationIds: string[]
    staffIds: string[]
}

export type TShortcodeOption = { value: string; label: string }

export interface IBookingFormDataAttrs {
    service?: string
    category?: string
    location?: string
    staff?: string
    units?: string
}

export interface IShortcodeAttributeFilters {
    serviceType: TShortcodeServiceType
    serviceId: string | null
    categoryIds: string[]
    locationIds: string[]
    staffIds: string[]
    isDailyServiceType: boolean
    isPresetLoading: boolean
    serviceTypeOptions: TShortcodeOption[]
    serviceOptions: TShortcodeOption[]
    categoryOptions: TShortcodeOption[]
    locationOptions: TShortcodeOption[]
    staffOptions: TShortcodeOption[]
    setServiceId: (id: string | null) => void
    setCategoryIds: (ids: string[]) => void
    setLocationIds: (ids: string[]) => void
    setStaffIds: (ids: string[]) => void
    handleServiceTypeChange: (nextType: TShortcodeServiceType) => void
    dataAttrs: IBookingFormDataAttrs
}

export interface IShortcodeAttributeFieldsProps {
    filters: IShortcodeAttributeFilters
}
