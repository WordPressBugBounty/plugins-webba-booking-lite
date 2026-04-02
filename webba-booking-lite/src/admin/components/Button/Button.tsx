import classNames from 'classnames'
import './Button.scss'
import { useCallback, useState, useTransition } from '@wordpress/element'

interface ButtonProps {
    onClick?: () => void
    disabled?: boolean
    className?: string
    id?: string
    name?: string
    type?: 'primary' | 'secondary' | 'secondary-green' | 'custom' | 'no-border'
    actionType?: 'button' | 'submit' | 'reset'
    isLoading?: boolean
    form?: string
    children?: React.ReactNode
    tooltip?: string
}

export const Button = ({
    name,
    onClick,
    disabled,
    className,
    type,
    actionType,
    id,
    form,
    isLoading,
    children,
    tooltip,
}: ButtonProps) => {
    const [maybeLoading, setMaybeLoading] = useState(false)

    const handleClick = useCallback(
        async (e: any) => {
            setMaybeLoading(true)
            onClick && (await onClick())
            setMaybeLoading(false)
        },
        [onClick]
    )

    return (
        <button
            onClick={handleClick}
            type={actionType || 'button'}
            className={classNames(
                className,
                'wbk_adminButton',
                `wbk_adminButton--${type || 'primary'}`,
                { 'wbk_adminButton--disabled': disabled },
                { 'wbk_adminButton--loading': maybeLoading || isLoading }
            )}
            disabled={disabled || maybeLoading || isLoading || false}
            name={name}
            id={id}
            form={form}
            data-title={tooltip}
        >
            {(maybeLoading || isLoading) && (
                <div className="wbk_adminButton__loader"></div>
            )}
            {children}
        </button>
    )
}
