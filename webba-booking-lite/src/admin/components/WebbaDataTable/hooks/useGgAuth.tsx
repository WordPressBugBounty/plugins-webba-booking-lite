import { useSelect } from '@wordpress/data'
import { store_name } from '../../../../store/backend'

type CalendarId = string | number

interface GgAuthData {
    isAuthenticated: boolean
    internalError: boolean
    authUrl?: string
    revokeUrl?: string
}

interface UseGgAuthResult {
    authData: GgAuthData | null
    isLoading: boolean
    isAuthenticated: boolean
    internalError: boolean
    authUrl?: string
    revokeUrl?: string
}

export const useGgAuth = (calendarId: CalendarId): UseGgAuthResult => {
    const authData = useSelect(
        // @ts-ignore - WordPress data store typing
        (select) => select(store_name).getGgAuthData(calendarId),
        [calendarId]
    ) as GgAuthData | null

    const isLoading = !authData || (typeof authData === 'object' && Object.keys(authData).length === 0)
    const { isAuthenticated, internalError, authUrl, revokeUrl } = authData || ({} as GgAuthData)

    return {
        authData: authData ?? null,
        isLoading,
        isAuthenticated: Boolean(isAuthenticated),
        internalError: Boolean(internalError),
        authUrl,
        revokeUrl,
    }
}


