import { controls } from '@wordpress/data'
import apiFetch from '@wordpress/api-fetch'

export const setData = (data) => {
    return {
        type: 'SET_DATA',
        data,
    }
}

export const fetchFromAPI = (path) => {
    return {
        type: 'FETCH_FROM_API',
        path,
    }
}
