import { __ } from '@wordpress/i18n'
import { getFieldComponentFromType } from '../../../../components/Form/utils/utils'
import { InputWrapper } from '../../../../components/Form/Fields/InputWrapper/InputWrapper'
import { STEP_FIELDS } from '../steps'
import type { WizardStepId } from '../steps'
import { FormFromModel } from '../../../../components/Form/lib/types'
import { Model } from '../../../../types'
import './StepFields.scss'

interface StepFieldsProps {
    form: FormFromModel<Model>
    stepId: WizardStepId
    modelProperties: Record<string, any>
}

export const StepFields = ({ form, stepId, modelProperties }: StepFieldsProps) => {
    const fieldNames = STEP_FIELDS[stepId] || []

    return (
        <div className="wbk_stepFields__fieldsWrapper">
            {fieldNames.map((fieldName) => {
                const formField = form.fields[fieldName]
                const fieldConfig = modelProperties[fieldName]
                if (!formField || !fieldConfig) return null
                if (fieldConfig.hidden) return null

                // Omit 'description' from misc prop before passing it inside fields
                const { misc, ...restFieldConfig } = fieldConfig
                const miscWithoutDescription = misc && typeof misc === 'object'
                    ? Object.fromEntries(Object.entries(misc).filter(([k]) => k !== 'description'))
                    : misc

                const Component = getFieldComponentFromType({
                    name: fieldName,
                    fieldConfig: { ...restFieldConfig, misc: miscWithoutDescription, input_type: fieldConfig.input_type },
                    field: formField,
                })
                const label = __(fieldConfig.title, 'webba-booking-lite')

                return (
                    <div key={fieldName} className="wbk_stepFields__fieldBlock">
                        <InputWrapper field={formField} fieldConfig={fieldConfig}>
                            <Component
                                name={fieldName}
                                label={label}
                                misc={miscWithoutDescription}
                            />
                        </InputWrapper>
                        {fieldConfig.misc?.description && (
                            <span className="wbk_stepFields__fieldDescription">
                                {__(String(fieldConfig.misc.description), 'webba-booking-lite')}
                            </span>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
