import { Page, PAGES } from './types'
import { useSrictUrlParams } from '../../hooks/useStrictUrlParam'

export const usePage = () => {
    const param = useSrictUrlParams<Page>('page', PAGES)

    return {
        page: param.paramValue,
        setPage: param.setParamValue,
    }
}
