export type TShortcodeId = string | number

export interface IShortcodePresetService {
    id: TShortcodeId
    label: string
    locations?: string[]
}

export interface IShortcodePresetCategory {
    id: TShortcodeId
    name: string
    services: string[]
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
    serviceId: string | null
    categoryIds: string[]
    locationIds: string[]
    staffIds: string[]
}
