import apiFetch from '@wordpress/api-fetch'
import { createReduxStore, register } from '@wordpress/data'
import * as actions from './actions'
import reducer from './reducer'

const store = createReduxStore('webba_booking/assets_store', {
    reducer,
    actions,
    selectors: {
        getData(state) {
            return state.data
        },
    },

    controls: {
        FETCH_FROM_API(action) {
            return apiFetch({ path: action.path })
        },
    },

    resolvers: {
        *getData(item) {
            const path = 'wbk/v2/get-preset/'
            const data = yield actions.fetchFromAPI(path)
            console.log(data)
            return actions.setData(data)
        },
    },
})

register(store)

export default store
