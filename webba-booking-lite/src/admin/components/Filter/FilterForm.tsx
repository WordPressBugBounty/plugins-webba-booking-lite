import { FilterProvider } from './FilterProvider'
import styles from './FilterForm.module.scss'
import { useEffect, useRef, useState } from 'react'
import { createFilterFields, createFilterStructure } from './utils'
import { dispatch } from '@wordpress/data'
import { store_name } from '../../../store/backend'

export const FilterForm = ({ fields, model, columnCount }: any) => {
    const fieldComponents = createFilterFields(fields)
    const [fieldsObj, setFieldsObj] = useState(fields)
    const isFirstRender = useRef(true)

    useEffect(() => {
        // @ts-ignore
        dispatch(store_name).setFilters(model, createFilterStructure(fieldsObj))
        
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        if (model === 'dashboard') {
            // @ts-ignore
            dispatch(store_name).filterDashboardStats(
                createFilterStructure(fieldsObj)
            )

            return
        }

        // @ts-ignore
        dispatch(store_name).filterItems(
            model,
            createFilterStructure(fieldsObj)
        )
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
