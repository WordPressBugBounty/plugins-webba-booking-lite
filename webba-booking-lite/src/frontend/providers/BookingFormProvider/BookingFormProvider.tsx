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
import {
    IServiceProps,
    IUnitAttendees,
    IUnitProps,
} from '../../components/Services/types'
import { IFormData } from '../../screens/BookingForm/types'
import { ICategory } from '../../components/Categories/types'
import { IFieldConfig } from '../../components/Form/types'
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
    attrUnits,
    attrHideCategory,
    preset: customPreset,
    disableCustomScroll = false,
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
        units: allUnits = [],
        categories: allCategories = [],
        settings = {},
        appearance = [],
    } = preset || {}

    const bookingMode: 'services' | 'units' =
        ['yes', '1', 'true'].includes(
            String(attrUnits || '')
                .trim()
                .toLowerCase()
        )
            ? 'units'
            : 'services'

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

    const getEnabledAttendees = (unit: IUnitProps): IUnitAttendees => {
        const hasAdult = unit.attendee_type_adult === 'yes'
        const hasChild = unit.attendee_type_child === 'yes'
        const hasInfant = unit.attendee_type_infant === 'yes'

        return {
            adult: hasAdult ? 1 : 0,
            child: hasChild ? 0 : 0,
            infant: hasInfant ? 0 : 0,
        }
    }

    const clampUnitAttendees = (
        attendees: IUnitAttendees,
        capacity: number
    ): IUnitAttendees => {
        const safeCapacity = Math.max(1, Number(capacity) || 1)
        const total = attendees.adult + attendees.child + attendees.infant
        if (total <= safeCapacity) {
            return attendees
        }

        let overflow = total - safeCapacity
        const updated = { ...attendees }
            ; (['infant', 'child', 'adult'] as const).forEach((key) => {
                if (overflow <= 0) {
                    return
                }
                const removable = Math.min(updated[key], overflow)
                updated[key] -= removable
                overflow -= removable
            })

        return updated
    }

    const [formObj, setFormObj] = useState<IBookingFormObj>({
        categories: [] as ICategory[],
        services: [] as IServiceProps[],
        units: [] as IUnitProps[],
        bookingMode: 'services',
        preset: {},
        attrService: null,
        attrCategory: null,
        attrLocation: null,
        attrStaff: null,
        attrUnits: null,
        extractedAttrCats: [],
        extractedAttrLocations: [],
        extractedAttrStaff: [],
        attrHideCategory: 'no',
        formData: {
            services: [],
            places: {},
            payment_method: '' as any,
            extra: {},
            coupon: '',
            attachments: [],
        } as IFormData,
        dateFormat: 'F j, Y',
        timeFormat: 'g:i a',
        priceFormat: '$#price',
        fields: [] as IFieldConfig[],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        paymentMethods: [],
        amountData: {
            total: 0,
            discount: 0,
            subtotal: 0,
            tax_to_pay: 0,
            items: [],
            service_fees: 0,
            left_to_pay: 0,
            order_total: 0,
            to_pay_total: 0,
            stripe_details: {
                client_secret: '',
                intent_id: '',
            },
        },
        stripeObj: {} as any,
        colors: {
            primary: {},
            secondary: {},
        },
        disableCustomScroll,
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

    const onUnitUpdate = useCallback(
        (id: number, unitProps: Partial<IUnitProps>) => {
            setFormObj((prev) => {
                const isSelectingThisUnit = unitProps.selected === true
                const isTogglingSelection = 'selected' in unitProps

                const updatedUnits = prev.units.map((unit: IUnitProps) => {
                    if (unit.id !== id) {
                        if (isTogglingSelection && isSelectingThisUnit) {
                            return {
                                ...unit,
                                selected: false,
                                selectedAt: null,
                            }
                        }
                        return unit
                    }

                    const nextUnit = {
                        ...unit,
                        ...unitProps,
                    }

                    const unitCapacity = Math.max(1, Number(nextUnit.capacity) || 1)
                    const nextAttendees = clampUnitAttendees(
                        (nextUnit.attendees || getEnabledAttendees(nextUnit)) as IUnitAttendees,
                        unitCapacity
                    )

                    return {
                        ...nextUnit,
                        attendees: nextAttendees,
                        quantity:
                            unitCapacity > 1
                                ? Math.min(
                                    unitCapacity,
                                    Math.max(1, Number(nextUnit.quantity) || 1)
                                )
                                : 1,
                        selectedAt:
                            'selected' in unitProps
                                ? unitProps.selected
                                    ? unit.selectedAt || Date.now()
                                    : null
                                : unit.selectedAt,
                    }
                })

                return {
                    ...prev,
                    units: updatedUnits,
                    formData: {
                        ...prev.formData,
                        units: updatedUnits
                            .filter((unit: IUnitProps) => unit.selected)
                            .map((unit: IUnitProps) => unit.id),
                    },
                }
            })
        },
        []
    )

    useEffect(() => {
        if (!allServices || !allCategories || !allUnits) return

        setFormObj((prev) => {
            const prevServiceIds = (prev.services || [])
                .map((s: any) => s.id)
                .join(',')
            const newServiceIds = allServices.map((s: any) => s.id).join(',')

            const prevUnitIds = (prev.units || [])
                .map((u: any) => u.id)
                .join(',')
            const newUnitIds = allUnits.map((u: any) => u.id).join(',')

            const prevCategoryIds = (prev.categories || [])
                .map((c: any) => c.id)
                .join(',')
            const newCategoryIds = allCategories.map((c: any) => c.id).join(',')

            if (
                prevServiceIds === newServiceIds &&
                prevUnitIds === newUnitIds &&
                prevCategoryIds === newCategoryIds &&
                prev.bookingMode === bookingMode
            ) {
                return prev
            }

            const services = allServices.map((service: IServiceProps) => {
                const isSelected = Number(attrService) === Number(service.id)
                return {
                    ...service,
                    selected: bookingMode === 'services' ? isSelected : false,
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

            const units = allUnits.map((unit: IUnitProps) => {
                const isSelected = Number(attrService) === Number(unit.id)
                const unitCapacity = Math.max(1, Number(unit.capacity) || 1)
                const defaultAttendees = clampUnitAttendees(
                    getEnabledAttendees(unit),
                    unitCapacity
                )

                return {
                    ...unit,
                    selected: bookingMode === 'units' ? isSelected : false,
                    selectedAt: isSelected ? Date.now() : null,
                    quantity: unitCapacity > 1 ? 1 : 1,
                    attendees: defaultAttendees,
                    onUpdate: (unitProps: Partial<IUnitProps>) =>
                        onUnitUpdate(unit.id, unitProps),
                    selectedDate: new Date(),
                    selectedMonth: new Date(),
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
                units,
                categories,
                bookingMode,
                preset,
                dateFormat: date_format,
                timeFormat: time_format,
                timezone,
                priceFormat: price_format,
                formData: {
                    ...prev.formData,
                    services:
                        bookingMode === 'services'
                            ? services
                                .filter((service: IServiceProps) => service.selected)
                                .map((service: IServiceProps) => service.id)
                            : [],
                    units:
                        bookingMode === 'units'
                            ? units
                                .filter((unit: IUnitProps) => unit.selected)
                                .map((unit: IUnitProps) => unit.id)
                            : [],
                },
            }
        })
    }, [
        allServices?.length,
        allUnits?.length,
        allCategories?.length,
        date_format,
        time_format,
        timezone,
        price_format,
        preset,
        attrService,
        bookingMode,
        onServiceUpdate,
        onUnitUpdate,
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

    const mergeFormData = useCallback((patch: Partial<IFormData>) => {
        setFormObj((prev) => ({
            ...prev,
            formData: {
                ...prev.formData,
                ...patch,
            },
        }))
    }, [])

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
        (fields: IFieldConfig[]) => {
            setFormObj((prev) => ({
                ...prev,
                fields,
            }))
        },
        [formObj.fields]
    )

    useEffect(() => {
        if (!formObj.services || !formObj.units || !formObj.fields) return

        setFormObj((prev) => ({
            ...prev,
            formData: constructFormData(prev),
        }))
    }, [formObj.services, formObj.units, formObj.bookingMode, formObj.fields])

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
                mergeFormData,
                setFields,
                onLocationSelect,
                onStaffSelect,
                disableCustomScroll,
                attrService,
                attrCategory,
                attrLocation,
                attrStaff,
                attrUnits,
                extractedAttrCats,
                extractedAttrLocations,
                extractedAttrStaff,
                attrHideCategory: attrHideCategory || 'no',
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
