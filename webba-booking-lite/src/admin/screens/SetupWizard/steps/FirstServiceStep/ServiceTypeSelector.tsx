import { useCallback, useEffect, useMemo } from 'react'
import { __, sprintf } from '@wordpress/i18n'
import { useSelect } from '@wordpress/data'
import { useSnapshot } from 'valtio'
import { useForm } from '../../../../components/Form/lib/FormProvider'
import { store_name } from '../../../../../store/backend'
import { processUpgradeMessage } from '../../../../../utilities/planHelper'
import type { WizardServiceType } from '../steps'
import lockedIcon from '../../../../../../public/images/icon-lock.png'
import './ServiceTypeSelector.scss'

const DAILY_REQUIRED_PLANS = ['premium', 'pro', 'proextended'] as const

export const ServiceTypeSelector = () => {
    const { plan_map, admin_url, wording } = useSelect(
        (select: any) => select(store_name).getPreset(),
        []
    ) as {
        plan_map?: Record<string, boolean>
        admin_url?: string
        wording?: { plan_required_message?: string }
    }

    const form = useForm()
    const serviceTypeField = form.fields.service_type
    const { value } = useSnapshot(serviceTypeField.value)
    const currentType = (value as WizardServiceType) || 'hourly'

    const dailyAvailable = useMemo(() => {
        if (!plan_map || typeof plan_map !== 'object') return false
        return DAILY_REQUIRED_PLANS.some((plan) => plan_map[plan] === true)
    }, [plan_map])

    useEffect(() => {
        if (!dailyAvailable && currentType === 'daily') {
            serviceTypeField.setValue('hourly')
        }
    }, [dailyAvailable, currentType, serviceTypeField])

    const setType = useCallback(
        (type: WizardServiceType) => {
            if (type === 'daily' && !dailyAvailable) return
            serviceTypeField.setValue(type)
        },
        [dailyAvailable, serviceTypeField]
    )

    const requiredMessage =
        wording?.plan_required_message ||
        __('Available in #plan', 'webba-booking-lite')

    return (
        <div className="wbk_serviceTypeSelector">
            <p className="wbk_serviceTypeSelector__label">
                {__('What type of service do you want to add?', 'webba-booking-lite')}
            </p>
            <div className="wbk_serviceTypeSelector__options">
                <button
                    type="button"
                    className={`wbk_serviceTypeSelector__option ${
                        currentType === 'hourly'
                            ? 'wbk_serviceTypeSelector__option--active'
                            : ''
                    }`}
                    onClick={() => setType('hourly')}
                >
                    <span className="wbk_serviceTypeSelector__optionTitle">
                        {__('Hourly service / rental', 'webba-booking-lite')}
                    </span>
                    <span className="wbk_serviceTypeSelector__optionDescription">
                        {__(
                            'Appointments booked by time slot (e.g. consultations, classes).',
                            'webba-booking-lite'
                        )}
                    </span>
                </button>
                <button
                    type="button"
                    className={`wbk_serviceTypeSelector__option ${
                        currentType === 'daily'
                            ? 'wbk_serviceTypeSelector__option--active'
                            : ''
                    } ${!dailyAvailable ? 'wbk_serviceTypeSelector__option--locked' : ''}`}
                    onClick={() => setType('daily')}
                    disabled={!dailyAvailable}
                    aria-disabled={!dailyAvailable}
                >
                    <span className="wbk_serviceTypeSelector__optionHeader">
                        <span className="wbk_serviceTypeSelector__optionTitle">
                            {__('Daily service / rental', 'webba-booking-lite')}
                        </span>
                        {!dailyAvailable && (
                            <a
                                className="wbk_serviceTypeSelector__proBadge"
                                href={sprintf(
                                    '%sadmin.php?page=wbk-main-pricing',
                                    admin_url || ''
                                )}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <img
                                    className="wbk_serviceTypeSelector__proBadgeIcon"
                                    src={lockedIcon}
                                    alt={__('Locked', 'webba-booking-lite')}
                                />
                                {processUpgradeMessage(
                                    [...DAILY_REQUIRED_PLANS],
                                    plan_map || {},
                                    requiredMessage
                                )}
                            </a>
                        )}
                    </span>
                    <span className="wbk_serviceTypeSelector__optionDescription">
                        {__(
                            'Bookings by day or date range (e.g. rentals, accommodations).',
                            'webba-booking-lite'
                        )}
                    </span>
                </button>
            </div>
        </div>
    )
}
