import {
    PanelBody,
    SelectControl,
    TextControl,
    Button,
    Modal,
} from '@wordpress/components'
import {
    useBlockProps,
    InspectorControls,
    PanelColorSettings,
} from '@wordpress/block-editor'
import { useEffect, useMemo, useRef, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { useSelect } from '@wordpress/data'
import '../assets/frontend.scss'
import { BookingFormProvider } from '../frontend/providers/BookingFormProvider/BookingFormProvider.tsx'
import { PackagePurchaseForm } from '../frontend/screens/Packages/PackagePurchaseForm.tsx'
import { store_name } from '../store/frontend/index.ts'
import { buildScopeInlineStyleObject } from '../block/utils/buildScopeInlineStyle.js'
import {
    APPEARANCE_ATTRIBUTE_DEFAULTS,
    getEditorAppearanceDefaults,
    mergeSavedAppearance,
} from '../block/appearanceDefaults.js'

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

export default function Edit({ attributes, setAttributes, clientId }) {
    const data = useSelect((select) => select(store_name).getPreset(), [store_name])
    const wasJustInserted = useSelect(
        (select) => {
            const blockEditor = select('core/block-editor')
            if (
                !clientId ||
                !blockEditor ||
                typeof blockEditor.wasBlockJustInserted !== 'function'
            ) {
                return false
            }
            return !!blockEditor.wasBlockJustInserted(clientId)
        },
        [clientId]
    )
    const editorAppearanceDefaults = useMemo(
        () =>
            mergeSavedAppearance({
                ...getEditorAppearanceDefaults(),
                ...(data?.appearance_options || {}),
            }),
        [data?.appearance_options]
    )
    const appearanceSeeded = useRef(false)
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const scopeStyle = useMemo(
        () => buildScopeInlineStyleObject(attributes),
        [attributes]
    )
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
    const advancedColorSettings = ADVANCED_COLOR_FIELDS.map(
        ([attributeKey, fallbackValue, label]) => ({
            key: attributeKey,
            value: attributes[attributeKey],
            onChange: (value) =>
                setAttributes({
                    [attributeKey]:
                        value ||
                        editorAppearanceDefaults[attributeKey] ||
                        fallbackValue,
                }),
            label,
        })
    )

    useEffect(() => {
        if (appearanceSeeded.current || !wasJustInserted) {
            return
        }

        appearanceSeeded.current = true
        const next = {}
        Object.keys(APPEARANCE_ATTRIBUTE_DEFAULTS).forEach((key) => {
            const nextValue = editorAppearanceDefaults[key]
            if (!nextValue || nextValue === attributes[key]) {
                return
            }
            next[key] = nextValue
        })
        if (Object.keys(next).length > 0) {
            setAttributes(next)
        }
    }, [wasJustInserted, editorAppearanceDefaults, attributes, setAttributes])

    const blockProps = useBlockProps({
        className: 'wbk-gutenberg-package-form',
    })

    return (
        <div {...blockProps}>
            <InspectorControls>
                <PanelBody
                    title={__('General appearance', 'webba-booking-lite')}
                    initialOpen={true}
                >
                    <PanelColorSettings
                        title={__('Colors', 'webba-booking-lite')}
                        colorSettings={[
                            {
                                value: attributes.bg_accent,
                                onChange: (value) =>
                                    setAttributes({
                                        bg_accent:
                                            value ||
                                            editorAppearanceDefaults.bg_accent ||
                                            '#15B8A9',
                                    }),
                                label: __('Accent color', 'webba-booking-lite'),
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
                        label={__('Form border radius', 'webba-booking-lite')}
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
                                    setAttributes({ button_border_radius })
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
                                <PanelColorSettings colorSettings={[setting]} />
                                {isAdvancedAppearanceLocked && (
                                    <span className="wbk-lock-badge">
                                        {__('LOCKED', 'webba-booking-lite')}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </PanelBody>
            </InspectorControls>
            <div className="wbk-gutenberg-booking-form__preview">
                <div className="wbk_package_form_scope" style={scopeStyle}>
                    <BookingFormProvider
                        attrService={null}
                        attrCategory={null}
                        attrLocation={null}
                        disableCustomScroll={true}
                    >
                        <PackagePurchaseForm />
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
                            variant="secondary"
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
