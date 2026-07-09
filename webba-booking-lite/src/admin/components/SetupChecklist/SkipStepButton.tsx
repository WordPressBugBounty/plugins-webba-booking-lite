import { __ } from '@wordpress/i18n'
import './SkipStepButton.scss'

interface SkipStepButtonProps {
    onSkip: () => void
    disabled?: boolean
}

export const SkipStepButton = ({ onSkip, disabled }: SkipStepButtonProps) => {
    return (
        <button
            type="button"
            className="wbk_skipStepButton"
            onClick={onSkip}
            disabled={disabled}
        >
            {__('Skip', 'webba-booking-lite')}
        </button>
    )
}
