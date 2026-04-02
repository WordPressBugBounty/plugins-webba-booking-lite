import { __ } from '@wordpress/i18n'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../../../store/backend'
import './WelcomeStep.scss'

interface WelcomeStepProps {
    onLaunch: () => void
    skipUrl: string
}

export const WelcomeStep = ({ onLaunch, skipUrl }: WelcomeStepProps) => {
    const { plugin_url } = useSelect(
        (select: any) => select(store_name).getPreset(),
        []
    ) as { plugin_url?: string }
    const logoSrc = plugin_url ? `${plugin_url}/public/images/logo-main.svg` : ''

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
                    <button
                        type="button"
                        className="wbk_welcomeStep__launchButton"
                        onClick={onLaunch}
                    >
                        {__('Launch wizard', 'webba-booking-lite')}
                    </button>
                    <div className="wbk_welcomeStep__skipLinkWrapper">
                        <a href={skipUrl}>
                            {__(
                                "Skip wizard, I'll configure later",
                                'webba-booking-lite'
                            )}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
