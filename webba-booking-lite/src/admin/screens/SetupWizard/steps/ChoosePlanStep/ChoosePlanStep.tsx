import { __ } from '@wordpress/i18n'
import './ChoosePlanStep.scss'

const PRICING_URL = 'https://webba-booking.com/pricing/'

interface ChoosePlanStepProps {
    onContinue?: () => void
}

export const ChoosePlanStep = ({ onContinue }: ChoosePlanStepProps) => {
    return (
        <div className="wbk_choosePlanStep__page">
            <div className="wbk_choosePlanStep__heading">
                <h2 className="wbk_choosePlanStep__title">
                    {__('Choose Your Plan', 'webba-booking-lite')}
                </h2>
                <p className="wbk_choosePlanStep__subtitle">
                    {__(
                        'Select the perfect plan to unlock premium features and grow your business',
                        'webba-booking-lite'
                    )}
                </p>
            </div>
            <div className="wbk_choosePlanStep__body">
                <div className="wbk_choosePlanStep__plan">
                    <div className="wbk_choosePlanStep__planTitle">
                        {__('Start', 'webba-booking-lite')}
                    </div>
                    <div className="wbk_choosePlanStep__planPrice">
                        <strong>$49</strong>
                        <span>{__('/year', 'webba-booking-lite')}</span>
                    </div>
                    <p className="wbk_choosePlanStep__planDescription">
                        {__(
                            'For individuals and solo service providers',
                            'webba-booking-lite'
                        )}
                    </p>
                    <ul className="wbk_choosePlanStep__planFeatures">
                        <li className="wbk_choosePlanStep__featurePros">
                            {__('Unlimited services', 'webba-booking-lite')}
                        </li>
                        <li className="wbk_choosePlanStep__featurePros">
                            {__('Email support', 'webba-booking-lite')}
                        </li>
                        <li className="wbk_choosePlanStep__featurePros">
                            {__('Core booking features', 'webba-booking-lite')}
                        </li>
                        <li className="wbk_choosePlanStep__featureCons">
                            {__('Online payments', 'webba-booking-lite')}
                        </li>
                        <li className="wbk_choosePlanStep__featureCons">
                            {__('SMS reminders', 'webba-booking-lite')}
                        </li>
                    </ul>
                    <a
                        href={PRICING_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="wbk_choosePlanStep__planButton"
                    >
                        {__('Choose Start', 'webba-booking-lite')}
                    </a>
                </div>
                <div className="wbk_choosePlanStep__plan wbk_choosePlanStep__planPopular">
                    <div className="wbk_choosePlanStep__ribbon">
                        {__('Most Popular', 'webba-booking-lite')}
                    </div>
                    <div className="wbk_choosePlanStep__planTitle">
                        {__('Standard', 'webba-booking-lite')}
                    </div>
                    <div className="wbk_choosePlanStep__planPrice">
                        <strong>$119</strong>
                        <span>{__('/year', 'webba-booking-lite')}</span>
                    </div>
                    <p className="wbk_choosePlanStep__planDescription">
                        {__(
                            'For growing businesses and agencies',
                            'webba-booking-lite'
                        )}
                    </p>
                    <ul className="wbk_choosePlanStep__planFeatures">
                        <li className="wbk_choosePlanStep__featurePros">
                            {__('Unlimited services', 'webba-booking-lite')}
                        </li>
                        <li className="wbk_choosePlanStep__featurePros">
                            {__('Priority support', 'webba-booking-lite')}
                        </li>
                        <li className="wbk_choosePlanStep__featurePros">
                            {__(
                                'Online payments (Stripe, PayPal)',
                                'webba-booking-lite'
                            )}
                        </li>
                        <li className="wbk_choosePlanStep__featurePros">
                            {__('SMS notifications', 'webba-booking-lite')}
                        </li>
                        <li className="wbk_choosePlanStep__featurePros">
                            {__(
                                'Google Calendar sync',
                                'webba-booking-lite'
                            )}
                        </li>
                        <li className="wbk_choosePlanStep__featurePros">
                            {__(
                                'Custom booking forms',
                                'webba-booking-lite'
                            )}
                        </li>
                        <li className="wbk_choosePlanStep__featurePros">
                            {__(
                                'And many more additional features',
                                'webba-booking-lite'
                            )}
                        </li>
                    </ul>
                    <a
                        href={PRICING_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="wbk_choosePlanStep__planButton"
                    >
                        {__('Choose Standard', 'webba-booking-lite')}
                    </a>
                </div>
                <div className="wbk_choosePlanStep__plan">
                    <div className="wbk_choosePlanStep__planTitle">
                        {__('Premium', 'webba-booking-lite')}
                    </div>
                    <div className="wbk_choosePlanStep__planPrice">
                        <strong>$149</strong>
                        <span>{__('/year', 'webba-booking-lite')}</span>
                    </div>
                    <p className="wbk_choosePlanStep__planDescription">
                        {__(
                            'For clinics, teams and enterprises',
                            'webba-booking-lite'
                        )}
                    </p>
                    <ul className="wbk_choosePlanStep__planFeatures">
                        <li className="wbk_choosePlanStep__featurePros">
                            {__(
                                'Everything in Standard',
                                'webba-booking-lite'
                            )}
                        </li>
                        <li className="wbk_choosePlanStep__featurePros">
                            {__('VIP support', 'webba-booking-lite')}
                        </li>
                        <li className="wbk_choosePlanStep__featurePros">
                            {__(
                                'Zoom integration',
                                'webba-booking-lite'
                            )}
                        </li>
                        <li className="wbk_choosePlanStep__featurePros">
                            {__(
                                'PDF generation & iCal',
                                'webba-booking-lite'
                            )}
                        </li>
                        <li className="wbk_choosePlanStep__featurePros">
                            {__(
                                'WooCommerce integration',
                                'webba-booking-lite'
                            )}
                        </li>
                        <li className="wbk_choosePlanStep__featurePros">
                            {__(
                                'Advanced customization',
                                'webba-booking-lite'
                            )}
                        </li>
                        <li className="wbk_choosePlanStep__featurePros">
                            {__(
                                'And many more additional features',
                                'webba-booking-lite'
                            )}
                        </li>
                    </ul>
                    <a
                        href={PRICING_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="wbk_choosePlanStep__planButton"
                    >
                        {__('Choose Premium', 'webba-booking-lite')}
                    </a>
                </div>
            </div>
            {onContinue && (
                <div className="wbk_choosePlanStep__skipPlanWrapper">
                    <button
                        type="button"
                        className="wbk_choosePlanStep__skipPlanButton"
                        onClick={onContinue}
                    >
                        {__(
                            'Continue with free version for now',
                            'webba-booking-lite'
                        )}
                    </button>
                </div>
            )}
        </div>
    )
}
