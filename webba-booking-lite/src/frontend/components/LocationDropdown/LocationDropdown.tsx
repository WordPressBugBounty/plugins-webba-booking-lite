import { useRef, useEffect, useMemo, useState } from 'react'
import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'
import { getPlainTextFromHtml } from '../../lib/utils'
import { getServiceAssociatedLocations } from '../../lib/locationFilter/getServiceAssociatedLocations'
import { ILocationOption } from './types'
import './LocationDropdown.scss'

const MapPinIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor" />
    </svg>
)

const ChevronDownIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
    </svg>
)

const LocationCard = ({
    option,
    isSelected,
    onClick,
}: {
    option: ILocationOption
    isSelected?: boolean
    onClick: () => void
}) => {
    const descriptionText = option.description
        ? getPlainTextFromHtml(option.description)
        : ''
    return (
        <div
            className={classNames('wbk_location_dropdown__option', {
                'wbk_location_dropdown__option--selected': isSelected,
            })}
            onClick={onClick}
        >
            <span className="wbk_location_dropdown__option-icon">
                <MapPinIcon />
            </span>
            <span className="wbk_location_dropdown__option-content">
                <span className="wbk_location_dropdown__option-label">
                    {option.label}
                </span>
                {descriptionText && (
                    <span className="wbk_location_dropdown__option-description">
                        {descriptionText}
                    </span>
                )}
            </span>
        </div>
    )
}

interface LocationDropdownProps {
    locations?: ILocationOption[] | null
}

export const LocationDropdown = ({
    locations: locationsOverride = undefined,
}: LocationDropdownProps = {}) => {
    const { preset, formData, onLocationSelect, extractedAttrLocations } =
        useBookingContext()
    const wording = preset?.wording ?? {}
    const allLocations: ILocationOption[] = useMemo(() => {
        const raw = (preset?.locations ?? []) as ILocationOption[]
        const services = (preset?.services ?? []) as Array<{ locations?: any[] }>
        return getServiceAssociatedLocations(raw, services)
    }, [preset?.locations, preset?.services])
    const baseLocations =
        extractedAttrLocations.length > 0
            ? allLocations.filter(
                (loc) =>
                    extractedAttrLocations.includes(String(loc.id)) ||
                    extractedAttrLocations.includes(String(loc.value))
            )
            : allLocations
    const locations: ILocationOption[] =
        locationsOverride ?? baseLocations
    const selectedId = formData?.location != null ? String(formData.location) : ''
    const selected = locations.find(
        (loc) => loc.id === selectedId || loc.value === selectedId
    )
    const [isOpen, setIsOpen] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const displayLabel = selected?.label ?? wording.select_location ?? __('Select location', 'webba-booking-lite')
    const displayDescription = selected?.description
        ? getPlainTextFromHtml(selected.description)
        : ''

    return (
        <div className="wbk_location_dropdown" ref={wrapperRef}>
            <label className="wbk_location_dropdown__label">
                {wording.location ?? __('Location', 'webba-booking-lite')}
            </label>
            <div
                className={classNames('wbk_location_dropdown__trigger', {
                    'wbk_location_dropdown__trigger--open': isOpen,
                })}
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-label={wording.location ?? __('Location', 'webba-booking-lite')}
            >
                <span className="wbk_location_dropdown__trigger-icon">
                    <MapPinIcon />
                </span>
                <span className="wbk_location_dropdown__trigger-content">
                    <span className="wbk_location_dropdown__trigger-label">
                        {displayLabel}
                    </span>
                    {displayDescription && (
                        <span className="wbk_location_dropdown__trigger-description">
                            {displayDescription}
                        </span>
                    )}
                </span>
                <span className="wbk_location_dropdown__trigger-chevron">
                    <ChevronDownIcon />
                </span>
            </div>
            {isOpen && (
                <div
                    className="wbk_location_dropdown__menu"
                    role="listbox"
                    aria-label={__('Location options', 'webba-booking-lite')}
                >
                    {locations.map((option) => (
                        <div key={option.id} role="option" aria-selected={option.id === selectedId}>
                            <LocationCard
                                option={option}
                                isSelected={option.id === selectedId || option.value === selectedId}
                                onClick={() => {
                                    onLocationSelect(option.id)
                                    setIsOpen(false)
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
