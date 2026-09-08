import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import { useAppearance } from '../../../../providers/AppearanceProvider/AppearanceProvider'
import { formTypeOptions } from '../../sections'
import './FormTypePanel.scss'

export const FormTypePanel = () => {
    const { formType, setFormType } = useAppearance()

    return (
        <div className="wbk_formTypePanel">
            <div className="wbk_formTypePanel__label">
                {__('Form layout', 'webba-booking-lite')}
            </div>
            <div
                className="wbk_formTypePanel__options"
                role="radiogroup"
                aria-label={__('Form layout', 'webba-booking-lite')}
            >
                {formTypeOptions.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={formType === option.value}
                        className={classNames('wbk_formTypePanel__option', {
                            'wbk_formTypePanel__option--active':
                                formType === option.value,
                        })}
                        onClick={() => setFormType(option.value)}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    )
}
