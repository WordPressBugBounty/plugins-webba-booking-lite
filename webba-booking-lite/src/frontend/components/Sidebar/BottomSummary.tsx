import React from 'react'
import { __, sprintf } from '@wordpress/i18n'
import { Button } from '../Button/Button'
import arrowIcon from '../../../../public/images/icon-arrow-right.svg'
import { useWording } from '../../hooks/useWording'

interface BottomSummaryProps {
    total: string
    onShowSummary: () => void
}

export const BottomSummary: React.FC<BottomSummaryProps> = ({
    total,
    onShowSummary,
}) => {
    const wording = useWording()
    return (
        <div className={'wbk_sidebar__bottom-summary__wrapper'}>
            <div className={'wbk_sidebar__bottom-summary__total-section'}>
                <span className={'wbk_sidebar__bottom-summary__label'}>
                    {sprintf(
                        '%s: %s',
                        wording.total || __('Total', 'webba-booking-lite'),
                        total
                    )}
                </span>
                <span className={'wbk_sidebar__bottom-summary__subline'}>
                    {wording.tax_included ||
                        __('Tax incl.', 'webba-booking-lite')}
                </span>
            </div>
            <Button
                onClick={onShowSummary}
                type="generic"
                icon={arrowIcon}
                iconLocation="right"
                classes={'wbk_sidebar__bottom-summary__show-summary-button'}
            >
                {wording.show_summary ||
                    __('Show summary', 'webba-booking-lite')}
            </Button>
        </div>
    )
}
