import { TItemsRawData } from '../types'

export const isForbidden = (data: TItemsRawData<any>) => {
    if (
        data.length > 0 &&
        'error' in data[0] &&
        data[0].error.code === 'rest_forbidden'
    ) {
        return true
    }

    return false
}
