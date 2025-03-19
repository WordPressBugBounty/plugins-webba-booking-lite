import { useSrictUrlParams } from '../../hooks/useStrictUrlParam'
import { Route, ROUTES } from './types'

export const useRoute = () => {
    const param = useSrictUrlParams<Route>('tab', ROUTES)

    return {
        route: param.paramValue,
        setRoute: param.setParamValue,
    }
}
