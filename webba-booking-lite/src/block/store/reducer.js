import * as ActionTypes from './constants'

const DEFAULT_STATE = {
    data: {},
}

const reducer = (state = DEFAULT_STATE, action) => {
    switch (action.type) {
        case ActionTypes.SET_DATA:
            return {
                ...state,
                data: action.data,
            }

        default:
            return state
    }
}

export default reducer
