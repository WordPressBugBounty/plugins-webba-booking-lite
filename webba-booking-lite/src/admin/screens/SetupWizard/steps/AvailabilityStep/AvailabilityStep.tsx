import { __ } from '@wordpress/i18n'
import { StepFields } from '../StepFields/StepFields'
import type { FormFromModel } from '../../../../components/Form/lib/types'
import type { Model } from '../../../../types'
import type { WizardStepId } from '../steps'
import './AvailabilityStep.scss'

interface AvailabilityStepProps {
    form: FormFromModel<Model>
    modelProperties: Record<string, any>
}

export const AvailabilityStep = ({
    form,
    modelProperties,
}: AvailabilityStepProps) => {
    return (
        <div className="wbk_availabilityStep__container">
            <h2 className="wbk_availabilityStep__heading">
                {__('Global availability', 'webba-booking-lite')}
            </h2>
            <p className="wbk_availabilityStep__intro">
                {__(
                    'Set global working hours that will be used for all services. You can always override them and set specific working hours per service too.',
                    'webba-booking-lite'
                )}
            </p>
            <StepFields
                form={form}
                stepId={'availability' as WizardStepId}
                modelProperties={modelProperties}
            />
        </div>
    )
}
