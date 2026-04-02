import { useSelect } from '@wordpress/data'
import { store_name } from '../../store/frontend'

export const useWording = () => {
    const wording = useSelect((select: any) => {
        const preset = select(store_name).getPreset()
        return preset?.wording || {}
    }, [])

    return wording
} 