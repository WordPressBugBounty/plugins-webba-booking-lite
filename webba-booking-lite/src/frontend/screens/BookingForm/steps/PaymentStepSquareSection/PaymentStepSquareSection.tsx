import { SquareCard } from '../../PaymentHandler/payments/Square/Square'
import type { RefObject } from 'react'

export const PaymentStepSquareSection = ({
    onLoadingChange,
    squareWrapperRef,
}: {
    onLoadingChange?: (loading: boolean) => void
    squareWrapperRef?: RefObject<HTMLDivElement>
}) => {
    return (
        <div className="wbk_step__stripe-wrapper" ref={squareWrapperRef}>
            <SquareCard onLoadingChange={onLoadingChange} />
        </div>
    )
}
