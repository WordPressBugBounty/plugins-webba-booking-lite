import { useSearch } from 'wouter'

export const useUrlParam = <T extends string>(param: string) => {
    const search = useSearch()
    const params = new URLSearchParams(search)
    const urlParam = params.get(param) || ''

    const setParamValue = (value: string) => {
        const url = new URL(window.location.href)
        url.searchParams.set(param, value)
        window.history.pushState({}, '', url)
    }

    return {
        paramValue: urlParam as T,
        setParamValue,
    }
}
