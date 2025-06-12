import { dispatch, useSelect } from '@wordpress/data'
import { IOption } from '../../types'
import { store_name } from '../../../../../store/backend'
import apiFetch from '@wordpress/api-fetch'

export const getSelectFieldOptions = (fieldName: string): IOption[] => {
    if (fieldName === 'payment_method') {
        return [
            {
                label: 'Woocommerce',
                value: 'woocommerce',
            },
            {
                label: 'Credit card',
                value: 'credit_card',
            },
        ]
    }

    return []
}

interface IOptionRequest {
    options: Record<string, string> | string
    model: string
    field: string
    formData: Record<string, unknown>
    nullValue?: string[]
}

export const useOptions = ({
    options,
    field,
    model,
    formData,
    nullValue = [],
}: IOptionRequest) => {
    const nullValues = createNullValues(nullValue)

    if (options && typeof options === 'object') {
        return [...nullValues, ...formatOptions(options)]
    } else if (
        options &&
        typeof options === 'string' &&
        options !== 'backend'
    ) {
        const modelObject = useSelect(
            // @ts-ignore
            (select) => select(store_name).getItems(options),
            []
        )

        const stateOptions = processModelOptions(model, modelObject)

        return [...nullValues, ...formatOptions(stateOptions)]
    } else if (
        options &&
        typeof options === 'string' &&
        options === 'backend'
    ) {
        const stateOptions = useSelect(
            (select) =>
                // @ts-ignore
                select(store_name).getFieldOptions(
                    model,
                    field,
                    formData,
                    isDependentField(model, field)
                ),
            []
        )

        return [...nullValues, ...formatOptions(stateOptions)]
    }

    return []
}

export const formatOptions = (options: Record<string, string>) => {
    let formattedOptions: IOption[] = []

    for (let key in options) {
        formattedOptions.push({ value: key, label: options[key] })
    }

    return formattedOptions as IOption[]
}

export const processModelOptions = (modelName: string, model: []) => {
    let options = {}

    model.forEach((item) => {
        options = {
            ...options,
            [item['id'] as string]: item['name'],
        }
    })

    return options
}

const createNullValues = (nullValues: string[]) =>
    nullValues.map((nullValue, index) => ({
        value: index.toString(),
        label: nullValue,
    }))

export const fieldConnection: Record<string, Record<string, string[]>> = {
    appointments: {
        time: ['service_id', 'day'],
        quantity: ['service_id', 'day', 'time'],
    },
}

export const isConnectedField = (model: string, field: string) => {
    for (let dependentField in fieldConnection[model]) {
        if (fieldConnection[model][dependentField].includes(field)) {
            return true
        }
    }

    return false
}

export const isDependentField = (model: string, field: string) => {
    return fieldConnection[model] && fieldConnection[model][field]
}

export const fetchConnectedOptions = async (
    model: string,
    field: string,
    formData: Record<string, string>
) => {
    const dependentFields = Object.keys(fieldConnection[model]).filter(
        (parentFieldName: string) =>
            fieldConnection[model][parentFieldName].includes(field)
    )

    dependentFields.forEach((dependentField) => {
        // @ts-ignore
        dispatch(store_name).setFieldLoading(model, dependentField, true)
    })

    dependentFields.forEach(async (dependentField) => {
        let isValid = true

        fieldConnection[model][dependentField].forEach((connectedField) => {
            if (!formData[connectedField]) {
                isValid = false
            }
        })

        if (isValid) {
            const options = await apiFetch({
                path: `/wbk/v2/get-field-options/`,
                method: 'POST',
                data: {
                    model,
                    field,
                    form: formData,
                },
            })

            // @ts-ignore
            dispatch(store_name).setFieldOptions(model, field, options)
        }
    })
}

export const isModelOptions = (options: string | Record<string, string>) =>
    typeof options === 'string' && options !== 'backend'
