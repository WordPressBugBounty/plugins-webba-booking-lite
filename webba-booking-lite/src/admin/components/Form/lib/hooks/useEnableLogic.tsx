import { useDispatch } from '@wordpress/data'
import { IEnableCondition } from '../../types'
import { store } from '../../../../../store/backend'
import { useForm } from '../FormProvider'
import { useEffect, useMemo, useState, useRef } from 'react'
import { getFormState } from '../utils'

export const useEnableLogic = ({
    endpoint,
    conditions,
    data,
}: IEnableCondition) => {
    if (!endpoint || !conditions) return true

    const { fetchEnableData } = useDispatch(store)
    const form = useForm()
    const formState = useMemo(() => getFormState(form), [form])
    const [enableData, setEnableData] = useState<Record<
        string,
        string | number | boolean
    > | null>(null)

    // Track the latest request to avoid race conditions
    const latestRequestRef = useRef(0)

    const formData = useMemo(
        () =>
            Object.keys(data).reduce(
                (acc, key) => {
                    if (
                        typeof formState.values[data[key] as string] ===
                            'undefined' &&
                        typeof form.defaultValue?.[data[key] as string] ===
                            'undefined'
                    ) {
                        return acc
                    }
                    return {
                        ...acc,
                        [key]:
                            formState.values[data[key] as string] ||
                            form.defaultValue?.[data[key] as string] ||
                            '',
                    }
                },
                {} as Record<string, string | number | boolean>
            ),
        [formState.values, form.defaultValue, data]
    )

    if (Object.keys(data).length > 0 && !formData) return true

    useEffect(() => {
        if (Object.keys(data).length > 0 && !formData) return

        // Increment request counter
        const requestId = ++latestRequestRef.current

        // Capture current formData in closure
        const currentFormData = formData

        const enableDataResult = fetchEnableData(endpoint, currentFormData)

        enableDataResult
            .then((result) => {
                // Only update if this is still the latest request
                if (requestId === latestRequestRef.current) {
                    setEnableData(
                        result as Record<string, string | number | boolean>
                    )
                }
            })
            .catch((error) => {
                console.error('Failed to fetch enable data:', error)
                // Only update if this is still the latest request
                if (requestId === latestRequestRef.current) {
                    setEnableData(null)
                }
            })

        // Cleanup function
        return () => {
            // If this effect is being cleaned up and it's still the latest,
            // increment the counter to invalidate its pending request
            if (requestId === latestRequestRef.current) {
                latestRequestRef.current++
            }
        }
    }, [fetchEnableData, endpoint, formData, data])

    const result = useMemo(() => {
        if (!enableData) return true // Or false, depending on your default behavior

        let result = true
        conditions.forEach((element) => {
            if (
                element.operator === '=' &&
                element.value == enableData[element.field]
            ) {
                result = true
            } else if (
                element.operator === '==' &&
                element.value === enableData[element.field]
            ) {
                result = true
            } else if (
                element.operator === '!=' &&
                element.value != enableData[element.field]
            ) {
                result = true
            } else if (
                element.operator === '!==' &&
                element.value !== enableData[element.field]
            ) {
                result = false
            } else if (
                element.operator === 'in' &&
                element.value.includes(enableData[element.field] as string)
            ) {
                result = true
            } else if (
                element.operator === '!in' &&
                !element.value.includes(enableData[element.field] as string)
            ) {
                result = true
            } else {
                result = false
            }
        })

        return result
    }, [enableData, conditions])

    return result
}
