import { FilterProvider } from './FilterProvider'
import './FilterForm.scss'
import { useEffect, useLayoutEffect, useState } from 'react'
import { createFilterFields, createFilterStructure } from './utils'
import { dispatch } from '@wordpress/data'
import { store_name } from '../../../store/backend'
import { IFilterField, IFilterFormProps, TAllowedFilterValue } from './types'
import classNames from 'classnames'

const areFilterFieldsUnchanged = (
    previousFields: IFilterField[],
    nextFields: IFilterField[]
) => {
    if (previousFields.length !== nextFields.length) {
        return false
    }

    return previousFields.every((previousField, index) => {
        const nextField = nextFields[index]
        return (
            previousField.name === nextField.name &&
            JSON.stringify(previousField.value) ===
                JSON.stringify(nextField.value) &&
            JSON.stringify(previousField.misc) === JSON.stringify(nextField.misc)
        )
    })
}

export const FilterForm = ({
    fields,
    model,
    columnCount,
    customQuery,
    setCustomQuery,
    classes,
    preventFilterDispatch,
    onFiltersChange,
}: IFilterFormProps) => {
    const fieldComponents = createFilterFields(fields)
    const [fieldsObj, setFieldsObj] = useState(fields)

    useLayoutEffect(() => {
        setFieldsObj((previousFields) => {
            const nextFields = fields.map((nextField) => {
                const previousField = previousFields.find(
                    (field) => field.name === nextField.name
                )

                return {
                    ...previousField,
                    ...nextField,
                    value:
                        nextField.value !== undefined
                            ? nextField.value
                            : previousField?.value,
                    initialValue:
                        nextField.initialValue !== undefined
                            ? nextField.initialValue
                            : previousField?.initialValue,
                    misc: {
                        ...previousField?.misc,
                        ...nextField.misc,
                    },
                }
            })

            return areFilterFieldsUnchanged(previousFields, nextFields)
                ? previousFields
                : nextFields
        })
    }, [fields])

    useEffect(() => {
        const query: TAllowedFilterValue<any>[] = createFilterStructure(
            fieldsObj,
            (customQuery && customQuery) || []
        )

        setCustomQuery && setCustomQuery(query)
        onFiltersChange && onFiltersChange(query)
        if (!preventFilterDispatch) {
            // @ts-ignore
            dispatch(store_name).setFilters(model, query)
        }

        if (preventFilterDispatch) {
            return
        }

        if (model === 'dashboard') {
            if (query.length < 3) {
                return
            }
            // @ts-ignore
            dispatch(store_name).filterDashboardStats(query)

            return
        }

        // @ts-ignore
        dispatch(store_name).filterItems(model, query)
    }, [fieldsObj])

    return (
        <FilterProvider
            fields={fieldsObj}
            setFields={setFieldsObj}
            model={model}
        >
            <div
                className={classNames('wbk_filterForm', classes)}
                style={{
                    gridTemplateColumns: `repeat(${columnCount || 4}, 1fr)`,
                }}
            >
                {fieldComponents}
            </div>
        </FilterProvider>
    )
}
