import { ICategory } from '../../components/Categories/types'
import { IExtraProps } from '../../components/Extras/types'
import { IFieldConfig } from '../../components/Form/types'
import { IPaymentMethod } from '../../components/PaymentSelector/types'
import { IServiceProps, IUnitProps } from '../../components/Services/types'
import { IStripeObj } from '../../screens/BookingForm/PaymentHandler/payments/Stripe/types'
import { IAmountData, IFormData } from '../../screens/BookingForm/types'

export interface IBookingFormObj {
    categories: ICategory[]
    services: IServiceProps[]
    extras: IExtraProps[]
    units: IUnitProps[]
    bookingMode: 'services' | 'units'
    preset: any
    attrService: unknown
    attrCategory: unknown
    attrLocation: unknown
    attrStaff?: unknown
    attrUnits?: unknown
    dateFormat: string
    timeFormat: string
    priceFormat: string
    timezone: string
    userTimezone: string
    fields: IFieldConfig[]
    formData: IFormData
    paymentMethods: IPaymentMethod[]
    amountData: IAmountData
    colors: Record<'primary' | 'secondary', Record<any, string> | any >
    extractedAttrCats: number[]
    extractedAttrLocations: string[]
    extractedAttrStaff: string[]
    stripeObj: IStripeObj
    disableCustomScroll: boolean
    attrHideCategory: 'yes' | 'no'
}

export interface IBookingFormContext extends IBookingFormObj {
    setFormData: (slug: string, value: any) => void
    mergeFormData: (patch: Partial<IFormData>) => void
    setFormObj: (key: string, value: any) => void
    setFields: (fields: IFieldConfig[]) => void
    onLocationSelect: (id: string | number) => void
    onStaffSelect: (serviceIdOrIds: number | number[], staffId: string | null) => void
    loading: {
        timeSlots: boolean
        serviceAvailability: { [serviceId: number]: boolean }
        serviceTimeslots: { [serviceId: number]: boolean }
        unitAvailability: { [unitId: number]: boolean }
        bookingFields: boolean
        paymentMethods: boolean
        bookingAmounts: boolean
        createBooking: boolean
        [key: string]: any
    }
}

export interface IBookingFormProviderProps {
    attrService: unknown
    attrCategory: unknown
    attrLocation?: unknown
    attrStaff?: unknown
    attrUnits?: unknown
    attrHideCategory?: 'yes' | 'no'
    preset?: any // Optional preset prop, type can be refined later
    disableCustomScroll?: boolean
}
