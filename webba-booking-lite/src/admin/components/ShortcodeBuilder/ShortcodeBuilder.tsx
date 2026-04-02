import { useEffect, useMemo, useState } from 'react'
import { __ } from '@wordpress/i18n'
import './ShortcodeBuilder.scss'
import Select from 'react-select'
import { ReactComponent as CloseIcon } from '../../../../public/images/icon-close.svg'
import { ReactComponent as ClipboardIcon } from '../../../../public/images/icon-clipboard.svg'
import { ReactComponent as CheckIcon } from '../../../../public/images/icon-check-nobg.svg'
import { useSidebar } from '../Sidebar/SidebarContext'
import { usePreset } from '../../hooks/usePreset'
import {
    IShortcodePresetCategory,
    IShortcodePresetLocation,
    IShortcodePresetService,
    IShortcodePresetStaff,
} from './types'
import {
    getAllowedLocationIdsForPicker,
    getVisibleServiceIds,
    pruneSelections,
    staffMatchesShortcodeFilters,
} from './utils'

type TOption = { value: string; label: string }

const sameIdSet = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false
    const sa = new Set(a)
    if (sa.size !== a.length) return false
    return b.every((id) => sa.has(id))
}

export const ShortcodeBuilder = () => {
    const sidebar = useSidebar()
    const preset = usePreset()
    const services = (preset?.services || []) as IShortcodePresetService[]
    const categories = (preset?.categories || []) as IShortcodePresetCategory[]
    const locations = (preset?.locations || []) as IShortcodePresetLocation[]
    const staffMembers = (preset?.staff_members || []) as IShortcodePresetStaff[]

    const [serviceId, setServiceId] = useState<string | null>(null)
    const [categoryIds, setCategoryIds] = useState<string[]>([])
    const [locationIds, setLocationIds] = useState<string[]>([])
    const [staffIds, setStaffIds] = useState<string[]>([])
    const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')

    useEffect(() => {
        const pruned = pruneSelections(
            services,
            categories,
            locations,
            staffMembers,
            { serviceId, categoryIds, locationIds, staffIds }
        )
        if (pruned.serviceId !== serviceId) setServiceId(pruned.serviceId)
        if (!sameIdSet(pruned.categoryIds, categoryIds)) {
            setCategoryIds(pruned.categoryIds)
        }
        if (!sameIdSet(pruned.locationIds, locationIds)) {
            setLocationIds(pruned.locationIds)
        }
        if (!sameIdSet(pruned.staffIds, staffIds)) {
            setStaffIds(pruned.staffIds)
        }
    }, [
        serviceId,
        categoryIds,
        locationIds,
        staffIds,
        services,
        categories,
        locations,
        staffMembers,
    ])

    const visibleForServiceDropdown = useMemo(
        () =>
            getVisibleServiceIds(
                services,
                categories,
                staffMembers,
                { serviceId, categoryIds, locationIds, staffIds },
                'service'
            ),
        [services, categories, staffMembers, serviceId, categoryIds, locationIds, staffIds]
    )

    const visibleForCategoryDropdown = useMemo(
        () =>
            getVisibleServiceIds(
                services,
                categories,
                staffMembers,
                { serviceId, categoryIds, locationIds, staffIds },
                'category'
            ),
        [services, categories, staffMembers, serviceId, categoryIds, locationIds, staffIds]
    )

    const visibleForLocationDropdown = useMemo(
        () =>
            getVisibleServiceIds(
                services,
                categories,
                staffMembers,
                { serviceId, categoryIds, locationIds, staffIds },
                'location'
            ),
        [services, categories, staffMembers, serviceId, categoryIds, locationIds, staffIds]
    )

    const visibleForStaffDropdown = useMemo(
        () =>
            getVisibleServiceIds(
                services,
                categories,
                staffMembers,
                { serviceId, categoryIds, locationIds, staffIds },
                'staff'
            ),
        [services, categories, staffMembers, serviceId, categoryIds, locationIds, staffIds]
    )

    const allowedLocationIds = useMemo(
        () =>
            getAllowedLocationIdsForPicker(
                locations,
                services,
                visibleForLocationDropdown,
                { serviceId, categoryIds, staffIds },
                staffMembers
            ),
        [
            locations,
            services,
            visibleForLocationDropdown,
            serviceId,
            categoryIds,
            staffIds,
            staffMembers,
        ]
    )

    const serviceOptions: TOption[] = useMemo(
        () =>
            services
                .filter((s) => visibleForServiceDropdown.has(String(s.id)))
                .map((s) => ({
                    value: String(s.id),
                    label: s.label,
                })),
        [services, visibleForServiceDropdown]
    )

    const categoryOptions: TOption[] = useMemo(
        () =>
            categories
                .filter((c) =>
                    (c.services || []).some((sid) =>
                        visibleForCategoryDropdown.has(String(sid))
                    )
                )
                .map((c) => ({
                    value: String(c.id),
                    label: `${c.name} (ID: ${c.id})`,
                })),
        [categories, visibleForCategoryDropdown]
    )

    const locationOptions: TOption[] = useMemo(
        () =>
            locations
                .filter((l) => allowedLocationIds.has(String(l.id)))
                .map((l) => ({
                    value: String(l.id),
                    label: l.label,
                })),
        [locations, allowedLocationIds]
    )

    const staffOptions: TOption[] = useMemo(
        () =>
            staffMembers
                .filter((m) =>
                    staffMatchesShortcodeFilters(
                        m,
                        visibleForStaffDropdown,
                        locationIds,
                        { serviceId, categoryIds }
                    )
                )
                .map((m) => ({
                    value: String(m.id),
                    label: m.label,
                })),
        [
            staffMembers,
            visibleForStaffDropdown,
            locationIds,
            serviceId,
            categoryIds,
        ]
    )

    const shortcode = useMemo(() => {
        const args: string[] = []
        if (serviceId != null && serviceId !== '') {
            args.push(`service=${serviceId}`)
        }
        if (categoryIds.length > 0) {
            args.push(`category=${categoryIds.join(',')}`)
        }
        if (locationIds.length > 0) {
            args.push(`location=${locationIds.join(',')}`)
        }
        if (staffIds.length > 0) {
            args.push(`staff=${staffIds.join(',')}`)
        }
        return `[webbabooking ${args.join(' ')}]`
    }, [serviceId, categoryIds.join(','), locationIds.join(','), staffIds.join(',')])

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shortcode)
            setCopyState('copied')
        } catch {}
    }

    useEffect(() => {
        if (copyState !== 'copied') return
        const t = window.setTimeout(() => setCopyState('idle'), 1200)
        return () => window.clearTimeout(t)
    }, [copyState])

    return (
        <div className="wbk_shortcode_builder">
            <div className="wbk_shortcode_builder__header">
                <div>
                    <h3 className="wbk_shortcode_builder__title">
                        {__('Shortcode builder', 'webba-booking-lite')}
                    </h3>
                    <p className="wbk_shortcode_builder__subtitle">
                        {__(
                            'Select the attributes below to generate your custom booking shortcode.',
                            'webba-booking-lite'
                        )}
                    </p>
                </div>
                <button
                    type="button"
                    className="wbk_shortcode_builder__close"
                    onClick={() => sidebar.close()}
                    aria-label={__('Close', 'webba-booking-lite')}
                >
                    <CloseIcon />
                </button>
            </div>

            <div className="wbk_shortcode_builder__body">
                <div className="wbk_shortcode_builder__grid">
                    <div className="wbk_shortcode_builder__field">
                        <label>{__('Service', 'webba-booking-lite')}</label>
                        <Select
                            classNamePrefix="wbk_select"
                            placeholder={__('Select Service...', 'webba-booking-lite')}
                            options={serviceOptions}
                            value={
                                serviceId
                                    ? serviceOptions.find((o) => o.value === serviceId) ||
                                      null
                                    : null
                            }
                            onChange={(opt: any) =>
                                setServiceId(opt?.value ?? null)
                            }
                            isClearable={true}
                        />
                    </div>

                    <div className="wbk_shortcode_builder__field">
                        <label>{__('Categories', 'webba-booking-lite')}</label>
                        <Select
                            isMulti
                            classNamePrefix="wbk_select"
                            placeholder={__('Select Categories...', 'webba-booking-lite')}
                            options={categoryOptions}
                            value={categoryOptions.filter((o) =>
                                categoryIds.includes(o.value)
                            )}
                            onChange={(opts: any) =>
                                setCategoryIds(
                                    Array.isArray(opts)
                                        ? opts.map((o) => o.value)
                                        : []
                                )
                            }
                        />
                    </div>

                    <div className="wbk_shortcode_builder__field">
                        <label>{__('Locations', 'webba-booking-lite')}</label>
                        <Select
                            isMulti
                            classNamePrefix="wbk_select"
                            placeholder={__('Select Locations...', 'webba-booking-lite')}
                            options={locationOptions}
                            value={locationOptions.filter((o) =>
                                locationIds.includes(o.value)
                            )}
                            onChange={(opts: any) =>
                                setLocationIds(
                                    Array.isArray(opts)
                                        ? opts.map((o) => o.value)
                                        : []
                                )
                            }
                        />
                    </div>

                    <div className="wbk_shortcode_builder__field">
                        <label>{__('Staff', 'webba-booking-lite')}</label>
                        <Select
                            isMulti
                            classNamePrefix="wbk_select"
                            placeholder={__('Select Staff...', 'webba-booking-lite')}
                            options={staffOptions}
                            value={staffOptions.filter((o) =>
                                staffIds.includes(o.value)
                            )}
                            onChange={(opts: any) =>
                                setStaffIds(
                                    Array.isArray(opts)
                                        ? opts.map((o) => o.value)
                                        : []
                                )
                            }
                        />
                    </div>
                </div>

                <div className="wbk_shortcode_builder__output">
                    <label>
                        {__('Generated Shortcode', 'webba-booking-lite')}
                    </label>
                    <div className="wbk_shortcode_builder__codebar">
                        <code>{shortcode}</code>
                        <div className="wbk_shortcode_builder__actions">
                            <button
                                type="button"
                                onClick={copyToClipboard}
                                aria-label={__('Copy', 'webba-booking-lite')}
                                title={__('Copy', 'webba-booking-lite')}
                                className="wbk_shortcode_builder__copyButton"
                            >
                                {copyState === 'copied' ? (
                                    <CheckIcon aria-hidden="true" />
                                ) : (
                                    <ClipboardIcon aria-hidden="true" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
