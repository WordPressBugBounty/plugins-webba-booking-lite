import {
    PanelBody,
    SelectControl,
    FormTokenField,
    BaseControl,
    ToggleControl,
    TextControl,
    Button,
    Modal,
} from '@wordpress/components'
import {
    useBlockProps,
    InspectorControls,
    PanelColorSettings,
} from '@wordpress/block-editor'
import { useEffect, useMemo, useRef, useCallback, useState } from '@wordpress/element'
import '../assets/frontend.scss'
import { __ } from '@wordpress/i18n'
import { useSelect } from '@wordpress/data'
import { BookingFormProvider } from '../frontend/providers/BookingFormProvider/BookingFormProvider.tsx'
import { BookingForm } from '../frontend/screens/BookingForm/BookingForm.tsx'
import { store_name } from '../store/frontend/index.ts'
import {
    normalizePresetForFilters,
    blockAttributesToSelection,
    selectionToBlockAttributes,
    pruneSelections,
    getPickerAllowedSets,
} from './utils/bookingPresetFilters.js'
import { buildScopeInlineStyleObject } from './utils/buildScopeInlineStyle.js'

const FONT_OPTIONS = [
    {
        label: __('Default Webba Font', 'webba-booking-lite'),
        value: '"Ubuntu", sans-serif',
    },
    {
        label: __('Inherited From Theme', 'webba-booking-lite'),
        value: 'inherit',
    },
]

const BORDER_RADIUS_OPTIONS = [
    { label: __('None', 'webba-booking-lite'), value: '0' },
    { label: __('2px', 'webba-booking-lite'), value: '2px' },
    { label: __('4px', 'webba-booking-lite'), value: '4px' },
    { label: __('6px', 'webba-booking-lite'), value: '6px' },
    { label: __('8px (Default)', 'webba-booking-lite'), value: '8px' },
    { label: __('10px', 'webba-booking-lite'), value: '10px' },
    { label: __('12px', 'webba-booking-lite'), value: '12px' },
    { label: __('14px', 'webba-booking-lite'), value: '14px' },
    { label: __('16px', 'webba-booking-lite'), value: '16px' },
    { label: __('18px', 'webba-booking-lite'), value: '18px' },
    { label: __('20px', 'webba-booking-lite'), value: '20px' },
    { label: __('24px', 'webba-booking-lite'), value: '24px' },
    { label: __('32px', 'webba-booking-lite'), value: '32px' },
    { label: __('40px', 'webba-booking-lite'), value: '40px' },
]

const ADVANCED_COLOR_FIELDS = [
    ['bg_button_primary', '#15B8A9', __('Main button — background', 'webba-booking-lite')],
    ['color_button_primary', '#ffffff', __('Main button — text', 'webba-booking-lite')],
    ['bg_button_primary_hover', '#1A5B57', __('Main button hover — background', 'webba-booking-lite')],
    ['color_button_primary_hover', '#ffffff', __('Main button hover — text', 'webba-booking-lite')],
    ['bg_button_inactive', '#edeff3', __('Inactive button — background', 'webba-booking-lite')],
    ['color_button_inactive', '#ffffff', __('Inactive button — text', 'webba-booking-lite')],
    ['bg_button_selected', '#15B8A9', __('Selected button — background', 'webba-booking-lite')],
    ['color_button_selected', '#ffffff', __('Selected button — text', 'webba-booking-lite')],
    ['bg_button_selected_hover', '#1A5B57', __('Selected button hover — background', 'webba-booking-lite')],
    ['color_button_selected_hover', '#ffffff', __('Selected button hover — text', 'webba-booking-lite')],
    ['bg_button_selected_selected', '#ffffff', __('Selected button active — background', 'webba-booking-lite')],
    ['color_button_selected_selected', '#22292f', __('Selected button active — text', 'webba-booking-lite')],
    ['bg_button_secondary', '#edeff2', __('Secondary button — background', 'webba-booking-lite')],
    ['color_button_secondary', '#ffffff', __('Secondary button — text', 'webba-booking-lite')],
    ['bg_button_secondary_hover', '#1A5B57', __('Secondary button hover — background', 'webba-booking-lite')],
    ['color_button_secondary_hover', '#ffffff', __('Secondary button hover — text', 'webba-booking-lite')],
    ['bg_sidebar', '#f9fafb', __('Sidebar — background', 'webba-booking-lite')],
    ['color_sidebar', '#22292F', __('Sidebar — text', 'webba-booking-lite')],
    ['color_border_selected', '#15B8A9', __('Selected elements — border', 'webba-booking-lite')],
]

const labelsToIds = (tokens, pairs) => {
    return tokens
        .map((label) => {
            const row = pairs.find((p) => p.label === label)
            return row ? String(row.id) : null
        })
        .filter(Boolean)
}

const idsToLabels = (ids, pairs) => {
    return (ids || [])
        .map((id) => {
            const row = pairs.find((p) => String(p.id) === String(id))
            return row ? row.label : null
        })
        .filter(Boolean)
}

export default function Edit({ attributes, setAttributes }) {
    const data = useSelect(
        (select) => select(store_name).getPreset(),
        [store_name]
    )

    const normalizedPreset = useMemo(() => {
        if (!data || !data.services || data.services.length === 0) {
            return null
        }
        return normalizePresetForFilters(data)
    }, [data])

    const categoryPairs = useMemo(() => {
        return (data?.categories || []).map((c) => ({
            id: String(c.id),
            label: c.name ? `${c.name} (ID: ${c.id})` : String(c.id),
        }))
    }, [data])

    const locationPairs = useMemo(() => {
        return (data?.locations || []).map((l) => ({
            id: String(l.id ?? l.value),
            label: l.label || String(l.id),
        }))
    }, [data])

    const staffPairs = useMemo(() => {
        return (data?.staff_members || []).map((s) => ({
            id: String(s.id ?? s.value),
            label: s.label || String(s.id),
        }))
    }, [data])

    const picker = useMemo(() => {
        if (!normalizedPreset) {
            return null
        }
        return getPickerAllowedSets(
            normalizedPreset,
            blockAttributesToSelection(attributes)
        )
    }, [
        normalizedPreset,
        attributes.service,
        (attributes.category || []).join(','),
        (attributes.location || []).join(','),
        (attributes.staff || []).join(','),
    ])

    const applyPrunedSelection = useCallback(
        (partial) => {
            if (!normalizedPreset) {
                return
            }
            const merged = { ...attributes, ...partial }
            const pruned = pruneSelections(
                normalizedPreset,
                blockAttributesToSelection(merged)
            )
            setAttributes(selectionToBlockAttributes(pruned))
        },
        [normalizedPreset, attributes, setAttributes]
    )

    const initialPruneDone = useRef(false)
    useEffect(() => {
        if (!normalizedPreset || initialPruneDone.current) {
            return
        }
        initialPruneDone.current = true
        const pruned = pruneSelections(
            normalizedPreset,
            blockAttributesToSelection(attributes)
        )
        const next = selectionToBlockAttributes(pruned)
        const same =
            (attributes.service || '') === (next.service || '') &&
            (attributes.category || []).join(',') ===
                (next.category || []).join(',') &&
            (attributes.location || []).join(',') ===
                (next.location || []).join(',') &&
            (attributes.staff || []).join(',') === (next.staff || []).join(',')
        if (!same) {
            setAttributes(next)
        }
    }, [normalizedPreset])

    const serviceSelectOptions = useMemo(() => {
        const opts = [
            { label: __('All services', 'webba-booking-lite'), value: '' },
        ]
        if (!data?.services || !picker) {
            return opts
        }
        const allowed = new Set(picker.allowedServiceIds.map(String))
        data.services.forEach((s) => {
            const id = String(s.id ?? s.value)
            if (!allowed.has(id)) {
                return
            }
            opts.push({ label: s.label || id, value: id })
        })
        return opts
    }, [data, picker])

    const categorySuggestions = useMemo(() => {
        if (!picker) {
            return []
        }
        const allowed = new Set(picker.allowedCategoryIds)
        return categoryPairs
            .filter((c) => allowed.has(String(c.id)))
            .map((c) => c.label)
    }, [picker, categoryPairs])

    const locationSuggestions = useMemo(() => {
        if (!picker) {
            return []
        }
        const allowed = new Set(picker.allowedLocationIds.map(String))
        return locationPairs
            .filter((l) => allowed.has(String(l.id)))
            .map((l) => l.label)
    }, [picker, locationPairs])

    const staffSuggestions = useMemo(() => {
        if (!picker) {
            return []
        }
        const allowed = new Set(picker.allowedStaffIds.map(String))
        return staffPairs
            .filter((s) => allowed.has(String(s.id)))
            .map((s) => s.label)
    }, [picker, staffPairs])

    const categoryTokens = idsToLabels(attributes.category, categoryPairs)
    const locationTokens = idsToLabels(attributes.location, locationPairs)
    const staffTokens = idsToLabels(attributes.staff, staffPairs)

    const scopeStyle = useMemo(
        () => buildScopeInlineStyleObject(attributes),
        [attributes]
    )
    const advancedColorSettings = ADVANCED_COLOR_FIELDS.map(
        ([attributeKey, fallbackValue, label]) => ({
            key: attributeKey,
            value: attributes[attributeKey],
            onChange: (value) =>
                setAttributes({
                    [attributeKey]: value || fallbackValue,
                }),
            label,
        })
    )
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const isAdvancedAppearanceLocked = useMemo(() => {
        if (!data?.plan_map) {
            return false
        }
        return !(
            data.plan_map.standard === true ||
            data.plan_map.premium === true ||
            data.plan_map.pro === true
        )
    }, [data?.plan_map])
    const upgradeUrl = `${data?.admin_url || '/wp-admin/'}admin.php?page=wbk-main-pricing`

    const previewKey = [
        attributes.service || '0',
        (attributes.category || []).join(','),
        (attributes.location || []).join(','),
        (attributes.staff || []).join(','),
        attributes.categoryList ? '1' : '0',
    ].join('|')

    const blockProps = useBlockProps({
        className: 'wbk-gutenberg-booking-form',
    })

    return (
        <div {...blockProps}>
            <InspectorControls>
                {data?.services && (
                    <>
                        <PanelBody
                            title={__('Booking context', 'webba-booking-lite')}
                            initialOpen={true}
                        >
                            <SelectControl
                                label={__('Service', 'webba-booking-lite')}
                                value={attributes.service || ''}
                                options={serviceSelectOptions}
                                onChange={(value) =>
                                    applyPrunedSelection({ service: value || '' })
                                }
                            />
                            <BaseControl
                                label={__('Category', 'webba-booking-lite')}
                                help={__(
                                    'Filter services by one or more categories. Leave empty for all.',
                                    'webba-booking-lite'
                                )}
                            >
                                <div className="wbk-block-location-token-field">
                                    <FormTokenField
                                        value={categoryTokens}
                                        suggestions={categorySuggestions}
                                        onChange={(newTokens) => {
                                            const ids = labelsToIds(
                                                newTokens,
                                                categoryPairs
                                            )
                                            applyPrunedSelection({ category: ids })
                                        }}
                                        placeholder={__(
                                            'Type or select categories…',
                                            'webba-booking-lite'
                                        )}
                                        __experimentalExpandOnFocus
                                    />
                                </div>
                            </BaseControl>
                            {data.locations && data.locations.length > 0 && (
                                <BaseControl
                                    label={__('Location', 'webba-booking-lite')}
                                    help={__(
                                        'Leave empty to allow all locations that match other filters.',
                                        'webba-booking-lite'
                                    )}
                                >
                                    <div className="wbk-block-location-token-field">
                                        <FormTokenField
                                            value={locationTokens}
                                            suggestions={locationSuggestions}
                                            onChange={(newTokens) => {
                                                const ids = labelsToIds(
                                                    newTokens,
                                                    locationPairs
                                                )
                                                applyPrunedSelection({
                                                    location: ids,
                                                })
                                            }}
                                            placeholder={__(
                                                'Type or select locations…',
                                                'webba-booking-lite'
                                            )}
                                            __experimentalExpandOnFocus
                                        />
                                    </div>
                                </BaseControl>
                            )}
                            {(data.staff_members || []).length > 0 && (
                                <BaseControl
                                    label={__('Staff', 'webba-booking-lite')}
                                    help={__(
                                        'Leave empty for any staff that matches services and locations.',
                                        'webba-booking-lite'
                                    )}
                                >
                                    <div className="wbk-block-location-token-field">
                                        <FormTokenField
                                            value={staffTokens}
                                            suggestions={staffSuggestions}
                                            onChange={(newTokens) => {
                                                const ids = labelsToIds(
                                                    newTokens,
                                                    staffPairs
                                                )
                                                applyPrunedSelection({ staff: ids })
                                            }}
                                            placeholder={__(
                                                'Type or select staff…',
                                                'webba-booking-lite'
                                            )}
                                            __experimentalExpandOnFocus
                                        />
                                    </div>
                                </BaseControl>
                            )}
                            <ToggleControl
                                label={__(
                                    'Show category list in the form',
                                    'webba-booking-lite'
                                )}
                                checked={!!attributes.categoryList}
                                onChange={(checked) =>
                                    setAttributes({ categoryList: checked })
                                }
                            />
                        </PanelBody>
                        <PanelBody
                            title={__('General appearance', 'webba-booking-lite')}
                            initialOpen={false}
                        >
                            <PanelColorSettings
                                title={__('Colors', 'webba-booking-lite')}
                                colorSettings={[
                                    {
                                        value: attributes.bg_accent,
                                        onChange: (v) =>
                                            setAttributes({
                                                bg_accent: v || '#15B8A9',
                                            }),
                                        label: __(
                                            'Accent color',
                                            'webba-booking-lite'
                                        ),
                                    },
                                ]}
                            />
                            <SelectControl
                                label={__('Font', 'webba-booking-lite')}
                                value={attributes.font}
                                options={FONT_OPTIONS}
                                onChange={(font) => setAttributes({ font })}
                            />
                            <SelectControl
                                label={__(
                                    'Form border radius',
                                    'webba-booking-lite'
                                )}
                                value={attributes.border_radius}
                                options={BORDER_RADIUS_OPTIONS}
                                onChange={(border_radius) =>
                                    setAttributes({ border_radius })
                                }
                            />
                            <TextControl
                                label={__('Form shadow (CSS)', 'webba-booking-lite')}
                                value={attributes.shadow}
                                onChange={(shadow) => setAttributes({ shadow })}
                                help={__(
                                    'Example: 0px 0px 16px 0px rgba(0,0,0,0.1)',
                                    'webba-booking-lite'
                                )}
                            />
                        </PanelBody>
                        <PanelBody
                            title={__('Buttons and sidebar', 'webba-booking-lite')}
                            initialOpen={false}
                        >
                            <div
                                className={
                                    isAdvancedAppearanceLocked
                                        ? 'wbk-gutenberg-style-lock'
                                        : ''
                                }
                                onMouseDownCapture={(event) => {
                                    if (isAdvancedAppearanceLocked) {
                                        event.preventDefault()
                                        event.stopPropagation()
                                        setShowUpgradeModal(true)
                                    }
                                }}
                                onClickCapture={(event) => {
                                    if (isAdvancedAppearanceLocked) {
                                        event.preventDefault()
                                        event.stopPropagation()
                                    }
                                }}
                            >
                                <div className="wbk-gutenberg-locked-field">
                                    <SelectControl
                                        label={__(
                                            "Buttons' border radius",
                                            'webba-booking-lite'
                                        )}
                                        value={attributes.button_border_radius}
                                        options={BORDER_RADIUS_OPTIONS}
                                        onChange={(button_border_radius) =>
                                            setAttributes({
                                                button_border_radius,
                                            })
                                        }
                                    />
                                    {isAdvancedAppearanceLocked && (
                                        <span className="wbk-lock-badge">
                                            {__('LOCKED', 'webba-booking-lite')}
                                        </span>
                                    )}
                                </div>
                                {advancedColorSettings.map((setting) => (
                                    <div
                                        className="wbk-gutenberg-locked-field"
                                        key={setting.key}
                                    >
                                        <PanelColorSettings
                                            colorSettings={[setting]}
                                        />
                                        {isAdvancedAppearanceLocked && (
                                            <span className="wbk-lock-badge">
                                                {__(
                                                    'LOCKED',
                                                    'webba-booking-lite'
                                                )}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </PanelBody>
                    </>
                )}
            </InspectorControls>
            <div className="wbk-gutenberg-booking-form__preview">
                <div
                    className="wbk_elementor_booking_form_scope"
                    style={scopeStyle}
                >
                    <BookingFormProvider
                        key={previewKey}
                        disableCustomScroll={true}
                        attrService={
                            attributes.service && attributes.service !== '0'
                                ? attributes.service
                                : '0'
                        }
                        attrCategory={
                            (attributes.category || []).length > 0
                                ? (attributes.category || []).join(',')
                                : '0'
                        }
                        attrLocation={
                            (attributes.location || []).length > 0
                                ? (attributes.location || []).join(',')
                                : '0'
                        }
                        attrStaff={
                            (attributes.staff || []).length > 0
                                ? (attributes.staff || []).join(',')
                                : '0'
                        }
                    >
                        <BookingForm />
                    </BookingFormProvider>
                </div>
            </div>
            {showUpgradeModal && (
                <Modal
                    title={__('Upgrade Required', 'webba-booking-lite')}
                    onRequestClose={() => setShowUpgradeModal(false)}
                >
                    <p>
                        {__(
                            'Advanced Appearance Settings are available in PLUS and higher plans.',
                            'webba-booking-lite'
                        )}
                    </p>
                    <div className="wbk-gutenberg-style-lock__actions">
                        <Button
                            variant="primary"
                            href={upgradeUrl}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {__('Upgrade', 'webba-booking-lite')}
                        </Button>
                        <Button
                            variant="tertiary"
                            onClick={() => setShowUpgradeModal(false)}
                        >
                            {__('Close', 'webba-booking-lite')}
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    )
}
