import { __ } from '@wordpress/i18n'
import { IConfirmationProps } from '../../types'
import styles from './ConfirmationButton.module.scss'
import { useState, useEffect, useRef } from 'react'
import { Button } from '../Button/Button'
import classNames from 'classnames'

export const ConfirmationButton = ({
    title,
    action,
    icon,
    confirmationMessage,
    classes,
    wrapperClass,
    buttonType,
    position,
    tooltip,
}: IConfirmationProps) => {
    const [visible, setVisible] = useState(false)
    const [isBusy, setIsBusy] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setVisible(false)
            }
        }

        if (visible) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [visible])

    const handleAction = async () => {
        setIsBusy(true)
        await action()
        setIsBusy(false)
    }

    return (
        <div
            ref={wrapperRef}
            className={classNames(styles.wrapper, wrapperClass, {
                [styles['active']]: visible,
            })}
            data-title={tooltip}
        >
            <Button
                onClick={() => setVisible(!visible)}
                className={classes}
                type={buttonType || 'secondary'}
                isLoading={isBusy}
            >
                {icon && <img src={icon} />}
                {title && title}
            </Button>
            <div
                onClick={handleAction}
                className={classNames(
                    styles.confirmation,
                    styles[(position as string) || 'bottom'],
                    {
                        [styles['opened']]: visible,
                    }
                )}
            >
                {confirmationMessage || __('Yes', 'webba-booking-lite')}
            </div>
        </div>
    )
}
