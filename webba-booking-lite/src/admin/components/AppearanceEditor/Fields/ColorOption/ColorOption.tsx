import { useRef } from 'react'
import { Label } from '../../../Form/Fields/Label/Label'
import { IApperanceOptionConfig } from '../../types'
import { useAppearanceOption } from '../../hooks/useAppearanceOption'
import './ColorOption.scss'

export const ColorOption = ({ fieldConfig }: IApperanceOptionConfig) => {
    const { label, setValue, id } = useAppearanceOption(fieldConfig)
    const colorInputRef = useRef<HTMLInputElement>(null)

    const handleTextInputClick = () => {
        if (colorInputRef.current) {
            colorInputRef.current.click()
        }
    }

    return (
        <div className="wbk_colorOption__wrapper">
            <Label title={label} id={id} />
            <div className="wbk_colorOption__colorPicker">
                <input
                    ref={colorInputRef}
                    type="color"
                    value={String(fieldConfig.value)}
                    onChange={(e) => setValue(e.target.value)}
                    style={{ zIndex: 1 }}
                />
                <input
                    type="text"
                    value={String(fieldConfig.value)}
                    readOnly
                    onClick={handleTextInputClick}
                    style={{ cursor: 'pointer' }}
                    tabIndex={0}
                />
            </div>
        </div>
    )
}
