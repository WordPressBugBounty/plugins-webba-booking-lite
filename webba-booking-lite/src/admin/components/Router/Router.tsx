import { ReactNode, useEffect } from 'react'
import { useRoute } from './useRoute'
import { Route } from './types'
import { usePage } from './usePage'

export type RouterConfig = Partial<Record<Route, ReactNode | string>>

interface RouterProps {
    config: RouterConfig
}

export const Router = function ({ config }: RouterProps) {
    const { route, setRoute } = useRoute()
    const { page } = usePage()
    const routes = Object.keys(config) as Route[]
    const [fallbackRoute] = routes

    useEffect(() => {
        if (!routes.length) {
            console.error(`No routes setup for ${page}  page!`)
            return
        }

        if (!route) {
            setRoute(fallbackRoute)
            return
        }

        if (!routes.includes(route)) {
            console.warn(`Unknown route: ${route}. Defaulting to fallback.`)
            setRoute(fallbackRoute)
            return
        }

        if (!config[route]) {
            console.warn(
                `No component set for route: ${route}. Defaulting to fallback.`
            )
            setRoute(fallbackRoute)
        }
    }, [route])

    return config[route]
}
