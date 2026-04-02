import { Label } from '../../../Form/Fields/Label/Label'
import Select from 'react-select'
import { useAppearanceOption } from '../../hooks/useAppearanceOption'
import { IApperanceOptionConfig } from '../../types'
import './SelectOption.scss'
import { IOption } from '../../../Form/types'
import warningIcon from '../../../../../../public/images/warning.svg'

export const SelectOption = ({ fieldConfig }: IApperanceOptionConfig) => {
    const { id, value, setValue, label, options, warning } =
        useAppearanceOption(fieldConfig)

    return (
        <div className="wbk_selectOption__wrapper">
            <Label title={label} id={id} />
            <Select
                value={options.find(
                    (option: IOption) => option.value === value
                )}
                options={options}
                onChange={(selectedOptions) => {
                    setValue(selectedOptions.value)
                }}
                classNames={{
                    control: () => 'wbk_selectOption__selectInput',
                }}
                isSearchable={false}
            />
            {warning && (
                <div className="wbk_selectOption__warning">
                    <img src={warningIcon} />
                    <span>{warning}</span>
                </div>
            )}
        </div>
    )
}
