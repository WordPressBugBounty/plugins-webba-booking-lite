import { useState } from 'react'
import classNames from 'classnames'
import { AccordionProps } from './types'
import './Form.scss'
import accordionArrowIcon from '../../../../public/images/icon-accordion-arrow.svg'

export const Accordion = ({
    title,
    fields,
    defaultOpen = true,
}: AccordionProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className="wbk_form__accordion">
            <button
                type="button"
                className="wbk_form__accordionHeader"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="wbk_form__accordionTitle">{title}</span>
                <img
                    src={accordionArrowIcon}
                    alt=""
                    className={classNames('wbk_form__accordionIcon', {
                        'wbk_form__accordionIcon--open': isOpen,
                    })}
                />
            </button>
            <div
                className={classNames('wbk_form__accordionContent', {
                    'wbk_form__accordionContent--open': isOpen,
                })}
            >
                <div className="wbk_form__innerFieldsWrapper">
                    {fields.map((field) => (
                        <div key={field.name} className="wbk_form__fieldWrapper">
                            {field.element}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
