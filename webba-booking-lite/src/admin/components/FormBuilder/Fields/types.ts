import { ComponentType } from 'react'
import { InputProps } from '../../Input/Input'
import { UseGroupResult } from '../hooks/useGroup'

export interface BuilderFieldProps extends Partial<InputProps> {
    group: UseGroupResult
}

export type FieldComponent = ComponentType<BuilderFieldProps>
