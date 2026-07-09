import { forwardRef, useCallback } from 'react'
import { __ } from '@wordpress/i18n'
import type { FeatureTourPlacement } from './types'
import closeIcon from '../../../../public/images/icon-close.svg'
import './FeatureTour.scss'

interface FeatureTourTooltipProps {
    message: string
    buttonText: string
    placement: FeatureTourPlacement
    style: React.CSSProperties
    onClose: () => void
    onConfirm: () => void
    onDismissAll: () => void
    isCompleting: boolean
}

export const FeatureTourTooltip = forwardRef<
    HTMLDivElement,
    FeatureTourTooltipProps
>(({
    message,
    buttonText,
    placement,
    style,
    onClose,
    onConfirm,
    onDismissAll,
    isCompleting,
}, ref) => {
    const handleClose = useCallback(() => {
        if (!isCompleting) {
            onClose()
        }
    }, [isCompleting, onClose])

    const handleConfirm = useCallback(() => {
        if (!isCompleting) {
            onConfirm()
        }
    }, [isCompleting, onConfirm])

    const handleDismissAll = useCallback(() => {
        if (!isCompleting) {
            onDismissAll()
        }
    }, [isCompleting, onDismissAll])

    return (
        <div
            ref={ref}
            className={`wbk_featureTour__tooltip wbk_featureTour__tooltip--${placement}`}
            style={style}
            role="dialog"
            aria-live="polite"
        >
            <span
                className={`wbk_featureTour__caret wbk_featureTour__caret--${placement}`}
                aria-hidden="true"
            />
            <button
                type="button"
                className="wbk_featureTour__closeButton"
                onClick={handleClose}
                aria-label={__('Close tour until page reload', 'webba-booking-lite')}
                disabled={isCompleting}
            >
                <img src={closeIcon} alt="" />
            </button>
            <p className="wbk_featureTour__message">{message}</p>
            <div className="wbk_featureTour__actions">
                <button
                    type="button"
                    className="wbk_featureTour__confirmButton"
                    onClick={handleConfirm}
                    disabled={isCompleting}
                >
                    {buttonText}
                </button>
                <button
                    type="button"
                    className="wbk_featureTour__skipButton"
                    onClick={handleDismissAll}
                    disabled={isCompleting}
                >
                    {__('I got this, close this guide', 'webba-booking-lite')}
                </button>
            </div>
        </div>
    )
})

FeatureTourTooltip.displayName = 'FeatureTourTooltip'
