import { useState } from 'react'
import { __ } from '@wordpress/i18n'
import type { BillingCycle, PlanDefinition } from './types'
import './ChoosePlanStep.scss'

const PRICING_URL = 'https://webba-booking.com/pricing/'

interface ChoosePlanStepProps {
    onContinue?: () => void
}

const STARTER_FEATURES = [
    __('Unlimited services & bookings', 'webba-booking-lite'),
    __('Customer self-service portal', 'webba-booking-lite'),
    __('Google Calendar sync', 'webba-booking-lite'),
    __('Group & chain bookings', 'webba-booking-lite'),
    __('Email notifications', 'webba-booking-lite'),
    __('Built-in translations', 'webba-booking-lite'),
    __('Elementor & Divi integration', 'webba-booking-lite'),
]

const PRO_FEATURES = [
    __('Accept online payments', 'webba-booking-lite'),
    __('WooCommerce integration', 'webba-booking-lite'),
    __('Recurring bookings', 'webba-booking-lite'),
    __('Multiple locations', 'webba-booking-lite'),
    __('Advanced booking rules', 'webba-booking-lite'),
    __('Custom booking forms', 'webba-booking-lite'),
    __('Booking analytics', 'webba-booking-lite'),
]

const PLANS: PlanDefinition[] = [
    {
        id: 'starter',
        title: __('Starter', 'webba-booking-lite'),
        subtitle: __('Get started, no cost', 'webba-booking-lite'),
        prices: {
            monthly: {
                amount: __('Free', 'webba-booking-lite'),
                period: '',
            },
            yearly: {
                amount: __('Free', 'webba-booking-lite'),
                period: '',
            },
            lifetime: {
                amount: __('Free', 'webba-booking-lite'),
                period: '',
            },
        },
        featureHeading: __('Core Booking Features:', 'webba-booking-lite'),
        features: STARTER_FEATURES,
        buttonLabel: __('Get started free', 'webba-booking-lite'),
        isFree: true,
    },
    {
        id: 'pro_1',
        title: __('PRO - 1 Site', 'webba-booking-lite'),
        subtitle: __('For a single site', 'webba-booking-lite'),
        prices: {
            monthly: {
                amount: '$29',
                period: __('/month', 'webba-booking-lite'),
            },
            yearly: {
                amount: '$119',
                period: __('/year', 'webba-booking-lite'),
            },
            lifetime: {
                amount: '$399',
                period: __('/one-time', 'webba-booking-lite'),
            },
        },
        featureHeading: __(
            'License for 1 site. Everything in Free, plus:',
            'webba-booking-lite'
        ),
        features: PRO_FEATURES,
        buttonLabel: __('Buy Now', 'webba-booking-lite'),
        isPopular: true,
    },
    {
        id: 'pro_3',
        title: __('PRO - 3 Sites', 'webba-booking-lite'),
        subtitle: __('For agencies & multi-site', 'webba-booking-lite'),
        prices: {
            monthly: {
                amount: '$49',
                period: __('/month', 'webba-booking-lite'),
            },
            yearly: {
                amount: '$199',
                period: __('/year', 'webba-booking-lite'),
            },
            lifetime: {
                amount: '$699',
                period: __('/one-time', 'webba-booking-lite'),
            },
        },
        featureHeading: __(
            'License for 3 sites. Everything in Free, plus:',
            'webba-booking-lite'
        ),
        features: PRO_FEATURES,
        buttonLabel: __('Buy Now', 'webba-booking-lite'),
    },
]

const BILLING_TABS: { id: BillingCycle; label: string; showSaveBadge?: boolean }[] =
    [
        {
            id: 'monthly',
            label: __('Monthly', 'webba-booking-lite'),
        },
        {
            id: 'yearly',
            label: __('Yearly', 'webba-booking-lite'),
            showSaveBadge: true,
        },
        {
            id: 'lifetime',
            label: __('Lifetime', 'webba-booking-lite'),
        },
    ]

export const ChoosePlanStep = ({ onContinue }: ChoosePlanStepProps) => {
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')

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

            <div
                className="wbk_choosePlanStep__billingTabs"
                role="tablist"
                aria-label={__('Billing cycle', 'webba-booking-lite')}
            >
                {BILLING_TABS.map((tab) => (
                    <div key={tab.id} className="wbk_choosePlanStep__billingTabWrap">
                        {tab.showSaveBadge && (
                            <span className="wbk_choosePlanStep__saveBadge">
                                {__('SAVE', 'webba-booking-lite')}
                            </span>
                        )}
                        <button
                            type="button"
                            role="tab"
                            aria-selected={billingCycle === tab.id}
                            className={`wbk_choosePlanStep__billingTab${
                                billingCycle === tab.id
                                    ? ' wbk_choosePlanStep__billingTab--active'
                                    : ''
                            }`}
                            onClick={() => setBillingCycle(tab.id)}
                        >
                            {tab.label}
                        </button>
                    </div>
                ))}
            </div>

            <div className="wbk_choosePlanStep__body">
                {PLANS.map((plan) => {
                    const price = plan.prices[billingCycle]

                    return (
                        <div
                            key={plan.id}
                            className={`wbk_choosePlanStep__plan${
                                plan.isPopular
                                    ? ' wbk_choosePlanStep__planPopular'
                                    : ''
                            }`}
                        >
                            {plan.isPopular && (
                                <div className="wbk_choosePlanStep__ribbon">
                                    {__('Most Popular', 'webba-booking-lite')}
                                </div>
                            )}
                            <div className="wbk_choosePlanStep__planTitle">
                                {plan.title}
                            </div>
                            <p className="wbk_choosePlanStep__planDescription">
                                {plan.subtitle}
                            </p>
                            <div className="wbk_choosePlanStep__planPrice">
                                <strong>{price.amount}</strong>
                                {price.period ? <span>{price.period}</span> : null}
                            </div>
                            {plan.isFree && onContinue ? (
                                <button
                                    type="button"
                                    className="wbk_choosePlanStep__planButton"
                                    onClick={() => onContinue()}
                                >
                                    {plan.buttonLabel}
                                </button>
                            ) : (
                                <a
                                    href={PRICING_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="wbk_choosePlanStep__planButton"
                                >
                                    {plan.buttonLabel}
                                </a>
                            )}
                            <p className="wbk_choosePlanStep__featureHeading">
                                {plan.featureHeading}
                            </p>
                            <ul className="wbk_choosePlanStep__planFeatures">
                                {plan.features.map((feature) => (
                                    <li
                                        key={feature}
                                        className="wbk_choosePlanStep__featurePros"
                                    >
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <a
                                href={PRICING_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="wbk_choosePlanStep__compareLink"
                            >
                                {__('Compare All Features', 'webba-booking-lite')}
                                <span
                                    className="wbk_choosePlanStep__compareArrow"
                                    aria-hidden="true"
                                >
                                    ↓
                                </span>
                            </a>
                        </div>
                    )
                })}
            </div>

            {onContinue && (
                <div className="wbk_choosePlanStep__skipPlanWrapper">
                    <button
                        type="button"
                        className="wbk_choosePlanStep__skipPlanButton"
                        onClick={() => onContinue?.()}
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
