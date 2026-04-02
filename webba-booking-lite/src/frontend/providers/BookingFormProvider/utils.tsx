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

export const constructFormData = (formObj: IBookingFormObj) => {
    const { fields, services, formData, userTimezone, preset } = formObj

    const staffByService =
        (typeof formData.staff === 'object' && formData.staff !== null
            ? formData.staff
            : {}) as Record<string, string | null>

    const staffMembers = preset?.staff_members as { services?: string[] }[] | undefined
    const selectedServices = services.filter((service) => service.selected)

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
    services
        .filter((service) => service.selected)
        .forEach(({ id, places, quantity }) => {
            if (!places || places.length === 0) return

            const staffId = staffByService[String(id)] ?? null
            const hasStaffValue = staffId != null && staffId !== ''
            const includeStaff =
                serviceHasStaffMembers(staffMembers, id) && hasStaffValue
            formPlaces[id] = places.map(
                ({ timeslot, date, day, staff_member_id }) => {
                    const placeStaffId =
                        staff_member_id != null &&
                        staff_member_id !== ''
                            ? staff_member_id
                            : staffId
                    return {
                        date,
                        time: timeslot,
                        day: day,
                        quantity,
                        ...(formData?.location != null
                            ? { location_id: formData.location }
                            : {}),
                        ...(includeStaff && placeStaffId != null
                            ? { staff_member_id: placeStaffId }
                            : {}),
                    }
                }
            )
        })

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

    return {
        ...formDataWithoutStaff,
        ...(Object.keys(payloadStaff).length > 0 ? { staff: payloadStaff } : {}),
        ...fieldValues,
        extra:
            (fieldValues?.extra &&
                JSON.stringify(
                    Object.values(fieldValues?.extra).map((fieldJSON) =>
                        JSON.parse(fieldJSON)
                    )
                )) ||
            '',
        places: formPlaces,
        services: selectedServices
            .flatMap(({ id, places }) =>
                places && places.length > 0
                    ? Array(places.length).fill(id)
                    : [id]
            ),
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
