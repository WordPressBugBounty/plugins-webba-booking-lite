import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import { ReactComponent as AnyAvailableIcon } from '../../../../public/images/icon-any-available.svg'
import { ReactComponent as CheckIcon } from '../../../../public/images/icon-checkmark-staff.svg'
import { IStaffOption, IStaffSelectorProps } from './types'
import './StaffSelector.scss'
import { useWording } from '../../hooks/useWording'

export const STAFF_ANY_AVAILABLE = '0'

export const StaffSelector = ({
    staffOptions,
    selectedStaffId,
    onSelect,
    treatNullAsAnyAvailable = true,
}: IStaffSelectorProps) => {
    const isAnyAvailableSelected = (id: string | null) =>
        id === STAFF_ANY_AVAILABLE || (treatNullAsAnyAvailable && id === null)
    const wording = useWording()
    
    return (
        <div className="wbk_staff_selector">
            <div className="wbk_staff_selector__grid">
                <div
                    className={classNames('wbk_staff_selector__card', {
                        'wbk_staff_selector__card--selected':
                            isAnyAvailableSelected(selectedStaffId),
                    })}
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onSelect(STAFF_ANY_AVAILABLE)
                    }}
                >
                    <span className="wbk_staff_selector__card-icon wbk_staff_selector__card-icon--any">
                        <AnyAvailableIcon aria-hidden="true" />
                    </span>
                    <span className="wbk_staff_selector__card-content">
                        <span className="wbk_staff_selector__card-label">
                            {wording.any_available ?? __('Any Available', 'webba-booking-lite')}
                        </span>
                        <span className="wbk_staff_selector__card-description">
                            {wording.best_available_time ?? __('Best available time.', 'webba-booking-lite')}
                        </span>
                    </span>
                    {isAnyAvailableSelected(selectedStaffId) && (
                        <span className="wbk_staff_selector__card-check">
                            <CheckIcon aria-hidden="true" />
                        </span>
                    )}
                </div>
                {staffOptions.map((staff: IStaffOption) => {
                    const isSelected = selectedStaffId === staff.id
                    return (
                        <div
                            key={staff.id}
                            className={classNames('wbk_staff_selector__card', {
                                'wbk_staff_selector__card--selected': isSelected,
                            })}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                onSelect(staff.id)
                            }}
                        >
                            <span className="wbk_staff_selector__card-avatar">
                                {staff.photo ? (
                                    <img
                                        src={staff.photo}
                                        alt={staff.label}
                                        loading="lazy"
                                    />
                                ) : (
                                    <span className="wbk_staff_selector__card-avatar-placeholder">
                                        {staff.label
                                            .split(/\s+/)
                                            .map((w: string) => w[0])
                                            .join('')
                                            .slice(0, 2)
                                            .toUpperCase()}
                                    </span>
                                )}
                            </span>
                            <span className="wbk_staff_selector__card-content">
                                <span className="wbk_staff_selector__card-label">
                                    {staff.label}
                                </span>
                            </span>
                            {isSelected && (
                                <span className="wbk_staff_selector__card-check">
                                    <CheckIcon aria-hidden="true" />
                                </span>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
