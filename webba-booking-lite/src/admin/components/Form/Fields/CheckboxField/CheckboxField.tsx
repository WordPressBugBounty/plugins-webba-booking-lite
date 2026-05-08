import { useField } from '../../lib/hooks/useField'
import { FormComponentConstructor } from '../../lib/types'
import { Toggle } from '../../../Toggle/Toggle'
import { FieldDescription } from '../FieldDescription/FieldDescription'
import { Label } from '../Label/Label'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../../../store/backend'
import { useMemo, useEffect, useRef } from 'react'
import { __, sprintf } from '@wordpress/i18n'
import { processUpgradeMessage } from '../../../../../utilities/planHelper'
import lockedIcon from '../../../../../../public/images/icon-lock.png'
import '../InputWrapper/InputWrapper.scss'
import { useForm } from '../../lib/FormProvider'
import { Validators } from '../../utils/validation'

export const createCheckboxField: FormComponentConstructor<any> = ({
    field,
    fieldConfig,
}) => {
    return ({ name, label, misc }) => {
        const { value, setValue } = useField(field)
        const form = useForm()
        const valueToCompare = misc?.checkboxValue || 'yes'
        const { admin_url, plan_map, wording } = useSelect(
            // @ts-ignore
            (select) => select(store_name).getPreset(),
            []
        )

        const requiredPlan = misc?.required_plan as string
        const requiredMessage =
            wording?.plan_required_message ||
            __('Available in #plan', 'webba-booking-lite')

        const isPlanEligible = useMemo(() => {
            if (!requiredPlan) {
                return true
            }

            if (
                (misc as any)?.available_in_old_free &&
                plan_map?.old_free === true
            ) {
                return true
            }

            if (!plan_map || typeof plan_map !== 'object') {
                return false
            }

            if (!Object.keys(plan_map).includes(requiredPlan)) {
                return false
            }

            const planValue = plan_map[
                Object.keys(plan_map).find(
                    (plan: string) => plan === requiredPlan
                )
            ]

            return planValue === true
        }, [requiredPlan, plan_map, (misc as any)?.available_in_old_free])

        const lastEligibilityRef = useRef<boolean | null>(null)

        useEffect(() => {
            const rule = misc?.at_least_one_checked_rule
            if (!rule) {
                return
            }
            const thresholdFieldPrimitive =
                form.fields[rule.threshold_field]?.value
            const targetFieldPrimitives = rule.target_fields
                .map((fieldName) => form.fields[fieldName]?.value)
                .filter(Boolean)

            field.setValidators([
                Validators.atLeastOneCheckedWhenThreshold({
                    thresholdFieldPrimitive,
                    targetFieldPrimitives,
                    thresholdOperator: rule.threshold_operator || '>',
                    thresholdValue: rule.threshold_value,
                    checkedValue: rule.checked_value || valueToCompare,
                    message: rule.message,
                }),
            ])
        }, [form, field, misc, valueToCompare])

        useEffect(() => {
            if (lastEligibilityRef.current === isPlanEligible) {
                return
            }
            
            lastEligibilityRef.current = isPlanEligible
            
            if (!isPlanEligible && requiredPlan) {
                field.resetValidators()
            }
        }, [isPlanEligible, requiredPlan])

        const renderProBadge = () => (
            <a
                className="wbk_inputWrapper__proBadge"
                href={sprintf(
                    '%sadmin.php?page=wbk-main-pricing',
                    admin_url
                )}
            >
                <img
                    className="wbk_inputWrapper__badgeLocked"
                    src={lockedIcon}
                    alt={__('Locked Icon', 'webba-booking-lite')}
                />
                {processUpgradeMessage(
                    [requiredPlan],
                    plan_map,
                    requiredMessage
                )}
            </a>
        )

        return (
            <>
                {isPlanEligible ? (
                    <Toggle
                        name={name}
                        label={label}
                        onChange={(value) => {
                            if (value) {
                                setValue(valueToCompare)
                            } else {
                                setValue('')
                            }
                        }}
                        value={value === valueToCompare}
                        tooltip={misc?.tooltip}
                    />
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Label title={label} id={name} tooltip={misc?.tooltip} />
                        {renderProBadge()}
                    </div>
                )}
                {misc?.description && (
                    <FieldDescription description={misc.description} />
                )}
            </>
        )
    }
}
