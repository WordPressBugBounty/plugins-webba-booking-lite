import {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react'
import {
    IBookingFormContext,
    IBookingFormObj,
    IBookingFormProviderProps,
} from './types'
import { useSelect } from '@wordpress/data'
import { store, store_name } from '../../../store/frontend'
import { IServiceProps } from '../../components/Services/types'
import { IFormData } from '../../screens/BookingForm/types'
import { ICategory } from '../../components/Categories/types'
import { IFieldConstructor } from '../../components/Form/types'
import { constructFormData } from './utils'
import { generateColorShades } from '../../lib/colorShades'

export const BookingContext = createContext<IBookingFormContext | null>(null)

export const useBookingContext = () => {
    const context = useContext(BookingContext)

    if (!context) {
        throw new Error(
            'useBookingContext must be used within a BookingContextProvider'
        )
    }

    return { ...context } as IBookingFormContext
}

export const BookingFormProvider = ({
    attrService,
    attrCategory,
    attrLocation,
    attrStaff,
    preset: customPreset,
    children,
}: PropsWithChildren<IBookingFormProviderProps>) => {
    // Separate customPreset logic from useSelect
    const storePreset = useSelect(
        (select: any) => select(store_name).getPreset(),
        []
    )

    const preset = customPreset || storePreset

    const {
        services: allServices = [],
        categories: allCategories = [],
        settings = {},
        appearance = [],
    } = preset || {}

    const {
        date_format = 'F j, Y',
        time_format = 'g:i a',
        timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
        price_format = '$#price',
    } = settings

    const extractedAttrCats =
        attrCategory && String(attrCategory).length > 0 && attrCategory !== '0'
            ? String(attrCategory)
                  .split(',')
                  .map((cat) => Number(cat))
            : []

    const extractedAttrLocations =
        attrLocation && String(attrLocation).length > 0 && attrLocation !== '0'
            ? String(attrLocation)
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
            : []

    const extractedAttrStaff =
        attrStaff && String(attrStaff).length > 0 && attrStaff !== '0'
            ? String(attrStaff)
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
            : []

    const [formObj, setFormObj] = useState<IBookingFormObj>({
        categories: [] as ICategory[],
        services: [] as IServiceProps[],
        preset: {},
        attrService: null,
        attrCategory: null,
        attrLocation: null,
        extractedAttrCats: [],
        extractedAttrLocations: [],
        extractedAttrStaff: [],
        formData: {} as IFormData,
        dateFormat: 'F j, Y',
        timeFormat: 'g:i a',
        priceFormat: '$#price',
        fields: [] as IFieldConstructor[],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        paymentMethods: [],
        amountData: {
            total: 0,
            tax: 0,
            discount: 0,
            subtotal: 0,
            items: [],
        },
        colors: {
            primary: {},
            secondary: {},
        },
    })

    const onCategorySelect = useCallback((id: number) => {
        setFormObj((prev) => {
            return {
                ...prev,
                formData: {
                    ...prev.formData,
                    category: id,
                },
                categories: prev.categories.map((category: any) => {
                    if (category.id === id) {
                        return {
                            ...category,
                            selected: !category.selected,
                        }
                    }

                    return {
                        ...category,
                        selected: false,
                    }
                }),
            }
        })
    }, [])

    const onServiceUpdate = useCallback(
        (id: number, serviceProps: Partial<IServiceProps>) => {
            setFormObj((prev) => {
                const updatedServices = prev.services.map((service: any) => {
                    if (service.id === id) {
                        if ('selected' in serviceProps) {
                            const isSelecting = serviceProps.selected === true
                            return {
                                ...service,
                                ...serviceProps,
                                selectedAt: isSelecting
                                    ? service.selectedAt || Date.now()
                                    : null,
                                places: isSelecting ? service.places : [],
                            }
                        }
                        return {
                            ...service,
                            ...serviceProps,
                        }
                    }
                    return {
                        ...service,
                        selected:
                            preset?.settings
                                ?.allowed_multiple_service_selection === false
                                ? false
                                : service.selected,
                    }
                })
                const prevStaff =
                    typeof prev.formData.staff === 'object' &&
                    prev.formData.staff !== null
                        ? (prev.formData.staff as Record<string, string | null>)
                        : {}
                const nextStaff: Record<string, string> = {}
                updatedServices
                    .filter((service: IServiceProps) => service.selected)
                    .forEach((service: IServiceProps) => {
                        const serviceKey = String(service.id)
                        const placeStaffIds = (service.places || [])
                            .map((place) => place.staff_member_id)
                            .filter(
                                (sid): sid is string =>
                                    sid != null &&
                                    String(sid) !== '' &&
                                    String(sid) !== '0'
                            )
                        if (placeStaffIds.length > 0) {
                            nextStaff[serviceKey] = String(placeStaffIds[0])
                            return
                        }
                        if (
                            service.staffId != null &&
                            String(service.staffId) !== ''
                        ) {
                            nextStaff[serviceKey] = String(service.staffId)
                            return
                        }
                        if (
                            prevStaff[serviceKey] != null &&
                            String(prevStaff[serviceKey]) !== ''
                        ) {
                            nextStaff[serviceKey] = String(prevStaff[serviceKey])
                            return
                        }
                        nextStaff[serviceKey] = '0'
                    })

                return {
                    ...prev,
                    services: updatedServices,
                    formData: {
                        ...prev.formData,
                        staff: nextStaff,
                        services: updatedServices
                            .filter(
                                (service: IServiceProps) => service.selected
                            )
                            .map((service: IServiceProps) => service.id),
                    },
                }
            })
        },
        [preset]
    )

    useEffect(() => {
        if (!allServices || !allCategories) return

        setFormObj((prev) => {
            const prevServiceIds = (prev.services || [])
                .map((s: any) => s.id)
                .join(',')
            const newServiceIds = allServices.map((s: any) => s.id).join(',')

            const prevCategoryIds = (prev.categories || [])
                .map((c: any) => c.id)
                .join(',')
            const newCategoryIds = allCategories.map((c: any) => c.id).join(',')

            if (
                prevServiceIds === newServiceIds &&
                prevCategoryIds === newCategoryIds
            ) {
                return prev
            }

            const services = allServices.map((service: IServiceProps) => {
                const isSelected = Number(attrService) === Number(service.id)
                return {
                    ...service,
                    selected: isSelected,
                    selectedAt: isSelected ? Date.now() : null,
                    quantity: service.min_quantity || 1,
                    onUpdate: (serviceProps: Partial<IServiceProps>) =>
                        onServiceUpdate(service.id, serviceProps),
                    selectedDate: new Date(),
                    selectedMonth: new Date(),
                    places: [],
                    expanded: false,
                }
            })

            const categories = allCategories.map((category: any) => {
                return {
                    ...category,
                    selected: false,
                    onSelect: () => onCategorySelect(category.id),
                }
            })

            return {
                ...prev,
                services,
                categories,
                preset,
                dateFormat: date_format,
                timeFormat: time_format,
                timezone,
                priceFormat: price_format,
            }
        })
    }, [
        allServices?.length,
        allCategories?.length,
        date_format,
        time_format,
        timezone,
        price_format,
        preset,
        attrService,
    ])

    useEffect(() => {
        if (appearance && appearance.length === 2) {
            setFormObj((prev) => ({
                ...prev,
                colors: {
                    primary: generateColorShades(appearance[0]),
                    secondary: generateColorShades(appearance[1]),
                },
            }))
        }
    }, [appearance])

    const setFormData = useCallback(
        (fieldName: string, fieldValue: unknown) => {
            setFormObj((prev) => ({
                ...prev,
                formData: {
                    ...prev.formData,
                    [fieldName]: fieldValue,
                },
            }))
        },
        []
    )

    const onLocationSelect = useCallback((id: string | number) => {
        setFormData('location', id)
    }, [setFormData])

    useEffect(() => {
        if (extractedAttrLocations.length === 1) {
            setFormData('location', extractedAttrLocations[0])
        }
    }, [extractedAttrLocations.join(','), setFormData])

    const onStaffSelect = useCallback(
        (serviceIdOrIds: number | number[], staffId: string | null) => {
            const serviceIds = Array.isArray(serviceIdOrIds)
                ? serviceIdOrIds
                : [serviceIdOrIds]
            const staffIdToStore = staffId === null ? '0' : staffId
            setFormObj((prev) => {
                const current =
                    typeof prev.formData.staff === 'object' &&
                    prev.formData.staff !== null
                        ? (prev.formData.staff as Record<string, string | null>)
                        : {}
                const staffNext = { ...current }
                serviceIds.forEach((id) => {
                    staffNext[String(id)] = staffIdToStore
                })
                const serviceIdSet = new Set(serviceIds)
                const services = (prev.services || []).map((s: any) =>
                    serviceIdSet.has(s.id) ? { ...s, staffId: staffIdToStore } : s
                )
                return {
                    ...prev,
                    services,
                    formData: {
                        ...prev.formData,
                        staff: staffNext,
                    },
                }
            })
        },
        []
    )

    useEffect(() => {
        if (extractedAttrStaff.length !== 1) return
        const singleStaffId = extractedAttrStaff[0]
        setFormObj((prev) => {
            const selectedIds = Array.isArray(prev.formData?.services)
                ? prev.formData.services
                : []
            const staff: Record<string, string> = {}
            selectedIds.forEach((sid: number) => {
                staff[String(sid)] = singleStaffId
            })
            const services = (prev.services || []).map((s: any) =>
                selectedIds.includes(s.id) ? { ...s, staffId: singleStaffId } : s
            )
            return {
                ...prev,
                services,
                formData: { ...prev.formData, staff },
            }
        })
    }, [
        extractedAttrStaff.join(','),
        (formObj.formData?.services as number[] | undefined)?.join(','),
    ])

    useEffect(() => {
        if (extractedAttrStaff.length === 1) return
        const isPredefinedService =
            attrService !== undefined &&
            attrService !== null &&
            String(attrService) !== '' &&
            String(attrService) !== '0'
        if (isPredefinedService && extractedAttrStaff.length === 0) return
        const staffMembers = preset?.staff_members as { services?: string[] }[] | undefined
        const serviceHasStaff = (serviceId: number) =>
            Array.isArray(staffMembers) &&
            staffMembers.some(
                (s) =>
                    s.services &&
                    Array.isArray(s.services) &&
                    s.services.includes(String(serviceId))
            )
        setFormObj((prev) => {
            const selectedIds = (prev.services || []).filter(
                (s: any) => s.selected
            ).map((s: any) => s.id)
            if (selectedIds.length === 0) return prev
            const current =
                typeof prev.formData.staff === 'object' &&
                prev.formData.staff !== null
                    ? (prev.formData.staff as Record<string, string | null>)
                    : {}
            let staffChanged = false
            const staffNext = { ...current }
            selectedIds.forEach((id: number) => {
                if (!serviceHasStaff(id)) return
                const key = String(id)
                if (staffNext[key] === undefined || staffNext[key] === null) {
                    staffNext[key] = '0'
                    staffChanged = true
                }
            })
            if (!staffChanged) return prev
            const services = (prev.services || []).map((s: any) =>
                selectedIds.includes(s.id) &&
                serviceHasStaff(s.id) &&
                (s.staffId === undefined || s.staffId === null)
                    ? { ...s, staffId: '0' as string }
                    : s
            )
            return {
                ...prev,
                services,
                formData: { ...prev.formData, staff: staffNext },
            }
        })
    }, [
        (formObj.services || [])
            .filter((s: any) => s.selected)
            .map((s: any) => s.id)
            .join(','),
        extractedAttrStaff.length,
        preset?.staff_members,
    ])

    const setFields = useCallback(
        (fields: IFieldConstructor[]) => {
            setFormObj((prev) => ({
                ...prev,
                fields,
            }))
        },
        [formObj.fields]
    )

    useEffect(() => {
        if (!formObj.services || !formObj.fields) return

        setFormObj((prev) => ({
            ...prev,
            formData: constructFormData(prev),
        }))
    }, [formObj.services, formObj.fields])

    const amountData = useSelect(
        (select: any) => select(store_name).getBookingAmounts(),
        []
    )

    // update stripe response to form data
    useEffect(() => {
        if (amountData?.stripe_details) {
            setFormData('stripe_details', amountData.stripe_details)
        }
    }, [amountData?.stripe_details])

    const loading = useSelect(
        (select: any) => select(store_name).getLoading(),
        []
    )

    useEffect(() => {
        setFormObj((prev) => ({
            ...prev,
            amountData,
        }))
    }, [amountData])

    const timezoneData = useSelect(
        (select: any) => select(store).getTimezoneData(),
        []
    )

    useEffect(() => {
        setFormObj((prev) => ({
            ...prev,
            userTimezone: settings?.timezone_picker_enabled ?
                    timezoneData?.selectedZone ||
                    Intl.DateTimeFormat().resolvedOptions().timeZone
                : settings?.timezone,
        }))
    }, [timezoneData, settings?.timezone_picker_enabled, settings?.timezone])

    return (
        <BookingContext.Provider
            value={{
                ...formObj,
                setFormData,
                setFields,
                onLocationSelect,
                onStaffSelect,
                attrService,
                attrCategory,
                attrLocation,
                attrStaff,
                extractedAttrCats,
                extractedAttrLocations,
                extractedAttrStaff,
                loading,
                setFormObj(key, value) {
                    setFormObj((prev) => {
                        return {
                            ...prev,
                            [key]: value,
                        }
                    })
                },
            }}
        >
            {children}
        </BookingContext.Provider>
    )
}
