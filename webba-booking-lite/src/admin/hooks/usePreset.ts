import { useSelect } from '@wordpress/data'
import { store } from '../../store/backend'

export const usePreset = () => {
    const preset = useSelect((select) => select(store).getPreset(), [])

    return { ...preset }
}
