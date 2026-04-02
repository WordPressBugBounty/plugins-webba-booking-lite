import { FilterProvider } from './FilterProvider'
import './FilterForm.scss'
import { useEffect, useState } from 'react'
import { createFilterFields, createFilterStructure } from './utils'
import { dispatch } from '@wordpress/data'
import { store_name } from '../../../store/backend'
import { IFilterFormProps, TAllowedFilterValue } from './types'
import classNames from 'classnames'

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
