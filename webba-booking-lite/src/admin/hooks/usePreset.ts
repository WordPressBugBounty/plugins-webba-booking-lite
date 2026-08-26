import { useSelect } from '@wordpress/data'
import { store } from '../../store/backend'

export const usePreset = () => {
    const preset = useSelect((select) => {
        const storeSelectors = select(store)
        if (!storeSelectors || typeof storeSelectors.getPreset !== 'function') {
            return {}
        }

        return storeSelectors.getPreset() || {}
    }, [])

    return { ...preset }
}
