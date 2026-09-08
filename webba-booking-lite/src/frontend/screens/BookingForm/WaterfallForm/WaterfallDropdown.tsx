import {
    CSSProperties,
    ReactNode,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react'
import { createPortal } from 'react-dom'
import classNames from 'classnames'
import './WaterfallDropdown.scss'

export interface IWaterfallOption {
    id: string
    label: string
    description?: string
}

interface WaterfallDropdownProps {
    label: string
    placeholder: string
    options: IWaterfallOption[]
    value: string
    onChange: (id: string) => void
    ariaLabel?: string
    icon?: ReactNode
}

const MENU_MAX_HEIGHT = 280
const MENU_GAP = 4

const ChevronDownIcon = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
    </svg>
)

export const CategoryIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <path
            d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
            fill="currentColor"
        />
    </svg>
)

export const ServiceIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <path
            d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"
            fill="currentColor"
        />
    </svg>
)

export const UnitIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <path
            d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"
            fill="currentColor"
        />
    </svg>
)

export const StaffIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <path
            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            fill="currentColor"
        />
    </svg>
)

export const WaterfallDropdown = ({
    label,
    placeholder,
    options,
    value,
    onChange,
    ariaLabel,
    icon,
}: WaterfallDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [menuStyle, setMenuStyle] = useState<CSSProperties | null>(null)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLDivElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const selected = options.find((option) => option.id === value)

    const updateMenuPosition = useCallback(() => {
        if (!triggerRef.current) {
            return
        }

        const rect = triggerRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP
        const spaceAbove = rect.top - MENU_GAP
        const openUpward =
            spaceBelow < Math.min(MENU_MAX_HEIGHT, 120) &&
            spaceAbove > spaceBelow
        const maxHeight = Math.max(
            80,
            Math.min(
                MENU_MAX_HEIGHT,
                openUpward ? spaceAbove : spaceBelow
            )
        )

        setMenuStyle({
            position: 'fixed',
            left: rect.left,
            width: rect.width,
            top: openUpward ? undefined : rect.bottom + MENU_GAP,
            bottom: openUpward
                ? window.innerHeight - rect.top + MENU_GAP
                : undefined,
            maxHeight,
            zIndex: 100000,
        })
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node
            if (
                wrapperRef.current?.contains(target) ||
                menuRef.current?.contains(target)
            ) {
                return
            }
            setIsOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        if (!isOpen) {
            setMenuStyle(null)
            return
        }

        updateMenuPosition()
        window.addEventListener('resize', updateMenuPosition)
        // Capture scroll from nested containers (appearance preview, etc.)
        window.addEventListener('scroll', updateMenuPosition, true)

        return () => {
            window.removeEventListener('resize', updateMenuPosition)
            window.removeEventListener('scroll', updateMenuPosition, true)
        }
    }, [isOpen, updateMenuPosition])

    return (
        <div className="wbk_waterfall_dropdown" ref={wrapperRef}>
            <label className="wbk_waterfall_dropdown__label">{label}</label>
            <div
                ref={triggerRef}
                className={classNames('wbk_waterfall_dropdown__trigger', {
                    'wbk_waterfall_dropdown__trigger--open': isOpen,
                })}
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-label={ariaLabel || label}
            >
                {icon && (
                    <span className="wbk_waterfall_dropdown__trigger-icon">
                        {icon}
                    </span>
                )}
                <span className="wbk_waterfall_dropdown__trigger-content">
                    <span className="wbk_waterfall_dropdown__trigger-label">
                        {selected?.label ?? placeholder}
                    </span>
                </span>
                <span className="wbk_waterfall_dropdown__trigger-chevron">
                    <ChevronDownIcon />
                </span>
            </div>
            {isOpen &&
                menuStyle &&
                createPortal(
                    <div
                        ref={menuRef}
                        className="wbk_waterfall_dropdown__menu"
                        role="listbox"
                        aria-label={ariaLabel || label}
                        style={menuStyle}
                    >
                        {options.map((option) => (
                            <div
                                key={option.id}
                                role="option"
                                aria-selected={option.id === value}
                                className={classNames(
                                    'wbk_waterfall_dropdown__option',
                                    {
                                        'wbk_waterfall_dropdown__option--selected':
                                            option.id === value,
                                    }
                                )}
                                onClick={() => {
                                    onChange(option.id)
                                    setIsOpen(false)
                                }}
                            >
                                {icon && (
                                    <span className="wbk_waterfall_dropdown__option-icon">
                                        {icon}
                                    </span>
                                )}
                                <span className="wbk_waterfall_dropdown__option-content">
                                    <span className="wbk_waterfall_dropdown__option-label">
                                        {option.label}
                                    </span>
                                    {option.description && (
                                        <span className="wbk_waterfall_dropdown__option-description">
                                            {option.description}
                                        </span>
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>,
                    document.body
                )}
        </div>
    )
}
