export type TFilterFieldType =
    | 'text'
    | 'number'
    | 'date'
    | 'date_range'
    | 'select'

export type TFilterFieldMisc = Record<string, any>

export type TFilterSelectOptions = Record<string, string> | string

export interface IFilterField {
    name: string
    label?: string
    type: TFilterFieldType
    options?: TFilterSelectOptions
    misc?: TFilterFieldMisc
    multiple?: boolean
    null_value?: string[]
    value?: TAllowedFilterValue<any>
    triggerDateRange?: boolean
}

export interface IFilterFieldProps {
    name: string
    label: string
    misc: TFilterFieldMisc
    value?: TAllowedFilterValue<any>
}

export interface ISearchFieldProps {
    name: string
    label: string
    onChange: (value: any) => void
}

export interface IFilterContext {
    fields: IFilterField[]
    setFields: (fields: IFilterField[]) => void
    model: TAllowedFilterModel
}

export interface IFilterFormProps {
    fields: IFilterField[]
    model: TAllowedFilterModel
}

export type TAllowedFilterModel = 'appointments' | 'services' | 'coupons'

export type TAllowedFilterValue<T extends string | Date | number> = T | T[]

export interface IFilterValue {
    name: string
    value: TAllowedFilterValue<any>
}

export interface IFilterContextValue {
    value: TAllowedFilterValue<any>
    field: IFilterField
    setFilter: (value: any, isFromDateRange?: boolean) => void
    filters: any
    model: TAllowedFilterModel
}
