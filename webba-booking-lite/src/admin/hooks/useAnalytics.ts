import { useEffect } from 'react'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../store/backend'
import { identifySite, initAnalytics } from '../../utils/analytics'

export const useAnalytics = () => {
    const { siteUrl, isPro } = useSelect(
        (select: any) => {
            const preset = select(store_name).getPreset()

            return {
                siteUrl: preset?.site_url as string | undefined,
                isPro: preset?.is_pro as boolean | undefined,
            }
        },
        []
    )

    useEffect(() => {
        initAnalytics()
    }, [])

    useEffect(() => {
        if (!siteUrl) return

        identifySite(siteUrl, {
            is_pro: isPro,
        })
    }, [siteUrl, isPro])
}
