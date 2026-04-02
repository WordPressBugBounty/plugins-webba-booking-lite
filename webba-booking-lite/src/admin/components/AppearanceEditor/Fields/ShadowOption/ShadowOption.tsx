import { useState, useRef, useEffect } from 'react'
import { Label } from '../../../Form/Fields/Label/Label'
import { useAppearanceOption } from '../../hooks/useAppearanceOption'
import { IApperanceOptionConfig } from '../../types'
import './ShadowOption.scss'
import ReactSlider from 'react-slider'
import Select from 'react-select'
import { __ } from '@wordpress/i18n'

// Default values for shadow
const defaultShadow = {
    color: '#3f3f4629',
    h: 0,
    v: 0,
    blur: 16,
    spread: 0,
    position: 'outline',
}

// Options for shadow position
const positionOptions = [
    { value: 'outline', label: 'Outline' },
    { value: 'inset', label: 'Inset' },
]

type ShadowValues = {
    color: string
    h: number
    v: number
    blur: number
    spread: number
    position: string
}

// Extract individual shadow values from string
function parseShadowValue(
    shadowStr: string,
    defaultValue?: string
): ShadowValues | null {
    // e.g. "0px 4px 16px 0px #1d2939" or "0px 4px 16px 0px #1d2939 inset"
    if (!shadowStr || !shadowStr.includes('px')) return null

    // If the shadow matches the defaultValue, treat it as no shadow
    if (defaultValue && shadowStr === defaultValue) return null

    const tokens = shadowStr.trim().split(/\s+/)
    const [h, v, blur, spread, color, positionMaybe] = tokens
    return {
        h: Number((h || '0').replace('px', '')),
        v: Number((v || '0').replace('px', '')),
        blur: Number((blur || '16').replace('px', '')),
        spread: Number((spread || '0').replace('px', '')),
        color: color || defaultShadow.color,
        position: positionMaybe === 'inset' ? 'inset' : 'outline',
    }
}

// Convert individual values to string
function stringifyShadowValue({
    h,
    v,
    blur,
    spread,
    color,
    position,
}: ShadowValues) {
    return `${h}px ${v}px ${blur}px ${spread}px ${color}${position === 'inset' ? ' inset' : ''}`
}

export const ShadowOption = ({ fieldConfig }: IApperanceOptionConfig) => {
    const {
        default: defaultValue,
        label,
        value,
        setValue,
        id,
    } = useAppearanceOption(fieldConfig)
    const [open, setOpen] = useState(false)
    const triggerRef = useRef<HTMLDivElement>(null)
    const popupRef = useRef<HTMLDivElement>(null)
    const [shadow, setShadow] = useState<ShadowValues | null>(() => {
        return parseShadowValue(String(value), defaultValue)
    })

    useEffect(() => {
        const parsed = parseShadowValue(String(value), defaultValue)
        setShadow(parsed)
    }, [value, defaultValue])

    // Close popup on clicks outside
    useEffect(() => {
        if (!open) return
        function onClick(e: MouseEvent) {
            if (
                popupRef.current &&
                !popupRef.current.contains(e.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(e.target as Node)
            ) {
                setOpen(false)
            }
        }
        window.addEventListener('mousedown', onClick)
        return () => window.removeEventListener('mousedown', onClick)
    }, [open])

    function updateShadow(partial: Partial<ShadowValues>) {
        const currentShadow = shadow || { ...defaultShadow }
        const updated = { ...currentShadow, ...partial }
        setShadow(updated)
        const shadowString = stringifyShadowValue(updated)
        setValue(shadowString)
    }

    function handleRemove() {
        setValue(defaultValue || '')
        setOpen(false)
    }

    // For color field preview (fallback)
    function formatColor(c: string) {
        if (/^#[0-9a-f]{6}$/i.test(c)) return c
        if (/^#[0-9a-f]{3}$/i.test(c)) return c
        return '#1d2939'
    }

    // Live shadow string for box preview
    const boxShadowStr = shadow
        ? shadow.position === 'inset'
            ? `${shadow.h}px ${shadow.v}px ${shadow.blur}px ${shadow.spread}px ${shadow.color} inset`
            : `${shadow.h}px ${shadow.v}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`
        : ''

    return (
        <div className={"wbk_shadowOption__wrapper"}>
            <Label title={label} id={id} />
            <div
                className={"wbk_shadowOption__inputPreview"}
                onClick={() => setOpen(true)}
                tabIndex={0}
                ref={triggerRef}
            >
                {shadow && (
                    <>
                        <span
                            className={"wbk_shadowOption__colorSwatch"}
                            style={{ background: formatColor(shadow.color) }}
                        />
                        <span className={"wbk_shadowOption__previewText"}>
                            {stringifyShadowValue(shadow)}
                        </span>
                    </>
                )}
                {!shadow && (
                    <span className={"wbk_shadowOption__previewText"}>
                        {__('No shadow applied', 'webba-booking-lite')}
                    </span>
                )}
            </div>
            {open && (
                <div className="wbk_shadowOption__popup" ref={popupRef}>
                    <div className={"wbk_shadowOption__popupHeader"}>
                        <div className={"wbk_shadowOption__popupTitle"}>
                            {__('Form Shadow', 'webba-booking-lite')}
                        </div>
                        <button
                            type="button"
                            className={"wbk_shadowOption__removeButton"}
                            onClick={handleRemove}
                        >
                            {__('Remove Shadow', 'webba-booking-lite')}
                        </button>
                    </div>
                    <div className={"wbk_shadowOption__colorRow"}>
                        <span className={"wbk_shadowOption__label"}>Color</span>
                        <input
                            type="color"
                            value={formatColor(
                                shadow?.color || defaultShadow.color
                            )}
                            onChange={(e) =>
                                updateShadow({ color: e.target.value })
                            }
                            className={"wbk_shadowOption__colorInput"}
                        />
                        <input
                            type="text"
                            value={shadow?.color || defaultShadow.color}
                            readOnly
                            className={"wbk_shadowOption__colorTextInput"}
                        />
                    </div>

                    {/* Horizontal Slider */}
                    <div className={"wbk_shadowOption__sliderRow"}>
                        <span className={"wbk_shadowOption__label"}>Horizontal</span>
                        <div className={"wbk_shadowOption__sliderContainer"}>
                            <ReactSlider
                                value={shadow?.h || defaultShadow.h}
                                onChange={(h) => updateShadow({ h })}
                                min={-50}
                                max={50}
                                className={"wbk_shadowOption__slider"}
                                thumbClassName={"wbk_shadowOption__thumb"}
                                trackClassName={"wbk_shadowOption__track"}
                            />
                        </div>
                        <input
                            type="number"
                            value={shadow?.h || defaultShadow.h}
                            onChange={(e) =>
                                updateShadow({ h: Number(e.target.value) })
                            }
                            className={"wbk_shadowOption__numberInput"}
                        />
                    </div>

                    {/* Vertical Slider */}
                    <div className={"wbk_shadowOption__sliderRow"}>
                        <span className={"wbk_shadowOption__label"}>Vertical</span>
                        <div className={"wbk_shadowOption__sliderContainer"}>
                            <ReactSlider
                                value={shadow?.v || defaultShadow.v}
                                onChange={(v) => updateShadow({ v })}
                                min={-50}
                                max={50}
                                className={"wbk_shadowOption__slider"}
                                thumbClassName={"wbk_shadowOption__thumb"}
                                trackClassName={"wbk_shadowOption__track"}
                            />
                        </div>
                        <input
                            type="number"
                            value={shadow?.v || defaultShadow.v}
                            onChange={(e) =>
                                updateShadow({ v: Number(e.target.value) })
                            }
                            className={"wbk_shadowOption__numberInput"}
                        />
                    </div>

                    {/* Blur Slider */}
                    <div className={"wbk_shadowOption__sliderRow"}>
                        <span className={"wbk_shadowOption__label"}>Blur</span>
                        <div className={"wbk_shadowOption__sliderContainer"}>
                            <ReactSlider
                                value={shadow?.blur || defaultShadow.blur}
                                onChange={(blur) => updateShadow({ blur })}
                                min={0}
                                max={100}
                                className={"wbk_shadowOption__slider"}
                                thumbClassName={"wbk_shadowOption__thumb"}
                                trackClassName={"wbk_shadowOption__track"}
                            />
                        </div>
                        <input
                            type="number"
                            value={shadow?.blur || defaultShadow.blur}
                            onChange={(e) =>
                                updateShadow({ blur: Number(e.target.value) })
                            }
                            className={"wbk_shadowOption__numberInput"}
                        />
                    </div>

                    {/* Spread Slider */}
                    <div className={"wbk_shadowOption__sliderRow"}>
                        <span className={"wbk_shadowOption__label"}>Spread</span>
                        <div className={"wbk_shadowOption__sliderContainer"}>
                            <ReactSlider
                                value={shadow?.spread || defaultShadow.spread}
                                onChange={(spread) => updateShadow({ spread })}
                                min={-50}
                                max={50}
                                className={"wbk_shadowOption__slider"}
                                thumbClassName={"wbk_shadowOption__thumb"}
                                trackClassName={"wbk_shadowOption__track"}
                            />
                        </div>
                        <input
                            type="number"
                            value={shadow?.spread || defaultShadow.spread}
                            onChange={(e) =>
                                updateShadow({ spread: Number(e.target.value) })
                            }
                            className={"wbk_shadowOption__numberInput"}
                        />
                    </div>

                    {/* Position Select */}
                    <div className={"wbk_shadowOption__selectRow"}>
                        <span className={"wbk_shadowOption__label"}>Position</span>
                        <div className={"wbk_shadowOption__selectContainer"}>
                            <Select
                                value={positionOptions.find(
                                    (opt) =>
                                        opt.value ===
                                        (shadow?.position ||
                                            defaultShadow.position)
                                )}
                                onChange={(option) =>
                                    option &&
                                    updateShadow({ position: option.value })
                                }
                                options={positionOptions}
                                isSearchable={false}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        minHeight: 32,
                                        fontSize: 13,
                                        border: '1px solid #d0d3db',
                                        borderRadius: 4,
                                        boxShadow: 'none',
                                        '&:hover': {
                                            borderColor: '#4094f7',
                                        },
                                    }),
                                    option: (base, state) => ({
                                        ...base,
                                        fontSize: 13,
                                        backgroundColor: state.isSelected
                                            ? '#4094f7'
                                            : state.isFocused
                                              ? '#f0f8ff'
                                              : 'white',
                                        color: state.isSelected
                                            ? 'white'
                                            : '#333',
                                    }),
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
