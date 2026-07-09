import { useMemo } from 'react'
import { __ } from '@wordpress/i18n'
import { useSnapshot } from 'valtio'
import { StepFields } from '../StepFields/StepFields'
import type { FormFromModel } from '../../../../components/Form/lib/types'
import type { Model } from '../../../../types'
import type { WizardStepId } from '../steps'
import {
    getAvailabilityFields,
    type WizardServiceType,
} from '../steps'
import './AvailabilityStep.scss'

interface AvailabilityStepProps {
    form: FormFromModel<Model>
    modelProperties: Record<string, any>
}

export const AvailabilityStep = ({
    form,
    modelProperties,
}: AvailabilityStepProps) => {
    const serviceTypeSnapshot = useSnapshot(form.fields.service_type.value)
    const serviceType = ((serviceTypeSnapshot.value as WizardServiceType) ||
        'hourly') as WizardServiceType

    const fieldNames = useMemo(
        () => [...getAvailabilityFields(serviceType)],
        [serviceType]
    )

    const isDaily = serviceType === 'daily'

    return (
        <div className="wbk_availabilityStep__container">
            <h2 className="wbk_availabilityStep__heading">
                {isDaily
                    ? __('Availability settings', 'webba-booking-lite')
                    : __('Global availability', 'webba-booking-lite')}
            </h2>
            <p className="wbk_availabilityStep__intro">
                {isDaily
                    ? __(
                          'Configure booking length limits and buffers for your daily service. You can adjust more options later in the Services page.',
                          'webba-booking-lite'
                      )
                    : __(
                          'Set global working hours that will be used for all services. You can always override them and set specific working hours per service too.',
                          'webba-booking-lite'
                      )}
            </p>
            <StepFields
                form={form}
                stepId={'availability' as WizardStepId}
                modelProperties={modelProperties}
                fieldNames={fieldNames}
            />
        </div>
    )
}
