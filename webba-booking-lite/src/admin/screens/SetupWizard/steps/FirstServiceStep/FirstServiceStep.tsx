import { __ } from '@wordpress/i18n'
import { StepFields } from '../StepFields/StepFields'
import type { FormFromModel } from '../../../../components/Form/lib/types'
import type { Model } from '../../../../types'
import type { WizardStepId } from '../steps'
import './FirstServiceStep.scss'

interface FirstServiceStepProps {
    form: FormFromModel<Model>
    modelProperties: Record<string, any>
}

export const FirstServiceStep = ({ form, modelProperties }: FirstServiceStepProps) => {
    return (
        <div className="wbk_firstServiceStep__container">
            <h2 className="wbk_firstServiceStep__heading">
                {__('Setup your first service', 'webba-booking-lite')}
            </h2>
            <StepFields
                form={form}
                stepId={'firstService' as WizardStepId}
                modelProperties={modelProperties}
            />
        </div>
    )
}
