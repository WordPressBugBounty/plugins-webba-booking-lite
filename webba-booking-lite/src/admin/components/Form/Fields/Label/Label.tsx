import { useRef, useEffect, useState } from '@wordpress/element'
import { createPortal } from 'react-dom'
import QuestionIcon from '../../../../../../public/images/question_big.png'
import styles from './Label.module.scss'
import { __ } from '@wordpress/i18n'

interface labelProps {
    title: string
    id: string
    tooltip?: string
}

export const Label = ({ title, id, tooltip }: labelProps) => {
    const iconRef = useRef<HTMLImageElement | null>(null)
    const [position, setPosition] = useState({ top: 0, left: 0 })
    const [hovered, setHovered] = useState(false)

    useEffect(() => {
        if (iconRef.current && hovered) {
            const rect = iconRef.current.getBoundingClientRect()
            setPosition({
                top: rect.top + window.scrollY - rect.height,
                left: rect.left + window.scrollX - Math.floor(rect.width / 2),
            })
        }
    }, [hovered])

    return (
        <div className={styles.labelWrapper}>
            <label htmlFor={id} className={styles.label}>
                {__(title, 'webba-booking-lite')}
            </label>
            {tooltip && (
                <img
                    ref={iconRef}
                    className={styles.tooltipIcon}
                    src={QuestionIcon}
                    alt="ToolTip"
                    onMouseOver={() => setHovered(true)}
                    // onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                />
            )}
            {tooltip &&
                hovered &&
                createPortal(
                    <span
                        className={styles.tooltip}
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
