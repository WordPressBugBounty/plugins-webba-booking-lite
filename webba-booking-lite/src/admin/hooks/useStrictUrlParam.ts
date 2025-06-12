import { useEffect } from 'react'
import { useSearch } from 'wouter'

const logWarn = (paramName: string, value: string) => {
    console.warn(`'${value}' is not a valid value for '${paramName}' param.`)
}

export const useSrictUrlParams = <T extends string>(
    param: string,
    validValues: readonly T[]
) => {
    const search = useSearch()
    const params = new URLSearchParams(search)
    const urlParam = params.get(param) || ''

    const setParamValue = (value: T) => {
        if (value && !validValues.includes(value)) {
            logWarn(param, urlParam)
            return
        }

        const url = new URL(window.location.href)
        url.searchParams.set(param, value)
        window.history.pushState({}, '', url)
    }

    useEffect(() => {
        if (urlParam && !validValues.includes(urlParam as T)) {
            logWarn(param, urlParam)
        }
    }, [urlParam])

    return {
        paramValue: urlParam as T,
        setParamValue: setParamValue as (value: T) => void,
    }
}
