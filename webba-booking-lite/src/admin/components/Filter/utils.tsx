import { IFilterField, TAllowedFilterValue, TFilterFieldMisc } from './types'
import { SelectField } from './Fields/SelectField/SelectField'
import { DateField } from './Fields/DateField/DateField'
import { TextField } from './Fields/TextField/TextField'
import { DateRangeField } from './Fields/DateRangeField/DateRangeField'
import { format } from 'date-fns'

export const createFilterFields = (fields: any) => {
    const fieldsComponents: JSX.Element[] = []

    fields.forEach(
        ({ name, label, placeholder, type, misc, value }: IFilterField) => {
            switch (type) {
                case 'text':
                    fieldsComponents.push(
                        <TextField
                            name={name}
                            label={label as string}
                            placeholder={placeholder}
                            misc={misc as TFilterFieldMisc}
                            value={value}
                        />
                    )
                    break
                case 'select':
                    fieldsComponents.push(
                        <SelectField
                            name={name}
                            label={label as string}
                            placeholder={placeholder}
                            misc={misc as TFilterFieldMisc}
                            value={value}
                        />
                    )
                    break
                case 'date':
                    fieldsComponents.push(
                        <DateField
                            name={name}
                            label={label as string}
                            placeholder={placeholder}
                            misc={misc as TFilterFieldMisc}
                            value={value}
                        />
                    )
                    break
                case 'date_range':
                    fieldsComponents.push(
                        <DateRangeField
                            name={name}
                            label={label as string}
                            placeholder={placeholder}
                            misc={misc as TFilterFieldMisc}
                            value={value}
                        />
                    )
                    break
                default:
                    console.error('Unknown filter field type: ' + type)
                    break
            }
        }
    )

    return fieldsComponents
}

const getMeaningfulFilterValues = (values: unknown[]) =>
    values.filter(
        (item) =>
            item !== undefined &&
            item !== null &&
            item !== '' &&
            item !== 0 &&
            item !== '0'
    )

const isPlaceholderFilterValue = (value: unknown): boolean => {
    if (value === undefined || value === null || value === '') {
        return true
    }

    if (value === 0 || value === '0') {
        return true
    }

    if (Array.isArray(value)) {
        return getMeaningfulFilterValues(value).length === 0
    }

    return false
}

const sanitizeFilterValue = (value: unknown) => {
    if (Array.isArray(value)) {
        return getMeaningfulFilterValues(value)
    }

    return value
}

const resolveFieldFilterValue = (field: IFilterField) => {
    const hasExplicitValue = field.value !== undefined && field.value !== null

    if (hasExplicitValue && !isPlaceholderFilterValue(field.value)) {
        return sanitizeFilterValue(field.value)
    }

    if (hasExplicitValue) {
        return ''
    }

    if (!isPlaceholderFilterValue(field.initialValue)) {
        return sanitizeFilterValue(field.initialValue)
    }

    return ''
}

export const createFilterStructure = (
    fields: IFilterField[],
    customQuery?: TAllowedFilterValue<any>[]
) => {
    let filters: TAllowedFilterValue<any>[] = fields.map(
        (field: IFilterField) => ({
            name: field.name,
            value: resolveFieldFilterValue(field),
        })
    )

    fields.forEach((field, i) => {
        if (field.type === 'date_range') {
            const dateValue =
                (typeof field.value === 'string' &&
                    field.value.split(' - ')) ||
                ['', '']

            filters[i].value = dateValue[0]
            filters.splice(i + 1, 0, {
                name: field.name,
                value: dateValue[1],
            })
        }
    })

    filters = filters.filter(
        (filter) => !isPlaceholderFilterValue(filter.value)
    )

    filters = [
        ...filters.filter((filter: TAllowedFilterValue<any>) =>
            fields.find((field) => field.name === filter.name)
        ),
        ...(customQuery?.filter(
            (filter: TAllowedFilterValue<any>) =>
                !fields.find((field) => field.name === filter.name) &&
                !isPlaceholderFilterValue(filter.value)
        ) as TAllowedFilterValue<any>[]),
    ]

    return filters as TAllowedFilterValue<any>[]
}

export const convertShortRange = (shortRange: string) => {
    switch (shortRange) {
        case 'today':
            return formatDateRange([new Date(), new Date()])
        case 'l_7':
            return formatDateRange([
                new Date(new Date().setDate(new Date().getDate() - 7)),
                new Date(),
            ])
        case 'u_7':
            return formatDateRange([
                new Date(),
                new Date(new Date().setDate(new Date().getDate() + 7)),
            ])
        case 'l_30':
            return formatDateRange([
                new Date(new Date().setDate(new Date().getDate() - 30)),
                new Date(),
            ])
        case 'u_30':
            return formatDateRange([
                new Date(),
                new Date(new Date().setDate(new Date().getDate() + 30)),
            ])
        default:
            break
    }
}

export const formatDateRange = (range: [Date, Date]) =>
    formatWbkDate(range[0]) + ' - ' + formatWbkDate(range[1])

export const formatWbkDate = (date: Date) => format(date, 'M/d/y')

export const applyFiltersToFields = (
    fields: IFilterField[],
    filters: { name: string; value: any }[] | Record<string, unknown>
): IFilterField[] => {
    const filterArray = Array.isArray(filters) ? filters : []
    if (!filterArray.length) return fields

    const filterMap: Record<string, any[]> = {}
    filterArray.forEach((f) => {
        if (!filterMap[f.name]) filterMap[f.name] = []
        filterMap[f.name].push(f.value)
    })

    return fields.map((field) => {
        const values = filterMap[field.name]
        if (!values || !values.length) return field
        if (field.type === 'date_range') {
            const [start = '', end = ''] = values
            return { ...field, value: `${start} - ${end}` }
        }
        return { ...field, value: values.length === 1 ? values[0] : values }
    })
}
