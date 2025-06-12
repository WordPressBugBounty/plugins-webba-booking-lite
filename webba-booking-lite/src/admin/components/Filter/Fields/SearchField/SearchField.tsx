import styles from './SearchField.module.scss'
import { ISearchFieldProps } from '../../types'

export const SearchField = ({ name, label, onChange }: ISearchFieldProps) => {
    return (
        <div className={styles.inputContainer}>
            <input
                id={name}
                className={styles.input}
                type="text"
                onChange={(e: any) => onChange(e.target.value)}
                placeholder={label}
            />
        </div>
    )
}
