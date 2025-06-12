import apiFetch from '@wordpress/api-fetch'
import { createReduxStore, register } from '@wordpress/data'

const DEFAULT_STATE = {
    services: [],
    coupons: [],
}

const store = createReduxStore('webba_booking/data_store', {
    reducer(state = DEFAULT_STATE, action) {
        switch (action.type) {
            case 'SET_ITEMS':
                return {
                    ...state,
                    [action.model]: action.items,
                }

            case 'SET_ITEM':
                const updatedItems = state[action.model].map(
                    (item: { id: any }) =>
                        item.id === action.data.id
                            ? { ...item, ...action.data }
                            : item
                )
                return {
                    ...state,
                    [action.model]: updatedItems,
                }

            case 'ADD_ITEM':
                const addedItmes = state[action.model]
                addedItmes.push(action.data)
                return {
                    ...state,
                    [action.model]: addedItmes,
                }

            case 'DELETE_ITEMS':
                const idsToRemove = action.ids
                const filteredItems = state[action.model].filter(
                    (item: { id: any }) => !idsToRemove.includes(item.id)
                )
                return {
                    ...state,
                    [action.model]: filteredItems,
                }
        }

        return state
    },

    actions: {
        setItems(model, items) {
            return {
                type: 'SET_ITEMS',
                model,
                items,
            }
        },
        setItem:
            (model, data) =>
            async ({ dispatch }) => {
                const result = await apiFetch({
                    path: `/wbkdata/v1/save-item/`,
                    method: 'POST',
                    data: {
                        model: model,
                        data: data,
                    },
                })
                dispatch({ type: 'SET_ITEM', model: model, data: data })
            },
        addItem:
            (model, data) =>
            async ({ dispatch }) => {
                console.log({ model, data })
                const result = await apiFetch({
                    path: `/wbkdata/v1/save-item/`,
                    method: 'POST',
                    data: {
                        model: model,
                        data: data,
                    },
                })
                dispatch({ type: 'ADD_ITEM', model: model, data: data })
            },
        deleteItems:
            (model, ids) =>
            async ({ dispatch }) => {
                const result = await apiFetch({
                    path: `/wbkdata/v1/delete-items/`,
                    method: 'POST',
                    data: {
                        model: model,
                        ids: ids,
                    },
                })
                dispatch({ type: 'DELETE_ITEMS', model: model, ids: ids })
            },
    },
    selectors: {
        getItems: (state: { model: any }, model: any) => {
            return state.model
        },
    },

    resolvers: {
        getItems:
            (model: any) =>
            async ({ dispatch }) => {
                const params = {
                    model: model,
                }
                const queryString = new URLSearchParams(params).toString()
                const result = await apiFetch({
                    path: `/wbkdata/v1/get-items/?${queryString}`,
                })
                dispatch.setItems(model, result)
            },
    },
})

register(store)

export const store_name = 'webba_booking/data_store'
export const default_state = DEFAULT_STATE
