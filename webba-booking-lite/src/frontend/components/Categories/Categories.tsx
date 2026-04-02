import './Categories.scss'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import iconNavPrev from '../../../../public/images/icon-navigation-prev.svg'
import iconNavNext from '../../../../public/images/icon-navigation-next.svg'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'

export const Categories = () => {
    const { categories, extractedAttrCats, formData, services } =
        useBookingContext()

    const serviceIdsInSelectedLocation = useMemo(() => {
        const allServices = services ?? []
        const locationId =
            formData?.location != null ? String(formData.location) : null
        if (!locationId) {
            return new Set(allServices.map((s: { id: number }) => String(s.id)))
        }
        const inLocation = allServices.filter((s) => {
            const locs = (s as { locations?: string[] }).locations
            if (!locs || !Array.isArray(locs) || locs.length === 0) return false
            return locs.some((lid: string) => String(lid) === locationId)
        })
        return new Set(inLocation.map((s: { id: number }) => String(s.id)))
    }, [services, formData?.location])

    const categoriesFilteredByLocation = useMemo(() => {
        return categories.filter((cat) =>
            cat.services.some((serviceId) =>
                serviceIdsInSelectedLocation.has(String(serviceId))
            )
        )
    }, [categories, serviceIdsInSelectedLocation])

    const containerRef = useRef<HTMLDivElement>(null)
    const [showNav, setShowNav] = useState(false)
    const [canScrollPrev, setCanScrollPrev] = useState(false)
    const [canScrollNext, setCanScrollNext] = useState(false)

    const checkScroll = useCallback(() => {
        const container = containerRef.current
        if (!container) return

        // Multiple measurement attempts to ensure accuracy
        const measurements = []
        for (let i = 0; i < 3; i++) {
            container.offsetHeight // Force reflow
            const { scrollLeft, scrollWidth, clientWidth } = container
            measurements.push({ scrollLeft, scrollWidth, clientWidth })
        }

        // Use the measurement with the largest scrollWidth (most accurate)
        const { scrollLeft, scrollWidth, clientWidth } = measurements.reduce(
            (max, current) =>
                current.scrollWidth > max.scrollWidth ? current : max
        )

        setShowNav(scrollWidth > clientWidth)
        setCanScrollPrev(scrollLeft > 0)
        setCanScrollNext(scrollLeft + clientWidth < scrollWidth)
    }, [])

    const checkScrollDelayed = useCallback(() => {
        // Multiple checks at different intervals
        const timeouts = [
            setTimeout(() => checkScroll(), 0),
            setTimeout(() => checkScroll(), 1),
            setTimeout(() => checkScroll(), 10),
            setTimeout(() => checkScroll(), 50),
            setTimeout(() => checkScroll(), 100),
            setTimeout(() => checkScroll(), 200),
        ]
        return () => timeouts.forEach((id) => clearTimeout(id))
    }, [checkScroll])

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        // Immediate check
        checkScroll()

        // Event listeners
        container.addEventListener('scroll', checkScroll)
        window.addEventListener('resize', checkScroll)

        // ResizeObserver for container changes
        const resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(checkScroll)
        })
        resizeObserver.observe(container)

        // MutationObserver for DOM changes
        const mutationObserver = new MutationObserver(() => {
            checkScrollDelayed()
        })
        mutationObserver.observe(container, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true,
        })

        // Load event in case images or fonts are still loading
        const handleLoad = () => checkScrollDelayed()
        window.addEventListener('load', handleLoad)

        return () => {
            container.removeEventListener('scroll', checkScroll)
            window.removeEventListener('resize', checkScroll)
            window.removeEventListener('load', handleLoad)
            resizeObserver.disconnect()
            mutationObserver.disconnect()
        }
    }, [checkScroll, checkScrollDelayed])

    useEffect(() => {
        if (categoriesFilteredByLocation.length > 0) {
            const cleanup = checkScrollDelayed()
            return cleanup
        }
    }, [categoriesFilteredByLocation, checkScrollDelayed])

    // Additional check after component mount with longer delay
    useEffect(() => {
        const longDelayCheck = setTimeout(() => {
            checkScroll()
        }, 500)

        return () => clearTimeout(longDelayCheck)
    }, [checkScroll])

    const scrollBy = 150

    const onPrev = useCallback(() => {
        if (containerRef.current) {
            containerRef.current.scrollBy({
                left: -scrollBy,
                behavior: 'smooth',
            })
        }
    }, [])

    const onNext = useCallback(() => {
        if (containerRef.current) {
            containerRef.current.scrollBy({
                left: scrollBy,
                behavior: 'smooth',
            })
        }
    }, [])

    return (
        <div className={'wbk_categories__wrapper'}>
            {showNav && canScrollPrev && (
                <div
                    className={classNames(
                        'wbk_categories__navigation-button',
                        'wbk_categories__navigation-button--prev',
                        {
                            'wbk_categories__navigation-button--disabled':
                                !canScrollPrev,
                        }
                    )}
                    onClick={canScrollPrev ? onPrev : undefined}
                >
                    <img
                        src={iconNavPrev}
                        alt={__('Back', 'webba-booking-lite')}
                    />
                </div>
            )}

            <div className={'wbk_categories__items'} ref={containerRef}>
                {categoriesFilteredByLocation
                    .filter(
                        ({ id }) =>
                            extractedAttrCats.includes(id) ||
                            extractedAttrCats.length === 0
                    )
                    .map((category) => (
                        <div
                            key={category.id}
                            className={classNames(
                                'wbk_categories__items__item',
                                {
                                    'wbk_categories__items__item--selected':
                                        category.selected,
                                }
                            )}
                            onClick={() => category.onSelect()}
                        >
                            {category.name}
                        </div>
                    ))}
            </div>

            {showNav && canScrollNext && (
                <div
                    className={classNames(
                        'wbk_categories__navigation-button',
                        'wbk_categories__navigation-button--next',
                        {
                            'wbk_categories__navigation-button--disabled':
                                !canScrollNext,
                        }
                    )}
                    onClick={canScrollNext ? onNext : undefined}
                >
                    <img
                        src={iconNavNext}
                        alt={__('Next', 'webba-booking-lite')}
                    />
                </div>
            )}
        </div>
    )
}
