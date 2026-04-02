import QuestionIcon from '../../../../public/images/question_big.png'
import './Label.scss'
import { t } from '../translations'
import { PropsWithChildren, useState } from 'react'

interface LabelProps {
    for?: string
    tooltip?: string
}

export const Label = ({
    for: id,
    tooltip,
    children,
}: PropsWithChildren<LabelProps>) => {
    const [showTooltip, setShowTooltip] = useState(false)

    return (
        <div className="wbk_label">
            <label htmlFor={id} className="wbk_label__text">
                {children}
            </label>
            {tooltip && (
                <img
                    className="wbk_label__tooltipIcon"
                    src={QuestionIcon}
                    alt="ToolTip"
                    onClick={() => setShowTooltip(!showTooltip)}
                />
            )}
            {showTooltip && tooltip && (
                <span
                    className="wbk_label__tooltip"
                    onClick={() => setShowTooltip(false)}
                    dangerouslySetInnerHTML={{
                        __html: t(tooltip),
                    }}
                ></span>
            )}
        </div>
    )
}
