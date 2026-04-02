import classNames from 'classnames'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import './Sidebar.scss'
import { useSidebar } from './SidebarContext'

export const Sidebar = () => {
    const { element, shown, view, width, height, position } = useSidebar()
    const sectionRef = useRef<HTMLElement | null>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const isAnimatingRef = useRef(false)

    useEffect(() => {
        if (shown) {
            document.body.style.overflow = 'hidden'
        }
        // Don't unset overflow immediately - wait for animation to complete
    }, [shown])

    useEffect(() => {
        if (!sectionRef.current || !containerRef.current) return

        if (shown) {
            document.body.classList.add('wbk_sidebar__scrollLock')
            // Ensure modal is reset to initial state before animation
            if (view === 'modal' && sectionRef.current) {
                isAnimatingRef.current = true
                // Clear any previous inline styles that might interfere
                sectionRef.current.style.transform = ''
                sectionRef.current.style.transformOrigin = ''
                sectionRef.current.style.opacity = ''
                sectionRef.current.style.visibility = ''
                // Clear container inline styles from previous close
                if (containerRef.current) {
                    containerRef.current.style.backgroundColor = ''
                    containerRef.current.style.opacity = ''
                    containerRef.current.style.transition = ''
                }
                sectionRef.current.classList.remove('wbk_sidebar__panel--closing')
                sectionRef.current.classList.remove('wbk_sidebar__panel--shown')
                // Ensure opacity is reset to 1 for initial state
                sectionRef.current.style.opacity = '1'
                // Force reflow to ensure initial state is applied
                void sectionRef.current.offsetHeight
                // Trigger backdrop fade-in
                requestAnimationFrame(() => {
                    containerRef.current?.classList.add('wbk_sidebar__container--shown')
                    // Small delay to ensure initial state is rendered before animation
                    requestAnimationFrame(() => {
                        // Clear inline opacity to let CSS handle it
                        if (sectionRef.current) {
                            sectionRef.current.style.opacity = ''
                            // Trigger sidebar/modal animation
                            sectionRef.current.classList.add('wbk_sidebar__panel--shown')
                        }
                    })
                })
            } else {
                // For sidebar, trigger backdrop fade-in
                requestAnimationFrame(() => {
                    containerRef.current?.classList.add('wbk_sidebar__container--shown')
                    // Trigger sidebar animation after backdrop starts
                    requestAnimationFrame(() => {
                        sectionRef.current?.classList.add('wbk_sidebar__panel--shown')
                    })
                })
            }
        } else {
            // For modal, keep container visible during closing animation
            if (view === 'modal') {
                // Add closing class to keep container visible and prevent transform changes
                containerRef.current?.classList.add('wbk_sidebar__panel--closing')
                if (sectionRef.current) {
                    sectionRef.current.classList.add('wbk_sidebar__panel--closing')
                    // Force reflow to ensure closing class is applied
                    void sectionRef.current.offsetHeight
                    // Then remove shown class to trigger closing animation (opacity only)
                    requestAnimationFrame(() => {
                        if (sectionRef.current) {
                            sectionRef.current.classList.remove('wbk_sidebar__panel--shown')
                        }
                    })
                }
                // Keep container visible during modal animation, then fade backdrop
                const animationDuration = 300
                const elementRemovalDelay = 350 // Match the delay in SidebarContext
                setTimeout(() => {
                    // Keep backdrop visible with inline style to prevent white flash
                    if (containerRef.current) {
                        containerRef.current.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
                        containerRef.current.style.opacity = '1'
                    }
                    // Remove closing class - backdrop will fade via inline style removal
                    containerRef.current?.classList.remove('wbk_sidebar__panel--closing')
                    containerRef.current?.classList.remove('wbk_sidebar__container--shown')
                    document.body.classList.remove('wbk_sidebar__scrollLock')
                    // Fade backdrop smoothly after a brief delay
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            if (containerRef.current) {
                                containerRef.current.style.transition = 'opacity 150ms ease'
                                containerRef.current.style.opacity = '0'
                                // Clear inline styles after fade completes
                                setTimeout(() => {
                                    if (containerRef.current) {
                                        containerRef.current.style.backgroundColor = ''
                                        containerRef.current.style.opacity = ''
                                        containerRef.current.style.transition = ''
                                    }
                                }, 150)
                            }
                        })
                    })
                    // Keep closing class on modal until element is removed from DOM
                    // This prevents the modal from reverting to initial state
                    setTimeout(() => {
                        if (sectionRef.current) {
                            // Keep opacity at 0 with inline style to prevent any flash
                            sectionRef.current.style.opacity = '0'
                            sectionRef.current.style.visibility = 'hidden'
                            sectionRef.current.classList.remove('wbk_sidebar__panel--closing')
                            // Don't clear inline styles - let them persist until element is removed
                        }
                        // Unset overflow after modal has completely disappeared
                        document.body.style.overflow = 'unset'
                        isAnimatingRef.current = false
                    }, elementRemovalDelay - animationDuration)
                }, animationDuration)
            } else {
                if (sectionRef.current) {
                    sectionRef.current.classList.remove('wbk_sidebar__panel--shown')
                }
                containerRef.current?.classList.remove('wbk_sidebar__container--shown')
                document.body.classList.remove('wbk_sidebar__scrollLock')
                document.body.style.overflow = 'unset'
            }
        }
    }, [shown, view])

    if (!element && !shown) {
        return null
    }

    return createPortal(
        <div
            id="sidebar"
            className={classNames('wbk_sidebar__container', {
                'wbk_sidebar__container--shown': shown,
            })}
            ref={containerRef}
        >
            <div
                className={classNames({
                    'wbk_sidebar__view--sidebar': view === 'sidebar',
                    'wbk_sidebar__view--modal': view === 'modal',
                    ...(width && { [`wbk_sidebar__width--${width}`]: true }),
                    ...(height && { [`wbk_sidebar__height--${height}`]: true }),
                    ...(position && { [`wbk_sidebar__position--${position}`]: true }),
                })}
                ref={sectionRef as any}
                onClick={(e) => e.stopPropagation()}
            >
                {view === 'modal' ? (
                    <div className="wbk_sidebar__modalContent">{element}</div>
                ) : (
                    element
                )}
            </div>
        </div>,
        document.getElementById('wpwrap')!
    )
}
