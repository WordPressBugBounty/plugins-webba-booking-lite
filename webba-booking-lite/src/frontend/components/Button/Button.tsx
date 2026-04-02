import { IButtonProps } from './types'
import './Button.scss'
import classNames from 'classnames'
import {
    PropsWithChildren,
    useCallback,
    useTransition,
    useRef,
    useLayoutEffect,
} from 'react'

interface IButtonSvgProps extends IButtonProps {
    svgIcon?: React.FunctionComponent<React.SVGAttributes<SVGElement>>
}

export const Button = ({
    title,
    children,
    type,
    icon,
    svgIcon,
    iconLocation = 'left',
    onClick,
    showLoading,
    disabled,
    classes,
    styles: customStyles = {},
    href,
    target,
    tooltip,
}: PropsWithChildren<IButtonSvgProps>) => {
    const [isLoading, startAction] = useTransition()
    const anchorRef = useRef<HTMLAnchorElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const mountedRef = useRef(false)

    // WordPress-safe DOM handling
    useLayoutEffect(() => {
        mountedRef.current = true

        // Prevent WordPress DOM interference
        const element = anchorRef.current || buttonRef.current
        if (element) {
            // Create a mutation observer to detect unwanted DOM changes
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    // If WordPress tries to modify our component, prevent it
                    if (mutation.type === 'childList' && mountedRef.current) {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                const el = node as Element
                                // Remove any WordPress-added lazy loading or optimization attributes
                                if (
                                    el.hasAttribute('loading') ||
                                    el.hasAttribute('data-lazy')
                                ) {
                                    try {
                                        el.remove()
                                    } catch (e) {
                                        // Ignore removal errors
                                    }
                                }
                            }
                        })
                    }
                })
            })

            observer.observe(element, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['src', 'loading', 'data-lazy', 'data-src'],
            })

            return () => {
                observer.disconnect()
                mountedRef.current = false
            }
        }

        return () => {
            mountedRef.current = false
        }
    }, [])

    const handleClick = useCallback(
        (e: any) => {
            if (disabled || showLoading || isLoading) {
                e.preventDefault()
                return
            }
            onClick && startAction(onClick)
        },
        [onClick, disabled, showLoading, isLoading]
    )

    // WordPress-safe icon component using inline SVG data URI
    const SafeIcon = useCallback(
        ({ src, alt }: { src: string; alt?: string }) => {
            if (!src || !mountedRef.current) return null

            // Convert image to inline style to avoid WordPress interference
            const iconStyle = {
                display: 'inline-block',
                width: '16px',
                height: '16px',
                backgroundImage: `url("${src}")`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                verticalAlign: 'middle',
                // Force high specificity to override WordPress styles
                background:
                    `url("${src}") no-repeat center/contain !important` as any,
            }

            return (
                <span
                    style={iconStyle}
                    aria-label={alt}
                    role="img"
                    // Prevent WordPress from detecting this as an image
                    data-not-image="true"
                    suppressHydrationWarning
                />
            )
        },
        []
    )

    // Render left icon
    const renderLeftIcon = () => {
        if (iconLocation === 'right') return null
        if (showLoading || isLoading) {
            return <div className={'wbk_button__loader'} />
        }

        if (svgIcon) {
            const SvgComponent = svgIcon
            return (
                <span
                    className="wbk_button__icon"
                    aria-label={title}
                    role="img"
                >
                    <SvgComponent />
                </span>
            )
        }

        return icon ? <SafeIcon src={icon} alt={title} /> : null
    }

    // Render right icon
    const renderRightIcon = () => {
        if (iconLocation !== 'right') return null
        if (showLoading || isLoading) {
            return <div className={'wbk_button__loader'} />
        }

        if (svgIcon) {
            const SvgComponent = svgIcon
            return (
                <span
                    className="wbk_button__icon"
                    aria-label={title}
                    role="img"
                >
                    <SvgComponent />
                </span>
            )
        }

        return icon ? <SafeIcon src={icon} alt={title} /> : null
    }

    const commonProps = {
        className: classNames(
            'wbk_button',
            classes,
            `wbk_button--${type ? type : 'primary'}`,
            {
                'wbk_button--loading': showLoading,
                'wbk_button--disabled': disabled || showLoading || isLoading,
            }
        ),
        style: customStyles,
        // Prevent WordPress from interfering
        suppressHydrationWarning: true,
        'data-wp-preserve': 'true',
    }

    if (href) {
        return (
            <a
                ref={anchorRef}
                href={href}
                target={target}
                rel={target === '_blank' ? 'noopener noreferrer' : undefined}
                {...commonProps}
                tabIndex={disabled ? -1 : undefined}
                aria-disabled={disabled || showLoading || isLoading}
                onClick={
                    disabled || showLoading || isLoading
                        ? (e) => e.preventDefault()
                        : onClick
                }
            >
                {renderLeftIcon()}
                <span suppressHydrationWarning>{title || children}</span>
                {renderRightIcon()}
                {tooltip && (
                    <span className={'wbk_button__tooltip'}>{tooltip}</span>
                )}
            </a>
        )
    }

    return (
        <button
            ref={buttonRef}
            {...(commonProps as any)}
            onClick={handleClick}
            type="button"
            disabled={disabled || showLoading}
        >
            {renderLeftIcon()}
            <span suppressHydrationWarning>{title || children}</span>
            {renderRightIcon()}
            {tooltip && (
                <span className={'wbk_button__tooltip'}>{tooltip}</span>
            )}
        </button>
    )
}
