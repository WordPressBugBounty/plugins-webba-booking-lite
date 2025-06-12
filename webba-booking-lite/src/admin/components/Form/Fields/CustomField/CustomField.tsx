import { useSelect } from '@wordpress/data'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { store_name } from '../../../../../store/backend'
import { FormComponentConstructor } from '../../lib/types'
import styles from './CustomField.module.scss'
import { Label } from '../Label/Label'
import { useField } from '../../lib/hooks/useField'

export const CreateCustomFields: FormComponentConstructor<any> = ({
    field,
    fieldConfig,
}) => {
    return () => {
        const { value, setValue, errors } = useField(field)
        const {
            settings: { custom_fields },
        } = useSelect(
            // @ts-ignore
            (select) => select(store_name).getPreset(),
            []
        )
        const [fieldsData, setFieldsData] = useState<Record<string, string>>({})

        useEffect(() => {
            if (value) {
                try {
                    const parsedValue = JSON.parse(value)

                    if (Array.isArray(parsedValue)) {
                        const formattedFields: Record<string, string> = {}
                        parsedValue.forEach(
                            ([key, , fieldValue]: [string, string, string]) => {
                                formattedFields[key] = fieldValue
                            }
                        )
                        setFieldsData(formattedFields)
                    }
                } catch (error) {
                    console.error('Error parsing field value:', error)
                }
            }
        }, [value])

        const handleChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const { name, value } = e.target

                setFieldsData((prev) => {
                    const updatedFields = { ...prev, [name]: value }

                    const formattedFields = Object.keys(updatedFields).map(
                        (key) => [key, custom_fields[key], updatedFields[key]]
                    )

                    setValue(JSON.stringify(formattedFields))
                    return updatedFields
                })
            },
            [custom_fields, setValue]
        )

        const fields: JSX.Element[] = useMemo(() => {
            return Object.keys(custom_fields).map((id) => (
                <div key={id} className={styles.fieldItem}>
                    <Label title={custom_fields[id]} id={id} />
                    <input
                        type="text"
                        name={id}
                        id={id}
                        className={styles.input}
                        value={fieldsData[id] || ''}
                        onChange={handleChange}
                    />
                </div>
            ))
        }, [custom_fields, fieldsData])

        return <div className={styles.wrapper}>{fields}</div>
    }
}
