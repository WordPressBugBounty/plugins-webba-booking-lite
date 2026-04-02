import { useRef, useEffect, useState, useContext } from '@wordpress/element'
import { createPortal } from 'react-dom'
import QuestionIcon from '../../../../../../public/images/question_big.png'
import './Label.scss'
import { __ } from '@wordpress/i18n'
import { FormContext } from '../../lib/FormProvider'

interface labelProps {
    title: string
    id: string
    tooltip?: string
    tooltipMode?: 'tooltip' | 'description'
    proBadge?: React.ReactNode
}

export const Label = ({ title, id, tooltip, tooltipMode: propTooltipMode, proBadge }: labelProps) => {
    const formContext = useContext(FormContext)
    const tooltipMode: 'tooltip' | 'description' = propTooltipMode || formContext?.tooltipMode || 'tooltip'
    const iconRef = useRef<HTMLImageElement | null>(null)
    const [position, setPosition] = useState({ top: 0, left: 0 })
    const [hovered, setHovered] = useState(false)

    useEffect(() => {
        if (iconRef.current && hovered && tooltipMode === 'tooltip') {
            const rect = iconRef.current.getBoundingClientRect()
            setPosition({
                top: rect.top + window.scrollY - rect.height,
                left: rect.left + window.scrollX - Math.floor(rect.width / 2),
            })
        }
    }, [hovered, tooltipMode])

    const isDescriptionMode = tooltipMode === 'description'

    return (
        <div
            className={`wbk_formLabel__labelWrapper ${
                isDescriptionMode && tooltip ? 'wbk_formLabel__labelWrapper--descriptionMode' : ''
            }`}
        >
            <label htmlFor={id} className="wbk_formLabel__label">
                {__(title, 'webba-booking-lite')}
            </label>
            {proBadge}
            {tooltip && !isDescriptionMode && (
                <img
                    ref={iconRef}
                    className="wbk_formLabel__tooltipIcon"
                    src={QuestionIcon}
                    alt="ToolTip"
                    onMouseOver={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                />
            )}
            {tooltip && isDescriptionMode && (
                <div
                    className="wbk_formLabel__description"
                    dangerouslySetInnerHTML={{
                        __html: __(tooltip, 'webba-booking-lite'),
                    }}
                />
            )}
            {tooltip &&
                !isDescriptionMode &&
                hovered &&
                createPortal(
                    <span
                        className="wbk_formLabel__tooltip"
                        style={{
                            top: `${position.top}px`,
                            left: `${position.left}px`,
                        }}
                        dangerouslySetInnerHTML={{
                            __html: __(tooltip, 'webba-booking-lite'),
                        }}
                    />,
                    document.body
                )}
        </div>
    )
}
