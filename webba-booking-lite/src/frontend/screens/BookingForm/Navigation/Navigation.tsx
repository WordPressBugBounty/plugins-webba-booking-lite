import './Navigation.scss'
import { INavigationProps } from '../types'
// Accept nextStepError as a prop
interface INavigationWithErrorProps extends INavigationProps {
    nextStepError?: string | null
}
import { Button } from '../../../components/Button/Button'
import { ReactComponent as GoBackIcon } from '../../../../../public/images/icon-go-back.svg'
import { ReactComponent as GoNextIcon } from '../../../../../public/images/icon-go-next.svg'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../../store/frontend'
import { useWording } from '../../../hooks/useWording'

export const Navigation = ({
    goBack,
    goNext,
    canGoNext,
    totalSteps,
    currentIndex,
    nextStepError,
}: INavigationWithErrorProps) => {
    const loading = useSelect(
        (select: any) => select(store_name).getLoading().createBooking,
        []
    )
    const wording = useWording()
    return (
        <div className={'wbk_navigation__wrapper'}>
            {currentIndex !== 0 && (
                <Button onClick={goBack} type="generic" svgIcon={GoBackIcon}>
                    {wording?.back || 'Back'}
                </Button>
            )}
            <Button
                onClick={goNext}
                disabled={!canGoNext}
                classes={'wbk_navigation__button-next'}
                svgIcon={
                    GoNextIcon as React.FunctionComponent<
                        React.SVGAttributes<SVGElement>
                    >
                }
                iconLocation="right"
                showLoading={loading}
                tooltip={
                    !canGoNext && nextStepError ? nextStepError : undefined
                }
            >
                {currentIndex === totalSteps - 1
                    ? wording?.submit || 'Submit'
                    : wording?.continue || 'Continue'}
            </Button>
        </div>
    )
}
