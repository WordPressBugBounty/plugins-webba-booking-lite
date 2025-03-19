import classNames from 'classnames'
import styles from './Button.module.scss'
import { useCallback, useTransition } from '@wordpress/element'

interface ButtonProps {
    onClick?: () => void
    disabled?: boolean
    className?: string
    id?: string
    name?: string
    type?: 'primary' | 'secondary' | 'no-border'
    actionType?: 'button' | 'submit' | 'reset'
    isLoading?: boolean
    form?: string
    children?: React.ReactNode
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
}: ButtonProps) => {
    const [maybeLoading, startAction] = useTransition()

    const handleClick = useCallback((e: any) => {
        onClick && startAction(onClick)
    }, [onClick, startAction])

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
        >
            {maybeLoading ||
                (isLoading && <div className={styles.loader}></div>)}
            {children}
        </button>
    )
}
