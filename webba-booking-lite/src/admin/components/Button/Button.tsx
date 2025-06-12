import classNames from 'classnames'
import styles from './Button.module.scss'
import { useCallback, useState, useTransition } from '@wordpress/element'

interface ButtonProps {
    onClick?: () => void
    disabled?: boolean
    className?: string
    id?: string
    name?: string
    type?: 'primary' | 'secondary' | 'custom' | 'no-border'
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
                styles.button,
                styles[type || 'primary'],
                { [styles.disabled]: disabled },
                { [styles.loading]: maybeLoading || isLoading }
            )}
            disabled={disabled || maybeLoading || isLoading || false}
            name={name}
            id={id}
            form={form}
            data-title={tooltip}
        >
            {(maybeLoading || isLoading) && (
                <div className={styles.loader}></div>
            )}
            {children}
        </button>
    )
}
