import { useMemo } from 'react'
import { __ } from '@wordpress/i18n'
import { useSnapshot } from 'valtio'
import { StepFields } from '../StepFields/StepFields'
import { ServiceTypeSelector } from './ServiceTypeSelector'
import type { FormFromModel } from '../../../../components/Form/lib/types'
import type { Model } from '../../../../types'
import type { WizardStepId } from '../steps'
import {
    getFirstServiceFields,
    type WizardServiceType,
} from '../steps'
import './FirstServiceStep.scss'

interface FirstServiceStepProps {
    form: FormFromModel<Model>
    modelProperties: Record<string, any>
}

export const FirstServiceStep = ({ form, modelProperties }: FirstServiceStepProps) => {
    const serviceTypeSnapshot = useSnapshot(form.fields.service_type.value)
    const serviceType = ((serviceTypeSnapshot.value as WizardServiceType) ||
        'hourly') as WizardServiceType

    const fieldNames = useMemo(
        () => [...getFirstServiceFields(serviceType)],
        [serviceType]
    )

    const heading =
        serviceType === 'daily'
            ? __('Setup your first daily service', 'webba-booking-lite')
            : __('Setup your first service', 'webba-booking-lite')

    return (
        <div className="wbk_firstServiceStep__container">
            <h2 className="wbk_firstServiceStep__heading">{heading}</h2>
            <ServiceTypeSelector />
            <StepFields
                form={form}
                stepId={'firstService' as WizardStepId}
                modelProperties={modelProperties}
                fieldNames={fieldNames}
            />
        </div>
    )
}
