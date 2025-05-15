import { useMemo } from 'react'
import { useField } from '../../lib/hooks/useField'
import { FormComponentConstructor } from '../../lib/types'
import { Label } from '../Label/Label'
import styles from './MultiCheckbox.module.scss'

export const createMultiCheckbox: FormComponentConstructor<string> = ({
    field,
    fieldConfig,
}) => {
    return ({ label, misc }) => {
        const checkboxes = []
        const options: any = fieldConfig.misc?.options
        const { value, setValue, errors }: any = useField(field)
        const valueObj = useMemo(() => {
            try {
                return JSON.parse(value)
            } catch (e) {
                return value
            }
        }, [value])

        for (let key in options) {
            const field = (
                <div className={styles.itemWrapper}>
                    <input
                        type="checkbox"
                        name={key}
                        id={key}
                        checked={valueObj && valueObj.includes(key)}
                        onChange={(e) => {
                            if (e.target.checked) {
                                setValue(valueObj ? [...valueObj, key] : [key])
                            } else {
                                setValue(
                                    valueObj.filter(
                                        (item: string) => item !== key
                                    )
                                )
                            }
                        }}
                    />
                    <label htmlFor={key}>{options[key]}</label>
                </div>
            )

            checkboxes.push(field)
        }

        return (
            <div>
                <Label title={label} id={field.name} tooltip={misc?.tooltip} />
                <div className={styles.checkboxesWrapper}>{checkboxes}</div>
                {errors && <div className={styles.error}>{errors}</div>}
            </div>
        )
    }
}
