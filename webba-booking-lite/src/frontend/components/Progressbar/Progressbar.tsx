import { IProgressbarProps } from './types'
import  './Progressbar.scss'
import { __, sprintf } from '@wordpress/i18n'
import classNames from 'classnames'

export const Progressbar = ({
    currentStepNumber,
    currentStepTitle,
    currentStepDescription,
    totalSteps,
}: IProgressbarProps) => {
    return (
        <div className={'wbk_progressbar__wrapper'}>
            <div className={'wbk_progressbar__indicator'}>
                <div className={'wbk_progressbar__progress-wrapper'}>
                    <div
                        className={'wbk_progressbar__progress-wrapper__progress'}
                        style={{
                            width: `${(currentStepNumber / totalSteps) * 100}%`,
                        }}
                    ></div>
                </div>
                {
                    <div className={'wbk_progressbar__steps-list'}>
                        {Array.from({ length: totalSteps }, (_, i) => (
                            <div
                                key={i}
                                className={classNames('wbk_progressbar__steps-list__step', {
                                    ['wbk_progressbar__steps-list__step--active']:
                                        i + 1 === currentStepNumber,
                                    ['wbk_progressbar__steps-list__step--done']: i + 1 < currentStepNumber,
                                })}
                            >
                                {i + 1}
                            </div>
                        ))}
                    </div>
                }
            </div>
            <div className={'wbk_progressbar__content'}>
                <h3 className={'wbk_progressbar__content__title'}>{currentStepTitle}</h3>
                <p className={'wbk_progressbar__content__description'}>{currentStepDescription}</p>
            </div>
        </div>
    )
}
