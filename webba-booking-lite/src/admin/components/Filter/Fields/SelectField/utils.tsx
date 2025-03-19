import { dispatch, useSelect } from '@wordpress/data'
import { IOption } from '../../../Form/types'
import { store_name } from '../../../../../store/backend'

interface IOptionRequest {
    options: Record<string, string> | string
    nullValue?: string[]
}

export const useOptions = ({ options, nullValue = [] }: IOptionRequest) => {
    const nullValues = createNullValues(nullValue)

    if (!options) {
        return []
    }

    if (typeof options === 'object') {
        return [...nullValues, ...formatOptions(options)]
    } else if (
        (typeof options === 'string' &&
            options !== 'backend' &&
            options === 'services') ||
        options === 'service_categories'
    ) {
        const { services, categories } = useSelect(
            (select) => select(store_name).getPreset(),
            []
        )

        if (options === 'services') {
            return [...nullValues, ...formatOptionsWithId(services)]
        } else if (options === 'service_categories') {
            return [...nullValues, ...formatOptionsWithId(categories)]
        }
    } else if (
        options &&
        typeof options === 'string' &&
        options !== 'backend'
    ) {
        const modelObject = useSelect(
            (select) => select(store_name).getItems(options),
            []
        )

        const stateOptions = processModelOptions(modelObject)

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

export const formatOptionsWithId = (options: Record<string, string>[]) => {
    let formattedOptions: IOption[] = []

    if (!options) {
        return []
    }

    return options.map((option) => {
        return {
            value: option['id']?.toString(),
            label: option['label'],
        }
    })
}

export const processModelOptions = (model: []) => {
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

export const isModelOptions = (options: string | Record<string, string>) =>
    typeof options === 'string' && options !== 'backend'
