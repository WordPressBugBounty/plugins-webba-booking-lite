import { IFilterField, TAllowedFilterValue, TFilterFieldMisc } from './types'
import { SelectField } from './Fields/SelectField/SelectField'
import { DateField } from './Fields/DateField/DateField'
import { TextField } from './Fields/TextField/TextField'
import { DateRangeField } from './Fields/DateRangeField/DateRangeField'
import { format } from 'date-fns'

export const createFilterFields = (fields: any) => {
    const fieldsComponents: JSX.Element[] = []

    fields.forEach(({ name, label, type, misc, value }: IFilterField) => {
        switch (type) {
            case 'text':
                fieldsComponents.push(
                    <TextField
                        name={name}
                        label={label as string}
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
                        misc={misc as TFilterFieldMisc}
                        value={value}
                    />
                )
                break
            default:
                console.error('Unknown filter field type: ' + type)
                break
        }
    })

    return fieldsComponents
}

export const createFilterStructure = (fields: IFilterField[]) => {
    let filters: TAllowedFilterValue<any>[] = []

    filters = fields.map((field: IFilterField) => {
        return {
            name: field.name,
            value: field.value !== 0 ? field.value : '',
        }
    })

    fields.forEach((field, i) => {
        if (field.type === 'date_range') {
            const dateValue = (field.value && field.value.split(' - ')) || [
                '',
                '',
            ]

            filters[i].value = dateValue[0]
            filters.splice(i + 1, 0, {
                name: field.name,
                value: dateValue[1],
            })
        }
    })

    filters = filters.filter(
        (filter) =>
            filter.value !== '' && filter.value !== '' && filter.value !== '0'
    )

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
