import { useState, useCallback } from 'react'
import { __ } from '@wordpress/i18n'
import './SummaryStep.scss'

const HOW_TO_LINK = 'https://webba-booking.com/documentation/how-to-add-booking-form/'

interface SummaryStepProps {
    shortcode?: string
    dashboardUrl: string
    onClose: () => void
    pluginUrl?: string
}

export const SummaryStep = ({
    shortcode = '[webba_booking]',
    dashboardUrl,
    onClose,
    pluginUrl,
}: SummaryStepProps) => {
    const iconSrc = pluginUrl ? `${pluginUrl}/public/images/icon-check-nobg.svg` : ''
    const [copied, setCopied] = useState(false)
    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(shortcode).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }, [shortcode])

    return (
        <div className="wbk_summaryStep__container">
            <div className="wbk_summaryStep__top">
                <div className="wbk_summaryStep__iconWrapper">
                    {iconSrc && (
                        <img
                            src={iconSrc}
                            alt="success"
                            className="wbk_summaryStep__icon"
                        />
                    )}
                </div>
                <h1 className="wbk_summaryStep__title">
                    {__('Great!', 'webba-booking-lite')}
                </h1>
                <h2 className="wbk_summaryStep__title">
                    {__(
                        'Now add the booking form to your website',
                        'webba-booking-lite'
                    )}
                </h2>
                <p className="wbk_summaryStep__description">
                    {__(
                        'Your initial setup is configured and ready to go. Just embed the form below on your website.',
                        'webba-booking-lite'
                    )}
                </p>
            </div>
            <div className="wbk_summaryStep__panel">
                <h3 className="wbk_summaryStep__subheading">
                    {__('Embed your booking form', 'webba-booking-lite')}
                </h3>
                <div className="wbk_summaryStep__fieldBlock">
                    <div className="wbk_summaryStep__shortcodeInputWrap">
                        <input
                            type="text"
                            className="wbk_summaryStep__shortcodeInput"
                            value={shortcode}
                            readOnly
                        />
                        <button
                            type="button"
                            className="wbk_summaryStep__copyButton"
                            onClick={handleCopy}
                            title={copied ? __('Copied!', 'webba-booking-lite') : __('Copy', 'webba-booking-lite')}
                            aria-label={copied ? __('Copied!', 'webba-booking-lite') : __('Copy', 'webba-booking-lite')}
                        >
                            {copied && iconSrc ? (
                                <img src={iconSrc} alt="" className="wbk_summaryStep__copyIcon" />
                            ) : pluginUrl ? (
                                <img
                                    src={`${pluginUrl}/public/images/icon-clipboard.svg`}
                                    alt=""
                                    className="wbk_summaryStep__copyIcon"
                                />
                            ) : null}
                        </button>
                    </div>
                    <p className="wbk_summaryStep__fieldDescription">
                        {__(
                            'Paste this shortcode into any Page or Post where you want the form to appear.',
                            'webba-booking-lite'
                        )}
                    </p>
                    <p className="wbk_summaryStep__fieldDescription">
                        <a
                            href={HOW_TO_LINK}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="wbk_summaryStep__howToLink"
                        >
                            {__(
                                'How to add Webba Booking form',
                                'webba-booking-lite'
                            )}
                        </a>
                    </p>
                </div>
            </div>
            <a
                href={dashboardUrl}
                className="wbk_summaryStep__closeButton"
                onClick={(e) => {
                    e.preventDefault()
                    onClose()
                }}
            >
                {__('Close Setup Wizard', 'webba-booking-lite')}
            </a>
        </div>
    )
}
