import apiFetch from '@wordpress/api-fetch'
import { createReduxStore, register } from '@wordpress/data'
import { useLocale } from '../../frontend/hooks/useLocale'
import { addQueryArgs } from '@wordpress/url';

const { lang } = useLocale();

const DEFAULT_STATE = {
    userFutureBookings: null,
    userPastBookings: null,
    preset: {},
    formData: {
        services: [],
        offset: null,
        date: null,
        booking: null,
        time: null,
    },
    dynamicAttributes: {
        timeSlots: null,
    },
}

const actions = {
    setUserFutureBookings(bookings) {
        return {
            type: 'SET_USER_FUTURE_BOOKING',
            bookings,
        }
    },
    setUserPastBookings(bookings) {
        return {
            type: 'SET_USER_PAST_BOOKING',
            bookings,
        }
    },
    setPreset(preset) {
        return {
            type: 'SET_PRESET',
            preset,
        }
    },
    setUserName(userName) {
        return {
            type: 'SET_USER_NAME',
            userName,
        }
    },
    setFormData(key, value) {
        return {
            type: 'SET_FORM_DATA',
            key,
            value,
        }
    },
    setDynamicAttribute(key, value) {
        return {
            type: 'SET_DYNAMIC_ATTRIBUTE',
            key,
            value,
        }
    },
    fetchTimeSlots:
        () =>
            async ({ select, dispatch }) => {
                const queryString = new URLSearchParams(
                    select.getFormData()
                ).toString()
                const response = await apiFetch({
                    path: `/wbk/v2/get-time-slots/?${queryString}`,
                })

                dispatch.setDynamicAttribute('timeSlots', response.timeslots)
            },
    updateBooking:
        () =>
            async ({ select, dispatch }) => {
                const response = await apiFetch({
                    path: `/wbk/v2/update-booking`,
                    method: 'POST',
                    data: select.getFormData(),
                })
                let bookings = select.getUserFutureBookings()
                const index = bookings.findIndex((booking) => {
                    if (!Number.isInteger(Number(booking.id))) {
                        return false
                    }
                    return booking.id === response.booking.id
                })
                if (index !== -1) {
                    bookings[index] = {
                        ...bookings[index],
                        ...response.booking,
                    }
                }
                dispatch.setUserFutureBookings(bookings)
            },
    deleteBooking:
        () =>
            async ({ select, dispatch }) => {
                const response = await apiFetch({
                    path: `/wbk/v2/delete-booking`,
                    method: 'POST',
                    data: select.getFormData(),
                })
                let bookings = select.getUserFutureBookings()
                const updatedBookings = bookings.filter(
                    (booking) => booking.id !== select.getFormData().booking
                )
                dispatch.setUserFutureBookings(updatedBookings)
            },
}
const store = createReduxStore('webba_booking/frontend_store', {
    reducer(state = DEFAULT_STATE, action) {
        switch (action.type) {
            case 'SET_USER_FUTURE_BOOKING':
                return {
                    ...state,
                    userFutureBookings: action.bookings,
                }
            case 'SET_USER_PAST_BOOKING':
                return {
                    ...state,
                    userPastBookings: action.bookings,
                }
            case 'SET_PRESET':
                return {
                    ...state,
                    preset: action.preset,
                }
            case 'SET_USER_NAME':
                return {
                    ...state,
                    preset: {
                        ...state.preset,
                        user: action.userName,
                    },
                }
            case 'SET_FORM_DATA':
                return {
                    ...state,
                    formData: { ...state.formData, [action.key]: action.value },
                }
            case 'SET_DYNAMIC_ATTRIBUTE':
                return {
                    ...state,
                    dynamicAttributes: {
                        ...state.dynamicAttributes,
                        [action.key]: action.value,
                    },
                }
        }
        return state
    },
    actions,
    selectors: {
        getUserFutureBookings(state) {
            return state.userFutureBookings
        },
        getUserPastBookings(state) {
            return state.userPastBookings
        },
        getPreset(state) {
            return state.preset
        },
        getFormData(state) {
            return state.formData
        },
        getDynamicAttributes(state) {
            return state.dynamicAttributes
        },
        getSelectedDate(state) {
            return state.seletedDate
        },
    },

    resolvers: {
        getUserFutureBookings:
            () =>
                async ({ dispatch }) => {
                    const result = await apiFetch({
                        path: addQueryArgs(`/wbk/v2/get-user-bookings/`, {
                            lang,
                        }),
                    })
                    dispatch.setUserFutureBookings(result.bookings)
                },
        getUserPastBookings:
            () =>
                async ({ dispatch }) => {
                    const params = {
                        pastBookings: true,
                        lang
                    }
                    const queryString = new URLSearchParams(params).toString()
                    const result = await apiFetch({
                        path: `/wbk/v2/get-user-bookings/?${queryString}`,
                    })
                    dispatch.setUserPastBookings(result.bookings)
                },
        getPreset:
            () =>
                async ({ dispatch }) => {
                    const result = await apiFetch({
                        path: `/wbk/v2/get-preset/`,
                    })
                    dispatch.setPreset(result)
                },
    },
})

register(store)

export const store_name = 'webba_booking/frontend_store'
export const default_state = DEFAULT_STATE
