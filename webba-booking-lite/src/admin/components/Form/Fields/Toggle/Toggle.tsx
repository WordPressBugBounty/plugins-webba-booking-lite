import { useEffect, useState } from '@wordpress/element'
import { Label } from '../Label/Label'
import styles from './Toggle.module.scss'
import classNames from 'classnames'

interface toggleProps<T> {
    name?: string
    label?: string
    initialValue: T
    valueOn?: T
    valueOff?: T
    onChange: (value: T) => void
    disabled?: boolean
}

export const Toggle = ({
    name,
    label,
    initialValue,
    valueOn,
    valueOff,
    onChange,
    disabled,
}: toggleProps<any>) => {
    const [checked, setChecked] = useState<boolean>(false)

    useEffect(() => {
        setChecked(initialValue === valueOn)
    }, [initialValue])

    return (
        <div
            className={classNames(styles.wrapper, {
                [styles.withLabel]: Boolean(label),
            })}
        >
            <input
                type="checkbox"
                name={name}
                id={name}
                checked={checked}
                className={styles.checkbox}
            />
            {label && <Label title={label} id={name as string} />}
            <div
                className={classNames(
                    styles.track,
                    { [styles.on]: checked },
                    { [styles.disabled]: disabled }
                )}
                onClick={() => {
                    setChecked(!checked)
                    onChange(checked ? valueOff : valueOn)
                }}
            >
                <div className={styles.handle}></div>
            </div>
        </div>
    )
}
