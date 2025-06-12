import apiFetch from '@wordpress/api-fetch'
import { createReduxStore, register } from '@wordpress/data'

const DEFAULT_STATE = {
    services: [],
}

const actions = {
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
}
const store = createReduxStore('webba_booking/data_store', {
    reducer(state = DEFAULT_STATE, action) {
        switch (action.type) {
            case 'SET_ITEMS':
                switch (action.model) {
                    case 'services':
                        return {
                            ...state,
                            services: action.items,
                        }
                }
            case 'SET_ITEM':
                switch (action.model) {
                    case 'services':
                        const updatedServices = state.services.map((service) =>
                            service.id === action.data.id
                                ? { ...service, ...action.data }
                                : service
                        )
                        return {
                            ...state,
                            services: updatedServices,
                        }
                }
            case 'ADD_ITEM':
                switch (action.model) {
                    case 'services':
                        const updatedServices = state.services
                        updatedServices.push(action.data)
                        return {
                            ...state,
                            services: updatedServices,
                        }
                }
            case 'DELETE_ITEMS':
                switch (action.model) {
                    case 'services':
                        const idsToRemove = action.data.ids
                        const filteredServices = state.services.filter(
                            (service) => !idsToRemove.includes(service.id)
                        )
                        return {
                            ...state,
                            services: filteredServices,
                        }
                }
        }

        return state
    },
    actions,
    selectors: {
        getItems: (state, model) => {
            switch (model) {
                case 'services':
                    return state.services
                    break
            }
        },
        getBookingsByUser(state) {},
    },

    resolvers: {
        getItems:
            (model) =>
            async ({ dispatch }) => {
                const params = {
                    model: model,
                }
                const queryString = new URLSearchParams(params).toString()
                const result = await apiFetch({
                    path: `/wbkdata/v1/get-items/?${queryString}`,
                })
                dispatch.setItems('services', result)
            },
    },
})

register(store)

export const store_name = 'webba_booking/data_store'
export const default_state = DEFAULT_STATE
