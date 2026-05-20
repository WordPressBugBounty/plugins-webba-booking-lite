import apiFetch from '@wordpress/api-fetch'
import {
    createReduxStore,
    dispatch,
    register,
    StoreDescriptor,
} from '@wordpress/data'
import { addQueryArgs } from '@wordpress/url'
import { IFormData } from '../../frontend/screens/BookingForm/types'
import { IField } from '../../frontend/components/Form/types'
import { IPaymentMethod } from '../../frontend/components/PaymentSelector/types'
import { wbkDecodeString } from '../../frontend/lib/stringSanitizer'
import { serializePlacesForApi } from '../../frontend/providers/BookingFormProvider/utils'

interface Booking {
    id: string | number
    [key: string]: any
}

interface Preset {
    user?: string
    [key: string]: any
}

interface FormData {
    services: any[]
    offset: number | null
    date: string | null
    booking: string | number | null
    time: string | null
    [key: string]: any
    category?: number
}

interface DynamicAttributes {
    timeSlots: any
    [key: string]: any
}

interface State {
    userFutureBookings: Booking[] | null
    userPastBookings: Booking[] | null
    preset: Preset
    formData: FormData
    dynamicAttributes: DynamicAttributes
    // serviceUnavailableDates: unknown
    // serviceTimeslots: unknown
    // bookingFormFields: IField[]
    // paymentMethods: IPaymentMethod[]
    // bookingData: unknown
    unitAvailability: {
        [unitId: number]: {
            [rangeKey: string]: any
        }
    }
    unitAvailabilityDateRanges: {
        [unitId: number]: any
    }
    bookingAmounts: {
        total: number
        subtotal: number
        discount: number
        tax: number
        items: any[]
        left_to_pay: number
    }
    loading: {
        preset: boolean
        timeSlots: boolean
        serviceAvailability: { [serviceId: number]: boolean }
        serviceTimeslots: { [serviceId: number]: boolean }
        unitAvailability: { [unitId: number]: boolean }
        bookingFields: boolean
        paymentMethods: boolean
        bookingAmounts: boolean
        createBooking: boolean
        applyingCoupon: boolean
    }
    bookingDetails: { [key: string]: any }
    [key: string]: any
    timezoneData: any
}

// Helper function to get current language
const getCurrentLanguage = (): string => {
    const locale =
        (window as any)?.wp?.i18n?.getLocale?.() ||
        document.documentElement.lang ||
        'en_US'

    // Extract language code (first part before underscore or dash)
    // Handle cases: 'pl_PL' -> 'pl', 'en-US' -> 'en', 'fr' -> 'fr'
    if (locale.includes('_')) {
        return locale.split('_')[0]
    } else if (locale.includes('-')) {
        return locale.split('-')[0]
    } else {
        return locale || 'en'
    }
}

// Helper function to add language to query args
const addLangToQueryArgs = (path: string, args: Record<string, any> = {}) => {
    return addQueryArgs(path, {
        ...args,
        lang: getCurrentLanguage(),
    })
}

const normalizeUnitPeoplePayload = (
    numberOfPeople: unknown
): { adult: number; child: number; infant: number } => {
    if (typeof numberOfPeople === 'object' && numberOfPeople !== null) {
        const peopleObj = numberOfPeople as Record<string, unknown>
        return {
            adult: Math.max(0, Number(peopleObj.adult) || 0),
            child: Math.max(0, Number(peopleObj.child) || 0),
            infant: Math.max(0, Number(peopleObj.infant) || 0),
        }
    }

    const qty = Math.max(1, Number(numberOfPeople) || 1)
    return {
        adult: qty,
        child: 0,
        infant: 0,
    }
}

/**
 * Booking REST payloads use `ordered_extras` only; the `extras` array is UI state.
 */
const omitExtrasArrayForBookingApi = <T extends Record<string, unknown>>(
    payload: T
): Omit<T, 'extras'> => {
    const { extras: _omitExtrasArray, ...rest } = payload
    return rest as Omit<T, 'extras'>
}

const buildUnitBookingsPayload = (formData: IFormData) => {
    if (formData?.booking_mode !== 'units') {
        return null
    }

    const unitIdRaw = (formData as Record<string, unknown>)?.unit_id
    const unitId = Number(unitIdRaw)
    const range = (formData as Record<string, any>)?.range as
        | { start?: string; end?: string }
        | undefined

    if (!Number.isFinite(unitId) || !range?.start || !range?.end) {
        return null
    }

    let peoplePayload = (formData as Record<string, unknown>)?.number_of_people
    if (
        (peoplePayload === null ||
            peoplePayload === undefined ||
            peoplePayload === '') &&
        formData?.unit_attendees &&
        formData.unit_attendees[unitId]
    ) {
        peoplePayload = formData.unit_attendees[unitId]
    }
    if (
        (peoplePayload === null ||
            peoplePayload === undefined ||
            peoplePayload === '') &&
        formData?.unit_quantity &&
        formData.unit_quantity[unitId] != null
    ) {
        peoplePayload = formData.unit_quantity[unitId]
    }

    const numberOfPeople = normalizeUnitPeoplePayload(peoplePayload)

    return [
        {
            unit_id: unitId,
            range: {
                start: range.start,
                end: range.end,
            },
            number_of_people: numberOfPeople,
        },
    ]
}

let getPresetRequestInFlight: Promise<void> | null = null
let getPresetLoaded = false

const DEFAULT_STATE: State = {
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
    serviceUnavailableDates: {},
    serviceTimeslots: {},
    unitAvailability: {},
    unitAvailabilityDateRanges: {},
    bookingFormFields: [],
    paymentMethods: [],
    bookingData: null,
    bookingAmounts: {
        total: 0,
        subtotal: 0,
        discount: 0,
        tax: 0,
        items: [],
        left_to_pay: 0,
    },
    loading: {
        preset: true,
        timeSlots: false,
        serviceAvailability: {},
        serviceTimeslots: {},
        unitAvailability: {},
        bookingFields: false,
        paymentMethods: false,
        bookingAmounts: false,
        createBooking: false,
        applyingCoupon: false,
    },
    bookingDetails: {},
    timezoneData: null,
    stripeExecutedResult: null,
}

const actions = {
    setUserFutureBookings(bookings: Booking[]) {
        return { type: 'SET_USER_FUTURE_BOOKING', bookings }
    },
    setUserPastBookings(bookings: Booking[]) {
        return { type: 'SET_USER_PAST_BOOKING', bookings }
    },
    setPreset(preset: Preset) {
        return { type: 'SET_PRESET', preset }
    },
    setPresetLoading(loading: boolean) {
        return { type: 'SET_PRESET_LOADING', loading }
    },
    setUserName(userName: string) {
        return { type: 'SET_USER_NAME', userName }
    },
    setFormData(key: keyof FormData, value: any) {
        return { type: 'SET_FORM_DATA', key, value }
    },
    setDynamicAttribute(key: keyof DynamicAttributes, value: any) {
        return { type: 'SET_DYNAMIC_ATTRIBUTE', key, value }
    },
    setLoading(
        key: keyof State['loading'],
        value: any,
        subkey?: string | number
    ) {
        return { type: 'SET_LOADING', key, value, subkey }
    },
    fetchTimeSlots:
        () =>
        async ({ select, dispatch }: any) => {
            const queryString = new URLSearchParams(
                select.getFormData()
            ).toString()
            const response = await apiFetch({
                path: `/wbk/v2/get-time-slots/?${queryString}`,
            })
            dispatch.setDynamicAttribute(
                'timeSlots',
                (response as any).timeslots
            )
        },
    fetchServiceAvailability: (
        service_id: Number,
        start_date: string,
        end_date: string
    ) => {
        return async ({ select, dispatch }: any) => {
            try {
                dispatch.setLoading('serviceAvailability', true, service_id)

                const response = await apiFetch({
                    path: addLangToQueryArgs(
                        `webba-booking/v1/get-service-availability/`,
                        {
                            service_id,
                            start_date,
                            end_date,
                        }
                    ),
                    method: 'GET',
                })

                dispatch({
                    type: 'SET_SERVICE_AVAILABILITY',
                    data: response,
                })
            } finally {
                dispatch.setLoading('serviceAvailability', false, service_id)
            }
        }
    },
    fetchServiceTimeslots: (
        date: string,
        serviceId: number,
        offset: number,
        locationId: string | null,
        staffId: string | null,
    ) => {
        return async ({ select, dispatch }: any) => {
            dispatch.setLoading('serviceTimeslots', true, serviceId)
            try {
                const queryParams: Record<string, any> = {
                    date,
                    service_id: serviceId,
                    offset,
                }
                if (locationId != null && locationId !== '') {
                    queryParams.location_id = locationId
                }
                // Note: staff_member_id=0 means "Any Available" and returns staff_member_ids per slot.
                if (staffId != null && staffId !== '') {
                    queryParams.staff_member_id = staffId
                }
                const response = (await apiFetch({
                    path: addLangToQueryArgs(
                        `/webba-booking/v1/get-service-time-slots/`,
                        queryParams
                    ),
                    method: 'GET',
                })) as { time_slots: any }

                dispatch({
                    type: 'SET_SERVICE_TIMESLOTS',
                    date,
                    serviceId,
                    offset,
                    timeslots: response.time_slots,
                })
            } finally {
                dispatch.setLoading('serviceTimeslots', false, serviceId)
            }
        }
    },
    fetchUnitAvailabilityForRange: (
        unitId: number,
        range: { start: string; end: string },
        numberOfPeople: unknown,
        locationId: string | number | null = null
    ) => {
        return async ({ dispatch }: any) => {
            dispatch.setLoading('unitAvailability', true, unitId)
            try {
                const requestData: Record<string, unknown> = {
                    unit_id: unitId,
                    range,
                    number_of_people: normalizeUnitPeoplePayload(numberOfPeople),
                }
                if (
                    locationId !== null &&
                    locationId !== undefined &&
                    String(locationId) !== ''
                ) {
                    requestData.location_id = Number(locationId)
                }
                const response = await apiFetch({
                    path: addLangToQueryArgs(
                        `/webba-booking/v1/get-unit-availability-for-range/`
                    ),
                    method: 'POST',
                    data: requestData,
                })
                dispatch({
                    type: 'SET_UNIT_AVAILABILITY',
                    unitId,
                    range,
                    data: response,
                })
                return response
            } finally {
                dispatch.setLoading('unitAvailability', false, unitId)
            }
        }
    },
    fetchUnitAvailabilityDateRanges: (unitId: number) => {
        return async ({ dispatch }: any) => {
            const response = await apiFetch({
                path: addLangToQueryArgs(
                    `/webba-booking/v1/get-unit-availability-date-ranges/`,
                    {
                        unit_id: unitId,
                    }
                ),
                method: 'GET',
            })
            dispatch({
                type: 'SET_UNIT_AVAILABILITY_DATE_RANGES',
                unitId,
                data: response,
            })
            return response
        }
    },
    fetchClosestIntervalsForRange: (
        unitId: number,
        range: { start: string; end: string },
        numberOfPeople: unknown,
        daysToShift = 3,
        locationId: string | number | null = null
    ) => {
        return async ({ dispatch }: any) => {
            dispatch.setLoading('unitAvailability', true, unitId)
            try {
                const requestData: Record<string, unknown> = {
                    unit_id: unitId,
                    range,
                    number_of_people: normalizeUnitPeoplePayload(numberOfPeople),
                    days_to_shift: daysToShift,
                }
                if (
                    locationId !== null &&
                    locationId !== undefined &&
                    String(locationId) !== ''
                ) {
                    requestData.location_id = Number(locationId)
                }
                return await apiFetch({
                    path: addLangToQueryArgs(
                        `/webba-booking/v1/get-closest-intervals-for-range/`
                    ),
                    method: 'POST',
                    data: requestData,
                })
            } finally {
                dispatch.setLoading('unitAvailability', false, unitId)
            }
        }
    },
    fetchBookingFields: (services: number[]) => {
        return async ({ dispatch }: any) => {
            if (services.length === 0) return
            dispatch.setLoading('bookingFields', true)
            try {
                const response = await apiFetch({
                    path: addLangToQueryArgs(`webba-booking/v1/get-form-fields`, {
                        ids: services,
                    }),
                })
                dispatch({
                    type: 'SET_BOOKING_FORM_FIELDS',
                    data: response,
                })
            } finally {
                dispatch.setLoading('bookingFields', false)
            }
        }
    },
    fetchPaymentMethods: (
        payload: number[] | { ids?: number[]; unit_id?: number }
    ) => {
        return async ({ dispatch }: any) => {
            try {
                const queryArgs = Array.isArray(payload)
                    ? { ids: payload }
                    : {
                          ...(payload.ids ? { ids: payload.ids } : {}),
                          ...(payload.unit_id != null
                              ? { unit_id: payload.unit_id }
                              : {}),
                      }
                const response = await apiFetch({
                    path: addLangToQueryArgs(
                        `webba-booking/v1/get-payment-methods`,
                        queryArgs
                    ),
                })

                dispatch({
                    type: 'SET_PAYMENT_METHODS',
                    data: response,
                })
            } catch (e) {
                dispatch({
                    type: 'SET_PAYMENT_METHODS',
                    data: {
                        data: {
                            payment_methods: [],
                        },
                    },
                })
            }
        }
    },
    fetchBookingAmounts: (formData: IFormData) => {
        return async ({ dispatch }: any) => {
            dispatch.setLoading('bookingAmounts', true)
            try {
                const unitBookings = buildUnitBookingsPayload(formData)
                const orderedExtras =
                    formData?.ordered_extras &&
                    typeof formData.ordered_extras === 'object' &&
                    !Array.isArray(formData.ordered_extras)
                        ? (formData.ordered_extras as Record<string, number>)
                        : Array.isArray(formData?.extras)
                          ? formData.extras.reduce(
                                (
                                    acc: Record<string, number>,
                                    item: { id: number; quantity: number }
                                ) => {
                                    const extraId = Number(item?.id)
                                    const quantity = Math.max(
                                        1,
                                        Number(item?.quantity) || 1
                                    )
                                    if (!Number.isFinite(extraId)) {
                                        return acc
                                    }
                                    acc[String(extraId)] = quantity
                                    return acc
                                },
                                {}
                            )
                          : {}
                const formDataForApi = omitExtrasArrayForBookingApi(
                    formData as unknown as Record<string, unknown>
                ) as unknown as IFormData
                const requestPayload =
                    formData?.booking_mode === 'units'
                        ? {
                              ...formDataForApi,
                              places: {},
                              unit_bookings: unitBookings || [],
                              ordered_extras: orderedExtras,
                          }
                        : {
                              ...formDataForApi,
                              ordered_extras: orderedExtras,
                          }
                const response = await apiFetch({
                    path: 'webba-booking/v1/calculate-amounts',
                    method: 'POST',
                    data: requestPayload,
                })

                // Explicitly type response as any for conversion
                const res: any = response
                const amounts = {
                    ...res,
                    to_pay_total: parseFloat(res.to_pay_total),
                    subtotal: parseFloat(res.subtotal),
                    tax_to_pay: parseFloat(res.tax_to_pay),
                    discount: parseFloat(res.discount),
                    items: Array.isArray(res.items)
                        ? res.items.map((item: any) => ({
                              ...item,
                              price: parseFloat(item.price),
                          }))
                        : [],
                }

                dispatch({
                    type: 'SET_BOOKING_AMOUNTS',
                    data: amounts,
                })
            } finally {
                dispatch.setLoading('bookingAmounts', false)
            }
        }
    },
    setBookingAmounts: (amounts: any) => {
        return {
            type: 'SET_BOOKING_AMOUNTS',
            data: amounts,
        }
    },
    updateBooking:
        () =>
        async ({ select, dispatch }: any) => {
            const response: any = await apiFetch({
                path: `/wbk/v2/update-booking`,
                method: 'POST',
                data: select.getFormData(),
            })
            let bookings = select.getUserFutureBookings()
            const index = bookings.findIndex((booking: Booking) => {
                return Number(booking.id) === Number(response.booking.id)
            })
            if (index !== -1) {
                bookings[index] = { ...bookings[index], ...response.booking }
            }
            dispatch.setUserFutureBookings(bookings)
        },
    deleteBooking:
        () =>
        async ({ select, dispatch }: any) => {
            const response: any = await apiFetch({
                path: `/wbk/v2/delete-booking`,
                method: 'POST',
                data: select.getFormData(),
            })
            let bookings = select.getUserFutureBookings()
            const updatedBookings = bookings.filter((booking: Booking) => {
                return booking.id !== select.getFormData().booking
            })
            dispatch.setUserFutureBookings(updatedBookings)

            return response
        },
    placeBooking:
        (formData: IFormData) =>
        async ({ select, dispatch }: any) => {
            dispatch.setLoading('createBooking', true)
            try {
                const formDataModified = new FormData()

                const collectFiles = (val: unknown): File[] => {
                    if (val instanceof File) return [val]
                    if (Array.isArray(val)) {
                        return val.filter((item): item is File => item instanceof File)
                    }
                    if (val && typeof val === 'object') {
                        const obj = val as Record<string, unknown>
                        if (Array.isArray(obj.file)) {
                            return obj.file.filter((item): item is File => item instanceof File)
                        }
                        return Object.keys(obj).flatMap((k) => collectFiles(obj[k]))
                    }
                    return []
                }

                Object.keys(formData).forEach((key) => {
                    if (key === 'extras') {
                        return
                    }
                    const value = formData[key]

                    if (key === 'attachments' && value != null) {
                        const files = collectFiles(value)
                        files.forEach((file) => {
                            formDataModified.append('attachments[]', file)
                        })
                        return
                    }

                    if (key === 'places' && value && typeof value === 'object') {
                        const servicesOrder = Array.isArray(formData.services)
                            ? (formData.services as number[])
                            : []
                        formDataModified.append(
                            key,
                            serializePlacesForApi(
                                value as Record<number, unknown[]>,
                                servicesOrder
                            )
                        )
                    } else if (typeof value === 'object') {
                        formDataModified.append(key, JSON.stringify(value))
                    } else {
                        formDataModified.append(key, value as any)
                    }
                })

                // formDataModified.append('params', JSON.stringify(formData))

                const response: any = await apiFetch({
                    path: `/webba-booking/v1/create-booking`,
                    method: 'POST',
                    // data: formData,
                    // body: formDataModified,
                    body: formDataModified,
                })

                dispatch({
                    type: 'UPDATE_BOOKING_DATA',
                    data: response,
                })

                return response
            } finally {
                dispatch.setLoading('createBooking', false)
            }
        },
    setBookingData:
        (data: any) =>
        async ({ dispatch }: any) => {
            dispatch({
                type: 'UPDATE_BOOKING_DATA',
                data,
            })
        },
    submitStripePayment:
        (payment_intent_id: string, payment_method: string) =>
        async ({ dispatch }: any) => {
            const response = await apiFetch({
                path: '/webba-booking/v1/execute-stripe-payment',
                method: 'POST',
                data: { payment_intent_id, payment_method },
            })
            dispatch({
                type: 'SET_STRIPE_EXECUTED_RESULT',
                result: response,
            })
            return response
        },
    initializePaymentMethod:
        (token: string, payment_method: string) => async () => {
            const response = await apiFetch({
                path: '/webba-booking/v1/initialize-payment-method',
                method: 'POST',
                data: { token, payment_method },
            })
            return response
        },
    fetchBookingDetails: (
        token: string,
        token_type: 'customer_token' | 'admin_token'
    ) => {
        return async ({ dispatch }: any) => {
            const response = await apiFetch({
                path: addLangToQueryArgs(
                    `/webba-booking/v1/get-booking-ids-by-token`,
                    {
                        token,
                        token_type,
                    }
                ),
            })
            dispatch({
                type: 'SET_BOOKING_DETAILS',
                token,
                token_type,
                data: response,
            })
            return response
        }
    },
    setTimezoneData: (timezoneData: any) => {
        return async ({ dispatch }: any) => {
            dispatch({
                type: 'SET_TIMEZONE_DATA',
                data: timezoneData,
            })
        }
    },
}

export const store: StoreDescriptor = createReduxStore(
    'webba_booking/frontend_store',
    {
        reducer(state: State = DEFAULT_STATE, action: any): State {
            switch (action.type) {
                case 'SET_USER_FUTURE_BOOKING':
                    return { ...state, userFutureBookings: action.bookings }
                case 'SET_USER_PAST_BOOKING':
                    return { ...state, userPastBookings: action.bookings }
                case 'SET_PRESET':
                    return { ...state, preset: action.preset }
                case 'SET_PRESET_LOADING':
                    return {
                        ...state,
                        loading: { ...state.loading, preset: action.loading },
                    }
                case 'SET_USER_NAME':
                    return {
                        ...state,
                        preset: { ...state.preset, user: action.userName },
                    }
                case 'SET_FORM_DATA':
                    return {
                        ...state,
                        formData: {
                            ...state.formData,
                            [action.key]: action.value,
                        },
                    }
                case 'SET_DYNAMIC_ATTRIBUTE':
                    return {
                        ...state,
                        dynamicAttributes: {
                            ...state.dynamicAttributes,
                            [action.key]: action.value,
                        },
                    }
                case 'SET_SERVICE_TIMESLOTS':
                    return {
                        ...state,
                        serviceTimeslots: {
                            ...state.serviceTimeslots,
                            [action.serviceId]: {
                                ...state.serviceTimeslots[action.serviceId],
                                [action.date]: action.timeslots,
                            },
                        },
                    }
                case 'SET_SERVICE_AVAILABILITY':
                    return {
                        ...state,
                        serviceUnavailableDates: {
                            ...state.serviceUnavailableDates,
                            [action.data.service_id]: {
                                ...(state.serviceUnavailableDates[
                                    action.data.service_id
                                ] || {}),
                                [action.data.start_date]: action.data.dates,
                            },
                        },
                    }
                case 'SET_UNIT_AVAILABILITY': {
                    const rangeKey = `${action.range?.start || ''}_${action.range?.end || ''}`
                    return {
                        ...state,
                        unitAvailability: {
                            ...state.unitAvailability,
                            [action.unitId]: {
                                ...(state.unitAvailability?.[action.unitId] || {}),
                                [rangeKey]: action.data,
                            },
                        },
                    }
                }
                case 'SET_UNIT_AVAILABILITY_DATE_RANGES':
                    return {
                        ...state,
                        unitAvailabilityDateRanges: {
                            ...state.unitAvailabilityDateRanges,
                            [action.unitId]: action.data,
                        },
                    }
                case 'SET_BOOKING_FORM_FIELDS':
                    return {
                        ...state,
                        bookingFormFields: action.data?.data?.form_fields || [],
                    }
                case 'SET_PAYMENT_METHODS':
                    return {
                        ...state,
                        paymentMethods:
                            action.data?.data?.payment_methods || [],
                    }
                case 'UPDATE_BOOKING_DATA':
                    return {
                        ...state,
                        bookingData: action.data,
                    }
                case 'SET_BOOKING_AMOUNTS':
                    return {
                        ...state,
                        bookingAmounts: action.data,
                    }
                case 'SET_LOADING': {
                    if (action.subkey !== undefined) {
                        return {
                            ...state,
                            loading: {
                                ...state.loading,
                                [action.key]: {
                                    ...((state.loading[
                                        action.key as keyof State['loading']
                                    ] as any) || {}),
                                    [action.subkey]: action.value,
                                },
                            },
                        }
                    } else {
                        return {
                            ...state,
                            loading: {
                                ...state.loading,
                                [action.key]: action.value,
                            },
                        }
                    }
                }
                case 'SET_BOOKING_DETAILS':
                    return {
                        ...state,
                        bookingDetails: {
                            ...state.bookingDetails,
                            [`${action.token_type}:${action.token}`]:
                                action.data,
                        },
                    }
                case 'SET_TIMEZONE_DATA':
                    return {
                        ...state,
                        timezoneData: {
                            ...state.timezoneData,
                            ...action.data,
                        },
                    }
                case 'SET_STRIPE_EXECUTED_RESULT':
                    return {
                        ...state,
                        stripeExecutedResult: action.result,
                    }
                default:
                    return state
            }
        },
        actions,
        selectors: {
            getUserFutureBookings(state: State) {
                return state.userFutureBookings
            },
            getUserPastBookings(state: State) {
                return state.userPastBookings
            },
            getPreset(state: State) {
                return state.preset
            },
            getFormData(state: State) {
                return state.formData
            },
            getDynamicAttributes(state: State) {
                return state.dynamicAttributes
            },
            getSelectedDate(state: State) {
                return state.formData.date
            },
            getStripeExecutedResult(state: State) {
                return state.stripeExecutedResult
            },
            getNextStep(state: State) {},
            getServiceAvailability(
                state: State,
                service_id: number,
                start_date: string,
                location_id: number | null,
                staff_member_id: string | null
            ) {
                return state.serviceUnavailableDates &&
                    state.serviceUnavailableDates[service_id] &&
                    state.serviceUnavailableDates[service_id][start_date]
                    ? state.serviceUnavailableDates[service_id][start_date]
                    : []
            },
            getServiceTimeslots(state: State, serviceId: number, date: string) {
                return state.serviceTimeslots &&
                    state.serviceTimeslots[serviceId] &&
                    state.serviceTimeslots[serviceId][date]
                    ? state.serviceTimeslots[serviceId][date]
                    : []
            },
            getUnitAvailability(
                state: State,
                unitId: number,
                rangeStart: string,
                rangeEnd: string
            ) {
                const rangeKey = `${rangeStart || ''}_${rangeEnd || ''}`
                return state.unitAvailability &&
                    state.unitAvailability[unitId] &&
                    state.unitAvailability[unitId][rangeKey]
                    ? state.unitAvailability[unitId][rangeKey]
                    : null
            },
            getUnitAvailabilityDateRanges(state: State, unitId: number) {
                return state.unitAvailabilityDateRanges &&
                    state.unitAvailabilityDateRanges[unitId]
                    ? state.unitAvailabilityDateRanges[unitId]
                    : null
            },
            getBookingFields(state: State) {
                return state.bookingFormFields
            },
            getPaymentMethods(state: State) {
                return state.paymentMethods
            },
            getBookingData(state: State) {
                return state.bookingData
            },
            getBookingAmounts(state: State) {
                return state.bookingAmounts
            },
            getLoading(state: State) {
                return state.loading
            },
            getBookingDetails: (
                state: State,
                token: string,
                token_type: string
            ) => {
                return state.bookingDetails?.[`${token_type}:${token}`]
            },
            getTimezoneData(state: State) {
                return state.timezoneData
            },
        },
        resolvers: {
            getUserFutureBookings:
                () =>
                async ({ dispatch }: any) => {
                    const result: any = await apiFetch({
                        path: addLangToQueryArgs(`/wbk/v2/get-user-bookings/`),
                    })
                    dispatch.setUserFutureBookings(result.bookings)
                },
            getUserPastBookings:
                () =>
                async ({ dispatch }: any) => {
                    const result: any = await apiFetch({
                        path: addLangToQueryArgs(`/wbk/v2/get-user-bookings/`, {
                            pastBookings: 'true',
                        }),
                    })
                    dispatch.setUserPastBookings(result.bookings)
                },
            getPreset:
                () =>
                async ({ dispatch }: any) => {
                    if (getPresetLoaded) return
                    if (getPresetRequestInFlight) {
                        await getPresetRequestInFlight
                        return
                    }
                    dispatch.setPresetLoading(true)
                    const requestPromise = (async () => {
                        try {
                            const result: any = await apiFetch({
                                path: addLangToQueryArgs(`/wbk/v2/get-preset/`),
                            })
                            dispatch.setPreset({
                                ...result,
                                wording: Object.keys(result.wording).reduce(
                                    (obj: any, key: string) => {
                                        obj[key] = wbkDecodeString(
                                            result.wording[key]
                                        )
                                        return obj
                                    },
                                    {}
                                ),
                            })
                            getPresetLoaded = true
                        } finally {
                            dispatch.setPresetLoading(false)
                            getPresetRequestInFlight = null
                        }
                    })()
                    getPresetRequestInFlight = requestPromise
                    await requestPromise
                },
            getServiceAvailability:
                (service_id: Number, start_date: string, end_date: string, location_id: number | null, staff_member_id: string | null) =>
                async ({ dispatch }: any) => {
                    dispatch.setLoading('serviceAvailability', true, service_id)
                    try {
                        const queryParams: Record<string, any> = {
                            service_id,
                            start_date,
                            end_date,
                        }
                        if (location_id != null) {
                            queryParams.location_id = location_id
                        }
                        // Note: staff_member_id=0 means "Any Available" and returns staff_member_ids per slot.
                        if (staff_member_id != null && staff_member_id !== '') {
                            queryParams.staff_member_id = staff_member_id
                        }
                        const response = (await apiFetch({
                            path: addLangToQueryArgs(
                                `webba-booking/v1/get-service-availability/`,
                                queryParams
                            ),
                            method: 'GET',
                        })) as { dates: any }

                        dispatch({
                            type: 'SET_SERVICE_AVAILABILITY',
                            data: response,
                        })

                        return response?.dates || []
                    } finally {
                        dispatch.setLoading(
                            'serviceAvailability',
                            false,
                            service_id
                        )
                    }
                },
            getBookingDetails: (
                token: string,
                token_type: 'customer_token' | 'admin_token'
            ) => {
                return async ({ dispatch }: any) => {
                    const response = await apiFetch({
                        path: addLangToQueryArgs(
                            `/webba-booking/v1/get-booking-ids-by-token`,
                            {
                                token,
                                token_type,
                            }
                        ),
                    })

                    dispatch({
                        type: 'SET_BOOKING_DETAILS',
                        data: response,
                    })
                }
            },
            getTimezoneData: () => {
                return async ({ dispatch }: any) => {
                    const response = await apiFetch({
                        path: addLangToQueryArgs(
                            `/webba-booking/v1/get-timezones`
                        ),
                        method: 'GET',
                    })

                    dispatch({
                        type: 'SET_TIMEZONE_DATA',
                        data: response,
                    })
                }
            },
        },
    }
)

register(store)

export const store_name = 'webba_booking/frontend_store'
export const default_state = DEFAULT_STATE
export type { State }
