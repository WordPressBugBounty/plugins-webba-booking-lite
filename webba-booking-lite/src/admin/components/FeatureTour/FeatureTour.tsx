import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelect } from '@wordpress/data'
import { store_name } from '../../../store/backend'
import { FeatureTourTooltip } from './FeatureTourTooltip'
import type { AnchorRect, FeatureTourPlacement, FeatureTourState } from './types'
import './FeatureTour.scss'

const SPOTLIGHT_PADDING = 6
const TOOLTIP_GAP = 14
const VIEWPORT_PADDING = 16
const ANCHOR_RETRY_MS = 250
const ANCHOR_MAX_RETRIES = 40

const useAnchorRect = (anchor: string | undefined, enabled: boolean) => {
    const [rect, setRect] = useState<AnchorRect | null>(null)
    const [anchorMissing, setAnchorMissing] = useState(false)
    const retryCountRef = useRef(0)

    useLayoutEffect(() => {
        if (!anchor || !enabled) {
            setRect(null)
            setAnchorMissing(false)
            retryCountRef.current = 0
            return
        }

        const updateRect = () => {
            const element = document.querySelector(anchor) as HTMLElement | null

            if (!element) {
                retryCountRef.current += 1

                if (retryCountRef.current >= ANCHOR_MAX_RETRIES) {
                    setAnchorMissing(true)
                }

                setRect(null)
                return
            }

            retryCountRef.current = 0
            setAnchorMissing(false)
            element.scrollIntoView({ block: 'nearest', behavior: 'smooth' })

            const bounds = element.getBoundingClientRect()
            setRect({
                top: bounds.top,
                left: bounds.left,
                width: bounds.width,
                height: bounds.height,
            })
        }

        updateRect()

        const retryTimer = window.setInterval(() => {
            if (retryCountRef.current > 0 && retryCountRef.current < ANCHOR_MAX_RETRIES) {
                updateRect()
            }
        }, ANCHOR_RETRY_MS)

        window.addEventListener('resize', updateRect)
        window.addEventListener('scroll', updateRect, true)

        return () => {
            window.clearInterval(retryTimer)
            window.removeEventListener('resize', updateRect)
            window.removeEventListener('scroll', updateRect, true)
        }
    }, [anchor, enabled])

    return { rect, anchorMissing }
}

const getTooltipPosition = (
    anchorRect: AnchorRect,
    placement: FeatureTourPlacement,
    tooltipWidth: number,
    tooltipHeight: number
): { top: number; left: number } => {
    if (placement === 'bottom') {
        const top = anchorRect.top + anchorRect.height + TOOLTIP_GAP
        const left = Math.min(
            Math.max(
                anchorRect.left + anchorRect.width / 2 - tooltipWidth / 2,
                VIEWPORT_PADDING
            ),
            window.innerWidth - tooltipWidth - VIEWPORT_PADDING
        )

        return { top, left }
    }

    const top = Math.min(
        Math.max(
            anchorRect.top + anchorRect.height / 2 - tooltipHeight / 2,
            VIEWPORT_PADDING
        ),
        window.innerHeight - tooltipHeight - VIEWPORT_PADDING
    )
    const left = anchorRect.left + anchorRect.width + TOOLTIP_GAP

    if (left + tooltipWidth > window.innerWidth - VIEWPORT_PADDING) {
        return {
            top,
            left: Math.max(
                anchorRect.left - tooltipWidth - TOOLTIP_GAP,
                VIEWPORT_PADDING
            ),
        }
    }

    return { top, left }
}

export const FeatureTour = () => {
    const tooltipRef = useRef<HTMLDivElement>(null)
    const [tooltipSize, setTooltipSize] = useState({ width: 340, height: 140 })
    const [isCompleting, setIsCompleting] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const [isTourHidden, setIsTourHidden] = useState(false)

    const { tour, isLoading } = useSelect(
        (select: any) => ({
            tour: select(store_name).getFeatureTour() as FeatureTourState | null,
            isLoading: select(store_name).isFeatureTourLoading(),
        }),
        []
    )

    const { fetchFeatureTour, completeFeatureTourStep, dismissFeatureTour } = useDispatch(
        store_name
    ) as {
        fetchFeatureTour: () => Promise<FeatureTourState>
        completeFeatureTourStep: (stepId: string) => Promise<void>
        dismissFeatureTour: () => Promise<void>
    }

    const activeStep = tour?.active_step || null
    const { rect: anchorRect, anchorMissing } = useAnchorRect(
        activeStep?.anchor,
        Boolean(activeStep) && isReady
    )

    useEffect(() => {
        fetchFeatureTour()
    }, [fetchFeatureTour])

    useEffect(() => {
        if (!activeStep) {
            setIsReady(false)
            return
        }

        const timer = window.setTimeout(() => {
            setIsReady(true)
        }, 400)

        return () => window.clearTimeout(timer)
    }, [activeStep?.id])

    useEffect(() => {
        if (!anchorMissing || !activeStep || isCompleting) {
            return
        }

        completeFeatureTourStep(activeStep.id)
    }, [activeStep, anchorMissing, completeFeatureTourStep, isCompleting])

    useLayoutEffect(() => {
        if (!tooltipRef.current) {
            return
        }

        const { width, height } = tooltipRef.current.getBoundingClientRect()
        setTooltipSize({ width, height })
    }, [activeStep?.id, activeStep?.message])

    const handleComplete = useCallback(async () => {
        if (!activeStep || isCompleting) {
            return
        }

        setIsCompleting(true)
        try {
            await completeFeatureTourStep(activeStep.id)
        } finally {
            setIsCompleting(false)
        }
    }, [activeStep, completeFeatureTourStep, isCompleting])

    const handleDismissAll = useCallback(async () => {
        if (isCompleting) {
            return
        }

        setIsCompleting(true)
        try {
            await dismissFeatureTour()
        } finally {
            setIsCompleting(false)
        }
    }, [dismissFeatureTour, isCompleting])

    const handleCloseForSession = useCallback(() => {
        if (isCompleting) {
            return
        }

        setIsTourHidden(true)
    }, [isCompleting])

    if (isLoading && !tour) {
        return null
    }

    if (isTourHidden || !tour || tour.is_complete || !activeStep || !anchorRect) {
        return null
    }

    const spotlightStyle = {
        top: anchorRect.top - SPOTLIGHT_PADDING,
        left: anchorRect.left - SPOTLIGHT_PADDING,
        width: anchorRect.width + SPOTLIGHT_PADDING * 2,
        height: anchorRect.height + SPOTLIGHT_PADDING * 2,
    }

    const tooltipPosition = getTooltipPosition(
        anchorRect,
        activeStep.placement,
        tooltipSize.width,
        tooltipSize.height
    )

    return createPortal(
        <>
            <div className="wbk_featureTour__blocker" aria-hidden="true" />
            <div className="wbk_featureTour__spotlight" style={spotlightStyle} />
            <FeatureTourTooltip
                ref={tooltipRef}
                message={activeStep.message}
                buttonText={activeStep.button_text}
                placement={activeStep.placement}
                style={{
                    top: tooltipPosition.top,
                    left: tooltipPosition.left,
                }}
                onClose={handleCloseForSession}
                onConfirm={handleComplete}
                onDismissAll={handleDismissAll}
                isCompleting={isCompleting}
            />
        </>,
        document.body
    )
}
