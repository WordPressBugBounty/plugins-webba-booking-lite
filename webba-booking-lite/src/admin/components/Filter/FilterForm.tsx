import { FilterProvider } from './FilterProvider'
import styles from './FilterForm.module.scss'
import { useEffect, useRef, useState } from 'react'
import { createFilterFields, createFilterStructure } from './utils'
import { dispatch } from '@wordpress/data'
import { store_name } from '../../../store/backend'
import { IFilterFormProps, TAllowedFilterValue } from './types'

export const FilterForm = ({
    fields,
    model,
    columnCount,
    customQuery,
    setCustomQuery,
}: IFilterFormProps) => {
    const fieldComponents = createFilterFields(fields)
    const [fieldsObj, setFieldsObj] = useState(fields)
    const isFirstRender = useRef(true)
    const [fieldCounter, setFieldCounter] = useState(0)

    useEffect(() => {
        const query: TAllowedFilterValue<any>[] = createFilterStructure(
            fieldsObj,
            (customQuery && customQuery) || []
        )

        setCustomQuery && setCustomQuery(query)
        // @ts-ignore
        dispatch(store_name).setFilters(model, query)

        if (fieldCounter <= fieldsObj.length - 1) {
            setFieldCounter(fieldCounter + 1)
            return
        }

        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        if (model === 'dashboard') {
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
                className={styles.wrapper}
                style={{
                    gridTemplateColumns: `repeat(${columnCount || 4}, 1fr)`,
                }}
            >
                {fieldComponents}
            </div>
        </FilterProvider>
    )
}
