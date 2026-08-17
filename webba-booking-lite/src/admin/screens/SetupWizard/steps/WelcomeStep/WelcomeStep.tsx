import { __ } from '@wordpress/i18n'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../../../store/backend'
import type { WelcomeStepProps } from '../../types'
import { trackWizardSkipLinkClick } from '../../wizardAnalytics'
import './WelcomeStep.scss'
import iconExternal from '../../../../../../public/images/icon-external.svg'

export const WelcomeStep = ({
    onLaunchManual,
    onLaunchAi,
    skipUrl,
}: WelcomeStepProps) => {
    const { plugin_url, assistance_available } = useSelect(
        (select: any) => select(store_name).getPreset(),
        []
    ) as {
        plugin_url?: string
        assistance_available?: boolean
    }
    const logoSrc = plugin_url ? `${plugin_url}/public/images/logo-main.svg` : ''
    const showAiSetup = assistance_available === true && typeof onLaunchAi === 'function'

    return (
        <div className="wbk_welcomeStep__wrapper">
            <div className="wbk_welcomeStep__content">
                {logoSrc && (
                    <img
                        src={logoSrc}
                        alt="Webba Booking"
                        className="wbk_welcomeStep__logo"
                    />
                )}
                <h1 className="wbk_welcomeStep__title">
                    {__('Welcome to Webba Booking!', 'webba-booking-lite')}
                </h1>
                <p className="wbk_welcomeStep__description">
                    {__(
                        'Use our Setup Wizard to be ready to take bookings in minutes.',
                        'webba-booking-lite'
                    )}
                </p>
                <div className="wbk_welcomeStep__actions">
                    {showAiSetup ? (
                        <>
                            <button
                                type="button"
                                className="wbk_welcomeStep__launchButton"
                                onClick={onLaunchAi}
                            >
                                {__('AI-assisted setup', 'webba-booking-lite')}
                            </button>
                            <button
                                type="button"
                                className="wbk_welcomeStep__manualButton"
                                onClick={onLaunchManual}
                            >
                                {__('Regular Setup Wizard', 'webba-booking-lite')}
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            className="wbk_welcomeStep__launchButton"
                            onClick={onLaunchManual}
                        >
                            {__('Launch wizard', 'webba-booking-lite')}
                        </button>
                    )}
                    <div className="wbk_welcomeStep__skipLinkWrapper">
                        <a
                            href={skipUrl}
                            onClick={() => {
                                trackWizardSkipLinkClick(
                                    'wbk_setupWizard__skipLink__WelcomeScreen'
                                )
                            }}
                            className='wbk_setupWizard__skipLink__WelcomeScreen'
                        >
                            {__(
                                "Skip wizard, I'll configure later",
                                'webba-booking-lite'
                            )}
                        </a>
                    </div>
                    <p className='wbk_welcomeStep__privacyPolicy'>
                        {__(
                            "By continuing, you agree to our ",
                            'webba-booking-lite'
                        )}
                        <a href='https://webba-booking.com/privacy-policy/' target='_blank'>
                            {__('privacy policy ', 'webba-booking-lite')}
                            <img src={iconExternal} alt='External link' />
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}
