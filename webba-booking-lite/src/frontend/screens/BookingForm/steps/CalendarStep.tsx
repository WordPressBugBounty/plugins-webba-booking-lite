import { useDispatch, useSelect } from '@wordpress/data'
import { SelectedServices } from '../../../components/SelectedServices/SelectedServices'
import { LocationDropdown } from '../../../components/LocationDropdown/LocationDropdown'
import { StaffSelector } from '../../../components/StaffSelector/StaffSelector'
import { getStaffOptionsForService } from '../../../components/StaffSelector/utils'
import { IStaffOption } from '../../../components/StaffSelector/types'
import { ILocationOption } from '../../../components/LocationDropdown/types'
import { store } from '../../../../store/frontend'
import { useMemo, useEffect } from 'react'
import { useBookingContext } from '../../../providers/BookingFormProvider/BookingFormProvider'
import { CustomScroll } from 'react-custom-scroll'
import './Steps.scss'
import Select from 'react-select'
import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import { ReactComponent as InfoIcon } from '../../../../../public/images/icon-info-circle.svg'

export const CalendarStep = () => {
    const {
        services,
        preset,
        formData,
        onStaffSelect,
        onLocationSelect,
        attrService,
        extractedAttrLocations,
        extractedAttrStaff,
    } = useBookingContext()
    const wording = preset?.wording ?? {}
    const settings = preset?.settings
    const { setTimezoneData } = useDispatch(store)
    const timezoneData = useSelect(
        // @ts-ignore
        (select) => select(store).getTimezoneData(),
        []
    )
    const selectedTimezone = useMemo(() => {
        const selectedZone =
            timezoneData?.selectedZone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone

        return {
            label: selectedZone,
            value: selectedZone,
        }
    }, [timezoneData])

    const isPredefinedService =
        attrService !== undefined &&
        attrService !== '' &&
        String(attrService) !== '0'

    const predefinedServiceIds = useMemo(
        () => services.filter((s) => s.selected).map((s) => s.id),
        [services]
    )
    const firstPredefinedService = useMemo(
        () => services.find((s) => s.selected) ?? null,
        [services]
    )
    const firstPredefinedServiceId = firstPredefinedService?.id ?? null

    const locationsForService = useMemo(() => {
        const all: ILocationOption[] = preset?.locations ?? []
        const serviceLocations = firstPredefinedService?.locations
        if (!serviceLocations || !Array.isArray(serviceLocations) || serviceLocations.length === 0)
            return []
        let list = all.filter(
            (loc) =>
                serviceLocations.includes(String(loc.id)) ||
                serviceLocations.includes(String(loc.value))
        )
        if (extractedAttrLocations.length > 0) {
            list = list.filter(
                (loc) =>
                    extractedAttrLocations.includes(String(loc.id)) ||
                    extractedAttrLocations.includes(String(loc.value))
            )
        }

        if (extractedAttrStaff.length > 0 && firstPredefinedServiceId != null) {
            const staffForService = getStaffOptionsForService(
                preset?.staff_members as IStaffOption[] | undefined,
                firstPredefinedServiceId,
                null,
                extractedAttrStaff
            )
            const staffLocationIds = new Set<string>()
            staffForService.forEach((staff) => {
                ; (staff.locations || []).forEach((locationId) =>
                    staffLocationIds.add(String(locationId))
                )
            })
            list = list.filter(
                (loc) =>
                    staffLocationIds.has(String(loc.id)) ||
                    staffLocationIds.has(String(loc.value))
            )
        }

        return list
    }, [
        preset?.locations,
        preset?.staff_members,
        firstPredefinedService?.locations,
        firstPredefinedServiceId,
        extractedAttrStaff,
        extractedAttrLocations,
    ])

    const locationId =
        formData?.location != null ? String(formData.location) : null

    const staffOptions = useMemo(
        () =>
            firstPredefinedServiceId != null
                ? getStaffOptionsForService(
                    preset?.staff_members as IStaffOption[] | undefined,
                    firstPredefinedServiceId,
                    locationId,
                    extractedAttrStaff
                )
                : [],
        [
            preset?.staff_members,
            firstPredefinedServiceId,
            locationId,
            extractedAttrStaff,
        ]
    )

    const showLocationDropdown =
        isPredefinedService && locationsForService.length > 1

    const isLocationSelected = formData?.location != null && String(formData.location) !== ''
    const lockCalendarUntilLocation = showLocationDropdown && !isLocationSelected

    const showStaffSelector =
        isPredefinedService &&
        firstPredefinedServiceId != null &&
        extractedAttrStaff.length !== 1 &&
        staffOptions.length > 1

    useEffect(() => {
        if (
            !isPredefinedService ||
            locationsForService.length !== 1 ||
            formData?.location != null
        )
            return
        const single = locationsForService[0]
        const id = single?.id ?? single?.value
        if (id) onLocationSelect(id)
    }, [
        isPredefinedService,
        locationsForService,
        formData?.location,
        onLocationSelect,
    ])

    useEffect(() => {
        if (
            !isPredefinedService ||
            firstPredefinedServiceId == null ||
            staffOptions.length !== 1 ||
            extractedAttrStaff.length === 1
        )
            return
        const singleStaffId = staffOptions[0]?.id
        if (singleStaffId == null) return
        const current =
            (formData?.staff as Record<string, string | null> | undefined)?.[
            String(firstPredefinedServiceId)
            ]
        if (current === singleStaffId) return
        onStaffSelect(predefinedServiceIds, singleStaffId)
    }, [
        isPredefinedService,
        firstPredefinedServiceId,
        staffOptions,
        extractedAttrStaff.length,
        formData?.staff,
        predefinedServiceIds,
        onStaffSelect,
    ])

    const selectedStaffId =
        firstPredefinedServiceId != null
            ? ((formData?.staff as Record<string, string | null> | undefined)?.[
                String(firstPredefinedServiceId)
            ] ?? null)
            : null

    const handleStaffSelect = (staffId: string | null) => {
        onStaffSelect(predefinedServiceIds, staffId)
    }

    return (
        <CustomScroll
            flex="1"
            className={'wbk_step__scroll-wrapper'}
            allowOuterScroll={true}
        >
            {settings?.timezone_picker_enabled && (
                <div className={'wbk_timezone_selector__wrapper'}>
                    <label className="wbk_timezone_selector__label">
                        {__('Time zone:', 'webba-booking-lite')}
                    </label>
                    <Select
                        options={timezoneData?.timezones.map(
                            (label: string) => ({
                                label,
                                value: label,
                            })
                        )}
                        value={selectedTimezone}
                        defaultValue={selectedTimezone}
                        onChange={(option: any) =>
                            setTimezoneData({ selectedZone: option.value })
                        }
                        className={'wbk_timezone_selector'}
                    />
                </div>
            )}
            {showLocationDropdown && (
                <LocationDropdown locations={locationsForService} />
            )}
            {lockCalendarUntilLocation && (
                <div className="wbk_step__location_required_notice">
                    <span className="wbk_step__location_required_notice_icon">
                        <InfoIcon aria-hidden="true" />
                    </span>
                    <span>
                        {wording.please_select_location ?? __(
                            'Please select a location first to choose services.',
                            'webba-booking-lite'
                        )}
                    </span>
                </div>
            )}
            <div
                className={classNames('wbk_step__calendar_area', {
                    'wbk_step__calendar_area--locked': lockCalendarUntilLocation,
                })}
            >
                {showStaffSelector && (
                    <div className="wbk_step__staff_selector_wrapper">
                        <label className="wbk_step__staff_selector_label">
                            {__('Staff Member', 'webba-booking-lite')}
                        </label>
                        <StaffSelector
                            staffOptions={staffOptions}
                            selectedStaffId={selectedStaffId}
                            onSelect={handleStaffSelect}
                            treatNullAsAnyAvailable={false}
                        />
                    </div>
                )}
                <div>
                    <SelectedServices />
                </div>
            </div>
        </CustomScroll>
    )
}
