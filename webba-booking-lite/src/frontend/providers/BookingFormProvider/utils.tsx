import {
    endOfMonth,
    endOfWeek,
    getUnixTime,
    startOfMonth,
    startOfWeek,
} from 'date-fns'
import { IOption, TAcceptedInputValues } from '../../components/Form/types'
import {
    IFormPlace,
    IServiceProps,
    IUnitProps,
} from '../../components/Services/types'
import { wbkFormat, wbkGetTimezoneOffset } from '../../../admin/components/Form/utils/dateTime'
import { IBookingFormObj } from './types'

export const defautlFields = [
    'first_name',
    'last_name',
    'email',
    'phone',
    'description',
]

export const getSelectedServicesValue = (services: IServiceProps[]) => {
    return services
        .filter((service) => service.selected)
        .map((service) => {
            const { id, places } = service
            return { id, places }
        })
}

export const getMonthRange = (date: Date) => [
    startOfWeek(startOfMonth(date)),
    endOfWeek(endOfMonth(date)),
]

export const wbkBackendDate = (date: Date) =>
    wbkFormat(getUnixTime(date), 'YYYY-m-d')

export const wbkExtractBackendDate = (date: string) => {
    const [year, month, day] = date.split(',').map(Number)
    return new Date(year, month, day)
}

export const wbkFormatPrice = (price: number | string, placeholder: string) => {
    const priceNum = typeof price === 'string' ? parseFloat(price) : price
    const formattedPrice = priceNum.toFixed(2)
    return placeholder.replace('#price', formattedPrice)
}

const serviceHasStaffMembers = (
    staffMembers: { services?: string[] }[] | undefined,
    serviceId: number
) =>
    Array.isArray(staffMembers) &&
    staffMembers.some(
        (s) =>
            s.services &&
            Array.isArray(s.services) &&
            s.services.includes(String(serviceId))
    )

export const buildServicesSlotIds = (selectedServices: IServiceProps[]) =>
    selectedServices.flatMap(({ id, places }) =>
        places && places.length > 0 ? Array(places.length).fill(id) : [id]
    )

/**
 * JSON.stringify reorders numeric object keys; build places JSON in services order instead.
 */
export const serializePlacesForApi = (
    places: Record<number, IFormPlace[]>,
    servicesSlotOrder: number[]
): string => {
    const orderedServiceIds: number[] = []
    const seen = new Set<number>()

    for (const serviceId of servicesSlotOrder) {
        if (seen.has(serviceId) || !places[serviceId]?.length) {
            continue
        }
        seen.add(serviceId)
        orderedServiceIds.push(serviceId)
    }

    const parts = orderedServiceIds.map(
        (id) => `${JSON.stringify(String(id))}:${JSON.stringify(places[id])}`
    )
    return `{${parts.join(',')}}`
}

const mapServicePlacesToFormSlots = (
    service: IServiceProps,
    staffByService: Record<string, string | null>,
    staffMembers: { services?: string[] }[] | undefined,
    locationId: unknown
): IFormPlace[] | null => {
    const { id, places, quantity } = service
    if (!places || places.length === 0) {
        return null
    }

    const staffId = staffByService[String(id)] ?? null
    const hasStaffValue = staffId != null && staffId !== ''
    const includeStaff = serviceHasStaffMembers(staffMembers, id) && hasStaffValue

    return places.map(({ timeslot, date, day, staff_member_id }) => {
        const placeStaffId =
            staff_member_id != null && staff_member_id !== ''
                ? staff_member_id
                : staffId
        return {
            date,
            time: timeslot,
            day: day,
            quantity,
            ...(locationId != null ? { location_id: locationId } : {}),
            ...(includeStaff && placeStaffId != null
                ? { staff_member_id: placeStaffId }
                : {}),
        }
    })
}

export const constructFormData = (formObj: IBookingFormObj) => {
    const { fields, services, units, formData, userTimezone, preset, bookingMode } =
        formObj
    const orderedExtras = Array.isArray((formData as Record<string, unknown>)?.extras)
        ? ((formData as Record<string, unknown>).extras as Array<{
              id: number
              quantity: number
          }>).reduce(
              (acc: Record<string, number>, item) => {
                  const extraId = Number(item?.id)
                  const quantity = Math.max(1, Number(item?.quantity) || 1)
                  if (!Number.isFinite(extraId)) {
                      return acc
                  }
                  acc[String(extraId)] = quantity
                  return acc
              },
              {}
          )
        : {}

    const staffByService =
        (typeof formData.staff === 'object' && formData.staff !== null
            ? formData.staff
            : {}) as Record<string, string | null>

    const staffMembers = preset?.staff_members as { services?: string[] }[] | undefined
    const selectedServices = services.filter((service) => service.selected)
    const selectedUnits = (units || []).filter((unit) => unit.selected)

    const payloadStaff = selectedServices.reduce(
        (acc: Record<string, string>, service) => {
            if (!serviceHasStaffMembers(staffMembers, service.id)) return acc
            const key = String(service.id)
            const value = staffByService[key]
            if (value === undefined || value === null || String(value) === '') {
                return acc
            }
            acc[key] = String(value)
            return acc
        },
        {}
    )

    const formPlaces: Record<number, IFormPlace[]> = {}
    const servicesSlotIds =
        bookingMode === 'services' ? buildServicesSlotIds(selectedServices) : []

    if (bookingMode === 'services') {
        selectedServices.forEach((service) => {
            const mappedPlaces = mapServicePlacesToFormSlots(
                service,
                staffByService,
                staffMembers,
                formData?.location
            )
            if (mappedPlaces) {
                formPlaces[service.id] = mappedPlaces
            }
        })
    }

    const fieldValues = fields.reduce(
        (
            acc: Record<
                string,
                TAcceptedInputValues | Record<string, TAcceptedInputValues>
            >,
            field
        ) => {
            const { slug, value, type, placeholder, checkboxText } = field

            if (defautlFields.includes(slug)) {
                acc[slug] = value
            } else if (type === 'file') {
                acc['attachments'] = {
                    ...((acc['attachments'] || {}) as Record<
                        string,
                        TAcceptedInputValues
                    >),
                    [slug]: value,
                }
            } else {
                acc['extra'] = {
                    ...((acc['extra'] || {}) as Record<
                        string,
                        TAcceptedInputValues
                    >),
                    [slug]: wbkCreateExtraFieldValue(
                        slug,
                        type === 'checkbox' && checkboxText
                            ? checkboxText
                            : placeholder || '',
                        type === 'dropdown' && Array.isArray(value)
                            ? (value as IOption[])
                                .map((item) => item.value)
                                .join(',')
                            : type === 'dropdown' && !Array.isArray(value)
                                ? (value as IOption)?.value
                                : value
                    ),
                }
            }

            return acc
        },
        {}
    )

    const { staff: _staffOmitted, ...formDataWithoutStaff } =
        formData as Record<string, unknown>

    const serializedExtra =
        (fieldValues?.extra &&
            JSON.stringify(
                Object.values(fieldValues?.extra).map((fieldJSON) =>
                    JSON.parse(fieldJSON)
                )
            )) ||
        ''

    if (bookingMode === 'units') {
        const selectedUnit = selectedUnits[0] as IUnitProps | undefined
        const unitRange =
            (formData as Record<string, any>)?.range ||
            (formData as Record<string, any>)?.unit_range ||
            null
        const payment_method =
            (formData as Record<string, any>)?.payment_method ?? ('' as any)
        const coupon = (formData as Record<string, any>)?.coupon ?? ''
        const attachments =
            (formData as Record<string, any>)?.attachments ?? []

        const unitPeoplePayload = (() => {
            const attendees = selectedUnit?.attendees
            const totalAttendees =
                attendees != null
                    ? Number(attendees.adult || 0) +
                      Number(attendees.child || 0) +
                      Number(attendees.infant || 0)
                    : 0
            if (totalAttendees > 0) {
                return attendees
            }
            const qty = Math.max(1, Number(selectedUnit?.quantity) || 1)
            return qty
        })()

        const existingUnitPlaces = (formData as Record<string, any>)?.places as
            | Record<number, IFormPlace[]>
            | undefined

        return {
            ...formDataWithoutStaff,
            ...fieldValues,
            booking_mode: 'units' as const,
            extra: serializedExtra as any,
            ordered_extras: orderedExtras,
            places:
                existingUnitPlaces && Object.keys(existingUnitPlaces).length > 0
                    ? existingUnitPlaces
                    : {},
            services: [],
            units: selectedUnits.map((unit) => unit.id),
            unit_id: selectedUnit?.id || null,
            range: unitRange,
            number_of_people: unitPeoplePayload,
            payment_method,
            coupon,
            attachments,
            unit_quantity: selectedUnits.reduce(
                (acc: Record<number, number>, unit) => ({
                    ...acc,
                    [unit.id]: Math.max(1, Number(unit.quantity) || 1),
                }),
                {}
            ),
            unit_attendees: selectedUnits.reduce(
                (
                    acc: Record<number, { adult: number; child: number; infant: number }>,
                    unit
                ) => ({
                    ...acc,
                    [unit.id]: unit.attendees || {
                        adult: 0,
                        child: 0,
                        infant: 0,
                    },
                }),
                {}
            ),
            offset: wbkGetTimezoneOffset(formObj.userTimezone),
            time_zone_client: userTimezone,
            locale: document.documentElement.getAttribute('lang') || 'en-US',
        }
    }

    const payment_method =
        (formData as Record<string, any>)?.payment_method ?? ('' as any)
    const coupon = (formData as Record<string, any>)?.coupon ?? ''
    const attachments = (formData as Record<string, any>)?.attachments ?? []

    return {
        ...formDataWithoutStaff,
        ...(Object.keys(payloadStaff).length > 0 ? { staff: payloadStaff } : {}),
        ...fieldValues,
        extra: serializedExtra as any,
        ordered_extras: orderedExtras,
        places: formPlaces,
        services: servicesSlotIds,
        payment_method,
        coupon,
        attachments,
        offset: wbkGetTimezoneOffset(formObj.userTimezone),
        time_zone_client: userTimezone,
        locale: document.documentElement.getAttribute('lang') || 'en-US',
    }
}

export const wbkCalculateAmount = ({
    quantity,
    price,
    places,
}: IServiceProps) =>
    Number(price) * Number(quantity) * Number(places?.length || 1)

export const wbkCreateExtraFieldValue = (
    slug: string,
    label: string,
    value: TAcceptedInputValues
) => {
    return JSON.stringify([slug, label, value])
}

export const extractFormValue = ({ fieldName, formData }: any) => {
    if (defautlFields.includes(fieldName)) return formData[fieldName]

    if (formData.extra === '') return null

    const extractedExtra = JSON.parse(formData.extra)

    if (!extractedExtra) return null

    const fieldVal = extractedExtra.find(
        (field: string[]) => field[0] === fieldName
    )

    if (!fieldVal) return null

    const [slug, label, value] = fieldVal

    return value
}
