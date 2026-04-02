import { Label } from '../Form/Fields/Label/Label'
import './Toggle.scss'
import classNames from 'classnames'

interface ToggleProps {
    name?: string
    label?: string
    value: boolean
    onChange: (value: boolean) => void
    disabled?: boolean
    className?: string
    isColumn?: boolean
    tooltip?: string
    proBadge?: React.ReactNode
}

export const Toggle = ({
    name,
    label,
    value,
    onChange,
    disabled,
    className,
    isColumn,
    tooltip,
    proBadge,
}: ToggleProps) => {
    return (
        <div
            className={classNames('wbk_toggle', className, {
                'wbk_toggle--withLabel': Boolean(label),
                'wbk_toggle--column': isColumn,
            })}
        >
            <input
                type="checkbox"
                name={name}
                id={name}
                checked={value}
                className="wbk_toggle__checkbox"
                disabled={disabled}
            />
            {label && (
                <Label title={label} id={name || label} tooltip={tooltip} proBadge={proBadge} />
            )}
            <div
                className={classNames(
                    'wbk_toggle__track',
                    { 'wbk_toggle__track--on': value },
                    { 'wbk_toggle__track--disabled': disabled }
                )}
                onClick={() => {
                    if (!disabled) {
                        onChange(!value)
                    }
                }}
            >
                <div className="wbk_toggle__handle"></div>
            </div>
        </div>
    )
}
