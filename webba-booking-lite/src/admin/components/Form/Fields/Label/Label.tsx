import { useState } from '@wordpress/element'
import QuestionIcon from '../../../../../../public/images/question_big.png'
import styles from './Label.module.scss'
import { __ } from '@wordpress/i18n'

interface labelProps {
    title: string
    id: string
    tooltip?: string
}

export const Label = ({ title, id, tooltip }: labelProps) => {
    const [showTooltip, setShowTooltip] = useState(false)

    return (
        <div className={styles.labelWrapper}>
            <label htmlFor={id} className={styles.label}>
                {__(title, 'webba-booking-lite')}
            </label>
            {tooltip && (
                <img
                    className={styles.tooltipIcon}
                    src={QuestionIcon}
                    alt="ToolTip"
                    onClick={() => setShowTooltip(!showTooltip)}
                />
            )}
            {showTooltip && tooltip && (
                <span
                    className={styles.tooltip}
                    onClick={() => setShowTooltip(false)}
                    dangerouslySetInnerHTML={{
                        __html: __(tooltip, 'webba-booking-lite'),
                    }}
                ></span>
            )}
        </div>
    )
}
