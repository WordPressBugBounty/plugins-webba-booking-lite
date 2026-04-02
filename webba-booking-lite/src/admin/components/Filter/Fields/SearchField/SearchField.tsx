import './SearchField.scss'
import { ISearchFieldProps } from '../../types'

export const SearchField = ({ name, label, onChange }: ISearchFieldProps) => {
    return (
        <div className={"wbk_searchField__inputContainer"}>
            <input
                id={name}
                className={"wbk_searchField__input"}
                type="text"
                onChange={(e: any) => onChange(e.target.value)}
                placeholder={label}
            />
        </div>
    )
}
