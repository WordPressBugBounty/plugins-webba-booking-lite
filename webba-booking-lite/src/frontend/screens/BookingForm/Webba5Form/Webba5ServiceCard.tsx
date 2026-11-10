import { KeyboardEvent, useState } from 'react'
import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import { getPlainTextFromHtml } from '../../../lib/utils'
import { IWebba5ServiceCardProps } from './types'

export const Webba5ServiceCard = ({
    label,
    meta,
    priceLabel,
    description,
    selected,
    onSelect,
    children,
}: IWebba5ServiceCardProps) => {
    const [descriptionOpen, setDescriptionOpen] = useState(false)
    const descriptionText = description ? getPlainTextFromHtml(description) : ''
    const hasDescription = descriptionText.length > 0
    const toggleDescription = () => setDescriptionOpen((open) => !open)
    const handleReadMoreKeyDown = (
        event: KeyboardEvent<HTMLSpanElement>
    ) => {
        if (event.key !== 'Enter' && event.key !== ' ') {
            return
        }
        event.preventDefault()
        toggleDescription()
    }

    return (
        <div
            className={classNames('wbk_webba5_form__card', {
                'wbk_webba5_form__card--selected': selected,
            })}
        >
            <button
                type="button"
                className={classNames('wbk_webba5_form__card-button', {
                    'wbk_webba5_form__card-button--has-description':
                        hasDescription,
                })}
                onClick={onSelect}
                aria-pressed={selected}
            >
                <span
                    className={classNames('wbk_webba5_form__radio', {
                        'wbk_webba5_form__radio--selected': selected,
                    })}
                    aria-hidden="true"
                />
                <span className="wbk_webba5_form__card-copy">
                    <span className="wbk_webba5_form__card-title">{label}</span>
                    {meta && (
                        <span className="wbk_webba5_form__card-meta">{meta}</span>
                    )}
                </span>
                {priceLabel && (
                    <span className="wbk_webba5_form__card-price">
                        {priceLabel}
                    </span>
                )}
            </button>
            {hasDescription && (
                <div className="wbk_webba5_form__description">
                    <span
                        role="button"
                        tabIndex={0}
                        className={classNames('wbk_webba5_form__read-more', {
                            'wbk_webba5_form__read-more--open': descriptionOpen,
                        })}
                        aria-expanded={descriptionOpen}
                        onClick={toggleDescription}
                        onKeyDown={handleReadMoreKeyDown}
                    >
                        <svg
                            className="wbk_webba5_form__read-more-icon"
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >
                            <path
                                d="M6 3.5 10.5 8 6 12.5"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <span>
                            {descriptionOpen
                                ? __('Read less', 'webba-booking-lite')
                                : __('Read more', 'webba-booking-lite')}
                        </span>
                    </span>
                    {descriptionOpen && (
                        <div
                            className="wbk_webba5_form__description-body"
                            dangerouslySetInnerHTML={{ __html: description || '' }}
                        />
                    )}
                </div>
            )}
            {selected && children}
        </div>
    )
}
