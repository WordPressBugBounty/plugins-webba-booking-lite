import { useRoute } from '../../components/Router/useRoute'
import { useSrictUrlParams } from '../../hooks/useStrictUrlParam'
import { SERVICE_SCREEN_TAB_IDS, ServiceScreenTabId } from './types'

const isServiceScreenTabId = (value: string): value is ServiceScreenTabId =>
    (SERVICE_SCREEN_TAB_IDS as readonly string[]).includes(value)

export const useServiceScreenTab = () => {
    const { route } = useRoute()
    const { paramValue, setParamValue } = useSrictUrlParams(
        'service_tab',
        SERVICE_SCREEN_TAB_IDS
    )

    const fallbackTab: ServiceScreenTabId =
        route === 'service-categories' ? 'categories' : 'hourly'

    const activeTab = isServiceScreenTabId(paramValue)
        ? paramValue
        : fallbackTab

    const setActiveTab = (tabId: ServiceScreenTabId) => {
        if (tabId === activeTab) {
            return
        }

        setParamValue(tabId)
    }

    return {
        activeTab,
        setActiveTab,
    }
}
