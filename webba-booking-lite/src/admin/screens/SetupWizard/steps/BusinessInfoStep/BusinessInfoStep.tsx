import { __ } from '@wordpress/i18n'
import { StepFields } from '../StepFields/StepFields'
import type { FormFromModel } from '../../../../components/Form/lib/types'
import type { Model } from '../../../../types'
import type { WizardStepId } from '../steps'
import './BusinessInfoStep.scss'

interface BusinessInfoStepProps {
    form: FormFromModel<Model>
    modelProperties: Record<string, any>
}

export const BusinessInfoStep = ({ form, modelProperties }: BusinessInfoStepProps) => {
    return (
        <div className="wbk_businessInfoStep__container">
            <h2 className="wbk_businessInfoStep__heading">
                {__('General information', 'webba-booking-lite')}
            </h2>
            <StepFields
                form={form}
                stepId={'businessInfo' as WizardStepId}
                modelProperties={modelProperties}
            />
        </div>
    )
}
