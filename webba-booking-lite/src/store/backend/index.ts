import apiFetch from '@wordpress/api-fetch'
import { createReduxStore, register } from '@wordpress/data'
import { addQueryArgs } from '@wordpress/url'

const DEFAULT_STATE = {
    appointments: null,
    services: null,
    cancelled_appointments: null,
    service_categories: null,
    email_templates: null,
    coupons: null,
    gg_calendars: null,
    pricing_rules: null,
    isLoading: false,
    preset: {},
    fieldOptions: {},
    ggAuthData: {},
    busy: false,
    dashboardStats: {
        blocks: null,
        chart: null,
        priceFormat: null,
    },
    cellData: null,
    deleteFailed: false,
    filters: {},
}

const actions = {
    toggleBusy: () => ({ type: 'TOGGLE_BUSY' }),

    setLoading: (loading: boolean) => ({
        type: 'SET_LOADING',
        loading,
    }),
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
            dispatch.toggleBusy()
            await apiFetch({
                path: `/wbkdata/v1/save-item/`,
                method: 'POST',
                data: {
                    model,
                    data,
                },
            })
            dispatch({ type: 'SET_ITEM', model: model, data: data })
            dispatch.toggleBusy()
        },
    addItem:
        (model, data) =>
        async ({ dispatch }) => {
            dispatch.toggleBusy()
            const update = { ...data }
            delete update.id
            const response: any = await apiFetch({
                path: `/wbkdata/v1/save-item/`,
                method: 'POST',
                data: {
                    model: model,
                    data: update,
                },
            })
            dispatch({
                type: 'ADD_ITEM',
                model: model,
                data: { ...update, ...response.details },
            })
            dispatch.toggleBusy()
        },
    deleteItems:
        (model, ids) =>
        async ({ dispatch }) => {
            try {
                await apiFetch({
                    path: `/wbkdata/v1/delete-items/`,
                    method: 'POST',
                    data: {
                        model: model,
                        ids: ids,
                    },
                })
                
                dispatch({ type: 'DELETE_ITEMS', model: model, ids: ids })
            } catch (e: any) {
                if (e?.code === 'rest_forbidden' || e.status === 'fail') {
                    dispatch.setDeleteFailed(true)
                }
            }
        },
    setPreset(preset) {
        return {
            type: 'SET_PRESET',
            preset,
        }
    },
    setFieldOptions(
        model: string,
        field: string,
        options: Record<string, string | number>
    ) {
        return {
            type: 'SET_FIELD_OPTIONS',
            model,
            field,
            options,
        }
    },
    setFieldLoading(model: string, field: string, loading: boolean = true) {
        return {
            type: 'SET_FIELD_LOADING',
            model,
            field,
            loading,
        }
    },
    setGgAuthData(calendarId, data) {
        return {
            type: 'SET_GG_AUTH_DATA',
            data,
            calendarId,
        }
    },
    filterItems:
        (model: string, filters: TFilterValue<TAllowedFilterValues>) =>
        async ({ dispatch }) => {
            dispatch.setLoading(true)

            const queryParams = {
                model,
                filters,
            }

            const result = await apiFetch({
                path: addQueryArgs(`/wbkdata/v1/get-items/`, queryParams),
            })

            dispatch.setItems(model, result)
            dispatch.setLoading(false)
        },
    setDashboardStats: (data) => {
        return {
            type: 'SET_DASHBOARD_STATS',
            data,
        }
    },
    filterDashboardStats:
        (filters) =>
        async ({ dispatch }) => {
            const result = await apiFetch({
                path: addQueryArgs(`/wbk/v2/get-dashboard-stats/`, { filters }),
            })
            dispatch.setDashboardStats(result)
        },
    setCellData: (model, data) => {
        return {
            type: 'SET_CELL_DATA',
            data,
            model,
        }
    },
    setDeleteFailed: (status) => {
        return {
            type: 'SET_DELETE_FAILED',
            status,
        }
    },
    setFilters: (model, filters) => {
        return {
            type: 'SET_FILTERS',
            model,
            filters,
        }
    },
}

interface BaseItem {
    id: string | number
    [key: string]: any
}

const updateModel = <T extends BaseItem>(model: T[], data: Partial<T>): T[] =>
    model.map((item) => (item.id === data.id ? { ...item, ...data } : item))

const deleteFromModel = <T extends BaseItem>(
    model: T[],
    ids: (string | number)[]
): T[] => model.filter((item) => !ids.includes(item.id))

const reducer = (state: State = DEFAULT_STATE, action: Action): State => {
    switch (action.type) {
        case 'SET_LOADING': {
            return {
                ...state,
                isLoading: action.loading,
            }
        }

        case 'SET_ITEMS': {
            if (action.model in state) {
                return {
                    ...state,
                    [action.model]: action.items,
                }
            }
            return state
        }

        case 'SET_ITEM': {
            if (action.model in state) {
                return {
                    ...state,
                    [action.model]: updateModel(
                        state[action.model],
                        action.data
                    ),
                }
            }
            return state
        }

        case 'ADD_ITEM': {
            if (action.model in state) {
                return {
                    ...state,
                    [action.model]: [...state[action.model], action.data],
                }
            }
            return state
        }

        case 'DELETE_ITEMS': {
            if (action.model in state) {
                return {
                    ...state,
                    [action.model]: deleteFromModel(
                        state[action.model],
                        action.ids
                    ),
                }
            }
            return state
        }

        case 'SET_PRESET': {
            return {
                ...state,
                preset: action.preset,
            }
        }
        case 'SET_GG_AUTH_DATA': {
            return {
                ...state,
                ggAuthData: {
                    ...state.ggAuthData,
                    [action.calendarId]: action.data,
                },
            }
        }

        case 'SET_FIELD_OPTIONS': {
            return {
                ...state,
                fieldOptions: {
                    ...state.fieldOptions,
                    [action.model]: {
                        ...state.fieldOptions[action.model],
                        ...action.options[action.model],
                    },
                },
            }
        }
        case 'SET_FIELD_LOADING': {
            return {
                ...state,
                fieldOptions: {
                    ...state.fieldOptions,
                    [action.model]: {
                        ...state.fieldOptions[action.model],
                        [action.field]: {
                            loading: action.loading,
                        },
                    },
                },
            }
        }
        case 'TOGGLE_BUSY': {
            return {
                ...state,
                busy: !state.busy,
            }
        }
        case 'SET_DASHBOARD_STATS': {
            return {
                ...state,
                dashboardStats: action.data,
            }
        }
        case 'SET_CELL_DATA': {
            return {
                ...state,
                cellData: {
                    ...state.cellData,
                    [action.model]: action.data,
                },
            }
        }
        case 'SET_DELETE_FAILED': {
            return {
                ...state,
                deleteFailed: action.status,
            }
        }
        case 'SET_FILTERS': {
            return {
                ...state,
                filters: {
                    ...state.filters,
                    [action.model]: action.filters,
                },
            }
        }
        default:
            return state
    }
}

const selectors = {
    getItems: (state: State, model: string) => {
        if(state[model]){
            return state[model].sort((a: any, b: any) => b.id - a.id)
        }

        return state[model] || []
    },
    getLoading: (state) => state.isLoading,
    getPreset(state) {
        return state.preset
    },
    getFieldOptions: (
        state: any,
        model: string,
        field: string,
        formData: any
    ) => {
        return state.fieldOptions?.[model]?.[field] || []
    },
    getFieldLoading: (state: any, model: string, field: string) => {
        return state.fieldOptions?.[model]?.[field]?.loading || false
    },
    getModelFieldLoading: (state: any, model: string) =>
        state[model] === null && state.isLoading,
    getGgAuthData(state) {
        return state.ggAuthData
    },
    isBusy: (state) => state.busy,
    getDashboardStats: (state) => state.dashboardStats,
    getCellData: (state, model) => state.cellData?.[model] || {},
    getDeleteFailed: (state) => state.deleteFailed,
    getFilters: (state: any, model: string) => state.filters?.[model] || {},
}

export const store = createReduxStore('webba_booking/data_store', {
    reducer: reducer,
    actions,
    selectors: selectors,
    resolvers: {
        getItems:
            (
                model: string,
                filters: Record<string, string | number>[] | null
            ) =>
            async ({ dispatch }) => {
                dispatch.setLoading(true)

                try {
                    const queryParams = {
                        model,
                        filters,
                    }

                    const result = await apiFetch({
                        path: addQueryArgs(
                            `/wbkdata/v1/get-items/`,
                            queryParams
                        ),
                    })

                    dispatch.setItems(model, result)
                } catch (error) {
                    dispatch.setItems(model, [{ error }])
                } finally {
                    dispatch.setLoading(false)
                }
            },
        getPreset:
            () =>
            async ({ dispatch }) => {
                const result = await apiFetch({
                    path: `/wbk/v2/get-preset/`,
                })
                dispatch.setPreset(result)
            },
        getFieldOptions:
            (
                model: string,
                field: string,
                formData: Record<string, string>,
                isDependent: boolean = false
            ) =>
            async ({ dispatch }) => {
                if (isDependent) {
                    return
                }

                dispatch.setFieldLoading(model, field, true)

                const options = await apiFetch({
                    path: `/wbk/v2/get-field-options/`,
                    method: 'POST',
                    data: {
                        model,
                        field,
                        form: formData,
                    },
                })

                dispatch.setFieldOptions(model, field, options)
            },
        getGgAuthData:
            (calendarId: string | number) =>
            async ({ dispatch }) => {
                const result = await apiFetch({
                    path: addQueryArgs(`/wbk/v2/get-gg-auth-data/`, {
                        calendar_id: calendarId,
                    }),
                })
                dispatch.setGgAuthData(calendarId, result)
            },
        getDashboardStats:
            () =>
            async ({ dispatch }) => {
                const result = await apiFetch({
                    path: `/wbk/v2/get-dashboard-stats/`,
                })
                dispatch.setDashboardStats(result)
            },
        getCellData:
            (model) =>
            async ({ dispatch }) => {
                const result = await apiFetch({
                    path: addQueryArgs(`/wbk/v2/get-cell-detail/`, {
                        model,
                    }),
                })
                dispatch.setCellData(model, result)
            },
    },
})

register(store)

export const store_name = 'webba_booking/data_store'
export const default_state = DEFAULT_STATE
