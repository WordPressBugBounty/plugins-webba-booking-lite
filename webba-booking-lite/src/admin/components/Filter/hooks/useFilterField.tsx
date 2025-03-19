import { useFilter } from '../FilterProvider'
import {
    IFilterContextValue,
    IFilterField,
    TAllowedFilterValue,
} from '../types'
import { convertShortRange } from '../utils'

export const useFilterField = (name: string) => {
    const { fields, setFields, model } = useFilter()
    const field = fields.find((field: IFilterField) => field.name === name)
    const value = field?.value

    const setFilter = (
        value: TAllowedFilterValue<any>,
        isFromDateRange = false
    ) => {
        setFields(
            fields.map((otherField: IFilterField) => {
                if (
                    field?.triggerDateRange &&
                    otherField.type === 'date_range'
                ) {
                    return {
                        ...otherField,
                        value: convertShortRange(value),
                    }
                }

                if (
                    field?.type === 'date_range' &&
                    isFromDateRange &&
                    value &&
                    otherField?.triggerDateRange
                ) {
                    return {
                        ...otherField,
                        value: 'custom',
                    }
                }

                if (otherField.name === name) {
                    return {
                        ...otherField,
                        value,
                    }
                }

                return otherField
            })
        )
    }

    return {
        value,
        field,
        setFilter,
        model,
    } as IFilterContextValue
}
