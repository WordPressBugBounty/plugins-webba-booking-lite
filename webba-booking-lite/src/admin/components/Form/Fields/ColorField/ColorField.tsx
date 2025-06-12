import { useField } from '../../lib/hooks/useField'
import { FormComponentConstructor } from '../../lib/types'
import { Label } from '../Label/Label'
import styles from './ColorField.module.scss'
import { useColorValue } from '../../lib/hooks/useColorValue'
import { IColorValueProps } from './types'

export const createColorField: FormComponentConstructor<any> = ({ field }) => {
    return ({ name, label, misc }) => {
        const { value, setValue, errors } = useField(field)
        const valueModified = useColorValue({ value, misc, setValue } as IColorValueProps)

        return (
            <div className={styles.wrapper}>
                <Label id={name} title={label} tooltip={misc?.tooltip} />
                <label className={styles.boxWrapper}>
                    <input
                        type="color"
                        value={valueModified || value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                    <span>{valueModified || value}</span>
                </label>
                {errors && <p className={styles.error}>{errors[0]}</p>}
            </div>
        )
    }
}
